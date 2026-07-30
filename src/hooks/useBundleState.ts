import { useCallback, useMemo, useState } from 'react'
import {
  buildReviewLines,
  catalogData,
  computeTotals,
  getLineQuantity,
  getProductSelectedQuantity,
  groupReviewLines,
  selectedProductCount,
} from '../lib/catalog'
import type { QuantityMap, StepId } from '../types/catalog'
import { lineKey } from '../types/catalog'

const STORAGE_KEY = 'bundle-builder:saved-system'

interface PersistedState {
  quantities: QuantityMap
  activeVariants: Record<string, string>
  openStepId: StepId | null
}

function loadSaved(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    const validIds = new Set(catalogData.steps.map((s) => s.id))
    if (parsed.openStepId != null && !validIds.has(parsed.openStepId)) {
      parsed.openStepId = 'cameras'
    }
    return parsed
  } catch {
    return null
  }
}

function getInitialState(): PersistedState {
  return (
    loadSaved() ?? {
      quantities: { ...catalogData.initialQuantities },
      activeVariants: { ...catalogData.initialActiveVariants },
      openStepId: 'cameras',
    }
  )
}

export function useBundleState() {
  const [initial] = useState(getInitialState)
  const [quantities, setQuantities] = useState<QuantityMap>(initial.quantities)
  const [activeVariants, setActiveVariants] = useState<Record<string, string>>(
    initial.activeVariants,
  )
  const [openStepId, setOpenStepId] = useState<StepId | null>(initial.openStepId)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)
  const [checkoutNotice, setCheckoutNotice] = useState(false)

  const setActiveVariant = useCallback((productId: string, variantId: string) => {
    setActiveVariants((prev) => ({ ...prev, [productId]: variantId }))
  }, [])

  const setQuantity = useCallback(
    (productId: string, variantId: string | null | undefined, nextQty: number) => {
      const key = lineKey(productId, variantId)
      const clamped = Math.max(0, Math.min(99, Math.floor(nextQty)))
      const product = catalogData.products.find((p) => p.id === productId)

      setQuantities((prev) => {
        const next = { ...prev }

        if (product?.exclusiveGroup && clamped > 0) {
          for (const other of catalogData.products) {
            if (
              other.exclusiveGroup === product.exclusiveGroup &&
              other.id !== productId
            ) {
              delete next[lineKey(other.id, null)]
            }
          }
        }

        if (clamped === 0) delete next[key]
        else next[key] = clamped
        return next
      })
    },
    [],
  )

  const selectPlan = useCallback(
    (productId: string) => {
      const current = getLineQuantity(quantities, productId, null)
      setQuantity(productId, null, current > 0 ? 0 : 1)
    },
    [quantities, setQuantity],
  )

  const adjustQuantity = useCallback(
    (productId: string, variantId: string | null | undefined, delta: number) => {
      const current = getLineQuantity(quantities, productId, variantId)
      setQuantity(productId, variantId, current + delta)
    },
    [quantities, setQuantity],
  )

  const getCardQuantity = useCallback(
    (productId: string, hasVariants: boolean) => {
      if (!hasVariants) return getLineQuantity(quantities, productId, null)
      const variantId = activeVariants[productId]
      return getLineQuantity(quantities, productId, variantId)
    },
    [quantities, activeVariants],
  )

  const isProductSelected = useCallback(
    (productId: string) => getProductSelectedQuantity(quantities, productId) > 0,
    [quantities],
  )

  const reviewLines = useMemo(() => buildReviewLines(quantities), [quantities])
  const reviewGroups = useMemo(
    () => groupReviewLines(reviewLines, catalogData.meta.reviewCategoryLabels),
    [reviewLines],
  )
  const totals = useMemo(() => computeTotals(reviewLines), [reviewLines])

  const stepSelectedCount = useCallback(
    (stepId: StepId) => selectedProductCount(quantities, stepId),
    [quantities],
  )

  const toggleStep = useCallback((stepId: StepId) => {
    setOpenStepId((current) => (current === stepId ? null : stepId))
  }, [])

  const goToNextStep = useCallback((current: StepId) => {
    const idx = catalogData.steps.findIndex((s) => s.id === current)
    const next = catalogData.steps[idx + 1]
    if (next) setOpenStepId(next.id)
  }, [])

  const saveForLater = useCallback(() => {
    const payload: PersistedState = { quantities, activeVariants, openStepId }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    setSaveNotice('System saved — it will restore on your next visit.')
    window.setTimeout(() => setSaveNotice(null), 3200)
  }, [quantities, activeVariants, openStepId])

  const checkout = useCallback(() => {
    setCheckoutNotice(true)
    window.setTimeout(() => setCheckoutNotice(false), 2800)
  }, [])

  return {
    catalog: catalogData,
    quantities,
    activeVariants,
    openStepId,
    reviewLines,
    reviewGroups,
    totals,
    saveNotice,
    checkoutNotice,
    setActiveVariant,
    setQuantity,
    adjustQuantity,
    selectPlan,
    getCardQuantity,
    isProductSelected,
    stepSelectedCount,
    toggleStep,
    goToNextStep,
    saveForLater,
    checkout,
  }
}

export type BundleState = ReturnType<typeof useBundleState>
