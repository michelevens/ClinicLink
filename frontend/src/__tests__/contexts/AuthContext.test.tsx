import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '../../contexts/AuthContext.tsx'
import { BrowserRouter } from 'react-router-dom'
import type { UserRole } from '../../types/index.ts'

// Mock the API module
vi.mock('../../services/api.ts', () => ({
  authApi: {
    me: vi.fn().mockRejectedValue(new Error('Not authenticated')),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    mfaVerify: vi.fn(),
    completeOnboarding: vi.fn(),
  },
}))

function TestConsumer() {
  const { isAuthenticated, user, isLoading, mfaPending, demoLogin, logout } = useAuth()
  return (
    <div>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="mfa">{String(mfaPending)}</span>
      <span data-testid="user">{user ? `${user.firstName} ${user.lastName}` : 'null'}</span>
      <span data-testid="role">{user?.role || 'none'}</span>
      <button onClick={() => demoLogin('student')} data-testid="demo-student">Demo Student</button>
      <button onClick={() => demoLogin('admin')} data-testid="demo-admin">Demo Admin</button>
      <button onClick={logout} data-testid="logout">Logout</button>
    </div>
  )
}

function renderWithProviders() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts unauthenticated by default', () => {
    renderWithProviders()
    expect(screen.getByTestId('auth').textContent).toBe('false')
    expect(screen.getByTestId('user').textContent).toBe('null')
  })

  it('not loading by default', () => {
    renderWithProviders()
    expect(screen.getByTestId('loading').textContent).toBe('false')
  })

  it('mfa not pending by default', () => {
    renderWithProviders()
    expect(screen.getByTestId('mfa').textContent).toBe('false')
  })

  it('restores user from localStorage', () => {
    const user = {
      id: 'test-1',
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'student' as UserRole,
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
    }
    localStorage.setItem('cliniclink_token', 'test-token')
    localStorage.setItem('cliniclink_user', JSON.stringify(user))

    renderWithProviders()
    expect(screen.getByTestId('auth').textContent).toBe('true')
    expect(screen.getByTestId('user').textContent).toBe('Test User')
  })

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('cliniclink_token', 'test-token')
    localStorage.setItem('cliniclink_user', 'not-json')

    renderWithProviders()
    expect(screen.getByTestId('auth').textContent).toBe('false')
  })

  it('demo login sets user with student role', async () => {
    renderWithProviders()
    await act(async () => {
      fireEvent.click(screen.getByTestId('demo-student'))
    })
    // Wait for async demo login (fallback mode)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    expect(screen.getByTestId('auth').textContent).toBe('true')
    expect(screen.getByTestId('role').textContent).toBe('student')
  })

  it('demo login sets user with admin role', async () => {
    renderWithProviders()
    await act(async () => {
      fireEvent.click(screen.getByTestId('demo-admin'))
    })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    expect(screen.getByTestId('auth').textContent).toBe('true')
    expect(screen.getByTestId('role').textContent).toBe('admin')
  })

  it('logout clears auth state', async () => {
    const user = {
      id: 'test-1',
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'student' as UserRole,
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
    }
    localStorage.setItem('cliniclink_token', 'demo-token-123')
    localStorage.setItem('cliniclink_user', JSON.stringify(user))

    renderWithProviders()
    expect(screen.getByTestId('auth').textContent).toBe('true')

    await act(async () => {
      fireEvent.click(screen.getByTestId('logout'))
    })

    expect(screen.getByTestId('auth').textContent).toBe('false')
    expect(screen.getByTestId('user').textContent).toBe('null')
    expect(localStorage.getItem('cliniclink_token')).toBeNull()
    expect(localStorage.getItem('cliniclink_user')).toBeNull()
  })

  it('throws error when useAuth used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within AuthProvider')
    spy.mockRestore()
  })
})
