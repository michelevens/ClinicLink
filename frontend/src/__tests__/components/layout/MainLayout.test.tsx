import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MainLayout } from '../../../components/layout/MainLayout.tsx'
import { DesignVersionProvider } from '../../../contexts/DesignVersionContext.tsx'
import { BrowserRouter } from 'react-router-dom'

// Mock the auth context to avoid API calls
vi.mock('../../../contexts/AuthContext.tsx', () => ({
  useAuth: () => ({
    user: {
      id: 'test-1',
      firstName: 'Test',
      lastName: 'User',
      role: 'student',
      email: 'test@test.com',
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    },
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}))

// Mock the API hooks
vi.mock('../../../hooks/useApi.ts', () => ({
  useMessageUnreadCount: () => ({ data: { count: 0 } }),
  useMyPendingSignatures: () => ({ data: { data: [] } }),
  useUnreadCount: () => ({ data: { count: 0 } }),
  useNotifications: () => ({ data: { data: [] } }),
  useMarkAsRead: () => ({ mutateAsync: vi.fn() }),
  useMarkAllAsRead: () => ({ mutateAsync: vi.fn() }),
  useAiConversations: () => ({ data: { conversations: [] } }),
  useAiMessages: () => ({ data: { messages: [] } }),
  useAiSendMessage: () => ({ mutateAsync: vi.fn() }),
  useAiDeleteConversation: () => ({ mutateAsync: vi.fn() }),
  useAiSuggestions: () => ({ data: { suggestions: [] } }),
}))

function renderWithProviders(initialVersion: 'v1' | 'v2' = 'v1') {
  if (initialVersion === 'v2') {
    localStorage.setItem('cliniclink_design_version', 'v2')
  } else {
    localStorage.removeItem('cliniclink_design_version')
  }

  return render(
    <BrowserRouter>
      <DesignVersionProvider>
        <MainLayout>
          <div data-testid="child-content">Hello World</div>
        </MainLayout>
      </DesignVersionProvider>
    </BrowserRouter>
  )
}

describe('MainLayout', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-design')
  })

  it('renders child content in V1 mode', () => {
    renderWithProviders('v1')
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('renders child content in V2 mode', () => {
    renderWithProviders('v2')
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('renders V1 layout with stone-50 background by default', () => {
    const { container } = renderWithProviders('v1')
    const layoutDiv = container.querySelector('.bg-stone-50')
    expect(layoutDiv).toBeInTheDocument()
  })

  it('renders V2 layout with gray-50 background', () => {
    const { container } = renderWithProviders('v2')
    const layoutDiv = container.querySelector('.bg-gray-50')
    expect(layoutDiv).toBeInTheDocument()
  })

  it('shows the design toggle button', () => {
    renderWithProviders('v1')
    // The toggle shows V1 text
    expect(screen.getByText('V1')).toBeInTheDocument()
  })

  it('shows ClinicLink branding', () => {
    renderWithProviders('v1')
    const logos = screen.getAllByText('ClinicLink')
    expect(logos.length).toBeGreaterThan(0)
  })
})
