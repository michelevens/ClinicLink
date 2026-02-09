const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getToken(): string | null {
    return localStorage.getItem('cliniclink_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (res.status === 401) {
      localStorage.removeItem('cliniclink_token')
      localStorage.removeItem('cliniclink_user')
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const message = body.message || body.error || `Request failed (${res.status})`
      const error = new Error(message) as Error & { status: number; errors: Record<string, string[]> }
      error.status = res.status
      error.errors = body.errors || {}
      throw error
    }

    if (res.status === 204) return {} as T
    return res.json()
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint)
  }

  post<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  put<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const api = new ApiClient(API_URL)

// --- Auth ---
export const authApi = {
  register: (data: { first_name: string; last_name: string; email: string; password: string; password_confirmation: string; role: string }) =>
    api.post<{ user: ApiUser; token: string }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ user: ApiUser; token: string }>('/auth/login', data),

  me: () => api.get<{ user: ApiUser }>('/auth/me'),

  logout: () => api.post<void>('/auth/logout'),

  updateProfile: (data: { first_name?: string; last_name?: string; phone?: string }) =>
    api.put<{ user: ApiUser }>('/auth/profile', data),
}

// --- Rotation Sites ---
export const sitesApi = {
  list: (params?: { search?: string; specialty?: string; state?: string; page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.specialty) qs.set('specialty', params.specialty)
    if (params?.state) qs.set('state', params.state)
    if (params?.page) qs.set('page', String(params.page))
    return api.get<PaginatedResponse<ApiSite>>(`/sites?${qs}`)
  },
  get: (id: string) => api.get<{ site: ApiSite }>(`/sites/${id}`),
  create: (data: Partial<ApiSite>) => api.post<{ site: ApiSite }>('/sites', data),
  update: (id: string, data: Partial<ApiSite>) => api.put<{ site: ApiSite }>(`/sites/${id}`, data),
  delete: (id: string) => api.delete(`/sites/${id}`),
  mine: () => api.get<{ sites: ApiSite[] }>('/my-sites'),
}

// --- Rotation Slots ---
export const slotsApi = {
  list: (params?: { search?: string; specialty?: string; status?: string; cost_type?: string; page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.specialty) qs.set('specialty', params.specialty)
    if (params?.status) qs.set('status', params.status)
    if (params?.cost_type) qs.set('cost_type', params.cost_type)
    if (params?.page) qs.set('page', String(params.page))
    return api.get<PaginatedResponse<ApiSlot>>(`/slots?${qs}`)
  },
  get: (id: string) => api.get<{ slot: ApiSlot }>(`/slots/${id}`),
  create: (data: Partial<ApiSlot>) => api.post<{ slot: ApiSlot }>('/slots', data),
  update: (id: string, data: Partial<ApiSlot>) => api.put<{ slot: ApiSlot }>(`/slots/${id}`, data),
  delete: (id: string) => api.delete(`/slots/${id}`),
}

// --- Applications ---
export const applicationsApi = {
  list: () => api.get<{ applications: ApiApplication[] }>('/applications'),
  get: (id: string) => api.get<{ application: ApiApplication }>(`/applications/${id}`),
  create: (data: { slot_id: string; cover_letter?: string }) =>
    api.post<{ application: ApiApplication }>('/applications', data),
  review: (id: string, data: { status: 'accepted' | 'declined' | 'waitlisted'; notes?: string }) =>
    api.put<{ application: ApiApplication }>(`/applications/${id}/review`, data),
  withdraw: (id: string) =>
    api.put<{ application: ApiApplication }>(`/applications/${id}/withdraw`),
}

// --- Hour Logs ---
export const hourLogsApi = {
  list: () => api.get<{ hour_logs: ApiHourLog[] }>('/hour-logs'),
  create: (data: { slot_id: string; date: string; hours_worked: number; category: string; description: string }) =>
    api.post<{ hour_log: ApiHourLog }>('/hour-logs', data),
  update: (id: string, data: Partial<ApiHourLog>) =>
    api.put<{ hour_log: ApiHourLog }>(`/hour-logs/${id}`, data),
  review: (id: string, data: { status: 'approved' | 'rejected'; rejection_reason?: string }) =>
    api.put<{ hour_log: ApiHourLog }>(`/hour-logs/${id}/review`, data),
  delete: (id: string) => api.delete(`/hour-logs/${id}`),
  summary: () => api.get<HourSummary>('/hour-logs/summary'),
}

// --- Evaluations ---
export const evaluationsApi = {
  list: () => api.get<{ evaluations: ApiEvaluation[] }>('/evaluations'),
  get: (id: string) => api.get<{ evaluation: ApiEvaluation }>(`/evaluations/${id}`),
  create: (data: Partial<ApiEvaluation>) =>
    api.post<{ evaluation: ApiEvaluation }>('/evaluations', data),
  update: (id: string, data: Partial<ApiEvaluation>) =>
    api.put<{ evaluation: ApiEvaluation }>(`/evaluations/${id}`, data),
}

// --- Student Profile ---
export const studentApi = {
  profile: () => api.get<{ profile: ApiStudentProfile }>('/student/profile'),
  updateProfile: (data: Partial<ApiStudentProfile>) =>
    api.put<{ profile: ApiStudentProfile }>('/student/profile', data),
  credentials: () => api.get<{ credentials: ApiCredential[] }>('/student/credentials'),
  addCredential: (data: Partial<ApiCredential>) =>
    api.post<{ credential: ApiCredential }>('/student/credentials', data),
  updateCredential: (id: string, data: Partial<ApiCredential>) =>
    api.put<{ credential: ApiCredential }>(`/student/credentials/${id}`, data),
  deleteCredential: (id: string) => api.delete(`/student/credentials/${id}`),
}

// --- Dashboard ---
export const dashboardApi = {
  stats: () => api.get<ApiDashboardStats>('/dashboard/stats'),
}

// --- Universities ---
export const universitiesApi = {
  list: (params?: { search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    return api.get<PaginatedResponse<ApiUniversity>>(`/universities?${qs}`)
  },
  get: (id: string) => api.get<{ university: ApiUniversity }>(`/universities/${id}`),
  programs: (id: string) => api.get<{ programs: ApiProgram[] }>(`/universities/${id}/programs`),
}

// --- Agreements ---
export const agreementsApi = {
  list: (params?: { status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    return api.get<{ agreements: ApiAgreement[] }>(`/agreements?${qs}`)
  },
  create: (data: Partial<ApiAgreement>) =>
    api.post<{ agreement: ApiAgreement }>('/agreements', data),
  update: (id: string, data: Partial<ApiAgreement>) =>
    api.put<{ agreement: ApiAgreement }>(`/agreements/${id}`, data),
}

// --- API Types (match Laravel snake_case) ---
export interface ApiUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  email_verified: boolean
  created_at: string
  student_profile?: ApiStudentProfile
  credentials?: ApiCredential[]
}

export interface ApiStudentProfile {
  id: string
  user_id: string
  university_id: string | null
  program_id: string | null
  graduation_date: string | null
  gpa: number | null
  clinical_interests: string[]
  hours_completed: number
  hours_required: number
  bio: string | null
  resume_url: string | null
  university?: ApiUniversity
  program?: ApiProgram
}

export interface ApiSite {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  website: string | null
  description: string
  specialties: string[]
  ehr_system: string | null
  photos: string[]
  manager_id: string
  rating: number
  review_count: number
  is_verified: boolean
  is_active: boolean
  created_at: string
  manager?: ApiUser
  slots?: ApiSlot[]
}

export interface ApiSlot {
  id: string
  site_id: string
  specialty: string
  title: string
  description: string
  start_date: string
  end_date: string
  capacity: number
  filled: number
  requirements: string[]
  cost: number
  cost_type: 'free' | 'paid'
  status: 'open' | 'filled' | 'closed'
  preceptor_id: string | null
  shift_schedule: string | null
  created_at: string
  site?: ApiSite
  preceptor?: ApiUser
}

export interface ApiApplication {
  id: string
  student_id: string
  slot_id: string
  status: 'pending' | 'accepted' | 'declined' | 'waitlisted' | 'withdrawn'
  cover_letter: string | null
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  notes: string | null
  created_at: string
  student?: ApiUser
  slot?: ApiSlot
}

export interface ApiHourLog {
  id: string
  student_id: string
  slot_id: string
  date: string
  hours_worked: number
  category: 'direct_care' | 'indirect_care' | 'simulation' | 'observation' | 'other'
  description: string
  status: 'pending' | 'approved' | 'rejected'
  approved_by: string | null
  approved_at: string | null
  rejection_reason: string | null
  created_at: string
  slot?: ApiSlot
  approver?: ApiUser
}

export interface ApiEvaluation {
  id: string
  type: 'mid_rotation' | 'final' | 'student_feedback'
  student_id: string
  preceptor_id: string
  slot_id: string
  ratings: Record<string, number>
  comments: string
  overall_score: number
  strengths: string | null
  areas_for_improvement: string | null
  is_submitted: boolean
  created_at: string
  student?: ApiUser
  preceptor?: ApiUser
  slot?: ApiSlot
}

export interface ApiCredential {
  id: string
  user_id: string
  type: string
  name: string
  expiration_date: string | null
  status: 'valid' | 'expiring_soon' | 'expired' | 'pending'
  document_url: string | null
}

export interface ApiUniversity {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  phone: string | null
  website: string | null
  is_verified: boolean
  programs?: ApiProgram[]
}

export interface ApiProgram {
  id: string
  university_id: string
  name: string
  degree_type: string
  required_hours: number
  specialties: string[]
  is_active: boolean
}

export interface ApiAgreement {
  id: string
  university_id: string
  site_id: string
  status: 'draft' | 'pending_review' | 'active' | 'expired' | 'terminated'
  start_date: string
  end_date: string
  document_url: string | null
  notes: string | null
  university?: ApiUniversity
  site?: ApiSite
}

export interface ApiDashboardStats {
  // Student stats
  applications_count?: number
  pending_applications?: number
  accepted_applications?: number
  hours_completed?: number
  hours_required?: number
  hours_progress?: number
  pending_hours?: number
  active_rotations?: number
  // Preceptor stats
  active_students?: number
  total_slots?: number
  pending_hour_reviews?: number
  pending_evaluations?: number
  // Site Manager stats
  total_sites?: number
  open_slots?: number
  // Coordinator stats
  total_students?: number
  active_placements?: number
  available_slots?: number
  // Admin stats
  total_users?: number
  total_universities?: number
  recent_applications?: number
}

export interface HourSummary {
  total_hours: number
  by_category: Record<string, number>
  pending_hours: number
  approved_hours: number
  hours_required: number
  progress: number
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
