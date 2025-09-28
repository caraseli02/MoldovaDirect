import { ref, type Ref } from 'vue'

interface PayPalComposable {
  loading: Ref<boolean>
  error: Ref<string | null>
  initializePayPal: () => Promise<void>
  createOrder: (amount: number, currency?: string) => Promise<any>
  captureOrder: (orderID: string) => Promise<any>
  renderPayPalButtons: (container: HTMLElement, options: PayPalButtonOptions) => Promise<void>
}

interface PayPalButtonOptions {
  amount: number
  currency?: string
  onApprove?: (data: any, actions: any) => Promise<void>
  onError?: (error: any) => void
  onCancel?: (data: any) => void
}

declare global {
  interface Window {
    paypal?: any
  }
}

let paypalPromise: Promise<any> | null = null

export const usePayPal = (): PayPalComposable => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadPayPalScript = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (window.paypal) {
        resolve(window.paypal)
        return
      }

      const runtimeConfig = useRuntimeConfig()
      const clientId = runtimeConfig.public.paypalClientId

      if (!clientId) {
        reject(new Error('PayPal client ID not configured'))
        return
      }

      const script = document.createElement('script')
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR&intent=capture`
      script.async = true
      
      script.onload = () => {
        if (window.paypal) {
          resolve(window.paypal)
        } else {
          reject(new Error('PayPal SDK failed to load'))
        }
      }
      
      script.onerror = () => {
        reject(new Error('Failed to load PayPal SDK'))
      }

      document.head.appendChild(script)
    })
  }

  const initializePayPal = async (): Promise<void> => {
    if (window.paypal) return

    try {
      loading.value = true
      error.value = null

      // Use singleton pattern to avoid loading PayPal multiple times
      if (!paypalPromise) {
        paypalPromise = loadPayPalScript()
      }

      await paypalPromise

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize PayPal'
      console.error('PayPal initialization error:', err)
    } finally {
      loading.value = false
    }
  }

  const createOrder = async (amount: number, currency = 'EUR'): Promise<any> => {
    try {
      const response = await $fetch('/api/checkout/paypal/create-order', {
        method: 'POST',
        body: {
          amount: amount.toFixed(2),
          currency
        }
      })

      return response.orderID
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create PayPal order'
      console.error('PayPal order creation error:', err)
      throw err
    }
  }

  const captureOrder = async (orderID: string): Promise<any> => {
    try {
      const response = await $fetch('/api/checkout/paypal/capture-order', {
        method: 'POST',
        body: { orderID }
      })

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to capture PayPal order'
      console.error('PayPal order capture error:', err)
      throw err
    }
  }

  const renderPayPalButtons = async (container: HTMLElement, options: PayPalButtonOptions): Promise<void> => {
    if (!window.paypal) {
      await initializePayPal()
    }

    if (!window.paypal) {
      throw new Error('PayPal SDK not loaded')
    }

    try {
      loading.value = true
      error.value = null

      // Clear any existing buttons
      container.innerHTML = ''

      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal'
        },

        createOrder: async () => {
          try {
            return await createOrder(options.amount, options.currency)
          } catch (err) {
            console.error('Failed to create PayPal order:', err)
            if (options.onError) {
              options.onError(err)
            }
            throw err
          }
        },

        onApprove: async (data: any, actions: any) => {
          try {
            const orderData = await captureOrder(data.orderID)
            
            if (options.onApprove) {
              await options.onApprove(orderData, actions)
            }
            
            return orderData
          } catch (err) {
            console.error('Failed to capture PayPal order:', err)
            if (options.onError) {
              options.onError(err)
            }
            throw err
          }
        },

        onError: (err: any) => {
          console.error('PayPal button error:', err)
          error.value = 'PayPal payment failed'
          if (options.onError) {
            options.onError(err)
          }
        },

        onCancel: (data: any) => {
          console.log('PayPal payment cancelled:', data)
          if (options.onCancel) {
            options.onCancel(data)
          }
        }

      }).render(container)

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to render PayPal buttons'
      console.error('PayPal button rendering error:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    initializePayPal,
    createOrder,
    captureOrder,
    renderPayPalButtons
  }
}

// Utility function to format PayPal errors for user display
export const formatPayPalError = (error: any): string => {
  if (!error) return 'An unknown error occurred'

  // Common PayPal error codes and messages
  const errorMessages: Record<string, string> = {
    'INSTRUMENT_DECLINED': 'Your payment method was declined. Please try a different payment method.',
    'PAYER_ACCOUNT_RESTRICTED': 'Your PayPal account has restrictions. Please contact PayPal support.',
    'PAYER_CANNOT_PAY': 'Unable to process payment with this PayPal account.',
    'PAYEE_ACCOUNT_RESTRICTED': 'The merchant account has restrictions.',
    'TRANSACTION_REFUSED': 'The transaction was refused. Please try again.',
    'INTERNAL_SERVICE_ERROR': 'A temporary error occurred. Please try again.',
    'VALIDATION_ERROR': 'Invalid payment information. Please check your details.'
  }

  if (error.name && errorMessages[error.name]) {
    return errorMessages[error.name]
  }

  if (error.details && Array.isArray(error.details) && error.details.length > 0) {
    return error.details[0].description || error.details[0].issue || 'PayPal payment failed'
  }

  return error.message || 'PayPal payment failed. Please try again.'
}