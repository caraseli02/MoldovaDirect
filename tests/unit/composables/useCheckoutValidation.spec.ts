/**
 * Unit tests for useCheckoutValidation composable
 *
 * Tests checkout validation logic for address, payment, and order placement readiness.
 */

import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import type { PaymentMethod, ShippingMethod } from '~/types/checkout'
import { useCheckoutValidation } from '~/composables/useCheckoutValidation'

describe('useCheckoutValidation', () => {
  const createDefaultOptions = () => ({
    isAddressValid: ref(false),
    shippingAddress: ref<Partial<{ firstName: string, street: string }>>({}),
    selectedMethod: ref<ShippingMethod | null>(null),
    isGuestInfoValid: ref(false),
    paymentMethod: ref<PaymentMethod>({ type: 'cash', saveForFuture: false }),
    stripeReady: ref(false),
    stripeError: ref<string | null>(null),
    termsAccepted: ref(false),
    privacyAccepted: ref(false),
    isAuthenticated: ref(false),
  })

  describe('isAddressComplete', () => {
    it('should return false when address not valid', () => {
      const options = createDefaultOptions()
      options.isAddressValid.value = false
      options.shippingAddress.value = { firstName: 'John', street: 'Main St' }

      const { isAddressComplete } = useCheckoutValidation(options)

      expect(isAddressComplete.value).toBe(false)
    })

    it('should return false when firstName missing', () => {
      const options = createDefaultOptions()
      options.isAddressValid.value = true
      options.shippingAddress.value = { street: 'Main St' }

      const { isAddressComplete } = useCheckoutValidation(options)

      expect(isAddressComplete.value).toBe(false)
    })

    it('should return false when street missing', () => {
      const options = createDefaultOptions()
      options.isAddressValid.value = true
      options.shippingAddress.value = { firstName: 'John' }

      const { isAddressComplete } = useCheckoutValidation(options)

      expect(isAddressComplete.value).toBe(false)
    })

    it('should return true when all required fields present', () => {
      const options = createDefaultOptions()
      options.isAddressValid.value = true
      options.shippingAddress.value = { firstName: 'John', street: 'Main St' }

      const { isAddressComplete } = useCheckoutValidation(options)

      expect(isAddressComplete.value).toBe(true)
    })
  })

  describe('isPaymentValid', () => {
    it('should return true for cash payment', () => {
      const options = createDefaultOptions()
      options.paymentMethod.value = { type: 'cash', saveForFuture: false }

      const { isPaymentValid } = useCheckoutValidation(options)

      expect(isPaymentValid.value).toBe(true)
    })

    it('should return false for credit card when Stripe not ready', () => {
      const options = createDefaultOptions()
      options.paymentMethod.value = { type: 'credit_card', saveForFuture: false, creditCard: { holderName: 'John Doe' } }
      options.stripeReady.value = false

      const { isPaymentValid } = useCheckoutValidation(options)

      expect(isPaymentValid.value).toBe(false)
    })

    it('should return false for credit card when there is a Stripe error', () => {
      const options = createDefaultOptions()
      options.paymentMethod.value = { type: 'credit_card', saveForFuture: false, creditCard: { holderName: 'John Doe' } }
      options.stripeReady.value = true
      options.stripeError.value = 'Invalid card'

      const { isPaymentValid } = useCheckoutValidation(options)

      expect(isPaymentValid.value).toBe(false)
    })

    it('should return false for credit card when holder name missing', () => {
      const options = createDefaultOptions()
      options.paymentMethod.value = { type: 'credit_card', saveForFuture: false }
      options.stripeReady.value = true
      options.stripeError.value = null

      const { isPaymentValid } = useCheckoutValidation(options)

      expect(isPaymentValid.value).toBe(false)
    })

    it('should return true for credit card when all conditions met', () => {
      const options = createDefaultOptions()
      options.paymentMethod.value = { type: 'credit_card', saveForFuture: false, creditCard: { holderName: 'John Doe' } }
      options.stripeReady.value = true
      options.stripeError.value = null

      const { isPaymentValid } = useCheckoutValidation(options)

      expect(isPaymentValid.value).toBe(true)
    })

    it('should return false for unknown payment method types', () => {
      const options = createDefaultOptions()
      options.paymentMethod.value = { type: 'unknown_method' as any, saveForFuture: false }

      const { isPaymentValid } = useCheckoutValidation(options)

      expect(isPaymentValid.value).toBe(false)
    })
  })

  describe('shippingMethodValidationError', () => {
    it('should return error message when no method selected and address is valid', () => {
      const options = createDefaultOptions()
      options.selectedMethod.value = null
      options.isAddressValid.value = true

      const { shippingMethodValidationError } = useCheckoutValidation(options)

      expect(shippingMethodValidationError.value).toBe('checkout.validation.shippingMethodRequired')
    })

    it('should return null when no method selected but address is invalid', () => {
      const options = createDefaultOptions()
      options.selectedMethod.value = null
      options.isAddressValid.value = false

      const { shippingMethodValidationError } = useCheckoutValidation(options)

      expect(shippingMethodValidationError.value).toBe(null)
    })

    it('should return null when method selected', () => {
      const options = createDefaultOptions()
      options.selectedMethod.value = { id: 'standard', name: 'Standard', price: 5.99, estimatedDays: 4 }

      const { shippingMethodValidationError } = useCheckoutValidation(options)

      expect(shippingMethodValidationError.value).toBe(null)
    })
  })

  describe('canShowPlaceOrder', () => {
    it('should return false when address not valid', () => {
      const options = createDefaultOptions()
      options.isAddressValid.value = false
      options.selectedMethod.value = { id: 'standard', name: 'Standard', price: 5.99, estimatedDays: 4 }

      const { canShowPlaceOrder } = useCheckoutValidation(options)

      expect(canShowPlaceOrder.value).toBe(false)
    })

    it('should return false when no shipping method selected', () => {
      const options = createDefaultOptions()
      options.isAddressValid.value = true
      options.selectedMethod.value = null

      const { canShowPlaceOrder } = useCheckoutValidation(options)

      expect(canShowPlaceOrder.value).toBe(false)
    })

    it('should return false when payment not valid', () => {
      const options = createDefaultOptions()
      options.isAddressValid.value = true
      options.selectedMethod.value = { id: 'standard', name: 'Standard', price: 5.99, estimatedDays: 4 }
      options.paymentMethod.value = { type: 'credit_card', saveForFuture: false }
      options.stripeReady.value = false

      const { canShowPlaceOrder } = useCheckoutValidation(options)

      expect(canShowPlaceOrder.value).toBe(false)
    })

    it('should return true when all conditions met', () => {
      const options = createDefaultOptions()
      options.isAddressValid.value = true
      options.selectedMethod.value = { id: 'standard', name: 'Standard', price: 5.99, estimatedDays: 4 }
      options.paymentMethod.value = { type: 'cash', saveForFuture: false }

      const { canShowPlaceOrder } = useCheckoutValidation(options)

      expect(canShowPlaceOrder.value).toBe(true)
    })
  })

  describe('canPlaceOrder for authenticated users', () => {
    it('should skip guest validation for authenticated users', () => {
      const options = createDefaultOptions()
      options.isAuthenticated.value = true
      options.isGuestInfoValid.value = false // Should be ignored
      options.isAddressValid.value = true
      options.selectedMethod.value = { id: 'standard', name: 'Standard', price: 5.99, estimatedDays: 4 }
      options.paymentMethod.value = { type: 'cash', saveForFuture: false }
      options.termsAccepted.value = true
      options.privacyAccepted.value = true

      const { canPlaceOrder } = useCheckoutValidation(options)

      expect(canPlaceOrder.value).toBe(true)
    })

    it('should require all conditions for authenticated users', () => {
      const options = createDefaultOptions()
      options.isAuthenticated.value = true
      options.isAddressValid.value = true
      options.selectedMethod.value = { id: 'standard', name: 'Standard', price: 5.99, estimatedDays: 4 }
      options.paymentMethod.value = { type: 'cash', saveForFuture: false }
      options.termsAccepted.value = true
      options.privacyAccepted.value = false // Missing

      const { canPlaceOrder } = useCheckoutValidation(options)

      expect(canPlaceOrder.value).toBe(false)
    })
  })

  describe('canPlaceOrder for guest users', () => {
    it('should require guest info validation', () => {
      const options = createDefaultOptions()
      options.isAuthenticated.value = false
      options.isGuestInfoValid.value = false // Missing
      options.isAddressValid.value = true
      options.selectedMethod.value = { id: 'standard', name: 'Standard', price: 5.99, estimatedDays: 4 }
      options.paymentMethod.value = { type: 'cash', saveForFuture: false }
      options.termsAccepted.value = true
      options.privacyAccepted.value = true

      const { canPlaceOrder } = useCheckoutValidation(options)

      expect(canPlaceOrder.value).toBe(false)
    })

    it('should return true when all conditions including guest info are met', () => {
      const options = createDefaultOptions()
      options.isAuthenticated.value = false
      options.isGuestInfoValid.value = true
      options.isAddressValid.value = true
      options.selectedMethod.value = { id: 'standard', name: 'Standard', price: 5.99, estimatedDays: 4 }
      options.paymentMethod.value = { type: 'cash', saveForFuture: false }
      options.termsAccepted.value = true
      options.privacyAccepted.value = true

      const { canPlaceOrder } = useCheckoutValidation(options)

      expect(canPlaceOrder.value).toBe(true)
    })
  })
})
