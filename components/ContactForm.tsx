'use client'

import { useState } from 'react'
import { createContact } from '@/lib/actions'
import { Contact } from '@/lib/supabase'

interface ContactFormProps {
  onSuccess: () => void
  onCancel: () => void
  initialData?: Partial<Contact>
  isEdit?: boolean
}

export default function ContactForm({ onSuccess, onCancel, initialData, isEdit = false }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    company: initialData?.company || '',
    position: initialData?.position || '',
    contact_type: initialData?.contact_type || 'general',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isEdit && initialData?.id) {
        // TODO: Implement update functionality
        console.log('Edit mode - update functionality to be implemented')
      } else {
        await createContact(formData)
      }
      onSuccess()
    } catch (err) {
      setError('Fehler beim Speichern des Kontakts. Bitte versuchen Sie es erneut.')
      console.error('Error saving contact:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ink/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-ink font-display">
                {isEdit ? 'Kontakt bearbeiten' : 'Neuer Kontakt'}
              </h2>
              <p className="text-ink-soft text-sm mt-1">
                {isEdit ? 'Bearbeiten Sie die Kontakt-Details' : 'Erstellen Sie einen neuen Kontakt'}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-ink-soft hover:text-ink transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-danger-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
              placeholder="z.B. Dr. Michael Weber"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              E-Mail
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
              placeholder="m.weber@techcorp.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              Telefon
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
              placeholder="+49 89 123456"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              Unternehmen
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
              placeholder="TechCorp AG"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              Position
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
              placeholder="CEO"
            />
          </div>

          {/* Contact Type */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              Kontakttyp *
            </label>
            <select
              name="contact_type"
              value={formData.contact_type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue transition-all"
            >
              <option value="general">Allgemein</option>
              <option value="insolvency_admin">Insolvenzverwalter</option>
              <option value="broker">Makler</option>
              <option value="lawyer">Anwalt</option>
              <option value="buyer">Käufer</option>
              <option value="seller">Verkäufer</option>
              <option value="advisor">Berater</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-ink/10">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-ink-soft hover:text-ink font-medium transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="ci-button px-6 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Speichern...' : (isEdit ? 'Aktualisieren' : 'Erstellen')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
