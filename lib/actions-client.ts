'use client'

import { supabase } from './supabase'
import { ProjectDownPayment, ProjectDeposit, Project, Document, Contact } from './supabase'

export async function getDownPaymentsByProjectClient(projectId: string): Promise<ProjectDownPayment[]> {
  const { data, error } = await supabase
    .from('project_down_payments')
    .select('*')
    .eq('project_id', projectId)
    .order('idx', { ascending: true })

  if (error) {
    console.error('Error fetching down payments (client):', error)
    return []
  }
  return (data as ProjectDownPayment[]) || []
}

export async function upsertDownPaymentsClient(
  projectId: string,
  entries: Array<Omit<ProjectDownPayment, 'id' | 'project_id' | 'created_at' | 'updated_at'>>
): Promise<ProjectDownPayment[]> {
  const sanitized = entries
    .filter(e => e.idx >= 1 && e.idx <= 5)
    .slice(0, 5)
    .map(e => ({ ...e, project_id: projectId }))

  const { data, error } = await supabase
    .from('project_down_payments')
    .upsert(sanitized, { onConflict: 'project_id,idx' })
    .select('*')

  if (error) {
    console.error('Error upserting down payments (client):', error)
    throw error
  }
  return (data as ProjectDownPayment[]) || []
}

export async function getDepositsByProjectClient(projectId: string): Promise<ProjectDeposit[]> {
  const { data, error } = await supabase
    .from('project_deposits')
    .select('*')
    .eq('project_id', projectId)
    .order('idx', { ascending: true })

  if (error) {
    console.error('Error fetching deposits (client):', error)
    return []
  }
  return (data as ProjectDeposit[]) || []
}

export async function upsertDepositsClient(
  projectId: string,
  entries: Array<Omit<ProjectDeposit, 'id' | 'project_id' | 'created_at' | 'updated_at'>>
): Promise<ProjectDeposit[]> {
  const sanitized = entries
    .filter(e => e.idx >= 1 && e.idx <= 3)
    .slice(0, 3)
    .map(e => ({ ...e, project_id: projectId }))

  const { data, error } = await supabase
    .from('project_deposits')
    .upsert(sanitized, { onConflict: 'project_id,idx' })
    .select('*')

  if (error) {
    console.error('Error upserting deposits (client):', error)
    throw error
  }
  return (data as ProjectDeposit[]) || []
}

export async function getPaymentDeltaClient(projectId: string): Promise<{ downPaymentsSum: number; depositsSum: number; delta: number; }>{
  const [downs, deps] = await Promise.all([
    getDownPaymentsByProjectClient(projectId),
    getDepositsByProjectClient(projectId)
  ])
  const downPaymentsSum = downs.reduce((s, r) => s + (Number(r.amount) || 0), 0)
  const depositsSum = deps.reduce((s, r) => s + (Number(r.amount) || 0), 0)
  return { downPaymentsSum, depositsSum, delta: downPaymentsSum - depositsSum }
}

// Project + Documents (client-side)
export async function getProjectByIdClient(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    console.error('Error fetching project (client):', error)
    return null
  }
  return data as Project
}

export async function getDocumentsByProjectClient(projectId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching documents (client):', error)
    return []
  }
  return (data as Document[]) || []
}

export async function getBuyerForProjectClient(projectId: string): Promise<Contact | null> {
  const { data, error } = await supabase
    .from('project_contacts')
    .select('contact_id, contacts:contact_id(*)')
    .eq('project_id', projectId)
    .eq('role', 'buyer')
    .limit(1)
    .single()

  if (error) {
    // No buyer assigned is not an error; return null
    if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
      return null
    }
    console.error('Error fetching buyer (client):', error)
    return null
  }

  // @ts-expect-error nested select alias
  return (data?.contacts as Contact) || null
}

// Contacts (client-side)
export async function getContactByIdClient(contactId: string): Promise<Contact | null> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .single()
  if (error) {
    console.error('Error fetching contact (client):', error)
    return null
  }
  return data as Contact
}

export async function getProjectsByContactClient(contactId: string): Promise<Array<{ role: string; project: Project }>> {
  const { data, error } = await supabase
    .from('project_contacts')
    .select('role, project_id, projects:project_id(*)')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects for contact (client):', error)
    return []
  }

  return (data || []).map((row: any) => ({ role: row.role, project: (row as any).projects as Project }))
}


// Project contacts (client-side)
export async function upsertProjectContactClient(
  projectId: string,
  contactId: string,
  role: 'buyer' | 'insolvency_admin' | 'broker' | 'lawyer' | 'advisor' | 'seller' | 'general'
) {
  // Ensure only one per role for this project
  const { error: delErr } = await supabase
    .from('project_contacts')
    .delete()
    .eq('project_id', projectId)
    .eq('role', role)

  if (delErr) {
    console.warn('Cleanup project_contacts failed (non-fatal):', delErr)
  }

  const { data, error } = await supabase
    .from('project_contacts')
    .insert([{ project_id: projectId, contact_id: contactId, role }])
    .select('*')
    .single()

  if (error) {
    console.error('Error linking project_contact (client):', error)
    throw error
  }

  return data
}

export async function updateProjectClient(projectId: string, fields: Partial<Project>): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .update(fields)
    .eq('id', projectId)
    .select('*')
    .single()

  if (error) {
    console.error('Error updating project (client):', error)
    throw error
  }
  return data as Project
}


