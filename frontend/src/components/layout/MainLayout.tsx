import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar.tsx'

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
