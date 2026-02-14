import { useState } from 'react'
import { FileBarChart, Plus, Download, Trash2, Eye, X, Loader2, FileText } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.tsx'
import { useAccreditationReports, useGenerateReport, useDeleteReport } from '../hooks/useApi.ts'
import { accreditationReportsApi } from '../services/api.ts'
import type { ApiAccreditationReport } from '../services/api.ts'

const REPORT_TYPES: { value: string; label: string }[] = [
  { value: 'annual_summary', label: 'Annual Summary' },
  { value: 'program_review', label: 'Program Review' },
  { value: 'site_evaluation', label: 'Site Evaluation' },
  { value: 'student_outcomes', label: 'Student Outcomes' },
  { value: 'clinical_hours', label: 'Clinical Hours' },
]

function typeLabel(type: string) {
  return REPORT_TYPES.find(t => t.value === type)?.label || type
}

function statusBadge(status: string) {
  if (status === 'completed') return 'bg-green-100 text-green-700'
  if (status === 'generating') return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

export function AccreditationReports() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useAccreditationReports({ page })
  const reports = data?.data || []
  const lastPage = data?.last_page || 1
  const deleteReport = useDeleteReport()

  const handleDelete = async (id: string) => {
    await deleteReport.mutateAsync(id)
    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <FileBarChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-stone-900 to-stone-600 bg-clip-text text-transparent">Accreditation Reports</h1>
            <p className="text-sm text-stone-500">Generate compliance reports for accrediting bodies</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" />Generate Report
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-stone-400 mx-auto" /></div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-medium">No reports generated yet</p>
            <p className="text-sm text-stone-400 mt-1">Click "Generate Report" to create your first accreditation report</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left py-3 px-4 font-medium text-stone-500">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-500">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-500">Date Range</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-500">Generated</th>
                  <th className="text-right py-3 px-4 font-medium text-stone-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report: ApiAccreditationReport) => (
                  <tr key={report.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-stone-900">{report.title}</td>
                    <td className="py-3 px-4 text-stone-600">{typeLabel(report.report_type)}</td>
                    <td className="py-3 px-4 text-stone-500 text-xs">
                      {report.parameters.date_from && report.parameters.date_to
                        ? `${report.parameters.date_from} — ${report.parameters.date_to}`
                        : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(report.status)}`}>{report.status}</span>
                    </td>
                    <td className="py-3 px-4 text-stone-500 text-xs">{report.generated_at ? new Date(report.generated_at).toLocaleDateString() : '—'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {report.status === 'completed' && (
                          <a href={accreditationReportsApi.downloadUrl(report.id)} target="_blank" rel="noreferrer"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Download PDF">
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <button onClick={() => setDeleteId(report.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-sm border border-stone-200 rounded-xl hover:bg-stone-50 disabled:opacity-40 transition-colors">Previous</button>
          <span className="text-sm text-stone-500">Page {page} of {lastPage}</span>
          <button disabled={page >= lastPage} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm border border-stone-200 rounded-xl hover:bg-stone-50 disabled:opacity-40 transition-colors">Next</button>
        </div>
      )}

      {/* Generate Modal */}
      {showModal && <GenerateModal onClose={() => setShowModal(false)} />}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-stone-900 mb-2">Delete Report?</h3>
            <p className="text-sm text-stone-500 mb-4">This action cannot be undone. The report file will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleteReport.isPending} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
                {deleteReport.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GenerateModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth()
  const generate = useGenerateReport()
  const [reportType, setReportType] = useState('annual_summary')
  const [title, setTitle] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [universityId, setUniversityId] = useState('')
  const [programId, setProgramId] = useState('')
  const [siteId, setSiteId] = useState('')

  const handleGenerate = async () => {
    const params: Record<string, unknown> = {}
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    if (programId) params.program_id = programId
    if (siteId) params.site_id = siteId

    await generate.mutateAsync({
      report_type: reportType,
      title: title || `${typeLabel(reportType)} — ${dateFrom || 'All Time'}`,
      university_id: universityId,
      parameters: params,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">Generate Report</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Report Type</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Title (optional)</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Auto-generated if empty" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">University ID</label>
            <input value={universityId} onChange={e => setUniversityId(e.target.value)} placeholder="Required" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          {reportType === 'program_review' && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Program ID (optional)</label>
              <input value={programId} onChange={e => setProgramId(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          )}
          {reportType === 'site_evaluation' && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Site ID (optional)</label>
              <input value={siteId} onChange={e => setSiteId(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          )}
        </div>
        <div className="flex gap-3 p-5 border-t border-stone-100">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">Cancel</button>
          <button onClick={handleGenerate} disabled={generate.isPending || !universityId} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
            {generate.isPending ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}
