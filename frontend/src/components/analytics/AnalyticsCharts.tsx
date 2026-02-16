import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ReactNode } from 'react'

const COLORS = ['#3b82f6', '#22c55e', '#a8a29e', '#f59e0b', '#8b5cf6', '#ec4899']

export function PlacementTrendChart({ data }: { data: { date: string; placements: number }[] }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-stone-900 mb-4">Placement Trends</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#a8a29e" />
          <YAxis tick={{ fontSize: 12 }} stroke="#a8a29e" />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 13 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="placements" stroke={COLORS[0]} strokeWidth={2} dot={false} name="Placements" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SpecialtyDemandChart({ data }: { data: { specialty: string; demand: number }[] }) {
  const top = data.slice(0, 10)
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-stone-900 mb-4">Specialty Demand</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={top} layout="vertical" margin={{ left: 80 }}>
          <XAxis type="number" tick={{ fontSize: 12 }} stroke="#a8a29e" />
          <YAxis dataKey="specialty" type="category" tick={{ fontSize: 11 }} stroke="#a8a29e" width={80} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 13 }} />
          <Bar dataKey="demand" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Applications" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PlacementFunnelChart({ applied, accepted, completed }: { applied: number; accepted: number; completed: number }) {
  const data = [
    { name: 'Applied', value: applied },
    { name: 'Accepted', value: accepted },
    { name: 'Completed', value: completed },
  ]
  const colors = ['#3b82f6', '#22c55e', '#a8a29e']

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-stone-900 mb-4">Placement Funnel</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
            {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 13 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MetricCard({ label, value, change, icon }: { label: string; value: string | number; change?: string; icon?: ReactNode }) {
  const isPositive = change?.startsWith('+')
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</p>
        {icon && <div className="text-stone-400">{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-stone-900 mt-2">{value}</p>
      {change && (
        <p className={`text-xs mt-1 font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>{change} vs previous period</p>
      )}
    </div>
  )
}

export function GeoDemandTable({ data }: { data: { state: string; count: number }[] }) {
  const sorted = [...data].sort((a, b) => b.count - a.count)
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-stone-900 mb-4">Demand by State</h3>
      <div className="max-h-[280px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left py-2 text-xs font-medium text-stone-500">State</th>
              <th className="text-right py-2 text-xs font-medium text-stone-500">Applications</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(s => (
              <tr key={s.state} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                <td className="py-2 text-stone-700">{s.state}</td>
                <td className="py-2 text-right font-medium text-stone-900">{s.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <p className="text-center text-stone-400 text-sm py-8">No geographic data available</p>}
      </div>
    </div>
  )
}
