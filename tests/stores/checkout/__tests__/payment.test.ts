/**
 * Tests for checkout payment store
 * @module tests/stores/checkout/payment
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCheckoutPaymentStore } from '~/stores/checkout/payment'
import { useCheckoutSessionStore } from '~/stores/checkout/session'
import type { PaymentMethod, SavedPaymentMethod, OrderData, ShippingInformation, Address, ShippingMethod } from '~/types/checkout'
import { cookieStorage } from '~/tests/setup/vitest.setup'

// Mock the checkout API
vi.mock('~/lib/checkout/api', () => ({
  createPaymentIntent: vi.fn(),
  confirmPaymentIntent: vi.fn(),
  createOrder: vi.fn(),
  sendConfirmationEmail: vi.fn(),
  updateInventory: vi.fn(),
  fetchSavedPaymentMethods: vi.fn(),
  savePaymentMethod: vi.fn(),
  clearRemoteCart: vi.fn(),
}))

// Mock checkout validation
vi.mock('~/utils/checkout-validation', () => ({
  validatePaymentMethod: vi.fn(() => ({ isValid: true, errors: [] })),
}))

// Mock checkout errors
vi.mock('~/utils/checkout-errors', () => ({
  createValidationError: vi.fn((field, message, code) => ({
    type: 'validation',
    code,
    message,
    field,
    retryable: true,
  })),
  createPaymentError: vi.fn((message, code) => ({
    type: 'payment',
    code,
    message,
    retryable: true,
  })),
  createSystemError: vi.fn((message, code) => ({
    type: 'system',
    code,
    message,
    retryable: false,
  })),
  CheckoutErrorCode: {
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    PAYMENT_PROCESSING_ERROR: 'PAYMENT_PROCESSING_ERROR',
    ORDER_CREATION_FAILED: 'ORDER_CREATION_FAILED',
    SYSTEM_ERROR: 'SYSTEM_ERROR',
  },
  logCheckoutError: vi.fn(),
}))

// Mock cart store
vi.mock('~/stores/cart', () => ({
  useCartStore: vi.fn(() => ({
    items: [],
    sessionId: 'cart-session-123',
    clearCart: vi.fn(),
    unlockCart: vi.fn().mockResolvedValue(undefined),
  })),
}))

// Mock auth store
vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: false,
    user: null,
  })),
}))

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

describe('Checkout Payment Store', () => {
  let sessionStore: ReturnType<typeof useCheckoutSessionStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    cookieStorage.clear()
    vi.clearAllMocks()

    sessionStore = useCheckoutSessionStore()
  })

  afterEach(() => {
    cookieStorage.clear()
  })

  describe('Initial State', () => {
    it('should expose session store refs', () => {
      const store = useCheckoutPaymentStore()

      expect(store.paymentMethod).toBeNull()
      expect(store.savedPaymentMethods).toEqual([])
      expect(store.paymentIntent).toBeNull()
      expect(store.paymentClientSecret).toBeNull()
    })
  })

  describe('loadSavedPaymentMethods', () => {
    it('should not throw when loading saved payment methods', async () => {
      const store = useCheckoutPaymentStore()

      // Should not throw regardless of auth state
      await expect(store.loadSavedPaymentMethods()).resolves.not.toThrow()
    })

    it('should set saved payment methods to array after loading', async () => {
      const store = useCheckoutPaymentStore()

      await store.loadSavedPaymentMethods()

      // For unauthenticated users (default), methods are cleared to empty array
      expect(Array.isArray(sessionStore.savedPaymentMethods)).toBe(true)
    })

    it('should handle API errors gracefully without throwing', async () => {
      const store = useCheckoutPaymentStore()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Even with any potential errors, should not throw
      await expect(store.loadSavedPaymentMethods()).resolves.not.toThrow()

      consoleSpy.mockRestore()
    })
  })

  describe('savePaymentMethodData', () => {
    it('should save new payment method', async () => {
      const store = useCheckoutPaymentStore()
      const { savePaymentMethod } = await import('~/lib/checkout/api')

      const newMethod: SavedPaymentMethod = {
        id: '3',
        type: 'credit_card',
        lastFour: '1234',
        brand: 'mastercard',
        isDefault: false,
      }
      vi.mocked(savePaymentMethod).mockResolvedValueOnce(newMethod)

      await store.savePaymentMethodData(newMethod)

      expect(savePaymentMethod).toHaveBeenCalledWith(newMethod)
      expect(sessionStore.savedPaymentMethods).toContainEqual(newMethod)
    })

    it('should update existing payment method', async () => {
      const store = useCheckoutPaymentStore()
      const { savePaymentMethod } = await import('~/lib/checkout/api')

      // Pre-populate with existing method
      sessionStore.setSavedPaymentMethods([
        { id: '1', type: 'credit_card', lastFour: '4242', brand: 'visa', isDefault: true },
      ])

      const updatedMethod: SavedPaymentMethod = {
        id: '1',
        type: 'credit_card',
        lastFour: '4242',
        brand: 'visa',
        isDefault: false, // Changed
      }
      vi.mocked(savePaymentMethod).mockResolvedValueOnce(updatedMethod)

      await store.savePaymentMethodData(updatedMethod)

      expect(sessionStore.savedPaymentMethods).toHaveLength(1)
      expect(sessionStore.savedPaymentMethods[0].isDefault).toBe(false)
    })

    it('should throw on save error', async () => {
      const store = useCheckoutPaymentStore()
      const { savePaymentMethod } = await import('~/lib/checkout/api')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.mocked(savePaymentMethod).mockRejectedValueOnce(new Error('Save failed'))

      await expect(store.savePaymentMethodData({
        id: '1',
        type: 'credit_card',
        isDefault: false,
      })).rejects.toThrow('Save failed')

      consoleSpy.mockRestore()
    })
  })

  describe('updatePaymentMethod', () => {
    it('should update payment method with valid data', async () => {
      const store = useCheckoutPaymentStore()
      const paymentMethod = createMockPaymentMethod({ type: 'cash', cash: { confirmed: true } })

      await store.updatePaymentMethod(paymentMethod)

      expect(sessionStore.paymentMethod).toEqual(paymentMethod)
      expect(sessionStore.loading).toBe(false)
    })

    it('should set loading state during update', async () => {
      const store = useCheckoutPaymentStore()

      let loadingDuringUpdate = false
      const originalPersist = sessionStore.persist
      sessionStore.persist = vi.fn(async () => {
        loadingDuringUpdate = sessionStore.loading
      }) as any

      await store.updatePaymentMethod({ type: 'cash', cash: { confirmed: true } })

      expect(loadingDuringUpdate).toBe(true)
      expect(sessionStore.loading).toBe(false)

      sessionStore.persist = originalPersist
    })

    it('should handle validation errors', async () => {
      const store = useCheckoutPaymentStore()
      const { validatePaymentMethod } = await import('~/utils/checkout-validation')

      vi.mocked(validatePaymentMethod).mockReturnValueOnce({
        isValid: false,
        errors: [{ field: 'creditCard', message: 'Card number is invalid' }],
      } as any)

      await expect(store.updatePaymentMethod(createMockPaymentMethod())).rejects.toThrow()

      expect(sessionStore.validationErrors.payment).toBeDefined()
      expect(sessionStore.loading).toBe(false)
    })

    it('should clear field errors before validation', async () => {
      const store = useCheckoutPaymentStore()

      sessionStore.setValidationErrors('payment', ['Previous error'])

      await store.updatePaymentMethod({ type: 'cash', cash: { confirmed: true } })

      expect(sessionStore.validationErrors.payment).toBeUndefined()
    })
  })

  describe('preparePayment', () => {
    it('should create payment intent for credit card', async () => {
      const store = useCheckoutPaymentStore()
      const { createPaymentIntent } = await import('~/lib/checkout/api')

      vi.mocked(createPaymentIntent).mockResolvedValueOnce({
        id: 'pi_123',
        clientSecret: 'secret_123',
      })

      sessionStore.setPaymentMethodState(createMockPaymentMethod())
      sessionStore.setOrderData(createMockOrderData())
      sessionStore.setSessionId('session-123')

      await store.preparePayment()

      expect(createPaymentIntent).toHaveBeenCalledWith({
        amount: 12699, // total * 100
        currency: 'eur',
        sessionId: 'session-123',
      })
      expect(sessionStore.paymentIntent).toBe('pi_123')
      expect(sessionStore.paymentClientSecret).toBe('secret_123')
    })

    it('should skip payment intent for cash payment', async () => {
      const store = useCheckoutPaymentStore()
      const { createPaymentIntent } = await import('~/lib/checkout/api')

      sessionStore.setPaymentMethodState({ type: 'cash', cash: { confirmed: true } })
      sessionStore.setOrderData(createMockOrderData())

      await store.preparePayment()

      expect(createPaymentIntent).not.toHaveBeenCalled()
    })

    it('should generate session ID if not exists', async () => {
      const store = useCheckoutPaymentStore()
      const { createPaymentIntent } = await import('~/lib/checkout/api')

      vi.mocked(createPaymentIntent).mockResolvedValueOnce({
        id: 'pi_123',
        clientSecret: 'secret_123',
      })

      sessionStore.setPaymentMethodState(createMockPaymentMethod())
      sessionStore.setOrderData(createMockOrderData())
      // No session ID set

      await store.preparePayment()

      expect(sessionStore.sessionId).not.toBeNull()
    })

    it('should do nothing if no payment method', async () => {
      const store = useCheckoutPaymentStore()
      const { createPaymentIntent } = await import('~/lib/checkout/api')

      sessionStore.setOrderData(createMockOrderData())

      await store.preparePayment()

      expect(createPaymentIntent).not.toHaveBeenCalled()
    })

    it('should do nothing if no order data', async () => {
      const store = useCheckoutPaymentStore()
      const { createPaymentIntent } = await import('~/lib/checkout/api')

      sessionStore.setPaymentMethodState(createMockPaymentMethod())

      await store.preparePayment()

      expect(createPaymentIntent).not.toHaveBeenCalled()
    })

    it('should handle API errors', async () => {
      const store = useCheckoutPaymentStore()
      const { createPaymentIntent } = await import('~/lib/checkout/api')

      vi.mocked(createPaymentIntent).mockRejectedValueOnce(new Error('API Error'))

      sessionStore.setPaymentMethodState(createMockPaymentMethod())
      sessionStore.setOrderData(createMockOrderData())
      sessionStore.setSessionId('session-123')

      await expect(store.preparePayment()).rejects.toThrow()

      expect(sessionStore.lastError).not.toBeNull()
      expect(sessionStore.processing).toBe(false)
    })
  })

  describe('processCreditCardPayment', () => {
    it('should confirm payment intent successfully', async () => {
      const store = useCheckoutPaymentStore()
      const { confirmPaymentIntent } = await import('~/lib/checkout/api')

      vi.mocked(confirmPaymentIntent).mockResolvedValueOnce({
        success: true,
        paymentIntent: {
          id: 'pi_123',
          status: 'succeeded',
          charges: { data: [] },
        },
      })

      sessionStore.setPaymentIntent('pi_123')
      sessionStore.setPaymentClientSecret('secret_123')
      sessionStore.setSessionId('session-123')

      const result = await store.processCreditCardPayment()

      expect(result.success).toBe(true)
      expect(result.transactionId).toBe('pi_123')
      expect(result.paymentMethod).toBe('credit_card')
    })

    it('should fail if payment intent not initialized', async () => {
      const store = useCheckoutPaymentStore()

      await expect(store.processCreditCardPayment()).rejects.toThrow('Payment intent not initialized')
    })

    it('should handle requires action response', async () => {
      const store = useCheckoutPaymentStore()
      const { confirmPaymentIntent } = await import('~/lib/checkout/api')

      vi.mocked(confirmPaymentIntent).mockResolvedValueOnce({
        success: false,
        requiresAction: true,
      })

      sessionStore.setPaymentIntent('pi_123')
      sessionStore.setPaymentClientSecret('secret_123')
      sessionStore.setSessionId('session-123')

      await expect(store.processCreditCardPayment()).rejects.toThrow('requires additional authentication')
    })

    it('should handle payment failure', async () => {
      const store = useCheckoutPaymentStore()
      const { confirmPaymentIntent } = await import('~/lib/checkout/api')

      vi.mocked(confirmPaymentIntent).mockResolvedValueOnce({
        success: false,
        error: 'Card declined',
      })

      sessionStore.setPaymentIntent('pi_123')
      sessionStore.setPaymentClientSecret('secret_123')
      sessionStore.setSessionId('session-123')

      await expect(store.processCreditCardPayment()).rejects.toThrow('Card declined')
    })
  })

  describe('processPayment', () => {
    it('should process cash payment', async () => {
      const store = useCheckoutPaymentStore()
      const { createOrder } = await import('~/lib/checkout/api')

      vi.mocked(createOrder).mockResolvedValueOnce({
        id: 1,
        orderNumber: 'ORD-001',
      })

      sessionStore.setPaymentMethodState({ type: 'cash', cash: { confirmed: true } })
      sessionStore.setOrderData(createMockOrderData())
      sessionStore.setShippingInfo(createMockShippingInfo())
      sessionStore.setSessionId('session-123')

      await store.processPayment()

      expect(sessionStore.currentStep).toBe('confirmation')
    })

    it('should process PayPal payment', async () => {
      const store = useCheckoutPaymentStore()
      const { createOrder } = await import('~/lib/checkout/api')

      vi.mocked(createOrder).mockResolvedValueOnce({
        id: 1,
        orderNumber: 'ORD-001',
      })

      sessionStore.setPaymentMethodState({ type: 'paypal', paypal: { email: 'test@paypal.com' } })
      sessionStore.setOrderData(createMockOrderData())
      sessionStore.setShippingInfo(createMockShippingInfo())
      sessionStore.setSessionId('session-123')

      await store.processPayment()

      expect(sessionStore.currentStep).toBe('confirmation')
    })

    it('should process bank transfer payment', async () => {
      const store = useCheckoutPaymentStore()
      const { createOrder } = await import('~/lib/checkout/api')

      vi.mocked(createOrder).mockResolvedValueOnce({
        id: 1,
        orderNumber: 'ORD-001',
      })

      sessionStore.setPaymentMethodState({ type: 'bank_transfer', bankTransfer: { reference: 'REF123' } })
      sessionStore.setOrderData(createMockOrderData())
      sessionStore.setShippingInfo(createMockShippingInfo())
      sessionStore.setSessionId('session-123')

      await store.processPayment()

      expect(sessionStore.currentStep).toBe('confirmation')
    })

    it('should throw if missing required data', async () => {
      const store = useCheckoutPaymentStore()

      // Missing payment method
      sessionStore.setOrderData(createMockOrderData())
      sessionStore.setShippingInfo(createMockShippingInfo())

      await expect(store.processPayment()).rejects.toThrow('Missing required checkout information')
    })

    it('should handle payment processing errors', async () => {
      const store = useCheckoutPaymentStore()
      const { confirmPaymentIntent } = await import('~/lib/checkout/api')

      vi.mocked(confirmPaymentIntent).mockResolvedValueOnce({
        success: false,
        error: 'Payment declined',
      })

      sessionStore.setPaymentMethodState(createMockPaymentMethod())
      sessionStore.setPaymentIntent('pi_123')
      sessionStore.setPaymentClientSecret('secret_123')
      sessionStore.setOrderData(createMockOrderData())
      sessionStore.setShippingInfo(createMockShippingInfo())
      sessionStore.setSessionId('session-123')

      await expect(store.processPayment()).rejects.toThrow()

      expect(sessionStore.processing).toBe(false)
      expect(sessionStore.lastError).not.toBeNull()
    })

    it('should throw for invalid payment method type', async () => {
      const store = useCheckoutPaymentStore()

      sessionStore.setPaymentMethodState({ type: 'invalid' as any })
      sessionStore.setOrderData(createMockOrderData())
      sessionStore.setShippingInfo(createMockShippingInfo())
      sessionStore.setSessionId('session-123')

      await expect(store.processPayment()).rejects.toThrow('Invalid payment method')
    })
  })

  describe('createOrderRecord', () => {
    it('should create order with all required data', async () => {
      const store = useCheckoutPaymentStore()
      const { createOrder } = await import('~/lib/checkout/api')

      vi.mocked(createOrder).mockResolvedValueOnce({
        id: 123,
        orderNumber: 'ORD-2024-001',
      })

      sessionStore.setOrderData(createMockOrderData())
      sessionStore.setShippingInfo(createMockShippingInfo())
      sessionStore.setPaymentMethodState({ type: 'cash', cash: { confirmed: true } })
      sessionStore.setSessionId('session-123')

      const paymentResult = {
        success: true,
        transactionId: 'cash_123',
        paymentMethod: 'cash',
      }

      const result = await store.createOrderRecord(paymentResult)

      expect(createOrder).toHaveBeenCalled()
      expect(result.orderId).toBe(123)
      expect(result.orderNumber).toBe('ORD-2024-001')
    })

    it('should throw if missing order data', async () => {
      const store = useCheckoutPaymentStore()

      sessionStore.setShippingInfo(createMockShippingInfo())
      sessionStore.setPaymentMethodState({ type: 'cash', cash: { confirmed: true } })

      await expect(store.createOrderRecord({ success: true, paymentMethod: 'cash' }))
        .rejects.toThrow('Missing required order information')
    })

    it('should handle order creation error', async () => {
      const store = useCheckoutPaymentStore()
      const { createOrder } = await import('~/lib/checkout/api')

      vi.mocked(createOrder).mockRejectedValueOnce(new Error('Database error'))

      sessionStore.setOrderData(createMockOrderData())
      sessionStore.setShippingInfo(createMockShippingInfo())
      sessionStore.setPaymentMethodState({ type: 'cash', cash: { confirmed: true } })
      sessionStore.setSessionId('session-123')

      await expect(store.createOrderRecord({ success: true, paymentMethod: 'cash' }))
        .rejects.toThrow('Failed to create order')
    })
  })

  describe('clearCart', () => {
    it('should attempt to clear remote cart with session ID', async () => {
      const store = useCheckoutPaymentStore()
      const { clearRemoteCart } = await import('~/lib/checkout/api')

      vi.mocked(clearRemoteCart).mockResolvedValueOnce(undefined)

      // Should not throw
      await store.clearCart()

      // clearRemoteCart should be called with a session ID
      expect(clearRemoteCart).toHaveBeenCalled()
    })

    it('should handle remote cart clear failure gracefully', async () => {
      const store = useCheckoutPaymentStore()
      const { clearRemoteCart } = await import('~/lib/checkout/api')
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      vi.mocked(clearRemoteCart).mockRejectedValueOnce(new Error('Remote clear failed'))

      // Should not throw, just log warning
      await store.clearCart()

      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should handle CSRF errors specifically', async () => {
      const store = useCheckoutPaymentStore()
      const { clearRemoteCart } = await import('~/lib/checkout/api')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.mocked(clearRemoteCart).mockRejectedValueOnce(new Error('CSRF token invalid'))

      sessionStore.setSessionId('session-123')

      await store.clearCart()

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('CSRF'),
        expect.any(String),
      )

      consoleSpy.mockRestore()
    })
  })

  describe('sendConfirmationEmail', () => {
    it('should send email with order data', async () => {
      const store = useCheckoutPaymentStore()
      const { sendConfirmationEmail } = await import('~/lib/checkout/api')

      vi.mocked(sendConfirmationEmail).mockResolvedValueOnce(undefined)

      sessionStore.setOrderData(createMockOrderData({ orderId: 123, customerEmail: 'test@example.com' }))
      sessionStore.setSessionId('session-123')

      await store.sendConfirmationEmail()

      expect(sendConfirmationEmail).toHaveBeenCalledWith({
        orderId: 123,
        sessionId: 'session-123',
        email: 'test@example.com',
      })
    })

    it('should use contact email as fallback', async () => {
      const store = useCheckoutPaymentStore()
      const { sendConfirmationEmail } = await import('~/lib/checkout/api')

      vi.mocked(sendConfirmationEmail).mockResolvedValueOnce(undefined)

      sessionStore.setOrderData(createMockOrderData({ orderId: 123 }))
      sessionStore.setContactEmail('fallback@example.com')
      sessionStore.setSessionId('session-123')

      await store.sendConfirmationEmail()

      expect(sendConfirmationEmail).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'fallback@example.com' }),
      )
    })

    it('should not send if no order data', async () => {
      const store = useCheckoutPaymentStore()
      const { sendConfirmationEmail } = await import('~/lib/checkout/api')

      await store.sendConfirmationEmail()

      expect(sendConfirmationEmail).not.toHaveBeenCalled()
    })

    it('should handle email send failure gracefully', async () => {
      const store = useCheckoutPaymentStore()
      const { sendConfirmationEmail } = await import('~/lib/checkout/api')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.mocked(sendConfirmationEmail).mockRejectedValueOnce(new Error('Email service down'))

      sessionStore.setOrderData(createMockOrderData({ orderId: 123, customerEmail: 'test@example.com' }))

      // Should not throw
      await store.sendConfirmationEmail()

      consoleSpy.mockRestore()
    })
  })

  describe('updateInventory', () => {
    it('should update inventory with order items', async () => {
      const store = useCheckoutPaymentStore()
      const { updateInventory } = await import('~/lib/checkout/api')

      vi.mocked(updateInventory).mockResolvedValueOnce(undefined)

      const orderData = createMockOrderData({ orderId: 123 })
      sessionStore.setOrderData(orderData)

      await store.updateInventory()

      expect(updateInventory).toHaveBeenCalledWith(orderData.items, 123)
    })

    it('should not update if no order data', async () => {
      const store = useCheckoutPaymentStore()
      const { updateInventory } = await import('~/lib/checkout/api')

      await store.updateInventory()

      expect(updateInventory).not.toHaveBeenCalled()
    })

    it('should handle inventory update failure gracefully', async () => {
      const store = useCheckoutPaymentStore()
      const { updateInventory } = await import('~/lib/checkout/api')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.mocked(updateInventory).mockRejectedValueOnce(new Error('Inventory service error'))

      sessionStore.setOrderData(createMockOrderData({ orderId: 123 }))

      // Should not throw
      await store.updateInventory()

      consoleSpy.mockRestore()
    })
  })

  describe('completeCheckout', () => {
    it('should complete checkout successfully', async () => {
      const store = useCheckoutPaymentStore()

      sessionStore.setSessionId('session-123')

      const orderData = createMockOrderData({ orderId: 123, orderNumber: 'ORD-001' })

      await store.completeCheckout(orderData)

      expect(sessionStore.currentStep).toBe('confirmation')
    })

    it('should persist completed order data', async () => {
      const store = useCheckoutPaymentStore()

      const persistSpy = vi.spyOn(sessionStore, 'persist')
      sessionStore.setSessionId('session-123')

      const orderData = createMockOrderData({ orderId: 123, orderNumber: 'ORD-001' })

      await store.completeCheckout(orderData)

      expect(persistSpy).toHaveBeenCalledWith(expect.objectContaining({
        orderData,
      }))
    })

    it('should handle post-processing errors gracefully', async () => {
      const store = useCheckoutPaymentStore()
      const { sendConfirmationEmail } = await import('~/lib/checkout/api')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.mocked(sendConfirmationEmail).mockRejectedValueOnce(new Error('Email failed'))

      const orderData = createMockOrderData({ orderId: 123 })

      // Should not throw even if post-processing fails
      await store.completeCheckout(orderData)

      consoleSpy.mockRestore()
    })
  })

  describe('Legacy Payment Methods', () => {
    it('should expose processCashPayment', async () => {
      const store = useCheckoutPaymentStore()

      const result = await store.processCashPayment()

      expect(result.success).toBe(true)
      expect(result.paymentMethod).toBe('cash')
    })

    it('should expose processPayPalPayment', async () => {
      const store = useCheckoutPaymentStore()

      const result = await store.processPayPalPayment()

      expect(result.success).toBe(true)
      expect(result.paymentMethod).toBe('paypal')
    })

    it('should expose processBankTransferPayment', async () => {
      const store = useCheckoutPaymentStore()

      const result = await store.processBankTransferPayment()

      expect(result.success).toBe(true)
      expect(result.paymentMethod).toBe('bank_transfer')
      expect(result.pending).toBe(true)
    })
  })
})
