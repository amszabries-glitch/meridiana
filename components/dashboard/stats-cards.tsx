'use client'

import { DashboardStats } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, Target, Users, Activity } from 'lucide-react'

interface StatsCardsProps {
  stats: DashboardStats | null
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: 'Pipeline Wert',
      value: formatCurrency(stats.pipelineValue),
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-meridiana-600',
      bgColor: 'bg-meridiana-50',
    },
    {
      title: 'Aktive Deals',
      value: stats.activeDeals.toString(),
      change: '+3',
      trend: 'up',
      icon: Activity,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      title: 'Gewinnrate',
      value: `${stats.winRate}%`,
      change: '+5.2%',
      trend: 'up',
      icon: Target,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      title: 'Durchschnittlicher Deal',
      value: formatCurrency(stats.averageDealSize),
      change: '+8.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-danger-600',
      bgColor: 'bg-danger-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div className="flex items-center space-x-1">
              {card.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-success-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-danger-600" />
              )}
              <span className={`text-sm font-medium ${
                card.trend === 'up' ? 'text-success-600' : 'text-danger-600'
              }`}>
                {card.change}
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
