'use client'

import { useState, useEffect, Suspense } from 'react'
import { getContacts } from '@/lib/actions'
import { Contact } from '@/lib/supabase'
import ContactForm from '@/components/ContactForm'
import Navigation from '@/components/Navigation'
import UserMenu from '@/components/UserMenu'

function ContactsPageContent() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showContactForm, setShowContactForm] = useState(false)

  const loadContacts = async () => {
    try {
      const contactsData = await getContacts()
      setContacts(contactsData)
    } catch (error) {
      console.error('Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-2 sm:px-4 lg:px-8">
          <div className="flex items-center h-14 md:h-16 relative">
            {/* Logo & Brand - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue to-brand rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-ink font-display">Kontakte</h1>
                  <p className="text-sm text-ink-soft font-medium">Kontakt-Management</p>
                </div>
              </div>
            </div>

            {/* Mobile Logo - Only icon */}
            <div className="md:hidden flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue to-brand rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-base">M</span>
              </div>
            </div>

            {/* Navigation - Centered */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-[calc(100%-80px)] sm:w-[calc(100%-120px)] md:w-auto">
              <Navigation />
            </div>

            {/* User Menu & Actions */}
            <div className="flex items-center space-x-1 md:space-x-4 ml-auto">
              <button
                onClick={() => setShowContactForm(true)}
                className="ci-button px-3 md:px-6 py-2 md:py-3 rounded-xl text-xs md:text-sm font-semibold hover:shadow-xl transition-all duration-200 md:mr-4"
              >
                <span className="hidden md:inline">+ Neuer Kontakt</span>
                <span className="md:hidden">+</span>
              </button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-2 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue/15 to-blue/25 group-hover:from-blue/25 group-hover:to-blue/35 transition-all duration-300">
                <svg className="h-6 w-6 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-medium text-ink-soft mb-1">Gesamt Kontakte</h3>
            <p className="text-3xl font-bold text-ink mb-2 font-display">
              {loading ? '...' : contacts.length}
            </p>
            <p className="text-xs text-ink-soft">Aktive Kontakte</p>
          </div>

          <div className="card p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-gold/15 to-gold/25 group-hover:from-gold/25 group-hover:to-gold/35 transition-all duration-300">
                <svg className="h-6 w-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-medium text-ink-soft mb-1">Unternehmen</h3>
            <p className="text-3xl font-bold text-ink mb-2 font-display">
              {loading ? '...' : new Set(contacts.map(c => c.company).filter(Boolean)).size}
            </p>
            <p className="text-xs text-ink-soft">Eindeutige Firmen</p>
          </div>

          <div className="card p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-brand/15 to-brand/25 group-hover:from-brand/25 group-hover:to-brand/35 transition-all duration-300">
                <svg className="h-6 w-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-medium text-ink-soft mb-1">E-Mail Kontakte</h3>
            <p className="text-3xl font-bold text-ink mb-2 font-display">
              {loading ? '...' : contacts.filter(c => c.email).length}
            </p>
            <p className="text-xs text-ink-soft">Mit E-Mail-Adresse</p>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="card overflow-hidden">
          <div className="px-8 py-6 border-b border-ink/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-ink font-display">Kontakt-Übersicht</h2>
                <p className="text-ink-soft mt-1">Verwalten Sie Ihre Geschäftskontakte</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Typ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Unternehmen</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Position</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">E-Mail</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Telefon</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Erstellt</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue mx-auto"></div>
                      <p className="text-ink-soft mt-2">Lade Kontakte...</p>
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-ink/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-ink">{contact.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          contact.contact_type === 'insolvency_admin' ? 'bg-blue/10 text-blue' :
                          contact.contact_type === 'broker' ? 'bg-gold/10 text-gold' :
                          contact.contact_type === 'lawyer' ? 'bg-purple-100 text-purple-800' :
                          contact.contact_type === 'buyer' ? 'bg-green-100 text-green-800' :
                          contact.contact_type === 'seller' ? 'bg-red-100 text-red-800' :
                          contact.contact_type === 'advisor' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {contact.contact_type === 'insolvency_admin' ? 'Insolvenzverwalter' :
                           contact.contact_type === 'broker' ? 'Makler' :
                           contact.contact_type === 'lawyer' ? 'Anwalt' :
                           contact.contact_type === 'buyer' ? 'Käufer' :
                           contact.contact_type === 'seller' ? 'Verkäufer' :
                           contact.contact_type === 'advisor' ? 'Berater' :
                           'Allgemein'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink">{contact.company || '-'}</td>
                      <td className="px-6 py-4 text-sm text-ink">{contact.position || '-'}</td>
                      <td className="px-6 py-4 text-sm text-ink">{contact.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-ink">{contact.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm text-ink-soft">
                        {new Date(contact.created_at).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="text-ink-soft hover:text-ink transition-colors">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="text-ink-soft hover:text-ink transition-colors">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactForm
          onSuccess={() => {
            setShowContactForm(false)
            loadContacts() // Reload contacts after successful creation
          }}
          onCancel={() => setShowContactForm(false)}
        />
      )}
    </div>
  )
}

export default function ContactsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-ink-soft">Lädt Kontakte...</div>
      </div>
    }>
      <ContactsPageContent />
    </Suspense>
  )
}
