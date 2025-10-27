'use client'

import { useState, useRef } from 'react'
import { createDocument } from '@/lib/actions'
import { uploadFile } from '@/lib/storage'
import { NewDocument } from '@/lib/supabase'

interface DocumentUploadProps {
  projectId?: string
  contactId?: string
  onUploadComplete?: () => void
  onClose?: () => void
}

export default function DocumentUpload({ 
  projectId, 
  contactId, 
  onUploadComplete, 
  onClose 
}: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles)
      setFiles(prev => [...prev, ...fileArray])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
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
        <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      )
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return (
        <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      )
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return (
        <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      )
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return (
        <svg className="h-8 w-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      )
    } else {
      return (
        <svg className="h-8 w-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      )
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    try {
      for (const file of files) {
        console.log('Uploading file:', file.name)
        
        // Upload file to Supabase Storage
        const uploadResult = await uploadFile(file, {
          bucket: 'documents',
          folder: projectId ? `projects/${projectId}` : 'general',
          makePublic: false // Keep files private for security
        })

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload failed')
        }

        console.log('File uploaded successfully:', uploadResult.filePath)
        
        const documentData: NewDocument = {
          name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          file_name: file.name,
          file_path: uploadResult.filePath!,
          file_size: file.size,
          file_type: file.name.split('.').pop() || '',
          mime_type: file.type,
          category: 'general',
          tags: [],
          description: '',
          project_id: projectId,
          contact_id: contactId,
          uploaded_by: 'current_user', // In real app, get from auth
          is_public: false
        }

        console.log('Creating document record:', documentData)
        await createDocument(documentData)
        console.log('Document record created successfully')
      }
      
      setFiles([])
      onUploadComplete?.()
      onClose?.()
    } catch (error) {
      console.error('Error uploading documents:', error)
      alert(`Fehler beim Hochladen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-ink/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink font-display">Dokumente hochladen</h2>
            <button
              onClick={onClose}
              className="p-2 text-ink-soft hover:text-ink transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue bg-blue/5' 
                : 'border-ink/20 hover:border-ink/40'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <svg className="h-12 w-12 text-ink-soft mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-medium text-ink mb-2">
              Dateien hier ablegen oder klicken zum Auswählen
            </p>
            <p className="text-sm text-ink-soft mb-4">
              PDF, Word, Excel, PowerPoint und andere Dokumente
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="ci-button px-6 py-2 text-sm"
            >
              Dateien auswählen
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-ink">Ausgewählte Dateien ({files.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-ink/5 rounded-lg">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{file.name}</p>
                      <p className="text-xs text-ink-soft">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-ink-soft hover:text-red-500 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-ink/10 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="ci-button px-6 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Hochladen...' : `${files.length} Datei${files.length !== 1 ? 'en' : ''} hochladen`}
          </button>
        </div>
      </div>
    </div>
  )
}
