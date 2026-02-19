import { useState, useEffect } from 'react'
import { usePageTitle } from '../../hooks/usePageTitle.ts'
import { collaborateApi, type ApiPhysicianProfile } from '../../services/api.ts'
import { Search, MapPin, Stethoscope, Users, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button.tsx'

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

export default function PhysicianDirectory() {
  usePageTitle('Physician Directory')
  const [profiles, setProfiles] = useState<ApiPhysicianProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [model, setModel] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    collaborateApi.listProfiles({
      state: state || undefined,
      specialty: specialty || undefined,
      supervision_model: model || undefined,
      page,
    }).then(res => {
      setProfiles(res.data || [])
      setLastPage(res.last_page || 1)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [state, specialty, model, page])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Physician Directory</h1>
        <p className="text-stone-500 mt-1">Find supervising physicians available for collaborative practice</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <select
              value={state}
              onChange={e => { setState(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none"
            >
              <option value="">All States</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="relative flex-1 min-w-[180px]">
            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <select
              value={specialty}
              onChange={e => { setSpecialty(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none"
            >
              <option value="">All Specialties</option>
              {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <select
            value={model}
            onChange={e => { setModel(e.target.value); setPage(1) }}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none"
          >
            <option value="">All Models</option>
            <option value="telehealth">Telehealth</option>
            <option value="in_person">In-Person</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-stone-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-stone-200 rounded w-2/3" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-stone-100 rounded" />
                <div className="h-3 bg-stone-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <Search className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-semibold text-stone-700 mb-1">No Physicians Found</h3>
          <p className="text-sm text-stone-500">Try adjusting your filters or check back later</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map(profile => (
              <div key={profile.id} className="bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">Dr. {profile.first_name} {profile.last_name}</h3>
                    <p className="text-xs text-stone-500 capitalize">{profile.supervision_model.replace('_', ' ')} supervision</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{profile.licensed_states.join(', ')}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {profile.specialties.slice(0, 3).map(s => (
                      <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg">{s}</span>
                    ))}
                    {profile.specialties.length > 3 && (
                      <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-lg">+{profile.specialties.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <span className={profile.has_capacity ? 'text-emerald-600' : 'text-red-500'}>
                      {profile.active_supervisees}/{profile.max_supervisees} supervisees
                    </span>
                  </div>
                  {profile.malpractice_confirmed && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </div>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-xs text-stone-500 mt-3 line-clamp-2">{profile.bio}</p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-stone-600">Page {page} of {lastPage}</span>
              <Button size="sm" variant="outline" disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
