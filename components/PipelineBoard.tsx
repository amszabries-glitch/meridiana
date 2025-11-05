'use client'

import { useState, useMemo } from 'react'
import { Project } from '@/lib/supabase'
import { updateProject } from '@/lib/actions'
import { createStatusHistoryEntry } from '@/lib/actions'

interface PipelineBoardProps {
  projects: Project[]
  onProjectUpdate?: () => void
}

interface StatusConfig {
  title: string
  color: string
  bgColor: string
  icon: string
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  lead: {
    title: 'Lead',
    color: 'text-blue',
    bgColor: 'bg-blue/10 border-blue/20',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  offer_submitted: {
    title: 'Angebot abgegeben',
    color: 'text-gold',
    bgColor: 'bg-gold/10 border-gold/20',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  negotiation: {
    title: 'Verhandlung',
    color: 'text-brand',
    bgColor: 'bg-brand/10 border-brand/20',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  offer_accepted: {
    title: 'Angebot angenommen',
    color: 'text-green-600',
    bgColor: 'bg-green-500/10 border-green-500/20',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  contract_finalized: {
    title: 'Kaufvertrag/Insolvenzplan fertiggestellt',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    icon: 'M12 8v8m4-4H8m12 0a8 8 0 11-16 0 8 8 0 0116 0z'
  },
  creditors_meeting: {
    title: 'Gläubigerversammlung durchgeführt',
    color: 'text-amber-700',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    icon: 'M7 8h10M7 12h8m-8 4h6M5 6h14v12H5z'
  },
  closed: {
    title: 'Aktien ausgeliefert (abgeschlossen)',
    color: 'text-gold',
    bgColor: 'bg-gold/20 border-gold/30',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
  }
}

const STATUS_ORDER = ['lead', 'offer_submitted', 'negotiation', 'offer_accepted', 'contract_finalized', 'creditors_meeting', 'closed']

export default function PipelineBoard({ projects, onProjectUpdate }: PipelineBoardProps) {
  const [draggedProject, setDraggedProject] = useState<Project | null>(null)
  const [targetStatus, setTargetStatus] = useState<string | null>(null)

  const projectsByStatus = useMemo(() => {
    const grouped: Record<string, Project[]> = {
      lead: [],
      offer_submitted: [],
      negotiation: [],
      offer_accepted: [],
      contract_finalized: [],
      creditors_meeting: [],
      closed: []
    }

    projects.forEach(project => {
      if (grouped[project.status]) {
        grouped[project.status].push(project)
      }
    })

    return grouped
  }, [projects])

  const handleDragStart = (project: Project) => {
    console.log('Drag started:', project.name)
    setDraggedProject(project)
  }

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    setTargetStatus(status)
  }

  const handleDragLeave = () => {
    setTargetStatus(null)
  }

  const handleDragEnd = () => {
    setDraggedProject(null)
    setTargetStatus(null)
  }

  const getProbabilityForStatus = (status: string): number => {
    // Realistische Wahrscheinlichkeit basierend auf Pipeline-Stage
    // Rechnet wie wahrscheinlich es ist, dass das Projekt erfolgreich abgeschlossen wird
    const probabilityMap: Record<string, number> = {
      lead: 5,              // 5% - Erstkontakt, sehr früh
      offer_submitted: 20,  // 20% - Angebot abgegeben, Interesse da
      negotiation: 50,            // 50% - Aktiv in Verhandlung
      offer_accepted: 70,         // 70% - Angebot akzeptiert
      contract_finalized: 85,     // 85% - Vertrag/Insolvenzplan fertig
      creditors_meeting: 95,      // 95% - Gläubigerversammlung durchgeführt
      closed: 100                 // 100% - Aktien ausgeliefert
    }
    return probabilityMap[status] || 5
  }

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault()
    console.log('Drop triggered:', targetStatus, 'draggedProject:', draggedProject?.name)
    setTargetStatus(null)

    if (!draggedProject || draggedProject.status === targetStatus) {
      console.log('Drop cancelled - same status or no project')
      setDraggedProject(null)
      return
    }

    try {
      const newProbability = getProbabilityForStatus(targetStatus)
      console.log('Updating project:', draggedProject.name, 'to status:', targetStatus, 'with probability:', newProbability)
      
      // Update project status and probability
      await updateProject(draggedProject.id, { 
        status: targetStatus as Project['status'],
        probability: newProbability,
        updated_at: new Date().toISOString()
      })

      // Log status history
      await createStatusHistoryEntry(
        draggedProject.id,
        draggedProject.status,
        targetStatus,
        `Status über Pipeline-Board geändert. Wahrscheinlichkeit von ${draggedProject.probability}% auf ${newProbability}% aktualisiert`
      )

      console.log('Update successful!')
      setDraggedProject(null)
      
      // Reload data after successful update
      if (onProjectUpdate) {
        console.log('Calling onProjectUpdate callback')
        onProjectUpdate()
      }
    } catch (error) {
      console.error('Error updating project status:', error)
      alert('Fehler beim Aktualisieren des Projektstatus')
    }
  }

  const getTotalValue = (status: string) => {
    return projectsByStatus[status].reduce((sum, p) => sum + (p.selling_price || 0), 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="w-full">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-slate-50/50 to-blue/5 border border-slate-200/60 shadow-lg p-6 mb-6">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue/10 to-brand/10 rounded-full blur-3xl -z-0"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue to-brand flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-ink font-display">Pipeline Board</h2>
                <p className="text-sm text-ink-soft">Drag & Drop zum Status ändern</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue/20 shadow-sm">
              <span className="text-2xl font-bold text-ink">{projects.length}</span>
              <span className="text-sm text-ink-soft">{projects.length === 1 ? 'Projekt' : 'Projekte'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {STATUS_ORDER.map(status => {
          const config = STATUS_CONFIG[status]
          const statusProjects = projectsByStatus[status]

          return (
            <div
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
              className={`relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 shadow-sm transition-all duration-300 ${
                targetStatus === status ? 'ring-2 ring-blue shadow-2xl scale-105' : 'hover:shadow-lg'
              }`}
            >
              {/* Status-specific gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-b ${
                status === 'closed' ? 'from-gold/10 to-transparent' :
                status === 'offer_accepted' ? 'from-emerald-500/10 to-transparent' :
                status === 'negotiation' ? 'from-brand/10 to-transparent' :
                status === 'offer_submitted' ? 'from-gold/10 to-transparent' :
                'from-blue/10 to-transparent'
              } -z-0`}></div>

              <div className="relative z-10 p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-200/60">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                      status === 'closed' ? 'bg-gradient-to-br from-gold to-amber-500' :
                      status === 'offer_accepted' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                      status === 'negotiation' ? 'bg-gradient-to-br from-brand to-slate-600' :
                      status === 'offer_submitted' ? 'bg-gradient-to-br from-gold to-amber-600' :
                      'bg-gradient-to-br from-blue to-blue-600'
                    }`}>
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-ink text-sm leading-snug mb-1">
                        {config.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-white rounded-full text-xs font-bold text-ink shadow-sm">
                          {statusProjects.length}
                        </span>
                        <span className="text-xs text-ink-soft font-medium">
                          {statusProjects.length === 1 ? 'Projekt' : 'Projekte'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Value */}
                <div className="mb-4 pb-4 border-b border-slate-200/60 bg-white/60 backdrop-blur-sm rounded-xl p-3">
                  <p className="text-xs text-ink-soft font-semibold mb-1.5 uppercase tracking-wider">Pipeline-Wert</p>
                  <p className="text-xl font-bold text-ink font-mono">
                    {formatCurrency(getTotalValue(status))}
                  </p>
                  {statusProjects.length > 0 && (
                    <p className="text-xs text-ink-soft mt-1">
                      Ø {formatCurrency(getTotalValue(status) / statusProjects.length)}
                    </p>
                  )}
                </div>

                {/* Projects */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                  {statusProjects.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-xs text-ink-soft">Keine Projekte</p>
                    </div>
                  ) : (
                    statusProjects.map(project => (
                      <div
                        key={project.id}
                        draggable
                        onDragStart={() => handleDragStart(project)}
                        onDragEnd={handleDragEnd}
                        className={`group relative bg-white rounded-xl p-3 cursor-move border border-slate-200/60 transition-all duration-300 ${
                          draggedProject?.id === project.id 
                            ? 'opacity-40 scale-95 rotate-2' 
                            : 'hover:border-blue/40 hover:shadow-lg hover:scale-105'
                        }`}
                      >
                        {/* Drag Indicator */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4 text-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                        </div>

                        <h4 className="font-bold text-ink text-sm mb-1 pr-6 line-clamp-1">{project.name}</h4>
                        <p className="text-xs text-ink-soft mb-3 line-clamp-1">{project.company_name}</p>
                        
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xs text-ink-soft mb-0.5">Verkaufspreis</p>
                            <p className="text-sm font-bold text-ink font-mono">
                              {formatCurrency(project.selling_price || 0)}
                            </p>
                          </div>
                          <div className={`px-2.5 py-1 rounded-lg font-bold text-xs shadow-sm ${
                            project.probability >= 80 ? 'bg-green-100 text-green-700 border border-green-200' :
                            project.probability >= 50 ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            project.probability >= 20 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {project.probability}%
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200/60 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-blue to-brand h-1.5 rounded-full transition-all duration-700"
                            style={{ width: `${project.probability}%` }}
                          ></div>
                        </div>

                        {/* Buyer Badge */}
                        {project.has_buyer && (
                          <div className="mt-2 pt-2 border-t border-slate-200/60">
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold border border-green-200">
                              ✓ Käufer
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

