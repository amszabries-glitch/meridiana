'use client'

import { useState, useEffect } from 'react'
import { getDocuments } from '@/lib/actions'
import { Document } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import DocumentList from '@/components/DocumentList'
import DocumentUpload from '@/components/DocumentUpload'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

  const loadDocuments = async () => {
    try {
      const documentsData = await getDocuments()
      setDocuments(documentsData)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const handleUploadComplete = () => {
    loadDocuments()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
          <p className="text-ink-soft">Lade Dokumente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue to-brand rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-ink font-display">Dokumente</h1>
                  <p className="text-sm text-ink-soft font-medium">Dokument-Management</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Navigation />
              <button
                onClick={() => setShowUpload(true)}
                className="ci-button px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200"
              >
                + Dokument hochladen
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue/15">
                <svg className="h-6 w-6 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-medium text-ink-soft mb-1">Gesamt Dokumente</h3>
            <p className="text-3xl font-bold text-ink mb-2 font-display">{documents.length}</p>
            <p className="text-xs text-ink-soft">Alle Dokumente</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green/15">
                <svg className="h-6 w-6 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-medium text-ink-soft mb-1">Rechtliche Dokumente</h3>
            <p className="text-3xl font-bold text-ink mb-2 font-display">
              {documents.filter(d => d.category === 'legal').length}
            </p>
            <p className="text-xs text-ink-soft">Legal & Compliance</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple/15">
                <svg className="h-6 w-6 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-medium text-ink-soft mb-1">Finanzielle Dokumente</h3>
            <p className="text-3xl font-bold text-ink mb-2 font-display">
              {documents.filter(d => d.category === 'financial').length}
            </p>
            <p className="text-xs text-ink-soft">Financial Reports</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange/15">
                <svg className="h-6 w-6 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 6v10a1 1 0 102 0V6a1 1 0 10-2 0zm4 0v10a1 1 0 102 0V6a1 1 0 10-2 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-medium text-ink-soft mb-1">Gespeicherte Größe</h3>
            <p className="text-3xl font-bold text-ink mb-2 font-display">
              {Math.round(documents.reduce((sum, d) => sum + d.file_size, 0) / 1024 / 1024)}MB
            </p>
            <p className="text-xs text-ink-soft">Total Storage</p>
          </div>
        </div>

        {/* Document List */}
        <DocumentList 
          documents={documents}
          onDocumentUpdate={loadDocuments}
        />
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <DocumentUpload
          onUploadComplete={handleUploadComplete}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  )
}
