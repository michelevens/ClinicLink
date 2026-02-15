import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from '../../../components/ui/Card.tsx'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies default classes', () => {
    render(<Card data-testid="card">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('rounded-2xl')
    expect(card.className).toContain('border')
    expect(card.className).toContain('border-stone-200')
    expect(card.className).toContain('bg-white')
  })

  it('applies medium padding by default', () => {
    render(<Card data-testid="card">Content</Card>)
    expect(screen.getByTestId('card').className).toContain('p-6')
  })

  it('applies no padding when specified', () => {
    render(<Card padding="none" data-testid="card">Content</Card>)
    const classes = screen.getByTestId('card').className
    expect(classes).not.toContain('p-4')
    expect(classes).not.toContain('p-6')
    expect(classes).not.toContain('p-8')
  })

  it('applies small padding', () => {
    render(<Card padding="sm" data-testid="card">Content</Card>)
    expect(screen.getByTestId('card').className).toContain('p-4')
  })

  it('applies large padding', () => {
    render(<Card padding="lg" data-testid="card">Content</Card>)
    expect(screen.getByTestId('card').className).toContain('p-8')
  })

  it('applies glass variant', () => {
    render(<Card glass data-testid="card">Content</Card>)
    expect(screen.getByTestId('card').className).toContain('glass')
  })

  it('does not apply glass class by default', () => {
    render(<Card data-testid="card">Content</Card>)
    expect(screen.getByTestId('card').className).not.toContain('glass')
  })

  it('applies hover-lift when hover prop is true', () => {
    render(<Card hover data-testid="card">Content</Card>)
    const classes = screen.getByTestId('card').className
    expect(classes).toContain('hover-lift')
    expect(classes).toContain('cursor-pointer')
  })

  it('does not apply hover-lift by default', () => {
    render(<Card data-testid="card">Content</Card>)
    expect(screen.getByTestId('card').className).not.toContain('hover-lift')
  })

  it('applies custom className', () => {
    render(<Card className="my-custom" data-testid="card">Content</Card>)
    expect(screen.getByTestId('card').className).toContain('my-custom')
  })
})
