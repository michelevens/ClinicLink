import { useNavigate } from 'react-router-dom'
import { Stethoscope } from 'lucide-react'
import { Button } from '../ui/Button.tsx'

export function PublicNav() {
  const navigate = useNavigate()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">ClinicLink</span>
        </button>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button onClick={() => navigate('/rotations')} className="hover:text-primary-600 transition-colors">Browse Rotations</button>
          <button onClick={() => navigate('/pricing')} className="hover:text-primary-600 transition-colors">Pricing</button>
          <button onClick={() => navigate('/')} className="hover:text-primary-600 transition-colors">Home</button>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
          <Button size="sm" onClick={() => navigate('/register')}>Get Started</Button>
        </div>
      </div>
    </nav>
  )
}
