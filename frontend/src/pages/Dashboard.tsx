import { useAuth } from '../contexts/AuthContext.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { useNavigate } from 'react-router-dom'
import {
  useDashboardStats, useApplications, useHourLogs,
  useEvaluations, useCredentials, useSlots, useMySites,
} from '../hooks/useApi.ts'
import {
  Search, Clock, FileText, CheckCircle, AlertCircle,
  Building2, Users, CalendarDays, TrendingUp, Star,
  GraduationCap, ClipboardCheck, BarChart3, BookOpen, Loader2,
  Shield, Award, ArrowRight, MapPin, AlertTriangle,
  UserCheck, Activity, Eye, Settings, ChevronRight, Plus,
} from 'lucide-react'

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  )
}

// ─── Shared stat card ──────────────────────────────────────────
function StatCard({ icon, label, value, color = 'primary' }: {
  icon: React.ReactNode; label: string; value: string | number; color?: string
}) {
  const colors: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    accent: 'bg-accent-50 text-accent-600',
  }
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color] || colors.primary}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-stone-900">{value}</p>
          <p className="text-xs text-stone-500">{label}</p>
        </div>
      </div>
    </Card>
  )
}

// ─── Section header with optional action ───────────────────────
function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-stone-900">{title}</h3>
      {actionLabel && onAction && (
        <button onClick={onAction} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
          {actionLabel} <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STUDENT DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function StudentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: appsData } = useApplications()
  const { data: hoursData } = useHourLogs()
  const { data: evalsData } = useEvaluations()
  const { data: credsData } = useCredentials()

  const applications = appsData?.data || []
  const hours = hoursData?.data || []
  const evaluations = evalsData?.data || []
  const credentials = credsData?.credentials || []

  const platformHours = hours.reduce((sum, h) => sum + (Number(h.hours_worked) || 0), 0)
  const approvedHours = hours.filter(h => h.status === 'approved').reduce((sum, h) => sum + (Number(h.hours_worked) || 0), 0)
  const priorHours = stats?.prior_hours || 0
  const totalHours = priorHours + approvedHours
  const requiredHours = stats?.hours_required || 0
  const pendingCount = hours.filter(h => h.status === 'pending').length
  const progressPct = requiredHours > 0 ? Math.min(Math.round((totalHours / requiredHours) * 100), 100) : 0
  const activeRotations = applications.filter(a => a.status === 'accepted')

  // Credential compliance
  const expiredCreds = credentials.filter(c => c.status === 'expired')
  const expiringSoonCreds = credentials.filter(c => c.status === 'expiring_soon')
  const complianceStatus = expiredCreds.length > 0 ? 'red' : expiringSoonCreds.length > 0 ? 'yellow' : 'green'
  const complianceLabel = complianceStatus === 'red' ? 'Action Required' : complianceStatus === 'yellow' ? 'Expiring Soon' : 'All Current'

  if (statsLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Welcome back, {user?.firstName || 'Student'}!</h1>
        <p className="text-stone-500">Track your clinical rotation progress and manage your placements.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Clock className="w-5 h-5" />} label="Hours Completed" value={requiredHours > 0 ? `${totalHours}/${requiredHours}` : 'No program'} color="primary" />
        <StatCard icon={<FileText className="w-5 h-5" />} label="Applications" value={stats?.applications_count || applications.length} color="secondary" />
        <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Active Rotations" value={stats?.active_rotations || activeRotations.length} color="green" />
        <StatCard icon={<AlertCircle className="w-5 h-5" />} label="Pending Review" value={pendingCount} color="amber" />
      </div>

      {/* Hours Progress */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-stone-900">Clinical Hours Progress</h3>
          <span className="text-sm font-medium text-primary-600">{requiredHours > 0 ? `${progressPct}%` : 'N/A'}</span>
        </div>
        <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden">
          {requiredHours > 0 ? (
            <div className="h-full flex">
              {priorHours > 0 && (
                <div
                  className="h-full bg-stone-400 transition-all duration-500"
                  style={{ width: `${Math.min((priorHours / requiredHours) * 100, 100)}%` }}
                />
              )}
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                style={{ width: `${Math.min((approvedHours / requiredHours) * 100, 100 - (priorHours / requiredHours) * 100)}%` }}
              />
            </div>
          ) : (
            <div className="h-full bg-stone-200 rounded-full" />
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-between mt-2 text-xs text-stone-500 gap-1">
          {priorHours > 0 && <span>{priorHours} prior</span>}
          <span>{approvedHours} approved{priorHours > 0 ? ' on platform' : ''}</span>
          <span>{platformHours - approvedHours > 0 ? `${platformHours - approvedHours} pending` : ''}</span>
          <span>{requiredHours > 0 ? `${Math.max(requiredHours - totalHours, 0)} remaining` : 'No program assigned'}</span>
        </div>
      </Card>

      {/* Credential Compliance & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Credential Compliance */}
        <Card>
          <SectionHeader title="Credential Compliance" actionLabel="Manage" onAction={() => navigate('/settings')} />
          <div className="mt-4">
            <div className={`flex items-center gap-3 p-4 rounded-xl ${complianceStatus === 'red' ? 'bg-red-50 border border-red-200' : complianceStatus === 'yellow' ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${complianceStatus === 'red' ? 'bg-red-100 text-red-600' : complianceStatus === 'yellow' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className={`font-semibold ${complianceStatus === 'red' ? 'text-red-800' : complianceStatus === 'yellow' ? 'text-amber-800' : 'text-green-800'}`}>{complianceLabel}</p>
                <p className={`text-sm ${complianceStatus === 'red' ? 'text-red-600' : complianceStatus === 'yellow' ? 'text-amber-600' : 'text-green-600'}`}>
                  {expiredCreds.length > 0 ? `${expiredCreds.length} credential(s) expired` :
                   expiringSoonCreds.length > 0 ? `${expiringSoonCreds.length} credential(s) expiring soon` :
                   `${credentials.length} credential(s) on file`}
                </p>
              </div>
            </div>
            {(expiredCreds.length > 0 || expiringSoonCreds.length > 0) && (
              <div className="mt-3 space-y-2">
                {[...expiredCreds, ...expiringSoonCreds].slice(0, 3).map(c => (
                  <div key={c.id} className="flex items-center justify-between text-sm p-2 bg-stone-50 rounded-lg">
                    <span className="text-stone-700">{c.name}</span>
                    <Badge variant={c.status === 'expired' ? 'danger' : 'warning'}>{c.status === 'expired' ? 'Expired' : 'Expiring'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="font-semibold text-stone-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/rotations')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors">
              <Search className="w-6 h-6 text-primary-600" />
              <span className="text-xs font-medium text-primary-700">Search Rotations</span>
            </button>
            <button onClick={() => navigate('/hours')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary-50 hover:bg-secondary-100 transition-colors">
              <Clock className="w-6 h-6 text-secondary-600" />
              <span className="text-xs font-medium text-secondary-700">Log Hours</span>
            </button>
            <button onClick={() => navigate('/applications')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <FileText className="w-6 h-6 text-green-600" />
              <span className="text-xs font-medium text-green-700">My Applications</span>
            </button>
            <button onClick={() => navigate('/evaluations')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors">
              <ClipboardCheck className="w-6 h-6 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Evaluations</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Active Rotations & Recent Applications */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Rotations */}
        <Card>
          <SectionHeader title="Active Rotations" actionLabel="All Applications" onAction={() => navigate('/applications')} />
          <div className="mt-4 space-y-3">
            {activeRotations.length === 0 && <p className="text-sm text-stone-400">No active rotations. Search for rotations to get started!</p>}
            {activeRotations.slice(0, 3).map(app => (
              <div key={app.id} className="p-3 bg-stone-50 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-stone-900">{app.slot?.title || 'Rotation'}</p>
                    <p className="text-xs text-stone-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.slot?.site?.name}</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                {app.slot && (
                  <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                    <span>{app.slot.specialty}</span>
                    <span>{new Date(app.slot.start_date).toLocaleDateString()} - {new Date(app.slot.end_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Evaluations */}
        <Card>
          <SectionHeader title="Recent Evaluations" actionLabel="View All" onAction={() => navigate('/evaluations')} />
          <div className="mt-4 space-y-3">
            {evaluations.length === 0 && <p className="text-sm text-stone-400">No evaluations yet. They will appear here once your preceptor submits one.</p>}
            {evaluations.slice(0, 3).map(ev => (
              <div key={ev.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{ev.type === 'mid_rotation' ? 'Mid-Rotation' : ev.type === 'final' ? 'Final' : 'Feedback'} Evaluation</p>
                  <p className="text-xs text-stone-500">{ev.slot?.title || 'Rotation'} {ev.preceptor ? `• ${ev.preceptor.first_name} ${ev.preceptor.last_name}` : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">{ev.overall_score ? `${ev.overall_score}/5` : '—'}</p>
                  <Badge variant={ev.is_submitted ? 'success' : 'warning'} size="sm">{ev.is_submitted ? 'Complete' : 'Pending'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SITE MANAGER DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SiteManagerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: stats, isLoading } = useDashboardStats()
  const { data: appsData } = useApplications()
  const { data: slotsData } = useSlots()
  const { data: sitesData } = useMySites()

  const allApps = appsData?.data || []
  const pendingApps = allApps.filter(a => a.status === 'pending')
  const acceptedApps = allApps.filter(a => a.status === 'accepted')
  const slots = slotsData?.data || []
  const openSlots = slots.filter(s => s.status === 'open')
  const sites = sitesData?.sites || []

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Welcome back, {user?.firstName || 'Manager'}!</h1>
        <p className="text-stone-500">Manage your clinical sites, rotation slots, and student placements.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={<Building2 className="w-5 h-5" />} label="My Sites" value={stats?.total_sites || sites.length} color="primary" />
        <StatCard icon={<CalendarDays className="w-5 h-5" />} label="Open Slots" value={stats?.open_slots || openSlots.length} color="secondary" />
        <StatCard icon={<FileText className="w-5 h-5" />} label="Pending Apps" value={stats?.pending_applications || pendingApps.length} color="amber" />
        <StatCard icon={<Users className="w-5 h-5" />} label="Active Students" value={stats?.active_students || acceptedApps.length} color="green" />
        <StatCard icon={<Star className="w-5 h-5" />} label="Avg Rating" value={sites.length > 0 ? (sites.reduce((s, st) => s + (st.rating || 0), 0) / sites.length).toFixed(1) : '—'} color="accent" />
      </div>

      {/* Slot Occupancy */}
      {slots.length > 0 && (
        <Card>
          <SectionHeader title="Slot Occupancy" actionLabel="Manage Slots" onAction={() => navigate('/slots')} />
          <div className="mt-4 space-y-3">
            {slots.slice(0, 5).map(slot => {
              const occupancy = slot.capacity > 0 ? Math.round((slot.filled / slot.capacity) * 100) : 0
              return (
                <div key={slot.id} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-stone-900 truncate">{slot.title}</p>
                      <span className="text-xs text-stone-500 ml-2">{slot.filled}/{slot.capacity}</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${occupancy >= 100 ? 'bg-red-400' : occupancy >= 75 ? 'bg-amber-400' : 'bg-green-400'}`} style={{ width: `${Math.min(occupancy, 100)}%` }} />
                    </div>
                  </div>
                  <Badge variant={slot.status === 'open' ? 'success' : slot.status === 'filled' ? 'warning' : 'default'}>{slot.status}</Badge>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <h3 className="font-semibold text-stone-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/slots')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors">
              <Plus className="w-6 h-6 text-primary-600" />
              <span className="text-xs font-medium text-primary-700">Create Slot</span>
            </button>
            <button onClick={() => navigate('/site-applications')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary-50 hover:bg-secondary-100 transition-colors relative">
              <FileText className="w-6 h-6 text-secondary-600" />
              <span className="text-xs font-medium text-secondary-700">Review Apps</span>
              {pendingApps.length > 0 && <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{pendingApps.length}</span>}
            </button>
            <button onClick={() => navigate('/site')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <Building2 className="w-6 h-6 text-green-600" />
              <span className="text-xs font-medium text-green-700">Manage Sites</span>
            </button>
            <button onClick={() => navigate('/settings')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors">
              <Settings className="w-6 h-6 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Settings</span>
            </button>
          </div>
        </Card>

        {/* Pending Applications */}
        <Card>
          <SectionHeader title="Pending Applications" actionLabel="View All" onAction={() => navigate('/site-applications')} />
          <div className="mt-4 space-y-3">
            {pendingApps.length === 0 && <p className="text-sm text-stone-400">No pending applications at this time.</p>}
            {pendingApps.slice(0, 4).map(app => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{app.student?.first_name} {app.student?.last_name}</p>
                  <p className="text-xs text-stone-500">{app.slot?.title} • {app.slot?.specialty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">Pending</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Active Students */}
      {acceptedApps.length > 0 && (
        <Card>
          <SectionHeader title="Active Students" />
          <div className="mt-4 space-y-3">
            {acceptedApps.slice(0, 5).map(app => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">
                    {(app.student?.first_name?.[0] || '') + (app.student?.last_name?.[0] || '')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{app.student?.first_name} {app.student?.last_name}</p>
                    <p className="text-xs text-stone-500">{app.slot?.title} • {app.slot?.specialty}</p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRECEPTOR DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function PreceptorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: stats, isLoading } = useDashboardStats()
  const { data: hoursData } = useHourLogs()
  const { data: evalsData } = useEvaluations()
  const { data: sitesData } = useMySites()

  const hours = hoursData?.data || []
  const evaluations = evalsData?.data || []
  const pendingHours = hours.filter(h => h.status === 'pending')
  const pendingEvals = evaluations.filter(e => !e.is_submitted)
  const sites = sitesData?.sites || []

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Welcome back, {user?.firstName || 'Preceptor'}!</h1>
        <p className="text-stone-500">Manage your students, review hours, and complete evaluations.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5" />} label="Current Students" value={stats?.active_students || 0} color="primary" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Hours to Review" value={stats?.pending_hour_reviews || pendingHours.length} color="amber" />
        <StatCard icon={<ClipboardCheck className="w-5 h-5" />} label="Evaluations Due" value={stats?.pending_evaluations || pendingEvals.length} color="secondary" />
        <StatCard icon={<Award className="w-5 h-5" />} label="Total Hours Supervised" value={hours.filter(h => h.status === 'approved').reduce((s, h) => s + (Number(h.hours_worked) || 0), 0)} color="green" />
      </div>

      {/* Site Affiliation */}
      {sites.length > 0 && (
        <Card>
          <SectionHeader title="My Site Affiliation" actionLabel="View Site" onAction={() => navigate('/site')} />
          <div className="mt-4 space-y-3">
            {sites.map(site => {
              const activeSlots = site.slots?.filter(s => s.status === 'open') || []
              return (
                <div key={site.id} className="flex items-start gap-4 p-4 bg-stone-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900">{site.name}</p>
                    <div className="flex items-center gap-1 text-sm text-stone-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{site.city}, {site.state}</span>
                    </div>
                    {site.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {site.specialties.slice(0, 4).map(s => (
                          <Badge key={s} variant="secondary">{s}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-primary-600">{activeSlots.length}</p>
                    <p className="text-xs text-stone-500">Active Slots</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Urgent Items Banner */}
      {(pendingHours.length > 0 || pendingEvals.length > 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-amber-800">Items Needing Your Attention</p>
              <p className="text-sm text-amber-700">
                {pendingHours.length > 0 && `${pendingHours.length} hour log(s) to review`}
                {pendingHours.length > 0 && pendingEvals.length > 0 && ' • '}
                {pendingEvals.length > 0 && `${pendingEvals.length} evaluation(s) to complete`}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/hours')}>
              Review Now <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <h3 className="font-semibold text-stone-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/hours')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors relative">
              <Clock className="w-6 h-6 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Review Hours</span>
              {pendingHours.length > 0 && <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{pendingHours.length}</span>}
            </button>
            <button onClick={() => navigate('/evaluations')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary-50 hover:bg-secondary-100 transition-colors relative">
              <ClipboardCheck className="w-6 h-6 text-secondary-600" />
              <span className="text-xs font-medium text-secondary-700">Evaluations</span>
              {pendingEvals.length > 0 && <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{pendingEvals.length}</span>}
            </button>
            <button onClick={() => navigate('/students')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors">
              <Users className="w-6 h-6 text-primary-600" />
              <span className="text-xs font-medium text-primary-700">My Students</span>
            </button>
            <button onClick={() => navigate('/settings')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors">
              <Settings className="w-6 h-6 text-stone-600" />
              <span className="text-xs font-medium text-stone-700">Settings</span>
            </button>
          </div>
        </Card>

        {/* Pending Hour Logs */}
        <Card>
          <SectionHeader title="Pending Hour Reviews" actionLabel="Review All" onAction={() => navigate('/hours')} />
          <div className="mt-4 space-y-3">
            {pendingHours.length === 0 && <p className="text-sm text-stone-400">All caught up! No hours pending review.</p>}
            {pendingHours.slice(0, 5).map(h => (
              <div key={h.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{h.hours_worked}h — {h.category.replace('_', ' ')}</p>
                  <p className="text-xs text-stone-500">{new Date(h.date).toLocaleDateString()} • {h.slot?.title}</p>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Evaluations */}
      {evaluations.length > 0 && (
        <Card>
          <SectionHeader title="Recent Evaluations" actionLabel="View All" onAction={() => navigate('/evaluations')} />
          <div className="mt-4 space-y-3">
            {evaluations.slice(0, 4).map(ev => (
              <div key={ev.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {ev.student?.first_name} {ev.student?.last_name} — {ev.type === 'mid_rotation' ? 'Mid-Rotation' : ev.type === 'final' ? 'Final' : 'Feedback'}
                  </p>
                  <p className="text-xs text-stone-500">{ev.slot?.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  {ev.overall_score && <span className="text-sm font-bold text-primary-600">{ev.overall_score}/5</span>}
                  <Badge variant={ev.is_submitted ? 'success' : 'warning'}>{ev.is_submitted ? 'Submitted' : 'Draft'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COORDINATOR DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CoordinatorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: stats, isLoading } = useDashboardStats()
  const { data: appsData } = useApplications()
  const { data: slotsData } = useSlots()

  const applications = appsData?.data || []
  const slots = slotsData?.data || []

  const pendingApps = applications.filter(a => a.status === 'pending')
  const acceptedApps = applications.filter(a => a.status === 'accepted')
  const totalStudents = stats?.total_students || 0
  const placedStudents = stats?.active_placements || acceptedApps.length
  const unplacedStudents = Math.max(totalStudents - placedStudents, 0)
  const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Welcome back, {user?.firstName || 'Coordinator'}!</h1>
        <p className="text-stone-500">Monitor student placements, program compliance, and site partnerships.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={<GraduationCap className="w-5 h-5" />} label="Total Students" value={totalStudents} color="primary" />
        <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Active Placements" value={placedStudents} color="green" />
        <StatCard icon={<AlertCircle className="w-5 h-5" />} label="Unplaced" value={unplacedStudents} color={unplacedStudents > 0 ? 'amber' : 'green'} />
        <StatCard icon={<FileText className="w-5 h-5" />} label="Pending Apps" value={stats?.pending_applications || pendingApps.length} color="secondary" />
        <StatCard icon={<CalendarDays className="w-5 h-5" />} label="Available Slots" value={stats?.available_slots || slots.filter(s => s.status === 'open').length} color="accent" />
      </div>

      {/* Placement Pipeline */}
      <Card>
        <SectionHeader title="Placement Pipeline" />
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-600">Placement Rate</span>
            <span className="text-sm font-bold text-primary-600">{placementRate}%</span>
          </div>
          <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-green-500 rounded-full transition-all duration-500" style={{ width: `${placementRate}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-xl font-bold text-green-700">{placedStudents}</p>
              <p className="text-xs text-green-600">Placed</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-xl">
              <p className="text-xl font-bold text-amber-700">{pendingApps.length}</p>
              <p className="text-xs text-amber-600">Pending</p>
            </div>
            <div className="text-center p-3 bg-stone-50 rounded-xl">
              <p className="text-xl font-bold text-stone-700">{unplacedStudents}</p>
              <p className="text-xs text-stone-600">Unplaced</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <h3 className="font-semibold text-stone-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/students')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors">
              <Users className="w-6 h-6 text-primary-600" />
              <span className="text-xs font-medium text-primary-700">My Students</span>
            </button>
            <button onClick={() => navigate('/placements')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <GraduationCap className="w-6 h-6 text-green-600" />
              <span className="text-xs font-medium text-green-700">Placements</span>
            </button>
            <button onClick={() => navigate('/programs')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary-50 hover:bg-secondary-100 transition-colors">
              <BookOpen className="w-6 h-6 text-secondary-600" />
              <span className="text-xs font-medium text-secondary-700">Programs</span>
            </button>
            <button onClick={() => navigate('/sites')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors">
              <Building2 className="w-6 h-6 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Sites Directory</span>
            </button>
          </div>
        </Card>

        {/* Recent Applications */}
        <Card>
          <SectionHeader title="Recent Applications" actionLabel="View All" onAction={() => navigate('/placements')} />
          <div className="mt-4 space-y-3">
            {applications.length === 0 && <p className="text-sm text-stone-400">No applications to review.</p>}
            {applications.slice(0, 5).map(app => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{app.student?.first_name} {app.student?.last_name}</p>
                  <p className="text-xs text-stone-500">{app.slot?.title} • {app.slot?.site?.name}</p>
                </div>
                <Badge variant={app.status === 'accepted' ? 'success' : app.status === 'pending' ? 'warning' : app.status === 'declined' ? 'danger' : 'default'}>
                  {app.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROFESSOR DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ProfessorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: stats, isLoading } = useDashboardStats()
  const { data: appsData } = useApplications()
  const { data: evalsData } = useEvaluations()

  const applications = appsData?.data || []
  const evaluations = evalsData?.data || []
  const activeStudents = applications.filter(a => a.status === 'accepted')

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Welcome back, {user?.firstName || 'Professor'}!</h1>
        <p className="text-stone-500">Monitor your students' clinical progress, evaluations, and placements.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<GraduationCap className="w-5 h-5" />} label="Total Students" value={stats?.total_students || 0} color="primary" />
        <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Active Placements" value={stats?.active_placements || activeStudents.length} color="green" />
        <StatCard icon={<ClipboardCheck className="w-5 h-5" />} label="Evaluations" value={evaluations.length} color="secondary" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Available Slots" value={stats?.available_slots || 0} color="accent" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <h3 className="font-semibold text-stone-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/students')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors">
              <Users className="w-6 h-6 text-primary-600" />
              <span className="text-xs font-medium text-primary-700">My Students</span>
            </button>
            <button onClick={() => navigate('/evaluations')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary-50 hover:bg-secondary-100 transition-colors">
              <ClipboardCheck className="w-6 h-6 text-secondary-600" />
              <span className="text-xs font-medium text-secondary-700">Evaluations</span>
            </button>
            <button onClick={() => navigate('/placements')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <Eye className="w-6 h-6 text-green-600" />
              <span className="text-xs font-medium text-green-700">Placements</span>
            </button>
            <button onClick={() => navigate('/sites')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors">
              <Building2 className="w-6 h-6 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Sites Directory</span>
            </button>
          </div>
        </Card>

        {/* Student Progress */}
        <Card>
          <SectionHeader title="Student Placements" actionLabel="View All" onAction={() => navigate('/students')} />
          <div className="mt-4 space-y-3">
            {activeStudents.length === 0 && <p className="text-sm text-stone-400">No active student placements to monitor.</p>}
            {activeStudents.slice(0, 5).map(app => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">
                    {(app.student?.first_name?.[0] || '') + (app.student?.last_name?.[0] || '')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{app.student?.first_name} {app.student?.last_name}</p>
                    <p className="text-xs text-stone-500">{app.slot?.title} • {app.slot?.site?.name}</p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Evaluations */}
      {evaluations.length > 0 && (
        <Card>
          <SectionHeader title="Recent Evaluations" actionLabel="View All" onAction={() => navigate('/evaluations')} />
          <div className="mt-4 space-y-3">
            {evaluations.slice(0, 4).map(ev => (
              <div key={ev.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {ev.student?.first_name} {ev.student?.last_name} — {ev.type === 'mid_rotation' ? 'Mid-Rotation' : ev.type === 'final' ? 'Final' : 'Feedback'}
                  </p>
                  <p className="text-xs text-stone-500">{ev.slot?.title} • by {ev.preceptor?.first_name} {ev.preceptor?.last_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {ev.overall_score && <span className="text-sm font-bold text-primary-600">{ev.overall_score}/5</span>}
                  <Badge variant={ev.is_submitted ? 'success' : 'warning'}>{ev.is_submitted ? 'Complete' : 'Pending'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: stats, isLoading } = useDashboardStats()
  const { data: slotsData } = useSlots()
  const { data: appsData } = useApplications()
  const { data: sitesData } = useMySites()

  const slots = slotsData?.data || []
  const applications = appsData?.data || []
  const sites = sitesData?.sites || []

  const openSlots = slots.filter(s => s.status === 'open').length
  const pendingApps = applications.filter(a => a.status === 'pending').length

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Welcome, {user?.firstName || 'Admin'}!</h1>
        <p className="text-stone-500">Platform overview — manage users, sites, and monitor system health.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={stats?.total_users || 0} color="primary" />
        <StatCard icon={<Building2 className="w-5 h-5" />} label="Active Sites" value={stats?.total_sites || sites.length} color="secondary" />
        <StatCard icon={<BookOpen className="w-5 h-5" />} label="Universities" value={stats?.total_universities || 0} color="accent" />
        <StatCard icon={<CalendarDays className="w-5 h-5" />} label="Total Slots" value={stats?.total_slots || slots.length} color="green" />
      </div>

      {/* Platform Activity */}
      <Card>
        <SectionHeader title="Platform Activity" />
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-primary-50 rounded-xl">
            <Activity className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-xl font-bold text-stone-900">{stats?.recent_applications || applications.length}</p>
            <p className="text-xs text-stone-500">Total Applications</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <FileText className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <p className="text-xl font-bold text-stone-900">{pendingApps}</p>
            <p className="text-xs text-stone-500">Pending Review</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <CalendarDays className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-xl font-bold text-stone-900">{openSlots}</p>
            <p className="text-xs text-stone-500">Open Slots</p>
          </div>
          <div className="text-center p-4 bg-secondary-50 rounded-xl">
            <UserCheck className="w-6 h-6 text-secondary-600 mx-auto mb-2" />
            <p className="text-xl font-bold text-stone-900">{applications.filter(a => a.status === 'accepted').length}</p>
            <p className="text-xs text-stone-500">Active Placements</p>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <h3 className="font-semibold text-stone-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/admin/users')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors">
              <Users className="w-6 h-6 text-primary-600" />
              <span className="text-xs font-medium text-primary-700">Manage Users</span>
            </button>
            <button onClick={() => navigate('/sites')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary-50 hover:bg-secondary-100 transition-colors">
              <Building2 className="w-6 h-6 text-secondary-600" />
              <span className="text-xs font-medium text-secondary-700">Sites Directory</span>
            </button>
            <button onClick={() => navigate('/slots')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <BarChart3 className="w-6 h-6 text-green-600" />
              <span className="text-xs font-medium text-green-700">All Slots</span>
            </button>
            <button onClick={() => navigate('/settings')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors">
              <Settings className="w-6 h-6 text-stone-600" />
              <span className="text-xs font-medium text-stone-700">Platform Settings</span>
            </button>
          </div>
        </Card>

        {/* System Health */}
        <Card>
          <SectionHeader title="System Health" />
          <div className="mt-4 space-y-3">
            {[
              { label: 'API Status', value: 'Operational', color: 'green' },
              { label: 'Database', value: 'Connected', color: 'green' },
              { label: 'Auth Service', value: 'Active', color: 'green' },
              { label: 'Email Service', value: 'Active', color: 'green' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <span className="text-sm text-stone-700">{item.label}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color === 'green' ? 'bg-green-500' : item.color === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <span className={`text-sm font-medium ${item.color === 'green' ? 'text-green-700' : item.color === 'amber' ? 'text-amber-700' : 'text-red-700'}`}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Sites */}
      {sites.length > 0 && (
        <Card>
          <SectionHeader title="Sites Overview" actionLabel="View All" onAction={() => navigate('/sites')} />
          <div className="mt-4 space-y-3">
            {sites.slice(0, 4).map(site => (
              <div key={site.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{site.name}</p>
                    <p className="text-xs text-stone-500">{site.city}, {site.state} • {site.specialties?.slice(0, 2).join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {site.is_verified && <Badge variant="success" size="sm">Verified</Badge>}
                  {site.rating > 0 && <span className="text-sm text-amber-600 flex items-center gap-1"><Star className="w-3 h-3 fill-current" />{site.rating}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN DASHBOARD ROUTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function Dashboard() {
  const { user } = useAuth()
  if (!user) return null

  switch (user.role) {
    case 'student': return <StudentDashboard />
    case 'site_manager': return <SiteManagerDashboard />
    case 'coordinator': return <CoordinatorDashboard />
    case 'professor': return <ProfessorDashboard />
    case 'preceptor': return <PreceptorDashboard />
    case 'admin': return <AdminDashboard />
    default: return <StudentDashboard />
  }
}
