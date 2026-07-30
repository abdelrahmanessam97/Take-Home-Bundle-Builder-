import { catalogData, formatMoney } from '../lib/catalog'
import type { CatalogProduct } from '../types/catalog'

interface PlanCardProps {
  product: CatalogProduct
  selected: boolean
  onSelect: () => void
}

export function PlanCard({ product, selected, onSelect }: PlanCardProps) {
  const { meta } = catalogData

  return (
    <article
      className={`plan-card${selected ? ' plan-card--selected' : ''}`}
      data-plan={product.id}
    >
      {product.badge ? <span className="plan-card__badge">{product.badge}</span> : null}

      <div className="plan-card__top">
        <img className="plan-card__icon" src={product.image} alt="" />
        <div className="plan-card__heading">
          <h3 className="plan-card__title">{product.name}</h3>
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
              <span className="plan-card__check" aria-hidden>
                ✓
              </span>
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
      >
        {selected ? meta.selectedPlanLabel : meta.selectPlanLabel}
      </button>
    </article>
  )
}
