/**
 * Checkout Totals Composable
 *
 * Calculates order totals (subtotal, shipping, tax, total).
 * Handles formatting of currency values.
 *
 * @see {CODE_DESIGN_PRINCIPLES.md} Three-layer separation
 */

import { computed } from 'vue'
import type { ShippingMethod } from '~/types/checkout'
import { useCartStore } from '~/stores/cart'
import { useCheckoutStore } from '~/stores/checkout'

export interface CheckoutTotals {
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  formatted: string
}

export function useCheckoutTotals(selectedMethod: ReturnType<typeof ref<ShippingMethod | null>>) {
  const cartStore = useCartStore()
  const checkoutStore = useCheckoutStore()
  const { locale } = useI18n()

  /**
   * Calculate subtotal from cart items
   */
  const subtotal = computed(() => {
    return cartStore.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  })

  /**
   * Calculate shipping cost from selected method
   */
  const shippingCost = computed(() => {
    return selectedMethod.value?.price || 0
  })

  /**
   * Calculate tax (21% VAT for Spain)
   * TODO: Make tax rate configurable based on country
   */
  const tax = computed(() => {
    return Math.round(subtotal.value * 0.21 * 100) / 100
  })

  /**
   * Calculate total (subtotal + shipping + tax)
   */
  const total = computed(() => {
    return subtotal.value + shippingCost.value + tax.value
  })

  /**
   * Format total as currency string
   */
  const formatted = computed(() => {
    const orderTotal = checkoutStore.orderData?.total || total.value
    return new Intl.NumberFormat(locale.value || 'es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(orderTotal)
  })

  /**
   * Get all totals as a single object
   */
  const totals = computed<CheckoutTotals>(() => ({
    subtotal: subtotal.value,
    shippingCost: shippingCost.value,
    tax: tax.value,
    total: total.value,
    formatted: formatted.value,
  }))

  /**
   * Map cart items for order summary display
   */
  const cartItems = computed(() => {
    return (cartStore.items || []).map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      images: item.product.images,
    }))
  })

  return {
    subtotal,
    shippingCost,
    tax,
    total,
    formatted,
    totals,
    cartItems,
  }
}
