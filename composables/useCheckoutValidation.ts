/**
 * Checkout Validation Composable
 *
 * Centralizes all checkout validation logic.
 * Computes validation states for address, payment, and terms.
 *
 * @see {CODE_DESIGN_PRINCIPLES.md} Three-layer separation
 */

import { computed, type Ref } from 'vue'
import type { PaymentMethod, ShippingMethod, Address } from '~/types/checkout'

export interface CheckoutValidationOptions {
  isAddressValid: Ref<boolean>
  shippingAddress: Ref<Partial<Pick<Address, 'firstName' | 'street' | 'city' | 'postalCode' | 'country'>>>
  selectedMethod: Ref<ShippingMethod | null>
  isGuestInfoValid: Ref<boolean>
  paymentMethod: Ref<PaymentMethod>
  stripeReady: Ref<boolean>
  stripeError: Ref<string | null>
  termsAccepted: Ref<boolean>
  privacyAccepted: Ref<boolean>
  isAuthenticated: Ref<boolean>
}

export function useCheckoutValidation(options: CheckoutValidationOptions) {
  const { t } = useI18n()

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
   * Check if shipping address is complete (has name and street)
   */
  const isAddressComplete = computed(() => {
    return isAddressValid.value
      && !!shippingAddress.value.firstName
      && !!shippingAddress.value.street
      && !!shippingAddress.value.city
      && !!shippingAddress.value.postalCode
      && !!shippingAddress.value.country
  })

  /**
   * Check if payment method is valid
   * - Cash: always valid
   * - Credit card: requires Stripe ready, no errors, and holder name
   */
  const isPaymentValid = computed(() => {
    if (paymentMethod.value.type === 'cash') {
      return true
    }
    if (paymentMethod.value.type === 'credit_card') {
      return stripeReady.value
        && !stripeError.value
        && !!paymentMethod.value.creditCard?.holderName
    }
    return false
  })

  /**
   * Validation error message for shipping method
   */
  const shippingMethodValidationError = computed(() => {
    if (!selectedMethod.value && isAddressValid.value) {
      return t('checkout.validation.shippingMethodRequired')
    }
    return null
  })

  /**
   * Check if we can show the place order section
   */
  const canShowPlaceOrder = computed(() => {
    return isAddressValid.value
      && !!selectedMethod.value
      && isPaymentValid.value
  })

  /**
   * Check if all conditions are met to place order
   */
  const canPlaceOrder = computed(() => {
    const guestCheckPassed = isAuthenticated.value ? true : isGuestInfoValid.value
    return guestCheckPassed
      && isAddressValid.value
      && selectedMethod.value !== null
      && isPaymentValid.value
      && termsAccepted.value
      && privacyAccepted.value
  })

  return {
    isAddressComplete,
    isPaymentValid,
    shippingMethodValidationError,
    canShowPlaceOrder,
    canPlaceOrder,
  }
}
