import { useState } from "react";
import { catalogData, formatMoney } from "../lib/catalog";
import type { CatalogProduct } from "../types/catalog";
import { QuantityStepper } from "./QuantityStepper";

interface ProductCardProps {
  product: CatalogProduct;
  activeVariantId: string | null;
  selected: boolean;
  quantity: number;
  onSelectVariant: (variantId: string) => void;
  onDecrease: () => void;
  onIncrease: () => void;
}

/** Soft threshold — longer blurbs collapse behind Read more on narrow cards */
const DESC_COLLAPSE_AT = 44;
const DESC_PREVIEW_LEN = 58;

function previewDescription(text: string): string {
  if (text.length <= DESC_PREVIEW_LEN) return text;
  const sliced = text.slice(0, DESC_PREVIEW_LEN).replace(/\s+\S*$/, "").trimEnd();
  return `${sliced || text.slice(0, DESC_PREVIEW_LEN)}…`;
}

export function ProductCard({ product, activeVariantId, selected, quantity, onSelectVariant, onDecrease, onIncrease }: ProductCardProps) {
  const { meta } = catalogData;
  const hasVariants = Boolean(product.variants?.length);
  const activeVariant = product.variants?.find((v) => v.id === activeVariantId) ?? product.variants?.[0] ?? null;
  // Never use chip swatches as hero media — they are often 48px and upscale/warp
  const mediaSrc = activeVariant?.image || product.image;
  const variantGroupLabel = `${product.name} color`;

  const description = product.description?.trim() ?? "";
  const canCollapse = description.length > DESC_COLLAPSE_AT;
  const [expanded, setExpanded] = useState(false);
  const visibleDescription = canCollapse && !expanded ? previewDescription(description) : description;

  return (
    <article
      className={`product-card${selected ? " product-card--selected" : ""}${expanded ? " product-card--expanded" : ""}`}
    >
      {product.badge ? <span className="product-card__badge">{product.badge}</span> : null}

      <div className="product-card__media">
        <img
          key={mediaSrc}
          src={mediaSrc}
          alt={product.name}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="product-card__body">
        <h3 className="product-card__title">{product.name}</h3>

        {description ? (
          <p className={`product-card__desc${expanded ? " product-card__desc--expanded" : ""}`}>
            {visibleDescription}
            {canCollapse || product.learnMoreUrl ? (
              <>
                {" "}
                <button
                  type="button"
                  className="product-card__learn"
                  onClick={(e) => {
                    e.preventDefault();
                    if (canCollapse) setExpanded((v) => !v);
                  }}
                  aria-expanded={canCollapse ? expanded : undefined}
                >
                  {canCollapse ? (expanded ? meta.showLessLabel : meta.readMoreLabel) : meta.learnMoreLabel}
                </button>
              </>
            ) : null}
          </p>
        ) : null}

        {hasVariants ? (
          <div className="variant-row" role="group" aria-label={variantGroupLabel}>
            {product.variants!.map((variant) => {
              const isActive = variant.id === (activeVariant?.id ?? activeVariantId);
              return (
                <button
                  key={variant.id}
                  type="button"
                  aria-pressed={isActive}
                  className={`variant-chip${isActive ? " variant-chip--active" : ""}`}
                  onClick={() => onSelectVariant(variant.id)}
                >
                  {variant.swatchImage ? (
                    <img
                      className="variant-chip__thumb"
                      src={variant.swatchImage}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
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
        <QuantityStepper value={quantity} onDecrease={onDecrease} onIncrease={onIncrease} aria-label={`${product.name} quantity`} />
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
