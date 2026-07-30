import type { CatalogData, QuantityMap, StepId } from './catalog'
import type { BundleTotals, ReviewGroup, ReviewLine } from './review'

/** Client + server saved/seeded bundle shape */
export interface PersistedState {
  quantities: QuantityMap
  activeVariants: Record<string, string>
  openStepId: StepId | null
}

/** Alias used while booting the app from the API */
export type BootState = PersistedState

/** Payload returned by GET /api/bundle and GET /api/initial-state */
export interface BundlePayload extends PersistedState {
  source?: 'initial' | 'saved'
  savedAt?: string
}

export interface SaveBundleResponse extends BundlePayload {
  ok: boolean
}

/** Single boot payload: catalog + saved/seed bundle */
export interface BootstrapResponse {
  catalog: CatalogData
  bundle: BundlePayload
}

export type NoticeTone = 'success' | 'error'

export interface ActionNotice {
  tone: NoticeTone
  message: string
}

/** Shared app state shape used by builder + review panel */
export interface BundleState {
  catalog: CatalogData
  quantities: QuantityMap
  activeVariants: Record<string, string>
  openStepId: StepId | null
  reviewLines: ReviewLine[]
  reviewGroups: ReviewGroup[]
  totals: BundleTotals
  validationErrors: string[]
  saveNotice: ActionNotice | null
  checkoutNotice: ActionNotice | null
  saving: boolean
  checkingOut: boolean
  setActiveVariant: (productId: string, variantId: string) => void
  setQuantity: (
    productId: string,
    variantId: string | null | undefined,
    nextQty: number,
  ) => void
  adjustQuantity: (
    productId: string,
    variantId: string | null | undefined,
    delta: number,
  ) => void
  selectPlan: (productId: string) => void
  getCardQuantity: (productId: string, hasVariants: boolean) => number
  isProductSelected: (productId: string) => boolean
  stepSelectedCount: (stepId: StepId) => number
  toggleStep: (stepId: StepId) => void
  goToNextStep: (current: StepId) => void
  saveForLater: () => Promise<void>
  checkout: () => Promise<void>
}
