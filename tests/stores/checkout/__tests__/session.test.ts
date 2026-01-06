/**
 * Tests for checkout session store
 * @module tests/stores/checkout/session
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCheckoutSessionStore } from '~/stores/checkout/session'
import type { CheckoutStep, GuestInfo, OrderData, ShippingInformation, PaymentMethod, ShippingMethod, SavedPaymentMethod, Address, CheckoutError } from '~/types/checkout'
import { cookieStorage, resetCookieSaveCount, getCookieSaveCount } from '~/tests/setup/vitest.setup'

// Mock data factories
function createMockAddress(overrides: Partial<Address> = {}): Address {
  return {
    id: 1,
    userId: 'user-123',
    type: 'shipping',
    firstName: 'John',
    lastName: 'Doe',
    street: '123 Main St',
    city: 'Madrid',
    postalCode: '28001',
    country: 'ES',
    isDefault: true,
    ...overrides,
  }
}

function createMockShippingMethod(overrides: Partial<ShippingMethod> = {}): ShippingMethod {
  return {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'Delivery in 3-5 days',
    price: 5.99,
    estimatedDays: 4,
    ...overrides,
  }
}

function createMockShippingInfo(overrides: Partial<ShippingInformation> = {}): ShippingInformation {
  return {
    address: createMockAddress(),
    method: createMockShippingMethod(),
    ...overrides,
  }
}

function createMockPaymentMethod(overrides: Partial<PaymentMethod> = {}): PaymentMethod {
  return {
    type: 'credit_card',
    creditCard: {
      number: '4111111111111111',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      holderName: 'John Doe',
    },
    ...overrides,
  }
}

function createMockOrderData(overrides: Partial<OrderData> = {}): OrderData {
  return {
    subtotal: 100,
    shippingCost: 5.99,
    tax: 21,
    total: 126.99,
    currency: 'EUR',
    items: [
      {
        productId: 1,
        productSnapshot: { name: 'Test Product', price: 100 },
        quantity: 1,
        price: 100,
        total: 100,
      },
    ],
    ...overrides,
  }
}

function createMockGuestInfo(overrides: Partial<GuestInfo> = {}): GuestInfo {
  return {
    email: 'guest@example.com',
    emailUpdates: false,
    ...overrides,
  }
}

describe('Checkout Session Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    cookieStorage.clear()
    resetCookieSaveCount()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cookieStorage.clear()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = useCheckoutSessionStore()

      expect(store.currentStep).toBe('shipping')
      expect(store.sessionId).toBeNull()
      expect(store.guestInfo).toBeNull()
      expect(store.contactEmail).toBeNull()
      expect(store.shippingInfo).toBeNull()
      expect(store.paymentMethod).toBeNull()
      expect(store.orderData).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.processing).toBe(false)
      expect(store.errors).toEqual({})
      expect(store.lastError).toBeNull()
      expect(store.paymentIntent).toBeNull()
      expect(store.paymentClientSecret).toBeNull()
      expect(store.sessionExpiresAt).toBeNull()
      expect(store.lastSyncAt).toBeNull()
      expect(store.validationErrors).toEqual({})
      expect(store.isValid).toBe(false)
      expect(store.savedAddresses).toEqual([])
      expect(store.savedPaymentMethods).toEqual([])
      expect(store.availableShippingMethods).toEqual([])
      expect(store.termsAccepted).toBe(false)
      expect(store.privacyAccepted).toBe(false)
      expect(store.marketingConsent).toBe(false)
      expect(store.dataPrefetched).toBe(false)
      expect(store.preferences).toBeNull()
    })

    it('should have available countries set', () => {
      const store = useCheckoutSessionStore()
      expect(store.availableCountries).toEqual(['ES', 'RO', 'MD', 'FR', 'DE', 'IT'])
    })
  })

  describe('Computed Properties', () => {
    it('should calculate currentStepIndex correctly', () => {
      const store = useCheckoutSessionStore()

      expect(store.currentStepIndex).toBe(0) // shipping

      store.setCurrentStep('payment')
      expect(store.currentStepIndex).toBe(1)

      store.setCurrentStep('review')
      expect(store.currentStepIndex).toBe(2)

      store.setCurrentStep('confirmation')
      expect(store.currentStepIndex).toBe(3)
    })

    it('should detect expired session', () => {
      const store = useCheckoutSessionStore()

      expect(store.isSessionExpired).toBe(false)

      // Set expiry to past
      store.setSessionExpiry(new Date(Date.now() - 1000))
      expect(store.isSessionExpired).toBe(true)

      // Set expiry to future
      store.setSessionExpiry(new Date(Date.now() + 60000))
      expect(store.isSessionExpired).toBe(false)
    })
  })

  describe('Step Management', () => {
    it('should set current step', () => {
      const store = useCheckoutSessionStore()

      const steps: CheckoutStep[] = ['shipping', 'payment', 'review', 'confirmation']
      for (const step of steps) {
        store.setCurrentStep(step)
        expect(store.currentStep).toBe(step)
      }
    })
  })

  describe('Guest Info Management', () => {
    it('should set guest info and update contact email', () => {
      const store = useCheckoutSessionStore()
      const guestInfo = createMockGuestInfo()

      store.setGuestInfo(guestInfo)

      expect(store.guestInfo).toEqual(guestInfo)
      expect(store.contactEmail).toBe(guestInfo.email)
    })

    it('should trim email when setting guest info', () => {
      const store = useCheckoutSessionStore()

      store.setGuestInfo({ email: '  test@example.com  ', emailUpdates: true })

      expect(store.guestInfo?.email).toBe('test@example.com')
      expect(store.contactEmail).toBe('test@example.com')
    })

    it('should update order data email when setting contact email', () => {
      const store = useCheckoutSessionStore()

      store.setOrderData(createMockOrderData())
      store.setContactEmail('new@example.com')

      expect(store.orderData?.customerEmail).toBe('new@example.com')
    })
  })

  describe('Order Data Management', () => {
    it('should set order data', () => {
      const store = useCheckoutSessionStore()
      const orderData = createMockOrderData()

      store.setOrderData(orderData)

      expect(store.orderData).toEqual(orderData)
    })

    it('should allow null order data', () => {
      const store = useCheckoutSessionStore()

      store.setOrderData(createMockOrderData())
      store.setOrderData(null)

      expect(store.orderData).toBeNull()
    })
  })

  describe('Shipping Info Management', () => {
    it('should set shipping info', () => {
      const store = useCheckoutSessionStore()
      const shippingInfo = createMockShippingInfo()

      store.setShippingInfo(shippingInfo)

      expect(store.shippingInfo).toEqual(shippingInfo)
    })

    it('should allow null shipping info', () => {
      const store = useCheckoutSessionStore()

      store.setShippingInfo(createMockShippingInfo())
      store.setShippingInfo(null)

      expect(store.shippingInfo).toBeNull()
    })
  })

  describe('Payment Method Management', () => {
    it('should set payment method', () => {
      const store = useCheckoutSessionStore()
      const paymentMethod = createMockPaymentMethod()

      store.setPaymentMethodState(paymentMethod)

      expect(store.paymentMethod).toEqual(paymentMethod)
    })

    it('should handle different payment types', () => {
      const store = useCheckoutSessionStore()

      // Cash
      store.setPaymentMethodState({ type: 'cash', cash: { confirmed: true } })
      expect(store.paymentMethod?.type).toBe('cash')

      // PayPal
      store.setPaymentMethodState({ type: 'paypal', paypal: { email: 'test@paypal.com' } })
      expect(store.paymentMethod?.type).toBe('paypal')

      // Bank transfer
      store.setPaymentMethodState({ type: 'bank_transfer', bankTransfer: { reference: 'REF123' } })
      expect(store.paymentMethod?.type).toBe('bank_transfer')
    })
  })

  describe('Shipping Methods Management', () => {
    it('should set available shipping methods', () => {
      const store = useCheckoutSessionStore()
      const methods: ShippingMethod[] = [
        createMockShippingMethod({ id: 'standard' }),
        createMockShippingMethod({ id: 'express', name: 'Express', price: 12.99 }),
      ]

      store.setAvailableShippingMethods(methods)

      expect(store.availableShippingMethods).toEqual(methods)
      expect(store.availableShippingMethods).toHaveLength(2)
    })
  })

  describe('Saved Payment Methods Management', () => {
    it('should set saved payment methods', () => {
      const store = useCheckoutSessionStore()
      const methods: SavedPaymentMethod[] = [
        { id: '1', type: 'credit_card', lastFour: '4242', brand: 'visa', isDefault: true },
        { id: '2', type: 'paypal', isDefault: false },
      ]

      store.setSavedPaymentMethods(methods)

      expect(store.savedPaymentMethods).toEqual(methods)
    })
  })

  describe('Saved Addresses Management', () => {
    it('should set saved addresses', () => {
      const store = useCheckoutSessionStore()
      const addresses = [
        createMockAddress({ id: 1 }),
        createMockAddress({ id: 2, isDefault: false }),
      ]

      store.setSavedAddresses(addresses)

      expect(store.savedAddresses).toEqual(addresses)
    })
  })

  describe('Session ID Management', () => {
    it('should generate unique session IDs', () => {
      const store = useCheckoutSessionStore()

      const id1 = store.generateSessionId()
      const id2 = store.generateSessionId()

      expect(id1).toMatch(/^checkout_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^checkout_\d+_[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })

    it('should set session ID', () => {
      const store = useCheckoutSessionStore()

      store.setSessionId('test-session-123')
      expect(store.sessionId).toBe('test-session-123')

      store.setSessionId(null)
      expect(store.sessionId).toBeNull()
    })
  })

  describe('Loading and Processing States', () => {
    it('should set loading state', () => {
      const store = useCheckoutSessionStore()

      store.setLoading(true)
      expect(store.loading).toBe(true)

      store.setLoading(false)
      expect(store.loading).toBe(false)
    })

    it('should set processing state', () => {
      const store = useCheckoutSessionStore()

      store.setProcessing(true)
      expect(store.processing).toBe(true)

      store.setProcessing(false)
      expect(store.processing).toBe(false)
    })
  })

  describe('Session Timing', () => {
    it('should set session expiry', () => {
      const store = useCheckoutSessionStore()
      const expiry = new Date(Date.now() + 30 * 60 * 1000)

      store.setSessionExpiry(expiry)

      expect(store.sessionExpiresAt).toEqual(expiry)
    })

    it('should set last sync timestamp', () => {
      const store = useCheckoutSessionStore()
      const syncTime = new Date()

      store.setLastSyncAt(syncTime)

      expect(store.lastSyncAt).toEqual(syncTime)
    })
  })

  describe('Validation Errors', () => {
    it('should set validation errors for a field', () => {
      const store = useCheckoutSessionStore()

      store.setValidationErrors('shipping', ['Address is required', 'City is required'])

      expect(store.validationErrors.shipping).toEqual(['Address is required', 'City is required'])
    })

    it('should clear all validation errors', () => {
      const store = useCheckoutSessionStore()

      store.setValidationErrors('shipping', ['Error 1'])
      store.setValidationErrors('payment', ['Error 2'])
      store.clearValidationErrors()

      expect(store.validationErrors).toEqual({})
    })

    it('should clear specific field errors', () => {
      const store = useCheckoutSessionStore()

      store.setValidationErrors('shipping', ['Error 1'])
      store.setValidationErrors('payment', ['Error 2'])
      store.clearFieldErrors('shipping')

      expect(store.validationErrors.shipping).toBeUndefined()
      expect(store.validationErrors.payment).toEqual(['Error 2'])
    })

    it('should handle clearing non-existent field errors gracefully', () => {
      // Create fresh store and clear any existing errors
      const store = useCheckoutSessionStore()
      store.clearValidationErrors()

      // Now should have no errors
      expect(store.validationErrors).toEqual({})

      // Clearing non-existent field should not throw
      store.clearFieldErrors('nonexistent')

      // Should still be empty
      expect(store.validationErrors).toEqual({})
    })
  })

  describe('Error Handling', () => {
    it('should handle checkout error', () => {
      const store = useCheckoutSessionStore()
      const error: CheckoutError = {
        type: 'validation',
        code: 'INVALID_ADDRESS',
        message: 'Invalid shipping address',
        field: 'shipping',
        retryable: true,
      }

      store.handleError(error)

      expect(store.lastError).toEqual(error)
      expect(store.errors.shipping).toBe('Invalid shipping address')
    })

    it('should handle error without field', () => {
      const store = useCheckoutSessionStore()
      const error: CheckoutError = {
        type: 'system',
        code: 'SYSTEM_ERROR',
        message: 'Something went wrong',
        retryable: false,
      }

      store.handleError(error)

      expect(store.errors.general).toBe('Something went wrong')
    })

    it('should clear specific error', () => {
      const store = useCheckoutSessionStore()

      store.handleError({
        type: 'validation',
        code: 'E1',
        message: 'Error 1',
        field: 'shipping',
        retryable: true,
      })
      store.handleError({
        type: 'validation',
        code: 'E2',
        message: 'Error 2',
        field: 'payment',
        retryable: true,
      })

      store.clearError('shipping')

      expect(store.errors.shipping).toBeUndefined()
      expect(store.errors.payment).toBe('Error 2')
    })

    it('should clear all errors when no field specified', () => {
      const store = useCheckoutSessionStore()

      store.handleError({
        type: 'validation',
        code: 'E1',
        message: 'Error 1',
        field: 'shipping',
        retryable: true,
      })

      store.clearError()

      expect(store.errors).toEqual({})
      expect(store.lastError).toBeNull()
    })

    it('should retry last action if retryable', async () => {
      const store = useCheckoutSessionStore()

      store.handleError({
        type: 'network',
        code: 'NETWORK_ERROR',
        message: 'Network failed',
        field: 'shipping',
        retryable: true,
      })

      await store.retryLastAction()

      expect(store.errors.shipping).toBeUndefined()
    })
  })

  describe('Consent Management', () => {
    it('should set terms accepted', () => {
      const store = useCheckoutSessionStore()

      store.setTermsAccepted(true)
      expect(store.termsAccepted).toBe(true)

      store.setTermsAccepted(false)
      expect(store.termsAccepted).toBe(false)
    })

    it('should set privacy accepted', () => {
      const store = useCheckoutSessionStore()

      store.setPrivacyAccepted(true)
      expect(store.privacyAccepted).toBe(true)

      store.setPrivacyAccepted(false)
      expect(store.privacyAccepted).toBe(false)
    })

    it('should set marketing consent', () => {
      const store = useCheckoutSessionStore()

      store.setMarketingConsent(true)
      expect(store.marketingConsent).toBe(true)

      store.setMarketingConsent(false)
      expect(store.marketingConsent).toBe(false)
    })
  })

  describe('Data Prefetch', () => {
    it('should set data prefetched flag', () => {
      const store = useCheckoutSessionStore()

      store.setDataPrefetched(true)
      expect(store.dataPrefetched).toBe(true)
    })

    it('should set preferences', () => {
      const store = useCheckoutSessionStore()
      const preferences = {
        user_id: 'user-123',
        preferred_shipping_method: 'express',
        updated_at: '2024-01-01T00:00:00Z',
      }

      store.setPreferences(preferences)

      expect(store.preferences).toEqual(preferences)
    })
  })

  describe('Payment Intent', () => {
    it('should set payment intent', () => {
      const store = useCheckoutSessionStore()

      store.setPaymentIntent('pi_123456')
      expect(store.paymentIntent).toBe('pi_123456')

      store.setPaymentIntent(null)
      expect(store.paymentIntent).toBeNull()
    })

    it('should set payment client secret', () => {
      const store = useCheckoutSessionStore()

      store.setPaymentClientSecret('secret_123')
      expect(store.paymentClientSecret).toBe('secret_123')

      store.setPaymentClientSecret(null)
      expect(store.paymentClientSecret).toBeNull()
    })
  })

  describe('Persistence', () => {
    it('should persist session to cookie', async () => {
      const store = useCheckoutSessionStore()

      store.setSessionId('test-session')
      store.setCurrentStep('payment')
      store.setTermsAccepted(true)

      await store.persist({
        shippingInfo: createMockShippingInfo(),
        paymentMethod: { type: 'cash', cash: { confirmed: true } },
      })

      expect(getCookieSaveCount()).toBeGreaterThan(0)
      expect(cookieStorage.has('checkout_session')).toBe(true)
    })

    it('should sanitize payment method before persisting (remove sensitive data)', async () => {
      const store = useCheckoutSessionStore()

      store.setSessionId('test-session')

      await store.persist({
        shippingInfo: createMockShippingInfo(),
        paymentMethod: createMockPaymentMethod(),
      })

      const saved = cookieStorage.get('checkout_session') as any
      // Credit card details should not be persisted
      expect(saved.paymentMethod?.creditCard).toBeUndefined()
      expect(saved.paymentMethod?.type).toBe('credit_card')
    })

    it('should restore session from cookie', async () => {
      const store = useCheckoutSessionStore()

      // Pre-populate cookie
      const sessionData = {
        sessionId: 'restored-session',
        currentStep: 'payment',
        guestInfo: { email: 'test@example.com', emailUpdates: true },
        contactEmail: 'test@example.com',
        orderData: createMockOrderData(),
        sessionExpiresAt: new Date(Date.now() + 60000),
        lastSyncAt: new Date(),
        termsAccepted: true,
        privacyAccepted: true,
        marketingConsent: false,
        shippingInfo: createMockShippingInfo(),
        paymentMethod: { type: 'cash' },
      }
      cookieStorage.set('checkout_session', sessionData)

      const result = store.restore()

      expect(result).not.toBeNull()
      expect(store.sessionId).toBe('restored-session')
      expect(store.currentStep).toBe('payment')
      expect(store.termsAccepted).toBe(true)
      expect(result?.shippingInfo).toBeDefined()
    })

    it('should return null when no cookie exists', () => {
      const store = useCheckoutSessionStore()

      const result = store.restore()

      expect(result).toBeNull()
    })

    it('should clear expired session on restore', () => {
      const store = useCheckoutSessionStore()

      // Pre-populate with expired session
      cookieStorage.set('checkout_session', {
        sessionId: 'expired-session',
        sessionExpiresAt: new Date(Date.now() - 1000).toISOString(),
        currentStep: 'payment',
      })

      const result = store.restore()

      expect(result).toBeNull()
      expect(cookieStorage.has('checkout_session')).toBe(false)
    })

    it('should clear storage', () => {
      const store = useCheckoutSessionStore()

      cookieStorage.set('checkout_session', { sessionId: 'test' })
      store.clearStorage()

      expect(cookieStorage.has('checkout_session')).toBe(false)
    })
  })

  describe('Reset', () => {
    it('should reset all state to initial values', () => {
      const store = useCheckoutSessionStore()

      // Set various state
      store.setSessionId('test-session')
      store.setCurrentStep('review')
      store.setGuestInfo(createMockGuestInfo())
      store.setShippingInfo(createMockShippingInfo())
      store.setPaymentMethodState(createMockPaymentMethod())
      store.setOrderData(createMockOrderData())
      store.setTermsAccepted(true)
      store.setPrivacyAccepted(true)
      store.setLoading(true)
      store.setProcessing(true)

      // Reset
      store.reset()

      // Verify initial state
      expect(store.sessionId).toBeNull()
      expect(store.currentStep).toBe('shipping')
      expect(store.guestInfo).toBeNull()
      expect(store.shippingInfo).toBeNull()
      expect(store.paymentMethod).toBeNull()
      expect(store.orderData).toBeNull()
      expect(store.termsAccepted).toBe(false)
      expect(store.privacyAccepted).toBe(false)
      expect(store.loading).toBe(false)
      expect(store.processing).toBe(false)
    })

    it('should clear cookie storage on reset', async () => {
      const store = useCheckoutSessionStore()

      await store.persist({
        shippingInfo: createMockShippingInfo(),
        paymentMethod: null,
      })
      store.reset()

      expect(cookieStorage.has('checkout_session')).toBe(false)
    })
  })
})
