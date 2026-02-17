import { useState, useEffect, useRef } from 'react'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { KeyRound, Plus, Copy, Check, Trash2, Search, Loader2, Building2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { useLicenseCodes, useCreateLicenseCode, useDeactivateLicenseCode } from '../hooks/useApi.ts'
import { universitiesApi } from '../services/api.ts'
import type { ApiLicenseCode } from '../services/api.ts'

export function LicenseCodes() {
  const [universityFilter, setUniversityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deactivateConfirm, setDeactivateConfirm] = useState<ApiLicenseCode | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { data, isLoading } = useLicenseCodes({ university_id: universityFilter || undefined, page })
  const deactivateMutation = useDeactivateLicenseCode()

  const codes = data?.data ?? []
  const lastPage = data?.last_page ?? 1

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    toast.success('Code copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCopyLink = (code: string, id: string) => {
    const link = `${window.location.origin}/register?role=student&code=${code}`
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    toast.success('Registration link copied')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeactivate = async () => {
    if (!deactivateConfirm) return
    try {
      await deactivateMutation.mutateAsync(deactivateConfirm.id)
      toast.success('Code deactivated')
      setDeactivateConfirm(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deactivate code'
      toast.error(message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">University License Codes</h1>
          <p className="text-stone-500 mt-1">Generate and manage Pro access codes for university students</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Codes
        </Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">University</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Usage</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Expires</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Created</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-stone-400 mx-auto" />
                    <p className="text-sm text-stone-500 mt-2">Loading codes...</p>
                  </td>
                </tr>
              ) : codes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <KeyRound className="w-8 h-8 text-stone-300 mx-auto" />
                    <p className="text-sm text-stone-500 mt-2">No license codes yet</p>
                    <p className="text-xs text-stone-400 mt-1">Generate codes for universities to distribute to their students</p>
                  </td>
                </tr>
              ) : codes.map(code => {
                const isExpired = code.expires_at && new Date(code.expires_at) < new Date()
                const isUsed = code.max_uses !== null && code.times_used >= code.max_uses
                const isActive = code.is_active && !isExpired && !isUsed

                return (
                  <tr key={code.id} className="table-row-hover">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono font-semibold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">{code.code}</code>
                        <button
                          onClick={() => handleCopy(code.code, code.id)}
                          className="p-1 rounded hover:bg-stone-200 transition-colors text-stone-400 hover:text-stone-600"
                          title="Copy code"
                        >
                          {copiedId === code.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-stone-700">{code.university?.name ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-stone-700">
                        {code.times_used} / {code.max_uses ?? '∞'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {code.expires_at ? (
                        <span className={`text-sm ${isExpired ? 'text-red-500' : 'text-stone-700'}`}>
                          {new Date(code.expires_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sm text-stone-400">Never</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!code.is_active ? (
                        <Badge variant="danger">Deactivated</Badge>
                      ) : isExpired ? (
                        <Badge variant="warning">Expired</Badge>
                      ) : isUsed ? (
                        <Badge variant="secondary">Used</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-stone-500">{new Date(code.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleCopyLink(code.code, code.id + '-link')}
                          className="px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Copy registration link"
                        >
                          Copy Link
                        </button>
                        {isActive && (
                          <button
                            onClick={() => setDeactivateConfirm(code)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                            title="Deactivate code"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-200">
            <p className="text-sm text-stone-500">
              Page {page} of {lastPage}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateCodeModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Deactivate Confirmation */}
      {deactivateConfirm && (
        <Modal isOpen onClose={() => setDeactivateConfirm(null)} title="Deactivate Code">
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              Are you sure you want to deactivate code <code className="font-mono font-semibold bg-stone-100 px-1.5 py-0.5 rounded">{deactivateConfirm.code}</code>?
              This code will no longer be usable by students.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeactivateConfirm(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleDeactivate} isLoading={deactivateMutation.isPending}>Deactivate</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function CreateCodeModal({ onClose }: { onClose: () => void }) {
  const createMutation = useCreateLicenseCode()
  const [universityId, setUniversityId] = useState('')
  const [count, setCount] = useState(1)
  const [expiresAt, setExpiresAt] = useState('')

  // University search
  const [uniSearch, setUniSearch] = useState('')
  const [uniResults, setUniResults] = useState<{ id: string; name: string; city: string | null; state: string | null }[]>([])
  const [uniLoading, setUniLoading] = useState(false)
  const [selectedUni, setSelectedUni] = useState<{ id: string; name: string } | null>(null)
  const [showUniDropdown, setShowUniDropdown] = useState(false)
  const uniRef = useRef<HTMLDivElement>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null)

  // Generated codes to display
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])

  useEffect(() => {
    if (!uniSearch.trim() || uniSearch.length < 2) {
      setUniResults([])
      return
    }
    setUniLoading(true)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await universitiesApi.list({ search: uniSearch })
        setUniResults((res.data || []).map(u => ({ id: u.id, name: u.name, city: u.city, state: u.state })))
      } catch {
        setUniResults([])
      } finally {
        setUniLoading(false)
      }
    }, 300)
  }, [uniSearch])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (uniRef.current && !uniRef.current.contains(e.target as Node)) setShowUniDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!universityId) {
      toast.error('Please select a university')
      return
    }
    try {
      const res = await createMutation.mutateAsync({
        university_id: universityId,
        count,
        expires_at: expiresAt || undefined,
      })
      const codes: string[] = []
      if (res.code) codes.push(res.code.code)
      if (res.codes) codes.push(...res.codes.map(c => c.code))
      setGeneratedCodes(codes)
      toast.success(`${codes.length} code${codes.length > 1 ? 's' : ''} generated successfully`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate codes'
      toast.error(message)
    }
  }

  const handleCopyAll = () => {
    navigator.clipboard.writeText(generatedCodes.join('\n'))
    toast.success('All codes copied to clipboard')
  }

  const handleCopyAllLinks = () => {
    const links = generatedCodes.map(code => `${window.location.origin}/register?role=student&code=${code}`)
    navigator.clipboard.writeText(links.join('\n'))
    toast.success('All registration links copied')
  }

  if (generatedCodes.length > 0) {
    return (
      <Modal isOpen onClose={onClose} title="Codes Generated" size="lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-600">
              {generatedCodes.length} code{generatedCodes.length > 1 ? 's' : ''} generated for <span className="font-semibold">{selectedUni?.name}</span>
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyAll}>
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Copy Codes
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyAllLinks}>
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Copy Links
              </Button>
            </div>
          </div>
          <div className="bg-stone-50 rounded-xl border border-stone-200 p-3 max-h-64 overflow-y-auto">
            <div className="space-y-1.5">
              {generatedCodes.map((code, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-stone-100">
                  <code className="text-sm font-mono font-semibold text-stone-900">{code}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(code)
                      toast.success('Code copied')
                    }}
                    className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-stone-400">Each code is single-use and unique per student. Share these codes with students via email or include them in registration links.</p>
          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen onClose={onClose} title="Generate License Codes">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* University Search */}
        <div className="space-y-1.5" ref={uniRef}>
          <label className="block text-sm font-medium text-stone-700">University</label>
          {selectedUni ? (
            <div className="flex items-center justify-between p-3 rounded-xl border border-primary-300 bg-primary-50">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-stone-900">{selectedUni.name}</span>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedUni(null); setUniversityId(''); setUniSearch('') }}
                className="text-stone-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                {uniLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </div>
              <input
                type="text"
                value={uniSearch}
                onChange={e => { setUniSearch(e.target.value); setShowUniDropdown(true) }}
                onFocus={() => uniResults.length > 0 && setShowUniDropdown(true)}
                placeholder="Search for a university..."
                className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
              />
              {showUniDropdown && uniResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {uniResults.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUni({ id: u.id, name: u.name })
                        setUniversityId(u.id)
                        setShowUniDropdown(false)
                        setUniSearch('')
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-primary-50 transition-colors border-b border-stone-100 last:border-0"
                    >
                      <p className="text-sm font-medium text-stone-900">{u.name}</p>
                      {(u.city || u.state) && (
                        <p className="text-xs text-stone-500">{[u.city, u.state].filter(Boolean).join(', ')}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Number of codes */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-stone-700">Number of Codes</label>
          <input
            type="number"
            min={1}
            max={500}
            value={count}
            onChange={e => setCount(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
          />
          <p className="text-xs text-stone-400">Each code is single-use. Generate one per student (max 500 at a time).</p>
        </div>

        {/* Expiration date */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-stone-700">Expiration Date (Optional)</label>
          <input
            type="date"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
          />
          <p className="text-xs text-stone-400">Leave empty for codes that never expire.</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={createMutation.isPending}>
            <KeyRound className="w-4 h-4 mr-2" />
            Generate {count > 1 ? `${count} Codes` : 'Code'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
