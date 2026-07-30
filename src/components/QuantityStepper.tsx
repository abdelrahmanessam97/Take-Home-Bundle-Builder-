interface QuantityStepperProps {
  value: number
  onDecrease: () => void
  onIncrease: () => void
  size?: 'sm' | 'md'
  min?: number
  max?: number
  disabledDecrease?: boolean
  disabledIncrease?: boolean
  'aria-label'?: string
}

const DEFAULT_MAX = 99

export function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  size = 'md',
  min = 0,
  max = DEFAULT_MAX,
  disabledDecrease,
  disabledIncrease,
  'aria-label': ariaLabel = 'Quantity',
}: QuantityStepperProps) {
  const decreaseDisabled = disabledDecrease ?? value <= min
  const increaseDisabled = disabledIncrease ?? value >= max

  return (
    <div
      className={`qty-stepper qty-stepper--${size}`}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className="qty-stepper__btn qty-stepper__btn--minus"
        onClick={onDecrease}
        disabled={decreaseDisabled}
        aria-label={`Decrease ${ariaLabel}`}
      >
        <MinusIcon />
      </button>
      <span className="qty-stepper__value" aria-live="polite" aria-atomic="true">
        {value}
      </span>
      <button
        type="button"
        className="qty-stepper__btn qty-stepper__btn--plus"
        onClick={onIncrease}
        disabled={increaseDisabled}
        aria-label={`Increase ${ariaLabel}`}
      >
        <PlusIcon />
      </button>
    </div>
  )
}

function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden focusable="false">
      <path d="M2.5 6h7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden focusable="false">
      <path
        d="M6 2.5v7M2.5 6h7"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  )
}
