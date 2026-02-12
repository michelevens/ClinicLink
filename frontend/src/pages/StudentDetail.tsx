import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Mail, GraduationCap, Clock, BookOpen,
  Calendar, Award, Loader2, Users
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.tsx'
import { useMyStudents } from '../hooks/useApi.ts'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'

export function StudentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isPreceptor = user?.role === 'preceptor' || user?.role === 'site_manager'
  const { data, isLoading } = useMyStudents()
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
      {/* Back Button */}
      <button onClick={() => navigate('/students')} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700">
        <ArrowLeft className="w-4 h-4" /> Back to My Students
      </button>

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
