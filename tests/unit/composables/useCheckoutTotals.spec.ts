/**
 * Unit tests for useCheckoutTotals composable
 *
 * Tests order totals calculation, shipping cost, tax, and formatting.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { ShippingMethod } from '~/types/checkout'
import { useCheckoutTotals } from '~/composables/useCheckoutTotals'

// Mock the cart store
const mockCartItems = ref([
  {
    product: { id: 1, name: 'Product 1', price: 10, images: [] },
    quantity: 2,
  },
  {
    product: { id: 2, name: 'Product 2', price: 20, images: [] },
    quantity: 1,
  },
])

const mockOrderData = ref(null)

const mockCheckoutStore = {
  get orderData() {
    return mockOrderData.value
  },
}

vi.mock('~/stores/cart', () => ({
  useCartStore: vi.fn(() => ({
    items: mockCartItems.value,
  })),
}))

vi.mock('~/stores/checkout', () => ({
  useCheckoutStore: vi.fn(() => mockCheckoutStore),
}))

describe('useCheckoutTotals', () => {
  beforeEach(() => {
    // Reset mock state
    mockCartItems.value = [
      { product: { id: 1, name: 'Product 1', price: 10, images: [] }, quantity: 2 },
      { product: { id: 2, name: 'Product 2', price: 20, images: [] }, quantity: 1 },
    ]
    mockOrderData.value = null
  })

  describe('subtotal', () => {
    it('should calculate subtotal correctly from cart items', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { subtotal } = useCheckoutTotals(selectedMethod)

      // 10 * 2 + 20 * 1 = 40
      expect(subtotal.value).toBe(40)
    })

    it('should return 0 for empty cart', () => {
      mockCartItems.value = []
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { subtotal } = useCheckoutTotals(selectedMethod)

      expect(subtotal.value).toBe(0)
    })

    it('should handle items with quantity 0', () => {
      mockCartItems.value = [
        { product: { id: 1, name: 'Product', price: 10, images: [] }, quantity: 0 },
      ]
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { subtotal } = useCheckoutTotals(selectedMethod)

      expect(subtotal.value).toBe(0)
    })

    it('should handle products with price 0', () => {
      mockCartItems.value = [
        { product: { id: 1, name: 'Free Product', price: 0, images: [] }, quantity: 5 },
      ]
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { subtotal } = useCheckoutTotals(selectedMethod)

      expect(subtotal.value).toBe(0)
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
      const { shippingCost } = useCheckoutTotals(selectedMethod)

      expect(shippingCost.value).toBe(5.99)
    })

    it('should return 0 when no shipping method selected', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { shippingCost } = useCheckoutTotals(selectedMethod)

      expect(shippingCost.value).toBe(0)
    })
  })

  describe('tax', () => {
    it('should calculate 21% VAT on subtotal', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { tax } = useCheckoutTotals(selectedMethod)

      // 40 * 0.21 = 8.4
      expect(tax.value).toBe(8.4)
    })

    it('should round tax to 2 decimal places', () => {
      mockCartItems.value = [
        { product: { id: 1, name: 'Product', price: 10.01, images: [] }, quantity: 3 },
      ]
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { tax } = useCheckoutTotals(selectedMethod)

      // 30.03 * 0.21 = 6.3063, rounded to 6.31
      expect(tax.value).toBe(6.31)
    })

    it('should return 0 tax for zero subtotal', () => {
      mockCartItems.value = []
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { tax } = useCheckoutTotals(selectedMethod)

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
      const { total } = useCheckoutTotals(selectedMethod)

      // 40 + 5.99 + 8.4 = 54.39
      expect(total.value).toBe(54.39)
    })

    it('should return only subtotal + tax when no shipping method selected', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { total } = useCheckoutTotals(selectedMethod)

      // 40 + 0 + 8.4 = 48.4
      expect(total.value).toBe(48.4)
    })
  })

  describe('formatted', () => {
    it('should format total as EUR currency string', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { formatted } = useCheckoutTotals(selectedMethod)

      // Note: i18n mock returns 'en' locale, so format is €48.40 (en-US style)
      expect(formatted.value).toBe('€48.40')
    })

    it('should use checkout store total if available', () => {
      mockOrderData.value = { total: 100 }
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { formatted } = useCheckoutTotals(selectedMethod)

      expect(formatted.value).toBe('€100.00')
    })
  })

  describe('cartItems', () => {
    it('should map cart items for display', () => {
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { cartItems } = useCheckoutTotals(selectedMethod)

      expect(cartItems.value).toHaveLength(2)
      expect(cartItems.value[0]).toEqual({
        productId: 1,
        name: 'Product 1',
        quantity: 2,
        price: 10,
        images: [],
      })
    })

    it('should return empty array for empty cart', () => {
      mockCartItems.value = []
      const selectedMethod = ref<ShippingMethod | null>(null)
      const { cartItems } = useCheckoutTotals(selectedMethod)

      expect(cartItems.value).toEqual([])
    })
  })

  describe('totals', () => {
    it('should return all totals as a single object', () => {
      const selectedMethod = ref<ShippingMethod | null>({
        id: 'standard',
        name: 'Standard',
        price: 5.99,
        estimatedDays: 4,
      })
      const { totals } = useCheckoutTotals(selectedMethod)

      expect(totals.value).toEqual({
        subtotal: 40,
        shippingCost: 5.99,
        tax: 8.4,
        total: 54.39,
        formatted: expect.any(String),
      })
    })
  })
})
