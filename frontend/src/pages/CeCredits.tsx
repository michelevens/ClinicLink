import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.tsx'
import {
  useCeCertificates, useCePolicy, useUpsertCePolicy,
  useApproveCeCertificate, useRejectCeCertificate, useStudentProfile,
} from '../hooks/useApi.ts'
import { ceCertificatesApi, type ApiCeCertificate } from '../services/api.ts'
import { toast } from 'sonner'
import {
  BadgeCheck, Download, CheckCircle, XCircle, Clock, AlertTriangle,
  Award, Building2, Calendar, FileText, Settings2, Save,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">My CE Credits</h1>
        <p className="text-stone-500 mt-1">Continuing education credits earned through precepting</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <CeCertRow key={cert.id} cert={cert} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Coordinator View ────────────────────────────────────────────

function CoordinatorCeView() {
  const [tab, setTab] = useState<'approvals' | 'policy'>('approvals')

  // Coordinator's university comes from their student profile (via API)
  const { data: profileData } = useStudentProfile()
  const universityId = profileData?.profile?.university_id || null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">CE Credit Management</h1>
        <p className="text-stone-500 mt-1">Manage continuing education credits and policies</p>
      </div>

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
      </div>

      {tab === 'approvals' && <CeApprovalPanel universityId={universityId} />}
      {tab === 'policy' && universityId && <CePolicyEditor universityId={universityId} />}
      {tab === 'policy' && !universityId && (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-400">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-stone-300" />
          <p>No university affiliation found. Please update your profile.</p>
        </div>
      )}
    </div>
  )
}

// ─── Admin View ──────────────────────────────────────────────────

function AdminCeView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">CE Credit Administration</h1>
        <p className="text-stone-500 mt-1">View all CE certificates across the platform</p>
      </div>
      <CeApprovalPanel universityId={null} />
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
              <CeCertRow key={cert.id} cert={cert} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Shared: Certificate Row ─────────────────────────────────────

function CeCertRow({ cert }: { cert: ApiCeCertificate }) {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    pending: { color: 'bg-amber-100 text-amber-700', icon: <Clock className="w-3.5 h-3.5" />, label: 'Pending' },
    approved: { color: 'bg-sky-100 text-sky-700', icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Approved' },
    issued: { color: 'bg-emerald-100 text-emerald-700', icon: <BadgeCheck className="w-3.5 h-3.5" />, label: 'Issued' },
    rejected: { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3.5 h-3.5" />, label: 'Rejected' },
  }

  const status = statusConfig[cert.status] || statusConfig.pending

  return (
    <div className="p-4 flex items-center justify-between gap-4">
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
        <div className="flex items-center gap-3 text-sm text-stone-500">
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
          <p className="text-xs text-red-500 mt-1">Reason: {cert.rejection_reason}</p>
        )}
      </div>
      {(cert.status === 'issued' || cert.status === 'approved') && (
        <a
          href={ceCertificatesApi.downloadUrl(cert.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
        >
          <Download className="w-4 h-4 inline mr-1" />
          PDF
        </a>
      )}
    </div>
  )
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
      },
    }, {
      onSuccess: () => toast.success('CE policy saved.'),
      onError: (err) => toast.error(err.message),
    })
  }

  if (isLoading) return <div className="p-8 text-center text-stone-400">Loading policy...</div>

  return (
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

            {/* Requirements */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-stone-700">Requirements</p>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.requires_final_evaluation}
                  onChange={e => setForm({ ...form, requires_final_evaluation: e.target.checked })}
                  className="w-4 h-4 rounded border-stone-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-stone-600">Require final evaluation</span>
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
        <div className="flex justify-end pt-4 border-t border-stone-100">
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
  )
}
