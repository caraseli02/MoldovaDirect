import type { CartItem } from '~/stores/cart/types'
import type { OrderData, ShippingMethod } from '~/types/checkout'

export interface OrderCalculationOptions {
  shippingCost?: number
  taxRate?: number
  currency?: string
}

export function buildOrderData(
  cartItems: CartItem[],
  options: OrderCalculationOptions = {},
): OrderData {
  const taxRate = options.taxRate ?? 0.21
  const currency = options.currency ?? 'EUR'
  const shippingCost = options.shippingCost ?? 0

  const subtotal = roundToCurrency(
    cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  )
  const tax = roundToCurrency(subtotal * taxRate)

  return {
    subtotal,
    shippingCost: roundToCurrency(shippingCost),
    tax,
    total: roundToCurrency(subtotal + shippingCost + tax),
    currency,
    items: cartItems.map(item => ({
      productId: item.product.id,
      productSnapshot: { ...item.product },
      quantity: item.quantity,
      price: item.product.price,
      total: roundToCurrency(item.product.price * item.quantity),
    })),
  }
}

export function applyShippingMethod(order: OrderData, method: ShippingMethod): OrderData {
  const updatedShipping = roundToCurrency(method.price)
  const updatedTotal = roundToCurrency(order.subtotal + order.tax + updatedShipping)

  return {
    ...order,
    shippingCost: updatedShipping,
    total: updatedTotal,
  }
}

export function roundToCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
