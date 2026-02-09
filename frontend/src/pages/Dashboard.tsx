import { useAuth } from '../contexts/AuthContext.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { useNavigate } from 'react-router-dom'
import { useDashboardStats, useApplications, useHourLogs } from '../hooks/useApi.ts'
import {
  Search, Clock, FileText, CheckCircle, AlertCircle,
  Building2, Users, CalendarDays, TrendingUp, Star,
  GraduationCap, ClipboardCheck, BarChart3, BookOpen, Loader2
} from 'lucide-react'

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  )
}

function StudentDashboard() {
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: appsData } = useApplications()
  const { data: hoursData } = useHourLogs()

  const applications = appsData?.applications || []
  const hours = hoursData?.hour_logs || []

  const totalHours = hours.reduce((sum, h) => sum + h.hours_worked, 0)
  const approvedHours = hours.filter(h => h.status === 'approved').reduce((sum, h) => sum + h.hours_worked, 0)
  const requiredHours = stats?.hours_required || 500
  const pendingCount = hours.filter(h => h.status === 'pending').length

  if (statsLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Student Dashboard</h1>
        <p className="text-stone-500">Track your clinical rotation progress</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{approvedHours}/{requiredHours}</p>
              <p className="text-xs text-stone-500">Hours Completed</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary-600 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.applications_count || applications.length}</p>
              <p className="text-xs text-stone-500">Applications</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.active_rotations || applications.filter(a => a.status === 'accepted').length}</p>
              <p className="text-xs text-stone-500">Active Rotations</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><AlertCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{pendingCount}</p>
              <p className="text-xs text-stone-500">Pending Review</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-stone-900">Clinical Hours Progress</h3>
          <span className="text-sm text-stone-500">{Math.round((approvedHours / requiredHours) * 100)}%</span>
        </div>
        <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((approvedHours / requiredHours) * 100, 100)}%` }}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between mt-2 text-xs text-stone-500 gap-1">
          <span>{approvedHours} approved hours</span>
          <span>{totalHours - approvedHours} pending approval</span>
          <span>{requiredHours - totalHours} remaining</span>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-stone-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/rotations')}>
              <Search className="w-4 h-4" /> Search Rotations
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/hours')}>
              <Clock className="w-4 h-4" /> Log Hours
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/applications')}>
              <FileText className="w-4 h-4" /> View Applications
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-stone-900 mb-4">Recent Applications</h3>
          <div className="space-y-3">
            {applications.length === 0 && <p className="text-sm text-stone-400">No applications yet. Search for rotations to get started!</p>}
            {applications.slice(0, 4).map(app => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{app.slot?.title || 'Rotation'}</p>
                  <p className="text-xs text-stone-500">{app.slot?.site?.name}</p>
                </div>
                <Badge variant={app.status === 'accepted' ? 'success' : app.status === 'pending' ? 'warning' : 'default'}>
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

function SiteManagerDashboard() {
  const navigate = useNavigate()
  const { data: stats, isLoading } = useDashboardStats()
  const { data: appsData } = useApplications()

  const pendingApps = (appsData?.applications || []).filter(a => a.status === 'pending')

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Site Manager Dashboard</h1>
        <p className="text-stone-500">Manage your clinical site and student placements</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><CalendarDays className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.open_slots || 0}</p>
              <p className="text-xs text-stone-500">Open Slots</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary-600 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.pending_applications || 0}</p>
              <p className="text-xs text-stone-500">Pending Applications</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><Users className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.active_students || 0}</p>
              <p className="text-xs text-stone-500">Active Students</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Star className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.total_sites || 0}</p>
              <p className="text-xs text-stone-500">My Sites</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-stone-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/slots')}>
              <CalendarDays className="w-4 h-4" /> Manage Rotation Slots
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/site-applications')}>
              <FileText className="w-4 h-4" /> Review Applications
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/site')}>
              <Building2 className="w-4 h-4" /> Manage My Sites
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-stone-900 mb-4">Pending Applications</h3>
          <div className="space-y-3">
            {pendingApps.length === 0 && <p className="text-sm text-stone-400">No pending applications</p>}
            {pendingApps.slice(0, 4).map(app => (
              <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-stone-50 rounded-xl gap-2">
                <div>
                  <p className="text-sm font-medium text-stone-900">{app.student?.first_name} {app.student?.last_name}</p>
                  <p className="text-xs text-stone-500">{app.slot?.title}</p>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function CoordinatorDashboard() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">University Coordinator Dashboard</h1>
        <p className="text-stone-500">Monitor student placements and program compliance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><GraduationCap className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.total_students || 0}</p>
              <p className="text-xs text-stone-500">Total Students</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.active_placements || 0}</p>
              <p className="text-xs text-stone-500">Active Placements</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><AlertCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.pending_applications || 0}</p>
              <p className="text-xs text-stone-500">Pending Apps</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary-600 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.available_slots || 0}</p>
              <p className="text-xs text-stone-500">Available Slots</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function PreceptorDashboard() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Preceptor Dashboard</h1>
        <p className="text-stone-500">Manage your students and clinical supervision</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><Users className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.active_students || 0}</p>
              <p className="text-xs text-stone-500">Current Students</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.pending_hour_reviews || 0}</p>
              <p className="text-xs text-stone-500">Hours to Review</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary-600 flex items-center justify-center"><ClipboardCheck className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.pending_evaluations || 0}</p>
              <p className="text-xs text-stone-500">Evaluations Due</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center"><Star className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.total_slots || 0}</p>
              <p className="text-xs text-stone-500">My Slots</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Admin Dashboard</h1>
        <p className="text-stone-500">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><Users className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.total_users || 0}</p>
              <p className="text-xs text-stone-500">Total Users</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary-600 flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.total_sites || 0}</p>
              <p className="text-xs text-stone-500">Active Sites</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.total_universities || 0}</p>
              <p className="text-xs text-stone-500">Universities</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><BarChart3 className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats?.total_slots || 0}</p>
              <p className="text-xs text-stone-500">Total Slots</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { user } = useAuth()
  if (!user) return null

  switch (user.role) {
    case 'student': return <StudentDashboard />
    case 'site_manager': return <SiteManagerDashboard />
    case 'coordinator': return <CoordinatorDashboard />
    case 'professor': return <CoordinatorDashboard />
    case 'preceptor': return <PreceptorDashboard />
    case 'admin': return <AdminDashboard />
    default: return <StudentDashboard />
  }
}
