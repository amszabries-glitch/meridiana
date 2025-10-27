'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Demo mode - simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const fetchUserProfile = async (userId: string) => {
    // Demo implementation
    const demoUser: User = {
      id: userId,
      email: 'demo@meridiana.com',
      full_name: 'Demo Benutzer',
      avatar_url: null,
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setUser(demoUser)
  }

  const signOut = async () => {
    setUser(null)
  }

  return {
    user,
    loading,
    signOut,
    supabase
  }
}
