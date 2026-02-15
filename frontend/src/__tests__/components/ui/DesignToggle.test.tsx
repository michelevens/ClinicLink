import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DesignToggle } from '../../../components/ui/DesignToggle.tsx'
import { DesignVersionProvider } from '../../../contexts/DesignVersionContext.tsx'

function renderWithProvider() {
  return render(
    <DesignVersionProvider>
      <DesignToggle />
    </DesignVersionProvider>
  )
}

describe('DesignToggle', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the toggle button', () => {
    renderWithProvider()
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('shows V1 label by default', () => {
    renderWithProvider()
    expect(screen.getByText('V1')).toBeInTheDocument()
  })

  it('shows Classic sublabel in V1 mode', () => {
    renderWithProvider()
    expect(screen.getByText('Classic')).toBeInTheDocument()
  })

  it('toggles to V2 on click', () => {
    renderWithProvider()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('V2')).toBeInTheDocument()
    expect(screen.getByText('Modern')).toBeInTheDocument()
  })

  it('toggles back to V1 on second click', () => {
    renderWithProvider()
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    expect(screen.getByText('V2')).toBeInTheDocument()
    fireEvent.click(btn)
    expect(screen.getByText('V1')).toBeInTheDocument()
  })

  it('persists version to localStorage', () => {
    renderWithProvider()
    fireEvent.click(screen.getByRole('button'))
    expect(localStorage.getItem('cliniclink_design_version')).toBe('v2')
  })

  it('reads initial version from localStorage', () => {
    localStorage.setItem('cliniclink_design_version', 'v2')
    renderWithProvider()
    expect(screen.getByText('V2')).toBeInTheDocument()
  })

  it('has correct title attribute for V1', () => {
    renderWithProvider()
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Switch to V2 (Modern)')
  })

  it('has correct title attribute for V2', () => {
    renderWithProvider()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Switch to V1 (Classic)')
  })
})
