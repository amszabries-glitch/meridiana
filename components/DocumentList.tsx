'use client'

import { useState } from 'react'
import { Document } from '@/lib/supabase'
import { deleteDocument } from '@/lib/actions'
import { getSignedUrl, deleteFile } from '@/lib/storage'

interface DocumentListProps {
  documents: Document[]
  onDocumentUpdate?: () => void
}

export default function DocumentList({ documents, onDocumentUpdate }: DocumentListProps) {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filter === 'all' || doc.category === filter
    
    return matchesSearch && matchesFilter
  })

  const handleDelete = async (document: Document) => {
    if (confirm('Sind Sie sicher, dass Sie dieses Dokument löschen möchten?')) {
      try {
        // Delete file from storage
        if (document.file_path) {
          await deleteFile(document.file_path, 'documents')
        }
        
        // Delete document record
        await deleteDocument(document.id)
        onDocumentUpdate?.()
      } catch (error) {
        console.error('Error deleting document:', error)
        alert('Fehler beim Löschen des Dokuments')
      }
    }
  }

  const handleDownload = async (document: Document) => {
    try {
      if (document.file_path) {
        const result = await getSignedUrl(document.file_path, 'documents', 3600)
        if (result.success && result.url) {
          // Open download in new tab
          window.open(result.url, '_blank')
        } else {
          alert('Fehler beim Generieren des Download-Links')
        }
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('Fehler beim Download des Dokuments')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return (
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
      )
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return (
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
      )
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return (
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
      )
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return (
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <svg className="h-6 w-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
      )
    } else {
      return (
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="h-6 w-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
      )
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'legal': return 'bg-blue/10 text-blue border-blue/20'
      case 'financial': return 'bg-green/10 text-green border-green/20'
      case 'technical': return 'bg-purple/10 text-purple border-purple/20'
      case 'marketing': return 'bg-orange/10 text-orange border-orange/20'
      default: return 'bg-gray/10 text-gray border-gray/20'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'legal': return 'Rechtlich'
      case 'financial': return 'Finanziell'
      case 'technical': return 'Technisch'
      case 'marketing': return 'Marketing'
      default: return 'Allgemein'
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Dokumente durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
        >
          <option value="all">Alle Kategorien</option>
          <option value="legal">Rechtlich</option>
          <option value="financial">Finanziell</option>
          <option value="technical">Technisch</option>
          <option value="marketing">Marketing</option>
          <option value="general">Allgemein</option>
        </select>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="h-12 w-12 text-ink-soft mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-ink-soft">Keine Dokumente gefunden</p>
          </div>
        ) : (
          filteredDocuments.map((document) => (
            <div key={document.id} className="card p-4 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start space-x-4">
                {getFileIcon(document.file_type)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-ink truncate">{document.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(document.category)}`}>
                      {getCategoryLabel(document.category)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-ink-soft mb-2">
                    <span>{document.file_name}</span>
                    <span>•</span>
                    <span>{formatFileSize(document.file_size)}</span>
                    <span>•</span>
                    <span>{new Date(document.created_at).toLocaleDateString('de-DE')}</span>
                  </div>
                  
                  {document.description && (
                    <p className="text-sm text-ink-soft mb-2">{document.description}</p>
                  )}
                  
                  {document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {document.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-ink/5 text-ink-soft rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {(document.project_id || document.contact_id) && (
                    <div className="flex items-center space-x-4 text-xs text-ink-soft">
                      {document.project_id && (
                        <span>Projekt ID: {document.project_id}</span>
                      )}
                      {document.contact_id && (
                        <span>Kontakt ID: {document.contact_id}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleDownload(document)}
                    className="p-2 text-ink-soft hover:text-blue transition-colors"
                    title="Download"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  <button 
                    className="p-2 text-ink-soft hover:text-ink transition-colors"
                    title="Bearbeiten"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(document)}
                    className="p-2 text-ink-soft hover:text-red-500 transition-colors"
                    title="Löschen"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
