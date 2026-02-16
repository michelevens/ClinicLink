import { useDesignVersion } from '../../contexts/DesignVersionContext.tsx'

export function DesignToggle() {
  const { version, toggle } = useDesignVersion()

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-300 hover:opacity-90 shrink-0"
      style={{
        background: version === 'v1'
          ? 'linear-gradient(135deg, #8b5cf6, #f43f5e)'
          : 'linear-gradient(135deg, #0f172a, #1e293b)',
        color: '#fff',
      }}
      title={`Switch to ${version === 'v1' ? 'V2 (Modern)' : 'V1 (Classic)'}`}
    >
      <span>{version === 'v1' ? 'V1' : 'V2'}</span>
      <div className="w-7 h-3.5 rounded-full bg-white/20 relative">
        <div
          className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-all duration-300"
          style={{ left: version === 'v1' ? '2px' : '14px' }}
        />
      </div>
    </button>
  )
}
