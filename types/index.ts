export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  title: string
  description: string | null
  status: DealStatus
  priority: DealPriority
  value: number
  currency: string
  probability: number
  expected_close_date: string | null
  actual_close_date: string | null
  source: string | null
  assigned_to: string | null
  created_by: string
  created_at: string
  updated_at: string
  contacts?: Contact[]
  activities?: Activity[]
}

export interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  company: string | null
  position: string | null
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  deal_id: string | null
  contact_id: string | null
  type: ActivityType
  title: string
  description: string | null
  scheduled_at: string | null
  completed_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface DealContact {
  id: string
  deal_id: string
  contact_id: string
  role: ContactRole
  created_at: string
}

export type DealStatus = 
  | 'lead' 
  | 'qualified' 
  | 'proposal' 
  | 'negotiation' 
  | 'closed_won' 
  | 'closed_lost'

export type DealPriority = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical'

export type ActivityType = 
  | 'call' 
  | 'email' 
  | 'meeting' 
  | 'note' 
  | 'task'

export type ContactRole = 
  | 'primary' 
  | 'secondary' 
  | 'decision_maker' 
  | 'influencer'

export interface DashboardStats {
  totalDeals: number
  activeDeals: number
  closedWon: number
  closedLost: number
  totalValue: number
  averageDealSize: number
  winRate: number
  pipelineValue: number
}

export interface PipelineData {
  status: DealStatus
  count: number
  value: number
  deals: Deal[]
}

export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface FilterOptions {
  status?: DealStatus[]
  priority?: DealPriority[]
  assigned_to?: string[]
  date_range?: {
    start: string
    end: string
  }
  search?: string
}
