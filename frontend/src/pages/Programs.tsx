import { useState, useMemo } from 'react'
import {
  BookOpen, GraduationCap, Clock, ChevronDown, ChevronRight, Search, Building2, Plus,
  Users, MapPin, Phone, Globe, CheckCircle2, UserPlus, KeyRound, Copy, Check, ExternalLink,
  Mail, Send, X, Link, RefreshCw, Upload,
} from 'lucide-react'
import {
  useCreateProgram, useMyStudents, useAssignStudentProgram, useMyUniversityLicenseCodes,
  useStudentInvites, useCreateStudentInvite, useBulkCreateStudentInvites, useResendStudentInvite, useRevokeStudentInvite,
} from '../hooks/useApi.ts'
import { useAuth } from '../contexts/AuthContext.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { api } from '../services/api.ts'
import type { ApiUniversity, ApiProgram, ApiMyStudent, ApiLicenseCode, ApiStudentInvite } from '../services/api.ts'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usePageTitle } from '../hooks/usePageTitle.ts'

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
  usePageTitle('My University')
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

      {/* License Codes */}
      <LicenseCodesSection />

      {/* Student Invites */}
      <StudentInvitesSection programs={programs} />

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
// License Codes Section (Coordinator view)
// ──────────────────────────────────────────
function LicenseCodesSection() {
  const { data, isLoading } = useMyUniversityLicenseCodes()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const codes: ApiLicenseCode[] = data?.codes || []

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    toast.success('Code copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getStatusBadge = (code: ApiLicenseCode) => {
    if (!code.is_active) return <Badge variant="default" size="sm">Deactivated</Badge>
    if (code.expires_at && new Date(code.expires_at) < new Date()) return <Badge variant="danger" size="sm">Expired</Badge>
    if (code.max_uses && code.times_used >= code.max_uses) return <Badge variant="warning" size="sm">Used</Badge>
    return <Badge variant="success" size="sm">Active</Badge>
  }

  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
        <KeyRound className="w-5 h-5 text-primary-500" /> License Codes
      </h2>

      {codes.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <KeyRound className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="font-semibold text-stone-900 mb-1">No license codes</h3>
            <p className="text-sm text-stone-500">No license codes have been generated for your university yet. Contact an admin to create codes.</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Code</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Usage</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Expires</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {codes.map(code => (
                  <tr key={code.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs bg-stone-100 px-2 py-1 rounded-md text-stone-800">{code.code}</code>
                        <button
                          onClick={() => copyCode(code.code, code.id)}
                          className="text-stone-400 hover:text-primary-500 transition-colors"
                          title="Copy code"
                        >
                          {copiedId === code.id
                            ? <Check className="w-3.5 h-3.5 text-green-500" />
                            : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-stone-700">
                        {code.users_count ?? code.times_used} / {code.max_uses ?? '∞'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-stone-500">
                      {code.expires_at
                        ? new Date(code.expires_at).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="py-2.5 px-3">{getStatusBadge(code)}</td>
                    <td className="py-2.5 px-3 text-stone-500">
                      {new Date(code.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
            {codes.length} code{codes.length !== 1 ? 's' : ''} total
          </div>
        </Card>
      )}
    </div>
  )
}

// ──────────────────────────────────────────
// Student Invites Section (Coordinator view)
// ──────────────────────────────────────────
function StudentInvitesSection({ programs }: { programs: ApiProgram[] }) {
  const { data, isLoading } = useStudentInvites()
  const createInvite = useCreateStudentInvite()
  const bulkCreate = useBulkCreateStudentInvites()
  const resendInvite = useResendStudentInvite()
  const revokeInvite = useRevokeStudentInvite()

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const invites: ApiStudentInvite[] = data?.invites || []
  const pendingInvites = invites.filter(i => i.status === 'pending')
  const acceptedInvites = invites.filter(i => i.status === 'accepted')
  const expiredOrRevoked = invites.filter(i => i.status === 'expired' || i.status === 'revoked')

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/student-invite/${token}`
    navigator.clipboard.writeText(url)
    setCopiedToken(token)
    toast.success('Invite link copied')
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const handleResend = (id: string) => {
    resendInvite.mutate(id, {
      onSuccess: (res: { message: string }) => toast.success(res.message),
      onError: (err: Error) => toast.error(err.message || 'Failed to resend'),
    })
  }

  const handleRevoke = (id: string) => {
    revokeInvite.mutate(id, {
      onSuccess: () => toast.success('Invite revoked'),
      onError: (err: Error) => toast.error(err.message || 'Failed to revoke'),
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning" size="sm">Pending</Badge>
      case 'accepted': return <Badge variant="success" size="sm">Accepted</Badge>
      case 'expired': return <Badge variant="danger" size="sm">Expired</Badge>
      case 'revoked': return <Badge variant="default" size="sm">Revoked</Badge>
      default: return <Badge variant="default" size="sm">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary-500" /> Student Invites
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowBulkModal(true)}>
            <Upload className="w-3.5 h-3.5 mr-1" /> Bulk Invite
          </Button>
          <Button size="sm" onClick={() => setShowInviteModal(true)}>
            <Send className="w-3.5 h-3.5 mr-1" /> Invite Student
          </Button>
        </div>
      </div>

      {invites.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Mail className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="font-semibold text-stone-900 mb-1">No invites sent yet</h3>
            <p className="text-sm text-stone-500 mb-4">Invite students to join your university on ClinicLink.</p>
            <Button onClick={() => setShowInviteModal(true)} variant="outline">
              <Send className="w-4 h-4 mr-1" /> Send First Invite
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-stone-700 mb-2">Pending ({pendingInvites.length})</h3>
              <div className="space-y-2">
                {pendingInvites.map(invite => (
                  <div key={invite.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">
                        {invite.email || 'Open invite link'}
                      </p>
                      <div className="flex flex-wrap gap-x-3 text-xs text-stone-500 mt-0.5">
                        {invite.program_name && <span>{invite.program_name}</span>}
                        <span>Expires {new Date(invite.expires_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => copyLink(invite.token)}
                        className="p-1.5 text-stone-400 hover:text-primary-500 transition-colors rounded-lg hover:bg-white"
                        title="Copy invite link"
                      >
                        {copiedToken === invite.token ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Link className="w-3.5 h-3.5" />}
                      </button>
                      {invite.email && (
                        <button
                          onClick={() => handleResend(invite.id)}
                          className="p-1.5 text-stone-400 hover:text-primary-500 transition-colors rounded-lg hover:bg-white"
                          title="Resend email"
                          disabled={resendInvite.isPending}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${resendInvite.isPending ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                      <button
                        onClick={() => handleRevoke(invite.id)}
                        className="p-1.5 text-stone-400 hover:text-red-500 transition-colors rounded-lg hover:bg-white"
                        title="Revoke invite"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accepted Invites */}
          {acceptedInvites.length > 0 && (
            <div className={pendingInvites.length > 0 ? 'pt-4 border-t border-stone-100' : ''}>
              <h3 className="text-sm font-semibold text-stone-700 mb-2">Accepted ({acceptedInvites.length})</h3>
              <div className="space-y-2">
                {acceptedInvites.map(invite => (
                  <div key={invite.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">
                        {invite.accepted_by?.name || invite.email || 'Student'}
                      </p>
                      <p className="text-xs text-stone-500">
                        {invite.accepted_by?.email}{invite.program_name ? ` · ${invite.program_name}` : ''}
                      </p>
                    </div>
                    {getStatusBadge(invite.status)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expired/Revoked */}
          {expiredOrRevoked.length > 0 && (
            <div className={(pendingInvites.length > 0 || acceptedInvites.length > 0) ? 'pt-4 border-t border-stone-100 mt-4' : ''}>
              <h3 className="text-sm font-semibold text-stone-500 mb-2">Expired / Revoked ({expiredOrRevoked.length})</h3>
              <div className="space-y-1">
                {expiredOrRevoked.map(invite => (
                  <div key={invite.id} className="flex items-center gap-3 px-3 py-2 text-stone-400">
                    <p className="text-sm truncate flex-1">{invite.email || 'Open invite'}</p>
                    {getStatusBadge(invite.status)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
            {invites.length} invite{invites.length !== 1 ? 's' : ''} total
          </div>
        </Card>
      )}

      {/* Single Invite Modal */}
      {showInviteModal && (
        <InviteStudentModal
          programs={programs}
          onClose={() => setShowInviteModal(false)}
          createInvite={createInvite}
        />
      )}

      {/* Bulk Invite Modal */}
      {showBulkModal && (
        <BulkInviteStudentsModal
          programs={programs}
          onClose={() => setShowBulkModal(false)}
          bulkCreate={bulkCreate}
        />
      )}
    </div>
  )
}

// ──────────────────────────────────────────
// Single Student Invite Modal
// ──────────────────────────────────────────
function InviteStudentModal({ programs, onClose, createInvite }: {
  programs: ApiProgram[]
  onClose: () => void
  createInvite: ReturnType<typeof useCreateStudentInvite>
}) {
  const [email, setEmail] = useState('')
  const [programId, setProgramId] = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<{ url: string; email_sent: boolean } | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)

  const handleSubmit = () => {
    createInvite.mutate(
      {
        email: email.trim() || undefined,
        program_id: programId || undefined,
        message: message.trim() || undefined,
      },
      {
        onSuccess: (res: { invite: { url: string; email: string | null; email_sent: boolean } }) => {
          setResult({ url: res.invite.url, email_sent: res.invite.email_sent })
          if (res.invite.email_sent) {
            toast.success(`Invite sent to ${res.invite.email}`)
          } else if (res.invite.email) {
            toast.warning('Invite created but email failed to send. Share the link manually.')
          } else {
            toast.success('Open invite link created!')
          }
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to create invite'),
      }
    )
  }

  const copyUrl = () => {
    if (result?.url) {
      navigator.clipboard.writeText(result.url)
      setCopiedUrl(true)
      toast.success('Link copied')
      setTimeout(() => setCopiedUrl(false), 2000)
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Invite Student" size="md">
      {result ? (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-semibold text-stone-900">Invite Created!</h3>
            <p className="text-sm text-stone-500 mt-1">
              {result.email_sent ? 'Email sent successfully.' : 'Share the link below with the student.'}
            </p>
          </div>
          <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl">
            <input
              type="text"
              readOnly
              value={result.url}
              className="flex-1 text-xs font-mono bg-transparent text-stone-700 border-none outline-none"
            />
            <button onClick={copyUrl} className="text-primary-500 hover:text-primary-600 shrink-0">
              {copiedUrl ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Student Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="student@example.edu"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-stone-400 mt-1">Leave blank to create a shareable open invite link.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Program (optional)</label>
            <select
              value={programId}
              onChange={e => setProgramId(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">-- No program assigned --</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.degree_type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Personal Message (optional)</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Welcome to our program! We're excited to have you."
              rows={3}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={createInvite.isPending}>
              <Send className="w-4 h-4 mr-1" /> {email.trim() ? 'Send Invite' : 'Create Link'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ──────────────────────────────────────────
// Bulk Student Invite Modal
// ──────────────────────────────────────────
function BulkInviteStudentsModal({ programs, onClose, bulkCreate }: {
  programs: ApiProgram[]
  onClose: () => void
  bulkCreate: ReturnType<typeof useBulkCreateStudentInvites>
}) {
  const [emailsText, setEmailsText] = useState('')
  const [programId, setProgramId] = useState('')
  const [message, setMessage] = useState('')
  const [results, setResults] = useState<{ sent: number; skipped: number; failed: number } | null>(null)

  const extractEmails = (text: string): string[] => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    return [...new Set(text.match(emailRegex) || [])]
  }

  const parsedEmails = extractEmails(emailsText)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setEmailsText((prev: string) => prev ? `${prev}\n${text}` : text)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleSubmit = () => {
    if (parsedEmails.length === 0) {
      toast.error('No valid email addresses found.')
      return
    }
    bulkCreate.mutate(
      {
        emails: parsedEmails,
        program_id: programId || undefined,
        message: message.trim() || undefined,
      },
      {
        onSuccess: (res: { message: string; summary: { sent: number; skipped: number; failed: number } }) => {
          setResults(res.summary)
          toast.success(res.message)
        },
        onError: (err: Error) => toast.error(err.message || 'Bulk invite failed'),
      }
    )
  }

  return (
    <Modal isOpen onClose={onClose} title="Bulk Invite Students" size="md">
      {results ? (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-semibold text-stone-900">Bulk Invite Complete</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-lg font-bold text-green-600">{results.sent}</p>
              <p className="text-xs text-stone-500">Sent</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-xl">
              <p className="text-lg font-bold text-amber-600">{results.skipped}</p>
              <p className="text-xs text-stone-500">Skipped</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl">
              <p className="text-lg font-bold text-red-600">{results.failed}</p>
              <p className="text-xs text-stone-500">Failed</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Student Emails
              {parsedEmails.length > 0 && (
                <span className="ml-2 text-xs font-normal text-primary-500">{parsedEmails.length} email{parsedEmails.length !== 1 ? 's' : ''} found</span>
              )}
            </label>
            <textarea
              value={emailsText}
              onChange={e => setEmailsText(e.target.value)}
              placeholder="Paste emails here (one per line, comma-separated, or any text containing emails)..."
              rows={5}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
            <div className="flex items-center gap-2 mt-1.5">
              <label className="cursor-pointer text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1">
                <Upload className="w-3 h-3" /> Upload CSV
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
              <span className="text-xs text-stone-400">or paste emails above</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Program (optional)</label>
            <select
              value={programId}
              onChange={e => setProgramId(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">-- No program assigned --</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.degree_type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Message (optional)</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Welcome to our program!"
              rows={2}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={bulkCreate.isPending} disabled={parsedEmails.length === 0}>
              <Send className="w-4 h-4 mr-1" /> Send {parsedEmails.length} Invite{parsedEmails.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}
    </Modal>
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
