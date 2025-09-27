// Checkout composable
// Provides a convenient interface for checkout functionality

import { useCheckoutStore } from '~/stores/checkout'
import type { CheckoutStep, ShippingInformation, PaymentMethod, Address } from '~/stores/checkout'
import { validateCheckoutData, validateAddress, validatePaymentMethod, validateShippingInformation } from '~/utils/checkout-validation'
import { parseApiError, logCheckoutError, isRetryableError } from '~/utils/checkout-errors'

export interface UseCheckoutReturn {
  // Store state
  store: ReturnType<typeof useCheckoutStore>
  
  // Computed properties
  currentStep: ComputedRef<CheckoutStep>
  isLoading: ComputedRef<boolean>
  isProcessing: ComputedRef<boolean>
  canProceed: ComputedRef<boolean>
  orderTotal: ComputedRef<string>
  
  // Navigation methods
  goToStep: (step: CheckoutStep) => void
  nextStep: () => Promise<void>
  previousStep: () => void
  
  // Data update methods
  updateShipping: (info: ShippingInformation) => Promise<void>
  updatePayment: (method: PaymentMethod) => Promise<void>
  
  // Validation methods
  validateCurrentStep: () => boolean
  validateShipping: (info: ShippingInformation) => ReturnType<typeof validateShippingInformation>
  validatePayment: (method: PaymentMethod) => ReturnType<typeof validatePaymentMethod>
  
  // Error handling
  handleError: (error: any) => void
  clearErrors: () => void
  
  // Utility methods
  initialize: (cartItems: any[]) => Promise<void>
  reset: () => void
  
  // Session management
  isSessionValid: ComputedRef<boolean>
  refreshSession: () => Promise<void>
}

export function useCheckout(): UseCheckoutReturn {
  const store = useCheckoutStore()
  const { t } = useStoreI18n()

  // =============================================
  // COMPUTED PROPERTIES
  // =============================================

  const currentStep = computed(() => store.currentStep)
  const isLoading = computed(() => store.loading)
  const isProcessing = computed(() => store.processing)
  const orderTotal = computed(() => store.formattedOrderTotal)
  
  const canProceed = computed(() => {
    switch (store.currentStep) {
      case 'shipping':
        return store.canProceedToPayment
      case 'payment':
        return store.canProceedToReview
      case 'review':
        return store.canCompleteOrder
      default:
        return false
    }
  })

  const isSessionValid = computed(() => !store.isSessionExpired)

  // =============================================
  // NAVIGATION METHODS
  // =============================================

  const goToStep = (step: CheckoutStep): void => {
    try {
      store.goToStep(step)
    } catch (error) {
      handleError(error)
    }
  }

  const nextStep = async (): Promise<void> => {
    try {
      await store.proceedToNextStep()
    } catch (error) {
      handleError(error)
      throw error
    }
  }

  const previousStep = (): void => {
    try {
      store.goToPreviousStep()
    } catch (error) {
      handleError(error)
    }
  }

  // =============================================
  // DATA UPDATE METHODS
  // =============================================

  const updateShipping = async (info: ShippingInformation): Promise<void> => {
    try {
      // Validate before updating
      const validation = validateShippingInformation(info)
      if (!validation.isValid) {
        const errorMessage = validation.errors.map(e => e.message).join(', ')
        throw new Error(errorMessage)
      }

      await store.updateShippingInfo(info)
    } catch (error) {
      handleError(error)
      throw error
    }
  }

  const updatePayment = async (method: PaymentMethod): Promise<void> => {
    try {
      // Validate before updating
      const validation = validatePaymentMethod(method)
      if (!validation.isValid) {
        const errorMessage = validation.errors.map(e => e.message).join(', ')
        throw new Error(errorMessage)
      }

      await store.updatePaymentMethod(method)
    } catch (error) {
      handleError(error)
      throw error
    }
  }

  // =============================================
  // VALIDATION METHODS
  // =============================================

  const validateCurrentStep = (): boolean => {
    try {
      return store.validateCurrentStep()
    } catch (error) {
      handleError(error)
      return false
    }
  }

  const validateShipping = (info: ShippingInformation) => {
    return validateShippingInformation(info)
  }

  const validatePayment = (method: PaymentMethod) => {
    return validatePaymentMethod(method)
  }

  // =============================================
  // ERROR HANDLING
  // =============================================

  const handleError = (error: any): void => {
    const checkoutError = parseApiError(error)
    
    // Log error for analytics
    logCheckoutError(checkoutError, {
      sessionId: store.sessionId || undefined,
      step: store.currentStep,
      url: process.client ? window.location.href : undefined,
      userAgent: process.client ? navigator.userAgent : undefined
    })

    // Store error in store
    store.handleError(checkoutError)
  }

  const clearErrors = (): void => {
    store.clearError()
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  const initialize = async (cartItems: any[]): Promise<void> => {
    try {
      await store.initializeCheckout(cartItems)
    } catch (error) {
      handleError(error)
      throw error
    }
  }

  const reset = (): void => {
    try {
      store.resetCheckout()
    } catch (error) {
      handleError(error)
    }
  }

  // =============================================
  // SESSION MANAGEMENT
  // =============================================

  const refreshSession = async (): Promise<void> => {
    try {
      // Generate new session ID and extend expiration
      store.sessionId = store.generateSessionId()
      store.sessionExpiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      store.saveToStorage()
    } catch (error) {
      handleError(error)
      throw error
    }
  }

  // =============================================
  // LIFECYCLE HOOKS
  // =============================================

  // Auto-refresh session when it's about to expire
  if (process.client) {
    const sessionWarningTime = 5 * 60 * 1000 // 5 minutes before expiry
    
    watchEffect(() => {
      if (store.sessionExpiresAt) {
        const timeUntilExpiry = store.sessionExpiresAt.getTime() - Date.now()
        
        if (timeUntilExpiry <= sessionWarningTime && timeUntilExpiry > 0) {
          // Show warning to user
          const toastStore = useToastStore()
          toastStore.warning(
            t('checkout.session.expiringSoon'),
            t('checkout.session.willExpireIn', { minutes: Math.ceil(timeUntilExpiry / 60000) }),
            {
              actionText: t('checkout.session.extend'),
              actionHandler: refreshSession,
              duration: 10000
            }
          )
        }
      }
    })
  }

  // =============================================
  // RETURN INTERFACE
  // =============================================

  return {
    // Store state
    store,
    
    // Computed properties
    currentStep,
    isLoading,
    isProcessing,
    canProceed,
    orderTotal,
    
    // Navigation methods
    goToStep,
    nextStep,
    previousStep,
    
    // Data update methods
    updateShipping,
    updatePayment,
    
    // Validation methods
    validateCurrentStep,
    validateShipping,
    validatePayment,
    
    // Error handling
    handleError,
    clearErrors,
    
    // Utility methods
    initialize,
    reset,
    
    // Session management
    isSessionValid,
    refreshSession
  }
}

// =============================================
// SPECIALIZED COMPOSABLES
// =============================================

// Composable for address management
export function useCheckoutAddress() {
  const store = useCheckoutStore()

  const validateAddressData = (address: Partial<Address>, type: 'shipping' | 'billing' = 'shipping') => {
    return validateAddress(address, type)
  }

  const formatAddress = (address: Address): string => {
    const parts = [
      address.street,
      address.city,
      address.province,
      address.postalCode,
      address.country
    ].filter(Boolean)
    
    return parts.join(', ')
  }

  const isAddressComplete = (address: Partial<Address>): boolean => {
    const validation = validateAddress(address)
    return validation.isValid
  }

  return {
    savedAddresses: computed(() => store.savedAddresses),
    validateAddressData,
    formatAddress,
    isAddressComplete
  }
}

// Composable for payment method management
export function useCheckoutPayment() {
  const store = useCheckoutStore()

  const validatePaymentData = (method: Partial<PaymentMethod>) => {
    return validatePaymentMethod(method)
  }

  const isPaymentMethodComplete = (method: Partial<PaymentMethod>): boolean => {
    const validation = validatePaymentMethod(method)
    return validation.isValid
  }

  const getPaymentMethodDisplay = (method: PaymentMethod): string => {
    switch (method.type) {
      case 'credit_card':
        return `Credit Card ending in ${method.creditCard?.number?.slice(-4) || '****'}`
      case 'paypal':
        return `PayPal (${method.paypal?.email || 'email'})`
      case 'bank_transfer':
        return 'Bank Transfer'
      default:
        return 'Unknown Payment Method'
    }
  }

  return {
    savedPaymentMethods: computed(() => store.savedPaymentMethods),
    validatePaymentData,
    isPaymentMethodComplete,
    getPaymentMethodDisplay
  }
}

// Composable for order summary
export function useCheckoutSummary() {
  const store = useCheckoutStore()

  const orderSummary = computed(() => {
    if (!store.orderData) return null

    return {
      subtotal: store.orderData.subtotal,
      shipping: store.orderData.shippingCost,
      tax: store.orderData.tax,
      total: store.orderData.total,
      currency: store.orderData.currency,
      items: store.orderData.items,
      itemCount: store.orderData.items.reduce((sum, item) => sum + item.quantity, 0)
    }
  })

  const formatPrice = (amount: number, currency: string = 'EUR'): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency
    }).format(amount)
  }

  return {
    orderSummary,
    formatPrice
  }
}