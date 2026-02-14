import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.tsx'
import { MainLayout } from './components/layout/MainLayout.tsx'
import { LandingPage } from './pages/LandingPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { RegisterPage } from './pages/RegisterPage.tsx'
import { Dashboard } from './pages/Dashboard.tsx'
import { RotationSearch } from './pages/RotationSearch.tsx'
import { Applications } from './pages/Applications.tsx'
import { HourLog } from './pages/HourLog.tsx'
import { Onboarding } from './pages/Onboarding.tsx'
import { Settings } from './pages/Settings.tsx'
import { SlotManagement } from './pages/SlotManagement.tsx'
import { SiteApplications } from './pages/SiteApplications.tsx'
import { Evaluations } from './pages/Evaluations.tsx'
import { Certificates } from './pages/Certificates.tsx'
import { MyStudents } from './pages/MyStudents.tsx'
import { MySite } from './pages/MySite.tsx'
import { SitesDirectory } from './pages/SitesDirectory.tsx'
import { Programs } from './pages/Programs.tsx'
import { Placements } from './pages/Placements.tsx'
import { AdminUsers } from './pages/AdminUsers.tsx'
import { UniversityDirectory } from './pages/UniversityDirectory.tsx'
import { SiteDetail } from './pages/SiteDetail.tsx'
import { UniversityDetail } from './pages/UniversityDetail.tsx'
import { UserDetail } from './pages/UserDetail.tsx'
import { OnboardingChecklists } from './pages/OnboardingChecklists.tsx'
import { VerifyCertificate } from './pages/VerifyCertificate.tsx'
import { SitePreceptors } from './pages/SitePreceptors.tsx'
import { StudentDetail } from './pages/StudentDetail.tsx'
import { AcceptInvite } from './pages/AcceptInvite.tsx'
import { Agreements } from './pages/Agreements.tsx'
import { ComplianceDashboard } from './pages/ComplianceDashboard.tsx'
import { CeCredits } from './pages/CeCredits.tsx'
import { VerifyCeCertificate } from './pages/VerifyCeCertificate.tsx'
import { ForgotPassword } from './pages/ForgotPassword.tsx'
import { ResetPassword } from './pages/ResetPassword.tsx'
import { Messages } from './pages/Messages.tsx'
import { Calendar } from './pages/Calendar.tsx'
import { EvaluationTemplates } from './pages/EvaluationTemplates.tsx'
import { PreceptorDirectory } from './pages/PreceptorDirectory.tsx'
import { Analytics } from './pages/Analytics.tsx'
import { AccreditationReports } from './pages/AccreditationReports.tsx'
import { VerifyEmailPrompt, VerifyEmailCallback } from './pages/VerifyEmail.tsx'
import { PublicNav } from './components/layout/PublicNav.tsx'
import type { ReactNode } from 'react'

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

function OnboardingRoute() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user && user.onboardingCompleted) return <Navigate to="/dashboard" replace />
  return <Onboarding />
}

export default function App() {
  return (
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
      <Route path="/verify-email" element={<VerifyEmailPrompt />} />
      <Route path="/verify-email/:token" element={<VerifyEmailCallback />} />

      {/* Semi-protected (works for both auth and unauth users) */}
      <Route path="/rotations" element={<SemiProtectedRoute><RotationSearch /></SemiProtectedRoute>} />

      {/* Onboarding (full-screen, no sidebar) */}
      <Route path="/onboarding" element={<OnboardingRoute />} />

      {/* Protected — role guards match sidebar visibility */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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
      <Route path="/preceptor-directory" element={<ProtectedRoute><PreceptorDirectory /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute roles={['coordinator', 'site_manager', 'admin']}><Analytics /></ProtectedRoute>} />
      <Route path="/accreditation-reports" element={<ProtectedRoute roles={['coordinator', 'admin']}><AccreditationReports /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
