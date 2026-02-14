import { useState, useRef, useEffect } from 'react'
import { FileText, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { messageTemplates } from '../../data/messageTemplates.ts'

interface Props {
  onSelect: (body: string) => void
}

export function MessageTemplateSelector({ onSelect }: Props) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const role = user?.role || 'student'
  const filtered = messageTemplates.filter(t => t.roles.includes(role))
  const categories = [...new Set(filtered.map(t => t.category))]

  if (filtered.length === 0) return null

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2.5 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
        title="Insert template"
      >
        <FileText className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-xl border border-stone-200 z-50 max-h-80 overflow-y-auto">
          <div className="px-3 py-2 border-b border-stone-100">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Message Templates</p>
          </div>
          {categories.map(cat => (
            <div key={cat}>
              <p className="px-3 pt-2 pb-1 text-xs font-medium text-stone-400">{cat}</p>
              {filtered.filter(t => t.category === cat).map(t => (
                <button
                  key={t.id}
                  onClick={() => { onSelect(t.body); setOpen(false) }}
                  className="w-full text-left px-3 py-2 hover:bg-stone-50 transition-colors"
                >
                  <p className="text-sm font-medium text-stone-700">{t.label}</p>
                  <p className="text-xs text-stone-400 line-clamp-1">{t.body}</p>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
