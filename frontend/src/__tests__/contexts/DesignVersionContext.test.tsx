import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { DesignVersionProvider, useDesignVersion } from '../../contexts/DesignVersionContext.tsx'

function TestConsumer() {
  const { version, setVersion, toggle } = useDesignVersion()
  return (
    <div>
      <span data-testid="version">{version}</span>
      <button onClick={toggle} data-testid="toggle">Toggle</button>
      <button onClick={() => setVersion('v1')} data-testid="set-v1">Set V1</button>
      <button onClick={() => setVersion('v2')} data-testid="set-v2">Set V2</button>
    </div>
  )
}

describe('DesignVersionContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-design')
  })

  it('provides v1 as default version', () => {
    render(
      <DesignVersionProvider>
        <TestConsumer />
      </DesignVersionProvider>
    )
    expect(screen.getByTestId('version').textContent).toBe('v1')
  })

  it('reads initial version from localStorage', () => {
    localStorage.setItem('cliniclink_design_version', 'v2')
    render(
      <DesignVersionProvider>
        <TestConsumer />
      </DesignVersionProvider>
    )
    expect(screen.getByTestId('version').textContent).toBe('v2')
  })

  it('falls back to v1 for invalid localStorage value', () => {
    localStorage.setItem('cliniclink_design_version', 'invalid')
    render(
      <DesignVersionProvider>
        <TestConsumer />
      </DesignVersionProvider>
    )
    expect(screen.getByTestId('version').textContent).toBe('v1')
  })

  it('toggle switches from v1 to v2', () => {
    render(
      <DesignVersionProvider>
        <TestConsumer />
      </DesignVersionProvider>
    )
    expect(screen.getByTestId('version').textContent).toBe('v1')
    fireEvent.click(screen.getByTestId('toggle'))
    expect(screen.getByTestId('version').textContent).toBe('v2')
  })

  it('toggle switches from v2 to v1', () => {
    localStorage.setItem('cliniclink_design_version', 'v2')
    render(
      <DesignVersionProvider>
        <TestConsumer />
      </DesignVersionProvider>
    )
    fireEvent.click(screen.getByTestId('toggle'))
    expect(screen.getByTestId('version').textContent).toBe('v1')
  })

  it('setVersion explicitly sets v2', () => {
    render(
      <DesignVersionProvider>
        <TestConsumer />
      </DesignVersionProvider>
    )
    fireEvent.click(screen.getByTestId('set-v2'))
    expect(screen.getByTestId('version').textContent).toBe('v2')
  })

  it('setVersion explicitly sets v1', () => {
    localStorage.setItem('cliniclink_design_version', 'v2')
    render(
      <DesignVersionProvider>
        <TestConsumer />
      </DesignVersionProvider>
    )
    fireEvent.click(screen.getByTestId('set-v1'))
    expect(screen.getByTestId('version').textContent).toBe('v1')
  })

  it('persists version to localStorage on toggle', () => {
    render(
      <DesignVersionProvider>
        <TestConsumer />
      </DesignVersionProvider>
    )
    fireEvent.click(screen.getByTestId('toggle'))
    expect(localStorage.getItem('cliniclink_design_version')).toBe('v2')
  })

  it('sets data-design attribute on html element', () => {
    render(
      <DesignVersionProvider>
        <TestConsumer />
      </DesignVersionProvider>
    )
    expect(document.documentElement.getAttribute('data-design')).toBe('v1')
    fireEvent.click(screen.getByTestId('toggle'))
    expect(document.documentElement.getAttribute('data-design')).toBe('v2')
  })

  it('throws error when useDesignVersion used outside provider', () => {
    // Suppress console.error for expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow('useDesignVersion must be used within DesignVersionProvider')
    spy.mockRestore()
  })
})

// Need to import vi for the throw test
import { vi } from 'vitest'
