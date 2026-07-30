import { formatMoney } from '../lib/catalog'
import type {
  ReviewGroupSectionProps,
  ReviewLine,
  ReviewLineRowProps,
  ReviewPanelProps,
} from '../types'
import { QuantityStepper } from './QuantityStepper'
import { Spinner } from './Spinner'

function isHardwareLine(line: ReviewLine) {
  return (
    line.product.category === 'cameras' ||
    line.product.category === 'sensors' ||
    line.product.category === 'accessories'
  )
}

function isShippingLine(line: ReviewLine) {
  return line.product.icon === 'truck'
}

function isPlanLine(line: ReviewLine) {
  return line.product.category === 'plan' && !isShippingLine(line)
}

export function ReviewPanel({ bundle }: ReviewPanelProps) {
  const {
    catalog,
    reviewGroups,
    reviewLines,
    totals,
    validationErrors,
    adjustQuantity,
    saveForLater,
    checkout,
    saveNotice,
    checkoutNotice,
    saving,
    checkingOut,
  } = bundle

  const { meta } = catalog
  const busy = saving || checkingOut

  /** Plan/shipping alone do not count — review stays empty without hardware */
  const hasProducts = reviewLines.some(isHardwareLine)

  const hardwareGroups = hasProducts
    ? reviewGroups.filter((group) => group.category !== 'plan' && group.lines.length > 0)
    : []

  const planLines = hasProducts ? reviewLines.filter(isPlanLine) : []
  const shippingLines = hasProducts ? reviewLines.filter(isShippingLine) : []

  const displayTotal = hasProducts ? totals.total : 0
  const displayCompareAt = hasProducts ? totals.compareAt : 0
  const displaySavings = hasProducts ? totals.savings : 0

  const onLineAdjust = (line: ReviewLine, delta: number) => {
    if (busy) return
    adjustQuantity(line.product.id, line.variantId, delta)
  }

  return (
    <aside
      className={`review${hasProducts ? '' : ' review--empty'}${busy ? ' review--busy' : ''}`}
    >
      <div className="review__layout review__layout--half">
        <section
          className="review__section review__section--items review__col"
          aria-label={meta.reviewItemsAriaLabel}
        >
          <header className="review__header">
            <h2 className="review__title">{meta.reviewTitle}</h2>
            <p className="review__subtitle">{meta.reviewSubtitle}</p>
          </header>

          <div className="review__items">
            {hasProducts ? (
              <>
                {hardwareGroups.map((group) => (
                  <ReviewGroupSection
                    key={group.category}
                    label={group.label}
                    lines={group.lines}
                    meta={meta}
                    onLineAdjust={onLineAdjust}
                  />
                ))}

                {planLines.length > 0 ? (
                  <ReviewGroupSection
                    label={meta.reviewPlanLabel}
                    lines={planLines}
                    meta={meta}
                    onLineAdjust={onLineAdjust}
                  />
                ) : null}

                {shippingLines.length > 0 ? (
                  <section className="review-group review-group--shipping">
                    <ul className="review-group__list">
                      {shippingLines.map((line) => (
                        <ReviewLineRow
                          key={line.key}
                          line={line}
                          meta={meta}
                          onDecrease={() => onLineAdjust(line, -1)}
                          onIncrease={() => onLineAdjust(line, 1)}
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

        <section
          className="review__section review__section--summary review__col"
          aria-label={meta.reviewSummaryAriaLabel}
        >
          <div className="review__summary-top">
            <div className="review__guarantee">
              <img
                className="guarantee-seal"
                src="/images/products/guarantee-badge.png"
                alt={meta.guaranteeTitle}
                width={104}
                height={104}
                decoding="async"
              />
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
                  <span className="financing-pill financing-pill--muted">
                    {meta.financingEmptyLabel}
                  </span>
                )}
                <div className="review__totals" aria-live="polite">
                  {hasProducts && displayCompareAt > displayTotal ? (
                    <span className="price price--compare price--lg">
                      {formatMoney(displayCompareAt)}
                    </span>
                  ) : null}
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

          {validationErrors.length > 0 && hasProducts ? (
            <ul className="review__validation" role="alert">
              {validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}

          <div className="review__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => void checkout()}
              disabled={!hasProducts || busy}
              aria-busy={checkingOut}
            >
              {checkingOut ? (
                <>
                  <Spinner size="sm" label={meta.checkingOutLabel} />
                  <span>{meta.checkingOutLabel}</span>
                </>
              ) : (
                meta.checkoutLabel
              )}
            </button>
            <button
              type="button"
              className="review__save"
              onClick={() => void saveForLater()}
              disabled={!hasProducts || busy}
              aria-busy={saving}
            >
              {saving ? (
                <span className="review__save-loading">
                  <Spinner size="sm" label={meta.savingLabel} />
                  <span>{meta.savingLabel}</span>
                </span>
              ) : (
                meta.saveForLaterLabel
              )}
            </button>
          </div>

          <div className="review__notices" aria-live="polite" aria-atomic="true">
            {saveNotice ? (
              <p
                className={`review__toast review__toast--${saveNotice.tone}`}
                role={saveNotice.tone === 'error' ? 'alert' : 'status'}
              >
                {saveNotice.message}
              </p>
            ) : null}
            {checkoutNotice ? (
              <p
                className={`review__toast review__toast--${checkoutNotice.tone}`}
                role={checkoutNotice.tone === 'error' ? 'alert' : 'status'}
              >
                {checkoutNotice.message}
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </aside>
  )
}

function ReviewGroupSection({
  label,
  lines,
  meta,
  onLineAdjust,
}: ReviewGroupSectionProps) {
  return (
    <section className="review-group">
      <h3 className="review-group__label">{label}</h3>
      <ul className="review-group__list">
        {lines.map((line) => (
          <ReviewLineRow
            key={line.key}
            line={line}
            meta={meta}
            onDecrease={() => onLineAdjust(line, -1)}
            onIncrease={() => onLineAdjust(line, 1)}
          />
        ))}
      </ul>
    </section>
  )
}

function ReviewLineRow({
  line,
  meta,
  onDecrease,
  onIncrease,
}: ReviewLineRowProps) {
  const showCompare = line.lineCompareAt != null && line.lineCompareAt > line.lineTotal
  const isFree = line.product.isFree || line.lineTotal === 0
  const showStepper = line.product.adjustable !== false
  const isShipping = isShippingLine(line)
  const thumbPlain = line.product.icon === 'shield' || line.product.icon === 'truck'

  return (
    <li
      className={`review-line${showStepper ? '' : ' review-line--no-stepper'}${
        isShipping ? ' review-line--shipping' : ''
      }`}
    >
      <div
        className={`review-line__thumb${thumbPlain ? ' review-line__thumb--plain' : ''}`}
      >
        <img
          src={line.image}
          alt=""
          className="review-line__thumb-img"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="review-line__info">
        <p className="review-line__name">
          {line.displayName}
          {line.product.nameSuffix ? (
            <span className="review-line__suffix"> {line.product.nameSuffix}</span>
          ) : null}
        </p>
      </div>

      {showStepper ? (
        <QuantityStepper
          size="sm"
          value={line.quantity}
          onDecrease={onDecrease}
          onIncrease={onIncrease}
          aria-label={`${line.displayName} quantity`}
        />
      ) : (
        <span className="review-line__spacer" aria-hidden />
      )}

      <div className="review-line__prices">
        {showCompare ? (
          <span className="price price--compare">
            {formatMoney(line.lineCompareAt!)}
            {line.product.priceSuffix ?? ''}
          </span>
        ) : null}
        <span className={`price price--active${isFree ? ' price--free' : ''}`}>
          {isFree
            ? meta.freeLabel
            : `${formatMoney(line.lineTotal)}${line.product.priceSuffix ?? ''}`}
        </span>
      </div>
    </li>
  )
}
