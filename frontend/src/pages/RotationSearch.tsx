import { useState, useMemo } from 'react'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { MOCK_SLOTS } from '../data/mockData.ts'
import { toast } from 'sonner'
import {
  Search, MapPin, Calendar, DollarSign, Star,
  Building2, Clock, Users, Filter, ChevronDown, Send
} from 'lucide-react'

export function RotationSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [costFilter, setCostFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'filled'>('all')
  const [selectedSlot, setSelectedSlot] = useState<typeof MOCK_SLOTS[0] | null>(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')

  const specialties = useMemo(() => {
    const set = new Set(MOCK_SLOTS.map(s => s.specialty))
    return Array.from(set).sort()
  }, [])

  const filtered = useMemo(() => {
    return MOCK_SLOTS.filter(slot => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const match = slot.title.toLowerCase().includes(q) ||
          slot.specialty.toLowerCase().includes(q) ||
          slot.site?.name.toLowerCase().includes(q) ||
          slot.site?.city.toLowerCase().includes(q)
        if (!match) return false
      }
      if (selectedSpecialty && slot.specialty !== selectedSpecialty) return false
      if (costFilter === 'free' && slot.costType !== 'free') return false
      if (costFilter === 'paid' && slot.costType !== 'paid') return false
      if (statusFilter === 'open' && slot.status !== 'open') return false
      if (statusFilter === 'filled' && slot.status !== 'filled') return false
      return true
    })
  }, [searchQuery, selectedSpecialty, costFilter, statusFilter])

  const handleApply = () => {
    toast.success('Application submitted successfully! You\'ll hear back within 5-7 business days.')
    setShowApplyModal(false)
    setCoverLetter('')
    setSelectedSlot(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Search Rotations</h1>
        <p className="text-stone-500">Find your perfect clinical placement</p>
      </div>

      {/* Search & Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by specialty, site name, or city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="grid grid-cols-2 sm:flex gap-3">
            <select
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              className="rounded-xl border border-stone-300 px-3 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none col-span-2 sm:col-span-1"
            >
              <option value="">All Specialties</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={costFilter}
              onChange={e => setCostFilter(e.target.value as 'all' | 'free' | 'paid')}
              className="rounded-xl border border-stone-300 px-3 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            >
              <option value="all">Any Cost</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'all' | 'open' | 'filled')}
              className="rounded-xl border border-stone-300 px-3 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            >
              <option value="all">Any Status</option>
              <option value="open">Open</option>
              <option value="filled">Filled</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-stone-500 mt-3">{filtered.length} rotation{filtered.length !== 1 ? 's' : ''} found</p>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {filtered.map(slot => (
          <Card key={slot.id} hover onClick={() => setSelectedSlot(slot)}>
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
                <p className="text-sm text-stone-600 mb-3">{slot.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="primary">{slot.specialty}</Badge>
                  <Badge variant={slot.costType === 'free' ? 'success' : 'warning'}>
                    {slot.costType === 'free' ? 'Free' : `$${slot.cost}`}
                  </Badge>
                  <Badge variant={slot.status === 'open' ? 'success' : 'danger'}>
                    {slot.status === 'open' ? 'Open' : 'Filled'}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-stone-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{slot.site?.city}, {slot.site?.state}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(slot.startDate).toLocaleDateString()} - {new Date(slot.endDate).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{slot.filled}/{slot.capacity} spots filled</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{slot.shiftSchedule}</span>
                  {slot.site && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" />{slot.site.rating} ({slot.site.reviewCount} reviews)</span>}
                </div>
              </div>
              <div className="flex lg:flex-col gap-2 shrink-0">
                <Button
                  size="sm"
                  disabled={slot.status !== 'open'}
                  onClick={e => { e.stopPropagation(); setSelectedSlot(slot); setShowApplyModal(true) }}
                >
                  <Send className="w-4 h-4" /> Apply
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card className="text-center py-12">
            <Search className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-700 mb-2">No rotations found</h3>
            <p className="text-stone-500">Try adjusting your search filters</p>
          </Card>
        )}
      </div>

      {/* Apply Modal */}
      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Apply for Rotation" size="lg">
        {selectedSlot && (
          <div className="space-y-4">
            <div className="bg-primary-50 rounded-xl p-4">
              <h3 className="font-semibold text-primary-900">{selectedSlot.title}</h3>
              <p className="text-sm text-primary-700">{selectedSlot.site?.name} - {selectedSlot.site?.city}, {selectedSlot.site?.state}</p>
            </div>

            {selectedSlot.requirements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-stone-700 mb-2">Requirements</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSlot.requirements.map(req => (
                    <Badge key={req} variant="default">{req}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Cover Letter / Statement of Interest</label>
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={6}
                placeholder="Tell the site why you're interested in this rotation and what you hope to learn..."
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setShowApplyModal(false)}>Cancel</Button>
              <Button onClick={handleApply}>
                <Send className="w-4 h-4" /> Submit Application
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
