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
  closed: {
    title: 'Gewonnen',
    color: 'text-gold',
    bgColor: 'bg-gold/20 border-gold/30',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
  }
}

const STATUS_ORDER = ['lead', 'offer_submitted', 'negotiation', 'offer_accepted', 'closed']

export default function PipelineBoard({ projects, onProjectUpdate }: PipelineBoardProps) {
  const [draggedProject, setDraggedProject] = useState<Project | null>(null)
  const [targetStatus, setTargetStatus] = useState<string | null>(null)

  const projectsByStatus = useMemo(() => {
    const grouped: Record<string, Project[]> = {
      lead: [],
      offer_submitted: [],
      negotiation: [],
      offer_accepted: [],
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
      negotiation: 50,      // 50% - Aktiv in Verhandlung
      offer_accepted: 80,   // 80% - Angebot akzeptiert, fast am Ziel
      closed: 100           // 100% - Erfolgreich abgeschlossen
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
        `Status changed via Pipeline Board. Probability updated from ${draggedProject.probability}% to ${newProbability}%`
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-ink font-display">Pipeline Board</h2>
        <p className="text-sm text-ink-soft">
          {projects.length} {projects.length === 1 ? 'Projekt' : 'Projekte'} gesamt
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATUS_ORDER.map(status => {
          const config = STATUS_CONFIG[status]
          const statusProjects = projectsByStatus[status]

          return (
            <div
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
              className={`card p-4 h-full min-h-[400px] transition-all duration-300 ${
                targetStatus === status ? 'ring-2 ring-blue ring-offset-2 scale-105' : ''
              } ${config.bgColor} border-2`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <svg className={`h-5 w-5 ${config.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                  </svg>
                  <h3 className="font-semibold text-ink">{config.title}</h3>
                </div>
                <span className="px-2 py-1 bg-white/50 text-ink text-xs font-bold rounded-full">
                  {statusProjects.length}
                </span>
              </div>

              {/* Total Value */}
              <div className="mb-4 pb-4 border-b border-ink/10">
                <p className="text-xs text-ink-soft font-medium mb-1">Pipeline-Wert</p>
                <p className="text-lg font-bold text-ink">
                  {formatCurrency(getTotalValue(status))}
                </p>
              </div>

              {/* Projects */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {statusProjects.map(project => (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={() => handleDragStart(project)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-lg p-3 cursor-move hover:shadow-lg transition-all border ${
                      draggedProject?.id === project.id ? 'opacity-50 scale-95' : 'border-ink/10'
                    }`}
                  >
                    <h4 className="font-semibold text-ink text-sm mb-1">{project.name}</h4>
                    <p className="text-xs text-ink-soft mb-2">{project.company_name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-blue">
                        {formatCurrency(project.selling_price || 0)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded font-bold ${
                        project.probability >= 80 ? 'bg-green-500/20 text-green-700' :
                        project.probability >= 50 ? 'bg-blue-500/20 text-blue-700' :
                        project.probability >= 20 ? 'bg-gold/20 text-gold' :
                        'bg-gray-500/20 text-gray-700'
                      }`}>
                        {project.probability}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

