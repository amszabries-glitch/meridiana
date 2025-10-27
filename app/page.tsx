export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue to-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">M</span>
        </div>
        <h1 className="text-3xl font-bold text-ink mb-2 font-display">Meridiana CRM</h1>
        <p className="text-ink-soft mb-8">Capital Markets Deal Management</p>

        <div className="space-y-4">
          <a
            href="/dashboard"
            className="ci-button px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Dashboard öffnen
          </a>
          <div className="text-sm text-ink-soft">
            Demo-Modus - Alle Daten sind simuliert
          </div>
        </div>
      </div>
    </div>
  )
}
