import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

type DesignVersion = 'v1' | 'v2'

interface DesignVersionContextType {
  version: DesignVersion
  setVersion: (v: DesignVersion) => void
  toggle: () => void
}

const DesignVersionContext = createContext<DesignVersionContextType | null>(null)

const STORAGE_KEY = 'cliniclink_design_version'

export function DesignVersionProvider({ children }: { children: ReactNode }) {
  const [version, setVersionState] = useState<DesignVersion>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'v2' ? 'v2' : 'v1'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, version)
    document.documentElement.setAttribute('data-design', version)
  }, [version])

  const setVersion = useCallback((v: DesignVersion) => {
    setVersionState(v)
  }, [])

  const toggle = useCallback(() => {
    setVersionState(prev => (prev === 'v1' ? 'v2' : 'v1'))
  }, [])

  return (
    <DesignVersionContext.Provider value={{ version, setVersion, toggle }}>
      {children}
    </DesignVersionContext.Provider>
  )
}

export function useDesignVersion() {
  const ctx = useContext(DesignVersionContext)
  if (!ctx) throw new Error('useDesignVersion must be used within DesignVersionProvider')
  return ctx
}
