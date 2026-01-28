/**
 * Checkout Order Processing Composable
 *
 * Handles order placement, express checkout, and payment processing.
 * Manages Stripe integration for credit card payments.
 *
 * @see {CODE_DESIGN_PRINCIPLES.md} Three-layer separation
 */

import { ref, type Ref, onUnmounted } from 'vue'
import type { Address, PaymentMethod, ShippingInformation, ShippingMethod } from '~/types/checkout'
import { useCheckoutStore } from '~/stores/checkout'
import { useCheckoutSessionStore } from '~/stores/checkout/session'
import {
  createNetworkError,
  createPaymentError,
  createSystemError,
  createValidationError,
  CheckoutErrorCode,
  logCheckoutError,
  parseApiError,
} from '~/utils/checkout-errors'

// Form ref interfaces for better type safety
export interface ValidatableForm {
  validateForm: () => boolean
}

/**
 * Minimal interface for Stripe card element.
 * The actual Stripe.js type is not imported to avoid dependency on @stripe/stripe-js
 * but this interface provides type safety for the critical methods we use.
 */
export interface StripeCardElement {
  mount: () => void
  destroy: () => void
  _elementTag: string
}

export interface PaymentForm extends ValidatableForm {
  getStripeCardElement: () => StripeCardElement | null
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
   * Process Stripe payment for credit cards
   */
  const processStripePayment = async (): Promise<void> => {
    const { useStripe } = await import('~/composables/useStripe')
    const { stripe, initializeStripe } = useStripe()

    // Ensure Stripe is initialized with proper error handling
    if (!stripe.value) {
      try {
        await initializeStripe()
      }
      catch (initError: unknown) {
        const checkoutError = createSystemError(
          'Failed to initialize payment provider',
          CheckoutErrorCode.PAYMENT_PROCESSING_ERROR,
        )
        logCheckoutError(
          checkoutError,
          {
            sessionId: checkoutStore.sessionId ?? undefined,
            step: 'initializeStripe',
          },
          initError,
        )
        throw new Error('Payment service is temporarily unavailable. Please try again or use cash payment.', { cause: initError })
      }
    }

    if (!stripe.value) {
      const checkoutError = createSystemError(
        'Payment service not initialized',
        CheckoutErrorCode.PAYMENT_PROCESSING_ERROR,
      )
      logCheckoutError(checkoutError, {
        sessionId: checkoutStore.sessionId ?? undefined,
        step: 'processStripePayment',
      })
      throw new Error('Payment service is not available. Please refresh the page or try again later.')
    }

    // Get the Stripe card element from the payment form
    const cardElement = paymentSectionRef.value?.getStripeCardElement()
    if (!cardElement) {
      const checkoutError = createSystemError(
        'Card element not available or invalid',
        CheckoutErrorCode.PAYMENT_PROCESSING_ERROR,
      )
      logCheckoutError(checkoutError, {
        sessionId: checkoutStore.sessionId ?? undefined,
        step: 'processStripePayment',
        hasRef: !!paymentSectionRef.value,
        hasGetElement: typeof paymentSectionRef.value?.getStripeCardElement === 'function',
      })
      throw new Error('Payment form is not ready. Please wait a moment and try again, or refresh the page.')
    }

    // Validate the element has the expected Stripe structure
    const stripeCardElement: StripeCardElement = cardElement
    if (typeof stripeCardElement.mount !== 'function' || typeof stripeCardElement.destroy !== 'function') {
      const checkoutError = createSystemError(
        'Card element has invalid structure',
        CheckoutErrorCode.PAYMENT_PROCESSING_ERROR,
      )
      logCheckoutError(checkoutError, {
        sessionId: checkoutStore.sessionId ?? undefined,
        step: 'processStripePayment',
        elementTag: stripeCardElement._elementTag,
      })
      throw new Error('Payment element is invalid. Please refresh the page and try again.')
    }

    // Create payment intent on server with error handling
    let paymentIntentData
    try {
      paymentIntentData = await $fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        body: {
          amount: Math.round(total.value * 100), // Convert to cents
          currency: 'eur',
          sessionId: checkoutStore.sessionId || 'temp-session',
        },
      })
    }
    catch (fetchError: unknown) {
      const checkoutError = createNetworkError(
        'Failed to connect to payment server',
        CheckoutErrorCode.NETWORK_ERROR,
      )
      logCheckoutError(
        checkoutError,
        {
          sessionId: checkoutStore.sessionId ?? undefined,
          step: 'createPaymentIntent',
        },
        fetchError,
      )
      throw new Error('Could not connect to payment server. Please check your connection and try again.', { cause: fetchError })
    }

    if (!paymentIntentData?.success || !paymentIntentData?.paymentIntent?.client_secret) {
      const checkoutError = createPaymentError(
        'Payment initialization failed - invalid response from payment server',
        CheckoutErrorCode.PAYMENT_PROCESSING_ERROR,
      )
      logCheckoutError(checkoutError, {
        sessionId: checkoutStore.sessionId ?? undefined,
        step: 'createPaymentIntent',
        apiResponse: paymentIntentData,
      })
      throw new Error('Payment initialization failed. Please try again or contact support.')
    }

    // Confirm payment with Stripe
    // Note: Stripe.js expects its internal StripeCardElement type which we cannot
    // import without @stripe/stripe-js dependency. We validated the element structure
    // above and use 'as any' here to satisfy Stripe's type requirements.
    const { error: stripeError, paymentIntent } = await stripe.value.confirmCardPayment(
      paymentIntentData.paymentIntent.client_secret,
      {
        payment_method: {
          card: stripeCardElement as any, // eslint-disable-line @typescript-eslint/no-explicit-any -- Stripe requires internal type
          billing_details: {
            name: paymentMethod.value.creditCard?.holderName || '',
            address: {
              line1: shippingAddress.value.street || '',
              city: shippingAddress.value.city || '',
              postal_code: shippingAddress.value.postalCode || '',
              country: shippingAddress.value.country || '',
            },
          },
        },
      },
    )

    if (stripeError) {
      throw new Error(stripeError.message || 'Payment failed')
    }

    if (paymentIntent?.status !== 'succeeded') {
      throw new Error('Payment was not completed successfully')
    }

    // Store payment intent in checkout session store
    sessionStore.setPaymentIntent(paymentIntent.id)
    sessionStore.setPaymentClientSecret(paymentIntentData.paymentIntent.client_secret)

    // Update payment method with Stripe transaction details
    await checkoutStore.updatePaymentMethod({
      ...paymentMethod.value,
      stripePaymentIntentId: paymentIntent.id,
      transactionId: paymentIntent.id,
    })

    // Complete the checkout process
    await checkoutStore.processPayment()
  }

  /**
   * Process order and navigate to confirmation
   */
  const processOrder = async (): Promise<void> => {
    // Set terms acceptance in store before processing
    checkoutStore.setTermsAccepted(true)
    checkoutStore.setPrivacyAccepted(true)
    checkoutStore.setMarketingConsent(marketingConsent.value)

    // Set step to review for checkout flow
    sessionStore.setCurrentStep('review')

    try {
      // Handle Stripe payment processing for credit cards
      if (paymentMethod.value.type === 'credit_card') {
        await processStripePayment()
      }
      else {
        // Process other payment types (cash, etc.) using the unified checkout store method
        await checkoutStore.processPayment()
      }
    }
    catch (paymentError: unknown) {
      const checkoutError = paymentError instanceof Error
        ? createPaymentError(getErrorMessage(paymentError), CheckoutErrorCode.PAYMENT_PROCESSING_ERROR)
        : createPaymentError('Payment processing failed', CheckoutErrorCode.PAYMENT_PROCESSING_ERROR)
      logCheckoutError(checkoutError, {
        sessionId: checkoutStore.sessionId ?? undefined,
        step: 'processOrder',
        paymentMethod: paymentMethod.value.type,
      }, paymentError)
      throw paymentError // Re-throw to be handled by caller
    }

    try {
      // Navigate to confirmation after successful payment
      await navigateTo(localePath('/checkout/confirmation'))
    }
    catch (navError: unknown) {
      // Payment succeeded but navigation failed - critical scenario
      const checkoutError = createSystemError(
        'Navigation failed after payment',
        CheckoutErrorCode.SYSTEM_ERROR,
      )
      logCheckoutError(
        checkoutError,
        {
          sessionId: checkoutStore.sessionId ?? undefined,
          step: 'navigation',
        },
        navError,
      )

      toast.warning(
        t('checkout.success.orderCompleted'),
        t('checkout.errors.redirectManually', 'Please navigate to your orders to see confirmation.'),
      )

      // Attempt recovery by using window.location
      navigationTimeout.value = setTimeout(() => {
        window.location.href = localePath('/checkout/confirmation')
      }, 2000)

      // Re-throw so caller knows navigation failed
      throw new Error('Payment succeeded but navigation failed', { cause: navError })
    }
  }

  /**
   * Handle express checkout placement (for returning users)
   */
  const handleExpressPlaceOrder = async (): Promise<void> => {
    if (!defaultAddress.value) {
      const checkoutError = createValidationError(
        'address',
        'Default address not found for express checkout',
        CheckoutErrorCode.REQUIRED_FIELD_MISSING,
      )
      logCheckoutError(checkoutError, {
        sessionId: checkoutStore.sessionId ?? undefined,
        step: 'expressCheckout',
      })
      toast.error(
        t('checkout.errors.addressRequired', 'Address Required'),
        t('checkout.errors.selectAddress', 'Please select a delivery address to continue'),
      )
      return
    }

    processingOrder.value = true

    try {
      // Get default shipping method
      const defaultMethod: ShippingMethod = {
        id: 'standard',
        name: t('checkout.shippingMethod.standard.name', 'Standard Shipping'),
        description: t('checkout.shippingMethod.standard.description', 'Delivery in 3-5 business days'),
        price: 5.99,
        estimatedDays: 4,
      }

      // Create shipping info
      const shippingInfo: ShippingInformation = {
        address: defaultAddress.value,
        method: defaultMethod,
        instructions: undefined,
      }

      // Update checkout store
      await checkoutStore.updateShippingInfo(shippingInfo)
      await checkoutStore.updatePaymentMethod({ type: 'cash', saveForFuture: false })

      // Process order
      await processOrder()
    }
    catch (error: unknown) {
      console.error('Express checkout failed:', error)

      // Use proper error type checking instead of string matching
      const checkoutError = parseApiError(error)
      logCheckoutError(
        checkoutError,
        {
          sessionId: checkoutStore.sessionId ?? undefined,
          step: 'expressCheckout',
        },
        error,
      )

      // Provide actionable guidance based on error type
      if (checkoutError.type === 'network') {
        toast.error(
          t('checkout.errors.networkError', 'Connection Error'),
          t('checkout.errors.checkConnection', 'Please check your internet connection and try again.'),
        )
      }
      else if (checkoutError.code === CheckoutErrorCode.SESSION_EXPIRED || checkoutError.code === CheckoutErrorCode.UNAUTHORIZED) {
        toast.error(
          t('checkout.errors.sessionExpired', 'Session Expired'),
          t('checkout.errors.refreshPage', 'Your session has expired. Please refresh the page.'),
        )
      }
      else if (checkoutError.type === 'validation') {
        toast.error(
          t('checkout.errors.invalidInformation', 'Please Check Your Information'),
          checkoutError.userAction || t('checkout.errors.reviewFields'),
        )
      }
      else {
        toast.error(
          t('checkout.errors.expressCheckoutFailed', 'Express Checkout Failed'),
          checkoutError.userAction || t('checkout.errors.tryFullCheckout'),
        )
      }
    }
    finally {
      processingOrder.value = false
    }
  }

  /**
   * Handle full checkout placement
   */
  const handlePlaceOrder = async (
    guestInfo?: { email: string, emailUpdates: boolean },
  ): Promise<void> => {
    processingOrder.value = true

    // Validate shipping method is selected
    if (!selectedMethod.value) {
      const checkoutError = createValidationError(
        'shipping',
        'Shipping method is required',
        CheckoutErrorCode.REQUIRED_FIELD_MISSING,
      )
      logCheckoutError(checkoutError, {
        sessionId: checkoutStore.sessionId ?? undefined,
        step: 'handlePlaceOrder',
      })
      toast.error(
        t('checkout.errors.shippingRequired', 'Shipping Required'),
        t('checkout.errors.selectShippingMethod', 'Please select a shipping method'),
      )
      processingOrder.value = false
      return
    }

    try {
      // Create shipping information
      const shippingInfo: ShippingInformation = {
        address: shippingAddress.value,
        method: selectedMethod.value,
        instructions: shippingInstructions.value || undefined,
      }

      // Update guest info if needed
      if (guestInfo) {
        await checkoutStore.updateGuestInfo({
          email: guestInfo.email.trim(),
          emailUpdates: guestInfo.emailUpdates,
        })
      }

      // Update checkout store
      await checkoutStore.updateShippingInfo(shippingInfo)
      await checkoutStore.updatePaymentMethod(paymentMethod.value)

      // Process order
      await processOrder()
    }
    catch (error: unknown) {
      console.error('Failed to place order:', error)

      // Use proper error type checking instead of string matching
      const checkoutError = parseApiError(error)
      logCheckoutError(
        checkoutError,
        {
          sessionId: checkoutStore.sessionId ?? undefined,
          step: 'placeOrder',
        },
        error,
      )

      // Provide user-friendly error message based on error type
      if (checkoutError.type === 'network') {
        toast.error(
          t('checkout.errors.networkError', 'Connection Error'),
          t('checkout.errors.checkConnection', 'Please check your internet connection and try again.'),
        )
      }
      else if (checkoutError.type === 'validation') {
        toast.error(
          t('checkout.errors.validationFailed', 'Please Check Your Information'),
          checkoutError.userAction || t('checkout.errors.reviewFields'),
        )
      }
      else if (checkoutError.type === 'payment') {
        toast.error(
          t('checkout.errors.paymentFailed', 'Payment Failed'),
          checkoutError.userAction || t('checkout.errors.pleaseTryAgain'),
        )
      }
      else {
        toast.error(
          t('checkout.errors.orderFailed', 'Order Failed'),
          checkoutError.userAction || t('checkout.errors.pleaseTryAgain'),
        )
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
    // Validate address form
    if (addressFormRef.value && !addressFormRef.value.validateForm()) {
      const checkoutError = createValidationError(
        'address',
        'Address validation failed',
        CheckoutErrorCode.VALIDATION_FAILED,
      )
      logCheckoutError(checkoutError, {
        sessionId: checkoutStore.sessionId ?? undefined,
        step: 'validateAddress',
        address: shippingAddress.value,
      })
      toast.error(
        t('checkout.validation.error'),
        t('checkout.validation.addressInvalid'),
      )
      return false
    }

    // Validate payment form (including Stripe validation for credit cards)
    if (paymentSectionRef.value && !paymentSectionRef.value.validateForm()) {
      const checkoutError = createValidationError(
        'payment',
        'Payment validation failed',
        CheckoutErrorCode.VALIDATION_FAILED,
      )
      logCheckoutError(checkoutError, {
        sessionId: checkoutStore.sessionId ?? undefined,
        step: 'validatePayment',
        paymentMethod: paymentMethod.value.type,
      })
      toast.error(
        t('checkout.validation.error'),
        t('checkout.validation.paymentInvalid'),
      )
      return false
    }

    return true
  }

  // Cleanup navigation timeout on unmount
  onUnmounted(() => {
    if (navigationTimeout.value) {
      clearTimeout(navigationTimeout.value)
    }
  })

  return {
    processingOrder,
    handleExpressPlaceOrder,
    handlePlaceOrder,
    validateForms,
  }
}
