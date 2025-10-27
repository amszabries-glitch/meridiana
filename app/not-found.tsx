import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center px-4">
      <div className="max-w-md w-full card p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-blue mb-4 font-display">404</div>
          <h1 className="text-2xl font-bold text-ink font-display mb-2">Seite nicht gefunden</h1>
          <p className="text-ink-soft mb-6">
            Die angeforderte Seite konnte nicht gefunden werden.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full ci-button"
          >
            Zurück zum Dashboard
          </Link>
          <Link
            href="/analytics"
            className="block w-full ci-button-secondary"
          >
            Zu Analytics
          </Link>
        </div>
      </div>
    </div>
  )
}

