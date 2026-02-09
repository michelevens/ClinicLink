import { useState } from 'react'
import { Users, Search, Shield, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { useAdminUsers, useUpdateUser, useDeleteUser } from '../hooks/useApi.ts'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import type { ApiUser } from '../services/api.ts'

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

  const handleToggleActive = async (user: ApiUser) => {
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
      <div>
        <h1 className="text-2xl font-bold text-stone-900">User Management</h1>
        <p className="text-stone-500 mt-1">Manage all platform users ({total} total)</p>
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
                  <tr key={user.id} className="hover:bg-stone-50 transition-colors">
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
                      <button onClick={() => { setEditRole(user); setNewRole(user.role) }}>
                        <Badge variant={ROLE_COLORS[user.role] || 'default'} size="sm">
                          {ROLE_LABELS[user.role] || user.role}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(user)}
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
                      <button
                        onClick={() => setDeleteConfirm(user)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
    </div>
  )
}
