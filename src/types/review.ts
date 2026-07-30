import type { CatalogProduct, ReviewCategory } from './catalog'

export interface ReviewLine {
  key: string
  product: CatalogProduct
  variantId: string | null
  variantLabel: string | null
  image: string
  quantity: number
  unitPrice: number
  unitCompareAt: number | null
  lineTotal: number
  lineCompareAt: number | null
  displayName: string
}

export interface ReviewGroup {
  category: ReviewCategory
  label: string
  lines: ReviewLine[]
}

export interface BundleTotals {
  total: number
  compareAt: number
  savings: number
}
