import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Shield, Mail, Phone, Calendar, Clock, FileText, ClipboardCheck,
  Building2, GraduationCap, Award, MapPin, Star, Loader2, ToggleLeft, ToggleRight,
  Trash2, Users, Stethoscope, CheckCircle2, KeyRound, Pencil, Copy, Check, Plus, X,
  ShieldCheck, MessageSquare, BookOpen, Heart
} from 'lucide-react'
import { toast } from 'sonner'
import { useAdminUser, useUpdateUser, useDeleteUser, useResetUserPassword, useSites, useAssignPreceptorToSites, useRemovePreceptorFromSite, useAssignSiteManagerToSites, useRemoveSiteManagerFromSite, useUniversities, useAssignStudentProgram } from '../hooks/useApi.ts'
import { universitiesApi } from '../services/api.ts'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import type { ApiUser, AdminUserStats, ApiProgram } from '../services/api.ts'

const ROLES = ['student', 'preceptor', 'site_manager', 'coordinator', 'professor', 'admin'] as const
const ROLE_LABELS: Record<string, string> = {
  student: 'Student', preceptor: 'Preceptor', site_manager: 'Site Manager',
  coordinator: 'Coordinator', professor: 'Professor', admin: 'Admin',
}
const ROLE_COLORS: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'default'> = {
  student: 'primary', preceptor: 'secondary', site_manager: 'warning',
  coordinator: 'success', professor: 'default', admin: 'danger',
}

const BADGE_LABELS: Record<string, { label: string; color: string }> = {
  mentor_bronze: { label: 'Bronze Mentor', color: 'bg-amber-100 text-amber-700' },
  mentor_silver: { label: 'Silver Mentor', color: 'bg-stone-100 text-stone-600' },
  mentor_gold: { label: 'Gold Mentor', color: 'bg-yellow-100 text-yellow-700' },
  hours_100: { label: 'Century Supervisor', color: 'bg-blue-100 text-blue-700' },
  hours_500: { label: 'Master Supervisor', color: 'bg-purple-100 text-purple-700' },
  reviews_5: { label: '5 Reviews', color: 'bg-green-100 text-green-700' },
  reviews_20: { label: '20 Reviews', color: 'bg-teal-100 text-teal-700' },
  specialist_3: { label: 'Multi-Specialist', color: 'bg-indigo-100 text-indigo-700' },
  fast_responder: { label: 'Fast Responder', color: 'bg-rose-100 text-rose-700' },
}

export function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = useAdminUser(id!)
  const updateUser = useUpdateUser()
  const deleteUserMut = useDeleteUser()
  const resetPwMut = useResetUserPassword()

  const [editRole, setEditRole] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [resetPwConfirm, setResetPwConfirm] = useState(false)
  const [resetResult, setResetResult] = useState<{ temporary_password: string; email_sent: boolean } | null>(null)
  const [copied, setCopied] = useState(false)
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
        <h2 className="text-lg font-semibold text-stone-900">{error ? 'Failed to load user' : 'User not found'}</h2>
        {error && <p className="text-sm text-stone-500 mt-1">{(error as Error).message}</p>}
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

  const onboardingDone = !!user.onboarding_completed_at || user.onboarding_completed

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
                {!onboardingDone && <Badge variant="warning" size="sm">Onboarding Incomplete</Badge>}
                {user.preceptor_profile?.npi_verified_at && (
                  <Badge variant="success" size="sm"><ShieldCheck className="w-3 h-3 mr-1" />NPI Verified</Badge>
                )}
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
      {user.role === 'preceptor' && <PreceptorSections user={user} stats={stats} />}
      {user.role === 'site_manager' && <SiteManagerSections user={user} />}
      {(user.role === 'coordinator' || user.role === 'professor') && <FacultySections user={user} />}

      {/* Account Details (all roles) */}
      <AccountDetails user={user} stats={stats} />

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

      {/* Reset Password Confirmation / Result */}
      {resetPwConfirm && (
        <Modal isOpen onClose={() => { setResetPwConfirm(false); setResetResult(null); setCopied(false) }} title="Reset User Password" size="sm">
          {resetResult ? (
            <div className="space-y-4">
              <p className="text-sm text-stone-600">
                Password has been reset for <strong>{user.first_name} {user.last_name}</strong>.
                {!resetResult.email_sent && (
                  <span className="block mt-1 text-amber-600 font-medium">Email could not be sent. Please share the password with the user directly.</span>
                )}
                {resetResult.email_sent && (
                  <span className="block mt-1 text-green-600">Email sent to {user.email}.</span>
                )}
              </p>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Temporary Password</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-3 bg-stone-100 rounded-xl text-lg font-mono font-bold text-stone-900 tracking-wider text-center select-all">
                    {resetResult.temporary_password}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(resetResult.temporary_password)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-stone-400">
                The user should change this password after logging in.
              </p>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => { setResetPwConfirm(false); setResetResult(null); setCopied(false) }}>Done</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-stone-600">
                This will generate a new temporary password for <strong>{user.first_name} {user.last_name}</strong> and
                attempt to email it to <strong>{user.email}</strong>. The password will also be shown here.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setResetPwConfirm(false)}>Cancel</Button>
                <Button
                  onClick={async () => {
                    try {
                      const res = await resetPwMut.mutateAsync(user.id)
                      setResetResult({ temporary_password: res.temporary_password, email_sent: res.email_sent })
                      toast.success(res.message)
                    } catch (e: any) {
                      toast.error(e.message || 'Failed to reset password.')
                    }
                  }}
                  isLoading={resetPwMut.isPending}
                >
                  <KeyRound className="w-4 h-4 mr-2" /> Reset Password
                </Button>
              </div>
            </div>
          )}
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

// ─── Account Details (all roles) ──────────────────────────────────
function AccountDetails({ user, stats }: { user: ApiUser; stats?: AdminUserStats }) {
  const onboardingDone = !!user.onboarding_completed_at || user.onboarding_completed

  return (
    <Card>
      <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
        <Shield className="w-4 h-4 text-stone-500" /> Account Details
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-stone-50 rounded-xl p-3">
          <p className="text-xs text-stone-500 mb-1">Account Status</p>
          <p className={`text-sm font-medium ${user.is_active ? 'text-green-600' : 'text-stone-500'}`}>
            {user.is_active ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div className="bg-stone-50 rounded-xl p-3">
          <p className="text-xs text-stone-500 mb-1">Email Verified</p>
          <p className={`text-sm font-medium ${user.email_verified ? 'text-green-600' : 'text-amber-600'}`}>
            {user.email_verified ? 'Yes' : 'No'}
          </p>
        </div>
        <div className="bg-stone-50 rounded-xl p-3">
          <p className="text-xs text-stone-500 mb-1">Onboarding</p>
          <p className={`text-sm font-medium ${onboardingDone ? 'text-green-600' : 'text-amber-600'}`}>
            {onboardingDone ? 'Completed' : 'Incomplete'}
          </p>
        </div>
        <div className="bg-stone-50 rounded-xl p-3">
          <p className="text-xs text-stone-500 mb-1">MFA Enabled</p>
          <p className={`text-sm font-medium ${user.mfa_enabled ? 'text-green-600' : 'text-stone-500'}`}>
            {user.mfa_enabled ? 'Yes' : 'No'}
          </p>
        </div>
        {stats && (
          <>
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">Messages Sent</p>
              <p className="text-sm font-medium text-stone-900">{stats.messages_sent_count}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">Conversations</p>
              <p className="text-sm font-medium text-stone-900">{stats.conversations_count}</p>
            </div>
          </>
        )}
        <div className="bg-stone-50 rounded-xl p-3">
          <p className="text-xs text-stone-500 mb-1">Member Since</p>
          <p className="text-sm font-medium text-stone-900">{new Date(user.created_at).toLocaleDateString()}</p>
        </div>
        <div className="bg-stone-50 rounded-xl p-3">
          <p className="text-xs text-stone-500 mb-1">User ID</p>
          <p className="text-xs font-mono text-stone-600 truncate" title={user.id}>{user.id}</p>
        </div>
      </div>
    </Card>
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
      { icon: <Users className="w-5 h-5" />, label: 'Students Mentored', value: stats.total_students_mentored, color: 'bg-primary-50 text-primary-600' },
      { icon: <Clock className="w-5 h-5" />, label: 'Hours Supervised', value: `${stats.total_hours_supervised}h`, color: 'bg-secondary-50 text-secondary-600' },
      { icon: <GraduationCap className="w-5 h-5" />, label: 'Rotation Slots', value: stats.preceptor_slots_count, color: 'bg-green-50 text-green-600' },
      { icon: <ClipboardCheck className="w-5 h-5" />, label: 'Evaluations Written', value: stats.evaluations_as_preceptor, color: 'bg-amber-50 text-amber-600' },
      { icon: <Star className="w-5 h-5" />, label: 'Avg Rating', value: stats.average_rating > 0 ? `${stats.average_rating}/5` : 'N/A', color: 'bg-yellow-50 text-yellow-600' },
      { icon: <MessageSquare className="w-5 h-5" />, label: 'Reviews', value: stats.reviews_received_count, color: 'bg-purple-50 text-purple-600' },
    )
  } else if (user.role === 'site_manager') {
    cards.push(
      { icon: <Building2 className="w-5 h-5" />, label: 'Managed Sites', value: stats.managed_sites_count, color: 'bg-primary-50 text-primary-600' },
    )
  } else if (user.role === 'coordinator' || user.role === 'professor') {
    cards.push(
      { icon: <Users className="w-5 h-5" />, label: 'Students', value: stats.applications_count, color: 'bg-primary-50 text-primary-600' },
      { icon: <MessageSquare className="w-5 h-5" />, label: 'Conversations', value: stats.conversations_count, color: 'bg-secondary-50 text-secondary-600' },
    )
  }

  if (cards.length === 0) return null

  return (
    <div className={`grid grid-cols-2 ${cards.length >= 4 ? 'sm:grid-cols-4' : cards.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
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
  const [showAssignProgram, setShowAssignProgram] = useState(false)

  return (
    <>
      {/* Student Profile */}
      {profile && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary-500" /> Student Profile
            </h2>
            <Button size="sm" onClick={() => setShowAssignProgram(true)}>
              <Plus className="w-4 h-4 mr-1" /> Assign Program
            </Button>
          </div>
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

      {/* Assign Program Modal */}
      {showAssignProgram && (
        <AssignProgramModal
          studentId={user.id}
          currentProgramId={profile?.program?.id}
          onClose={() => setShowAssignProgram(false)}
        />
      )}
    </>
  )
}

// ─── Assign Program Modal ────────────────────────────────────────
function AssignProgramModal({ studentId, currentProgramId, onClose }: { studentId: string; currentProgramId?: string; onClose: () => void }) {
  const [selectedUniversityId, setSelectedUniversityId] = useState('')
  const [selectedProgramId, setSelectedProgramId] = useState('')
  const [programs, setPrograms] = useState<ApiProgram[]>([])
  const [loadingPrograms, setLoadingPrograms] = useState(false)
  const { data: universitiesData } = useUniversities()
  const assignMut = useAssignStudentProgram()

  const universities = (universitiesData as { data?: { id: string; name: string }[] })?.data || []

  const handleUniversityChange = async (universityId: string) => {
    setSelectedUniversityId(universityId)
    setSelectedProgramId('')
    setPrograms([])
    if (!universityId) return
    setLoadingPrograms(true)
    try {
      const progs = await universitiesApi.programs(universityId)
      setPrograms(progs)
    } catch {
      toast.error('Failed to load programs.')
    } finally {
      setLoadingPrograms(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedProgramId) return
    try {
      const res = await assignMut.mutateAsync({ studentId, programId: selectedProgramId })
      toast.success(res.message || 'Program assigned successfully.')
      onClose()
    } catch (e: any) {
      toast.error(e.message || 'Failed to assign program.')
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Assign Student to Program" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">University</label>
          <select
            value={selectedUniversityId}
            onChange={e => handleUniversityChange(e.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          >
            <option value="">Select a university...</option>
            {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Program</label>
          <select
            value={selectedProgramId}
            onChange={e => setSelectedProgramId(e.target.value)}
            disabled={!selectedUniversityId || loadingPrograms}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">{loadingPrograms ? 'Loading programs...' : 'Select a program...'}</option>
            {programs.map(p => (
              <option key={p.id} value={p.id} disabled={p.id === currentProgramId}>
                {p.name} ({p.degree_type}) {p.id === currentProgramId ? '(current)' : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedProgramId && (
          <div className="bg-primary-50 rounded-xl p-3">
            {(() => {
              const prog = programs.find(p => p.id === selectedProgramId)
              return prog ? (
                <div className="text-sm">
                  <p className="font-medium text-stone-900">{prog.name}</p>
                  <p className="text-stone-600">{prog.degree_type} &middot; {prog.required_hours}h required</p>
                  {prog.specialties?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {prog.specialties.map((s: string) => <Badge key={s} variant="default" size="sm">{s}</Badge>)}
                    </div>
                  )}
                </div>
              ) : null
            })()}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={assignMut.isPending} disabled={!selectedProgramId || selectedProgramId === currentProgramId}>
            <GraduationCap className="w-4 h-4 mr-2" /> Assign Program
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Preceptor Sections ──────────────────────────────────────────
function PreceptorSections({ user, stats }: { user: ApiUser; stats?: AdminUserStats }) {
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [removeConfirm, setRemoveConfirm] = useState<{ id: string; name: string } | null>(null)
  const removeMut = useRemovePreceptorFromSite()

  const assignedSites = user.assigned_sites || []
  const pp = user.preceptor_profile
  const reviews = user.preceptor_reviews_received || []

  const handleRemove = async () => {
    if (!removeConfirm) return
    try {
      const res = await removeMut.mutateAsync({ userId: user.id, siteId: removeConfirm.id })
      toast.success(res.message)
      setRemoveConfirm(null)
    } catch (e: any) {
      toast.error(e.message || 'Failed to remove from site.')
    }
  }

  return (
    <>
      {/* Preceptor Profile */}
      {pp && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-primary-500" /> Preceptor Profile
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">Availability</p>
              <p className={`text-sm font-medium ${
                pp.availability_status === 'available' ? 'text-green-600'
                : pp.availability_status === 'limited' ? 'text-amber-600' : 'text-stone-500'
              }`}>
                {pp.availability_status === 'available' ? 'Available' : pp.availability_status === 'limited' ? 'Limited' : 'Unavailable'}
              </p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">Max Students</p>
              <p className="text-sm font-medium text-stone-900">{pp.max_students ?? 'N/A'}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">Years Experience</p>
              <p className="text-sm font-medium text-stone-900">{pp.years_experience ?? 'N/A'}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">Profile Visibility</p>
              <p className="text-sm font-medium text-stone-900 capitalize">{pp.profile_visibility || 'public'}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">Preferred Schedule</p>
              <p className="text-sm font-medium text-stone-900 capitalize">{pp.preferred_schedule?.replace('_', ' ') || 'N/A'}</p>
            </div>
            {pp.npi_number && (
              <div className={`rounded-xl p-3 ${pp.npi_verified_at ? 'bg-teal-50' : 'bg-stone-50'}`}>
                <p className="text-xs text-stone-500 mb-1">NPI Number</p>
                <p className="text-sm font-medium text-stone-900 flex items-center gap-1">
                  {pp.npi_number}
                  {pp.npi_verified_at && <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />}
                </p>
              </div>
            )}
          </div>

          {/* Specialties */}
          {pp.specialties?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-stone-500 mb-1.5">Specialties</p>
              <div className="flex flex-wrap gap-1.5">
                {pp.specialties.map((s: string) => <Badge key={s} variant="secondary" size="sm">{s}</Badge>)}
              </div>
            </div>
          )}

          {/* Bio */}
          {pp.bio && (
            <div className="mt-3">
              <p className="text-xs text-stone-500 mb-1.5">Bio</p>
              <p className="text-sm text-stone-700 bg-stone-50 rounded-xl p-3">{pp.bio}</p>
            </div>
          )}

          {/* Teaching Philosophy */}
          {pp.teaching_philosophy && (
            <div className="mt-3">
              <p className="text-xs text-stone-500 mb-1.5">Teaching Philosophy</p>
              <p className="text-sm text-stone-700 bg-stone-50 rounded-xl p-3">{pp.teaching_philosophy}</p>
            </div>
          )}

          {/* Badges */}
          {pp.badges?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-stone-500 mb-1.5">Badges & Achievements</p>
              <div className="flex flex-wrap gap-1.5">
                {pp.badges.map((b: string) => {
                  const info = BADGE_LABELS[b]
                  return (
                    <span key={b} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${info?.color || 'bg-stone-100 text-stone-600'}`}>
                      <Award className="w-3 h-3" /> {info?.label || b}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Assigned Sites */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary-500" /> Assigned Sites ({assignedSites.length})
          </h2>
          <Button size="sm" onClick={() => setShowAssignModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Assign to Site
          </Button>
        </div>
        {assignedSites.length > 0 ? (
          <div className="space-y-2">
            {assignedSites.map((site) => (
              <div key={site.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <Link to={`/sites/${site.id}`} className="text-sm font-medium text-primary-600 hover:underline">{site.name}</Link>
                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {site.city}, {site.state}
                  </p>
                  {site.specialties?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {site.specialties.slice(0, 3).map((s: string) => <Badge key={s} variant="default" size="sm">{s}</Badge>)}
                      {site.specialties.length > 3 && <Badge variant="default" size="sm">+{site.specialties.length - 3}</Badge>}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setRemoveConfirm({ id: site.id, name: site.name })}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Remove from site"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-400 text-center py-4">No sites assigned yet.</p>
        )}
      </Card>

      {/* Rotation Slots */}
      {user.preceptor_slots && user.preceptor_slots.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary-500" /> Rotation Slots ({user.preceptor_slots.length})
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

      {/* Reviews Received */}
      {reviews.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" /> Student Reviews ({reviews.length})
            {stats && stats.average_rating > 0 && (
              <span className="ml-auto text-sm font-bold text-yellow-600 flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {stats.average_rating}/5
              </span>
            )}
          </h2>
          <div className="space-y-2">
            {reviews.map((review: any) => (
              <div key={review.id} className="p-3 bg-stone-50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-stone-900">
                    {review.student ? `${review.student.first_name} ${review.student.last_name}` : 'Anonymous'}
                  </p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`w-3.5 h-3.5 ${review.overall_score >= i ? 'text-yellow-400 fill-yellow-400' : 'text-stone-300'}`} />
                    ))}
                  </div>
                </div>
                {review.comments && <p className="text-sm text-stone-600 mt-1">{review.comments}</p>}
                <p className="text-xs text-stone-400 mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
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

      {/* Assign to Site Modal */}
      {showAssignModal && (
        <AssignToSiteModal
          userId={user.id}
          assignedSiteIds={assignedSites.map(s => s.id)}
          onClose={() => setShowAssignModal(false)}
        />
      )}

      {/* Remove Confirmation */}
      {removeConfirm && (
        <Modal isOpen onClose={() => setRemoveConfirm(null)} title="Remove from Site" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              Remove <strong>{user.first_name} {user.last_name}</strong> from <strong>{removeConfirm.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setRemoveConfirm(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleRemove} isLoading={removeMut.isPending}>
                <X className="w-4 h-4 mr-2" /> Remove
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

// ─── Assign to Site Modal ────────────────────────────────────────
function AssignToSiteModal({ userId, assignedSiteIds, onClose }: { userId: string; assignedSiteIds: string[]; onClose: () => void }) {
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([])
  const { data: sitesData } = useSites()
  const assignMut = useAssignPreceptorToSites()

  const sites = ((sitesData as { data?: { id: string; name: string; city: string; state: string }[] })?.data || [])
    .filter(s => !assignedSiteIds.includes(s.id))

  const toggleSite = (siteId: string) => {
    setSelectedSiteIds(prev => prev.includes(siteId) ? prev.filter(id => id !== siteId) : [...prev, siteId])
  }

  const handleSubmit = async () => {
    if (selectedSiteIds.length === 0) return
    try {
      const res = await assignMut.mutateAsync({ userId, siteIds: selectedSiteIds })
      toast.success(res.message)
      onClose()
    } catch (e: any) {
      toast.error(e.message || 'Failed to assign sites.')
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Assign Preceptor to Sites" size="md">
      <div className="space-y-4">
        {sites.length > 0 ? (
          <div className="max-h-64 overflow-y-auto border border-stone-200 rounded-xl divide-y divide-stone-100">
            {sites.map(site => (
              <label key={site.id} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSiteIds.includes(site.id)}
                  onChange={() => toggleSite(site.id)}
                  className="rounded border-stone-300 text-primary-500 focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-stone-900">{site.name}</p>
                  <p className="text-xs text-stone-500">{site.city}, {site.state}</p>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-400 text-center py-4">All sites are already assigned.</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={assignMut.isPending} disabled={selectedSiteIds.length === 0}>
            <Plus className="w-4 h-4 mr-2" /> Assign {selectedSiteIds.length > 0 ? `(${selectedSiteIds.length})` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Site Manager Sections ───────────────────────────────────────
function SiteManagerSections({ user }: { user: ApiUser }) {
  const [showAssignModal, setShowAssignModal] = useState(false)
  const removeMut = useRemoveSiteManagerFromSite()

  const handleRemove = async (siteId: string, siteName: string) => {
    if (!confirm(`Remove ${user.first_name} as manager of ${siteName}?`)) return
    try {
      const res = await removeMut.mutateAsync({ userId: user.id, siteId })
      toast.success(res.message)
    } catch (e: any) {
      toast.error(e.message || 'Failed to remove manager.')
    }
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary-500" /> Managed Sites ({user.managed_sites?.length || 0})
          </h2>
          <Button size="sm" onClick={() => setShowAssignModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Assign Sites
          </Button>
        </div>
        {user.managed_sites && user.managed_sites.length > 0 ? (
          <div className="space-y-2">
            {user.managed_sites.map((site: any) => (
              <div key={site.id} className="flex items-start justify-between p-4 bg-stone-50 rounded-xl">
                <Link to={`/sites/${site.id}`} className="flex-1 hover:opacity-80 transition-opacity">
                  <p className="text-sm font-semibold text-stone-900">{site.name}</p>
                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {site.city}, {site.state}
                  </p>
                  {site.specialties?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {site.specialties.slice(0, 5).map((s: string) => <Badge key={s} variant="default" size="sm">{s}</Badge>)}
                      {site.specialties.length > 5 && <Badge variant="default" size="sm">+{site.specialties.length - 5}</Badge>}
                    </div>
                  )}
                </Link>
                <button
                  onClick={() => handleRemove(site.id, site.name)}
                  className="ml-2 p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Remove as manager"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-400 text-center py-4">No sites managed by this user.</p>
        )}
      </Card>

      {showAssignModal && (
        <AssignSiteManagerModal
          userId={user.id}
          managedSiteIds={(user.managed_sites || []).map((s: any) => s.id)}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </>
  )
}

// ─── Assign Sites to Site Manager Modal ──────────────────────────
function AssignSiteManagerModal({ userId, managedSiteIds, onClose }: { userId: string; managedSiteIds: string[]; onClose: () => void }) {
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([])
  const { data: sitesData } = useSites()
  const assignMut = useAssignSiteManagerToSites()

  const sites = ((sitesData as { data?: { id: string; name: string; city: string; state: string }[] })?.data || [])
    .filter(s => !managedSiteIds.includes(s.id))

  const toggleSite = (siteId: string) => {
    setSelectedSiteIds(prev => prev.includes(siteId) ? prev.filter(id => id !== siteId) : [...prev, siteId])
  }

  const handleSubmit = async () => {
    if (selectedSiteIds.length === 0) return
    try {
      const res = await assignMut.mutateAsync({ userId, siteIds: selectedSiteIds })
      toast.success(res.message)
      onClose()
    } catch (e: any) {
      toast.error(e.message || 'Failed to assign sites.')
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Assign Sites to Manager" size="md">
      <div className="space-y-4">
        {sites.length > 0 ? (
          <div className="max-h-64 overflow-y-auto border border-stone-200 rounded-xl divide-y divide-stone-100">
            {sites.map(site => (
              <label key={site.id} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSiteIds.includes(site.id)}
                  onChange={() => toggleSite(site.id)}
                  className="rounded border-stone-300 text-primary-500 focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-stone-900">{site.name}</p>
                  <p className="text-xs text-stone-500">{site.city}, {site.state}</p>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-400 text-center py-4">All sites are already assigned.</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={assignMut.isPending} disabled={selectedSiteIds.length === 0}>
            <Plus className="w-4 h-4 mr-2" /> Assign {selectedSiteIds.length > 0 ? `(${selectedSiteIds.length})` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Faculty (Coordinator / Professor) Sections ─────────────────
function FacultySections({ user }: { user: ApiUser }) {
  const profile = user.student_profile

  return (
    <>
      {/* University Affiliation */}
      <Card>
        <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-primary-500" /> University Affiliation
        </h2>
        {profile?.university ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">University</p>
              <p className="text-sm font-medium text-stone-900">
                <Link to={`/universities/${profile.university.id}`} className="text-primary-600 hover:underline">
                  {profile.university.name}
                </Link>
              </p>
            </div>
            {profile.program && (
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-xs text-stone-500 mb-1">Program</p>
                <p className="text-sm font-medium text-stone-900">{profile.program.name}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-stone-400 text-center py-4">No university affiliation set.</p>
        )}
      </Card>
    </>
  )
}
