import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle.ts'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { supervisionAgreementsApi, type ApiSupervisionAgreement } from '../../services/api.ts'
import { Button } from '../../components/ui/Button.tsx'
import { toast } from 'sonner'
import {
  ArrowLeft, CheckCircle, Pause, XCircle, DollarSign, Calendar, Loader2, AlertCircle
} from 'lucide-react'

export default function SupervisionAgreementDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [agreement, setAgreement] = useState<ApiSupervisionAgreement | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showTerminateModal, setShowTerminateModal] = useState(false)
  const [terminationReason, setTerminationReason] = useState('')

  usePageTitle(agreement ? `Agreement #${agreement.id.slice(0, 8)}` : 'Agreement')

  useEffect(() => {
    if (id) loadAgreement()
  }, [id])

  const loadAgreement = () => {
    if (!id) return
    setLoading(true)
    supervisionAgreementsApi.get(id).then(res => {
      setAgreement(res.data)
    }).catch(() => {
      toast.error('Failed to load agreement')
      navigate('/collaborate/agreements')
    }).finally(() => setLoading(false))
  }

  const handleActivate = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      await supervisionAgreementsApi.activate(id)
      toast.success('Agreement activated! Billing will begin.')
      loadAgreement()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to activate agreement')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePause = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      await supervisionAgreementsApi.pause(id)
      toast.success('Agreement paused')
      loadAgreement()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to pause agreement')
    } finally {
      setActionLoading(false)
    }
  }

  const handleTerminate = async () => {
    if (!id || !terminationReason.trim()) {
      toast.error('Please provide a termination reason')
      return
    }
    setActionLoading(true)
    try {
      await supervisionAgreementsApi.terminate(id, terminationReason)
      toast.success('Agreement terminated')
      setShowTerminateModal(false)
      loadAgreement()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to terminate agreement')
    } finally {
      setActionLoading(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!agreement) return null

  const match = agreement.collaboration_match
  const physician = match?.physician_profile
  const request = match?.request
  const npUser = request?.user
  const physicianUser = physician?.user

  const isPhysician = user?.role === 'preceptor'
  const isNp = user?.id === npUser?.id
  const canActivate = isNp && agreement.status === 'pending_signature'
  const canPause = isPhysician && agreement.status === 'active'
  const canTerminate = (isNp || isPhysician) && !['terminated'].includes(agreement.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/collaborate/agreements')} className="!rounded-xl">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Supervision Agreement</h1>
          <p className="text-stone-500 mt-1">Agreement #{agreement.id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">Parties</h2>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-stone-400">Physician</p>
                <p className="font-medium text-stone-700">Dr. {physicianUser?.first_name} {physicianUser?.last_name}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400">Practitioner</p>
                <p className="font-medium text-stone-700">{npUser?.first_name} {npUser?.last_name} ({request?.profession_type?.toUpperCase()})</p>
              </div>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            agreement.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
            agreement.status === 'pending_signature' ? 'bg-amber-100 text-amber-700' :
            agreement.status === 'paused' ? 'bg-orange-100 text-orange-700' :
            agreement.status === 'terminated' ? 'bg-red-100 text-red-700' :
            'bg-stone-100 text-stone-600'
          }`}>
            {agreement.status.replace('_', ' ').toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-stone-100">
          <div>
            <p className="text-xs text-stone-400 mb-1">Monthly Physician Fee</p>
            <p className="text-2xl font-bold text-stone-900">{formatCurrency(agreement.monthly_fee_cents)}</p>
          </div>
          <div>
            <p className="text-xs text-stone-400 mb-1">Platform Fee ({agreement.platform_fee_percent}%)</p>
            <p className="text-2xl font-bold text-stone-900">{formatCurrency(agreement.platform_fee_cents)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {agreement.billing_anchor && (
            <div>
              <p className="text-xs text-stone-400 mb-1">Billing Day</p>
              <p className="font-medium text-stone-700">Day {agreement.billing_anchor} of month</p>
            </div>
          )}
          {agreement.activated_at && (
            <div>
              <p className="text-xs text-stone-400 mb-1">Activated</p>
              <p className="font-medium text-stone-700">{new Date(agreement.activated_at).toLocaleDateString()}</p>
            </div>
          )}
          {agreement.last_payment_status && (
            <div>
              <p className="text-xs text-stone-400 mb-1">Last Payment</p>
              <p className={`font-medium ${agreement.last_payment_status === 'paid' ? 'text-emerald-600' : 'text-red-600'}`}>
                {agreement.last_payment_status.toUpperCase()}
              </p>
            </div>
          )}
        </div>

        {agreement.termination_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Termination Reason</p>
                <p className="text-sm text-red-700 mt-1">{agreement.termination_reason}</p>
                {agreement.terminated_at && (
                  <p className="text-xs text-red-600 mt-2">Terminated on {new Date(agreement.terminated_at).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-6 border-t border-stone-100">
          {canActivate && (
            <Button onClick={handleActivate} disabled={actionLoading} className="!rounded-xl bg-emerald-600 hover:bg-emerald-700">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Activate Agreement
            </Button>
          )}
          {canPause && (
            <Button onClick={handlePause} disabled={actionLoading} variant="outline" className="!rounded-xl">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
              Pause Agreement
            </Button>
          )}
          {canTerminate && (
            <Button onClick={() => setShowTerminateModal(true)} variant="outline" className="!rounded-xl text-red-600 border-red-200 hover:bg-red-50">
              <XCircle className="w-4 h-4" />
              Terminate Agreement
            </Button>
          )}
        </div>
      </div>

      {/* Terminate Modal */}
      {showTerminateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900">Terminate Agreement</h2>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-stone-600">Please provide a reason for terminating this agreement.</p>
              <textarea
                value={terminationReason}
                onChange={e => setTerminationReason(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none"
                rows={4}
                placeholder="Reason for termination..."
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowTerminateModal(false)} className="flex-1 !rounded-xl">Cancel</Button>
                <Button onClick={handleTerminate} disabled={actionLoading || !terminationReason.trim()} className="flex-1 !rounded-xl bg-red-600 hover:bg-red-700">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Terminate'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
