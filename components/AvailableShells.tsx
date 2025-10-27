'use client'

import { useEffect, useState } from 'react'
import { getAvailableShells } from '@/lib/actions'
import { AvailableShell } from '@/lib/supabase'

export default function AvailableShells() {
  const [shells, setShells] = useState<AvailableShell[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadShells()
  }, [])

  const loadShells = async () => {
    try {
      setLoading(true)
      const data = await getAvailableShells()
      setShells(data)
    } catch (error) {
      console.error('Error loading shells:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-ink-soft">Lade verfügbare Börsenmäntel...</p>
        </div>
      </div>
    )
  }

  if (shells.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-ink-soft">Keine verfügbaren Börsenmäntel gefunden.</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'negotiation':
        return 'bg-gold/10 text-gold border-gold/20'
      case 'reserved':
        return 'bg-ink/10 text-ink border-ink/20'
      default:
        return 'bg-ink/10 text-ink border-ink/20'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Verfügbar'
      case 'negotiation':
        return 'In Verhandlung'
      case 'reserved':
        return 'Reserviert'
      default:
        return status
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-ink font-display mb-1">Verfügbare Börsenmäntel</h2>
          <p className="text-sm text-ink-soft">Aktuelle Angebote am Markt</p>
        </div>
        <button className="ci-button px-6 py-2 rounded-lg font-semibold hover:shadow-xl transition-all duration-200">
          + Neues Angebot
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6 pb-6 border-b border-ink/10">
        <div>
          <p className="text-xs font-medium text-ink-soft uppercase tracking-wide mb-1">Gesamt</p>
          <p className="text-2xl font-bold text-ink font-display">{shells.length}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-soft uppercase tracking-wide mb-1">Verfügbar</p>
          <p className="text-2xl font-bold text-green-600 font-display">
            {shells.filter(s => s.status === 'available').length}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-soft uppercase tracking-wide mb-1">Ø Börsenwert</p>
          <p className="text-2xl font-bold text-ink font-display">
            {formatCurrency(shells.reduce((sum, s) => sum + (s.market_cap || 0), 0) / shells.length)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-soft uppercase tracking-wide mb-1">Gesamt-Wert</p>
          <p className="text-2xl font-bold text-gold font-display">
            {formatCurrency(shells.reduce((sum, s) => sum + (s.asking_price || s.market_cap || 0), 0))}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink/10">
              <th className="text-left py-3 px-4 text-xs font-semibold text-ink uppercase tracking-wide">Name</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-ink uppercase tracking-wide">Börse</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-ink uppercase tracking-wide">Sektor</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-ink uppercase tracking-wide">Börsenwert</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-ink uppercase tracking-wide">Verlangt</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-ink uppercase tracking-wide">Status</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-ink uppercase tracking-wide">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {shells.map((shell) => (
              <tr key={shell.id} className="border-b border-ink/5 hover:bg-ink/5 transition-colors">
                <td className="py-3 px-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{shell.name}</p>
                    <p className="text-xs text-ink-soft">Auflistung: {shell.listing_date}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs font-medium text-ink">{shell.exchange}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs text-ink-soft">{shell.sector}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <p className="text-sm font-semibold text-ink">{shell.market_cap ? formatCurrency(shell.market_cap) : '—'}</p>
                </td>
                <td className="py-3 px-4 text-right">
                  <p className="text-sm font-semibold text-gold">
                    {shell.asking_price ? formatCurrency(shell.asking_price) : '—'}
                  </p>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(shell.status)}`}>
                    {getStatusLabel(shell.status)}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button className="text-blue hover:text-blue/80 text-xs font-semibold">
                    Anfragen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue/5 border border-blue/20 rounded-lg">
        <p className="text-xs text-ink-soft">
          <strong className="text-ink">Hinweis:</strong> Die Verfügbarkeit von Börsenmänteln ändert sich täglich. 
          Diese Übersicht zeigt momentan verfügbare Angebote. Für Details bitte Anfrage senden.
        </p>
      </div>
    </div>
  )
}

