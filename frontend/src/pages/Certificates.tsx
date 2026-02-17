import { useState, useMemo } from 'react'
import { Award, Search, Plus, Eye, XCircle, CheckCircle, Clock, User, MapPin, Calendar, Hash, Star, AlertTriangle, Download } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.tsx'
import { useCertificates, useCreateCertificate, useApplications, useCertificateEligibility, useRevokeCertificate } from '../hooks/useApi.ts'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import type { ApiCertificate, ApiApplication } from '../services/api.ts'
import { certificatesApi } from '../services/api.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'

export function Certificates() {
  usePageTitle('Certificates')
  const { user } = useAuth()
  const isStudent = user?.role === 'student'
  const isPreceptor = user?.role === 'preceptor' || user?.role === 'site_manager'
  const isAdmin = user?.role === 'admin' || user?.role === 'coordinator'

  const { data: certData, isLoading: certsLoading } = useCertificates()
  const certificates = certData?.certificates || []

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewCert, setViewCert] = useState<ApiCertificate | null>(null)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [showRevokeModal, setShowRevokeModal] = useState<ApiCertificate | null>(null)

  const filtered = useMemo(() => {
    return certificates.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          c.title.toLowerCase().includes(q) ||
          c.certificate_number.toLowerCase().includes(q) ||
          (c.student?.first_name + ' ' + c.student?.last_name).toLowerCase().includes(q) ||
          c.slot?.site?.name?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [certificates, search, statusFilter])

  const stats = useMemo(() => ({
    total: certificates.length,
    issued: certificates.filter(c => c.status === 'issued').length,
    revoked: certificates.filter(c => c.status === 'revoked').length,
    totalHours: certificates.filter(c => c.status === 'issued').reduce((sum, c) => sum + (parseFloat(String(c.total_hours)) || 0), 0),
  }), [certificates])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {isStudent ? 'My Certificates' : isPreceptor ? 'Issued Certificates' : 'All Certificates'}
          </h1>
          <p className="text-stone-500 mt-1">
            {isStudent ? 'Certificates earned from completed rotations' : isPreceptor ? 'Issue and manage rotation completion certificates' : 'View all certificates across the platform'}
          </p>
        </div>
        {isPreceptor && (
          <Button onClick={() => setShowIssueModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Issue Certificate
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats.total}</p>
              <p className="text-xs text-stone-500">Total</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats.issued}</p>
              <p className="text-xs text-stone-500">Active</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{Math.round(stats.totalHours * 10) / 10}</p>
              <p className="text-xs text-stone-500">Total Hours</p>
            </div>
          </div>
        </Card>
        {stats.revoked > 0 && (
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{stats.revoked}</p>
                <p className="text-xs text-stone-500">Revoked</p>
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
            placeholder="Search certificates..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="issued">Active</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      {/* Certificate List */}
      {certsLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Award className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-stone-900 mb-1">
              {certificates.length === 0 ? 'No certificates yet' : 'No matching certificates'}
            </h3>
            <p className="text-stone-500 text-sm">
              {isStudent ? 'Complete rotations and evaluations to earn certificates.' : isPreceptor ? 'Issue certificates to students who have completed their rotations.' : 'No certificates have been issued yet.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map(cert => (
            <CertificateCard
              key={cert.id}
              certificate={cert}
              isPreceptor={isPreceptor}
              isAdmin={isAdmin}
              onView={() => setViewCert(cert)}
              onRevoke={() => setShowRevokeModal(cert)}
            />
          ))}
        </div>
      )}

      {/* View Certificate Modal */}
      {viewCert && (
        <CertificateDetailModal
          certificate={viewCert}
          onClose={() => setViewCert(null)}
        />
      )}

      {/* Issue Certificate Modal */}
      {showIssueModal && (
        <IssueCertificateModal
          onClose={() => setShowIssueModal(false)}
        />
      )}

      {/* Revoke Certificate Modal */}
      {showRevokeModal && (
        <RevokeCertificateModal
          certificate={showRevokeModal}
          onClose={() => setShowRevokeModal(null)}
        />
      )}
    </div>
  )
}

// --- Certificate Card ---
function CertificateCard({ certificate: cert, isPreceptor, isAdmin, onView, onRevoke }: {
  certificate: ApiCertificate
  isPreceptor: boolean
  isAdmin: boolean
  onView: () => void
  onRevoke: () => void
}) {
  return (
    <Card hover>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600 flex items-center justify-center shrink-0">
          <Award className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <h3 className="font-semibold text-stone-900 truncate">{cert.title}</h3>
            <Badge variant={cert.status === 'issued' ? 'success' : 'danger'} size="sm">
              {cert.status === 'issued' ? 'Active' : 'Revoked'}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
            <span className="flex items-center gap-1">
              <Hash className="w-3.5 h-3.5" />
              {cert.certificate_number}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {cert.student?.first_name} {cert.student?.last_name}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {cert.slot?.site?.name || 'Unknown Site'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(cert.issued_date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {cert.total_hours}h
            </span>
            {cert.overall_score && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5" />
                {cert.overall_score}/5.0
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="w-4 h-4 mr-1" /> View
          </Button>
          {(isPreceptor || isAdmin) && cert.status === 'issued' && (
            <Button variant="outline" size="sm" onClick={onRevoke} className="text-red-600 border-red-200 hover:bg-red-50">
              <XCircle className="w-4 h-4 mr-1" /> Revoke
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

// --- Certificate Detail Modal ---
function CertificateDetailModal({ certificate: cert, onClose }: { certificate: ApiCertificate; onClose: () => void }) {
  return (
    <Modal isOpen onClose={onClose} title="Certificate Details" size="lg">
      <div className="space-y-6">
        {/* Certificate Header */}
        <div className="text-center py-6 bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-xl border border-stone-200">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-stone-900 mb-1">{cert.title}</h3>
          <p className="text-sm text-stone-500">Certificate of Completion</p>
          <div className="mt-3">
            <Badge variant={cert.status === 'issued' ? 'success' : 'danger'}>
              {cert.status === 'issued' ? 'Active' : 'Revoked'}
            </Badge>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-stone-500 mb-1">Certificate Number</p>
            <p className="text-sm font-mono font-semibold text-stone-900">{cert.certificate_number}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-1">Issued Date</p>
            <p className="text-sm font-semibold text-stone-900">{new Date(cert.issued_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-1">Student</p>
            <p className="text-sm font-semibold text-stone-900">{cert.student?.first_name} {cert.student?.last_name}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-1">Issued By</p>
            <p className="text-sm font-semibold text-stone-900">{cert.issuer?.first_name} {cert.issuer?.last_name}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-1">Rotation Site</p>
            <p className="text-sm font-semibold text-stone-900">{cert.slot?.site?.name}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-1">Rotation</p>
            <p className="text-sm font-semibold text-stone-900">{cert.slot?.title}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-1">Total Approved Hours</p>
            <p className="text-sm font-semibold text-stone-900">{cert.total_hours} hours</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-1">Overall Score</p>
            <p className="text-sm font-semibold text-stone-900">
              {cert.overall_score ? `${cert.overall_score} / 5.0` : 'N/A'}
            </p>
          </div>
        </div>

        {cert.status === 'revoked' && (
          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="flex items-center gap-2 text-red-700 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-sm font-semibold">Certificate Revoked</p>
            </div>
            <p className="text-sm text-red-600">
              Revoked on {cert.revoked_date ? new Date(cert.revoked_date).toLocaleDateString() : 'N/A'}
              {cert.revocation_reason ? ` — ${cert.revocation_reason}` : ''}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {cert.status === 'issued' && (
            <Button
              onClick={() => window.open(certificatesApi.getPdfUrl(cert.id), '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  )
}

// --- Issue Certificate Modal ---
function IssueCertificateModal({ onClose }: { onClose: () => void }) {
  const { data: appData, isLoading: appsLoading } = useApplications()
  const acceptedApps = useMemo(() =>
    (appData?.data || []).filter((a: ApiApplication) => a.status === 'accepted'),
    [appData]
  )

  const [selectedApp, setSelectedApp] = useState<ApiApplication | null>(null)
  const [title, setTitle] = useState('')
  const createCertificate = useCreateCertificate()

  // Build unique student-slot combos
  const studentSlotOptions = useMemo(() => {
    return acceptedApps.map(app => ({
      app,
      label: `${app.student?.first_name} ${app.student?.last_name} — ${app.slot?.title || 'Rotation'}`,
    }))
  }, [acceptedApps])

  // Check eligibility when a student-slot is selected
  const { data: eligibility, isLoading: eligLoading } = useCertificateEligibility(
    selectedApp?.slot_id || '',
    selectedApp?.student_id || ''
  )

  const handleSubmit = async () => {
    if (!selectedApp || !title.trim()) return
    try {
      await createCertificate.mutateAsync({
        student_id: selectedApp.student_id,
        slot_id: selectedApp.slot_id,
        title: title.trim(),
      })
      onClose()
    } catch {
      // error handled by mutation
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Issue Certificate" size="lg">
      <div className="space-y-4">
        {appsLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : acceptedApps.length === 0 ? (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">No accepted students to issue certificates for.</p>
          </div>
        ) : (
          <>
            {/* Student-Slot Selection */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Student & Rotation *</label>
              <select
                value={selectedApp ? `${selectedApp.student_id}|${selectedApp.slot_id}` : ''}
                onChange={e => {
                  const [studentId, slotId] = e.target.value.split('|')
                  const app = acceptedApps.find(a => a.student_id === studentId && a.slot_id === slotId)
                  setSelectedApp(app || null)
                  if (app?.slot?.title) {
                    setTitle(`${app.slot.title} - Completion Certificate`)
                  }
                }}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              >
                <option value="">Select student & rotation...</option>
                {studentSlotOptions.map(({ app, label }) => (
                  <option key={`${app.student_id}|${app.slot_id}`} value={`${app.student_id}|${app.slot_id}`}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Eligibility Check */}
            {selectedApp && (
              <div className="space-y-3">
                {eligLoading ? (
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    Checking eligibility...
                  </div>
                ) : eligibility ? (
                  <div className={`p-4 rounded-xl border ${eligibility.eligible ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                    <h4 className={`text-sm font-semibold mb-2 ${eligibility.eligible ? 'text-green-700' : 'text-amber-700'}`}>
                      {eligibility.eligible ? 'Eligible for Certificate' : 'Not Yet Eligible'}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1.5">
                        {eligibility.has_application ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                        <span className="text-stone-600">Accepted application</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {eligibility.total_approved_hours > 0 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                        <span className="text-stone-600">{eligibility.total_approved_hours}h approved</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {eligibility.has_evaluation ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                        <span className="text-stone-600">Evaluation submitted</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {!eligibility.has_certificate ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                        <span className="text-stone-600">{eligibility.has_certificate ? 'Already issued' : 'No existing cert'}</span>
                      </div>
                    </div>
                    {eligibility.pending_hours > 0 && (
                      <p className="mt-2 text-xs text-amber-600">Note: {eligibility.pending_hours}h pending review</p>
                    )}
                  </div>
                ) : null}

                {/* Certificate Title */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-stone-700">Certificate Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Emergency Department NP Clinical - Completion Certificate"
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedApp || !title.trim() || !eligibility?.eligible}
                isLoading={createCertificate.isPending}
              >
                <Award className="w-4 h-4 mr-2" />
                Issue Certificate
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

// --- Revoke Certificate Modal ---
function RevokeCertificateModal({ certificate, onClose }: { certificate: ApiCertificate; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const revokeCertificate = useRevokeCertificate()

  const handleRevoke = async () => {
    if (!reason.trim()) return
    try {
      await revokeCertificate.mutateAsync({ id: certificate.id, data: { reason: reason.trim() } })
      onClose()
    } catch {
      // error handled by mutation
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Revoke Certificate" size="sm">
      <div className="space-y-4">
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-semibold">This action cannot be undone</p>
          </div>
          <p className="text-sm text-red-600">
            Revoking certificate <strong>{certificate.certificate_number}</strong> for{' '}
            <strong>{certificate.student?.first_name} {certificate.student?.last_name}</strong>.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-stone-700">Reason for Revocation *</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder="Provide the reason for revoking this certificate..."
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="danger"
            onClick={handleRevoke}
            disabled={!reason.trim()}
            isLoading={revokeCertificate.isPending}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Revoke Certificate
          </Button>
        </div>
      </div>
    </Modal>
  )
}
