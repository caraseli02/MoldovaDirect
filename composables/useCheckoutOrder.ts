/**
 * Checkout Order Processing Composable
 *
 * Handles order placement, express checkout, and payment processing.
 * Manages Stripe integration for credit card payments.
 *
 * @see {CODE_DESIGN_PRINCIPLES.md} Three-layer separation
 */

import { ref, type Ref } from 'vue'
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

export interface PaymentForm extends ValidatableForm {
  getStripeCardElement: () => unknown | null
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
      throw new Error('Card element not available')
    }

    // Type assertion for Stripe card element - the actual type comes from Stripe.js
    // We use 'unknown' in the interface to avoid importing Stripe types directly
    const stripeCardElement = cardElement as {
      mount: () => void
      destroy: () => void
      _elementTag: string
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
      throw new Error('Payment initialization failed. Please try again.')
    }

    // Confirm payment with Stripe
    const { error: stripeError, paymentIntent } = await stripe.value.confirmCardPayment(
      paymentIntentData.paymentIntent.client_secret,
      {
        payment_method: {
          card: stripeCardElement as any, // Stripe expects its internal element type
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
    ;(checkoutStore as any).currentStep = 'review'

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
      setTimeout(() => {
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
    if (!defaultAddress.value) return

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

    try {
      // Create shipping information
      const shippingInfo: ShippingInformation = {
        address: shippingAddress.value as Address,
        method: selectedMethod.value!,
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

  return {
    processingOrder,
    handleExpressPlaceOrder,
    handlePlaceOrder,
    validateForms,
  }
}
