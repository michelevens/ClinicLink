import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Search, Shield, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight,
  Trash2, Mail, Building2, GraduationCap, MapPin, Eye, UserPlus,
  Upload, X, Check, AlertTriangle, ShieldCheck, ShieldOff, CheckCircle2, Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { useAdminUsers, useUpdateUser, useDeleteUser, useCreateUser, useBulkInviteUsers, useUniversities, useSites } from '../hooks/useApi.ts'
import { Card } from '../components/ui/Card.tsx'
import { GradientAvatar } from '../components/ui/GradientAvatar.tsx'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { TableRowSkeleton } from '../components/ui/Skeleton.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import type { ApiUser } from '../services/api.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'

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
  usePageTitle('User Management')
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<ApiUser | null>(null)
  const [editRole, setEditRole] = useState<ApiUser | null>(null)
  const [newRole, setNewRole] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkInviteModal, setShowBulkInviteModal] = useState(false)

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
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">User Management</h1>
          <p className="text-stone-500 mt-1">Manage all platform users ({total} total)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulkInviteModal(true)}>
            <Upload className="w-4 h-4 mr-2" /> Bulk Invite
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add User
          </Button>
        </div>
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
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)}
              </tbody>
            </table>
          </div>
        </Card>
      ) : users.length === 0 ? (
        <Card>
          <EmptyState
            illustration="users"
            title="No users found"
            description="Try adjusting your search or filters."
          />
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
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-4 py-3 hidden md:table-cell">MFA</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-4 py-3 hidden md:table-cell">Onboarding</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-4 py-3 hidden sm:table-cell">Joined</th>
                  <th className="text-right text-xs font-semibold text-stone-500 uppercase px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map(user => (
                  <tr
                    key={user.id}
                    className="table-row-hover cursor-pointer"
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <GradientAvatar name={`${user.first_name} ${user.last_name}`} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-stone-900">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-stone-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <button onClick={e => { e.stopPropagation(); setEditRole(user); setNewRole(user.role) }}>
                          <Badge variant={ROLE_COLORS[user.role] || 'default'} size="sm">
                            {ROLE_LABELS[user.role] || user.role}
                          </Badge>
                        </button>
                        {(user as ApiUser & { affiliation?: string }).affiliation && (
                          <p className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                            {['student', 'coordinator', 'professor'].includes(user.role) ? (
                              <GraduationCap className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            ) : (
                              <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            )}
                            <span className="truncate max-w-[160px]">{(user as ApiUser & { affiliation?: string }).affiliation}</span>
                          </p>
                        )}
                      </div>
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
                    <td className="px-4 py-3 hidden md:table-cell">
                      {user.mfa_enabled ? (
                        <span className="flex items-center gap-1 text-xs text-green-600"><ShieldCheck className="w-3.5 h-3.5" />On</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-stone-400"><ShieldOff className="w-3.5 h-3.5" />Off</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {user.onboarding_completed_at ? (
                        <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="w-3.5 h-3.5" />Done</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-500"><Clock className="w-3.5 h-3.5" />Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-500 hidden sm:table-cell">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/admin/users/${user.id}`) }}
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

      {/* Bulk Invite Modal */}
      {showBulkInviteModal && (
        <BulkInviteModal onClose={() => setShowBulkInviteModal(false)} />
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


// ─── Bulk Invite Modal ──────────────────────────────────────────
function BulkInviteModal({ onClose }: { onClose: () => void }) {
  const [role, setRole] = useState<string>('student')
  const [universityId, setUniversityId] = useState('')
  const [programId, setProgramId] = useState('')
  const [siteIds, setSiteIds] = useState<string[]>([])
  const [emailText, setEmailText] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [error, setError] = useState('')
  const [results, setResults] = useState<{ email: string; status: string; reason?: string }[] | null>(null)
  const [summary, setSummary] = useState<{ sent: number; skipped: number; failed: number; total: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const bulkInvite = useBulkInviteUsers()
  const { data: uniData } = useUniversities()
  const { data: sitesData } = useSites()
  const universities = uniData?.data || []
  const sites = (sitesData as { data?: { id: string; name: string; city: string; state: string }[] })?.data || []

  const selectedUni = universities.find(u => u.id === universityId)
  const programs = selectedUni?.programs || []

  const showUniversity = ['student', 'coordinator', 'professor', 'preceptor'].includes(role)
  const showProgram = role === 'student' && universityId
  const showSites = ['site_manager', 'preceptor'].includes(role)

  const inputClass = "w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"

  const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g

  const parseEmails = (text: string) => {
    const found = text.match(EMAIL_RE) || []
    return [...new Set(found.map(e => e.toLowerCase()))]
  }

  const handleParseEmails = () => {
    const parsed = parseEmails(emailText)
    setEmails(prev => [...new Set([...prev, ...parsed])])
    setEmailText('')
  }

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const parsed = parseEmails(text)
      setEmails(prev => [...new Set([...prev, ...parsed])])
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeEmail = (email: string) => {
    setEmails(prev => prev.filter(e => e !== email))
  }

  const handleSubmit = async () => {
    setError('')
    if (emails.length === 0) {
      setError('Add at least one email address.')
      return
    }
    if (emails.length > 200) {
      setError('Maximum 200 emails per batch.')
      return
    }
    try {
      const res = await bulkInvite.mutateAsync({
        emails,
        role,
        university_id: showUniversity && universityId ? universityId : undefined,
        program_id: showProgram && programId ? programId : undefined,
        site_ids: showSites && siteIds.length > 0 ? siteIds : undefined,
      })
      setResults(res.results)
      setSummary(res.summary)
      toast.success(res.message)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bulk invite failed.'
      setError(msg)
    }
  }

  const toggleSite = (siteId: string) => {
    setSiteIds(prev => prev.includes(siteId) ? prev.filter(id => id !== siteId) : [...prev, siteId])
  }

  // Show results view after submission
  if (results && summary) {
    return (
      <Modal isOpen onClose={onClose} title="Bulk Invite Results" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{summary.sent}</p>
              <p className="text-xs text-green-600">Sent</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-amber-700">{summary.skipped}</p>
              <p className="text-xs text-amber-600">Skipped</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-700">{summary.failed}</p>
              <p className="text-xs text-red-600">Failed</p>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto border border-stone-200 rounded-xl divide-y divide-stone-100">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-stone-700">{r.email}</span>
                <div className="flex items-center gap-2">
                  {r.status === 'sent' && <Check className="w-4 h-4 text-green-500" />}
                  {r.status === 'skipped' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  {r.status === 'failed' && <X className="w-4 h-4 text-red-500" />}
                  <span className={`text-xs font-medium ${
                    r.status === 'sent' ? 'text-green-600' : r.status === 'skipped' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {r.status}{r.reason ? ` — ${r.reason}` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen onClose={onClose} title="Bulk Invite Users" size="lg">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Role *</label>
          <select className={inputClass} value={role} onChange={e => { setRole(e.target.value); setUniversityId(''); setProgramId(''); setSiteIds([]) }}>
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </div>

        {showUniversity && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              <Building2 className="w-3.5 h-3.5 inline mr-1" /> University
            </label>
            <select className={inputClass} value={universityId} onChange={e => { setUniversityId(e.target.value); setProgramId('') }}>
              <option value="">Select university...</option>
              {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        )}

        {showProgram && programs.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              <GraduationCap className="w-3.5 h-3.5 inline mr-1" /> Program
            </label>
            <select className={inputClass} value={programId} onChange={e => setProgramId(e.target.value)}>
              <option value="">Select program...</option>
              {programs.map((p: { id: string; name: string; degree_type: string }) => <option key={p.id} value={p.id}>{p.name} ({p.degree_type})</option>)}
            </select>
          </div>
        )}

        {showSites && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />
              {role === 'site_manager' ? 'Sites to Manage' : 'Associated Sites'}
            </label>
            <div className="max-h-32 overflow-y-auto border border-stone-200 rounded-xl divide-y divide-stone-100">
              {sites.map(site => (
                <label key={site.id} className="flex items-center gap-3 px-4 py-2 hover:bg-stone-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={siteIds.includes(site.id)}
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
          </div>
        )}

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Email Addresses</label>
          <textarea
            className={inputClass + ' min-h-[80px]'}
            placeholder="Enter emails separated by commas, spaces, or new lines..."
            value={emailText}
            onChange={e => setEmailText(e.target.value)}
            onBlur={handleParseEmails}
          />
          <div className="flex items-center gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={handleParseEmails} disabled={!emailText.trim()}>
              Add Emails
            </Button>
            <span className="text-xs text-stone-400">or</span>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-3.5 h-3.5 mr-1" /> Upload CSV
            </Button>
            <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleCsvUpload} />
          </div>
        </div>

        {/* Email List */}
        {emails.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-stone-700">{emails.length} email{emails.length !== 1 ? 's' : ''} ready</span>
              <button onClick={() => setEmails([])} className="text-xs text-red-500 hover:text-red-700">Clear all</button>
            </div>
            <div className="max-h-32 overflow-y-auto border border-stone-200 rounded-xl p-2 flex flex-wrap gap-1.5">
              {emails.map(email => (
                <span key={email} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 rounded-lg px-2.5 py-1 text-xs">
                  {email}
                  <button onClick={() => removeEmail(email)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-stone-50 rounded-xl p-3 text-xs text-stone-500">
          <Mail className="w-3.5 h-3.5 inline mr-1" />
          Each user will receive a welcome email with a password setup link. Existing users will be skipped.
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={bulkInvite.isPending} disabled={emails.length === 0}>
            <Mail className="w-4 h-4 mr-2" /> Send {emails.length} Invite{emails.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
