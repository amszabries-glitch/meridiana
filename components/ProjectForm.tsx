'use client'

import { useState, useEffect } from 'react'
import { createProject, getContactsByType } from '@/lib/actions'
import { Project, Contact } from '@/lib/supabase'

interface ProjectFormProps {
  onSuccess: () => void
  onCancel: () => void
  initialData?: Partial<Project>
  isEdit?: boolean
}

export default function ProjectForm({ onSuccess, onCancel, initialData, isEdit = false }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    company_name: initialData?.company_name || '',
    status: initialData?.status || 'lead',
    has_buyer: initialData?.has_buyer || false,
    has_down_payment: initialData?.has_down_payment || false,
    purchase_price: initialData?.purchase_price || 0,
    selling_price: initialData?.selling_price || 0,
    next_steps: initialData?.next_steps || '',
    timeline: initialData?.timeline || '',
    probability: initialData?.probability || 0,
    // Cost Fields
    legal_fees: initialData?.legal_fees || 0,
    due_diligence_costs: initialData?.due_diligence_costs || 0,
    broker_commission: initialData?.broker_commission || 0,
    exchange_fees: initialData?.exchange_fees || 0,
    monthly_listing_fee: initialData?.monthly_listing_fee || 0,
    annual_compliance_costs: initialData?.annual_compliance_costs || 0,
    annual_accounting_costs: initialData?.annual_accounting_costs || 0,
    holding_period_months: initialData?.holding_period_months || 12,
    // Insolvency Administrator Fields
    insolvency_admin_name: initialData?.insolvency_admin_name || '',
    insolvency_admin_email: initialData?.insolvency_admin_email || '',
    insolvency_admin_phone: initialData?.insolvency_admin_phone || '',
    insolvency_admin_company: initialData?.insolvency_admin_company || '',
    insolvency_court: initialData?.insolvency_court || '',
    insolvency_case_number: initialData?.insolvency_case_number || '',
    insolvency_filing_date: initialData?.insolvency_filing_date || '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [insolvencyAdmins, setInsolvencyAdmins] = useState<Contact[]>([])
  const [selectedContactId, setSelectedContactId] = useState<string>('')

  // Load insolvency administrators on component mount
  useEffect(() => {
    const loadInsolvencyAdmins = async () => {
      const admins = await getContactsByType('insolvency_admin')
      setInsolvencyAdmins(admins)
    }
    loadInsolvencyAdmins()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isEdit && initialData?.id) {
        // TODO: Implement update functionality
        console.log('Edit mode - update functionality to be implemented')
      } else {
        await createProject(formData)
      }
      onSuccess()
    } catch (err) {
      setError('Fehler beim Speichern des Projekts. Bitte versuchen Sie es erneut.')
      console.error('Error saving project:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? Number(value) : value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 border-b border-ink/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-ink font-display">
                {isEdit ? 'Börsenmantel bearbeiten' : 'Neuer Börsenmantel'}
              </h2>
              <p className="text-ink-soft mt-1">
                {isEdit ? 'Bearbeiten Sie die Projekt-Details' : 'Erstellen Sie ein neues Börsenmäntel-Projekt'}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-ink-soft hover:text-ink transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          {error && (
            <div className="p-4 bg-danger-50 border border-danger-200 rounded-xl">
              <p className="text-danger-600 font-medium">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Projekt-Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                placeholder="z.B. TechCorp AG - Börsenmantel"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Unternehmen *
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                placeholder="z.B. TechCorp AG"
              />
            </div>
          </div>

          {/* Status and Probability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
              >
                <option value="lead">Lead</option>
                <option value="offer_submitted">Angebot abgegeben</option>
                <option value="negotiation">Verhandlung</option>
                <option value="offer_accepted">Angebot angenommen</option>
                <option value="closed">Gewonnen</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Wahrscheinlichkeit (%)
              </label>
              <input
                type="number"
                name="probability"
                value={formData.probability}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                placeholder="85"
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Kaufpreis (€)
              </label>
              <input
                type="number"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
                min="0"
                step="1000"
                className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                placeholder="2500000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Verkaufspreis (€)
              </label>
              <input
                type="number"
                name="selling_price"
                value={formData.selling_price}
                onChange={handleChange}
                min="0"
                step="1000"
                className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                placeholder="3200000"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="has_buyer"
                checked={formData.has_buyer}
                onChange={handleChange}
                className="h-5 w-5 text-blue focus:ring-blue border-ink/20 rounded"
              />
              <label className="text-sm font-medium text-ink">
                Hat bereits einen Käufer
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="has_down_payment"
                checked={formData.has_down_payment}
                onChange={handleChange}
                className="h-5 w-5 text-blue focus:ring-blue border-ink/20 rounded"
              />
              <label className="text-sm font-medium text-ink">
                Anzahlung erhalten
              </label>
            </div>
          </div>

          {/* Cost Information - Transaction Costs */}
          <div className="border-t border-ink/10 pt-6">
            <h3 className="text-lg font-bold text-ink mb-4 font-display">Transaktionskosten</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Rechtsanwalt-Gebühren (€)
                </label>
                <input
                  type="number"
                  name="legal_fees"
                  value={formData.legal_fees}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Due Diligence Kosten (€)
                </label>
                <input
                  type="number"
                  name="due_diligence_costs"
                  value={formData.due_diligence_costs}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                  placeholder="75000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Makler-Provisiоn (%)
                </label>
                <input
                  type="number"
                  name="broker_commission"
                  value={formData.broker_commission}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                  placeholder="2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Börsen-Gebühren (€)
                </label>
                <input
                  type="number"
                  name="exchange_fees"
                  value={formData.exchange_fees}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                  placeholder="25000"
                />
              </div>
            </div>
          </div>

          {/* Cost Information - Operational Costs */}
          <div className="border-t border-ink/10 pt-6">
            <h3 className="text-lg font-bold text-ink mb-4 font-display">Betriebskosten</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Monatliche Börsen-Gebühr (€)
                </label>
                <input
                  type="number"
                  name="monthly_listing_fee"
                  value={formData.monthly_listing_fee}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Compliance-Kosten/Jahr (€)
                </label>
                <input
                  type="number"
                  name="annual_compliance_costs"
                  value={formData.annual_compliance_costs}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                  placeholder="60000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Steuerberatung/Jahr (€)
                </label>
                <input
                  type="number"
                  name="annual_accounting_costs"
                  value={formData.annual_accounting_costs}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                  placeholder="45000"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-semibold text-ink mb-2">
                Erwartete Haltezeit (Monate)
              </label>
              <input
                type="number"
                name="holding_period_months"
                value={formData.holding_period_months}
                onChange={handleChange}
                min="1"
                step="1"
                className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                placeholder="12"
              />
            </div>
          </div>

          {/* Next Steps and Timeline */}
          <div className="border-t border-ink/10 pt-6">
            <label className="block text-sm font-semibold text-ink mb-2">
              Nächste Schritte
            </label>
            <textarea
              name="next_steps"
              value={formData.next_steps}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
              placeholder="z.B. Due Diligence abschließen"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              Timeline
            </label>
            <input
              type="text"
              name="timeline"
              value={formData.timeline}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
              placeholder="z.B. Q2 2024"
            />
          </div>

          {/* Insolvency Administrator Section */}
          <div className="border-t border-ink/10 pt-6">
            <h3 className="text-lg font-bold text-ink mb-4 font-display">Insolvenzverwalter</h3>
            
            <p className="text-sm text-ink-soft mb-4">
              Wählen Sie einen bestehenden Kontakt oder geben Sie die Daten manuell ein.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-ink mb-2">
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
                className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
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
                <label className="block text-sm font-semibold text-ink mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="insolvency_admin_name"
                  value={formData.insolvency_admin_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                  placeholder="Dr. Michael Schneider"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Firma
                </label>
                <input
                  type="text"
                  name="insolvency_admin_company"
                  value={formData.insolvency_admin_company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                  placeholder="Schneider & Partner Insolvenzverwaltung"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  E-Mail
                </label>
                <input
                  type="email"
                  name="insolvency_admin_email"
                  value={formData.insolvency_admin_email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                  placeholder="m.schneider@insolvenzkanzlei.de"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="insolvency_admin_phone"
                  value={formData.insolvency_admin_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                  placeholder="+49 30 12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Insolvenzgericht
                </label>
                <input
                  type="text"
                  name="insolvency_court"
                  value={formData.insolvency_court}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                  placeholder="Amtsgericht Berlin"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Aktenzeichen
                </label>
                <input
                  type="text"
                  name="insolvency_case_number"
                  value={formData.insolvency_case_number}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                  placeholder="IN 123/2023"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink mb-2">
                  Insolvenz-Eröffnungsdatum
                </label>
                <input
                  type="date"
                  name="insolvency_filing_date"
                  value={formData.insolvency_filing_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-ink/10">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-ink-soft hover:text-ink font-medium transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="ci-button px-8 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Speichern...' : (isEdit ? 'Aktualisieren' : 'Erstellen')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
