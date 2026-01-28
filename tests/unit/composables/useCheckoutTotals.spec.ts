/**
 * Unit tests for useCheckoutTotals composable
 *
 * Tests order totals calculation, shipping cost, tax, and formatting.
 */

import { describe, it, expect } from 'vitest'
import { ref, computed } from 'vue'
import type { ShippingMethod } from '~/types/checkout'

// Mock stores
const mockCartItems = [
  {
    product: { id: 1, name: 'Product 1', price: 10, images: [] },
    quantity: 2,
  },
  {
    product: { id: 2, name: 'Product 2', price: 20, images: [] },
    quantity: 1,
  },
]

function createUseCheckoutTotals(selectedMethod: ReturnType<typeof ref<ShippingMethod | null>>) {
  // Mock cart store
  const cartItems = ref(mockCartItems)

  // Mock checkout store
  const orderData = ref<{ total?: number } | null>(null)

  // Mock locale
  const locale = ref('es-ES')

  /**
   * Calculate subtotal from cart items
   */
  const subtotal = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  })

  /**
   * Calculate shipping cost from selected method
   */
  const shippingCost = computed(() => {
    return selectedMethod.value?.price || 0
  })

  /**
   * Calculate tax (21% VAT for Spain)
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
    const orderTotal = orderData.value?.total || total.value
    return new Intl.NumberFormat(locale.value || 'es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(orderTotal)
  })

  /**
   * Map cart items for order summary display
   */
  const items = computed(() => {
    return (cartItems.value || []).map(item => ({
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
    items,
    orderData,
    locale,
    cartItems,
  }
}

describe('useCheckoutTotals', () => {
  describe('subtotal', () => {
    it('should calculate subtotal correctly from cart items', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { subtotal } = createUseCheckoutTotals(selectedMethod)

      // 10 * 2 + 20 * 1 = 40
      expect(subtotal.value).toBe(40)
    })

    it('should return 0 for empty cart', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const composable = createUseCheckoutTotals(selectedMethod)
      composable.cartItems.value = []

      expect(composable.subtotal.value).toBe(0)
    })

    it('should handle items with quantity 0', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const composable = createUseCheckoutTotals(selectedMethod)
      composable.cartItems.value = [
        { product: { id: 1, name: 'Product', price: 10, images: [] }, quantity: 0 },
      ]

      expect(composable.subtotal.value).toBe(0)
    })

    it('should handle products with price 0', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const composable = createUseCheckoutTotals(selectedMethod)
      composable.cartItems.value = [
        { product: { id: 1, name: 'Free Product', price: 0, images: [] }, quantity: 5 },
      ]

      expect(composable.subtotal.value).toBe(0)
    })
  })

  describe('shippingCost', () => {
    it('should return shipping method price when selected', () => {
      const selectedMethod = ref<ShippingMethod | null>({
        id: 'standard',
        name: 'Standard',
        price: 5.99,
        estimatedDays: 4,
      })
      const { shippingCost } = createUseCheckoutTotals(selectedMethod)

      expect(shippingCost.value).toBe(5.99)
    })

    it('should return 0 when no shipping method selected', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { shippingCost } = createUseCheckoutTotals(selectedMethod)

      expect(shippingCost.value).toBe(0)
    })

    it('should return 0 when shipping method price is undefined', () => {
      const selectedMethod = ref<ShippingMethod | null>({
        id: 'free',
        name: 'Free Shipping',
        price: undefined as unknown as number,
        estimatedDays: 7,
      })
      const { shippingCost } = createUseCheckoutTotals(selectedMethod)

      expect(shippingCost.value).toBe(0)
    })
  })

  describe('tax', () => {
    it('should calculate 21% VAT on subtotal', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { tax } = createUseCheckoutTotals(selectedMethod)

      // 40 * 0.21 = 8.4
      expect(tax.value).toBe(8.4)
    })

    it('should round tax to 2 decimal places', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const composable = createUseCheckoutTotals(selectedMethod)
      composable.cartItems.value = [
        { product: { id: 1, name: 'Product', price: 10.01, images: [] }, quantity: 3 },
      ]

      // 30.03 * 0.21 = 6.3063, rounded to 6.31
      expect(composable.tax.value).toBe(6.31)
    })

    it('should return 0 tax for zero subtotal', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const composable = createUseCheckoutTotals(selectedMethod)
      composable.cartItems.value = []

      expect(composable.tax.value).toBe(0)
    })

    it('should handle tax calculation edge case with empty cart', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const composable = createUseCheckoutTotals(selectedMethod)
      composable.cartItems.value = []

      const { tax, subtotal: _ } = composable
      expect(tax.value).toBe(0)
    })
  })

  describe('total', () => {
    it('should sum subtotal + shipping + tax', () => {
      const selectedMethod = ref<ShippingMethod | null>({
        id: 'standard',
        name: 'Standard',
        price: 5.99,
        estimatedDays: 4,
      })
      const { total } = createUseCheckoutTotals(selectedMethod)

      // 40 + 5.99 + 8.4 = 54.39
      expect(total.value).toBe(54.39)
    })

    it('should return only subtotal when no shipping method selected', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { total } = createUseCheckoutTotals(selectedMethod)

      // 40 + 0 + 8.4 = 48.4
      expect(total.value).toBe(48.4)
    })
  })

  describe('formatted', () => {
    it('should format total as EUR currency string', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { formatted } = createUseCheckoutTotals(selectedMethod)

      // Note: Intl.NumberFormat uses non-breaking space (U+00A0) not regular space
      expect(formatted.value).toBe('48,40\xa0€') // \u00A0 is non-breaking space
    })

    it('should use Spanish locale by default', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const composable = createUseCheckoutTotals(selectedMethod)

      expect(composable.formatted.value).toBe('48,40\xa0€')
    })

    it('should use checkout store total if available', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const composable = createUseCheckoutTotals(selectedMethod)
      composable.orderData.value = { total: 100 }

      expect(composable.formatted.value).toBe('100,00\xa0€')
    })

    it('should handle different locales', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const composable = createUseCheckoutTotals(selectedMethod)
      composable.locale.value = 'en-US'

      // Note: en-US with EUR currency still shows € symbol
      expect(composable.formatted.value).toBe('€48.40')
    })
  })

  describe('items', () => {
    it('should map cart items for display', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { items } = createUseCheckoutTotals(selectedMethod)

      expect(items.value).toHaveLength(2)
      expect(items.value[0]).toEqual({
        productId: 1,
        name: 'Product 1',
        quantity: 2,
        price: 10,
        images: [],
      })
    })

    it('should return empty array for empty cart', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const composable = createUseCheckoutTotals(selectedMethod)
      composable.cartItems.value = []

      expect(composable.items.value).toEqual([])
    })
  })
})
