import { Project, Contact } from './supabase'
import { ProjectAnalytics } from './analytics'

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf'
  includeAnalytics?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

export function exportProjectsToCSV(projects: Project[]): string {
  const headers = [
    'Name',
    'Unternehmen',
    'Status',
    'Käufer',
    'Anzahlung',
    'Kaufpreis (€)',
    'Verkaufspreis (€)',
    'ROI (%)',
    'Wahrscheinlichkeit (%)',
    'Nächste Schritte',
    'Timeline',
    'Erstellt am'
  ]

  const rows = projects.map(project => {
    const roi = project.purchase_price && project.purchase_price > 0 
      ? ((project.selling_price || 0) - project.purchase_price) / project.purchase_price * 100 
      : 0

    return [
      project.name,
      project.company_name,
      project.status,
      project.has_buyer ? 'Ja' : 'Nein',
      project.has_down_payment ? 'Ja' : 'Nein',
      project.purchase_price?.toLocaleString() || '0',
      project.selling_price?.toLocaleString() || '0',
      roi.toFixed(2),
      project.probability?.toString() || '0',
      project.next_steps || '',
      project.timeline || '',
      new Date(project.created_at).toLocaleDateString('de-DE')
    ]
  })

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n')

  return csvContent
}

export function exportContactsToCSV(contacts: Contact[]): string {
  const headers = [
    'Name',
    'E-Mail',
    'Telefon',
    'Unternehmen',
    'Position',
    'Erstellt am'
  ]

  const rows = contacts.map(contact => [
    contact.name,
    contact.email || '',
    contact.phone || '',
    contact.company || '',
    contact.position || '',
    new Date(contact.created_at).toLocaleDateString('de-DE')
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n')

  return csvContent
}

export function exportAnalyticsToJSON(analytics: ProjectAnalytics): string {
  return JSON.stringify({
    ...analytics,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  }, null, 2)
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

export function exportProjects(projects: Project[], options: ExportOptions) {
  const timestamp = new Date().toISOString().split('T')[0]
  
  switch (options.format) {
    case 'csv':
      const csvContent = exportProjectsToCSV(projects)
      downloadFile(csvContent, `projekte-${timestamp}.csv`, 'text/csv')
      break
    case 'json':
      const jsonContent = JSON.stringify(projects, null, 2)
      downloadFile(jsonContent, `projekte-${timestamp}.json`, 'application/json')
      break
    default:
      throw new Error('Unsupported export format')
  }
}

export function exportContacts(contacts: Contact[], options: ExportOptions) {
  const timestamp = new Date().toISOString().split('T')[0]
  
  switch (options.format) {
    case 'csv':
      const csvContent = exportContactsToCSV(contacts)
      downloadFile(csvContent, `kontakte-${timestamp}.csv`, 'text/csv')
      break
    case 'json':
      const jsonContent = JSON.stringify(contacts, null, 2)
      downloadFile(jsonContent, `kontakte-${timestamp}.json`, 'application/json')
      break
    default:
      throw new Error('Unsupported export format')
  }
}

export function exportAnalytics(analytics: ProjectAnalytics, options: ExportOptions) {
  const timestamp = new Date().toISOString().split('T')[0]
  
  switch (options.format) {
    case 'json':
      const jsonContent = exportAnalyticsToJSON(analytics)
      downloadFile(jsonContent, `analytics-${timestamp}.json`, 'application/json')
      break
    default:
      throw new Error('Unsupported export format for analytics')
  }
}

export function generateReport(projects: Project[], contacts: Contact[], analytics: ProjectAnalytics): string {
  const reportDate = new Date().toLocaleDateString('de-DE')
  
  return `
# Meridiana CRM - Bericht
**Generiert am:** ${reportDate}

## Übersicht
- **Gesamtprojekte:** ${projects.length}
- **Aktive Projekte:** ${analytics.activeProjects}
- **Abgeschlossene Projekte:** ${analytics.closedProjects}
- **Pipeline-Wert:** €${analytics.totalValue.toLocaleString()}
- **Gesamt-ROI:** ${analytics.totalROI.toFixed(1)}%
- **Gewinnrate:** ${analytics.winRate.toFixed(1)}%

## Status-Verteilung
${Object.entries(analytics.statusDistribution)
  .map(([status, count]) => `- **${status}:** ${count} Projekte`)
  .join('\n')}

## Top-Projekte nach Wert
${projects
  .sort((a, b) => (b.selling_price || 0) - (a.selling_price || 0))
  .slice(0, 5)
  .map((project, index) => 
    `${index + 1}. **${project.name}** - €${(project.selling_price || 0).toLocaleString()} (${project.status})`
  )
  .join('\n')}

## Kontakte
- **Gesamtkontakte:** ${contacts.length}
- **Mit E-Mail:** ${contacts.filter(c => c.email).length}
- **Eindeutige Unternehmen:** ${new Set(contacts.map(c => c.company).filter(Boolean)).size}

---
*Bericht generiert von Meridiana CRM*
  `.trim()
}
