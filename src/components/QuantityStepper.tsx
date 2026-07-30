import type { QuantityStepperProps } from '../types'

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
  addOnlyWhenZero = false,
  'aria-label': ariaLabel = 'Quantity',
}: QuantityStepperProps) {
  const decreaseDisabled = disabledDecrease ?? value <= min;
  const increaseDisabled = disabledIncrease ?? value >= max;
  const isAddOnly = addOnlyWhenZero && value <= min;

  if (isAddOnly) {
    return (
      <div className={`qty-stepper qty-stepper--${size} qty-stepper--add-only`} role="group" aria-label={ariaLabel}>
        <button type="button" className="qty-stepper__btn qty-stepper__btn--add" onClick={onIncrease} disabled={increaseDisabled} aria-label={`Add ${ariaLabel}`}>
          <CartIcon />
        </button>
      </div>
    );
  }

  return (
    <div className={`qty-stepper qty-stepper--${size}`} role="group" aria-label={ariaLabel}>
      <button type="button" className="qty-stepper__btn qty-stepper__btn--minus" onClick={onDecrease} disabled={decreaseDisabled} aria-label={`Decrease ${ariaLabel}`}>
        <MinusIcon />
      </button>
      <span className="qty-stepper__value" aria-live="polite" aria-atomic="true">
        {value}
      </span>
      <button type="button" className="qty-stepper__btn qty-stepper__btn--plus" onClick={onIncrease} disabled={increaseDisabled} aria-label={`Increase ${ariaLabel}`}>
        <PlusIcon />
      </button>
    </div>
  );
}

function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden focusable="false">
      <path d="M2.5 6h7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden focusable="false">
      <path d="M6 2.5v7M2.5 6h7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="qty-stepper__cart-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <path
        d="M3.5 5h1.6l1.2 9.2a1.6 1.6 0 0 0 1.6 1.4h8.9a1.6 1.6 0 0 0 1.55-1.2l1.35-5.7H7.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.2" cy="19.2" r="1.35" fill="currentColor" />
      <circle cx="16.3" cy="19.2" r="1.35" fill="currentColor" />
      <path d="M14.2 8.2h4.2M16.3 6.1v4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
