import { useRef, useState, useCallback } from 'react'
import { Upload, X, FileText, Loader2, Download } from 'lucide-react'

interface FileUploadProps {
  accept?: string
  maxSizeMB?: number
  onFileSelected: (file: File) => void
  isUploading?: boolean
  currentFile?: { name: string; url?: string } | null
  onRemove?: () => void
  label?: string
  helperText?: string
  compact?: boolean
}

export function FileUpload({
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  maxSizeMB = 20,
  onFileSelected,
  isUploading = false,
  currentFile,
  onRemove,
  label,
  helperText,
  compact = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    setError(null)
    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB.`)
      return
    }
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    const allowed = accept.split(',').map(a => a.trim().toLowerCase())
    if (!allowed.some(a => ext === a || file.type.includes(a.replace('.', '')))) {
      setError(`File type not allowed. Accepted: ${accept}`)
      return
    }
    onFileSelected(file)
  }, [accept, maxSizeMB, onFileSelected])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [handleFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0])
    }
    if (inputRef.current) inputRef.current.value = ''
  }, [handleFile])

  if (currentFile) {
    return (
      <div className="space-y-1.5">
        {label && <label className="block text-sm font-medium text-stone-700">{label}</label>}
        <div className={`flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
          <FileText className="h-5 w-5 text-primary-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-stone-900 truncate">{currentFile.name}</p>
          </div>
          {currentFile.url && (
            <a
              href={currentFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-stone-400 hover:text-primary-500 transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </a>
          )}
          {onRemove && !isUploading && (
            <button
              onClick={onRemove}
              className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isUploading && <Loader2 className="h-4 w-4 text-primary-500 animate-spin" />}
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="space-y-1.5">
        {label && <label className="block text-sm font-medium text-stone-700">{label}</label>}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50 hover:border-primary-300 transition-all duration-200 disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-stone-700">{label}</label>}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-stone-300 bg-stone-50/50 hover:border-primary-300 hover:bg-stone-50'
        } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        {isUploading ? (
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <Upload className="h-6 w-6 text-primary-600" />
          </div>
        )}
        <div className="text-center">
          <p className="text-sm font-medium text-stone-700">
            {isUploading ? 'Uploading...' : 'Drop file here or click to browse'}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {helperText || `PDF, JPG, PNG, DOC up to ${maxSizeMB}MB`}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
}
