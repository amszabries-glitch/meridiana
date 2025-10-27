'use client'

import { useState, useEffect, useCallback } from 'react'
import { getProjects, getContacts } from '@/lib/actions'
import { Project, Contact } from '@/lib/supabase'
import { calculateProjectAnalytics } from '@/lib/analytics'
import AnalyticsWidgets from '@/components/AnalyticsWidgets'
import ProjectTimeline from '@/components/ProjectTimeline'
import SearchAndFilter from '@/components/SearchAndFilter'
import AdvancedFilters from '@/components/AdvancedFilters'
import OptimizedChart from '@/components/OptimizedChart'
import ExportButton from '@/components/ExportButton'
import Navigation from '@/components/Navigation'
import UserMenu from '@/components/UserMenu'

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(calculateProjectAnalytics([]))

  const loadData = async () => {
    try {
      const [projectsData, contactsData] = await Promise.all([
        getProjects(),
        getContacts()
      ])
      setProjects(projectsData)
      setFilteredProjects(projectsData)
      setContacts(contactsData)
      setAnalytics(calculateProjectAnalytics(projectsData))
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleFilteredProjects = useCallback((filtered: Project[]) => {
    setFilteredProjects(filtered)
    setAnalytics(calculateProjectAnalytics(filtered))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
          <p className="text-ink-soft">Lade Analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-2 sm:px-4 lg:px-8">
          <div className="flex items-center h-14 md:h-16 relative">
            {/* Logo & Brand - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue to-brand rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-ink font-display">Analytics</h1>
                  <p className="text-sm text-ink-soft font-medium">Performance & Insights</p>
                </div>
              </div>
            </div>

            {/* Mobile Logo - Only icon */}
            <div className="md:hidden flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue to-brand rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-base">M</span>
              </div>
            </div>

            {/* Navigation - Centered */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-[calc(100%-80px)] sm:w-[calc(100%-120px)] md:w-auto">
              <Navigation />
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2 md:space-x-4 ml-auto">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-2 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Advanced Filters */}
        <AdvancedFilters 
          projects={projects}
          onFilteredProjects={handleFilteredProjects}
        />

        {/* Analytics Widgets */}
        <AnalyticsWidgets analytics={analytics} />

        {/* Charts Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-ink font-display">Performance-Diagramme</h2>
            <div className="flex items-center space-x-4">
              <ExportButton 
                projects={filteredProjects}
                contacts={contacts}
                analytics={analytics}
                type="analytics"
              />
              <ExportButton 
                projects={filteredProjects}
                contacts={contacts}
                analytics={analytics}
                type="report"
              />
            </div>
          </div>
          
          {/* Optimized Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <OptimizedChart 
              analytics={analytics}
              type="line"
              title="ROI-Trend & Pipeline-Entwicklung"
              height={300}
            />
            <OptimizedChart 
              analytics={analytics}
              type="doughnut"
              title="Pipeline-Verteilung"
              height={300}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <OptimizedChart 
              analytics={analytics}
              type="bar"
              title="Pipeline-Wert nach Status"
              height={300}
            />
            <OptimizedChart 
              analytics={analytics}
              type="bar"
              title="Monatliche Investition vs. Pipeline-Wert"
              height={300}
            />
          </div>
        </div>

        {/* Project Timeline */}
        <div className="mt-8">
          <ProjectTimeline projects={filteredProjects} />
        </div>
      </main>
    </div>
  )
}
