import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserSearch, Trophy, ChevronDown, ChevronUp } from 'lucide-react'
import { usePreceptorDirectory, usePreceptorLeaderboard } from '../hooks/useApi.ts'
import { PreceptorProfileCard } from '../components/preceptor/PreceptorProfileCard.tsx'
import { EmptyState } from '../components/ui/EmptyState.tsx'

const SPECIALTIES = ['Family Medicine', 'Internal Medicine', 'Pediatrics', 'OB/GYN', 'Psychiatry', 'Surgery', 'Emergency Medicine', 'Cardiology', 'Dermatology', 'Neurology', 'Oncology', 'Orthopedics', 'Radiology', 'Anesthesiology', 'Geriatrics', 'Other']

export function PreceptorDirectory() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [availability, setAvailability] = useState('')
  const [page, setPage] = useState(1)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const { data, isLoading } = usePreceptorDirectory({ search: search || undefined, specialty: specialty || undefined, availability: availability || undefined, page })
  const { data: leaderboard } = usePreceptorLeaderboard()

  const entries = data?.data || []
  const lastPage = data?.last_page || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <UserSearch className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-stone-900 to-stone-600 bg-clip-text text-transparent">Preceptor Directory</h1>
            <p className="text-sm text-stone-500">Find and connect with clinical preceptors</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by name..."
            className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" />
        </div>
        <select value={specialty} onChange={e => { setSpecialty(e.target.value); setPage(1) }}
          className="px-3 py-2.5 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">All Specialties</option>
          {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={availability} onChange={e => { setAvailability(e.target.value); setPage(1) }}
          className="px-3 py-2.5 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">All Availability</option>
          <option value="available">Available</option>
          <option value="limited">Limited</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      {/* Leaderboard */}
      {leaderboard?.leaderboard && leaderboard.leaderboard.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-xl">
          <button onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-stone-50 transition-colors rounded-xl">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-stone-900 text-sm">Top Preceptors</span>
            </div>
            {showLeaderboard ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </button>
          {showLeaderboard && (
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {leaderboard.leaderboard.slice(0, 6).map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                  <span className="text-lg font-bold text-stone-300 w-6">#{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs shrink-0">
                    {entry.first_name[0]}{entry.last_name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{entry.first_name} {entry.last_name}</p>
                    <p className="text-xs text-stone-500">{entry.total_students_mentored} students mentored</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white border border-stone-200 rounded-xl p-5 animate-pulse">
              <div className="flex gap-4"><div className="w-12 h-12 rounded-full bg-stone-200" /><div className="flex-1 space-y-2"><div className="h-4 bg-stone-200 rounded w-2/3" /><div className="h-3 bg-stone-100 rounded w-1/2" /></div></div>
              <div className="h-3 bg-stone-100 rounded w-full mt-4" /><div className="h-3 bg-stone-100 rounded w-3/4 mt-2" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl">
          <EmptyState
            illustration="users"
            title="No preceptors found"
            description="Try adjusting your search filters or browse all specialties."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map(entry => <PreceptorProfileCard key={entry.id} entry={entry} onClick={() => navigate(`/preceptor-directory/${entry.user_id}`)} />)}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 text-sm border border-stone-200 rounded-xl hover:bg-stone-50 disabled:opacity-40 transition-colors">Previous</button>
          <span className="text-sm text-stone-500">Page {page} of {lastPage}</span>
          <button disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-sm border border-stone-200 rounded-xl hover:bg-stone-50 disabled:opacity-40 transition-colors">Next</button>
        </div>
      )}
    </div>
  )
}
