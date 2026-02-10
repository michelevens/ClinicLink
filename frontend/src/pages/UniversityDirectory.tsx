import { useState } from 'react'
import { BookOpen, MapPin, Phone, Globe, Search, ChevronLeft, ChevronRight, GraduationCap, CheckCircle2, Clock } from 'lucide-react'
import { useUniversities } from '../hooks/useApi.ts'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import type { ApiUniversity, ApiProgram } from '../services/api.ts'

const STATES = [
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'TX', label: 'Texas' },
  { value: 'NY', label: 'New York' },
  { value: 'CA', label: 'California' },
  { value: 'IL', label: 'Illinois' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'OH', label: 'Ohio' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MI', label: 'Michigan' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'WA', label: 'Washington' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'CO', label: 'Colorado' },
  { value: 'VA', label: 'Virginia' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'IN', label: 'Indiana' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'OR', label: 'Oregon' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'MO', label: 'Missouri' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'LA', label: 'Louisiana' },
]

const DEGREE_COLORS: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'default'> = {
  BSN: 'primary',
  MSN: 'secondary',
  DNP: 'success',
  PA: 'warning',
  NP: 'primary',
  DPT: 'default',
  OTD: 'default',
  MSW: 'secondary',
  PharmD: 'danger',
  other: 'default',
}

export function UniversityDirectory() {
  const [search, setSearch] = useState('')
  const [state, setState] = useState('')
  const [page, setPage] = useState(1)
  const [viewUniversity, setViewUniversity] = useState<ApiUniversity | null>(null)

  const { data, isLoading } = useUniversities({ search: search || undefined, state: state || undefined, page })

  const universities = data?.data || []
  const totalPages = data?.last_page || 1
  const total = data?.total || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">University Directory</h1>
        <p className="text-stone-500 mt-1">Browse {total > 0 ? `${total} ` : ''}universities and their healthcare programs</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by university name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          />
        </div>
        <select
          value={state}
          onChange={e => { setState(e.target.value); setPage(1) }}
          className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
        >
          <option value="">All States</option>
          {STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* University Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : universities.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-stone-900 mb-1">No universities found</h3>
            <p className="text-stone-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {universities.map(uni => (
            <Card key={uni.id} hover>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-stone-900 truncate">{uni.name}</h3>
                      {uni.is_verified && <Badge variant="success" size="sm">Verified</Badge>}
                    </div>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {uni.city}, {uni.state}
                    </p>
                  </div>
                </div>

                {/* Programs Summary */}
                {uni.programs && uni.programs.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {uni.programs.slice(0, 4).map(p => (
                      <Badge key={p.id} variant={DEGREE_COLORS[p.degree_type] || 'default'} size="sm">{p.degree_type}</Badge>
                    ))}
                    {uni.programs.length > 4 && (
                      <Badge variant="default" size="sm">+{uni.programs.length - 4}</Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-3 text-xs text-stone-500">
                    {uni.phone && (
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {uni.phone}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> {uni.programs?.length || 0} programs
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setViewUniversity(uni)}>Details</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-stone-600">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* University Detail Modal */}
      {viewUniversity && (
        <Modal isOpen onClose={() => setViewUniversity(null)} title={viewUniversity.name} size="lg">
          <div className="space-y-5">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-500 mb-1">Address</p>
                <p className="text-sm font-semibold text-stone-900">
                  {viewUniversity.address}, {viewUniversity.city}, {viewUniversity.state} {viewUniversity.zip}
                </p>
              </div>
              {viewUniversity.phone && (
                <div>
                  <p className="text-xs text-stone-500 mb-1">Phone</p>
                  <p className="text-sm font-semibold text-stone-900 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {viewUniversity.phone}
                  </p>
                </div>
              )}
              {viewUniversity.website && (
                <div>
                  <p className="text-xs text-stone-500 mb-1">Website</p>
                  <a
                    href={viewUniversity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-primary-600 flex items-center gap-1 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" /> {viewUniversity.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div>
                <p className="text-xs text-stone-500 mb-1">Status</p>
                <Badge variant={viewUniversity.is_verified ? 'success' : 'warning'}>
                  {viewUniversity.is_verified ? 'Verified' : 'Pending Verification'}
                </Badge>
              </div>
            </div>

            {/* Programs */}
            {viewUniversity.programs && viewUniversity.programs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary-500" />
                  Programs ({viewUniversity.programs.length})
                </h3>
                <div className="space-y-2">
                  {viewUniversity.programs.map((prog: ApiProgram) => (
                    <div
                      key={prog.id}
                      className="bg-stone-50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-stone-900 text-sm truncate">{prog.name}</h4>
                          <Badge variant={DEGREE_COLORS[prog.degree_type] || 'default'} size="sm">{prog.degree_type}</Badge>
                          {!prog.is_active && <Badge variant="danger" size="sm">Inactive</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-stone-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {prog.required_hours} hours required
                          </span>
                          {prog.specialties && prog.specialties.length > 0 && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {prog.specialties.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setViewUniversity(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
