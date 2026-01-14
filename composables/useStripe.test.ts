/**
 * useStripe Composable Tests
 *
 * Tests for the Stripe payment integration composable.
 * Uses vi.resetModules() to handle the module-level singleton pattern.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { nextTick } from 'vue'
import type {
  createMockStripe } from '~/tests/utils/mockStripe'
import {
  createMockStripeCardElement,
  mockStripePaymentSuccess,
  mockStripePaymentError,
} from '~/tests/utils/mockStripe'

// Mock @stripe/stripe-js at module level
const mockLoadStripe = vi.fn()
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: mockLoadStripe,
}))

// Mock runtime config
const mockRuntimeConfig = {
  public: {
    stripePublishableKey: 'pk_test_123456789',
  },
}

describe('useStripe', () => {
  let mockStripe: ReturnType<typeof createMockStripe>
  let mockCardElement: ReturnType<typeof createMockStripeCardElement>
  let mockElements: any

  beforeEach(async () => {
    // CRITICAL: Reset modules to clear the singleton state
    vi.resetModules()

    // Re-mock after reset
    vi.doMock('@stripe/stripe-js', () => ({
      loadStripe: mockLoadStripe,
    }))

    // Clear mocks
    mockLoadStripe.mockClear()

    // Create fresh mocks for each test
    mockCardElement = createMockStripeCardElement()

    mockElements = {
      create: vi.fn(() => mockCardElement),
      getElement: vi.fn(() => mockCardElement),
      update: vi.fn(),
    }

    mockStripe = {
      elements: vi.fn(() => mockElements),
      confirmCardPayment: vi.fn().mockResolvedValue(mockStripePaymentSuccess(29.99)),
      createPaymentMethod: vi.fn().mockResolvedValue({
        paymentMethod: {
          id: 'pm_test_123',
          type: 'card',
        },
        error: undefined,
      }),
      retrievePaymentIntent: vi.fn().mockResolvedValue({
        paymentIntent: {
          id: 'pi_test_123',
          status: 'requires_payment_method',
        },
        error: undefined,
      }),
      confirmPayment: vi.fn().mockResolvedValue(mockStripePaymentSuccess(29.99)),
    }

    // Setup mock Stripe instance
    mockLoadStripe.mockResolvedValue(mockStripe)

    // Reset runtime config
    mockRuntimeConfig.public.stripePublishableKey = 'pk_test_123456789'
    vi.stubGlobal('useRuntimeConfig', vi.fn(() => mockRuntimeConfig))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('initializes with null state', async () => {
      const { useStripe } = await import('./useStripe')
      const { stripe, elements, cardElement, loading, error } = useStripe()

      expect(stripe.value).toBeNull()
      expect(elements.value).toBeNull()
      expect(cardElement.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('initializes Stripe successfully', async () => {
      const { useStripe } = await import('./useStripe')
      const { stripe, elements, loading, error, initializeStripe } = useStripe()

      const promise = initializeStripe()
      expect(loading.value).toBe(true)

      await promise

      expect(mockLoadStripe).toHaveBeenCalledWith('pk_test_123456789')
      expect(stripe.value).toEqual(mockStripe)
      expect(elements.value).toBeDefined()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('does not reinitialize if already initialized', async () => {
      const { useStripe } = await import('./useStripe')
      const { initializeStripe } = useStripe()

      await initializeStripe()
      const callCount = mockLoadStripe.mock.calls.length

      await initializeStripe()

      // Should not call loadStripe again (singleton)
      expect(mockLoadStripe.mock.calls.length).toBe(callCount)
    })

    it('handles missing publishable key', async () => {
      mockRuntimeConfig.public.stripePublishableKey = ''

      const { useStripe } = await import('./useStripe')
      const { error, initializeStripe } = useStripe()

      await initializeStripe()

      expect(error.value).toBe('Stripe publishable key not configured')
    })

    it('handles Stripe loading failure (null return)', async () => {
      mockLoadStripe.mockResolvedValue(null)

      const { useStripe } = await import('./useStripe')
      const { error, initializeStripe } = useStripe()

      await initializeStripe()

      expect(error.value).toBe('Failed to load Stripe')
    })

    it('handles Stripe loading error (rejection)', async () => {
      mockLoadStripe.mockRejectedValue(new Error('Network error'))

      const { useStripe } = await import('./useStripe')
      const { error, initializeStripe } = useStripe()

      await initializeStripe()

      expect(error.value).toBe('Network error')
    })

    it('sets loading to false after error', async () => {
      mockLoadStripe.mockRejectedValue(new Error('Network error'))

      const { useStripe } = await import('./useStripe')
      const { loading, initializeStripe } = useStripe()

      await initializeStripe()

      expect(loading.value).toBe(false)
    })
  })

  describe('Card Element Creation', () => {
    it('creates card element successfully', async () => {
      const { useStripe } = await import('./useStripe')
      const { initializeStripe, createCardElement, cardElement } = useStripe()
      await initializeStripe()

      const mockContainer = document.createElement('div')
      await createCardElement(mockContainer)

      expect(cardElement.value).toEqual(mockCardElement)
      expect(mockCardElement.mount).toHaveBeenCalledWith(mockContainer)
    })

    it('initializes Stripe if not already initialized', async () => {
      const { useStripe } = await import('./useStripe')
      const { createCardElement, stripe } = useStripe()

      expect(stripe.value).toBeNull()

      const mockContainer = document.createElement('div')
      await createCardElement(mockContainer)

      expect(stripe.value).toBeTruthy()
      expect(mockLoadStripe).toHaveBeenCalled()
    })

    it('throws error if Stripe elements not initialized', async () => {
      mockLoadStripe.mockResolvedValue(null)

      const { useStripe } = await import('./useStripe')
      const { createCardElement } = useStripe()
      const mockContainer = document.createElement('div')

      await expect(createCardElement(mockContainer)).rejects.toThrow('Stripe elements not initialized')
    })

    it('applies custom card element styling', async () => {
      const { useStripe } = await import('./useStripe')
      const { initializeStripe, createCardElement } = useStripe()
      await initializeStripe()

      const mockContainer = document.createElement('div')
      await createCardElement(mockContainer)

      expect(mockElements.create).toHaveBeenCalledWith('card', expect.objectContaining({
        style: expect.objectContaining({
          base: expect.objectContaining({
            fontSize: '16px',
            color: '#1f2937', // Updated color
          }),
          invalid: expect.objectContaining({
            color: '#ef4444', // Updated color
          }),
        }),
        hidePostalCode: true,
        classes: expect.objectContaining({
          base: 'stripe-element-base',
          focus: 'stripe-element-focus',
          invalid: 'stripe-element-invalid',
        }),
      }))
    })

    it('sets up change event listener', async () => {
      const { useStripe } = await import('./useStripe')
      const { initializeStripe, createCardElement } = useStripe()
      await initializeStripe()

      const mockContainer = document.createElement('div')
      await createCardElement(mockContainer)

      expect(mockCardElement.on).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('updates error on card element change event', async () => {
      let changeCallback: (event: any) => void

      mockCardElement.on.mockImplementation((event: string, callback: (event: any) => void) => {
        if (event === 'change') {
          changeCallback = callback
        }
      })

      const { useStripe } = await import('./useStripe')
      const { initializeStripe, createCardElement, error } = useStripe()
      await initializeStripe()

      const mockContainer = document.createElement('div')
      await createCardElement(mockContainer)

      // Trigger change event with error
      changeCallback!({ error: { message: 'Card number is invalid' } })
      await nextTick()

      expect(error.value).toBe('Card number is invalid')

      // Trigger change event without error
      changeCallback!({ error: null })
      await nextTick()

      expect(error.value).toBeNull()
    })
  })

  describe('Payment Confirmation', () => {
    it('confirms payment successfully', async () => {
      const { useStripe } = await import('./useStripe')
      const { initializeStripe, createCardElement, confirmPayment } = useStripe()
      await initializeStripe()

      const mockContainer = document.createElement('div')
      await createCardElement(mockContainer)

      const mockClientSecret = 'pi_test_secret_123'
      mockStripe.confirmCardPayment.mockResolvedValue(mockStripePaymentSuccess(29.99))

      const result = await confirmPayment(mockClientSecret)

      expect(result.success).toBe(true)
      expect(result.paymentIntent).toBeDefined()
      expect(mockStripe.confirmCardPayment).toHaveBeenCalledWith(
        mockClientSecret,
        expect.objectContaining({
          payment_method: expect.any(Object),
        }),
      )
    })

    it('handles payment confirmation with custom payment data', async () => {
      const { useStripe } = await import('./useStripe')
      const { initializeStripe, createCardElement, confirmPayment } = useStripe()
      await initializeStripe()

      const mockContainer = document.createElement('div')
      await createCardElement(mockContainer)

      const mockClientSecret = 'pi_test_secret_123'
      const mockBillingDetails = {
        name: 'John Doe',
        email: 'john@example.com',
        address: {
          line1: '123 Main St',
          city: 'Madrid',
          postal_code: '28001',
          country: 'ES',
        },
      }

      mockStripe.confirmCardPayment.mockResolvedValue(mockStripePaymentSuccess(29.99))

      await confirmPayment(mockClientSecret, mockBillingDetails)

      expect(mockStripe.confirmCardPayment).toHaveBeenCalledWith(
        mockClientSecret,
        expect.objectContaining({
          payment_method: expect.objectContaining({
            billing_details: mockBillingDetails,
          }),
        }),
      )
    })

    it('handles payment confirmation failure', async () => {
      const { useStripe } = await import('./useStripe')
      const { initializeStripe, createCardElement, confirmPayment, error } = useStripe()
      await initializeStripe()

      const mockContainer = document.createElement('div')
      await createCardElement(mockContainer)

      const mockClientSecret = 'pi_test_secret_123'
      mockStripe.confirmCardPayment.mockResolvedValue(
        mockStripePaymentError('Your card was declined', 'card_declined'),
      )

      const result = await confirmPayment(mockClientSecret)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(error.value).toBe('Your card was declined')
    })

    it('handles payment confirmation exception', async () => {
      const { useStripe } = await import('./useStripe')
      const { initializeStripe, createCardElement, confirmPayment, error } = useStripe()
      await initializeStripe()

      const mockContainer = document.createElement('div')
      await createCardElement(mockContainer)

      mockStripe.confirmCardPayment.mockRejectedValue(new Error('Network error'))

      const result = await confirmPayment('pi_test_secret_123')

      expect(result.success).toBe(false)
      expect(error.value).toBe('Network error')
    })

    it('throws error if Stripe not initialized', async () => {
      const { useStripe } = await import('./useStripe')
      const { confirmPayment } = useStripe()

      await expect(confirmPayment('pi_test_secret_123')).rejects.toThrow('Stripe not initialized')
    })

    it('sets loading state during payment confirmation', async () => {
      let resolveConfirm: (value: any) => void
      mockStripe.confirmCardPayment.mockReturnValue(new Promise((resolve) => {
        resolveConfirm = resolve
      }))

      const { useStripe } = await import('./useStripe')
      const { initializeStripe, createCardElement, confirmPayment, loading } = useStripe()
      await initializeStripe()

      const mockContainer = document.createElement('div')
      await createCardElement(mockContainer)

      const promise = confirmPayment('pi_test_secret_123')

      await nextTick()
      expect(loading.value).toBe(true)

      resolveConfirm!(mockStripePaymentSuccess(29.99))
      await promise

      expect(loading.value).toBe(false)
    })
  })

  describe('Payment Method Creation', () => {
    it('creates payment method successfully', async () => {
      const { useStripe } = await import('./useStripe')
      const { initializeStripe, createCardElement, createPaymentMethod } = useStripe()
      await initializeStripe()

      const mockContainer = document.createElement('div')
      await createCardElement(mockContainer)

      const mockBillingDetails = {
        name: 'John Doe',
        email: 'john@example.com',
        address: {
          line1: '123 Main St',
          city: 'Madrid',
          postal_code: '28001',
          country: 'ES',
        },
      }

      const result = await createPaymentMethod(mockBillingDetails)

      expect(result.success).toBe(true)
      expect(result.paymentMethod).toBeDefined()
      expect(mockStripe.createPaymentMethod).toHaveBeenCalledWith({
        type: 'card',
        card: mockCardElement,
        billing_details: mockBillingDetails,
      })
    })

    it('creates payment method without billing details', async () => {
      const { useStripe } = await import('./useStripe')
      const { initializeStripe, createCardElement, createPaymentMethod } = useStripe()
      await initializeStripe()

      const mockContainer = document.createElement('div')
      await createCardElement(mockContainer)

      const result = await createPaymentMethod()

      expect(result.success).toBe(true)
      expect(mockStripe.createPaymentMethod).toHaveBeenCalledWith({
        type: 'card',
        card: mockCardElement,
        billing_details: {},
      })
    })

    it('handles payment method creation failure', async () => {
      const { useStripe } = await import('./useStripe')
      const { initializeStripe, createCardElement, createPaymentMethod, error } = useStripe()
      await initializeStripe()

      const mockContainer = document.createElement('div')
      await createCardElement(mockContainer)

      mockStripe.createPaymentMethod.mockResolvedValue({
        error: {
          type: 'card_error',
          code: 'invalid_number',
          message: 'Your card number is invalid',
        },
        paymentMethod: undefined,
      })

      const result = await createPaymentMethod()

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(error.value).toBe('Your card number is invalid')
    })

    it('handles payment method creation exception', async () => {
      const { useStripe } = await import('./useStripe')
      const { initializeStripe, createCardElement, createPaymentMethod, error } = useStripe()
      await initializeStripe()

      const mockContainer = document.createElement('div')
      await createCardElement(mockContainer)

      mockStripe.createPaymentMethod.mockRejectedValue(new Error('Network error'))

      const result = await createPaymentMethod()

      expect(result.success).toBe(false)
      expect(error.value).toBe('Network error')
    })

    it('throws error if Stripe not initialized', async () => {
      const { useStripe } = await import('./useStripe')
      const { createPaymentMethod } = useStripe()

      await expect(createPaymentMethod()).rejects.toThrow('Stripe not initialized')
    })

    it('sets loading state during payment method creation', async () => {
      let resolveCreate: (value: any) => void
      mockStripe.createPaymentMethod.mockReturnValue(new Promise((resolve) => {
        resolveCreate = resolve
      }))

      const { useStripe } = await import('./useStripe')
      const { initializeStripe, createCardElement, createPaymentMethod, loading } = useStripe()
      await initializeStripe()

      const mockContainer = document.createElement('div')
      await createCardElement(mockContainer)

      const promise = createPaymentMethod()

      await nextTick()
      expect(loading.value).toBe(true)

      resolveCreate!({
        paymentMethod: { id: 'pm_test_123' },
        error: undefined,
      })
      await promise

      expect(loading.value).toBe(false)
    })
  })

  describe('Singleton Pattern', () => {
    it('reuses Stripe instance across multiple composable calls', async () => {
      const { useStripe } = await import('./useStripe')

      const { initializeStripe: init1 } = useStripe()
      await init1()

      const callCount1 = mockLoadStripe.mock.calls.length

      const { initializeStripe: init2 } = useStripe()
      await init2()

      const callCount2 = mockLoadStripe.mock.calls.length

      // loadStripe should only be called once due to singleton pattern
      expect(callCount2).toBe(callCount1)
    })
  })
})

describe('formatStripeError', () => {
  // Import once for these pure function tests
  let formatStripeError: any

  beforeEach(async () => {
    const module = await import('./useStripe')
    formatStripeError = module.formatStripeError
  })

  it('formats card_declined error', () => {
    const error = { code: 'card_declined', message: 'Card declined' }
    expect(formatStripeError(error)).toBe('Your card was declined. Please try a different payment method.')
  })

  it('formats expired_card error', () => {
    const error = { code: 'expired_card', message: 'Card expired' }
    expect(formatStripeError(error)).toBe('Your card has expired. Please use a different card.')
  })

  it('formats incorrect_cvc error', () => {
    const error = { code: 'incorrect_cvc', message: 'Incorrect CVC' }
    expect(formatStripeError(error)).toBe('Your card\'s security code is incorrect.')
  })

  it('formats processing_error', () => {
    const error = { code: 'processing_error', message: 'Processing error' }
    expect(formatStripeError(error)).toBe('An error occurred while processing your card. Please try again.')
  })

  it('formats incorrect_number error', () => {
    const error = { code: 'incorrect_number', message: 'Incorrect number' }
    expect(formatStripeError(error)).toBe('Your card number is incorrect.')
  })

  it('formats incomplete_number error', () => {
    const error = { code: 'incomplete_number', message: 'Incomplete number' }
    expect(formatStripeError(error)).toBe('Your card number is incomplete.')
  })

  it('formats incomplete_cvc error', () => {
    const error = { code: 'incomplete_cvc', message: 'Incomplete CVC' }
    expect(formatStripeError(error)).toBe('Your card\'s security code is incomplete.')
  })

  it('formats incomplete_expiry error', () => {
    const error = { code: 'incomplete_expiry', message: 'Incomplete expiry' }
    expect(formatStripeError(error)).toBe('Your card\'s expiration date is incomplete.')
  })

  it('formats invalid_expiry_month error', () => {
    const error = { code: 'invalid_expiry_month', message: 'Invalid month' }
    expect(formatStripeError(error)).toBe('Your card\'s expiration month is invalid.')
  })

  it('formats invalid_expiry_year error', () => {
    const error = { code: 'invalid_expiry_year', message: 'Invalid year' }
    expect(formatStripeError(error)).toBe('Your card\'s expiration year is invalid.')
  })

  it('formats invalid_cvc error', () => {
    const error = { code: 'invalid_cvc', message: 'Invalid CVC' }
    expect(formatStripeError(error)).toBe('Your card\'s security code is invalid.')
  })

  it('returns custom message for unknown error codes', () => {
    const error = { code: 'unknown_error', message: 'Something went wrong' }
    expect(formatStripeError(error)).toBe('Something went wrong')
  })

  it('returns default message for errors without message', () => {
    const error = { code: 'unknown_error' }
    expect(formatStripeError(error)).toBe('An error occurred while processing your payment.')
  })

  it('returns default message for null/undefined errors', () => {
    expect(formatStripeError(null)).toBe('An unknown error occurred')
    expect(formatStripeError(undefined)).toBe('An unknown error occurred')
  })
})
