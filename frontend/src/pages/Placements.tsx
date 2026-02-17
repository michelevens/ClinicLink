import { useState, useMemo } from 'react'
import { GraduationCap, Search, Clock, MapPin, User, CalendarDays, CheckCircle, AlertCircle, Hourglass } from 'lucide-react'
import { useApplications } from '../hooks/useApi.ts'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import type { ApiApplication } from '../services/api.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'

type PlacementTab = 'active' | 'pending' | 'completed'

export function Placements() {
  usePageTitle('Placements')
  const { data, isLoading } = useApplications()
  const applications = data?.data || []

  const [tab, setTab] = useState<PlacementTab>('active')
  const [search, setSearch] = useState('')

  const categorized = useMemo(() => ({
    active: applications.filter(a => a.status === 'accepted'),
    pending: applications.filter(a => a.status === 'pending' || a.status === 'waitlisted'),
    completed: applications.filter(a => a.status === 'declined' || a.status === 'withdrawn'),
  }), [applications])

  const filtered = useMemo(() => {
    const list = categorized[tab]
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter(a =>
      (a.student?.first_name + ' ' + a.student?.last_name).toLowerCase().includes(q) ||
      a.slot?.title?.toLowerCase().includes(q) ||
      a.slot?.site?.name?.toLowerCase().includes(q)
    )
  }, [categorized, tab, search])

  const tabs: { key: PlacementTab; label: string; count: number; icon: React.ReactNode }[] = [
    { key: 'active', label: 'Active', count: categorized.active.length, icon: <CheckCircle className="w-4 h-4" /> },
    { key: 'pending', label: 'Pending', count: categorized.pending.length, icon: <Hourglass className="w-4 h-4" /> },
    { key: 'completed', label: 'Closed', count: categorized.completed.length, icon: <AlertCircle className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Placements</h1>
        <p className="text-stone-500 mt-1">Track student rotation placements across all sites</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{categorized.active.length}</p>
            <p className="text-xs text-stone-500">Active</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{categorized.pending.length}</p>
            <p className="text-xs text-stone-500">Pending</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-stone-500">{categorized.completed.length}</p>
            <p className="text-xs text-stone-500">Closed</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-stone-100 rounded-xl">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {t.icon}
            {t.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${tab === t.key ? 'bg-primary-100 text-primary-700' : 'bg-stone-200 text-stone-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search placements..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
        />
      </div>

      {/* Placement List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <GraduationCap className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-stone-900 mb-1">No {tab} placements</h3>
            <p className="text-stone-500 text-sm">
              {tab === 'active' ? 'No students are currently placed in rotations.' : tab === 'pending' ? 'No pending placement requests.' : 'No closed placements.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <PlacementCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  )
}

function PlacementCard({ application: app }: { application: ApiApplication }) {
  const statusConfig: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default' | 'primary' | 'secondary'; label: string }> = {
    accepted: { variant: 'success', label: 'Active' },
    pending: { variant: 'warning', label: 'Pending' },
    waitlisted: { variant: 'secondary', label: 'Waitlisted' },
    declined: { variant: 'danger', label: 'Declined' },
    withdrawn: { variant: 'default', label: 'Withdrawn' },
  }

  const status = statusConfig[app.status] || { variant: 'default' as const, label: app.status }

  return (
    <Card hover>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
          {app.student?.first_name?.[0]}{app.student?.last_name?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-stone-900 truncate">
              {app.student?.first_name} {app.student?.last_name}
            </h3>
            <Badge variant={status.variant} size="sm">{status.label}</Badge>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              {app.slot?.title || 'Unknown Rotation'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {app.slot?.site?.name || 'Unknown Site'}
            </span>
            {app.slot?.start_date && (
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                {new Date(app.slot.start_date).toLocaleDateString()} - {app.slot.end_date ? new Date(app.slot.end_date).toLocaleDateString() : ''}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Applied {new Date(app.submitted_at).toLocaleDateString()}
            </span>
            {app.slot?.preceptor && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {app.slot.preceptor.first_name} {app.slot.preceptor.last_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
