import { useState } from 'react'
import { Card } from '../components/ui/Card.tsx'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { CardSkeleton } from '../components/ui/Skeleton.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { useApplications, useWithdrawApplication } from '../hooks/useApi.ts'
import { toast } from 'sonner'
import type { ApiApplication } from '../services/api.ts'
import {
  FileText, MapPin, Calendar, Building2, X,
  CheckCircle2, Clock, AlertCircle, XCircle, Send,
  ChevronRight, Star, Users, Stethoscope, ArrowRight,
  Eye, Shield, BookOpen
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle.ts'

type StatusFilter = 'all' | 'pending' | 'accepted' | 'declined' | 'waitlisted' | 'withdrawn'

export function Applications() {
  usePageTitle('My Applications')
  const navigate = useNavigate()
  const { data, isLoading } = useApplications()
  const withdrawMutation = useWithdrawApplication()
  const [selectedApp, setSelectedApp] = useState<ApiApplication | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all')

  const applications = data?.data || []
  const statusOrder: Record<string, number> = { pending: 0, waitlisted: 1, accepted: 2, declined: 3, withdrawn: 4 }
  const sorted = [...applications].sort((a, b) => (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5))
  const filtered = activeFilter === 'all' ? sorted : sorted.filter(a => a.status === activeFilter)

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    waitlisted: applications.filter(a => a.status === 'waitlisted').length,
    declined: applications.filter(a => a.status === 'declined').length,
    withdrawn: applications.filter(a => a.status === 'withdrawn').length,
  }

  const handleWithdraw = async (id: string) => {
    try {
      await withdrawMutation.mutateAsync(id)
      toast.success('Application withdrawn')
      setShowWithdrawConfirm(false)
      setShowDetail(false)
      setSelectedApp(null)
    } catch {
      toast.error('Failed to withdraw application')
    }
  }

  const openDetail = (app: ApiApplication) => {
    setSelectedApp(app)
    setShowDetail(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />
      case 'waitlisted': return <AlertCircle className="w-5 h-5 text-primary-500" />
      case 'declined': return <XCircle className="w-5 h-5 text-red-500" />
      case 'withdrawn': return <X className="w-5 h-5 text-stone-400" />
      default: return <Clock className="w-5 h-5 text-stone-400" />
    }
  }

  const getStatusVariant = (status: string): 'success' | 'warning' | 'primary' | 'danger' | 'default' => {
    switch (status) {
      case 'accepted': return 'success'
      case 'pending': return 'warning'
      case 'waitlisted': return 'primary'
      case 'declined': return 'danger'
      default: return 'default'
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'accepted': return 'Congratulations! Your application has been accepted.'
      case 'pending': return 'Your application is being reviewed by the site.'
      case 'waitlisted': return 'You have been placed on the waitlist. You will be notified if a spot opens.'
      case 'declined': return 'Unfortunately, this application was not accepted.'
      case 'withdrawn': return 'You withdrew this application.'
      default: return ''
    }
  }

  const getNextSteps = (status: string) => {
    switch (status) {
      case 'accepted': return [
        'Review the site requirements and complete any outstanding items',
        'Check your credentials are up to date in Settings',
        'Prepare for your rotation start date',
        'You can now log hours for this rotation under Hour Log',
      ]
      case 'pending': return [
        'Ensure your profile and credentials are complete',
        'The site typically responds within 5-7 business days',
        'You can withdraw your application if needed',
      ]
      case 'waitlisted': return [
        'You will be automatically notified if a spot opens',
        'Continue applying to other rotations as backup',
        'Keep your credentials up to date',
      ]
      case 'declined': return [
        'Don\'t be discouraged — explore other available rotations',
        'Review the site requirements to improve future applications',
        'Consider applying to similar rotations at other sites',
      ]
      default: return []
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><div className="h-7 w-48 bg-stone-200/60 rounded-lg animate-pulse" /><div className="h-4 w-72 bg-stone-200/60 rounded-lg animate-pulse mt-2" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Applications</h1>
          <p className="text-stone-500">{applications.length} application{applications.length !== 1 ? 's' : ''} submitted</p>
        </div>
        <Button onClick={() => navigate('/rotations')}>
          <Send className="w-4 h-4" /> Find Rotations
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pending', count: counts.pending, icon: <Clock className="w-5 h-5" />, color: 'amber' },
          { label: 'Accepted', count: counts.accepted, icon: <CheckCircle2 className="w-5 h-5" />, color: 'green' },
          { label: 'Waitlisted', count: counts.waitlisted, icon: <AlertCircle className="w-5 h-5" />, color: 'primary' },
          { label: 'Declined', count: counts.declined, icon: <XCircle className="w-5 h-5" />, color: 'red' },
        ].map(s => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center`}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{s.count}</p>
                <p className="text-xs text-stone-500">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'pending', 'accepted', 'waitlisted', 'declined', 'withdrawn'] as StatusFilter[]).map(status => (
          <button
            key={status}
            onClick={() => setActiveFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === status
                ? 'bg-primary-500 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {counts[status] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                activeFilter === status ? 'bg-white/20' : 'bg-stone-200'
              }`}>
                {counts[status]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card>
            <EmptyState
              illustration="folder"
              title={activeFilter === 'all' ? 'No applications yet' : `No ${activeFilter} applications`}
              description={activeFilter === 'all' ? 'Search for rotations and submit your first application.' : 'Try a different filter.'}
            />
          </Card>
        )}

        {filtered.map(app => (
          <Card key={app.id} hover onClick={() => openDetail(app)}>
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-stone-900">{app.slot?.title || 'Rotation'}</h3>
                    <ChevronRight className="w-4 h-4 text-stone-400 hidden sm:block" />
                  </div>
                  <p className="text-sm text-stone-500 mb-2">{app.slot?.site?.name}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-stone-500">
                    {app.slot?.site && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{app.slot.site.city}, {app.slot.site.state}</span>}
                    {app.slot && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(app.slot.start_date).toLocaleDateString()} - {new Date(app.slot.end_date).toLocaleDateString()}</span>}
                    <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />Applied {new Date(app.submitted_at).toLocaleDateString()}</span>
                    {app.slot?.specialty && <span className="flex items-center gap-1"><Stethoscope className="w-3.5 h-3.5" />{app.slot.specialty}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={getStatusVariant(app.status)} size="md">
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </Badge>
                <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); openDetail(app) }}>
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Application Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setSelectedApp(null) }} title="Application Details" size="xl">
        {selectedApp && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`rounded-xl p-4 ${
              selectedApp.status === 'accepted' ? 'bg-green-50 border border-green-200' :
              selectedApp.status === 'pending' ? 'bg-amber-50 border border-amber-200' :
              selectedApp.status === 'waitlisted' ? 'bg-primary-50 border border-primary-200' :
              selectedApp.status === 'declined' ? 'bg-red-50 border border-red-200' :
              'bg-stone-50 border border-stone-200'
            }`}>
              <div className="flex items-start gap-3">
                {getStatusIcon(selectedApp.status)}
                <div>
                  <p className={`font-semibold ${
                    selectedApp.status === 'accepted' ? 'text-green-900' :
                    selectedApp.status === 'pending' ? 'text-amber-900' :
                    selectedApp.status === 'waitlisted' ? 'text-primary-900' :
                    selectedApp.status === 'declined' ? 'text-red-900' : 'text-stone-900'
                  }`}>
                    {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                  </p>
                  <p className="text-sm text-stone-600 mt-0.5">{getStatusMessage(selectedApp.status)}</p>
                </div>
              </div>
            </div>

            {/* Application Timeline */}
            <div>
              <h3 className="text-sm font-semibold text-stone-900 mb-3">Application Timeline</h3>
              <div className="relative pl-6">
                <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-stone-200" />

                {/* Submitted */}
                <div className="relative pb-4">
                  <div className="absolute left-[-18px] w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                  <p className="text-sm font-medium text-stone-900">Application Submitted</p>
                  <p className="text-xs text-stone-500">{new Date(selectedApp.submitted_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {/* Under Review */}
                <div className="relative pb-4">
                  <div className={`absolute left-[-18px] w-4 h-4 rounded-full border-2 border-white ${
                    selectedApp.status !== 'pending' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'
                  }`} />
                  <p className="text-sm font-medium text-stone-900">Under Review</p>
                  <p className="text-xs text-stone-500">
                    {selectedApp.status === 'pending' ? 'Currently being reviewed by the site' : 'Review completed'}
                  </p>
                </div>

                {/* Decision */}
                {selectedApp.status !== 'pending' && (
                  <div className="relative">
                    <div className={`absolute left-[-18px] w-4 h-4 rounded-full border-2 border-white ${
                      selectedApp.status === 'accepted' ? 'bg-green-500' :
                      selectedApp.status === 'waitlisted' ? 'bg-primary-500' :
                      selectedApp.status === 'declined' ? 'bg-red-500' : 'bg-stone-400'
                    }`} />
                    <p className="text-sm font-medium text-stone-900">
                      {selectedApp.status === 'accepted' ? 'Accepted' :
                       selectedApp.status === 'waitlisted' ? 'Waitlisted' :
                       selectedApp.status === 'declined' ? 'Declined' : 'Withdrawn'}
                    </p>
                    <p className="text-xs text-stone-500">
                      {selectedApp.reviewed_at
                        ? new Date(selectedApp.reviewed_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                        : 'Date unavailable'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Rotation Details */}
            {selectedApp.slot && (
              <div>
                <h3 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-primary-500" /> Rotation Details
                </h3>
                <div className="bg-stone-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 text-primary-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">{selectedApp.slot.title}</p>
                      <p className="text-sm text-stone-500">{selectedApp.slot.site?.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-stone-600">
                      <Stethoscope className="w-4 h-4 text-stone-400" />
                      {selectedApp.slot.specialty}
                    </div>
                    {selectedApp.slot.site && (
                      <div className="flex items-center gap-2 text-stone-600">
                        <MapPin className="w-4 h-4 text-stone-400" />
                        {selectedApp.slot.site.city}, {selectedApp.slot.site.state}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-stone-600">
                      <Calendar className="w-4 h-4 text-stone-400" />
                      {new Date(selectedApp.slot.start_date).toLocaleDateString()} - {new Date(selectedApp.slot.end_date).toLocaleDateString()}
                    </div>
                    {selectedApp.slot.shift_schedule && (
                      <div className="flex items-center gap-2 text-stone-600">
                        <Clock className="w-4 h-4 text-stone-400" />
                        {selectedApp.slot.shift_schedule}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-stone-600">
                      <Users className="w-4 h-4 text-stone-400" />
                      {selectedApp.slot.filled}/{selectedApp.slot.capacity} spots filled
                    </div>
                    {selectedApp.slot.site && (
                      <div className="flex items-center gap-2 text-stone-600">
                        <Star className="w-4 h-4 text-amber-500" />
                        {selectedApp.slot.site.rating}/5 ({selectedApp.slot.site.review_count} reviews)
                      </div>
                    )}
                  </div>
                  {selectedApp.slot.description && (
                    <p className="text-sm text-stone-600 pt-1 border-t border-stone-200">{selectedApp.slot.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Cover Letter */}
            {selectedApp.cover_letter && (
              <div>
                <h3 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary-500" /> Your Cover Letter
                </h3>
                <div className="bg-stone-50 rounded-xl p-4">
                  <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{selectedApp.cover_letter}</p>
                </div>
              </div>
            )}

            {/* Site Notes */}
            {selectedApp.notes && (
              <div>
                <h3 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-500" /> Site Response
                </h3>
                <div className={`rounded-xl p-4 ${
                  selectedApp.status === 'accepted' ? 'bg-green-50 border border-green-200' :
                  selectedApp.status === 'declined' ? 'bg-red-50 border border-red-200' :
                  'bg-stone-50 border border-stone-200'
                }`}>
                  <p className="text-sm text-stone-700 italic">{selectedApp.notes}</p>
                </div>
              </div>
            )}

            {/* Requirements */}
            {selectedApp.slot?.requirements && selectedApp.slot.requirements.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary-500" /> Site Requirements
                </h3>
                <div className="space-y-2">
                  {selectedApp.slot.requirements.map(req => (
                    <div key={req} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="text-stone-700">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {selectedApp.status !== 'withdrawn' && (
              <div>
                <h3 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary-500" /> Next Steps
                </h3>
                <div className="space-y-2">
                  {getNextSteps(selectedApp.status).map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium shrink-0">{i + 1}</span>
                      <span className="text-stone-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2 border-t border-stone-200">
              <Button variant="ghost" onClick={() => { setShowDetail(false); setSelectedApp(null) }}>
                Close
              </Button>
              {selectedApp.status === 'accepted' && (
                <Button onClick={() => navigate('/hours')}>
                  <Clock className="w-4 h-4" /> Go to Hour Log
                </Button>
              )}
              {selectedApp.status === 'pending' && (
                <Button variant="danger" onClick={() => setShowWithdrawConfirm(true)}>
                  <X className="w-4 h-4" /> Withdraw Application
                </Button>
              )}
              {(selectedApp.status === 'declined' || selectedApp.status === 'withdrawn') && (
                <Button onClick={() => { setShowDetail(false); navigate('/rotations') }}>
                  <Send className="w-4 h-4" /> Find More Rotations
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Withdraw Confirmation Modal */}
      <Modal isOpen={showWithdrawConfirm} onClose={() => setShowWithdrawConfirm(false)} title="Withdraw Application" size="sm">
        <div className="space-y-4">
          <div className="bg-red-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Are you sure you want to withdraw?</p>
                <p className="text-sm text-red-700 mt-1">This action cannot be undone. You would need to submit a new application if you change your mind.</p>
              </div>
            </div>
          </div>
          {selectedApp && (
            <div className="text-sm text-stone-600">
              <p className="font-medium">{selectedApp.slot?.title}</p>
              <p className="text-stone-500">{selectedApp.slot?.site?.name}</p>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowWithdrawConfirm(false)}>Keep Application</Button>
            <Button variant="danger" onClick={() => selectedApp && handleWithdraw(selectedApp.id)} isLoading={withdrawMutation.isPending}>
              <X className="w-4 h-4" /> Withdraw
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
