import { defineStore, storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useCheckoutSessionStore } from './checkout/session'
import { useCheckoutShippingStore } from './checkout/shipping'
import { useCheckoutPaymentStore } from './checkout/payment'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
import type { CheckoutStep, ShippingInformation, PaymentMethod, SavedPaymentMethod, Address, GuestInfo } from '~/types/checkout'
import type { CartItem } from '~/stores/cart/types'
import { validateShippingInformation, validatePaymentMethod } from '~/utils/checkout-validation'
import { createSystemError, CheckoutErrorCode } from '~/utils/checkout-errors'

export const useCheckoutStore = defineStore('checkout', () => {
  const session = useCheckoutSessionStore()
  const shipping = useCheckoutShippingStore()
  const payment = useCheckoutPaymentStore()
  const authStore = useAuthStore()
  const cartStore = useCartStore()

  const sessionRefs = storeToRefs(session)

  const canProceedToPayment = computed(() => {
    const info = sessionRefs.shippingInfo.value
    const errors = sessionRefs.validationErrors.value.shipping
    return Boolean(info?.address && info?.method && (!errors || errors.length === 0))
  })

  const canProceedToReview = computed(() => {
    const shippingErrors = sessionRefs.validationErrors.value.shipping
    const paymentErrors = sessionRefs.validationErrors.value.payment
    return Boolean(
      sessionRefs.shippingInfo.value
      && sessionRefs.paymentMethod.value
      && (!shippingErrors || shippingErrors.length === 0)
      && (!paymentErrors || paymentErrors.length === 0),
    )
  })

  const canCompleteOrder = computed(() => {
    const shippingErrors = sessionRefs.validationErrors.value.shipping
    const paymentErrors = sessionRefs.validationErrors.value.payment
    return Boolean(
      sessionRefs.shippingInfo.value
      && sessionRefs.paymentMethod.value
      && sessionRefs.orderData.value
      && (!shippingErrors || shippingErrors.length === 0)
      && (!paymentErrors || paymentErrors.length === 0),
    )
  })

  const currentStepIndex = computed(() => {
    const steps: CheckoutStep[] = ['shipping', 'payment', 'review', 'confirmation']
    return steps.indexOf(sessionRefs.currentStep.value)
  })

  const orderTotal = computed(() => sessionRefs.orderData.value?.total ?? 0)

  const formattedOrderTotal = computed(() => {
    if (!sessionRefs.orderData.value) return '€0.00'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(sessionRefs.orderData.value.total)
  })

  const hasFieldError = (field: string): boolean => {
    return Boolean(sessionRefs.validationErrors.value[field]?.length)
  }

  const getFieldErrors = (field: string): string[] => {
    return sessionRefs.validationErrors.value[field] || []
  }

  const validateCurrentStep = (): boolean => {
    session.clearValidationErrors()

    if (sessionRefs.currentStep.value === 'shipping') {
      const info = sessionRefs.shippingInfo.value
      if (!info) {
        session.setValidationErrors('shipping', ['Shipping information is required'])
        return false
      }
      const validation = validateShippingInformation(info)
      if (!validation.isValid) {
        session.setValidationErrors('shipping', validation.errors.map(err => err.message))
        return false
      }
    }

    if (sessionRefs.currentStep.value === 'payment') {
      const method = sessionRefs.paymentMethod.value
      if (!method) {
        session.setValidationErrors('payment', ['Payment method is required'])
        return false
      }
      const validation = validatePaymentMethod(method)
      if (!validation.isValid) {
        session.setValidationErrors('payment', validation.errors.map(err => err.message))
        return false
      }
    }

    return true
  }

  const goToStep = async (step: CheckoutStep): Promise<void> => {
    if (!validateCurrentStep()) return
    session.setCurrentStep(step)
    await session.persist({
      shippingInfo: sessionRefs.shippingInfo.value,
      paymentMethod: sessionRefs.paymentMethod.value,
    })
  }

  const proceedToNextStep = async (): Promise<CheckoutStep | null> => {
    const steps: CheckoutStep[] = ['shipping', 'payment', 'review', 'confirmation']
    const currentIndex = steps.indexOf(sessionRefs.currentStep.value)

    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1]

      if (!validateCurrentStep()) {
        return null
      }

      if (sessionRefs.currentStep.value === 'shipping' && nextStep === 'payment') {
        await shipping.updateShippingCosts()
      }
      else if (sessionRefs.currentStep.value === 'payment' && nextStep === 'review') {
        await payment.preparePayment()
      }
      else if (sessionRefs.currentStep.value === 'review' && nextStep === 'confirmation') {
        await payment.processPayment()
      }

      return nextStep as CheckoutStep | undefined || null
    }

    return null
  }

  const goToPreviousStep = (): CheckoutStep | null => {
    const steps: CheckoutStep[] = ['shipping', 'payment', 'review', 'confirmation']
    const currentIndex = steps.indexOf(sessionRefs.currentStep.value)

    if (currentIndex > 0) {
      return steps[currentIndex - 1] as CheckoutStep | undefined || null
    }

    return null
  }

  const initializeCheckout = async (cartItems?: CartItem[]): Promise<void> => {
    session.setLoading(true)
    session.clearError()

    try {
      if (!sessionRefs.sessionId.value) {
        session.setSessionId(session.generateSessionId())
      }

      session.setSessionExpiry(new Date(Date.now() + 30 * 60 * 1000))

      // Lock the cart to prevent modifications during checkout
      try {
        await cartStore.lockCart(sessionRefs.sessionId.value as string, 30)
        console.log('Cart locked for checkout session:', sessionRefs.sessionId.value)
      }
      catch (lockError: any) {
        console.warn('Failed to lock cart:', lockError)

        // Check if cart is locked by another session (potential double checkout)
        const lockMessage = lockError?.message || ''
        if (lockMessage.includes('already locked') || lockMessage.includes('locked by')) {
          // Critical: Cart may be in use in another tab/session
          console.error('Cart locked by another session - potential concurrent checkout')
          // Don't throw - allow checkout to continue but user should be aware
          // The UI should ideally warn users not to use multiple tabs
        }

        // Continue with checkout even if locking fails (degraded mode)
        // In production, consider showing a subtle warning to the user
      }

      const restored = session.restore()
      if (restored?.shippingInfo) {
        session.setShippingInfo(restored.shippingInfo)
      }
      if (restored?.paymentMethod) {
        session.setPaymentMethodState(restored.paymentMethod)
      }

      const guestEmail = sessionRefs.guestInfo.value?.email?.trim() || null
      const authenticatedEmail = authStore.user?.email?.trim() || null
      if (!sessionRefs.contactEmail.value) {
        session.setContactEmail(guestEmail || authenticatedEmail || null)
      }

      await shipping.calculateOrderData(cartItems)
      if (sessionRefs.shippingInfo.value?.address) {
        await shipping.loadShippingMethods()
      }

      await payment.loadSavedPaymentMethods()

      session.setLastSyncAt(new Date())
      await session.persist({
        shippingInfo: sessionRefs.shippingInfo.value,
        paymentMethod: sessionRefs.paymentMethod.value,
      })
    }
    catch (error: any) {
      const checkoutError = createSystemError(
        error instanceof Error ? error.message : 'Failed to initialize checkout',
        CheckoutErrorCode.SYSTEM_ERROR,
      )
      session.handleError(checkoutError)
      throw error
    }
    finally {
      session.setLoading(false)
    }
  }

  const updateGuestInfo = async (info: GuestInfo): Promise<void> => {
    session.setGuestInfo(info)
    await session.persist({
      shippingInfo: sessionRefs.shippingInfo.value,
      paymentMethod: sessionRefs.paymentMethod.value,
    })
  }

  const saveToStorage = async (): Promise<void> => {
    await session.persist({
      shippingInfo: sessionRefs.shippingInfo.value,
      paymentMethod: sessionRefs.paymentMethod.value,
    })
  }

  const loadFromStorage = (): void => {
    const restored = session.restore()
    if (restored?.shippingInfo) {
      session.setShippingInfo(restored.shippingInfo)
    }
    if (restored?.paymentMethod) {
      session.setPaymentMethodState(restored.paymentMethod)
    }
  }

  const updateShippingInfo = async (info: ShippingInformation, cartItems?: CartItem[]): Promise<void> => {
    await shipping.updateShippingInfo(info, cartItems)
  }

  const updatePaymentMethod = async (method: PaymentMethod): Promise<void> => {
    await payment.updatePaymentMethod(method)
  }

  const savePaymentMethodData = async (method: SavedPaymentMethod): Promise<void> => {
    await payment.savePaymentMethodData(method)
  }

  const saveAddress = async (address: Address | { id?: number | undefined, userId?: string | undefined, type: 'shipping' | 'billing', street: string, city: string, postalCode: string, province?: string | undefined, country: string, isDefault: boolean, createdAt?: string | undefined }): Promise<void> => {
    session.setSavedAddresses([...sessionRefs.savedAddresses.value, address as Address])
  }

  const resetCheckout = (): void => {
    session.reset()
  }

  const cancelCheckout = async (): Promise<void> => {
    try {
      // Unlock the cart when user cancels checkout
      if (sessionRefs.sessionId.value) {
        await cartStore.unlockCart(sessionRefs.sessionId.value as string)
        console.log('Cart unlocked after checkout cancellation')
      }

      // Reset checkout session
      session.reset()
    }
    catch (error: any) {
      console.error('Error canceling checkout:', error)
      // Reset anyway
      session.reset()
    }
  }

  const prefetchCheckoutData = async (): Promise<void> => {
    // Only prefetch for authenticated users
    if (!authStore.isAuthenticated) {
      session.setDataPrefetched(true)
      return
    }

    try {
      // Fetch addresses and preferences in parallel from the API
      const response = await $fetch('/api/checkout/user-data') as any

      // Update session with fetched data
      if (response.addresses && Array.isArray(response.addresses)) {
        session.setSavedAddresses(response.addresses)
      }

      if (response.preferences) {
        session.setPreferences(response.preferences)
      }

      // Mark data as prefetched
      session.setDataPrefetched(true)
    }
    catch (error: any) {
      console.error('Failed to prefetch checkout data:', error)
      // Don't throw - this is a non-critical enhancement
      // Mark as prefetched anyway to avoid repeated failed attempts
      session.setDataPrefetched(true)
    }
  }

  const api: Record<string | symbol, unknown> = {
    canProceedToPayment,
    canProceedToReview,
    canCompleteOrder,
    currentStepIndex,
    orderTotal,
    formattedOrderTotal,
    hasFieldError,
    getFieldErrors,
    validateCurrentStep,
    goToStep,
    proceedToNextStep,
    goToPreviousStep,
    initializeCheckout,
    prefetchCheckoutData,
    saveToStorage,
    loadFromStorage,
    updateGuestInfo,
    updateShippingInfo,
    updatePaymentMethod,
    savePaymentMethodData,
    saveAddress,
    calculateOrderData: shipping.calculateOrderData,
    loadShippingMethods: shipping.loadShippingMethods,
    updateShippingCosts: shipping.updateShippingCosts,
    preparePayment: payment.preparePayment,
    processPayment: payment.processPayment,
    processCashPayment: payment.processCashPayment,
    processCreditCardPayment: payment.processCreditCardPayment,
    processPayPalPayment: payment.processPayPalPayment,
    processBankTransferPayment: payment.processBankTransferPayment,
    createOrder: payment.createOrderRecord,
    completeCheckout: payment.completeCheckout,
    clearCart: payment.clearCart,
    sendConfirmationEmail: payment.sendConfirmationEmail,
    updateInventory: payment.updateInventory,
    loadSavedPaymentMethods: payment.loadSavedPaymentMethods,
    persist: session.persist,
    restore: session.restore,
    clearStorage: session.clearStorage,
    handleError: session.handleError,
    clearError: session.clearError,
    retryLastAction: session.retryLastAction,
    clearValidationErrors: session.clearValidationErrors,
    clearFieldErrors: session.clearFieldErrors,
    setTermsAccepted: session.setTermsAccepted,
    setPrivacyAccepted: session.setPrivacyAccepted,
    setMarketingConsent: session.setMarketingConsent,
    resetCheckout,
    cancelCheckout,
  }

  return new Proxy(api, {
    get(target, prop, receiver) {
      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop, receiver)
      }
      if (typeof prop === 'string') {
        const refCandidate = Reflect.get(sessionRefs, prop)
        if (refCandidate && typeof refCandidate === 'object' && 'value' in refCandidate) {
          return (refCandidate as { value: unknown }).value
        }
      }
      return Reflect.get(session, prop as keyof typeof session)
    },
    set(target, prop, value) {
      if (Reflect.has(target, prop)) {
        return Reflect.set(target, prop, value, target)
      }
      if (typeof prop === 'string') {
        const refCandidate = Reflect.get(sessionRefs, prop)
        if (refCandidate && typeof refCandidate === 'object' && 'value' in refCandidate) {
          (refCandidate as { value: unknown }).value = value
          return true
        }
      }
      return Reflect.set(session, prop as keyof typeof session, value)
    },
  })
})

export type CheckoutStore = ReturnType<typeof useCheckoutStore>
