'use client'

import { Project } from '@/lib/supabase'
import { formatCurrency, calculateProjectROI } from '@/lib/analytics'

interface ProjectTimelineProps {
  projects: Project[]
}

export default function ProjectTimeline({ projects }: ProjectTimelineProps) {
  const sortedProjects = [...projects].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'lead':
        return (
          <div className="w-8 h-8 bg-blue rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      case 'offer_submitted':
        return (
          <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )
      case 'negotiation':
        return (
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        )
      case 'offer_accepted':
        return (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      case 'closed':
        return (
          <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 bg-ink/20 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
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

  const getStatusColor = (status: string) => {
    const colors = {
      lead: 'border-blue',
      offer_submitted: 'border-gold',
      negotiation: 'border-brand',
      offer_accepted: 'border-green-500',
      closed: 'border-gold'
    }
    return colors[status as keyof typeof colors] || 'border-ink/20'
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-bold text-ink mb-6 font-display">Projekt-Timeline</h3>
      
      <div className="space-y-6">
        {sortedProjects.map((project, index) => {
          const roi = calculateProjectROI(project)
          const isLast = index === sortedProjects.length - 1
          
          return (
            <div key={project.id} className="relative">
              {/* Timeline Line */}
              {!isLast && (
                <div className="absolute left-4 top-12 w-0.5 h-16 bg-ink/10"></div>
              )}
              
              <div className="flex items-start space-x-4">
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {getStatusIcon(project.status)}
                </div>
                
                {/* Project Content */}
                <div className="flex-1 min-w-0">
                  <div className={`p-4 rounded-xl border-2 ${getStatusColor(project.status)} bg-white hover:shadow-lg transition-all duration-200`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-ink text-lg mb-1">{project.name}</h4>
                        <p className="text-sm text-ink-soft mb-2">{project.company_name}</p>
                        <p className="text-sm text-ink-soft">{project.next_steps}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-ink font-display">
                          {formatCurrency(project.selling_price || 0)}
                        </p>
                        <p className="text-sm text-ink-soft">
                          ROI: {roi > 0 ? '+' : ''}{roi.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          project.status === 'lead' ? 'bg-blue/10 text-blue' :
                          project.status === 'offer_submitted' ? 'bg-gold/10 text-gold' :
                          project.status === 'negotiation' ? 'bg-brand/10 text-brand' :
                          project.status === 'offer_accepted' ? 'bg-green-500/10 text-green-600' :
                          'bg-gold/10 text-gold'
                        }`}>
                          {getStatusLabel(project.status)}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            project.has_buyer ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {project.has_buyer ? 'Käufer' : 'Kein Käufer'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            project.has_down_payment ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {project.has_down_payment ? 'Anzahlung' : 'Keine Anzahlung'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-ink-soft">
                          {new Date(project.created_at).toLocaleDateString('de-DE')}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {project.timeline}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-ink/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue to-brand h-2 rounded-full transition-all duration-700"
                          style={{ width: `${project.probability}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-ink-soft mt-1">
                        Wahrscheinlichkeit: {project.probability}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
