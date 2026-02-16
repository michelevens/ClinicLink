/** Shimmer skeleton loader that matches content shapes */

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-stone-200/60 ${className}`}
    />
  )
}

/** Skeleton shaped like a stat card (icon + value + label) */
export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-7 w-16 mb-1.5" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  )
}

/** Skeleton shaped like a table row */
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  )
}

/** Skeleton shaped like a card in a grid */
export function CardSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5">
      <Skeleton className="h-4 w-3/4 mb-3" />
      <Skeleton className="h-3 w-1/2 mb-2" />
      <Skeleton className="h-3 w-2/3 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

/** Full page loading skeleton with stat cards + table */
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-stone-100">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="divide-y divide-stone-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40 mb-1.5" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
