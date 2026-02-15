export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

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
      window.location.href = import.meta.env.BASE_URL + 'login'
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

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (res.status === 401) {
      localStorage.removeItem('cliniclink_token')
      localStorage.removeItem('cliniclink_user')
      window.location.href = import.meta.env.BASE_URL + 'login'
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
}

export const api = new ApiClient(API_URL)

// --- Auth ---
export const authApi = {
  register: (data: { first_name: string; last_name: string; email: string; username?: string; password: string; password_confirmation: string; role: string; university_id?: string; program_id?: string }) =>
    api.post<{ message: string; pending_approval: boolean }>('/auth/register', data),

  login: (data: { login: string; password: string }) =>
    api.post<{ user: ApiUser; token: string; accepted_invites?: { site_id: string; site_name: string }[] } | { mfa_required: true; mfa_token: string }>('/auth/login', data),

  me: () => api.get<ApiUser>('/auth/me'),

  logout: () => api.post<void>('/auth/logout'),

  updateProfile: (data: { first_name?: string; last_name?: string; phone?: string }) =>
    api.put<{ user: ApiUser }>('/auth/profile', data),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; email: string; password: string; password_confirmation: string }) =>
    api.post<{ message: string }>('/auth/reset-password', data),

  verifyEmail: (token: string) =>
    api.get<{ message: string }>(`/auth/verify-email/${token}`),

  resendVerification: (email: string) =>
    api.post<{ message: string }>('/auth/resend-verification', { email }),

  completeOnboarding: (data: Record<string, unknown>) =>
    api.post<{ user: ApiUser }>('/auth/complete-onboarding', data),

  // MFA
  mfaStatus: () => api.get<{ mfa_enabled: boolean; mfa_confirmed_at: string | null; backup_codes_remaining: number }>('/auth/mfa/status'),
  mfaSetup: () => api.post<{ secret: string; qr_code_url: string }>('/auth/mfa/setup'),
  mfaConfirm: (code: string) => api.post<{ message: string; backup_codes: string[] }>('/auth/mfa/confirm', { code }),
  mfaDisable: (password: string) => api.post<{ message: string }>('/auth/mfa/disable', { password }),
  mfaBackupCodes: (password: string) => api.post<{ message: string; backup_codes: string[] }>('/auth/mfa/backup-codes', { password }),
  mfaVerify: (mfa_token: string, code: string) => api.post<{ user: ApiUser; token: string }>('/auth/mfa/verify', { mfa_token, code }),
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
  get: (id: string) => api.get<ApiSite>(`/sites/${id}`),
  create: (data: Partial<ApiSite>) => api.post<{ site: ApiSite }>('/sites', data),
  update: (id: string, data: Partial<ApiSite>) => api.put<{ site: ApiSite }>(`/sites/${id}`, data),
  delete: (id: string) => api.delete(`/sites/${id}`),
  mine: () => api.get<{ sites: ApiSite[] }>('/my-sites'),
}

// --- Rotation Slots ---
export const slotsApi = {
  list: (params?: { search?: string; specialty?: string; status?: string; cost_type?: string; site_id?: string; page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.specialty) qs.set('specialty', params.specialty)
    if (params?.status) qs.set('status', params.status)
    if (params?.cost_type) qs.set('cost_type', params.cost_type)
    if (params?.site_id) qs.set('site_id', params.site_id)
    if (params?.page) qs.set('page', String(params.page))
    return api.get<PaginatedResponse<ApiSlot>>(`/slots?${qs}`)
  },
  get: (id: string) => api.get<{ slot: ApiSlot }>(`/slots/${id}`),
  create: (data: Partial<ApiSlot>) => api.post<{ slot: ApiSlot }>('/slots', data),
  update: (id: string, data: Partial<ApiSlot>) => api.put<{ slot: ApiSlot }>(`/slots/${id}`, data),
  delete: (id: string) => api.delete(`/slots/${id}`),
  preceptors: () => api.get<{ preceptors: ApiPreceptorOption[] }>('/preceptor-options'),
}

export interface ApiPreceptorOption {
  id: string
  first_name: string
  last_name: string
  email: string
}

export interface ApiSitePreceptor {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  slots: Array<{
    id: string
    title: string
    specialty: string
    status: string
    start_date: string
    end_date: string
    site_name: string
  }>
}

export const sitePreceptorsApi = {
  list: () => api.get<{ preceptors: ApiSitePreceptor[] }>('/my-preceptors'),
}

// --- Site Invites ---
export interface ApiSiteInvite {
  id: string
  site_id: string
  site_name: string
  token: string
  email: string | null
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  accepted_by: { id: string; name: string; email: string } | null
  accepted_at: string | null
  expires_at: string
  created_at: string
}

export interface ApiInviteDetail {
  id: string
  email: string | null
  site: {
    id: string
    name: string
    address: string
    city: string
    state: string
    specialties: string[]
    description: string
  }
  invited_by: string | null
  expires_at: string
}

export interface BulkInviteResult {
  email: string
  status: 'sent' | 'skipped' | 'created'
  reason?: string
}

export const siteInvitesApi = {
  list: () => api.get<{ invites: ApiSiteInvite[] }>('/site-invites'),
  create: (data: { site_id: string; email?: string; expires_in_days?: number; message?: string }) =>
    api.post<{ invite: { id: string; token: string; url: string; email: string | null; site_name: string; expires_at: string; email_sent: boolean } }>('/site-invites', data),
  bulkCreate: (data: { site_id: string; emails: string[]; message?: string; expires_in_days?: number }) =>
    api.post<{ message: string; summary: { sent: number; skipped: number; failed: number; total: number }; results: BulkInviteResult[] }>('/site-invites/bulk', data),
  validate: (token: string) => api.get<{ invite: ApiInviteDetail; already_accepted?: boolean; site_name?: string; message?: string }>(`/invite/${token}`),
  accept: (token: string) => api.post<{ message: string; site: { id: string; name: string } }>(`/invite/${token}/accept`),
  resend: (id: string) => api.post<{ message: string }>(`/site-invites/${id}/resend`, {}),
  revoke: (id: string) => api.delete(`/site-invites/${id}`),
  myPending: () => api.get<{ invites: { id: string; token: string; email: string; site: { id: string; name: string; city: string; state: string; specialties: string[] }; invited_by: string | null; expires_at: string; created_at: string }[] }>('/my-pending-invites'),
}

// --- Applications ---
export const applicationsApi = {
  list: () => api.get<PaginatedResponse<ApiApplication>>('/applications'),
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
  list: () => api.get<PaginatedResponse<ApiHourLog>>('/hour-logs'),
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
  list: () => api.get<PaginatedResponse<ApiEvaluation>>('/evaluations'),
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
  uploadCredentialFile: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload<{ credential: ApiCredential; message: string }>(`/student/credentials/${id}/upload`, formData)
  },
  downloadCredentialUrl: (id: string) => {
    const token = localStorage.getItem('cliniclink_token')
    return `${API_URL}/student/credentials/${id}/download?token=${token}`
  },
}

// --- My Students ---
export interface ApiMyStudent {
  id: string
  first_name: string
  last_name: string
  email: string
  university: string | null
  program: string | null
  program_id: string | null
  degree_type: string | null
  graduation_date: string | null
  gpa: number | null
  hours_completed: number
  prior_hours: number
  total_hours: number
  hours_required: number
  pending_hours: number
  bio: string | null
  clinical_interests: string[]
}

export interface AdminUserStats {
  applications_count: number
  hour_logs_count: number
  total_hours: number
  evaluations_as_student: number
  evaluations_as_preceptor: number
  managed_sites_count: number
  preceptor_slots_count: number
}

export const myStudentsApi = {
  list: () => api.get<{ students: ApiMyStudent[] }>('/my-students'),
}

// --- Coordinator ---
export const coordinatorApi = {
  setPriorHours: (studentId: string, prior_hours: number) =>
    api.put<{ message: string; student_id: string; prior_hours: number; total_hours: number }>(
      `/students/${studentId}/prior-hours`, { prior_hours }
    ),
  bulkSetPriorHours: (students: { student_id: string; prior_hours: number }[]) =>
    api.post<{ message: string; updated: { student_id: string; prior_hours: number; total_hours: number }[]; errors: { student_id: string; error: string }[] }>(
      '/students/bulk-prior-hours', { students }
    ),
  updateProgram: (programId: string, data: { required_hours?: number; name?: string; specialties?: string[] }) =>
    api.put<ApiProgram>(`/programs/${programId}`, data),
  createProgram: (universityId: string, data: { name: string; degree_type: string; required_hours: number; specialties?: string[] }) =>
    api.post<ApiProgram>(`/universities/${universityId}/programs`, data),
  assignStudentProgram: (studentId: string, programId: string) =>
    api.post<{ message: string; student_id: string; program: ApiProgram }>('/students/assign-program', { student_id: studentId, program_id: programId }),
}

// --- Dashboard ---
export const dashboardApi = {
  stats: () => api.get<ApiDashboardStats>('/dashboard/stats'),
}

// --- Certificates ---
export const certificatesApi = {
  list: () => api.get<{ certificates: ApiCertificate[] }>('/certificates'),
  get: (id: string) => api.get<{ certificate: ApiCertificate }>(`/certificates/${id}`),
  create: (data: { student_id: string; slot_id: string; title: string }) =>
    api.post<{ certificate: ApiCertificate }>('/certificates', data),
  eligibility: (slotId: string, studentId: string) =>
    api.get<CertificateEligibility>(`/certificates/eligibility/${slotId}/${studentId}`),
  revoke: (id: string, data: { reason: string }) =>
    api.put<{ certificate: ApiCertificate }>(`/certificates/${id}/revoke`, data),
  getPdfUrl: (id: string) => {
    const token = localStorage.getItem('cliniclink_token')
    return `${API_URL}/certificates/${id}/pdf?token=${token}`
  },
  publicVerify: (certNumber: string) =>
    api.get<CertificateVerification>(`/verify/${certNumber}`),
}

// --- Universities ---
export const universitiesApi = {
  list: (params?: { search?: string; state?: string; page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.state) qs.set('state', params.state)
    if (params?.page) qs.set('page', String(params.page))
    return api.get<PaginatedResponse<ApiUniversity>>(`/universities?${qs}`)
  },
  get: (id: string) => api.get<ApiUniversity>(`/universities/${id}`),
  programs: (id: string) => api.get<ApiProgram[]>(`/universities/${id}/programs`),
}

// --- Agreements ---
export const agreementsApi = {
  list: (params?: { status?: string; university_id?: string; site_id?: string }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.university_id) qs.set('university_id', params.university_id)
    if (params?.site_id) qs.set('site_id', params.site_id)
    return api.get<{ agreements: ApiAgreement[] }>(`/agreements?${qs}`)
  },
  create: (data: { university_id: string; site_id: string; start_date?: string; end_date?: string; document_url?: string; notes?: string }) =>
    api.post<{ agreement: ApiAgreement }>('/agreements', data),
  update: (id: string, data: { status?: string; start_date?: string; end_date?: string; document_url?: string; notes?: string }) =>
    api.put<{ agreement: ApiAgreement }>(`/agreements/${id}`, data),
  uploadDocument: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload<{ agreement: ApiAgreement; message: string }>(`/agreements/${id}/upload`, formData)
  },
  downloadUrl: (id: string) => `${API_URL}/agreements/${id}/download`,
}

// --- E-Signatures ---
export const signaturesApi = {
  listForAgreement: (agreementId: string) =>
    api.get<{ data: ApiSignature[] }>(`/agreements/${agreementId}/signatures`),
  requestSignature: (agreementId: string, data: { signer_name: string; signer_email: string; signer_role: 'university' | 'site'; message?: string }) =>
    api.post<ApiSignature>(`/agreements/${agreementId}/signatures`, data),
  sign: (signatureId: string, data: { signature_data: string }) =>
    api.put<ApiSignature>(`/signatures/${signatureId}/sign`, data),
  reject: (signatureId: string, data?: { reason?: string }) =>
    api.put<ApiSignature>(`/signatures/${signatureId}/reject`, data),
  cancel: (signatureId: string) =>
    api.put<ApiSignature>(`/signatures/${signatureId}/cancel`),
  resend: (signatureId: string) =>
    api.post<{ message: string }>(`/signatures/${signatureId}/resend`, {}),
  myPending: () =>
    api.get<{ data: ApiSignature[] }>('/signatures/pending'),
}

// --- Admin ---
export const adminApi = {
  users: (params?: { search?: string; role?: string; page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.role) qs.set('role', params.role)
    if (params?.page) qs.set('page', String(params.page))
    return api.get<PaginatedResponse<ApiUser>>(`/admin/users?${qs}`)
  },
  getUser: (id: string) => api.get<{ user: ApiUser; stats: AdminUserStats }>(`/admin/users/${id}`),
  updateUser: (id: string, data: { first_name?: string; last_name?: string; email?: string; phone?: string; username?: string; role?: string; is_active?: boolean }) =>
    api.put<{ user: ApiUser }>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  resetUserPassword: (id: string) => api.post<{ message: string; temporary_password: string; email_sent: boolean }>(`/admin/users/${id}/reset-password`, {}),
  createUser: (data: {
    first_name: string; last_name: string; email: string; role: string;
    username?: string; phone?: string;
    university_id?: string; program_id?: string; site_ids?: string[];
  }) => api.post<{ user: ApiUser; message: string }>('/admin/users', data),
  bulkInvite: (data: {
    emails: string[]; role: string;
    university_id?: string; program_id?: string; site_ids?: string[];
  }) => api.post<{ message: string; summary: { sent: number; skipped: number; failed: number; total: number }; results: { email: string; status: string; reason?: string }[] }>('/admin/users/bulk-invite', data),
  createUniversity: (data: Partial<ApiUniversity>) =>
    api.post<ApiUniversity>('/admin/universities', data),
  updateUniversity: (id: string, data: Partial<ApiUniversity>) =>
    api.put<ApiUniversity>(`/admin/universities/${id}`, data),
  deleteUniversity: (id: string) => api.delete(`/admin/universities/${id}`),
  assignPreceptorToSites: (userId: string, siteIds: string[]) =>
    api.post<{ message: string; assigned: string[]; skipped: string[] }>(`/admin/users/${userId}/assign-sites`, { site_ids: siteIds }),
  removePreceptorFromSite: (userId: string, siteId: string) =>
    api.delete<{ message: string }>(`/admin/users/${userId}/remove-site/${siteId}`),
}

// --- Onboarding Templates ---
export const onboardingTemplatesApi = {
  list: (params?: { site_id?: string }) => {
    const qs = new URLSearchParams()
    if (params?.site_id) qs.set('site_id', params.site_id)
    return api.get<{ templates: ApiOnboardingTemplate[] }>(`/onboarding-templates?${qs}`)
  },
  get: (id: string) => api.get<{ template: ApiOnboardingTemplate }>(`/onboarding-templates/${id}`),
  create: (data: { site_id: string; name: string; description?: string; is_active?: boolean; items: Array<{ title: string; description?: string; is_required?: boolean }> }) =>
    api.post<{ template: ApiOnboardingTemplate }>('/onboarding-templates', data),
  update: (id: string, data: { name?: string; description?: string; is_active?: boolean; items?: Array<{ title: string; description?: string; is_required?: boolean }> }) =>
    api.put<{ template: ApiOnboardingTemplate }>(`/onboarding-templates/${id}`, data),
  delete: (id: string) => api.delete(`/onboarding-templates/${id}`),
}

// --- Onboarding Tasks ---
export const onboardingTasksApi = {
  list: (params?: { application_id?: string }) => {
    const qs = new URLSearchParams()
    if (params?.application_id) qs.set('application_id', params.application_id)
    return api.get<{ tasks: ApiOnboardingTask[] }>(`/onboarding-tasks?${qs}`)
  },
  complete: (id: string) => api.put<{ task: ApiOnboardingTask }>(`/onboarding-tasks/${id}/complete`),
  uncomplete: (id: string) => api.put<{ task: ApiOnboardingTask }>(`/onboarding-tasks/${id}/uncomplete`),
  verify: (id: string, data?: { verification_notes?: string }) => api.put<{ task: ApiOnboardingTask }>(`/onboarding-tasks/${id}/verify`, data),
  unverify: (id: string) => api.put<{ task: ApiOnboardingTask }>(`/onboarding-tasks/${id}/unverify`),
  applicationProgress: (applicationId: string) => api.get<OnboardingProgress>(`/applications/${applicationId}/onboarding-progress`),
  uploadFile: (taskId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload<{ task: ApiOnboardingTask; message: string }>(`/onboarding-tasks/${taskId}/upload`, formData)
  },
  downloadFileUrl: (taskId: string) => `${API_URL}/onboarding-tasks/${taskId}/download`,
}

// --- Notifications ---
export interface NotificationPreferences {
  application_updates: boolean
  hour_log_reviews: boolean
  evaluations: boolean
  site_join_requests: boolean
  reminders: boolean
  product_updates: boolean
}

export const notificationsApi = {
  list: (params?: { page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return api.get<PaginatedResponse<ApiNotification>>(`/notifications?${qs}`)
  },
  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  markAsRead: (id: string) => api.put<{ message: string }>(`/notifications/${id}/read`),
  markAllAsRead: () => api.put<{ message: string }>('/notifications/read-all'),
  getPreferences: () => api.get<{ preferences: NotificationPreferences }>('/notifications/preferences'),
  updatePreferences: (data: Partial<NotificationPreferences>) =>
    api.put<{ preferences: NotificationPreferences }>('/notifications/preferences', data),
}

// --- Site Join Requests ---
export interface ApiSiteJoinRequest {
  id: string
  site_id: string
  preceptor_id: string
  message: string | null
  status: 'pending' | 'approved' | 'denied' | 'withdrawn'
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  created_at: string
  updated_at: string
  site?: ApiSite
  preceptor?: ApiUser
  reviewer?: ApiUser
}

export const siteJoinRequestsApi = {
  create: (data: { site_id: string; message?: string }) =>
    api.post<{ join_request: ApiSiteJoinRequest; message: string }>('/site-join-requests', data),
  mine: () => api.get<{ join_requests: ApiSiteJoinRequest[] }>('/site-join-requests/mine'),
  list: (params?: { status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    return api.get<{ join_requests: ApiSiteJoinRequest[] }>(`/site-join-requests?${qs}`)
  },
  withdraw: (id: string) => api.put<{ message: string }>(`/site-join-requests/${id}/withdraw`),
  approve: (id: string, data?: { notes?: string }) =>
    api.put<{ message: string }>(`/site-join-requests/${id}/approve`, data),
  deny: (id: string, data?: { notes?: string }) =>
    api.put<{ message: string }>(`/site-join-requests/${id}/deny`, data),
}

// --- API Types (match Laravel snake_case) ---
export interface ApiUser {
  id: string
  email: string
  username: string | null
  first_name: string
  last_name: string
  role: string
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  mfa_enabled: boolean
  email_verified: boolean
  created_at: string
  student_profile?: ApiStudentProfile
  credentials?: ApiCredential[]
  applications?: ApiApplication[]
  hour_logs?: ApiHourLog[]
  evaluations_as_student?: ApiEvaluation[]
  evaluations_as_preceptor?: ApiEvaluation[]
  preceptor_slots?: ApiSlot[]
  managed_sites?: ApiSite[]
  assigned_sites?: { id: string; name: string; city: string; state: string; specialties: string[] }[]
  onboarding_completed?: boolean
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
  prior_hours: number
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
  affiliation_agreements?: { id: string; university_id: string; site_id: string; status: string; start_date: string | null; end_date: string | null; university?: ApiUniversity }[]
  onboarding_templates?: { id: string; name: string; description: string | null; is_active: boolean }[]
  invites?: { id: string; email: string; role: string; status: string; created_at: string }[]
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
  applications?: ApiApplication[]
}

export interface ApiApplication {
  id: string
  student_id: string
  slot_id: string
  status: 'pending' | 'accepted' | 'declined' | 'waitlisted' | 'withdrawn' | 'completed'
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
  student?: ApiUser
}

export interface ApiEvaluation {
  id: string
  type: 'mid_rotation' | 'final' | 'student_feedback'
  template_id: string | null
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
  template?: ApiEvaluationTemplate
}

export interface ApiCredential {
  id: string
  user_id: string
  type: string
  name: string
  expiration_date: string | null
  status: 'valid' | 'expiring_soon' | 'expired' | 'pending'
  document_url: string | null
  file_path: string | null
  file_name: string | null
  file_size: number | null
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
  student_profiles_count?: number
  affiliation_agreements?: { id: string; university_id: string; site_id: string; status: string; start_date: string | null; end_date: string | null; site?: ApiSite }[]
  student_profiles?: { id: string; user_id: string; university_id: string; program_id: string | null; hours_completed?: number; hours_required?: number; user?: ApiUser; program?: ApiProgram }[]
  ce_policy?: { offers_ce: boolean; accrediting_body: string | null; contact_hours_per_rotation: number; approval_required: boolean; signer_name: string | null; signer_credentials: string | null }
  ce_certificates?: { id: string; status: string; contact_hours: string; preceptor?: ApiUser }[]
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
  signature_status: 'none' | 'pending' | 'partially_signed' | 'fully_signed'
  start_date: string | null
  end_date: string | null
  document_url: string | null
  file_path: string | null
  file_name: string | null
  file_size: number | null
  notes: string | null
  created_by: string | null
  created_at: string
  university?: ApiUniversity
  site?: ApiSite
  creator?: ApiUser
  signatures?: ApiSignature[]
}

export interface ApiSignature {
  id: string
  signable_type: string
  signable_id: string
  signer_role: 'university' | 'site'
  signer_name: string
  signer_email: string
  signer_id: string | null
  requested_by: string | null
  status: 'requested' | 'signed' | 'rejected' | 'cancelled'
  signature_data: string | null
  ip_address: string | null
  user_agent: string | null
  request_message: string | null
  rejection_reason: string | null
  requested_at: string | null
  signed_at: string | null
  rejected_at: string | null
  created_at: string
  updated_at: string
  signer?: ApiUser
  requester?: ApiUser
  signable?: ApiAgreement
}

export interface ApiCertificate {
  id: string
  student_id: string
  slot_id: string
  issued_by: string
  certificate_number: string
  title: string
  total_hours: number
  overall_score: number | null
  status: 'issued' | 'revoked'
  issued_date: string
  revoked_date: string | null
  revocation_reason: string | null
  created_at: string
  student?: ApiUser
  slot?: ApiSlot
  issuer?: ApiUser
}

export interface CertificateEligibility {
  eligible: boolean
  has_application: boolean
  total_approved_hours: number
  pending_hours: number
  has_evaluation: boolean
  has_certificate: boolean
}

export interface CertificateVerification {
  valid: boolean
  status: 'issued' | 'revoked'
  certificate_number: string
  title: string
  student_name: string
  specialty: string
  site_name: string
  preceptor_name: string | null
  total_hours: number
  overall_score: number | null
  issued_date: string
  issued_by: string
  revoked_date: string | null
  revocation_reason: string | null
}

export interface ApiDashboardStats {
  // Student stats
  applications_count?: number
  pending_applications?: number
  accepted_applications?: number
  hours_completed?: number
  prior_hours?: number
  total_hours?: number
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
  // Site Manager + Admin stats
  total_users?: number
  total_universities?: number
  recent_applications?: number
  pending_join_requests?: number
}

export interface HourSummary {
  total_hours: number
  platform_hours: number
  prior_hours: number
  by_category: Record<string, number>
  pending_hours: number
  approved_hours: number
  hours_required: number
  hours_remaining: number
  progress_percent: number
}

export interface ApiNotification {
  id: string
  type: string
  data: {
    title: string
    message: string
    link?: string
    [key: string]: unknown
  }
  read_at: string | null
  created_at: string
}

export interface ApiOnboardingTemplate {
  id: string
  site_id: string
  name: string
  description: string | null
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
  site?: ApiSite
  creator?: ApiUser
  items?: ApiOnboardingItem[]
}

export interface ApiOnboardingItem {
  id: string
  template_id: string
  title: string
  description: string | null
  is_required: boolean
  order: number
}

export interface ApiOnboardingTask {
  id: string
  application_id: string
  item_id: string | null
  title: string
  description: string | null
  is_required: boolean
  order: number
  completed_at: string | null
  completed_by: string | null
  verified_at: string | null
  verified_by: string | null
  verification_notes: string | null
  file_path: string | null
  file_name: string | null
  file_size: number | null
  created_at: string
  application?: ApiApplication
  completed_by_user?: ApiUser
  verified_by_user?: ApiUser
}

export interface OnboardingProgress {
  total_tasks: number
  required_tasks: number
  completed_required: number
  verified_required: number
  progress_percentage: number
  all_required_completed: boolean
  all_required_verified: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

// --- Compliance ---
export interface ComplianceStudent {
  student_id: string
  student_name: string
  student_email: string
  application_id: string
  rotation: string
  site_name: string
  overall_status: 'compliant' | 'in_progress' | 'non_compliant'
  credentials: {
    total: number
    valid: number
    no_expiration: number
    expired: number
    expiring_soon: number
    has_files: number
  }
  tasks: {
    total: number
    required: number
    completed: number
    verified: number
    required_completed: number
    required_verified: number
    with_files: number
  }
  agreement: {
    status: string
    id: string | null
    end_date: string | null
  }
}

export interface ComplianceSiteOverview {
  site_id: string
  site_name: string
  site_city: string
  site_state: string
  total_students: number
  compliant_students: number
  compliance_percentage: number
  students: ComplianceStudent[]
}

export const complianceApi = {
  site: (siteId: string) => api.get<{ students: ComplianceStudent[] }>(`/compliance/site/${siteId}`),
  student: (applicationId: string) => api.get<{ compliance: ComplianceStudent }>(`/compliance/student/${applicationId}`),
  overview: () => api.get<{ sites: ComplianceSiteOverview[] }>('/compliance/overview'),
}

// --- CE (Continuing Education) ---
export interface ApiCePolicy {
  id: string
  university_id: string
  offers_ce: boolean
  accrediting_body: string | null
  contact_hours_per_rotation: number
  max_hours_per_year: number | null
  requires_final_evaluation: boolean
  requires_midterm_evaluation: boolean
  requires_minimum_hours: boolean
  minimum_hours_required: number | null
  approval_required: boolean
  certificate_template_path: string | null
  signer_name: string | null
  signer_credentials: string | null
  version: number | null
  effective_from: string | null
  effective_to: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface ApiCeCertificate {
  id: string
  university_id: string
  preceptor_id: string
  application_id: string
  contact_hours: number
  status: 'pending' | 'approved' | 'issued' | 'rejected' | 'revoked'
  issued_at: string | null
  approved_by: string | null
  certificate_path: string | null
  verification_uuid: string
  rejection_reason: string | null
  revoked_at: string | null
  revoked_by: string | null
  revocation_reason: string | null
  policy_version_id: string | null
  created_at: string
  updated_at: string
  university?: ApiUniversity
  preceptor?: ApiUser
  application?: ApiApplication
  approved_by_user?: ApiUser
  revoked_by_user?: ApiUser
}

export interface ApiCeAuditEvent {
  id: string
  ce_certificate_id: string
  event_type: string
  actor_id: string | null
  actor_role: string
  metadata: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  actor?: { id: string; first_name: string; last_name: string; role: string }
}

export interface CeEligibility {
  eligible: boolean
  reason: string
  existing?: ApiCeCertificate | null
  contact_hours?: number
  university_id?: string
  preceptor_id?: string
  approved_hours?: number
  approval_required?: boolean
}

export const cePolicyApi = {
  get: (universityId: string) =>
    api.get<{ policy: ApiCePolicy | null }>(`/universities/${universityId}/ce-policy`),
  upsert: (universityId: string, data: Partial<ApiCePolicy>) =>
    api.put<{ policy: ApiCePolicy }>(`/universities/${universityId}/ce-policy`, data),
}

export const ceCertificatesApi = {
  list: (params?: { university_id?: string }) => {
    const qs = new URLSearchParams()
    if (params?.university_id) qs.set('university_id', params.university_id)
    return api.get<{ ce_certificates: ApiCeCertificate[] }>(`/ce-certificates?${qs}`)
  },
  get: (id: string) => api.get<{ ce_certificate: ApiCeCertificate }>(`/ce-certificates/${id}`),
  approve: (id: string) => api.put<{ ce_certificate: ApiCeCertificate }>(`/ce-certificates/${id}/approve`),
  reject: (id: string, data: { rejection_reason: string }) =>
    api.put<{ ce_certificate: ApiCeCertificate }>(`/ce-certificates/${id}/reject`, data),
  revoke: (id: string, data: { revocation_reason: string }) =>
    api.put<{ ce_certificate: ApiCeCertificate }>(`/ce-certificates/${id}/revoke`, data),
  auditTrail: (id: string) =>
    api.get<{ audit_trail: ApiCeAuditEvent[] }>(`/ce-certificates/${id}/audit-trail`),
  downloadUrl: (id: string) => {
    const token = localStorage.getItem('cliniclink_token')
    return `${API_URL}/ce-certificates/${id}/download?token=${token}`
  },
  eligibility: (applicationId: string) =>
    api.get<CeEligibility>(`/ce-eligibility/${applicationId}`),
  publicVerify: (uuid: string) =>
    api.get<{
      valid: boolean; status: string; verification_uuid: string;
      preceptor_name: string; contact_hours: number; university_name: string;
      specialty: string; site_name: string; rotation_period: string; issued_at: string | null;
    }>(`/verify-ce/${uuid}`),
}

export const applicationsExtApi = {
  complete: (id: string) =>
    api.put<{ application: ApiApplication; ce: { ce_certificate_created: boolean; ce_status?: string; contact_hours?: number; ce_reason?: string } }>(`/applications/${id}/complete`),
}

// --- Messages ---
export interface ApiConversation {
  id: string
  subject: string | null
  is_group: boolean
  is_broadcast?: boolean
  broadcast_by?: string | null
  unread_count: number
  created_at: string
  updated_at: string
  latest_message: ApiMessage | null
  users: ApiConversationUser[]
}

export interface ApiConversationUser {
  id: string
  first_name: string
  last_name: string
  role: string
  avatar_url: string | null
  pivot?: { last_read_at: string | null }
}

export interface ApiMessage {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
  updated_at: string
  sender?: { id: string; first_name: string; last_name: string; role: string; avatar_url: string | null }
}

export interface ApiSearchableUser {
  id: string
  first_name: string
  last_name: string
  role: string
  avatar_url: string | null
}

export const messagesApi = {
  conversations: (params?: { page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return api.get<PaginatedResponse<ApiConversation>>(`/messages/conversations?${qs}`)
  },
  messages: (conversationId: string, params?: { page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return api.get<{ messages: PaginatedResponse<ApiMessage>; conversation: ApiConversation }>(`/messages/conversations/${conversationId}?${qs}`)
  },
  send: (conversationId: string, body: string) =>
    api.post<ApiMessage>(`/messages/conversations/${conversationId}`, { body }),
  createConversation: (data: { user_id: string; body: string }) =>
    api.post<{ conversation: ApiConversation; message: ApiMessage }>('/messages/conversations', data),
  unreadCount: () => api.get<{ count: number }>('/messages/unread-count'),
  searchUsers: (search: string) => api.get<ApiSearchableUser[]>(`/messages/users?search=${encodeURIComponent(search)}`),
  broadcast: (data: { subject: string; body: string; audience: string; program_id?: string; role?: string }) =>
    api.post<{ conversation: ApiConversation; message: ApiMessage; recipients_count: number }>('/messages/broadcast', data),
}

// --- Calendar ---
export interface CalendarEvent {
  id: string
  title: string
  start: string
  end?: string
  allDay?: boolean
  color: string
  type: 'rotation' | 'hour_log' | 'evaluation' | 'deadline' | 'application'
  meta: {
    entity_id: string
    link: string
    description: string
  }
}

export const calendarApi = {
  events: (start: string, end: string) =>
    api.get<CalendarEvent[]>(`/calendar/events?start=${start}&end=${end}`),
}

// --- Bookmarks ---
export const bookmarksApi = {
  toggle: (slotId: string) => api.post<{ bookmarked: boolean }>(`/slots/${slotId}/bookmark`),
  list: (params?: { page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return api.get<PaginatedResponse<ApiSlot>>(`/slots/bookmarks?${qs}`)
  },
}

// --- Saved Searches ---
export interface ApiSavedSearch {
  id: string
  user_id: string
  name: string
  filters: { search?: string; specialty?: string; status?: string; cost_type?: string }
  alerts_enabled: boolean
  last_checked_at: string | null
  created_at: string
  updated_at: string
}

export const savedSearchesApi = {
  list: () => api.get<ApiSavedSearch[]>('/saved-searches'),
  create: (data: { name: string; filters: Record<string, string>; alerts_enabled?: boolean }) =>
    api.post<ApiSavedSearch>('/saved-searches', data),
  update: (id: string, data: { name?: string; alerts_enabled?: boolean }) =>
    api.put<ApiSavedSearch>(`/saved-searches/${id}`, data),
  delete: (id: string) => api.delete(`/saved-searches/${id}`),
}

// --- Evaluation Templates ---
export interface ApiRatingScaleLevel {
  value: number
  label: string
  description?: string
}

export interface ApiTemplateCriterion {
  key: string
  label: string
  description?: string
}

export interface ApiTemplateCategory {
  key: string
  label: string
  description?: string
  weight?: number
  criteria?: ApiTemplateCriterion[]
}

export interface ApiEvaluationTemplate {
  id: string
  university_id: string
  type: 'mid_rotation' | 'final' | 'student_feedback'
  name: string
  categories: ApiTemplateCategory[]
  rating_scale: ApiRatingScaleLevel[] | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  university?: ApiUniversity
}

export const evaluationTemplatesApi = {
  list: (params?: { university_id?: string; type?: string; active_only?: boolean }) => {
    const qs = new URLSearchParams()
    if (params?.university_id) qs.set('university_id', params.university_id)
    if (params?.type) qs.set('type', params.type)
    if (params?.active_only) qs.set('active_only', '1')
    return api.get<ApiEvaluationTemplate[]>(`/evaluation-templates?${qs}`)
  },
  get: (id: string) => api.get<ApiEvaluationTemplate>(`/evaluation-templates/${id}`),
  create: (data: { university_id: string; type: string; name: string; categories: ApiTemplateCategory[]; rating_scale?: ApiRatingScaleLevel[] }) =>
    api.post<ApiEvaluationTemplate>('/evaluation-templates', data),
  update: (id: string, data: { name?: string; categories?: ApiTemplateCategory[]; rating_scale?: ApiRatingScaleLevel[]; is_active?: boolean }) =>
    api.put<ApiEvaluationTemplate>(`/evaluation-templates/${id}`, data),
  delete: (id: string) => api.delete(`/evaluation-templates/${id}`),
}

// --- Agreement Templates ---
export interface ApiAgreementTemplate {
  id: string
  university_id: string | null
  name: string
  description: string | null
  default_notes: string | null
  file_path: string | null
  file_name: string | null
  file_size: number | null
  created_by: string | null
  created_at: string
  updated_at: string
  university?: ApiUniversity
}

export const agreementTemplatesApi = {
  list: () => api.get<ApiAgreementTemplate[]>('/agreement-templates'),
  create: (data: { university_id?: string | null; name: string; description?: string; default_notes?: string }) =>
    api.post<ApiAgreementTemplate>('/agreement-templates', data),
  update: (id: string, data: { name?: string; description?: string; default_notes?: string }) =>
    api.put<ApiAgreementTemplate>(`/agreement-templates/${id}`, data),
  delete: (id: string) => api.delete(`/agreement-templates/${id}`),
  uploadDocument: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload<ApiAgreementTemplate>(`/agreement-templates/${id}/upload`, formData)
  },
  downloadUrl: (id: string) => `${API_URL}/agreement-templates/${id}/download`,
}

// --- Preceptor Reviews ---
export interface ApiPreceptorReview {
  id: string
  student_id: string | null
  preceptor_id: string
  slot_id: string
  ratings: Record<string, number>
  comments: string | null
  overall_score: number
  is_anonymous: boolean
  created_at: string
  student?: { id: string; first_name: string; last_name: string } | null
  slot?: ApiSlot
}

export interface PreceptorReviewStats {
  average_score: number | null
  review_count: number
  category_averages: Record<string, number | null> | null
}

export const preceptorReviewsApi = {
  create: (data: {
    preceptor_id: string; slot_id: string;
    ratings: Record<string, number>; comments?: string;
    overall_score: number; is_anonymous?: boolean
  }) => api.post<ApiPreceptorReview>('/preceptor-reviews', data),
  list: (preceptorId: string) => api.get<ApiPreceptorReview[]>(`/preceptor-reviews/${preceptorId}`),
  stats: (preceptorId: string) => api.get<PreceptorReviewStats>(`/preceptor-reviews/${preceptorId}/stats`),
}

// --- Payments (Stripe Connect) ---
export interface ApiPayment {
  id: string
  payer_id: string
  payee_id: string
  application_id: string
  slot_id: string
  amount: number
  platform_fee: number
  currency: string
  stripe_payment_intent_id: string | null
  stripe_transfer_id: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  paid_at: string | null
  refunded_at: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
  payer?: ApiUser
  payee?: ApiUser
  application?: ApiApplication
  slot?: ApiSlot
}

export interface ConnectStatus {
  stripe_account_id: string | null
  stripe_onboarded: boolean
  details_submitted?: boolean
  charges_enabled?: boolean
  payouts_enabled?: boolean
}

export const paymentsApi = {
  createConnectAccount: () =>
    api.post<{ url: string; account_id: string }>('/payments/connect-account'),
  connectStatus: () =>
    api.get<ConnectStatus>('/payments/connect-status'),
  refreshConnectLink: () =>
    api.post<{ url: string }>('/payments/connect-refresh'),
  createCheckout: (data: { application_id: string }) =>
    api.post<{ client_secret: string; payment_id: string; amount: number; platform_fee: number }>('/payments/checkout', data),
  history: (params?: { page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return api.get<PaginatedResponse<ApiPayment>>(`/payments/history?${qs}`)
  },
  refund: (paymentId: string) =>
    api.post<{ payment: ApiPayment; message: string }>(`/payments/${paymentId}/refund`),
}

// --- Preceptor Profiles ---
export interface ApiPreceptorProfile {
  id: string
  user_id: string
  specialties: string[]
  years_experience: number | null
  bio: string | null
  credentials: { type: string; name: string; issuer: string; year: number | null }[]
  availability_status: 'available' | 'limited' | 'unavailable'
  max_students: number
  preferred_schedule: string | null
  teaching_philosophy: string | null
  badges: string[]
  total_students_mentored: number
  total_hours_supervised: number
  profile_visibility: 'public' | 'university_only' | 'private'
  created_at: string
  updated_at: string
  user?: ApiUser
  review_stats?: PreceptorReviewStats
}

export interface PreceptorDirectoryEntry {
  id: string
  user_id: string
  first_name: string
  last_name: string
  specialties: string[]
  bio: string | null
  availability_status: 'available' | 'limited' | 'unavailable'
  badges: string[]
  total_students_mentored: number
  years_experience: number | null
  average_rating: number | null
  review_count: number
}

export const preceptorProfilesApi = {
  directory: (params?: { search?: string; specialty?: string; availability?: string; page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.specialty) qs.set('specialty', params.specialty)
    if (params?.availability) qs.set('availability', params.availability)
    if (params?.page) qs.set('page', String(params.page))
    return api.get<PaginatedResponse<PreceptorDirectoryEntry>>(`/preceptor-profiles?${qs}`)
  },
  show: (userId: string) =>
    api.get<{ profile: ApiPreceptorProfile }>(`/preceptor-profiles/${userId}`),
  update: (data: Partial<ApiPreceptorProfile>) =>
    api.put<{ profile: ApiPreceptorProfile }>('/preceptor-profiles', data),
  refreshBadges: (userId: string) =>
    api.post<{ badges: string[]; message: string }>(`/preceptor-profiles/${userId}/refresh-badges`),
  leaderboard: () =>
    api.get<{ leaderboard: PreceptorDirectoryEntry[] }>('/preceptor-profiles/leaderboard'),
}

// --- Smart Matching ---
export interface ApiMatchingPreference {
  id: string
  user_id: string
  preferred_specialties: string[]
  preferred_states: string[]
  preferred_cities: string[]
  max_distance_miles: number | null
  preferred_schedule: string | null
  cost_preference: 'any' | 'free_only' | 'paid_ok'
  min_preceptor_rating: number | null
  preferred_start_after: string | null
  preferred_start_before: string | null
  exclude_applied: boolean
  created_at: string
  updated_at: string
}

export interface MatchingResult {
  slot: ApiSlot
  score: number
  breakdown: {
    specialty: number
    location: number
    cost: number
    schedule: number
    rating: number
    date_range: number
    availability: number
  }
}

export const matchingApi = {
  getPreferences: () =>
    api.get<{ preferences: ApiMatchingPreference | null }>('/matching/preferences'),
  updatePreferences: (data: Partial<ApiMatchingPreference>) =>
    api.put<{ preferences: ApiMatchingPreference }>('/matching/preferences', data),
  getResults: (limit?: number) => {
    const qs = new URLSearchParams()
    if (limit) qs.set('limit', String(limit))
    return api.get<{ matches: MatchingResult[] }>(`/matching/results?${qs}`)
  },
}

// --- Analytics ---
export interface AnalyticsSummary {
  total_placements?: number
  placement_rate?: number
  avg_time_to_place?: number
  active_students?: number
  total_hours?: number
  slot_fill_rate?: number
  revenue?: number
  platform_fees?: number
  [key: string]: unknown
}

export interface AnalyticsTimeSeries {
  labels: string[]
  datasets: { label: string; data: number[]; color?: string }[]
}

export interface AnalyticsMetrics {
  summary: AnalyticsSummary
  time_series?: AnalyticsTimeSeries
  specialty_demand?: { specialty: string; count: number }[]
  top_sites?: { site_id: string; site_name: string; placements: number; fill_rate: number }[]
  top_programs?: { program_id: string; program_name: string; students: number; placement_rate: number }[]
  [key: string]: unknown
}

export const analyticsApi = {
  summary: () =>
    api.get<AnalyticsSummary>('/analytics/summary'),
  platform: (params?: { period?: string; from?: string; to?: string }) => {
    const qs = new URLSearchParams()
    if (params?.period) qs.set('period', params.period)
    if (params?.from) qs.set('from', params.from)
    if (params?.to) qs.set('to', params.to)
    return api.get<AnalyticsMetrics>(`/analytics/platform?${qs}`)
  },
  university: (universityId: string, params?: { period?: string; from?: string; to?: string }) => {
    const qs = new URLSearchParams()
    if (params?.period) qs.set('period', params.period)
    if (params?.from) qs.set('from', params.from)
    if (params?.to) qs.set('to', params.to)
    return api.get<AnalyticsMetrics>(`/analytics/university/${universityId}?${qs}`)
  },
  site: (siteId: string, params?: { period?: string; from?: string; to?: string }) => {
    const qs = new URLSearchParams()
    if (params?.period) qs.set('period', params.period)
    if (params?.from) qs.set('from', params.from)
    if (params?.to) qs.set('to', params.to)
    return api.get<AnalyticsMetrics>(`/analytics/site/${siteId}?${qs}`)
  },
  demandHeatMap: () =>
    api.get<{ states: { state: string; count: number }[] }>('/analytics/demand-map'),
  specialtyDemand: () =>
    api.get<{ specialties: { specialty: string; count: number }[] }>('/analytics/specialty-demand'),
}

// --- Accreditation Reports ---
export interface ApiAccreditationReport {
  id: string
  university_id: string
  generated_by: string
  report_type: 'annual_summary' | 'program_review' | 'site_evaluation' | 'student_outcomes' | 'clinical_hours'
  title: string
  parameters: { date_from?: string; date_to?: string; program_id?: string; site_id?: string; [key: string]: unknown }
  file_path: string | null
  file_name: string | null
  file_size: number | null
  status: 'generating' | 'completed' | 'failed'
  generated_at: string | null
  created_at: string
  updated_at: string
  university?: ApiUniversity
  generated_by_user?: ApiUser
}

export const accreditationReportsApi = {
  list: (params?: { university_id?: string; page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.university_id) qs.set('university_id', params.university_id)
    if (params?.page) qs.set('page', String(params.page))
    return api.get<PaginatedResponse<ApiAccreditationReport>>(`/accreditation-reports?${qs}`)
  },
  generate: (data: { report_type: string; title?: string; university_id: string; parameters: Record<string, unknown> }) =>
    api.post<{ report: ApiAccreditationReport }>('/accreditation-reports', data),
  preview: (id: string) =>
    api.get<{ data: Record<string, unknown> }>(`/accreditation-reports/${id}/preview`),
  downloadUrl: (id: string) => {
    const token = localStorage.getItem('cliniclink_token')
    return `${API_URL}/accreditation-reports/${id}/download?token=${token}`
  },
  delete: (id: string) => api.delete(`/accreditation-reports/${id}`),
}

// --- Exports ---
export const exportsApi = {
  hourLogsCsvUrl: (params?: { status?: string; slot_id?: string; date_from?: string; date_to?: string }) => {
    const token = localStorage.getItem('cliniclink_token')
    const qs = new URLSearchParams()
    if (token) qs.set('token', token)
    if (params?.status) qs.set('status', params.status)
    if (params?.slot_id) qs.set('slot_id', params.slot_id)
    if (params?.date_from) qs.set('date_from', params.date_from)
    if (params?.date_to) qs.set('date_to', params.date_to)
    return `${API_URL}/exports/hour-logs/csv?${qs}`
  },
  hourLogsPdfUrl: (params?: { status?: string; slot_id?: string; date_from?: string; date_to?: string }) => {
    const token = localStorage.getItem('cliniclink_token')
    const qs = new URLSearchParams()
    if (token) qs.set('token', token)
    if (params?.status) qs.set('status', params.status)
    if (params?.slot_id) qs.set('slot_id', params.slot_id)
    if (params?.date_from) qs.set('date_from', params.date_from)
    if (params?.date_to) qs.set('date_to', params.date_to)
    return `${API_URL}/exports/hour-logs/pdf?${qs}`
  },
  evaluationsCsvUrl: (params?: { type?: string }) => {
    const token = localStorage.getItem('cliniclink_token')
    const qs = new URLSearchParams()
    if (token) qs.set('token', token)
    if (params?.type) qs.set('type', params.type)
    return `${API_URL}/exports/evaluations/csv?${qs}`
  },
  evaluationsPdfUrl: (params?: { type?: string }) => {
    const token = localStorage.getItem('cliniclink_token')
    const qs = new URLSearchParams()
    if (token) qs.set('token', token)
    if (params?.type) qs.set('type', params.type)
    return `${API_URL}/exports/evaluations/pdf?${qs}`
  },
  complianceCsvUrl: (params?: { site_id?: string }) => {
    const token = localStorage.getItem('cliniclink_token')
    const qs = new URLSearchParams()
    if (token) qs.set('token', token)
    if (params?.site_id) qs.set('site_id', params.site_id)
    return `${API_URL}/exports/compliance/csv?${qs}`
  },
  compliancePdfUrl: (params?: { site_id?: string }) => {
    const token = localStorage.getItem('cliniclink_token')
    const qs = new URLSearchParams()
    if (token) qs.set('token', token)
    if (params?.site_id) qs.set('site_id', params.site_id)
    return `${API_URL}/exports/compliance/pdf?${qs}`
  },
}

// --- Subscription Types ---
export interface SubscriptionStatus {
  plan: 'free' | 'pro'
  trial_ends_at: string | null
  trial_active: boolean
  trial_days_remaining: number | null
  free_rotations_used: number
  free_rotations_limit: number
  needs_upgrade: boolean
  subscription_status: string | null
  subscription_ends_at: string | null
}

// --- Subscriptions ---
export const subscriptionApi = {
  status: () =>
    api.get<SubscriptionStatus>('/subscription/status'),
  checkout: (data: { plan: 'pro'; interval?: 'month' | 'year' }) =>
    api.post<{ url: string }>('/subscription/checkout', data),
  portal: () =>
    api.post<{ url: string }>('/subscription/portal'),
}
