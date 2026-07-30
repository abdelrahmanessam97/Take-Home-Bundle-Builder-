import type { LineKeyParts } from '../types/catalog'

export function lineKey(productId: string, variantId?: string | null): string {
  return variantId ? `${productId}::${variantId}` : productId
}

export function parseLineKey(key: string): LineKeyParts {
  const [productId, variantId] = key.split('::')
  return { productId, variantId: variantId ?? null }
}
