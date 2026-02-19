import { useState, useEffect } from 'react'
import { usePageTitle } from '../../hooks/usePageTitle.ts'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { supervisionAgreementsApi, type ApiSupervisionAgreement } from '../../services/api.ts'
import { Button } from '../../components/ui/Button.tsx'
import { Link } from 'react-router-dom'
import {
  FileText, Circle, CheckCircle, Pause, XCircle, DollarSign, Calendar, Loader2
} from 'lucide-react'

export default function SupervisionAgreements() {
  usePageTitle('Supervision Agreements')
  const { user } = useAuth()
  const [agreements, setAgreements] = useState<ApiSupervisionAgreement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAgreements() }, [])

  const loadAgreements = () => {
    setLoading(true)
    supervisionAgreementsApi.list().then(res => {
      setAgreements(res.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    draft: { label: 'Draft', icon: <Circle className="w-3.5 h-3.5" />, color: 'bg-stone-100 text-stone-600' },
    pending_signature: { label: 'Pending Signature', icon: <Circle className="w-3.5 h-3.5" />, color: 'bg-amber-100 text-amber-700' },
    active: { label: 'Active', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'bg-emerald-100 text-emerald-700' },
    paused: { label: 'Paused', icon: <Pause className="w-3.5 h-3.5" />, color: 'bg-orange-100 text-orange-700' },
    terminated: { label: 'Terminated', icon: <XCircle className="w-3.5 h-3.5" />, color: 'bg-red-100 text-red-700' },
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
  }

  const isPhysician = user?.role === 'preceptor'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Supervision Agreements</h1>
          <p className="text-stone-500 mt-1">
            {isPhysician ? 'Manage your supervision agreements with NPs/PAs' : 'View your active supervision agreements'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-stone-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-stone-200 rounded w-1/3" />
                  <div className="h-3 bg-stone-100 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : agreements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-semibold text-stone-700 mb-1">No Agreements Yet</h3>
          <p className="text-sm text-stone-500 mb-4">
            {isPhysician
              ? 'You\'ll see your supervision agreements here once you create them from accepted matches'
              : 'Once a physician creates an agreement, you\'ll see it here'}
          </p>
          <Link to="/collaborate/matches">
            <Button className="!rounded-xl">View Matches</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {agreements.map(agreement => {
            const config = statusConfig[agreement.status] || statusConfig.draft
            const match = agreement.collaboration_match
            const physician = match?.physician_profile
            const request = match?.request
            const npUser = request?.user
            const physicianUser = physician?.user

            return (
              <Link key={agreement.id} to={`/collaborate/agreements/${agreement.id}`}>
                <div className="bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {isPhysician
                          ? `${npUser?.first_name?.[0] || ''}${npUser?.last_name?.[0] || ''}`
                          : `${physicianUser?.first_name?.[0] || ''}${physicianUser?.last_name?.[0] || ''}`}
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-900">
                          {isPhysician
                            ? `${npUser?.first_name || ''} ${npUser?.last_name || ''}`
                            : `Dr. ${physicianUser?.first_name || ''} ${physicianUser?.last_name || ''}`}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-stone-500 mt-0.5">
                          <span className="capitalize">{request?.profession_type?.toUpperCase()}</span>
                          <span>•</span>
                          <span>{request?.specialty}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${config.color}`}>
                      {config.icon} {config.label}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-stone-400" />
                      <div>
                        <p className="text-xs text-stone-400">Monthly Fee</p>
                        <p className="font-medium text-stone-700">{formatCurrency(agreement.monthly_fee_cents)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-stone-400" />
                      <div>
                        <p className="text-xs text-stone-400">Platform Fee</p>
                        <p className="font-medium text-stone-700">{agreement.platform_fee_percent}% ({formatCurrency(agreement.platform_fee_cents)})</p>
                      </div>
                    </div>
                    {agreement.activated_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        <div>
                          <p className="text-xs text-stone-400">Activated</p>
                          <p className="font-medium text-stone-700">{new Date(agreement.activated_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {agreement.last_payment_status && (
                    <div className="mt-3 pt-3 border-t border-stone-100">
                      <p className="text-xs text-stone-500">
                        Last payment: <span className={`font-medium ${agreement.last_payment_status === 'paid' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {agreement.last_payment_status}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
