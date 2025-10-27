'use client'

import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js'
import { ProjectAnalytics } from '@/lib/analytics'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title)

interface PipelineChartProps {
  analytics: ProjectAnalytics
}

export default function PipelineChart({ analytics }: PipelineChartProps) {
  const statusLabels = {
    lead: 'Lead',
    offer_submitted: 'Angebot abgegeben',
    negotiation: 'Verhandlung',
    offer_accepted: 'Angebot angenommen',
    closed: 'Gewonnen'
  }

  const statusColors = {
    lead: 'rgb(44, 90, 120)', // blue
    offer_submitted: 'rgb(199, 167, 112)', // gold
    negotiation: 'rgb(24, 54, 74)', // brand
    offer_accepted: 'rgb(34, 197, 94)', // green
    closed: 'rgb(199, 167, 112)' // gold
  }

  const data = {
    labels: Object.entries(analytics.statusDistribution).map(([status]) => 
      statusLabels[status as keyof typeof statusLabels] || status
    ),
    datasets: [
      {
        data: Object.values(analytics.statusDistribution),
        backgroundColor: Object.keys(analytics.statusDistribution).map(status => 
          statusColors[status as keyof typeof statusColors] || 'rgb(16, 34, 49)'
        ),
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 8
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'Montserrat',
            size: 12,
            weight: 600 as const
          }
        }
      },
      title: {
        display: true,
        text: 'Pipeline-Verteilung',
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
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.label}: ${context.parsed} (${percentage}%)`
          }
        }
      }
    },
    cutout: '60%',
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000
    }
  }

  return (
    <div className="card p-6">
      <div className="h-80">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  )
}
