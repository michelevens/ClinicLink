import { useEffect, useRef, useId, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Focus trap + restore focus on close
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current

    // Focus the dialog itself
    dialog.focus()

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleTab)
    return () => {
      document.removeEventListener('keydown', handleTab)
      previouslyFocused?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative bg-white dark:bg-stone-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[92vh] sm:max-h-[90vh] flex flex-col outline-none`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-200 dark:border-stone-700">
          <h2 id={titleId} className="text-lg font-semibold text-stone-900 dark:text-stone-100">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-stone-500 dark:text-stone-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
