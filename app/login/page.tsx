'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('Login attempt started:', { email })

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Auth response:', { data, error: authError })

      if (authError) {
        console.error('Auth error details:', authError)
        setError(`Fehler: ${authError.message}`)
        return
      }

      if (data.user && data.session) {
        console.log('User authenticated:', data.user.email)
        console.log('Session:', data.session)
        
        // Wait a moment for session to be stored
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Navigate to dashboard
        window.location.href = '/dashboard'
      } else {
        setError('Keine Benutzerdaten erhalten')
        console.error('No user data received')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(`Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue to-brand rounded-2xl mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <h1 className="text-3xl font-bold text-ink font-display mb-2">Willkommen bei Meridiana</h1>
          <p className="text-ink-soft">Bitte melden Sie sich an, um fortzufahren</p>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                E-Mail-Adresse *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                placeholder="ihre@email.de"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Passwort *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-ink/20 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full ci-button py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Anmelden...' : 'Anmelden'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-ink-soft">
            © 2024 Meridiana. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </div>
  )
}

