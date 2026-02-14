import { useState, useRef } from 'react'
import { Modal } from '../ui/Modal.tsx'
import { Button } from '../ui/Button.tsx'
import { API_URL } from '../../services/api.ts'
import { Upload, Download, CheckCircle, XCircle, AlertTriangle, Loader2, FileSpreadsheet } from 'lucide-react'

interface ImportResult {
  summary: { created: number; skipped: number; errors: number }
  created: { row: number; email: string; name: string }[]
  skipped: { row: number; email: string; reason: string }[]
  errors: { row: number; email: string; error: string }[]
}

interface BulkImportModalProps {
  open: boolean
  onClose: () => void
  programId?: string
  onSuccess?: () => void
}

export function BulkImportModal({ open, onClose, programId, onSuccess }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (programId) formData.append('program_id', programId)

      const token = localStorage.getItem('cliniclink_token')
      const res = await fetch(`${API_URL}/students/bulk-import`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || `Upload failed (${res.status})`)
      }

      const data: ImportResult = await res.json()
      setResult(data)
      if (data.summary.created > 0) onSuccess?.()
    } catch (err) {
      setResult({
        summary: { created: 0, skipped: 0, errors: 1 },
        created: [],
        skipped: [],
        errors: [{ row: 0, email: '', error: (err as Error).message }],
      })
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    onClose()
  }

  const templateUrl = `${API_URL}/students/import-template`

  return (
    <Modal isOpen={open} onClose={handleClose} title="Import Students from CSV">
      <div className="space-y-5">
        {/* Template download */}
        <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-200">
          <FileSpreadsheet className="w-5 h-5 text-primary-600 shrink-0" />
          <div className="flex-1 text-sm text-stone-700">
            Download the CSV template, fill in student details, then upload it here.
          </div>
          <a
            href={templateUrl}
            download
            className="text-sm font-medium text-primary-600 hover:text-primary-700 whitespace-nowrap"
          >
            <Download className="w-4 h-4 inline mr-1" />
            Template
          </a>
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">CSV File</label>
          <div
            className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => { setFile(e.target.files?.[0] || null); setResult(null) }}
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-sm text-stone-700">
                <FileSpreadsheet className="w-5 h-5 text-primary-500" />
                <span className="font-medium">{file.name}</span>
                <span className="text-stone-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ) : (
              <div className="text-stone-400">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Click to select a CSV file</p>
                <p className="text-xs mt-1">Max 2MB, .csv format</p>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-3">
            <div className="flex gap-3">
              {result.summary.created > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> {result.summary.created} created
                </div>
              )}
              {result.summary.skipped > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
                  <AlertTriangle className="w-4 h-4" /> {result.summary.skipped} skipped
                </div>
              )}
              {result.summary.errors > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                  <XCircle className="w-4 h-4" /> {result.summary.errors} errors
                </div>
              )}
            </div>

            {/* Detail table */}
            {(result.created.length > 0 || result.skipped.length > 0 || result.errors.length > 0) && (
              <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-xl">
                <table className="w-full text-xs">
                  <thead className="bg-stone-50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium text-stone-500">Row</th>
                      <th className="text-left p-2 font-medium text-stone-500">Email</th>
                      <th className="text-left p-2 font-medium text-stone-500">Status</th>
                      <th className="text-left p-2 font-medium text-stone-500">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.created.map(r => (
                      <tr key={`c-${r.row}`} className="border-t border-stone-100">
                        <td className="p-2">{r.row}</td>
                        <td className="p-2">{r.email}</td>
                        <td className="p-2"><span className="text-green-600 font-medium">Created</span></td>
                        <td className="p-2 text-stone-500">{r.name}</td>
                      </tr>
                    ))}
                    {result.skipped.map(r => (
                      <tr key={`s-${r.row}`} className="border-t border-stone-100">
                        <td className="p-2">{r.row}</td>
                        <td className="p-2">{r.email}</td>
                        <td className="p-2"><span className="text-amber-600 font-medium">Skipped</span></td>
                        <td className="p-2 text-stone-500">{r.reason}</td>
                      </tr>
                    ))}
                    {result.errors.map((r, i) => (
                      <tr key={`e-${i}`} className="border-t border-stone-100">
                        <td className="p-2">{r.row || '-'}</td>
                        <td className="p-2">{r.email || '-'}</td>
                        <td className="p-2"><span className="text-red-600 font-medium">Error</span></td>
                        <td className="p-2 text-stone-500">{r.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</> : <><Upload className="w-4 h-4" /> Import Students</>}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
