import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Search, GraduationCap, Clock, BookOpen, Mail, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.tsx'
import { useMyStudents } from '../hooks/useApi.ts'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import type { ApiMyStudent } from '../services/api.ts'

export function MyStudents() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isPreceptor = user?.role === 'preceptor' || user?.role === 'site_manager'

  const { data, isLoading } = useMyStudents()
  const students = data?.data || []

  const [search, setSearch] = useState('')
  const [programFilter, setProgramFilter] = useState<string>('all')
  const [viewStudent, setViewStudent] = useState<ApiMyStudent | null>(null)

  // Get unique programs for filter
  const programs = useMemo(() => {
    const set = new Set(students.map(s => s.program).filter(Boolean))
    return Array.from(set) as string[]
  }, [students])

  const filtered = useMemo(() => {
    return students.filter(s => {
      if (programFilter !== 'all' && s.program !== programFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          (s.first_name + ' ' + s.last_name).toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.university?.toLowerCase().includes(q) ||
          s.program?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [students, search, programFilter])

  const stats = useMemo(() => ({
    total: students.length,
    avgHours: students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.hours_completed, 0) / students.length) : 0,
    pendingReviews: students.reduce((sum, s) => sum + s.pending_hours, 0),
  }), [students])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">My Students</h1>
        <p className="text-stone-500 mt-1">
          {isPreceptor ? 'Students assigned to your rotations' : 'All students in the system'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats.total}</p>
              <p className="text-xs text-stone-500">Students</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats.avgHours}</p>
              <p className="text-xs text-stone-500">Avg Hours</p>
            </div>
          </div>
        </Card>
        {isPreceptor && stats.pendingReviews > 0 && (
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{stats.pendingReviews}</p>
                <p className="text-xs text-stone-500">Pending Hrs</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          />
        </div>
        {programs.length > 1 && (
          <select
            value={programFilter}
            onChange={e => setProgramFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          >
            <option value="all">All Programs</option>
            {programs.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        )}
      </div>

      {/* Student Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-stone-900 mb-1">
              {students.length === 0 ? 'No students yet' : 'No matching students'}
            </h3>
            <p className="text-stone-500 text-sm">
              {isPreceptor ? 'Students will appear here once they are accepted into your rotations.' : 'No students found matching your criteria.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              isPreceptor={isPreceptor}
              onView={() => setViewStudent(student)}
              onReviewHours={() => navigate('/hours')}
              onWriteEval={() => navigate('/evaluations')}
            />
          ))}
        </div>
      )}

      {/* Student Detail Modal */}
      {viewStudent && (
        <StudentDetailView
          student={viewStudent}
          isPreceptor={isPreceptor}
          onClose={() => setViewStudent(null)}
          onReviewHours={() => { setViewStudent(null); navigate('/hours') }}
          onWriteEval={() => { setViewStudent(null); navigate('/evaluations') }}
        />
      )}
    </div>
  )
}

function StudentCard({ student, isPreceptor, onView, onReviewHours, onWriteEval }: {
  student: ApiMyStudent
  isPreceptor: boolean
  onView: () => void
  onReviewHours: () => void
  onWriteEval: () => void
}) {
  const progress = student.hours_required > 0
    ? Math.min(100, Math.round((student.hours_completed / student.hours_required) * 100))
    : 0

  return (
    <Card hover>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
              {student.first_name[0]}{student.last_name[0]}
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">{student.first_name} {student.last_name}</h3>
              <p className="text-xs text-stone-500">{student.email}</p>
            </div>
          </div>
          <button onClick={onView} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="flex flex-wrap gap-2">
          {student.degree_type && (
            <Badge variant="primary" size="sm">{student.degree_type}</Badge>
          )}
          {student.university && (
            <Badge variant="default" size="sm">{student.university}</Badge>
          )}
        </div>
        {student.program && (
          <p className="text-xs text-stone-500 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {student.program}
          </p>
        )}

        {/* Hours Progress */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-stone-500">Clinical Hours</span>
            <span className="font-semibold text-stone-700">{student.hours_completed} / {student.hours_required}h</span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-stone-400">{progress}%</span>
            {student.pending_hours > 0 && (
              <span className="text-amber-500 font-medium">{student.pending_hours}h pending</span>
            )}
          </div>
        </div>

        {/* Actions */}
        {isPreceptor && (
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onReviewHours} className="flex-1">
              <Clock className="w-3.5 h-3.5 mr-1" /> Review Hours
            </Button>
            <Button variant="outline" size="sm" onClick={onWriteEval} className="flex-1">
              <GraduationCap className="w-3.5 h-3.5 mr-1" /> Evaluate
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

function StudentDetailView({ student, isPreceptor, onClose, onReviewHours, onWriteEval }: {
  student: ApiMyStudent
  isPreceptor: boolean
  onClose: () => void
  onReviewHours: () => void
  onWriteEval: () => void
}) {
  const progress = student.hours_required > 0
    ? Math.min(100, Math.round((student.hours_completed / student.hours_required) * 100))
    : 0

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900">Student Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-stone-500">
            <span className="sr-only">Close</span>&times;
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
              {student.first_name[0]}{student.last_name[0]}
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900">{student.first_name} {student.last_name}</h3>
              <p className="text-sm text-stone-500 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {student.email}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-stone-500 mb-1">University</p>
              <p className="text-sm font-semibold text-stone-900">{student.university || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">Program</p>
              <p className="text-sm font-semibold text-stone-900">{student.program || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">Degree</p>
              <p className="text-sm font-semibold text-stone-900">{student.degree_type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">GPA</p>
              <p className="text-sm font-semibold text-stone-900">{student.gpa?.toFixed(2) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">Graduation</p>
              <p className="text-sm font-semibold text-stone-900">
                {student.graduation_date ? new Date(student.graduation_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Hours Progress */}
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
              <span>{student.hours_completed}h completed</span>
              <span>{student.hours_required}h required</span>
            </div>
            {student.pending_hours > 0 && (
              <p className="text-xs text-amber-600 mt-1">{student.pending_hours}h pending review</p>
            )}
          </div>

          {/* Clinical Interests */}
          {student.clinical_interests.length > 0 && (
            <div>
              <p className="text-xs text-stone-500 mb-2">Clinical Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {student.clinical_interests.map(interest => (
                  <Badge key={interest} variant="default" size="sm">{interest}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {student.bio && (
            <div>
              <p className="text-xs text-stone-500 mb-1">Bio</p>
              <p className="text-sm text-stone-700">{student.bio}</p>
            </div>
          )}

          {/* Actions */}
          {isPreceptor && (
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onReviewHours} className="flex-1">
                <Clock className="w-4 h-4 mr-2" /> Review Hours
              </Button>
              <Button onClick={onWriteEval} className="flex-1">
                <GraduationCap className="w-4 h-4 mr-2" /> Write Evaluation
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
