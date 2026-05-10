import type { ReactNode } from 'react'
import './ui.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'

interface ButtonProps {
  variant?: ButtonVariant
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  children: ReactNode
  onClick?: () => void
}

export function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  children,
  onClick,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      className={`ui-button ui-button-${variant}`}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
    >
      {loading ? 'Analyzing…' : children}
    </button>
  )
}
