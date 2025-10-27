'use client'

import { useEffect, useState } from 'react'
import { getProjectStatusHistory } from '@/lib/actions'
import { ProjectStatusHistory } from '@/lib/supabase'

interface StatusHistoryProps {
  projectId: string
}

export default function StatusHistory({ projectId }: StatusHistoryProps) {
  const [history, setHistory] = useState<ProjectStatusHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [projectId])

  const loadHistory = async () => {
    try {
      const data = await getProjectStatusHistory(projectId)
      setHistory(data)
    } catch (error) {
      console.error('Error loading status history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status?: string) => {
    const labels = {
      lead: 'Lead',
      offer_submitted: 'Angebot abgegeben',
      negotiation: 'Verhandlung',
      offer_accepted: 'Angebot angenommen',
      closed: 'Gewonnen'
    }
    return status ? labels[status as keyof typeof labels] || status : 'Ursprünglich'
  }

  const getStatusColor = (status?: string) => {
    const colors = {
      lead: 'bg-blue/10 text-blue border-blue',
      offer_submitted: 'bg-gold/10 text-gold border-gold',
      negotiation: 'bg-brand/10 text-brand border-brand',
      offer_accepted: 'bg-green-500/10 text-green-600 border-green-500',
      closed: 'bg-gold/10 text-gold border-gold'
    }
    return status ? colors[status as keyof typeof colors] || 'bg-ink/10 text-ink border-ink/20' : 'bg-gray-100 text-gray-700 border-gray-300'
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-ink/10 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-ink/5 rounded"></div>
            <div className="h-16 bg-ink/5 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-bold text-ink mb-4 font-display flex items-center">
          <svg className="h-5 w-5 text-blue mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Status-Verlauf
        </h3>
        <div className="text-center py-8">
          <svg className="h-12 w-12 text-ink-soft mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-ink-soft">Noch keine Status-Änderungen erfasst</p>
          <p className="text-sm text-ink-soft mt-1">Änderungen werden automatisch dokumentiert</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-bold text-ink mb-6 font-display flex items-center">
        <svg className="h-5 w-5 text-blue mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Status-Verlauf ({history.length})
      </h3>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-ink/10"></div>

        <div className="space-y-4">
          {history.map((entry, index) => {
            const isLast = index === history.length - 1

            return (
              <div key={entry.id} className="relative flex items-start space-x-4 pl-2">
                {/* Timeline Dot */}
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  isLast 
                    ? 'bg-blue border-blue' 
                    : 'bg-white border-ink/20'
                } z-10`}>
                  {isLast && (
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="bg-white border border-ink/10 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {entry.old_status && (
                            <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(entry.old_status)}`}>
                              {getStatusLabel(entry.old_status)}
                            </span>
                          )}
                          <svg className="h-4 w-4 text-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(entry.new_status)}`}>
                            {getStatusLabel(entry.new_status)}
                          </span>
                        </div>
                        
                        {entry.notes && (
                          <p className="text-sm text-ink-soft">{entry.notes}</p>
                        )}
                      </div>
                      
                      <div className="text-right ml-4">
                        <p className="text-sm font-semibold text-ink">
                          {new Date(entry.changed_at).toLocaleDateString('de-DE')}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {new Date(entry.changed_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {entry.changed_by && (
                      <div className="text-xs text-ink-soft">
                        Geändert von: {entry.changed_by}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

