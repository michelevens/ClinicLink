import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MainLayout } from '../../../components/layout/MainLayout.tsx'
import { DesignVersionProvider } from '../../../contexts/DesignVersionContext.tsx'
import { BrowserRouter } from 'react-router-dom'

// Mock the auth context
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

// Mock heavy child components to avoid loading lucide-react icons and API hooks
vi.mock('../../../components/layout/Sidebar.tsx', () => ({
  Sidebar: () => <div data-testid="sidebar">ClinicLink</div>,
}))

vi.mock('../../../components/layout/TopBar.tsx', () => ({
  TopBar: () => <div data-testid="topbar">TopBar</div>,
}))

vi.mock('../../../components/layout/MainLayoutV2.tsx', () => ({
  MainLayoutV2: ({ children }: { children: React.ReactNode }) => (
    <div className="bg-gray-50" data-testid="v2-layout">{children}</div>
  ),
}))

vi.mock('../../../components/ai-chat/AiChatWidget.tsx', () => ({
  AiChatWidget: () => <div data-testid="ai-chat" />,
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

  it('renders V2 layout when version is v2', () => {
    renderWithProviders('v2')
    expect(screen.getByTestId('v2-layout')).toBeInTheDocument()
  })

  it('shows sidebar in V1 mode', () => {
    renderWithProviders('v1')
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('shows AI chat widget', () => {
    renderWithProviders('v1')
    expect(screen.getByTestId('ai-chat')).toBeInTheDocument()
  })
})
