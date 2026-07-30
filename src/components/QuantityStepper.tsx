interface QuantityStepperProps {
  value: number
  onDecrease: () => void
  onIncrease: () => void
  size?: 'sm' | 'md'
  disabledDecrease?: boolean
  'aria-label'?: string
}

export function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  size = 'md',
  disabledDecrease,
  'aria-label': ariaLabel = 'Quantity',
}: QuantityStepperProps) {
  const decreaseDisabled = disabledDecrease ?? value <= 0

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
        aria-label={`Increase ${ariaLabel}`}
      >
        <PlusIcon />
      </button>
    </div>
  )
}

function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <path d="M2.5 6h7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <path
        d="M6 2.5v7M2.5 6h7"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  )
}
