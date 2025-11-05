'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Contact, Project } from '@/lib/supabase'
import { getContactByIdClient, getProjectsByContactClient } from '@/lib/actions-client'

export default function ContactDetailPage() {
  const params = useParams()
  const contactId = params.id as string

  const [contact, setContact] = useState<Contact | null>(null)
  const [links, setLinks] = useState<Array<{ role: string; project: Project }>>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [c, l] = await Promise.all([
        getContactByIdClient(contactId),
        getProjectsByContactClient(contactId),
      ])
      setContact(c)
      setLinks(l)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (contactId) load()
  }, [contactId])

  const grouped = links.reduce<Record<string, Project[]>>((acc, { role, project }) => {
    if (!acc[role]) acc[role] = []
    acc[role].push(project)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-ink-soft">Lade Kontakt…</div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ink mb-4">Kontakt nicht gefunden</h1>
          <Link href="/contacts" className="ci-button">Zurück zu Kontakte</Link>
        </div>
      </div>
    )
  }

  const typeLabel = (t?: string) => (
    t === 'insolvency_admin' ? 'Insolvenzverwalter' :
    t === 'broker' ? 'Makler' :
    t === 'lawyer' ? 'Anwalt' :
    t === 'buyer' ? 'Käufer' :
    t === 'seller' ? 'Verkäufer' :
    t === 'advisor' ? 'Berater' : 'Allgemein'
  )

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16 relative">
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link href="/contacts" className="p-1.5 md:p-2 text-ink-soft hover:text-ink transition-colors">
                <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-ink font-display">{contact.name}</h1>
                <p className="text-xs md:text-sm text-ink-soft font-medium">{typeLabel(contact.contact_type)}</p>
              </div>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
              <Navigation />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-2 sm:px-4 lg:px-8 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Contact card */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue to-brand text-white flex items-center justify-center font-bold text-lg">
                  {contact.name?.slice(0,1) || 'C'}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-ink truncate">{contact.name}</h2>
                  <p className="text-ink-soft text-sm truncate">{contact.position || '—'}</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-soft">Unternehmen</span>
                  <span className="text-ink font-medium">{contact.company || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-soft">E-Mail</span>
                  <a className="text-blue hover:underline" href={contact.email ? `mailto:${contact.email}` : undefined}>{contact.email || '—'}</a>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-soft">Telefon</span>
                  <a className="text-ink hover:text-ink-soft" href={contact.phone ? `tel:${contact.phone}` : undefined}>{contact.phone || '—'}</a>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-soft">Erstellt</span>
                  <span className="text-ink">{new Date(contact.created_at).toLocaleDateString('de-DE')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Projects by role */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-4">Zugeordnete Projekte</h3>
              {Object.keys(grouped).length === 0 ? (
                <p className="text-ink-soft">Keine Projekte verknüpft.</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(grouped).map(([role, projects]) => (
                    <div key={role}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
                          {role === 'buyer' ? 'Käufer' : role === 'insolvency_admin' ? 'Insolvenzverwalter' : role}
                        </p>
                        <span className="text-xs text-ink-soft">{projects.length} Projekt(e)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {projects.map(p => (
                          <Link key={p.id} href={`/projects/${p.id}`} className="block rounded-xl border border-ink/10 hover:border-blue/40 hover:shadow-md transition-all p-4">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-ink truncate">{p.name}</p>
                                <p className="text-xs text-ink-soft truncate">{p.company_name}</p>
                              </div>
                              <span className="px-2 py-1 text-xs rounded-full bg-ink/5 text-ink-soft">{p.status}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


