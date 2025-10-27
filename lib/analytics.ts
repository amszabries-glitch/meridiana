import { Project } from './supabase'

export interface ProjectAnalytics {
  totalValue: number
  totalInvestment: number
  totalROI: number
  avgROI: number
  activeProjects: number
  closedProjects: number
  winRate: number
  avgProjectValue: number
  avgProjectInvestment: number
  avgProcessingTime: number // in days
  statusDistribution: Record<string, number>
  valueByStatus: Record<string, number>
  monthlyTrend: Array<{
    month: string
    value: number
    investment: number
    roi: number
  }>
}

export function calculateProjectAnalytics(projects: Project[]): ProjectAnalytics {
  const activeProjects = projects.filter(p => p.status !== 'closed')
  const closedProjects = projects.filter(p => p.status === 'closed')
  
  const totalValue = activeProjects.reduce((sum, p) => sum + (p.selling_price || 0), 0)
  const totalInvestment = activeProjects.reduce((sum, p) => sum + (p.purchase_price || 0), 0)
  const totalROI = totalInvestment > 0 ? ((totalValue - totalInvestment) / totalInvestment) * 100 : 0
  const avgROI = activeProjects.length > 0 ? totalROI / activeProjects.length : 0
  
  const winRate = projects.length > 0 ? (closedProjects.length / projects.length) * 100 : 0
  const avgProjectValue = activeProjects.length > 0 ? totalValue / activeProjects.length : 0
  const avgProjectInvestment = activeProjects.length > 0 ? totalInvestment / activeProjects.length : 0

  // Calculate average processing time (from created to closed)
  const avgProcessingTime = calculateAverageProcessingTime(closedProjects)

  // Status distribution
  const statusDistribution = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Value by status
  const valueByStatus = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + (project.selling_price || 0)
    return acc
  }, {} as Record<string, number>)

  // Monthly trend (last 6 months)
  const monthlyTrend = generateMonthlyTrend(projects)

  return {
    totalValue,
    totalInvestment,
    totalROI,
    avgROI,
    activeProjects: activeProjects.length,
    closedProjects: closedProjects.length,
    winRate,
    avgProjectValue,
    avgProjectInvestment,
    avgProcessingTime,
    statusDistribution,
    valueByStatus,
    monthlyTrend
  }
}

function calculateAverageProcessingTime(closedProjects: Project[]): number {
  if (closedProjects.length === 0) return 0
  
  const processingTimes = closedProjects.map(project => {
    const created = new Date(project.created_at)
    const updated = new Date(project.updated_at)
    const diffMs = updated.getTime() - created.getTime()
    return diffMs / (1000 * 60 * 60 * 24) // Convert to days
  })
  
  const total = processingTimes.reduce((sum, time) => sum + time, 0)
  return total / closedProjects.length
}

function generateMonthlyTrend(projects: Project[]): Array<{month: string, value: number, investment: number, roi: number}> {
  const months = []
  const now = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStr = date.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })
    
    const monthProjects = projects.filter(p => {
      const projectDate = new Date(p.created_at)
      return projectDate.getMonth() === date.getMonth() && 
             projectDate.getFullYear() === date.getFullYear()
    })
    
    const value = monthProjects.reduce((sum, p) => sum + (p.selling_price || 0), 0)
    const investment = monthProjects.reduce((sum, p) => sum + (p.purchase_price || 0), 0)
    const roi = investment > 0 ? ((value - investment) / investment) * 100 : 0
    
    months.push({ month: monthStr, value, investment, roi })
  }
  
  return months
}

export function calculateProjectROI(project: Project): number {
  if (!project.purchase_price || project.purchase_price === 0) return 0
  return ((project.selling_price || 0) - project.purchase_price) / project.purchase_price * 100
}

export function calculateProjectProcessingTime(project: Project): number {
  const created = new Date(project.created_at)
  const updated = new Date(project.updated_at)
  const diffMs = updated.getTime() - created.getTime()
  return diffMs / (1000 * 60 * 60 * 24) // Convert to days
}

// Cost Calculation Functions
export function calculateTotalTransactionCosts(project: Project): number {
  const legal = project.legal_fees || 0
  const dd = project.due_diligence_costs || 0
  const exchange = project.exchange_fees || 0
  const broker = (project.purchase_price || 0) * (project.broker_commission || 0) / 100
  return legal + dd + exchange + broker
}

export function calculateTotalOperationalCosts(project: Project): number {
  const monthlyListing = project.monthly_listing_fee || 0
  const compliance = (project.annual_compliance_costs || 0) / 12
  const accounting = (project.annual_accounting_costs || 0) / 12
  const months = project.holding_period_months || 12
  return (monthlyListing + compliance + accounting) * months
}

export function calculateTotalInvestment(project: Project): number {
  const purchase = project.purchase_price || 0
  const transaction = calculateTotalTransactionCosts(project)
  const operational = calculateTotalOperationalCosts(project)
  return purchase + transaction + operational
}

export function calculateNetProfit(project: Project): number {
  const selling = project.selling_price || 0
  const investment = calculateTotalInvestment(project)
  return selling - investment
}

export function calculateNetROI(project: Project): number {
  const netProfit = calculateNetProfit(project)
  const investment = calculateTotalInvestment(project)
  if (investment === 0) return 0
  return (netProfit / investment) * 100
}

export function getProjectPerformanceScore(project: Project): number {
  const roi = calculateProjectROI(project)
  const probability = project.probability || 0
  const hasBuyer = project.has_buyer ? 1 : 0
  const hasDownPayment = project.has_down_payment ? 1 : 0
  
  // Weighted score: ROI (40%), Probability (30%), Has Buyer (20%), Has Down Payment (10%)
  return (roi * 0.4) + (probability * 0.3) + (hasBuyer * 50 * 0.2) + (hasDownPayment * 50 * 0.1)
}

export function getStatusColor(status: string): string {
  const colors = {
    lead: 'bg-blue/10 text-blue border-blue/20',
    offer_submitted: 'bg-gold/10 text-gold border-gold/20',
    negotiation: 'bg-brand/10 text-brand border-brand/20',
    offer_accepted: 'bg-green-500/10 text-green-600 border-green-500/20',
    closed: 'bg-gold/20 text-gold border-gold/30'
  }
  return colors[status as keyof typeof colors] || colors.lead
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}
