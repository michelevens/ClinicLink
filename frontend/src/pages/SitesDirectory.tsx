import { useState, useMemo } from 'react'
import { Building2, MapPin, Phone, Globe, Star, Search, Stethoscope, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSites } from '../hooks/useApi.ts'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import type { ApiSite } from '../services/api.ts'

export function SitesDirectory() {
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [state, setState] = useState('')
  const [page, setPage] = useState(1)
  const [viewSite, setViewSite] = useState<ApiSite | null>(null)

  const { data, isLoading } = useSites({ search, specialty: specialty || undefined, state: state || undefined, page })

  const sites = data?.data || []
  const totalPages = data?.last_page || 1

  // Collect unique specialties from loaded sites for filter dropdown
  const specialties = useMemo(() => {
    const set = new Set<string>()
    sites.forEach(s => s.specialties.forEach(sp => set.add(sp)))
    return Array.from(set).sort()
  }, [sites])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Sites Directory</h1>
        <p className="text-stone-500 mt-1">Browse all clinical rotation sites</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search sites by name, city..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          />
        </div>
        {specialties.length > 0 && (
          <select value={specialty} onChange={e => { setSpecialty(e.target.value); setPage(1) }} className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none">
            <option value="">All Specialties</option>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <select value={state} onChange={e => { setState(e.target.value); setPage(1) }} className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none">
          <option value="">All States</option>
          <option value="FL">Florida</option>
          <option value="GA">Georgia</option>
          <option value="TX">Texas</option>
          <option value="NY">New York</option>
          <option value="CA">California</option>
        </select>
      </div>

      {/* Sites Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sites.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-stone-900 mb-1">No sites found</h3>
            <p className="text-stone-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sites.map(site => (
            <Card key={site.id} hover>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-stone-900 truncate">{site.name}</h3>
                      {site.is_verified && <Badge variant="success" size="sm">Verified</Badge>}
                    </div>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {site.city}, {site.state}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-stone-600 line-clamp-2">{site.description}</p>
                <div className="flex flex-wrap gap-1">
                  {site.specialties.slice(0, 3).map(s => (
                    <Badge key={s} variant="default" size="sm">{s}</Badge>
                  ))}
                  {site.specialties.length > 3 && (
                    <Badge variant="default" size="sm">+{site.specialties.length - 3}</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {site.rating}</span>
                    <span>{site.review_count} reviews</span>
                    {site.ehr_system && <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3" /> {site.ehr_system}</span>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setViewSite(site)}>Details</Button>
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

      {/* Site Detail Modal */}
      {viewSite && (
        <Modal isOpen onClose={() => setViewSite(null)} title={viewSite.name} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-500 mb-1">Address</p>
                <p className="text-sm font-semibold text-stone-900">{viewSite.address}, {viewSite.city}, {viewSite.state} {viewSite.zip}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Phone</p>
                <p className="text-sm font-semibold text-stone-900 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {viewSite.phone}</p>
              </div>
              {viewSite.website && (
                <div>
                  <p className="text-xs text-stone-500 mb-1">Website</p>
                  <p className="text-sm font-semibold text-primary-600 flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {viewSite.website}</p>
                </div>
              )}
              {viewSite.ehr_system && (
                <div>
                  <p className="text-xs text-stone-500 mb-1">EHR System</p>
                  <p className="text-sm font-semibold text-stone-900">{viewSite.ehr_system}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-stone-500 mb-1">Rating</p>
                <p className="text-sm font-semibold text-stone-900 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {viewSite.rating} ({viewSite.review_count} reviews)</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Status</p>
                <Badge variant={viewSite.is_verified ? 'success' : 'warning'}>{viewSite.is_verified ? 'Verified' : 'Pending Verification'}</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">Description</p>
              <p className="text-sm text-stone-700">{viewSite.description}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-2">Specialties</p>
              <div className="flex flex-wrap gap-1.5">
                {viewSite.specialties.map(s => <Badge key={s} variant="primary" size="sm">{s}</Badge>)}
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setViewSite(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
