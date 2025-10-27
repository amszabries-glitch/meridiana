'use client'

import { createContext, useContext, ReactNode } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

const SupabaseContext = createContext<ReturnType<typeof createSupabaseClient> | null>(null)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const supabase = createSupabaseClient()
  
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SupabaseProvider>
      {children}
    </SupabaseProvider>
  )
}
