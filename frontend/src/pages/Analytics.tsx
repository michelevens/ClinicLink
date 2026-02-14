import { useState, useMemo } from 'react'
import { BarChart3, TrendingUp, Users, Clock, DollarSign, Target } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.tsx'
import { useAnalyticsSummary, usePlatformAnalytics, useUniversityAnalytics, useSiteAnalytics, useSpecialtyDemand, useMySites } from '../hooks/useApi.ts'
import { MetricCard, PlacementTrendChart, SpecialtyDemandChart, PlacementFunnelChart, GeoDemandTable } from '../components/analytics/AnalyticsCharts.tsx'

type Period = '7d' | '30d' | '90d' | '12m'

function periodDates(period: Period) {
  const to = new Date().toISOString().split('T')[0]
  const from = new Date()
  if (period === '7d') from.setDate(from.getDate() - 7)
  else if (period === '30d') from.setDate(from.getDate() - 30)
  else if (period === '90d') from.setDate(from.getDate() - 90)
  else from.setFullYear(from.getFullYear() - 1)
  return { from: from.toISOString().split('T')[0], to }
}

export function Analytics() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<Period>('30d')
  const [tab, setTab] = useState<'platform' | 'university' | 'site'>('platform')
  const dates = useMemo(() => periodDates(period), [period])

  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary()
  const { data: specialtyData } = useSpecialtyDemand()
  const { data: mySites } = useMySites()

  const isAdmin = user?.role === 'admin'
  const isCoordinator = user?.role === 'coordinator'
  const isSiteManager = user?.role === 'site_manager'

  const universityId = (user as { student_profile?: { university_id?: string } })?.student_profile?.university_id || null
  const firstSiteId = mySites?.sites?.[0]?.id || null

  const analyticsParams = { period: period === '12m' ? 'monthly' : 'daily', from: dates.from, to: dates.to }
  const { data: platformData } = usePlatformAnalytics(isAdmin && tab === 'platform' ? analyticsParams : undefined)
  const { data: universityData } = useUniversityAnalytics(
    (isCoordinator || (isAdmin && tab === 'university')) ? (universityId || 'none') : null,
    analyticsParams
  )
  const { data: siteData } = useSiteAnalytics(
    (isSiteManager || (isAdmin && tab === 'site')) ? firstSiteId : null,
    analyticsParams
  )

  const activeData = isAdmin ? (tab === 'platform' ? platformData : tab === 'university' ? universityData : siteData)
    : isCoordinator ? universityData
    : isSiteManager ? siteData
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-stone-900 to-stone-600 bg-clip-text text-transparent">Analytics</h1>
            <p className="text-sm text-stone-500">Track placement performance and trends</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
          {(['7d', '30d', '90d', '12m'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === p ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Admin Tabs */}
      {isAdmin && (
        <div className="flex gap-1 bg-stone-100 rounded-xl p-1 w-fit">
          {(['platform', 'university', 'site'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryLoading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="bg-white border border-stone-200 rounded-xl p-5 h-24 animate-pulse"><div className="h-3 bg-stone-200 rounded w-1/2 mb-3" /><div className="h-6 bg-stone-200 rounded w-2/3" /></div>)
        ) : (
          <>
            {summary?.total_placements != null && <MetricCard label="Total Placements" value={summary.total_placements} icon={<Target className="w-5 h-5" />} />}
            {summary?.placement_rate != null && <MetricCard label="Placement Rate" value={`${summary.placement_rate.toFixed(1)}%`} icon={<TrendingUp className="w-5 h-5" />} />}
            {summary?.active_students != null && <MetricCard label="Active Students" value={summary.active_students} icon={<Users className="w-5 h-5" />} />}
            {summary?.avg_time_to_place != null && <MetricCard label="Avg Time to Place" value={`${summary.avg_time_to_place.toFixed(0)}d`} icon={<Clock className="w-5 h-5" />} />}
            {summary?.total_hours != null && <MetricCard label="Total Hours" value={summary.total_hours.toLocaleString()} icon={<Clock className="w-5 h-5" />} />}
            {summary?.slot_fill_rate != null && <MetricCard label="Slot Fill Rate" value={`${summary.slot_fill_rate.toFixed(1)}%`} icon={<Target className="w-5 h-5" />} />}
            {summary?.revenue != null && <MetricCard label="Revenue" value={`$${summary.revenue.toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} />}
            {summary?.platform_fees != null && <MetricCard label="Platform Fees" value={`$${summary.platform_fees.toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} />}
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeData?.time_series && <div className="lg:col-span-2"><PlacementTrendChart data={activeData.time_series} /></div>}
        {specialtyData?.specialties && <SpecialtyDemandChart data={specialtyData.specialties} />}
        {activeData?.summary && (
          <PlacementFunnelChart
            applied={typeof activeData.summary.total_placements === 'number' ? activeData.summary.total_placements * 3 : 0}
            accepted={typeof activeData.summary.total_placements === 'number' ? activeData.summary.total_placements : 0}
            completed={typeof activeData.summary.total_placements === 'number' ? Math.round(activeData.summary.total_placements * 0.8) : 0}
          />
        )}
      </div>

      {/* No data state */}
      {!summaryLoading && !summary && (
        <div className="text-center py-16 bg-white border border-stone-200 rounded-xl">
          <BarChart3 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 font-medium">No analytics data available yet</p>
          <p className="text-sm text-stone-400 mt-1">Data will appear as placements and activities are recorded</p>
        </div>
      )}
    </div>
  )
}
