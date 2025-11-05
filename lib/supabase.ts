import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Database Types
export interface Project {
  id: string
  name: string
  company_name: string
  status: 'lead' | 'offer_submitted' | 'negotiation' | 'offer_accepted' | 'contract_finalized' | 'creditors_meeting' | 'closed'
  has_buyer: boolean
  has_down_payment: boolean
  purchase_price: number
  selling_price: number
  // Transaction Costs
  legal_fees?: number
  due_diligence_costs?: number
  broker_commission?: number // Percentage
  exchange_fees?: number
  // Operational Costs
  monthly_listing_fee?: number
  annual_compliance_costs?: number
  annual_accounting_costs?: number
  holding_period_months?: number
  // Insolvency Administrator Fields
  insolvency_admin_name?: string
  insolvency_admin_email?: string
  insolvency_admin_phone?: string
  insolvency_admin_company?: string
  insolvency_court?: string
  insolvency_case_number?: string
  insolvency_filing_date?: string
  // Calculated Fields (not in DB, computed)
  next_steps: string
  timeline: string
  probability: number
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  position?: string
  contact_type?: 'general' | 'insolvency_admin' | 'broker' | 'lawyer' | 'buyer' | 'seller' | 'advisor'
  created_at: string
}

export interface ProjectContact {
  project_id: string
  contact_id: string
  role: 'primary' | 'secondary' | 'buyer'
}

export interface Document {
  id: string
  name: string
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  mime_type: string
  category: 'legal' | 'financial' | 'technical' | 'marketing' | 'general'
  tags: string[]
  description?: string
  project_id?: string
  contact_id?: string
  uploaded_by?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  file_path: string
  file_size: number
  change_description?: string
  created_at: string
}

export interface ProjectStatusHistory {
  id: string
  project_id: string
  old_status?: string
  new_status: string
  changed_at: string
  changed_by?: string
  notes?: string
  created_at: string
}

export interface Milestone {
  id: string
  project_id: string
  name: string
  description?: string
  target_date?: string
  completed_date?: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  updated_at: string
  created_by?: string
  notes?: string
  order_index: number
}

export interface AvailableShell {
  id: string
  name: string
  exchange: 'XETRA' | 'MUNICH' | 'BERLIN' | 'HANSE' | 'OTHER'
  sector?: string
  market_cap?: number
  shares_outstanding?: number
  listing_date?: string
  status: 'available' | 'negotiation' | 'reserved' | 'sold'
  asking_price?: number
  last_trade_date?: string
  contact_email?: string
  contact_phone?: string
  notes?: string
  broker_name?: string
  broker_contact?: string
  created_at: string
  updated_at: string
}

// Payment schedules
export interface ProjectDownPayment {
  id: string
  project_id: string
  idx: number // 1..5
  amount: number
  due_date?: string
  paid_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ProjectDeposit {
  id: string
  project_id: string
  idx: number // 1..3
  amount: number
  due_date?: string
  paid_at?: string
  notes?: string
  created_at: string
  updated_at: string
}