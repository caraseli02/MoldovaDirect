import type {
  ShippingMethod,
  PaymentMethod,
  SavedPaymentMethod,
  OrderData,
  ShippingInformation
} from '~/types/checkout'

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
  const response = await $fetch<{ success: boolean; methods: ShippingMethod[] }>('/api/checkout/shipping-methods', {
    query: {
      country: params.country,
      postalCode: params.postalCode,
      orderTotal: params.orderTotal.toString()
    }
  })

  if (!response.success) {
    throw new Error('Failed to load shipping methods')
  }

  return response.methods
}

export async function createPaymentIntent(params: CreatePaymentIntentParams): Promise<{
  id: string
  clientSecret: string
}> {
  const response = await $fetch<{
    success: boolean
    paymentIntent: { id: string; client_secret: string }
  }>('/api/checkout/create-payment-intent', {
    method: 'POST',
    body: {
      amount: params.amount,
      currency: params.currency,
      sessionId: params.sessionId
    }
  })

  if (!response.success || !response.paymentIntent?.id || !response.paymentIntent?.client_secret) {
    throw new Error('Failed to create payment intent')
  }

  return {
    id: response.paymentIntent.id,
    clientSecret: response.paymentIntent.client_secret
  }
}

export async function confirmPaymentIntent(params: ConfirmPaymentParams): Promise<any> {
  return await $fetch('/api/checkout/confirm-payment', {
    method: 'POST',
    body: {
      paymentIntentId: params.paymentIntentId,
      paymentMethodId: params.paymentMethodId,
      sessionId: params.sessionId
    }
  })
}

export async function createOrder(params: CreateOrderParams): Promise<{
  id: number
  orderNumber: string
}> {
  const response = await $fetch<{ success: boolean; order: { id: number; orderNumber: string } }>(
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
        marketingConsent: params.marketingConsent
      }
    }
  )

  if (!response.success || !response.order) {
    throw new Error('Failed to create order')
  }

  return {
    id: response.order.id,
    orderNumber: response.order.orderNumber
  }
}

export async function sendConfirmationEmail(params: SendConfirmationParams): Promise<void> {
  await $fetch('/api/checkout/send-confirmation', {
    method: 'POST',
    body: {
      orderId: params.orderId,
      sessionId: params.sessionId,
      email: params.email
    }
  })
}

export async function updateInventory(items: OrderData['items'], orderId?: number): Promise<void> {
  await $fetch('/api/checkout/update-inventory', {
    method: 'POST',
    body: {
      items,
      orderId
    }
  })
}

export async function fetchSavedPaymentMethods(): Promise<SavedPaymentMethod[]> {
  const response = await $fetch<{ success: boolean; paymentMethods: SavedPaymentMethod[] }>(
    '/api/checkout/payment-methods'
  )

  if (!response.success) {
    throw new Error('Failed to load payment methods')
  }

  return response.paymentMethods
}

export async function savePaymentMethod(method: SavedPaymentMethod): Promise<SavedPaymentMethod> {
  const response = await $fetch<{ success: boolean; paymentMethod: SavedPaymentMethod }>(
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
        isDefault: method.isDefault
      }
    }
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
      sessionId
    }
  })

  return response.success
}
