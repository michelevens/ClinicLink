import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { useAuth } from '../contexts/AuthContext.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { universitiesApi, sitesApi, studentApi, type ApiUniversity, type ApiProgram, type ApiSite, type NpiResult } from '../services/api.ts'
import { NpiLookup } from '../components/ui/NpiLookup.tsx'
import { toast } from 'sonner'
import {
  Stethoscope, User, GraduationCap, Heart, ShieldCheck,
  MapPin, Building2, BookOpen, CheckCircle, ChevronRight,
  ChevronLeft, Sparkles, Upload, Phone, ArrowRight,
  Search, Star, Globe, Award, Clock, Users, Shield,
  FileText, Briefcase, Activity
} from 'lucide-react'

/* ─────────────────────────────────────────
   Step Definitions
   ───────────────────────────────────────── */

interface StepDef {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  gradient: string        // background gradient for this step
  iconBg: string          // icon circle gradient
}

const mkSteps = (role: string): StepDef[] => {
  const base: StepDef[] = [
    { id: 'welcome', title: 'Welcome to ClinicLink', subtitle: 'Let\'s set up your profile', icon: <Sparkles className="w-7 h-7" />, gradient: 'from-amber-400 via-orange-300 to-rose-300', iconBg: 'from-amber-500 to-orange-500' },
    { id: 'personal', title: 'Personal Information', subtitle: 'Tell us about yourself', icon: <User className="w-7 h-7" />, gradient: 'from-orange-300 via-rose-300 to-pink-300', iconBg: 'from-rose-500 to-pink-500' },
  ]
  if (role === 'student') {
    base.push(
      { id: 'academic', title: 'Academic Details', subtitle: 'Your university and program', icon: <GraduationCap className="w-7 h-7" />, gradient: 'from-rose-300 via-purple-300 to-indigo-300', iconBg: 'from-purple-500 to-indigo-500' },
      { id: 'interests', title: 'Clinical Interests', subtitle: 'What specialties excite you?', icon: <Heart className="w-7 h-7" />, gradient: 'from-purple-300 via-indigo-300 to-blue-300', iconBg: 'from-indigo-500 to-blue-500' },
      { id: 'credentials', title: 'Credentials', subtitle: 'Upload your certifications', icon: <ShieldCheck className="w-7 h-7" />, gradient: 'from-indigo-300 via-blue-300 to-cyan-300', iconBg: 'from-blue-500 to-cyan-500' },
    )
  } else if (role === 'preceptor') {
    base.push(
      { id: 'site', title: 'Clinical Site', subtitle: 'Select your affiliated site', icon: <Building2 className="w-7 h-7" />, gradient: 'from-rose-300 via-purple-300 to-indigo-300', iconBg: 'from-purple-500 to-indigo-500' },
      { id: 'clinical', title: 'Clinical Specialties', subtitle: 'Your areas of expertise', icon: <Stethoscope className="w-7 h-7" />, gradient: 'from-purple-300 via-indigo-300 to-blue-300', iconBg: 'from-indigo-500 to-blue-500' },
    )
  } else if (role === 'site_manager') {
    base.push(
      { id: 'facility', title: 'Facility Setup', subtitle: 'About your clinical site', icon: <Building2 className="w-7 h-7" />, gradient: 'from-rose-300 via-purple-300 to-indigo-300', iconBg: 'from-purple-500 to-indigo-500' },
      { id: 'specialties', title: 'Specialties & EHR', subtitle: 'What your facility offers', icon: <Activity className="w-7 h-7" />, gradient: 'from-purple-300 via-indigo-300 to-blue-300', iconBg: 'from-indigo-500 to-blue-500' },
    )
  } else if (role === 'coordinator' || role === 'professor') {
    base.push(
      { id: 'university', title: 'University Details', subtitle: 'Your institution and department', icon: <BookOpen className="w-7 h-7" />, gradient: 'from-rose-300 via-purple-300 to-indigo-300', iconBg: 'from-purple-500 to-indigo-500' },
    )
  } else if (role === 'practitioner') {
    base.push(
      { id: 'profession', title: 'Professional Info', subtitle: 'Your credentials and specialty', icon: <Briefcase className="w-7 h-7" />, gradient: 'from-rose-300 via-teal-300 to-cyan-300', iconBg: 'from-teal-500 to-cyan-500' },
      { id: 'practice', title: 'Practice Details', subtitle: 'Where you practice', icon: <MapPin className="w-7 h-7" />, gradient: 'from-teal-300 via-cyan-300 to-blue-300', iconBg: 'from-cyan-500 to-blue-500' },
      { id: 'documents', title: 'Documents', subtitle: 'Upload license & insurance', icon: <FileText className="w-7 h-7" />, gradient: 'from-cyan-300 via-blue-300 to-indigo-300', iconBg: 'from-blue-500 to-indigo-500' },
    )
  }
  base.push(
    { id: 'complete', title: 'You\'re All Set!', subtitle: 'Welcome to ClinicLink', icon: <CheckCircle className="w-7 h-7" />, gradient: 'from-emerald-300 via-teal-300 to-cyan-300', iconBg: 'from-emerald-500 to-teal-500' },
  )
  return base
}

const SPECIALTIES = [
  'Emergency Medicine', 'ICU/Critical Care', 'Medical-Surgical', 'Pediatrics',
  'Family Practice', 'Behavioral Health', 'OB/GYN', 'Oncology', 'Geriatrics',
  'Physical Therapy', 'Occupational Therapy', 'Clinical Social Work',
  'Urgent Care', 'Surgery', 'Internal Medicine', 'Community Health',
  'Psychiatry', 'Cardiology', 'Neurology', 'Orthopedics',
]

const EHR_OPTIONS = ['Epic', 'Cerner', 'Athenahealth', 'eClinicalWorks', 'NextGen', 'Allscripts', 'Meditech', 'Other']

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

/* ─────────────────────────────────────────
   Confetti Component (CSS-only)
   ───────────────────────────────────────── */

function Confetti() {
  const colors = ['#f59e0b', '#0ea5e9', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#14b8a6']
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 1.5 + Math.random() * 1.5,
    color: colors[i % colors.length],
    rotation: Math.random() * 360,
    size: 4 + Math.random() * 6,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: `${p.size}px`,
            height: `${p.size * 1.5}px`,
            backgroundColor: p.color,
            borderRadius: p.id % 3 === 0 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────
   Animated Checkmark SVG
   ───────────────────────────────────────── */

function AnimatedCheck() {
  return (
    <div className="relative w-28 h-28 mx-auto">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 animate-scale-in shadow-2xl shadow-emerald-500/30" />
      <svg className="absolute inset-0 w-full h-full p-6" viewBox="0 0 50 50">
        <path
          className="animate-draw-check"
          d="M14 27 L22 35 L37 16"
          fill="none"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* Glow rings */}
      <div className="absolute inset-0 rounded-full animate-ping-slow opacity-20 bg-emerald-400" />
    </div>
  )
}

/* ─────────────────────────────────────────
   CSS Styles (injected once)
   ───────────────────────────────────────── */

const styleId = 'onboarding-styles'

function injectStyles() {
  if (document.getElementById(styleId)) return
  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    @keyframes confetti-fall {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    .animate-confetti {
      animation: confetti-fall linear forwards;
    }

    @keyframes scale-in {
      0% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1.15); }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-scale-in {
      animation: scale-in 0.6s ease-out forwards;
    }

    @keyframes draw-check {
      0% { stroke-dashoffset: 50; }
      100% { stroke-dashoffset: 0; }
    }
    .animate-draw-check {
      stroke-dasharray: 50;
      stroke-dashoffset: 50;
      animation: draw-check 0.6s ease-out 0.3s forwards;
    }

    @keyframes ping-slow {
      0% { transform: scale(1); opacity: 0.25; }
      100% { transform: scale(1.8); opacity: 0; }
    }
    .animate-ping-slow {
      animation: ping-slow 1.5s ease-out infinite;
    }

    @keyframes slide-up-fade {
      0% { transform: translateY(24px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    .animate-slide-up {
      animation: slide-up-fade 0.4s ease-out forwards;
    }

    @keyframes float-slow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    .animate-float {
      animation: float-slow 4s ease-in-out infinite;
    }

    @keyframes float-slow-2 {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-8px) rotate(3deg); }
    }
    .animate-float-2 {
      animation: float-slow-2 5s ease-in-out infinite;
    }

    @keyframes progress-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    .animate-progress-pulse {
      animation: progress-pulse 2s ease-in-out infinite;
    }

    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animate-gradient {
      background-size: 200% 200%;
      animation: gradient-shift 8s ease infinite;
    }
  `
  document.head.appendChild(style)
}

/* ─────────────────────────────────────────
   Main Onboarding Component
   ───────────────────────────────────────── */

export function Onboarding() {
  usePageTitle('Welcome')
  const { user, completeOnboarding } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Form state — personal
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')

  // Student — academic (pre-populate from registration if available)
  const [universities, setUniversities] = useState<ApiUniversity[]>([])
  const [programs, setPrograms] = useState<ApiProgram[]>([])
  const [universityId, setUniversityId] = useState(user?.universityId || '')
  const [programId, setProgramId] = useState(user?.programId || '')
  const [universitySearch, setUniversitySearch] = useState('')
  const [graduationDate, setGraduationDate] = useState('')
  const [gpa, setGpa] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const universityFromRegistration = !!(user?.universityId)

  // Preceptor — site & specialties
  const [sites, setSites] = useState<ApiSite[]>([])
  const [siteSearch, setSiteSearch] = useState('')
  const [selectedSiteId, setSelectedSiteId] = useState('')

  // NPI (optional — for preceptors and site managers)
  const [npiNumber, setNpiNumber] = useState('')

  // Site manager — facility
  const [facilityName, setFacilityName] = useState('')
  const [facilityAddress, setFacilityAddress] = useState('')
  const [facilityCity, setFacilityCity] = useState('')
  const [facilityState, setFacilityState] = useState('')
  const [facilityZip, setFacilityZip] = useState('')
  const [facilityPhone, setFacilityPhone] = useState('')
  const [facilityDescription, setFacilityDescription] = useState('')
  const [facilitySpecialties, setFacilitySpecialties] = useState<string[]>([])
  const [ehrSystem, setEhrSystem] = useState('')

  // Student — credential uploads
  const [uploadedCreds, setUploadedCreds] = useState<Record<string, string>>({})
  const [uploadingCred, setUploadingCred] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleCredentialUpload = async (credType: string, credName: string, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB')
      return
    }
    setUploadingCred(credType)
    try {
      const { credential } = await studentApi.addCredential({ type: credType, name: credName, status: 'pending' })
      await studentApi.uploadCredentialFile(credential.id, file)
      setUploadedCreds(prev => ({ ...prev, [credType]: file.name }))
      toast.success(`${credName} uploaded successfully`)
    } catch {
      toast.error(`Failed to upload ${credName}`)
    } finally {
      setUploadingCred(null)
    }
  }

  // Coordinator / Professor — university
  const [coordUniversityId, setCoordUniversityId] = useState('')
  const [coordUniversitySearch, setCoordUniversitySearch] = useState('')
  const [department, setDepartment] = useState('')

  // Practitioner — profession, practice, documents
  const [professionType, setProfessionType] = useState<'np' | 'pa' | ''>('')
  const [practitionerStates, setPractitionerStates] = useState<string[]>([])
  const [primarySpecialty, setPrimarySpecialty] = useState('')
  const [yearsInPractice, setYearsInPractice] = useState('')
  const [currentEmployer, setCurrentEmployer] = useState('')
  const [practitionerNpi, setPractitionerNpi] = useState('')
  const [licenseNumbers, setLicenseNumbers] = useState<Record<string, string>>({})
  const [malpracticeConfirmed, setMalpracticeConfirmed] = useState(false)
  const [licenseDocFile, setLicenseDocFile] = useState<string | null>(null)
  const [malpracticeDocFile, setMalpracticeDocFile] = useState<string | null>(null)
  const [uploadingPractDoc, setUploadingPractDoc] = useState<string | null>(null)
  const practDocInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Inject CSS animations
  useEffect(() => { injectStyles() }, [])

  // Fetch universities + pre-populate search text if university was set during registration
  useEffect(() => {
    universitiesApi.list({ page: 1 }).then(res => {
      const list = res.data || []
      setUniversities(list)
      if (user?.universityId) {
        const match = list.find((u: ApiUniversity) => u.id === user.universityId)
        if (match) setUniversitySearch(match.name)
      }
    }).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch programs when university changes (students)
  useEffect(() => {
    if (!universityId) { setPrograms([]); return }
    universitiesApi.programs(universityId).then(res => {
      setPrograms(Array.isArray(res) ? res : [])
    }).catch(() => {})
  }, [universityId])

  // Fetch sites (preceptors)
  useEffect(() => {
    if (user?.role === 'preceptor') {
      sitesApi.list().then(res => {
        setSites(res.data || [])
      }).catch(() => {})
    }
  }, [user?.role])

  const role = user?.role || 'student'
  const steps = mkSteps(role)
  const step = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1
  const isPreComplete = currentStep === steps.length - 2
  const progress = ((currentStep) / (steps.length - 1)) * 100

  const toggleSpecialty = useCallback((s: string) => {
    setSelectedInterests(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }, [])

  const toggleFacilitySpecialty = useCallback((s: string) => {
    setFacilitySpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }, [])

  const togglePractitionerState = useCallback((s: string) => {
    setPractitionerStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }, [])

  // Filter universities
  const filteredUniversities = universities.filter(u =>
    u.name.toLowerCase().includes(
      (role === 'student' ? universitySearch : coordUniversitySearch).toLowerCase()
    )
  )

  // Filter sites
  const filteredSites = sites.filter(s =>
    s.name.toLowerCase().includes(siteSearch.toLowerCase()) ||
    s.city?.toLowerCase().includes(siteSearch.toLowerCase()) ||
    s.state?.toLowerCase().includes(siteSearch.toLowerCase())
  )

  // Validate current step
  const canProceed = () => {
    if (step.id === 'personal') return !!phone.trim()
    if (step.id === 'academic') return !!universityId
    if (step.id === 'facility') return !!facilityName.trim()
    if (step.id === 'university') return !!coordUniversityId
    if (step.id === 'profession') return !!professionType && practitionerStates.length > 0
    if (step.id === 'practice') return true
    if (step.id === 'documents') return true
    return true
  }

  // Submit onboarding data
  const submitOnboarding = async () => {
    setIsSubmitting(true)
    try {
      const data: Record<string, unknown> = { phone }

      if (role === 'student') {
        data.bio = bio || undefined
        data.university_id = universityId || undefined
        data.program_id = programId || undefined
        data.graduation_date = graduationDate || undefined
        data.gpa = gpa ? parseFloat(gpa) : undefined
        data.clinical_interests = selectedInterests
      } else if (role === 'preceptor') {
        data.clinical_interests = selectedInterests
        data.site_id = selectedSiteId || undefined
        if (npiNumber) data.npi_number = npiNumber
      } else if (role === 'site_manager') {
        data.facility_name = facilityName
        data.facility_address = facilityAddress
        data.facility_city = facilityCity
        data.facility_state = facilityState
        data.facility_zip = facilityZip
        data.facility_phone = facilityPhone
        data.facility_description = facilityDescription
        data.facility_specialties = facilitySpecialties
        data.ehr_system = ehrSystem || undefined
        if (npiNumber) data.npi_number = npiNumber
      } else if (role === 'coordinator' || role === 'professor') {
        data.university_id = coordUniversityId || undefined
        data.department = department || undefined
      } else if (role === 'practitioner') {
        data.profession_type = professionType
        data.licensed_states = practitionerStates
        data.primary_specialty = primarySpecialty || undefined
        data.years_in_practice = yearsInPractice ? parseInt(yearsInPractice) : 0
        data.current_employer = currentEmployer || undefined
        data.npi_number = practitionerNpi || undefined
        data.license_numbers = practitionerStates
          .filter(st => licenseNumbers[st])
          .map(st => ({ state: st, number: licenseNumbers[st] }))
        data.malpractice_confirmed = malpracticeConfirmed
        data.bio = bio || undefined
      }

      await completeOnboarding(data)
      toast.success('Profile saved successfully!')
    } catch {
      toast.error('Failed to save — please try again')
      setIsSubmitting(false)
      return false
    }
    setIsSubmitting(false)
    return true
  }

  const handleNext = async () => {
    if (isLast) {
      navigate('/dashboard')
      return
    }

    // On the step before complete, save everything
    if (isPreComplete) {
      const ok = await submitOnboarding()
      if (!ok) return
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4000)
    }

    setDirection('forward')
    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection('back')
      setCurrentStep(prev => prev - 1)
    }
  }

  if (!user) return null

  return (
    <div className={`min-h-screen bg-gradient-to-br ${step.gradient} animate-gradient transition-all duration-700 relative overflow-hidden`}>
      {showConfetti && <Confetti />}

      {/* Floating decorative circles */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-float-2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-white/20 backdrop-blur-sm">
        <div
          className="h-full bg-white/90 shadow-lg shadow-white/20 transition-all duration-700 ease-out animate-progress-pulse rounded-r-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Indicator */}
      <div className="pt-10 pb-4 px-4">
        <div className="max-w-xl mx-auto flex items-center justify-center gap-1.5 sm:gap-3">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1.5 sm:gap-3">
              <div className={`relative flex items-center justify-center transition-all duration-500 ${
                i === currentStep ? 'w-10 h-10 sm:w-11 sm:h-11' : 'w-8 h-8 sm:w-9 sm:h-9'
              }`}>
                {/* Active ring glow */}
                {i === currentStep && (
                  <div className="absolute inset-0 rounded-full bg-white/30 animate-ping-slow" />
                )}
                <div className={`relative w-full h-full rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  i < currentStep
                    ? 'bg-white text-emerald-600 shadow-lg shadow-white/30 scale-90'
                    : i === currentStep
                    ? 'bg-white text-stone-800 shadow-xl shadow-white/40 ring-4 ring-white/30'
                    : 'bg-white/20 text-white/60 backdrop-blur-sm'
                }`}>
                  {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className={`hidden sm:block w-8 md:w-12 h-0.5 rounded-full transition-all duration-500 ${
                  i < currentStep ? 'bg-white/80' : 'bg-white/20'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-8">
        <div className="max-w-xl mx-auto">
          {/* Step Header */}
          <div className="text-center mb-6 animate-slide-up" key={`header-${step.id}`}>
            <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white shadow-2xl shadow-black/10 bg-gradient-to-br ${step.iconBg} transition-all duration-500`}>
              {step.icon}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-sm">{step.title}</h1>
            <p className="text-white/70 mt-1 text-sm sm:text-base">{step.subtitle}</p>
          </div>

          {/* Glass Card */}
          <div
            key={`card-${step.id}-${direction}`}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 border border-white/50 p-6 sm:p-8 mb-6 animate-slide-up"
            style={{ animationDelay: '0.05s' }}
          >
            {/* ─── Welcome Step ─── */}
            {step.id === 'welcome' && (
              <div className="text-center space-y-6 py-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-float">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                    ClinicLink
                  </span>
                </div>

                <p className="text-stone-600 leading-relaxed max-w-md mx-auto text-base">
                  Welcome, <strong className="text-stone-900">{user.firstName}</strong>!{' '}
                  {role === 'student' && 'We\'ll help you find the perfect clinical rotations, track your hours, and build your professional portfolio.'}
                  {role === 'preceptor' && 'We\'ll connect you with motivated students and make clinical supervision seamless.'}
                  {role === 'site_manager' && 'We\'ll help you manage rotation opportunities, review applications, and track students at your facility.'}
                  {(role === 'coordinator' || role === 'professor') && 'We\'ll give you full visibility into student placements, compliance, and clinical progress.'}
                  {role === 'practitioner' && 'We\'ll help you find collaborative practice agreements and connect with supervising physicians in your state.'}
                  {role === 'admin' && 'Welcome to the ClinicLink admin panel. Let\'s complete your profile.'}
                </p>

                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                  {role === 'student' && [
                    { icon: <Search className="w-4 h-4" />, label: 'Search Rotations' },
                    { icon: <FileText className="w-4 h-4" />, label: 'Apply Instantly' },
                    { icon: <Clock className="w-4 h-4" />, label: 'Track Hours' },
                    { icon: <Award className="w-4 h-4" />, label: 'Earn Certificates' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2.5 text-sm font-medium text-amber-800 border border-amber-200/50">
                      <span className="text-amber-500">{f.icon}</span> {f.label}
                    </div>
                  ))}
                  {role === 'preceptor' && [
                    { icon: <Users className="w-4 h-4" />, label: 'Review Students' },
                    { icon: <Clock className="w-4 h-4" />, label: 'Approve Hours' },
                    { icon: <Star className="w-4 h-4" />, label: 'Write Evaluations' },
                    { icon: <Award className="w-4 h-4" />, label: 'Track Progress' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2.5 text-sm font-medium text-blue-800 border border-blue-200/50">
                      <span className="text-blue-500">{f.icon}</span> {f.label}
                    </div>
                  ))}
                  {role === 'site_manager' && [
                    { icon: <Briefcase className="w-4 h-4" />, label: 'List Slots' },
                    { icon: <FileText className="w-4 h-4" />, label: 'Review Apps' },
                    { icon: <Users className="w-4 h-4" />, label: 'Track Students' },
                    { icon: <Activity className="w-4 h-4" />, label: 'Analytics' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-2 bg-purple-50 rounded-xl px-3 py-2.5 text-sm font-medium text-purple-800 border border-purple-200/50">
                      <span className="text-purple-500">{f.icon}</span> {f.label}
                    </div>
                  ))}
                  {(role === 'coordinator' || role === 'professor') && [
                    { icon: <Globe className="w-4 h-4" />, label: 'Track Placements' },
                    { icon: <Shield className="w-4 h-4" />, label: 'Compliance' },
                    { icon: <FileText className="w-4 h-4" />, label: 'Reports' },
                    { icon: <Building2 className="w-4 h-4" />, label: 'Agreements' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-2 bg-indigo-50 rounded-xl px-3 py-2.5 text-sm font-medium text-indigo-800 border border-indigo-200/50">
                      <span className="text-indigo-500">{f.icon}</span> {f.label}
                    </div>
                  ))}
                  {role === 'practitioner' && [
                    { icon: <Search className="w-4 h-4" />, label: 'Find Physicians' },
                    { icon: <FileText className="w-4 h-4" />, label: 'Request Collab' },
                    { icon: <Shield className="w-4 h-4" />, label: 'Verify Credentials' },
                    { icon: <Users className="w-4 h-4" />, label: 'Manage Agreements' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-2 bg-teal-50 rounded-xl px-3 py-2.5 text-sm font-medium text-teal-800 border border-teal-200/50">
                      <span className="text-teal-500">{f.icon}</span> {f.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Personal Info Step ─── */}
            {step.id === 'personal' && (
              <div className="space-y-5">
                {/* Avatar / Name Card */}
                <div className="bg-gradient-to-r from-stone-50 to-stone-100 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-amber-500/20 flex-shrink-0">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 text-lg">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-stone-500">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold capitalize">
                      {role.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <Input
                  label="Phone Number *"
                  type="tel"
                  placeholder="(305) 555-0100"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  icon={<Phone className="w-4 h-4" />}
                />

                {role === 'preceptor' && (
                  <NpiLookup
                    entityType="individual"
                    onVerified={(result, npi) => {
                      setNpiNumber(npi)
                      if (result.taxonomy) {
                        const matchedSpecialty = SPECIALTIES.find(s =>
                          result.taxonomy.toLowerCase().includes(s.toLowerCase()) ||
                          s.toLowerCase().includes(result.taxonomy.split(' ')[0].toLowerCase())
                        )
                        if (matchedSpecialty && !selectedInterests.includes(matchedSpecialty)) {
                          setSelectedInterests(prev => [...prev, matchedSpecialty])
                        }
                      }
                    }}
                    onClear={() => setNpiNumber('')}
                  />
                )}

                {(role === 'student' || role === 'practitioner') && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-stone-700">About You</label>
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={3}
                      placeholder={role === 'practitioner'
                        ? "Tell us about your practice, experience, and what you're looking for in a collaborative agreement..."
                        : "Tell clinical sites about yourself, your experience, and what makes you a great candidate..."}
                      className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm bg-white/80 backdrop-blur-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 focus:outline-none resize-none transition-all duration-200"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ─── Academic Info (Student) ─── */}
            {step.id === 'academic' && (
              <div className="space-y-5">
                {/* University Search & Select */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-stone-700">University *</label>
                  {universityFromRegistration && universityId ? (
                    <>
                      <div className="flex items-center gap-2 bg-stone-100 text-stone-500 rounded-xl px-3 py-3 text-sm font-medium border border-stone-200 cursor-not-allowed">
                        <GraduationCap className="w-4 h-4" />
                        {universitySearch || 'Selected during registration'}
                        <span className="ml-auto text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-lg">From registration</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          placeholder="Search universities..."
                          value={universitySearch}
                          onChange={e => { setUniversitySearch(e.target.value); setUniversityId(''); setProgramId('') }}
                          className="w-full rounded-2xl border border-stone-200 pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-200"
                        />
                      </div>
                      {universitySearch && !universityId && filteredUniversities.length > 0 && (
                        <div className="bg-white rounded-2xl border border-stone-200 shadow-lg max-h-48 overflow-y-auto">
                          {filteredUniversities.map(u => (
                            <button
                              key={u.id}
                              onClick={() => { setUniversityId(u.id); setUniversitySearch(u.name); setProgramId('') }}
                              className="w-full text-left px-4 py-3 text-sm hover:bg-purple-50 transition-colors flex items-center gap-3 border-b border-stone-100 last:border-0"
                            >
                              <GraduationCap className="w-4 h-4 text-purple-500 flex-shrink-0" />
                              <span>{u.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {universityId && (
                        <div className="flex items-center gap-2 bg-purple-50 text-purple-700 rounded-xl px-3 py-2 text-sm font-medium border border-purple-200/50">
                          <GraduationCap className="w-4 h-4" />
                          {universitySearch}
                          <button onClick={() => { setUniversityId(''); setUniversitySearch(''); setProgramId('') }} className="ml-auto text-purple-400 hover:text-purple-600">&times;</button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Program Dropdown */}
                {universityId && programs.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-stone-700">Program</label>
                    <select
                      value={programId}
                      onChange={e => setProgramId(e.target.value)}
                      disabled={universityFromRegistration && !!user?.programId}
                      className={`w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-200 ${
                        universityFromRegistration && user?.programId ? 'bg-stone-100 text-stone-500 cursor-not-allowed' : 'bg-white/80'
                      }`}
                    >
                      <option value="">Select a program...</option>
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.degree_type})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-stone-700">Expected Graduation</label>
                    <input
                      type="date"
                      value={graduationDate}
                      onChange={e => setGraduationDate(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm bg-white/80 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-200"
                    />
                  </div>
                  <Input
                    label="Current GPA"
                    type="number"
                    placeholder="3.85"
                    min="0"
                    max="4.0"
                    step="0.01"
                    value={gpa}
                    onChange={e => setGpa(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* ─── Clinical Interests / Specialties (Student & Preceptor) ─── */}
            {(step.id === 'interests' || step.id === 'clinical') && (
              <div className="space-y-4">
                <p className="text-sm text-stone-500">
                  {role === 'student'
                    ? 'Select specialties you\'re interested in. We\'ll use these to recommend rotations.'
                    : 'Select your areas of clinical expertise. Students will find you based on these.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(specialty => (
                    <button
                      key={specialty}
                      onClick={() => toggleSpecialty(specialty)}
                      className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 ${
                        selectedInterests.includes(specialty)
                          ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/20 scale-105'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:scale-102'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
                {selectedInterests.length > 0 && (
                  <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 rounded-xl px-3 py-2 text-sm font-semibold border border-indigo-200/50">
                    <Heart className="w-4 h-4" />
                    {selectedInterests.length} {selectedInterests.length === 1 ? 'specialty' : 'specialties'} selected
                  </div>
                )}
              </div>
            )}

            {/* ─── Credentials (Student) ─── */}
            {step.id === 'credentials' && (
              <div className="space-y-4">
                <p className="text-sm text-stone-500">
                  Most rotation sites require these credentials. You can upload them now or later from your profile.
                </p>
                {[
                  { name: 'BLS/CPR Certification', type: 'bls_cpr', icon: <Heart className="w-4 h-4" /> },
                  { name: 'Background Check', type: 'background_check', icon: <Shield className="w-4 h-4" /> },
                  { name: 'Drug Screen', type: 'drug_screen', icon: <Activity className="w-4 h-4" /> },
                  { name: 'Immunization Records', type: 'immunization', icon: <ShieldCheck className="w-4 h-4" /> },
                  { name: 'Liability Insurance', type: 'liability_insurance', icon: <FileText className="w-4 h-4" /> },
                  { name: 'HIPAA Training', type: 'hipaa', icon: <Award className="w-4 h-4" /> },
                ].map(cred => (
                  <div key={cred.type} className="flex items-center justify-between p-4 bg-gradient-to-r from-stone-50 to-stone-100 rounded-2xl border border-stone-200/50 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${uploadedCreds[cred.type] ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                        {uploadedCreds[cred.type] ? <CheckCircle className="w-4 h-4" /> : cred.icon}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-stone-700">{cred.name}</span>
                        {uploadedCreds[cred.type] && (
                          <p className="text-xs text-emerald-600">{uploadedCreds[cred.type]}</p>
                        )}
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={el => { fileInputRefs.current[cred.type] = el }}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleCredentialUpload(cred.type, cred.name, file)
                        e.target.value = ''
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="!rounded-xl"
                      disabled={uploadingCred === cred.type}
                      onClick={() => fileInputRefs.current[cred.type]?.click()}
                    >
                      {uploadingCred === cred.type ? (
                        <><span className="w-3.5 h-3.5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" /> Uploading...</>
                      ) : uploadedCreds[cred.type] ? (
                        <><Upload className="w-3.5 h-3.5" /> Replace</>
                      ) : (
                        <><Upload className="w-3.5 h-3.5" /> Upload</>
                      )}
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-stone-400 text-center bg-stone-50 rounded-xl p-3">
                  You can always upload or update these later from <strong>Settings → Credentials</strong>
                </p>
              </div>
            )}

            {/* ─── Site Selection (Preceptor) ─── */}
            {step.id === 'site' && (
              <div className="space-y-4">
                <p className="text-sm text-stone-500">
                  Select the clinical site you're affiliated with. If your site isn't listed, your site manager can invite you.
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search sites by name or location..."
                    value={siteSearch}
                    onChange={e => setSiteSearch(e.target.value)}
                    className="w-full rounded-2xl border border-stone-200 pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-200"
                  />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {filteredSites.length === 0 && (
                    <p className="text-center text-sm text-stone-400 py-6">
                      {siteSearch ? 'No sites match your search' : 'No sites available — ask your site manager for an invite link'}
                    </p>
                  )}
                  {filteredSites.map(site => (
                    <button
                      key={site.id}
                      onClick={() => setSelectedSiteId(site.id === selectedSiteId ? '' : site.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                        selectedSiteId === site.id
                          ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300 shadow-md shadow-purple-500/10 scale-[1.01]'
                          : 'bg-white/50 border-stone-200 hover:border-stone-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          selectedSiteId === site.id
                            ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white'
                            : 'bg-stone-100 text-stone-500'
                        }`}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-900 text-sm">{site.name}</p>
                          <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {site.city}, {site.state}
                          </p>
                          {site.specialties?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {site.specialties.slice(0, 3).map(s => (
                                <span key={s} className="text-xs bg-stone-100 text-stone-600 rounded-full px-2 py-0.5">{s}</span>
                              ))}
                              {site.specialties.length > 3 && (
                                <span className="text-xs text-stone-400">+{site.specialties.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                        {selectedSiteId === site.id && (
                          <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Facility Info (Site Manager) ─── */}
            {step.id === 'facility' && (
              <div className="space-y-4">
                <Input
                  label="Facility Name *"
                  placeholder="Mercy General Hospital"
                  value={facilityName}
                  onChange={e => setFacilityName(e.target.value)}
                  icon={<Building2 className="w-4 h-4" />}
                />
                <Input
                  label="Address"
                  placeholder="2175 Rosaline Ave"
                  value={facilityAddress}
                  onChange={e => setFacilityAddress(e.target.value)}
                  icon={<MapPin className="w-4 h-4" />}
                />
                <div className="grid grid-cols-3 gap-3">
                  <Input label="City" placeholder="Miami" value={facilityCity} onChange={e => setFacilityCity(e.target.value)} />
                  <Input label="State" placeholder="FL" maxLength={2} value={facilityState} onChange={e => setFacilityState(e.target.value)} />
                  <Input label="ZIP" placeholder="33136" value={facilityZip} onChange={e => setFacilityZip(e.target.value)} />
                </div>
                <Input
                  label="Facility Phone"
                  type="tel"
                  placeholder="(305) 555-0100"
                  value={facilityPhone}
                  onChange={e => setFacilityPhone(e.target.value)}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-stone-700">Description</label>
                  <textarea
                    value={facilityDescription}
                    onChange={e => setFacilityDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe your facility and what makes it a great clinical learning environment..."
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm bg-white/80 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none resize-none transition-all duration-200"
                  />
                </div>

                <NpiLookup
                  entityType="organization"
                  label="Facility NPI (Optional)"
                  onVerified={(result, npi) => {
                    setNpiNumber(npi)
                    if (result.name && !facilityName) setFacilityName(result.name)
                    if (result.address) {
                      if (result.address.line1 && !facilityAddress) setFacilityAddress(result.address.line1)
                      if (result.address.city && !facilityCity) setFacilityCity(result.address.city)
                      if (result.address.state && !facilityState) setFacilityState(result.address.state)
                      if (result.address.zip && !facilityZip) setFacilityZip(result.address.zip)
                    }
                    if (result.phone && !facilityPhone) setFacilityPhone(result.phone)
                  }}
                  onClear={() => setNpiNumber('')}
                />
              </div>
            )}

            {/* ─── Specialties & EHR (Site Manager) ─── */}
            {step.id === 'specialties' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-stone-700">EHR System</label>
                  <select
                    value={ehrSystem}
                    onChange={e => setEhrSystem(e.target.value)}
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm bg-white/80 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-200"
                  >
                    <option value="">Select EHR system...</option>
                    {EHR_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Specialties Offered</label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map(specialty => (
                      <button
                        key={specialty}
                        onClick={() => toggleFacilitySpecialty(specialty)}
                        className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 ${
                          facilitySpecialties.includes(specialty)
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20 scale-105'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                  {facilitySpecialties.length > 0 && (
                    <p className="mt-2 text-sm text-purple-600 font-semibold">{facilitySpecialties.length} specialties selected</p>
                  )}
                </div>

                {/* Facility Preview */}
                {facilityName && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-200/50">
                    <p className="text-xs text-purple-500 font-semibold mb-2 uppercase tracking-wider">Preview — How students will see your site</p>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{facilityName}</p>
                        {(facilityCity || facilityState) && (
                          <p className="text-xs text-stone-500">{[facilityCity, facilityState].filter(Boolean).join(', ')}</p>
                        )}
                        {facilitySpecialties.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {facilitySpecialties.slice(0, 4).map(s => (
                              <span key={s} className="text-xs bg-white rounded-full px-2 py-0.5 text-purple-600">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── University Info (Coordinator / Professor) ─── */}
            {step.id === 'university' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-stone-700">University *</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search universities..."
                      value={coordUniversitySearch}
                      onChange={e => { setCoordUniversitySearch(e.target.value); setCoordUniversityId('') }}
                      className="w-full rounded-2xl border border-stone-200 pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none transition-all duration-200"
                    />
                  </div>
                  {coordUniversitySearch && !coordUniversityId && filteredUniversities.length > 0 && (
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-lg max-h-48 overflow-y-auto">
                      {filteredUniversities.map(u => (
                        <button
                          key={u.id}
                          onClick={() => { setCoordUniversityId(u.id); setCoordUniversitySearch(u.name) }}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 transition-colors flex items-center gap-3 border-b border-stone-100 last:border-0"
                        >
                          <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <span>{u.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {coordUniversityId && (
                    <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 rounded-xl px-3 py-2 text-sm font-medium border border-indigo-200/50">
                      <BookOpen className="w-4 h-4" />
                      {coordUniversitySearch}
                      <button onClick={() => { setCoordUniversityId(''); setCoordUniversitySearch('') }} className="ml-auto text-indigo-400 hover:text-indigo-600">&times;</button>
                    </div>
                  )}
                </div>

                <Input
                  label="Department / Program"
                  placeholder="School of Nursing and Health Studies"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  icon={<GraduationCap className="w-4 h-4" />}
                />
              </div>
            )}

            {/* ─── Profession Info (Practitioner) ─── */}
            {step.id === 'profession' && (
              <div className="space-y-5">
                <p className="text-sm text-stone-500">
                  Tell us about your professional background so we can match you with the right collaborative physicians.
                </p>

                {/* NP vs PA toggle */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-stone-700">Profession Type *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {([['np', 'Nurse Practitioner (NP)'], ['pa', 'Physician Assistant (PA)']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setProfessionType(val)}
                        className={`p-4 rounded-2xl border text-sm font-medium transition-all duration-300 text-left ${
                          professionType === val
                            ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-300 shadow-md shadow-teal-500/10'
                            : 'bg-white/50 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            professionType === val ? 'bg-teal-500 text-white' : 'bg-stone-100 text-stone-400'
                          }`}>
                            <Stethoscope className="w-4 h-4" />
                          </div>
                          <span className={professionType === val ? 'text-teal-800' : 'text-stone-600'}>{label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Specialty */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-stone-700">Primary Specialty</label>
                  <select
                    value={primarySpecialty}
                    onChange={e => setPrimarySpecialty(e.target.value)}
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm bg-white/80 backdrop-blur-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all duration-200"
                  >
                    <option value="">Select specialty...</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Licensed States */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-stone-700">Licensed States *</label>
                  <p className="text-xs text-stone-400">Select all states where you hold an active license</p>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1">
                    {US_STATES.map(st => (
                      <button
                        key={st}
                        onClick={() => togglePractitionerState(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          practitionerStates.includes(st)
                            ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/20'
                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                  {practitionerStates.length > 0 && (
                    <div className="flex items-center gap-2 bg-teal-50 text-teal-700 rounded-xl px-3 py-2 text-sm font-semibold border border-teal-200/50">
                      <MapPin className="w-4 h-4" />
                      {practitionerStates.length} {practitionerStates.length === 1 ? 'state' : 'states'}: {practitionerStates.join(', ')}
                    </div>
                  )}
                </div>

                {/* Years in Practice */}
                <Input
                  label="Years in Practice"
                  type="number"
                  placeholder="5"
                  min="0"
                  max="50"
                  value={yearsInPractice}
                  onChange={e => setYearsInPractice(e.target.value)}
                  icon={<Clock className="w-4 h-4" />}
                />
              </div>
            )}

            {/* ─── Practice Details (Practitioner) ─── */}
            {step.id === 'practice' && (
              <div className="space-y-5">
                <Input
                  label="Current Employer"
                  placeholder="Memorial Healthcare System"
                  value={currentEmployer}
                  onChange={e => setCurrentEmployer(e.target.value)}
                  icon={<Building2 className="w-4 h-4" />}
                />

                <NpiLookup
                  entityType="individual"
                  label="NPI Number (Optional)"
                  onVerified={(_result, npi) => {
                    setPractitionerNpi(npi)
                  }}
                  onClear={() => setPractitionerNpi('')}
                />

                {/* License Numbers per State */}
                {practitionerStates.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-stone-700">License Numbers</label>
                    <p className="text-xs text-stone-400">Enter your license number for each state (optional)</p>
                    <div className="space-y-2">
                      {practitionerStates.map(st => (
                        <div key={st} className="flex items-center gap-3">
                          <span className="w-10 text-center text-xs font-bold text-teal-600 bg-teal-50 rounded-lg py-2 border border-teal-200/50">{st}</span>
                          <input
                            type="text"
                            placeholder={`License # for ${st}`}
                            value={licenseNumbers[st] || ''}
                            onChange={e => setLicenseNumbers(prev => ({ ...prev, [st]: e.target.value }))}
                            className="flex-1 rounded-2xl border border-stone-200 px-4 py-2.5 text-sm bg-white/80 backdrop-blur-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all duration-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── Documents (Practitioner) ─── */}
            {step.id === 'documents' && (
              <div className="space-y-5">
                <p className="text-sm text-stone-500">
                  Upload your professional documents. These help verify your credentials for collaborative agreements. You can also upload them later.
                </p>

                {/* License Document Upload */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-stone-50 to-stone-100 rounded-2xl border border-stone-200/50 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${licenseDocFile ? 'bg-emerald-100 text-emerald-600' : 'bg-teal-100 text-teal-600'}`}>
                      {licenseDocFile ? <CheckCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-stone-700">Professional License</span>
                      {licenseDocFile && <p className="text-xs text-emerald-600">{licenseDocFile}</p>}
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={el => { practDocInputRefs.current['license'] = el }}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setUploadingPractDoc('license')
                        setLicenseDocFile(file.name)
                        setUploadingPractDoc(null)
                      }
                      e.target.value = ''
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="!rounded-xl"
                    disabled={uploadingPractDoc === 'license'}
                    onClick={() => practDocInputRefs.current['license']?.click()}
                  >
                    {uploadingPractDoc === 'license' ? (
                      <><span className="w-3.5 h-3.5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" /> Uploading...</>
                    ) : licenseDocFile ? (
                      <><Upload className="w-3.5 h-3.5" /> Replace</>
                    ) : (
                      <><Upload className="w-3.5 h-3.5" /> Upload</>
                    )}
                  </Button>
                </div>

                {/* Malpractice Insurance Upload */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-stone-50 to-stone-100 rounded-2xl border border-stone-200/50 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${malpracticeDocFile ? 'bg-emerald-100 text-emerald-600' : 'bg-teal-100 text-teal-600'}`}>
                      {malpracticeDocFile ? <CheckCircle className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-stone-700">Malpractice Insurance</span>
                      {malpracticeDocFile && <p className="text-xs text-emerald-600">{malpracticeDocFile}</p>}
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={el => { practDocInputRefs.current['malpractice'] = el }}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setUploadingPractDoc('malpractice')
                        setMalpracticeDocFile(file.name)
                        setMalpracticeConfirmed(true)
                        setUploadingPractDoc(null)
                      }
                      e.target.value = ''
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="!rounded-xl"
                    disabled={uploadingPractDoc === 'malpractice'}
                    onClick={() => practDocInputRefs.current['malpractice']?.click()}
                  >
                    {uploadingPractDoc === 'malpractice' ? (
                      <><span className="w-3.5 h-3.5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" /> Uploading...</>
                    ) : malpracticeDocFile ? (
                      <><Upload className="w-3.5 h-3.5" /> Replace</>
                    ) : (
                      <><Upload className="w-3.5 h-3.5" /> Upload</>
                    )}
                  </Button>
                </div>

                {/* Malpractice Confirmation Checkbox */}
                <label className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={malpracticeConfirmed}
                    onChange={e => setMalpracticeConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-stone-700">I confirm I have active malpractice insurance</span>
                    <p className="text-xs text-stone-500 mt-0.5">Required for collaborative practice agreements</p>
                  </div>
                </label>

                <p className="text-xs text-stone-400 text-center bg-stone-50 rounded-xl p-3">
                  You can always upload or update documents later from <strong>Settings → Profile</strong>
                </p>
              </div>
            )}

            {/* ─── Complete Step ─── */}
            {step.id === 'complete' && (
              <div className="text-center space-y-6 py-6">
                <AnimatedCheck />

                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    You're all set, {user.firstName}!
                  </h2>
                  <p className="text-stone-500 max-w-sm mx-auto">
                    {role === 'student' && 'Your profile is ready. Start exploring clinical rotations and building your portfolio!'}
                    {role === 'preceptor' && 'Your profile is ready. Students will be able to find and connect with you!'}
                    {role === 'site_manager' && 'Your facility is set up. Start listing rotation slots for students!'}
                    {(role === 'coordinator' || role === 'professor') && 'Your profile is ready. Start managing student placements and compliance!'}
                    {role === 'practitioner' && 'Your profile is ready. Start browsing the physician directory and requesting collaborative agreements!'}
                    {role === 'admin' && 'Your admin account is configured. Head to the dashboard!'}
                  </p>
                </div>

                {/* Summary badges */}
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-full px-3 py-1.5 text-sm font-medium border border-emerald-200/50">
                    <CheckCircle className="w-3.5 h-3.5" /> Profile Complete
                  </span>
                  {role === 'student' && universitySearch && (
                    <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 rounded-full px-3 py-1.5 text-sm font-medium border border-purple-200/50">
                      <GraduationCap className="w-3.5 h-3.5" /> {universitySearch}
                    </span>
                  )}
                  {role === 'student' && selectedInterests.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-full px-3 py-1.5 text-sm font-medium border border-blue-200/50">
                      <Heart className="w-3.5 h-3.5" /> {selectedInterests.length} Interests
                    </span>
                  )}
                  {role === 'site_manager' && facilityName && (
                    <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 rounded-full px-3 py-1.5 text-sm font-medium border border-purple-200/50">
                      <Building2 className="w-3.5 h-3.5" /> {facilityName}
                    </span>
                  )}
                  {role === 'preceptor' && selectedInterests.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-full px-3 py-1.5 text-sm font-medium border border-blue-200/50">
                      <Stethoscope className="w-3.5 h-3.5" /> {selectedInterests.length} Specialties
                    </span>
                  )}
                  {role === 'practitioner' && professionType && (
                    <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 rounded-full px-3 py-1.5 text-sm font-medium border border-teal-200/50">
                      <Stethoscope className="w-3.5 h-3.5" /> {professionType === 'np' ? 'Nurse Practitioner' : 'Physician Assistant'}
                    </span>
                  )}
                  {role === 'practitioner' && practitionerStates.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 rounded-full px-3 py-1.5 text-sm font-medium border border-cyan-200/50">
                      <MapPin className="w-3.5 h-3.5" /> {practitionerStates.length} {practitionerStates.length === 1 ? 'State' : 'States'}
                    </span>
                  )}
                  {role === 'practitioner' && malpracticeConfirmed && (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-full px-3 py-1.5 text-sm font-medium border border-emerald-200/50">
                      <Shield className="w-3.5 h-3.5" /> Malpractice Verified
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between" style={{ animationDelay: '0.1s' }}>
            {!isFirst ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleNext}
              disabled={isSubmitting || (!isFirst && !isLast && !canProceed())}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
                isLast
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30 hover:shadow-emerald-500/40'
                  : 'bg-white text-stone-800 shadow-white/30 hover:shadow-white/50'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  Saving...
                </span>
              ) : isLast ? (
                <>Go to Dashboard <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Continue <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
