import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar.tsx'
import { TopBar } from './TopBar.tsx'
import { MainLayoutV2 } from './MainLayoutV2.tsx'
import { PageTransition } from './PageTransition.tsx'
import { MobileBottomNav } from './MobileBottomNav.tsx'
import { useDesignVersion } from '../../contexts/DesignVersionContext.tsx'
import { AiChatWidget } from '../ai-chat/AiChatWidget.tsx'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { useIsMobile } from '../../hooks/useIsMobile.ts'

function DemoBanner() {
  return (
    <div className="bg-amber-500 text-white text-center text-xs font-semibold py-1.5 px-4">
      Demo Mode — This is a demo account with sample data. Actions here won't affect real users.
    </div>
  )
}

export function MainLayout({ children }: { children: ReactNode }) {
  const { version } = useDesignVersion()
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (version === 'v2') {
    return (
      <>
        {user?.is_demo && <DemoBanner />}
        <MainLayoutV2><PageTransition>{children}</PageTransition></MainLayoutV2>
        <AiChatWidget />
      </>
    )
  }

  return (
    <>
      {user?.is_demo && <DemoBanner />}
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
        <Sidebar mobileOpen={drawerOpen} onMobileOpenChange={setDrawerOpen} />
        <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
          {/* Sticky top bar — stays visible while scrolling */}
          <div className="sticky top-14 lg:top-0 z-20 bg-stone-50/95 dark:bg-stone-900/95 backdrop-blur-sm border-b border-stone-100 dark:border-stone-800">
            <div className="px-4 sm:px-6 max-w-7xl mx-auto py-2">
              <TopBar />
            </div>
          </div>
          {/* Page content — extra bottom padding on mobile for bottom nav */}
          <div className={`p-4 sm:p-6 max-w-7xl mx-auto ${isMobile ? 'pb-20' : ''}`}>
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
        {/* Mobile bottom tab bar */}
        {isMobile && (
          <MobileBottomNav onMorePress={() => setDrawerOpen(true)} />
        )}
      </div>
      <AiChatWidget />
    </>
  )
}
