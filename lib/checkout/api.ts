import type {
  ShippingMethod,
  PaymentMethod,
  SavedPaymentMethod,
  OrderData,
  ShippingInformation,
} from '~/types/checkout'
import { getErrorMessage } from '~/utils/errorUtils'

export interface FetchShippingMethodsParams {
  country: string
  postalCode: string
  orderTotal: number
}

export interface CreatePaymentIntentParams {
  amount: number
  currency: string
  sessionId: string
}

export interface ConfirmPaymentParams {
  paymentIntentId: string
  sessionId: string
  paymentMethodId?: string
}

export interface CreateOrderParams {
  sessionId: string
  items: OrderData['items']
  shippingAddress: ShippingInformation['address']
  billingAddress: ShippingInformation['address']
  paymentMethod: PaymentMethod['type']
  paymentResult: Record<string, any>
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  currency: string
  guestEmail: string | null
  customerName: string
  locale: string
  marketingConsent: boolean
}

export interface SendConfirmationParams {
  orderId?: number
  sessionId: string | null
  email?: string
}

export async function fetchShippingMethods(params: FetchShippingMethodsParams): Promise<ShippingMethod[]> {
  try {
    const response = await $fetch<{ success: boolean, methods: ShippingMethod[] }>('/api/checkout/shipping-methods', {
      query: {
        country: params.country,
        postalCode: params.postalCode,
        orderTotal: params.orderTotal.toString(),
      },
    })

    if (!response.success) {
      throw new Error('Failed to load shipping methods')
    }

    return response.methods
  }
  catch (error: unknown) {
    const message = getErrorMessage(error)
    if (message.includes('fetch') || message.includes('network')) {
      throw new Error('Network error: Could not connect to server. Please check your connection.', { cause: error })
    }
    throw error
  }
}

export async function createPaymentIntent(params: CreatePaymentIntentParams): Promise<{
  id: string
  clientSecret: string
}> {
  try {
    const response = await $fetch<{
      success: boolean
      paymentIntent: { id: string, client_secret: string }
    }>('/api/checkout/create-payment-intent', {
      method: 'POST',
      body: {
        amount: params.amount,
        currency: params.currency,
        sessionId: params.sessionId,
      },
    })

    if (!response.success || !response.paymentIntent?.id || !response.paymentIntent?.client_secret) {
      throw new Error('Failed to create payment intent')
    }

    return {
      id: response.paymentIntent.id,
      clientSecret: response.paymentIntent.client_secret,
    }
  }
  catch (error: unknown) {
    const message = getErrorMessage(error)
    if (message.includes('fetch') || message.includes('network')) {
      throw new Error('Network error: Could not connect to payment server. Please check your connection.', { cause: error })
    }
    throw error
  }
}

export async function confirmPaymentIntent(params: ConfirmPaymentParams): Promise<any> {
  try {
    return await $fetch('/api/checkout/confirm-payment', {
      method: 'POST',
      body: {
        paymentIntentId: params.paymentIntentId,
        paymentMethodId: params.paymentMethodId,
        sessionId: params.sessionId,
      },
    }) as any
  }
  catch (error: unknown) {
    const message = getErrorMessage(error)
    if (message.includes('fetch') || message.includes('network')) {
      throw new Error('Network error: Could not confirm payment. Please check your connection.', { cause: error })
    }
    throw error
  }
}

export async function createOrder(params: CreateOrderParams): Promise<{
  id: number
  orderNumber: string
}> {
  let response
  try {
    response = await $fetch<{ success: boolean, order: { id: number, orderNumber: string } }>(
      '/api/checkout/create-order',
      {
        method: 'POST',
        body: {
          sessionId: params.sessionId,
          items: params.items,
          shippingAddress: params.shippingAddress,
          billingAddress: params.billingAddress,
          paymentMethod: params.paymentMethod,
          paymentResult: params.paymentResult,
          subtotal: params.subtotal,
          shippingCost: params.shippingCost,
          tax: params.tax,
          total: params.total,
          currency: params.currency,
          guestEmail: params.guestEmail ?? undefined,
          customerName: params.customerName,
          locale: params.locale,
          marketingConsent: params.marketingConsent,
        },
      },
    )
  }
  catch (fetchError: unknown) {
    const errorMessage = getErrorMessage(fetchError)
    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      throw new Error('Network error: Could not connect to server. Please check your connection.', { cause: fetchError })
    }
    throw new Error(`Order creation failed: ${errorMessage}`, { cause: fetchError })
  }

  if (!response?.success || !response?.order) {
    throw new Error('Order creation failed: Invalid server response')
  }

  return {
    id: response.order.id,
    orderNumber: response.order.orderNumber,
  }
}

export async function sendConfirmationEmail(params: SendConfirmationParams): Promise<void> {
  try {
    await $fetch('/api/checkout/send-confirmation', {
      method: 'POST',
      body: {
        orderId: params.orderId,
        sessionId: params.sessionId,
        email: params.email,
      },
    }) as any
  }
  catch (error: unknown) {
    // Log but don't throw - email is non-critical
    console.error('Failed to send confirmation email:', getErrorMessage(error))
  }
}

/**
 * @deprecated This function is deprecated as of 2025-11-03 (issue #89)
 * Inventory updates are now handled atomically with order creation
 * via the create_order_with_inventory RPC function.
 * This function is kept for backward compatibility but should not be used.
 */
export async function updateInventory(items: OrderData['items'], orderId?: number): Promise<void> {
  console.warn('[DEPRECATED] updateInventory() called - inventory is now updated atomically with order creation')
  await $fetch('/api/checkout/update-inventory', {
    method: 'POST',
    body: {
      items,
      orderId,
    },
  }) as any
}

export async function fetchSavedPaymentMethods(): Promise<SavedPaymentMethod[]> {
  const response = await $fetch<{ success: boolean, paymentMethods: SavedPaymentMethod[] }>(
    '/api/checkout/payment-methods',
  )

  if (!response.success) {
    throw new Error('Failed to load payment methods')
  }

  return response.paymentMethods
}

export async function savePaymentMethod(method: SavedPaymentMethod): Promise<SavedPaymentMethod> {
  const response = await $fetch<{ success: boolean, paymentMethod: SavedPaymentMethod }>(
    '/api/checkout/save-payment-method',
    {
      method: 'POST',
      body: {
        paymentMethodId: method.id,
        type: method.type,
        lastFour: method.lastFour,
        brand: method.brand,
        expiryMonth: method.expiryMonth,
        expiryYear: method.expiryYear,
        isDefault: method.isDefault,
      },
    },
  )

  if (!response.success || !response.paymentMethod) {
    throw new Error('Failed to save payment method')
  }

  return response.paymentMethod
}

export async function clearRemoteCart(sessionId: string): Promise<boolean> {
  const response = await $fetch<{ success: boolean }>('/api/cart/clear', {
    method: 'POST',
    body: {
      sessionId,
    },
  })

  return response.success
}
