import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar.tsx'
import { MainLayoutV2 } from './MainLayoutV2.tsx'
import { useDesignVersion } from '../../contexts/DesignVersionContext.tsx'
import { DesignToggle } from '../ui/DesignToggle.tsx'
import { AiChatWidget } from '../ai-chat/AiChatWidget.tsx'

export function MainLayout({ children }: { children: ReactNode }) {
  const { version } = useDesignVersion()

  if (version === 'v2') {
    return (
      <>
        <MainLayoutV2>{children}</MainLayoutV2>
        <DesignToggle />
        <AiChatWidget />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-stone-50">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <DesignToggle />
      <AiChatWidget />
    </>
  )
}
