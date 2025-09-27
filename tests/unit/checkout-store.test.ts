import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCheckoutStore } from '~/stores/checkout'
import type { ShippingInformation, PaymentMethod } from '~/stores/checkout'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Mock window and localStorage
Object.defineProperty(global, 'window', {
  value: {
    localStorage: localStorageMock
  },
  writable: true
})

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

// Mock $fetch
global.$fetch = vi.fn()

// Mock useToastStore
vi.mock('~/stores/toast', () => ({
  useToastStore: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  })
}))

// Mock useStoreI18n
vi.mock('~/composables/useStoreI18n', () => ({
  useStoreI18n: () => ({
    t: (key: string) => key // Return the key as the translation
  })
}))

describe('Checkout Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const store = useCheckoutStore()
      
      expect(store.currentStep).toBe('shipping')
      expect(store.sessionId).toBeNull()
      expect(store.shippingInfo).toBeNull()
      expect(store.paymentMethod).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.processing).toBe(false)
    })

    it('should generate session ID when initializing checkout', async () => {
      const store = useCheckoutStore()
      const mockCartItems = [
        {
          id: '1',
          product: { id: 1, name: 'Test Product', price: 10 },
          quantity: 2
        }
      ]

      await store.initializeCheckout(mockCartItems)

      expect(store.sessionId).toBeTruthy()
      expect(store.sessionId).toMatch(/^checkout_\d+_[a-z0-9]+$/)
      expect(store.sessionExpiresAt).toBeInstanceOf(Date)
    })

    it('should calculate order data from cart items', async () => {
      const store = useCheckoutStore()
      const mockCartItems = [
        {
          id: '1',
          product: { id: 1, name: 'Product 1', price: 10 },
          quantity: 2
        },
        {
          id: '2',
          product: { id: 2, name: 'Product 2', price: 15 },
          quantity: 1
        }
      ]

      await store.initializeCheckout(mockCartItems)

      expect(store.orderData).toBeTruthy()
      expect(store.orderData?.subtotal).toBe(35) // (10 * 2) + (15 * 1)
      expect(store.orderData?.tax).toBe(7.35) // 21% VAT
      expect(store.orderData?.items).toHaveLength(2)
    })
  })

  describe('step navigation', () => {
    it('should navigate to next step when validation passes', async () => {
      const store = useCheckoutStore()
      
      // Mock valid shipping info
      const shippingInfo: ShippingInformation = {
        address: {
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main St',
          city: 'Madrid',
          postalCode: '28001',
          country: 'ES',
          type: 'shipping'
        },
        method: {
          id: 'standard',
          name: 'Standard Shipping',
          description: 'Standard delivery',
          price: 5.99,
          estimatedDays: 3
        }
      }
      
      store.shippingInfo = shippingInfo
      store.currentStep = 'shipping'

      await store.proceedToNextStep()

      expect(store.currentStep).toBe('payment')
    })

    it('should not navigate if validation fails', () => {
      const store = useCheckoutStore()
      store.currentStep = 'shipping'
      // No shipping info set

      const result = store.validateCurrentStep()

      expect(result).toBe(false)
      expect(store.validationErrors.shipping).toBeTruthy()
    })

    it('should go to previous step', () => {
      const store = useCheckoutStore()
      store.currentStep = 'payment'

      store.goToPreviousStep()

      expect(store.currentStep).toBe('shipping')
    })
  })

  describe('shipping information', () => {
    it('should update shipping info with valid data', async () => {
      const store = useCheckoutStore()
      const shippingInfo: ShippingInformation = {
        address: {
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main St',
          city: 'Madrid',
          postalCode: '28001',
          country: 'ES',
          type: 'shipping'
        },
        method: {
          id: 'standard',
          name: 'Standard Shipping',
          description: 'Standard delivery',
          price: 5.99,
          estimatedDays: 3
        }
      }

      await store.updateShippingInfo(shippingInfo)

      expect(store.shippingInfo).toEqual(shippingInfo)
      expect(store.validationErrors.shipping).toBeUndefined()
    })

    it('should reject invalid shipping info', async () => {
      const store = useCheckoutStore()
      const invalidShippingInfo: ShippingInformation = {
        address: {
          firstName: '', // Invalid - empty
          lastName: 'Doe',
          street: '123 Main St',
          city: 'Madrid',
          postalCode: '28001',
          country: 'ES',
          type: 'shipping'
        },
        method: {
          id: 'standard',
          name: 'Standard Shipping',
          description: 'Standard delivery',
          price: 5.99,
          estimatedDays: 3
        }
      }

      await expect(store.updateShippingInfo(invalidShippingInfo)).rejects.toThrow()
      expect(store.validationErrors.shipping).toBeTruthy()
    })
  })

  describe('payment method', () => {
    it('should update payment method with valid credit card', async () => {
      const store = useCheckoutStore()
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: {
          number: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123',
          holderName: 'John Doe'
        }
      }

      await store.updatePaymentMethod(paymentMethod)

      expect(store.paymentMethod).toEqual(paymentMethod)
      expect(store.validationErrors.payment).toBeUndefined()
    })

    it('should reject invalid payment method', async () => {
      const store = useCheckoutStore()
      const invalidPaymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: {
          number: '1234', // Invalid card number
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123',
          holderName: 'John Doe'
        }
      }

      await expect(store.updatePaymentMethod(invalidPaymentMethod)).rejects.toThrow()
      expect(store.validationErrors.payment).toBeTruthy()
    })

    it('should validate PayPal payment method', async () => {
      const store = useCheckoutStore()
      const paymentMethod: PaymentMethod = {
        type: 'paypal',
        paypal: {
          email: 'john@example.com'
        }
      }

      await store.updatePaymentMethod(paymentMethod)

      expect(store.paymentMethod).toEqual(paymentMethod)
    })
  })

  describe('getters', () => {
    it('should calculate canProceedToPayment correctly', () => {
      const store = useCheckoutStore()
      
      expect(store.canProceedToPayment).toBe(false)

      // Set valid shipping info
      store.shippingInfo = {
        address: {
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main St',
          city: 'Madrid',
          postalCode: '28001',
          country: 'ES',
          type: 'shipping'
        },
        method: {
          id: 'standard',
          name: 'Standard Shipping',
          description: 'Standard delivery',
          price: 5.99,
          estimatedDays: 3
        }
      }

      expect(store.canProceedToPayment).toBe(true)
    })

    it('should calculate currentStepIndex correctly', () => {
      const store = useCheckoutStore()
      
      expect(store.currentStepIndex).toBe(0) // shipping
      
      store.currentStep = 'payment'
      expect(store.currentStepIndex).toBe(1)
      
      store.currentStep = 'review'
      expect(store.currentStepIndex).toBe(2)
      
      store.currentStep = 'confirmation'
      expect(store.currentStepIndex).toBe(3)
    })

    it('should detect session expiry', () => {
      const store = useCheckoutStore()
      
      expect(store.isSessionExpired).toBe(false)
      
      // Set expired session
      store.sessionExpiresAt = new Date(Date.now() - 1000) // 1 second ago
      expect(store.isSessionExpired).toBe(true)
      
      // Set future expiry
      store.sessionExpiresAt = new Date(Date.now() + 1000) // 1 second from now
      expect(store.isSessionExpired).toBe(false)
    })
  })

  describe('storage management', () => {
    it('should save to localStorage', () => {
      const store = useCheckoutStore()
      store.sessionId = 'test-session'
      store.currentStep = 'payment'

      store.saveToStorage()

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'checkout_session',
        expect.stringContaining('test-session')
      )
    })

    it('should load from localStorage', () => {
      const mockData = {
        sessionId: 'test-session',
        currentStep: 'payment',
        sessionExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData))

      const store = useCheckoutStore()
      store.loadFromStorage()

      expect(store.sessionId).toBe('test-session')
      expect(store.currentStep).toBe('payment')
    })

    it('should clear expired session from storage', () => {
      const expiredData = {
        sessionId: 'expired-session',
        currentStep: 'payment',
        sessionExpiresAt: new Date(Date.now() - 1000).toISOString() // Expired
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredData))

      const store = useCheckoutStore()
      store.loadFromStorage()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('checkout_session')
    })
  })

  describe('reset functionality', () => {
    it('should reset all state to initial values', () => {
      const store = useCheckoutStore()
      
      // Set some state
      store.sessionId = 'test-session'
      store.currentStep = 'payment'
      store.shippingInfo = {
        address: {
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main St',
          city: 'Madrid',
          postalCode: '28001',
          country: 'ES',
          type: 'shipping'
        },
        method: {
          id: 'standard',
          name: 'Standard Shipping',
          description: 'Standard delivery',
          price: 5.99,
          estimatedDays: 3
        }
      }

      store.resetCheckout()

      expect(store.sessionId).toBeNull()
      expect(store.currentStep).toBe('shipping')
      expect(store.shippingInfo).toBeNull()
      expect(store.paymentMethod).toBeNull()
      expect(store.orderData).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('checkout_session')
    })
  })
})