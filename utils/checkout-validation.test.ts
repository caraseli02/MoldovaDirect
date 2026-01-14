import { describe, it, expect } from 'vitest'
import { validatePaymentMethod } from './checkout-validation'
import type { PaymentMethod } from '~/types/checkout'

/**
 * Unit tests for Stripe Elements validation changes
 * Feature: checkout-stripe-validation-fix
 */

describe('validatePaymentMethod - Stripe Elements', () => {
  describe('Property 1: Stripe Elements Validation Skips Card Fields', () => {
    /**
     * Validates: Requirements 1.1, 1.2, 1.4
     * For any payment method with type: 'credit_card' and creditCard.useStripeElements: true,
     * validation SHALL pass if and only if creditCard.holderName is a non-empty string
     * with length >= 2 and <= 50, regardless of card field values.
     */
    it('should pass validation with valid holderName and empty card fields when useStripeElements is true', () => {
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: {
          number: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          holderName: 'John Doe',
          useStripeElements: true,
        },
      }

      const result = validatePaymentMethod(paymentMethod)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should pass validation with valid holderName regardless of invalid card data when useStripeElements is true', () => {
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: {
          number: 'invalid',
          expiryMonth: 'invalid',
          expiryYear: 'invalid',
          cvv: 'invalid',
          holderName: 'Jane Smith',
          useStripeElements: true,
        },
      }

      const result = validatePaymentMethod(paymentMethod)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should pass validation with minimum valid holderName length (2 chars)', () => {
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: {
          number: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          holderName: 'AB',
          useStripeElements: true,
        },
      }

      const result = validatePaymentMethod(paymentMethod)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should pass validation with maximum valid holderName length (50 chars)', () => {
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: {
          number: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          holderName: 'A'.repeat(50),
          useStripeElements: true,
        },
      }

      const result = validatePaymentMethod(paymentMethod)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Property 2: Invalid Cardholder Name Fails Validation', () => {
    /**
     * Validates: Requirements 1.3, 3.1
     * For any payment method with type: 'credit_card' where creditCard.holderName
     * is empty, whitespace-only, or has length < 2, validation SHALL return an error
     * with field 'holderName'.
     */
    it('should fail validation when holderName is empty', () => {
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: {
          number: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          holderName: '',
          useStripeElements: true,
        },
      }

      const result = validatePaymentMethod(paymentMethod)

      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]?.field).toBe('holderName')
      expect(result.errors[0]?.code).toBe('REQUIRED')
    })

    it('should fail validation when holderName is whitespace only', () => {
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: {
          number: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          holderName: '   ',
          useStripeElements: true,
        },
      }

      const result = validatePaymentMethod(paymentMethod)

      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]?.field).toBe('holderName')
      expect(result.errors[0]?.code).toBe('REQUIRED')
    })

    it('should fail validation when holderName is too short (1 char)', () => {
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: {
          number: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          holderName: 'A',
          useStripeElements: true,
        },
      }

      const result = validatePaymentMethod(paymentMethod)

      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]?.field).toBe('holderName')
      expect(result.errors[0]?.code).toBe('TOO_SHORT')
    })

    it('should fail validation when holderName is too long (51 chars)', () => {
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: {
          number: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          holderName: 'A'.repeat(51),
          useStripeElements: true,
        },
      }

      const result = validatePaymentMethod(paymentMethod)

      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]?.field).toBe('holderName')
      expect(result.errors[0]?.code).toBe('TOO_LONG')
    })
  })

  describe('Property 3: Legacy Validation Preserves Backward Compatibility', () => {
    /**
     * Validates: Requirements 2.3
     * For any payment method with type: 'credit_card' and creditCard.useStripeElements
     * is false or undefined, validation SHALL check all card fields.
     */
    it('should validate all card fields when useStripeElements is false', () => {
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: {
          number: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          holderName: 'John Doe',
          useStripeElements: false,
        },
      }

      const result = validatePaymentMethod(paymentMethod)

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)

      // Should have errors for card number, expiry, and CVV
      const errorFields = result.errors.map(e => e.field)
      expect(errorFields).toContain('number')
      expect(errorFields).toContain('expiry')
      expect(errorFields).toContain('cvv')
    })

    it('should validate all card fields when useStripeElements is undefined', () => {
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: {
          number: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          holderName: 'John Doe',
          // useStripeElements is undefined
        },
      }

      const result = validatePaymentMethod(paymentMethod)

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)

      // Should have errors for card number, expiry, and CVV
      const errorFields = result.errors.map(e => e.field)
      expect(errorFields).toContain('number')
      expect(errorFields).toContain('expiry')
      expect(errorFields).toContain('cvv')
    })

    it('should pass validation with all valid card fields when useStripeElements is false', () => {
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: {
          number: '4242424242424242', // Valid test card number
          expiryMonth: '12',
          expiryYear: '2030',
          cvv: '123',
          holderName: 'John Doe',
          useStripeElements: false,
        },
      }

      const result = validatePaymentMethod(paymentMethod)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should pass validation with all valid card fields when useStripeElements is undefined', () => {
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: {
          number: '4242424242424242', // Valid test card number
          expiryMonth: '12',
          expiryYear: '2030',
          cvv: '123',
          holderName: 'John Doe',
          // useStripeElements is undefined
        },
      }

      const result = validatePaymentMethod(paymentMethod)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})
