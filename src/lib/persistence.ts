import type { CatalogData } from '../types/catalog'
import type { PersistedState } from '../types/bundle'

export const STORAGE_KEY = 'bundle-builder:saved-system'

export function readLocalBundle(catalog: CatalogData): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    if (!parsed || typeof parsed !== 'object') return null
    if (!parsed.quantities || typeof parsed.quantities !== 'object') return null
    if (!parsed.activeVariants || typeof parsed.activeVariants !== 'object') return null

    const validIds = new Set(catalog.steps.map((s) => s.id))
    const openStepId =
      parsed.openStepId != null && validIds.has(parsed.openStepId)
        ? parsed.openStepId
        : 'cameras'

    return {
      quantities: { ...parsed.quantities },
      activeVariants: { ...parsed.activeVariants },
      openStepId,
    }
  } catch {
    return null
  }
}

export function writeLocalBundle(payload: PersistedState): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      quantities: payload.quantities,
      activeVariants: payload.activeVariants,
      openStepId: payload.openStepId,
      savedAt: new Date().toISOString(),
    }),
  )
}
