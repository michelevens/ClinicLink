import { useState } from 'react'
import { BookOpen, GraduationCap, Clock, ChevronDown, ChevronRight, Search, Building2 } from 'lucide-react'
import { useSites } from '../hooks/useApi.ts'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { api } from '../services/api.ts'
import type { ApiUniversity, ApiProgram } from '../services/api.ts'
import { useQuery } from '@tanstack/react-query'

function useUniversities(params?: { search?: string }) {
  return useQuery({
    queryKey: ['universities', params],
    queryFn: () => api.get<{ data: ApiUniversity[] }>(`/universities${params?.search ? `?search=${params.search}` : ''}`),
  })
}

function useUniversityPrograms(id: string) {
  return useQuery({
    queryKey: ['university-programs', id],
    queryFn: () => api.get<{ programs: ApiProgram[] }>(`/universities/${id}/programs`),
    enabled: !!id,
  })
}

export function Programs() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useUniversities({ search: search || undefined })
  const universities = data?.data || []

  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Programs</h1>
        <p className="text-stone-500 mt-1">Universities and their clinical programs</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search universities..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
        />
      </div>

      {/* University List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : universities.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-stone-900 mb-1">No universities found</h3>
            <p className="text-stone-500 text-sm">Try adjusting your search criteria.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {universities.map(uni => (
            <UniversityCard
              key={uni.id}
              university={uni}
              isExpanded={expandedId === uni.id}
              onToggle={() => setExpandedId(expandedId === uni.id ? null : uni.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function UniversityCard({ university, isExpanded, onToggle }: {
  university: ApiUniversity
  isExpanded: boolean
  onToggle: () => void
}) {
  const { data, isLoading } = useUniversityPrograms(isExpanded ? university.id : '')

  return (
    <Card>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 text-left"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600 flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900">{university.name}</h3>
          <p className="text-sm text-stone-500">{university.city}, {university.state}</p>
        </div>
        <div className="flex items-center gap-2">
          {university.is_verified && <Badge variant="success" size="sm">Verified</Badge>}
          {isExpanded ? <ChevronDown className="w-5 h-5 text-stone-400" /> : <ChevronRight className="w-5 h-5 text-stone-400" />}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-stone-100">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (data?.programs || []).length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-4">No programs listed for this university.</p>
          ) : (
            <div className="space-y-3">
              {(data?.programs || []).map(program => (
                <div key={program.id} className="p-3 bg-stone-50 rounded-xl">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary-500 shrink-0" />
                      <h4 className="text-sm font-semibold text-stone-900">{program.name}</h4>
                    </div>
                    <Badge variant="primary" size="sm">{program.degree_type}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500 ml-6">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {program.required_hours}h required
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" /> {program.degree_type}
                    </span>
                  </div>
                  {program.specialties && program.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 ml-6">
                      {program.specialties.map(s => (
                        <Badge key={s} variant="default" size="sm">{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
