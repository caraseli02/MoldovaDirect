import { ref, type Ref } from 'vue'
import type { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js'

interface StripeComposable {
  stripe: Ref<Stripe | null>
  elements: Ref<StripeElements | null>
  cardElement: Ref<StripeCardElement | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  initializeStripe: () => Promise<void>
  createCardElement: (container: HTMLElement) => Promise<void>
  confirmPayment: (clientSecret: string, paymentData?: unknown) => Promise<unknown>
  createPaymentMethod: (cardElement: StripeCardElement, billingDetails?: unknown) => Promise<unknown>
}

let stripePromise: Promise<Stripe | null> | null = null
let stripeLibraryPromise: Promise<unknown> | null = null

export const useStripe = (): StripeComposable => {
  const stripe = ref<Stripe | null>(null)
  const elements = ref<StripeElements | null>(null)
  const cardElement = ref<StripeCardElement | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const initializeStripe = async (): Promise<void> => {
    if (stripe.value) return

    try {
      loading.value = true
      error.value = null

      const runtimeConfig = useRuntimeConfig()
      const publishableKey = runtimeConfig.public.stripePublishableKey

      if (!publishableKey) {
        throw new Error('Stripe publishable key not configured')
      }

      // Dynamically import Stripe.js library (singleton pattern)
      if (!stripeLibraryPromise) {
        stripeLibraryPromise = import('@stripe/stripe-js')
      }

      const { loadStripe } = await stripeLibraryPromise as { loadStripe: (key: string) => Promise<Stripe | null> }

      // Use singleton pattern to avoid loading Stripe multiple times
      if (!stripePromise) {
        stripePromise = loadStripe(publishableKey)
      }

      const stripeInstance = await stripePromise
      if (!stripeInstance) {
        throw new Error('Failed to load Stripe')
      }

      stripe.value = stripeInstance
      elements.value = stripeInstance.elements()
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? getErrorMessage(err) : 'Failed to initialize Stripe'
      console.error('Stripe initialization error:', getErrorMessage(err))
    }
    finally {
      loading.value = false
    }
  }

  const createCardElement = async (container: HTMLElement): Promise<void> => {
    if (!elements.value) {
      await initializeStripe()
    }

    if (!elements.value) {
      throw new Error('Stripe elements not initialized')
    }

    try {
      loading.value = true
      error.value = null

      // Create card element with styling
      const cardElementInstance = elements.value.create('card', {
        style: {
          base: {
            'fontSize': '16px',
            'color': '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
            'fontFamily': 'system-ui, -apple-system, sans-serif',
          },
          invalid: {
            color: '#9e2146',
          },
        },
        hidePostalCode: true, // We collect this separately
      })

      // Mount the card element
      cardElementInstance.mount(container)
      cardElement.value = cardElementInstance

      // Listen for changes
      cardElementInstance.on('change', (event) => {
        if (event.error) {
          error.value = event.error.message
        }
        else {
          error.value = null
        }
      })
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? getErrorMessage(err) : 'Failed to create card element'
      console.error('Card element creation error:', getErrorMessage(err))
    }
    finally {
      loading.value = false
    }
  }

  const confirmPayment = async (clientSecret: string, paymentData?: unknown): Promise<unknown> => {
    if (!stripe.value) {
      throw new Error('Stripe not initialized')
    }

    try {
      loading.value = true
      error.value = null

      const paymentDataTyped = paymentData as { payment_method?: any, billing_details?: unknown } | undefined
      const result = await stripe.value.confirmCardPayment(clientSecret, {
        payment_method: paymentDataTyped?.payment_method || {
          card: cardElement.value!,
          billing_details: paymentDataTyped?.billing_details || {},
        },
      })

      if (result.error) {
        error.value = result.error.message || 'Payment confirmation failed'
        return { success: false, error: result.error }
      }

      return { success: true, paymentIntent: result.paymentIntent }
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? getErrorMessage(err) : 'Payment confirmation failed'
      console.error('Payment confirmation error:', getErrorMessage(err))
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
  }

  const createPaymentMethod = async (cardElement: StripeCardElement, billingDetails?: unknown): Promise<unknown> => {
    if (!stripe.value) {
      throw new Error('Stripe not initialized')
    }

    try {
      loading.value = true
      error.value = null

      const result = await stripe.value.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails || {},
      })

      if (result.error) {
        error.value = result.error.message || 'Failed to create payment method'
        return { success: false, error: result.error }
      }

      return { success: true, paymentMethod: result.paymentMethod }
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? getErrorMessage(err) : 'Failed to create payment method'
      console.error('Payment method creation error:', getErrorMessage(err))
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
  }

  return {
    stripe,
    elements,
    cardElement,
    loading,
    error,
    initializeStripe,
    createCardElement,
    confirmPayment,
    createPaymentMethod,
  }
}

// Utility function to format Stripe errors for user display
export const formatStripeError = (error: any): string => {
  if (!error) return 'An unknown error occurred'

  const err = error as { code?: string, message?: string }
  switch (err.code) {
    case 'card_declined':
      return 'Your card was declined. Please try a different payment method.'
    case 'expired_card':
      return 'Your card has expired. Please use a different card.'
    case 'incorrect_cvc':
      return 'Your card\'s security code is incorrect.'
    case 'processing_error':
      return 'An error occurred while processing your card. Please try again.'
    case 'incorrect_number':
      return 'Your card number is incorrect.'
    case 'incomplete_number':
      return 'Your card number is incomplete.'
    case 'incomplete_cvc':
      return 'Your card\'s security code is incomplete.'
    case 'incomplete_expiry':
      return 'Your card\'s expiration date is incomplete.'
    case 'invalid_expiry_month':
      return 'Your card\'s expiration month is invalid.'
    case 'invalid_expiry_year':
      return 'Your card\'s expiration year is invalid.'
    case 'invalid_cvc':
      return 'Your card\'s security code is invalid.'
    default: {
      // Check for explicit message before falling back
      if (err.message) return err.message
      return 'An error occurred while processing your payment.'
    }
  }
}
