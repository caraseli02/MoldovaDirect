/**
 * Mock Stripe client for testing
 */

import { vi } from 'vitest'

export interface MockStripeElements {
  create: ReturnType<typeof vi.fn>
  getElement: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

export interface MockStripeCardElement {
  mount: ReturnType<typeof vi.fn>
  unmount: ReturnType<typeof vi.fn>
  destroy: ReturnType<typeof vi.fn>
  on: ReturnType<typeof vi.fn>
  off: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  clear: ReturnType<typeof vi.fn>
}

export interface MockStripe {
  elements: ReturnType<typeof vi.fn>
  confirmCardPayment: ReturnType<typeof vi.fn>
  createPaymentMethod: ReturnType<typeof vi.fn>
  retrievePaymentIntent: ReturnType<typeof vi.fn>
  confirmPayment: ReturnType<typeof vi.fn>
}

export function createMockStripeCardElement(): MockStripeCardElement {
  return {
    mount: vi.fn(),
    unmount: vi.fn(),
    destroy: vi.fn(),
    on: vi.fn((_event, _callback) => {
      // Store callback for manual triggering in tests
      return vi.fn()
    }),
    off: vi.fn(),
    update: vi.fn(),
    clear: vi.fn(),
  }
}

export function createMockStripeElements(): MockStripeElements {
  const mockCardElement = createMockStripeCardElement()

  return {
    create: vi.fn(() => mockCardElement),
    getElement: vi.fn(() => mockCardElement),
    update: vi.fn(),
  }
}

export function createMockStripe(): MockStripe {
  const mockElements = createMockStripeElements()

  return {
    elements: vi.fn(() => mockElements),
    confirmCardPayment: vi.fn().mockResolvedValue({
      paymentIntent: {
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 2999,
        currency: 'usd',
      },
      error: undefined,
    }),
    createPaymentMethod: vi.fn().mockResolvedValue({
      paymentMethod: {
        id: 'pm_test_123',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025,
        },
      },
      error: undefined,
    }),
    retrievePaymentIntent: vi.fn().mockResolvedValue({
      paymentIntent: {
        id: 'pi_test_123',
        status: 'requires_payment_method',
        amount: 2999,
        currency: 'usd',
      },
      error: undefined,
    }),
    confirmPayment: vi.fn().mockResolvedValue({
      paymentIntent: {
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 2999,
        currency: 'usd',
      },
      error: undefined,
    }),
  }
}

/**
 * Helper to mock a successful Stripe payment
 */
export function mockStripePaymentSuccess(amount: number, currency = 'usd') {
  return {
    paymentIntent: {
      id: `pi_test_${Date.now()}`,
      status: 'succeeded',
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      created: Date.now(),
      payment_method: 'pm_test_123',
    },
    error: undefined,
  }
}

/**
 * Helper to mock a failed Stripe payment
 */
export function mockStripePaymentError(message: string, code = 'card_declined') {
  return {
    paymentIntent: undefined,
    error: {
      type: 'card_error',
      code,
      message,
      decline_code: code,
    },
  }
}

/**
 * Helper to mock Stripe card element change event
 */
export function mockStripeCardChangeEvent(complete = true, error: unknown = null) {
  return {
    complete,
    empty: false,
    error,
    brand: 'visa',
    value: {
      postalCode: complete ? '12345' : '',
    },
  }
}

/**
 * Mock Stripe.js global
 */
export function mockStripeJs() {
  const mockStripe = createMockStripe()

  // @ts-expect-error - Mock for testing purposes
  global.Stripe = vi.fn(() => mockStripe)

  return mockStripe
}
