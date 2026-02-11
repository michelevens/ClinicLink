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
import { OnboardingChecklists } from './pages/OnboardingChecklists.tsx'
import { VerifyCertificate } from './pages/VerifyCertificate.tsx'
import { SitePreceptors } from './pages/SitePreceptors.tsx'
import { AcceptInvite } from './pages/AcceptInvite.tsx'
import { Agreements } from './pages/Agreements.tsx'
import { ComplianceDashboard } from './pages/ComplianceDashboard.tsx'
import { CeCredits } from './pages/CeCredits.tsx'
import { VerifyCeCertificate } from './pages/VerifyCeCertificate.tsx'
import { ForgotPassword } from './pages/ForgotPassword.tsx'
import { ResetPassword } from './pages/ResetPassword.tsx'
import { PublicNav } from './components/layout/PublicNav.tsx'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user && !user.onboardingCompleted) return <Navigate to="/onboarding" replace />
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

      {/* Semi-protected (works for both auth and unauth users) */}
      <Route path="/rotations" element={<SemiProtectedRoute><RotationSearch /></SemiProtectedRoute>} />

      {/* Onboarding (full-screen, no sidebar) */}
      <Route path="/onboarding" element={<OnboardingRoute />} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
      <Route path="/hours" element={<ProtectedRoute><HourLog /></ProtectedRoute>} />
      <Route path="/evaluations" element={<ProtectedRoute><Evaluations /></ProtectedRoute>} />
      <Route path="/slots" element={<ProtectedRoute><SlotManagement /></ProtectedRoute>} />
      <Route path="/preceptors" element={<ProtectedRoute><SitePreceptors /></ProtectedRoute>} />
      <Route path="/site-applications" element={<ProtectedRoute><SiteApplications /></ProtectedRoute>} />
      <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/site" element={<ProtectedRoute><MySite /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute><MyStudents /></ProtectedRoute>} />
      <Route path="/programs" element={<ProtectedRoute><Programs /></ProtectedRoute>} />
      <Route path="/placements" element={<ProtectedRoute><Placements /></ProtectedRoute>} />
      <Route path="/sites" element={<ProtectedRoute><SitesDirectory /></ProtectedRoute>} />
      <Route path="/universities" element={<ProtectedRoute><UniversityDirectory /></ProtectedRoute>} />
      <Route path="/onboarding-checklists" element={<ProtectedRoute><OnboardingChecklists /></ProtectedRoute>} />
      <Route path="/agreements" element={<ProtectedRoute><Agreements /></ProtectedRoute>} />
      <Route path="/compliance" element={<ProtectedRoute><ComplianceDashboard /></ProtectedRoute>} />
      <Route path="/ce-credits" element={<ProtectedRoute><CeCredits /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
