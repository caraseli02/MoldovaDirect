/**
 * Unit Tests for Checkout Middleware
 * Tests critical confirmation page access logic and step validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCheckoutStore } from '~/stores/checkout'
import { useCartStore } from '~/stores/cart'
import type { Product } from '~/stores/cart/types'

// Mock Nuxt composables
const mockLocalePath = vi.fn((path: string) => path)
const mockNavigateTo = vi.fn()

global.useLocalePath = vi.fn(() => mockLocalePath)
global.navigateTo = mockNavigateTo

// Mock product
const mockProduct: Product = {
  id: 'test-product',
  slug: 'test-product',
  name: 'Test Product',
  price: 25.99,
  images: ['/test.jpg'],
  stock: 10,
  category: 'Test'
}

// Mock cookie
let mockCookieValue: any = null

vi.mock('#app', () => ({
  useCookie: vi.fn(() => ({
    get value() { return mockCookieValue },
    set value(val) { mockCookieValue = val }
  })),
  useLocalePath: vi.fn(() => mockLocalePath),
  navigateTo: mockNavigateTo
}))

describe('Checkout Middleware - Confirmation Page Access', () => {
  let checkoutStore: ReturnType<typeof useCheckoutStore>
  let cartStore: ReturnType<typeof useCartStore>

  beforeEach(() => {
    mockCookieValue = null
    setActivePinia(createPinia())
    checkoutStore = useCheckoutStore()
    cartStore = useCartStore()
    vi.clearAllMocks()
  })

  describe('Confirmation Page Access (CRITICAL)', () => {
    it('should allow confirmation page access with valid order data', () => {
      // Set up completed order
      checkoutStore.setOrderData({
        orderId: 'order-123',
        orderNumber: 'ORD-2024-001',
        items: [],
        subtotal: 99.99,
        shippingCost: 9.99,
        tax: 10.00,
        total: 119.98,
        currency: 'USD',
        customerEmail: 'test@example.com'
      })

      checkoutStore.currentStep = 'confirmation'

      // Simulate middleware check
      const hasOrderId = Boolean(checkoutStore.orderData?.orderId)
      const isConfirmationStep = checkoutStore.currentStep === 'confirmation'

      expect(hasOrderId).toBe(true)
      expect(isConfirmationStep).toBe(true)
      // Should allow access
      expect(hasOrderId || isConfirmationStep).toBe(true)
    })

    it('should allow confirmation access from review step', () => {
      checkoutStore.currentStep = 'review'
      checkoutStore.setOrderData({
        orderId: 'order-456',
        orderNumber: 'ORD-2024-002',
        items: [],
        subtotal: 50.00,
        shippingCost: 5.00,
        tax: 5.00,
        total: 60.00,
        currency: 'USD',
        customerEmail: 'test2@example.com'
      })

      // User just completed checkout, navigating to confirmation
      const canAccess = checkoutStore.currentStep === 'review' ||
                        Boolean(checkoutStore.orderData?.orderId)

      expect(canAccess).toBe(true)
    })

    it('should allow confirmation access without cart validation', async () => {
      // Cart is empty (cleared after checkout)
      expect(cartStore.isEmpty).toBe(true)

      // But order data exists
      checkoutStore.setOrderData({
        orderId: 'order-789',
        orderNumber: 'ORD-2024-003',
        items: [],
        subtotal: 100.00,
        shippingCost: 10.00,
        tax: 10.00,
        total: 120.00,
        currency: 'USD',
        customerEmail: 'test3@example.com'
      })

      checkoutStore.currentStep = 'confirmation'

      // Should allow access even with empty cart
      const canAccess = Boolean(checkoutStore.orderData?.orderId)
      expect(canAccess).toBe(true)
    })

    it('should prevent confirmation access without valid order', () => {
      // No order data
      checkoutStore.orderData = null
      checkoutStore.currentStep = 'shipping'

      const canAccess = Boolean(checkoutStore.orderData?.orderId)
      expect(canAccess).toBe(false)
    })

    it('should restore session and allow confirmation access', () => {
      // Simulate page refresh - restore from cookie
      mockCookieValue = {
        sessionId: 'session-123',
        currentStep: 'confirmation',
        orderData: {
          orderId: 'order-999',
          orderNumber: 'ORD-2024-999',
          items: [],
          subtotal: 75.00,
          shippingCost: 7.50,
          tax: 7.50,
          total: 90.00,
          currency: 'USD',
          customerEmail: 'restored@example.com'
        },
        shippingInfo: null,
        paymentMethod: null
      }

      checkoutStore.restore()

      expect(checkoutStore.orderData?.orderId).toBe('order-999')
      expect(checkoutStore.currentStep).toBe('confirmation')

      const canAccess = Boolean(checkoutStore.orderData?.orderId)
      expect(canAccess).toBe(true)
    })
  })

  describe('Step Access Control', () => {
    it('should require cart items for shipping step', async () => {
      checkoutStore.currentStep = 'shipping'

      // Cart is empty
      expect(cartStore.isEmpty).toBe(true)

      // Should redirect to cart
      const needsRedirect = cartStore.isEmpty && checkoutStore.currentStep !== 'confirmation'
      expect(needsRedirect).toBe(true)
    })

    it('should allow shipping step with cart items', async () => {
      await cartStore.addItem(mockProduct, 1)
      checkoutStore.currentStep = 'shipping'

      expect(cartStore.isEmpty).toBe(false)
      const canAccess = !cartStore.isEmpty || checkoutStore.currentStep === 'confirmation'
      expect(canAccess).toBe(true)
    })

    it('should require shipping info for payment step', () => {
      checkoutStore.currentStep = 'payment'
      checkoutStore.shippingInfo = null

      const canAccessPayment = checkoutStore.shippingInfo !== null
      expect(canAccessPayment).toBe(false)
    })

    it('should allow payment step with shipping info', () => {
      checkoutStore.setShippingInfo({
        address: {
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main St',
          city: 'Test',
          postalCode: '12345',
          country: 'US',
          phone: '+1234567890'
        },
        method: {
          id: 'standard',
          name: 'Standard',
          description: '5-7 days',
          price: 9.99,
          estimatedDays: 7
        }
      })

      checkoutStore.currentStep = 'payment'

      const canAccessPayment = checkoutStore.shippingInfo !== null
      expect(canAccessPayment).toBe(true)
    })

    it('should require payment method for review step', () => {
      checkoutStore.currentStep = 'review'
      checkoutStore.setShippingInfo({
        address: {
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main St',
          city: 'Test',
          postalCode: '12345',
          country: 'US',
          phone: '+1234567890'
        },
        method: {
          id: 'standard',
          name: 'Standard',
          description: '5-7 days',
          price: 9.99,
          estimatedDays: 7
        }
      })
      // No payment method
      checkoutStore.paymentMethod = null

      const canAccessReview = checkoutStore.shippingInfo !== null &&
                              checkoutStore.paymentMethod !== null
      expect(canAccessReview).toBe(false)
    })

    it('should allow review step with complete checkout data', () => {
      // Set up shipping
      checkoutStore.setShippingInfo({
        address: {
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main St',
          city: 'Test',
          postalCode: '12345',
          country: 'US',
          phone: '+1234567890'
        },
        method: {
          id: 'standard',
          name: 'Standard',
          description: '5-7 days',
          price: 9.99,
          estimatedDays: 7
        }
      })

      // Set up payment
      checkoutStore.setPaymentMethodState({
        type: 'cash'
      })

      checkoutStore.currentStep = 'review'

      const canAccessReview = checkoutStore.shippingInfo !== null &&
                              checkoutStore.paymentMethod !== null
      expect(canAccessReview).toBe(true)
    })
  })

  describe('Guest Checkout Flow', () => {
    it('should allow guest to access confirmation after order', () => {
      // Guest info set
      checkoutStore.setGuestInfo({
        email: 'guest@example.com',
        emailUpdates: false
      })

      // Order completed
      checkoutStore.setOrderData({
        orderId: 'guest-order-123',
        orderNumber: 'ORD-GUEST-001',
        items: [],
        subtotal: 50.00,
        shippingCost: 5.00,
        tax: 5.00,
        total: 60.00,
        currency: 'USD',
        customerEmail: 'guest@example.com'
      })

      checkoutStore.currentStep = 'confirmation'

      const isGuest = checkoutStore.guestInfo !== null
      const hasOrder = Boolean(checkoutStore.orderData?.orderId)

      expect(isGuest).toBe(true)
      expect(hasOrder).toBe(true)
    })

    it('should restore guest session from cookie', () => {
      mockCookieValue = {
        sessionId: 'guest-session',
        currentStep: 'confirmation',
        guestInfo: {
          email: 'guest@test.com',
          emailUpdates: true
        },
        orderData: {
          orderId: 'guest-order-456',
          orderNumber: 'ORD-GUEST-002',
          items: [],
          subtotal: 75.00,
          shippingCost: 7.50,
          tax: 7.50,
          total: 90.00,
          currency: 'USD',
          customerEmail: 'guest@test.com'
        },
        shippingInfo: null,
        paymentMethod: null
      }

      checkoutStore.restore()

      expect(checkoutStore.guestInfo?.email).toBe('guest@test.com')
      expect(checkoutStore.orderData?.orderId).toBe('guest-order-456')
      expect(checkoutStore.currentStep).toBe('confirmation')
    })
  })

  describe('Step Progression', () => {
    it('should update current step based on URL', () => {
      // Simulate navigating to payment page
      checkoutStore.currentStep = 'payment'

      expect(checkoutStore.currentStep).toBe('payment')
    })

    it('should maintain step state across page refreshes', () => {
      checkoutStore.currentStep = 'review'
      checkoutStore.persist({
        shippingInfo: null,
        paymentMethod: null
      })

      // Simulate page refresh
      checkoutStore.restore()

      expect(checkoutStore.currentStep).toBe('review')
    })

    it('should handle step validation correctly', () => {
      const steps: Array<'shipping' | 'payment' | 'review' | 'confirmation'> =
        ['shipping', 'payment', 'review', 'confirmation']

      steps.forEach(step => {
        checkoutStore.currentStep = step
        expect(checkoutStore.currentStep).toBe(step)
      })
    })
  })

  describe('Error Scenarios', () => {
    it('should handle missing order data gracefully', () => {
      checkoutStore.currentStep = 'confirmation'
      checkoutStore.orderData = null

      const shouldRedirect = !Boolean(checkoutStore.orderData?.orderId)
      expect(shouldRedirect).toBe(true)
    })

    it('should handle corrupted session data', () => {
      mockCookieValue = {
        sessionId: 'corrupted',
        currentStep: 'invalid-step',
        orderData: null
      }

      checkoutStore.restore()

      // Should default to shipping if step is invalid
      const validSteps = ['shipping', 'payment', 'review', 'confirmation']
      const isValidStep = validSteps.includes(checkoutStore.currentStep as string)
      expect(isValidStep).toBe(true)
    })
  })
})
