'use client'

import { PipelineData } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { useDashboard } from '@/hooks/useDashboard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface PipelineOverviewProps {
  pipeline: PipelineData[]
}

export function PipelineOverview({ pipeline }: PipelineOverviewProps) {
  const { getStatusColor, getStatusLabel } = useDashboard()

  const chartData = pipeline.map(item => ({
    name: getStatusLabel(item.status),
    value: item.value,
    count: item.count,
    color: getStatusColor(item.status)
  }))

  const pieData = pipeline.map(item => ({
    name: getStatusLabel(item.status),
    value: item.count,
    color: getStatusColor(item.status)
  }))

  const COLORS = chartData.map(item => item.color)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Pipeline Übersicht</h2>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-meridiana-500 rounded-full"></div>
          <span className="text-sm text-slate-600">Aktive Deals</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart - Pipeline Value */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-4">Pipeline Wert nach Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Wert']}
                  labelStyle={{ color: '#475569' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  fill="#0ea5e9"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Deal Count */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-4">Deal Verteilung</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'Deals']}
                  labelStyle={{ color: '#475569' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {pipeline.map((item, index) => (
            <div key={index} className="text-center">
              <div 
                className="w-4 h-4 rounded-full mx-auto mb-2"
                style={{ backgroundColor: getStatusColor(item.status) }}
              ></div>
              <p className="text-sm font-medium text-slate-900">{getStatusLabel(item.status)}</p>
              <p className="text-lg font-bold text-slate-700">{item.count}</p>
              <p className="text-xs text-slate-600">{formatCurrency(item.value)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
