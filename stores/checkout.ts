import { defineStore } from 'pinia'
import { computed, reactive, toRefs } from 'vue'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useToastStore } from '~/stores/toast'
import { useStoreI18n } from '~/composables/useStoreI18n'
import type {
  CheckoutState,
  CheckoutStep,
  ShippingInformation,
  PaymentMethod,
  SavedPaymentMethod,
  Address,
  CheckoutError
} from '~/types/checkout'
import type { CartItem } from '~/stores/cart/types'
import {
  fetchShippingMethods,
  createPaymentIntent,
  confirmPaymentIntent,
  createOrder as apiCreateOrder,
  sendConfirmationEmail as apiSendConfirmationEmail,
  updateInventory as apiUpdateInventory,
  fetchSavedPaymentMethods,
  savePaymentMethod,
  clearRemoteCart
} from '~/lib/checkout/api'
import { buildOrderData, applyShippingMethod } from '~/lib/checkout/order-calculation'
import { validateShippingInformation, validatePaymentMethod } from '~/utils/checkout-validation'
import {
  createValidationError,
  createPaymentError,
  createSystemError,
  CheckoutErrorCode,
  logCheckoutError
} from '~/utils/checkout-errors'

const INITIAL_STATE: CheckoutState = {
  currentStep: 'shipping',
  sessionId: null,
  guestInfo: null,
  contactEmail: null,
  shippingInfo: null,
  paymentMethod: null,
  orderData: null,
  loading: false,
  processing: false,
  errors: {},
  lastError: null,
  paymentIntent: null,
  paymentClientSecret: null,
  sessionExpiresAt: null,
  lastSyncAt: null,
  validationErrors: {},
  isValid: false,
  savedAddresses: [],
  savedPaymentMethods: [],
  availableShippingMethods: [],
  availableCountries: ['ES', 'RO', 'MD', 'FR', 'DE', 'IT'],
  termsAccepted: false,
  privacyAccepted: false,
  marketingConsent: false
}

export const useCheckoutStore = defineStore('checkout', () => {
  const state = reactive<CheckoutState>({ ...INITIAL_STATE })

  const cartStore = useCartStore()
  const authStore = useAuthStore()
  const toast = useToastStore()
  const { t, locale } = useStoreI18n()

  const saveToStorage = (): void => {
    if (typeof window === 'undefined') return

    try {
      const checkoutData = {
        sessionId: state.sessionId,
        currentStep: state.currentStep,
        guestInfo: state.guestInfo,
        contactEmail: state.contactEmail,
        shippingInfo: state.shippingInfo,
        paymentMethod: state.paymentMethod
          ? {
              ...state.paymentMethod,
              creditCard: state.paymentMethod.creditCard
                ? { holderName: state.paymentMethod.creditCard.holderName }
                : undefined
            }
          : null,
        orderData: state.orderData,
        sessionExpiresAt: state.sessionExpiresAt,
        lastSyncAt: new Date(),
        termsAccepted: state.termsAccepted,
        privacyAccepted: state.privacyAccepted,
        marketingConsent: state.marketingConsent
      }

      localStorage.setItem('checkout_session', JSON.stringify(checkoutData))
    } catch (error) {
      console.error('Failed to save checkout session:', error)
    }
  }

  const clearStorage = (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('checkout_session')
  }

  const loadFromStorage = (): void => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('checkout_session')
      if (!stored) return

      const checkoutData = JSON.parse(stored)

      if (checkoutData.sessionExpiresAt && new Date(checkoutData.sessionExpiresAt) < new Date()) {
        clearStorage()
        return
      }

      state.sessionId = checkoutData.sessionId
      state.currentStep = checkoutData.currentStep || 'shipping'
      state.guestInfo = checkoutData.guestInfo || null
      state.contactEmail = checkoutData.contactEmail || null
      state.shippingInfo = checkoutData.shippingInfo || null
      state.paymentMethod = checkoutData.paymentMethod || null
      state.orderData = checkoutData.orderData || null
      if (!state.contactEmail && state.orderData?.customerEmail) {
        state.contactEmail = state.orderData.customerEmail
      }
      state.sessionExpiresAt = checkoutData.sessionExpiresAt ? new Date(checkoutData.sessionExpiresAt) : null
      state.lastSyncAt = checkoutData.lastSyncAt ? new Date(checkoutData.lastSyncAt) : null
      state.termsAccepted = checkoutData.termsAccepted || false
      state.privacyAccepted = checkoutData.privacyAccepted || false
      state.marketingConsent = checkoutData.marketingConsent || false

    } catch (error) {
      console.error('Failed to load checkout session:', error)
      clearStorage()
    }
  }

  const handleError = (error: CheckoutError): void => {
    state.lastError = error
    state.errors[error.field || 'general'] = error.message

    try {
      toast.error('Checkout Error', error.message, {
        actionText: error.userAction,
        actionHandler: error.retryable ? () => retryLastAction() : undefined
      })
    } catch {
      // toast store may be mocked (tests)
    }
  }

  const clearError = (field?: string): void => {
    if (field) {
      delete state.errors[field]
    } else {
      state.errors = {}
    }
    state.lastError = null
  }

  const retryLastAction = async (): Promise<void> => {
    if (state.lastError?.retryable) {
      clearError(state.lastError.field)
      // Future: add specific retry hooks
    }
  }

  const clearValidationErrors = (): void => {
    state.validationErrors = {}
  }

  const clearFieldErrors = (field: string): void => {
    if (state.validationErrors[field]) {
      delete state.validationErrors[field]
    }
  }

  const validateCurrentStep = (): boolean => {
    clearValidationErrors()

    if (state.currentStep === 'shipping') {
      if (!state.shippingInfo) {
        state.validationErrors.shipping = ['Shipping information is required']
        return false
      }
      const validation = validateShippingInformation(state.shippingInfo)
      if (!validation.isValid) {
        state.validationErrors.shipping = validation.errors.map(err => err.message)
        return false
      }
    }

    if (state.currentStep === 'payment') {
      if (!state.paymentMethod) {
        state.validationErrors.payment = ['Payment method is required']
        return false
      }
      const validation = validatePaymentMethod(state.paymentMethod)
      if (!validation.isValid) {
        state.validationErrors.payment = validation.errors.map(err => err.message)
        return false
      }
    }

    return true
  }

  const loadSavedData = async (): Promise<void> => {
    try {
      if (!authStore.isAuthenticated) {
        state.savedAddresses = []
        state.savedPaymentMethods = []
        return
      }

      state.savedPaymentMethods = await fetchSavedPaymentMethods()
      state.savedAddresses = []
    } catch (error) {
      console.error('Failed to load saved data:', error)
      state.savedAddresses = []
      state.savedPaymentMethods = []
    }
  }

  const saveAddress = async (address: Address): Promise<void> => {
    state.savedAddresses.push(address)
  }

  const savePaymentMethodData = async (method: SavedPaymentMethod): Promise<void> => {
    try {
      if (!authStore.isAuthenticated) return

      const savedMethod = await savePaymentMethod(method)
      const existingIndex = state.savedPaymentMethods.findIndex(m => m.id === savedMethod.id)
      if (existingIndex >= 0) {
        state.savedPaymentMethods[existingIndex] = savedMethod
      } else {
        state.savedPaymentMethods.push(savedMethod)
      }
    } catch (error) {
      console.error('Failed to save payment method:', error)
      throw error
    }
  }

  const updateShippingCosts = async (): Promise<void> => {
    if (!state.shippingInfo?.method || !state.orderData) return

    try {
      state.orderData = applyShippingMethod(state.orderData, state.shippingInfo.method)
    } catch (error) {
      console.error('Failed to update shipping costs:', error)
    }
  }

  const loadShippingMethods = async (): Promise<void> => {
    if (!state.shippingInfo?.address || !state.orderData) {
      state.availableShippingMethods = []
      return
    }

    try {
      state.availableShippingMethods = await fetchShippingMethods({
        country: state.shippingInfo.address.country,
        postalCode: state.shippingInfo.address.postalCode,
        orderTotal: state.orderData.subtotal
      })
    } catch (error) {
      console.error('Failed to load shipping methods:', error)
      state.availableShippingMethods = [
        {
          id: 'standard',
          name: t('checkout.shippingMethod.standard.name'),
          description: t('checkout.shippingMethod.standard.description'),
          price: 5.99,
          estimatedDays: 4
        }
      ]
    }
  }

  const calculateOrderData = async (cartItems?: CartItem[]): Promise<void> => {
    const items = cartItems ?? cartStore.items?.value ?? []

    state.orderData = buildOrderData(items, {
      shippingCost: state.shippingInfo?.method.price ?? state.orderData?.shippingCost ?? 0,
      currency: state.orderData?.currency ?? 'EUR'
    })

    if (state.shippingInfo?.method && state.orderData) {
      state.orderData = applyShippingMethod(state.orderData, state.shippingInfo.method)
    }

    if (state.orderData) {
      state.orderData.customerEmail = state.contactEmail
    }
  }

  const updateShippingInfo = async (info: ShippingInformation): Promise<void> => {
    state.loading = true
    clearFieldErrors('shipping')

    try {
      const validationResult = validateShippingInformation(info)
      if (!validationResult.isValid) {
        state.validationErrors.shipping = validationResult.errors.map(err => err.message)
        throw new Error(validationResult.errors.map(err => err.message).join(', '))
      }

      state.shippingInfo = info

      if (!state.orderData) {
        await calculateOrderData()
      }

      await updateShippingCosts()
      await loadShippingMethods()

      saveToStorage()

      try {
        toast.success(
          t('checkout.success.shippingUpdated'),
          t('checkout.success.shippingInfoSaved')
        )
      } catch {
        // noop
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update shipping information'
      const checkoutError = createValidationError('shipping', message, CheckoutErrorCode.SHIPPING_ADDRESS_INVALID)
      handleError(checkoutError)
      throw error
    } finally {
      state.loading = false
    }
  }

  const updatePaymentMethod = async (method: PaymentMethod): Promise<void> => {
    state.loading = true
    clearFieldErrors('payment')

    try {
      const validationResult = validatePaymentMethod(method)
      if (!validationResult.isValid) {
        state.validationErrors.payment = validationResult.errors.map(err => err.message)
        throw new Error(validationResult.errors.map(err => err.message).join(', '))
      }

      state.paymentMethod = method
      saveToStorage()

      try {
        toast.success(
          t('checkout.success.paymentUpdated'),
          t('checkout.success.paymentMethodSaved')
        )
      } catch {
        // noop
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update payment method'
      const checkoutError = createValidationError('payment', message, CheckoutErrorCode.VALIDATION_FAILED)
      handleError(checkoutError)
      throw error
    } finally {
      state.loading = false
    }
  }

  const generateSessionId = (): string => {
    return `checkout_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  }

  const preparePayment = async (): Promise<void> => {
    if (!state.paymentMethod || !state.orderData) return

    try {
      state.processing = true
      if (!state.sessionId) {
        state.sessionId = generateSessionId()
      }

      if (state.paymentMethod.type === 'credit_card') {
        const paymentIntent = await createPaymentIntent({
          amount: Math.round(state.orderData.total * 100),
          currency: state.orderData.currency.toLowerCase(),
          sessionId: state.sessionId
        })

        state.paymentIntent = paymentIntent.id
        state.paymentClientSecret = paymentIntent.clientSecret
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to prepare payment'
      const checkoutError = createPaymentError(message, CheckoutErrorCode.PAYMENT_PROCESSING_ERROR)
      handleError(checkoutError)
      logCheckoutError(checkoutError, {
        sessionId: state.sessionId ?? undefined,
        step: 'preparePayment'
      }, error)
      throw error
    } finally {
      state.processing = false
    }
  }

  const processCashPayment = async () => ({
    success: true,
    transactionId: `cash_${Date.now()}`,
    paymentMethod: 'cash',
    status: 'pending_delivery'
  })

  const processCreditCardPayment = async () => {
    try {
      if (!state.paymentIntent || !state.paymentClientSecret) {
        throw new Error('Payment intent not initialized')
      }

      if (!state.sessionId) {
        state.sessionId = generateSessionId()
      }

      const response = await confirmPaymentIntent({
        paymentIntentId: state.paymentIntent,
        sessionId: state.sessionId
      })

      if (response.success && response.paymentIntent.status === 'succeeded') {
        return {
          success: true,
          transactionId: response.paymentIntent.id,
          paymentMethod: 'credit_card',
          status: 'completed',
          charges: response.paymentIntent.charges
        }
      }

      if (response.requiresAction) {
        throw new Error('Payment requires additional authentication')
      }

      throw new Error(response.error || 'Payment failed')
    } catch (error) {
      console.error('Credit card payment failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
        paymentMethod: 'credit_card'
      }
    }
  }

  const processPayPalPayment = async () => {
    try {
      return {
        success: true,
        transactionId: `pp_${Date.now()}`,
        paymentMethod: 'paypal',
        status: 'completed'
      }
    } catch (error) {
      console.error('PayPal payment failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PayPal payment failed',
        paymentMethod: 'paypal'
      }
    }
  }

  const processBankTransferPayment = async () => ({
    success: true,
    transactionId: `bt_${Date.now()}`,
    paymentMethod: 'bank_transfer',
    pending: true
  })

  const clearCart = async (): Promise<void> => {
    try {
      const sessionId = cartStore.sessionId?.value || state.sessionId

      if (sessionId) {
        await clearRemoteCart(sessionId).catch(error => {
          console.warn('Failed to clear remote cart:', error)
        })
      }

      await cartStore.clearCart()
    } catch (error) {
      console.error('Failed to clear cart:', error)
    }
  }

  const sendConfirmationEmail = async (): Promise<void> => {
    if (!state.orderData) return

    try {
      const candidateEmail = state.orderData?.customerEmail || state.contactEmail || state.guestInfo?.email || null
      const trimmedEmail = candidateEmail ? candidateEmail.trim() : undefined
      await apiSendConfirmationEmail({
        orderId: state.orderData.orderId,
        sessionId: state.sessionId,
        email: trimmedEmail
      })
    } catch (error) {
      console.error('Failed to send confirmation email:', error)
    }
  }

  const updateInventory = async (): Promise<void> => {
    if (!state.orderData) return

    try {
      await apiUpdateInventory(state.orderData.items, state.orderData.orderId)
    } catch (error) {
      console.error('Failed to update inventory:', error)
    }
  }

  const createOrderRecord = async (paymentResult: any): Promise<void> => {
    if (!state.orderData || !state.shippingInfo || !state.paymentMethod) {
      throw new Error('Missing required order information')
    }

    try {
      if (!state.sessionId) {
        state.sessionId = generateSessionId()
      }

      const guestEmail = state.guestInfo?.email?.trim() || null
      const customerName = `${state.shippingInfo.address.firstName || ''} ${state.shippingInfo.address.lastName || ''}`.trim() || 'Customer'
      const authenticatedEmail = authStore.user?.email?.trim() || null
      const contactEmail = guestEmail || authenticatedEmail || state.contactEmail || null
      state.contactEmail = contactEmail

      if (process.dev) {
        console.info('[Checkout] Preparing order payload', {
          sessionId: state.sessionId,
          guestEmail,
          authenticatedEmail,
          contactEmail,
          itemCount: state.orderData.items.length,
          paymentMethod: state.paymentMethod.type,
          locale: locale.value
        })
      }

      const response = await apiCreateOrder({
        sessionId: state.sessionId,
        items: state.orderData.items,
        shippingAddress: state.shippingInfo.address,
        billingAddress: state.shippingInfo.address,
        paymentMethod: state.paymentMethod.type,
        paymentResult,
        subtotal: state.orderData.subtotal,
        shippingCost: state.orderData.shippingCost,
        tax: state.orderData.tax,
        total: state.orderData.total,
        currency: state.orderData.currency,
        guestEmail,
        customerName,
        locale: locale.value,
        marketingConsent: state.guestInfo?.emailUpdates ?? false
      })

      if (process.dev) {
        console.info('[Checkout] Order created successfully', {
          orderId: response.id,
          orderNumber: response.orderNumber,
          guestEmail
        })
      }

      state.orderData = {
        ...state.orderData,
        orderId: response.id,
        orderNumber: response.orderNumber,
        customerEmail: contactEmail
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const checkoutError = createSystemError(`Failed to create order: ${message}`, CheckoutErrorCode.ORDER_CREATION_FAILED)
      logCheckoutError(checkoutError, {
        sessionId: state.sessionId ?? undefined,
        step: 'createOrder'
      }, error)
      throw new Error('Failed to create order: ' + message)
    }
  }

  const completeCheckout = async (): Promise<void> => {
    try {
      await clearCart()
      await sendConfirmationEmail()
      await updateInventory()

      state.currentStep = 'confirmation'
      saveToStorage()

      try {
        toast.success(
          t('checkout.success.orderCompleted'),
          t('checkout.success.orderConfirmation')
        )
      } catch {
        // noop
      }
    } catch (error) {
      console.error('Failed to complete checkout:', error)
    }
  }

  const processPayment = async (): Promise<void> => {
    if (!state.paymentMethod || !state.orderData || !state.shippingInfo) {
      throw new Error('Missing required checkout information')
    }

    state.processing = true

    try {
      let paymentResult

      if (state.paymentMethod.type === 'cash') {
        paymentResult = await processCashPayment()
      } else if (state.paymentMethod.type === 'credit_card') {
        paymentResult = await processCreditCardPayment()
      } else if (state.paymentMethod.type === 'paypal') {
        paymentResult = await processPayPalPayment()
      } else if (state.paymentMethod.type === 'bank_transfer') {
        paymentResult = await processBankTransferPayment()
      } else {
        throw new Error('Invalid payment method')
      }

      if (!paymentResult?.success) {
        throw new Error(paymentResult?.error || 'Payment processing failed')
      }

      await createOrderRecord(paymentResult)
      await completeCheckout()

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment processing failed'
      const checkoutError = createPaymentError(message, CheckoutErrorCode.PAYMENT_PROCESSING_ERROR)
      handleError(checkoutError)
      logCheckoutError(checkoutError, {
        sessionId: state.sessionId ?? undefined,
        step: 'processPayment'
      }, error)
      throw error
    } finally {
      state.processing = false
    }
  }

  const goToStep = (step: CheckoutStep): void => {
    if (!validateCurrentStep()) return
    state.currentStep = step
    saveToStorage()
  }

  const proceedToNextStep = async (): Promise<CheckoutStep | null> => {
    const steps: CheckoutStep[] = ['shipping', 'payment', 'review', 'confirmation']
    const currentIndex = steps.indexOf(state.currentStep)

    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1]

      if (!validateCurrentStep()) {
        return null
      }

      if (state.currentStep === 'shipping' && nextStep === 'payment') {
        await updateShippingCosts()
      } else if (state.currentStep === 'payment' && nextStep === 'review') {
        await preparePayment()
      } else if (state.currentStep === 'review' && nextStep === 'confirmation') {
        await processPayment()
      }

      return nextStep
    }

    return null
  }

  const goToPreviousStep = (): CheckoutStep | null => {
    const steps: CheckoutStep[] = ['shipping', 'payment', 'review', 'confirmation']
    const currentIndex = steps.indexOf(state.currentStep)

    if (currentIndex > 0) {
      return steps[currentIndex - 1]
    }

    return null
  }

  const initializeCheckout = async (cartItems?: CartItem[]): Promise<void> => {
    state.loading = true
    state.errors = {}

    try {
      if (!state.sessionId) {
        state.sessionId = generateSessionId()
      }

      state.sessionExpiresAt = new Date(Date.now() + 30 * 60 * 1000)

      loadFromStorage()

      const authenticatedEmail = authStore.user?.email?.trim()
      const guestEmail = state.guestInfo?.email?.trim()
      const resolvedEmail = guestEmail || authenticatedEmail || state.contactEmail || null
      state.contactEmail = resolvedEmail

      await calculateOrderData(cartItems)

      if (state.shippingInfo?.address) {
        await loadShippingMethods()
      }

      await loadSavedData()

      state.lastSyncAt = new Date()
      saveToStorage()

    } catch (error) {
      const checkoutError = createSystemError(
        error instanceof Error ? error.message : 'Failed to initialize checkout',
        CheckoutErrorCode.SYSTEM_ERROR
      )
      handleError(checkoutError)
      logCheckoutError(checkoutError, {
        sessionId: state.sessionId ?? undefined,
        step: 'initializeCheckout'
      }, error)
      throw error
    } finally {
      state.loading = false
    }
  }

  const resetCheckout = (): void => {
    Object.assign(state, { ...INITIAL_STATE })
    clearStorage()
  }

  const canProceedToPayment = computed(() => {
    return Boolean(
      state.shippingInfo &&
      state.shippingInfo.address &&
      state.shippingInfo.method &&
      Object.keys(state.validationErrors).length === 0
    )
  })

  const canProceedToReview = computed(() => {
    return Boolean(
      state.shippingInfo &&
      state.paymentMethod &&
      Object.keys(state.validationErrors).length === 0
    )
  })

  const canCompleteOrder = computed(() => {
    return Boolean(
      state.shippingInfo &&
      state.paymentMethod &&
      state.orderData &&
      Object.keys(state.validationErrors).length === 0
    )
  })

  const currentStepIndex = computed(() => {
    const steps: CheckoutStep[] = ['shipping', 'payment', 'review', 'confirmation']
    return steps.indexOf(state.currentStep)
  })

  const isSessionExpired = computed(() => {
    if (!state.sessionExpiresAt) return false
    return new Date() > state.sessionExpiresAt
  })

  const orderTotal = computed(() => state.orderData?.total ?? 0)

  const formattedOrderTotal = computed(() => {
    if (!state.orderData) return '€0.00'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(state.orderData.total)
  })

  const hasFieldError = (field: string): boolean => {
    return Boolean(state.validationErrors[field]?.length)
  }

  const getFieldErrors = (field: string): string[] => {
    return state.validationErrors[field] || []
  }

  return {
    ...toRefs(state),
    canProceedToPayment,
    canProceedToReview,
    canCompleteOrder,
    currentStepIndex,
    isSessionExpired,
    orderTotal,
    formattedOrderTotal,
    hasFieldError,
    getFieldErrors,
    saveToStorage,
    loadFromStorage,
    clearStorage,
    handleError,
    retryLastAction,
    clearError,
    validateCurrentStep,
    clearValidationErrors,
    clearFieldErrors,
    loadSavedData,
    saveAddress,
    savePaymentMethodData,
    updateShippingInfo,
    updateShippingCosts,
    loadShippingMethods,
    updatePaymentMethod,
    preparePayment,
    processPayment,
    createOrder: createOrderRecord,
    clearCart,
    sendConfirmationEmail,
    updateInventory,
    completeCheckout,
    initializeCheckout,
    generateSessionId,
    calculateOrderData,
    goToStep,
    proceedToNextStep,
    goToPreviousStep,
    resetCheckout,
    processCashPayment,
    processCreditCardPayment,
    processPayPalPayment,
    processBankTransferPayment
  }
})

export type CheckoutStore = ReturnType<typeof useCheckoutStore>
