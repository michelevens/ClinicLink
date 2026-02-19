export type UserRole = 'student' | 'preceptor' | 'site_manager' | 'coordinator' | 'professor' | 'admin'

export interface User {
  id: string
  systemId?: string
  email: string
  username?: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
  phone?: string
  createdAt: string
  onboardingCompleted: boolean
  universityId?: string
  programId?: string
}

export interface StudentProfile extends User {
  role: 'student'
  university: string
  program: string
  graduationDate: string
  gpa?: number
  credentials: Credential[]
  clinicalInterests: string[]
  hoursCompleted: number
  hoursRequired: number
}

export interface Credential {
  id: string
  type: 'cpr' | 'background_check' | 'immunization' | 'liability_insurance' | 'drug_screen' | 'license' | 'other'
  name: string
  expirationDate?: string
  status: 'valid' | 'expiring_soon' | 'expired' | 'pending'
  documentUrl?: string
}

export interface RotationSite {
  id: string
  systemId?: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  website?: string
  description: string
  specialties: string[]
  ehrSystem?: string
  photos: string[]
  managerId: string
  rating: number
  reviewCount: number
  isVerified: boolean
}

export interface RotationSlot {
  id: string
  siteId: string
  site?: RotationSite
  specialty: string
  title: string
  description: string
  startDate: string
  endDate: string
  capacity: number
  filled: number
  requirements: string[]
  cost: number
  costType: 'free' | 'paid'
  status: 'open' | 'filled' | 'closed'
  preceptorId?: string
  preceptor?: PreceptorProfile
  shiftSchedule?: string
  createdAt: string
}

export interface Application {
  id: string
  studentId: string
  student?: StudentProfile
  slotId: string
  slot?: RotationSlot
  status: 'pending' | 'accepted' | 'declined' | 'waitlisted' | 'withdrawn'
  coverLetter?: string
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  notes?: string
}

export interface PreceptorProfile extends User {
  role: 'preceptor'
  siteId: string
  specialties: string[]
  credentials: string[]
  yearsExperience: number
  maxStudents: number
  currentStudents: number
  rating: number
  reviewCount: number
}

export interface HourLog {
  id: string
  studentId: string
  slotId: string
  date: string
  hoursWorked: number
  category: 'direct_care' | 'indirect_care' | 'simulation' | 'observation' | 'other'
  description: string
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: string
}

export interface Evaluation {
  id: string
  type: 'mid_rotation' | 'final' | 'student_feedback'
  studentId: string
  preceptorId: string
  slotId: string
  ratings: Record<string, number>
  comments: string
  overallScore: number
  createdAt: string
}

export interface University {
  id: string
  systemId?: string
  name: string
  address: string
  programs: Program[]
}

export interface Program {
  id: string
  universityId: string
  name: string
  degreeType: 'BSN' | 'MSN' | 'DNP' | 'PA' | 'NP' | 'DPT' | 'OTD' | 'MSW' | 'PharmD' | 'other'
  requiredHours: number
  specialties: string[]
  studentCount: number
}

export interface DashboardStats {
  totalStudents?: number
  placedStudents?: number
  pendingApplications?: number
  openSlots?: number
  totalHours?: number
  activeRotations?: number
  averageRating?: number
  completionRate?: number
}

// ─── Collaborate Module ───

export interface StateRule {
  id: string
  state: string
  practice_level: 'full' | 'reduced' | 'restricted'
  supervision_required: boolean
  max_np_ratio: number | null
  chart_review_percent: number | null
  telehealth_allowed: boolean
  last_updated: string
}

export interface PhysicianProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  licensed_states: string[]
  specialties: string[]
  max_supervisees: number
  active_supervisees: number
  has_capacity: boolean
  supervision_model: 'in_person' | 'telehealth' | 'hybrid'
  malpractice_confirmed: boolean
  bio: string | null
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface CollaborationRequest {
  id: string
  user_id: string
  profession_type: 'np' | 'pa'
  states_requested: string[]
  specialty: string
  practice_model: 'telehealth' | 'in_person' | 'hybrid'
  expected_start_date: string
  preferred_supervision_model: string | null
  status: 'open' | 'matched' | 'closed'
  matches_count?: number
  matches?: CollaborationMatch[]
  created_at: string
  updated_at: string
}

export interface CollaborationMatch {
  id: string
  request_id: string
  physician_profile_id: string
  status: 'pending' | 'accepted' | 'declined'
  match_score: number
  match_reasons: string[]
  responded_at: string | null
  physician_profile?: PhysicianProfile
  request?: CollaborationRequest
  created_at: string
  updated_at: string
}
