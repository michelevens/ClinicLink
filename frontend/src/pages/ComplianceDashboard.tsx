import { useState, useMemo } from 'react'
import { ShieldCheck, ShieldX, Search, ChevronDown, ChevronRight, FileText, CheckCircle, XCircle, Clock, AlertTriangle, Building2, GraduationCap, Paperclip, Download } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.tsx'
import { useComplianceSite, useComplianceStudent, useComplianceOverview, useMySites, useApplications } from '../hooks/useApi.ts'
import type { ComplianceStudent } from '../services/api.ts'
import { exportsApi } from '../services/api.ts'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { usePageTitle } from '../hooks/usePageTitle.ts'

const STATUS_ICONS = {
  compliant: { icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50', label: 'Compliant' },
  in_progress: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'In Progress' },
  non_compliant: { icon: ShieldX, color: 'text-red-600', bg: 'bg-red-50', label: 'Non-Compliant' },
}

function StatusBadge({ status }: { status: ComplianceStudent['overall_status'] }) {
  const config = STATUS_ICONS[status]
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  )
}

function ProgressBar({ value, max, color = 'bg-primary-500' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 100
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-stone-500 w-8 text-right">{pct}%</span>
    </div>
  )
}

function StudentComplianceDetail({ student }: { student: ComplianceStudent }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-stone-50 rounded-xl">
      {/* Credentials */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <FileText className="w-4 h-4 text-primary-500" />
          Credentials
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-stone-500">Total</span>
            <span className="font-medium">{student.credentials.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Valid</span>
            <span className="font-medium text-green-600">{student.credentials.valid}</span>
          </div>
          {student.credentials.expired > 0 && (
            <div className="flex justify-between">
              <span className="text-stone-500">Expired</span>
              <span className="font-medium text-red-600">{student.credentials.expired}</span>
            </div>
          )}
          {student.credentials.expiring_soon > 0 && (
            <div className="flex justify-between">
              <span className="text-stone-500">Expiring Soon</span>
              <span className="font-medium text-amber-600">{student.credentials.expiring_soon}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-stone-500">With Documents</span>
            <span className="font-medium">{student.credentials.has_files}/{student.credentials.total}</span>
          </div>
        </div>
      </div>

      {/* Onboarding Tasks */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <CheckCircle className="w-4 h-4 text-secondary-500" />
          Onboarding Tasks
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-stone-500">Required</span>
            <span className="font-medium">{student.tasks.required}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Completed</span>
            <span className="font-medium text-green-600">{student.tasks.required_completed}/{student.tasks.required}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Verified</span>
            <span className="font-medium text-primary-600">{student.tasks.required_verified}/{student.tasks.required}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Files Attached</span>
            <span className="font-medium">{student.tasks.with_files}/{student.tasks.total}</span>
          </div>
        </div>
        {student.tasks.required > 0 && (
          <ProgressBar
            value={student.tasks.required_verified}
            max={student.tasks.required}
            color={student.tasks.required_verified === student.tasks.required ? 'bg-green-500' : 'bg-amber-500'}
          />
        )}
      </div>

      {/* Agreement */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <GraduationCap className="w-4 h-4 text-amber-500" />
          Affiliation Agreement
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Status</span>
            {student.agreement.status === 'active' ? (
              <Badge variant="success">Active</Badge>
            ) : student.agreement.status === 'none' ? (
              <Badge variant="danger">None</Badge>
            ) : (
              <Badge variant="warning">{student.agreement.status.replace('_', ' ')}</Badge>
            )}
          </div>
          {student.agreement.end_date && (
            <div className="flex justify-between">
              <span className="text-stone-500">Expires</span>
              <span className="font-medium">{new Date(student.agreement.end_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Site Manager View ---
function SiteManagerView() {
  const { data: sitesData } = useMySites()
  const mySites = sitesData?.sites || []
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)
  const activeSiteId = selectedSiteId || mySites[0]?.id || null

  const { data: complianceData, isLoading } = useComplianceSite(activeSiteId)
  const students = complianceData?.students || []

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return students.filter(s => {
      if (statusFilter !== 'all' && s.overall_status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return s.student_name.toLowerCase().includes(q) || s.student_email.toLowerCase().includes(q) || s.rotation.toLowerCase().includes(q)
      }
      return true
    })
  }, [students, search, statusFilter])

  const stats = useMemo(() => ({
    total: students.length,
    compliant: students.filter(s => s.overall_status === 'compliant').length,
    inProgress: students.filter(s => s.overall_status === 'in_progress').length,
    nonCompliant: students.filter(s => s.overall_status === 'non_compliant').length,
  }), [students])

  return (
    <div className="space-y-6">
      {/* Site selector */}
      {mySites.length > 1 && (
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-stone-400" />
          <select
            value={activeSiteId || ''}
            onChange={e => setSelectedSiteId(e.target.value)}
            className="border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            {mySites.map(site => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-stone-500" />
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats.total}</p>
              <p className="text-xs text-stone-500">Total Students</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.compliant}</p>
              <p className="text-xs text-stone-500">Compliant</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
              <p className="text-xs text-stone-500">In Progress</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <ShieldX className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.nonCompliant}</p>
              <p className="text-xs text-stone-500">Non-Compliant</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="compliant">Compliant</option>
            <option value="in_progress">In Progress</option>
            <option value="non_compliant">Non-Compliant</option>
          </select>
        </div>
      </Card>

      {/* Student list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 font-medium">No students found</p>
          <p className="text-sm text-stone-400 mt-1">
            {students.length === 0 ? 'No accepted students at this site yet.' : 'Try adjusting your filters.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(student => (
            <Card key={student.application_id} className="overflow-hidden">
              <button
                className="w-full p-4 flex items-center gap-3 text-left hover:bg-stone-50 transition-colors"
                onClick={() => setExpandedStudent(expandedStudent === student.application_id ? null : student.application_id)}
              >
                {expandedStudent === student.application_id ? (
                  <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-900">{student.student_name}</span>
                    <span className="text-xs text-stone-400">{student.student_email}</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{student.rotation}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {/* Quick indicators */}
                  <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500">
                    <span className="flex items-center gap-1" title="Credentials">
                      <Paperclip className="w-3 h-3" />
                      {student.credentials.valid + student.credentials.no_expiration}/{student.credentials.total}
                    </span>
                    <span className="flex items-center gap-1" title="Tasks verified">
                      <CheckCircle className="w-3 h-3" />
                      {student.tasks.required_verified}/{student.tasks.required}
                    </span>
                    {student.agreement.status === 'active' ? (
                      <span className="text-green-600" title="Agreement active">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-red-500" title={`Agreement: ${student.agreement.status}`}>
                        <XCircle className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <StatusBadge status={student.overall_status} />
                </div>
              </button>
              {expandedStudent === student.application_id && (
                <div className="border-t border-stone-100">
                  <StudentComplianceDetail student={student} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Coordinator Overview View ---
function CoordinatorView() {
  const { data, isLoading } = useComplianceOverview()
  const sites = data?.sites || []
  const [expandedSite, setExpandedSite] = useState<string | null>(null)
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  const totalStudents = sites.reduce((sum, s) => sum + s.total_students, 0)
  const totalCompliant = sites.reduce((sum, s) => sum + s.compliant_students, 0)
  const overallPct = totalStudents > 0 ? Math.round((totalCompliant / totalStudents) * 100) : 100

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-2xl font-bold text-stone-900">{sites.length}</p>
          <p className="text-xs text-stone-500">Active Sites</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-stone-900">{totalStudents}</p>
          <p className="text-xs text-stone-500">Total Students</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-green-600">{totalCompliant}</p>
          <p className="text-xs text-stone-500">Fully Compliant</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-primary-600">{overallPct}%</p>
          <p className="text-xs text-stone-500">Compliance Rate</p>
        </Card>
      </div>

      {/* Sites */}
      {sites.length === 0 ? (
        <Card className="p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 font-medium">No active placements</p>
          <p className="text-sm text-stone-400 mt-1">Students with accepted applications will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sites.map(site => (
            <Card key={site.site_id} className="overflow-hidden">
              <button
                className="w-full p-4 flex items-center gap-3 text-left hover:bg-stone-50 transition-colors"
                onClick={() => setExpandedSite(expandedSite === site.site_id ? null : site.site_id)}
              >
                {expandedSite === site.site_id ? (
                  <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                )}
                <Building2 className="w-5 h-5 text-secondary-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-stone-900">{site.site_name}</span>
                  <p className="text-xs text-stone-500">{site.site_city}, {site.site_state}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-stone-900">{site.compliant_students}/{site.total_students}</p>
                    <p className="text-xs text-stone-500">compliant</p>
                  </div>
                  <div className="w-16">
                    <ProgressBar
                      value={site.compliant_students}
                      max={site.total_students}
                      color={site.compliance_percentage === 100 ? 'bg-green-500' : site.compliance_percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}
                    />
                  </div>
                </div>
              </button>
              {expandedSite === site.site_id && (
                <div className="border-t border-stone-100 divide-y divide-stone-100">
                  {site.students.map(student => (
                    <div key={student.application_id}>
                      <button
                        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-stone-50 transition-colors"
                        onClick={() => setExpandedStudent(expandedStudent === student.application_id ? null : student.application_id)}
                      >
                        <div className="w-4" /> {/* indent */}
                        {expandedStudent === student.application_id ? (
                          <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-stone-900">{student.student_name}</span>
                          <span className="text-xs text-stone-400 ml-2">{student.rotation}</span>
                        </div>
                        <StatusBadge status={student.overall_status} />
                      </button>
                      {expandedStudent === student.application_id && (
                        <div className="px-4 pb-3">
                          <StudentComplianceDetail student={student} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Student View ---
function StudentView() {
  const { data: appsData } = useApplications()
  const applications = (appsData?.data || []).filter(a => a.status === 'accepted')
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const activeAppId = selectedAppId || applications[0]?.id || null

  const { data: complianceData, isLoading } = useComplianceStudent(activeAppId)
  const compliance = complianceData?.compliance

  if (applications.length === 0) {
    return (
      <Card className="p-12 text-center">
        <ShieldCheck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <p className="text-stone-500 font-medium">No active rotations</p>
        <p className="text-sm text-stone-400 mt-1">Once you have an accepted application, your compliance checklist will appear here.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Application selector */}
      {applications.length > 1 && (
        <select
          value={activeAppId || ''}
          onChange={e => setSelectedAppId(e.target.value)}
          className="border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        >
          {applications.map(app => (
            <option key={app.id} value={app.id}>
              {app.slot?.title || 'Rotation'} - {app.slot?.site?.name || 'Site'}
            </option>
          ))}
        </select>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : compliance ? (
        <div className="space-y-6">
          {/* Overall progress */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-stone-900">{compliance.rotation}</h3>
                <p className="text-sm text-stone-500">{compliance.site_name}</p>
              </div>
              <StatusBadge status={compliance.overall_status} />
            </div>

            {compliance.overall_status === 'non_compliant' && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl text-sm text-red-700 mb-4">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {compliance.credentials.expired > 0 && 'You have expired credentials. '}
                  {compliance.agreement.status !== 'active' && 'No active affiliation agreement between your university and this site. '}
                  Please address these issues to become compliant.
                </span>
              </div>
            )}

            {compliance.credentials.expiring_soon > 0 && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl text-sm text-amber-700 mb-4">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{compliance.credentials.expiring_soon} credential(s) expiring within 30 days. Please renew soon.</span>
              </div>
            )}
          </Card>

          <StudentComplianceDetail student={compliance} />
        </div>
      ) : null}
    </div>
  )
}

// --- Main Component ---
export function ComplianceDashboard() {
  usePageTitle('Compliance')
  const { user } = useAuth()
  const [showExportMenu, setShowExportMenu] = useState(false)

  const isSiteManager = user?.role === 'site_manager'
  const isCoordinator = user?.role === 'coordinator' || user?.role === 'professor' || user?.role === 'admin'
  const isStudent = user?.role === 'student'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Compliance Dashboard</h1>
          <p className="text-stone-500 mt-1">
            {isSiteManager && 'Track student documentation and compliance status for your site.'}
            {isCoordinator && 'Monitor compliance across all your student placements.'}
            {isStudent && 'View your documentation status for active rotations.'}
          </p>
        </div>
        {(isSiteManager || isCoordinator) && (
          <div className="relative">
            <Button variant="secondary" onClick={() => setShowExportMenu(!showExportMenu)}>
              <Download className="w-4 h-4" /> Export
            </Button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-20">
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-stone-50" onClick={() => { window.open(exportsApi.complianceCsvUrl()); setShowExportMenu(false) }}>Download CSV</button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-stone-50" onClick={() => { window.open(exportsApi.compliancePdfUrl()); setShowExportMenu(false) }}>Download PDF</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {isSiteManager && <SiteManagerView />}
      {isCoordinator && <CoordinatorView />}
      {isStudent && <StudentView />}
    </div>
  )
}
