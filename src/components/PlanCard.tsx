import { catalogData, formatMoney } from '../lib/catalog'
import type { CatalogProduct } from '../types/catalog'

interface PlanCardProps {
  product: CatalogProduct
  selected: boolean
  onSelect: () => void
}

export function PlanCard({ product, selected, onSelect }: PlanCardProps) {
  const { meta } = catalogData
  const titleId = `${product.id}-plan-title`

  return (
    <article
      className={`plan-card${selected ? ' plan-card--selected' : ''}`}
      data-plan={product.id}
      aria-labelledby={titleId}
    >
      {product.badge ? <span className="plan-card__badge">{product.badge}</span> : null}

      <div className="plan-card__top">
        <img
          className="plan-card__icon"
          src={product.image}
          alt=""
          width={40}
          height={40}
          decoding="async"
        />
        <div className="plan-card__heading">
          <h3 id={titleId} className="plan-card__title">
            {product.name}
          </h3>
          {product.description ? (
            <p className="plan-card__desc">{product.description}</p>
          ) : null}
        </div>
      </div>

      <div className="plan-card__price-row">
        {product.compareAt != null ? (
          <span className="price price--compare">{formatMoney(product.compareAt)}</span>
        ) : null}
        <span className="plan-card__price">
          {formatMoney(product.price)}
          <span className="plan-card__price-suffix">{product.priceSuffix ?? ''}</span>
        </span>
      </div>

      {product.features?.length ? (
        <ul className="plan-card__features">
          {product.features.map((feature) => (
            <li key={feature}>
              <CheckIcon />
              {feature}
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        className={`plan-card__cta${selected ? ' plan-card__cta--selected' : ''}`}
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={
          selected
            ? `${product.name}, ${meta.selectedPlanLabel}`
            : `${meta.selectPlanLabel} ${product.name}`
        }
      >
        {selected ? meta.selectedPlanLabel : meta.selectPlanLabel}
      </button>
    </article>
  )
}

function CheckIcon() {
  return (
    <svg
      className="plan-card__check"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden
      focusable="false"
    >
      <path
        d="M3.2 7.2 5.8 9.7 10.8 4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
