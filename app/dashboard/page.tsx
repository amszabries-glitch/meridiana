'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
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

export default function DashboardPage() {
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

  const loadData = async () => {
    try {
      const [projectsData, statsData] = await Promise.all([
        getProjects(),
        getDashboardStats()
      ])
      setProjects(projectsData)
      setDashboardStats(statsData)
      setAnalytics(calculateProjectAnalytics(projectsData))
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
      closed: 'Gewonnen'
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

            {/* Pipeline Overview */}
            <div className="card p-8 mb-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-ink font-display">Pipeline Übersicht</h2>
                  <p className="text-ink-soft mt-1">Aktuelle Börsenmäntel-Phasen und Werte</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue to-brand rounded-full"></div>
                  <span className="text-sm text-ink-soft font-medium">Live Daten</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Lead */}
                {(() => {
                  const stats = getPipelineStats('lead')
                  return (
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue/15 to-blue/25 hover:from-blue/25 hover:to-blue/35 transition-all duration-300 border border-blue/20">
                      <div className="w-6 h-6 bg-blue rounded-full mx-auto mb-3"></div>
                      <p className="text-sm font-semibold text-ink mb-1">Lead</p>
                      <p className="text-2xl font-bold text-ink mb-1 font-display">{stats.count}</p>
                      <p className="text-xs text-ink-soft font-medium">{formatCurrency(stats.value)}</p>
                    </div>
                  )
                })()}

                {/* Angebot abgegeben */}
                {(() => {
                  const stats = getPipelineStats('offer_submitted')
                  return (
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-gold/15 to-gold/25 hover:from-gold/25 hover:to-gold/35 transition-all duration-300 border border-gold/20">
                      <div className="w-6 h-6 bg-gold rounded-full mx-auto mb-3"></div>
                      <p className="text-sm font-semibold text-ink mb-1">Angebot abgegeben</p>
                      <p className="text-2xl font-bold text-ink mb-1 font-display">{stats.count}</p>
                      <p className="text-xs text-ink-soft font-medium">{formatCurrency(stats.value)}</p>
                    </div>
                  )
                })()}

                {/* Verhandlung */}
                {(() => {
                  const stats = getPipelineStats('negotiation')
                  return (
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-brand/15 to-brand/25 hover:from-brand/25 hover:to-brand/35 transition-all duration-300 border border-brand/20">
                      <div className="w-6 h-6 bg-brand rounded-full mx-auto mb-3"></div>
                      <p className="text-sm font-semibold text-ink mb-1">Verhandlung</p>
                      <p className="text-2xl font-bold text-ink mb-1 font-display">{stats.count}</p>
                      <p className="text-xs text-ink-soft font-medium">{formatCurrency(stats.value)}</p>
                    </div>
                  )
                })()}

                {/* Angebot angenommen */}
                {(() => {
                  const stats = getPipelineStats('offer_accepted')
                  return (
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-ink/15 to-ink/25 hover:from-ink/25 hover:to-ink/35 transition-all duration-300 border border-ink/20">
                      <div className="w-6 h-6 bg-ink rounded-full mx-auto mb-3"></div>
                      <p className="text-sm font-semibold text-ink mb-1">Angebot angenommen</p>
                      <p className="text-2xl font-bold text-ink mb-1 font-display">{stats.count}</p>
                      <p className="text-xs text-ink-soft font-medium">{formatCurrency(stats.value)}</p>
                    </div>
                  )
                })()}

                {/* Gewonnen */}
                {(() => {
                  const stats = getPipelineStats('closed')
                  return (
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-gold/25 to-gold/35 hover:from-gold/35 hover:to-gold/45 transition-all duration-300 border border-gold/30">
                      <div className="w-6 h-6 bg-gold rounded-full mx-auto mb-3"></div>
                      <p className="text-sm font-semibold text-ink mb-1">Gewonnen</p>
                      <p className="text-2xl font-bold text-ink mb-1 font-display">{stats.count}</p>
                      <p className="text-xs text-ink-soft font-medium">{formatCurrency(stats.value)}</p>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Quick Actions */}
              <div className="xl:col-span-1">
                <div className="card p-6">
                  <h2 className="text-lg font-bold text-ink mb-6 font-display">Schnellaktionen</h2>
                  <div className="space-y-4">
                    <button 
                      onClick={() => setShowProjectForm(true)}
                      className="w-full text-left p-4 rounded-xl hover:bg-ink/5 transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue to-brand text-white group-hover:from-brand group-hover:to-ink transition-all duration-200">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-ink">Neuer Börsenmantel</p>
                          <p className="text-sm text-ink-soft">Erstelle ein neues Börsenmäntel-Projekt</p>
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={() => setShowContactForm(true)}
                      className="w-full text-left p-4 rounded-xl hover:bg-ink/5 transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gold to-brand text-white group-hover:from-brand group-hover:to-ink transition-all duration-200">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-ink">Kontakt hinzufügen</p>
                          <p className="text-sm text-ink-soft">Neuen Kontakt erstellen</p>
                        </div>
                      </div>
                    </button>
                    <button className="w-full text-left p-4 rounded-xl hover:bg-ink/5 transition-all duration-200 group">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-brand to-ink text-white group-hover:from-ink group-hover:to-brand transition-all duration-200">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-ink">Meeting planen</p>
                          <p className="text-sm text-ink-soft">Neuen Termin erstellen</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Neueste Börsenmäntel - Jetzt volle Breite */}
              <div className="xl:col-span-3">
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-ink font-display">Neueste Börsenmäntel</h2>
                    <button className="text-sm text-blue hover:text-brand font-medium transition-colors">
                      Alle anzeigen →
                    </button>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue mx-auto mb-4"></div>
                      <p className="text-ink-soft font-medium">Lade Projekte...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                      {projects.slice(0, 6).map((project) => (
                        <div key={project.id} className="bg-white border border-ink/10 rounded-lg p-4 hover:border-ink/20 transition-all duration-300">
                          
                          {/* Header Row */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-bold text-ink font-display mb-1">
                                {project.name}
                              </h3>
                              <p className="text-sm text-ink-soft">
                                {project.company_name}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-lg font-bold text-ink">
                                €{project.selling_price?.toLocaleString() || '0'}
                              </div>
                              <div className="text-sm text-ink-soft">
                                {project.probability}% Wahrscheinlichkeit
                              </div>
                            </div>
                          </div>

                          {/* Status Row */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className={`${getStatusColor(project.status)}`}>
                                {getStatusLabel(project.status)}
                              </span>
                              <span className={`info-badge ${project.has_buyer ? 'info-badge-positive' : 'info-badge-negative'}`}>
                                {project.has_buyer ? 'Käufer' : 'Kein Käufer'}
                              </span>
                            </div>
                            <div className="text-sm text-ink-soft">
                              {new Date(project.created_at).toLocaleDateString('de-DE')}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-ink/10 rounded-full h-2 mb-3">
                            <div 
                              className="bg-gradient-to-r from-blue to-brand h-2 rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${project.probability}%` }}
                            ></div>
                          </div>

                          {/* Next Steps */}
                          {project.next_steps && (
                            <div className="bg-ink/5 rounded-lg p-3">
                              <div className="text-sm text-ink-soft">
                                <span className="font-semibold text-ink">Nächste Schritte:</span>
                                <div className="mt-1 text-sm">{project.next_steps}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
                                  <span className="text-sm font-medium text-ink">0</span>
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
