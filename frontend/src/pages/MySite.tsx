import { useState } from 'react'
import { Building2, MapPin, Phone, Globe, Star, Users, CalendarDays, Plus, Pencil, Stethoscope, Clock, XCircle, CheckCircle } from 'lucide-react'
import { useMySites, useCreateSite, useUpdateSite, useMyJoinRequests, useWithdrawJoinRequest } from '../hooks/useApi.ts'
import { useAuth } from '../contexts/AuthContext.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { toast } from 'sonner'
import type { ApiSite } from '../services/api.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'

export function MySite() {
  usePageTitle('My Sites')
  const { user } = useAuth()
  const isPreceptor = user?.role === 'preceptor'
  const { data, isLoading } = useMySites()
  const sites = data?.sites || []
  const createSite = useCreateSite()
  const updateSite = useUpdateSite()
  const { data: joinRequestsData } = useMyJoinRequests()
  const withdrawJoinRequest = useWithdrawJoinRequest()
  const myJoinRequests = joinRequestsData?.join_requests || []

  const [showForm, setShowForm] = useState(false)
  const [editSite, setEditSite] = useState<ApiSite | null>(null)
  const [form, setForm] = useState({
    name: '', address: '', city: '', state: 'FL', zip: '', phone: '',
    website: '', description: '', specialties: '' as string, ehr_system: '',
  })

  const openCreate = () => {
    setEditSite(null)
    setForm({ name: '', address: '', city: '', state: 'FL', zip: '', phone: '', website: '', description: '', specialties: '', ehr_system: '' })
    setShowForm(true)
  }

  const openEdit = (site: ApiSite) => {
    setEditSite(site)
    setForm({
      name: site.name, address: site.address, city: site.city, state: site.state, zip: site.zip,
      phone: site.phone, website: site.website || '', description: site.description,
      specialties: site.specialties.join(', '), ehr_system: site.ehr_system || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    // Auto-prepend https:// to website if user entered a bare domain
    let website = form.website.trim()
    if (website && !/^https?:\/\//i.test(website)) {
      website = 'https://' + website
    }

    const payload = {
      ...form,
      website: website || null,
      specialties: form.specialties.split(',').map(s => s.trim()).filter(Boolean),
    }
    try {
      if (editSite) {
        await updateSite.mutateAsync({ id: editSite.id, data: payload })
        toast.success('Site updated successfully')
      } else {
        await createSite.mutateAsync(payload)
        toast.success('Site created successfully')
      }
      setShowForm(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      if (error?.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0]?.[0]
        toast.error(firstError || 'Validation failed. Please check your inputs.')
      } else {
        toast.error(error?.response?.data?.message || 'Failed to save site. Please try again.')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">My Sites</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">Manage your rotation sites and their details</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Site
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sites.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">No sites yet</h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm mb-4">Create your first rotation site to start accepting students.</p>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" /> Add Site
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sites.map(site => (
            <Card key={site.id} hover>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{site.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500 mt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {site.city}, {site.state} {site.zip}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {site.phone}</span>
                        {site.website && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {site.website}</span>}
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {site.rating} ({site.review_count} reviews)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={site.is_verified ? 'success' : 'warning'} size="sm">
                        {site.is_verified ? 'Verified' : 'Pending'}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(site)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2 mb-3">{site.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {site.specialties.map(s => (
                      <Badge key={s} variant="default" size="sm">{s}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-4 text-sm text-stone-500">
                    {site.ehr_system && (
                      <span className="flex items-center gap-1"><Stethoscope className="w-3.5 h-3.5" /> {site.ehr_system}</span>
                    )}
                    <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {site.slots?.length || 0} slots</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {site.slots?.reduce((s, sl) => s + sl.filled, 0) || 0} students</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Preceptor: My Join Requests */}
      {isPreceptor && myJoinRequests.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">My Join Requests</h2>
          {myJoinRequests.map(req => (
            <Card key={req.id} className="!py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    req.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                    req.status === 'approved' ? 'bg-green-100 text-green-600' :
                    req.status === 'denied' ? 'bg-red-100 text-red-600' :
                    'bg-stone-100 text-stone-500'
                  }`}>
                    {req.status === 'pending' ? <Clock className="w-5 h-5" /> :
                     req.status === 'approved' ? <CheckCircle className="w-5 h-5" /> :
                     <XCircle className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{req.site?.name}</p>
                    <p className="text-xs text-stone-500">
                      {req.site?.city}, {req.site?.state}
                      <span className="mx-1">&middot;</span>
                      Submitted {new Date(req.created_at).toLocaleDateString()}
                    </p>
                    {req.review_notes && (
                      <p className="text-xs text-stone-600 mt-0.5 italic">Note: {req.review_notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={
                      req.status === 'pending' ? 'warning' :
                      req.status === 'approved' ? 'success' :
                      req.status === 'denied' ? 'danger' : 'default'
                    }
                  >
                    {req.status}
                  </Badge>
                  {req.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await withdrawJoinRequest.mutateAsync(req.id)
                          toast.success('Request withdrawn')
                        } catch { toast.error('Failed to withdraw') }
                      }}
                      isLoading={withdrawJoinRequest.isPending}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editSite ? 'Edit Site' : 'Add New Site'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Site Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 dark:text-stone-100 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" placeholder="e.g. Mercy General Hospital" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Address *</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 dark:text-stone-100 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">City *</label>
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 dark:text-stone-100 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">State *</label>
                <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value.toUpperCase().slice(0, 2) })} maxLength={2} className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 dark:text-stone-100 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" placeholder="FL" />
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">ZIP *</label>
                <input value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 dark:text-stone-100 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" placeholder="33101" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Phone *</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 dark:text-stone-100 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" placeholder="(305) 555-0100" />
              </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Website</label>
              <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 dark:text-stone-100 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" placeholder="example.com" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">EHR System</label>
              <input value={form.ehr_system} onChange={e => setForm({ ...form, ehr_system: e.target.value })} className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 dark:text-stone-100 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" placeholder="e.g. Epic, Cerner" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Specialties (comma-separated)</label>
              <input value={form.specialties} onChange={e => setForm({ ...form, specialties: e.target.value })} className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 dark:text-stone-100 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" placeholder="e.g. Emergency Medicine, ICU" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 dark:text-stone-100 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none" placeholder="Describe your site, facilities, and what students can expect..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.name || !form.address || !form.city || !form.state || !form.zip || !form.phone} isLoading={createSite.isPending || updateSite.isPending}>
              {editSite ? 'Save Changes' : 'Create Site'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
