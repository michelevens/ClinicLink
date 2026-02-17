import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar.tsx'
import { TopBar } from './TopBar.tsx'
import { MainLayoutV2 } from './MainLayoutV2.tsx'
import { PageTransition } from './PageTransition.tsx'
import { useDesignVersion } from '../../contexts/DesignVersionContext.tsx'
import { AiChatWidget } from '../ai-chat/AiChatWidget.tsx'

export function MainLayout({ children }: { children: ReactNode }) {
  const { version } = useDesignVersion()

  if (version === 'v2') {
    return (
      <>
        <MainLayoutV2><PageTransition>{children}</PageTransition></MainLayoutV2>
        <AiChatWidget />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-stone-50">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
          {/* Sticky top bar — stays visible while scrolling */}
          <div className="sticky top-14 lg:top-0 z-20 bg-stone-50/95 backdrop-blur-sm border-b border-stone-100">
            <div className="px-4 sm:px-6 max-w-7xl mx-auto py-2">
              <TopBar />
            </div>
          </div>
          {/* Page content */}
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
      <AiChatWidget />
    </>
  )
}
