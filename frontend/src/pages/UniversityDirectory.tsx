import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, MapPin, Phone, Globe, Search, ChevronLeft, ChevronRight, GraduationCap, CheckCircle2, Clock, Plus, Pencil, Trash2, LayoutGrid, List } from 'lucide-react'
import { useUniversities, useCreateUniversity, useUpdateUniversity, useDeleteUniversity } from '../hooks/useApi.ts'
import { useAuth } from '../contexts/AuthContext.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { Input } from '../components/ui/Input.tsx'
import { toast } from 'sonner'
import type { ApiUniversity, ApiProgram } from '../services/api.ts'

const STATES = [
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'TX', label: 'Texas' },
  { value: 'NY', label: 'New York' },
  { value: 'CA', label: 'California' },
  { value: 'IL', label: 'Illinois' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'OH', label: 'Ohio' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MI', label: 'Michigan' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'WA', label: 'Washington' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'CO', label: 'Colorado' },
  { value: 'VA', label: 'Virginia' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'IN', label: 'Indiana' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'OR', label: 'Oregon' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'MO', label: 'Missouri' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'LA', label: 'Louisiana' },
]

const DEGREE_COLORS: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'default'> = {
  BSN: 'primary',
  MSN: 'secondary',
  DNP: 'success',
  PA: 'warning',
  NP: 'primary',
  DPT: 'default',
  OTD: 'default',
  MSW: 'secondary',
  PharmD: 'danger',
  other: 'default',
}

const emptyForm = { name: '', address: '', city: '', state: '', zip: '', phone: '', website: '', is_verified: false }

export function UniversityDirectory() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [state, setState] = useState('')
  const [page, setPage] = useState(1)
  const [viewUniversity, setViewUniversity] = useState<ApiUniversity | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // CRUD state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editUniversity, setEditUniversity] = useState<ApiUniversity | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiUniversity | null>(null)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useUniversities({ search: search || undefined, state: state || undefined, page })
  const createMutation = useCreateUniversity()
  const updateMutation = useUpdateUniversity()
  const deleteMutation = useDeleteUniversity()

  const universities = data?.data || []
  const totalPages = data?.last_page || 1
  const total = data?.total || 0

  const openCreate = () => {
    setForm(emptyForm)
    setShowCreateModal(true)
  }

  const openEdit = (uni: ApiUniversity) => {
    setForm({
      name: uni.name,
      address: uni.address || '',
      city: uni.city || '',
      state: uni.state || '',
      zip: uni.zip || '',
      phone: uni.phone || '',
      website: uni.website || '',
      is_verified: uni.is_verified,
    })
    setEditUniversity(uni)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync(form)
      toast.success('University created successfully')
      setShowCreateModal(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create university')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUniversity) return
    try {
      await updateMutation.mutateAsync({ id: editUniversity.id, data: form })
      toast.success('University updated successfully')
      setEditUniversity(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update university')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast.success('University deleted successfully')
      setDeleteTarget(null)
      if (viewUniversity?.id === deleteTarget.id) setViewUniversity(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete university')
    }
  }

  const formFields = (
    <div className="space-y-4">
      <Input label="Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="University name" />
      <Input label="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street address" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-stone-700">State</label>
          <select
            value={form.state}
            onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          >
            <option value="">Select state</option>
            {STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="ZIP" value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} placeholder="ZIP code" />
        <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 555-5555" />
      </div>
      <Input label="Website" type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_verified} onChange={e => setForm(f => ({ ...f, is_verified: e.target.checked }))} className="rounded border-stone-300 text-primary-500 focus:ring-primary-500" />
        <span className="text-sm font-medium text-stone-700">Verified university</span>
      </label>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">University Directory</h1>
          <p className="text-stone-500 mt-1">Browse {total > 0 ? `${total} ` : ''}universities and their healthcare programs</p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1.5" /> Add University
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by university name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          />
        </div>
        <select
          value={state}
          onChange={e => { setState(e.target.value); setPage(1) }}
          className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
        >
          <option value="">All States</option>
          {STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-xl border transition-colors ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600 border-primary-200' : 'text-stone-400 hover:text-stone-600 border-stone-300'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2.5 rounded-xl border transition-colors ${viewMode === 'table' ? 'bg-primary-50 text-primary-600 border-primary-200' : 'text-stone-400 hover:text-stone-600 border-stone-300'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* University Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : universities.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-stone-900 mb-1">No universities found</h3>
            <p className="text-stone-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {universities.map(uni => (
            <Card key={uni.id} hover>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-stone-900 truncate">{uni.name}</h3>
                      {uni.is_verified && <Badge variant="success" size="sm">Verified</Badge>}
                    </div>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {uni.city}, {uni.state}
                    </p>
                  </div>
                </div>

                {/* Programs Summary */}
                {uni.programs && uni.programs.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {uni.programs.slice(0, 4).map(p => (
                      <Badge key={p.id} variant={DEGREE_COLORS[p.degree_type] || 'default'} size="sm">{p.degree_type}</Badge>
                    ))}
                    {uni.programs.length > 4 && (
                      <Badge variant="default" size="sm">+{uni.programs.length - 4}</Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-3 text-xs text-stone-500">
                    {uni.phone && (
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {uni.phone}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> {uni.programs?.length || 0} programs
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(uni)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(uni)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/universities/${uni.id}`)}>Details</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-stone-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left px-4 py-3 font-medium text-stone-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Location</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Programs</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Website</th>
                <th className="text-right px-4 py-3 font-medium text-stone-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {universities.map(uni => (
                <tr key={uni.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-900">{uni.name}</span>
                      {uni.is_verified && <Badge variant="success" size="sm">Verified</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{uni.city}, {uni.state}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {uni.programs?.slice(0, 3).map(p => (
                        <Badge key={p.id} variant={DEGREE_COLORS[p.degree_type] || 'default'} size="sm">{p.degree_type}</Badge>
                      ))}
                      {(uni.programs?.length || 0) > 3 && <Badge variant="default" size="sm">+{(uni.programs?.length || 0) - 3}</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{uni.phone || '—'}</td>
                  <td className="px-4 py-3">
                    {uni.website ? (
                      <a href={uni.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-xs">
                        {uni.website.replace(/^https?:\/\//, '').slice(0, 30)}
                      </a>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isAdmin && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(uni)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(uni)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/universities/${uni.id}`)}>Details</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

      {/* University Detail Modal */}
      {viewUniversity && (
        <Modal isOpen onClose={() => setViewUniversity(null)} title={viewUniversity.name} size="lg">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-500 mb-1">Address</p>
                <p className="text-sm font-semibold text-stone-900">
                  {viewUniversity.address}, {viewUniversity.city}, {viewUniversity.state} {viewUniversity.zip}
                </p>
              </div>
              {viewUniversity.phone && (
                <div>
                  <p className="text-xs text-stone-500 mb-1">Phone</p>
                  <p className="text-sm font-semibold text-stone-900 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {viewUniversity.phone}
                  </p>
                </div>
              )}
              {viewUniversity.website && (
                <div>
                  <p className="text-xs text-stone-500 mb-1">Website</p>
                  <a
                    href={viewUniversity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-primary-600 flex items-center gap-1 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" /> {viewUniversity.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div>
                <p className="text-xs text-stone-500 mb-1">Status</p>
                <Badge variant={viewUniversity.is_verified ? 'success' : 'warning'}>
                  {viewUniversity.is_verified ? 'Verified' : 'Pending Verification'}
                </Badge>
              </div>
            </div>

            {viewUniversity.programs && viewUniversity.programs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary-500" />
                  Programs ({viewUniversity.programs.length})
                </h3>
                <div className="space-y-2">
                  {viewUniversity.programs.map((prog: ApiProgram) => (
                    <div
                      key={prog.id}
                      className="bg-stone-50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-stone-900 text-sm truncate">{prog.name}</h4>
                          <Badge variant={DEGREE_COLORS[prog.degree_type] || 'default'} size="sm">{prog.degree_type}</Badge>
                          {!prog.is_active && <Badge variant="danger" size="sm">Inactive</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-stone-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {prog.required_hours} hours required
                          </span>
                          {prog.specialties && prog.specialties.length > 0 && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {prog.specialties.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {isAdmin && (
                <>
                  <Button variant="outline" onClick={() => { setViewUniversity(null); openEdit(viewUniversity) }}>
                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                  </Button>
                  <Button variant="outline" onClick={() => { setViewUniversity(null); setDeleteTarget(viewUniversity) }} className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setViewUniversity(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create University Modal */}
      {showCreateModal && (
        <Modal isOpen onClose={() => setShowCreateModal(false)} title="Add University">
          <form onSubmit={handleCreate} className="space-y-6">
            {formFields}
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button type="submit" isLoading={createMutation.isPending}>Create University</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit University Modal */}
      {editUniversity && (
        <Modal isOpen onClose={() => setEditUniversity(null)} title="Edit University">
          <form onSubmit={handleUpdate} className="space-y-6">
            {formFields}
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setEditUniversity(null)}>Cancel</Button>
              <Button type="submit" isLoading={updateMutation.isPending}>Save Changes</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal isOpen onClose={() => setDeleteTarget(null)} title="Delete University" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This will also remove all associated programs. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button onClick={handleDelete} isLoading={deleteMutation.isPending} className="bg-red-600 hover:bg-red-700">
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
