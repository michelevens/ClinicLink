import { useDesignVersion } from '../../contexts/DesignVersionContext.tsx'
import { Paintbrush } from 'lucide-react'

export function DesignToggle() {
  const { version, toggle } = useDesignVersion()

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl group"
      style={{
        background: version === 'v1'
          ? 'linear-gradient(135deg, #8b5cf6, #f43f5e)'
          : 'linear-gradient(135deg, #0f172a, #1e293b)',
        borderColor: version === 'v1' ? 'rgba(255,255,255,0.2)' : 'rgba(99,102,241,0.3)',
        color: '#fff',
      }}
      title={`Switch to ${version === 'v1' ? 'V2 (Modern)' : 'V1 (Classic)'}`}
    >
      <Paintbrush className="w-4 h-4" />
      <span className="text-sm font-semibold tracking-wide">
        {version === 'v1' ? 'V1' : 'V2'}
      </span>
      <span className="text-xs opacity-70 hidden sm:inline">
        {version === 'v1' ? 'Classic' : 'Modern'}
      </span>
      <div className="w-10 h-5 rounded-full bg-white/20 relative ml-1">
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300"
          style={{ left: version === 'v1' ? '2px' : '22px' }}
        />
      </div>
    </button>
  )
}
