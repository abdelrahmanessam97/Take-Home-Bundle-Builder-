import type { QuantityMap } from './catalog'

export interface CheckoutLine {
  key: string
  productId: string
  variantId: string | null
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface CheckoutResponse {
  ok: boolean
  orderId: string
  lines: CheckoutLine[]
  total: number
  message: string
}

export interface CheckoutRequest {
  quantities: QuantityMap
  activeVariants: Record<string, string>
}
