'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { Deal, FilterOptions } from '@/types'

export function useDeals(filters?: FilterOptions) {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Demo mode - load demo deals
    const demoDeals: Deal[] = [
      {
        id: '1',
        title: 'TechCorp IPO Beratung',
        description: 'Beratung für den Börsengang von TechCorp',
        status: 'negotiation',
        priority: 'high',
        value: 500000,
        currency: 'EUR',
        probability: 75,
        expected_close_date: '2024-03-15',
        actual_close_date: null,
        source: 'Website',
        assigned_to: null,
        created_by: 'demo-user',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T14:30:00Z'
      },
      {
        id: '2',
        title: 'FinanceGroup M&A',
        description: 'Merger & Acquisition Beratung',
        status: 'proposal',
        priority: 'critical',
        value: 750000,
        currency: 'EUR',
        probability: 60,
        expected_close_date: '2024-04-01',
        actual_close_date: null,
        source: 'Referral',
        assigned_to: null,
        created_by: 'demo-user',
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-01-18T16:45:00Z'
      },
      {
        id: '3',
        title: 'StartupXYZ Seed Funding',
        description: 'Seed-Finanzierung für StartupXYZ',
        status: 'qualified',
        priority: 'medium',
        value: 250000,
        currency: 'EUR',
        probability: 40,
        expected_close_date: '2024-02-28',
        actual_close_date: null,
        source: 'LinkedIn',
        assigned_to: null,
        created_by: 'demo-user',
        created_at: '2024-01-05T11:30:00Z',
        updated_at: '2024-01-15T13:20:00Z'
      }
    ]
    
    setDeals(demoDeals)
    setLoading(false)
  }, [filters])

  const fetchDeals = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('deals')
        .select(`
          *,
          contacts:deal_contacts(
            contact:contacts(*)
          ),
          activities(*)
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }

      if (filters?.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority)
      }

      if (filters?.assigned_to && filters.assigned_to.length > 0) {
        query = query.in('assigned_to', filters.assigned_to)
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters?.date_range) {
        query = query
          .gte('created_at', filters.date_range.start)
          .lte('created_at', filters.date_range.end)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setDeals(data || [])
    } catch (err) {
      console.error('Error fetching deals:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createDeal = async (dealData: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .insert(dealData)
        .select()
        .single()

      if (error) throw error

      setDeals(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error creating deal:', err)
      setError(err instanceof Error ? err.message : 'Failed to create deal')
      throw err
    }
  }

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setDeals(prev => prev.map(deal => deal.id === id ? data : deal))
      return data
    } catch (err) {
      console.error('Error updating deal:', err)
      setError(err instanceof Error ? err.message : 'Failed to update deal')
      throw err
    }
  }

  const deleteDeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id)

      if (error) throw error

      setDeals(prev => prev.filter(deal => deal.id !== id))
    } catch (err) {
      console.error('Error deleting deal:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete deal')
      throw err
    }
  }

  return {
    deals,
    loading,
    error,
    fetchDeals,
    createDeal,
    updateDeal,
    deleteDeal
  }
}
