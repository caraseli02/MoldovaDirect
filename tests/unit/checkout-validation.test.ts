import { describe, it, expect } from 'vitest'
import {
  validateAddress,
  validatePaymentMethod,
  validateShippingInformation,
  isValidEmail,
  isValidPhoneNumber,
  isValidPostalCode,
  isValidCardNumber,
  isValidLuhn,
  getCardBrand
} from '~/utils/checkout-validation'
import type { Address, PaymentMethod, ShippingInformation } from '~/types/checkout'

describe('Checkout Validation', () => {
  describe('Address Validation', () => {
    it('should validate a complete address', () => {
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main Street',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
        type: 'shipping'
      }

      const result = validateAddress(address)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject address with missing required fields', () => {
      const address: Partial<Address> = {
        firstName: '',
        lastName: 'Doe',
        street: '123 Main Street',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
        type: 'shipping'
      }

      const result = validateAddress(address)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'firstName')).toBe(true)
    })

    it('should validate postal codes by country', () => {
      const validSpanishAddress: Address = {
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main Street',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
        type: 'shipping'
      }

      const invalidSpanishAddress: Address = {
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main Street',
        city: 'Madrid',
        postalCode: '280011', // Invalid - too long for Spain
        country: 'ES',
        type: 'shipping'
      }

      expect(validateAddress(validSpanishAddress).isValid).toBe(true)
      expect(validateAddress(invalidSpanishAddress).isValid).toBe(false)
    })
  })

  describe('Payment Method Validation', () => {
    it('should validate credit card payment method', () => {
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

      const result = validatePaymentMethod(paymentMethod)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid credit card', () => {
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: {
          number: '1234567890123456', // Invalid Luhn
          expiryMonth: '12',
          expiryYear: '2020', // Expired
          cvv: '12', // Too short
          holderName: ''
        }
      }

      const result = validatePaymentMethod(paymentMethod)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should validate PayPal payment method', () => {
      const paymentMethod: PaymentMethod = {
        type: 'paypal',
        paypal: {
          email: 'john@example.com'
        }
      }

      const result = validatePaymentMethod(paymentMethod)
      expect(result.isValid).toBe(true)
    })

    it('should reject invalid PayPal email', () => {
      const paymentMethod: PaymentMethod = {
        type: 'paypal',
        paypal: {
          email: 'invalid-email'
        }
      }

      const result = validatePaymentMethod(paymentMethod)
      expect(result.isValid).toBe(false)
    })
  })

  describe('Shipping Information Validation', () => {
    it('should validate complete shipping information', () => {
      const shippingInfo: ShippingInformation = {
        address: {
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main Street',
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

      const result = validateShippingInformation(shippingInfo)
      expect(result.isValid).toBe(true)
    })

    it('should reject shipping info without method', () => {
      const shippingInfo: Partial<ShippingInformation> = {
        address: {
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main Street',
          city: 'Madrid',
          postalCode: '28001',
          country: 'ES',
          type: 'shipping'
        }
        // Missing method
      }

      const result = validateShippingInformation(shippingInfo)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'method')).toBe(true)
    })
  })

  describe('Utility Functions', () => {
    describe('Email Validation', () => {
      it('should validate correct email addresses', () => {
        expect(isValidEmail('test@example.com')).toBe(true)
        expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
      })

      it('should reject invalid email addresses', () => {
        expect(isValidEmail('invalid-email')).toBe(false)
        expect(isValidEmail('test@')).toBe(false)
        expect(isValidEmail('@domain.com')).toBe(false)
      })
    })

    describe('Phone Number Validation', () => {
      it('should validate phone numbers', () => {
        expect(isValidPhoneNumber('+34123456789')).toBe(true)
        expect(isValidPhoneNumber('123-456-7890')).toBe(true)
        expect(isValidPhoneNumber('(123) 456-7890')).toBe(true)
      })

      it('should reject invalid phone numbers', () => {
        expect(isValidPhoneNumber('123')).toBe(false)
        expect(isValidPhoneNumber('abc123')).toBe(false)
      })
    })

    describe('Postal Code Validation', () => {
      it('should validate postal codes by country', () => {
        expect(isValidPostalCode('28001', 'ES')).toBe(true) // Spain
        expect(isValidPostalCode('123456', 'RO')).toBe(true) // Romania
        expect(isValidPostalCode('MD-2001', 'MD')).toBe(true) // Moldova
      })

      it('should reject invalid postal codes', () => {
        expect(isValidPostalCode('280011', 'ES')).toBe(false) // Too long for Spain
        expect(isValidPostalCode('12345', 'RO')).toBe(false) // Too short for Romania
      })
    })

    describe('Credit Card Validation', () => {
      it('should validate card numbers', () => {
        expect(isValidCardNumber('4111111111111111')).toBe(true)
        expect(isValidCardNumber('4111 1111 1111 1111')).toBe(true)
      })

      it('should reject invalid card numbers', () => {
        expect(isValidCardNumber('123')).toBe(false)
        expect(isValidCardNumber('abcd1234')).toBe(false)
      })

      it('should validate Luhn algorithm', () => {
        expect(isValidLuhn('4111111111111111')).toBe(true) // Valid Visa test card
        expect(isValidLuhn('5555555555554444')).toBe(true) // Valid Mastercard test card
        expect(isValidLuhn('1234567890123456')).toBe(false) // Invalid
      })

      it('should detect card brands', () => {
        expect(getCardBrand('4111111111111111')).toBe('visa')
        expect(getCardBrand('5555555555554444')).toBe('mastercard')
        expect(getCardBrand('378282246310005')).toBe('amex')
        expect(getCardBrand('1234567890123456')).toBe('unknown')
      })
    })
  })
})
