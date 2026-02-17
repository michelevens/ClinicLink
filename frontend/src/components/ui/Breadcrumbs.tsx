import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface Crumb {
  label: string
  path?: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm mb-4" aria-label="Breadcrumb">
      <Link
        to="/dashboard"
        className="text-stone-400 hover:text-primary-600 transition-colors"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </Link>
      {items.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
          {crumb.path && i < items.length - 1 ? (
            <Link to={crumb.path} className="text-stone-500 hover:text-primary-600 transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-stone-700 font-medium truncate max-w-[200px]">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
