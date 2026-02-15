import { Star, Users, Clock, MapPin, ShieldCheck } from 'lucide-react'
import type { PreceptorDirectoryEntry } from '../../services/api.ts'

const BADGE_LABELS: Record<string, { label: string; color: string }> = {
  mentor_bronze: { label: 'Bronze Mentor', color: 'bg-amber-100 text-amber-700' },
  mentor_silver: { label: 'Silver Mentor', color: 'bg-stone-100 text-stone-600' },
  mentor_gold: { label: 'Gold Mentor', color: 'bg-yellow-100 text-yellow-700' },
  hours_100: { label: 'Century Supervisor', color: 'bg-blue-100 text-blue-700' },
  hours_500: { label: 'Master Supervisor', color: 'bg-purple-100 text-purple-700' },
  top_rated: { label: 'Top Rated', color: 'bg-green-100 text-green-700' },
  quick_responder: { label: 'Quick Responder', color: 'bg-sky-100 text-sky-700' },
  multi_specialty: { label: 'Multi-Specialty', color: 'bg-pink-100 text-pink-700' },
}

interface Props {
  entry: PreceptorDirectoryEntry
  onClick?: () => void
}

export function PreceptorProfileCard({ entry, onClick }: Props) {
  const availColor = entry.availability_status === 'available' ? 'bg-green-500' : entry.availability_status === 'limited' ? 'bg-yellow-500' : 'bg-stone-400'
  const availLabel = entry.availability_status === 'available' ? 'Available' : entry.availability_status === 'limited' ? 'Limited' : 'Unavailable'

  return (
    <div
      onClick={onClick}
      className="bg-white border border-stone-200 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-lg shrink-0">
          {entry.first_name[0]}{entry.last_name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-stone-900 truncate">{entry.first_name} {entry.last_name}</h3>
            {entry.is_npi_verified && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded-full text-[10px] font-medium shrink-0" title="NPI Verified">
                <ShieldCheck className="w-3 h-3" /> NPI
              </span>
            )}
            <span className={`w-2.5 h-2.5 rounded-full ${availColor} shrink-0`} title={availLabel} />
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className={`w-3.5 h-3.5 ${(entry.average_rating ?? 0) >= i ? 'text-yellow-400 fill-yellow-400' : 'text-stone-300'}`} />
            ))}
            <span className="text-xs text-stone-500 ml-1">({entry.review_count})</span>
          </div>
        </div>
      </div>

      {entry.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {entry.specialties.slice(0, 3).map(s => (
            <span key={s} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">{s}</span>
          ))}
          {entry.specialties.length > 3 && (
            <span className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full text-xs">+{entry.specialties.length - 3}</span>
          )}
        </div>
      )}

      {entry.bio && (
        <p className="text-sm text-stone-600 mt-3 line-clamp-2">{entry.bio}</p>
      )}

      {entry.badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {entry.badges.slice(0, 3).map(b => {
            const badge = BADGE_LABELS[b]
            return badge ? (
              <span key={b} className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
            ) : null
          })}
        </div>
      )}

      <div className="flex items-center gap-4 mt-3 text-xs text-stone-500">
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{entry.total_students_mentored} mentored</span>
        {entry.years_experience != null && (
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{entry.years_experience}y exp</span>
        )}
      </div>
    </div>
  )
}
