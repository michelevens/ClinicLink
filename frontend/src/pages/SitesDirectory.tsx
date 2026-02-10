import { useState, useMemo } from 'react'
import { Building2, MapPin, Phone, Globe, Star, Search, Stethoscope, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, LayoutGrid, List } from 'lucide-react'
import { useSites, useCreateSite, useUpdateSite } from '../hooks/useApi.ts'
import { useAuth } from '../contexts/AuthContext.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { Input } from '../components/ui/Input.tsx'
import { toast } from 'sonner'
import { sitesApi, type ApiSite } from '../services/api.ts'

const emptySiteForm = {
  name: '', address: '', city: '', state: '', zip: '', phone: '',
  website: '', description: '', specialties: [] as string[], ehr_system: '',
}

export function SitesDirectory() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isSiteManager = user?.role === 'site_manager'
  const canCreate = isAdmin || isSiteManager

  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [state, setState] = useState('')
  const [page, setPage] = useState(1)
  const [viewSite, setViewSite] = useState<ApiSite | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // CRUD state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editSite, setEditSite] = useState<ApiSite | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiSite | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [form, setForm] = useState(emptySiteForm)
  const [specialtyInput, setSpecialtyInput] = useState('')

  const { data, isLoading, refetch } = useSites({ search, specialty: specialty || undefined, state: state || undefined, page })
  const createMutation = useCreateSite()
  const updateMutation = useUpdateSite()

  const sites = data?.data || []
  const totalPages = data?.last_page || 1
  const total = data?.total || 0

  const specialties = useMemo(() => {
    const set = new Set<string>()
    sites.forEach(s => s.specialties.forEach(sp => set.add(sp)))
    return Array.from(set).sort()
  }, [sites])

  const openCreate = () => {
    setForm(emptySiteForm)
    setSpecialtyInput('')
    setShowCreateModal(true)
  }

  const openEdit = (site: ApiSite) => {
    setForm({
      name: site.name,
      address: site.address,
      city: site.city,
      state: site.state,
      zip: site.zip,
      phone: site.phone,
      website: site.website || '',
      description: site.description,
      specialties: [...site.specialties],
      ehr_system: site.ehr_system || '',
    })
    setSpecialtyInput('')
    setEditSite(site)
  }

  const canEditSite = (site: ApiSite) => isAdmin || site.manager_id === user?.id

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync(form)
      toast.success('Site created successfully')
      setShowCreateModal(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create site')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editSite) return
    try {
      await updateMutation.mutateAsync({ id: editSite.id, data: form })
      toast.success('Site updated successfully')
      setEditSite(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update site')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await sitesApi.delete(deleteTarget.id)
      toast.success('Site deleted successfully')
      setDeleteTarget(null)
      if (viewSite?.id === deleteTarget.id) setViewSite(null)
      refetch()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete site')
    } finally {
      setIsDeleting(false)
    }
  }

  const addSpecialty = () => {
    const val = specialtyInput.trim()
    if (val && !form.specialties.includes(val)) {
      setForm(f => ({ ...f, specialties: [...f.specialties, val] }))
      setSpecialtyInput('')
    }
  }

  const removeSpecialty = (s: string) => {
    setForm(f => ({ ...f, specialties: f.specialties.filter(x => x !== s) }))
  }

  const formFields = (
    <div className="space-y-4">
      <Input label="Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Site name" />
      <Input label="Address" required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street address" />
      <div className="grid grid-cols-3 gap-3">
        <Input label="City" required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" />
        <Input label="State" required value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase().slice(0, 2) }))} placeholder="FL" />
        <Input label="ZIP" required value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} placeholder="33101" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Phone" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 555-5555" />
        <Input label="EHR System" value={form.ehr_system} onChange={e => setForm(f => ({ ...f, ehr_system: e.target.value }))} placeholder="Epic, Cerner..." />
      </div>
      <Input label="Website" type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-stone-700">Description</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={3}
          placeholder="Describe this clinical site..."
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-stone-700">Specialties</label>
        <div className="flex gap-2">
          <input
            value={specialtyInput}
            onChange={e => setSpecialtyInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSpecialty() } }}
            placeholder="Type and press Enter"
            className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          />
          <Button type="button" variant="outline" size="sm" onClick={addSpecialty}>Add</Button>
        </div>
        {form.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.specialties.map(s => (
              <Badge key={s} variant="primary" size="sm">
                {s}
                <button type="button" onClick={() => removeSpecialty(s)} className="ml-1 hover:text-red-300">&times;</button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Sites Directory</h1>
          <p className="text-stone-500 mt-1">Browse {total > 0 ? `${total} ` : ''}clinical rotation sites</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Site
          </Button>
        )}
      </div>

      {/* Filters + View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search sites by name, city..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          />
        </div>
        {specialties.length > 0 && (
          <select value={specialty} onChange={e => { setSpecialty(e.target.value); setPage(1) }} className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none">
            <option value="">All Specialties</option>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <select value={state} onChange={e => { setState(e.target.value); setPage(1) }} className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none">
          <option value="">All States</option>
          <option value="FL">Florida</option>
          <option value="GA">Georgia</option>
          <option value="TX">Texas</option>
          <option value="NY">New York</option>
          <option value="CA">California</option>
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

      {/* Sites Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sites.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-stone-900 mb-1">No sites found</h3>
            <p className="text-stone-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {sites.map(site => (
            <Card key={site.id} hover>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-stone-900 truncate">{site.name}</h3>
                      {site.is_verified && <Badge variant="success" size="sm">Verified</Badge>}
                    </div>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {site.city}, {site.state}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-stone-600 line-clamp-2">{site.description}</p>
                <div className="flex flex-wrap gap-1">
                  {site.specialties.slice(0, 3).map(s => (
                    <Badge key={s} variant="default" size="sm">{s}</Badge>
                  ))}
                  {site.specialties.length > 3 && (
                    <Badge variant="default" size="sm">+{site.specialties.length - 3}</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {site.rating}</span>
                    <span>{site.review_count} reviews</span>
                    {site.ehr_system && <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3" /> {site.ehr_system}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    {canEditSite(site) && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(site)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(site)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setViewSite(site)}>Details</Button>
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
                <th className="text-left px-4 py-3 font-medium text-stone-600">Specialties</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Rating</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">EHR</th>
                <th className="text-right px-4 py-3 font-medium text-stone-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map(site => (
                <tr key={site.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-900">{site.name}</span>
                      {site.is_verified && <Badge variant="success" size="sm">Verified</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{site.city}, {site.state}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {site.specialties.slice(0, 2).map(s => (
                        <Badge key={s} variant="default" size="sm">{s}</Badge>
                      ))}
                      {site.specialties.length > 2 && <Badge variant="default" size="sm">+{site.specialties.length - 2}</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-stone-600">
                      <Star className="w-3.5 h-3.5 text-amber-400" /> {site.rating}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{site.ehr_system || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canEditSite(site) && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(site)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(site)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setViewSite(site)}>Details</Button>
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

      {/* Site Detail Modal */}
      {viewSite && (
        <Modal isOpen onClose={() => setViewSite(null)} title={viewSite.name} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-500 mb-1">Address</p>
                <p className="text-sm font-semibold text-stone-900">{viewSite.address}, {viewSite.city}, {viewSite.state} {viewSite.zip}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Phone</p>
                <p className="text-sm font-semibold text-stone-900 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {viewSite.phone}</p>
              </div>
              {viewSite.website && (
                <div>
                  <p className="text-xs text-stone-500 mb-1">Website</p>
                  <a href={viewSite.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary-600 flex items-center gap-1 hover:underline">
                    <Globe className="w-3.5 h-3.5" /> {viewSite.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {viewSite.ehr_system && (
                <div>
                  <p className="text-xs text-stone-500 mb-1">EHR System</p>
                  <p className="text-sm font-semibold text-stone-900">{viewSite.ehr_system}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-stone-500 mb-1">Rating</p>
                <p className="text-sm font-semibold text-stone-900 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {viewSite.rating} ({viewSite.review_count} reviews)</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Status</p>
                <Badge variant={viewSite.is_verified ? 'success' : 'warning'}>{viewSite.is_verified ? 'Verified' : 'Pending Verification'}</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">Description</p>
              <p className="text-sm text-stone-700">{viewSite.description}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-2">Specialties</p>
              <div className="flex flex-wrap gap-1.5">
                {viewSite.specialties.map(s => <Badge key={s} variant="primary" size="sm">{s}</Badge>)}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {canEditSite(viewSite) && (
                <>
                  <Button variant="outline" onClick={() => { setViewSite(null); openEdit(viewSite) }}>
                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                  </Button>
                  <Button variant="outline" onClick={() => { setViewSite(null); setDeleteTarget(viewSite) }} className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setViewSite(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Site Modal */}
      {showCreateModal && (
        <Modal isOpen onClose={() => setShowCreateModal(false)} title="Add Site" size="lg">
          <form onSubmit={handleCreate} className="space-y-6">
            {formFields}
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button type="submit" isLoading={createMutation.isPending}>Create Site</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Site Modal */}
      {editSite && (
        <Modal isOpen onClose={() => setEditSite(null)} title="Edit Site" size="lg">
          <form onSubmit={handleUpdate} className="space-y-6">
            {formFields}
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setEditSite(null)}>Cancel</Button>
              <Button type="submit" isLoading={updateMutation.isPending}>Save Changes</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal isOpen onClose={() => setDeleteTarget(null)} title="Delete Site" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button onClick={handleDelete} isLoading={isDeleting} className="bg-red-600 hover:bg-red-700">
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
