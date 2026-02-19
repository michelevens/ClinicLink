import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  dashboardApi, slotsApi, applicationsApi, hourLogsApi,
  evaluationsApi, studentApi, sitesApi, certificatesApi, myStudentsApi, adminApi, universitiesApi, notificationsApi,
  onboardingTemplatesApi, onboardingTasksApi, sitePreceptorsApi, siteInvitesApi, agreementsApi, complianceApi,
  cePolicyApi, ceCertificatesApi, applicationsExtApi, coordinatorApi, authApi, siteJoinRequestsApi,
  messagesApi, calendarApi, bookmarksApi, savedSearchesApi, evaluationTemplatesApi, agreementTemplatesApi,
  preceptorReviewsApi, paymentsApi, preceptorProfilesApi, matchingApi, analyticsApi, accreditationReportsApi,
  signaturesApi, subscriptionApi, aiChatApi, studentInvitesApi, supportApi,
} from '../services/api.ts'

// --- Dashboard ---
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats(),
  })
}

// --- Rotation Slots ---
export function useSlots(params?: { search?: string; specialty?: string; status?: string; cost_type?: string; page?: number; site_id?: string }) {
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

export function usePreceptors() {
  return useQuery({
    queryKey: ['preceptors'],
    queryFn: () => slotsApi.preceptors(),
  })
}

// --- Sites ---
export function useSites(params?: { search?: string; specialty?: string; state?: string; page?: number }) {
  return useQuery({
    queryKey: ['sites', params],
    queryFn: () => sitesApi.list(params),
  })
}

export function useSite(id: string) {
  return useQuery({
    queryKey: ['site', id],
    queryFn: () => sitesApi.get(id),
    enabled: !!id,
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

export function useMyUniversityLicenseCodes() {
  return useQuery({
    queryKey: ['my-university-license-codes'],
    queryFn: () => coordinatorApi.myUniversityLicenseCodes(),
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

export function useUploadCredentialFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => studentApi.uploadCredentialFile(id, file),
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

export function usePendingApprovals() {
  return useQuery({
    queryKey: ['admin-pending-approvals'],
    queryFn: () => adminApi.pendingApprovals(),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminApi.updateUser>[1] }) => adminApi.updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      qc.invalidateQueries({ queryKey: ['admin-user'] })
      qc.invalidateQueries({ queryKey: ['admin-pending-approvals'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.createUser,
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

export function useResetUserPassword() {
  return useMutation({
    mutationFn: adminApi.resetUserPassword,
  })
}

export function useBulkInviteUsers() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.bulkInvite,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }) },
  })
}

export function useAssignPreceptorToSites() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, siteIds }: { userId: string; siteIds: string[] }) => adminApi.assignPreceptorToSites(userId, siteIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-user'] })
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

export function useRemovePreceptorFromSite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, siteId }: { userId: string; siteId: string }) => adminApi.removePreceptorFromSite(userId, siteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-user'] })
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

export function useAssignSiteManagerToSites() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, siteIds }: { userId: string; siteIds: string[] }) => adminApi.assignSiteManagerToSites(userId, siteIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-user'] })
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

export function useRemoveSiteManagerFromSite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, siteId }: { userId: string; siteId: string }) => adminApi.removeSiteManagerFromSite(userId, siteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-user'] })
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

export function useAssignManagerToSite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ siteId, managerId }: { siteId: string; managerId: string }) => adminApi.assignManagerToSite(siteId, managerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site'] })
      qc.invalidateQueries({ queryKey: ['sites'] })
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

// --- License Codes ---
export function useLicenseCodes(params?: { university_id?: string; page?: number }) {
  return useQuery({
    queryKey: ['license-codes', params],
    queryFn: () => adminApi.licenseCodes(params),
  })
}

export function useCreateLicenseCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.createLicenseCode,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['license-codes'] }) },
  })
}

export function useDeactivateLicenseCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.deactivateLicenseCode,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['license-codes'] }) },
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

export function useCreateProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ universityId, data }: { universityId: string; data: Parameters<typeof coordinatorApi.createProgram>[1] }) =>
      coordinatorApi.createProgram(universityId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['universities'] })
      qc.invalidateQueries({ queryKey: ['university-programs'] })
    },
  })
}

export function useAssignStudentProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ studentId, programId }: { studentId: string; programId: string }) =>
      coordinatorApi.assignStudentProgram(studentId, programId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-students'] })
      qc.invalidateQueries({ queryKey: ['university-programs'] })
      qc.invalidateQueries({ queryKey: ['admin-user'] })
    },
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

// --- MFA ---
export function useMfaStatus() {
  return useQuery({
    queryKey: ['mfa-status'],
    queryFn: () => authApi.mfaStatus(),
  })
}

export function useMfaSetup() {
  return useMutation({
    mutationFn: () => authApi.mfaSetup(),
  })
}

export function useMfaConfirm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => authApi.mfaConfirm(code),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mfa-status'] }) },
  })
}

export function useMfaDisable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (password: string) => authApi.mfaDisable(password),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mfa-status'] }) },
  })
}

export function useMfaBackupCodes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (password: string) => authApi.mfaBackupCodes(password),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mfa-status'] }) },
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

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationsApi.getPreferences(),
  })
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.updatePreferences,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notification-preferences'] }) },
  })
}

// --- Site Join Requests ---
export function useCreateJoinRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: siteJoinRequestsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-join-requests'] })
      qc.invalidateQueries({ queryKey: ['site-join-requests'] })
    },
  })
}

export function useMyJoinRequests() {
  return useQuery({
    queryKey: ['my-join-requests'],
    queryFn: () => siteJoinRequestsApi.mine(),
  })
}

export function useSiteJoinRequests(params?: { status?: string }) {
  return useQuery({
    queryKey: ['site-join-requests', params],
    queryFn: () => siteJoinRequestsApi.list(params),
  })
}

export function useWithdrawJoinRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: siteJoinRequestsApi.withdraw,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-join-requests'] })
      qc.invalidateQueries({ queryKey: ['site-join-requests'] })
    },
  })
}

export function useApproveJoinRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => siteJoinRequestsApi.approve(id, { notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-join-requests'] })
      qc.invalidateQueries({ queryKey: ['site-preceptors'] })
      qc.invalidateQueries({ queryKey: ['site-invites'] })
    },
  })
}

export function useDenyJoinRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => siteJoinRequestsApi.deny(id, { notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-join-requests'] })
    },
  })
}

// --- Onboarding Templates ---
export function useOnboardingTemplates(params?: { site_id?: string }) {
  return useQuery({
    queryKey: ['onboarding-templates', params],
    queryFn: () => onboardingTemplatesApi.list(params),
  })
}

export function useCreateOnboardingTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: onboardingTemplatesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['onboarding-templates'] }) },
  })
}

export function useUpdateOnboardingTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof onboardingTemplatesApi.update>[1] }) => onboardingTemplatesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['onboarding-templates'] }) },
  })
}

export function useDeleteOnboardingTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: onboardingTemplatesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['onboarding-templates'] }) },
  })
}

// --- Onboarding Tasks ---
export function useOnboardingTasks(params?: { application_id?: string }) {
  return useQuery({
    queryKey: ['onboarding-tasks', params],
    queryFn: () => onboardingTasksApi.list(params),
  })
}

export function useCompleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: onboardingTasksApi.complete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onboarding-tasks'] })
      qc.invalidateQueries({ queryKey: ['onboarding-progress'] })
    },
  })
}

export function useUncompleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: onboardingTasksApi.uncomplete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onboarding-tasks'] })
      qc.invalidateQueries({ queryKey: ['onboarding-progress'] })
    },
  })
}

export function useVerifyTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { verification_notes?: string } }) => onboardingTasksApi.verify(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onboarding-tasks'] })
      qc.invalidateQueries({ queryKey: ['onboarding-progress'] })
    },
  })
}

export function useUnverifyTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: onboardingTasksApi.unverify,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onboarding-tasks'] })
      qc.invalidateQueries({ queryKey: ['onboarding-progress'] })
    },
  })
}

export function useOnboardingProgress(applicationId: string | null) {
  return useQuery({
    queryKey: ['onboarding-progress', applicationId],
    queryFn: () => onboardingTasksApi.applicationProgress(applicationId!),
    enabled: !!applicationId,
  })
}

export function useUploadTaskFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, file }: { taskId: string; file: File }) => onboardingTasksApi.uploadFile(taskId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onboarding-tasks'] })
      qc.invalidateQueries({ queryKey: ['onboarding-progress'] })
    },
  })
}

// --- Agreements ---
export function useAgreements(params?: { status?: string; university_id?: string; site_id?: string }) {
  return useQuery({
    queryKey: ['agreements', params],
    queryFn: () => agreementsApi.list(params),
  })
}

export function useCreateAgreement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: agreementsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['agreements'] }) },
  })
}

export function useUpdateAgreement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof agreementsApi.update>[1] }) => agreementsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['agreements'] }) },
  })
}

export function useUploadAgreementDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => agreementsApi.uploadDocument(id, file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['agreements'] }) },
  })
}

// --- Site Preceptors ---
export function useSitePreceptors() {
  return useQuery({
    queryKey: ['site-preceptors'],
    queryFn: () => sitePreceptorsApi.list(),
  })
}

// --- Site Invites ---
export function useSiteInvites() {
  return useQuery({
    queryKey: ['site-invites'],
    queryFn: () => siteInvitesApi.list(),
  })
}

export function useCreateInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: siteInvitesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['site-invites'] }) },
  })
}

export function useBulkCreateInvites() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: siteInvitesApi.bulkCreate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['site-invites'] }) },
  })
}

export function useMyPendingInvites() {
  return useQuery({
    queryKey: ['my-pending-invites'],
    queryFn: () => siteInvitesApi.myPending(),
  })
}

export function useAcceptInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: siteInvitesApi.accept,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-pending-invites'] })
      qc.invalidateQueries({ queryKey: ['site-invites'] })
      qc.invalidateQueries({ queryKey: ['my-sites'] })
    },
  })
}

export function useResendInvite() {
  return useMutation({
    mutationFn: siteInvitesApi.resend,
  })
}

export function useRevokeInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: siteInvitesApi.revoke,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['site-invites'] }) },
  })
}

// --- Student Invites ---
export function useStudentInvites() {
  return useQuery({
    queryKey: ['student-invites'],
    queryFn: () => studentInvitesApi.list(),
  })
}

export function useCreateStudentInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: studentInvitesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-invites'] }) },
  })
}

export function useBulkCreateStudentInvites() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: studentInvitesApi.bulkCreate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-invites'] }) },
  })
}

export function useAcceptStudentInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: studentInvitesApi.accept,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth-me'] })
      qc.invalidateQueries({ queryKey: ['student-invites'] })
    },
  })
}

export function useResendStudentInvite() {
  return useMutation({
    mutationFn: studentInvitesApi.resend,
  })
}

export function useRevokeStudentInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: studentInvitesApi.revoke,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-invites'] }) },
  })
}

// --- Compliance ---
export function useComplianceSite(siteId: string | null) {
  return useQuery({
    queryKey: ['compliance-site', siteId],
    queryFn: () => complianceApi.site(siteId!),
    enabled: !!siteId,
  })
}

export function useComplianceStudent(applicationId: string | null) {
  return useQuery({
    queryKey: ['compliance-student', applicationId],
    queryFn: () => complianceApi.student(applicationId!),
    enabled: !!applicationId,
  })
}

export function useComplianceOverview() {
  return useQuery({
    queryKey: ['compliance-overview'],
    queryFn: () => complianceApi.overview(),
  })
}

// --- CE Policy ---
export function useCePolicy(universityId: string | null) {
  return useQuery({
    queryKey: ['ce-policy', universityId],
    queryFn: () => cePolicyApi.get(universityId!),
    enabled: !!universityId,
  })
}

export function useUpsertCePolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ universityId, data }: { universityId: string; data: Parameters<typeof cePolicyApi.upsert>[1] }) =>
      cePolicyApi.upsert(universityId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ce-policy'] }) },
  })
}

// --- CE Certificates ---
export function useCeCertificates(params?: { university_id?: string }) {
  return useQuery({
    queryKey: ['ce-certificates', params],
    queryFn: () => ceCertificatesApi.list(params),
  })
}

export function useCeCertificate(id: string | null) {
  return useQuery({
    queryKey: ['ce-certificate', id],
    queryFn: () => ceCertificatesApi.get(id!),
    enabled: !!id,
  })
}

export function useApproveCeCertificate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ceCertificatesApi.approve,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ce-certificates'] }) },
  })
}

export function useRejectCeCertificate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { rejection_reason: string } }) => ceCertificatesApi.reject(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ce-certificates'] }) },
  })
}

export function useRevokeCeCertificate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { revocation_reason: string } }) => ceCertificatesApi.revoke(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ce-certificates'] }) },
  })
}

export function useCeAuditTrail(certificateId: string | null) {
  return useQuery({
    queryKey: ['ce-audit-trail', certificateId],
    queryFn: () => ceCertificatesApi.auditTrail(certificateId!),
    enabled: !!certificateId,
  })
}

export function useCeEligibility(applicationId: string | null) {
  return useQuery({
    queryKey: ['ce-eligibility', applicationId],
    queryFn: () => ceCertificatesApi.eligibility(applicationId!),
    enabled: !!applicationId,
  })
}

export function useCompleteApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: applicationsExtApi.complete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      qc.invalidateQueries({ queryKey: ['ce-certificates'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

// --- Messages ---
export function useConversations(params?: { page?: number }) {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => messagesApi.conversations(params),
    refetchInterval: 15000,
  })
}

export function useConversation(conversationId: string | null, page?: number) {
  return useQuery({
    queryKey: ['conversation', conversationId, page],
    queryFn: () => messagesApi.messages(conversationId!, page ? { page } : undefined),
    enabled: !!conversationId,
    refetchInterval: !page || page === 1 ? 10000 : false,
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, body }: { conversationId: string; body: string }) =>
      messagesApi.send(conversationId, body),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['conversation', variables.conversationId] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useCreateConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: messagesApi.createConversation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useMessageUnreadCount() {
  return useQuery({
    queryKey: ['message-unread-count'],
    queryFn: () => messagesApi.unreadCount(),
    refetchInterval: 30000,
  })
}

export function useSearchMessageableUsers(search: string) {
  return useQuery({
    queryKey: ['messageable-users', search],
    queryFn: () => messagesApi.searchUsers(search),
    enabled: search.length >= 2,
  })
}

export function useBroadcastMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: messagesApi.broadcast,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

// --- Calendar ---
export function useCalendarEvents(start: string | null, end: string | null) {
  return useQuery({
    queryKey: ['calendar-events', start, end],
    queryFn: () => calendarApi.events(start!, end!),
    enabled: !!start && !!end,
  })
}

// --- Bookmarks ---
export function useBookmarkedSlots(params?: { page?: number }, enabled = true) {
  return useQuery({
    queryKey: ['bookmarked-slots', params],
    queryFn: () => bookmarksApi.list(params),
    enabled,
  })
}

export function useToggleBookmark() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bookmarksApi.toggle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookmarked-slots'] })
      qc.invalidateQueries({ queryKey: ['slots'] })
    },
  })
}

// --- Saved Searches ---
export function useSavedSearches() {
  return useQuery({
    queryKey: ['saved-searches'],
    queryFn: () => savedSearchesApi.list(),
  })
}

export function useCreateSavedSearch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: savedSearchesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['saved-searches'] }) },
  })
}

export function useUpdateSavedSearch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof savedSearchesApi.update>[1] }) =>
      savedSearchesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['saved-searches'] }) },
  })
}

export function useDeleteSavedSearch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: savedSearchesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['saved-searches'] }) },
  })
}

// --- Evaluation Templates ---
export function useEvaluationTemplates(params?: { university_id?: string; type?: string; active_only?: boolean }) {
  return useQuery({
    queryKey: ['evaluation-templates', params],
    queryFn: () => evaluationTemplatesApi.list(params),
  })
}

export function useEvaluationTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ['evaluation-templates', id],
    queryFn: () => evaluationTemplatesApi.get(id!),
    enabled: !!id,
  })
}

export function useCreateEvaluationTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: evaluationTemplatesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['evaluation-templates'] }) },
  })
}

export function useUpdateEvaluationTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof evaluationTemplatesApi.update>[1] }) =>
      evaluationTemplatesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['evaluation-templates'] }) },
  })
}

export function useDeleteEvaluationTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: evaluationTemplatesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['evaluation-templates'] }) },
  })
}

// --- Agreement Templates ---
export function useAgreementTemplates() {
  return useQuery({
    queryKey: ['agreement-templates'],
    queryFn: () => agreementTemplatesApi.list(),
  })
}

export function useCreateAgreementTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: agreementTemplatesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['agreement-templates'] }) },
  })
}

export function useUpdateAgreementTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof agreementTemplatesApi.update>[1] }) =>
      agreementTemplatesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['agreement-templates'] }) },
  })
}

export function useDeleteAgreementTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: agreementTemplatesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['agreement-templates'] }) },
  })
}

export function useUploadAgreementTemplateDoc() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => agreementTemplatesApi.uploadDocument(id, file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['agreement-templates'] }) },
  })
}

// --- Preceptor Reviews ---
export function usePreceptorReviews(preceptorId: string | null) {
  return useQuery({
    queryKey: ['preceptor-reviews', preceptorId],
    queryFn: () => preceptorReviewsApi.list(preceptorId!),
    enabled: !!preceptorId,
  })
}

export function usePreceptorReviewStats(preceptorId: string | null) {
  return useQuery({
    queryKey: ['preceptor-review-stats', preceptorId],
    queryFn: () => preceptorReviewsApi.stats(preceptorId!),
    enabled: !!preceptorId,
  })
}

export function useCreatePreceptorReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: preceptorReviewsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['preceptor-reviews'] })
      qc.invalidateQueries({ queryKey: ['preceptor-review-stats'] })
    },
  })
}

// --- Payments (Stripe Connect) ---
export function useCreateConnectAccount() {
  return useMutation({
    mutationFn: paymentsApi.createConnectAccount,
  })
}

export function useConnectStatus() {
  return useQuery({
    queryKey: ['connect-status'],
    queryFn: () => paymentsApi.connectStatus(),
  })
}

export function useRefreshConnectLink() {
  return useMutation({
    mutationFn: paymentsApi.refreshConnectLink,
  })
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: paymentsApi.createCheckout,
  })
}

export function usePaymentHistory(params?: { page?: number }) {
  return useQuery({
    queryKey: ['payment-history', params],
    queryFn: () => paymentsApi.history(params),
  })
}

export function useRefundPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: paymentsApi.refund,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payment-history'] }) },
  })
}

// --- Preceptor Profiles ---
export function usePreceptorDirectory(params?: { search?: string; specialty?: string; availability?: string; page?: number }) {
  return useQuery({
    queryKey: ['preceptor-directory', params],
    queryFn: () => preceptorProfilesApi.directory(params),
  })
}

export function usePreceptorProfile(userId: string | null) {
  return useQuery({
    queryKey: ['preceptor-profile', userId],
    queryFn: () => preceptorProfilesApi.show(userId!),
    enabled: !!userId,
  })
}

export function useUpdatePreceptorProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: preceptorProfilesApi.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['preceptor-profile'] })
      qc.invalidateQueries({ queryKey: ['preceptor-directory'] })
    },
  })
}

export function useRefreshBadges() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: preceptorProfilesApi.refreshBadges,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['preceptor-profile'] }) },
  })
}

export function usePreceptorLeaderboard() {
  return useQuery({
    queryKey: ['preceptor-leaderboard'],
    queryFn: () => preceptorProfilesApi.leaderboard(),
  })
}

// --- Smart Matching ---
export function useMatchingPreferences() {
  return useQuery({
    queryKey: ['matching-preferences'],
    queryFn: () => matchingApi.getPreferences(),
  })
}

export function useUpdateMatchingPreferences() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: matchingApi.updatePreferences,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matching-preferences'] })
      qc.invalidateQueries({ queryKey: ['matching-results'] })
    },
  })
}

export function useMatchingResults(limit?: number) {
  return useQuery({
    queryKey: ['matching-results', limit],
    queryFn: () => matchingApi.getResults(limit),
  })
}

// --- Analytics ---
export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsApi.summary(),
  })
}

export function usePlatformAnalytics(params?: { period?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ['platform-analytics', params],
    queryFn: () => analyticsApi.platform(params),
  })
}

export function useUniversityAnalytics(universityId: string | null, params?: { period?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ['university-analytics', universityId, params],
    queryFn: () => analyticsApi.university(universityId!, params),
    enabled: !!universityId,
  })
}

export function useSiteAnalytics(siteId: string | null, params?: { period?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ['site-analytics', siteId, params],
    queryFn: () => analyticsApi.site(siteId!, params),
    enabled: !!siteId,
  })
}

export function useDemandHeatMap() {
  return useQuery({
    queryKey: ['demand-heat-map'],
    queryFn: () => analyticsApi.demandHeatMap(),
  })
}

export function useSpecialtyDemand() {
  return useQuery({
    queryKey: ['specialty-demand'],
    queryFn: () => analyticsApi.specialtyDemand(),
  })
}

// --- Accreditation Reports ---
export function useAccreditationReports(params?: { university_id?: string; page?: number }) {
  return useQuery({
    queryKey: ['accreditation-reports', params],
    queryFn: () => accreditationReportsApi.list(params),
  })
}

export function useGenerateReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: accreditationReportsApi.generate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accreditation-reports'] }) },
  })
}

export function useReportPreview(id: string | null) {
  return useQuery({
    queryKey: ['report-preview', id],
    queryFn: () => accreditationReportsApi.preview(id!),
    enabled: !!id,
  })
}

export function useDeleteReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: accreditationReportsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accreditation-reports'] }) },
  })
}

// --- E-Signatures ---
export function useAgreementSignatures(agreementId: string | null) {
  return useQuery({
    queryKey: ['agreement-signatures', agreementId],
    queryFn: () => signaturesApi.listForAgreement(agreementId!),
    enabled: !!agreementId,
  })
}

export function useMyPendingSignatures() {
  return useQuery({
    queryKey: ['pending-signatures'],
    queryFn: () => signaturesApi.myPending(),
  })
}

export function useRequestSignature() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ agreementId, data }: { agreementId: string; data: Parameters<typeof signaturesApi.requestSignature>[1] }) =>
      signaturesApi.requestSignature(agreementId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agreement-signatures'] })
      qc.invalidateQueries({ queryKey: ['agreements'] })
    },
  })
}

export function useSignSignature() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { signature_data: string } }) =>
      signaturesApi.sign(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agreement-signatures'] })
      qc.invalidateQueries({ queryKey: ['agreements'] })
      qc.invalidateQueries({ queryKey: ['pending-signatures'] })
    },
  })
}

export function useRejectSignature() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { reason?: string } }) =>
      signaturesApi.reject(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agreement-signatures'] })
      qc.invalidateQueries({ queryKey: ['agreements'] })
      qc.invalidateQueries({ queryKey: ['pending-signatures'] })
    },
  })
}

export function useCancelSignature() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: signaturesApi.cancel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agreement-signatures'] })
      qc.invalidateQueries({ queryKey: ['agreements'] })
    },
  })
}

export function useResendSignature() {
  return useMutation({
    mutationFn: signaturesApi.resend,
  })
}

// --- Subscriptions ---
export function useSubscriptionStatus(enabled = true) {
  return useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => subscriptionApi.status(),
    enabled,
  })
}

export function useSubscriptionCheckout() {
  return useMutation({
    mutationFn: subscriptionApi.checkout,
  })
}

export function useSubscriptionPortal() {
  return useMutation({
    mutationFn: subscriptionApi.portal,
  })
}

// --- AI Chat ---
export function useAiConversations() {
  return useQuery({
    queryKey: ['ai-conversations'],
    queryFn: () => aiChatApi.conversations(),
  })
}

export function useAiMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['ai-messages', conversationId],
    queryFn: () => aiChatApi.messages(conversationId!),
    enabled: !!conversationId,
  })
}

export function useAiSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: aiChatApi.send,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['ai-conversations'] })
      if (variables.conversation_id) {
        qc.invalidateQueries({ queryKey: ['ai-messages', variables.conversation_id] })
      }
    },
  })
}

export function useAiDeleteConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: aiChatApi.deleteConversation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-conversations'] })
    },
  })
}

export function useAiSuggestions(page?: string) {
  return useQuery({
    queryKey: ['ai-suggestions', page],
    queryFn: () => aiChatApi.suggestions(page),
    staleTime: 10 * 60 * 1000,
  })
}

// --- Support Requests ---
export function useSubmitSupportRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: supportApi.submit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['support-requests'] }),
  })
}
