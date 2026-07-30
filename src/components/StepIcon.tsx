const STEP_ICON_SRC = {
  camera: '/images/icons/cameras.png',
  shield: '/images/icons/plan.png',
  sensor: '/images/icons/sensors.png',
  grid: '/images/icons/protection.png',
} as const

export type StepIconName = keyof typeof STEP_ICON_SRC

interface StepIconProps {
  name: StepIconName
  className?: string
}

export function StepIcon({ name, className }: StepIconProps) {
  const src = STEP_ICON_SRC[name]
  if (!src) return null

  return (
    <span
      className={className}
      data-icon={name}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
      }}
      aria-hidden
    />
  )
}

/** Filled caret — matches Figma accordion arrow */
export function Chevron({ up }: { up?: boolean }) {
  return (
    <svg
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="currentColor"
      aria-hidden
      focusable="false"
      className={up ? 'chevron chevron--up' : 'chevron'}
    >
      <path d="M6 7.25 0.75 1.5h10.5L6 7.25Z" />
    </svg>
  )
}
