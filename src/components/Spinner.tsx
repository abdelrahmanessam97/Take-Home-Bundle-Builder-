import type { SpinnerProps } from '../types'

export function Spinner({ size = 'md', label = 'Loading', className = '' }: SpinnerProps) {
  return (
    <span
      className={`app-spinner app-spinner--${size}${className ? ` ${className}` : ''}`}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </span>
  )
}
