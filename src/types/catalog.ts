export type ReviewCategory = 'cameras' | 'sensors' | 'accessories' | 'plan'

export type StepId = 'cameras' | 'plan' | 'sensors' | 'protection'

export interface ProductVariant {
  id: string
  label: string
  /** CSS color or image swatch path */
  swatch: string
  /** Small thumbnail for the color chip only */
  swatchImage?: string
  /** Full-size product photo for this color (hero media). Falls back to product.image */
  image?: string
}

export interface CatalogProduct {
  id: string
  stepId: StepId
  category: ReviewCategory
  name: string
  description?: string
  learnMoreUrl?: string
  image: string
  badge?: string
  /** Unit price in USD */
  price: number
  /** Compare-at unit price */
  compareAt?: number
  /** When true, active price displays as FREE */
  isFree?: boolean
  /** Appended to price display, e.g. "/mo" */
  priceSuffix?: string
  /** Shown after name, e.g. "(Required)" */
  nameSuffix?: string
  variants?: ProductVariant[]
  /** If false, hide qty stepper in review (rare) */
  adjustable?: boolean
  /** Icon-only row (shipping / plan) may use icon instead of product photo */
  icon?: 'shield' | 'truck'
  /** When false, compare-at is shown on the line but omitted from the bundle compare total */
  includeCompareInTotal?: boolean
  /** Feature bullets for plan / business cards */
  features?: string[]
  /** Hide from builder accordion (still shown in review when selected) */
  hideInBuilder?: boolean
  /** Mutual-exclusion group — selecting one clears others in the group */
  exclusiveGroup?: string
}

export interface CatalogStep {
  id: StepId
  title: string
  nextLabel?: string
  icon: 'camera' | 'shield' | 'sensor' | 'grid'
}

export interface CatalogMeta {
  appTitle: string
  builderAriaLabel: string
  reviewItemsAriaLabel: string
  reviewSummaryAriaLabel: string
  reviewEyebrow: string
  shippingLabel: string
  financingLabel: string
  financingEmptyLabel: string
  savingsPrefix: string
  savingsSuffix: string
  guaranteeTitle: string
  guaranteeBody: string
  returnsTitle: string
  reviewTitle: string
  reviewSubtitle: string
  reviewPlanLabel: string
  reviewEmptyTitle: string
  reviewEmptyBody: string
  checkoutLabel: string
  saveForLaterLabel: string
  checkoutNotice: string
  planStepIntro: string
  plansAriaLabel: string
  stepLabel: string
  ofLabel: string
  selectedCountSuffix: string
  readMoreLabel: string
  showLessLabel: string
  learnMoreLabel: string
  freeLabel: string
  selectPlanLabel: string
  selectedPlanLabel: string
  reviewCategoryLabels: Record<ReviewCategory, string>
}

export interface CatalogData {
  meta: CatalogMeta
  steps: CatalogStep[]
  products: CatalogProduct[]
  /**
   * Seed line quantities: key = productId or productId::variantId
   * Matches the Figma review panel on first load.
   */
  initialQuantities: Record<string, number>
  /** Active color chip per product that has variants */
  initialActiveVariants: Record<string, string>
}

/** Runtime selection map: lineKey → quantity */
export type QuantityMap = Record<string, number>

export function lineKey(productId: string, variantId?: string | null): string {
  return variantId ? `${productId}::${variantId}` : productId
}

export function parseLineKey(key: string): { productId: string; variantId: string | null } {
  const [productId, variantId] = key.split('::')
  return { productId, variantId: variantId ?? null }
}
