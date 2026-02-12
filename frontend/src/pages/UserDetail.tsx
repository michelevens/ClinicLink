import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Shield, Mail, Phone, Calendar, Clock, FileText, ClipboardCheck,
  Building2, GraduationCap, Award, MapPin, Star, Loader2, ToggleLeft, ToggleRight,
  Trash2, Users, Stethoscope, CheckCircle2, KeyRound, Pencil
} from 'lucide-react'
import { toast } from 'sonner'
import { useAdminUser, useUpdateUser, useDeleteUser, useResetUserPassword } from '../hooks/useApi.ts'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import type { ApiUser, AdminUserStats } from '../services/api.ts'

const ROLES = ['student', 'preceptor', 'site_manager', 'coordinator', 'professor', 'admin'] as const
const ROLE_LABELS: Record<string, string> = {
  student: 'Student', preceptor: 'Preceptor', site_manager: 'Site Manager',
  coordinator: 'Coordinator', professor: 'Professor', admin: 'Admin',
}
const ROLE_COLORS: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'default'> = {
  student: 'primary', preceptor: 'secondary', site_manager: 'warning',
  coordinator: 'success', professor: 'default', admin: 'danger',
}

export function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useAdminUser(id!)
  const updateUser = useUpdateUser()
  const deleteUserMut = useDeleteUser()
  const resetPwMut = useResetUserPassword()

  const [editRole, setEditRole] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [resetPwConfirm, setResetPwConfirm] = useState(false)
  const [editProfile, setEditProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', email: '', phone: '', username: '' })

  const user = data?.user
  const stats = data?.stats

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-24">
        <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-stone-900">User not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
        </Button>
      </div>
    )
  }

  const handleChangeRole = async () => {
    if (!newRole || newRole === user.role) return
    await updateUser.mutateAsync({ id: user.id, data: { role: newRole } })
    setEditRole(false)
  }

  const handleToggleActive = async () => {
    await updateUser.mutateAsync({ id: user.id, data: { is_active: !user.is_active } })
  }

  const handleDelete = async () => {
    await deleteUserMut.mutateAsync(user.id)
    navigate('/admin/users')
  }

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <button onClick={() => navigate('/admin/users')} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </button>

        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl shrink-0">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-stone-900">{user.first_name} {user.last_name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant={ROLE_COLORS[user.role] || 'default'}>{ROLE_LABELS[user.role] || user.role}</Badge>
                <Badge variant={user.is_active ? 'success' : 'default'}>{user.is_active ? 'Active' : 'Inactive'}</Badge>
                {user.email_verified && <Badge variant="success" size="sm"><CheckCircle2 className="w-3 h-3 mr-1" />Email Verified</Badge>}
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-stone-600">
                <span className="flex items-center gap-1"><Mail className="w-4 h-4 text-stone-400" /> {user.email}</span>
                {user.username && <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-stone-400" /> @{user.username}</span>}
                {user.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-stone-400" /> {user.phone}</span>}
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-stone-400" /> Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-primary-100">
            <Button variant="outline" size="sm" onClick={() => {
              setProfileForm({
                first_name: user.first_name, last_name: user.last_name,
                email: user.email, phone: user.phone || '', username: user.username || '',
              })
              setEditProfile(true)
            }}>
              <Pencil className="w-4 h-4 mr-1" /> Edit Profile
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setEditRole(true); setNewRole(user.role) }}>
              <Shield className="w-4 h-4 mr-1" /> Change Role
            </Button>
            <Button variant="outline" size="sm" onClick={handleToggleActive}>
              {user.is_active ? <ToggleRight className="w-4 h-4 mr-1" /> : <ToggleLeft className="w-4 h-4 mr-1" />}
              {user.is_active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setResetPwConfirm(true)}>
              <KeyRound className="w-4 h-4 mr-1" /> Reset Password
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(true)}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete User
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      {stats && <StatCards user={user} stats={stats} />}

      {/* Role-Specific Sections */}
      {user.role === 'student' && <StudentSections user={user} />}
      {user.role === 'preceptor' && <PreceptorSections user={user} />}
      {user.role === 'site_manager' && <SiteManagerSections user={user} />}

      {/* Change Role Modal */}
      {editRole && (
        <Modal isOpen onClose={() => setEditRole(false)} title="Change User Role" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              Changing role for <strong>{user.first_name} {user.last_name}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">New Role</label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              >
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditRole(false)}>Cancel</Button>
              <Button onClick={handleChangeRole} isLoading={updateUser.isPending}>
                <Shield className="w-4 h-4 mr-2" /> Update Role
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <Modal isOpen onClose={() => setDeleteConfirm(false)} title="Delete User" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              Are you sure you want to delete <strong>{user.first_name} {user.last_name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} isLoading={deleteUserMut.isPending}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reset Password Confirmation */}
      {resetPwConfirm && (
        <Modal isOpen onClose={() => setResetPwConfirm(false)} title="Reset User Password" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              A password reset link will be sent to <strong>{user.email}</strong>.
              The link expires in 60 minutes.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setResetPwConfirm(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  try {
                    const res = await resetPwMut.mutateAsync(user.id)
                    setResetPwConfirm(false)
                    toast.success(res.message)
                  } catch (e: any) {
                    toast.error(e.message || 'Failed to send reset email.')
                  }
                }}
                isLoading={resetPwMut.isPending}
              >
                <KeyRound className="w-4 h-4 mr-2" /> Send Reset Link
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Profile Modal */}
      {editProfile && (
        <Modal isOpen onClose={() => setEditProfile(false)} title="Edit User Profile" size="md">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={profileForm.first_name}
                  onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={profileForm.last_name}
                  onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Username</label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={e => setProfileForm({ ...profileForm, username: e.target.value })}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditProfile(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  try {
                    await updateUser.mutateAsync({ id: user.id, data: profileForm })
                    setEditProfile(false)
                    toast.success('User profile updated.')
                  } catch (e: any) {
                    toast.error(e.message || 'Failed to update profile.')
                  }
                }}
                isLoading={updateUser.isPending}
              >
                <Pencil className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── Stat Cards ──────────────────────────────────────────────────
function StatCards({ user, stats }: { user: ApiUser; stats: AdminUserStats }) {
  const cards: { icon: React.ReactNode; label: string; value: string | number; color: string }[] = []

  if (user.role === 'student') {
    cards.push(
      { icon: <FileText className="w-5 h-5" />, label: 'Applications', value: stats.applications_count, color: 'bg-primary-50 text-primary-600' },
      { icon: <Clock className="w-5 h-5" />, label: 'Total Hours', value: `${stats.total_hours}h`, color: 'bg-secondary-50 text-secondary-600' },
      { icon: <ClipboardCheck className="w-5 h-5" />, label: 'Evaluations', value: stats.evaluations_as_student, color: 'bg-green-50 text-green-600' },
      { icon: <Award className="w-5 h-5" />, label: 'Hour Logs', value: stats.hour_logs_count, color: 'bg-amber-50 text-amber-600' },
    )
  } else if (user.role === 'preceptor') {
    cards.push(
      { icon: <GraduationCap className="w-5 h-5" />, label: 'Rotation Slots', value: stats.preceptor_slots_count, color: 'bg-primary-50 text-primary-600' },
      { icon: <ClipboardCheck className="w-5 h-5" />, label: 'Evaluations Written', value: stats.evaluations_as_preceptor, color: 'bg-secondary-50 text-secondary-600' },
    )
  } else if (user.role === 'site_manager') {
    cards.push(
      { icon: <Building2 className="w-5 h-5" />, label: 'Managed Sites', value: stats.managed_sites_count, color: 'bg-primary-50 text-primary-600' },
    )
  } else if (user.role === 'coordinator' || user.role === 'professor') {
    cards.push(
      { icon: <Users className="w-5 h-5" />, label: 'Students', value: stats.applications_count, color: 'bg-primary-50 text-primary-600' },
    )
  }

  if (cards.length === 0) return null

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-${Math.min(cards.length, 4)} gap-3`}>
      {cards.map(c => (
        <div key={c.label} className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mx-auto mb-2`}>{c.icon}</div>
          <p className="text-xl font-bold text-stone-900">{c.value}</p>
          <p className="text-xs text-stone-500">{c.label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Student Sections ────────────────────────────────────────────
function StudentSections({ user }: { user: ApiUser }) {
  const profile = user.student_profile

  return (
    <>
      {/* Student Profile */}
      {profile && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary-500" /> Student Profile
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">University</p>
              <p className="text-sm font-medium text-stone-900">
                {profile.university ? (
                  <Link to={`/universities/${profile.university.id}`} className="text-primary-600 hover:underline">{profile.university.name}</Link>
                ) : 'N/A'}
              </p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">Program</p>
              <p className="text-sm font-medium text-stone-900">{profile.program?.name || 'N/A'}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">Degree</p>
              <p className="text-sm font-medium text-stone-900">{profile.program?.degree_type || 'N/A'}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">GPA</p>
              <p className="text-sm font-medium text-stone-900">{profile.gpa?.toFixed(2) || 'N/A'}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">Graduation</p>
              <p className="text-sm font-medium text-stone-900">{profile.graduation_date ? new Date(profile.graduation_date).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">Hours Progress</p>
              <p className="text-sm font-medium text-stone-900">{(profile.prior_hours || 0) + (profile.hours_completed || 0)} / {profile.program?.required_hours || '?'}h</p>
            </div>
          </div>
          {profile.clinical_interests?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-stone-500 mb-1.5">Clinical Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.clinical_interests.map((i: string) => <Badge key={i} variant="default" size="sm">{i}</Badge>)}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Credentials */}
      {user.credentials && user.credentials.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-500" /> Credentials ({user.credentials.length})
          </h2>
          <div className="space-y-2">
            {user.credentials.map((cred: any) => (
              <div key={cred.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{cred.name}</p>
                  <p className="text-xs text-stone-500">
                    {cred.type?.replace('_', ' ')}
                    {cred.expiration_date ? ` - Expires ${new Date(cred.expiration_date).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <Badge
                  variant={cred.status === 'valid' ? 'success' : cred.status === 'expired' ? 'danger' : 'warning'}
                  size="sm"
                >{cred.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Applications */}
      {user.applications && user.applications.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-500" /> Applications ({user.applications.length})
          </h2>
          <div className="space-y-2">
            {user.applications.map((app: any) => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{app.slot?.title || 'Unknown Rotation'}</p>
                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    {app.slot?.site && (
                      <Link to={`/sites/${app.slot.site.id}`} className="text-primary-600 hover:underline flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {app.slot.site.name}
                      </Link>
                    )}
                    {app.submitted_at && <> - {new Date(app.submitted_at).toLocaleDateString()}</>}
                  </p>
                </div>
                <Badge
                  variant={app.status === 'accepted' ? 'success' : app.status === 'pending' ? 'warning' : app.status === 'declined' ? 'danger' : 'default'}
                  size="sm"
                >{app.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Hour Logs */}
      {user.hour_logs && user.hour_logs.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-500" /> Hour Logs ({user.hour_logs.length})
          </h2>
          <div className="space-y-2">
            {user.hour_logs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{Number(log.hours_worked)}h - {log.category?.replace('_', ' ')}</p>
                  <p className="text-xs text-stone-500">{new Date(log.date).toLocaleDateString()}</p>
                </div>
                <Badge
                  variant={log.status === 'approved' ? 'success' : log.status === 'pending' ? 'warning' : 'danger'}
                  size="sm"
                >{log.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Evaluations */}
      {user.evaluations_as_student && user.evaluations_as_student.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-primary-500" /> Evaluations ({user.evaluations_as_student.length})
          </h2>
          <div className="space-y-2">
            {user.evaluations_as_student.map((ev: any) => (
              <div key={ev.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {ev.type === 'mid_rotation' ? 'Mid-Rotation' : ev.type === 'final' ? 'Final' : 'Feedback'}
                  </p>
                  <p className="text-xs text-stone-500">
                    {ev.slot?.title || ''} {ev.preceptor ? `by ${ev.preceptor.first_name} ${ev.preceptor.last_name}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  {ev.overall_score > 0 && <p className="text-sm font-bold text-primary-600">{ev.overall_score}/5</p>}
                  <Badge variant={ev.is_submitted ? 'success' : 'warning'} size="sm">{ev.is_submitted ? 'Complete' : 'Pending'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}

// ─── Preceptor Sections ──────────────────────────────────────────
function PreceptorSections({ user }: { user: ApiUser }) {
  return (
    <>
      {/* Rotation Slots */}
      {user.preceptor_slots && user.preceptor_slots.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-primary-500" /> Assigned Rotation Slots ({user.preceptor_slots.length})
          </h2>
          <div className="space-y-2">
            {user.preceptor_slots.map((slot: any) => (
              <div key={slot.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{slot.title}</p>
                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    {slot.site && (
                      <Link to={`/sites/${slot.site.id}`} className="text-primary-600 hover:underline flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {slot.site.name}
                      </Link>
                    )}
                    {slot.specialty && <> - {slot.specialty}</>}
                  </p>
                </div>
                <Badge variant={slot.status === 'open' ? 'success' : slot.status === 'filled' ? 'warning' : 'default'} size="sm">
                  {slot.status} ({slot.filled}/{slot.capacity})
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Evaluations Written */}
      {user.evaluations_as_preceptor && user.evaluations_as_preceptor.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-primary-500" /> Evaluations Written ({user.evaluations_as_preceptor.length})
          </h2>
          <div className="space-y-2">
            {user.evaluations_as_preceptor.map((ev: any) => (
              <div key={ev.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {ev.student ? `${ev.student.first_name} ${ev.student.last_name}` : 'Unknown Student'}
                  </p>
                  <p className="text-xs text-stone-500">
                    {ev.type === 'mid_rotation' ? 'Mid-Rotation' : ev.type === 'final' ? 'Final' : 'Feedback'}
                    {ev.slot ? ` - ${ev.slot.title}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  {ev.overall_score > 0 && <p className="text-sm font-bold text-primary-600">{ev.overall_score}/5</p>}
                  <Badge variant={ev.is_submitted ? 'success' : 'warning'} size="sm">{ev.is_submitted ? 'Submitted' : 'Draft'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}

// ─── Site Manager Sections ───────────────────────────────────────
function SiteManagerSections({ user }: { user: ApiUser }) {
  return (
    <>
      {user.managed_sites && user.managed_sites.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary-500" /> Managed Sites ({user.managed_sites.length})
          </h2>
          <div className="space-y-2">
            {user.managed_sites.map((site: any) => (
              <Link key={site.id} to={`/sites/${site.id}`} className="block p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{site.name}</p>
                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {site.city}, {site.state}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {site.is_verified && <Badge variant="success" size="sm"><CheckCircle2 className="w-3 h-3 mr-0.5" />Verified</Badge>}
                    {site.rating > 0 && (
                      <span className="text-sm text-amber-600 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />{site.rating}
                      </span>
                    )}
                  </div>
                </div>
                {site.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {site.specialties.slice(0, 5).map((s: string) => <Badge key={s} variant="default" size="sm">{s}</Badge>)}
                    {site.specialties.length > 5 && <Badge variant="default" size="sm">+{site.specialties.length - 5}</Badge>}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}
