'use client'

import { useState } from 'react'
import { createMilestone } from '@/lib/actions'
import { Milestone } from '@/lib/supabase'

interface MilestoneFormProps {
  projectId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function MilestoneForm({ projectId, onSuccess, onCancel }: MilestoneFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_date: '',
    priority: 'medium' as Milestone['priority'],
    status: 'pending' as Milestone['status']
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createMilestone({
        ...formData,
        project_id: projectId,
        order_index: 0
      })
      onSuccess()
    } catch (error) {
      console.error('Error creating milestone:', error)
      alert('Fehler beim Erstellen des Meilensteins')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-ink/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink font-display">Meilenstein hinzufügen</h2>
          <button
            onClick={onCancel}
            className="text-ink-soft hover:text-ink transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Meilenstein-Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
              placeholder="z.B. Vertrag finalisiert"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Beschreibung
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
              placeholder="Weitere Details zum Meilenstein..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Ziel-Datum
              </label>
              <input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="w-full px-4 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Priorität
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Milestone['priority'] })}
                className="w-full px-4 py-2 border border-ink/20 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
              >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
                <option value="critical">Kritisch</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-4 border-t border-ink/10">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-ink/20 rounded-lg font-medium text-ink hover:bg-ink/5 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 ci-button px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Erstelle...' : 'Meilenstein erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

