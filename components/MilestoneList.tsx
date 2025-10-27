'use client'

import { useState, useEffect } from 'react'
import { getMilestonesByProject, deleteMilestone, updateMilestone } from '@/lib/actions'
import { Milestone } from '@/lib/supabase'

interface MilestoneListProps {
  projectId: string
}

export default function MilestoneList({ projectId }: MilestoneListProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMilestones()
  }, [projectId])

  const loadMilestones = async () => {
    try {
      const data = await getMilestonesByProject(projectId)
      setMilestones(data)
    } catch (error) {
      console.error('Error loading milestones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (milestone: Milestone) => {
    try {
      const newStatus = milestone.status === 'completed' ? 'pending' : 'completed'
      await updateMilestone(milestone.id, { 
        status: newStatus,
        project_id: projectId 
      })
      await loadMilestones()
    } catch (error) {
      console.error('Error updating milestone:', error)
      alert('Fehler beim Aktualisieren des Meilensteins')
    }
  }

  const handleDelete = async (milestone: Milestone) => {
    if (!confirm(`Sind Sie sicher, dass Sie "${milestone.name}" löschen möchten?`)) {
      return
    }

    try {
      await deleteMilestone(milestone.id, projectId)
      await loadMilestones()
    } catch (error) {
      console.error('Error deleting milestone:', error)
      alert('Fehler beim Löschen des Meilensteins')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'in_progress':
        return (
          <svg className="h-5 w-5 text-blue" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
      case 'overdue':
        return (
          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="h-5 w-5 text-ink-soft" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-blue-100 text-blue-800 border-blue-300',
      low: 'bg-gray-100 text-gray-800 border-gray-300'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const isOverdue = (milestone: Milestone) => {
    if (milestone.status === 'completed') return false
    if (!milestone.target_date) return false
    return new Date(milestone.target_date) < new Date()
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-ink/5 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-ink font-display flex items-center">
          <svg className="h-5 w-5 text-brand mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          Meilensteine ({milestones.length})
        </h3>
      </div>

      {milestones.length === 0 ? (
        <div className="text-center py-12">
          <svg className="h-12 w-12 text-ink-soft mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <p className="text-ink-soft mb-4">Noch keine Meilensteine definiert</p>
        </div>
      ) : (
        <div className="space-y-3">
          {milestones.map((milestone) => {
            const overdue = isOverdue(milestone)
            const status = overdue ? 'overdue' : milestone.status

            return (
              <div
                key={milestone.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  milestone.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : overdue
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-ink/10 hover:border-ink/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => handleToggleStatus(milestone)}
                      className="flex-shrink-0 mt-1"
                    >
                      {getStatusIcon(status)}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-semibold ${
                          milestone.status === 'completed' ? 'text-ink line-through' : 'text-ink'
                        }`}>
                          {milestone.name}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getPriorityColor(milestone.priority)}`}>
                          {milestone.priority.toUpperCase()}
                        </span>
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-ink-soft mb-2">{milestone.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-ink-soft">
                        <span>Ziel: {formatDate(milestone.target_date)}</span>
                        {milestone.completed_date && (
                          <span>Abgeschlossen: {formatDate(milestone.completed_date)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(milestone)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

