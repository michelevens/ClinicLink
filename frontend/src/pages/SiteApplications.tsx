import { useState } from 'react'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { useApplications, useReviewApplication, useCompleteApplication, useCeEligibility } from '../hooks/useApi.ts'
import type { ApiApplication } from '../services/api.ts'
import { toast } from 'sonner'
import {
  CheckCircle, XCircle, Clock, User, FileText,
  Calendar, MapPin, Building2, Loader2, Inbox,
  ChevronDown, ChevronUp, GraduationCap, BadgeCheck,
  CheckCircle2, AlertTriangle, Info
} from 'lucide-react'

export function SiteApplications() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [reviewModal, setReviewModal] = useState<ApiApplication | null>(null)
  const [reviewAction, setReviewAction] = useState<'accepted' | 'declined' | 'waitlisted'>('accepted')
  const [notes, setNotes] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data, isLoading } = useApplications()
  const reviewMutation = useReviewApplication()
  const completeMutation = useCompleteApplication()

  const applications = data?.data || []
  const filtered = statusFilter === 'all' ? applications : applications.filter(a => a.status === statusFilter)

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    completed: applications.filter(a => a.status === 'completed').length,
    declined: applications.filter(a => a.status === 'declined').length,
    waitlisted: applications.filter(a => a.status === 'waitlisted').length,
  }

  const openReview = (app: ApiApplication, action: 'accepted' | 'declined' | 'waitlisted') => {
    setReviewModal(app)
    setReviewAction(action)
    setNotes('')
  }

  const handleReview = async () => {
    if (!reviewModal) return
    try {
      await reviewMutation.mutateAsync({
        id: reviewModal.id,
        data: { status: reviewAction, notes: notes || undefined },
      })
      toast.success(
        reviewAction === 'accepted' ? 'Application accepted!' :
        reviewAction === 'declined' ? 'Application declined' :
        'Application waitlisted'
      )
      setReviewModal(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to review application'
      toast.error(message)
    }
  }

  const statusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'danger' | 'secondary' | 'default' | 'primary'> = {
      pending: 'warning',
      accepted: 'success',
      completed: 'primary',
      declined: 'danger',
      waitlisted: 'secondary',
      withdrawn: 'default',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
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
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Applications</h1>
        <p className="text-stone-500">Review and manage student applications</p>
      </div>

      {/* Summary Chips */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'accepted', 'completed', 'declined', 'waitlisted'] as const).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === status
                ? 'bg-primary-500 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-1.5 opacity-80">({counts[status]})</span>
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filtered.length === 0 && (
        <Card className="text-center py-12">
          <Inbox className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-700 mb-2">No applications</h3>
          <p className="text-stone-500">
            {statusFilter === 'all'
              ? 'No applications have been received yet'
              : `No ${statusFilter} applications`}
          </p>
        </Card>
      )}

      <div className="space-y-3">
        {filtered.map(app => {
          const isExpanded = expandedId === app.id
          return (
            <Card key={app.id} padding="none">
              <div
                className="p-4 sm:p-6 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : app.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-stone-900">
                        {app.student?.first_name} {app.student?.last_name}
                      </h3>
                      {statusBadge(app.status)}
                    </div>
                    {app.student?.student_profile?.university && (
                      <p className="text-xs text-stone-500 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        {app.student.student_profile.university.name}
                        {app.student.student_profile.program && (
                          <span className="text-stone-400">({app.student.student_profile.program.degree_type})</span>
                        )}
                      </p>
                    )}
                    <p className="text-sm text-stone-500 mt-0.5">
                      Applied for: <span className="text-stone-700 font-medium">{app.slot?.title}</span>
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(app.submitted_at || app.created_at).toLocaleDateString()}
                      </span>
                      {app.slot?.site && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {app.slot.site.city}, {app.slot.site.state}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {app.slot?.specialty}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-stone-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-stone-200 p-4 sm:p-6 bg-stone-50/50">
                  {app.cover_letter && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-stone-500" />
                        <h4 className="text-sm font-medium text-stone-700">Cover Letter</h4>
                      </div>
                      <p className="text-sm text-stone-600 bg-white rounded-xl p-4 border border-stone-200">
                        {app.cover_letter}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="bg-white rounded-xl p-3 border border-stone-200">
                      <p className="text-xs text-stone-500">Email</p>
                      <p className="text-sm font-medium text-stone-900 truncate">{app.student?.email}</p>
                    </div>
                    {app.student?.student_profile?.university && (
                      <div className="bg-white rounded-xl p-3 border border-stone-200">
                        <p className="text-xs text-stone-500">University</p>
                        <p className="text-sm font-medium text-stone-900 truncate">{app.student.student_profile.university.name}</p>
                        {app.student.student_profile.program && (
                          <p className="text-xs text-stone-500">{app.student.student_profile.program.name} ({app.student.student_profile.program.degree_type})</p>
                        )}
                      </div>
                    )}
                    {app.slot?.preceptor && (
                      <div className="bg-white rounded-xl p-3 border border-stone-200">
                        <p className="text-xs text-stone-500">Preceptor</p>
                        <p className="text-sm font-medium text-stone-900">{app.slot.preceptor.first_name} {app.slot.preceptor.last_name}</p>
                      </div>
                    )}
                    <div className="bg-white rounded-xl p-3 border border-stone-200">
                      <p className="text-xs text-stone-500">Rotation Dates</p>
                      <p className="text-sm font-medium text-stone-900">
                        {app.slot?.start_date ? new Date(app.slot.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        {' - '}
                        {app.slot?.end_date ? new Date(app.slot.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-stone-200">
                      <p className="text-xs text-stone-500">Spots Available</p>
                      <p className="text-sm font-medium text-stone-900">{(app.slot?.capacity || 0) - (app.slot?.filled || 0)} remaining</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-stone-200">
                      <p className="text-xs text-stone-500">Submitted</p>
                      <p className="text-sm font-medium text-stone-900">{new Date(app.submitted_at || app.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {app.notes && (
                    <div className="mb-4 bg-white rounded-xl p-3 border border-stone-200">
                      <p className="text-xs text-stone-500 mb-1">Review Notes</p>
                      <p className="text-sm text-stone-700">{app.notes}</p>
                    </div>
                  )}

                  {app.status === 'pending' && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button size="sm" onClick={() => openReview(app, 'accepted')}>
                        <CheckCircle className="w-4 h-4" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openReview(app, 'waitlisted')}>
                        <Clock className="w-4 h-4" /> Waitlist
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => openReview(app, 'declined')}>
                        <XCircle className="w-4 h-4" /> Decline
                      </Button>
                    </div>
                  )}

                  {app.status === 'accepted' && (
                    <CompleteWithCePreview app={app} completeMutation={completeMutation} />
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Review Confirm Modal */}
      <Modal
        isOpen={!!reviewModal}
        onClose={() => setReviewModal(null)}
        title={
          reviewAction === 'accepted' ? 'Accept Application' :
          reviewAction === 'declined' ? 'Decline Application' :
          'Waitlist Application'
        }
        size="sm"
      >
        {reviewModal && (
          <div className="space-y-4">
            <div className="bg-stone-50 rounded-xl p-4">
              <p className="text-sm text-stone-900 font-medium">
                {reviewModal.student?.first_name} {reviewModal.student?.last_name}
              </p>
              <p className="text-xs text-stone-500">{reviewModal.slot?.title}</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder={
                  reviewAction === 'accepted'
                    ? 'Welcome message or next steps...'
                    : reviewAction === 'declined'
                    ? 'Reason for declining...'
                    : 'Waitlist position or notes...'
                }
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setReviewModal(null)}>Cancel</Button>
              <Button
                variant={reviewAction === 'declined' ? 'danger' : 'primary'}
                onClick={handleReview}
                isLoading={reviewMutation.isPending}
              >
                {reviewAction === 'accepted' ? 'Accept' : reviewAction === 'declined' ? 'Decline' : 'Waitlist'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// --- Inline CE Eligibility Preview + Complete Button ---
function CompleteWithCePreview({ app, completeMutation }: {
  app: ApiApplication
  completeMutation: ReturnType<typeof useCompleteApplication>
}) {
  const { data: ceEligibility } = useCeEligibility(app.id)
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="pt-2 space-y-2">
      {/* CE Eligibility Indicator */}
      {ceEligibility && (
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg ${
          ceEligibility.eligible
            ? 'bg-green-50 text-green-700'
            : ceEligibility.reason?.includes('does not offer')
              ? 'bg-stone-50 text-stone-500'
              : 'bg-amber-50 text-amber-700'
        }`}>
          {ceEligibility.eligible ? (
            <><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> CE: {ceEligibility.contact_hours}h will be awarded to preceptor</>
          ) : ceEligibility.reason?.includes('does not offer') ? (
            <><Info className="w-3.5 h-3.5 shrink-0" /> CE not configured for university</>
          ) : (
            <><AlertTriangle className="w-3.5 h-3.5 shrink-0" /> CE: {ceEligibility.reason}</>
          )}
        </div>
      )}

      {!confirming ? (
        <Button size="sm" variant="outline" onClick={() => setConfirming(true)}>
          <BadgeCheck className="w-4 h-4" /> Mark Complete
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            isLoading={completeMutation.isPending}
            onClick={() => {
              completeMutation.mutate(app.id, {
                onSuccess: (res) => {
                  toast.success('Placement marked as completed!')
                  if (res.ce?.ce_certificate_created) {
                    toast.success(`CE certificate created (${res.ce.contact_hours} hrs) — Status: ${res.ce.ce_status}`)
                  }
                  setConfirming(false)
                },
                onError: (err) => toast.error(err.message),
              })
            }}
          >
            <CheckCircle2 className="w-4 h-4" /> Confirm
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
        </div>
      )}
    </div>
  )
}
