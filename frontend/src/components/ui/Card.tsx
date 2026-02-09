import type { ReactNode, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
  glass?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, hover = false, glass = false, padding = 'md', className = '', ...props }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }

  return (
    <div
      className={`rounded-2xl border border-stone-200 shadow-sm ${glass ? 'glass' : 'bg-white'} ${hover ? 'hover-lift cursor-pointer' : ''} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
