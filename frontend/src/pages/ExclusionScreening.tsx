import { useState } from 'react'
import { Shield, ShieldAlert, ShieldCheck, Database, RefreshCw, Users, AlertTriangle, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { useScreeningSummary, useScreenings, useBulkScreen, useImportExclusionDb } from '../hooks/useApi'
import type { ExclusionScreening as ExclusionScreeningType } from '../services/api'

export default function ExclusionScreening() {
  const [resultFilter, setResultFilter] = useState<string>('')
  const [latestOnly, setLatestOnly] = useState(true)
  const [page, setPage] = useState(1)

  const { data: summary, isLoading: summaryLoading } = useScreeningSummary()
  const { data: screeningsData, isLoading: screeningsLoading } = useScreenings({
    result: resultFilter || undefined,
    latest_only: latestOnly,
    page,
  })
  const bulkScreen = useBulkScreen()
  const importDb = useImportExclusionDb()

  const screenings = screeningsData?.data ?? []
  const totalPages = screeningsData?.last_page ?? 1

  const handleBulkScreen = async () => {
    try {
      const res = await bulkScreen.mutateAsync()
      if (res.summary.matches > 0) {
        toast.warning(res.message)
      } else {
        toast.success(res.message)
      }
    } catch {
      toast.error('Bulk screening failed')
    }
  }

  const handleImport = async () => {
    try {
      const res = await importDb.mutateAsync()
      toast.success(res.message)
    } catch {
      toast.error('Database import failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Exclusion Screening</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Screen providers against OIG LEIE and SAM.gov exclusion databases
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleImport}
            isLoading={importDb.isPending}
          >
            <Database className="w-4 h-4 mr-1" />
            Update Database
          </Button>
          <Button
            size="sm"
            onClick={handleBulkScreen}
            isLoading={bulkScreen.isPending}
          >
            <Search className="w-4 h-4 mr-1" />
            Screen All Providers
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-4 animate-pulse">
              <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded w-12 mb-2" />
              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-24" />
            </div>
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <SummaryCard
            icon={<Users className="w-5 h-5 text-primary-500" />}
            value={summary.unique_users_screened}
            label="Users Screened"
          />
          <SummaryCard
            icon={<ShieldCheck className="w-5 h-5 text-green-500" />}
            value={summary.clear_users}
            label="Clear"
          />
          <SummaryCard
            icon={<ShieldAlert className="w-5 h-5 text-red-500" />}
            value={summary.active_matches}
            label="Matches Found"
            highlight={summary.active_matches > 0}
          />
          <SummaryCard
            icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
            value={summary.unscreened_providers}
            label="Unscreened"
          />
          <SummaryCard
            icon={<Database className="w-5 h-5 text-stone-500" />}
            value={summary.database?.record_count?.toLocaleString() ?? '0'}
            label="LEIE Records"
            sublabel={summary.databases
              ? `${summary.databases.filter((d: { configured: boolean }) => d.configured).length} source(s) active`
              : summary.database?.last_import
                ? `Updated ${new Date(summary.database.last_import).toLocaleDateString()}`
                : 'Not yet imported'}
          />
        </div>
      ) : null}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Filter:</span>
        {[
          { value: '', label: 'All' },
          { value: 'clear', label: 'Clear' },
          { value: 'match_found', label: 'Matches' },
          { value: 'error', label: 'Errors' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => { setResultFilter(f.value); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              resultFilter === f.value
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                : 'text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-700/50'
            }`}
          >
            {f.label}
          </button>
        ))}
        <label className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400 ml-auto cursor-pointer">
          <input
            type="checkbox"
            checked={latestOnly}
            onChange={e => { setLatestOnly(e.target.checked); setPage(1) }}
            className="rounded border-stone-300"
          />
          Latest only
        </label>
      </div>

      {/* Screening Results Table */}
      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
        {screeningsLoading ? (
          <div className="p-8 text-center text-stone-400">Loading screenings...</div>
        ) : screenings.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <p className="text-stone-500 dark:text-stone-400 font-medium">No screening results yet</p>
            <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
              Import the OIG database and run a bulk screening to get started. SAM.gov checks run via live API.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-700/50 border-b border-stone-200 dark:border-stone-700">
                  <th className="text-left px-4 py-3 font-semibold text-stone-600 dark:text-stone-300">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-600 dark:text-stone-300">Source</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-600 dark:text-stone-300">Result</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-600 dark:text-stone-300">Match Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-600 dark:text-stone-300">Screened</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-600 dark:text-stone-300">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
                {screenings.map(s => (
                  <ScreeningRow key={s.id} screening={s} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-stone-600 dark:text-stone-400">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ icon, value, label, sublabel, highlight }: {
  icon: React.ReactNode; value: number | string; label: string; sublabel?: string; highlight?: boolean
}) {
  return (
    <div className={`bg-white dark:bg-stone-800 border rounded-xl p-4 ${
      highlight ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' : 'border-stone-200 dark:border-stone-700'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className={`text-2xl font-bold ${highlight ? 'text-red-600 dark:text-red-400' : 'text-stone-900 dark:text-stone-100'}`}>
          {value}
        </span>
      </div>
      <p className="text-xs text-stone-500 dark:text-stone-400">{label}</p>
      {sublabel && <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{sublabel}</p>}
    </div>
  )
}

function ScreeningRow({ screening }: { screening: ExclusionScreeningType }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr
        className="hover:bg-stone-50 dark:hover:bg-stone-700/30 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3">
          {screening.user ? (
            <div>
              <p className="font-medium text-stone-900 dark:text-stone-100">
                {screening.user.first_name} {screening.user.last_name}
              </p>
              <p className="text-xs text-stone-400">{screening.user.email}</p>
            </div>
          ) : (
            <span className="text-stone-400">User #{screening.user_id}</span>
          )}
        </td>
        <td className="px-4 py-3">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
            {screening.source_label}
          </span>
        </td>
        <td className="px-4 py-3">
          <ResultBadge result={screening.result} />
        </td>
        <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
          {screening.match_type ? screening.match_type.replace('_', ' ') : '—'}
        </td>
        <td className="px-4 py-3 text-stone-500 dark:text-stone-400 text-xs">
          {new Date(screening.created_at).toLocaleString()}
          {screening.screened_by && (
            <p className="text-stone-400">by {screening.screened_by.first_name} {screening.screened_by.last_name}</p>
          )}
        </td>
        <td className="px-4 py-3">
          {screening.match_details && (
            <button className="text-primary-500 hover:text-primary-700 text-xs font-medium">
              {expanded ? 'Hide' : 'View'}
            </button>
          )}
        </td>
      </tr>
      {expanded && screening.match_details && (
        <tr>
          <td colSpan={6} className="px-4 py-3 bg-red-50 dark:bg-red-900/10 border-t border-red-100 dark:border-red-900/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {Object.entries(screening.match_details).map(([key, value]) => (
                value && (
                  <div key={key}>
                    <span className="font-medium text-stone-500 dark:text-stone-400 uppercase">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <p className="text-stone-900 dark:text-stone-200 mt-0.5">{value}</p>
                  </div>
                )
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function ResultBadge({ result }: { result: string }) {
  const config = {
    clear: { icon: ShieldCheck, label: 'Clear', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    match_found: { icon: ShieldAlert, label: 'Match', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    error: { icon: AlertTriangle, label: 'Error', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  }[result] ?? { icon: Shield, label: result, bg: 'bg-stone-100', text: 'text-stone-600' }

  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}
