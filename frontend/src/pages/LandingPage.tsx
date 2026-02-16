import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button.tsx'
import { useAuth } from '../contexts/AuthContext.tsx'
import { useSlots } from '../hooks/useApi.ts'
import {
  Stethoscope, GraduationCap, Building2, BookOpen,
  Search, Clock, Shield, ArrowRight, Users, CheckCircle2,
  Award, BarChart3, Globe, Lock, FileCheck,
  Brain, ClipboardCheck,
  ChevronRight, MapPin, Calendar, Phone, Mail, ExternalLink
} from 'lucide-react'
import type { UserRole } from '../types/index.ts'

export function LandingPage() {
  const navigate = useNavigate()
  const { demoLogin } = useAuth()
  const { data: slotsData } = useSlots({ status: 'open' })
  const featuredSlots = (slotsData?.data || []).slice(0, 6)

  const handleDemo = (role: UserRole) => {
    demoLogin(role)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Stethoscope className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900 heading-serif">ClinicLink</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-500">
            <button onClick={() => navigate('/rotations')} className="hover:text-slate-900 transition-colors">Rotations</button>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#roles" className="hover:text-slate-900 transition-colors">Who It's For</a>
            <a href="#demo" className="hover:text-slate-900 transition-colors">Demo</a>
            <button onClick={() => navigate('/pricing')} className="hover:text-slate-900 transition-colors">Pricing</button>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-slate-600 hover:text-slate-900 transition-colors px-4 py-2" onClick={() => navigate('/login')}>Sign In</button>
            <button className="text-sm font-medium bg-primary-600 text-white rounded-lg px-5 py-2.5 hover:bg-primary-700 transition-colors" onClick={() => navigate('/register')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <header className="pt-28 pb-24 sm:pt-36 sm:pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 mb-10">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-xs font-medium text-primary-700 tracking-wide uppercase">The Future of Clinical Education</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl text-slate-900 mb-6 leading-[1.08] heading-serif">
              From Placement to{' '}
              <span className="text-primary-600">Verified Credential</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto mb-12 leading-relaxed">
              The all-in-one platform that handles the entire clinical education lifecycle — from finding a rotation to earning digitally verified credentials.
            </p>

            {/* Lifecycle Flow */}
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-12 flex-wrap">
              {['Discover', 'Apply', 'Onboard', 'Track', 'Evaluate', 'Certify'].map((step, i) => (
                <span key={step} className="flex items-center gap-1 sm:gap-2">
                  <span className="px-3 sm:px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-xs sm:text-sm font-medium">
                    {step}
                  </span>
                  {i < 5 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="font-medium rounded-lg px-8 py-3.5 text-base bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center" onClick={() => navigate('/register')}>
                Start Free Today <ArrowRight className="w-4 h-4" />
              </button>
              <button className="font-medium rounded-lg px-8 py-3.5 text-base border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all duration-200 w-full sm:w-auto" onClick={() => navigate('/rotations')}>
                Browse Open Rotations
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { label: 'Role-Based Dashboards', value: '6', icon: Building2 },
              { label: 'Lifecycle Stages', value: '7', icon: GraduationCap },
              { label: 'Compliance Tracking', value: '100%', icon: BookOpen },
              { label: 'Hour Logging', value: 'Live', icon: Clock },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-4.5 h-4.5 text-slate-600" />
                </div>
                <p className="text-2xl font-semibold text-slate-900 heading-serif">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ─── Problem ─── */}
      <section className="section-padding bg-slate-50/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-4">The Problem</p>
            <h2 className="text-3xl sm:text-4xl text-slate-900 leading-tight heading-serif">
              Clinical Education is Broken
            </h2>
            <p className="text-base text-slate-500 max-w-lg mx-auto mt-5 leading-relaxed">
              500,000+ healthcare students need placements every year. The process is manual, opaque, and stuck in the past.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { problem: 'Coordinators cold-call sites & manage Excel spreadsheets', icon: '📋' },
              { problem: 'Students have zero visibility into available rotations', icon: '🔍' },
              { problem: 'Compliance docs scattered across email, fax, and filing cabinets', icon: '📁' },
              { problem: 'Clinical hours logged on paper — easily lost or falsified', icon: '📝' },
              { problem: 'No way to verify a student actually completed 500 clinical hours', icon: '❌' },
              { problem: 'Universities pay $5K-$50K/year for clunky legacy tools', icon: '💸' },
            ].map(item => (
              <div key={item.problem} className="flex items-start gap-3 p-5 rounded-xl bg-white border border-slate-200/60">
                <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                <p className="text-sm text-slate-600 leading-relaxed">{item.problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="section-padding bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-4">How It Works</p>
            <h2 className="text-3xl sm:text-4xl text-slate-900 heading-serif">Three Steps to Your Next Rotation</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: <Search className="w-6 h-6" />, title: 'Discover & Apply', desc: 'Browse rotations by specialty, location, dates, and cost. Apply instantly with your profile and credentials.', step: '01' },
              { icon: <ClipboardCheck className="w-6 h-6" />, title: 'Track & Complete', desc: 'Log hours digitally with preceptor approval. Receive mid-rotation and final evaluations. Complete onboarding checklists.', step: '02' },
              { icon: <Award className="w-6 h-6" />, title: 'Certify & Advance', desc: 'Earn digital certificates with unique verification links. Build a verified credential portfolio employers can confirm instantly.', step: '03' },
            ].map(step => (
              <div key={step.title} className="relative p-8 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-primary-200 transition-all duration-300 group">
                <span className="absolute top-6 right-6 text-5xl font-bold text-slate-100 group-hover:text-primary-100 transition-colors">{step.step}</span>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-lg text-slate-900 mb-2 heading-serif">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Rotations ─── */}
      {featuredSlots.length > 0 && (
        <section className="section-padding bg-slate-50/80">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold text-secondary-600 uppercase tracking-widest mb-4">Open Now</p>
              <h2 className="text-3xl sm:text-4xl text-slate-900 heading-serif">Available Rotations</h2>
              <p className="text-base text-slate-500 max-w-lg mx-auto mt-5 leading-relaxed">
                Browse real rotation opportunities posted by clinical sites.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredSlots.map(slot => {
                const weeks = Math.round((new Date(slot.end_date).getTime() - new Date(slot.start_date).getTime()) / (1000 * 60 * 60 * 24 * 7))
                const spotsLeft = slot.capacity - slot.filled
                return (
                  <div key={slot.id} onClick={() => navigate('/rotations')} className="card-clean p-6 cursor-pointer hover:border-primary-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <span className="tag bg-secondary-50 text-secondary-700 border border-secondary-200">{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">{slot.title}</h3>
                    <p className="text-sm text-slate-500 mb-3">{slot.site?.name}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="tag bg-primary-50 text-primary-700">{slot.specialty}</span>
                      <span className={`tag ${slot.cost_type === 'free' ? 'bg-secondary-50 text-secondary-700' : 'bg-amber-50 text-amber-700'}`}>
                        {slot.cost_type === 'free' ? 'Free' : `$${slot.cost}`}
                      </span>
                      <span className="tag bg-slate-100 text-slate-600">{weeks}w</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-500">
                      {slot.site && (
                        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{slot.site.city}, {slot.site.state}</div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(slot.start_date).toLocaleDateString()} - {new Date(slot.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="text-center mt-12">
              <Button size="lg" onClick={() => navigate('/rotations')}>
                View All Rotations <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ─── Key Features ─── */}
      <section id="features" className="section-padding bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-4">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl text-slate-900 heading-serif">Everything You Need, Nothing You Don't</h2>
            <p className="text-base text-slate-500 max-w-lg mx-auto mt-5">From search to certification, every step is digitized, tracked, and verifiable.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: <Search className="w-5 h-5" />, title: 'Smart Rotation Search', desc: 'Filter by specialty, location, dates, cost, and availability. Find your ideal placement instantly.', color: 'text-blue-600 bg-blue-50' },
              { icon: <FileCheck className="w-5 h-5" />, title: 'Credential Vault', desc: 'Upload and track all credentials with expiry alerts. Traffic-light compliance dashboards.', color: 'text-secondary-600 bg-secondary-50' },
              { icon: <Clock className="w-5 h-5" />, title: 'Digital Hour Logging', desc: 'Log hours online with preceptor approval workflow. Track progress with a complete audit trail.', color: 'text-primary-600 bg-primary-50' },
              { icon: <ClipboardCheck className="w-5 h-5" />, title: 'Structured Evaluations', desc: 'Mid-rotation and final evaluations with rubrics. Draft, submit, and review evaluations digitally.', color: 'text-amber-600 bg-amber-50' },
              { icon: <Lock className="w-5 h-5" />, title: 'Verified Credentials', desc: 'Earn certificates with unique verification links. Employers can confirm credentials instantly.', color: 'text-violet-600 bg-violet-50' },
              { icon: <BarChart3 className="w-5 h-5" />, title: 'Compliance Dashboard', desc: 'Real-time placement tracking, hour summaries, credential status for every stakeholder.', color: 'text-rose-600 bg-rose-50' },
            ].map(feature => (
              <div key={feature.title} className="p-6 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all duration-300">
                <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center mb-5`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 heading-serif text-base">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Built For Everyone ─── */}
      <section id="roles" className="section-padding bg-slate-50/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-4">For Everyone</p>
            <h2 className="text-3xl sm:text-4xl text-slate-900 heading-serif">Built For Every Role in Clinical Education</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: <GraduationCap className="w-5 h-5" />,
                role: 'Students',
                tagline: 'Find, apply, and complete rotations with ease',
                features: ['Filter-based rotation search', 'One-click applications', 'Digital hour logging', 'Credential tracking with alerts', 'Verified completion certificates'],
                color: 'text-blue-600 bg-blue-50',
              },
              {
                icon: <Building2 className="w-5 h-5" />,
                role: 'Clinical Sites',
                tagline: 'Fill slots faster, manage students effortlessly',
                features: ['Create rotation listings', 'Review applications in bulk', 'Track student compliance', 'Manage preceptor assignments', 'Onboarding checklists'],
                color: 'text-secondary-600 bg-secondary-50',
              },
              {
                icon: <BookOpen className="w-5 h-5" />,
                role: 'Universities',
                tagline: 'Monitor, comply, and report — automatically',
                features: ['Real-time placement dashboards', 'Credential tracking with alerts', 'Manage affiliation agreements', 'Student compliance overview', 'Program and roster management'],
                color: 'text-amber-600 bg-amber-50',
              },
              {
                icon: <Shield className="w-5 h-5" />,
                role: 'Preceptors',
                tagline: 'Teach, evaluate, and earn recognition',
                features: ['Approve hours digitally', 'Structured evaluation rubrics', 'Earn CE credit hours', 'Grow your precepting experience', 'Track your precepting activity'],
                color: 'text-primary-600 bg-primary-50',
              },
            ].map(item => (
              <div key={item.role} className="card-clean p-7">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg text-slate-900 heading-serif">{item.role}</h3>
                    <p className="text-sm text-slate-500 mb-4">{item.tagline}</p>
                    <ul className="space-y-2.5">
                      {item.features.map(f => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-secondary-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why ClinicLink ─── */}
      <section className="section-padding section-navy">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl text-white mb-4 heading-serif">Why ClinicLink Wins</h2>
          <p className="text-base text-navy-300 mb-16 max-w-lg mx-auto leading-relaxed">
            Legacy platforms like Exxat and Core ELMS charge $5K-$50K/year and do half of what we offer.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { title: 'All-in-One', desc: 'Search, apply, track, evaluate, certify — no more stitching together 5 tools', icon: <Globe className="w-5 h-5" /> },
              { title: 'Instantly Verifiable', desc: 'Every certificate includes a unique verification link — employers can confirm in seconds', icon: <Lock className="w-5 h-5" /> },
              { title: 'Purpose-Built', desc: 'Designed specifically for clinical education with role-specific workflows for every stakeholder', icon: <Brain className="w-5 h-5" /> },
            ].map(item => (
              <div key={item.title} className="p-7 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary-400/15 text-primary-300 flex items-center justify-center mx-auto mb-5">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-white mb-2 heading-serif">{item.title}</h3>
                <p className="text-sm text-navy-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { quote: "Imagine eliminating your placement scramble. Students browse and apply for rotations themselves.", author: 'University Coordinator', title: 'Example use case', icon: <BookOpen className="w-5 h-5" /> },
              { quote: "Search available rotations, apply with one click, and track your hours — all in one place.", author: 'Nursing Student', title: 'Example use case', icon: <GraduationCap className="w-5 h-5" /> },
              { quote: "Manage all your rotation slots, review applications, and track student compliance from one dashboard.", author: 'Site Manager', title: 'Example use case', icon: <Building2 className="w-5 h-5" /> },
            ].map(item => (
              <div key={item.author} className="p-6 rounded-2xl bg-slate-50/80 border border-slate-100">
                <div className="mb-4">
                  <span className="tag bg-slate-100 text-slate-500">Demo Example</span>
                </div>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed italic">"{item.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.author}</p>
                    <p className="text-xs text-slate-400">{item.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Demo Access ─── */}
      <section id="demo" className="section-padding bg-slate-50/80">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-4">Live Demo</p>
          <h2 className="text-3xl sm:text-4xl text-slate-900 mb-4 heading-serif">See It In Action</h2>
          <p className="text-base text-slate-500 mb-12">Explore ClinicLink instantly as any role — no sign up required.</p>
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
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200/60 hover:border-primary-300 hover:shadow-sm transition-all duration-200 text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-100 transition-colors shrink-0">
                  {demo.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 text-sm">{demo.label}</p>
                  <p className="text-xs text-slate-500">{demo.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 ml-auto shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="section-padding bg-primary-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl text-white mb-4 heading-serif">Ready to Transform Clinical Education?</h2>
          <p className="text-base text-primary-100/80 mb-10 leading-relaxed">
            Join students, clinical sites, and universities building the future of clinical education.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="font-medium rounded-lg px-8 py-3.5 text-base bg-white text-primary-700 hover:bg-primary-50 transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center" onClick={() => navigate('/register')}>
              Create Free Account <ArrowRight className="w-4 h-4" />
            </button>
            <button className="font-medium rounded-lg px-8 py-3.5 text-base border border-white/30 text-white hover:bg-white/10 transition-all duration-200 w-full sm:w-auto" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="section-navy text-navy-300 py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="w-4.5 h-4.5 text-primary-400" />
                <span className="font-semibold text-white heading-serif">ClinicLink</span>
              </div>
              <p className="text-sm text-navy-400 leading-relaxed">The all-in-one clinical rotation platform for healthcare education.</p>
            </div>
            <div>
              <h4 className="font-medium text-white text-sm mb-4">Platform</h4>
              <ul className="space-y-2.5 text-sm">
                <li><button onClick={() => navigate('/rotations')} className="hover:text-white transition-colors">Search Rotations</button></li>
                <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors">Create Account</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Sign In</button></li>
                <li><button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white text-sm mb-4">For</h4>
              <ul className="space-y-2.5 text-sm text-navy-400">
                <li>Students</li>
                <li>Clinical Sites</li>
                <li>Universities</li>
                <li>Preceptors</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white text-sm mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="https://www.linkedin.com/company/acsyom-analytics" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1.5">
                    About Acsyom Analytics <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/in/evensmichel/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1.5">
                    Our Founder <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="mailto:contact@cliniclink.health" className="hover:text-white transition-colors inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> contact@cliniclink.health
                  </a>
                </li>
                <li>
                  <a href="tel:+14074627233" className="hover:text-white transition-colors inline-flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> 407-462-7233
                  </a>
                </li>
                <li><button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
              </ul>
              <div className="mt-5 p-4 bg-white/5 rounded-lg border border-white/5">
                <p className="text-xs text-navy-400 leading-relaxed">
                  <span className="text-navy-300 font-medium">Acsyom Analytics</span> — founded by{' '}
                  <a href="https://www.linkedin.com/in/evensmichel/" target="_blank" rel="noopener noreferrer" className="text-navy-300 hover:text-white transition-colors underline">
                    Evens Michel, MBA, MSEE
                  </a>
                </p>
                <p className="text-xs text-navy-400 mt-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Clermont, FL
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-navy-400">&copy; {new Date().getFullYear()} ClinicLink &mdash; A product of{' '}
              <a href="https://www.linkedin.com/company/acsyom-analytics" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Acsyom Analytics</a>
            </p>
            <div className="flex items-center gap-5 text-xs text-navy-400">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Clermont, FL</span>
              <a href="tel:+14074627233" className="flex items-center gap-1 hover:text-white transition-colors"><Phone className="w-3 h-3" /> 407-462-7233</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
