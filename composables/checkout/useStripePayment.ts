/**
 * Stripe Payment Processing Composable
 *
 * Handles Stripe payment processing for credit card payments.
 * Extracted from useCheckoutOrder.ts for better testability and to reduce file size.
 *
 * @see {CODE_DESIGN_PRINCIPLES.md} Three-layer separation
 */

import type { Ref } from 'vue'
import type { PaymentMethod } from '~/types/checkout'
import type { PaymentForm } from '~/composables/useCheckoutOrder'
import { useCheckoutSessionStore } from '~/stores/checkout/session'
import {
  createNetworkError,
  createPaymentError,
  createSystemError,
  CheckoutErrorCode,
  logCheckoutError,
} from '~/utils/checkout-errors'

export interface UseStripePaymentOptions {
  total: Ref<number>
  shippingAddress: Ref<any>
  paymentMethod: Ref<PaymentMethod>
  paymentSectionRef: Ref<PaymentForm | null>
  checkoutStore: ReturnType<typeof useCheckoutStore>
}

export function useStripePayment(options: UseStripePaymentOptions) {
  const { total, shippingAddress, paymentMethod, paymentSectionRef, checkoutStore } = options
  const sessionStore = useCheckoutSessionStore()

  /**
   * Process Stripe payment for credit cards
   */
  const processStripePayment = async (): Promise<void> => {
    const { useStripe } = await import('~/composables/useStripe')
    const { stripe, initializeStripe } = useStripe()

    if (!stripe.value) {
      try {
        await initializeStripe()
      }
      catch (initError: unknown) {
        const checkoutError = createSystemError('Failed to initialize payment provider', CheckoutErrorCode.PAYMENT_PROCESSING_ERROR)
        logCheckoutError(checkoutError, { sessionId: checkoutStore.sessionId ?? undefined, step: 'initializeStripe' }, initError)
        throw new Error('Payment service is temporarily unavailable. Please try again or use cash payment.', { cause: initError })
      }
    }

    if (!stripe.value) {
      const checkoutError = createSystemError('Payment service not initialized', CheckoutErrorCode.PAYMENT_PROCESSING_ERROR)
      logCheckoutError(checkoutError, { sessionId: checkoutStore.sessionId ?? undefined, step: 'processStripePayment' })
      throw new Error('Payment service is not available. Please refresh the page or try again later.')
    }

    const cardElement = paymentSectionRef.value?.getStripeCardElement()
    if (!cardElement) {
      const checkoutError = createSystemError('Card element not available or invalid', CheckoutErrorCode.PAYMENT_PROCESSING_ERROR)
      logCheckoutError(checkoutError, { sessionId: checkoutStore.sessionId ?? undefined, step: 'processStripePayment', hasRef: !!paymentSectionRef.value })
      throw new Error('Payment form is not ready. Please wait a moment and try again, or refresh the page.')
    }

    let paymentIntentData
    try {
      paymentIntentData = await $fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        body: {
          amount: Math.round(total.value * 100),
          currency: 'eur',
          sessionId: checkoutStore.sessionId || 'temp-session',
        },
      })
    }
    catch (fetchError: unknown) {
      const checkoutError = createNetworkError('Failed to connect to payment server', CheckoutErrorCode.NETWORK_ERROR)
      logCheckoutError(checkoutError, { sessionId: checkoutStore.sessionId ?? undefined, step: 'createPaymentIntent' }, fetchError)
      throw new Error('Could not connect to payment server. Please check your connection and try again.', { cause: fetchError })
    }

    if (!paymentIntentData?.success || !paymentIntentData?.paymentIntent?.client_secret) {
      const checkoutError = createPaymentError('Payment initialization failed - invalid response from payment server', CheckoutErrorCode.PAYMENT_PROCESSING_ERROR)
      logCheckoutError(checkoutError, { sessionId: checkoutStore.sessionId ?? undefined, step: 'createPaymentIntent', apiResponse: paymentIntentData })
      throw new Error('Payment initialization failed. Please try again or contact support.')
    }

    const { error: stripeError, paymentIntent } = await stripe.value.confirmCardPayment(
      paymentIntentData.paymentIntent.client_secret,
      {
        payment_method: {
          card: cardElement as any,
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

    if (stripeError) throw new Error(stripeError.message || 'Payment failed')
    if (paymentIntent?.status !== 'succeeded') throw new Error('Payment was not completed successfully')

    sessionStore.setPaymentIntent(paymentIntent.id)
    sessionStore.setPaymentClientSecret(paymentIntentData.paymentIntent.client_secret)

    await checkoutStore.updatePaymentMethod({
      ...paymentMethod.value,
      stripePaymentIntentId: paymentIntent.id,
      transactionId: paymentIntent.id,
    })

    await checkoutStore.processPayment()
  }

  return { processStripePayment }
}
