import type { ReactNode } from 'react'
import './ui.css'

type BadgeVariant =
  | 'grade-a'
  | 'grade-b'
  | 'grade-c'
  | 'grade-df'
  | 'action-downgrade'
  | 'action-consolidate'
  | 'action-optimal'
  | 'action-review'
  | 'complexity-low'
  | 'complexity-medium'
  | 'complexity-high'

interface BadgeProps {
  variant: BadgeVariant
  children: ReactNode
}

export function Badge({ variant, children }: BadgeProps) {
  return <span className={`ui-badge ui-badge-${variant}`}>{children}</span>
}
