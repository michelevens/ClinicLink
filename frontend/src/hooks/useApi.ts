import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  dashboardApi, slotsApi, applicationsApi, hourLogsApi,
  evaluationsApi, studentApi, sitesApi, certificatesApi, myStudentsApi, adminApi, universitiesApi, notificationsApi,
} from '../services/api.ts'

// --- Dashboard ---
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats(),
  })
}

// --- Rotation Slots ---
export function useSlots(params?: { search?: string; specialty?: string; status?: string; cost_type?: string; page?: number }) {
  return useQuery({
    queryKey: ['slots', params],
    queryFn: () => slotsApi.list(params),
  })
}

export function useSlot(id: string) {
  return useQuery({
    queryKey: ['slot', id],
    queryFn: () => slotsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateSlot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: slotsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['slots'] }) },
  })
}

export function useUpdateSlot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof slotsApi.update>[1] }) => slotsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['slots'] }) },
  })
}

export function useDeleteSlot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: slotsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['slots'] }) },
  })
}

// --- Sites ---
export function useSites(params?: { search?: string; specialty?: string; state?: string; page?: number }) {
  return useQuery({
    queryKey: ['sites', params],
    queryFn: () => sitesApi.list(params),
  })
}

export function useMySites() {
  return useQuery({
    queryKey: ['my-sites'],
    queryFn: () => sitesApi.mine(),
  })
}

export function useCreateSite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: sitesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sites'] })
      qc.invalidateQueries({ queryKey: ['my-sites'] })
    },
  })
}

export function useUpdateSite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof sitesApi.update>[1] }) => sitesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sites'] })
      qc.invalidateQueries({ queryKey: ['my-sites'] })
    },
  })
}

// --- Applications ---
export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.list(),
  })
}

export function useCreateApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: applicationsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useReviewApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof applicationsApi.review>[1] }) => applicationsApi.review(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useWithdrawApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: applicationsApi.withdraw,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

// --- Hour Logs ---
export function useHourLogs() {
  return useQuery({
    queryKey: ['hour-logs'],
    queryFn: () => hourLogsApi.list(),
  })
}

export function useHourSummary() {
  return useQuery({
    queryKey: ['hour-summary'],
    queryFn: () => hourLogsApi.summary(),
  })
}

export function useCreateHourLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: hourLogsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hour-logs'] })
      qc.invalidateQueries({ queryKey: ['hour-summary'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useReviewHourLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof hourLogsApi.review>[1] }) => hourLogsApi.review(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hour-logs'] })
      qc.invalidateQueries({ queryKey: ['hour-summary'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useDeleteHourLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: hourLogsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hour-logs'] })
      qc.invalidateQueries({ queryKey: ['hour-summary'] })
    },
  })
}

// --- Evaluations ---
export function useEvaluations() {
  return useQuery({
    queryKey: ['evaluations'],
    queryFn: () => evaluationsApi.list(),
  })
}

export function useCreateEvaluation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: evaluationsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['evaluations'] }) },
  })
}

export function useUpdateEvaluation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof evaluationsApi.update>[1] }) => evaluationsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['evaluations'] }) },
  })
}

// --- Certificates ---
export function useCertificates() {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificatesApi.list(),
  })
}

export function useCreateCertificate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: certificatesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['certificates'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useCertificateEligibility(slotId: string, studentId: string) {
  return useQuery({
    queryKey: ['certificate-eligibility', slotId, studentId],
    queryFn: () => certificatesApi.eligibility(slotId, studentId),
    enabled: !!slotId && !!studentId,
  })
}

export function useRevokeCertificate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { reason: string } }) => certificatesApi.revoke(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['certificates'] }) },
  })
}

// --- My Students ---
export function useMyStudents() {
  return useQuery({
    queryKey: ['my-students'],
    queryFn: () => myStudentsApi.list(),
  })
}

// --- Student Profile ---
export function useStudentProfile() {
  return useQuery({
    queryKey: ['student-profile'],
    queryFn: () => studentApi.profile(),
  })
}

export function useUpdateStudentProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: studentApi.updateProfile,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-profile'] }) },
  })
}

export function useCredentials() {
  return useQuery({
    queryKey: ['credentials'],
    queryFn: () => studentApi.credentials(),
  })
}

export function useAddCredential() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: studentApi.addCredential,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['credentials'] }) },
  })
}

export function useDeleteCredential() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: studentApi.deleteCredential,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['credentials'] }) },
  })
}

// --- Admin ---
export function useAdminUsers(params?: { search?: string; role?: string; page?: number }) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => adminApi.users(params),
  })
}

export function useAdminUser(id: string | null) {
  return useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => adminApi.getUser(id!),
    enabled: !!id,
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminApi.updateUser>[1] }) => adminApi.updateUser(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }) },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }) },
  })
}

// --- Universities ---
export function useUniversities(params?: { search?: string; state?: string; page?: number }) {
  return useQuery({
    queryKey: ['universities', params],
    queryFn: () => universitiesApi.list(params),
  })
}

export function useCreateUniversity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.createUniversity,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['universities'] }) },
  })
}

export function useUpdateUniversity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminApi.updateUniversity>[1] }) => adminApi.updateUniversity(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['universities'] }) },
  })
}

export function useDeleteUniversity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.deleteUniversity,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['universities'] }) },
  })
}

export function useUniversity(id: string | null) {
  return useQuery({
    queryKey: ['university', id],
    queryFn: () => universitiesApi.get(id!),
    enabled: !!id,
  })
}

// --- Notifications ---
export function useNotifications(params?: { page?: number }) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationsApi.list(params),
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 30000,
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })
}
