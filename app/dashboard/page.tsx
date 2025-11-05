'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getProjects, getDashboardStats, deleteProject } from '@/lib/actions'
import { Project } from '@/lib/supabase'
import { calculateProjectAnalytics } from '@/lib/analytics'
import ProjectForm from '@/components/ProjectForm'
import ContactForm from '@/components/ContactForm'
import QuickAnalytics from '@/components/QuickAnalytics'
import Navigation from '@/components/Navigation'
import EditProjectModal from '@/components/EditProjectModal'
import PipelineBoard from '@/components/PipelineBoard'
import AvailableShells from '@/components/AvailableShells'
import UserMenu from '@/components/UserMenu'

function DashboardPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview')
  const [projects, setProjects] = useState<Project[]>([])
  const [dashboardStats, setDashboardStats] = useState({
    totalValue: 0,
    activeProjects: 0,
    winRate: 0,
    avgValue: 0
  })
  const [analytics, setAnalytics] = useState(calculateProjectAnalytics([]))
  const [docCounts, setDocCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Helper function to get pipeline stats from live data
  const getPipelineStats = (status: string) => {
    const projectsInStatus = projects.filter(p => p.status === status)
    const count = projectsInStatus.length
    const value = projectsInStatus.reduce((sum, p) => sum + (p.selling_price || 0), 0)
    return { count, value }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'overview') {
      params.delete('tab')
    } else {
      params.set('tab', tab)
    }
    router.push(`/dashboard?${params.toString()}`)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setShowEditModal(true)
  }

  const handleDeleteProject = async (project: Project) => {
    if (confirm(`Sind Sie sicher, dass Sie "${project.name}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      try {
        await deleteProject(project.id)
        loadData() // Reload data after deletion
      } catch (error) {
        console.error('Error deleting project:', error)
        alert('Fehler beim Löschen des Projekts')
      }
    }
  }

  const handleEditSuccess = () => {
    loadData() // Reload data after successful edit
  }

  const loadDocumentCounts = async (projectIds: string[]) => {
    if (!projectIds || projectIds.length === 0) {
      setDocCounts({})
      return
    }
    const { data, error } = await supabase
      .from('documents')
      .select('project_id')
      .in('project_id', projectIds)

    if (error) {
      console.error('Error loading document counts:', error)
      return
    }
    const counts: Record<string, number> = {}
    for (const row of data || []) {
      const pid = (row as any).project_id as string
      counts[pid] = (counts[pid] || 0) + 1
    }
    setDocCounts(counts)
  }

  const loadData = async () => {
    try {
      const [projectsData, statsData] = await Promise.all([
        getProjects(),
        getDashboardStats()
      ])
      setProjects(projectsData)
      setDashboardStats(statsData)
      setAnalytics(calculateProjectAnalytics(projectsData))
      // Load document counts for all projects in one query
      await loadDocumentCounts(projectsData.map(p => p.id))
    } catch (error) {
      console.error('Error loading data:', error)
      // Fallback to demo data if database is not available
      setProjects([
        {
          id: '1',
          name: 'TechCorp AG - Börsenmantel',
          company_name: 'TechCorp AG',
          status: 'negotiation',
          has_buyer: true,
          has_down_payment: true,
          purchase_price: 2500000,
          selling_price: 3200000,
          next_steps: 'Due Diligence abschließen',
          timeline: 'Q2 2024',
          probability: 85,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getStatusColor = (status: string) => {
    const colors = {
      lead: 'status-badge status-lead',
      offer_submitted: 'status-badge status-offer',
      negotiation: 'status-badge status-negotiation',
      offer_accepted: 'status-badge status-accepted',
      contract_finalized: 'status-badge status-accepted',
      creditors_meeting: 'status-badge status-negotiation',
      closed: 'status-badge status-closed'
    }
    return colors[status as keyof typeof colors] || 'status-badge status-lead'
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

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Premium Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-2 sm:px-4 lg:px-8">
          <div className="flex items-center h-14 md:h-16 relative">
            {/* Logo & Brand - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue to-brand rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-ink font-display">Meridiana CRM</h1>
                  <p className="text-sm text-ink-soft font-medium">Capital Markets Platform</p>
                </div>
              </div>
            </div>

            {/* Mobile Logo - Only icon */}
            <div className="md:hidden flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue to-brand rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-base">M</span>
              </div>
            </div>

            {/* Navigation - Centered */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-[calc(100%-80px)] sm:w-[calc(100%-120px)] md:w-auto">
              <Navigation onTabChange={handleTabChange} />
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2 md:space-x-4 ml-auto">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-2 sm:px-6 lg:px-8 py-4 md:py-8">
        {activeTab === 'overview' && (
          <>
            {/* Enhanced Analytics - Replaces the old stats cards */}
            <QuickAnalytics analytics={analytics} />

            {/* Pipeline Overview - Premium Redesign */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-slate-50/50 to-blue/5 border border-slate-200/60 shadow-lg shadow-slate-200/50 mb-8">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue/10 to-brand/10 rounded-full blur-3xl -z-0"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-gold/10 to-transparent rounded-full blur-3xl -z-0"></div>
              
              <div className="relative z-10 p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue to-brand flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-ink font-display">Pipeline Übersicht</h2>
                    </div>
                    <p className="text-ink-soft text-sm md:text-base ml-13">Aktuelle Börsenmäntel-Phasen und Transaktionswerte</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue/20 shadow-sm">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue"></span>
                    </span>
                    <span className="text-xs font-semibold text-ink">Live Daten</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 md:gap-6">
                  {/* Lead */}
                  {(() => {
                    const stats = getPipelineStats('lead')
                    return (
                      <div className="group relative bg-white rounded-2xl p-5 border border-slate-200/60 hover:border-blue/40 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue/10 to-blue/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <div className="w-3 h-3 bg-blue rounded-full"></div>
                            </div>
                            <span className="px-3 py-1 bg-blue/10 text-blue text-xs font-bold rounded-full">{stats.count}</span>
                          </div>
                          <h3 className="text-sm font-bold text-ink mb-2">Lead</h3>
                          <p className="text-lg font-bold text-ink font-mono">{formatCurrency(stats.value)}</p>
                          <div className="mt-3 pt-3 border-t border-slate-200/60">
                            <p className="text-xs text-ink-soft">Ø pro Deal</p>
                            <p className="text-sm font-semibold text-ink">{stats.count > 0 ? formatCurrency(stats.value / stats.count) : '—'}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Angebot abgegeben */}
                  {(() => {
                    const stats = getPipelineStats('offer_submitted')
                    return (
                      <div className="group relative bg-white rounded-2xl p-5 border border-slate-200/60 hover:border-gold/40 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/10 to-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <div className="w-3 h-3 bg-gold rounded-full"></div>
                            </div>
                            <span className="px-3 py-1 bg-gold/10 text-gold text-xs font-bold rounded-full">{stats.count}</span>
                          </div>
                          <h3 className="text-sm font-bold text-ink mb-2">Angebot abgegeben</h3>
                          <p className="text-lg font-bold text-ink font-mono">{formatCurrency(stats.value)}</p>
                          <div className="mt-3 pt-3 border-t border-slate-200/60">
                            <p className="text-xs text-ink-soft">Ø pro Deal</p>
                            <p className="text-sm font-semibold text-ink">{stats.count > 0 ? formatCurrency(stats.value / stats.count) : '—'}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Verhandlung */}
                  {(() => {
                    const stats = getPipelineStats('negotiation')
                    return (
                      <div className="group relative bg-white rounded-2xl p-5 border border-slate-200/60 hover:border-brand/40 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand/10 to-brand/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <div className="w-3 h-3 bg-brand rounded-full"></div>
                            </div>
                            <span className="px-3 py-1 bg-brand/10 text-brand text-xs font-bold rounded-full">{stats.count}</span>
                          </div>
                          <h3 className="text-sm font-bold text-ink mb-2">Verhandlung</h3>
                          <p className="text-lg font-bold text-ink font-mono">{formatCurrency(stats.value)}</p>
                          <div className="mt-3 pt-3 border-t border-slate-200/60">
                            <p className="text-xs text-ink-soft">Ø pro Deal</p>
                            <p className="text-sm font-semibold text-ink">{stats.count > 0 ? formatCurrency(stats.value / stats.count) : '—'}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Angebot angenommen */}
                  {(() => {
                    const stats = getPipelineStats('offer_accepted')
                    return (
                      <div className="group relative bg-white rounded-2xl p-5 border border-slate-200/60 hover:border-emerald-500/40 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                            </div>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded-full">{stats.count}</span>
                          </div>
                          <h3 className="text-sm font-bold text-ink mb-2">Angebot angenommen</h3>
                          <p className="text-lg font-bold text-ink font-mono">{formatCurrency(stats.value)}</p>
                          <div className="mt-3 pt-3 border-t border-slate-200/60">
                            <p className="text-xs text-ink-soft">Ø pro Deal</p>
                            <p className="text-sm font-semibold text-ink">{stats.count > 0 ? formatCurrency(stats.value / stats.count) : '—'}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Kaufvertrag/Insolvenzplan fertiggestellt */}
                  {(() => {
                    const stats = getPipelineStats('contract_finalized')
                    return (
                      <div className="group relative bg-white rounded-2xl p-5 border border-slate-200/60 hover:border-indigo-500/40 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                            </div>
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 text-xs font-bold rounded-full">{stats.count}</span>
                          </div>
                          <h3 className="text-sm font-bold text-ink mb-2">Kaufvertrag/Insolvenzplan fertiggestellt</h3>
                          <p className="text-lg font-bold text-ink font-mono">{formatCurrency(stats.value)}</p>
                          <div className="mt-3 pt-3 border-t border-slate-200/60">
                            <p className="text-xs text-ink-soft">Ø pro Deal</p>
                            <p className="text-sm font-semibold text-ink">{stats.count > 0 ? formatCurrency(stats.value / stats.count) : '—'}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Gläubigerversammlung durchgeführt */}
                  {(() => {
                    const stats = getPipelineStats('creditors_meeting')
                    return (
                      <div className="group relative bg-white rounded-2xl p-5 border border-slate-200/60 hover:border-amber-500/40 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                            </div>
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-700 text-xs font-bold rounded-full">{stats.count}</span>
                          </div>
                          <h3 className="text-sm font-bold text-ink mb-2">Gläubigerversammlung durchgeführt</h3>
                          <p className="text-lg font-bold text-ink font-mono">{formatCurrency(stats.value)}</p>
                          <div className="mt-3 pt-3 border-t border-slate-200/60">
                            <p className="text-xs text-ink-soft">Ø pro Deal</p>
                            <p className="text-sm font-semibold text-ink">{stats.count > 0 ? formatCurrency(stats.value / stats.count) : '—'}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Gewonnen */}
                  {(() => {
                    const stats = getPipelineStats('closed')
                    return (
                      <div className="group relative bg-gradient-to-br from-gold/10 to-amber-100/50 rounded-2xl p-5 border-2 border-gold/40 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="px-3 py-1 bg-gold text-white text-xs font-bold rounded-full shadow-sm">{stats.count}</span>
                          </div>
                          <h3 className="text-sm font-bold text-ink mb-2 flex items-center gap-2">
                            Gewonnen
                            <span className="text-xs">🎉</span>
                          </h3>
                          <p className="text-lg font-bold text-gold font-mono">{formatCurrency(stats.value)}</p>
                          <div className="mt-3 pt-3 border-t border-gold/30">
                            <p className="text-xs text-ink-soft">Ø pro Deal</p>
                            <p className="text-sm font-semibold text-ink">{stats.count > 0 ? formatCurrency(stats.value / stats.count) : '—'}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Quick Actions - Premium Redesign */}
              <div className="xl:col-span-1">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 shadow-lg p-6">
                  {/* Decorative Element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue/10 to-transparent rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue to-brand flex items-center justify-center shadow-md">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-ink font-display">Schnellaktionen</h2>
                    </div>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setShowProjectForm(true)}
                        className="group w-full text-left p-4 rounded-xl bg-white hover:bg-gradient-to-br hover:from-blue/5 hover:to-brand/5 border border-slate-200/60 hover:border-blue/30 transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue to-brand flex items-center justify-center shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-ink mb-0.5 group-hover:text-blue transition-colors">Neuer Börsenmantel</p>
                            <p className="text-xs text-ink-soft">Projekt erstellen & verwalten</p>
                          </div>
                          <svg className="w-5 h-5 text-ink-soft group-hover:text-blue group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => setShowContactForm(true)}
                        className="group w-full text-left p-4 rounded-xl bg-white hover:bg-gradient-to-br hover:from-gold/5 hover:to-amber-500/5 border border-slate-200/60 hover:border-gold/30 transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-ink mb-0.5 group-hover:text-gold transition-colors">Kontakt hinzufügen</p>
                            <p className="text-xs text-ink-soft">Insolvenzverwalter oder Käufer</p>
                          </div>
                          <svg className="w-5 h-5 text-ink-soft group-hover:text-gold group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                      
                      <button className="group w-full text-left p-4 rounded-xl bg-white hover:bg-gradient-to-br hover:from-brand/5 hover:to-ink/5 border border-slate-200/60 hover:border-brand/30 transition-all duration-300 hover:shadow-lg opacity-60 cursor-not-allowed">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-ink mb-0.5">Meeting planen</p>
                            <p className="text-xs text-ink-soft">Bald verfügbar</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Neueste Börsenmäntel - Premium Redesign */}
              <div className="xl:col-span-3">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 shadow-lg">
                  {/* Decorative Element */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue/5 to-transparent rounded-full blur-3xl"></div>
                  
                  <div className="relative z-10 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue to-brand flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold text-ink font-display">Neueste Börsenmäntel</h2>
                          <p className="text-xs text-ink-soft">Zuletzt aktualisierte Projekte</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleTabChange('projects')}
                        className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue hover:text-white bg-blue/10 hover:bg-blue rounded-xl transition-all duration-300 hover:shadow-lg"
                      >
                        Alle anzeigen
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    
                    {loading ? (
                      <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue mx-auto mb-4"></div>
                        <p className="text-ink-soft font-medium">Lade Projekte...</p>
                      </div>
                    ) : projects.length === 0 ? (
                      <div className="text-center py-16 px-4">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue/10 to-brand/10 flex items-center justify-center">
                          <svg className="w-10 h-10 text-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-ink mb-2">Keine Projekte vorhanden</h3>
                        <p className="text-ink-soft mb-6">Erstellen Sie Ihr erstes Börsenmäntel-Projekt</p>
                        <button 
                          onClick={() => setShowProjectForm(true)}
                          className="ci-button px-6 py-3 rounded-xl"
                        >
                          + Neuer Börsenmantel
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {projects.slice(0, 6).map((project) => (
                          <Link 
                            key={project.id} 
                            href={`/projects/${project.id}`}
                            className="group relative bg-white rounded-2xl p-5 border border-slate-200/60 hover:border-blue/40 shadow-sm hover:shadow-xl transition-all duration-300"
                          >
                            {/* Hover Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            <div className="relative z-10">
                              {/* Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base font-bold text-ink font-display mb-1 line-clamp-1 group-hover:text-blue transition-colors">
                                    {project.name}
                                  </h3>
                                  <p className="text-sm text-ink-soft line-clamp-1">
                                    {project.company_name}
                                  </p>
                                </div>
                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ml-3 ${
                                  project.status === 'closed' ? 'bg-gold' :
                                  project.status === 'offer_accepted' ? 'bg-emerald-500' :
                                  project.status === 'negotiation' ? 'bg-brand' :
                                  project.status === 'offer_submitted' ? 'bg-gold' :
                                  'bg-blue'
                                }`}></div>
                              </div>

                              {/* Financial Info */}
                              <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-slate-200/60">
                                <div>
                                  <p className="text-xs text-ink-soft mb-1">Kaufpreis</p>
                                  <p className="text-base font-bold text-ink font-mono">
                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(project.purchase_price || 0)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-ink-soft mb-1">Verkaufspreis</p>
                                  <p className="text-base font-bold text-green-600 font-mono">
                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(project.selling_price || 0)}
                                  </p>
                                </div>
                              </div>

                              {/* Status & Probability */}
                              <div className="flex items-center gap-2 mb-3">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusColor(project.status)}`}>
                                  {getStatusLabel(project.status)}
                                </span>
                                {project.has_buyer && (
                                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-100 text-green-700 border border-green-200">
                                    Käufer
                                  </span>
                                )}
                              </div>

                              {/* Progress Bar */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs text-ink-soft font-medium">Wahrscheinlichkeit</span>
                                  <span className="text-xs font-bold text-ink">{project.probability}%</span>
                                </div>
                                <div className="w-full bg-slate-200/60 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue to-brand h-2 rounded-full transition-all duration-700 ease-out"
                                    style={{ width: `${project.probability}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Next Steps */}
                              {project.next_steps && (
                                <div className="bg-blue/5 rounded-lg p-3 border border-blue/10">
                                  <p className="text-xs text-blue font-semibold mb-1">Nächste Schritte</p>
                                  <p className="text-xs text-ink-soft line-clamp-2">{project.next_steps}</p>
                                </div>
                              )}

                              {/* View Arrow */}
                              <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                                <svg className="w-4 h-4 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Available Shells Market Overview - At the bottom */}
            <AvailableShells />
          </>
        )}

        {activeTab === 'projects' && (
          <div>
            {/* Mobile Header - Card View */}
            <div className="md:hidden space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-ink font-display">Börsenmäntel</h2>
                  <p className="text-xs text-ink-soft mt-0.5">{projects.length} Einträge</p>
                </div>
                <button 
                  onClick={() => setShowProjectForm(true)}
                  className="ci-button px-4 py-2.5 rounded-lg text-sm font-semibold"
                >
                  + Neu
                </button>
              </div>

              {/* Mobile Card List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue mx-auto mb-4"></div>
                  <p className="text-ink-soft font-medium">Lade Projekte...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div key={project.id} className="card p-4 space-y-3">
                      {/* Project Title & Company */}
                      <div>
                        <Link href={`/projects/${project.id}`} className="hover:opacity-80 transition-opacity">
                          <h3 className="text-base font-bold text-ink font-display">{project.name}</h3>
                          <p className="text-sm text-ink-soft mt-0.5">{project.company_name}</p>
                        </Link>
                      </div>

                      {/* Status & Dates */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                        <span className={`info-badge ${project.has_buyer ? 'info-badge-positive' : 'info-badge-negative'}`}>
                          {project.has_buyer ? 'Käufer' : 'Kein Käufer'}
                        </span>
                        <span className="text-xs text-ink-soft">
                          {new Date(project.created_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>

                      {/* Financial Info */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-ink/10">
                        <div>
                          <p className="text-xs text-ink-soft mb-1">Kaufpreis</p>
                          <p className="text-sm font-bold text-ink">€{project.purchase_price?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-ink-soft mb-1">Verkaufspreis</p>
                          <p className="text-sm font-bold text-green-600">€{project.selling_price?.toLocaleString() || '0'}</p>
                        </div>
                      </div>

                      {/* Insolvency Admin */}
                      {project.insolvency_admin_name && (
                        <div className="bg-ink/5 rounded-lg p-3 text-xs">
                          <p className="text-ink-soft mb-1">Insolvenzverwalter</p>
                          <p className="font-semibold text-ink">{project.insolvency_admin_name}</p>
                          {project.insolvency_admin_company && (
                            <p className="text-ink-soft">{project.insolvency_admin_company}</p>
                          )}
                          {project.insolvency_admin_email && (
                            <a href={`mailto:${project.insolvency_admin_email}`} className="text-blue hover:underline block mt-1">
                              {project.insolvency_admin_email}
                            </a>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-ink/10">
                        <Link 
                          href={`/projects/${project.id}`}
                          className="flex-1 ci-button text-center text-xs py-2.5"
                        >
                          Öffnen
                        </Link>
                        <button 
                          onClick={() => handleEditProject(project)}
                          className="px-4 py-2.5 text-xs font-semibold text-blue border border-blue/30 rounded-lg hover:bg-blue/5"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(project)}
                          className="px-4 py-2.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block card overflow-hidden">
            <div className="px-6 md:px-8 py-4 md:py-6 border-b border-ink/10">
              <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
                <div>
                <h2 className="text-xl md:text-2xl font-bold text-ink font-display">Börsenmäntel-Verwaltung</h2>
                <p className="text-sm text-ink-soft mt-1">Verwalten Sie Ihre Aktiengesellschaften und Börsenmäntel</p>
                </div>
                      <button 
                        onClick={() => setShowProjectForm(true)}
                        className="ci-button px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                      >
                        + Neuer Börsenmantel
                      </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ink/5">
                  <tr>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Aktiengesellschaft</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Insolvenzverwalter</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Status</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Käufer</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Anzahlung</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Kaufpreis</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Verkaufspreis</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Dokumente</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Timeline</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Aktionen</th>
                  </tr>
                </thead>
                      <tbody className="divide-y divide-ink/10">
                        {loading ? (
                          <tr>
                            <td colSpan={10} className="px-6 py-8 text-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue mx-auto"></div>
                              <p className="text-ink-soft mt-2">Lade Projekte...</p>
                            </td>
                          </tr>
                        ) : (
                          projects.map((project) => (
                            <tr key={project.id} className="hover:bg-ink/5 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <Link 
                                    href={`/projects/${project.id}`}
                                    className="font-semibold text-ink hover:text-blue transition-colors"
                                  >
                                    {project.name}
                                  </Link>
                                  <div className="text-sm text-ink-soft">{project.next_steps}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {project.insolvency_admin_name ? (
                                  <div className="space-y-1">
                                    <div className="font-semibold text-ink">{project.insolvency_admin_name}</div>
                                    <div className="text-xs text-ink-soft">{project.insolvency_admin_company}</div>
                                    {project.insolvency_admin_email && (
                                      <a 
                                        href={`mailto:${project.insolvency_admin_email}`}
                                        className="text-xs text-blue hover:underline"
                                      >
                                        {project.insolvency_admin_email}
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-ink-soft">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`${getStatusColor(project.status)}`}>
                                  {getStatusLabel(project.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`info-badge ${project.has_buyer ? 'info-badge-positive' : 'info-badge-negative'}`}>
                                  {project.has_buyer ? 'Ja' : 'Nein'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`info-badge ${project.has_down_payment ? 'info-badge-positive' : 'info-badge-negative'}`}>
                                  {project.has_down_payment ? 'Ja' : 'Nein'}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-semibold text-ink">€{project.purchase_price?.toLocaleString() || '0'}</td>
                              <td className="px-6 py-4 font-semibold text-ink">€{project.selling_price?.toLocaleString() || '0'}</td>
                              <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4 text-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-medium text-ink">{docCounts[project.id] ?? 0}</span>
                    </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-ink-soft">{project.timeline}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <Link 
                                    href={`/projects/${project.id}`}
                                    className="text-ink-soft hover:text-blue transition-colors"
                                    title="Projekt anzeigen"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </Link>
                                  <button 
                                    onClick={() => handleEditProject(project)}
                                    className="text-ink-soft hover:text-blue transition-colors" 
                                    title="Bearbeiten"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProject(project)}
                                    className="text-ink-soft hover:text-red-500 transition-colors" 
                                    title="Löschen"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="w-full">
            <PipelineBoard projects={projects} onProjectUpdate={loadData} />
          </div>
        )}
            </main>

            {/* Modals */}
            {showProjectForm && (
              <ProjectForm
                onSuccess={() => {
                  setShowProjectForm(false)
                  loadData() // Reload data after successful creation
                }}
                onCancel={() => setShowProjectForm(false)}
              />
            )}

            {showContactForm && (
              <ContactForm
                onSuccess={() => {
                  setShowContactForm(false)
                  loadData() // Reload data after successful creation
                }}
                onCancel={() => setShowContactForm(false)}
              />
            )}

            {showEditModal && (
              <EditProjectModal
                project={editingProject}
                isOpen={showEditModal}
                onClose={() => {
                  setShowEditModal(false)
                  setEditingProject(null)
                }}
                onSuccess={handleEditSuccess}
              />
            )}
          </div>
        )
      }

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">
      <div className="text-lg text-ink-soft">Lädt Dashboard...</div>
    </div>}>
      <DashboardPageContent />
    </Suspense>
  )
}
