'use client'

import { Deal } from '@/types'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { useDeals } from '@/hooks/useDeals'
import { useDashboard } from '@/hooks/useDashboard'
import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function RecentDeals() {
  const { deals, loading } = useDeals()
  const { getStatusColor, getStatusLabel } = useDashboard()
  const router = useRouter()

  const recentDeals = deals.slice(0, 5)

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Neueste Deals</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Neueste Deals</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/deals')}
        >
          Alle anzeigen
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {recentDeals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-500 mb-4">Noch keine Deals vorhanden</p>
          <Button 
            variant="premium" 
            size="sm"
            onClick={() => router.push('/deals/new')}
          >
            Ersten Deal erstellen
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {recentDeals.map((deal) => (
            <div 
              key={deal.id}
              className="p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer"
              onClick={() => router.push(`/deals/${deal.id}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-slate-900 truncate">{deal.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-900">
                    {formatCurrency(deal.value, deal.currency)}
                  </span>
                  {deal.probability > 50 ? (
                    <TrendingUp className="h-4 w-4 text-success-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-danger-600" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getStatusColor(deal.status) }}
                  ></div>
                  <span className="text-sm text-slate-600">{getStatusLabel(deal.status)}</span>
                </div>
                <span className="text-xs text-slate-500">
                  {formatRelativeTime(deal.created_at)}
                </span>
              </div>
              
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Wahrscheinlichkeit</span>
                  <span>{deal.probability}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-meridiana-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${deal.probability}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
