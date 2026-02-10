import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { useSlots, useCreateApplication } from '../hooks/useApi.ts'
import { useAuth } from '../contexts/AuthContext.tsx'
import { toast } from 'sonner'
import type { ApiSlot } from '../services/api.ts'
import {
  Search, MapPin, Calendar, Star,
  Building2, Clock, Users, Send, Loader2,
  Globe, Phone, Stethoscope, DollarSign,
  ChevronRight, Shield, BookOpen, CheckCircle2,
  ArrowLeft, ExternalLink, LogIn
} from 'lucide-react'

export function RotationSearch() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [costFilter, setCostFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedSlot, setSelectedSlot] = useState<ApiSlot | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  const { data, isLoading } = useSlots({
    search: searchQuery || undefined,
    specialty: selectedSpecialty || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    cost_type: costFilter !== 'all' ? costFilter : undefined,
  })
  const applyMutation = useCreateApplication()

  const slots = data?.data || []

  const specialties = useMemo(() => {
    const set = new Set(slots.map(s => s.specialty))
    return Array.from(set).sort()
  }, [slots])

  const handleApply = async () => {
    if (!selectedSlot) return
    try {
      await applyMutation.mutateAsync({ slot_id: selectedSlot.id, cover_letter: coverLetter || undefined })
      toast.success('Application submitted successfully! You\'ll hear back within 5-7 business days.')
      setShowApplyModal(false)
      setCoverLetter('')
      setSelectedSlot(null)
      setShowDetail(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit application'
      toast.error(message)
    }
  }

  const openDetail = (slot: ApiSlot) => {
    setSelectedSlot(slot)
    setShowDetail(true)
  }

  const openApply = (slot: ApiSlot, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login?redirect=/rotations')
      return
    }
    setSelectedSlot(slot)
    setShowApplyModal(true)
  }

  const getDaysUntilStart = (dateStr: string) => {
    const start = new Date(dateStr)
    const now = new Date()
    const diff = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getRotationDuration = (start: string, end: string) => {
    const s = new Date(start)
    const e = new Date(end)
    const weeks = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 7))
    return weeks
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
              onChange={e => setCostFilter(e.target.value)}
              className="rounded-xl border border-stone-300 px-3 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            >
              <option value="all">Any Cost</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-xl border border-stone-300 px-3 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            >
              <option value="all">Any Status</option>
              <option value="open">Open</option>
              <option value="filled">Filled</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm text-stone-500">
            {isLoading ? 'Searching...' : `${slots.length} rotation${slots.length !== 1 ? 's' : ''} found`}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
          </div>
        </div>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      )}

      {/* Results - List View */}
      {!isLoading && viewMode === 'list' && (
        <div className="space-y-4">
          {slots.map(slot => {
            const daysUntil = getDaysUntilStart(slot.start_date)
            const weeks = getRotationDuration(slot.start_date, slot.end_date)
            return (
              <Card key={slot.id} hover onClick={() => openDetail(slot)}>
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-stone-900">{slot.title}</h3>
                          <ChevronRight className="w-4 h-4 text-stone-400 hidden sm:block" />
                        </div>
                        <p className="text-sm text-stone-500">{slot.site?.name}</p>
                      </div>
                    </div>
                    <p className="text-sm text-stone-600 mb-3 line-clamp-2">{slot.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="primary">{slot.specialty}</Badge>
                      <Badge variant={slot.cost_type === 'free' ? 'success' : 'warning'}>
                        {slot.cost_type === 'free' ? 'Free' : `$${slot.cost}`}
                      </Badge>
                      <Badge variant={slot.status === 'open' ? 'success' : 'danger'}>
                        {slot.status === 'open' ? 'Open' : 'Filled'}
                      </Badge>
                      <Badge variant="default">{weeks} weeks</Badge>
                      {daysUntil > 0 && daysUntil <= 30 && (
                        <Badge variant="warning">Starts in {daysUntil} days</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-stone-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{slot.site?.city}, {slot.site?.state}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(slot.start_date).toLocaleDateString()} - {new Date(slot.end_date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{slot.filled}/{slot.capacity} spots filled</span>
                      {slot.shift_schedule && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{slot.shift_schedule}</span>}
                      {slot.site && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" />{slot.site.rating} ({slot.site.review_count} reviews)</span>}
                    </div>
                  </div>
                  <div className="flex lg:flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      disabled={slot.status !== 'open'}
                      onClick={e => openApply(slot, e)}
                    >
                      {isAuthenticated ? <><Send className="w-4 h-4" /> Apply</> : <><LogIn className="w-4 h-4" /> Sign In to Apply</>}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={e => { e.stopPropagation(); openDetail(slot) }}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Results - Grid View */}
      {!isLoading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {slots.map(slot => {
            const weeks = getRotationDuration(slot.start_date, slot.end_date)
            const spotsLeft = slot.capacity - slot.filled
            return (
              <Card key={slot.id} hover onClick={() => openDetail(slot)} padding="none">
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <Badge variant={slot.status === 'open' ? 'success' : 'danger'} size="sm">
                      {slot.status === 'open' ? `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left` : 'Filled'}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-stone-900 mb-1 line-clamp-1">{slot.title}</h3>
                  <p className="text-sm text-stone-500 mb-2">{slot.site?.name}</p>
                  <p className="text-xs text-stone-500 line-clamp-2 mb-3">{slot.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <Badge variant="primary" size="sm">{slot.specialty}</Badge>
                    <Badge variant={slot.cost_type === 'free' ? 'success' : 'warning'} size="sm">
                      {slot.cost_type === 'free' ? 'Free' : `$${slot.cost}`}
                    </Badge>
                    <Badge variant="default" size="sm">{weeks}w</Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-500">
                    <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{slot.site?.city}, {slot.site?.state}</div>
                    <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{new Date(slot.start_date).toLocaleDateString()} - {new Date(slot.end_date).toLocaleDateString()}</div>
                    {slot.site && (
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-amber-500" />
                        <span>{slot.site.rating}/5 ({slot.site.review_count} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-stone-100 px-5 py-3">
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={slot.status !== 'open'}
                    onClick={e => openApply(slot, e)}
                  >
                    {isAuthenticated ? <><Send className="w-4 h-4" /> Apply Now</> : <><LogIn className="w-4 h-4" /> Sign In to Apply</>}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {slots.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <Search className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-700 mb-2">No rotations found</h3>
          <p className="text-stone-500">Try adjusting your search filters</p>
        </Card>
      )}

      {/* Rotation Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setSelectedSlot(null) }} title="Rotation Details" size="xl">
        {selectedSlot && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-white shadow-sm text-primary-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-stone-900">{selectedSlot.title}</h2>
                  <p className="text-stone-600">{selectedSlot.site?.name}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="primary" size="md">{selectedSlot.specialty}</Badge>
                    <Badge variant={selectedSlot.status === 'open' ? 'success' : 'danger'} size="md">
                      {selectedSlot.status === 'open' ? 'Open for Applications' : 'Filled'}
                    </Badge>
                    <Badge variant={selectedSlot.cost_type === 'free' ? 'success' : 'warning'} size="md">
                      {selectedSlot.cost_type === 'free' ? 'No Cost' : `$${selectedSlot.cost}`}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-stone-50 rounded-xl p-3 text-center">
                <Calendar className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                <p className="text-xs text-stone-500">Duration</p>
                <p className="font-semibold text-stone-900 text-sm">{getRotationDuration(selectedSlot.start_date, selectedSlot.end_date)} weeks</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-3 text-center">
                <Users className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                <p className="text-xs text-stone-500">Capacity</p>
                <p className="font-semibold text-stone-900 text-sm">{selectedSlot.filled}/{selectedSlot.capacity} filled</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-3 text-center">
                <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-xs text-stone-500">Site Rating</p>
                <p className="font-semibold text-stone-900 text-sm">{selectedSlot.site?.rating || 'N/A'}/5</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-3 text-center">
                <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-xs text-stone-500">Cost</p>
                <p className="font-semibold text-stone-900 text-sm">{selectedSlot.cost_type === 'free' ? 'Free' : `$${selectedSlot.cost}`}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-500" /> Description
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">{selectedSlot.description}</p>
            </div>

            {/* Schedule Details */}
            <div>
              <h3 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" /> Schedule
              </h3>
              <div className="bg-stone-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Start Date</span>
                  <span className="font-medium text-stone-900">{new Date(selectedSlot.start_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">End Date</span>
                  <span className="font-medium text-stone-900">{new Date(selectedSlot.end_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {selectedSlot.shift_schedule && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Shift Schedule</span>
                    <span className="font-medium text-stone-900">{selectedSlot.shift_schedule}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Requirements */}
            {selectedSlot.requirements.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary-500" /> Requirements
                </h3>
                <div className="space-y-2">
                  {selectedSlot.requirements.map(req => (
                    <div key={req} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="text-stone-700">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Site Information */}
            {selectedSlot.site && (
              <div>
                <h3 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary-500" /> Site Information
                </h3>
                <div className="bg-stone-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-primary-600 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">{selectedSlot.site.name}</p>
                      {selectedSlot.site.is_verified && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="w-3 h-3" /> Verified Site
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedSlot.site.description && (
                    <p className="text-sm text-stone-600">{selectedSlot.site.description}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-stone-600">
                      <MapPin className="w-4 h-4 text-stone-400" />
                      {selectedSlot.site.address}, {selectedSlot.site.city}, {selectedSlot.site.state} {selectedSlot.site.zip}
                    </div>
                    {selectedSlot.site.phone && (
                      <div className="flex items-center gap-2 text-stone-600">
                        <Phone className="w-4 h-4 text-stone-400" />
                        {selectedSlot.site.phone}
                      </div>
                    )}
                    {selectedSlot.site.website && (
                      <div className="flex items-center gap-2 text-stone-600">
                        <Globe className="w-4 h-4 text-stone-400" />
                        <span className="text-primary-600 truncate">{selectedSlot.site.website}</span>
                      </div>
                    )}
                    {selectedSlot.site.ehr_system && (
                      <div className="flex items-center gap-2 text-stone-600">
                        <Stethoscope className="w-4 h-4 text-stone-400" />
                        EHR: {selectedSlot.site.ehr_system}
                      </div>
                    )}
                  </div>
                  {selectedSlot.site.specialties && selectedSlot.site.specialties.length > 0 && (
                    <div>
                      <p className="text-xs text-stone-500 mb-1.5">Site Specialties</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSlot.site.specialties.map(s => (
                          <Badge key={s} variant="default" size="sm">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-stone-900">{selectedSlot.site.rating}</span>
                      <span className="text-sm text-stone-500">({selectedSlot.site.review_count} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preceptor Info */}
            {selectedSlot.preceptor && (
              <div>
                <h3 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-primary-500" /> Your Preceptor
                </h3>
                <div className="flex items-center gap-3 bg-stone-50 rounded-xl p-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                    {selectedSlot.preceptor.first_name[0]}{selectedSlot.preceptor.last_name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-stone-900">{selectedSlot.preceptor.first_name} {selectedSlot.preceptor.last_name}</p>
                    <p className="text-sm text-stone-500">{selectedSlot.preceptor.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Spots Availability Bar */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-stone-500">Spots Available</span>
                <span className="font-medium text-stone-900">{selectedSlot.capacity - selectedSlot.filled} of {selectedSlot.capacity} remaining</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${selectedSlot.filled >= selectedSlot.capacity ? 'bg-red-500' : selectedSlot.filled >= selectedSlot.capacity * 0.8 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${(selectedSlot.filled / selectedSlot.capacity) * 100}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2 border-t border-stone-200">
              <Button variant="ghost" onClick={() => { setShowDetail(false); setSelectedSlot(null) }}>
                <ArrowLeft className="w-4 h-4" /> Back to Search
              </Button>
              <Button
                disabled={selectedSlot.status !== 'open'}
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login?redirect=/rotations')
                    return
                  }
                  setShowDetail(false)
                  setShowApplyModal(true)
                }}
              >
                {isAuthenticated ? <><Send className="w-4 h-4" /> Apply for This Rotation</> : <><LogIn className="w-4 h-4" /> Sign In to Apply</>}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Apply Modal */}
      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Apply for Rotation" size="lg">
        {selectedSlot && (
          <div className="space-y-4">
            <div className="bg-primary-50 rounded-xl p-4">
              <h3 className="font-semibold text-primary-900">{selectedSlot.title}</h3>
              <p className="text-sm text-primary-700">{selectedSlot.site?.name} - {selectedSlot.site?.city}, {selectedSlot.site?.state}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="primary" size="sm">{selectedSlot.specialty}</Badge>
                <Badge variant="default" size="sm">{getRotationDuration(selectedSlot.start_date, selectedSlot.end_date)} weeks</Badge>
                <Badge variant="default" size="sm">{new Date(selectedSlot.start_date).toLocaleDateString()} - {new Date(selectedSlot.end_date).toLocaleDateString()}</Badge>
              </div>
            </div>

            {selectedSlot.requirements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-stone-700 mb-2">Requirements (ensure you meet these before applying)</h4>
                <div className="space-y-1.5">
                  {selectedSlot.requirements.map(req => (
                    <div key={req} className="flex items-center gap-2 text-sm text-stone-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      {req}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Cover Letter / Statement of Interest *</label>
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={6}
                placeholder="Tell the site why you're interested in this rotation and what you hope to learn. Include relevant experience and clinical goals..."
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
              />
              <p className="text-xs text-stone-400">{coverLetter.length}/2000 characters</p>
            </div>

            <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-800">
              <p className="font-medium mb-1">Before you apply:</p>
              <ul className="text-xs space-y-0.5 text-amber-700">
                <li>- Ensure all your credentials are current in Settings</li>
                <li>- Review the site requirements above</li>
                <li>- You'll receive a response within 5-7 business days</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setShowApplyModal(false)}>Cancel</Button>
              <Button onClick={handleApply} isLoading={applyMutation.isPending}>
                <Send className="w-4 h-4" /> Submit Application
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
