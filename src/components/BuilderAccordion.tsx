import type { BundleState } from '../hooks/useBundleState'
import { productsForStep } from '../lib/catalog'
import { PlanCard } from './PlanCard'
import { ProductCard } from './ProductCard'
import { Chevron, StepIcon } from './StepIcon'

interface BuilderAccordionProps {
  bundle: BundleState
}

export function BuilderAccordion({ bundle }: BuilderAccordionProps) {
  const { catalog, openStepId, toggleStep, goToNextStep, stepSelectedCount } =
    bundle
  const { meta } = catalog

  return (
    <div className="builder">
      {catalog.steps.map((step, index) => {
        const isOpen = openStepId === step.id
        const selectedCount = stepSelectedCount(step.id)
        const products = productsForStep(step.id)
        const isPlanStep = step.id === 'plan'
        const panelId = `builder-step-panel-${step.id}`

        return (
          <section
            key={step.id}
            className={`builder-step${isOpen ? ' builder-step--open' : ''}`}
          >
            <p className="builder-step__eyebrow">
              {meta.stepLabel} {index + 1} {meta.ofLabel} {catalog.steps.length}
            </p>

            <button
              type="button"
              className="builder-step__header"
              onClick={() => toggleStep(step.id)}
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

            <div
              id={panelId}
              className="builder-step__panel"
              role="region"
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
                          <div key={product.id} className="builder-grid__cell" role="listitem">
                            <PlanCard
                              product={product}
                              selected={
                                bundle.getCardQuantity(product.id, false) > 0
                              }
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
                        <div key={product.id} className="builder-grid__cell" role="listitem">
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
                        onClick={() => goToNextStep(step.id)}
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

function StepProductCard({
  productId,
  bundle,
}: {
  productId: string
  bundle: BundleState
}) {
  const product = bundle.catalog.products.find((p) => p.id === productId)!
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
      onSelectVariant={(variantId) =>
        bundle.setActiveVariant(product.id, variantId)
      }
      onDecrease={() => bundle.adjustQuantity(product.id, activeVariantId, -1)}
      onIncrease={() => bundle.adjustQuantity(product.id, activeVariantId, 1)}
    />
  )
}
