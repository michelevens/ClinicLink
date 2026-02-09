import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button.tsx'
import { Card } from '../components/ui/Card.tsx'
import { useAuth } from '../contexts/AuthContext.tsx'
import {
  Stethoscope, GraduationCap, Building2, BookOpen,
  Search, Clock, Shield, Star, ArrowRight, Users, CheckCircle
} from 'lucide-react'
import type { UserRole } from '../types/index.ts'

export function LandingPage() {
  const navigate = useNavigate()
  const { demoLogin } = useAuth()

  const handleDemo = (role: UserRole) => {
    demoLogin(role)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">ClinicLink</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={() => navigate('/login')}>Sign In</Button>
            <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/10" onClick={() => navigate('/register')}>Register</Button>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <Star className="w-4 h-4 text-accent-300" />
            <span className="text-sm font-medium text-white/90">The #1 Clinical Placement Platform</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Find Your Perfect<br />
            <span className="text-accent-300">Clinical Rotation</span>
          </h1>
          <p className="text-base sm:text-xl text-white/80 max-w-2xl mx-auto mb-8 sm:mb-10">
            Connecting healthcare students with clinical sites. Search rotations, apply instantly, track hours — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button size="lg" className="bg-white text-primary-600 hover:bg-white/90 w-full sm:w-auto" onClick={() => navigate('/register')}>
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 w-full sm:w-auto" onClick={() => navigate('/rotations')}>
              Browse Rotations
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {[
              { label: 'Clinical Sites', value: '2,500+' },
              { label: 'Students Placed', value: '18,000+' },
              { label: 'Programs', value: '350+' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-xl sm:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs sm:text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* How it Works */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-4">How ClinicLink Works</h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">Three simple steps to your next clinical rotation</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Search className="w-8 h-8" />, title: 'Search & Filter', desc: 'Browse hundreds of rotation sites by specialty, location, dates, and cost. Find the perfect match for your program.' },
              { icon: <CheckCircle className="w-8 h-8" />, title: 'Apply Instantly', desc: 'Submit your application with credentials and cover letter. Track status in real-time. Get matched fast.' },
              { icon: <Clock className="w-8 h-8" />, title: 'Track & Complete', desc: 'Log clinical hours, receive evaluations, and build your portfolio. Everything your program needs in one place.' },
            ].map((step, i) => (
              <Card key={step.title} hover className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold mb-3">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">{step.title}</h3>
                <p className="text-stone-600 text-sm">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Everyone */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-4">Built For Everyone in Clinical Education</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: <GraduationCap />, role: 'Students', desc: 'Find rotations, apply, track hours, build your clinical portfolio', color: 'primary' },
              { icon: <Building2 />, role: 'Clinical Sites', desc: 'List slots, manage applications, streamline student onboarding', color: 'secondary' },
              { icon: <BookOpen />, role: 'Universities', desc: 'Monitor placements, ensure compliance, generate accreditation reports', color: 'accent' },
              { icon: <Shield />, role: 'Preceptors', desc: 'Manage students, approve hours, write evaluations, earn recognition', color: 'primary' },
            ].map(item => (
              <Card key={item.role} hover>
                <div className={`w-12 h-12 rounded-xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center mb-4`}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-stone-900 mb-1">{item.role}</h3>
                <p className="text-sm text-stone-600">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Access */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-stone-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-4">Try It Now — No Sign Up Required</h2>
          <p className="text-base sm:text-lg text-stone-600 mb-8 sm:mb-10">Explore ClinicLink as any role with our demo accounts</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { role: 'student' as UserRole, label: 'Student', icon: <GraduationCap className="w-5 h-5" />, desc: 'Search & apply for rotations' },
              { role: 'site_manager' as UserRole, label: 'Site Manager', icon: <Building2 className="w-5 h-5" />, desc: 'Manage listings & applications' },
              { role: 'preceptor' as UserRole, label: 'Preceptor', icon: <Stethoscope className="w-5 h-5" />, desc: 'Supervise students & approve hours' },
              { role: 'coordinator' as UserRole, label: 'University Coordinator', icon: <BookOpen className="w-5 h-5" />, desc: 'Track placements & compliance' },
              { role: 'professor' as UserRole, label: 'Professor', icon: <Users className="w-5 h-5" />, desc: 'Monitor student progress' },
              { role: 'admin' as UserRole, label: 'Admin', icon: <Shield className="w-5 h-5" />, desc: 'Platform management' },
            ].map(demo => (
              <button
                key={demo.role}
                onClick={() => handleDemo(demo.role)}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200 hover:border-primary-300 hover:shadow-glow-primary transition-all duration-300 text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  {demo.icon}
                </div>
                <div>
                  <p className="font-medium text-stone-900 text-sm">{demo.label}</p>
                  <p className="text-xs text-stone-500">{demo.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary-400" />
            <span className="font-semibold text-white">ClinicLink</span>
          </div>
          <p className="text-sm">&copy; 2026 ClinicLink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
