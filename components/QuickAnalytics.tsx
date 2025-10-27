'use client'

import { ProjectAnalytics } from '@/lib/analytics'
import { formatCurrency, formatPercentage } from '@/lib/analytics'

interface QuickAnalyticsProps {
  analytics: ProjectAnalytics
}

export default function QuickAnalytics({ analytics }: QuickAnalyticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* ROI Performance */}
      <div className="card p-6 hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue/15 to-blue/25 group-hover:from-blue/25 group-hover:to-blue/35 transition-all duration-300">
            <svg className="h-6 w-6 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="h-4 w-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-sm font-semibold text-gold">
              {analytics.totalROI > 0 ? '+' : ''}{formatPercentage(analytics.totalROI)}
            </span>
          </div>
        </div>
        <h3 className="text-sm font-medium text-ink-soft mb-1">Gesamt-ROI</h3>
        <p className="text-3xl font-bold text-ink mb-2 font-display">
          {formatPercentage(analytics.totalROI)}
        </p>
        <p className="text-xs text-ink-soft">Investition: {formatCurrency(analytics.totalInvestment)}</p>
      </div>

      {/* Pipeline Value */}
      <div className="card p-6 hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-gold/15 to-gold/25 group-hover:from-gold/25 group-hover:to-gold/35 transition-all duration-300">
            <svg className="h-6 w-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="h-4 w-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-sm font-semibold text-gold">
              {formatCurrency(analytics.totalValue)}
            </span>
          </div>
        </div>
        <h3 className="text-sm font-medium text-ink-soft mb-1">Pipeline-Wert</h3>
        <p className="text-3xl font-bold text-ink mb-2 font-display">
          {formatCurrency(analytics.totalValue)}
        </p>
        <p className="text-xs text-ink-soft">Aktive Projekte: {analytics.activeProjects}</p>
      </div>

      {/* Win Rate */}
      <div className="card p-6 hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-brand/15 to-brand/25 group-hover:from-brand/25 group-hover:to-brand/35 transition-all duration-300">
            <svg className="h-6 w-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="h-4 w-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-sm font-semibold text-gold">
              {formatPercentage(analytics.winRate)}
            </span>
          </div>
        </div>
        <h3 className="text-sm font-medium text-ink-soft mb-1">Gewinnrate</h3>
        <p className="text-3xl font-bold text-ink mb-2 font-display">
          {formatPercentage(analytics.winRate)}
        </p>
        <p className="text-xs text-ink-soft">Abgeschlossen: {analytics.closedProjects}</p>
      </div>

      {/* Average Project Value */}
      <div className="card p-6 hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-ink/15 to-ink/25 group-hover:from-ink/25 group-hover:to-ink/35 transition-all duration-300">
            <svg className="h-6 w-6 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="h-4 w-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-sm font-semibold text-gold">
              {formatCurrency(analytics.avgProjectValue)}
            </span>
          </div>
        </div>
        <h3 className="text-sm font-medium text-ink-soft mb-1">Ø Projekt-Wert</h3>
        <p className="text-3xl font-bold text-ink mb-2 font-display">
          {formatCurrency(analytics.avgProjectValue)}
        </p>
        <p className="text-xs text-ink-soft">Durchschnittlicher Wert</p>
      </div>
    </div>
  )
}
