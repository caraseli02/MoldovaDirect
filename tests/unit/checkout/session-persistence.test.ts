/**
 * Unit Tests for Checkout Session Persistence
 * Tests critical checkout data persistence to cookies
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCheckoutSessionStore } from '~/stores/checkout/session'
import { cookieStorage } from '../../setup/vitest.setup'
import type { ShippingInformation, PaymentMethod, OrderData } from '~/types/checkout'

// Mock checkout data
const mockShippingInfo: ShippingInformation = {
  address: {
    firstName: 'John',
    lastName: 'Doe',
    street: '123 Main St',
    city: 'Test City',
    postalCode: '12345',
    country: 'US',
    phone: '+1234567890'
  },
  method: {
    id: 'standard',
    name: 'Standard Shipping',
    description: '5-7 business days',
    price: 9.99,
    estimatedDays: 7
  }
}

const mockPaymentMethod: PaymentMethod = {
  type: 'credit_card',
  card: {
    number: '4242424242424242',
    cvc: '123',
    expMonth: 12,
    expYear: 2025
  }
}

const mockOrderData: OrderData = {
  orderId: 'order-123',
  orderNumber: 'ORD-2024-001',
  items: [],
  subtotal: 99.99,
  shippingCost: 9.99,
  tax: 10.00,
  total: 119.98,
  currency: 'USD',
  customerEmail: 'test@example.com'
}

describe('Checkout Session Persistence', () => {
  beforeEach(() => {
    // Clear cookie storage using Map.clear()
    cookieStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Persist Checkout Data (CRITICAL)', () => {
    it('should persist shipping and payment info to cookie', () => {
      const session = useCheckoutSessionStore()

      session.persist({
        shippingInfo: mockShippingInfo,
        paymentMethod: mockPaymentMethod
      })

      const cookieValue = cookieStorage.get('checkout_session')
      expect(cookieValue).toBeDefined()
      expect(cookieValue.shippingInfo).toEqual(mockShippingInfo)
      expect(cookieValue.paymentMethod).toBeDefined()
    })

    it('should include session metadata in persisted data', () => {
      const session = useCheckoutSessionStore()
      session.setSessionId('session-123')
      session.setCurrentStep('payment')

      session.persist({
        shippingInfo: mockShippingInfo,
        paymentMethod: mockPaymentMethod
      })

      expect(cookieStorage.get('checkout_session').sessionId).toBe('session-123')
      expect(cookieStorage.get('checkout_session').currentStep).toBe('payment')
      expect(cookieStorage.get('checkout_session').lastSyncAt).toBeInstanceOf(Date)
    })

    it('should persist order data for confirmation page', () => {
      const session = useCheckoutSessionStore()
      session.setOrderData(mockOrderData)

      session.persist({
        shippingInfo: mockShippingInfo,
        paymentMethod: null
      })

      expect(cookieStorage.get('checkout_session').orderData).toEqual(mockOrderData)
    })

    it('should persist guest info', () => {
      const session = useCheckoutSessionStore()
      session.setGuestInfo({
        email: 'guest@example.com',
        emailUpdates: true
      })

      session.persist({
        shippingInfo: mockShippingInfo,
        paymentMethod: null
      })

      expect(cookieStorage.get('checkout_session').guestInfo).toEqual({
        email: 'guest@example.com',
        emailUpdates: true
      })
    })
  })

  describe('Payment Method Sanitization (SECURITY CRITICAL)', () => {
    it('should NOT persist sensitive card data', () => {
      const session = useCheckoutSessionStore()

      session.persist({
        shippingInfo: mockShippingInfo,
        paymentMethod: mockPaymentMethod
      })

      // Card data should be removed
      expect(cookieStorage.get('checkout_session').paymentMethod.card).toBeUndefined()
      expect(cookieStorage.get('checkout_session').paymentMethod.type).toBe('credit_card')
    })

    it('should preserve non-sensitive payment data', () => {
      const session = useCheckoutSessionStore()
      const cashPayment: PaymentMethod = {
        type: 'cash',
        cash: {
          confirmed: true
        }
      }

      session.persist({
        shippingInfo: mockShippingInfo,
        paymentMethod: cashPayment
      })

      expect(cookieStorage.get('checkout_session').paymentMethod.type).toBe('cash')
      expect(cookieStorage.get('checkout_session').paymentMethod.cash).toEqual({ confirmed: true })
    })

    it('should preserve saveForFuture flag', () => {
      const session = useCheckoutSessionStore()
      const paymentWithSave: PaymentMethod = {
        type: 'credit_card',
        saveForFuture: true
      }

      session.persist({
        shippingInfo: null,
        paymentMethod: paymentWithSave
      })

      expect(cookieStorage.get('checkout_session').paymentMethod.saveForFuture).toBe(true)
    })
  })

  describe('Restore Checkout Data (CRITICAL)', () => {
    it('should restore shipping and payment info from cookie', () => {
      cookieStorage.set('checkout_session', {
        sessionId: 'session-456',
        currentStep: 'review',
        shippingInfo: mockShippingInfo,
        paymentMethod: { type: 'cash' },
        guestInfo: { email: 'guest@test.com', emailUpdates: false },
        orderData: null,
        sessionExpiresAt: new Date(Date.now() + 3600000).toISOString(),
        lastSyncAt: new Date().toISOString(),
        termsAccepted: true,
        privacyAccepted: true,
        marketingConsent: false
      })

      const session = useCheckoutSessionStore()
      const restored = session.restore()

      expect(restored).toBeDefined()
      expect(restored?.shippingInfo).toEqual(mockShippingInfo)
      expect(restored?.paymentMethod?.type).toBe('cash')
      expect(session.sessionId).toBe('session-456')
      expect(session.currentStep).toBe('review')
    })

    it('should return null for empty cookie', () => {
      cookieStorage.set('checkout_session', null)

      const session = useCheckoutSessionStore()
      const restored = session.restore()

      expect(restored).toBeNull()
    })

    it('should clear expired sessions', () => {
      cookieStorage.set('checkout_session', {
        sessionId: 'expired-session',
        currentStep: 'payment',
        sessionExpiresAt: new Date(Date.now() - 1000).toISOString(), // Expired
        shippingInfo: mockShippingInfo,
        paymentMethod: null
      })

      const session = useCheckoutSessionStore()
      const restored = session.restore()

      expect(restored).toBeNull()
      expect(cookieStorage.get('checkout_session')).toBeUndefined() // Should clear cookie (Map returns undefined)
    })

    it('should convert ISO date strings back to Date objects', () => {
      const expiryDate = new Date(Date.now() + 3600000)
      const syncDate = new Date()

      cookieStorage.set('checkout_session', {
        sessionId: 'session-789',
        currentStep: 'shipping',
        sessionExpiresAt: expiryDate.toISOString(),
        lastSyncAt: syncDate.toISOString(),
        shippingInfo: null,
        paymentMethod: null
      })

      const session = useCheckoutSessionStore()
      session.restore()

      expect(session.sessionExpiresAt).toBeInstanceOf(Date)
      expect(session.lastSyncAt).toBeInstanceOf(Date)
    })
  })

  describe('Error Handling', () => {
    it('should handle corrupt cookie data gracefully', () => {
      // Set invalid data that might cause issues during restoration
      const invalidSnapshot = {
        sessionId: 'test',
        currentStep: 'invalid-step',
        // Data that exists but might be problematic
        shippingInfo: null,
        paymentMethod: null
      }
      cookieStorage.set('checkout_session', invalidSnapshot)

      const session = useCheckoutSessionStore()
      // Should not throw and handle gracefully
      expect(() => {
        session.restore()
      }).not.toThrow()
    })

    it('should handle missing cookie gracefully', () => {
      // Ensure no checkout_session cookie exists
      cookieStorage.delete('checkout_session')

      const session = useCheckoutSessionStore()
      const restored = session.restore()

      // Should return null when no cookie exists
      expect(restored).toBeNull()
    })
  })

  describe('Storage Management', () => {
    it('should clear storage on demand', () => {
      cookieStorage.set('checkout_session', {
        sessionId: 'test',
        shippingInfo: mockShippingInfo
      })

      const session = useCheckoutSessionStore()
      session.clearStorage()

      expect(cookieStorage.get('checkout_session')).toBeUndefined()
    })

    it('should reset session and clear storage', () => {
      const session = useCheckoutSessionStore()
      session.setSessionId('test-session')
      session.setCurrentStep('review')
      session.setGuestInfo({ email: 'test@test.com', emailUpdates: false })

      cookieStorage.set('checkout_session', { sessionId: 'test-session' })

      session.reset()

      expect(session.sessionId).toBeNull()
      expect(session.currentStep).toBe('shipping')
      expect(session.guestInfo).toBeNull()
      expect(cookieStorage.get('checkout_session')).toBeUndefined()
    })
  })

  describe('Cookie Configuration', () => {
    it('should use centralized cookie configuration', () => {
      const session = useCheckoutSessionStore()

      session.persist({
        shippingInfo: mockShippingInfo,
        paymentMethod: null
      })

      // Verify useCookie was called with correct name
      expect(vi.mocked(global.useCookie)).toHaveBeenCalledWith(
        'checkout_session',
        expect.objectContaining({
          maxAge: expect.any(Number),
          sameSite: 'lax'
        })
      )
    })
  })

  describe('Guest Checkout Flow', () => {
    it('should persist complete guest checkout session', () => {
      const session = useCheckoutSessionStore()

      session.setGuestInfo({
        email: 'guest@example.com',
        emailUpdates: true
      })

      session.setOrderData(mockOrderData)

      session.persist({
        shippingInfo: mockShippingInfo,
        paymentMethod: { type: 'cash' }
      })

      expect(cookieStorage.get('checkout_session').guestInfo.email).toBe('guest@example.com')
      expect(cookieStorage.get('checkout_session').orderData.orderId).toBe('order-123')
      expect(cookieStorage.get('checkout_session').shippingInfo).toEqual(mockShippingInfo)
    })

    it('should restore guest session for confirmation page', () => {
      cookieStorage.set('checkout_session', {
        sessionId: 'guest-session',
        currentStep: 'confirmation',
        guestInfo: {
          email: 'guest@example.com',
          emailUpdates: true
        },
        orderData: mockOrderData,
        shippingInfo: mockShippingInfo,
        paymentMethod: { type: 'cash' },
        termsAccepted: true,
        privacyAccepted: true
      })

      const session = useCheckoutSessionStore()
      session.restore()

      expect(session.guestInfo?.email).toBe('guest@example.com')
      expect(session.orderData?.orderId).toBe('order-123')
      expect(session.currentStep).toBe('confirmation')
    })
  })
})
