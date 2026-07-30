import { useRef } from 'react'
import { getProduct, productsForStep } from '../lib/catalog'
import type { BuilderAccordionProps, StepId, StepProductCardProps } from '../types'
import { PlanCard } from './PlanCard'
import { ProductCard } from './ProductCard'
import { Chevron, StepIcon } from './StepIcon'

/** Matches `.builder-step__panel` grid-template-rows transition (420ms) + buffer. */
const PANEL_ANIMATION_MS = 460

/**
 * Keep the clicked accordion header fixed in the viewport while panels
 * expand/collapse. A single post-frame correction is not enough on mobile
 * because the CSS height animation keeps shifting layout for ~420ms.
 */
function pinHeaderDuringAnimation(button: HTMLButtonElement | null) {
  if (!button) return

  const anchorTop = button.getBoundingClientRect().top
  const startedAt = performance.now()

  const sync = (now: number) => {
    const delta = button.getBoundingClientRect().top - anchorTop
    if (Math.abs(delta) > 0.5) {
      window.scrollBy(0, delta)
    }
    if (now - startedAt < PANEL_ANIMATION_MS) {
      window.requestAnimationFrame(sync)
    }
  }

  window.requestAnimationFrame(sync)
}

export function BuilderAccordion({ bundle }: BuilderAccordionProps) {
  const { catalog, openStepId, toggleStep, goToNextStep, stepSelectedCount } = bundle
  const { meta } = catalog
  const headerRefs = useRef<Partial<Record<StepId, HTMLButtonElement | null>>>({})

  const handleToggle = (stepId: StepId) => {
    const button = headerRefs.current[stepId] ?? null
    toggleStep(stepId)
    pinHeaderDuringAnimation(button)
  }

  const handleNext = (current: StepId) => {
    const idx = catalog.steps.findIndex((s) => s.id === current)
    const next = catalog.steps[idx + 1]
    goToNextStep(current)

    if (!next) return

    window.requestAnimationFrame(() => {
      const nextButton = headerRefs.current[next.id] ?? null
      if (!nextButton) return
      // Bring the newly opened step into view on short phone screens, then pin it.
      nextButton.scrollIntoView({ block: 'nearest', behavior: 'auto' })
      pinHeaderDuringAnimation(nextButton)
    })
  }

  return (
    <div className="builder">
      {catalog.steps.map((step, index) => {
        const isOpen = openStepId === step.id
        const selectedCount = stepSelectedCount(step.id)
        const products = productsForStep(step.id)
        const isPlanStep = step.id === 'plan'
        const headerId = `builder-step-header-${step.id}`
        const panelId = `builder-step-panel-${step.id}`

        return (
          <section
            key={step.id}
            className={`builder-step${isOpen ? ' builder-step--open' : ''}`}
          >
            <p className="builder-step__eyebrow">
              {meta.stepLabel} {index + 1} {meta.ofLabel} {catalog.steps.length}
            </p>

            <h2 className="builder-step__heading">
              <button
                type="button"
                id={headerId}
                ref={(node) => {
                  headerRefs.current[step.id] = node
                }}
                className="builder-step__header"
                onClick={() => handleToggle(step.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span className="builder-step__title-wrap">
                  <StepIcon name={step.icon} className="builder-step__icon" />
                  <span className="builder-step__title">{step.title}</span>
                </span>

                <span className="builder-step__meta">
                  {selectedCount > 0 ? (
                    <span className="builder-step__count builder-step__count--visible">
                      {selectedCount} {meta.selectedCountSuffix}
                    </span>
                  ) : null}
                  <Chevron up={isOpen} />
                </span>
              </button>
            </h2>

            <div
              id={panelId}
              className="builder-step__panel"
              role="region"
              aria-labelledby={headerId}
              aria-hidden={!isOpen}
              inert={!isOpen ? true : undefined}
            >
              <div className="builder-step__panel-inner">
                <div className="builder-step__content">
                  {isPlanStep ? (
                    <div className="plan-step">
                      <p className="plan-step__intro">{meta.planStepIntro}</p>
                      <div
                        className="builder-grid builder-grid--plan"
                        role="list"
                        aria-label={meta.plansAriaLabel}
                      >
                        {products.map((product) => (
                          <div
                            key={product.id}
                            className="builder-grid__cell"
                            role="listitem"
                          >
                            <PlanCard
                              product={product}
                              selected={bundle.getCardQuantity(product.id, false) > 0}
                              onSelect={() => bundle.selectPlan(product.id)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="builder-grid builder-grid--products"
                      role="list"
                      aria-label={`${step.title} products`}
                    >
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="builder-grid__cell"
                          role="listitem"
                        >
                          <StepProductCard productId={product.id} bundle={bundle} />
                        </div>
                      ))}
                    </div>
                  )}

                  {step.nextLabel ? (
                    <div className="builder-step__next">
                      <button
                        type="button"
                        className="btn btn--outline"
                        onClick={() => handleNext(step.id)}
                        tabIndex={isOpen ? 0 : -1}
                      >
                        {step.nextLabel}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

function StepProductCard({ productId, bundle }: StepProductCardProps) {
  const product =
    getProduct(productId) ?? bundle.catalog.products.find((p) => p.id === productId)
  if (!product) return null

  const hasVariants = Boolean(product.variants?.length)
  const activeVariantId = hasVariants
    ? (bundle.activeVariants[product.id] ?? product.variants![0].id)
    : null
  const quantity = bundle.getCardQuantity(product.id, hasVariants)
  const selected = bundle.isProductSelected(product.id)

  return (
    <ProductCard
      product={product}
      activeVariantId={activeVariantId}
      selected={selected}
      quantity={quantity}
      onSelectVariant={(variantId) => bundle.setActiveVariant(product.id, variantId)}
      onDecrease={() => bundle.adjustQuantity(product.id, activeVariantId, -1)}
      onIncrease={() => bundle.adjustQuantity(product.id, activeVariantId, 1)}
    />
  )
}
