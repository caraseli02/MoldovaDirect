/**
 * Unit tests for useCheckoutValidation composable
 *
 * Tests checkout validation logic for address, payment, and order placement readiness.
 */

import { describe, it, expect } from 'vitest'
import { ref, computed } from 'vue'
import type { PaymentMethod, ShippingMethod } from '~/types/checkout'

interface CheckoutValidationOptions {
  isAddressValid: ReturnType<typeof ref<boolean>>
  shippingAddress: ReturnType<typeof ref<{ firstName?: string, street?: string }>>
  selectedMethod: ReturnType<typeof ref<ShippingMethod | null>>
  isGuestInfoValid: ReturnType<typeof ref<boolean>>
  paymentMethod: ReturnType<typeof ref<PaymentMethod>>
  stripeReady: ReturnType<typeof ref<boolean>>
  stripeError: ReturnType<typeof ref<string | null>>
  termsAccepted: ReturnType<typeof ref<boolean>>
  privacyAccepted: ReturnType<typeof ref<boolean>>
  isAuthenticated: ReturnType<typeof ref<boolean>>
}

function createUseCheckoutValidation(options: CheckoutValidationOptions) {
  const {
    isAddressValid,
    shippingAddress,
    selectedMethod,
    isGuestInfoValid,
    paymentMethod,
    stripeReady,
    stripeError,
    termsAccepted,
    privacyAccepted,
    isAuthenticated,
  } = options

  /**
   * Check if address has minimum required fields
   */
  const isAddressComplete = computed(() => {
    return isAddressValid.value && !!shippingAddress.value.firstName && !!shippingAddress.value.street
  })

  /**
   * Check if payment method is valid based on type
   */
  const isPaymentValid = computed(() => {
    if (paymentMethod.value.type === 'cash') {
      return true
    }
    if (paymentMethod.value.type === 'credit_card') {
      return stripeReady.value && !stripeError.value && !!paymentMethod.value.creditCard?.holderName
    }
    return false
  })

  /**
   * Check if shipping method has validation errors
   */
  const shippingMethodValidationError = computed(() => {
    if (!selectedMethod.value) {
      return 'Shipping method is required'
    }
    return null
  })

  /**
   * Check if "Place Order" button can be shown
   */
  const canShowPlaceOrder = computed(() => {
    return isAddressValid.value && selectedMethod.value !== null && isPaymentValid.value
  })

  /**
   * Check if order can be placed
   */
  const canPlaceOrder = computed(() => {
    const guestCheckPassed = isAuthenticated.value ? true : isGuestInfoValid.value
    return (
      guestCheckPassed
      && isAddressValid.value
      && selectedMethod.value !== null
      && isPaymentValid.value
      && termsAccepted.value
      && privacyAccepted.value
    )
  })

  return {
    isAddressComplete,
    isPaymentValid,
    shippingMethodValidationError,
    canShowPlaceOrder,
    canPlaceOrder,
  }
}

describe('useCheckoutValidation', () => {
  const defaultOptions: CheckoutValidationOptions = {
    isAddressValid: ref(false),
    shippingAddress: ref({}),
    selectedMethod: ref<ShippingMethod | null>(null),
    isGuestInfoValid: ref(false),
    paymentMethod: ref<PaymentMethod>({ type: 'cash', saveForFuture: false }),
    stripeReady: ref(false),
    stripeError: ref<string | null>(null),
    termsAccepted: ref(false),
    privacyAccepted: ref(false),
    isAuthenticated: ref(false),
  }

  describe('isAddressComplete', () => {
    it('should return false when address not valid', () => {
      const options = { ...defaultOptions, isAddressValid: ref(false), shippingAddress: ref({ firstName: 'John', street: 'Main St' }) }
      const { isAddressComplete } = createUseCheckoutValidation(options)

      expect(isAddressComplete.value).toBe(false)
    })

    it('should return false when firstName missing', () => {
      const options = { ...defaultOptions, isAddressValid: ref(true), shippingAddress: ref({ street: 'Main St' }) }
      const { isAddressComplete } = createUseCheckoutValidation(options)

      expect(isAddressComplete.value).toBe(false)
    })

    it('should return false when street missing', () => {
      const options = { ...defaultOptions, isAddressValid: ref(true), shippingAddress: ref({ firstName: 'John' }) }
      const { isAddressComplete } = createUseCheckoutValidation(options)

      expect(isAddressComplete.value).toBe(false)
    })

    it('should return true when all required fields present', () => {
      const options = { ...defaultOptions, isAddressValid: ref(true), shippingAddress: ref({ firstName: 'John', street: 'Main St' }) }
      const { isAddressComplete } = createUseCheckoutValidation(options)

      expect(isAddressComplete.value).toBe(true)
    })
  })

  describe('isPaymentValid', () => {
    it('should return true for cash payment', () => {
      const options = { ...defaultOptions, paymentMethod: ref({ type: 'cash', saveForFuture: false }) }
      const { isPaymentValid } = createUseCheckoutValidation(options)

      expect(isPaymentValid.value).toBe(true)
    })

    it('should return false for credit card when Stripe not ready', () => {
      const options = {
        ...defaultOptions,
        paymentMethod: ref({ type: 'credit_card', saveForFuture: false, creditCard: { holderName: 'John Doe' } }),
        stripeReady: ref(false),
      }
      const { isPaymentValid } = createUseCheckoutValidation(options)

      expect(isPaymentValid.value).toBe(false)
    })

    it('should return false for credit card when there is a Stripe error', () => {
      const options = {
        ...defaultOptions,
        paymentMethod: ref({ type: 'credit_card', saveForFuture: false, creditCard: { holderName: 'John Doe' } }),
        stripeReady: ref(true),
        stripeError: ref('Invalid card'),
      }
      const { isPaymentValid } = createUseCheckoutValidation(options)

      expect(isPaymentValid.value).toBe(false)
    })

    it('should return false for credit card when holder name missing', () => {
      const options = {
        ...defaultOptions,
        paymentMethod: ref({ type: 'credit_card', saveForFuture: false }),
        stripeReady: ref(true),
        stripeError: ref(null),
      }
      const { isPaymentValid } = createUseCheckoutValidation(options)

      expect(isPaymentValid.value).toBe(false)
    })

    it('should return true for credit card when all conditions met', () => {
      const options = {
        ...defaultOptions,
        paymentMethod: ref({ type: 'credit_card', saveForFuture: false, creditCard: { holderName: 'John Doe' } }),
        stripeReady: ref(true),
        stripeError: ref(null),
      }
      const { isPaymentValid } = createUseCheckoutValidation(options)

      expect(isPaymentValid.value).toBe(true)
    })
  })

  describe('shippingMethodValidationError', () => {
    it('should return error message when no method selected', () => {
      const options = { ...defaultOptions, selectedMethod: ref<ShippingMethod | null>(null) }
      const { shippingMethodValidationError } = createUseCheckoutValidation(options)

      expect(shippingMethodValidationError.value).toBe('Shipping method is required')
    })

    it('should return null when method selected', () => {
      const options = {
        ...defaultOptions,
        selectedMethod: ref({ id: 'standard', name: 'Standard', price: 5.99, estimatedDays: 4 }),
      }
      const { shippingMethodValidationError } = createUseCheckoutValidation(options)

      expect(shippingMethodValidationError.value).toBe(null)
    })
  })

  describe('canShowPlaceOrder', () => {
    it('should return false when address not valid', () => {
      const options = {
        ...defaultOptions,
        isAddressValid: ref(false),
        selectedMethod: ref({ id: 'standard', name: 'Standard', price: 5.99, estimatedDays: 4 }),
      }
      const { canShowPlaceOrder } = createUseCheckoutValidation(options)

      expect(canShowPlaceOrder.value).toBe(false)
    })

    it('should return false when no shipping method selected', () => {
      const options = {
        ...defaultOptions,
        isAddressValid: ref(true),
        selectedMethod: ref<ShippingMethod | null>(null),
      }
      const { canShowPlaceOrder } = createUseCheckoutValidation(options)

      expect(canShowPlaceOrder.value).toBe(false)
    })

    it('should return false when payment not valid', () => {
      const options = {
        ...defaultOptions,
        isAddressValid: ref(true),
        selectedMethod: ref({ id: 'standard', name: 'Standard', price: 5.99, estimatedDays: 4 }),
        paymentMethod: ref({ type: 'credit_card', saveForFuture: false }),
        stripeReady: ref(false),
      }
      const { canShowPlaceOrder } = createUseCheckoutValidation(options)

      expect(canShowPlaceOrder.value).toBe(false)
    })

    it('should return true when all conditions met', () => {
      const options = {
        ...defaultOptions,
        isAddressValid: ref(true),
        selectedMethod: ref({ id: 'standard', name: 'Standard', price: 5.99, estimatedDays: 4 }),
        paymentMethod: ref({ type: 'cash', saveForFuture: false }),
      }
      const { canShowPlaceOrder } = createUseCheckoutValidation(options)

      expect(canShowPlaceOrder.value).toBe(true)
    })
  })

  describe('canPlaceOrder for authenticated users', () => {
    it('should skip guest validation for authenticated users', () => {
      const options = {
        ...defaultOptions,
        isAuthenticated: ref(true),
        isGuestInfoValid: ref(false), // Should be ignored
        isAddressValid: ref(true),
        selectedMethod: ref({ id: 'standard', name: 'Standard', price: 5.99, estimatedDays: 4 }),
        paymentMethod: ref({ type: 'cash', saveForFuture: false }),
        termsAccepted: ref(true),
        privacyAccepted: ref(true),
      }
      const { canPlaceOrder } = createUseCheckoutValidation(options)

      expect(canPlaceOrder.value).toBe(true)
    })

    it('should require all conditions for authenticated users', () => {
      const options = {
        ...defaultOptions,
        isAuthenticated: ref(true),
        isAddressValid: ref(true),
        selectedMethod: ref({ id: 'standard', name: 'Standard', price: 5.99, estimatedDays: 4 }),
        paymentMethod: ref({ type: 'cash', saveForFuture: false }),
        termsAccepted: ref(true),
        privacyAccepted: ref(false), // Missing
      }
      const { canPlaceOrder } = createUseCheckoutValidation(options)

      expect(canPlaceOrder.value).toBe(false)
    })
  })

  describe('canPlaceOrder for guest users', () => {
    it('should require guest info validation', () => {
      const options = {
        ...defaultOptions,
        isAuthenticated: ref(false),
        isGuestInfoValid: ref(false), // Missing
        isAddressValid: ref(true),
        selectedMethod: ref({ id: 'standard', name: 'Standard', price: 5.99, estimatedDays: 4 }),
        paymentMethod: ref({ type: 'cash', saveForFuture: false }),
        termsAccepted: ref(true),
        privacyAccepted: ref(true),
      }
      const { canPlaceOrder } = createUseCheckoutValidation(options)

      expect(canPlaceOrder.value).toBe(false)
    })

    it('should return true when all conditions including guest info are met', () => {
      const options = {
        ...defaultOptions,
        isAuthenticated: ref(false),
        isGuestInfoValid: ref(true),
        isAddressValid: ref(true),
        selectedMethod: ref({ id: 'standard', name: 'Standard', price: 5.99, estimatedDays: 4 }),
        paymentMethod: ref({ type: 'cash', saveForFuture: false }),
        termsAccepted: ref(true),
        privacyAccepted: ref(true),
      }
      const { canPlaceOrder } = createUseCheckoutValidation(options)

      expect(canPlaceOrder.value).toBe(true)
    })
  })
})
