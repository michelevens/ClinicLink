import { useState, useMemo } from 'react'
import {
  BookOpen, GraduationCap, Clock, ChevronDown, ChevronRight, Search, Building2, Plus,
  Users, MapPin, Phone, Globe, CheckCircle2, UserPlus,
} from 'lucide-react'
import { useCreateProgram, useMyStudents, useAssignStudentProgram } from '../hooks/useApi.ts'
import { useAuth } from '../contexts/AuthContext.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { api } from '../services/api.ts'
import type { ApiUniversity, ApiProgram, ApiMyStudent } from '../services/api.ts'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

const DEGREE_TYPES = ['BSN', 'MSN', 'DNP', 'PA', 'NP', 'DPT', 'OTD', 'MSW', 'PharmD', 'other'] as const

const DEGREE_COLORS: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'default'> = {
  BSN: 'primary', MSN: 'secondary', DNP: 'success', PA: 'warning', NP: 'primary',
  DPT: 'default', OTD: 'default', MSW: 'secondary', PharmD: 'danger', other: 'default',
}

function useUniversities(params?: { search?: string }) {
  return useQuery({
    queryKey: ['universities', params],
    queryFn: () => api.get<{ data: ApiUniversity[] }>(`/universities${params?.search ? `?search=${params.search}` : ''}`),
  })
}

function useUniversityPrograms(id: string) {
  return useQuery({
    queryKey: ['university-programs', id],
    queryFn: () => api.get<ApiProgram[]>(`/universities/${id}/programs`),
    enabled: !!id,
  })
}

export function Programs() {
  const { user } = useAuth()
  const isCoordinator = user?.role === 'coordinator'
  const coordUniversityId = user?.universityId || null

  if (isCoordinator && coordUniversityId) {
    return <CoordinatorMyUniversity universityId={coordUniversityId} />
  }

  return <AdminProgramsBrowser />
}

// ──────────────────────────────────────────
// Coordinator: "My University" unified view
// ──────────────────────────────────────────
function CoordinatorMyUniversity({ universityId }: { universityId: string }) {
  const { data: uniData, isLoading: uniLoading } = useUniversities()
  const { data: programsData, isLoading: programsLoading } = useUniversityPrograms(universityId)
  const { data: studentsData, isLoading: studentsLoading } = useMyStudents()

  const [showAddProgram, setShowAddProgram] = useState(false)
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null)
  const [showUnassigned, setShowUnassigned] = useState(false)
  const [assigningStudent, setAssigningStudent] = useState<ApiMyStudent | null>(null)

  const allUniversities = uniData?.data || []
  const university = allUniversities.find(u => u.id === universityId)
  const programs = Array.isArray(programsData) ? programsData : []
  const students = studentsData?.students || []

  // Group students by program
  const studentsByProgram = useMemo(() => {
    const map: Record<string, ApiMyStudent[]> = {}
    const unassigned: ApiMyStudent[] = []
    for (const s of students) {
      if (s.program_id) {
        if (!map[s.program_id]) map[s.program_id] = []
        map[s.program_id].push(s)
      } else {
        unassigned.push(s)
      }
    }
    return { map, unassigned }
  }, [students])

  const isLoading = uniLoading || programsLoading || studentsLoading

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!university) {
    return (
      <Card>
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-stone-900 mb-1">No university found</h3>
          <p className="text-stone-500 text-sm">
            You are not associated with any university. Contact an admin to link your account.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My University</h1>
          <p className="text-stone-500 mt-1">Manage programs and student assignments</p>
        </div>
        <Button onClick={() => setShowAddProgram(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Program
        </Button>
      </div>

      {/* University Info Card */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-stone-900">{university.name}</h2>
              {university.is_verified && <Badge variant="success" size="sm">Verified</Badge>}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {university.city}, {university.state}
              </span>
              {university.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {university.phone}
                </span>
              )}
              {university.website && (
                <a href={university.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-600 hover:underline">
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-primary-600">{programs.length}</p>
            <p className="text-xs text-stone-500">Programs</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-stone-100">
          <div className="text-center">
            <p className="text-lg font-bold text-stone-900">{students.length}</p>
            <p className="text-xs text-stone-500">Total Students</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-stone-900">{students.length - studentsByProgram.unassigned.length}</p>
            <p className="text-xs text-stone-500">Assigned</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-amber-600">{studentsByProgram.unassigned.length}</p>
            <p className="text-xs text-stone-500">Unassigned</p>
          </div>
        </div>
      </Card>

      {/* Unassigned Students Alert */}
      {studentsByProgram.unassigned.length > 0 && (
        <Card>
          <button
            onClick={() => setShowUnassigned(!showUnassigned)}
            className="w-full flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-stone-900">
                {studentsByProgram.unassigned.length} Unassigned Student{studentsByProgram.unassigned.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-stone-500">These students need to be assigned to a program</p>
            </div>
            {showUnassigned
              ? <ChevronDown className="w-5 h-5 text-stone-400" />
              : <ChevronRight className="w-5 h-5 text-stone-400" />}
          </button>

          {showUnassigned && (
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
              {studentsByProgram.unassigned.map(student => (
                <StudentRow
                  key={student.id}
                  student={student}
                  programs={programs}
                  onAssign={() => setAssigningStudent(student)}
                />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Programs with Students */}
      {programs.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="font-semibold text-stone-900 mb-1">No programs yet</h3>
            <p className="text-sm text-stone-500 mb-4">Create your first program to start assigning students.</p>
            <Button onClick={() => setShowAddProgram(true)} variant="outline">
              <Plus className="w-4 h-4 mr-1" /> Add Program
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900">Programs</h2>
          {programs.map(program => {
            const programStudents = studentsByProgram.map[program.id] || []
            const isExpanded = expandedProgramId === program.id
            return (
              <ProgramCard
                key={program.id}
                program={program}
                students={programStudents}
                allPrograms={programs}
                isExpanded={isExpanded}
                onToggle={() => setExpandedProgramId(isExpanded ? null : program.id)}
                onAssignStudent={setAssigningStudent}
              />
            )
          })}
        </div>
      )}

      {/* Add Program Modal */}
      {showAddProgram && (
        <AddProgramModal
          universityId={universityId}
          onClose={() => setShowAddProgram(false)}
        />
      )}

      {/* Assign Student to Program Modal */}
      {assigningStudent && (
        <AssignProgramModal
          student={assigningStudent}
          programs={programs}
          onClose={() => setAssigningStudent(null)}
        />
      )}
    </div>
  )
}

// ──────────────────────────────────────────
// Program Card with expandable student list
// ──────────────────────────────────────────
function ProgramCard({ program, students, allPrograms, isExpanded, onToggle, onAssignStudent }: {
  program: ApiProgram
  students: ApiMyStudent[]
  allPrograms: ApiProgram[]
  isExpanded: boolean
  onToggle: () => void
  onAssignStudent: (s: ApiMyStudent) => void
}) {
  return (
    <Card>
      <button onClick={onToggle} className="w-full flex items-center gap-3 text-left">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 text-primary-600 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-stone-900">{program.name}</h3>
            <Badge variant={DEGREE_COLORS[program.degree_type] || 'default'} size="sm">{program.degree_type}</Badge>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-stone-500 mt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {program.required_hours}h required
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {students.length} student{students.length !== 1 ? 's' : ''}
            </span>
            {program.specialties && program.specialties.length > 0 && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {program.specialties.join(', ')}
              </span>
            )}
          </div>
        </div>
        {isExpanded
          ? <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
          : <ChevronRight className="w-5 h-5 text-stone-400 shrink-0" />}
      </button>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-stone-100">
          {students.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-4">No students assigned to this program yet.</p>
          ) : (
            <div className="space-y-2">
              {students.map(student => (
                <StudentRow
                  key={student.id}
                  student={student}
                  programs={allPrograms}
                  onAssign={() => onAssignStudent(student)}
                  showReassign
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

// ──────────────────────────────────────────
// Student row with hours + assign button
// ──────────────────────────────────────────
function StudentRow({ student, programs, onAssign, showReassign }: {
  student: ApiMyStudent
  programs: ApiProgram[]
  onAssign: () => void
  showReassign?: boolean
}) {
  const hoursPercent = student.hours_required > 0
    ? Math.min(100, Math.round((student.total_hours / student.hours_required) * 100))
    : 0

  return (
    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
        {student.first_name[0]}{student.last_name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-900 truncate">
          {student.first_name} {student.last_name}
        </p>
        <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {student.total_hours}/{student.hours_required}h
          </span>
          {hoursPercent > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${hoursPercent >= 100 ? 'bg-green-500' : hoursPercent >= 50 ? 'bg-primary-500' : 'bg-amber-500'}`}
                  style={{ width: `${hoursPercent}%` }}
                />
              </div>
              <span className="text-[10px]">{hoursPercent}%</span>
            </div>
          )}
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onAssign}>
        {showReassign ? 'Reassign' : 'Assign'}
      </Button>
    </div>
  )
}

// ──────────────────────────────────────────
// Assign/Reassign Student to Program Modal
// ──────────────────────────────────────────
function AssignProgramModal({ student, programs, onClose }: {
  student: ApiMyStudent
  programs: ApiProgram[]
  onClose: () => void
}) {
  const assignMutation = useAssignStudentProgram()
  const [selectedProgramId, setSelectedProgramId] = useState(student.program_id || '')

  const handleAssign = () => {
    if (!selectedProgramId) {
      toast.error('Please select a program.')
      return
    }
    assignMutation.mutate(
      { studentId: student.id, programId: selectedProgramId },
      {
        onSuccess: () => {
          toast.success(`${student.first_name} ${student.last_name} assigned successfully.`)
          onClose()
        },
        onError: (err) => toast.error(err.message || 'Failed to assign student.'),
      }
    )
  }

  return (
    <Modal isOpen onClose={onClose} title={`Assign ${student.first_name} ${student.last_name}`} size="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
            {student.first_name[0]}{student.last_name[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">{student.first_name} {student.last_name}</p>
            <p className="text-xs text-stone-500">{student.email}</p>
          </div>
        </div>

        {student.program && (
          <p className="text-sm text-stone-500">
            Currently in: <span className="font-medium text-stone-700">{student.program}</span>
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Select Program</label>
          <select
            value={selectedProgramId}
            onChange={e => setSelectedProgramId(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">-- Choose a program --</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.degree_type}) - {p.required_hours}h
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAssign} isLoading={assignMutation.isPending}>
            <UserPlus className="w-4 h-4 mr-1" /> Assign
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ──────────────────────────────────────────
// Admin: Browse all universities & programs
// ──────────────────────────────────────────
function AdminProgramsBrowser() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useUniversities({ search: search || undefined })
  const universities = data?.data || []
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Programs</h1>
        <p className="text-stone-500 mt-1">Universities and their clinical programs</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search universities..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : universities.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-stone-900 mb-1">No universities found</h3>
            <p className="text-stone-500 text-sm">Try adjusting your search criteria.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {universities.map(uni => (
            <UniversityCard
              key={uni.id}
              university={uni}
              isExpanded={expandedId === uni.id}
              onToggle={() => setExpandedId(expandedId === uni.id ? null : uni.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function UniversityCard({ university, isExpanded, onToggle }: {
  university: ApiUniversity
  isExpanded: boolean
  onToggle: () => void
}) {
  const { data, isLoading } = useUniversityPrograms(isExpanded ? university.id : '')
  const programs = Array.isArray(data) ? data : []

  return (
    <Card>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 text-left"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600 flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900">{university.name}</h3>
          <p className="text-sm text-stone-500">{university.city}, {university.state}</p>
        </div>
        <div className="flex items-center gap-2">
          {university.is_verified && <Badge variant="success" size="sm">Verified</Badge>}
          {isExpanded ? <ChevronDown className="w-5 h-5 text-stone-400" /> : <ChevronRight className="w-5 h-5 text-stone-400" />}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-stone-100">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : programs.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-4">No programs listed for this university.</p>
          ) : (
            <div className="space-y-3">
              {programs.map(program => (
                <div key={program.id} className="p-3 bg-stone-50 rounded-xl">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary-500 shrink-0" />
                      <h4 className="text-sm font-semibold text-stone-900">{program.name}</h4>
                    </div>
                    <Badge variant={DEGREE_COLORS[program.degree_type] || 'default'} size="sm">{program.degree_type}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500 ml-6">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {program.required_hours}h required
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" /> {program.degree_type}
                    </span>
                  </div>
                  {program.specialties && program.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 ml-6">
                      {program.specialties.map(s => (
                        <Badge key={s} variant="default" size="sm">{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

function AddProgramModal({ universityId, onClose }: { universityId: string; onClose: () => void }) {
  const createProgram = useCreateProgram()
  const [form, setForm] = useState({
    name: '',
    degree_type: 'MSN' as string,
    required_hours: 500,
    specialties: '' as string,
  })

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Program name is required.')
      return
    }
    const specialtiesArr = form.specialties
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    createProgram.mutate({
      universityId,
      data: {
        name: form.name.trim(),
        degree_type: form.degree_type,
        required_hours: form.required_hours,
        specialties: specialtiesArr.length > 0 ? specialtiesArr : undefined,
      },
    }, {
      onSuccess: () => {
        toast.success('Program created successfully.')
        onClose()
      },
      onError: (err) => toast.error(err.message || 'Failed to create program.'),
    })
  }

  return (
    <Modal isOpen onClose={onClose} title="Add New Program" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Program Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Family Nurse Practitioner"
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Degree Type</label>
            <select
              value={form.degree_type}
              onChange={e => setForm({ ...form, degree_type: e.target.value })}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {DEGREE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Required Clinical Hours</label>
            <input
              type="number"
              min="0"
              value={form.required_hours}
              onChange={e => setForm({ ...form, required_hours: Number(e.target.value) })}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Specialties (comma-separated)</label>
          <input
            type="text"
            value={form.specialties}
            onChange={e => setForm({ ...form, specialties: e.target.value })}
            placeholder="e.g. Family Practice, Pediatrics, Women's Health"
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={createProgram.isPending}>
            <Plus className="w-4 h-4 mr-1" /> Create Program
          </Button>
        </div>
      </div>
    </Modal>
  )
}
