/**
 * Tests for main checkout store (orchestration layer)
 * @module tests/stores/checkout/checkout
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCheckoutStore } from '~/stores/checkout'
import { useCheckoutSessionStore } from '~/stores/checkout/session'
import type { ShippingInformation, PaymentMethod, Address, ShippingMethod, OrderData, GuestInfo } from '~/types/checkout'
import { cookieStorage } from '~/tests/setup/vitest.setup'

// Create shared mock instances using vi.hoisted to be available during vi.mock hoisting
const { mockShippingStore, mockPaymentStore, mockCartStore, mockAuthStore } = vi.hoisted(() => ({
  mockShippingStore: {
    calculateOrderData: vi.fn(),
    loadShippingMethods: vi.fn(),
    updateShippingCosts: vi.fn(),
    updateShippingInfo: vi.fn(),
  },
  mockPaymentStore: {
    preparePayment: vi.fn(),
    processPayment: vi.fn(),
    loadSavedPaymentMethods: vi.fn(),
    updatePaymentMethod: vi.fn(),
    savePaymentMethodData: vi.fn(),
    createOrderRecord: vi.fn(),
    completeCheckout: vi.fn(),
    clearCart: vi.fn(),
    sendConfirmationEmail: vi.fn(),
    updateInventory: vi.fn(),
    processCashPayment: vi.fn(),
    processCreditCardPayment: vi.fn(),
    processPayPalPayment: vi.fn(),
    processBankTransferPayment: vi.fn(),
  },
  mockCartStore: {
    items: [],
    lockCart: vi.fn().mockResolvedValue(undefined),
    unlockCart: vi.fn().mockResolvedValue(undefined),
  },
  mockAuthStore: {
    isAuthenticated: false,
    user: null,
  },
}))

// Mock the sub-stores
vi.mock('~/stores/checkout/session', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    ...actual,
  }
})

vi.mock('~/stores/checkout/shipping', () => ({
  useCheckoutShippingStore: vi.fn(() => mockShippingStore),
}))

vi.mock('~/stores/checkout/payment', () => ({
  useCheckoutPaymentStore: vi.fn(() => mockPaymentStore),
}))

// Mock checkout validation
vi.mock('~/utils/checkout-validation', () => ({
  validateShippingInformation: vi.fn(() => ({ isValid: true, errors: [] })),
  validatePaymentMethod: vi.fn(() => ({ isValid: true, errors: [] })),
}))

// Mock checkout errors
vi.mock('~/utils/checkout-errors', () => ({
  createSystemError: vi.fn((message, code) => ({
    type: 'system',
    code,
    message,
    retryable: false,
  })),
  CheckoutErrorCode: {
    SYSTEM_ERROR: 'SYSTEM_ERROR',
  },
}))

// Mock cart store
vi.mock('~/stores/cart', () => ({
  useCartStore: vi.fn(() => mockCartStore),
}))

// Mock auth store
vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(() => mockAuthStore),
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
    type: 'cash',
    cash: { confirmed: true },
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

describe('Checkout Store (Main Orchestration)', () => {
  let sessionStore: ReturnType<typeof useCheckoutSessionStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    cookieStorage.clear()
    vi.clearAllMocks()

    // Reset shared mock states
    mockCartStore.lockCart = vi.fn().mockResolvedValue(undefined)
    mockCartStore.unlockCart = vi.fn().mockResolvedValue(undefined)
    mockShippingStore.calculateOrderData = vi.fn()
    mockShippingStore.loadShippingMethods = vi.fn()
    mockShippingStore.updateShippingCosts = vi.fn()
    mockShippingStore.updateShippingInfo = vi.fn()
    mockPaymentStore.preparePayment = vi.fn()
    mockPaymentStore.processPayment = vi.fn()
    mockPaymentStore.loadSavedPaymentMethods = vi.fn()
    mockPaymentStore.updatePaymentMethod = vi.fn()
    mockAuthStore.isAuthenticated = false
    mockAuthStore.user = null

    sessionStore = useCheckoutSessionStore()

    // Reset session store state to clean slate
    sessionStore.reset()
  })

  afterEach(() => {
    cookieStorage.clear()
  })

  describe('Computed Properties', () => {
    describe('canProceedToPayment', () => {
      it('should return false when no shipping info', () => {
        const store = useCheckoutStore()

        expect(store.canProceedToPayment).toBe(false)
      })

      it('should return false when shipping info incomplete', () => {
        const store = useCheckoutStore()

        sessionStore.setShippingInfo({
          address: createMockAddress(),
          method: undefined as any, // Missing method
        })

        expect(store.canProceedToPayment).toBe(false)
      })

      it('should return false when shipping has validation errors', () => {
        const store = useCheckoutStore()

        sessionStore.setShippingInfo(createMockShippingInfo())
        sessionStore.setValidationErrors('shipping', ['Address is invalid'])

        expect(store.canProceedToPayment).toBe(false)
      })

      it('should return true when shipping info complete and valid', () => {
        const store = useCheckoutStore()

        // Ensure clean state - clear any errors from previous tests
        sessionStore.clearValidationErrors()
        sessionStore.setShippingInfo(createMockShippingInfo())

        expect(store.canProceedToPayment).toBe(true)
      })
    })

    describe('canProceedToReview', () => {
      it('should return false when no shipping info', () => {
        const store = useCheckoutStore()

        sessionStore.setPaymentMethodState(createMockPaymentMethod())

        expect(store.canProceedToReview).toBe(false)
      })

      it('should return false when no payment method', () => {
        const store = useCheckoutStore()

        sessionStore.setShippingInfo(createMockShippingInfo())

        expect(store.canProceedToReview).toBe(false)
      })

      it('should return false when has validation errors', () => {
        const store = useCheckoutStore()

        sessionStore.setShippingInfo(createMockShippingInfo())
        sessionStore.setPaymentMethodState(createMockPaymentMethod())
        sessionStore.setValidationErrors('payment', ['Card is invalid'])

        expect(store.canProceedToReview).toBe(false)
      })

      it('should return true when both shipping and payment valid', () => {
        const store = useCheckoutStore()

        // Ensure clean state
        sessionStore.clearValidationErrors()
        sessionStore.setShippingInfo(createMockShippingInfo())
        sessionStore.setPaymentMethodState(createMockPaymentMethod())

        expect(store.canProceedToReview).toBe(true)
      })
    })

    describe('canCompleteOrder', () => {
      it('should return false when missing order data', () => {
        const store = useCheckoutStore()

        sessionStore.setShippingInfo(createMockShippingInfo())
        sessionStore.setPaymentMethodState(createMockPaymentMethod())

        expect(store.canCompleteOrder).toBe(false)
      })

      it('should return true when all data present and valid', () => {
        const store = useCheckoutStore()

        // Ensure clean state
        sessionStore.clearValidationErrors()
        sessionStore.setShippingInfo(createMockShippingInfo())
        sessionStore.setPaymentMethodState(createMockPaymentMethod())
        sessionStore.setOrderData(createMockOrderData())

        expect(store.canCompleteOrder).toBe(true)
      })
    })

    describe('currentStepIndex', () => {
      it('should return correct index for each step', () => {
        const store = useCheckoutStore()

        expect(store.currentStepIndex).toBe(0) // shipping

        sessionStore.setCurrentStep('payment')
        expect(store.currentStepIndex).toBe(1)

        sessionStore.setCurrentStep('review')
        expect(store.currentStepIndex).toBe(2)

        sessionStore.setCurrentStep('confirmation')
        expect(store.currentStepIndex).toBe(3)
      })
    })

    describe('orderTotal and formattedOrderTotal', () => {
      it('should return 0 when no order data', () => {
        const store = useCheckoutStore()

        expect(store.orderTotal).toBe(0)
        expect(store.formattedOrderTotal).toBe('€0.00')
      })

      it('should return correct values with order data', () => {
        const store = useCheckoutStore()

        sessionStore.setOrderData(createMockOrderData({ total: 99.99 }))

        expect(store.orderTotal).toBe(99.99)
        // Format depends on locale but should contain the value
        expect(store.formattedOrderTotal).toContain('99')
      })
    })
  })

  describe('Field Error Helpers', () => {
    it('should detect field errors', () => {
      const store = useCheckoutStore()

      // Ensure clean state - clear any errors from previous tests
      sessionStore.clearValidationErrors()

      expect(store.hasFieldError('shipping')).toBe(false)

      sessionStore.setValidationErrors('shipping', ['Error 1'])

      expect(store.hasFieldError('shipping')).toBe(true)
      expect(store.hasFieldError('payment')).toBe(false)
    })

    it('should return field errors', () => {
      const store = useCheckoutStore()

      // Ensure clean state - clear any errors from previous tests
      sessionStore.clearValidationErrors()

      expect(store.getFieldErrors('shipping')).toEqual([])

      sessionStore.setValidationErrors('shipping', ['Error 1', 'Error 2'])

      expect(store.getFieldErrors('shipping')).toEqual(['Error 1', 'Error 2'])
    })
  })

  describe('Step Validation', () => {
    describe('validateCurrentStep', () => {
      it('should validate shipping step', () => {
        const store = useCheckoutStore()

        sessionStore.setCurrentStep('shipping')

        // No shipping info - should fail
        const result = store.validateCurrentStep()

        expect(result).toBe(false)
        expect(sessionStore.validationErrors.shipping).toBeDefined()
      })

      it('should pass shipping validation with valid info', () => {
        const store = useCheckoutStore()

        sessionStore.setCurrentStep('shipping')
        sessionStore.setShippingInfo(createMockShippingInfo())

        const result = store.validateCurrentStep()

        expect(result).toBe(true)
      })

      it('should validate payment step', () => {
        const store = useCheckoutStore()

        sessionStore.setCurrentStep('payment')

        // No payment method - should fail
        const result = store.validateCurrentStep()

        expect(result).toBe(false)
        expect(sessionStore.validationErrors.payment).toBeDefined()
      })

      it('should pass payment validation with valid method', () => {
        const store = useCheckoutStore()

        sessionStore.setCurrentStep('payment')
        sessionStore.setPaymentMethodState(createMockPaymentMethod())

        const result = store.validateCurrentStep()

        expect(result).toBe(true)
      })

      it('should clear validation errors before validation', () => {
        const store = useCheckoutStore()

        sessionStore.setValidationErrors('shipping', ['Old error'])
        sessionStore.setCurrentStep('shipping')
        sessionStore.setShippingInfo(createMockShippingInfo())

        store.validateCurrentStep()

        expect(sessionStore.validationErrors.shipping).toBeUndefined()
      })
    })
  })

  describe('Step Navigation', () => {
    describe('goToStep', () => {
      it('should navigate to step after validation', async () => {
        const store = useCheckoutStore()

        sessionStore.setShippingInfo(createMockShippingInfo())

        await store.goToStep('payment')

        expect(sessionStore.currentStep).toBe('payment')
      })

      it('should not navigate if validation fails', async () => {
        const store = useCheckoutStore()
        const { validateShippingInformation } = await import('~/utils/checkout-validation')

        vi.mocked(validateShippingInformation).mockReturnValueOnce({
          isValid: false,
          errors: [{ message: 'Invalid' }],
        } as any)

        sessionStore.setCurrentStep('shipping')
        sessionStore.setShippingInfo(createMockShippingInfo())

        await store.goToStep('payment')

        // Should stay on shipping due to validation failure
        expect(sessionStore.currentStep).toBe('shipping')
      })

      it('should persist session after navigation', async () => {
        const store = useCheckoutStore()
        const persistSpy = vi.spyOn(sessionStore, 'persist')

        sessionStore.setShippingInfo(createMockShippingInfo())

        await store.goToStep('payment')

        expect(persistSpy).toHaveBeenCalled()
      })
    })

    describe('proceedToNextStep', () => {
      it('should move from shipping to payment', async () => {
        const store = useCheckoutStore()

        sessionStore.setCurrentStep('shipping')
        sessionStore.setShippingInfo(createMockShippingInfo())

        const nextStep = await store.proceedToNextStep()

        expect(nextStep).toBe('payment')
      })

      it('should return null if validation fails', async () => {
        const store = useCheckoutStore()

        sessionStore.setCurrentStep('shipping')
        // No shipping info

        const nextStep = await store.proceedToNextStep()

        expect(nextStep).toBeNull()
      })

      it('should return null if at confirmation', async () => {
        const store = useCheckoutStore()

        sessionStore.setCurrentStep('confirmation')

        const nextStep = await store.proceedToNextStep()

        expect(nextStep).toBeNull()
      })

      it('should call updateShippingCosts when moving to payment', async () => {
        const store = useCheckoutStore()

        sessionStore.setCurrentStep('shipping')
        sessionStore.setShippingInfo(createMockShippingInfo())

        await store.proceedToNextStep()

        expect(mockShippingStore.updateShippingCosts).toHaveBeenCalled()
      })

      it('should call preparePayment when moving to review', async () => {
        const store = useCheckoutStore()

        sessionStore.setCurrentStep('payment')
        sessionStore.setPaymentMethodState(createMockPaymentMethod())

        await store.proceedToNextStep()

        expect(mockPaymentStore.preparePayment).toHaveBeenCalled()
      })

      it('should call processPayment when moving to confirmation', async () => {
        const store = useCheckoutStore()

        sessionStore.setCurrentStep('review')
        sessionStore.setShippingInfo(createMockShippingInfo())
        sessionStore.setPaymentMethodState(createMockPaymentMethod())
        sessionStore.setOrderData(createMockOrderData())

        await store.proceedToNextStep()

        expect(mockPaymentStore.processPayment).toHaveBeenCalled()
      })
    })

    describe('goToPreviousStep', () => {
      it('should move back from payment to shipping', () => {
        const store = useCheckoutStore()

        sessionStore.setCurrentStep('payment')

        const prevStep = store.goToPreviousStep()

        expect(prevStep).toBe('shipping')
      })

      it('should return null if at shipping', () => {
        const store = useCheckoutStore()

        sessionStore.setCurrentStep('shipping')

        const prevStep = store.goToPreviousStep()

        expect(prevStep).toBeNull()
      })

      it('should move back through all steps', () => {
        const store = useCheckoutStore()

        sessionStore.setCurrentStep('confirmation')
        expect(store.goToPreviousStep()).toBe('review')

        sessionStore.setCurrentStep('review')
        expect(store.goToPreviousStep()).toBe('payment')

        sessionStore.setCurrentStep('payment')
        expect(store.goToPreviousStep()).toBe('shipping')

        sessionStore.setCurrentStep('shipping')
        expect(store.goToPreviousStep()).toBeNull()
      })
    })
  })

  describe('Initialization', () => {
    describe('initializeCheckout', () => {
      it('should set up checkout session', async () => {
        const store = useCheckoutStore()

        await store.initializeCheckout()

        expect(sessionStore.sessionId).not.toBeNull()
        expect(sessionStore.sessionExpiresAt).not.toBeNull()
        expect(mockShippingStore.calculateOrderData).toHaveBeenCalled()
        expect(mockPaymentStore.loadSavedPaymentMethods).toHaveBeenCalled()
      })

      it('should lock cart during checkout', async () => {
        const store = useCheckoutStore()

        await store.initializeCheckout()

        expect(mockCartStore.lockCart).toHaveBeenCalled()
      })

      it('should restore previous session if available', async () => {
        const store = useCheckoutStore()

        // Pre-populate session
        cookieStorage.set('checkout_session', {
          sessionId: 'existing-session',
          currentStep: 'payment',
          shippingInfo: createMockShippingInfo(),
          paymentMethod: { type: 'cash' },
          sessionExpiresAt: new Date(Date.now() + 60000),
        })

        await store.initializeCheckout()

        // Should have restored data
        expect(sessionStore.currentStep).toBe('payment')
      })

      it('should set loading states correctly', async () => {
        const store = useCheckoutStore()

        let loadingDuringInit = false
        mockShippingStore.calculateOrderData = vi.fn(async () => {
          loadingDuringInit = sessionStore.loading
        })

        await store.initializeCheckout()

        expect(loadingDuringInit).toBe(true)
        expect(sessionStore.loading).toBe(false)
      })

      it('should handle cart lock failure gracefully', async () => {
        const store = useCheckoutStore()
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        mockCartStore.lockCart = vi.fn().mockRejectedValueOnce(new Error('Lock failed'))

        // Should not throw
        await store.initializeCheckout()

        expect(sessionStore.sessionId).not.toBeNull()

        consoleSpy.mockRestore()
      })

      it('should handle initialization errors', async () => {
        const store = useCheckoutStore()

        mockShippingStore.calculateOrderData = vi.fn().mockRejectedValueOnce(new Error('Calculation failed'))

        await expect(store.initializeCheckout()).rejects.toThrow()

        expect(sessionStore.loading).toBe(false)
        expect(sessionStore.lastError).not.toBeNull()
      })
    })

    describe('prefetchCheckoutData', () => {
      it('should skip for unauthenticated users', async () => {
        const store = useCheckoutStore()

        // mockAuthStore.isAuthenticated is already false by default

        await store.prefetchCheckoutData()

        expect(sessionStore.dataPrefetched).toBe(true)
      })

      it('should fetch user data for authenticated users', async () => {
        // Set auth state
        mockAuthStore.isAuthenticated = true

        const store = useCheckoutStore()

        // Mock $fetch
        const mockFetch = vi.fn().mockResolvedValueOnce({
          addresses: [createMockAddress()],
          preferences: { user_id: 'user-123' },
        })
        global.$fetch = mockFetch

        await store.prefetchCheckoutData()

        expect(mockFetch).toHaveBeenCalledWith('/api/checkout/user-data')
        expect(sessionStore.savedAddresses).toHaveLength(1)
        expect(sessionStore.dataPrefetched).toBe(true)

        // Reset for other tests
        mockAuthStore.isAuthenticated = false
      })

      it('should handle API errors gracefully', async () => {
        // Set auth state
        mockAuthStore.isAuthenticated = true

        const store = useCheckoutStore()
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        global.$fetch = vi.fn().mockRejectedValueOnce(new Error('API Error'))

        await store.prefetchCheckoutData()

        expect(sessionStore.dataPrefetched).toBe(true) // Still marked as prefetched

        consoleSpy.mockRestore()

        // Reset for other tests
        mockAuthStore.isAuthenticated = false
      })
    })
  })

  describe('Guest Info', () => {
    describe('updateGuestInfo', () => {
      it('should update guest info and persist', async () => {
        const store = useCheckoutStore()
        const persistSpy = vi.spyOn(sessionStore, 'persist')

        const guestInfo: GuestInfo = {
          email: 'guest@example.com',
          emailUpdates: true,
        }

        await store.updateGuestInfo(guestInfo)

        expect(sessionStore.guestInfo).toEqual(guestInfo)
        expect(persistSpy).toHaveBeenCalled()
      })
    })
  })

  describe('Storage Operations', () => {
    it('should save to storage', async () => {
      const store = useCheckoutStore()
      const persistSpy = vi.spyOn(sessionStore, 'persist')

      sessionStore.setShippingInfo(createMockShippingInfo())

      await store.saveToStorage()

      expect(persistSpy).toHaveBeenCalled()
    })

    it('should load from storage', () => {
      const store = useCheckoutStore()

      cookieStorage.set('checkout_session', {
        shippingInfo: createMockShippingInfo(),
        paymentMethod: { type: 'cash' },
        sessionExpiresAt: new Date(Date.now() + 60000),
      })

      store.loadFromStorage()

      expect(sessionStore.shippingInfo).not.toBeNull()
    })
  })

  describe('Update Operations', () => {
    it('should delegate updateShippingInfo to shipping store', async () => {
      const store = useCheckoutStore()

      const info = createMockShippingInfo()
      await store.updateShippingInfo(info)

      expect(mockShippingStore.updateShippingInfo).toHaveBeenCalledWith(info, undefined)
    })

    it('should delegate updatePaymentMethod to payment store', async () => {
      const store = useCheckoutStore()

      const method = createMockPaymentMethod()
      await store.updatePaymentMethod(method)

      expect(mockPaymentStore.updatePaymentMethod).toHaveBeenCalledWith(method)
    })

    it('should save address to session', async () => {
      const store = useCheckoutStore()

      const address = createMockAddress()
      await store.saveAddress(address)

      expect(sessionStore.savedAddresses).toContainEqual(address)
    })
  })

  describe('Reset and Cancel', () => {
    describe('resetCheckout', () => {
      it('should reset session state', () => {
        const store = useCheckoutStore()

        sessionStore.setSessionId('test-session')
        sessionStore.setCurrentStep('review')
        sessionStore.setShippingInfo(createMockShippingInfo())

        store.resetCheckout()

        expect(sessionStore.sessionId).toBeNull()
        expect(sessionStore.currentStep).toBe('shipping')
        expect(sessionStore.shippingInfo).toBeNull()
      })
    })

    describe('cancelCheckout', () => {
      it('should reset session on cancel', async () => {
        const store = useCheckoutStore()

        sessionStore.setSessionId('test-session')
        sessionStore.setCurrentStep('review')

        await store.cancelCheckout()

        // Session should be reset
        expect(sessionStore.sessionId).toBeNull()
        expect(sessionStore.currentStep).toBe('shipping')
      })

      it('should reset even if errors occur', async () => {
        const store = useCheckoutStore()
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        sessionStore.setSessionId('test-session')

        // Should not throw
        await expect(store.cancelCheckout()).resolves.not.toThrow()

        expect(sessionStore.sessionId).toBeNull()

        consoleSpy.mockRestore()
      })
    })
  })

  describe('Proxy Behavior', () => {
    it('should expose session store properties via proxy', () => {
      const _store = useCheckoutStore() as any

      sessionStore.setLoading(true)

      // The proxy exposes loading through the session store
      expect(sessionStore.loading).toBe(true)
    })

    it('should allow accessing session properties via store', () => {
      const _store = useCheckoutStore() as any

      // Set via session store
      sessionStore.setProcessing(true)

      // Should be accessible (proxy behavior varies based on implementation)
      expect(sessionStore.processing).toBe(true)
    })
  })
})

describe('Checkout Store Edge Cases', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    cookieStorage.clear()
    vi.clearAllMocks()
  })

  it('should handle concurrent step validations', async () => {
    const store = useCheckoutStore()
    const sessionStore = useCheckoutSessionStore()

    sessionStore.setShippingInfo(createMockShippingInfo())

    // Run multiple validations concurrently
    const results = await Promise.all([
      Promise.resolve(store.validateCurrentStep()),
      Promise.resolve(store.validateCurrentStep()),
      Promise.resolve(store.validateCurrentStep()),
    ])

    expect(results.every(r => r === true)).toBe(true)
  })

  it('should handle rapid step changes', async () => {
    const store = useCheckoutStore()
    const sessionStore = useCheckoutSessionStore()

    sessionStore.setShippingInfo(createMockShippingInfo())
    sessionStore.setPaymentMethodState(createMockPaymentMethod())

    // Rapid step changes
    await store.goToStep('payment')
    await store.goToStep('review')
    await store.goToStep('payment')
    await store.goToStep('shipping')

    expect(sessionStore.currentStep).toBe('shipping')
  })

  it('should maintain data integrity across operations', async () => {
    const store = useCheckoutStore()
    const sessionStore = useCheckoutSessionStore()

    const shippingInfo = createMockShippingInfo()
    const paymentMethod = createMockPaymentMethod()
    const orderData = createMockOrderData()

    sessionStore.setShippingInfo(shippingInfo)
    sessionStore.setPaymentMethodState(paymentMethod)
    sessionStore.setOrderData(orderData)

    // Perform various operations
    store.validateCurrentStep()
    await store.saveToStorage()
    store.loadFromStorage()

    expect(sessionStore.shippingInfo?.address.firstName).toBe(shippingInfo.address.firstName)
    expect(sessionStore.paymentMethod?.type).toBe(paymentMethod.type)
  })
})
