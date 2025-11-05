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
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

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

  const handlePreview = async (document: Document) => {
    setLoadingPreview(true)
    setPreviewDocument(document)
    try {
      if (document.file_path) {
        const result = await getSignedUrl(document.file_path, 'documents', 3600)
        if (result.success && result.url) {
          setPreviewUrl(result.url)
        } else {
          alert('Fehler beim Generieren der Vorschau')
          setPreviewDocument(null)
        }
      }
    } catch (error) {
      console.error('Error loading preview:', error)
      alert('Fehler beim Laden der Vorschau')
      setPreviewDocument(null)
    } finally {
      setLoadingPreview(false)
    }
  }

  const closePreview = () => {
    setPreviewDocument(null)
    setPreviewUrl(null)
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

  const canPreview = (fileType: string) => {
    return fileType.includes('pdf') || 
           fileType.includes('image') || 
           fileType.includes('jpeg') || 
           fileType.includes('jpg') || 
           fileType.includes('png') || 
           fileType.includes('gif') || 
           fileType.includes('webp')
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
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
      )
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return (
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
      )
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return (
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
      )
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return (
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
      )
    } else if (fileType.includes('image')) {
      return (
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )
    } else {
      return (
        <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
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

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <svg className="h-12 w-12 text-ink-soft mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-ink-soft">Keine Dokumente gefunden</p>
          </div>
        ) : (
          filteredDocuments.map((document) => (
            <div 
              key={document.id} 
              className="card group hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Document Preview/Icon Header */}
              <div className="relative bg-gradient-to-br from-ink/5 to-ink/10 p-8 flex items-center justify-center border-b border-ink/10">
                {getFileIcon(document.file_type)}
                
                {/* Category Badge - Floating */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-lg border shadow-sm ${getCategoryColor(document.category)}`}>
                    {getCategoryLabel(document.category)}
                  </span>
                </div>

                {/* Quick Actions - Overlay on Hover */}
                <div className="absolute inset-0 bg-ink/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  {canPreview(document.file_type) && (
                    <button 
                      onClick={() => handlePreview(document)}
                      className="p-3 bg-white rounded-full text-blue hover:bg-blue hover:text-white transition-all duration-200 shadow-lg"
                      title="Vorschau"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  )}
                  <button 
                    onClick={() => handleDownload(document)}
                    className="p-3 bg-white rounded-full text-green-600 hover:bg-green-600 hover:text-white transition-all duration-200 shadow-lg"
                    title="Download"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(document)}
                    className="p-3 bg-white rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-lg"
                    title="Löschen"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Document Info */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-ink mb-2 line-clamp-2 min-h-[3.5rem]">
                  {document.name}
                </h3>
                
                {document.description && (
                  <p className="text-sm text-ink-soft mb-3 line-clamp-2">{document.description}</p>
                )}
                
                {/* Meta Info */}
                <div className="mt-auto pt-4 border-t border-ink/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-ink-soft">
                    <span className="font-mono">{formatFileSize(document.file_size)}</span>
                    <span>{new Date(document.created_at).toLocaleDateString('de-DE')}</span>
                  </div>
                  
                  {document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {document.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 text-xs bg-blue/10 text-blue rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {document.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs bg-ink/5 text-ink-soft rounded-full">
                          +{document.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-ink/10">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-ink truncate">{previewDocument.name}</h2>
                <p className="text-sm text-ink-soft">{formatFileSize(previewDocument.file_size)}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <button
                  onClick={() => handleDownload(previewDocument)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                <button
                  onClick={closePreview}
                  className="p-2 text-ink-soft hover:text-ink hover:bg-ink/5 rounded-lg transition-colors"
                  title="Schließen"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6 bg-ink/5">
              {loadingPreview ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
                    <p className="text-ink-soft">Lade Vorschau...</p>
                  </div>
                </div>
              ) : previewUrl ? (
                <div className="h-full flex items-center justify-center">
                  {previewDocument.file_type.includes('pdf') ? (
                    <iframe
                      src={previewUrl}
                      className="w-full h-full min-h-[600px] rounded-lg border-0"
                      title={previewDocument.name}
                    />
                  ) : previewDocument.file_type.includes('image') ? (
                    <img
                      src={previewUrl}
                      alt={previewDocument.name}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <p className="text-ink-soft mb-4">Vorschau für diesen Dateityp nicht verfügbar</p>
                      <button
                        onClick={() => handleDownload(previewDocument)}
                        className="ci-button px-6 py-3 rounded-lg"
                      >
                        Stattdessen herunterladen
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-ink-soft">Fehler beim Laden der Vorschau</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


