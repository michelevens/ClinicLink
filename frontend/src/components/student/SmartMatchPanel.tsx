import { useState } from 'react'
import { Sparkles, MapPin, Calendar, DollarSign, Star, ChevronDown, ChevronUp, Settings2, Loader2, SearchX } from 'lucide-react'
import { useMatchingResults } from '../../hooks/useApi.ts'
import type { MatchingResult } from '../../services/api.ts'

function scoreColor(score: number) {
  if (score >= 80) return 'bg-green-100 text-green-700'
  if (score >= 60) return 'bg-yellow-100 text-yellow-700'
  return 'bg-stone-100 text-stone-600'
}

function MatchCard({ match }: { match: MatchingResult }) {
  const [expanded, setExpanded] = useState(false)
  const { slot, score, breakdown } = match

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${scoreColor(score)}`}>
              {Math.round(score)}% Match
            </span>
            <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">{slot.specialty}</span>
          </div>
          <h3 className="font-semibold text-stone-900 text-sm">{slot.title}</h3>
          <p className="text-xs text-stone-500 mt-0.5">{slot.site?.name}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
            {slot.site && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{slot.site.city}, {slot.site.state}</span>}
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(slot.start_date).toLocaleDateString()} - {new Date(slot.end_date).toLocaleDateString()}</span>
            {slot.cost > 0 && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${slot.cost}</span>}
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-stone-100">
          <p className="text-xs font-medium text-stone-500 mb-2">Score Breakdown</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(breakdown).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-stone-500 capitalize">{key.replace('_', ' ')}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(value / (key === 'specialty' ? 30 : key === 'location' ? 20 : key === 'cost' ? 15 : 10)) * 100}%` }} />
                  </div>
                  <span className="text-stone-700 font-medium w-5 text-right">{value}</span>
                </div>
              </div>
            ))}
          </div>
          {slot.description && <p className="text-xs text-stone-600 mt-3">{slot.description}</p>}
        </div>
      )}
    </div>
  )
}

interface Props {
  onEditPreferences?: () => void
  onClose?: () => void
}

export function SmartMatchPanel({ onEditPreferences, onClose }: Props) {
  const { data, isLoading } = useMatchingResults(20)
  const matches = data?.matches || []

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl">
      <div className="flex items-center justify-between p-4 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-stone-900">Smart Matches</h2>
          <span className="text-xs text-stone-500">({matches.length} results)</span>
        </div>
        <div className="flex items-center gap-2">
          {onEditPreferences && (
            <button onClick={onEditPreferences} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-200 rounded-lg transition-colors">
              <Settings2 className="w-3.5 h-3.5" />Preferences
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-stone-500 hover:bg-stone-200 rounded-lg transition-colors">Close</button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2 text-sm">Finding your best matches...</span>
          </div>
        )}
        {!isLoading && matches.length === 0 && (
          <div className="text-center py-12">
            <SearchX className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm text-stone-500 font-medium">No matches found</p>
            <p className="text-xs text-stone-400 mt-1">Try adjusting your preferences for better results</p>
            {onEditPreferences && (
              <button onClick={onEditPreferences} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-medium hover:bg-primary-700 transition-colors">
                Edit Preferences
              </button>
            )}
          </div>
        )}
        {matches.map(m => <MatchCard key={m.slot.id} match={m} />)}
      </div>
    </div>
  )
}
