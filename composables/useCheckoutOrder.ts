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

export interface CheckoutOrderOptions {
  total: Ref<number>
  shippingAddress: Ref<Address>
  selectedMethod: Ref<ShippingMethod | null>
  shippingInstructions: Ref<string>
  paymentMethod: Ref<PaymentMethod>
  marketingConsent: Ref<boolean>
  defaultAddress: Ref<Address | null>
  addressFormRef: Ref<{ validateForm: () => boolean } | null>
  paymentSectionRef: Ref<{
    validateForm: () => boolean
    getStripeCardElement: () => any
  } | null>
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

    // Ensure Stripe is initialized
    if (!stripe.value) {
      await initializeStripe()
    }

    if (!stripe.value) {
      throw new Error('Stripe not available')
    }

    // Get the Stripe card element from the payment form
    const cardElement = paymentSectionRef.value?.getStripeCardElement()
    if (!cardElement) {
      throw new Error('Card element not available')
    }

    // Create payment intent on server
    const paymentIntentData = await $fetch('/api/checkout/create-payment-intent', {
      method: 'POST',
      body: {
        amount: Math.round(total.value * 100), // Convert to cents
        currency: 'eur',
        sessionId: checkoutStore.sessionId || 'temp-session',
      },
    })

    if (!paymentIntentData.success || !paymentIntentData.paymentIntent?.client_secret) {
      throw new Error('Failed to create payment intent')
    }

    // Confirm payment with Stripe
    const { error: stripeError, paymentIntent } = await stripe.value.confirmCardPayment(
      paymentIntentData.paymentIntent.client_secret,
      {
        payment_method: {
          card: cardElement,
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
      console.error('Payment processing failed:', paymentError)
      throw paymentError // Re-throw to be handled by caller
    }

    try {
      // Navigate to confirmation after successful payment
      await navigateTo(localePath('/checkout/confirmation'))
    }
    catch (navError: unknown) {
      // Payment succeeded but navigation failed - critical scenario
      console.error('Navigation to confirmation failed after successful payment:', navError)

      toast.warning(
        t('checkout.success.orderCompleted'),
        t('checkout.errors.redirectManually', 'Please navigate to your orders to see confirmation.'),
      )

      // Attempt recovery by using window.location
      setTimeout(() => {
        window.location.href = localePath('/checkout/confirmation')
      }, 2000)
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

      // Provide actionable guidance based on error type
      const errorMessage = getErrorMessage(error)
      const isNetworkError = errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')
      const isSessionError = errorMessage.includes('session') || errorMessage.includes('expired') || errorMessage.includes('unauthorized')

      if (isNetworkError) {
        toast.error(
          t('checkout.errors.networkError', 'Connection Error'),
          t('checkout.errors.checkConnection', 'Please check your internet connection and try again.'),
        )
      }
      else if (isSessionError) {
        toast.error(
          t('checkout.errors.sessionExpired', 'Session Expired'),
          t('checkout.errors.refreshPage', 'Your session has expired. Please refresh the page.'),
        )
      }
      else {
        toast.error(
          t('checkout.errors.expressCheckoutFailed', 'Express Checkout Failed'),
          t('checkout.errors.tryFullCheckout', 'Please use the full checkout form below.'),
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

      // Provide user-friendly error message without exposing technical details
      const errorMessage = getErrorMessage(error)
      const isNetworkError = errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')
      const isValidationError = errorMessage.includes('validation') || errorMessage.includes('invalid')

      if (isNetworkError) {
        toast.error(
          t('checkout.errors.networkError', 'Connection Error'),
          t('checkout.errors.checkConnection', 'Please check your internet connection and try again.'),
        )
      }
      else if (isValidationError) {
        toast.error(
          t('checkout.errors.validationFailed', 'Please Check Your Information'),
          t('checkout.errors.reviewFields', 'Some fields may need to be corrected.'),
        )
      }
      else {
        toast.error(
          t('checkout.errors.orderFailed', 'Order Failed'),
          t('checkout.errors.pleaseTryAgain', 'Please try again or contact support if the issue persists.'),
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
      toast.error(
        t('checkout.validation.error'),
        t('checkout.validation.addressInvalid'),
      )
      return false
    }

    // Validate payment form (including Stripe validation for credit cards)
    if (paymentSectionRef.value && !paymentSectionRef.value.validateForm()) {
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
