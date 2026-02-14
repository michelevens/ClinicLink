import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.tsx'
import {
  useCeCertificates, useCePolicy, useUpsertCePolicy,
  useApproveCeCertificate, useRejectCeCertificate,
  useRevokeCeCertificate, useCeAuditTrail,
} from '../hooks/useApi.ts'
import { ceCertificatesApi, type ApiCeCertificate, type ApiCeAuditEvent } from '../services/api.ts'
import { toast } from 'sonner'
import {
  BadgeCheck, Download, CheckCircle, XCircle, Clock, AlertTriangle,
  Award, Building2, Calendar, FileText, Settings2, Save,
  ChevronDown, ChevronUp, Shield, History, Ban, Eye, Hash,
  CalendarRange, User,
} from 'lucide-react'

export function CeCredits() {
  const { user } = useAuth()

  if (user?.role === 'preceptor') return <PreceptorCeView />
  if (user?.role === 'coordinator') return <CoordinatorCeView />
  if (user?.role === 'admin') return <AdminCeView />

  return null
}

// ─── Preceptor View ──────────────────────────────────────────────

function PreceptorCeView() {
  const { data, isLoading } = useCeCertificates()
  const certificates = data?.ce_certificates || []

  const totalHours = certificates
    .filter(c => c.status === 'issued')
    .reduce((sum, c) => sum + Number(c.contact_hours), 0)

  const pendingCount = certificates.filter(c => c.status === 'pending').length
  const revokedCount = certificates.filter(c => c.status === 'revoked').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">My CE Credits</h1>
        <p className="text-stone-500 mt-1">Continuing education credits earned through precepting</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{totalHours.toFixed(1)}</p>
              <p className="text-xs text-stone-500">Total CE Hours</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
              <BadgeCheck className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{certificates.filter(c => c.status === 'issued').length}</p>
              <p className="text-xs text-stone-500">Issued Certificates</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{pendingCount}</p>
              <p className="text-xs text-stone-500">Pending Approval</p>
            </div>
          </div>
        </div>
        {revokedCount > 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{revokedCount}</p>
                <p className="text-xs text-stone-500">Revoked</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Certificates List */}
      <div className="bg-white rounded-xl border border-stone-200">
        <div className="p-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">CE Certificates</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-stone-400">Loading...</div>
        ) : certificates.length === 0 ? (
          <div className="p-8 text-center text-stone-400">
            <BadgeCheck className="w-12 h-12 mx-auto mb-3 text-stone-300" />
            <p>No CE certificates yet</p>
            <p className="text-sm mt-1">CE credits are automatically awarded when placements are completed at participating universities.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {certificates.map(cert => (
              <CeCertRow key={cert.id} cert={cert} showActions={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Coordinator View ────────────────────────────────────────────

function CoordinatorCeView() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'approvals' | 'policy' | 'audit'>('approvals')

  const universityId = user?.universityId || null
  const { data: policyData, isLoading: policyLoading } = useCePolicy(universityId)
  const ceNotConfigured = !policyLoading && universityId && (!policyData?.policy || !policyData.policy.offers_ce)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">CE Credit Management</h1>
        <p className="text-stone-500 mt-1">Manage continuing education credits, policies, and audit trails</p>
      </div>

      {/* CE Not Configured Banner */}
      {ceNotConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-800">CE Credits Not Configured</h3>
            <p className="text-sm text-amber-700 mt-0.5">
              Your university has not enabled CE credits. Preceptors supervising your students won't receive CE certificates until you configure a CE policy.
            </p>
            <button
              onClick={() => setTab('policy')}
              className="mt-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5 inline mr-1.5" />
              Configure CE Policy
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('approvals')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'approvals' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-1.5" />
          Approvals
        </button>
        <button
          onClick={() => setTab('policy')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'policy' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Settings2 className="w-4 h-4 inline mr-1.5" />
          CE Policy
        </button>
        <button
          onClick={() => setTab('audit')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'audit' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-1.5" />
          Audit &amp; Compliance
        </button>
      </div>

      {tab === 'approvals' && <CeApprovalPanel universityId={universityId} />}
      {tab === 'policy' && universityId && <CePolicyEditor universityId={universityId} />}
      {tab === 'policy' && !universityId && (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-400">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-stone-300" />
          <p>No university affiliation found. Please update your profile.</p>
        </div>
      )}
      {tab === 'audit' && <CeAuditPanel universityId={universityId} />}
    </div>
  )
}

// ─── Admin View ──────────────────────────────────────────────────

function AdminCeView() {
  const [tab, setTab] = useState<'approvals' | 'audit'>('approvals')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">CE Credit Administration</h1>
        <p className="text-stone-500 mt-1">View all CE certificates and audit trails across the platform</p>
      </div>

      <div className="flex gap-1 bg-stone-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('approvals')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'approvals' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-1.5" />
          All Certificates
        </button>
        <button
          onClick={() => setTab('audit')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'audit' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-1.5" />
          Audit &amp; Compliance
        </button>
      </div>

      {tab === 'approvals' && <CeApprovalPanel universityId={null} />}
      {tab === 'audit' && <CeAuditPanel universityId={null} />}
    </div>
  )
}

// ─── Audit Panel (shows all certs with expandable audit trails) ─

function CeAuditPanel({ universityId }: { universityId: string | null }) {
  const { data, isLoading } = useCeCertificates(universityId ? { university_id: universityId } : undefined)
  const certificates = data?.ce_certificates || []

  if (isLoading) return <div className="p-8 text-center text-stone-400">Loading...</div>

  if (certificates.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-400">
        <Shield className="w-12 h-12 mx-auto mb-3 text-stone-300" />
        <p>No CE certificates to audit</p>
        <p className="text-sm mt-1">Audit trails will appear here once CE certificates are created.</p>
      </div>
    )
  }

  const summary = {
    total: certificates.length,
    issued: certificates.filter(c => c.status === 'issued').length,
    pending: certificates.filter(c => c.status === 'pending').length,
    revoked: certificates.filter(c => c.status === 'revoked').length,
    rejected: certificates.filter(c => c.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total" value={summary.total} color="stone" />
        <StatCard label="Issued" value={summary.issued} color="emerald" />
        <StatCard label="Pending" value={summary.pending} color="amber" />
        <StatCard label="Revoked" value={summary.revoked} color="red" />
        <StatCard label="Rejected" value={summary.rejected} color="stone" />
      </div>

      {/* Immutability Notice */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-sky-800">Immutable Audit Trail</h3>
          <p className="text-sm text-sky-700 mt-0.5">
            All CE audit events are cryptographically immutable &mdash; they cannot be edited or deleted once recorded.
            Every approval, rejection, revocation, download, and policy change is permanently logged for accreditation compliance.
          </p>
        </div>
      </div>

      {/* Certificates with audit trail expansion */}
      <div className="bg-white rounded-xl border border-stone-200">
        <div className="p-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900 flex items-center gap-2">
            <History className="w-5 h-5 text-stone-400" />
            Certificate Audit Trails
          </h2>
        </div>
        <div className="divide-y divide-stone-100">
          {certificates.map(cert => (
            <CeCertRow key={cert.id} cert={cert} showActions showAuditTrail />
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    stone: 'bg-stone-50 text-stone-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  }
  return (
    <div className={`rounded-lg p-3 text-center ${colorMap[color] || colorMap.stone}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5">{label}</p>
    </div>
  )
}

// ─── Shared: Approval Panel ──────────────────────────────────────

function CeApprovalPanel({ universityId }: { universityId: string | null }) {
  const { data, isLoading } = useCeCertificates(universityId ? { university_id: universityId } : undefined)
  const approveMut = useApproveCeCertificate()
  const rejectMut = useRejectCeCertificate()
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const certificates = data?.ce_certificates || []
  const pending = certificates.filter(c => c.status === 'pending')
  const processed = certificates.filter(c => c.status !== 'pending')

  const handleApprove = (id: string) => {
    approveMut.mutate(id, {
      onSuccess: () => toast.success('CE certificate approved and issued.'),
      onError: (err) => toast.error(err.message),
    })
  }

  const handleReject = () => {
    if (!rejectingId || !rejectReason.trim()) return
    rejectMut.mutate({ id: rejectingId, data: { rejection_reason: rejectReason } }, {
      onSuccess: () => {
        toast.success('CE certificate rejected.')
        setRejectingId(null)
        setRejectReason('')
      },
      onError: (err) => toast.error(err.message),
    })
  }

  if (isLoading) return <div className="p-8 text-center text-stone-400">Loading...</div>

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      {pending.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200">
          <div className="p-4 border-b border-amber-100 bg-amber-50 rounded-t-xl">
            <h2 className="font-semibold text-amber-800 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Approvals ({pending.length})
            </h2>
          </div>
          <div className="divide-y divide-stone-100">
            {pending.map(cert => (
              <div key={cert.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-stone-900">
                    {cert.preceptor?.first_name} {cert.preceptor?.last_name}
                  </p>
                  <p className="text-sm text-stone-500">
                    {cert.application?.slot?.specialty} at {cert.application?.slot?.site?.name}
                  </p>
                  <p className="text-sm text-stone-500">
                    {cert.contact_hours} contact hours &bull; {cert.university?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(cert.id)}
                    disabled={approveMut.isPending}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectingId(cert.id)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <XCircle className="w-4 h-4 inline mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setRejectingId(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Reject CE Certificate</h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full border border-stone-300 rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setRejectingId(null); setRejectReason('') }}
                className="px-4 py-2 text-sm rounded-lg text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || rejectMut.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Certificates */}
      <div className="bg-white rounded-xl border border-stone-200">
        <div className="p-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">
            {pending.length > 0 ? 'Processed Certificates' : 'All CE Certificates'}
            {processed.length > 0 && ` (${processed.length})`}
          </h2>
        </div>
        {certificates.length === 0 ? (
          <div className="p-8 text-center text-stone-400">
            <BadgeCheck className="w-12 h-12 mx-auto mb-3 text-stone-300" />
            <p>No CE certificates yet</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {(pending.length > 0 ? processed : certificates).map(cert => (
              <CeCertRow key={cert.id} cert={cert} showActions />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Shared: Certificate Row (with expandable detail + audit trail) ──

function CeCertRow({ cert, showActions = false, showAuditTrail = false }: {
  cert: ApiCeCertificate
  showActions?: boolean
  showAuditTrail?: boolean
}) {
  const { user } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [revokeReason, setRevokeReason] = useState('')
  const revokeMut = useRevokeCeCertificate()

  const canRevoke = showActions && (user?.role === 'coordinator' || user?.role === 'admin')
    && (cert.status === 'approved' || cert.status === 'issued')

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    pending: { color: 'bg-amber-100 text-amber-700', icon: <Clock className="w-3.5 h-3.5" />, label: 'Pending' },
    approved: { color: 'bg-sky-100 text-sky-700', icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Approved' },
    issued: { color: 'bg-emerald-100 text-emerald-700', icon: <BadgeCheck className="w-3.5 h-3.5" />, label: 'Issued' },
    rejected: { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3.5 h-3.5" />, label: 'Rejected' },
    revoked: { color: 'bg-red-100 text-red-800 ring-1 ring-red-300', icon: <Ban className="w-3.5 h-3.5" />, label: 'Revoked' },
  }

  const status = statusConfig[cert.status] || statusConfig.pending

  const handleRevoke = () => {
    if (!revokeReason.trim()) return
    revokeMut.mutate({ id: cert.id, data: { revocation_reason: revokeReason } }, {
      onSuccess: () => {
        toast.success('CE certificate revoked.')
        setRevoking(false)
        setRevokeReason('')
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div>
      <div
        className={`p-4 flex items-center justify-between gap-4 ${(showAuditTrail || canRevoke) ? 'cursor-pointer hover:bg-stone-50 transition-colors' : ''}`}
        onClick={() => (showAuditTrail || canRevoke) && setExpanded(!expanded)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-stone-900">
              {cert.preceptor?.first_name} {cert.preceptor?.last_name}
            </p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
              {status.icon}
              {status.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {cert.application?.slot?.site?.name || 'N/A'}
            </span>
            <span>{cert.application?.slot?.specialty || 'N/A'}</span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {cert.contact_hours} hrs
            </span>
            {cert.issued_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(cert.issued_at).toLocaleDateString()}
              </span>
            )}
          </div>
          {cert.university && (
            <p className="text-xs text-stone-400 mt-1">{cert.university.name}</p>
          )}
          {cert.rejection_reason && (
            <p className="text-xs text-red-500 mt-1">Rejected: {cert.rejection_reason}</p>
          )}
          {cert.revocation_reason && (
            <div className="mt-1 flex items-start gap-1">
              <Ban className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">
                Revoked{cert.revoked_at ? ` on ${new Date(cert.revoked_at).toLocaleDateString()}` : ''}: {cert.revocation_reason}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(cert.status === 'issued' || cert.status === 'approved') && (
            <a
              href={ceCertificatesApi.downloadUrl(cert.id)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
            >
              <Download className="w-4 h-4 inline mr-1" />
              PDF
            </a>
          )}
          {(showAuditTrail || canRevoke) && (
            expanded
              ? <ChevronUp className="w-4 h-4 text-stone-400" />
              : <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Certificate Details */}
          <div className="bg-stone-50 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Certificate Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-stone-500">Verification:</span>
                <span className="font-mono text-xs text-stone-700">{cert.verification_uuid?.slice(0, 8)}...</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-stone-500">Contact Hours:</span>
                <span className="font-medium text-stone-700">{cert.contact_hours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-stone-500">Created:</span>
                <span className="text-stone-700">{new Date(cert.created_at).toLocaleDateString()}</span>
              </div>
              {cert.issued_at && (
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-stone-500">Issued:</span>
                  <span className="text-stone-700">{new Date(cert.issued_at).toLocaleDateString()}</span>
                </div>
              )}
              {cert.approved_by_user && (
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-stone-500">Approved by:</span>
                  <span className="text-stone-700">{cert.approved_by_user.first_name} {cert.approved_by_user.last_name}</span>
                </div>
              )}
              {cert.revoked_by_user && (
                <div className="flex items-center gap-2">
                  <Ban className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-stone-500">Revoked by:</span>
                  <span className="text-red-700">{cert.revoked_by_user.first_name} {cert.revoked_by_user.last_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Revoke button */}
          {canRevoke && !revoking && (
            <button
              onClick={(e) => { e.stopPropagation(); setRevoking(true) }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <Ban className="w-4 h-4" />
              Revoke Certificate
            </button>
          )}

          {/* Revoke form */}
          {revoking && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4" onClick={e => e.stopPropagation()}>
              <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Revoke CE Certificate
              </h4>
              <p className="text-xs text-red-600 mb-3">
                This action is permanent and will be recorded in the immutable audit trail. The certificate will be invalidated and the verification page will show it as revoked.
              </p>
              <textarea
                value={revokeReason}
                onChange={e => setRevokeReason(e.target.value)}
                placeholder="Reason for revocation (required)..."
                className="w-full border border-red-300 rounded-lg p-3 text-sm min-h-[80px] focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              />
              <div className="flex justify-end gap-3 mt-3">
                <button
                  onClick={() => { setRevoking(false); setRevokeReason('') }}
                  className="px-4 py-2 text-sm rounded-lg text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevoke}
                  disabled={!revokeReason.trim() || revokeMut.isPending}
                  className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  {revokeMut.isPending ? 'Revoking...' : 'Confirm Revocation'}
                </button>
              </div>
            </div>
          )}

          {/* Audit trail */}
          {showAuditTrail && <AuditTrailSection certificateId={cert.id} />}
        </div>
      )}
    </div>
  )
}

// ─── Audit Trail Section (loaded on demand) ──────────────────────

function AuditTrailSection({ certificateId }: { certificateId: string }) {
  const { data, isLoading } = useCeAuditTrail(certificateId)
  const events = data?.audit_trail || []

  const eventLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    created: { label: 'Certificate Created', color: 'text-sky-600', icon: <FileText className="w-3.5 h-3.5" /> },
    eligibility_checked: { label: 'Eligibility Checked', color: 'text-stone-600', icon: <Eye className="w-3.5 h-3.5" /> },
    approved: { label: 'Approved', color: 'text-emerald-600', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    issued: { label: 'Issued', color: 'text-emerald-600', icon: <BadgeCheck className="w-3.5 h-3.5" /> },
    rejected: { label: 'Rejected', color: 'text-red-600', icon: <XCircle className="w-3.5 h-3.5" /> },
    revoked: { label: 'Revoked', color: 'text-red-700', icon: <Ban className="w-3.5 h-3.5" /> },
    downloaded: { label: 'PDF Downloaded', color: 'text-stone-500', icon: <Download className="w-3.5 h-3.5" /> },
    verified: { label: 'Public Verification', color: 'text-sky-500', icon: <Eye className="w-3.5 h-3.5" /> },
    policy_changed: { label: 'Policy Changed', color: 'text-amber-600', icon: <Settings2 className="w-3.5 h-3.5" /> },
  }

  if (isLoading) return <div className="p-4 text-center text-stone-400 text-sm">Loading audit trail...</div>

  if (events.length === 0) {
    return (
      <div className="bg-stone-50 rounded-lg p-4 text-center text-stone-400 text-sm">
        No audit events recorded yet.
      </div>
    )
  }

  return (
    <div className="bg-stone-50 rounded-lg p-4">
      <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <History className="w-3.5 h-3.5" />
        Audit Trail ({events.length} events)
      </h4>
      <div className="space-y-0">
        {events.map((event, i) => (
          <AuditEventRow key={event.id} event={event} config={eventLabels} isLast={i === events.length - 1} />
        ))}
      </div>
    </div>
  )
}

function AuditEventRow({ event, config, isLast }: {
  event: ApiCeAuditEvent
  config: Record<string, { label: string; color: string; icon: React.ReactNode }>
  isLast: boolean
}) {
  const ec = config[event.event_type] || { label: event.event_type, color: 'text-stone-500', icon: <History className="w-3.5 h-3.5" /> }

  return (
    <div className="flex items-start gap-3">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={`w-7 h-7 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center ${ec.color}`}>
          {ec.icon}
        </div>
        {!isLast && <div className="w-0.5 h-6 bg-stone-200" />}
      </div>
      {/* Content */}
      <div className={`flex-1 ${isLast ? '' : 'pb-2'}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium ${ec.color}`}>{ec.label}</span>
          <span className="text-xs text-stone-400">
            {new Date(event.created_at).toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-stone-500 mt-0.5">
          {event.actor
            ? <span>{event.actor.first_name} {event.actor.last_name} ({event.actor_role})</span>
            : <span>{event.actor_role}</span>
          }
          {event.ip_address && <span className="ml-2 text-stone-400">{event.ip_address}</span>}
        </div>
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <AuditMetadata metadata={event.metadata} eventType={event.event_type} />
        )}
      </div>
    </div>
  )
}

function AuditMetadata({ metadata, eventType }: { metadata: Record<string, unknown>; eventType: string }) {
  if (eventType === 'revoked' && metadata.revocation_reason) {
    return <p className="text-xs text-red-500 mt-1">Reason: {String(metadata.revocation_reason)}</p>
  }
  if (eventType === 'rejected' && metadata.rejection_reason) {
    return <p className="text-xs text-red-500 mt-1">Reason: {String(metadata.rejection_reason)}</p>
  }
  if (eventType === 'eligibility_checked') {
    return (
      <p className="text-xs text-stone-500 mt-1">
        {metadata.eligible ? 'Eligible' : 'Not eligible'}{metadata.reason ? ` — ${String(metadata.reason)}` : ''}
      </p>
    )
  }
  if (eventType === 'policy_changed') {
    return (
      <p className="text-xs text-stone-500 mt-1">
        Version {String(metadata.old_version || '?')} &rarr; {String(metadata.new_version || '?')}
      </p>
    )
  }
  return null
}

// ─── CE Policy Editor ────────────────────────────────────────────

function CePolicyEditor({ universityId }: { universityId: string }) {
  const { data, isLoading } = useCePolicy(universityId)
  const upsertMut = useUpsertCePolicy()

  const [form, setForm] = useState({
    offers_ce: false,
    accrediting_body: '',
    contact_hours_per_rotation: 0,
    max_hours_per_year: '',
    requires_final_evaluation: true,
    requires_midterm_evaluation: false,
    requires_minimum_hours: false,
    minimum_hours_required: '',
    approval_required: true,
    signer_name: '',
    signer_credentials: '',
    effective_from: '',
    effective_to: '',
  })

  const [initialized, setInitialized] = useState(false)

  // Initialize form when data loads
  if (data?.policy && !initialized) {
    const p = data.policy
    setForm({
      offers_ce: p.offers_ce,
      accrediting_body: p.accrediting_body || '',
      contact_hours_per_rotation: p.contact_hours_per_rotation,
      max_hours_per_year: p.max_hours_per_year?.toString() || '',
      requires_final_evaluation: p.requires_final_evaluation,
      requires_midterm_evaluation: p.requires_midterm_evaluation,
      requires_minimum_hours: p.requires_minimum_hours,
      minimum_hours_required: p.minimum_hours_required?.toString() || '',
      approval_required: p.approval_required,
      signer_name: p.signer_name || '',
      signer_credentials: p.signer_credentials || '',
      effective_from: p.effective_from || '',
      effective_to: p.effective_to || '',
    })
    setInitialized(true)
  } else if (data && !data.policy && !initialized) {
    setInitialized(true)
  }

  const handleSave = () => {
    upsertMut.mutate({
      universityId,
      data: {
        offers_ce: form.offers_ce,
        accrediting_body: form.accrediting_body || null,
        contact_hours_per_rotation: Number(form.contact_hours_per_rotation),
        max_hours_per_year: form.max_hours_per_year ? Number(form.max_hours_per_year) : null,
        requires_final_evaluation: form.requires_final_evaluation,
        requires_midterm_evaluation: form.requires_midterm_evaluation,
        requires_minimum_hours: form.requires_minimum_hours,
        minimum_hours_required: form.minimum_hours_required ? Number(form.minimum_hours_required) : null,
        approval_required: form.approval_required,
        signer_name: form.signer_name || null,
        signer_credentials: form.signer_credentials || null,
        effective_from: form.effective_from || null,
        effective_to: form.effective_to || null,
      },
    }, {
      onSuccess: () => toast.success('CE policy saved. Changes are recorded in the audit trail.'),
      onError: (err) => toast.error(err.message),
    })
  }

  if (isLoading) return <div className="p-8 text-center text-stone-400">Loading policy...</div>

  const policy = data?.policy

  return (
    <div className="space-y-4">
      {/* Policy Version Info */}
      {policy && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-stone-600">
            <span className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-stone-400" />
              Version {policy.version || 1}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              Last updated: {new Date(policy.updated_at).toLocaleDateString()}
            </span>
            {policy.effective_from && (
              <span className="flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-stone-400" />
                Effective: {new Date(policy.effective_from).toLocaleDateString()}
                {policy.effective_to ? ` — ${new Date(policy.effective_to).toLocaleDateString()}` : ' — Ongoing'}
              </span>
            )}
          </div>
          <span className="text-xs text-stone-400">All changes are audit-logged</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-stone-200">
        <div className="p-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-stone-400" />
            CE Policy Settings
          </h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Offers CE */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.offers_ce}
              onChange={e => setForm({ ...form, offers_ce: e.target.checked })}
              className="w-4 h-4 rounded border-stone-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-stone-700">University offers CE credits for preceptors</span>
          </label>

          {form.offers_ce && (
            <div className="space-y-5 pl-7">
              {/* Accrediting Body */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Accrediting Body</label>
                <input
                  type="text"
                  value={form.accrediting_body}
                  onChange={e => setForm({ ...form, accrediting_body: e.target.value })}
                  placeholder="e.g. ANCC, AAPA"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Contact Hours per Rotation</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={form.contact_hours_per_rotation}
                    onChange={e => setForm({ ...form, contact_hours_per_rotation: Number(e.target.value) })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Max Hours per Year (optional)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={form.max_hours_per_year}
                    onChange={e => setForm({ ...form, max_hours_per_year: e.target.value })}
                    placeholder="No limit"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Effective Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Effective From</label>
                  <input
                    type="date"
                    value={form.effective_from}
                    onChange={e => setForm({ ...form, effective_from: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Effective To (optional)</label>
                  <input
                    type="date"
                    value={form.effective_to}
                    onChange={e => setForm({ ...form, effective_to: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-stone-700">Eligibility Requirements</p>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.requires_final_evaluation}
                    onChange={e => setForm({ ...form, requires_final_evaluation: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-stone-600">Require final evaluation from preceptor</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.requires_midterm_evaluation}
                    onChange={e => setForm({ ...form, requires_midterm_evaluation: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-stone-600">Require mid-rotation evaluation</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.requires_minimum_hours}
                    onChange={e => setForm({ ...form, requires_minimum_hours: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-stone-600">Require minimum logged hours</span>
                </label>
                {form.requires_minimum_hours && (
                  <div className="pl-7">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={form.minimum_hours_required}
                      onChange={e => setForm({ ...form, minimum_hours_required: e.target.value })}
                      placeholder="Minimum hours"
                      className="w-40 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                )}
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.approval_required}
                    onChange={e => setForm({ ...form, approval_required: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-stone-600">Require coordinator approval before issuing</span>
                </label>
              </div>

              {/* Signer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Certificate Signer Name</label>
                  <input
                    type="text"
                    value={form.signer_name}
                    onChange={e => setForm({ ...form, signer_name: e.target.value })}
                    placeholder="e.g. Dr. Jane Smith"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Signer Credentials</label>
                  <input
                    type="text"
                    value={form.signer_credentials}
                    onChange={e => setForm({ ...form, signer_credentials: e.target.value })}
                    placeholder="e.g. DNP, FNP-BC, Program Director"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <p className="text-xs text-stone-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Policy changes are recorded in the immutable audit trail
            </p>
            <button
              onClick={handleSave}
              disabled={upsertMut.isPending}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {upsertMut.isPending ? 'Saving...' : 'Save Policy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
