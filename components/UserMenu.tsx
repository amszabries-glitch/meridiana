'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const userInitial = user?.email?.[0]?.toUpperCase() || 'U'
  const userName = user?.email?.split('@')[0] || 'Benutzer'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 pl-4 border-l border-ink/10"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue to-brand rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-sm">
            {userInitial}
          </span>
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-ink">{userName}</p>
          <p className="text-xs text-ink-soft">{user?.email || ''}</p>
        </div>
        <svg 
          className="h-4 w-4 text-ink-soft" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-ink/10 z-50">
            <div className="p-2">
              <div className="px-4 py-3 border-b border-ink/10">
                <p className="text-sm font-medium text-ink">{userName}</p>
                <p className="text-xs text-ink-soft">{user?.email}</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Abmelden</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

