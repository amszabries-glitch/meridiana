'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { ProjectAnalytics } from '@/lib/analytics'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface ValueChartProps {
  analytics: ProjectAnalytics
}

export default function ValueChart({ analytics }: ValueChartProps) {
  const statusLabels = {
    lead: 'Lead',
    offer_submitted: 'Angebot abgegeben',
    negotiation: 'Verhandlung',
    offer_accepted: 'Angebot angenommen',
    closed: 'Gewonnen'
  }

  const statusColors = {
    lead: 'rgba(44, 90, 120, 0.8)',
    offer_submitted: 'rgba(199, 167, 112, 0.8)',
    negotiation: 'rgba(24, 54, 74, 0.8)',
    offer_accepted: 'rgba(34, 197, 94, 0.8)',
    closed: 'rgba(199, 167, 112, 0.8)'
  }

  const data = {
    labels: Object.entries(analytics.valueByStatus)
      .sort(([,a], [,b]) => b - a)
      .map(([status]) => statusLabels[status as keyof typeof statusLabels] || status),
    datasets: [
      {
        label: 'Pipeline-Wert (Mio. €)',
        data: Object.entries(analytics.valueByStatus)
          .sort(([,a], [,b]) => b - a)
          .map(([, value]) => value / 1000000),
        backgroundColor: Object.entries(analytics.valueByStatus)
          .sort(([,a], [,b]) => b - a)
          .map(([status]) => statusColors[status as keyof typeof statusColors] || 'rgba(16, 34, 49, 0.8)'),
        borderColor: Object.entries(analytics.valueByStatus)
          .sort(([,a], [,b]) => b - a)
          .map(([status]) => 
            status === 'lead' ? 'rgb(44, 90, 120)' :
            status === 'offer_submitted' ? 'rgb(199, 167, 112)' :
            status === 'negotiation' ? 'rgb(24, 54, 74)' :
            status === 'offer_accepted' ? 'rgb(34, 197, 94)' :
            'rgb(199, 167, 112)'
          ),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Pipeline-Wert nach Status',
        font: {
          family: 'Playfair Display',
          size: 18,
          weight: 'bold' as const
        },
        color: '#102231'
      },
      tooltip: {
        backgroundColor: 'rgba(16, 34, 49, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgb(44, 90, 120)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return `Wert: €${context.parsed.y.toFixed(1)}M`
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Status',
          font: {
            family: 'Montserrat',
            size: 12,
            weight: 600 as const
          }
        },
        grid: {
          color: 'rgba(16, 34, 49, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Montserrat',
            size: 11
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Wert (Mio. €)',
          font: {
            family: 'Montserrat',
            size: 12,
            weight: 600 as const
          }
        },
        grid: {
          color: 'rgba(16, 34, 49, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Montserrat',
            size: 11
          },
          callback: function(value: any) {
            return '€' + value + 'M'
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const
    }
  }

  return (
    <div className="card p-6">
      <div className="h-80">
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}
