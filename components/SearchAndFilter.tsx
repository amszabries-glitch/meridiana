'use client'

import { useState } from 'react'
import { Project } from '@/lib/supabase'

interface SearchAndFilterProps {
  projects: Project[]
  onFilteredProjects: (projects: Project[]) => void
}

export default function SearchAndFilter({ projects, onFilteredProjects }: SearchAndFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [hasBuyerFilter, setHasBuyerFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    applyFilters(value, statusFilter, hasBuyerFilter, sortBy, sortOrder)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    applyFilters(searchTerm, value, hasBuyerFilter, sortBy, sortOrder)
  }

  const handleBuyerFilter = (value: string) => {
    setHasBuyerFilter(value)
    applyFilters(searchTerm, statusFilter, value, sortBy, sortOrder)
  }

  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc'
    setSortBy(field)
    setSortOrder(newOrder)
    applyFilters(searchTerm, statusFilter, hasBuyerFilter, field, newOrder)
  }

  const applyFilters = (search: string, status: string, buyer: string, sort: string, order: string) => {
    let filtered = [...projects]

    // Search filter
    if (search) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.company_name.toLowerCase().includes(search.toLowerCase()) ||
        project.next_steps?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Status filter
    if (status !== 'all') {
      filtered = filtered.filter(project => project.status === status)
    }

    // Buyer filter
    if (buyer !== 'all') {
      const hasBuyer = buyer === 'true'
      filtered = filtered.filter(project => project.has_buyer === hasBuyer)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sort) {
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
        case 'created_at':
        default:
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    onFilteredProjects(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setHasBuyerFilter('all')
    setSortBy('created_at')
    setSortOrder('desc')
    onFilteredProjects(projects)
  }

  return (
    <div className="bg-white rounded-xl border border-ink/10 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-ink font-display">Filter & Suche</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-ink-soft hover:text-ink transition-colors"
        >
          Filter zurücksetzen
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Suche</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Projekt, Unternehmen, Schritte..."
            className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
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

        {/* Buyer Filter */}
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Käufer</label>
          <select
            value={hasBuyerFilter}
            onChange={(e) => handleBuyerFilter(e.target.value)}
            className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
          >
            <option value="all">Alle</option>
            <option value="true">Mit Käufer</option>
            <option value="false">Ohne Käufer</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Sortieren nach</label>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              handleSort(field)
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
          </select>
        </div>
      </div>
    </div>
  )
}
