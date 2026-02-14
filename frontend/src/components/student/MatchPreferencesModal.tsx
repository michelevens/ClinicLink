import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { useMatchingPreferences, useUpdateMatchingPreferences } from '../../hooks/useApi.ts'

const SPECIALTIES = ['Family Medicine', 'Internal Medicine', 'Pediatrics', 'OB/GYN', 'Psychiatry', 'Surgery', 'Emergency Medicine', 'Cardiology', 'Dermatology', 'Neurology', 'Oncology', 'Orthopedics', 'Radiology', 'Anesthesiology', 'Geriatrics', 'Pulmonology', 'Nephrology', 'Endocrinology', 'Rheumatology', 'Other']

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

interface Props {
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

export function MatchPreferencesModal({ open, onClose, onSaved }: Props) {
  const { data } = useMatchingPreferences()
  const update = useUpdateMatchingPreferences()

  const [specialties, setSpecialties] = useState<string[]>([])
  const [states, setStates] = useState<string[]>([])
  const [cities, setCities] = useState('')
  const [costPref, setCostPref] = useState<'any' | 'free_only' | 'paid_ok'>('any')
  const [schedule, setSchedule] = useState('')
  const [minRating, setMinRating] = useState<string>('')
  const [startAfter, setStartAfter] = useState('')
  const [startBefore, setStartBefore] = useState('')
  const [excludeApplied, setExcludeApplied] = useState(true)

  useEffect(() => {
    if (data?.preferences) {
      const p = data.preferences
      setSpecialties(p.preferred_specialties || [])
      setStates(p.preferred_states || [])
      setCities((p.preferred_cities || []).join(', '))
      setCostPref(p.cost_preference || 'any')
      setSchedule(p.preferred_schedule || '')
      setMinRating(p.min_preceptor_rating ? String(p.min_preceptor_rating) : '')
      setStartAfter(p.preferred_start_after || '')
      setStartBefore(p.preferred_start_before || '')
      setExcludeApplied(p.exclude_applied ?? true)
    }
  }, [data])

  const handleSave = async () => {
    await update.mutateAsync({
      preferred_specialties: specialties,
      preferred_states: states,
      preferred_cities: cities.split(',').map(c => c.trim()).filter(Boolean),
      cost_preference: costPref,
      preferred_schedule: schedule || null,
      min_preceptor_rating: minRating ? parseFloat(minRating) : null,
      preferred_start_after: startAfter || null,
      preferred_start_before: startBefore || null,
      exclude_applied: excludeApplied,
    })
    onSaved?.()
    onClose()
  }

  const toggleSpecialty = (s: string) => setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  const toggleState = (s: string) => setStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-900">Matching Preferences</h2>
              <p className="text-xs text-stone-500">Set your ideal rotation criteria</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5 flex-1">
          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Preferred Specialties</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map(s => (
                <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${specialties.includes(s) ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* States */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Preferred States</label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {US_STATES.map(s => (
                <button key={s} type="button" onClick={() => toggleState(s)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${states.includes(s) ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Cities */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Preferred Cities</label>
            <input value={cities} onChange={e => setCities(e.target.value)} placeholder="e.g. New York, Chicago, Miami"
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          {/* Cost Preference */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Cost Preference</label>
            <div className="flex gap-2">
              {([['any', 'Any'], ['free_only', 'Free Only'], ['paid_ok', 'Paid OK']] as const).map(([val, label]) => (
                <button key={val} type="button" onClick={() => setCostPref(val)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${costPref === val ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Preferred Schedule</label>
            <input value={schedule} onChange={e => setSchedule(e.target.value)} placeholder="e.g. weekdays, flexible, evenings"
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          {/* Min Rating */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Minimum Preceptor Rating</label>
            <select value={minRating} onChange={e => setMinRating(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
              <option value="">Any rating</option>
              <option value="3.0">3.0+</option>
              <option value="3.5">3.5+</option>
              <option value="4.0">4.0+</option>
              <option value="4.5">4.5+</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Start After</label>
              <input type="date" value={startAfter} onChange={e => setStartAfter(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Start Before</label>
              <input type="date" value={startBefore} onChange={e => setStartBefore(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>

          {/* Exclude Applied */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={excludeApplied} onChange={e => setExcludeApplied(e.target.checked)}
              className="w-4 h-4 rounded border-stone-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-stone-700">Exclude slots I've already applied to</span>
          </label>
        </div>

        <div className="flex gap-3 p-5 border-t border-stone-100 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={update.isPending} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
            {update.isPending ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}
