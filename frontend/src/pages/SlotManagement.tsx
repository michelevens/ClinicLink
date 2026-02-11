import { useState } from 'react'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { useSlots, useCreateSlot, useUpdateSlot, useDeleteSlot, useMySites, usePreceptors } from '../hooks/useApi.ts'
import type { ApiSlot } from '../services/api.ts'
import { toast } from 'sonner'
import {
  Plus, Pencil, Trash2, Calendar, Users,
  Clock, Building2, Loader2, Search, DollarSign, User
} from 'lucide-react'

const SPECIALTIES = [
  'Emergency Medicine', 'Family Practice', 'Internal Medicine', 'Pediatrics',
  'OB/GYN', 'Surgery', 'Orthopedics', 'Cardiology', 'Neurology', 'Psychiatry',
  'ICU/Critical Care', 'Geriatrics', 'Physical Therapy', 'Social Work',
  'Urgent Care', 'Rehabilitation',
]

const EMPTY_FORM = {
  site_id: '',
  title: '',
  specialty: '',
  description: '',
  start_date: '',
  end_date: '',
  capacity: '2',
  cost: '0',
  cost_type: 'free' as 'free' | 'paid',
  shift_schedule: '',
  requirements: '',
  preceptor_id: '',
}

export function SlotManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingSlot, setEditingSlot] = useState<ApiSlot | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { data: sitesData } = useMySites()
  const sites = sitesData?.sites || []
  const { data: preceptorsData } = usePreceptors()
  const preceptors = preceptorsData?.preceptors || []

  const { data, isLoading } = useSlots({
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })
  const createMutation = useCreateSlot()
  const updateMutation = useUpdateSlot()
  const deleteMutation = useDeleteSlot()

  // Filter to show only slots belonging to my sites
  const mySiteIds = new Set(sites.map(s => s.id))
  const allSlots = data?.data || []
  const slots = allSlots.filter(s => mySiteIds.has(s.site_id))

  const openCreateModal = () => {
    setEditingSlot(null)
    setForm({ ...EMPTY_FORM, site_id: sites[0]?.id || '' })
    setShowModal(true)
  }

  const openEditModal = (slot: ApiSlot) => {
    setEditingSlot(slot)
    setForm({
      site_id: slot.site_id,
      title: slot.title,
      specialty: slot.specialty,
      description: slot.description,
      start_date: slot.start_date,
      end_date: slot.end_date,
      capacity: String(slot.capacity),
      cost: String(slot.cost),
      cost_type: slot.cost_type,
      shift_schedule: slot.shift_schedule || '',
      requirements: slot.requirements.join(', '),
      preceptor_id: slot.preceptor_id || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.site_id || !form.title || !form.specialty || !form.start_date || !form.end_date) {
      toast.error('Please fill in all required fields')
      return
    }
    const payload = {
      site_id: form.site_id,
      title: form.title,
      specialty: form.specialty,
      description: form.description,
      start_date: form.start_date,
      end_date: form.end_date,
      capacity: parseInt(form.capacity),
      cost: parseFloat(form.cost),
      cost_type: form.cost_type,
      shift_schedule: form.shift_schedule || null,
      requirements: form.requirements ? form.requirements.split(',').map(r => r.trim()).filter(Boolean) : [],
      preceptor_id: form.preceptor_id || null,
      status: 'open' as const,
    }

    try {
      if (editingSlot) {
        await updateMutation.mutateAsync({ id: editingSlot.id, data: payload })
        toast.success('Rotation slot updated')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Rotation slot created')
      }
      setShowModal(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save'
      toast.error(message)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Rotation slot deleted')
      setConfirmDelete(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete'
      toast.error(message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Rotation Slots</h1>
          <p className="text-stone-500">Create and manage rotation opportunities</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4" /> Create Slot
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search slots..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-stone-300 px-3 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="filled">Filled</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <p className="text-sm text-stone-500 mt-3">{slots.length} slot{slots.length !== 1 ? 's' : ''}</p>
      </Card>

      {/* Slots List */}
      <div className="space-y-4">
        {slots.length === 0 && (
          <Card className="text-center py-12">
            <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-700 mb-2">No rotation slots yet</h3>
            <p className="text-stone-500 mb-4">Create your first rotation slot to start receiving applications</p>
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4" /> Create Slot
            </Button>
          </Card>
        )}

        {slots.map(slot => (
          <Card key={slot.id}>
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">{slot.title}</h3>
                    <p className="text-sm text-stone-500">{slot.site?.name}</p>
                  </div>
                </div>
                {slot.description && (
                  <p className="text-sm text-stone-600 mb-3">{slot.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="primary">{slot.specialty}</Badge>
                  <Badge variant={slot.status === 'open' ? 'success' : slot.status === 'filled' ? 'warning' : 'danger'}>
                    {slot.status}
                  </Badge>
                  <Badge variant={slot.cost_type === 'free' ? 'success' : 'warning'}>
                    {slot.cost_type === 'free' ? 'Free' : `$${slot.cost}`}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-stone-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(slot.start_date).toLocaleDateString()} - {new Date(slot.end_date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{slot.filled}/{slot.capacity} filled</span>
                  {slot.shift_schedule && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{slot.shift_schedule}</span>}
                  {slot.preceptor && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{slot.preceptor.first_name} {slot.preceptor.last_name}</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => openEditModal(slot)}>
                  <Pencil className="w-4 h-4" /> Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => setConfirmDelete(slot.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSlot ? 'Edit Rotation Slot' : 'Create Rotation Slot'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700">Site *</label>
            <select
              value={form.site_id}
              onChange={e => setForm({ ...form, site_id: e.target.value })}
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            >
              <option value="">Select a site...</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Title *"
            placeholder="e.g. Emergency Medicine Rotation - Spring 2025"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700">Specialty *</label>
            <select
              value={form.specialty}
              onChange={e => setForm({ ...form, specialty: e.target.value })}
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            >
              <option value="">Select specialty...</option>
              {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Describe the rotation experience, learning objectives, etc."
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date *"
              type="date"
              value={form.start_date}
              onChange={e => setForm({ ...form, start_date: e.target.value })}
            />
            <Input
              label="End Date *"
              type="date"
              value={form.end_date}
              onChange={e => setForm({ ...form, end_date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input
              label="Capacity"
              type="number"
              min="1"
              max="50"
              value={form.capacity}
              onChange={e => setForm({ ...form, capacity: e.target.value })}
              icon={<Users className="w-4 h-4" />}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Cost Type</label>
              <select
                value={form.cost_type}
                onChange={e => setForm({ ...form, cost_type: e.target.value as 'free' | 'paid' })}
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            {form.cost_type === 'paid' && (
              <Input
                label="Cost ($)"
                type="number"
                min="0"
                step="50"
                value={form.cost}
                onChange={e => setForm({ ...form, cost: e.target.value })}
                icon={<DollarSign className="w-4 h-4" />}
              />
            )}
          </div>

          <Input
            label="Shift Schedule"
            placeholder="e.g. Mon-Fri 7am-3pm"
            value={form.shift_schedule}
            onChange={e => setForm({ ...form, shift_schedule: e.target.value })}
            icon={<Clock className="w-4 h-4" />}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700">Preceptor</label>
            <select
              value={form.preceptor_id}
              onChange={e => setForm({ ...form, preceptor_id: e.target.value })}
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            >
              <option value="">No preceptor assigned</option>
              {preceptors.map(p => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.email})</option>
              ))}
            </select>
          </div>

          <Input
            label="Requirements (comma separated)"
            placeholder="e.g. BLS, Background Check, Immunizations"
            value={form.requirements}
            onChange={e => setForm({ ...form, requirements: e.target.value })}
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingSlot ? 'Update Slot' : 'Create Slot'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Rotation Slot"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-stone-600">Are you sure you want to delete this rotation slot? This action cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              isLoading={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
