import { X } from 'lucide-react'

interface Props {
  title: string
  description: string
  color: string
  type: string
  onClose: () => void
  onNavigate: () => void
}

const typeLabels: Record<string, string> = {
  rotation: 'Rotation',
  hour_log: 'Hour Log',
  evaluation: 'Evaluation',
  deadline: 'Deadline',
  application: 'Application',
}

export function EventDetailPopover({ title, description, color, type, onClose, onNavigate }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-4 w-72">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
            {typeLabels[type] || type}
          </span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-stone-100 text-stone-400">
          <X className="w-4 h-4" />
        </button>
      </div>
      <h3 className="font-semibold text-stone-900 text-sm mb-1">{title}</h3>
      <p className="text-xs text-stone-500 mb-3">{description}</p>
      <button
        onClick={onNavigate}
        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
      >
        View Details →
      </button>
    </div>
  )
}
