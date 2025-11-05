'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { updateProject, deleteProject } from '@/lib/actions'
import { getProjectByIdClient, getDocumentsByProjectClient, getDownPaymentsByProjectClient, getDepositsByProjectClient, upsertDownPaymentsClient, upsertDepositsClient, getPaymentDeltaClient, getBuyerForProjectClient, upsertProjectContactClient, updateProjectClient } from '@/lib/actions-client'
import { useRouter } from 'next/navigation'
import { Project, Document, Contact, supabase } from '@/lib/supabase'
import { calculateProjectProcessingTime, calculateTotalTransactionCosts, calculateTotalOperationalCosts, calculateTotalInvestment, calculateNetProfit, calculateNetROI } from '@/lib/analytics'
import Navigation from '@/components/Navigation'
import DocumentUpload from '@/components/DocumentUpload'
import DocumentList from '@/components/DocumentList'
import ProjectDetailTimeline from '@/components/ProjectDetailTimeline'
import StatusHistory from '@/components/StatusHistory'
import MilestoneList from '@/components/MilestoneList'
import MilestoneForm from '@/components/MilestoneForm'
import EditProjectModal from '@/components/EditProjectModal'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [downPayments, setDownPayments] = useState<{ idx: number; amount: number; due_date?: string; paid_at?: string; notes?: string }[]>([])
  const [deposits, setDeposits] = useState<{ idx: number; amount: number; due_date?: string; paid_at?: string; notes?: string }[]>([])
  const [deltaInfo, setDeltaInfo] = useState<{ downPaymentsSum: number; depositsSum: number; delta: number }>({ downPaymentsSum: 0, depositsSum: 0, delta: 0 })
  const [savingPayments, setSavingPayments] = useState(false)
  const [buyer, setBuyer] = useState<{ name: string; company?: string; email?: string; phone?: string } | null>(null)
  const [showBuyerModal, setShowBuyerModal] = useState(false)
  const [buyerOptions, setBuyerOptions] = useState<Contact[]>([])
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('')
  const [loadingBuyers, setLoadingBuyers] = useState(false)
  const [savingBuyer, setSavingBuyer] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'financials' | 'payments' | 'timeline' | 'history'>('financials')
  const [editingFinancials, setEditingFinancials] = useState(false)
  const [timelineTab, setTimelineTab] = useState<'timeline' | 'history'>('timeline')
  const [financialData, setFinancialData] = useState({
    legal_fees: 0,
    due_diligence_costs: 0,
    broker_commission: 0,
    exchange_fees: 0,
    monthly_listing_fee: 0,
    annual_compliance_costs: 0,
    annual_accounting_costs: 0,
    holding_period_months: 12
  })

  const loadProjectData = async () => {
    try {
      const [projectData, documentsData] = await Promise.all([
        getProjectByIdClient(projectId),
        getDocumentsByProjectClient(projectId)
      ])
      setProject(projectData)
      setDocuments(documentsData)
      if (projectData) {
        // Load financial data
        setFinancialData({
          legal_fees: projectData.legal_fees || 0,
          due_diligence_costs: projectData.due_diligence_costs || 0,
          broker_commission: projectData.broker_commission || 0,
          exchange_fees: projectData.exchange_fees || 0,
          monthly_listing_fee: projectData.monthly_listing_fee || 0,
          annual_compliance_costs: projectData.annual_compliance_costs || 0,
          annual_accounting_costs: projectData.annual_accounting_costs || 0,
          holding_period_months: projectData.holding_period_months || 12
        })

        const [downs, deps, d] = await Promise.all([
          getDownPaymentsByProjectClient(projectData.id),
          getDepositsByProjectClient(projectData.id),
          getPaymentDeltaClient(projectData.id)
        ])
        setDownPayments(
          downs
            .sort((a, b) => a.idx - b.idx)
            .map(r => ({ idx: r.idx, amount: Number(r.amount) || 0, due_date: r.due_date, paid_at: r.paid_at, notes: r.notes }))
        )
        setDeposits(
          deps
            .sort((a, b) => a.idx - b.idx)
            .map(r => ({ idx: r.idx, amount: Number(r.amount) || 0, due_date: r.due_date, paid_at: r.paid_at, notes: r.notes }))
        )
        setDeltaInfo(d)

        const buyerContact = await getBuyerForProjectClient(projectData.id)
        if (buyerContact) {
          setBuyer({
            name: buyerContact.name,
            company: (buyerContact as any).company,
            email: buyerContact.email,
            phone: buyerContact.phone
          })
        } else {
          setBuyer(null)
        }
      }
    } catch (error) {
      console.error('Error loading project data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (projectId) {
      loadProjectData()
    }
  }, [projectId])

  const handleUploadComplete = () => {
    loadProjectData()
    setShowUpload(false)
  }

  const handleEditSuccess = () => {
    loadProjectData()
    setShowEditModal(false)
  }

  const handleDownPaymentChange = (index: number, field: 'amount' | 'due_date', value: string) => {
    setDownPayments(prev => {
      const next = [...prev]
      const idx = index + 1
      const existing = next.find(r => r.idx === idx)
      const parsedAmount = field === 'amount' ? (parseFloat(value) || 0) : (existing?.amount || 0)
      if (existing) {
        existing.amount = parsedAmount
        if (field === 'due_date') existing.due_date = value
      } else {
        next.push({ idx, amount: parsedAmount, due_date: field === 'due_date' ? value : undefined })
      }
      return next.filter(r => r.amount !== 0 || r.due_date)
    })
  }

  const handleDepositChange = (index: number, field: 'amount' | 'due_date', value: string) => {
    setDeposits(prev => {
      const next = [...prev]
      const idx = index + 1
      const existing = next.find(r => r.idx === idx)
      const parsedAmount = field === 'amount' ? (parseFloat(value) || 0) : (existing?.amount || 0)
      if (existing) {
        existing.amount = parsedAmount
        if (field === 'due_date') existing.due_date = value
      } else {
        next.push({ idx, amount: parsedAmount, due_date: field === 'due_date' ? value : undefined })
      }
      return next.filter(r => r.amount !== 0 || r.due_date)
    })
  }

  const savePayments = async () => {
    if (!project) return
    setSavingPayments(true)
    try {
      const downs = downPayments
        .filter(r => r.idx >= 1 && r.idx <= 5)
        .map(r => ({ idx: r.idx, amount: Number(r.amount) || 0, due_date: r.due_date }))
      const deps = deposits
        .filter(r => r.idx >= 1 && r.idx <= 3)
        .map(r => ({ idx: r.idx, amount: Number(r.amount) || 0, due_date: r.due_date }))
      await Promise.all([
        upsertDownPaymentsClient(project.id, downs),
        upsertDepositsClient(project.id, deps)
      ])
      const d = await getPaymentDeltaClient(project.id)
      setDeltaInfo(d)
      alert('Zahlungsraten gespeichert')
    } catch (e) {
      console.error(e)
      alert('Fehler beim Speichern der Zahlungsraten')
    } finally {
      setSavingPayments(false)
    }
  }

  const saveFinancials = async () => {
    if (!project) return
    try {
      await updateProject(project.id, {
        ...project,
        ...financialData
      })
      await loadProjectData()
      setEditingFinancials(false)
      alert('Finanzdaten gespeichert')
    } catch (e) {
      console.error(e)
      alert('Fehler beim Speichern der Finanzdaten')
    }
  }

  const cancelEditFinancials = () => {
    if (project) {
      setFinancialData({
        legal_fees: project.legal_fees || 0,
        due_diligence_costs: project.due_diligence_costs || 0,
        broker_commission: project.broker_commission || 0,
        exchange_fees: project.exchange_fees || 0,
        monthly_listing_fee: project.monthly_listing_fee || 0,
        annual_compliance_costs: project.annual_compliance_costs || 0,
        annual_accounting_costs: project.annual_accounting_costs || 0,
        holding_period_months: project.holding_period_months || 12
      })
    }
    setEditingFinancials(false)
  }

  const openBuyerModal = async () => {
    setShowBuyerModal(true)
    setLoadingBuyers(true)
    try {
      const { data } = await supabase
        .from('contacts')
        .select('*')
        .eq('contact_type', 'buyer')
        .order('name', { ascending: true })
      setBuyerOptions((data as Contact[]) || [])
    } finally {
      setLoadingBuyers(false)
    }
  }

  const assignBuyer = async () => {
    if (!project || !selectedBuyerId) return
    setSavingBuyer(true)
    try {
      await upsertProjectContactClient(project.id, selectedBuyerId, 'buyer')
      await updateProjectClient(project.id, { has_buyer: true })
      const latest = await getBuyerForProjectClient(project.id)
      if (latest) {
        setBuyer({ name: latest.name, company: (latest as any).company, email: latest.email || undefined, phone: latest.phone || undefined })
      }
      setProject(prev => (prev ? { ...prev, has_buyer: true } : prev))
      setShowBuyerModal(false)
      setSelectedBuyerId('')
    } catch (e) {
      console.error('Error assigning buyer:', e)
      alert('Käufer konnte nicht zugewiesen werden')
    } finally {
      setSavingBuyer(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!project) return
    
    const confirmed = window.confirm(`Möchten Sie "${project.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)
    if (!confirmed) return

    try {
      await deleteProject(project.id)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Fehler beim Löschen des Projekts')
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      lead: 'bg-gray-100 text-gray-800',
      offer_submitted: 'bg-yellow-100 text-yellow-800',
      negotiation: 'bg-blue-100 text-blue-800',
      offer_accepted: 'bg-green-100 text-green-800',
      contract_finalized: 'bg-indigo-100 text-indigo-800',
      creditors_meeting: 'bg-amber-100 text-amber-800',
      closed: 'bg-purple-100 text-purple-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      lead: 'Lead',
      offer_submitted: 'Angebot abgegeben',
      negotiation: 'Verhandlung',
      offer_accepted: 'Angebot angenommen',
      contract_finalized: 'Kaufvertrag/Insolvenzplan fertiggestellt',
      creditors_meeting: 'Gläubigerversammlung durchgeführt',
      closed: 'Aktien ausgeliefert (abgeschlossen)'
    }
    return labels[status as keyof typeof labels] || status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
          <p className="text-ink-soft">Lade Projekt...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ink mb-4">Projekt nicht gefunden</h1>
          <Link href="/dashboard" className="ci-button">
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16 relative">
            {/* Left: Back Button + Project Info */}
            <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
              <Link href="/dashboard" className="p-1.5 md:p-2 text-ink-soft hover:text-ink transition-colors flex-shrink-0">
                <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="min-w-0 flex-1 hidden md:block">
                <h1 className="text-lg md:text-xl font-bold text-ink font-display truncate">{project.name}</h1>
                <p className="text-xs md:text-sm text-ink-soft font-medium truncate">{project.company_name}</p>
              </div>
            </div>

            {/* Center: Navigation */}
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
              <Navigation />
            </div>

            {/* Right: Action Buttons + User Menu */}
            <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-4 py-1.5 md:py-2.5 text-xs md:text-sm font-semibold text-blue border border-blue/30 md:border-2 rounded-lg md:rounded-xl hover:border-blue/50 hover:bg-blue/5 transition-all duration-200"
              >
                <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="hidden md:inline">Bearbeiten</span>
              </button>
              <button
                onClick={handleDeleteProject}
                className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-4 py-1.5 md:py-2.5 text-xs md:text-sm font-semibold text-red-600 border border-red-200 md:border-2 rounded-lg md:rounded-xl hover:border-red-300 hover:bg-red-50 transition-all duration-200"
              >
                <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden md:inline">Löschen</span>
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="ci-button px-3 md:px-6 py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold hover:shadow-xl transition-all duration-200"
              >
                <span className="hidden md:inline">+ Dokument</span>
                <span className="md:hidden">+</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-2 sm:px-4 lg:px-8 py-4 md:py-8">
        
        {/* Hero + Finanzen: 2-Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 md:gap-8 mb-6 md:mb-8">
          
          {/* LEFT COLUMN: Hero Section - 3/5 Width */}
          <div className="xl:col-span-3">
            {/* Premium Hero Container */}
            <div className="relative bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
              {/* Clean white background per CI (removed gradients) */}
              
              <div className="relative z-10 p-6 md:p-8 lg:p-10">
                {/* Header: Name + Status */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center space-x-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-ink/30"></div>
                      <span className="text-xs font-bold text-ink-soft uppercase tracking-wider">Börsenmantel-Projekt</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-ink font-display mb-2 leading-tight">
                      {project.name}
                    </h1>
                    <p className="text-base md:text-lg text-ink-soft font-semibold">
                      {project.company_name}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg border-2 ${getStatusColor(project.status)}`}>
                      <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                      <span>{getStatusLabel(project.status)}</span>
                    </span>
                  </div>
                </div>

                {/* Core Financial Metrics - Hero */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-6">
                  {/* Kaufpreis */}
                  <div className="group relative bg-white rounded-2xl p-5 md:p-6 border border-slate-200/60 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-ink/5 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1">Kaufpreis</p>
                          <p className="text-2xl md:text-3xl font-bold text-ink font-display truncate">
                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(project.purchase_price || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verkaufspreis */}
                  <div className="group relative bg-white rounded-2xl p-5 md:p-6 border border-slate-200/60 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-ink/5 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1">Verkaufspreis</p>
                          <p className="text-2xl md:text-3xl font-bold text-ink font-display truncate">
                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(project.selling_price || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Net ROI */}
                  <div className={`group relative rounded-2xl p-5 md:p-6 bg-white border shadow-sm hover:shadow-md transition-all duration-200 ${
                    calculateNetROI(project) >= 0 
                      ? 'border-emerald-300/60 hover:border-emerald-400/60' 
                      : 'border-red-300/60 hover:border-red-400/60'
                  }`}>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          calculateNetROI(project) >= 0 ? 'bg-emerald-50' : 'bg-rose-50'
                        }`}>
                          <svg className={`w-5 h-5 ${calculateNetROI(project) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                            calculateNetROI(project) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}>Net ROI</p>
                          <p className={`text-2xl md:text-3xl font-bold font-display truncate ${
                            calculateNetROI(project) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {calculateNetROI(project).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stakeholder Cards - Insolvenzverwalter & Käufer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                  {/* Insolvenzverwalter */}
                  <div className="group relative bg-white rounded-2xl p-5 md:p-6 border border-slate-200/60 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-ink/5 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-2">Insolvenzverwalter</p>
                    {project.insolvency_admin_name ? (
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-ink truncate">{project.insolvency_admin_name}</p>
                        {project.insolvency_admin_company && (
                          <p className="text-sm text-ink-soft truncate">{project.insolvency_admin_company}</p>
                        )}
                        <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-indigo-200/40">
                          {project.insolvency_admin_email && (
                            <a 
                              className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline truncate flex items-center gap-1" 
                              href={`mailto:${project.insolvency_admin_email}`}
                            >
                              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {project.insolvency_admin_email}
                            </a>
                          )}
                          {project.insolvency_admin_phone && (
                            <a 
                              className="text-xs text-ink hover:text-ink-soft truncate flex items-center gap-1" 
                              href={`tel:${project.insolvency_admin_phone}`}
                            >
                              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {project.insolvency_admin_phone}
                            </a>
                          )}
                        </div>
                      </div>
                        ) : (
                          <p className="text-sm text-ink-soft italic">Kein Insolvenzverwalter hinterlegt</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Potenzieller Käufer */}
                  <div className="group relative bg-white rounded-2xl p-5 md:p-6 border border-slate-200/60 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-ink/5 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Potenzieller Käufer</p>
                          <button
                            onClick={openBuyerModal}
                            className="px-2.5 py-1.5 text-xs font-semibold text-ink border border-ink/20 rounded-md hover:bg-ink/5 transition-colors"
                          >
                            {buyer ? 'Ändern' : 'Zuweisen'}
                          </button>
                        </div>
                    {buyer ? (
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-ink truncate">{buyer.name}</p>
                        {buyer.company && (
                          <p className="text-sm text-ink-soft truncate">{buyer.company}</p>
                        )}
                        <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-amber-200/40">
                          {buyer.email && (
                            <a 
                              className="text-xs text-amber-600 hover:text-amber-700 hover:underline truncate flex items-center gap-1" 
                              href={`mailto:${buyer.email}`}
                            >
                              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {buyer.email}
                            </a>
                          )}
                          {buyer.phone && (
                            <a 
                              className="text-xs text-ink hover:text-ink-soft truncate flex items-center gap-1" 
                              href={`tel:${buyer.phone}`}
                            >
                              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {buyer.phone}
                            </a>
                          )}
                        </div>
                      </div>
                        ) : (
                          <p className="text-sm text-ink-soft italic">Kein Käufer zugewiesen</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-ink/5">
              <div className="text-center">
                <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1">Gewinn</p>
                <p className={`text-lg font-bold font-mono ${calculateNetProfit(project) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(calculateNetProfit(project))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1">Wahrscheinlichkeit</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-full max-w-[60px] h-1.5 bg-ink/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue rounded-full transition-all duration-300"
                      style={{ width: `${project.probability}%` }}
                    ></div>
                  </div>
                  <p className="text-lg font-bold text-ink">{project.probability}%</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1">Bearbeitungszeit</p>
                <p className="text-lg font-bold text-ink">
                  {Math.round(calculateProjectProcessingTime(project))} Tage
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1">Dokumente</p>
                <p className="text-lg font-bold text-ink">{documents.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1">Käufer</p>
                <p className={`text-lg font-bold ${project.has_buyer ? 'text-green-600' : 'text-ink-soft'}`}>
                  {project.has_buyer ? '✓ Ja' : '— Nein'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1">Anzahlung</p>
                <p className={`text-lg font-bold ${project.has_down_payment ? 'text-green-600' : 'text-ink-soft'}`}>
                  {project.has_down_payment ? '✓ Ja' : '— Nein'}
                </p>
              </div>
            </div>

                {/* Additional Info - Kompakt */}
                {(project.next_steps || project.timeline) && (
                  <div className="mt-4 pt-4 border-t border-ink/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.next_steps && (
                    <div className="bg-blue/5 rounded-lg p-4 border border-blue/10">
                      <h4 className="text-xs font-bold text-blue uppercase tracking-wider mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Nächste Schritte
                      </h4>
                      <p className="text-sm text-ink-soft leading-relaxed">{project.next_steps}</p>
                    </div>
                  )}
                  {project.timeline && (
                    <div className="bg-gold/5 rounded-lg p-4 border border-gold/10">
                      <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Timeline
                      </h4>
                      <p className="text-sm text-ink-soft leading-relaxed">{project.timeline}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Finanzen & Zahlungsplan Tabs - 2/5 Width */}
          <div className="xl:col-span-2">
            <div className="card overflow-hidden h-full">
              <div className="flex border-b border-ink/10">
                <button
                  onClick={() => setActiveTab('financials')}
                  className={`flex-1 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-200 min-h-[48px] ${
                    activeTab === 'financials'
                      ? 'bg-white text-blue border-b-2 border-blue'
                      : 'bg-ink/5 text-ink-soft hover:bg-ink/10 hover:text-ink'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1 md:gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden sm:inline">Finanzen</span>
                    <span className="sm:hidden">€</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`flex-1 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-200 min-h-[48px] ${
                    activeTab === 'payments'
                      ? 'bg-white text-blue border-b-2 border-blue'
                      : 'bg-ink/5 text-ink-soft hover:bg-ink/10 hover:text-ink'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1 md:gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="hidden sm:inline">Zahlungsplan</span>
                    <span className="sm:hidden">Plan</span>
                  </span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Financials Tab */}
                {activeTab === 'financials' && (
                  <div className="space-y-6">
                    {/* Edit/Save Buttons */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-ink uppercase tracking-wide">Kostenübersicht</h3>
                      {!editingFinancials ? (
                        <button
                          onClick={() => setEditingFinancials(true)}
                          className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-blue border border-blue/30 rounded-lg hover:border-blue/50 hover:bg-blue/5 transition-all duration-200 min-h-[44px]"
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="hidden sm:inline">Bearbeiten</span>
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={cancelEditFinancials}
                            className="px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-ink-soft border border-ink/20 rounded-lg hover:bg-ink/5 transition-all duration-200 min-h-[44px]"
                          >
                            Abbrechen
                          </button>
                          <button
                            onClick={saveFinancials}
                            className="ci-button px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold min-h-[44px]"
                          >
                            Speichern
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Transaction Costs */}
                    <div className="pb-4 border-b border-ink/10">
                      <p className="text-xs font-semibold text-ink-soft mb-3 uppercase tracking-wider">Transaktionskosten</p>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-xs text-ink-soft min-w-[120px]">Rechtsanwalt</span>
                          {editingFinancials ? (
                            <input
                              type="number"
                              step="0.01"
                              className="flex-1 text-right rounded-md border border-ink/10 px-3 py-2 md:py-1.5 text-sm font-mono min-h-[44px]"
                              value={financialData.legal_fees || ''}
                              onChange={e => setFinancialData({ ...financialData, legal_fees: parseFloat(e.target.value) || 0 })}
                            />
                          ) : (
                            <span className="font-mono text-ink text-sm">
                              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(financialData.legal_fees || 0)}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-xs text-ink-soft min-w-[120px]">Due Diligence</span>
                          {editingFinancials ? (
                            <input
                              type="number"
                              step="0.01"
                              className="flex-1 text-right rounded-md border border-ink/10 px-3 py-2 md:py-1.5 text-sm font-mono min-h-[44px]"
                              value={financialData.due_diligence_costs || ''}
                              onChange={e => setFinancialData({ ...financialData, due_diligence_costs: parseFloat(e.target.value) || 0 })}
                            />
                          ) : (
                            <span className="font-mono text-ink text-sm">
                              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(financialData.due_diligence_costs || 0)}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-xs text-ink-soft min-w-[120px]">Makler (%)</span>
                          {editingFinancials ? (
                            <input
                              type="number"
                              step="0.01"
                              className="flex-1 text-right rounded-md border border-ink/10 px-3 py-2 md:py-1.5 text-sm font-mono min-h-[44px]"
                              value={financialData.broker_commission || ''}
                              onChange={e => setFinancialData({ ...financialData, broker_commission: parseFloat(e.target.value) || 0 })}
                            />
                          ) : (
                            <span className="font-mono text-ink text-sm">
                              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
                                (project.purchase_price || 0) * (financialData.broker_commission || 0) / 100
                              )}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-xs text-ink-soft min-w-[120px]">Börsen-Gebühr</span>
                          {editingFinancials ? (
                            <input
                              type="number"
                              step="0.01"
                              className="flex-1 text-right rounded-md border border-ink/10 px-3 py-2 md:py-1.5 text-sm font-mono min-h-[44px]"
                              value={financialData.exchange_fees || ''}
                              onChange={e => setFinancialData({ ...financialData, exchange_fees: parseFloat(e.target.value) || 0 })}
                            />
                          ) : (
                            <span className="font-mono text-ink text-sm">
                              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(financialData.exchange_fees || 0)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-ink/10">
                        <span className="text-xs font-bold text-ink">Total Transaktionen</span>
                        <span className="text-sm font-bold text-ink font-mono">
                          {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
                            (financialData.legal_fees || 0) + 
                            (financialData.due_diligence_costs || 0) + 
                            ((project.purchase_price || 0) * (financialData.broker_commission || 0) / 100) + 
                            (financialData.exchange_fees || 0)
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Operational Costs */}
                    <div className="pb-4 border-b border-ink/10">
                      <p className="text-xs font-semibold text-ink-soft mb-3 uppercase tracking-wider">
                        Betriebskosten
                      </p>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-xs text-ink-soft min-w-[120px]">Haltedauer (Monate)</span>
                          {editingFinancials ? (
                            <input
                              type="number"
                              step="1"
                              className="flex-1 text-right rounded-md border border-ink/10 px-3 py-2 md:py-1.5 text-sm font-mono min-h-[44px]"
                              value={financialData.holding_period_months || ''}
                              onChange={e => setFinancialData({ ...financialData, holding_period_months: parseInt(e.target.value) || 12 })}
                            />
                          ) : (
                            <span className="font-mono text-ink text-sm">{financialData.holding_period_months || 12}</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-xs text-ink-soft min-w-[120px]">Listing (monatlich)</span>
                          {editingFinancials ? (
                            <input
                              type="number"
                              step="0.01"
                              className="flex-1 text-right rounded-md border border-ink/10 px-3 py-2 md:py-1.5 text-sm font-mono min-h-[44px]"
                              value={financialData.monthly_listing_fee || ''}
                              onChange={e => setFinancialData({ ...financialData, monthly_listing_fee: parseFloat(e.target.value) || 0 })}
                            />
                          ) : (
                            <span className="font-mono text-ink text-sm">
                              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
                                (financialData.monthly_listing_fee || 0) * (financialData.holding_period_months || 12)
                              )}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-xs text-ink-soft min-w-[120px]">Compliance (jährlich)</span>
                          {editingFinancials ? (
                            <input
                              type="number"
                              step="0.01"
                              className="flex-1 text-right rounded-md border border-ink/10 px-3 py-2 md:py-1.5 text-sm font-mono min-h-[44px]"
                              value={financialData.annual_compliance_costs || ''}
                              onChange={e => setFinancialData({ ...financialData, annual_compliance_costs: parseFloat(e.target.value) || 0 })}
                            />
                          ) : (
                            <span className="font-mono text-ink text-sm">
                              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
                                ((financialData.annual_compliance_costs || 0) / 12) * (financialData.holding_period_months || 12)
                              )}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-xs text-ink-soft min-w-[120px]">Steuerberatung (jährlich)</span>
                          {editingFinancials ? (
                            <input
                              type="number"
                              step="0.01"
                              className="flex-1 text-right rounded-md border border-ink/10 px-3 py-2 md:py-1.5 text-sm font-mono min-h-[44px]"
                              value={financialData.annual_accounting_costs || ''}
                              onChange={e => setFinancialData({ ...financialData, annual_accounting_costs: parseFloat(e.target.value) || 0 })}
                            />
                          ) : (
                            <span className="font-mono text-ink text-sm">
                              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
                                ((financialData.annual_accounting_costs || 0) / 12) * (financialData.holding_period_months || 12)
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-ink/10">
                        <span className="text-xs font-bold text-ink">Total Betrieb</span>
                        <span className="text-sm font-bold text-ink font-mono">
                          {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
                            ((financialData.monthly_listing_fee || 0) * (financialData.holding_period_months || 12)) +
                            (((financialData.annual_compliance_costs || 0) / 12) * (financialData.holding_period_months || 12)) +
                            (((financialData.annual_accounting_costs || 0) / 12) * (financialData.holding_period_months || 12))
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-3 bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 rounded-lg border border-slate-200/60">
                        <span className="text-sm font-bold text-ink">Gesamtinvestition</span>
                        <span className="text-lg font-bold text-ink font-mono">
                          {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(calculateTotalInvestment(project))}
                        </span>
                      </div>
                      <div className={`flex justify-between items-center py-3 px-4 rounded-lg border ${
                        calculateNetProfit(project) >= 0 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-100/50 border-green-200/60' 
                          : 'bg-gradient-to-r from-red-50 to-rose-100/50 border-red-200/60'
                      }`}>
                        <span className={`text-sm font-bold ${calculateNetProfit(project) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          Erwarteter Gewinn
                        </span>
                        <span className={`text-lg font-bold font-mono ${calculateNetProfit(project) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(calculateNetProfit(project))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-ink uppercase tracking-wide">Zahlungsraten verwalten</h3>
                      <button
                        onClick={savePayments}
                        disabled={savingPayments}
                        className="ci-button px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold min-h-[44px]"
                      >
                        {savingPayments ? 'Speichern…' : 'Speichern'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Anzahlungen (bis 5) */}
                      <div>
                        <p className="text-xs font-semibold text-ink-soft mb-3 uppercase">Anzahlungsraten (max. 5)</p>
                        <div className="space-y-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="grid grid-cols-2 gap-2">
                              <input
                                type="number"
                                step="0.01"
                                inputMode="decimal"
                                className="w-full rounded-md border border-ink/10 px-3 py-2.5 md:py-2 text-sm min-h-[44px]"
                                placeholder={`Rate ${i + 1} Betrag €`}
                                value={downPayments.find(r => r.idx === i + 1)?.amount ?? ''}
                                onChange={e => handleDownPaymentChange(i, 'amount', e.target.value)}
                              />
                              <input
                                type="date"
                                className="w-full rounded-md border border-ink/10 px-3 py-2.5 md:py-2 text-sm min-h-[44px]"
                                value={downPayments.find(r => r.idx === i + 1)?.due_date ?? ''}
                                onChange={e => handleDownPaymentChange(i, 'due_date', e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Hinterlegungen (bis 3) */}
                      <div>
                        <p className="text-xs font-semibold text-ink-soft mb-3 uppercase">Hinterlegungsraten (max. 3)</p>
                        <div className="space-y-2">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="grid grid-cols-2 gap-2">
                              <input
                                type="number"
                                step="0.01"
                                inputMode="decimal"
                                className="w-full rounded-md border border-ink/10 px-3 py-2.5 md:py-2 text-sm min-h-[44px]"
                                placeholder={`Rate ${i + 1} Betrag €`}
                                value={deposits.find(r => r.idx === i + 1)?.amount ?? ''}
                                onChange={e => handleDepositChange(i, 'amount', e.target.value)}
                              />
                              <input
                                type="date"
                                className="w-full rounded-md border border-ink/10 px-3 py-2.5 md:py-2 text-sm min-h-[44px]"
                                value={deposits.find(r => r.idx === i + 1)?.due_date ?? ''}
                                onChange={e => handleDepositChange(i, 'due_date', e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Delta */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-ink/5 rounded-lg p-3">
                        <p className="text-xs text-ink-soft">Summe Anzahlungen</p>
                        <p className="text-lg font-bold text-ink font-mono">
                          {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(deltaInfo.downPaymentsSum || 0)}
                        </p>
                      </div>
                      <div className="bg-ink/5 rounded-lg p-3">
                        <p className="text-xs text-ink-soft">Summe Hinterlegungen</p>
                        <p className="text-lg font-bold text-ink font-mono">
                          {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(deltaInfo.depositsSum || 0)}
                        </p>
                      </div>
                      <div className="rounded-lg p-3 border" style={{ borderColor: deltaInfo.delta >= 0 ? '#16a34a33' : '#dc262633', background: deltaInfo.delta >= 0 ? '#16a34a11' : '#dc262611' }}>
                        <p className="text-xs text-ink-soft">Delta (Anzahlungen − Hinterlegungen)</p>
                        <p className={`text-lg font-bold font-mono ${deltaInfo.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(deltaInfo.delta || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Hinweis zu Gewinnvergleich */}
                    <div className="mt-3 text-xs text-ink-soft">
                      Erwarteter Gewinn: {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(calculateNetProfit(project))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Timeline & History Section - Combined */}
        <div className="card overflow-hidden mb-8">
          <div className="flex border-b border-ink/10">
            <button
              onClick={() => setTimelineTab('timeline')}
              className={`flex-1 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-200 min-h-[48px] ${
                timelineTab === 'timeline'
                  ? 'bg-white text-blue border-b-2 border-blue'
                  : 'bg-ink/5 text-ink-soft hover:bg-ink/10 hover:text-ink'
              }`}
            >
              <span className="flex items-center justify-center gap-1 md:gap-2">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Pipeline-Timeline</span>
                <span className="sm:hidden">Timeline</span>
              </span>
            </button>
            <button
              onClick={() => setTimelineTab('history')}
              className={`flex-1 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-200 min-h-[48px] ${
                timelineTab === 'history'
                  ? 'bg-white text-blue border-b-2 border-blue'
                  : 'bg-ink/5 text-ink-soft hover:bg-ink/10 hover:text-ink'
              }`}
            >
              <span className="flex items-center justify-center gap-1 md:gap-2">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="hidden sm:inline">Status-Verlauf</span>
                <span className="sm:hidden">Verlauf</span>
              </span>
            </button>
          </div>

          <div className="p-6 max-h-[600px] overflow-y-auto">
            {timelineTab === 'timeline' && (
              <div className="relative">
                <ProjectDetailTimeline project={project} />
              </div>
            )}
            {timelineTab === 'history' && (
              <div className="relative">
                <StatusHistory projectId={project.id} />
              </div>
            )}
          </div>
        </div>

        {/* Milestones Section */}
        <div className="mb-8">
          <MilestoneList projectId={project.id} />
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowMilestoneForm(true)}
              className="ci-button px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-200"
            >
              + Neuer Meilenstein
            </button>
          </div>
        </div>

        {/* Documents Section */}
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-ink font-display">Projekt-Dokumente</h2>
            <button
              onClick={() => setShowUpload(true)}
              className="ci-button px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200"
            >
              + Dokument hochladen
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <svg className="h-12 w-12 text-ink-soft mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-ink-soft mb-4">Noch keine Dokumente für dieses Projekt</p>
              <button
                onClick={() => setShowUpload(true)}
                className="ci-button"
              >
                Erstes Dokument hochladen
              </button>
            </div>
          ) : (
            <DocumentList 
              documents={documents}
              onDocumentUpdate={loadProjectData}
            />
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <DocumentUpload
          projectId={projectId}
          onUploadComplete={handleUploadComplete}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* Milestone Form Modal */}
      {showMilestoneForm && (
        <MilestoneForm
          projectId={projectId}
          onSuccess={() => {
            setShowMilestoneForm(false)
            loadProjectData()
          }}
          onCancel={() => setShowMilestoneForm(false)}
        />
      )}

      {/* Edit Project Modal */}
      {showEditModal && project && (
        <EditProjectModal
          project={project}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Buyer Assign Modal */}
      {showBuyerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-ink/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">Käufer zuweisen</h3>
              <button onClick={() => setShowBuyerModal(false)} className="p-2 text-ink-soft hover:text-ink">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {loadingBuyers ? (
                <p className="text-ink-soft text-sm">Lade Käufer-Kontakte…</p>
              ) : (
                <>
                  <label className="block text-sm font-semibold text-ink mb-2">Kontakt auswählen</label>
                  <select
                    className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                    value={selectedBuyerId}
                    onChange={e => setSelectedBuyerId(e.target.value)}
                  >
                    <option value="">Bitte wählen…</option>
                    {buyerOptions.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}{c.company ? ` (${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t border-ink/10 flex items-center justify-end gap-3">
              <button onClick={() => setShowBuyerModal(false)} className="px-5 py-2 text-ink-soft hover:text-ink font-medium">Abbrechen</button>
              <button
                onClick={assignBuyer}
                disabled={!selectedBuyerId || savingBuyer}
                className="ci-button px-6 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingBuyer ? 'Zuweisen…' : 'Zuweisen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

