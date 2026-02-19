import { useState, useEffect } from 'react'
import { usePageTitle } from '../../hooks/usePageTitle.ts'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { collaborateApi, type ApiPhysicianProfile } from '../../services/api.ts'
import { Button } from '../../components/ui/Button.tsx'
import { toast } from 'sonner'
import { Loader2, ShieldCheck, Save, MapPin } from 'lucide-react'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY',
]

const SPECIALTIES = [
  'Family Practice', 'Internal Medicine', 'Pediatrics', 'Emergency Medicine',
  'Psychiatry', 'OB/GYN', 'Surgery', 'Cardiology', 'Neurology', 'Oncology',
  'Geriatrics', 'Urgent Care', 'Orthopedics', 'Dermatology',
]

export default function PhysicianProfilePage() {
  usePageTitle('Physician Profile')
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [existingProfile, setExistingProfile] = useState<ApiPhysicianProfile | null>(null)

  // Form state
  const [licensedStates, setLicensedStates] = useState<string[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [maxSupervisees, setMaxSupervisees] = useState(5)
  const [supervisionModel, setSupervisionModel] = useState('hybrid')
  const [malpracticeConfirmed, setMalpracticeConfirmed] = useState(false)
  const [bio, setBio] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    // Try to load existing profile by listing profiles and finding own
    collaborateApi.listProfiles().then(res => {
      const own = (res.data || []).find((p: ApiPhysicianProfile) => p.user_id === user?.id)
      if (own) {
        setExistingProfile(own)
        setLicensedStates(own.licensed_states)
        setSpecialties(own.specialties)
        setMaxSupervisees(own.max_supervisees)
        setSupervisionModel(own.supervision_model)
        setMalpracticeConfirmed(own.malpractice_confirmed)
        setBio(own.bio || '')
        setIsActive(own.is_active ?? true)
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!licensedStates.length) { toast.error('Select at least one state'); return }
    if (!specialties.length) { toast.error('Select at least one specialty'); return }
    if (!malpracticeConfirmed) { toast.error('You must confirm malpractice coverage'); return }

    setSaving(true)
    try {
      if (existingProfile) {
        await collaborateApi.updateProfile(existingProfile.id, {
          licensed_states: licensedStates,
          specialties,
          max_supervisees: maxSupervisees,
          supervision_model: supervisionModel,
          malpractice_confirmed: malpracticeConfirmed,
          bio: bio || undefined,
          is_active: isActive,
        })
        toast.success('Profile updated')
      } else {
        await collaborateApi.createProfile({
          licensed_states: licensedStates,
          specialties,
          max_supervisees: maxSupervisees,
          supervision_model: supervisionModel,
          malpractice_confirmed: malpracticeConfirmed,
          bio: bio || undefined,
        })
        toast.success('Profile created! You\'re now visible in the physician directory.')
      }
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const toggleState = (s: string) => setLicensedStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  const toggleSpecialty = (s: string) => setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          {existingProfile ? 'Edit Physician Profile' : 'Create Physician Profile'}
        </h1>
        <p className="text-stone-500 mt-1">
          {existingProfile ? 'Update your supervising physician profile' : 'Set up your profile to start accepting supervisees'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
        {/* Licensed States */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />Licensed States *
          </label>
          <div className="flex flex-wrap gap-1.5">
            {US_STATES.map(s => (
              <button key={s} type="button" onClick={() => toggleState(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  licensedStates.includes(s) ? 'bg-indigo-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}>
                {s}
              </button>
            ))}
          </div>
          {licensedStates.length > 0 && (
            <p className="text-xs text-indigo-600 mt-1">{licensedStates.length} state(s) selected</p>
          )}
        </div>

        {/* Specialties */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Specialties *</label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map(s => (
              <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  specialties.includes(s) ? 'bg-purple-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">Max Supervisees</label>
            <input type="number" min={1} max={20} value={maxSupervisees} onChange={e => setMaxSupervisees(+e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">Supervision Model *</label>
            <select value={supervisionModel} onChange={e => setSupervisionModel(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none">
              <option value="telehealth">Telehealth</option>
              <option value="in_person">In-Person</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell NPs/PAs about your practice, experience, and supervision approach..."
            className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none resize-none" />
        </div>

        {/* Malpractice */}
        <label className="flex items-start gap-3 p-4 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer hover:bg-stone-100 transition-colors">
          <input type="checkbox" checked={malpracticeConfirmed} onChange={e => setMalpracticeConfirmed(e.target.checked)}
            className="mt-0.5 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500" />
          <div>
            <span className="text-sm font-medium text-stone-700 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Malpractice Coverage Confirmation *
            </span>
            <p className="text-xs text-stone-500 mt-0.5">I confirm that I maintain active malpractice/professional liability insurance coverage.</p>
          </div>
        </label>

        {existingProfile && (
          <label className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer hover:bg-stone-100 transition-colors">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)}
              className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="text-sm font-medium text-stone-700">Profile active and visible in directory</span>
          </label>
        )}

        <Button type="submit" disabled={saving} className="w-full !rounded-xl">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {existingProfile ? 'Update Profile' : 'Create Profile'}</>}
        </Button>
      </form>
    </div>
  )
}
