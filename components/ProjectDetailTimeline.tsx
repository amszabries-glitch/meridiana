'use client'

import { Project } from '@/lib/supabase'

interface ProjectDetailTimelineProps {
  project: Project
}

export default function ProjectDetailTimeline({ project }: ProjectDetailTimelineProps) {
  
  const getStatusInfo = (status: string) => {
    const statusData = {
      lead: {
        label: 'Lead',
        icon: (
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'bg-blue border-blue',
        description: 'Projekt wurde als Lead erfasst'
      },
      offer_submitted: {
        label: 'Angebot abgegeben',
        icon: (
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        color: 'bg-gold border-gold',
        description: 'Offizielles Angebot wurde eingereicht'
      },
      negotiation: {
        label: 'Verhandlung',
        icon: (
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ),
        color: 'bg-brand border-brand',
        description: 'Aktive Verhandlungsphase'
      },
      offer_accepted: {
        label: 'Angebot angenommen',
        icon: (
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'bg-green-500 border-green-500',
        description: 'Angebot wurde akzeptiert'
      },
      contract_finalized: {
        label: 'Kaufvertrag/Insolvenzplan fertiggestellt',
        icon: (
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m4-4H8m12 0a8 8 0 11-16 0 8 8 0 0116 0z" />
          </svg>
        ),
        color: 'bg-indigo-500 border-indigo-500',
        description: 'Vertrag und Insolvenzplan fertiggestellt'
      },
      creditors_meeting: {
        label: 'Gläubigerversammlung durchgeführt',
        icon: (
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h8m-8 4h6M5 6h14v12H5z" />
          </svg>
        ),
        color: 'bg-amber-500 border-amber-500',
        description: 'Gläubigerversammlung erfolgreich durchgeführt'
      },
      closed: {
        label: 'Aktien ausgeliefert (abgeschlossen)',
        icon: (
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        color: 'bg-gold border-gold',
        description: 'Aktien ausgeliefert und Projekt abgeschlossen'
      }
    }
    return statusData[status as keyof typeof statusData] || statusData.lead
  }

  const getStatusOrder = (status: string): number => {
    const order = {
      lead: 0,
      offer_submitted: 1,
      negotiation: 2,
      offer_accepted: 3,
      contract_finalized: 4,
      creditors_meeting: 5,
      closed: 6
    }
    return order[status as keyof typeof order] || 0
  }

  const currentStatusInfo = getStatusInfo(project.status)
  const currentStatusOrder = getStatusOrder(project.status)

  const allStatuses = ['lead', 'offer_submitted', 'negotiation', 'offer_accepted', 'contract_finalized', 'creditors_meeting', 'closed'] as const

  return (
    <div className="md:flex md:flex-col md:min-h-0">
      <div className="relative pr-2">
        {/* Timeline Line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-ink/10"></div>

        <div className="space-y-6">
          {allStatuses.map((status, index) => {
            const statusInfo = getStatusInfo(status)
            const statusOrder = getStatusOrder(status)
            const isCompleted = statusOrder <= currentStatusOrder
            const isCurrent = status === project.status

            return (
              <div key={status} className="relative flex items-start space-x-4">
                {/* Timeline Dot */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  isCompleted 
                    ? statusInfo.color 
                    : 'bg-white border-ink/20'
                } z-10`}>
                  {isCompleted ? statusInfo.icon : (
                    <svg className="h-4 w-4 text-ink/40" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 pb-6 ${
                  isCurrent 
                    ? 'bg-gradient-to-r from-blue/5 to-transparent rounded-lg p-4 border-l-4 border-blue' 
                    : ''
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold text-base ${
                        isCompleted ? 'text-ink' : 'text-ink-soft'
                      }`}>
                        {statusInfo.label}
                      </h4>
                      <p className="text-sm text-ink-soft mt-1">
                        {statusInfo.description}
                      </p>
                      
                      {isCurrent && (
                        <div className="mt-3 p-2 bg-blue/10 rounded-lg">
                          <p className="text-xs text-blue font-medium">
                            Aktueller Status • {new Date(project.updated_at || project.created_at).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {isCompleted && (
                      <div className="ml-4 text-right">
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="mt-6 p-4 bg-gradient-to-br from-blue/5 to-brand/5 rounded-xl border border-blue/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-ink">Pipeline-Fortschritt</span>
          <span className="text-lg font-bold text-blue">{Math.round((currentStatusOrder / 6) * 100)}%</span>
        </div>
        <div className="w-full bg-ink/10 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-blue via-brand to-gold h-3 rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${(currentStatusOrder / 6) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-ink-soft mt-2">
          {currentStatusOrder + 1} von 7 Phasen abgeschlossen
        </p>
      </div>
    </div>
  )
}

