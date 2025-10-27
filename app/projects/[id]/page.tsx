'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getProjectById, getDocumentsByProject, updateProject, deleteProject } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { Project, Document } from '@/lib/supabase'
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
  const [showUpload, setShowUpload] = useState(false)
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const loadProjectData = async () => {
    try {
      const [projectData, documentsData] = await Promise.all([
        getProjectById(projectId),
        getDocumentsByProject(projectId)
      ])
      setProject(projectData)
      setDocuments(documentsData)
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
      closed: 'Abgeschlossen'
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
        {/* Main Content - Simplified Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 mb-8">
          
          {/* Left Side - Main Project Info */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* Project Header */}
            <div className="card p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-ink font-display mb-2">{project.name}</h2>
                  <p className="text-lg text-ink-soft">{project.company_name}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>

              {/* Key Financial Metrics */}
              <div className="grid grid-cols-3 gap-6 border-b border-ink/10 pb-6">
                <div>
                  <p className="text-xs font-medium text-ink-soft mb-2 uppercase tracking-wide">Kaufpreis</p>
                  <p className="text-2xl font-bold text-ink font-display">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(project.purchase_price || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-ink-soft mb-2 uppercase tracking-wide">Verkaufspreis</p>
                  <p className="text-2xl font-bold text-green-600 font-display">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(project.selling_price || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-ink-soft mb-2 uppercase tracking-wide">Net ROI</p>
                  <p className={`text-2xl font-bold font-display ${calculateNetROI(project) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculateNetROI(project).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-4 gap-6 mt-6 mb-6 border-b border-ink/10 pb-6">
                <div>
                  <p className="text-xs font-medium text-ink-soft mb-1 uppercase tracking-wide">Investition</p>
                  <p className="text-sm font-semibold text-ink">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(calculateTotalInvestment(project))}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-ink-soft mb-1 uppercase tracking-wide">Gewinn</p>
                  <p className={`text-sm font-semibold ${calculateNetProfit(project) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(calculateNetProfit(project))}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-ink-soft mb-1 uppercase tracking-wide">Wahrscheinlichkeit</p>
                  <p className="text-sm font-semibold text-ink">{project.probability}%</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-ink-soft mb-1 uppercase tracking-wide">Status</p>
                  <p className="text-sm font-semibold text-ink">
                    {project.has_buyer ? '✓ Käufer' : '— Kein Käufer'}
                  </p>
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs font-medium text-ink-soft mb-1 uppercase tracking-wide">Dokumente</p>
                  <p className="text-lg font-bold text-ink">{documents.length}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-ink-soft mb-1 uppercase tracking-wide">Bearbeitungszeit</p>
                  <p className="text-lg font-bold text-ink">
                    {Math.round(calculateProjectProcessingTime(project))} Tage
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-ink-soft mb-1 uppercase tracking-wide">Erstellt</p>
                  <p className="text-lg font-bold text-ink">
                    {new Date(project.created_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-ink-soft mb-1 uppercase tracking-wide">Anzahlung</p>
                  <p className={`text-lg font-bold ${project.has_down_payment ? 'text-green-600' : 'text-red-600'}`}>
                    {project.has_down_payment ? '✓' : '—'}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              {(project.next_steps || project.timeline) && (
                <div className="mt-6 pt-6 border-t border-ink/10">
                  {project.next_steps && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-ink mb-2">Nächste Schritte</h4>
                      <p className="text-ink-soft">{project.next_steps}</p>
                    </div>
                  )}
                  {project.timeline && (
                    <div>
                      <h4 className="text-sm font-semibold text-ink mb-2">Timeline</h4>
                      <p className="text-ink-soft">{project.timeline}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Right Side - Cost Breakdown */}
          <div className="xl:col-span-2">
            
            {/* Cost Breakdown */}
            <div className="card p-6">
              <h3 className="text-sm font-bold text-ink mb-4 uppercase tracking-wide">Kosten</h3>
              
              {/* Transaction Costs */}
              <div className="mb-4 pb-4 border-b border-ink/10">
                <p className="text-xs font-semibold text-ink-soft mb-3 uppercase">Transaktionen</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-soft">Rechtsanwalt</span>
                    <span className="font-mono text-ink">
                      {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(project.legal_fees || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-soft">Due Diligence</span>
                    <span className="font-mono text-ink">
                      {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(project.due_diligence_costs || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-soft">Makler</span>
                    <span className="font-mono text-ink">
                      {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
                        (project.purchase_price || 0) * (project.broker_commission || 0) / 100
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-soft">Börsen-Gebühr</span>
                    <span className="font-mono text-ink">
                      {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(project.exchange_fees || 0)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-ink/10">
                  <span className="text-xs font-bold text-ink">Total</span>
                  <span className="text-sm font-bold text-ink font-mono">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(calculateTotalTransactionCosts(project))}
                  </span>
                </div>
              </div>

              {/* Operational Costs */}
              <div className="mb-4 pb-4 border-b border-ink/10">
                <p className="text-xs font-semibold text-ink-soft mb-3 uppercase">
                  Betrieb ({project.holding_period_months || 12} Monate)
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-soft">Listing</span>
                    <span className="font-mono text-ink">
                      {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
                        (project.monthly_listing_fee || 0) * (project.holding_period_months || 12)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-soft">Compliance</span>
                    <span className="font-mono text-ink">
                      {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
                        ((project.annual_compliance_costs || 0) / 12) * (project.holding_period_months || 12)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-soft">Steuerberatung</span>
                    <span className="font-mono text-ink">
                      {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
                        ((project.annual_accounting_costs || 0) / 12) * (project.holding_period_months || 12)
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-ink/10">
                  <span className="text-xs font-bold text-ink">Total</span>
                  <span className="text-sm font-bold text-ink font-mono">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(calculateTotalOperationalCosts(project))}
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 bg-ink/5 px-3 rounded">
                  <span className="text-xs font-bold text-ink">Investition</span>
                  <span className="text-sm font-bold text-ink font-mono">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(calculateTotalInvestment(project))}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded">
                  <span className="text-xs font-bold text-green-700">Gewinn</span>
                  <span className={`text-sm font-bold font-mono ${calculateNetProfit(project) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(calculateNetProfit(project))}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Timeline & History Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <ProjectDetailTimeline project={project} />
          <StatusHistory projectId={project.id} />
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
    </div>
  )
}
