'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center px-4">
      <div className="max-w-md w-full card p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-ink font-display mb-2">Etwas ist schiefgelaufen</h1>
          <p className="text-ink-soft mb-6">
            Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full ci-button"
          >
            Erneut versuchen
          </button>
          <Link
            href="/dashboard"
            className="block w-full ci-button-secondary text-center"
          >
            Zurück zum Dashboard
          </Link>
        </div>

        {error.message && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-ink-soft cursor-pointer hover:text-ink">
              Fehlerdetails anzeigen
            </summary>
            <pre className="mt-2 p-4 bg-ink/5 rounded-lg text-xs text-ink overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

