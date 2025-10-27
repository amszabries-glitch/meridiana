'use client'

import { useState, useMemo, useEffect } from 'react'
import { Project } from '@/lib/supabase'

interface AdvancedFiltersProps {
  projects: Project[]
  onFilteredProjects: (projects: Project[]) => void
}

export default function AdvancedFilters({ projects, onFilteredProjects }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    hasBuyer: 'all',
    hasDownPayment: 'all',
    minValue: '',
    maxValue: '',
    minROI: '',
    maxROI: '',
    dateRange: 'all',
    dateFrom: '',
    dateTo: '',
    dateField: 'created_at', // created_at or updated_at
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  // Memoized filtered and sorted projects
  const filteredProjects = useMemo(() => {
    let filtered = [...projects]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchLower) ||
        project.company_name.toLowerCase().includes(searchLower) ||
        project.next_steps?.toLowerCase().includes(searchLower) ||
        project.timeline?.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(project => project.status === filters.status)
    }

    // Buyer filter
    if (filters.hasBuyer !== 'all') {
      const hasBuyer = filters.hasBuyer === 'true'
      filtered = filtered.filter(project => project.has_buyer === hasBuyer)
    }

    // Down payment filter
    if (filters.hasDownPayment !== 'all') {
      const hasDownPayment = filters.hasDownPayment === 'true'
      filtered = filtered.filter(project => project.has_down_payment === hasDownPayment)
    }

    // Value range filter
    if (filters.minValue) {
      const minValue = parseFloat(filters.minValue)
      filtered = filtered.filter(project => (project.selling_price || 0) >= minValue)
    }
    if (filters.maxValue) {
      const maxValue = parseFloat(filters.maxValue)
      filtered = filtered.filter(project => (project.selling_price || 0) <= maxValue)
    }

    // ROI range filter
    if (filters.minROI) {
      const minROI = parseFloat(filters.minROI)
      filtered = filtered.filter(project => {
        const roi = project.purchase_price && project.purchase_price > 0 
          ? ((project.selling_price || 0) - project.purchase_price) / project.purchase_price * 100 
          : 0
        return roi >= minROI
      })
    }
    if (filters.maxROI) {
      const maxROI = parseFloat(filters.maxROI)
      filtered = filtered.filter(project => {
        const roi = project.purchase_price && project.purchase_price > 0 
          ? ((project.selling_price || 0) - project.purchase_price) / project.purchase_price * 100 
          : 0
        return roi <= maxROI
      })
    }

    // Date range filter (Predefined)
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const daysAgo = filters.dateRange === '7' ? 7 : 
                     filters.dateRange === '30' ? 30 : 
                     filters.dateRange === '90' ? 90 : 0
      
      if (daysAgo > 0) {
        const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
        const dateField = filters.dateField === 'updated_at' ? 'updated_at' : 'created_at'
        filtered = filtered.filter(project => new Date(project[dateField] || project.created_at) >= cutoffDate)
      }
    }

    // Custom date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      const dateField = filters.dateField === 'updated_at' ? 'updated_at' : 'created_at'
      filtered = filtered.filter(project => new Date(project[dateField] || project.created_at) >= fromDate)
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999) // End of day
      const dateField = filters.dateField === 'updated_at' ? 'updated_at' : 'created_at'
      filtered = filtered.filter(project => new Date(project[dateField] || project.created_at) <= toDate)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'selling_price':
          aValue = a.selling_price || 0
          bValue = b.selling_price || 0
          break
        case 'probability':
          aValue = a.probability || 0
          bValue = b.probability || 0
          break
        case 'roi':
          aValue = a.purchase_price && a.purchase_price > 0 
            ? ((a.selling_price || 0) - a.purchase_price) / a.purchase_price * 100 
            : 0
          bValue = b.purchase_price && b.purchase_price > 0 
            ? ((b.selling_price || 0) - b.purchase_price) / b.purchase_price * 100 
            : 0
          break
        case 'created_at':
        default:
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [projects, filters])

  // Update filtered projects when filters change
  useEffect(() => {
    onFilteredProjects(filteredProjects)
  }, [filteredProjects])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      hasBuyer: 'all',
      hasDownPayment: 'all',
      minValue: '',
      maxValue: '',
      minROI: '',
      maxROI: '',
      dateRange: 'all',
      dateFrom: '',
      dateTo: '',
      dateField: 'created_at',
      sortBy: 'created_at',
      sortOrder: 'desc'
    })
  }

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== 'all' && value !== 'created_at' && value !== 'desc' && value !== ''
  ).length

  return (
    <div className="bg-white rounded-xl border border-ink/10 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-ink font-display">Erweiterte Filter</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 bg-blue/10 text-blue text-xs font-semibold rounded-full">
              {activeFiltersCount} Filter aktiv
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-ink-soft hover:text-ink transition-colors"
          >
            {showAdvanced ? 'Weniger anzeigen' : 'Mehr Filter'}
          </button>
          <button
            onClick={clearAllFilters}
            className="text-sm text-ink-soft hover:text-ink transition-colors"
          >
            Alle zurücksetzen
          </button>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Suche</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Projekt, Unternehmen, Schritte..."
            className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
          >
            <option value="all">Alle Status</option>
            <option value="lead">Lead</option>
            <option value="offer_submitted">Angebot abgegeben</option>
            <option value="negotiation">Verhandlung</option>
            <option value="offer_accepted">Angebot angenommen</option>
            <option value="closed">Gewonnen</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Käufer</label>
          <select
            value={filters.hasBuyer}
            onChange={(e) => handleFilterChange('hasBuyer', e.target.value)}
            className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
          >
            <option value="all">Alle</option>
            <option value="true">Mit Käufer</option>
            <option value="false">Ohne Käufer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Sortieren nach</label>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              handleFilterChange('sortBy', field)
              handleFilterChange('sortOrder', order)
            }}
            className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
          >
            <option value="created_at-desc">Neueste zuerst</option>
            <option value="created_at-asc">Älteste zuerst</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="selling_price-desc">Höchster Preis</option>
            <option value="selling_price-asc">Niedrigster Preis</option>
            <option value="probability-desc">Höchste Wahrscheinlichkeit</option>
            <option value="probability-asc">Niedrigste Wahrscheinlichkeit</option>
            <option value="roi-desc">Höchster ROI</option>
            <option value="roi-asc">Niedrigster ROI</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-ink/10">
          <h4 className="text-sm font-semibold text-ink mb-4">Erweiterte Filter</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Min. Wert (€)</label>
              <input
                type="number"
                value={filters.minValue}
                onChange={(e) => handleFilterChange('minValue', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Max. Wert (€)</label>
              <input
                type="number"
                value={filters.maxValue}
                onChange={(e) => handleFilterChange('maxValue', e.target.value)}
                placeholder="10000000"
                className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Min. ROI (%)</label>
              <input
                type="number"
                value={filters.minROI}
                onChange={(e) => handleFilterChange('minROI', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Max. ROI (%)</label>
              <input
                type="number"
                value={filters.maxROI}
                onChange={(e) => handleFilterChange('maxROI', e.target.value)}
                placeholder="1000"
                className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Anzahlung</label>
              <select
                value={filters.hasDownPayment}
                onChange={(e) => handleFilterChange('hasDownPayment', e.target.value)}
                className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
              >
                <option value="all">Alle</option>
                <option value="true">Mit Anzahlung</option>
                <option value="false">Ohne Anzahlung</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Zeitraum</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
              >
                <option value="all">Alle Zeit</option>
                <option value="7">Letzte 7 Tage</option>
                <option value="30">Letzte 30 Tage</option>
                <option value="90">Letzte 90 Tage</option>
                <option value="custom">Benutzerdefiniert</option>
              </select>
            </div>

            {filters.dateRange === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Von</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Bis</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Datum-Typ</label>
                  <select
                    value={filters.dateField}
                    onChange={(e) => handleFilterChange('dateField', e.target.value)}
                    className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                  >
                    <option value="created_at">Erstellt am</option>
                    <option value="updated_at">Aktualisiert am</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
