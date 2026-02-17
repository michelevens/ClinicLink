import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Building2, MapPin, Phone, Globe, Star, Shield, Users,
  Calendar, Clock, Stethoscope, FileText, Handshake, CheckCircle2, Loader2, Pencil, Plus
} from 'lucide-react'
import { toast } from 'sonner'
import { useSite, useAssignManagerToSite, useAdminUsers } from '../hooks/useApi.ts'
import { useAuth } from '../contexts/AuthContext.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { usePageTitle } from '../hooks/usePageTitle.ts'

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  open: 'success', filled: 'warning', closed: 'default',
  active: 'success', draft: 'default', pending_review: 'warning', expired: 'danger', terminated: 'danger',
  accepted: 'success', pending: 'warning', declined: 'danger', completed: 'success', withdrawn: 'default',
}

export function SiteDetail() {
  usePageTitle('Site Details')
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { data: site, isLoading } = useSite(id!)
  const [showManagerModal, setShowManagerModal] = useState(false)
  const isAdmin = currentUser?.role === 'admin'

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!site) {
    return (
      <div className="text-center py-24">
        <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-stone-900">Site not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/sites')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sites
        </Button>
      </div>
    )
  }

  const slots = site.slots || []
  const agreements = site.affiliation_agreements || []
  const templates = site.onboarding_templates || []
  const invites = site.invites || []

  // Aggregate students from all slot applications
  const allStudents: { id: string; first_name: string; last_name: string; email: string; status: string; slot_title: string; specialty: string }[] = []
  for (const slot of slots) {
    for (const app of (slot.applications || [])) {
      if (app.student) {
        allStudents.push({
          id: app.student.id,
          first_name: app.student.first_name,
          last_name: app.student.last_name,
          email: app.student.email,
          status: app.status,
          slot_title: slot.title,
          specialty: slot.specialty,
        })
      }
    }
  }

  // Unique preceptors
  const preceptorMap = new Map<string, { id: string; first_name: string; last_name: string; email: string; slots: string[] }>()
  for (const slot of slots) {
    if (slot.preceptor) {
      const existing = preceptorMap.get(slot.preceptor.id)
      if (existing) {
        existing.slots.push(slot.title)
      } else {
        preceptorMap.set(slot.preceptor.id, {
          id: slot.preceptor.id,
          first_name: slot.preceptor.first_name,
          last_name: slot.preceptor.last_name,
          email: slot.preceptor.email,
          slots: [slot.title],
        })
      }
    }
  }
  const preceptors = Array.from(preceptorMap.values())

  return (
    <div className="space-y-6">
      {/* Breadcrumbs + Header */}
      <div>
        <Breadcrumbs items={[
          { label: 'Sites Directory', path: '/sites' },
          { label: site.name },
        ]} />

        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-stone-900">{site.name}</h1>
                {site.is_verified && <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>}
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-stone-600">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-stone-400" /> {site.address}, {site.city}, {site.state} {site.zip}</span>
                {site.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-stone-400" /> {site.phone}</span>}
                {site.website && (
                  <a href={site.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-600 hover:underline">
                    <Globe className="w-4 h-4" /> Website
                  </a>
                )}
              </div>
              {site.description && <p className="mt-3 text-sm text-stone-600 max-w-2xl">{site.description}</p>}
            </div>
            <div className="text-right shrink-0">
              {site.rating > 0 && (
                <div className="flex items-center gap-1 text-amber-600">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-xl font-bold">{site.rating}</span>
                  <span className="text-sm text-stone-400">({site.review_count})</span>
                </div>
              )}
              {site.ehr_system && <p className="text-xs text-stone-500 mt-1">EHR: {site.ehr_system}</p>}
            </div>
          </div>

          {/* Specialties */}
          {site.specialties?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {site.specialties.map(s => <Badge key={s} variant="default">{s}</Badge>)}
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { icon: <Stethoscope className="w-5 h-5" />, label: 'Rotation Slots', value: slots.length, color: 'bg-primary-50 text-primary-600' },
          { icon: <Users className="w-5 h-5" />, label: 'Preceptors', value: preceptors.length, color: 'bg-secondary-50 text-secondary-600' },
          { icon: <Users className="w-5 h-5" />, label: 'Students', value: allStudents.length, color: 'bg-green-50 text-green-600' },
          { icon: <Handshake className="w-5 h-5" />, label: 'Agreements', value: agreements.length, color: 'bg-amber-50 text-amber-600' },
          { icon: <FileText className="w-5 h-5" />, label: 'Templates', value: templates.length, color: 'bg-stone-100 text-stone-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>{s.icon}</div>
            <p className="text-xl font-bold text-stone-900">{s.value}</p>
            <p className="text-xs text-stone-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Manager */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-500" /> Site Manager
          </h2>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => setShowManagerModal(true)}>
              {site.manager ? <><Pencil className="w-3.5 h-3.5 mr-1" /> Change</> : <><Plus className="w-3.5 h-3.5 mr-1" /> Assign</>}
            </Button>
          )}
        </div>
        {site.manager ? (
          <Link to={`/users/${site.manager.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
              {site.manager.first_name?.[0]}{site.manager.last_name?.[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-stone-900">{site.manager.first_name} {site.manager.last_name}</p>
              <p className="text-xs text-stone-500">{site.manager.email}</p>
            </div>
          </Link>
        ) : (
          <p className="text-sm text-stone-400 text-center py-4">No manager assigned to this site.</p>
        )}
      </Card>

      {showManagerModal && (
        <AssignManagerModal siteId={id!} currentManagerId={site.manager?.id} onClose={() => setShowManagerModal(false)} />
      )}

      {/* Rotation Slots */}
      <Card>
        <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-primary-500" /> Rotation Slots ({slots.length})
        </h2>
        {slots.length === 0 ? (
          <p className="text-sm text-stone-400 py-4 text-center">No rotation slots yet</p>
        ) : (
          <div className="space-y-2">
            {slots.map(slot => (
              <div key={slot.id} className="p-4 bg-stone-50 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{slot.title}</p>
                    <p className="text-xs text-stone-500">{slot.specialty} - {slot.shift_schedule || ''}</p>
                    {slot.preceptor && (
                      <p className="text-xs text-stone-500 mt-1">
                        Preceptor: {slot.preceptor.first_name} {slot.preceptor.last_name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant={STATUS_COLORS[slot.status] || 'default'} size="sm">
                      {slot.status} ({slot.filled}/{slot.capacity})
                    </Badge>
                    <div className="text-xs text-stone-400 mt-1">
                      <Calendar className="w-3 h-3 inline mr-0.5" />
                      {new Date(slot.start_date).toLocaleDateString()} - {new Date(slot.end_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Preceptors */}
      {preceptors.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-500" /> Preceptors ({preceptors.length})
          </h2>
          <div className="space-y-2">
            {preceptors.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700 font-semibold text-sm">
                    {p.first_name[0]}{p.last_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{p.first_name} {p.last_name}</p>
                    <p className="text-xs text-stone-500">{p.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                  {p.slots.map(s => <Badge key={s} variant="default" size="sm">{s}</Badge>)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Students */}
      {allStudents.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-500" /> Students ({allStudents.length})
          </h2>
          <div className="space-y-2">
            {allStudents.map((s, i) => (
              <div key={`${s.id}-${i}`} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
                    {s.first_name[0]}{s.last_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{s.first_name} {s.last_name}</p>
                    <p className="text-xs text-stone-500">{s.slot_title} - {s.specialty}</p>
                  </div>
                </div>
                <Badge variant={STATUS_COLORS[s.status] || 'default'} size="sm">{s.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Affiliation Agreements */}
      {agreements.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Handshake className="w-4 h-4 text-primary-500" /> Affiliation Agreements ({agreements.length})
          </h2>
          <div className="space-y-2">
            {agreements.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{a.university?.name || 'Unknown University'}</p>
                  <p className="text-xs text-stone-500">
                    {a.start_date ? new Date(a.start_date).toLocaleDateString() : '?'} - {a.end_date ? new Date(a.end_date).toLocaleDateString() : '?'}
                  </p>
                </div>
                <Badge variant={STATUS_COLORS[a.status] || 'default'} size="sm">{a.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Onboarding Templates */}
      {templates.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-500" /> Onboarding Templates ({templates.length})
          </h2>
          <div className="space-y-2">
            {templates.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{t.name}</p>
                  {t.description && <p className="text-xs text-stone-500">{t.description}</p>}
                </div>
                <Badge variant={t.is_active ? 'success' : 'default'} size="sm">{t.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── Assign Manager Modal ────────────────────────────────────────
function AssignManagerModal({ siteId, currentManagerId, onClose }: { siteId: string; currentManagerId?: string; onClose: () => void }) {
  const [search, setSearch] = useState('')
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null)
  const { data: usersData, isLoading: loading } = useAdminUsers({ role: 'site_manager' })
  const assignMut = useAssignManagerToSite()

  const managers: { id: string; first_name: string; last_name: string; email: string }[] = (usersData as any)?.data || []

  const filteredManagers = managers.filter(m => {
    if (m.id === currentManagerId) return false
    if (!search) return true
    const q = search.toLowerCase()
    return `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
  })

  const handleSubmit = async () => {
    if (!selectedManagerId) return
    try {
      const res = await assignMut.mutateAsync({ siteId, managerId: selectedManagerId })
      toast.success(res.message)
      onClose()
    } catch (e: any) {
      toast.error(e.message || 'Failed to assign manager.')
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={currentManagerId ? 'Change Site Manager' : 'Assign Site Manager'} size="md">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search site managers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-stone-400" /></div>
        ) : filteredManagers.length > 0 ? (
          <div className="max-h-64 overflow-y-auto border border-stone-200 rounded-xl divide-y divide-stone-100">
            {filteredManagers.map(m => (
              <label key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 cursor-pointer">
                <input
                  type="radio"
                  name="manager"
                  checked={selectedManagerId === m.id}
                  onChange={() => setSelectedManagerId(m.id)}
                  className="border-stone-300 text-primary-500 focus:ring-primary-500"
                />
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs shrink-0">
                  {m.first_name[0]}{m.last_name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-900">{m.first_name} {m.last_name}</p>
                  <p className="text-xs text-stone-500">{m.email}</p>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-400 text-center py-4">No site managers available.</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={assignMut.isPending} disabled={!selectedManagerId}>
            <Shield className="w-4 h-4 mr-2" /> Assign Manager
          </Button>
        </div>
      </div>
    </Modal>
  )
}
