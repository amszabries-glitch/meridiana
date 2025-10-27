'use client'

import { ProjectAnalytics } from '@/lib/analytics'
import { formatCurrency, formatPercentage } from '@/lib/analytics'

interface AnalyticsWidgetsProps {
  analytics: ProjectAnalytics
}

export default function AnalyticsWidgets({ analytics }: AnalyticsWidgetsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ROI Overview */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-ink mb-6 font-display">ROI Übersicht</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue/5 to-brand/5 rounded-xl">
            <div>
              <p className="text-sm text-ink-soft font-medium">Gesamt-ROI</p>
              <p className="text-2xl font-bold text-ink font-display">
                {formatPercentage(analytics.totalROI)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-ink-soft">Investition</p>
              <p className="text-lg font-semibold text-ink">
                {formatCurrency(analytics.totalInvestment)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-ink/5 rounded-xl">
              <p className="text-sm text-ink-soft font-medium">Durchschnitts-ROI</p>
              <p className="text-xl font-bold text-ink font-display">
                {formatPercentage(analytics.avgROI)}
              </p>
            </div>
            <div className="p-4 bg-ink/5 rounded-xl">
              <p className="text-sm text-ink-soft font-medium">Pipeline-Wert</p>
              <p className="text-xl font-bold text-ink font-display">
                {formatCurrency(analytics.totalValue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-ink mb-6 font-display">Performance-Metriken</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gold/5 to-brand/5 rounded-xl">
            <div>
              <p className="text-sm text-ink-soft font-medium">Gewinnrate</p>
              <p className="text-2xl font-bold text-ink font-display">
                {formatPercentage(analytics.winRate)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-ink-soft">Abgeschlossen</p>
              <p className="text-lg font-semibold text-ink">
                {analytics.closedProjects}/{analytics.closedProjects + analytics.activeProjects}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-ink/5 rounded-xl">
              <p className="text-sm text-ink-soft font-medium">Ø Projekt-Wert</p>
              <p className="text-xl font-bold text-ink font-display">
                {formatCurrency(analytics.avgProjectValue)}
              </p>
            </div>
            <div className="p-4 bg-ink/5 rounded-xl">
              <p className="text-sm text-ink-soft font-medium">Ø Investition</p>
              <p className="text-xl font-bold text-ink font-display">
                {formatCurrency(analytics.avgProjectInvestment)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-ink/5 rounded-xl">
              <p className="text-sm text-ink-soft font-medium">Ø Bearbeitungszeit</p>
              <p className="text-xl font-bold text-ink font-display">
                {Math.round(analytics.avgProcessingTime)} Tage
              </p>
            </div>
            <div className="p-4 bg-ink/5 rounded-xl">
              <p className="text-sm text-ink-soft font-medium">Aktive Projekte</p>
              <p className="text-xl font-bold text-ink font-display">
                {analytics.activeProjects}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-ink mb-6 font-display">Status-Verteilung</h3>
        
        <div className="space-y-4">
          {Object.entries(analytics.statusDistribution).map(([status, count]) => {
            const percentage = analytics.activeProjects + analytics.closedProjects > 0 
              ? (count / (analytics.activeProjects + analytics.closedProjects)) * 100 
              : 0
            
            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'lead' ? 'bg-blue' :
                    status === 'offer_submitted' ? 'bg-gold' :
                    status === 'negotiation' ? 'bg-brand' :
                    status === 'offer_accepted' ? 'bg-green-500' :
                    'bg-gold'
                  }`}></div>
                  <span className="text-sm font-medium text-ink capitalize">
                    {status === 'offer_submitted' ? 'Angebot abgegeben' :
                     status === 'offer_accepted' ? 'Angebot angenommen' :
                     status === 'closed' ? 'Gewonnen' :
                     status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-ink">{count}</span>
                  <span className="text-xs text-ink-soft ml-2">
                    ({formatPercentage(percentage)})
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Value by Status */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-ink mb-6 font-display">Wert nach Status</h3>
        
        <div className="space-y-4">
          {Object.entries(analytics.valueByStatus)
            .sort(([,a], [,b]) => b - a)
            .map(([status, value]) => (
              <div key={status} className="flex items-center justify-between p-3 bg-ink/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'lead' ? 'bg-blue' :
                    status === 'offer_submitted' ? 'bg-gold' :
                    status === 'negotiation' ? 'bg-brand' :
                    status === 'offer_accepted' ? 'bg-green-500' :
                    'bg-gold'
                  }`}></div>
                  <span className="text-sm font-medium text-ink capitalize">
                    {status === 'offer_submitted' ? 'Angebot abgegeben' :
                     status === 'offer_accepted' ? 'Angebot angenommen' :
                     status === 'closed' ? 'Gewonnen' :
                     status}
                  </span>
                </div>
                <span className="text-sm font-semibold text-ink">
                  {formatCurrency(value)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
