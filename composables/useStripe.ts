import { ref, type Ref } from 'vue'
import type { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js'

interface StripeComposable {
  stripe: Ref<Stripe | null>
  elements: Ref<StripeElements | null>
  cardElement: Ref<StripeCardElement | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  retryCount: Ref<number>
  initializeStripe: () => Promise<void>
  createCardElement: (container: HTMLElement) => Promise<void>
  confirmPayment: (clientSecret: string, billingDetails?: unknown) => Promise<unknown>
  createPaymentMethod: (billingDetails?: unknown) => Promise<unknown>
  retryInitialization: () => Promise<void>
}

let stripePromise: Promise<Stripe | null> | null = null
let stripeLibraryPromise: Promise<unknown> | null = null

// Debug logging flag - set to false in production
const DEBUG_MODE = process.env.NODE_ENV === 'development'
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY_MS = 1000

function debugLog(...args: unknown[]) {
  if (DEBUG_MODE) {
    console.log('[Stripe Debug]', ...args)
  }
}

function debugWarn(...args: unknown[]) {
  if (DEBUG_MODE) {
    console.warn('[Stripe Debug]', ...args)
  }
}

function debugError(...args: unknown[]) {
  // Always log errors, even in production
  console.error('[Stripe Error]', ...args)
}

export const useStripe = (): StripeComposable => {
  const stripe = ref<Stripe | null>(null)
  const elements = ref<StripeElements | null>(null)
  const cardElement = ref<StripeCardElement | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const retryCount = ref(0)

  const initializeStripe = async (attempt = 1): Promise<void> => {
    if (stripe.value) return

    try {
      loading.value = true
      error.value = null

      const runtimeConfig = useRuntimeConfig()
      const publishableKey = runtimeConfig.public.stripePublishableKey

      if (!publishableKey) {
        throw new Error('Stripe publishable key not configured')
      }

      debugLog('Initializing Stripe (attempt', attempt, 'of', MAX_RETRY_ATTEMPTS, ')')
      debugLog('Using key:', publishableKey.substring(0, 15) + '...')

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

      debugLog('Stripe loaded successfully')
      stripe.value = stripeInstance
      elements.value = stripeInstance.elements()
      debugLog('Stripe elements created')
      retryCount.value = 0 // Reset retry count on success
    }
    catch (err: unknown) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : 'Failed to initialize Stripe'
      debugError('Stripe initialization error:', errorMessage)

      // Retry logic for transient failures
      if (attempt < MAX_RETRY_ATTEMPTS) {
        debugLog(`Retrying Stripe initialization in ${RETRY_DELAY_MS}ms...`)
        retryCount.value = attempt
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt))
        return initializeStripe(attempt + 1)
      }

      // Max retries reached
      error.value = errorMessage
      retryCount.value = MAX_RETRY_ATTEMPTS
      debugError('Max retry attempts reached. Stripe initialization failed.')
    }
    finally {
      loading.value = false
    }
  }

  const retryInitialization = async (): Promise<void> => {
    // Reset state for manual retry
    stripe.value = null
    elements.value = null
    cardElement.value = null
    stripePromise = null
    retryCount.value = 0
    await initializeStripe()
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

      // Ensure container is visible and has dimensions
      if (!container.offsetParent) {
        debugWarn('Stripe container is not visible')
      }

      // Create unified card element with better styling
      const cardElementInstance = elements.value.create('card', {
        style: {
          base: {
            'fontSize': '16px',
            'color': '#1f2937',
            'fontFamily': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            'lineHeight': '44px',
            'padding': '12px',
            '::placeholder': {
              color: '#9ca3af',
            },
          },
          invalid: {
            color: '#ef4444',
            iconColor: '#ef4444',
          },
        },
        hidePostalCode: true,
        classes: {
          base: 'stripe-element-base',
          focus: 'stripe-element-focus',
          invalid: 'stripe-element-invalid',
        },
      })

      // Mount the card element
      cardElementInstance.mount(container)
      cardElement.value = cardElementInstance

      // Listen for ready event
      cardElementInstance.on('ready', () => {
        debugLog('Stripe Card Element is ready')
        loading.value = false
      })

      // Listen for changes
      cardElementInstance.on('change', (event) => {
        if (event.error) {
          error.value = event.error.message
        }
        else {
          error.value = null
        }
      })

      // Listen for focus
      cardElementInstance.on('focus', () => {
        debugLog('Stripe Card Element focused')
      })
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? getErrorMessage(err) : 'Failed to create card element'
      debugError('Card element creation error:', getErrorMessage(err))
      loading.value = false
    }
  }

  const confirmPayment = async (clientSecret: string, billingDetails?: unknown): Promise<unknown> => {
    if (!stripe.value || !cardElement.value) {
      throw new Error('Stripe not initialized')
    }

    try {
      loading.value = true
      error.value = null

      const result = await stripe.value.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement.value,
          billing_details: billingDetails || {},
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
      debugError('Payment confirmation error:', getErrorMessage(err))
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
  }

  const createPaymentMethod = async (billingDetails?: unknown): Promise<unknown> => {
    if (!stripe.value || !cardElement.value) {
      throw new Error('Stripe not initialized')
    }

    try {
      loading.value = true
      error.value = null

      const result = await stripe.value.createPaymentMethod({
        type: 'card',
        card: cardElement.value,
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
      debugError('Payment method creation error:', getErrorMessage(err))
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
    retryCount,
    initializeStripe,
    createCardElement,
    confirmPayment,
    createPaymentMethod,
    retryInitialization,
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
