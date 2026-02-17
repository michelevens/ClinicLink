import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Mail, GraduationCap, Clock, BookOpen,
  Calendar, Award, Loader2, Users, BadgeCheck, AlertTriangle, CheckCircle2, Info
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext.tsx'
import { useMyStudents, useApplications, useCeEligibility, useCompleteApplication } from '../hooks/useApi.ts'
import { Card } from '../components/ui/Card.tsx'
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'

export function StudentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isPreceptor = user?.role === 'preceptor' || user?.role === 'site_manager'
  const canComplete = user?.role === 'preceptor' || user?.role === 'site_manager' || user?.role === 'coordinator' || user?.role === 'admin'
  const { data, isLoading } = useMyStudents()
  const { data: appsData } = useApplications()
  const [showConfirm, setShowConfirm] = useState(false)
  const students = data?.students || []
  const student = students.find(s => s.id === id)

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-24">
        <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-stone-900">Student not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/students')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
        </Button>
      </div>
    )
  }

  const totalHours = student.total_hours ?? (student.prior_hours + student.hours_completed)
  const progress = student.hours_required > 0
    ? Math.min(100, Math.round((totalHours / student.hours_required) * 100))
    : 0

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'My Students', path: '/students' },
        { label: `${student.first_name} ${student.last_name}` },
      ]} />

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl shrink-0">
            {student.first_name[0]}{student.last_name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-stone-900">{student.first_name} {student.last_name}</h1>
            <div className="flex flex-wrap gap-2 mt-1">
              {student.degree_type && <Badge variant="primary">{student.degree_type}</Badge>}
              {student.university && <Badge variant="default">{student.university}</Badge>}
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-stone-600">
              <span className="flex items-center gap-1"><Mail className="w-4 h-4 text-stone-400" /> {student.email}</span>
              {student.graduation_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-stone-400" /> Graduation: {new Date(student.graduation_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card padding="sm">
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xl font-bold text-stone-900">{totalHours}h</p>
            <p className="text-xs text-stone-500">Total Hours</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5" />
            </div>
            <p className="text-xl font-bold text-stone-900">{student.hours_completed}h</p>
            <p className="text-xs text-stone-500">Platform Hours</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xl font-bold text-stone-900">{student.pending_hours}h</p>
            <p className="text-xs text-stone-500">Pending Review</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary-500 flex items-center justify-center mx-auto mb-2">
              <GraduationCap className="w-5 h-5" />
            </div>
            <p className="text-xl font-bold text-stone-900">{student.prior_hours}h</p>
            <p className="text-xs text-stone-500">Prior Hours</p>
          </div>
        </Card>
      </div>

      {/* Program & Hours Progress */}
      <Card>
        <h2 className="text-sm font-semibold text-stone-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary-500" /> Academic Details
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
          <div className="bg-stone-50 rounded-xl p-3">
            <p className="text-xs text-stone-500 mb-1">University</p>
            <p className="text-sm font-medium text-stone-900">{student.university || 'N/A'}</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-3">
            <p className="text-xs text-stone-500 mb-1">Program</p>
            <p className="text-sm font-medium text-stone-900">{student.program || 'N/A'}</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-3">
            <p className="text-xs text-stone-500 mb-1">Degree</p>
            <p className="text-sm font-medium text-stone-900">{student.degree_type || 'N/A'}</p>
          </div>
          {student.gpa != null && (
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">GPA</p>
              <p className="text-sm font-medium text-stone-900">{Number(student.gpa).toFixed(2)}</p>
            </div>
          )}
          {student.graduation_date && (
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">Graduation Date</p>
              <p className="text-sm font-medium text-stone-900">{new Date(student.graduation_date).toLocaleDateString()}</p>
            </div>
          )}
          <div className="bg-stone-50 rounded-xl p-3">
            <p className="text-xs text-stone-500 mb-1">Required Hours</p>
            <p className="text-sm font-medium text-stone-900">{student.hours_required}h</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-4 bg-stone-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-700">Clinical Hours Progress</span>
            <span className="text-sm font-bold text-stone-900">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-stone-500">
            <span>{totalHours}h completed{student.prior_hours > 0 ? ` (${student.prior_hours}h prior)` : ''}</span>
            <span>{student.hours_required}h required</span>
          </div>
          {student.pending_hours > 0 && (
            <p className="text-xs text-amber-600 mt-1">{student.pending_hours}h pending review</p>
          )}
        </div>
      </Card>

      {/* Clinical Interests */}
      {student.clinical_interests && student.clinical_interests.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary-500" /> Clinical Interests
          </h2>
          <div className="flex flex-wrap gap-2">
            {student.clinical_interests.map(interest => (
              <Badge key={interest} variant="default">{interest}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Bio */}
      {student.bio && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3">About</h2>
          <p className="text-sm text-stone-700 leading-relaxed">{student.bio}</p>
        </Card>
      )}

      {/* Rotation Completion & CE Eligibility */}
      {canComplete && <RotationCompletionSection studentId={id!} applications={appsData?.data || []} showConfirm={showConfirm} setShowConfirm={setShowConfirm} />}

      {/* Preceptor Actions */}
      {isPreceptor && (
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/hours')} className="flex-1">
            <Clock className="w-4 h-4 mr-2" /> Review Hours
          </Button>
          <Button onClick={() => navigate('/evaluations')} className="flex-1">
            <GraduationCap className="w-4 h-4 mr-2" /> Write Evaluation
          </Button>
        </div>
      )}
    </div>
  )
}

// --- Rotation Completion Section ---
function RotationCompletionSection({ studentId, applications, showConfirm, setShowConfirm }: {
  studentId: string
  applications: { id: string; student_id: string; status: string; slot?: { id: string; title?: string; end_date?: string; site?: { name: string }; preceptor?: { first_name: string; last_name: string } } }[]
  showConfirm: boolean
  setShowConfirm: (v: boolean) => void
}) {
  // Find accepted applications for this student
  const acceptedApps = applications.filter(a => a.student_id === studentId && a.status === 'accepted')

  if (acceptedApps.length === 0) return null

  return (
    <>
      {acceptedApps.map(app => (
        <RotationCompleteCard key={app.id} application={app} showConfirm={showConfirm} setShowConfirm={setShowConfirm} />
      ))}
    </>
  )
}

function RotationCompleteCard({ application, showConfirm, setShowConfirm }: {
  application: { id: string; slot?: { id: string; title?: string; end_date?: string; site?: { name: string }; preceptor?: { first_name: string; last_name: string } } }
  showConfirm: boolean
  setShowConfirm: (v: boolean) => void
}) {
  const { data: ceEligibility, isLoading: ceLoading } = useCeEligibility(application.id)
  const completeMutation = useCompleteApplication()

  const slot = application.slot
  const isRotationEnded = slot?.end_date ? new Date(slot.end_date) < new Date() : false
  const rotationTitle = slot?.title || slot?.site?.name || 'Rotation'

  return (
    <Card className="border-2 border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
          <BadgeCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 text-sm">Complete Rotation</h3>
          <p className="text-xs text-stone-500 mt-0.5">{rotationTitle}{slot?.site?.name ? ` at ${slot.site.name}` : ''}</p>

          {slot?.end_date && (
            <p className={`text-xs mt-1 ${isRotationEnded ? 'text-green-600 font-medium' : 'text-amber-600'}`}>
              {isRotationEnded
                ? `Rotation ended ${new Date(slot.end_date).toLocaleDateString()}`
                : `Ends ${new Date(slot.end_date).toLocaleDateString()}`}
            </p>
          )}

          {/* CE Eligibility Indicator */}
          {!ceLoading && ceEligibility && (
            <div className={`mt-3 p-3 rounded-xl text-xs ${
              ceEligibility.eligible
                ? 'bg-green-50 border border-green-200'
                : 'bg-amber-50 border border-amber-200'
            }`}>
              <div className="flex items-center gap-1.5">
                {ceEligibility.eligible ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    <span className="text-green-700 font-medium">
                      CE Credit: {ceEligibility.contact_hours} contact hours will be awarded
                    </span>
                  </>
                ) : ceEligibility.reason?.includes('does not offer') ? (
                  <>
                    <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="text-stone-500">CE Credits: Not configured for this university</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="text-amber-700">{ceEligibility.reason}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Confirm / Complete Button */}
          {!showConfirm ? (
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => setShowConfirm(true)}
            >
              <BadgeCheck className="w-4 h-4" /> Mark Rotation Complete
            </Button>
          ) : (
            <div className="mt-3 p-3 bg-white rounded-xl border border-stone-200">
              <p className="text-xs text-stone-600 mb-3">
                This will mark the rotation as completed. {ceEligibility?.eligible
                  ? `The preceptor will receive ${ceEligibility.contact_hours} CE contact hours.`
                  : 'CE credits may not be awarded (see status above).'}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  isLoading={completeMutation.isPending}
                  onClick={() => {
                    completeMutation.mutate(application.id, {
                      onSuccess: (res) => {
                        toast.success('Rotation marked as completed!')
                        if (res.ce?.ce_certificate_created) {
                          toast.success(`CE certificate created (${res.ce.contact_hours} hrs) — Status: ${res.ce.ce_status}`)
                        }
                        setShowConfirm(false)
                      },
                      onError: (err) => toast.error(err.message),
                    })
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm Complete
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
