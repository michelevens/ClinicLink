import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext.tsx'

export function ThemeToggle() {
  const { mode, setMode } = useTheme()

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ]

  return (
    <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setMode(value)}
          className={`p-1.5 rounded-md transition-all duration-200 ${
            mode === value
              ? 'bg-white dark:bg-stone-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
          }`}
          title={label}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  )
}
