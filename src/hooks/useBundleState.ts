import { useCallback, useMemo, useState } from 'react'
import { postCheckout, saveBundle } from '../lib/api'
import {
  buildReviewLines,
  computeTotals,
  getLineQuantity,
  getProductSelectedQuantity,
  groupReviewLines,
  requireCatalog,
  selectedProductCount,
} from '../lib/catalog'
import { lineKey } from '../lib/lineKey'
import { readLocalBundle, writeLocalBundle } from '../lib/persistence'
import { validateBundleForCheckout } from '../lib/validation'
import type { CatalogData, QuantityMap, StepId } from '../types/catalog'
import type { ActionNotice, BundleState, PersistedState } from '../types/bundle'

export function useBundleState(initial: PersistedState): BundleState {
  const catalog = requireCatalog()
  const [quantities, setQuantities] = useState<QuantityMap>(initial.quantities)
  const [activeVariants, setActiveVariants] = useState<Record<string, string>>(
    initial.activeVariants,
  )
  const [openStepId, setOpenStepId] = useState<StepId | null>(initial.openStepId)
  const [saveNotice, setSaveNotice] = useState<ActionNotice | null>(null)
  const [checkoutNotice, setCheckoutNotice] = useState<ActionNotice | null>(null)
  const [saving, setSaving] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)

  const clearNoticeLater = useCallback((setter: (value: ActionNotice | null) => void) => {
    window.setTimeout(() => setter(null), 4000)
  }, [])

  const setActiveVariant = useCallback((productId: string, variantId: string) => {
    setActiveVariants((prev) => ({ ...prev, [productId]: variantId }))
  }, [])

  const setQuantity = useCallback(
    (productId: string, variantId: string | null | undefined, nextQty: number) => {
      const key = lineKey(productId, variantId)
      const clamped = Math.max(0, Math.min(99, Math.floor(nextQty)))
      const product = requireCatalog().products.find((p) => p.id === productId)

      setQuantities((prev) => {
        const next = { ...prev }

        if (product?.exclusiveGroup && clamped > 0) {
          for (const other of requireCatalog().products) {
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
    () => groupReviewLines(reviewLines, catalog.meta.reviewCategoryLabels),
    [reviewLines, catalog.meta.reviewCategoryLabels],
  )
  const totals = useMemo(() => computeTotals(reviewLines), [reviewLines])

  const validationErrors = useMemo(
    () => validateBundleForCheckout(catalog, quantities),
    [catalog, quantities],
  )

  const stepSelectedCount = useCallback(
    (stepId: StepId) => selectedProductCount(quantities, stepId),
    [quantities],
  )

  const toggleStep = useCallback((stepId: StepId) => {
    setOpenStepId((current) => (current === stepId ? null : stepId))
  }, [])

  const goToNextStep = useCallback((current: StepId) => {
    const steps = requireCatalog().steps
    const idx = steps.findIndex((s) => s.id === current)
    const next = steps[idx + 1]
    if (next) setOpenStepId(next.id)
  }, [])

  const saveForLater = useCallback(async () => {
    if (saving || checkingOut) return
    setSaving(true)
    setSaveNotice(null)

    const payload: PersistedState = { quantities, activeVariants, openStepId }

    try {
      // Required: client-side persistence so reload/return restores the system.
      writeLocalBundle(payload)

      // Bonus: also sync to the API when available (non-blocking for success).
      try {
        await saveBundle(payload)
      } catch {
        // localStorage already succeeded — ignore server sync failures.
      }

      setSaveNotice({
        tone: 'success',
        message: 'System saved — it will restore on your next visit.',
      })
      clearNoticeLater(setSaveNotice)
    } catch {
      setSaveNotice({
        tone: 'error',
        message: 'Could not save your system. Please try again.',
      })
      clearNoticeLater(setSaveNotice)
    } finally {
      setSaving(false)
    }
  }, [quantities, activeVariants, openStepId, saving, checkingOut, clearNoticeLater])

  const checkout = useCallback(async () => {
    if (checkingOut || saving) return
    setCheckoutNotice(null)

    const errors = validateBundleForCheckout(requireCatalog(), quantities)
    if (errors.length > 0) {
      setCheckoutNotice({ tone: 'error', message: errors[0] })
      clearNoticeLater(setCheckoutNotice)
      return
    }

    setCheckingOut(true)
    try {
      const result = await postCheckout({ quantities, activeVariants })
      setCheckoutNotice({
        tone: 'success',
        message: result.message || `Order ${result.orderId} created.`,
      })
      clearNoticeLater(setCheckoutNotice)
    } catch {
      setCheckoutNotice({
        tone: 'error',
        message: 'Checkout failed. Please try again.',
      })
      clearNoticeLater(setCheckoutNotice)
    } finally {
      setCheckingOut(false)
    }
  }, [quantities, activeVariants, checkingOut, saving, clearNoticeLater])

  return {
    catalog,
    quantities,
    activeVariants,
    openStepId,
    reviewLines,
    reviewGroups,
    totals,
    validationErrors,
    saveNotice,
    checkoutNotice,
    saving,
    checkingOut,
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

/** Normalize a bundle payload against the loaded catalog. */
export function normalizeBundleState(
  catalog: CatalogData,
  payload: PersistedState | null | undefined,
): PersistedState {
  const validIds = new Set(catalog.steps.map((s) => s.id))
  const openStepId =
    payload?.openStepId != null && validIds.has(payload.openStepId)
      ? payload.openStepId
      : 'cameras'

  return {
    quantities: { ...(payload?.quantities ?? catalog.initialQuantities) },
    activeVariants: { ...(payload?.activeVariants ?? catalog.initialActiveVariants) },
    openStepId,
  }
}

/**
 * Resolve boot state: localStorage (required) → API/seeded catalog defaults.
 */
export function resolveInitialBundle(
  catalog: CatalogData,
  apiBundle: PersistedState | null | undefined,
): PersistedState {
  const local = readLocalBundle(catalog)
  if (local) return local
  return normalizeBundleState(catalog, apiBundle)
}
