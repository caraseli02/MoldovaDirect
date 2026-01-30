/**
 * Checkout Order Processing Composable
 *
 * Handles order placement, express checkout, and payment processing.
 *
 * @see {CODE_DESIGN_PRINCIPLES.md} Three-layer separation
 */

import { ref, type Ref, onUnmounted } from 'vue'
import type { Address, PaymentMethod, ShippingInformation, ShippingMethod } from '~/types/checkout'
import { useCheckoutStore } from '~/stores/checkout'
import { useCheckoutSessionStore } from '~/stores/checkout/session'
import {
  createPaymentError,
  createSystemError,
  createValidationError,
  CheckoutErrorCode,
  logCheckoutError,
  parseApiError,
} from '~/utils/checkout-errors'
import { useStripePayment } from '~/composables/checkout/useStripePayment'

export interface ValidatableForm {
  validateForm: () => boolean
}

export interface PaymentForm extends ValidatableForm {
  getStripeCardElement: () => any
}

export interface CheckoutOrderOptions {
  total: Ref<number>
  shippingAddress: Ref<Address>
  selectedMethod: Ref<ShippingMethod | null>
  shippingInstructions: Ref<string>
  paymentMethod: Ref<PaymentMethod>
  marketingConsent: Ref<boolean>
  defaultAddress: Ref<Address | null>
  addressFormRef: Ref<ValidatableForm | null>
  paymentSectionRef: Ref<PaymentForm | null>
}

export function useCheckoutOrder(options: CheckoutOrderOptions) {
  const { t } = useI18n()
  const toast = useToast()
  const localePath = useLocalePath()
  const checkoutStore = useCheckoutStore()
  const sessionStore = useCheckoutSessionStore()

  const {
    total,
    shippingAddress,
    selectedMethod,
    shippingInstructions,
    paymentMethod,
    marketingConsent,
    defaultAddress,
    addressFormRef,
    paymentSectionRef,
  } = options

  // State
  const processingOrder = ref(false)
  const navigationTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Process order and navigate to confirmation
   */
  const processOrder = async (): Promise<void> => {
    checkoutStore.setTermsAccepted(true)
    checkoutStore.setPrivacyAccepted(true)
    checkoutStore.setMarketingConsent(marketingConsent.value)
    sessionStore.setCurrentStep('review')

    try {
      if (paymentMethod.value.type === 'credit_card') {
        const { processStripePayment } = useStripePayment({
          total,
          shippingAddress,
          paymentMethod,
          paymentSectionRef,
          checkoutStore,
        })
        await processStripePayment()
      }
      else {
        await checkoutStore.processPayment()
      }
    }
    catch (paymentError: unknown) {
      const checkoutError = paymentError instanceof Error
        ? createPaymentError(getErrorMessage(paymentError), CheckoutErrorCode.PAYMENT_PROCESSING_ERROR)
        : createPaymentError('Payment processing failed', CheckoutErrorCode.PAYMENT_PROCESSING_ERROR)
      logCheckoutError(checkoutError, { sessionId: checkoutStore.sessionId ?? undefined, step: 'processOrder', paymentMethod: paymentMethod.value.type }, paymentError)
      throw paymentError
    }

    try {
      await navigateTo(localePath('/checkout/confirmation'))
    }
    catch (navError: unknown) {
      const checkoutError = createSystemError('Navigation failed after payment', CheckoutErrorCode.SYSTEM_ERROR)
      logCheckoutError(checkoutError, { sessionId: checkoutStore.sessionId ?? undefined, step: 'navigation' }, navError)
      toast.warning(t('checkout.success.orderCompleted'), t('checkout.errors.redirectManually', 'Please navigate to your orders to see confirmation.'))
      navigationTimeout.value = setTimeout(() => {
        window.location.href = localePath('/checkout/confirmation')
      }, 2000)
      throw new Error('Payment succeeded but navigation failed', { cause: navError })
    }
  }

  /**
   * Handle express checkout placement (for returning users)
   */
  const handleExpressPlaceOrder = async (): Promise<void> => {
    if (!defaultAddress.value) {
      const checkoutError = createValidationError('address', 'Default address not found for express checkout', CheckoutErrorCode.REQUIRED_FIELD_MISSING)
      logCheckoutError(checkoutError, { sessionId: checkoutStore.sessionId ?? undefined, step: 'expressCheckout' })
      toast.error(t('checkout.errors.addressRequired', 'Address Required'), t('checkout.errors.selectAddress', 'Please select a delivery address to continue'))
      return
    }

    processingOrder.value = true

    try {
      const defaultMethod: ShippingMethod = {
        id: 'standard',
        name: t('checkout.shippingMethod.standard.name', 'Standard Shipping'),
        description: t('checkout.shippingMethod.standard.description', 'Delivery in 3-5 business days'),
        price: 5.99,
        estimatedDays: 4,
      }

      const shippingInfo: ShippingInformation = {
        address: defaultAddress.value,
        method: defaultMethod,
        instructions: undefined,
      }

      await checkoutStore.updateShippingInfo(shippingInfo)
      await checkoutStore.updatePaymentMethod({ type: 'cash', saveForFuture: false })
      await processOrder()
    }
    catch (error: unknown) {
      console.error('Express checkout failed:', error)
      const checkoutError = parseApiError(error)
      logCheckoutError(checkoutError, { sessionId: checkoutStore.sessionId ?? undefined, step: 'expressCheckout' }, error)

      if (checkoutError.type === 'network') {
        toast.error(t('checkout.errors.networkError', 'Connection Error'), t('checkout.errors.checkConnection', 'Please check your internet connection and try again.'))
      }
      else if (checkoutError.code === CheckoutErrorCode.SESSION_EXPIRED || checkoutError.code === CheckoutErrorCode.UNAUTHORIZED) {
        toast.error(t('checkout.errors.sessionExpired', 'Session Expired'), t('checkout.errors.refreshPage', 'Your session has expired. Please refresh the page.'))
      }
      else if (checkoutError.type === 'validation') {
        toast.error(t('checkout.errors.invalidInformation', 'Please Check Your Information'), checkoutError.userAction || t('checkout.errors.reviewFields'))
      }
      else {
        toast.error(t('checkout.errors.expressCheckoutFailed', 'Express Checkout Failed'), checkoutError.userAction || t('checkout.errors.tryFullCheckout'))
      }
    }
    finally {
      processingOrder.value = false
    }
  }

  /**
   * Handle full checkout placement
   */
  const handlePlaceOrder = async (guestInfo?: { email: string, emailUpdates: boolean }): Promise<void> => {
    processingOrder.value = true

    if (!selectedMethod.value) {
      const checkoutError = createValidationError('shipping', 'Shipping method is required', CheckoutErrorCode.REQUIRED_FIELD_MISSING)
      logCheckoutError(checkoutError, { sessionId: checkoutStore.sessionId ?? undefined, step: 'handlePlaceOrder' })
      toast.error(t('checkout.errors.shippingRequired', 'Shipping Required'), t('checkout.errors.selectShippingMethod', 'Please select a shipping method'))
      processingOrder.value = false
      return
    }

    try {
      const shippingInfo: ShippingInformation = {
        address: shippingAddress.value,
        method: selectedMethod.value,
        instructions: shippingInstructions.value || undefined,
      }

      if (guestInfo) {
        await checkoutStore.updateGuestInfo({ email: guestInfo.email.trim(), emailUpdates: guestInfo.emailUpdates })
      }

      await checkoutStore.updateShippingInfo(shippingInfo)
      await checkoutStore.updatePaymentMethod(paymentMethod.value)
      await processOrder()
    }
    catch (error: unknown) {
      console.error('Failed to place order:', error)
      const checkoutError = parseApiError(error)
      logCheckoutError(checkoutError, { sessionId: checkoutStore.sessionId ?? undefined, step: 'placeOrder' }, error)

      if (checkoutError.type === 'network') {
        toast.error(t('checkout.errors.networkError', 'Connection Error'), t('checkout.errors.checkConnection', 'Please check your internet connection and try again.'))
      }
      else if (checkoutError.type === 'validation') {
        toast.error(t('checkout.errors.validationFailed', 'Please Check Your Information'), checkoutError.userAction || t('checkout.errors.reviewFields'))
      }
      else if (checkoutError.type === 'payment') {
        toast.error(t('checkout.errors.paymentFailed', 'Payment Failed'), checkoutError.userAction || t('checkout.errors.pleaseTryAgain'))
      }
      else {
        toast.error(t('checkout.errors.orderFailed', 'Order Failed'), checkoutError.userAction || t('checkout.errors.pleaseTryAgain'))
      }
    }
    finally {
      processingOrder.value = false
    }
  }

  /**
   * Validate forms before placing order
   */
  const validateForms = async (): Promise<boolean> => {
    if (addressFormRef.value && !addressFormRef.value.validateForm()) {
      const checkoutError = createValidationError('address', 'Address validation failed', CheckoutErrorCode.VALIDATION_FAILED)
      logCheckoutError(checkoutError, { sessionId: checkoutStore.sessionId ?? undefined, step: 'validateAddress', address: shippingAddress.value })
      toast.error(t('checkout.validation.error'), t('checkout.validation.addressInvalid'))
      return false
    }

    if (paymentSectionRef.value && !paymentSectionRef.value.validateForm()) {
      const checkoutError = createValidationError('payment', 'Payment validation failed', CheckoutErrorCode.VALIDATION_FAILED)
      logCheckoutError(checkoutError, { sessionId: checkoutStore.sessionId ?? undefined, step: 'validatePayment', paymentMethod: paymentMethod.value.type })
      toast.error(t('checkout.validation.error'), t('checkout.validation.paymentInvalid'))
      return false
    }

    return true
  }

  // Cleanup
  onUnmounted(() => {
    if (navigationTimeout.value) clearTimeout(navigationTimeout.value)
  })

  return {
    processingOrder,
    handleExpressPlaceOrder,
    handlePlaceOrder,
    validateForms,
  }
}
