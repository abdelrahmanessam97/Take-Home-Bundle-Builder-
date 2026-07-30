import type { CatalogData, QuantityMap } from '../types/catalog'
import { getProductSelectedQuantity } from './catalog'
import { parseLineKey } from './lineKey'

/** Returns human-readable validation errors for checkout (empty = valid). */
export function validateBundleForCheckout(
  catalog: CatalogData,
  quantities: QuantityMap,
): string[] {
  const errors: string[] = []
  const meta = catalog.meta

  const hasHardware = Object.entries(quantities).some(([key, qty]) => {
    if (qty <= 0) return false
    const { productId } = parseLineKey(key)
    const product = catalog.products.find((p) => p.id === productId)
    return (
      product?.category === 'cameras' ||
      product?.category === 'sensors' ||
      product?.category === 'accessories'
    )
  })

  if (!hasHardware) {
    errors.push(meta.validationEmptyBundle)
    return errors
  }

  for (const product of catalog.products) {
    if (!product.requiredWhenStepSelected) continue

    const stepHasOtherItems = Object.entries(quantities).some(([key, qty]) => {
      if (qty <= 0) return false
      const { productId } = parseLineKey(key)
      if (productId === product.id) return false
      const other = catalog.products.find((p) => p.id === productId)
      return other?.stepId === product.requiredWhenStepSelected
    })

    if (stepHasOtherItems && getProductSelectedQuantity(quantities, product.id) <= 0) {
      errors.push(
        meta.validationRequiredProduct.replace('{product}', product.name),
      )
    }
  }

  return errors
}
