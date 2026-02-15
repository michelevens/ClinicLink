import type { ReactNode } from 'react'
import { TopNavV2 } from './TopNavV2.tsx'

export function MainLayoutV2({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavV2 />
      <main className="min-h-screen pt-14">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
