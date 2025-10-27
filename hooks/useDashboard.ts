'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { DashboardStats, PipelineData } from '@/types'

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pipeline, setPipeline] = useState<PipelineData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Demo mode - load demo data
    const demoStats: DashboardStats = {
      totalDeals: 24,
      activeDeals: 18,
      closedWon: 12,
      closedLost: 6,
      totalValue: 2500000,
      averageDealSize: 208333,
      winRate: 66.7,
      pipelineValue: 1800000
    }
    
    const demoPipeline: PipelineData[] = [
      { status: 'lead', count: 5, value: 500000, deals: [] },
      { status: 'qualified', count: 4, value: 400000, deals: [] },
      { status: 'proposal', count: 3, value: 300000, deals: [] },
      { status: 'negotiation', count: 2, value: 200000, deals: [] },
      { status: 'closed_won', count: 12, value: 1200000, deals: [] }
    ]
    
    setStats(demoStats)
    setPipeline(demoPipeline)
    setLoading(false)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch dashboard stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_dashboard_stats')

      if (statsError) throw statsError

      setStats(statsData)

      // Fetch pipeline data
      const { data: pipelineData, error: pipelineError } = await supabase
        .from('deals')
        .select('status, value')
        .neq('status', 'closed_lost')

      if (pipelineError) throw pipelineError

      // Group by status
      const pipelineMap = new Map<string, PipelineData>()
      
      pipelineData?.forEach(deal => {
        const existing = pipelineMap.get(deal.status) || {
          status: deal.status,
          count: 0,
          value: 0,
          deals: []
        }
        
        existing.count += 1
        existing.value += deal.value
        pipelineMap.set(deal.status, existing)
      })

      setPipeline(Array.from(pipelineMap.values()))
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      lead: '#3b82f6',
      qualified: '#8b5cf6',
      proposal: '#f59e0b',
      negotiation: '#ef4444',
      closed_won: '#10b981',
      closed_lost: '#6b7280'
    }
    return colors[status as keyof typeof colors] || '#6b7280'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      lead: 'Lead',
      qualified: 'Qualifiziert',
      proposal: 'Angebot',
      negotiation: 'Verhandlung',
      closed_won: 'Gewonnen',
      closed_lost: 'Verloren'
    }
    return labels[status as keyof typeof labels] || status
  }

  return {
    stats,
    pipeline,
    loading,
    error,
    fetchDashboardData,
    getStatusColor,
    getStatusLabel
  }
}
