'use client'

import { memo, useMemo } from 'react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { ProjectAnalytics } from '@/lib/analytics'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface OptimizedChartProps {
  analytics: ProjectAnalytics
  type: 'line' | 'bar' | 'doughnut'
  title: string
  height?: number
}

const OptimizedChart = memo(function OptimizedChart({ 
  analytics, 
  type, 
  title, 
  height = 320 
}: OptimizedChartProps) {
  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    const baseColors = {
      primary: 'rgb(44, 90, 120)',
      secondary: 'rgb(199, 167, 112)',
      success: 'rgb(34, 197, 94)',
      brand: 'rgb(24, 54, 74)',
      gold: 'rgb(199, 167, 112)'
    }

    const statusLabels = {
      lead: 'Lead',
      offer_submitted: 'Angebot abgegeben',
      negotiation: 'Verhandlung',
      offer_accepted: 'Angebot angenommen',
      closed: 'Gewonnen'
    }

    const statusColors = {
      lead: baseColors.primary,
      offer_submitted: baseColors.secondary,
      negotiation: baseColors.brand,
      offer_accepted: baseColors.success,
      closed: baseColors.gold
    }

    switch (type) {
      case 'line':
        return {
          labels: analytics.monthlyTrend.map(item => item.month),
          datasets: [
            {
              label: 'ROI (%)',
              data: analytics.monthlyTrend.map(item => item.roi),
              borderColor: baseColors.primary,
              backgroundColor: `${baseColors.primary}20`,
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: baseColors.primary,
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: 'Pipeline-Wert (Mio. €)',
              data: analytics.monthlyTrend.map(item => item.value / 1000000),
              borderColor: baseColors.secondary,
              backgroundColor: `${baseColors.secondary}20`,
              borderWidth: 3,
              fill: false,
              tension: 0.4,
              pointBackgroundColor: baseColors.secondary,
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              yAxisID: 'y1',
            }
          ]
        }

      case 'bar':
        return {
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
                .map(([status]) => `${statusColors[status as keyof typeof statusColors]}80`),
              borderColor: Object.entries(analytics.valueByStatus)
                .sort(([,a], [,b]) => b - a)
                .map(([status]) => statusColors[status as keyof typeof statusColors]),
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false,
            }
          ]
        }

      case 'doughnut':
        return {
          labels: Object.entries(analytics.statusDistribution).map(([status]) => 
            statusLabels[status as keyof typeof statusLabels] || status
          ),
          datasets: [
            {
              data: Object.values(analytics.statusDistribution),
              backgroundColor: Object.keys(analytics.statusDistribution).map(status => 
                statusColors[status as keyof typeof statusColors] || baseColors.primary
              ),
              borderColor: '#ffffff',
              borderWidth: 3,
              hoverBorderWidth: 4,
              hoverOffset: 6
            }
          ]
        }

      default:
        return { labels: [], datasets: [] }
    }
  }, [analytics, type])

  // Memoize chart options
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: type === 'doughnut' ? 'bottom' as const : 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 16,
          font: {
            family: 'Montserrat',
            size: 11,
            weight: 600 as const
          }
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          family: 'Playfair Display',
          size: 16,
          weight: 'bold' as 'bold'
        },
        color: '#102231'
      },
      tooltip: {
        backgroundColor: 'rgba(16, 34, 49, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgb(44, 90, 120)',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true,
        titleFont: {
          family: 'Montserrat',
          size: 12,
          weight: 600
        },
        bodyFont: {
          family: 'Montserrat',
          size: 11
        }
      }
    },
    scales: type !== 'doughnut' ? {
      x: {
        display: true,
        grid: {
          color: 'rgba(16, 34, 49, 0.08)',
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Montserrat',
            size: 10
          }
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(16, 34, 49, 0.08)',
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Montserrat',
            size: 10
          }
        }
      },
      ...(type === 'line' && {
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            font: {
              family: 'Montserrat',
              size: 10
            }
          }
        }
      })
    } : {},
    cutout: type === 'doughnut' ? '60%' : undefined,
    animation: {
      duration: 800,
      easing: 'easeInOutQuart' as const
    }
  }), [type, title])

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={chartData} options={chartOptions} />
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />
      default:
        return null
    }
  }

  return (
    <div className="card p-4">
      <div style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
    </div>
  )
})

export default OptimizedChart
