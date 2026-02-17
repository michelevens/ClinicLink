import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.tsx'
import { useDesignVersion } from './contexts/DesignVersionContext.tsx'
import { MainLayout } from './components/layout/MainLayout.tsx'
import { PublicNav } from './components/layout/PublicNav.tsx'
import type { ReactNode } from 'react'

// --- Lazy-loaded pages (route-based code splitting) ---
const LandingPage = lazy(() => import('./pages/LandingPage.tsx').then(m => ({ default: m.LandingPage })))
const LoginPage = lazy(() => import('./pages/LoginPage.tsx').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage.tsx').then(m => ({ default: m.RegisterPage })))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.tsx').then(m => ({ default: m.ForgotPassword })))
const ResetPassword = lazy(() => import('./pages/ResetPassword.tsx').then(m => ({ default: m.ResetPassword })))
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate.tsx').then(m => ({ default: m.VerifyCertificate })))
const VerifyCeCertificate = lazy(() => import('./pages/VerifyCeCertificate.tsx').then(m => ({ default: m.VerifyCeCertificate })))
const AcceptInvite = lazy(() => import('./pages/AcceptInvite.tsx').then(m => ({ default: m.AcceptInvite })))
const AcceptStudentInvite = lazy(() => import('./pages/AcceptStudentInvite.tsx').then(m => ({ default: m.AcceptStudentInvite })))
const VerifyEmailPrompt = lazy(() => import('./pages/VerifyEmail.tsx').then(m => ({ default: m.VerifyEmailPrompt })))
const VerifyEmailCallback = lazy(() => import('./pages/VerifyEmail.tsx').then(m => ({ default: m.VerifyEmailCallback })))
const Pricing = lazy(() => import('./pages/Pricing.tsx').then(m => ({ default: m.Pricing })))
const RotationSearch = lazy(() => import('./pages/RotationSearch.tsx').then(m => ({ default: m.RotationSearch })))
const Onboarding = lazy(() => import('./pages/Onboarding.tsx').then(m => ({ default: m.Onboarding })))
const Dashboard = lazy(() => import('./pages/Dashboard.tsx').then(m => ({ default: m.Dashboard })))
const DashboardV2 = lazy(() => import('./pages/DashboardV2.tsx').then(m => ({ default: m.DashboardV2 })))
const Applications = lazy(() => import('./pages/Applications.tsx').then(m => ({ default: m.Applications })))
const HourLog = lazy(() => import('./pages/HourLog.tsx').then(m => ({ default: m.HourLog })))
const Evaluations = lazy(() => import('./pages/Evaluations.tsx').then(m => ({ default: m.Evaluations })))
const SlotManagement = lazy(() => import('./pages/SlotManagement.tsx').then(m => ({ default: m.SlotManagement })))
const SiteApplications = lazy(() => import('./pages/SiteApplications.tsx').then(m => ({ default: m.SiteApplications })))
const Certificates = lazy(() => import('./pages/Certificates.tsx').then(m => ({ default: m.Certificates })))
const Settings = lazy(() => import('./pages/Settings.tsx').then(m => ({ default: m.Settings })))
const MySite = lazy(() => import('./pages/MySite.tsx').then(m => ({ default: m.MySite })))
const MyStudents = lazy(() => import('./pages/MyStudents.tsx').then(m => ({ default: m.MyStudents })))
const StudentDetail = lazy(() => import('./pages/StudentDetail.tsx').then(m => ({ default: m.StudentDetail })))
const Programs = lazy(() => import('./pages/Programs.tsx').then(m => ({ default: m.Programs })))
const Placements = lazy(() => import('./pages/Placements.tsx').then(m => ({ default: m.Placements })))
const SitesDirectory = lazy(() => import('./pages/SitesDirectory.tsx').then(m => ({ default: m.SitesDirectory })))
const SiteDetail = lazy(() => import('./pages/SiteDetail.tsx').then(m => ({ default: m.SiteDetail })))
const UniversityDirectory = lazy(() => import('./pages/UniversityDirectory.tsx').then(m => ({ default: m.UniversityDirectory })))
const UniversityDetail = lazy(() => import('./pages/UniversityDetail.tsx').then(m => ({ default: m.UniversityDetail })))
const OnboardingChecklists = lazy(() => import('./pages/OnboardingChecklists.tsx').then(m => ({ default: m.OnboardingChecklists })))
const Agreements = lazy(() => import('./pages/Agreements.tsx').then(m => ({ default: m.Agreements })))
const EvaluationTemplates = lazy(() => import('./pages/EvaluationTemplates.tsx').then(m => ({ default: m.EvaluationTemplates })))
const Messages = lazy(() => import('./pages/Messages.tsx').then(m => ({ default: m.Messages })))
const Calendar = lazy(() => import('./pages/Calendar.tsx').then(m => ({ default: m.Calendar })))
const ComplianceDashboard = lazy(() => import('./pages/ComplianceDashboard.tsx').then(m => ({ default: m.ComplianceDashboard })))
const CeCredits = lazy(() => import('./pages/CeCredits.tsx').then(m => ({ default: m.CeCredits })))
const AdminUsers = lazy(() => import('./pages/AdminUsers.tsx').then(m => ({ default: m.AdminUsers })))
const UserDetail = lazy(() => import('./pages/UserDetail.tsx').then(m => ({ default: m.UserDetail })))
const LicenseCodes = lazy(() => import('./pages/LicenseCodes.tsx').then(m => ({ default: m.LicenseCodes })))
const SitePreceptors = lazy(() => import('./pages/SitePreceptors.tsx').then(m => ({ default: m.SitePreceptors })))
const PreceptorDirectory = lazy(() => import('./pages/PreceptorDirectory.tsx').then(m => ({ default: m.PreceptorDirectory })))
const PreceptorDetail = lazy(() => import('./pages/PreceptorDetail.tsx').then(m => ({ default: m.PreceptorDetail })))
const Analytics = lazy(() => import('./pages/Analytics.tsx').then(m => ({ default: m.Analytics })))
const AccreditationReports = lazy(() => import('./pages/AccreditationReports.tsx').then(m => ({ default: m.AccreditationReports })))
const SitesMap = lazy(() => import('./pages/SitesMap.tsx').then(m => ({ default: m.SitesMap })))
const SsoCallback = lazy(() => import('./pages/SsoCallback.tsx').then(m => ({ default: m.SsoCallback })))

// --- Loading fallback ---
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-sm text-stone-400">Loading...</p>
      </div>
    </div>
  )
}

// --- Route wrappers ---
function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user && !user.onboardingCompleted) return <Navigate to="/onboarding" replace />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <MainLayout>{children}</MainLayout>
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function SemiProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <MainLayout>{children}</MainLayout>
  }
  return (
    <div className="min-h-screen bg-stone-50">
      <PublicNav />
      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </div>
    </div>
  )
}

function VersionedDashboard() {
  const { version } = useDesignVersion()
  return version === 'v2' ? <DashboardV2 /> : <Dashboard />
}

function OnboardingRoute() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user && user.onboardingCompleted) return <Navigate to="/dashboard" replace />
  return <Onboarding />
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/verify/:certificateNumber" element={<VerifyCertificate />} />
        <Route path="/verify-ce/:uuid" element={<VerifyCeCertificate />} />
        <Route path="/invite/:token" element={<AcceptInvite />} />
        <Route path="/student-invite/:token" element={<AcceptStudentInvite />} />
        <Route path="/verify-email" element={<VerifyEmailPrompt />} />
        <Route path="/verify-email/:token" element={<VerifyEmailCallback />} />
        <Route path="/sso/callback" element={<SsoCallback />} />

        {/* Semi-protected (works for both auth and unauth users) */}
        <Route path="/pricing" element={<SemiProtectedRoute><Pricing /></SemiProtectedRoute>} />
        <Route path="/rotations" element={<SemiProtectedRoute><RotationSearch /></SemiProtectedRoute>} />

        {/* Onboarding (full-screen, no sidebar) */}
        <Route path="/onboarding" element={<OnboardingRoute />} />

        {/* Protected — role guards match sidebar visibility */}
        <Route path="/dashboard" element={<ProtectedRoute><VersionedDashboard /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute roles={['student']}><Applications /></ProtectedRoute>} />
        <Route path="/hours" element={<ProtectedRoute roles={['student', 'preceptor']}><HourLog /></ProtectedRoute>} />
        <Route path="/evaluations" element={<ProtectedRoute roles={['student', 'preceptor']}><Evaluations /></ProtectedRoute>} />
        <Route path="/slots" element={<ProtectedRoute roles={['site_manager', 'admin']}><SlotManagement /></ProtectedRoute>} />
        <Route path="/preceptors" element={<ProtectedRoute roles={['site_manager', 'admin']}><SitePreceptors /></ProtectedRoute>} />
        <Route path="/site-applications" element={<ProtectedRoute roles={['site_manager', 'admin']}><SiteApplications /></ProtectedRoute>} />
        <Route path="/certificates" element={<ProtectedRoute roles={['student', 'preceptor', 'coordinator', 'admin']}><Certificates /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/site" element={<ProtectedRoute roles={['site_manager', 'preceptor']}><MySite /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute roles={['preceptor', 'site_manager', 'coordinator', 'professor', 'admin']}><MyStudents /></ProtectedRoute>} />
        <Route path="/students/:id" element={<ProtectedRoute roles={['preceptor', 'site_manager', 'coordinator', 'professor', 'admin']}><StudentDetail /></ProtectedRoute>} />
        <Route path="/programs" element={<ProtectedRoute roles={['coordinator', 'admin']}><Programs /></ProtectedRoute>} />
        <Route path="/placements" element={<ProtectedRoute roles={['coordinator', 'professor', 'admin']}><Placements /></ProtectedRoute>} />
        <Route path="/sites" element={<ProtectedRoute roles={['coordinator', 'admin']}><SitesDirectory /></ProtectedRoute>} />
        <Route path="/sites/:id" element={<ProtectedRoute roles={['coordinator', 'admin']}><SiteDetail /></ProtectedRoute>} />
        <Route path="/universities" element={<ProtectedRoute roles={['coordinator', 'admin']}><UniversityDirectory /></ProtectedRoute>} />
        <Route path="/universities/:id" element={<ProtectedRoute roles={['coordinator', 'admin']}><UniversityDetail /></ProtectedRoute>} />
        <Route path="/onboarding-checklists" element={<ProtectedRoute roles={['student', 'site_manager']}><OnboardingChecklists /></ProtectedRoute>} />
        <Route path="/agreements" element={<ProtectedRoute roles={['coordinator', 'site_manager', 'admin']}><Agreements /></ProtectedRoute>} />
        <Route path="/evaluation-templates" element={<ProtectedRoute roles={['coordinator', 'admin']}><EvaluationTemplates /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/messages/:id" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/compliance" element={<ProtectedRoute roles={['student', 'site_manager', 'coordinator', 'professor', 'admin']}><ComplianceDashboard /></ProtectedRoute>} />
        <Route path="/ce-credits" element={<ProtectedRoute roles={['preceptor', 'coordinator', 'admin']}><CeCredits /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/users/:id" element={<ProtectedRoute roles={['admin']}><UserDetail /></ProtectedRoute>} />
        <Route path="/admin/license-codes" element={<ProtectedRoute roles={['admin']}><LicenseCodes /></ProtectedRoute>} />
        <Route path="/preceptor-directory" element={<ProtectedRoute><PreceptorDirectory /></ProtectedRoute>} />
        <Route path="/preceptor-directory/:userId" element={<ProtectedRoute><PreceptorDetail /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute roles={['coordinator', 'site_manager', 'admin']}><Analytics /></ProtectedRoute>} />
        <Route path="/accreditation-reports" element={<ProtectedRoute roles={['coordinator', 'admin']}><AccreditationReports /></ProtectedRoute>} />
        <Route path="/sites-map" element={<ProtectedRoute roles={['coordinator', 'admin']}><SitesMap /></ProtectedRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
