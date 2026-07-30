import type { CatalogData } from '../types/catalog'
import type {
  BootstrapResponse,
  BundlePayload,
  SaveBundleResponse,
} from '../types/bundle'
import type { CheckoutRequest, CheckoutResponse } from '../types/api'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}`)
  }

  return (await response.json()) as T
}

/** Shared boot promise so Strict Mode remounts reuse one network call. */
let bootstrapPromise: Promise<BootstrapResponse> | null = null

export function fetchBootstrap(): Promise<BootstrapResponse> {
  if (!bootstrapPromise) {
    bootstrapPromise = apiFetch<BootstrapResponse>('/api/bootstrap').catch((error) => {
      bootstrapPromise = null
      throw error
    })
  }
  return bootstrapPromise
}

/** Clear cached boot request (e.g. Retry after a failed load). */
export function resetBootstrapCache() {
  bootstrapPromise = null
}

export function fetchCatalog(): Promise<CatalogData> {
  return apiFetch<CatalogData>('/api/catalog')
}

export function fetchProducts() {
  return apiFetch('/api/products')
}

export function fetchProduct(id: string) {
  return apiFetch(`/api/products/${encodeURIComponent(id)}`)
}

export function fetchSteps() {
  return apiFetch('/api/steps')
}

export function fetchMeta() {
  return apiFetch('/api/meta')
}

export function fetchInitialState(): Promise<BundlePayload> {
  return apiFetch<BundlePayload>('/api/initial-state')
}

export function fetchBundle(): Promise<BundlePayload> {
  return apiFetch<BundlePayload>('/api/bundle')
}

export function saveBundle(payload: Omit<BundlePayload, 'source' | 'savedAt'>) {
  return apiFetch<SaveBundleResponse>('/api/bundle', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function postCheckout(payload: CheckoutRequest) {
  return apiFetch<CheckoutResponse>('/api/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
