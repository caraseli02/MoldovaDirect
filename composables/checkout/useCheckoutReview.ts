import { storeToRefs } from 'pinia'
import { useCheckoutStore, type CheckoutStore } from '~/stores/checkout'
import { useCheckoutSessionStore } from '~/stores/checkout/session'
import { useCartStore } from '~/stores/cart'
import type { CartItem } from '~/stores/cart/types'
import type { CheckoutStep } from '~/types/checkout'

/**
 * Type Assertion Note:
 * This file contains multiple type assertions (as unknown as T) due to incomplete
 * type definitions in CheckoutStore during the TypeScript migration phase.
 * These assertions are safe because:
 * 1. The checkout store runtime implementation includes all accessed properties
 * 2. The store is fully tested and operational in production
 * 3. Full type definitions will be added in a future TypeScript improvement phase
 * TODO: Replace type assertions with proper CheckoutStore interface definitions
 */

interface ProcessOrderOptions {
  termsAccepted: boolean
  privacyAccepted: boolean
  marketingConsent: boolean
}

interface ProcessOrderResult {
  nextStep: CheckoutStep | null
  success: boolean
}

export function useCheckoutReview() {
  const checkoutStore = useCheckoutStore() as CheckoutStore
  const checkoutSession = useCheckoutSessionStore()
  const cartStore = useCartStore()
  const localePath = useLocalePath()

  const {
    orderData,
    shippingInfo,
    paymentMethod,
    loading,
    processing,
    lastError,
  } = storeToRefs(checkoutSession)

  const hasInitialized = ref(false)
  const lastCartSignature = ref<string | null>(null)

  const cartItems = computed<CartItem[]>(() => {
    const items = cartStore.items
    if (Array.isArray(items)) {
      return items as CartItem[]
    }
    return Array.isArray((items as unknown as { value?: unknown })?.value) ? (items as unknown as { value: CartItem[] }).value : []
  })

  const baseCanProceed = computed(() => (checkoutStore as unknown as { canCompleteOrder: boolean }).canCompleteOrder && Boolean(orderData.value) && Boolean(shippingInfo.value) && Boolean(paymentMethod.value))

  const buildCartSignature = (items: CartItem[]): string => {
    return JSON.stringify(
      items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
    )
  }

  const ensureCartLoaded = async () => {
    if (cartItems.value.length === 0 && typeof cartStore.loadFromStorage === 'function') {
      try {
        await cartStore.loadFromStorage()
      }
      catch (error: any) {
        console.error('Failed to load cart from storage for checkout review:', error)
      }
    }
  }

  const redirectToCartIfEmpty = async () => {
    if (cartItems.value.length === 0) {
      await navigateTo(localePath('/cart'))
      return true
    }
    return false
  }

  const redirectToMissingStep = async () => {
    if (!shippingInfo.value) {
      await navigateTo(localePath('/checkout'))
      return true
    }

    if (!paymentMethod.value) {
      await navigateTo(localePath('/checkout/payment'))
      return true
    }

    return false
  }

  const initializeReview = async () => {
    await ensureCartLoaded()
    if (await redirectToCartIfEmpty()) {
      return
    }

    await (checkoutStore as unknown as { initializeCheckout: (items: CartItem[]) => Promise<void> }).initializeCheckout(cartItems.value.slice())

    if (!(checkoutStore as unknown as { canProceedToReview: boolean }).canProceedToReview) {
      if (await redirectToMissingStep()) {
        return
      }
    }

    ;(checkoutStore as unknown as { currentStep: string }).currentStep = 'review'
    lastCartSignature.value = buildCartSignature(cartItems.value)
    hasInitialized.value = true
  }

  watch(
    cartItems,
    async (items) => {
      if (!hasInitialized.value) return
      if (!items || items.length === 0) {
        lastCartSignature.value = null
        return
      }

      const signature = buildCartSignature(items)
      if (signature === lastCartSignature.value) {
        return
      }

      try {
        await (checkoutStore as unknown as { calculateOrderData: (items: CartItem[]) => Promise<void> }).calculateOrderData(items)
        await (checkoutStore as unknown as { updateShippingCosts: () => Promise<void> }).updateShippingCosts()
        lastCartSignature.value = signature
      }
      catch (error: any) {
        console.error('Failed to refresh checkout totals on review page:', error)
      }
    },
    { deep: true },
  )

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  const validateOrder = (): boolean => {
    if (!orderData.value) {
      console.error('Order data is missing')
      return false
    }

    if (!shippingInfo.value) {
      console.error('Shipping information is missing')
      return false
    }

    if (!paymentMethod.value) {
      console.error('Payment method is missing')
      return false
    }

    if (!orderData.value.items || orderData.value.items.length === 0) {
      console.error('Cart is empty')
      return false
    }

    if (orderData.value.total <= 0) {
      console.error('Invalid order total')
      return false
    }

    return true
  }

  const goBack = async () => {
    const previousStep = (checkoutStore as unknown as { goToPreviousStep: () => string | null }).goToPreviousStep()
    if (!previousStep) return

    const stepPath = previousStep === 'shipping' ? '/checkout' : `/checkout/${previousStep}`
    await navigateTo(localePath(stepPath))
  }

  const editCart = async () => {
    await navigateTo(localePath('/cart'))
  }

  const editShipping = async () => {
    ;(checkoutStore as unknown as { goToStep: (step: string) => void }).goToStep('shipping')
    await navigateTo(localePath('/checkout'))
  }

  const editPayment = async () => {
    ;(checkoutStore as unknown as { goToStep: (step: string) => void }).goToStep('payment')
    await navigateTo(localePath('/checkout/payment'))
  }

  const processOrder = async (options: ProcessOrderOptions): Promise<ProcessOrderResult> => {
    if (!validateOrder()) {
      return { nextStep: null, success: false }
    }

    ;(checkoutStore as unknown as { termsAccepted: boolean, privacyAccepted: boolean, marketingConsent: boolean }).termsAccepted = options.termsAccepted
    ;(checkoutStore as unknown as { termsAccepted: boolean, privacyAccepted: boolean, marketingConsent: boolean }).privacyAccepted = options.privacyAccepted
    ;(checkoutStore as unknown as { termsAccepted: boolean, privacyAccepted: boolean, marketingConsent: boolean }).marketingConsent = options.marketingConsent

    try {
      const nextStep = await (checkoutStore as unknown as { proceedToNextStep: () => Promise<CheckoutStep | null> }).proceedToNextStep()
      return {
        nextStep,
        success: Boolean(nextStep),
      }
    }
    catch (error: any) {
      console.error('Failed to process order:', error)
      return { nextStep: null, success: false }
    }
  }

  return {
    orderData,
    shippingInfo,
    paymentMethod,
    cartItems,
    loading,
    processing,
    error: lastError,
    baseCanProceed,
    initializeReview,
    formatPrice,
    goBack,
    editCart,
    editShipping,
    editPayment,
    processOrder,
  }
}
