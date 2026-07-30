import { useId, useState } from "react";
import { requireCatalog, formatMoney } from "../lib/catalog";
import type { ProductCardProps } from "../types";
import { QuantityStepper } from "./QuantityStepper";

/** Soft threshold — longer blurbs collapse behind Show more */
const DESC_PREVIEW_LEN = 58;

function previewDescription(text: string): string {
  if (text.length <= DESC_PREVIEW_LEN) return text;
  const sliced = text
    .slice(0, DESC_PREVIEW_LEN)
    .replace(/\s+\S*$/, "")
    .trimEnd();
  return `${sliced || text.slice(0, DESC_PREVIEW_LEN)}…`;
}

function hasRealLearnMoreUrl(url?: string): url is string {
  return Boolean(url && url !== "#");
}

export function ProductCard({ product, activeVariantId, selected, quantity, onSelectVariant, onDecrease, onIncrease }: ProductCardProps) {
  const { meta } = requireCatalog();
  const descId = useId();
  const hasVariants = Boolean(product.variants?.length);
  const activeVariant = product.variants?.find((v) => v.id === activeVariantId) ?? product.variants?.[0] ?? null;
  const mediaSrc = activeVariant?.image || product.image;
  const mediaAlt = activeVariant ? `${product.name}, ${activeVariant.label}` : product.name;
  const variantGroupLabel = `${product.name} color`;

  const description = product.description?.trim() ?? "";
  /** Only offer toggle when collapsed text actually differs from full text */
  const canCollapse = description.length > DESC_PREVIEW_LEN;
  const [expanded, setExpanded] = useState(false);
  const visibleDescription = canCollapse && !expanded ? previewDescription(description) : description;

  return (
    <article
      className={`product-card${selected ? " product-card--selected" : ""}${expanded ? " product-card--expanded" : ""}`}
      data-product={product.id}
      aria-labelledby={`${product.id}-title`}
    >
      {product.badge ? <span className="product-card__badge">{product.badge}</span> : null}

      <div className="product-card__media">
        <img key={mediaSrc} src={mediaSrc} alt={mediaAlt} loading="lazy" decoding="async" />
      </div>

      <div className="product-card__body">
        <h3 id={`${product.id}-title`} className="product-card__title">
          {product.name}
        </h3>

        {description ? (
          <p id={descId} className={`product-card__desc${expanded ? " product-card__desc--expanded" : ""}`}>
            {visibleDescription}
            {canCollapse ? (
              <>
                {" "}
                <button
                  type="button"
                  className="product-card__learn"
                  onClick={(event) => {
                    event.stopPropagation();
                    setExpanded((v) => !v);
                  }}
                  aria-expanded={expanded}
                  aria-controls={descId}
                >
                  {expanded ? meta.showLessLabel : meta.showMoreLabel}
                </button>
              </>
            ) : hasRealLearnMoreUrl(product.learnMoreUrl) ? (
              <>
                {" "}
                <a className="product-card__learn" href={product.learnMoreUrl} target="_blank" rel="noopener noreferrer">
                  {meta.learnMoreLabel}
                </a>
              </>
            ) : null}
          </p>
        ) : null}

        {hasVariants ? (
          <div className="variant-row" role="radiogroup" aria-label={variantGroupLabel}>
            {product.variants!.map((variant) => {
              const isActive = variant.id === (activeVariant?.id ?? activeVariantId);
              return (
                <button
                  key={variant.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  aria-label={variant.label}
                  className={`variant-chip${isActive ? " variant-chip--active" : ""}`}
                  onClick={() => onSelectVariant(variant.id)}
                >
                  {variant.swatchImage ? (
                    <img className="variant-chip__thumb" src={variant.swatchImage} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="variant-chip__swatch" style={{ background: variant.swatch }} aria-hidden />
                  )}
                  <span className="variant-chip__label">{variant.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="product-card__footer">
        <QuantityStepper value={quantity} onDecrease={onDecrease} onIncrease={onIncrease} addOnlyWhenZero aria-label={`${product.name} quantity`} />
        <div className="product-card__prices">
          {product.compareAt != null ? <span className="price price--compare">{formatMoney(product.compareAt)}</span> : null}
          <span className="price price--active">
            {product.isFree ? meta.freeLabel : formatMoney(product.price)}
            {product.priceSuffix ?? ""}
          </span>
        </div>
      </div>
    </article>
  );
}
