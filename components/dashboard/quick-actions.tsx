'use client'

import { Button } from '@/components/ui/button'
import { Plus, Users, FileText, Calendar, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      title: 'Neuer Deal',
      description: 'Erstelle einen neuen Deal',
      icon: Plus,
      onClick: () => router.push('/deals/new'),
      color: 'bg-meridiana-600 hover:bg-meridiana-700',
    },
    {
      title: 'Kontakt hinzufügen',
      description: 'Neuen Kontakt erstellen',
      icon: Users,
      onClick: () => router.push('/contacts/new'),
      color: 'bg-success-600 hover:bg-success-700',
    },
    {
      title: 'Aktivität',
      description: 'Neue Aktivität planen',
      icon: Calendar,
      onClick: () => router.push('/activities/new'),
      color: 'bg-warning-600 hover:bg-warning-700',
    },
    {
      title: 'Bericht',
      description: 'Performance-Bericht erstellen',
      icon: TrendingUp,
      onClick: () => router.push('/reports'),
      color: 'bg-danger-600 hover:bg-danger-700',
    },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Schnellaktionen</h2>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start p-4 h-auto hover:bg-slate-50"
            onClick={action.onClick}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${action.color} text-white`}>
                <action.icon className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-900">{action.title}</p>
                <p className="text-sm text-slate-600">{action.description}</p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}
