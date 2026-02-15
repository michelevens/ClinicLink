import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from '../../../components/ui/Badge.tsx'

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies default variant classes', () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText('Default')
    expect(badge.className).toContain('bg-stone-100')
    expect(badge.className).toContain('text-stone-700')
  })

  it('applies primary variant', () => {
    render(<Badge variant="primary">Primary</Badge>)
    const badge = screen.getByText('Primary')
    expect(badge.className).toContain('bg-primary-100')
    expect(badge.className).toContain('text-primary-700')
  })

  it('applies secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    const badge = screen.getByText('Secondary')
    expect(badge.className).toContain('bg-secondary-100')
    expect(badge.className).toContain('text-secondary-700')
  })

  it('applies success variant', () => {
    render(<Badge variant="success">Success</Badge>)
    const badge = screen.getByText('Success')
    expect(badge.className).toContain('bg-green-100')
    expect(badge.className).toContain('text-green-700')
  })

  it('applies warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>)
    const badge = screen.getByText('Warning')
    expect(badge.className).toContain('bg-amber-100')
    expect(badge.className).toContain('text-amber-700')
  })

  it('applies danger variant', () => {
    render(<Badge variant="danger">Danger</Badge>)
    const badge = screen.getByText('Danger')
    expect(badge.className).toContain('bg-red-100')
    expect(badge.className).toContain('text-red-700')
  })

  it('applies sm size by default', () => {
    render(<Badge>Small</Badge>)
    const badge = screen.getByText('Small')
    expect(badge.className).toContain('px-2')
    expect(badge.className).toContain('text-xs')
  })

  it('applies md size', () => {
    render(<Badge size="md">Medium</Badge>)
    const badge = screen.getByText('Medium')
    expect(badge.className).toContain('px-3')
    expect(badge.className).toContain('text-sm')
  })

  it('has rounded-full class', () => {
    render(<Badge>Rounded</Badge>)
    expect(screen.getByText('Rounded').className).toContain('rounded-full')
  })

  it('has inline-flex display', () => {
    render(<Badge>Flex</Badge>)
    expect(screen.getByText('Flex').className).toContain('inline-flex')
  })
})
