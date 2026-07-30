import type { BootState, BundleState } from './bundle'
import type { CatalogMeta, CatalogProduct, StepIconName } from './catalog'
import type { ReviewLine } from './review'

export interface BuilderAccordionProps {
  bundle: BundleState
}

export interface StepProductCardProps {
  productId: string
  bundle: BundleState
}

export interface ProductCardProps {
  product: CatalogProduct
  activeVariantId: string | null
  selected: boolean
  quantity: number
  onSelectVariant: (variantId: string) => void
  onDecrease: () => void
  onIncrease: () => void
}

export interface PlanCardProps {
  product: CatalogProduct
  selected: boolean
  onSelect: () => void
}

export interface ReviewPanelProps {
  bundle: BundleState
}

export interface ReviewGroupSectionProps {
  label: string
  lines: ReviewLine[]
  meta: CatalogMeta
  onLineAdjust: (line: ReviewLine, delta: number) => void
}

export interface ReviewLineRowProps {
  line: ReviewLine
  meta: CatalogMeta
  onDecrease: () => void
  onIncrease: () => void
}

export interface QuantityStepperProps {
  value: number
  onDecrease: () => void
  onIncrease: () => void
  size?: 'sm' | 'md'
  min?: number
  max?: number
  disabledDecrease?: boolean
  disabledIncrease?: boolean
  /** When true and value is 0, render a single plus control instead of − / qty / + */
  addOnlyWhenZero?: boolean
  'aria-label'?: string
}

export interface StepIconProps {
  name: StepIconName
  className?: string
}

export interface ChevronProps {
  up?: boolean
}

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

export interface BundleAppProps {
  initial: BootState
}
