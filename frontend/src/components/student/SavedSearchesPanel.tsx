import { useState } from 'react'
import { Search, Bell, BellOff, Trash2, Loader2, X } from 'lucide-react'
import { Button } from '../ui/Button.tsx'
import { useSavedSearches, useDeleteSavedSearch, useUpdateSavedSearch } from '../../hooks/useApi.ts'
import type { ApiSavedSearch } from '../../services/api.ts'

interface Props {
  onClose: () => void
  onLoadSearch: (filters: ApiSavedSearch['filters']) => void
}

export function SavedSearchesPanel({ onClose, onLoadSearch }: Props) {
  const { data: searches, isLoading } = useSavedSearches()
  const deleteMutation = useDeleteSavedSearch()
  const updateMutation = useUpdateSavedSearch()

  const toggleAlerts = (search: ApiSavedSearch) => {
    updateMutation.mutate({ id: search.id, data: { alerts_enabled: !search.alerts_enabled } })
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-stone-200 w-full max-w-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
        <h3 className="font-semibold text-stone-900 text-sm">Saved Searches</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
          </div>
        ) : !searches || searches.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Search className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="text-sm text-stone-500">No saved searches yet</p>
            <p className="text-xs text-stone-400 mt-1">Use "Save Search" to save your current filters</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {searches.map((search: ApiSavedSearch) => (
              <div key={search.id} className="px-4 py-3 hover:bg-stone-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => { onLoadSearch(search.filters); onClose() }}
                    className="flex-1 text-left"
                  >
                    <p className="text-sm font-medium text-stone-900">{search.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {search.filters.search && (
                        <span className="text-xs bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">"{search.filters.search}"</span>
                      )}
                      {search.filters.specialty && (
                        <span className="text-xs bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded">{search.filters.specialty}</span>
                      )}
                      {search.filters.cost_type && (
                        <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{search.filters.cost_type}</span>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleAlerts(search)}
                      className={`p-1.5 rounded-lg transition-colors ${search.alerts_enabled ? 'text-primary-600 bg-primary-50' : 'text-stone-400 hover:bg-stone-100'}`}
                      title={search.alerts_enabled ? 'Alerts on' : 'Alerts off'}
                    >
                      {search.alerts_enabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(search.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
