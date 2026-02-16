import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Star, Search, Filter, List, ChevronRight, Building2, X, Layers } from 'lucide-react'
import { useSites } from '../hooks/useApi.ts'
import { useAuth } from '../contexts/AuthContext.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import type { ApiSite } from '../services/api.ts'
import 'leaflet/dist/leaflet.css'

// US state centroid coordinates for approximate site placement
const STATE_COORDS: Record<string, [number, number]> = {
  AL: [32.806671, -86.791130], AK: [61.370716, -152.404419], AZ: [33.729759, -111.431221],
  AR: [34.969704, -92.373123], CA: [36.116203, -119.681564], CO: [39.059811, -105.311104],
  CT: [41.597782, -72.755371], DE: [39.318523, -75.507141], FL: [27.766279, -81.686783],
  GA: [33.040619, -83.643074], HI: [21.094318, -157.498337], ID: [44.240459, -114.478828],
  IL: [40.349457, -88.986137], IN: [39.849426, -86.258278], IA: [42.011539, -93.210526],
  KS: [38.526600, -96.726486], KY: [37.668140, -84.670067], LA: [31.169546, -91.867805],
  ME: [44.693947, -69.381927], MD: [39.063946, -76.802101], MA: [42.230171, -71.530106],
  MI: [43.326618, -84.536095], MN: [45.694454, -93.900192], MS: [32.741646, -89.678696],
  MO: [38.456085, -92.288368], MT: [46.921925, -110.454353], NE: [41.125370, -98.268082],
  NV: [38.313515, -117.055374], NH: [43.452492, -71.563896], NJ: [40.298904, -74.521011],
  NM: [34.840515, -106.248482], NY: [42.165726, -74.948051], NC: [35.630066, -79.806419],
  ND: [47.528912, -99.784012], OH: [40.388783, -82.764915], OK: [35.565342, -96.928917],
  OR: [44.572021, -122.070938], PA: [40.590752, -77.209755], RI: [41.680893, -71.511780],
  SC: [33.856892, -80.945007], SD: [44.299782, -99.438828], TN: [35.747845, -86.692345],
  TX: [31.054487, -97.563461], UT: [40.150032, -111.862434], VT: [44.045876, -72.710686],
  VA: [37.769337, -78.169968], WA: [47.400902, -121.490494], WV: [38.491226, -80.954456],
  WI: [44.268543, -89.616508], WY: [42.755966, -107.302490], DC: [38.897438, -77.026817],
}

// Jitter coordinates slightly so markers in the same state don't overlap
function jitter(coord: [number, number], index: number): [number, number] {
  const angle = (index * 137.508) * (Math.PI / 180) // golden angle
  const r = 0.15 + (index % 5) * 0.08
  return [coord[0] + r * Math.cos(angle), coord[1] + r * Math.sin(angle)]
}

// Custom marker icons
function createMarkerIcon(color: string, isSelected: boolean) {
  const size = isSelected ? 32 : 24
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${size}px; height: ${size}px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: all 0.2s;
      ${isSelected ? 'transform: scale(1.2);' : ''}
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// Component to recenter map when selected site changes
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 })
  }, [map, center, zoom])
  return null
}

const SPECIALTIES = [
  'Family Medicine', 'Internal Medicine', 'Pediatrics', 'Emergency Medicine',
  'Surgery', 'OB/GYN', 'Psychiatry', 'Cardiology', 'Dermatology', 'Orthopedics',
]

export function SitesMap() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')
  const [selectedSite, setSelectedSite] = useState<ApiSite | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showList, setShowList] = useState(true)
  const listRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useSites({
    search: search || undefined,
    specialty: specialtyFilter || undefined,
    state: stateFilter || undefined,
  })
  const sites = data?.data ?? []

  // Compute coordinates for each site
  const sitesWithCoords = useMemo(() => {
    const stateGroups: Record<string, number> = {}
    return (sites as ApiSite[]).map(site => {
      const st = site.state?.toUpperCase()
      const baseCoord = STATE_COORDS[st]
      if (!baseCoord) return { site, coords: null }
      const idx = (stateGroups[st] ?? 0)
      stateGroups[st] = idx + 1
      return { site, coords: jitter(baseCoord, idx) }
    }).filter(s => s.coords !== null) as { site: ApiSite; coords: [number, number] }[]
  }, [sites])

  // Map center: selected site or US center
  const mapCenter: [number, number] = selectedSite
    ? (sitesWithCoords.find(s => s.site.id === selectedSite.id)?.coords ?? [39.8, -98.5])
    : [39.8, -98.5]
  const mapZoom = selectedSite ? 8 : 4

  // Scroll to selected site in list
  useEffect(() => {
    if (selectedSite && listRef.current) {
      const el = listRef.current.querySelector(`[data-site-id="${selectedSite.id}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedSite])

  const uniqueStates = useMemo(() => {
    const states = new Set((sites as ApiSite[]).map(s => s.state?.toUpperCase()).filter(Boolean))
    return [...states].sort()
  }, [sites])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Sites Map</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {sitesWithCoords.length} clinical rotation sites
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search sites..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 w-48"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl border transition-all ${showFilters ? 'bg-primary-50 border-primary-200 text-primary-600' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}
            title="Filters"
          >
            <Filter className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowList(!showList)}
            className={`p-2 rounded-xl border transition-all ${showList ? 'bg-primary-50 border-primary-200 text-primary-600' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}
            title="Toggle list"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-3 bg-white border border-stone-200 rounded-xl">
          <select
            value={stateFilter}
            onChange={e => setStateFilter(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All States</option>
            {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={specialtyFilter}
            onChange={e => setSpecialtyFilter(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All Specialties</option>
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {(stateFilter || specialtyFilter) && (
            <button
              onClick={() => { setStateFilter(''); setSpecialtyFilter('') }}
              className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      )}

      {/* Map + List layout */}
      <div className="flex gap-4" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Map */}
        <div className={`${showList ? 'flex-1' : 'w-full'} rounded-2xl overflow-hidden border border-stone-200 shadow-sm relative`}>
          {isLoading ? (
            <div className="w-full h-full bg-stone-100 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Layers className="w-8 h-8 text-stone-300 animate-pulse" />
                <p className="text-sm text-stone-400">Loading map...</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={[39.8, -98.5]}
              zoom={4}
              style={{ width: '100%', height: '100%' }}
              scrollWheelZoom
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapUpdater center={mapCenter} zoom={mapZoom} />

              {sitesWithCoords.map(({ site, coords }) => (
                <Marker
                  key={site.id}
                  position={coords}
                  icon={createMarkerIcon(
                    site.is_verified ? '#3b82f6' : '#a8a29e',
                    selectedSite?.id === site.id
                  )}
                  eventHandlers={{
                    click: () => setSelectedSite(site),
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <div className="flex items-start gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-stone-900 text-sm">{site.name}</p>
                          <p className="text-xs text-stone-500">{site.city}, {site.state}</p>
                        </div>
                      </div>
                      {site.specialties?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {site.specialties.slice(0, 3).map(s => (
                            <span key={s} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full">{s}</span>
                          ))}
                          {site.specialties.length > 3 && (
                            <span className="text-[10px] text-stone-400">+{site.specialties.length - 3}</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        {site.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-medium">{site.rating}</span>
                          </div>
                        )}
                        {(user?.role === 'coordinator' || user?.role === 'admin') && (
                          <button
                            onClick={() => navigate(`/sites/${site.id}`)}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-0.5"
                          >
                            View <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl border border-stone-200 px-3 py-2 z-[1000]">
            <div className="flex items-center gap-4 text-xs text-stone-600">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />
                Verified
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-stone-400 border-2 border-white shadow" />
                Unverified
              </div>
            </div>
          </div>
        </div>

        {/* Site List Panel */}
        {showList && (
          <div className="w-80 shrink-0 bg-white border border-stone-200 rounded-2xl flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                Sites ({sitesWithCoords.length})
              </p>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto divide-y divide-stone-50">
              {sitesWithCoords.length === 0 && !isLoading && (
                <div className="p-8 text-center">
                  <MapPin className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm text-stone-400">No sites found</p>
                </div>
              )}

              {sitesWithCoords.map(({ site }) => (
                <button
                  key={site.id}
                  data-site-id={site.id}
                  onClick={() => setSelectedSite(selectedSite?.id === site.id ? null : site)}
                  className={`w-full text-left px-4 py-3 transition-all hover:bg-stone-50 ${
                    selectedSite?.id === site.id ? 'bg-primary-50 border-l-2 border-primary-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      site.is_verified ? 'bg-blue-50' : 'bg-stone-100'
                    }`}>
                      <Building2 className={`w-4 h-4 ${site.is_verified ? 'text-blue-500' : 'text-stone-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{site.name}</p>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {site.city}, {site.state}
                      </p>
                      {site.specialties?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {site.specialties.slice(0, 2).map(s => (
                            <Badge key={s} variant="default" size="sm">{s}</Badge>
                          ))}
                          {site.specialties.length > 2 && (
                            <span className="text-[10px] text-stone-400 self-center">+{site.specialties.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {site.rating > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-medium text-stone-700">{site.rating}</span>
                        </div>
                      )}
                      {site.is_verified && (
                        <Badge variant="primary" size="sm">Verified</Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected site detail */}
            {selectedSite && (
              <div className="border-t border-stone-200 p-4 bg-stone-50/50">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-stone-900">{selectedSite.name}</h3>
                  <button onClick={() => setSelectedSite(null)} className="p-1 rounded-lg text-stone-400 hover:text-stone-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-stone-500 mb-1">{selectedSite.address}</p>
                <p className="text-xs text-stone-500 mb-3">{selectedSite.city}, {selectedSite.state} {selectedSite.zip}</p>

                {selectedSite.phone && (
                  <p className="text-xs text-stone-600 mb-1">{selectedSite.phone}</p>
                )}

                {selectedSite.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {selectedSite.specialties.map(s => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                )}

                {(user?.role === 'coordinator' || user?.role === 'admin') && (
                  <button
                    onClick={() => navigate(`/sites/${selectedSite.id}`)}
                    className="w-full text-center text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 py-2 rounded-lg transition-all"
                  >
                    View Site Details
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
