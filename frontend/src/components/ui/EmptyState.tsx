import type { ReactNode } from 'react'

type Illustration = 'search' | 'inbox' | 'calendar' | 'chart' | 'clipboard' | 'users' | 'folder'

const illustrations: Record<Illustration, ReactNode> = {
  search: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="34" cy="34" r="22" stroke="#d6d3d1" strokeWidth="3" />
      <line x1="50" y1="50" x2="68" y2="68" stroke="#d6d3d1" strokeWidth="3" strokeLinecap="round" />
      <circle cx="34" cy="34" r="10" fill="#f5f5f4" />
      <path d="M30 34h8M34 30v8" stroke="#a8a29e" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  inbox: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="20" width="52" height="40" rx="4" stroke="#d6d3d1" strokeWidth="3" />
      <path d="M14 45h16l5 8h10l5-8h16" stroke="#d6d3d1" strokeWidth="3" />
      <circle cx="40" cy="35" r="3" fill="#a8a29e" />
    </svg>
  ),
  calendar: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="18" width="56" height="48" rx="4" stroke="#d6d3d1" strokeWidth="3" />
      <line x1="12" y1="32" x2="68" y2="32" stroke="#d6d3d1" strokeWidth="3" />
      <line x1="28" y1="14" x2="28" y2="22" stroke="#a8a29e" strokeWidth="3" strokeLinecap="round" />
      <line x1="52" y1="14" x2="52" y2="22" stroke="#a8a29e" strokeWidth="3" strokeLinecap="round" />
      <circle cx="30" cy="44" r="3" fill="#e7e5e4" />
      <circle cx="40" cy="44" r="3" fill="#e7e5e4" />
      <circle cx="50" cy="44" r="3" fill="#e7e5e4" />
    </svg>
  ),
  chart: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="50" width="10" height="16" rx="2" fill="#e7e5e4" />
      <rect x="28" y="38" width="10" height="28" rx="2" fill="#d6d3d1" />
      <rect x="42" y="28" width="10" height="38" rx="2" fill="#e7e5e4" />
      <rect x="56" y="18" width="10" height="48" rx="2" fill="#d6d3d1" />
      <line x1="10" y1="68" x2="70" y2="68" stroke="#a8a29e" strokeWidth="2" />
    </svg>
  ),
  clipboard: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="14" width="44" height="56" rx="4" stroke="#d6d3d1" strokeWidth="3" />
      <rect x="28" y="10" width="24" height="10" rx="3" fill="#e7e5e4" stroke="#d6d3d1" strokeWidth="2" />
      <line x1="28" y1="35" x2="52" y2="35" stroke="#e7e5e4" strokeWidth="3" strokeLinecap="round" />
      <line x1="28" y1="45" x2="46" y2="45" stroke="#e7e5e4" strokeWidth="3" strokeLinecap="round" />
      <line x1="28" y1="55" x2="40" y2="55" stroke="#e7e5e4" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  users: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="30" r="10" stroke="#d6d3d1" strokeWidth="3" />
      <path d="M14 62c0-10 8-18 18-18s18 8 18 18" stroke="#d6d3d1" strokeWidth="3" strokeLinecap="round" />
      <circle cx="54" cy="28" r="8" stroke="#e7e5e4" strokeWidth="2" />
      <path d="M66 58c0-8 -5-14-12-14" stroke="#e7e5e4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  folder: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 26c0-2.2 1.8-4 4-4h14l6 8h28c2.2 0 4 1.8 4 4v26c0 2.2-1.8 4-4 4H16c-2.2 0-4-1.8-4-4V26z" stroke="#d6d3d1" strokeWidth="3" />
      <line x1="30" y1="45" x2="50" y2="45" stroke="#e7e5e4" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
}

export function EmptyState({
  illustration = 'inbox',
  title,
  description,
  action,
}: {
  illustration?: Illustration
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="mb-4 opacity-60">
        {illustrations[illustration]}
      </div>
      <h3 className="text-base font-semibold text-stone-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-stone-400 max-w-xs mb-4">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
