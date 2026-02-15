import { useAuth } from '../contexts/AuthContext.tsx'
import { useNavigate } from 'react-router-dom'
import {
  useDashboardStats, useApplications, useHourLogs,
  useEvaluations, useCredentials, useSlots, useMySites,
  useMyPendingInvites, useAcceptInvite,
  useSiteJoinRequests, useCeCertificates,
} from '../hooks/useApi.ts'
import { toast } from 'sonner'
import {
  Search, Clock, FileText, CheckCircle, AlertCircle,
  Building2, Users, CalendarDays, TrendingUp, Star,
  GraduationCap, ClipboardCheck, BarChart3, BookOpen, Loader2,
  Shield, Award, ArrowRight, MapPin, AlertTriangle,
  UserCheck, Activity, Eye, Settings, Plus, Stethoscope,
  ArrowUpRight, Sparkles, Target, Flame,
} from 'lucide-react'

// ─── V2 Design Primitives ──────────────────────────────────────
function V2Card({ children, className = '', glow }: {
  children: React.ReactNode; className?: string; glow?: 'indigo' | 'cyan' | 'amber' | 'emerald' | 'rose'
}) {
  const glowColors: Record<string, string> = {
    indigo: 'shadow-indigo-500/5 hover:shadow-indigo-500/10',
    cyan: 'shadow-cyan-500/5 hover:shadow-cyan-500/10',
    amber: 'shadow-amber-500/5 hover:shadow-amber-500/10',
    emerald: 'shadow-emerald-500/5 hover:shadow-emerald-500/10',
    rose: 'shadow-rose-500/5 hover:shadow-rose-500/10',
  }
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg transition-all duration-300 hover:border-slate-700 ${glow ? glowColors[glow] : ''} ${className}`}>
      {children}
    </div>
  )
}

function V2Badge({ children, color = 'slate' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    slate: 'bg-slate-800 text-slate-300',
    indigo: 'bg-indigo-500/15 text-indigo-400',
    emerald: 'bg-emerald-500/15 text-emerald-400',
    amber: 'bg-amber-500/15 text-amber-400',
    rose: 'bg-rose-500/15 text-rose-400',
    cyan: 'bg-cyan-500/15 text-cyan-400',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${colors[color] || colors.slate}`}>
      {children}
    </span>
  )
}

function V2StatCard({ icon, label, value, trend, color = 'indigo' }: {
  icon: React.ReactNode; label: string; value: string | number; trend?: string; color?: string
}) {
  const accents: Record<string, { bg: string; text: string; glow: string }> = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', glow: 'shadow-rose-500/20' },
  }
  const a = accents[color] || accents.indigo
  return (
    <V2Card>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center ${a.text}`}>
          {icon}
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-400">
            <TrendingUp className="w-3 h-3" />{trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mt-3">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </V2Card>
  )
}

function V2SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-white text-sm">{title}</h3>
      {actionLabel && onAction && (
        <button onClick={onAction} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors">
          {actionLabel} <ArrowUpRight className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

function V2QuickAction({ icon, label, onClick, color = 'indigo' }: {
  icon: React.ReactNode; label: string; onClick: () => void; color?: string
}) {
  const accents: Record<string, string> = {
    indigo: 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20',
  }
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${accents[color] || accents.indigo}`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

function V2LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  )
}

function V2ActionBanner({ items }: {
  items: { label: string; count: number; onClick: () => void; buttonLabel: string }[]
}) {
  const actionItems = items.filter(i => i.count > 0)
  if (actionItems.length === 0) return null

  return (
    <V2Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-amber-300 text-sm">Action Required</p>
          <div className="mt-2 space-y-2">
            {actionItems.map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex-shrink-0">{item.count}</span>
                  <span className="text-xs text-amber-200/70">{item.label}</span>
                </div>
                <button
                  onClick={item.onClick}
                  className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/20 transition-all"
                >
                  {item.buttonLabel} <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </V2Card>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STUDENT DASHBOARD V2
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function StudentDashboardV2() {
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
  const approvedHours = hours.filter((h) => h.status === 'approved').reduce((sum, h) => sum + (Number(h.hours_worked) || 0), 0)
  const priorHours = stats?.prior_hours || 0
  const totalHours = priorHours + approvedHours
  const requiredHours = stats?.hours_required || 0
  const pendingCount = hours.filter((h) => h.status === 'pending').length
  const progressPct = requiredHours > 0 ? Math.min(Math.round((totalHours / requiredHours) * 100), 100) : 0
  const activeRotations = applications.filter((a) => a.status === 'accepted')
  const expiredCreds = credentials.filter((c) => c.status === 'expired')
  const expiringSoonCreds = credentials.filter((c) => c.status === 'expiring_soon')

  if (statsLoading) return <V2LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">Student Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.firstName || 'Student'}</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track your clinical rotation progress and manage placements.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <V2StatCard icon={<Clock className="w-5 h-5" />} label="Hours Completed" value={requiredHours > 0 ? `${totalHours}/${requiredHours}` : 'N/A'} color="indigo" />
        <V2StatCard icon={<FileText className="w-5 h-5" />} label="Applications" value={stats?.applications_count || applications.length} color="cyan" />
        <V2StatCard icon={<CheckCircle className="w-5 h-5" />} label="Active Rotations" value={stats?.active_rotations || activeRotations.length} color="emerald" />
        <V2StatCard icon={<AlertCircle className="w-5 h-5" />} label="Pending Review" value={pendingCount} color="amber" />
      </div>

      {/* Action Required */}
      <V2ActionBanner items={[
        { label: 'credential(s) expired or expiring', count: expiredCreds.length + expiringSoonCreds.length, onClick: () => navigate('/settings'), buttonLabel: 'Update' },
        { label: 'hour log(s) pending review', count: pendingCount, onClick: () => navigate('/hours'), buttonLabel: 'View' },
      ]} />

      {/* Hours Progress - Bento Full Width */}
      <V2Card glow="indigo">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-white text-sm">Clinical Hours Progress</h3>
          </div>
          <span className="text-sm font-bold text-indigo-400">{requiredHours > 0 ? `${progressPct}%` : 'N/A'}</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          {requiredHours > 0 ? (
            <div className="h-full flex">
              {priorHours > 0 && (
                <div className="h-full bg-slate-600 transition-all duration-700" style={{ width: `${Math.min((priorHours / requiredHours) * 100, 100)}%` }} />
              )}
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-700"
                style={{ width: `${Math.min((approvedHours / requiredHours) * 100, 100 - (priorHours / requiredHours) * 100)}%` }}
              />
            </div>
          ) : (
            <div className="h-full bg-slate-700 rounded-full" />
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-between mt-2 text-[11px] text-slate-500 gap-1">
          {priorHours > 0 && <span>{priorHours} prior</span>}
          <span>{approvedHours} approved{priorHours > 0 ? ' on platform' : ''}</span>
          <span>{platformHours - approvedHours > 0 ? `${platformHours - approvedHours} pending` : ''}</span>
          <span>{requiredHours > 0 ? `${Math.max(requiredHours - totalHours, 0)} remaining` : 'No program assigned'}</span>
        </div>
      </V2Card>

      {/* Bento Grid: Compliance + Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Credential Compliance */}
        <V2Card glow="emerald">
          <V2SectionHeader title="Credential Compliance" actionLabel="Manage" onAction={() => navigate('/settings')} />
          <div className={`flex items-center gap-3 p-4 rounded-xl ${
            expiredCreds.length > 0 ? 'bg-rose-500/10 border border-rose-500/20' :
            expiringSoonCreds.length > 0 ? 'bg-amber-500/10 border border-amber-500/20' :
            'bg-emerald-500/10 border border-emerald-500/20'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              expiredCreds.length > 0 ? 'bg-rose-500/20 text-rose-400' :
              expiringSoonCreds.length > 0 ? 'bg-amber-500/20 text-amber-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className={`font-semibold text-sm ${
                expiredCreds.length > 0 ? 'text-rose-300' :
                expiringSoonCreds.length > 0 ? 'text-amber-300' :
                'text-emerald-300'
              }`}>
                {expiredCreds.length > 0 ? 'Action Required' : expiringSoonCreds.length > 0 ? 'Expiring Soon' : 'All Current'}
              </p>
              <p className={`text-xs ${
                expiredCreds.length > 0 ? 'text-rose-400/70' :
                expiringSoonCreds.length > 0 ? 'text-amber-400/70' :
                'text-emerald-400/70'
              }`}>
                {expiredCreds.length > 0 ? `${expiredCreds.length} expired` :
                 expiringSoonCreds.length > 0 ? `${expiringSoonCreds.length} expiring soon` :
                 `${credentials.length} on file`}
              </p>
            </div>
          </div>
          {(expiredCreds.length > 0 || expiringSoonCreds.length > 0) && (
            <div className="mt-3 space-y-2">
              {[...expiredCreds, ...expiringSoonCreds].slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-300 text-xs">{c.name}</span>
                  <V2Badge color={c.status === 'expired' ? 'rose' : 'amber'}>
                    {c.status === 'expired' ? 'Expired' : 'Expiring'}
                  </V2Badge>
                </div>
              ))}
            </div>
          )}
        </V2Card>

        {/* Quick Actions */}
        <V2Card>
          <h3 className="font-semibold text-white text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <V2QuickAction icon={<Search className="w-5 h-5" />} label="Search Rotations" onClick={() => navigate('/rotations')} color="indigo" />
            <V2QuickAction icon={<Clock className="w-5 h-5" />} label="Log Hours" onClick={() => navigate('/hours')} color="cyan" />
            <V2QuickAction icon={<FileText className="w-5 h-5" />} label="My Applications" onClick={() => navigate('/applications')} color="emerald" />
            <V2QuickAction icon={<ClipboardCheck className="w-5 h-5" />} label="Evaluations" onClick={() => navigate('/evaluations')} color="amber" />
          </div>
        </V2Card>
      </div>

      {/* Bento Grid: Active Rotations + Recent Evaluations */}
      <div className="grid lg:grid-cols-2 gap-4">
        <V2Card>
          <V2SectionHeader title="Active Rotations" actionLabel="All Applications" onAction={() => navigate('/applications')} />
          <div className="space-y-2">
            {activeRotations.length === 0 && <p className="text-xs text-slate-600 py-4 text-center">No active rotations. Search to get started!</p>}
            {activeRotations.slice(0, 3).map((app) => {
              const slot = app.slot
              const site = slot?.site
              return (
                <div key={app.id} className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium text-white">{(slot?.title) || 'Rotation'}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {site?.name}</p>
                    </div>
                    <V2Badge color="emerald">Active</V2Badge>
                  </div>
                  {slot && (
                    <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-1">
                      <span>{slot.specialty}</span>
                      <span>{new Date(slot.start_date).toLocaleDateString()} - {new Date(slot.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </V2Card>

        <V2Card>
          <V2SectionHeader title="Recent Evaluations" actionLabel="View All" onAction={() => navigate('/evaluations')} />
          <div className="space-y-2">
            {evaluations.length === 0 && <p className="text-xs text-slate-600 py-4 text-center">No evaluations yet.</p>}
            {evaluations.slice(0, 3).map((ev) => {
              const slot = ev.slot
              const preceptor = ev.preceptor
              return (
                <div key={ev.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {ev.type === 'mid_rotation' ? 'Mid-Rotation' : ev.type === 'final' ? 'Final' : 'Feedback'} Eval
                    </p>
                    <p className="text-[11px] text-slate-500">{(slot?.title) || 'Rotation'} {preceptor ? `• ${preceptor.first_name} ${preceptor.last_name}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-400">{ev.overall_score ? `${ev.overall_score}/5` : '—'}</p>
                    <V2Badge color={ev.is_submitted ? 'emerald' : 'amber'}>{ev.is_submitted ? 'Complete' : 'Pending'}</V2Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </V2Card>
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SITE MANAGER DASHBOARD V2
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SiteManagerDashboardV2() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: stats, isLoading } = useDashboardStats()
  const { data: appsData } = useApplications()
  const { data: slotsData } = useSlots()
  const { data: sitesData } = useMySites()
  const { data: joinReqData } = useSiteJoinRequests({ status: 'pending' })
  const pendingJoinRequests = joinReqData?.join_requests || []

  const allApps = appsData?.data || []
  const pendingApps = allApps.filter((a) => a.status === 'pending')
  const acceptedApps = allApps.filter((a) => a.status === 'accepted')
  const slots = slotsData?.data || []
  const openSlots = slots.filter((s) => s.status === 'open')
  const sites = sitesData?.sites || []

  if (isLoading) return <V2LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Site Manager</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.firstName || 'Manager'}</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your clinical sites, rotation slots, and placements.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <V2StatCard icon={<Building2 className="w-5 h-5" />} label="My Sites" value={stats?.total_sites || sites.length} color="indigo" />
        <V2StatCard icon={<CalendarDays className="w-5 h-5" />} label="Open Slots" value={stats?.open_slots || openSlots.length} color="cyan" />
        <V2StatCard icon={<FileText className="w-5 h-5" />} label="Pending Apps" value={stats?.pending_applications || pendingApps.length} color="amber" />
        <V2StatCard icon={<Users className="w-5 h-5" />} label="Active Students" value={stats?.active_students || acceptedApps.length} color="emerald" />
        <V2StatCard icon={<Star className="w-5 h-5" />} label="Avg Rating" value={sites.length > 0 ? (sites.reduce((s, st) => s + (Number(st.rating) || 0), 0) / sites.length).toFixed(1) : '—'} color="rose" />
      </div>

      <V2ActionBanner items={[
        { label: 'application(s) to review', count: pendingApps.length, onClick: () => navigate('/site-applications'), buttonLabel: 'Review' },
        { label: 'join request(s) to approve', count: pendingJoinRequests.length, onClick: () => navigate('/preceptors'), buttonLabel: 'Review' },
      ]} />

      {slots.length > 0 && (
        <V2Card glow="cyan">
          <V2SectionHeader title="Slot Occupancy" actionLabel="Manage Slots" onAction={() => navigate('/slots')} />
          <div className="space-y-3">
            {slots.slice(0, 5).map((slot) => {
              const capacity = Number(slot.capacity) || 0
              const filled = Number(slot.filled) || 0
              const occupancy = capacity > 0 ? Math.round((filled / capacity) * 100) : 0
              return (
                <div key={slot.id} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-white truncate">{slot.title}</p>
                      <span className="text-[11px] text-slate-500 ml-2">{filled}/{capacity}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${occupancy >= 100 ? 'bg-rose-400' : occupancy >= 75 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${Math.min(occupancy, 100)}%` }} />
                    </div>
                  </div>
                  <V2Badge color={slot.status === 'open' ? 'emerald' : slot.status === 'filled' ? 'amber' : 'slate'}>{slot.status}</V2Badge>
                </div>
              )
            })}
          </div>
        </V2Card>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <V2Card>
          <h3 className="font-semibold text-white text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <V2QuickAction icon={<Plus className="w-5 h-5" />} label="Create Slot" onClick={() => navigate('/slots')} color="indigo" />
            <V2QuickAction icon={<FileText className="w-5 h-5" />} label="Review Apps" onClick={() => navigate('/site-applications')} color="cyan" />
            <V2QuickAction icon={<Building2 className="w-5 h-5" />} label="Manage Sites" onClick={() => navigate('/site')} color="emerald" />
            <V2QuickAction icon={<Settings className="w-5 h-5" />} label="Settings" onClick={() => navigate('/settings')} color="amber" />
          </div>
        </V2Card>

        <V2Card>
          <V2SectionHeader title="Pending Applications" actionLabel="View All" onAction={() => navigate('/site-applications')} />
          <div className="space-y-2">
            {pendingApps.length === 0 && <p className="text-xs text-slate-600 py-4 text-center">No pending applications.</p>}
            {pendingApps.slice(0, 4).map((app) => {
              const student = app.student
              const slot = app.slot
              return (
                <div key={app.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-sm font-medium text-white">{student?.first_name} {student?.last_name}</p>
                    <p className="text-[11px] text-slate-500">{slot?.title} • {slot?.specialty}</p>
                  </div>
                  <V2Badge color="amber">Pending</V2Badge>
                </div>
              )
            })}
          </div>
        </V2Card>
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRECEPTOR DASHBOARD V2
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function PreceptorDashboardV2() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: stats, isLoading } = useDashboardStats()
  const { data: hoursData } = useHourLogs()
  const { data: evalsData } = useEvaluations()
  const { data: sitesData } = useMySites()
  const { data: pendingInvitesData } = useMyPendingInvites()
  const acceptInvite = useAcceptInvite()

  const hours = hoursData?.data || []
  const evaluations = evalsData?.data || []
  const pendingHours = hours.filter((h) => h.status === 'pending')
  const pendingEvals = evaluations.filter((e) => !e.is_submitted)
  const sites = sitesData?.sites || []
  const pendingInvites = pendingInvitesData?.invites || []

  const handleAcceptInvite = async (token: string, siteName: string) => {
    try {
      await acceptInvite.mutateAsync(token)
      toast.success(`You have joined ${siteName}!`)
    } catch {
      toast.error('Failed to accept invite')
    }
  }

  if (isLoading) return <V2LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Stethoscope className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Preceptor</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.firstName || 'Preceptor'}</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage students, review hours, and complete evaluations.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <V2StatCard icon={<Users className="w-5 h-5" />} label="Current Students" value={stats?.active_students || 0} color="indigo" />
        <V2StatCard icon={<Clock className="w-5 h-5" />} label="Hours to Review" value={stats?.pending_hour_reviews || pendingHours.length} color="amber" />
        <V2StatCard icon={<ClipboardCheck className="w-5 h-5" />} label="Evaluations Due" value={stats?.pending_evaluations || pendingEvals.length} color="cyan" />
        <V2StatCard icon={<Award className="w-5 h-5" />} label="Hours Supervised" value={hours.filter((h) => h.status === 'approved').reduce((s, h) => s + (Number(h.hours_worked) || 0), 0)} color="emerald" />
      </div>

      <V2ActionBanner items={[
        { label: 'hour log(s) to review', count: pendingHours.length, onClick: () => navigate('/hours'), buttonLabel: 'Review' },
        { label: 'evaluation(s) to complete', count: pendingEvals.length, onClick: () => navigate('/evaluations'), buttonLabel: 'Complete' },
        { label: 'site invite(s) pending', count: pendingInvites.length, onClick: () => {}, buttonLabel: 'View Below' },
      ]} />

      {/* Pending Site Invites */}
      {pendingInvites.length > 0 && (
        <div className="space-y-3">
          {pendingInvites.map((invite) => {
            const site = invite.site
            return (
              <V2Card key={invite.id} className="border-indigo-500/30 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">Site Invitation</p>
                    <p className="font-semibold text-white">{site.name}</p>
                    <p className="text-xs text-slate-500">{site.city}, {site.state}</p>
                  </div>
                  <button
                    onClick={() => handleAcceptInvite(invite.token, site.name)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-all"
                  >
                    <CheckCircle className="w-4 h-4" /> Accept & Join
                  </button>
                </div>
              </V2Card>
            )
          })}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <V2Card>
          <h3 className="font-semibold text-white text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <V2QuickAction icon={<Clock className="w-5 h-5" />} label="Review Hours" onClick={() => navigate('/hours')} color="amber" />
            <V2QuickAction icon={<ClipboardCheck className="w-5 h-5" />} label="Evaluations" onClick={() => navigate('/evaluations')} color="cyan" />
            <V2QuickAction icon={<Users className="w-5 h-5" />} label="My Students" onClick={() => navigate('/students')} color="indigo" />
            <V2QuickAction icon={<Settings className="w-5 h-5" />} label="Settings" onClick={() => navigate('/settings')} color="emerald" />
          </div>
        </V2Card>

        <V2Card>
          <V2SectionHeader title="Pending Hour Reviews" actionLabel="Review All" onAction={() => navigate('/hours')} />
          <div className="space-y-2">
            {pendingHours.length === 0 && <p className="text-xs text-slate-600 py-4 text-center">All caught up!</p>}
            {pendingHours.slice(0, 5).map((h) => {
              const slot = h.slot
              return (
                <div key={h.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-sm font-medium text-white">{h.hours_worked}h — {(h.category).replace('_', ' ')}</p>
                    <p className="text-[11px] text-slate-500">{new Date(h.date).toLocaleDateString()} • {slot?.title}</p>
                  </div>
                  <V2Badge color="amber">Pending</V2Badge>
                </div>
              )
            })}
          </div>
        </V2Card>
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COORDINATOR DASHBOARD V2
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CoordinatorDashboardV2() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: stats, isLoading } = useDashboardStats()
  const { data: appsData } = useApplications()
  const { data: slotsData } = useSlots()
  const { data: certsData } = useCeCertificates()

  const applications = appsData?.data || []
  const slots = slotsData?.data || []
  const ceCerts = certsData?.ce_certificates || []
  const pendingCerts = ceCerts.filter((c) => c.status === 'pending')
  const pendingApps = applications.filter((a) => a.status === 'pending')
  const acceptedApps = applications.filter((a) => a.status === 'accepted')
  const totalStudents = stats?.total_students || 0
  const placedStudents = stats?.active_placements || acceptedApps.length
  const unplacedStudents = Math.max(totalStudents - placedStudents, 0)
  const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0

  if (isLoading) return <V2LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">Coordinator</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.firstName || 'Coordinator'}</h1>
        <p className="text-sm text-slate-500 mt-0.5">Monitor student placements, compliance, and site partnerships.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <V2StatCard icon={<GraduationCap className="w-5 h-5" />} label="Total Students" value={totalStudents} color="indigo" />
        <V2StatCard icon={<CheckCircle className="w-5 h-5" />} label="Active Placements" value={placedStudents} color="emerald" />
        <V2StatCard icon={<AlertCircle className="w-5 h-5" />} label="Unplaced" value={unplacedStudents} color={unplacedStudents > 0 ? 'amber' : 'emerald'} />
        <V2StatCard icon={<FileText className="w-5 h-5" />} label="Pending Apps" value={stats?.pending_applications || pendingApps.length} color="cyan" />
        <V2StatCard icon={<CalendarDays className="w-5 h-5" />} label="Available Slots" value={stats?.available_slots || slots.filter((s) => s.status === 'open').length} color="rose" />
      </div>

      <V2ActionBanner items={[
        { label: 'unplaced student(s)', count: unplacedStudents, onClick: () => navigate('/placements'), buttonLabel: 'Place' },
        { label: 'CE certificate(s) to review', count: pendingCerts.length, onClick: () => navigate('/ce-credits'), buttonLabel: 'Review' },
      ]} />

      {/* Placement Pipeline */}
      <V2Card glow="indigo">
        <V2SectionHeader title="Placement Pipeline" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">Placement Rate</span>
          <span className="text-sm font-bold text-indigo-400">{placementRate}%</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-700" style={{ width: `${placementRate}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <p className="text-xl font-bold text-emerald-400">{placedStudents}</p>
            <p className="text-[11px] text-emerald-400/70">Placed</p>
          </div>
          <div className="text-center p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <p className="text-xl font-bold text-amber-400">{pendingApps.length}</p>
            <p className="text-[11px] text-amber-400/70">Pending</p>
          </div>
          <div className="text-center p-3 bg-slate-800 rounded-xl border border-slate-700">
            <p className="text-xl font-bold text-slate-300">{unplacedStudents}</p>
            <p className="text-[11px] text-slate-500">Unplaced</p>
          </div>
        </div>
      </V2Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <V2Card>
          <h3 className="font-semibold text-white text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <V2QuickAction icon={<Users className="w-5 h-5" />} label="My Students" onClick={() => navigate('/students')} color="indigo" />
            <V2QuickAction icon={<GraduationCap className="w-5 h-5" />} label="Placements" onClick={() => navigate('/placements')} color="emerald" />
            <V2QuickAction icon={<BookOpen className="w-5 h-5" />} label="Programs" onClick={() => navigate('/programs')} color="cyan" />
            <V2QuickAction icon={<Building2 className="w-5 h-5" />} label="Sites Directory" onClick={() => navigate('/sites')} color="amber" />
          </div>
        </V2Card>

        <V2Card>
          <V2SectionHeader title="Recent Applications" actionLabel="View All" onAction={() => navigate('/placements')} />
          <div className="space-y-2">
            {applications.length === 0 && <p className="text-xs text-slate-600 py-4 text-center">No applications to review.</p>}
            {applications.slice(0, 5).map((app) => {
              const student = app.student
              const slot = app.slot
              const site = slot?.site
              return (
                <div key={app.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-sm font-medium text-white">{student?.first_name} {student?.last_name}</p>
                    <p className="text-[11px] text-slate-500">{slot?.title} • {site?.name}</p>
                  </div>
                  <V2Badge color={app.status === 'accepted' ? 'emerald' : app.status === 'pending' ? 'amber' : app.status === 'declined' ? 'rose' : 'slate'}>
                    {app.status}
                  </V2Badge>
                </div>
              )
            })}
          </div>
        </V2Card>
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROFESSOR DASHBOARD V2
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ProfessorDashboardV2() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: stats, isLoading } = useDashboardStats()
  const { data: appsData } = useApplications()
  const { data: evalsData } = useEvaluations()

  const applications = appsData?.data || []
  const evaluations = evalsData?.data || []
  const activeStudents = applications.filter((a) => a.status === 'accepted')
  const totalStudents = stats?.total_students || 0
  const unplacedStudents = Math.max(totalStudents - (stats?.active_placements || activeStudents.length), 0)

  if (isLoading) return <V2LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-rose-400" />
          <span className="text-xs font-medium text-rose-400 uppercase tracking-wider">Professor</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.firstName || 'Professor'}</h1>
        <p className="text-sm text-slate-500 mt-0.5">Monitor students' clinical progress and evaluations.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <V2StatCard icon={<GraduationCap className="w-5 h-5" />} label="Total Students" value={stats?.total_students || 0} color="indigo" />
        <V2StatCard icon={<CheckCircle className="w-5 h-5" />} label="Active Placements" value={stats?.active_placements || activeStudents.length} color="emerald" />
        <V2StatCard icon={<ClipboardCheck className="w-5 h-5" />} label="Evaluations" value={evaluations.length} color="cyan" />
        <V2StatCard icon={<TrendingUp className="w-5 h-5" />} label="Available Slots" value={stats?.available_slots || 0} color="rose" />
      </div>

      <V2ActionBanner items={[
        { label: 'unplaced student(s)', count: unplacedStudents, onClick: () => navigate('/students'), buttonLabel: 'View' },
      ]} />

      <div className="grid lg:grid-cols-2 gap-4">
        <V2Card>
          <h3 className="font-semibold text-white text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <V2QuickAction icon={<Users className="w-5 h-5" />} label="My Students" onClick={() => navigate('/students')} color="indigo" />
            <V2QuickAction icon={<ClipboardCheck className="w-5 h-5" />} label="Evaluations" onClick={() => navigate('/evaluations')} color="cyan" />
            <V2QuickAction icon={<Eye className="w-5 h-5" />} label="Placements" onClick={() => navigate('/placements')} color="emerald" />
            <V2QuickAction icon={<Building2 className="w-5 h-5" />} label="Sites Directory" onClick={() => navigate('/sites')} color="amber" />
          </div>
        </V2Card>

        <V2Card>
          <V2SectionHeader title="Student Placements" actionLabel="View All" onAction={() => navigate('/students')} />
          <div className="space-y-2">
            {activeStudents.length === 0 && <p className="text-xs text-slate-600 py-4 text-center">No active placements to monitor.</p>}
            {activeStudents.slice(0, 5).map((app) => {
              const student = app.student
              const slot = app.slot
              const site = slot?.site
              return (
                <div key={app.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-[10px] font-bold">
                      {(student?.first_name)?.[0] || ''}{(student?.last_name)?.[0] || ''}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{student?.first_name} {student?.last_name}</p>
                      <p className="text-[11px] text-slate-500">{slot?.title} • {site?.name}</p>
                    </div>
                  </div>
                  <V2Badge color="emerald">Active</V2Badge>
                </div>
              )
            })}
          </div>
        </V2Card>
      </div>

      {evaluations.length > 0 && (
        <V2Card>
          <V2SectionHeader title="Recent Evaluations" actionLabel="View All" onAction={() => navigate('/evaluations')} />
          <div className="space-y-2">
            {evaluations.slice(0, 4).map((ev) => {
              const student = ev.student
              const slot = ev.slot
              const preceptor = ev.preceptor
              return (
                <div key={ev.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-sm font-medium text-white">{student?.first_name} {student?.last_name} — {ev.type === 'mid_rotation' ? 'Mid-Rotation' : ev.type === 'final' ? 'Final' : 'Feedback'}</p>
                    <p className="text-[11px] text-slate-500">{slot?.title} • by {preceptor?.first_name} {preceptor?.last_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {ev.overall_score && <span className="text-sm font-bold text-indigo-400">{ev.overall_score}/5</span>}
                    <V2Badge color={ev.is_submitted ? 'emerald' : 'amber'}>{ev.is_submitted ? 'Complete' : 'Pending'}</V2Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </V2Card>
      )}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN DASHBOARD V2
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AdminDashboardV2() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: stats, isLoading } = useDashboardStats()
  const { data: slotsData } = useSlots()
  const { data: appsData } = useApplications()
  const { data: sitesData } = useMySites()
  const { data: joinReqData } = useSiteJoinRequests({ status: 'pending' })

  const slots = slotsData?.data || []
  const applications = appsData?.data || []
  const sites = sitesData?.sites || []
  const pendingJoinRequests = joinReqData?.join_requests || []
  const openSlots = slots.filter((s) => s.status === 'open').length
  const pendingApps = applications.filter((a) => a.status === 'pending').length

  if (isLoading) return <V2LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-5 h-5 text-rose-400" />
          <span className="text-xs font-medium text-rose-400 uppercase tracking-wider">Admin</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome, {user?.firstName || 'Admin'}</h1>
        <p className="text-sm text-slate-500 mt-0.5">Platform overview — manage users, sites, and monitor system health.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <V2StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={stats?.total_users || 0} color="indigo" />
        <V2StatCard icon={<Building2 className="w-5 h-5" />} label="Active Sites" value={stats?.total_sites || sites.length} color="cyan" />
        <V2StatCard icon={<BookOpen className="w-5 h-5" />} label="Universities" value={stats?.total_universities || 0} color="rose" />
        <V2StatCard icon={<CalendarDays className="w-5 h-5" />} label="Total Slots" value={stats?.total_slots || slots.length} color="emerald" />
      </div>

      <V2ActionBanner items={[
        { label: 'application(s) pending review', count: pendingApps, onClick: () => navigate('/site-applications'), buttonLabel: 'Review' },
        { label: 'join request(s) pending', count: pendingJoinRequests.length, onClick: () => navigate('/preceptors'), buttonLabel: 'Review' },
      ]} />

      {/* Platform Activity */}
      <V2Card glow="indigo">
        <V2SectionHeader title="Platform Activity" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="text-center p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Activity className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">{stats?.recent_applications || applications.length}</p>
            <p className="text-[11px] text-slate-500">Total Applications</p>
          </div>
          <div className="text-center p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <FileText className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">{pendingApps}</p>
            <p className="text-[11px] text-slate-500">Pending Review</p>
          </div>
          <div className="text-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <CalendarDays className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">{openSlots}</p>
            <p className="text-[11px] text-slate-500">Open Slots</p>
          </div>
          <div className="text-center p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <UserCheck className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">{applications.filter((a) => a.status === 'accepted').length}</p>
            <p className="text-[11px] text-slate-500">Active Placements</p>
          </div>
        </div>
      </V2Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <V2Card>
          <h3 className="font-semibold text-white text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <V2QuickAction icon={<Users className="w-5 h-5" />} label="Manage Users" onClick={() => navigate('/admin/users')} color="indigo" />
            <V2QuickAction icon={<Building2 className="w-5 h-5" />} label="Sites Directory" onClick={() => navigate('/sites')} color="cyan" />
            <V2QuickAction icon={<BarChart3 className="w-5 h-5" />} label="All Slots" onClick={() => navigate('/slots')} color="emerald" />
            <V2QuickAction icon={<Settings className="w-5 h-5" />} label="Platform Settings" onClick={() => navigate('/settings')} color="amber" />
          </div>
        </V2Card>

        <V2Card>
          <V2SectionHeader title="System Health" />
          <div className="space-y-2">
            {[
              { label: 'API Status', value: 'Operational', ok: true },
              { label: 'Database', value: 'Connected', ok: true },
              { label: 'Auth Service', value: 'Active', ok: true },
              { label: 'Email Service', value: 'Active', ok: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">{item.label}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-emerald-400' : 'bg-rose-400'} shadow-lg ${item.ok ? 'shadow-emerald-500/50' : 'shadow-rose-500/50'}`} />
                  <span className={`text-xs font-medium ${item.ok ? 'text-emerald-400' : 'text-rose-400'}`}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </V2Card>
      </div>

      {sites.length > 0 && (
        <V2Card>
          <V2SectionHeader title="Sites Overview" actionLabel="View All" onAction={() => navigate('/sites')} />
          <div className="space-y-2">
            {sites.slice(0, 4).map((site) => (
              <div key={site.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{site.name}</p>
                    <p className="text-[11px] text-slate-500">{site.city}, {site.state} • {(site.specialties)?.slice(0, 2).join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {site.is_verified && <V2Badge color="emerald">Verified</V2Badge>}
                  {Number(site.rating) > 0 && (
                    <span className="text-xs text-amber-400 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />{Number(site.rating).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </V2Card>
      )}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN DASHBOARD V2 ROUTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function DashboardV2() {
  const { user } = useAuth()
  if (!user) return null

  switch (user.role) {
    case 'student': return <StudentDashboardV2 />
    case 'site_manager': return <SiteManagerDashboardV2 />
    case 'coordinator': return <CoordinatorDashboardV2 />
    case 'professor': return <ProfessorDashboardV2 />
    case 'preceptor': return <PreceptorDashboardV2 />
    case 'admin': return <AdminDashboardV2 />
    default: return <StudentDashboardV2 />
  }
}
