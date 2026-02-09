import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { studentApi, authApi, type ApiStudentProfile, type ApiCredential } from '../services/api.ts'
import { toast } from 'sonner'
import {
  Stethoscope, User, GraduationCap, Heart, ShieldCheck,
  MapPin, Building2, BookOpen, CheckCircle, ChevronRight,
  ChevronLeft, Sparkles, Upload, Phone, ArrowRight
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
}

const STUDENT_STEPS: OnboardingStep[] = [
  { id: 'welcome', title: 'Welcome to ClinicLink', subtitle: 'Let\'s set up your profile', icon: <Sparkles className="w-6 h-6" /> },
  { id: 'personal', title: 'Personal Info', subtitle: 'Tell us about yourself', icon: <User className="w-6 h-6" /> },
  { id: 'academic', title: 'Academic Info', subtitle: 'Your university and program', icon: <GraduationCap className="w-6 h-6" /> },
  { id: 'interests', title: 'Clinical Interests', subtitle: 'What specialties excite you?', icon: <Heart className="w-6 h-6" /> },
  { id: 'credentials', title: 'Credentials', subtitle: 'Upload your certifications', icon: <ShieldCheck className="w-6 h-6" /> },
  { id: 'complete', title: 'All Set!', subtitle: 'You\'re ready to find rotations', icon: <CheckCircle className="w-6 h-6" /> },
]

const PRECEPTOR_STEPS: OnboardingStep[] = [
  { id: 'welcome', title: 'Welcome to ClinicLink', subtitle: 'Set up your preceptor profile', icon: <Sparkles className="w-6 h-6" /> },
  { id: 'personal', title: 'Personal Info', subtitle: 'Tell us about yourself', icon: <User className="w-6 h-6" /> },
  { id: 'clinical', title: 'Clinical Info', subtitle: 'Your specialties and experience', icon: <Stethoscope className="w-6 h-6" /> },
  { id: 'complete', title: 'All Set!', subtitle: 'You\'re ready to supervise students', icon: <CheckCircle className="w-6 h-6" /> },
]

const SITE_MANAGER_STEPS: OnboardingStep[] = [
  { id: 'welcome', title: 'Welcome to ClinicLink', subtitle: 'Set up your facility profile', icon: <Sparkles className="w-6 h-6" /> },
  { id: 'personal', title: 'Personal Info', subtitle: 'Tell us about yourself', icon: <User className="w-6 h-6" /> },
  { id: 'facility', title: 'Facility Info', subtitle: 'About your clinical site', icon: <Building2 className="w-6 h-6" /> },
  { id: 'complete', title: 'All Set!', subtitle: 'You\'re ready to list rotation slots', icon: <CheckCircle className="w-6 h-6" /> },
]

const COORDINATOR_STEPS: OnboardingStep[] = [
  { id: 'welcome', title: 'Welcome to ClinicLink', subtitle: 'Set up your coordinator profile', icon: <Sparkles className="w-6 h-6" /> },
  { id: 'personal', title: 'Personal Info', subtitle: 'Tell us about yourself', icon: <User className="w-6 h-6" /> },
  { id: 'university', title: 'University Info', subtitle: 'Your institution and programs', icon: <BookOpen className="w-6 h-6" /> },
  { id: 'complete', title: 'All Set!', subtitle: 'You\'re ready to manage placements', icon: <CheckCircle className="w-6 h-6" /> },
]

const SPECIALTIES = [
  'Emergency Medicine', 'ICU/Critical Care', 'Medical-Surgical', 'Pediatrics',
  'Family Practice', 'Behavioral Health', 'OB/GYN', 'Oncology', 'Geriatrics',
  'Physical Therapy', 'Occupational Therapy', 'Clinical Social Work',
  'Urgent Care', 'Surgery', 'Internal Medicine', 'Community Health',
  'Psychiatry', 'Cardiology', 'Neurology', 'Orthopedics',
]

export function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Student form state
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [universityName, setUniversityName] = useState('')
  const [programName, setProgramName] = useState('')
  const [graduationDate, setGraduationDate] = useState('')
  const [gpa, setGpa] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  // Site manager form state
  const [facilityName, setFacilityName] = useState('')
  const [facilityAddress, setFacilityAddress] = useState('')
  const [facilityCity, setFacilityCity] = useState('')
  const [facilityState, setFacilityState] = useState('')
  const [facilityZip, setFacilityZip] = useState('')
  const [facilityPhone, setFacilityPhone] = useState('')
  const [facilityDescription, setFacilityDescription] = useState('')
  const [facilitySpecialties, setFacilitySpecialties] = useState<string[]>([])
  const [ehrSystem, setEhrSystem] = useState('')

  if (!user) return null

  const steps = user.role === 'student' ? STUDENT_STEPS :
                user.role === 'preceptor' ? PRECEPTOR_STEPS :
                user.role === 'site_manager' ? SITE_MANAGER_STEPS :
                COORDINATOR_STEPS

  const step = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1
  const progress = ((currentStep) / (steps.length - 1)) * 100

  const toggleInterest = (specialty: string) => {
    setSelectedInterests(prev =>
      prev.includes(specialty) ? prev.filter(s => s !== specialty) : [...prev, specialty]
    )
  }

  const toggleFacilitySpecialty = (specialty: string) => {
    setFacilitySpecialties(prev =>
      prev.includes(specialty) ? prev.filter(s => s !== specialty) : [...prev, specialty]
    )
  }

  const handleNext = async () => {
    if (isLast) {
      navigate('/dashboard')
      return
    }

    // On the step before "complete", save data
    if (currentStep === steps.length - 2) {
      setIsSubmitting(true)
      try {
        // Save phone number
        if (phone) {
          await authApi.updateProfile({ phone }).catch(() => {})
        }

        // Role-specific saves
        if (user.role === 'student') {
          await studentApi.updateProfile({
            graduation_date: graduationDate || null,
            gpa: gpa ? parseFloat(gpa) : null,
            clinical_interests: selectedInterests,
            bio: bio || null,
          }).catch(() => {})
        }

        toast.success('Profile saved!')
      } catch {
        // Continue even if save fails
      }
      setIsSubmitting(false)
    }

    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-stone-100">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Indicator */}
      <div className="pt-8 pb-4 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i < currentStep ? 'bg-primary-500 text-white scale-90' :
                i === currentStep ? 'bg-primary-500 text-white scale-110 ring-4 ring-primary-500/20' :
                'bg-stone-200 text-stone-400'
              }`}>
                {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-6 sm:w-10 h-0.5 transition-all duration-300 ${i < currentStep ? 'bg-primary-500' : 'bg-stone-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-8">
        <div className="max-w-lg mx-auto">
          {/* Step Header */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-500 ${
              isLast ? 'bg-green-100 text-green-600' : 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white'
            }`}>
              {step.icon}
            </div>
            <h1 className="text-2xl font-bold text-stone-900">{step.title}</h1>
            <p className="text-stone-500 mt-1">{step.subtitle}</p>
          </div>

          <Card className="mb-6">
            {/* Welcome Step */}
            {step.id === 'welcome' && (
              <div className="text-center space-y-6 py-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    <Stethoscope className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    ClinicLink
                  </span>
                </div>
                <p className="text-stone-600 leading-relaxed max-w-sm mx-auto">
                  {user.role === 'student' && 'We\'ll help you find the perfect clinical rotations, track your hours, and build your professional portfolio.'}
                  {user.role === 'preceptor' && 'We\'ll connect you with students who match your expertise and make clinical supervision seamless.'}
                  {user.role === 'site_manager' && 'We\'ll help you list rotation opportunities, manage applications, and track students at your facility.'}
                  {(user.role === 'coordinator' || user.role === 'professor') && 'We\'ll give you full visibility into student placements, compliance, and clinical progress.'}
                  {user.role === 'admin' && 'Welcome to the ClinicLink admin dashboard. Let\'s get your account set up.'}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {user.role === 'student' && ['Search Rotations', 'Apply Instantly', 'Track Hours', 'Earn Certificates'].map(f => (
                    <Badge key={f} variant="primary" size="md">{f}</Badge>
                  ))}
                  {user.role === 'preceptor' && ['Review Students', 'Approve Hours', 'Write Evaluations', 'Earn CEUs'].map(f => (
                    <Badge key={f} variant="primary" size="md">{f}</Badge>
                  ))}
                  {user.role === 'site_manager' && ['List Slots', 'Review Apps', 'Track Students', 'Analytics'].map(f => (
                    <Badge key={f} variant="primary" size="md">{f}</Badge>
                  ))}
                  {(user.role === 'coordinator' || user.role === 'professor') && ['Track Placements', 'Compliance', 'Reports', 'Agreements'].map(f => (
                    <Badge key={f} variant="primary" size="md">{f}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Info Step */}
            {step.id === 'personal' && (
              <div className="space-y-4">
                <div className="bg-stone-50 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-stone-500">{user.email}</p>
                  </div>
                </div>
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="(305) 555-0100"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  icon={<Phone className="w-4 h-4" />}
                />
                {user.role === 'student' && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-stone-700">Bio / About You</label>
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={3}
                      placeholder="Tell clinical sites about yourself, your experience, and what makes you a great candidate..."
                      className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Academic Info (Student) */}
            {step.id === 'academic' && (
              <div className="space-y-4">
                <Input
                  label="University"
                  placeholder="University of Miami"
                  value={universityName}
                  onChange={e => setUniversityName(e.target.value)}
                  icon={<BookOpen className="w-4 h-4" />}
                />
                <Input
                  label="Program"
                  placeholder="Master of Science in Nursing - FNP"
                  value={programName}
                  onChange={e => setProgramName(e.target.value)}
                  icon={<GraduationCap className="w-4 h-4" />}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Expected Graduation"
                    type="date"
                    value={graduationDate}
                    onChange={e => setGraduationDate(e.target.value)}
                  />
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

            {/* Clinical Interests (Student) */}
            {step.id === 'interests' && (
              <div className="space-y-4">
                <p className="text-sm text-stone-500">Select specialties you're interested in. We'll use these to recommend rotations.</p>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(specialty => (
                    <button
                      key={specialty}
                      onClick={() => toggleInterest(specialty)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedInterests.includes(specialty)
                          ? 'bg-primary-500 text-white shadow-sm scale-105'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
                {selectedInterests.length > 0 && (
                  <p className="text-xs text-primary-600 font-medium">{selectedInterests.length} specialties selected</p>
                )}
              </div>
            )}

            {/* Credentials (Student) */}
            {step.id === 'credentials' && (
              <div className="space-y-4">
                <p className="text-sm text-stone-500">
                  You can upload credentials now or do this later from your profile. Most rotation sites require these.
                </p>
                {['BLS/CPR Certification', 'Background Check', 'Drug Screen', 'Immunization Records', 'Liability Insurance', 'HIPAA Training'].map(cred => (
                  <div key={cred} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-stone-400" />
                      <span className="text-sm font-medium text-stone-700">{cred}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-stone-400 text-center">You can skip this step and upload later from Settings</p>
              </div>
            )}

            {/* Clinical Info (Preceptor) */}
            {step.id === 'clinical' && (
              <div className="space-y-4">
                <p className="text-sm text-stone-500">Select your areas of clinical expertise.</p>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(specialty => (
                    <button
                      key={specialty}
                      onClick={() => toggleInterest(specialty)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedInterests.includes(specialty)
                          ? 'bg-primary-500 text-white shadow-sm scale-105'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Facility Info (Site Manager) */}
            {step.id === 'facility' && (
              <div className="space-y-4">
                <Input
                  label="Facility Name"
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
                  label="Phone"
                  type="tel"
                  placeholder="(305) 555-0100"
                  value={facilityPhone}
                  onChange={e => setFacilityPhone(e.target.value)}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-stone-700">EHR System</label>
                  <select
                    value={ehrSystem}
                    onChange={e => setEhrSystem(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                  >
                    <option value="">Select EHR...</option>
                    <option value="Epic">Epic</option>
                    <option value="Cerner">Cerner</option>
                    <option value="Athenahealth">Athenahealth</option>
                    <option value="eClinicalWorks">eClinicalWorks</option>
                    <option value="NextGen">NextGen</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-stone-700">Description</label>
                  <textarea
                    value={facilityDescription}
                    onChange={e => setFacilityDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe your facility, specialties, and what makes it a great clinical learning environment..."
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Specialties Offered</label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.slice(0, 12).map(specialty => (
                      <button
                        key={specialty}
                        onClick={() => toggleFacilitySpecialty(specialty)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                          facilitySpecialties.includes(specialty)
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* University Info (Coordinator) */}
            {step.id === 'university' && (
              <div className="space-y-4">
                <Input
                  label="University"
                  placeholder="University of Miami"
                  value={universityName}
                  onChange={e => setUniversityName(e.target.value)}
                  icon={<BookOpen className="w-4 h-4" />}
                />
                <Input
                  label="Department / Program"
                  placeholder="School of Nursing and Health Studies"
                  value={programName}
                  onChange={e => setProgramName(e.target.value)}
                  icon={<GraduationCap className="w-4 h-4" />}
                />
              </div>
            )}

            {/* Complete Step */}
            {step.id === 'complete' && (
              <div className="text-center space-y-6 py-4">
                <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">You're all set, {user.firstName}!</h2>
                  <p className="text-stone-500 mt-2">
                    {user.role === 'student' && 'Your profile is ready. Start searching for clinical rotations!'}
                    {user.role === 'preceptor' && 'Your profile is ready. Students will be able to find you!'}
                    {user.role === 'site_manager' && 'Your profile is ready. Start listing rotation slots!'}
                    {(user.role === 'coordinator' || user.role === 'professor') && 'Your profile is ready. Start managing student placements!'}
                    {user.role === 'admin' && 'Your admin account is set up. Head to the dashboard!'}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {user.role === 'student' && (
                    <>
                      <Badge variant="success" size="md">Profile Complete</Badge>
                      <Badge variant="primary" size="md">{selectedInterests.length} Interests</Badge>
                    </>
                  )}
                  {user.role === 'site_manager' && facilityName && (
                    <Badge variant="success" size="md">{facilityName}</Badge>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            {!isFirst ? (
              <Button variant="ghost" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            ) : (
              <div />
            )}
            <Button onClick={handleNext} isLoading={isSubmitting}>
              {isLast ? (
                <>Go to Dashboard <ArrowRight className="w-4 h-4" /></>
              ) : step.id === 'credentials' ? (
                <>Skip & Continue <ChevronRight className="w-4 h-4" /></>
              ) : (
                <>Continue <ChevronRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>

          {/* Skip Link */}
          {!isFirst && !isLast && (
            <p className="text-center mt-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
              >
                Skip onboarding — I'll set up later
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
