import { defineStore, storeToRefs } from 'pinia'
import { useCheckoutSessionStore } from './session'
import { useCartStore } from '~/stores/cart'
import { useStoreI18n } from '~/composables/useStoreI18n'
import { buildOrderData, applyShippingMethod } from '~/lib/checkout/order-calculation'
import { validateShippingInformation } from '~/utils/checkout-validation'
import { createValidationError, CheckoutErrorCode } from '~/utils/checkout-errors'
import { fetchShippingMethods } from '~/lib/checkout/api'
import type { ShippingInformation } from '~/types/checkout'
import type { CartItem } from '~/stores/cart/types'

function normalizeCartItems(cartItems?: CartItem[] | { value: CartItem[] }): CartItem[] {
  if (Array.isArray(cartItems)) {
    return [...cartItems]
  }

  if (cartItems && typeof cartItems === 'object' && 'value' in cartItems && Array.isArray(cartItems.value)) {
    return [...cartItems.value]
  }

  return []
}

function resolveCartItems(
  cartStoreItems: CartItem[] | { value: CartItem[] },
  provided?: CartItem[] | { value: CartItem[] },
): CartItem[] {
  const prioritized = [
    provided !== undefined ? normalizeCartItems(provided) : [],
    normalizeCartItems(cartStoreItems),
  ]

  for (const items of prioritized) {
    if (items.length > 0) {
      return items
    }
  }

  return []
}

export const useCheckoutShippingStore = defineStore('checkout-shipping', () => {
  const session = useCheckoutSessionStore()
  const cartStore = useCartStore()
  const { t } = useStoreI18n()

  const { shippingInfo, availableShippingMethods, orderData, loading, contactEmail, paymentMethod } = storeToRefs(session)

  const calculateOrderData = async (cartItems?: CartItem[] | { value: CartItem[] }): Promise<void> => {
    const items = resolveCartItems(cartStore.items as any, cartItems)

    if (import.meta.dev) {
      console.info('[Checkout][Shipping] calculateOrderData', {
        itemCount: items.length,
        subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      })
    }

    const order = buildOrderData(items, {
      shippingCost: shippingInfo.value?.method.price ?? orderData.value?.shippingCost ?? 0,
      currency: orderData.value?.currency ?? 'EUR',
    })

    if (shippingInfo.value?.method) {
      session.setOrderData(applyShippingMethod(order, shippingInfo.value.method))
    }
    else {
      session.setOrderData(order)
    }

    if (contactEmail.value && session.orderData) {
      session.setOrderData({
        ...session.orderData,
        customerEmail: contactEmail.value,
      })
    }
  }

  const updateShippingCosts = async (): Promise<void> => {
    if (!shippingInfo.value?.method || !orderData.value) return

    try {
      session.setOrderData(applyShippingMethod(orderData.value, shippingInfo.value.method))
    }
    catch (error: any) {
      console.error('Failed to update shipping costs:', error)
    }
  }

  const loadShippingMethods = async (): Promise<void> => {
    if (!shippingInfo.value?.address || !orderData.value) {
      session.setAvailableShippingMethods([])
      return
    }

    try {
      const methods = await fetchShippingMethods({
        country: shippingInfo.value.address.country,
        postalCode: shippingInfo.value.address.postalCode,
        orderTotal: orderData.value.subtotal,
      })
      session.setAvailableShippingMethods(methods)
    }
    catch (error: any) {
      console.error('Failed to load shipping methods:', error)
      session.setAvailableShippingMethods([
        {
          id: 'standard',
          name: t('checkout.shippingMethod.standard.name'),
          description: t('checkout.shippingMethod.standard.description'),
          price: 5.99,
          estimatedDays: 4,
        },
      ])
    }
  }

  const updateShippingInfo = async (info: ShippingInformation, cartItems?: CartItem[] | { value: CartItem[] }): Promise<void> => {
    session.setLoading(true)
    session.clearFieldErrors('shipping')

    try {
      const validation = validateShippingInformation(info)
      if (!validation.isValid) {
        session.setValidationErrors('shipping', validation.errors.map(err => err.message))
        throw new Error(validation.errors.map(err => err.message).join(', '))
      }

      session.setShippingInfo(info)

      await calculateOrderData(cartItems)

      await updateShippingCosts()
      await loadShippingMethods()

      await session.persist({
        shippingInfo: shippingInfo.value,
        paymentMethod: paymentMethod.value,
      })
    }
    catch (error: any) {
      const message = error instanceof Error ? error.message : 'Failed to update shipping information'
      const checkoutError = createValidationError('shipping', message, CheckoutErrorCode.SHIPPING_ADDRESS_INVALID)
      session.handleError(checkoutError)
      throw error
    }
    finally {
      session.setLoading(false)
    }
  }

  return {
    shippingInfo,
    availableShippingMethods,
    orderData,
    loading,
    updateShippingInfo,
    calculateOrderData,
    updateShippingCosts,
    loadShippingMethods,
  }
})

export type CheckoutShippingStore = ReturnType<typeof useCheckoutShippingStore>
