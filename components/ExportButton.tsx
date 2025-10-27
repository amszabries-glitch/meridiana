'use client'

import { useState } from 'react'
import { Project, Contact } from '@/lib/supabase'
import { ProjectAnalytics } from '@/lib/analytics'
import { exportProjects, exportContacts, exportAnalytics, generateReport } from '@/lib/export'

interface ExportButtonProps {
  projects: Project[]
  contacts: Contact[]
  analytics: ProjectAnalytics
  type: 'projects' | 'contacts' | 'analytics' | 'report'
}

export default function ExportButton({ projects, contacts, analytics, type }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    setIsExporting(true)
    
    try {
      switch (type) {
        case 'projects':
          await exportProjects(projects, { format })
          break
        case 'contacts':
          await exportContacts(contacts, { format })
          break
        case 'analytics':
          await exportAnalytics(analytics, { format })
          break
        case 'report':
          if (format === 'json') {
            const report = generateReport(projects, contacts, analytics)
            const blob = new Blob([report], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `meridiana-bericht-${new Date().toISOString().split('T')[0]}.txt`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
          }
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export fehlgeschlagen. Bitte versuchen Sie es erneut.')
    } finally {
      setIsExporting(false)
      setIsOpen(false)
    }
  }

  const getButtonText = () => {
    switch (type) {
      case 'projects': return 'Projekte exportieren'
      case 'contacts': return 'Kontakte exportieren'
      case 'analytics': return 'Analytics exportieren'
      case 'report': return 'Bericht generieren'
      default: return 'Exportieren'
    }
  }

  const getIcon = () => {
    return (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="ci-button px-4 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        {getIcon()}
        <span>{isExporting ? 'Exportiere...' : getButtonText()}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-ink/10 z-20">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-ink-soft uppercase tracking-wider">
                Export-Format
              </div>
              
              {type !== 'report' && (
                <>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-ink/5 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>CSV</span>
                  </button>
                  
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-ink/5 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span>JSON</span>
                  </button>
                </>
              )}
              
              {type === 'report' && (
                <button
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-ink/5 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Text-Bericht</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
