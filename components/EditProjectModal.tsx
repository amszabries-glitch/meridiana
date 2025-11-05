'use client'

import { useState, useEffect } from 'react'
import { Project, Contact } from '@/lib/supabase'
import { updateProject, getContactsByType } from '@/lib/actions'
import { upsertProjectContactClient } from '@/lib/actions-client'

interface EditProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditProjectModal({ project, isOpen, onClose, onSuccess }: EditProjectModalProps) {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    company_name: '',
    status: 'lead',
    has_buyer: false,
    has_down_payment: false,
    purchase_price: 0,
    selling_price: 0,
    probability: 0,
    next_steps: '',
    timeline: '',
    // Transaction Costs
    legal_fees: 0,
    due_diligence_costs: 0,
    broker_commission: 0,
    exchange_fees: 0,
    // Operational Costs
    monthly_listing_fee: 0,
    annual_compliance_costs: 0,
    annual_accounting_costs: 0,
    holding_period_months: 12,
    // Insolvency Administrator Fields
    insolvency_admin_name: '',
    insolvency_admin_email: '',
    insolvency_admin_phone: '',
    insolvency_admin_company: '',
    insolvency_court: '',
    insolvency_case_number: '',
    insolvency_filing_date: ''
  })
  const [loading, setLoading] = useState(false)
  const [insolvencyAdmins, setInsolvencyAdmins] = useState<Contact[]>([])
  const [selectedContactId, setSelectedContactId] = useState<string>('')

  // Load insolvency administrators
  useEffect(() => {
    const loadInsolvencyAdmins = async () => {
      const admins = await getContactsByType('insolvency_admin')
      setInsolvencyAdmins(admins)
    }
    loadInsolvencyAdmins()
  }, [])

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        company_name: project.company_name || '',
        status: project.status || 'lead',
        has_buyer: project.has_buyer || false,
        has_down_payment: project.has_down_payment || false,
        purchase_price: project.purchase_price || 0,
        selling_price: project.selling_price || 0,
        probability: project.probability || 0,
        next_steps: project.next_steps || '',
        timeline: project.timeline || '',
        // Transaction Costs
        legal_fees: project.legal_fees || 0,
        due_diligence_costs: project.due_diligence_costs || 0,
        broker_commission: project.broker_commission || 0,
        exchange_fees: project.exchange_fees || 0,
        // Operational Costs
        monthly_listing_fee: project.monthly_listing_fee || 0,
        annual_compliance_costs: project.annual_compliance_costs || 0,
        annual_accounting_costs: project.annual_accounting_costs || 0,
        holding_period_months: project.holding_period_months || 12,
        // Insolvency Administrator Fields
        insolvency_admin_name: project.insolvency_admin_name || '',
        insolvency_admin_email: project.insolvency_admin_email || '',
        insolvency_admin_phone: project.insolvency_admin_phone || '',
        insolvency_admin_company: project.insolvency_admin_company || '',
        insolvency_court: project.insolvency_court || '',
        insolvency_case_number: project.insolvency_case_number || '',
        insolvency_filing_date: project.insolvency_filing_date || ''
      })
    }
  }, [project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return

    setLoading(true)
    try {
      await updateProject(project.id, formData)
      if (selectedContactId) {
        try {
          await upsertProjectContactClient(project.id, selectedContactId, 'insolvency_admin')
        } catch (linkErr) {
          console.warn('Could not link insolvency_admin contact (non-fatal):', linkErr)
        }
      }
      // Success confirmation for user
      alert('Änderungen gespeichert')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Fehler beim Aktualisieren des Projekts')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  if (!isOpen || !project) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-ink font-display">Börsenmantel bearbeiten</h2>
            <button
              onClick={onClose}
              className="p-2 text-ink-soft hover:text-ink transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-2">
                  Projekt-Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-soft mb-2">
                  Aktiengesellschaft *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-soft mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                >
                  <option value="lead">Lead</option>
                  <option value="offer_submitted">Angebot abgegeben</option>
                  <option value="negotiation">Verhandlung</option>
                  <option value="offer_accepted">Angebot angenommen</option>
                  <option value="contract_finalized">Kaufvertrag/Insolvenzplan fertiggestellt</option>
                  <option value="creditors_meeting">Gläubigerversammlung durchgeführt</option>
                  <option value="closed">Aktien ausgeliefert (abgeschlossen)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-soft mb-2">
                  Wahrscheinlichkeit (%)
                </label>
                <input
                  type="number"
                  name="probability"
                  value={formData.probability}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-soft mb-2">
                  Kaufpreis (€)
                </label>
                <input
                  type="number"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-soft mb-2">
                  Verkaufspreis (€)
                </label>
                <input
                  type="number"
                  name="selling_price"
                  value={formData.selling_price}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                />
              </div>
            </div>

            {/* Kosten - Transaktionskosten */}
            <div className="border-t border-ink/10 pt-6 mt-2">
              <h3 className="text-lg font-semibold text-ink mb-4 font-display">Transaktionskosten</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-2">Rechtsanwalt (€)</label>
                  <input
                    type="number"
                    name="legal_fees"
                    value={formData.legal_fees}
                    onChange={handleChange}
                    min="0"
                    step="100"
                    className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-2">Due Diligence (€)</label>
                  <input
                    type="number"
                    name="due_diligence_costs"
                    value={formData.due_diligence_costs}
                    onChange={handleChange}
                    min="0"
                    step="100"
                    className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-2">Maklerprovision (%)</label>
                  <input
                    type="number"
                    name="broker_commission"
                    value={formData.broker_commission}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-2">Börsen-Gebühr (€)</label>
                  <input
                    type="number"
                    name="exchange_fees"
                    value={formData.exchange_fees}
                    onChange={handleChange}
                    min="0"
                    step="100"
                    className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Kosten - Betriebskosten */}
            <div className="border-t border-ink/10 pt-6 mt-2">
              <h3 className="text-lg font-semibold text-ink mb-4 font-display">Betriebskosten</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-2">Monatliche Listing-Gebühr (€)</label>
                  <input
                    type="number"
                    name="monthly_listing_fee"
                    value={formData.monthly_listing_fee}
                    onChange={handleChange}
                    min="0"
                    step="50"
                    className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-2">Compliance (jährlich) (€)</label>
                  <input
                    type="number"
                    name="annual_compliance_costs"
                    value={formData.annual_compliance_costs}
                    onChange={handleChange}
                    min="0"
                    step="100"
                    className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-2">Steuerberatung (jährlich) (€)</label>
                  <input
                    type="number"
                    name="annual_accounting_costs"
                    value={formData.annual_accounting_costs}
                    onChange={handleChange}
                    min="0"
                    step="100"
                    className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-2">Haltezeit (Monate)</label>
                  <input
                    type="number"
                    name="holding_period_months"
                    value={formData.holding_period_months}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="has_buyer"
                    checked={formData.has_buyer}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue border-ink/20 rounded focus:ring-blue"
                  />
                  <span className="text-sm font-medium text-ink">Hat Käufer</span>
                </label>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="has_down_payment"
                    checked={formData.has_down_payment}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue border-ink/20 rounded focus:ring-blue"
                  />
                  <span className="text-sm font-medium text-ink">Anzahlung erhalten</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-soft mb-2">
                Nächste Schritte
              </label>
              <textarea
                name="next_steps"
                value={formData.next_steps}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors resize-none"
                placeholder="Beschreiben Sie die nächsten Schritte..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-soft mb-2">
                Timeline
              </label>
              <input
                type="text"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                placeholder="z.B. Q2 2024, Ende März, etc."
              />
            </div>

            {/* Insolvency Administrator Section */}
            <div className="border-t border-ink/10 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-ink mb-4 font-display">Insolvenzverwalter</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-ink-soft mb-2">
                  Aus Kontakten auswählen (optional)
                </label>
                <select
                  name="selected_insolvency_admin"
                  value={selectedContactId}
                  onChange={(e) => {
                    const contactId = e.target.value
                    setSelectedContactId(contactId)
                    
                    // Find selected contact and populate fields
                    const selectedContact = insolvencyAdmins.find(c => c.id === contactId)
                    if (selectedContact) {
                      setFormData(prev => ({
                        ...prev,
                        insolvency_admin_name: selectedContact.name || '',
                        insolvency_admin_email: selectedContact.email || '',
                        insolvency_admin_phone: selectedContact.phone || '',
                        insolvency_admin_company: selectedContact.company || '',
                      }))
                    }
                  }}
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                >
                  <option value="">Kontakt auswählen...</option>
                  {insolvencyAdmins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name} {admin.company ? `(${admin.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="insolvency_admin_name"
                    value={formData.insolvency_admin_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                    placeholder="Dr. Michael Schneider"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-2">
                    Firma
                  </label>
                  <input
                    type="text"
                    name="insolvency_admin_company"
                    value={formData.insolvency_admin_company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                    placeholder="Schneider & Partner Insolvenzverwaltung"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-2">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    name="insolvency_admin_email"
                    value={formData.insolvency_admin_email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                    placeholder="m.schneider@insolvenzkanzlei.de"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="insolvency_admin_phone"
                    value={formData.insolvency_admin_phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                    placeholder="+49 30 12345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-2">
                    Insolvenzgericht
                  </label>
                  <input
                    type="text"
                    name="insolvency_court"
                    value={formData.insolvency_court}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                    placeholder="Amtsgericht Berlin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-2">
                    Aktenzeichen
                  </label>
                  <input
                    type="text"
                    name="insolvency_case_number"
                    value={formData.insolvency_case_number}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                    placeholder="IN 123/2023"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-ink-soft mb-2">
                    Insolvenz-Eröffnungsdatum
                  </label>
                  <input
                    type="date"
                    name="insolvency_filing_date"
                    value={formData.insolvency_filing_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-ink/10">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-ink-soft hover:text-ink transition-colors font-medium"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ci-button px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Speichern...' : 'Änderungen speichern'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
