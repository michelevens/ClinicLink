import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DesignVersionProvider, useDesignVersion } from '../../contexts/DesignVersionContext.tsx'
import { DesignToggle } from '../../components/ui/DesignToggle.tsx'

// Mock auth and API hooks for layout tests
vi.mock('../../contexts/AuthContext.tsx', () => ({
  useAuth: () => ({
    user: {
      id: 'test-1',
      firstName: 'Sarah',
      lastName: 'Chen',
      role: 'student',
      email: 'sarah@test.com',
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    },
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}))

vi.mock('../../hooks/useApi.ts', () => ({
  useMessageUnreadCount: () => ({ data: { count: 0 } }),
  useMyPendingSignatures: () => ({ data: { data: [] } }),
  useDashboardStats: () => ({ data: null, isLoading: false }),
  useApplications: () => ({ data: { data: [] } }),
  useHourLogs: () => ({ data: { data: [] } }),
  useEvaluations: () => ({ data: { data: [] } }),
  useCredentials: () => ({ data: { credentials: [] } }),
}))

function VersionDisplay() {
  const { version } = useDesignVersion()
  return (
    <div>
      <span data-testid="current-version">{version}</span>
      <div data-testid="v1-content" style={{ display: version === 'v1' ? 'block' : 'none' }}>
        V1 Layout Content
      </div>
      <div data-testid="v2-content" style={{ display: version === 'v2' ? 'block' : 'none' }}>
        V2 Layout Content
      </div>
      <DesignToggle />
    </div>
  )
}

describe('Version Switching Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-design')
  })

  it('starts in V1 mode by default', () => {
    render(
      <DesignVersionProvider>
        <VersionDisplay />
      </DesignVersionProvider>
    )
    expect(screen.getByTestId('current-version').textContent).toBe('v1')
    expect(screen.getByTestId('v1-content')).toBeVisible()
    expect(screen.getByTestId('v2-content')).not.toBeVisible()
  })

  it('switches to V2 mode on toggle click', () => {
    render(
      <DesignVersionProvider>
        <VersionDisplay />
      </DesignVersionProvider>
    )
    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByTestId('current-version').textContent).toBe('v2')
    expect(screen.getByTestId('v1-content')).not.toBeVisible()
    expect(screen.getByTestId('v2-content')).toBeVisible()
  })

  it('round-trip toggle preserves state', () => {
    render(
      <DesignVersionProvider>
        <VersionDisplay />
      </DesignVersionProvider>
    )
    const btn = screen.getByRole('button')

    // V1 -> V2
    fireEvent.click(btn)
    expect(screen.getByTestId('current-version').textContent).toBe('v2')

    // V2 -> V1
    fireEvent.click(btn)
    expect(screen.getByTestId('current-version').textContent).toBe('v1')
    expect(screen.getByTestId('v1-content')).toBeVisible()
  })

  it('persists version across provider re-renders', () => {
    const { unmount } = render(
      <DesignVersionProvider>
        <VersionDisplay />
      </DesignVersionProvider>
    )

    fireEvent.click(screen.getByRole('button'))
    expect(localStorage.getItem('cliniclink_design_version')).toBe('v2')
    unmount()

    // Re-render — should pick up v2 from localStorage
    render(
      <DesignVersionProvider>
        <VersionDisplay />
      </DesignVersionProvider>
    )
    expect(screen.getByTestId('current-version').textContent).toBe('v2')
  })

  it('sets data-design attribute on document element', () => {
    render(
      <DesignVersionProvider>
        <VersionDisplay />
      </DesignVersionProvider>
    )
    expect(document.documentElement.getAttribute('data-design')).toBe('v1')

    fireEvent.click(screen.getByRole('button'))
    expect(document.documentElement.getAttribute('data-design')).toBe('v2')
  })

  it('toggle button shows correct version label', () => {
    render(
      <DesignVersionProvider>
        <VersionDisplay />
      </DesignVersionProvider>
    )
    expect(screen.getByText('V1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('V2')).toBeInTheDocument()
  })

  it('multiple rapid toggles resolve correctly', () => {
    render(
      <DesignVersionProvider>
        <VersionDisplay />
      </DesignVersionProvider>
    )
    const btn = screen.getByRole('button')

    // Click 5 times — should end on v2 (odd number of clicks)
    for (let i = 0; i < 5; i++) {
      fireEvent.click(btn)
    }
    expect(screen.getByTestId('current-version').textContent).toBe('v2')

    // Click once more — back to v1
    fireEvent.click(btn)
    expect(screen.getByTestId('current-version').textContent).toBe('v1')
  })
})
