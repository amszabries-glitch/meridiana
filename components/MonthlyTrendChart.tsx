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

interface MonthlyTrendChartProps {
  analytics: ProjectAnalytics
}

export default function MonthlyTrendChart({ analytics }: MonthlyTrendChartProps) {
  const data = {
    labels: analytics.monthlyTrend.map(item => item.month),
    datasets: [
      {
        label: 'Investition (Mio. €)',
        data: analytics.monthlyTrend.map(item => item.investment / 1000000),
        backgroundColor: 'rgba(44, 90, 120, 0.6)',
        borderColor: 'rgb(44, 90, 120)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Pipeline-Wert (Mio. €)',
        data: analytics.monthlyTrend.map(item => item.value / 1000000),
        backgroundColor: 'rgba(199, 167, 112, 0.6)',
        borderColor: 'rgb(199, 167, 112)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'Montserrat',
            size: 12,
            weight: '600' as const
          }
        }
      },
      title: {
        display: true,
        text: 'Monatliche Investition vs. Pipeline-Wert',
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
            const label = context.dataset.label || ''
            const value = context.parsed.y
            return `${label}: €${value.toFixed(1)}M`
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Monat',
          font: {
            family: 'Montserrat',
            size: 12,
            weight: '600' as const
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
            weight: '600' as const
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
