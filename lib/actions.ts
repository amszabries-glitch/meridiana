'use server'

import { createSupabaseServerClient } from './supabase-server'
import { Project, Contact, Document, DocumentVersion, ProjectStatusHistory, Milestone, AvailableShell } from './supabase'

// Type helpers
type NewDocument = Omit<Document, 'id' | 'created_at' | 'updated_at'>
type NewDocumentVersion = Omit<DocumentVersion, 'id' | 'created_at'>
import { revalidatePath } from 'next/cache'

// Project Actions
export async function getProjects(): Promise<Project[]> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data || []
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  // Clean up the project data - convert empty strings to null for optional fields
  const cleanedProject = {
    ...project,
    // Convert empty strings to null for optional fields
    insolvency_admin_name: project.insolvency_admin_name || null,
    insolvency_admin_email: project.insolvency_admin_email || null,
    insolvency_admin_phone: project.insolvency_admin_phone || null,
    insolvency_admin_company: project.insolvency_admin_company || null,
    insolvency_court: project.insolvency_court || null,
    insolvency_case_number: project.insolvency_case_number || null,
    insolvency_filing_date: project.insolvency_filing_date || null,
    next_steps: project.next_steps || null,
    timeline: project.timeline || null,
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('projects')
    .insert([cleanedProject])
    .select()

  if (error) {
    console.error('Error creating project:', error)
    throw new Error('Failed to create project')
  }

  return data[0]
}

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }

  return data
}

export async function updateProject(id: string, updates: Partial<Project>) {
  // Clean up the updates - convert empty strings to null for optional fields
  const cleanedUpdates = {
    ...updates,
    // Convert empty strings to null for optional fields
    ...(updates.insolvency_admin_name !== undefined && { insolvency_admin_name: updates.insolvency_admin_name || null }),
    ...(updates.insolvency_admin_email !== undefined && { insolvency_admin_email: updates.insolvency_admin_email || null }),
    ...(updates.insolvency_admin_phone !== undefined && { insolvency_admin_phone: updates.insolvency_admin_phone || null }),
    ...(updates.insolvency_admin_company !== undefined && { insolvency_admin_company: updates.insolvency_admin_company || null }),
    ...(updates.insolvency_court !== undefined && { insolvency_court: updates.insolvency_court || null }),
    ...(updates.insolvency_case_number !== undefined && { insolvency_case_number: updates.insolvency_case_number || null }),
    ...(updates.insolvency_filing_date !== undefined && { insolvency_filing_date: updates.insolvency_filing_date || null }),
    ...(updates.next_steps !== undefined && { next_steps: updates.next_steps || null }),
    ...(updates.timeline !== undefined && { timeline: updates.timeline || null }),
  }

  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('projects')
    .update({ ...cleanedUpdates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating project:', error)
    throw new Error('Failed to update project')
  }

  revalidatePath('/dashboard')
  revalidatePath('/projects')
  return data[0]
}

export async function deleteProject(id: string) {
  const supabase = await createSupabaseServerClient()
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting project:', error)
    throw new Error('Failed to delete project')
  }

  revalidatePath('/dashboard')
  revalidatePath('/projects')
}


// Contact Actions
export async function getContacts(): Promise<Contact[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contacts:', error)
    return []
  }

  return data || []
}

export async function getContactsByType(contactType: string): Promise<Contact[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('contact_type', contactType)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching contacts by type:', error)
    return []
  }

  return data || []
}

export async function createContact(contact: Omit<Contact, 'id' | 'created_at'>) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('contacts')
    .insert([contact])
    .select()

  if (error) {
    console.error('Error creating contact:', error)
    throw new Error('Failed to create contact')
  }

  return data[0]
}

// Dashboard Analytics
export async function getDashboardStats() {
  const supabase = await createSupabaseServerClient()
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select('status, selling_price, purchase_price, created_at')

  if (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalValue: 0,
      activeProjects: 0,
      winRate: 0,
      avgValue: 0
    }
  }

  const totalValue = projects
    .filter(p => p.status !== 'closed')
    .reduce((sum, p) => sum + (p.selling_price || 0), 0)

  const activeProjects = projects.filter(p => p.status !== 'closed').length

  const closedProjects = projects.filter(p => p.status === 'closed')
  const totalProjects = projects.length
  const winRate = totalProjects > 0 ? (closedProjects.length / totalProjects) * 100 : 0

  const avgValue = activeProjects > 0 ? totalValue / activeProjects : 0

  return {
    totalValue,
    activeProjects,
    winRate,
    avgValue
  }
}

// --- Document Actions ---
export async function getDocuments(): Promise<Document[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      projects:project_id(name, company_name),
      contacts:contact_id(name, company)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    return []
  }
  return data
}

export async function getDocumentsByProject(projectId: string): Promise<Document[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents by project:', error)
    return []
  }
  return data
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      projects:project_id(name, company_name),
      contacts:contact_id(name, company)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching document by ID:', error)
    return null
  }
  return data
}

export async function createDocument(document: NewDocument) {
  console.log('Creating document with data:', {
    name: document.name,
    project_id: document.project_id,
    contact_id: document.contact_id,
    file_path: document.file_path
  })
  
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('documents')
    .insert(document)
    .select()
    .single()

  if (error) {
    console.error('Error creating document:', error)
    throw error
  }
  
  console.log('Document created successfully:', data.id)
  
  // Revalidate all relevant paths
  revalidatePath('/dashboard')
  if (document.project_id) {
    revalidatePath(`/projects/${document.project_id}`)
  }
  
  return data
}

export async function updateDocument(id: string, updates: Partial<Document>) {
  // First get the document to find its project_id
  const document = await getDocumentById(id)
  
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating document:', error)
    throw error
  }
  
  revalidatePath('/dashboard')
  if (document?.project_id) {
    revalidatePath(`/projects/${document.project_id}`)
  }
  
  return data
}

export async function deleteDocument(id: string) {
  const supabase = await createSupabaseServerClient()
  
  // First get the document to find its project_id before deletion
  const document = await getDocumentById(id)
  
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting document:', error)
    throw error
  }
  
  revalidatePath('/dashboard')
  if (document?.project_id) {
    revalidatePath(`/projects/${document.project_id}`)
  }
}

export async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false })

  if (error) {
    console.error('Error fetching document versions:', error)
    return []
  }
  return data
}

export async function createDocumentVersion(version: NewDocumentVersion) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('document_versions')
    .insert(version)
    .select()
    .single()

  if (error) {
    console.error('Error creating document version:', error)
    throw error
  }
  revalidatePath('/documents')
  return data
}

// Project Status History Actions
export async function getProjectStatusHistory(projectId: string): Promise<ProjectStatusHistory[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('project_status_history')
    .select('*')
    .eq('project_id', projectId)
    .order('changed_at', { ascending: false })

  if (error) {
    console.error('Error fetching project status history:', error)
    return []
  }

  return data || []
}

export async function createStatusHistoryEntry(
  projectId: string,
  oldStatus: string | undefined,
  newStatus: string,
  notes?: string
): Promise<ProjectStatusHistory | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('project_status_history')
    .insert({
      project_id: projectId,
      old_status: oldStatus,
      new_status: newStatus,
      notes: notes,
      changed_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating status history entry:', error)
    return null
  }

  return data
}

// Milestone Actions
export async function getMilestonesByProject(projectId: string): Promise<Milestone[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })
    .order('target_date', { ascending: true })

  if (error) {
    console.error('Error fetching milestones:', error)
    return []
  }

  return data || []
}

export async function createMilestone(milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('milestones')
    .insert([milestone])
    .select()
    .single()

  if (error) {
    console.error('Error creating milestone:', error)
    throw new Error('Failed to create milestone')
  }

  revalidatePath(`/projects/${milestone.project_id}`)
  return data
}

export async function updateMilestone(id: string, updates: Partial<Milestone>) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('milestones')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating milestone:', error)
    throw new Error('Failed to update milestone')
  }

  revalidatePath(`/projects/${updates.project_id}`)
  return data
}

export async function deleteMilestone(id: string, projectId: string) {
  const supabase = await createSupabaseServerClient()
  
  const { error } = await supabase
    .from('milestones')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting milestone:', error)
    throw new Error('Failed to delete milestone')
  }

  revalidatePath(`/projects/${projectId}`)
}

// Available Shells Market Actions
export async function getAvailableShells(): Promise<AvailableShell[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('available_shells')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching available shells:', error)
    return []
  }

  return data || []
}

export async function addAvailableShell(shell: Omit<AvailableShell, 'id' | 'created_at' | 'updated_at'>): Promise<AvailableShell> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('available_shells')
    .insert(shell)
    .select()
    .single()

  if (error) {
    console.error('Error adding available shell:', error)
    throw new Error('Failed to add available shell')
  }

  revalidatePath('/dashboard')
  return data
}

export async function updateAvailableShell(id: string, updates: Partial<Omit<AvailableShell, 'id' | 'created_at' | 'updated_at'>>): Promise<AvailableShell> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('available_shells')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating available shell:', error)
    throw new Error('Failed to update available shell')
  }

  revalidatePath('/dashboard')
  return data
}

export async function deleteAvailableShell(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient()
  
  const { error } = await supabase
    .from('available_shells')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting available shell:', error)
    throw new Error('Failed to delete available shell')
  }

  revalidatePath('/dashboard')
}

export async function getAvailableShellById(id: string): Promise<AvailableShell | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('available_shells')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching available shell:', error)
    return null
  }

  return data
}
