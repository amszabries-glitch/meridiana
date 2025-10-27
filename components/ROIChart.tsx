'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ROIChartProps {
  analytics: ProjectAnalytics
}

export default function ROIChart({ analytics }: ROIChartProps) {
  const data = {
    labels: analytics.monthlyTrend.map(item => item.month),
    datasets: [
      {
        label: 'ROI (%)',
        data: analytics.monthlyTrend.map(item => item.roi),
        borderColor: 'rgb(44, 90, 120)', // blue
        backgroundColor: 'rgba(44, 90, 120, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(44, 90, 120)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Pipeline-Wert (Mio. €)',
        data: analytics.monthlyTrend.map(item => item.value / 1000000),
        borderColor: 'rgb(199, 167, 112)', // gold
        backgroundColor: 'rgba(199, 167, 112, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: 'rgb(199, 167, 112)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        yAxisID: 'y1',
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
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
        text: 'ROI-Trend & Pipeline-Entwicklung',
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
            if (context.datasetIndex === 0) {
              return `ROI: ${context.parsed.y.toFixed(1)}%`
            } else {
              return `Pipeline-Wert: €${context.parsed.y.toFixed(1)}M`
            }
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
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'ROI (%)',
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
            return value + '%'
          }
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Pipeline-Wert (Mio. €)',
          font: {
            family: 'Montserrat',
            size: 12,
            weight: 600 as const
          }
        },
        grid: {
          drawOnChartArea: false,
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
    }
  }

  return (
    <div className="card p-6">
      <div className="h-96">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
