import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { useAuth } from '../contexts/AuthContext.tsx'
import { useSlots } from '../hooks/useApi.ts'
import {
  Stethoscope, GraduationCap, Building2, BookOpen,
  Search, Clock, Shield, ArrowRight, Users, CheckCircle,
  Zap, Award, BarChart3, Globe, Lock, FileCheck,
  Brain, Smartphone, ClipboardCheck,
  ChevronRight, Sparkles, MapPin, Calendar, Phone, Mail, ExternalLink
} from 'lucide-react'
import type { UserRole } from '../types/index.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'

export function LandingPage() {
  usePageTitle('Home')
  const navigate = useNavigate()
  const { demoLogin } = useAuth()
  const { data: slotsData } = useSlots({ status: 'open' })
  const featuredSlots = (slotsData?.data || []).slice(0, 6)

  const handleDemo = (role: UserRole) => {
    demoLogin(role)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">ClinicLink</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <button onClick={() => navigate('/rotations')} className="hover:text-primary-600 transition-colors">Browse Rotations</button>
            <a href="#how-it-works" className="hover:text-primary-600 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
            <a href="#roles" className="hover:text-primary-600 transition-colors">Who It's For</a>
            <a href="#demo" className="hover:text-primary-600 transition-colors">Demo</a>
            <button onClick={() => navigate('/pricing')} className="hover:text-primary-600 transition-colors">Pricing</button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="inline-flex items-center justify-center font-medium rounded-xl px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 transition-all duration-300" onClick={() => navigate('/login')}>Sign In</button>
            <button className="inline-flex items-center justify-center font-medium rounded-xl px-3 py-1.5 text-sm bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:-translate-y-0.5 transition-all duration-300" onClick={() => navigate('/register')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-accent-300" />
              <span className="text-sm font-medium text-white/90">The Future of Clinical Education</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              From Placement to<br />
              <span className="bg-gradient-to-r from-accent-300 to-amber-300 bg-clip-text text-transparent">Verified Credential</span>
            </h1>
            <p className="text-base sm:text-xl text-white/80 max-w-3xl mx-auto mb-4">
              The all-in-one platform that handles the <strong className="text-white">entire clinical education lifecycle</strong> — from finding a rotation to earning digitally verified credentials.
            </p>

            {/* Lifecycle Flow */}
            <div className="flex items-center justify-center gap-1 sm:gap-2 my-8 flex-wrap">
              {['Discover', 'Apply', 'Onboard', 'Track', 'Evaluate', 'Certify'].map((step, i) => (
                <span key={step} className="flex items-center gap-1 sm:gap-2">
                  <span className="px-2 sm:px-3 py-1 rounded-full bg-white/20 text-white text-xs sm:text-sm font-medium backdrop-blur-sm">
                    {step}
                  </span>
                  {i < 5 && <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/50" />}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8">
              <button className="inline-flex items-center justify-center font-medium rounded-xl px-7 py-3 text-base gap-2.5 bg-white text-primary-600 hover:bg-white/90 shadow-lg hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto" onClick={() => navigate('/register')}>
                Start Free Today <ArrowRight className="w-5 h-5" />
              </button>
              <button className="inline-flex items-center justify-center font-medium rounded-xl px-7 py-3 text-base gap-2.5 border-2 border-white/50 text-white hover:bg-white/10 transition-all duration-300 w-full sm:w-auto" onClick={() => navigate('/rotations')}>
                Browse Open Rotations
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative z-10 border-t border-white/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { label: 'Role-Based Dashboards', value: '6', icon: Building2 },
                { label: 'Lifecycle Stages', value: '7', icon: GraduationCap },
                { label: 'Compliance Tracking', value: '✓', icon: BookOpen },
                { label: 'Hour Logging & Approval', value: '✓', icon: Clock },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="w-5 h-5 text-white/60 mx-auto mb-1" />
                  <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Problem Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-medium mb-4">The Problem</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-stone-900 mb-4">Clinical Education is Broken</h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              500,000+ healthcare students need placements every year. The process is manual, opaque, and stuck in the past.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              { problem: 'Coordinators cold-call sites & manage Excel spreadsheets', icon: '📋' },
              { problem: 'Students have zero visibility into available rotations', icon: '🔍' },
              { problem: 'Compliance docs scattered across email, fax, and filing cabinets', icon: '📁' },
              { problem: 'Clinical hours logged on paper — easily lost or falsified', icon: '📝' },
              { problem: 'No way to verify a student actually completed 500 clinical hours', icon: '❌' },
              { problem: 'Universities pay $5K-$50K/year for clunky legacy tools', icon: '💸' },
            ].map(item => (
              <div key={item.problem} className="flex items-start gap-3 p-4 rounded-xl bg-red-50/50 border border-red-100">
                <span className="text-xl shrink-0">{item.icon}</span>
                <p className="text-sm text-stone-700">{item.problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm font-medium mb-4">How It Works</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-stone-900 mb-4">Three Steps to Your Next Rotation</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Search className="w-8 h-8" />, title: 'Discover & Apply', desc: 'Browse rotations by specialty, location, dates, and cost. Apply instantly with your profile and credentials. Filter across multiple criteria to find your perfect match.', step: '01' },
              { icon: <ClipboardCheck className="w-8 h-8" />, title: 'Track & Complete', desc: 'Log hours digitally with preceptor approval. Receive mid-rotation and final evaluations. Complete onboarding checklists. Everything your program needs.', step: '02' },
              { icon: <Award className="w-8 h-8" />, title: 'Certify & Advance', desc: 'Earn digital certificates with unique verification links. Build a verified credential portfolio that employers and schools can confirm instantly.', step: '03' },
            ].map(step => (
              <Card key={step.title} hover className="relative overflow-hidden">
                <span className="absolute top-4 right-4 text-5xl font-black text-primary-50">{step.step}</span>
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 text-primary-600 flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">{step.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rotations */}
      {featuredSlots.length > 0 && (
        <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <span className="inline-block px-3 py-1 rounded-full bg-green-50 text-green-600 text-sm font-medium mb-4">Open Now</span>
              <h2 className="text-2xl sm:text-4xl font-bold text-stone-900 mb-4">Available Rotations</h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                Browse real rotation opportunities posted by clinical sites. Sign up to apply.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredSlots.map(slot => {
                const weeks = Math.round((new Date(slot.end_date).getTime() - new Date(slot.start_date).getTime()) / (1000 * 60 * 60 * 24 * 7))
                const spotsLeft = slot.capacity - slot.filled
                return (
                  <Card key={slot.id} hover onClick={() => navigate('/rotations')} className="cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <Badge variant="success" size="sm">{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</Badge>
                    </div>
                    <h3 className="font-semibold text-stone-900 mb-1 line-clamp-1">{slot.title}</h3>
                    <p className="text-sm text-stone-500 mb-2">{slot.site?.name}</p>
                    <p className="text-xs text-stone-500 line-clamp-2 mb-3">{slot.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge variant="primary" size="sm">{slot.specialty}</Badge>
                      <Badge variant={slot.cost_type === 'free' ? 'success' : 'warning'} size="sm">
                        {slot.cost_type === 'free' ? 'Free' : `$${slot.cost}`}
                      </Badge>
                      <Badge variant="default" size="sm">{weeks}w</Badge>
                    </div>
                    <div className="space-y-1 text-xs text-stone-500">
                      {slot.site && (
                        <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{slot.site.city}, {slot.site.state}</div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(slot.start_date).toLocaleDateString()} - {new Date(slot.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
            <div className="text-center mt-8">
              <Button size="lg" onClick={() => navigate('/rotations')}>
                View All Rotations <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Key Features */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-secondary-50 text-secondary-600 text-sm font-medium mb-4">Platform Features</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-stone-900 mb-4">Everything You Need, Nothing You Don't</h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">From search to certification, every step is digitized, tracked, and verifiable.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Search className="w-6 h-6" />, title: 'Smart Rotation Search', desc: 'Filter by specialty, location, dates, cost, and availability. Find your ideal placement across multiple criteria.', color: 'primary' },
              { icon: <FileCheck className="w-6 h-6" />, title: 'Credential Vault', desc: 'Upload and track all credentials with expiry alerts. Monitor compliance status with traffic-light dashboards.', color: 'green' },
              { icon: <Clock className="w-6 h-6" />, title: 'Digital Hour Logging', desc: 'Log hours online with preceptor approval workflow. Track progress toward required hours with a complete audit trail.', color: 'secondary' },
              { icon: <ClipboardCheck className="w-6 h-6" />, title: 'Structured Evaluations', desc: 'Mid-rotation and final evaluations with standardized rubrics (1-5 scale). Draft, submit, and review evaluations digitally.', color: 'amber' },
              { icon: <Lock className="w-6 h-6" />, title: 'Verified Credentials', desc: 'Earn completion certificates with unique verification links. Employers and schools can verify credentials instantly.', color: 'purple' },
              { icon: <Search className="w-6 h-6" />, title: 'Multi-Criteria Search', desc: 'Filter rotations by specialty, schedule, location, cost, and availability to find the right match for your program.', color: 'rose' },
              { icon: <BarChart3 className="w-6 h-6" />, title: 'Compliance Dashboard', desc: 'Real-time placement tracking, hour summaries, credential status, and compliance overview for every stakeholder.', color: 'indigo' },
              { icon: <Zap className="w-6 h-6" />, title: 'Compliance Tracking', desc: 'Manage affiliation agreements, onboarding checklists, and credential requirements with status tracking dashboards.', color: 'orange' },
              { icon: <Smartphone className="w-6 h-6" />, title: 'Responsive Design', desc: 'Works on any device — desktop, tablet, or phone. Manage rotations, log hours, and review applications on the go.', color: 'teal' },
            ].map(feature => (
              <Card key={feature.title} hover>
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-50 text-${feature.color}-600 flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Built For Everyone */}
      <section id="roles" className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm font-medium mb-4">For Everyone</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-stone-900 mb-4">Built For Every Role in Clinical Education</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: <GraduationCap className="w-6 h-6" />,
                role: 'Students',
                tagline: 'Find, apply, and complete rotations with ease',
                features: ['Filter-based rotation search', 'One-click applications', 'Digital hour logging', 'Credential tracking with alerts', 'Verified completion certificates'],
                color: 'primary',
              },
              {
                icon: <Building2 className="w-6 h-6" />,
                role: 'Clinical Sites',
                tagline: 'Fill slots faster, manage students effortlessly',
                features: ['Create rotation listings', 'Review applications in bulk', 'Track student compliance', 'Manage preceptor assignments', 'Onboarding checklists'],
                color: 'secondary',
              },
              {
                icon: <BookOpen className="w-6 h-6" />,
                role: 'Universities',
                tagline: 'Monitor, comply, and report — automatically',
                features: ['Real-time placement dashboards', 'Credential tracking with alerts', 'Manage affiliation agreements', 'Student compliance overview', 'Program and roster management'],
                color: 'accent',
              },
              {
                icon: <Shield className="w-6 h-6" />,
                role: 'Preceptors',
                tagline: 'Teach, evaluate, and earn recognition',
                features: ['Approve hours digitally', 'Structured evaluation rubrics', 'Earn CE credit hours', 'Grow your precepting experience', 'Track your precepting activity'],
                color: 'primary',
              },
            ].map(item => (
              <Card key={item.role} hover>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center shrink-0`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900">{item.role}</h3>
                    <p className="text-sm text-stone-500 mb-3">{item.tagline}</p>
                    <ul className="space-y-1.5">
                      {item.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-stone-600">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Edge */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-stone-900 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4">Why ClinicLink Wins</h2>
          <p className="text-lg text-stone-400 mb-10 max-w-2xl mx-auto">
            Legacy platforms like Exxat and Core ELMS charge $5K-$50K/year and do half of what we offer.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { title: 'All-in-One', desc: 'Search, apply, track, evaluate, certify — no more stitching together 5 tools', icon: <Globe className="w-6 h-6" /> },
              { title: 'Instantly Verifiable', desc: 'Every certificate includes a unique verification link — employers can confirm credentials in seconds', icon: <Lock className="w-6 h-6" /> },
              { title: 'Purpose-Built', desc: 'Designed specifically for clinical education with role-specific workflows for students, preceptors, sites, and universities', icon: <Brain className="w-6 h-6" /> },
            ].map(item => (
              <div key={item.title} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-stone-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Trust */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { quote: "Imagine eliminating your placement scramble. Students browse and apply for rotations themselves.", author: 'University Coordinator', title: 'Example use case', icon: <BookOpen className="w-5 h-5" /> },
              { quote: "Search available rotations, apply with one click, and track your hours — all in one place.", author: 'Nursing Student', title: 'Example use case', icon: <GraduationCap className="w-5 h-5" /> },
              { quote: "Manage all your rotation slots, review applications, and track student compliance from one dashboard.", author: 'Site Manager', title: 'Example use case', icon: <Building2 className="w-5 h-5" /> },
            ].map(item => (
              <Card key={item.author}>
                <div className="flex gap-1 mb-3">
                  <Badge variant="default" size="sm">Demo Example</Badge>
                </div>
                <p className="text-sm text-stone-700 mb-4 italic">"{item.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{item.author}</p>
                    <p className="text-xs text-stone-500">{item.title}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Access */}
      <section id="demo" className="py-12 sm:py-20 px-4 sm:px-6 bg-stone-50">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm font-medium mb-4">Live Demo</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-4">See It In Action — No Sign Up Required</h2>
          <p className="text-base sm:text-lg text-stone-600 mb-8 sm:mb-10">Explore ClinicLink instantly as any role</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { role: 'student' as UserRole, label: 'Student', icon: <GraduationCap className="w-5 h-5" />, desc: 'Search rotations, apply, track hours' },
              { role: 'site_manager' as UserRole, label: 'Site Manager', icon: <Building2 className="w-5 h-5" />, desc: 'Create slots, review applications' },
              { role: 'preceptor' as UserRole, label: 'Preceptor', icon: <Stethoscope className="w-5 h-5" />, desc: 'Approve hours, write evaluations' },
              { role: 'coordinator' as UserRole, label: 'Coordinator', icon: <BookOpen className="w-5 h-5" />, desc: 'Monitor placements, run reports' },
              { role: 'professor' as UserRole, label: 'Professor', icon: <Users className="w-5 h-5" />, desc: 'Track student progress' },
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
                <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-primary-500 ml-auto transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-primary-600 to-secondary-500 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4">Ready to Transform Clinical Education?</h2>
          <p className="text-lg text-white/80 mb-8">
            Join students, clinical sites, and universities building the future of clinical education.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="inline-flex items-center justify-center font-medium rounded-xl px-7 py-3 text-base gap-2.5 bg-white text-primary-600 hover:bg-white/90 shadow-lg hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto" onClick={() => navigate('/register')}>
              Create Free Account <ArrowRight className="w-5 h-5" />
            </button>
            <button className="inline-flex items-center justify-center font-medium rounded-xl px-7 py-3 text-base gap-2.5 border-2 border-white/50 text-white hover:bg-white/10 transition-all duration-300 w-full sm:w-auto" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope className="w-5 h-5 text-primary-400" />
                <span className="font-semibold text-white">ClinicLink</span>
              </div>
              <p className="text-sm text-stone-500">The all-in-one clinical rotation platform.</p>
            </div>
            <div>
              <h4 className="font-medium text-white text-sm mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/rotations')} className="hover:text-white transition-colors">Search Rotations</button></li>
                <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors">Create Account</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Sign In</button></li>
                <li><button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white text-sm mb-3">For</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-white transition-colors cursor-default">Students</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Clinical Sites</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Universities</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Preceptors</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://www.linkedin.com/company/acsyom-analytics" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                    About Acsyom Analytics <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/in/evensmichel/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                    Our Founder <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="mailto:contact@cliniclink.health" className="hover:text-white transition-colors flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Contact Us
                  </a>
                </li>
                <li>
                  <a href="tel:+14074627233" className="hover:text-white transition-colors flex items-center gap-1">
                    <Phone className="w-3 h-3" /> 407-462-7233
                  </a>
                </li>
                <li><button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
              </ul>
              <div className="mt-4 p-3 bg-stone-800/50 rounded-lg">
                <p className="text-xs text-stone-500 leading-relaxed">
                  <span className="text-stone-400 font-medium">Acsyom Analytics</span> is a technology company founded by{' '}
                  <a href="https://www.linkedin.com/in/evensmichel/" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors underline">
                    Evens Michel, MBA, MSEE
                  </a>
                  , specializing in healthcare technology, clinical education, and enterprise software.
                </p>
                <p className="text-xs text-stone-500 mt-2">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 inline" /> Clermont, FL</span>
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs">&copy; {new Date().getFullYear()} ClinicLink &mdash; A product of{' '}
              <a href="https://www.linkedin.com/company/acsyom-analytics" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Acsyom Analytics
              </a>
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Clermont, FL</span>
              <a href="tel:+14074627233" className="flex items-center gap-1 hover:text-white transition-colors"><Phone className="w-3 h-3" /> 407-462-7233</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
