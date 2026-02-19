import { useState, useEffect } from 'react'
import { usePageTitle } from '../../hooks/usePageTitle.ts'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { collaborateApi, stateRulesApi, type ApiCollaborationRequest, type ApiStateRule } from '../../services/api.ts'
import { Button } from '../../components/ui/Button.tsx'
import { toast } from 'sonner'
import {
  Plus, FileText, Clock, CheckCircle, X, Loader2, MapPin, Stethoscope, Calendar
} from 'lucide-react'

const SPECIALTIES = [
  'Family Practice', 'Internal Medicine', 'Pediatrics', 'Emergency Medicine',
  'Psychiatry', 'OB/GYN', 'Surgery', 'Cardiology', 'Neurology', 'Oncology',
  'Geriatrics', 'Urgent Care', 'Orthopedics', 'Dermatology',
]

export default function CollaborationRequests() {
  usePageTitle('My Requests')
  const { user } = useAuth()
  const [requests, setRequests] = useState<ApiCollaborationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [stateRules, setStateRules] = useState<ApiStateRule[]>([])
  const [stateRulesError, setStateRulesError] = useState(false)

  // Form state
  const [professionType, setProfessionType] = useState('np')
  const [statesRequested, setStatesRequested] = useState<string[]>([])
  const [specialty, setSpecialty] = useState('')
  const [practiceModel, setPracticeModel] = useState('telehealth')
  const [startDate, setStartDate] = useState('')
  const [preferredModel, setPreferredModel] = useState('')

  useEffect(() => {
    loadRequests()
    stateRulesApi.getAll({ supervision_required: true }).then(res => {
      setStateRules(res.data || [])
    }).catch(() => { setStateRulesError(true) })
  }, [])

  const loadRequests = () => {
    setLoading(true)
    collaborateApi.listRequests().then(res => {
      setRequests(res.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!statesRequested.length || !specialty || !startDate) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      await collaborateApi.createRequest({
        profession_type: professionType,
        states_requested: statesRequested,
        specialty,
        practice_model: practiceModel,
        expected_start_date: startDate,
        preferred_supervision_model: preferredModel || undefined,
      })
      toast.success('Request created! We\'re finding matching physicians.')
      setShowForm(false)
      resetForm()
      loadRequests()
    } catch {
      toast.error('Failed to create request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = async (id: string) => {
    try {
      await collaborateApi.closeRequest(id)
      toast.success('Request closed')
      loadRequests()
    } catch {
      toast.error('Failed to close request')
    }
  }

  const resetForm = () => {
    setProfessionType('np')
    setStatesRequested([])
    setSpecialty('')
    setPracticeModel('telehealth')
    setStartDate('')
    setPreferredModel('')
  }

  const toggleState = (s: string) => {
    setStatesRequested(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const statusColors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700',
    matched: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-stone-100 text-stone-600',
  }

  // States that require supervision
  const supervisionStates = stateRules.filter(r => r.supervision_required).map(r => r.state).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Collaboration Requests</h1>
          <p className="text-stone-500 mt-1">Create and manage your supervision requests</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="!rounded-xl">
          <Plus className="w-4 h-4" /> New Request
        </Button>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900">New Collaboration Request</h2>
              <button onClick={() => { setShowForm(false); resetForm() }} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Profession Type *</label>
                <div className="flex gap-3">
                  {['np', 'pa'].map(t => (
                    <button key={t} type="button" onClick={() => setProfessionType(t)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        professionType === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}>
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">States (supervision required) *</label>
                {stateRulesError ? (
                  <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    Could not load state rules. Please close this form, refresh the page, and try again.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                      {supervisionStates.map(s => (
                        <button key={s} type="button" onClick={() => toggleState(s)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            statesRequested.includes(s) ? 'bg-indigo-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    {statesRequested.length > 0 && (
                      <p className="text-xs text-indigo-600 mt-1">{statesRequested.length} state(s) selected</p>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Specialty *</label>
                <select value={specialty} onChange={e => setSpecialty(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none">
                  <option value="">Select specialty...</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Practice Model *</label>
                  <select value={practiceModel} onChange={e => setPracticeModel(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none">
                    <option value="telehealth">Telehealth</option>
                    <option value="in_person">In-Person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Start Date *</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Preferred Supervision Model</label>
                <select value={preferredModel} onChange={e => setPreferredModel(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none">
                  <option value="">No preference</option>
                  <option value="telehealth">Telehealth</option>
                  <option value="in_person">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm() }} className="flex-1 !rounded-xl">Cancel</Button>
                <Button type="submit" disabled={submitting} className="flex-1 !rounded-xl">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 animate-pulse">
              <div className="h-5 bg-stone-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-stone-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-semibold text-stone-700 mb-1">No Requests Yet</h3>
          <p className="text-sm text-stone-500 mb-4">Create your first collaboration request to find a supervising physician</p>
          <Button onClick={() => setShowForm(true)} className="!rounded-xl">
            <Plus className="w-4 h-4" /> Create Request
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-stone-900">{req.specialty}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[req.status] || ''}`}>
                      {req.status}
                    </span>
                    <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full uppercase">{req.profession_type}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-stone-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {req.states_requested.join(', ')}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(req.expected_start_date).toLocaleDateString()}</span>
                    <span className="capitalize">{req.practice_model.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {req.matches_count !== undefined && req.matches_count > 0 && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-medium">
                      {req.matches_count} match{req.matches_count !== 1 ? 'es' : ''}
                    </span>
                  )}
                  {req.status === 'open' && (
                    <button onClick={() => handleClose(req.id)} className="text-xs text-stone-400 hover:text-red-500 transition-colors">
                      Close
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <Clock className="w-3 h-3" /> Created {new Date(req.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
