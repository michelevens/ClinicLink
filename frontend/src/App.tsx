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
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <MainLayout>{children}</MainLayout>
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">{title}</h2>
        <p className="text-stone-500">This feature is coming soon. Check back later!</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/rotations" element={<ProtectedRoute><RotationSearch /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
      <Route path="/hours" element={<ProtectedRoute><HourLog /></ProtectedRoute>} />
      <Route path="/evaluations" element={<ProtectedRoute><ComingSoon title="Evaluations" /></ProtectedRoute>} />
      <Route path="/site" element={<ProtectedRoute><ComingSoon title="My Site" /></ProtectedRoute>} />
      <Route path="/slots" element={<ProtectedRoute><ComingSoon title="Rotation Slots" /></ProtectedRoute>} />
      <Route path="/site-applications" element={<ProtectedRoute><ComingSoon title="Site Applications" /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute><ComingSoon title="My Students" /></ProtectedRoute>} />
      <Route path="/programs" element={<ProtectedRoute><ComingSoon title="Programs" /></ProtectedRoute>} />
      <Route path="/placements" element={<ProtectedRoute><ComingSoon title="Placements" /></ProtectedRoute>} />
      <Route path="/sites" element={<ProtectedRoute><ComingSoon title="Sites Directory" /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><ComingSoon title="User Management" /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><ComingSoon title="Settings" /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
