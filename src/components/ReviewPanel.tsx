import { catalogData, formatMoney } from "../lib/catalog";
import type { BundleState } from "../hooks/useBundleState";
import type { ReviewLine } from "../lib/catalog";
import { QuantityStepper } from "./QuantityStepper";

interface ReviewPanelProps {
  bundle: BundleState;
}

export function ReviewPanel({ bundle }: ReviewPanelProps) {
  const { catalog, reviewGroups, reviewLines, totals, adjustQuantity, saveForLater, checkout, saveNotice, checkoutNotice } = bundle;

  const { meta } = catalog;

  const isHardwareLine = (line: ReviewLine) => line.product.category === "cameras" || line.product.category === "sensors" || line.product.category === "accessories";

  /** Plan/shipping alone do not count — review stays empty without hardware */
  const hasProducts = reviewLines.some(isHardwareLine);

  const hardwareGroups = hasProducts ? reviewGroups.filter((group) => group.category !== "plan" && group.lines.length > 0) : [];

  const planLines = hasProducts ? reviewLines.filter((line) => line.product.category === "plan" && line.product.icon !== "truck") : [];

  const shippingLines = hasProducts ? reviewLines.filter((line) => line.product.icon === "truck") : [];

  const displayTotal = hasProducts ? totals.total : 0;
  const displayCompareAt = hasProducts ? totals.compareAt : 0;
  const displaySavings = hasProducts ? totals.savings : 0;

  return (
    <aside className={`review${hasProducts ? "" : " review--empty"}`}>
      <div className="review__layout review__layout--half">
        <section className="review__section review__section--items review__col" aria-label={meta.reviewItemsAriaLabel}>
          <header className="review__header">
            <h2 className="review__title">{meta.reviewTitle}</h2>
            <p className="review__subtitle">{meta.reviewSubtitle}</p>
          </header>

          <div className="review__items">
            {hasProducts ? (
              <>
                {hardwareGroups.map((group) => (
                  <section key={group.category} className="review-group">
                    <h3 className="review-group__label">{group.label}</h3>
                    <ul className="review-group__list">
                      {group.lines.map((line) => (
                        <ReviewLineRow
                          key={line.key}
                          line={line}
                          onDecrease={() => adjustQuantity(line.product.id, line.variantId, -1)}
                          onIncrease={() => adjustQuantity(line.product.id, line.variantId, 1)}
                        />
                      ))}
                    </ul>
                  </section>
                ))}

                {planLines.length > 0 ? (
                  <section className="review-group">
                    <h3 className="review-group__label">{meta.reviewPlanLabel}</h3>
                    <ul className="review-group__list">
                      {planLines.map((line) => (
                        <ReviewLineRow
                          key={line.key}
                          line={line}
                          onDecrease={() => adjustQuantity(line.product.id, line.variantId, -1)}
                          onIncrease={() => adjustQuantity(line.product.id, line.variantId, 1)}
                        />
                      ))}
                    </ul>
                  </section>
                ) : null}

                {shippingLines.length > 0 ? (
                  <section className="review-group review-group--shipping">
                    <ul className="review-group__list">
                      {shippingLines.map((line) => (
                        <ReviewLineRow
                          key={line.key}
                          line={line}
                          onDecrease={() => adjustQuantity(line.product.id, line.variantId, -1)}
                          onIncrease={() => adjustQuantity(line.product.id, line.variantId, 1)}
                        />
                      ))}
                    </ul>
                  </section>
                ) : null}
              </>
            ) : (
              <div className="review-empty" role="status">
                <p className="review-empty__title">{meta.reviewEmptyTitle}</p>
                <p className="review-empty__body">{meta.reviewEmptyBody}</p>
              </div>
            )}
          </div>
        </section>

        <section className="review__section review__section--summary review__col" aria-label={meta.reviewSummaryAriaLabel}>
          <div className="review__summary-top">
            <div className="review__guarantee">
              <img className="guarantee-seal" src="/images/products/guarantee-badge.png" alt={meta.guaranteeTitle} width={104} height={104} decoding="async" />
              <div className="review__guarantee-copy">
                <p className="review__guarantee-title">{meta.returnsTitle}</p>
                <p className="review__guarantee-body">{meta.guaranteeBody}</p>
              </div>
            </div>

            <div className="review__pricing-block">
              <div className="review__pricing-row">
                {hasProducts ? (
                  <span className="financing-pill">{meta.financingLabel}</span>
                ) : (
                  <span className="financing-pill financing-pill--muted">{meta.financingEmptyLabel}</span>
                )}
                <div className="review__totals">
                  {hasProducts && displayCompareAt > displayTotal ? <span className="price price--compare price--lg">{formatMoney(displayCompareAt)}</span> : null}
                  <span className="price price--total">{formatMoney(displayTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {hasProducts && displaySavings > 0 ? (
            <p className="savings-callout">
              {meta.savingsPrefix} {formatMoney(displaySavings)} {meta.savingsSuffix}
            </p>
          ) : null}

          <div className="review__actions">
            <button type="button" className="btn btn--primary" onClick={checkout} disabled={!hasProducts}>
              {meta.checkoutLabel}
            </button>
            <button type="button" className="review__save" onClick={saveForLater} disabled={!hasProducts}>
              {meta.saveForLaterLabel}
            </button>
          </div>

          {saveNotice ? <p className="review__toast review__toast--save">{saveNotice}</p> : null}
          {checkoutNotice ? (
            <p className="review__toast review__toast--checkout" role="status">
              {meta.checkoutNotice}
            </p>
          ) : null}
        </section>
      </div>
    </aside>
  );
}

function ReviewLineRow({ line, onDecrease, onIncrease }: { line: ReviewLine; onDecrease: () => void; onIncrease: () => void }) {
  const showCompare = line.lineCompareAt != null && line.lineCompareAt > line.lineTotal;
  const isFree = line.product.isFree || line.lineTotal === 0;
  const showStepper = line.product.adjustable !== false;
  const isShipping = line.product.icon === "truck";
  const { meta } = catalogData;

  return (
    <li className={`review-line${showStepper ? "" : " review-line--no-stepper"}${isShipping ? " review-line--shipping" : ""}`}>
      <div className={`review-line__thumb${line.product.icon === "shield" || line.product.icon === "truck" ? " review-line__thumb--plain" : ""}`}>
        <img src={line.image} alt="" className="review-line__thumb-img" loading="lazy" decoding="async" />
      </div>

      <div className="review-line__info">
        <p className="review-line__name">
          {line.displayName}
          {line.product.nameSuffix ? <span className="review-line__suffix"> {line.product.nameSuffix}</span> : null}
        </p>
      </div>

      {showStepper ? (
        <QuantityStepper size="sm" value={line.quantity} onDecrease={onDecrease} onIncrease={onIncrease} aria-label={`${line.product.name} quantity`} />
      ) : (
        <span className="review-line__spacer" aria-hidden />
      )}

      <div className="review-line__prices">
        {showCompare ? (
          <span className="price price--compare">
            {formatMoney(line.lineCompareAt!)}
            {line.product.priceSuffix ?? ""}
          </span>
        ) : null}
        <span className={`price price--active${isFree ? " price--free" : ""}`}>
          {isFree ? meta.freeLabel : `${formatMoney(line.lineTotal)}${line.product.priceSuffix ?? ""}`}
        </span>
      </div>
    </li>
  );
}
