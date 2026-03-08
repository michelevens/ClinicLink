import { useState, useMemo, useCallback } from 'react'
import {
  FolderOpen, Search, Upload, Download, Trash2, Eye, FileText,
  ShieldCheck, ClipboardList, Handshake, File, AlertTriangle,
  Clock, Archive, RefreshCw, X, ChevronLeft, ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { useDocuments, useDocumentSummary, useUploadDocument, useUpdateDocument, useDeleteDocument, useSyncCredentials } from '../hooks/useApi.ts'
import { documentsApi, type ApiDocument } from '../services/api.ts'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { usePageTitle } from '../hooks/usePageTitle.ts'

const FOLDERS = [
  { key: '', label: 'All Documents', icon: FolderOpen },
  { key: 'credentials', label: 'Credentials', icon: ShieldCheck },
  { key: 'onboarding', label: 'Onboarding', icon: ClipboardList },
  { key: 'agreements', label: 'Agreements', icon: Handshake },
  { key: 'general', label: 'General', icon: File },
] as const

const STATUS_FILTERS = [
  { key: '', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'expiring_soon', label: 'Expiring Soon' },
  { key: 'expired', label: 'Expired' },
  { key: 'archived', label: 'Archived' },
] as const

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word') || mimeType.includes('doc')) return '📝'
  return '📎'
}

export function DocumentVault() {
  usePageTitle('Document Vault')

  const [folder, setFolder] = useState('')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showUpload, setShowUpload] = useState(false)
  const [viewDoc, setViewDoc] = useState<ApiDocument | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<ApiDocument | null>(null)

  const params = useMemo(() => ({
    folder: folder || undefined,
    status: status || undefined,
    search: search || undefined,
    page,
  }), [folder, status, search, page])

  const { data, isLoading } = useDocuments(params)
  const { data: summary } = useDocumentSummary()
  const deleteDoc = useDeleteDocument()
  const updateDoc = useUpdateDocument()
  const syncCredentials = useSyncCredentials()

  const documents = data?.data || []
  const totalPages = data?.last_page || 1

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deleteDoc.mutateAsync(deleteConfirm.id)
      toast.success('Document deleted')
      setDeleteConfirm(null)
    } catch {
      toast.error('Failed to delete document')
    }
  }

  const handleSync = async () => {
    try {
      const result = await syncCredentials.mutateAsync()
      toast.success(result.message)
    } catch {
      toast.error('Failed to sync credentials')
    }
  }

  const handleArchive = async (doc: ApiDocument) => {
    try {
      await updateDoc.mutateAsync({ id: doc.id, data: { status: 'archived' } })
      toast.success('Document archived')
    } catch {
      toast.error('Failed to archive document')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-stone-900 to-stone-600 bg-clip-text text-transparent">Document Vault</h1>
            <p className="text-sm text-stone-500">Manage all your documents in one place</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleSync} isLoading={syncCredentials.isPending}>
            <RefreshCw className="w-4 h-4 mr-1" /> Sync Credentials
          </Button>
          <Button size="sm" onClick={() => setShowUpload(true)}>
            <Upload className="w-4 h-4 mr-1" /> Upload
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-stone-900">{summary.total}</p>
            <p className="text-xs text-stone-500">Total Documents</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{Object.values(summary.folders).reduce((a, b) => a + b, 0) - (summary.expired || 0)}</p>
            <p className="text-xs text-stone-500">Active</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{summary.expiring_soon}</p>
            <p className="text-xs text-stone-500">Expiring Soon</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{summary.expired}</p>
            <p className="text-xs text-stone-500">Expired</p>
          </Card>
        </div>
      )}

      {/* Folder Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-stone-100 rounded-xl p-1 overflow-x-auto">
          {FOLDERS.map(f => {
            const Icon = f.icon
            const count = f.key ? summary?.folders[f.key] || 0 : summary?.total || 0
            return (
              <button
                key={f.key}
                onClick={() => { setFolder(f.key); setPage(1) }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  folder === f.key ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {f.label}
                {count > 0 && <span className="text-[10px] bg-stone-200 rounded-full px-1.5">{count}</span>}
              </button>
            )
          })}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search documents..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {STATUS_FILTERS.map(s => (
          <button
            key={s.key}
            onClick={() => { setStatus(s.key); setPage(1) }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              status === s.key ? 'bg-primary-100 text-primary-700' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Document List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-stone-200 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-stone-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-stone-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="w-12 h-12" />}
          title="No documents found"
          description={search ? 'Try adjusting your search or filters.' : 'Upload your first document to get started.'}
          action={!search ? <Button size="sm" onClick={() => setShowUpload(true)}><Upload className="w-4 h-4 mr-1" /> Upload Document</Button> : undefined}
        />
      ) : (
        <div className="space-y-2">
          {documents.map(doc => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              onView={() => setViewDoc(doc)}
              onDelete={() => setDeleteConfirm(doc)}
              onArchive={() => handleArchive(doc)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-stone-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}

      {/* View Modal */}
      {viewDoc && (
        <Modal title="Document Details" onClose={() => setViewDoc(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getFileIcon(viewDoc.mime_type)}</span>
              <div>
                <h3 className="font-semibold text-stone-900">{viewDoc.title}</h3>
                <p className="text-sm text-stone-500">{viewDoc.file_name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-stone-500">Folder:</span> <span className="capitalize font-medium">{viewDoc.folder}</span></div>
              <div><span className="text-stone-500">Size:</span> <span className="font-medium">{formatFileSize(viewDoc.file_size)}</span></div>
              <div><span className="text-stone-500">Status:</span> <DocumentStatusBadge status={viewDoc.status} expirationDate={viewDoc.expiration_date} /></div>
              <div><span className="text-stone-500">Visibility:</span> <span className="capitalize font-medium">{viewDoc.visibility}</span></div>
              {viewDoc.expiration_date && (
                <div><span className="text-stone-500">Expires:</span> <span className="font-medium">{new Date(viewDoc.expiration_date).toLocaleDateString()}</span></div>
              )}
              <div><span className="text-stone-500">Uploaded:</span> <span className="font-medium">{new Date(viewDoc.created_at).toLocaleDateString()}</span></div>
            </div>
            {viewDoc.description && (
              <div>
                <span className="text-sm text-stone-500">Description:</span>
                <p className="text-sm text-stone-700 mt-1">{viewDoc.description}</p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <a href={documentsApi.downloadUrl(viewDoc.id)} target="_blank" rel="noreferrer">
                <Button size="sm"><Download className="w-4 h-4 mr-1" /> Download</Button>
              </a>
              <Button variant="danger" size="sm" onClick={() => { setViewDoc(null); setDeleteConfirm(viewDoc) }}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <Modal title="Delete Document" onClose={() => setDeleteConfirm(null)}>
          <p className="text-sm text-stone-600 mb-4">
            Are you sure you want to delete <strong>{deleteConfirm.title}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete} isLoading={deleteDoc.isPending}>Delete</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function DocumentRow({ doc, onView, onDelete, onArchive }: {
  doc: ApiDocument
  onView: () => void
  onDelete: () => void
  onArchive: () => void
}) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onView}>
      <div className="flex items-center gap-4">
        <span className="text-2xl flex-shrink-0">{getFileIcon(doc.mime_type)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-stone-900 truncate">{doc.title}</h3>
            <DocumentStatusBadge status={doc.status} expirationDate={doc.expiration_date} />
          </div>
          <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
            <span className="capitalize">{doc.folder}</span>
            <span>{formatFileSize(doc.file_size)}</span>
            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
            {doc.expiration_date && (
              <span className={`flex items-center gap-1 ${new Date(doc.expiration_date) < new Date() ? 'text-red-500' : ''}`}>
                <Clock className="w-3 h-3" />
                Exp: {new Date(doc.expiration_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <a href={documentsApi.downloadUrl(doc.id)} target="_blank" rel="noreferrer"
            className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600">
            <Download className="w-4 h-4" />
          </a>
          {doc.status !== 'archived' && (
            <button onClick={onArchive} className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600">
              <Archive className="w-4 h-4" />
            </button>
          )}
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  )
}

function DocumentStatusBadge({ status, expirationDate }: { status: string; expirationDate: string | null }) {
  const isExpired = expirationDate && new Date(expirationDate) < new Date()
  const isExpiringSoon = expirationDate && !isExpired && new Date(expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  if (isExpired || status === 'expired') return <Badge variant="danger">Expired</Badge>
  if (isExpiringSoon) return <Badge variant="warning">Expiring Soon</Badge>
  if (status === 'archived') return <Badge variant="default">Archived</Badge>
  return <Badge variant="success">Active</Badge>
}

function UploadModal({ onClose }: { onClose: () => void }) {
  const upload = useUploadDocument()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [folder, setFolder] = useState('general')
  const [description, setDescription] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) {
      setFile(dropped)
      if (!title) setTitle(dropped.name.replace(/\.[^.]+$/, ''))
    }
  }, [title])

  const handleSubmit = async () => {
    if (!file) { toast.error('Please select a file'); return }
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title || file.name.replace(/\.[^.]+$/, ''))
    formData.append('folder', folder)
    if (description) formData.append('description', description)
    if (expirationDate) formData.append('expiration_date', expirationDate)

    try {
      await upload.mutateAsync(formData)
      toast.success('Document uploaded')
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  return (
    <Modal title="Upload Document" onClose={onClose}>
      <div className="space-y-4">
        {/* Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragOver ? 'border-primary-400 bg-primary-50' : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">{getFileIcon(file.type)}</span>
              <div className="text-left">
                <p className="text-sm font-medium text-stone-900">{file.name}</p>
                <p className="text-xs text-stone-500">{formatFileSize(file.size)}</p>
              </div>
              <button onClick={() => setFile(null)} className="ml-2 p-1 hover:bg-stone-100 rounded">
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-sm text-stone-600">Drag & drop a file here, or</p>
              <label className="inline-block mt-2 px-4 py-2 bg-primary-500 text-white text-sm rounded-lg cursor-pointer hover:bg-primary-600 transition-colors">
                Browse Files
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, '')) }
                  }}
                />
              </label>
              <p className="text-xs text-stone-400 mt-2">PDF, JPG, PNG, DOC — Max 20MB</p>
            </>
          )}
        </div>

        {/* Fields */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            placeholder="Document title" />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Folder</label>
          <select value={folder} onChange={e => setFolder(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
            <option value="general">General</option>
            <option value="credentials">Credentials</option>
            <option value="onboarding">Onboarding</option>
            <option value="agreements">Agreements</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Description (Optional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            placeholder="Brief description..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Expiration Date (Optional)</label>
          <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} isLoading={upload.isPending}>
            <Upload className="w-4 h-4 mr-1" /> Upload
          </Button>
        </div>
      </div>
    </Modal>
  )
}
