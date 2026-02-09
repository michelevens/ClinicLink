import { useAuth } from '../contexts/AuthContext.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { useNavigate } from 'react-router-dom'
import { MOCK_APPLICATIONS, MOCK_HOURS, MOCK_SLOTS } from '../data/mockData.ts'
import {
  Search, Clock, FileText, CheckCircle, AlertCircle,
  Building2, Users, CalendarDays, TrendingUp, Star,
  GraduationCap, ClipboardCheck, BarChart3, BookOpen
} from 'lucide-react'

function StudentDashboard() {
  const navigate = useNavigate()
  const totalHours = MOCK_HOURS.reduce((sum, h) => sum + h.hoursWorked, 0)
  const approvedHours = MOCK_HOURS.filter(h => h.status === 'approved').reduce((sum, h) => sum + h.hoursWorked, 0)
  const requiredHours = 500

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Student Dashboard</h1>
        <p className="text-stone-500">Track your clinical rotation progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Hours Completed', value: `${approvedHours}/${requiredHours}`, icon: <Clock className="w-5 h-5" />, color: 'primary' },
          { label: 'Applications', value: MOCK_APPLICATIONS.length, icon: <FileText className="w-5 h-5" />, color: 'secondary' },
          { label: 'Active Rotations', value: MOCK_APPLICATIONS.filter(a => a.status === 'accepted').length, icon: <CheckCircle className="w-5 h-5" />, color: 'green' },
          { label: 'Pending Review', value: MOCK_HOURS.filter(h => h.status === 'pending').length, icon: <AlertCircle className="w-5 h-5" />, color: 'amber' },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
                <p className="text-xs text-stone-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Progress Bar */}
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

      {/* Quick Actions + Recent Applications */}
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
            {MOCK_APPLICATIONS.map(app => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{app.slot?.title}</p>
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
  const siteSlots = MOCK_SLOTS.filter(s => s.siteId === 'site-1')
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Site Manager Dashboard</h1>
        <p className="text-stone-500">Manage your clinical site and student placements</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open Slots', value: siteSlots.filter(s => s.status === 'open').length, icon: <CalendarDays className="w-5 h-5" />, color: 'primary' },
          { label: 'Total Applications', value: 12, icon: <FileText className="w-5 h-5" />, color: 'secondary' },
          { label: 'Active Students', value: 5, icon: <Users className="w-5 h-5" />, color: 'green' },
          { label: 'Site Rating', value: '4.8', icon: <Star className="w-5 h-5" />, color: 'amber' },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
                <p className="text-xs text-stone-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-stone-900 mb-4">Your Rotation Slots</h3>
          <div className="space-y-3">
            {siteSlots.map(slot => (
              <div key={slot.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{slot.title}</p>
                  <p className="text-xs text-stone-500">{slot.filled}/{slot.capacity} filled</p>
                </div>
                <Badge variant={slot.status === 'open' ? 'success' : slot.status === 'filled' ? 'warning' : 'default'}>
                  {slot.status}
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/slots')}>
            Manage Slots
          </Button>
        </Card>

        <Card>
          <h3 className="font-semibold text-stone-900 mb-4">Pending Applications</h3>
          <div className="space-y-3">
            {[
              { name: 'Sarah Chen', program: 'MSN - FNP', date: 'Feb 1' },
              { name: 'Mike Torres', program: 'BSN', date: 'Feb 3' },
              { name: 'Aisha Patel', program: 'DNP', date: 'Feb 5' },
            ].map(app => (
              <div key={app.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-stone-50 rounded-xl gap-2">
                <div>
                  <p className="text-sm font-medium text-stone-900">{app.name}</p>
                  <p className="text-xs text-stone-500">{app.program} - Applied {app.date}</p>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="primary">Accept</Button>
                  <Button size="sm" variant="ghost">Review</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function CoordinatorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">University Coordinator Dashboard</h1>
        <p className="text-stone-500">Monitor student placements and program compliance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: 156, icon: <GraduationCap className="w-5 h-5" />, color: 'primary' },
          { label: 'Placed', value: 128, icon: <CheckCircle className="w-5 h-5" />, color: 'green' },
          { label: 'Unplaced', value: 28, icon: <AlertCircle className="w-5 h-5" />, color: 'amber' },
          { label: 'Placement Rate', value: '82%', icon: <TrendingUp className="w-5 h-5" />, color: 'secondary' },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
                <p className="text-xs text-stone-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-stone-900 mb-4">Placement Status by Program</h3>
          {[
            { program: 'BSN', placed: 45, total: 52, color: 'primary' },
            { program: 'MSN - FNP', placed: 32, total: 38, color: 'secondary' },
            { program: 'DNP', placed: 22, total: 28, color: 'accent' },
            { program: 'DPT', placed: 18, total: 22, color: 'green' },
            { program: 'MSW', placed: 11, total: 16, color: 'purple' },
          ].map(p => (
            <div key={p.program} className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-stone-700">{p.program}</span>
                <span className="text-stone-500">{p.placed}/{p.total}</span>
              </div>
              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div className={`h-full bg-${p.color}-500 rounded-full`} style={{ width: `${(p.placed / p.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <h3 className="font-semibold text-stone-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { text: 'Sarah Chen placed at Mercy General (ED)', time: '2 hours ago', type: 'success' },
              { text: 'New affiliation agreement with Sunshine FHC', time: '5 hours ago', type: 'info' },
              { text: 'Mike Torres - BLS certification expiring in 14 days', time: '1 day ago', type: 'warning' },
              { text: '3 new rotation slots posted by Children\'s Wellness', time: '2 days ago', type: 'info' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-amber-500' : 'bg-primary-500'
                }`} />
                <div>
                  <p className="text-sm text-stone-700">{activity.text}</p>
                  <p className="text-xs text-stone-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function PreceptorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Preceptor Dashboard</h1>
        <p className="text-stone-500">Manage your students and clinical supervision</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Current Students', value: 3, icon: <Users className="w-5 h-5" />, color: 'primary' },
          { label: 'Hours to Review', value: 12, icon: <Clock className="w-5 h-5" />, color: 'amber' },
          { label: 'Evaluations Due', value: 2, icon: <ClipboardCheck className="w-5 h-5" />, color: 'secondary' },
          { label: 'Your Rating', value: '4.9', icon: <Star className="w-5 h-5" />, color: 'accent' },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
                <p className="text-xs text-stone-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold text-stone-900 mb-4">Your Students</h3>
        <div className="space-y-3">
          {[
            { name: 'Sarah Chen', program: 'MSN-FNP', hours: '34/160', status: 'On Track' },
            { name: 'David Kim', program: 'BSN', hours: '92/240', status: 'On Track' },
            { name: 'Maria Lopez', program: 'DNP', hours: '12/500', status: 'Just Started' },
          ].map(student => (
            <div key={student.name} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-900">{student.name}</p>
                  <p className="text-xs text-stone-500">{student.program} - {student.hours} hours</p>
                </div>
              </div>
              <Badge variant="success">{student.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Admin Dashboard</h1>
        <p className="text-stone-500">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '2,456', icon: <Users className="w-5 h-5" />, color: 'primary' },
          { label: 'Active Sites', value: 187, icon: <Building2 className="w-5 h-5" />, color: 'secondary' },
          { label: 'Universities', value: 45, icon: <BookOpen className="w-5 h-5" />, color: 'accent' },
          { label: 'Placements/Month', value: 342, icon: <BarChart3 className="w-5 h-5" />, color: 'green' },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
                <p className="text-xs text-stone-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
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
