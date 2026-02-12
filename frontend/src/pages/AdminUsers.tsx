import { useState } from 'react'
import {
  Users, Search, Shield, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight,
  Trash2, Mail, Phone, Calendar, Clock, FileText, ClipboardCheck, Building2,
  GraduationCap, Award, MapPin, Star, Loader2, Eye, UserPlus
} from 'lucide-react'
import { useAdminUsers, useAdminUser, useUpdateUser, useDeleteUser, useCreateUser, useUniversities, useSites } from '../hooks/useApi.ts'
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

export function AdminUsers() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<ApiUser | null>(null)
  const [editRole, setEditRole] = useState<ApiUser | null>(null)
  const [newRole, setNewRole] = useState('')
  const [viewUserId, setViewUserId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data, isLoading } = useAdminUsers({
    search: search || undefined,
    role: roleFilter || undefined,
    page,
  })
  const users = data?.data || []
  const totalPages = data?.last_page || 1
  const total = data?.total || 0

  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const handleToggleActive = async (user: ApiUser, e: React.MouseEvent) => {
    e.stopPropagation()
    await updateUser.mutateAsync({ id: user.id, data: { is_active: !user.is_active } })
  }

  const handleChangeRole = async () => {
    if (!editRole || !newRole) return
    await updateUser.mutateAsync({ id: editRole.id, data: { role: newRole } })
    setEditRole(null)
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    await deleteUser.mutateAsync(deleteConfirm.id)
    setDeleteConfirm(null)
    setViewUserId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">User Management</h1>
          <p className="text-stone-500 mt-1">Manage all platform users ({total} total)</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name, email, username..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
        >
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-stone-900 mb-1">No users found</h3>
            <p className="text-stone-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-4 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-4 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-4 py-3">Joined</th>
                  <th className="text-right text-xs font-semibold text-stone-500 uppercase px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map(user => (
                  <tr
                    key={user.id}
                    className="hover:bg-stone-50 transition-colors cursor-pointer"
                    onClick={() => setViewUserId(user.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
                          {user.first_name[0]}{user.last_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-900">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-stone-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={e => { e.stopPropagation(); setEditRole(user); setNewRole(user.role) }}>
                        <Badge variant={ROLE_COLORS[user.role] || 'default'} size="sm">
                          {ROLE_LABELS[user.role] || user.role}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={e => handleToggleActive(user, e)}
                        className="flex items-center gap-1.5 text-sm"
                        title={user.is_active ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {user.is_active ? (
                          <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-green-600">Active</span></>
                        ) : (
                          <><ToggleLeft className="w-5 h-5 text-stone-400" /><span className="text-stone-400">Inactive</span></>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={e => { e.stopPropagation(); setViewUserId(user.id) }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setDeleteConfirm(user) }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-stone-600">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* User Detail Modal */}
      {viewUserId && (
        <UserDetailModal
          userId={viewUserId}
          onClose={() => setViewUserId(null)}
          onChangeRole={(user) => { setEditRole(user); setNewRole(user.role) }}
          onToggleActive={(user) => updateUser.mutateAsync({ id: user.id, data: { is_active: !user.is_active } })}
          onDelete={(user) => setDeleteConfirm(user)}
        />
      )}

      {/* Change Role Modal */}
      {editRole && (
        <Modal isOpen onClose={() => setEditRole(null)} title="Change User Role" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              Changing role for <strong>{editRole.first_name} {editRole.last_name}</strong>
            </p>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">New Role</label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              >
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditRole(null)}>Cancel</Button>
              <Button onClick={handleChangeRole} isLoading={updateUser.isPending}>
                <Shield className="w-4 h-4 mr-2" /> Update Role
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <Modal isOpen onClose={() => setDeleteConfirm(null)} title="Delete User" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              Are you sure you want to delete <strong>{deleteConfirm.first_name} {deleteConfirm.last_name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} isLoading={deleteUser.isPending}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}

// ─── User Detail Modal ───────────────────────────────────────────
function UserDetailModal({ userId, onClose, onChangeRole, onToggleActive, onDelete }: {
  userId: string
  onClose: () => void
  onChangeRole: (user: ApiUser) => void
  onToggleActive: (user: ApiUser) => void
  onDelete: (user: ApiUser) => void
}) {
  const { data, isLoading } = useAdminUser(userId)
  const user = data?.user
  const stats = data?.stats

  return (
    <Modal isOpen onClose={onClose} title="User Details" size="xl">
      {isLoading || !user ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-5">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl shrink-0">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-stone-900">{user.first_name} {user.last_name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant={ROLE_COLORS[user.role] || 'default'}>{ROLE_LABELS[user.role] || user.role}</Badge>
                <Badge variant={user.is_active ? 'success' : 'default'}>{user.is_active ? 'Active' : 'Inactive'}</Badge>
                {user.email_verified && <Badge variant="success" size="sm">Email Verified</Badge>}
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-stone-600">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-stone-400" /> {user.email}</span>
                {user.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-stone-400" /> {user.phone}</span>}
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-stone-400" /> Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {stats && <UserStatCards user={user} stats={stats} />}

          {/* Role-Specific Sections */}
          {user.role === 'student' && <StudentDetails user={user} />}
          {user.role === 'preceptor' && <PreceptorDetails user={user} stats={stats} />}
          {user.role === 'site_manager' && <SiteManagerDetails user={user} />}

          {/* Admin Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200">
            <Button variant="outline" size="sm" onClick={() => onChangeRole(user)}>
              <Shield className="w-4 h-4" /> Change Role
            </Button>
            <Button variant="outline" size="sm" onClick={() => onToggleActive(user)}>
              {user.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {user.is_active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(user)}>
              <Trash2 className="w-4 h-4" /> Delete User
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Stat Cards ──────────────────────────────────────────────────
function UserStatCards({ user, stats }: { user: ApiUser; stats: AdminUserStats }) {
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
      { icon: <Clock className="w-5 h-5" />, label: 'Hours Supervised', value: `${stats.total_hours}h`, color: 'bg-green-50 text-green-600' },
    )
  } else if (user.role === 'site_manager') {
    cards.push(
      { icon: <Building2 className="w-5 h-5" />, label: 'Managed Sites', value: stats.managed_sites_count, color: 'bg-primary-50 text-primary-600' },
    )
  }

  if (cards.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(c => (
        <div key={c.label} className="bg-stone-50 rounded-xl p-3 text-center">
          <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mx-auto mb-2`}>{c.icon}</div>
          <p className="text-lg font-bold text-stone-900">{c.value}</p>
          <p className="text-xs text-stone-500">{c.label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Student Details ─────────────────────────────────────────────
function StudentDetails({ user }: { user: ApiUser }) {
  const profile = user.student_profile

  return (
    <div className="space-y-5">
      {/* Student Profile */}
      {profile && (
        <div>
          <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary-500" /> Student Profile
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">University</p>
              <p className="text-sm font-medium text-stone-900">{profile.university?.name || 'N/A'}</p>
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
              <p className="text-sm font-medium text-stone-900">{profile.hours_completed} / {profile.hours_required}h</p>
            </div>
          </div>
          {profile.clinical_interests?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-stone-500 mb-1.5">Clinical Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.clinical_interests.map(i => <Badge key={i} variant="default" size="sm">{i}</Badge>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Credentials */}
      {user.credentials && user.credentials.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-500" /> Credentials ({user.credentials.length})
          </h3>
          <div className="space-y-2">
            {user.credentials.map(cred => (
              <div key={cred.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{cred.name}</p>
                  <p className="text-xs text-stone-500">{cred.type.replace('_', ' ')} {cred.expiration_date ? `- Expires ${new Date(cred.expiration_date).toLocaleDateString()}` : ''}</p>
                </div>
                <Badge
                  variant={cred.status === 'valid' ? 'success' : cred.status === 'expired' ? 'danger' : 'warning'}
                  size="sm"
                >{cred.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applications */}
      {user.applications && user.applications.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-500" /> Applications ({user.applications.length})
          </h3>
          <div className="space-y-2">
            {user.applications.map(app => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{app.slot?.title || 'Unknown Rotation'}</p>
                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {app.slot?.site?.name || 'Unknown Site'}
                    {' - '}{new Date(app.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={app.status === 'accepted' ? 'success' : app.status === 'pending' ? 'warning' : app.status === 'declined' ? 'danger' : 'default'}
                  size="sm"
                >{app.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hour Logs */}
      {user.hour_logs && user.hour_logs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-500" /> Recent Hour Logs ({user.hour_logs.length})
          </h3>
          <div className="space-y-2">
            {user.hour_logs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{log.hours_worked}h - {log.category.replace('_', ' ')}</p>
                  <p className="text-xs text-stone-500">{new Date(log.date).toLocaleDateString()} - {log.slot?.title || ''}</p>
                </div>
                <Badge
                  variant={log.status === 'approved' ? 'success' : log.status === 'pending' ? 'warning' : 'danger'}
                  size="sm"
                >{log.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluations */}
      {user.evaluations_as_student && user.evaluations_as_student.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-primary-500" /> Evaluations ({user.evaluations_as_student.length})
          </h3>
          <div className="space-y-2">
            {user.evaluations_as_student.map(ev => (
              <div key={ev.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {ev.type === 'mid_rotation' ? 'Mid-Rotation' : ev.type === 'final' ? 'Final' : 'Feedback'}
                  </p>
                  <p className="text-xs text-stone-500">{ev.slot?.title || ''} {ev.preceptor ? `by ${ev.preceptor.first_name} ${ev.preceptor.last_name}` : ''}</p>
                </div>
                <div className="text-right">
                  {ev.overall_score > 0 && <p className="text-sm font-bold text-primary-600">{ev.overall_score}/5</p>}
                  <Badge variant={ev.is_submitted ? 'success' : 'warning'} size="sm">{ev.is_submitted ? 'Complete' : 'Pending'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Preceptor Details ───────────────────────────────────────────
function PreceptorDetails({ user, stats }: { user: ApiUser; stats?: AdminUserStats }) {
  return (
    <div className="space-y-5">
      {/* Rotation Slots */}
      {user.preceptor_slots && user.preceptor_slots.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary-500" /> Assigned Rotation Slots ({user.preceptor_slots.length})
          </h3>
          <div className="space-y-2">
            {user.preceptor_slots.map(slot => (
              <div key={slot.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{slot.title}</p>
                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {slot.site?.name || ''}
                    {' - '}{slot.specialty}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={slot.status === 'open' ? 'success' : slot.status === 'filled' ? 'warning' : 'default'} size="sm">
                    {slot.status} ({slot.filled}/{slot.capacity})
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluations Written */}
      {user.evaluations_as_preceptor && user.evaluations_as_preceptor.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-primary-500" /> Evaluations Written ({user.evaluations_as_preceptor.length})
          </h3>
          <div className="space-y-2">
            {user.evaluations_as_preceptor.map(ev => (
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
        </div>
      )}
    </div>
  )
}

// ─── Site Manager Details ────────────────────────────────────────
function SiteManagerDetails({ user }: { user: ApiUser }) {
  return (
    <div className="space-y-5">
      {user.managed_sites && user.managed_sites.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary-500" /> Managed Sites ({user.managed_sites.length})
          </h3>
          <div className="space-y-2">
            {user.managed_sites.map(site => (
              <div key={site.id} className="p-4 bg-stone-50 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{site.name}</p>
                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {site.city}, {site.state}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {site.is_verified && <Badge variant="success" size="sm">Verified</Badge>}
                    {site.rating > 0 && (
                      <span className="text-sm text-amber-600 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />{site.rating}
                      </span>
                    )}
                  </div>
                </div>
                {site.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {site.specialties.slice(0, 5).map(s => <Badge key={s} variant="default" size="sm">{s}</Badge>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Create User Modal ──────────────────────────────────────────
function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', username: '', phone: '',
    role: 'student' as string,
    university_id: '', program_id: '', site_ids: [] as string[],
  })
  const [error, setError] = useState('')

  const createUser = useCreateUser()
  const { data: uniData } = useUniversities()
  const { data: sitesData } = useSites()
  const universities = uniData?.data || []
  const sites = (sitesData as { data?: { id: string; name: string; city: string; state: string }[] })?.data || []

  const selectedUni = universities.find(u => u.id === form.university_id)
  const programs = selectedUni?.programs || []

  const showUniversity = ['student', 'coordinator', 'professor', 'preceptor'].includes(form.role)
  const showProgram = form.role === 'student' && form.university_id
  const showSites = ['site_manager', 'preceptor'].includes(form.role)

  const handleSubmit = async () => {
    setError('')
    if (!form.first_name || !form.last_name || !form.email || !form.role) {
      setError('First name, last name, email, and role are required.')
      return
    }
    try {
      await createUser.mutateAsync({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        role: form.role,
        username: form.username || undefined,
        phone: form.phone || undefined,
        university_id: showUniversity && form.university_id ? form.university_id : undefined,
        program_id: showProgram && form.program_id ? form.program_id : undefined,
        site_ids: showSites && form.site_ids.length > 0 ? form.site_ids : undefined,
      })
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create user.'
      setError(msg)
    }
  }

  const toggleSite = (siteId: string) => {
    setForm(f => ({
      ...f,
      site_ids: f.site_ids.includes(siteId)
        ? f.site_ids.filter(id => id !== siteId)
        : [...f.site_ids, siteId],
    }))
  }

  const inputClass = "w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"

  return (
    <Modal isOpen onClose={onClose} title="Add New User" size="lg">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">First Name *</label>
            <input className={inputClass} value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Last Name *</label>
            <input className={inputClass} value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Email *</label>
          <input type="email" className={inputClass} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Username</label>
            <input className={inputClass} placeholder="lowercase, no spaces" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
            <input className={inputClass} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Role *</label>
          <select className={inputClass} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value, university_id: '', program_id: '', site_ids: [] }))}>
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </div>

        {showUniversity && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              <Building2 className="w-3.5 h-3.5 inline mr-1" />
              University
            </label>
            <select className={inputClass} value={form.university_id} onChange={e => setForm(f => ({ ...f, university_id: e.target.value, program_id: '' }))}>
              <option value="">Select university...</option>
              {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        )}

        {showProgram && programs.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              <GraduationCap className="w-3.5 h-3.5 inline mr-1" />
              Program
            </label>
            <select className={inputClass} value={form.program_id} onChange={e => setForm(f => ({ ...f, program_id: e.target.value }))}>
              <option value="">Select program...</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.degree_type})</option>)}
            </select>
          </div>
        )}

        {showSites && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />
              {form.role === 'site_manager' ? 'Sites to Manage' : 'Associated Sites'}
            </label>
            <div className="max-h-40 overflow-y-auto border border-stone-200 rounded-xl divide-y divide-stone-100">
              {sites.map(site => (
                <label key={site.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.site_ids.includes(site.id)}
                    onChange={() => toggleSite(site.id)}
                    className="rounded border-stone-300 text-primary-500 focus:ring-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-stone-900">{site.name}</p>
                    <p className="text-xs text-stone-500">{site.city}, {site.state}</p>
                  </div>
                </label>
              ))}
              {sites.length === 0 && <p className="px-4 py-3 text-sm text-stone-400">No sites available</p>}
            </div>
          </div>
        )}

        <div className="bg-stone-50 rounded-xl p-3 text-xs text-stone-500">
          <Mail className="w-3.5 h-3.5 inline mr-1" />
          A welcome email with a password setup link will be sent to the user.
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={createUser.isPending}>
            <UserPlus className="w-4 h-4 mr-2" /> Create User
          </Button>
        </div>
      </div>
    </Modal>
  )
}
