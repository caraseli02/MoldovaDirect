import { defineStore } from 'pinia'
import { computed, reactive, toRefs, nextTick } from 'vue'
import { CHECKOUT_SESSION_COOKIE_CONFIG, COOKIE_NAMES } from '~/config/cookies'
import type {
  CheckoutState,
  CheckoutStep,
  GuestInfo,
  OrderData,
  CheckoutError,
  ShippingInformation,
  PaymentMethod,
  ShippingMethod,
  SavedPaymentMethod,
  Address,
} from '~/types/checkout'

interface PersistPayload {
  shippingInfo: ShippingInformation | null
  paymentMethod: PaymentMethod | null
  orderData?: OrderData | null
}

type RestoredPayload = PersistPayload

// Strip sensitive payment fields before persisting to storage
function sanitizePaymentMethodForStorage(method: PaymentMethod | null): PaymentMethod | null {
  if (!method) return null

  const sanitized: PaymentMethod = {
    type: method.type,
  }

  if (typeof method.saveForFuture !== 'undefined') {
    sanitized.saveForFuture = method.saveForFuture
  }

  if (method.type === 'cash' && method.cash) {
    sanitized.cash = {
      confirmed: method.cash.confirmed,
    }
  }

  return sanitized
}

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
  marketingConsent: false,
  dataPrefetched: false,
  preferences: null,
}

export const useCheckoutSessionStore = defineStore('checkout-session', () => {
  const state = reactive<CheckoutState>({ ...INITIAL_STATE })

  const currentStepIndex = computed(() => {
    const steps: CheckoutStep[] = ['shipping', 'payment', 'review', 'confirmation']
    return steps.indexOf(state.currentStep)
  })

  const isSessionExpired = computed(() => {
    if (!state.sessionExpiresAt) return false
    return new Date() > state.sessionExpiresAt
  })

  const setGuestInfo = (info: GuestInfo): void => {
    state.guestInfo = {
      email: info.email.trim(),
      emailUpdates: info.emailUpdates,
    }
    setContactEmail(state.guestInfo.email)
  }

  const setContactEmail = (email: string | null): void => {
    state.contactEmail = email
    if (state.orderData) {
      state.orderData.customerEmail = email
    }
  }

  const setOrderData = (order: OrderData | null): void => {
    state.orderData = order
  }

  const setShippingInfo = (info: ShippingInformation | null): void => {
    state.shippingInfo = info
  }

  const setPaymentMethodState = (method: PaymentMethod | null): void => {
    state.paymentMethod = method
  }

  const setAvailableShippingMethods = (methods: ShippingMethod[]): void => {
    state.availableShippingMethods = methods
  }

  const setSavedPaymentMethods = (methods: SavedPaymentMethod[]): void => {
    state.savedPaymentMethods = methods
  }

  const setSavedAddresses = (addresses: Address[]): void => {
    state.savedAddresses = addresses
  }

  const setDataPrefetched = (value: boolean): void => {
    state.dataPrefetched = value
  }

  const setPreferences = (preferences: { user_id: string, preferred_shipping_method?: string, updated_at?: string }): void => {
    state.preferences = preferences
  }

  const setPaymentIntent = (id: string | null): void => {
    state.paymentIntent = id
  }

  const setPaymentClientSecret = (secret: string | null): void => {
    state.paymentClientSecret = secret
  }

  const setLoading = (value: boolean): void => {
    state.loading = value
  }

  const setProcessing = (value: boolean): void => {
    state.processing = value
  }

  const generateSessionId = (): string => {
    return `checkout_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  }

  const setSessionId = (id: string | null): void => {
    state.sessionId = id
  }

  const setCurrentStep = (step: CheckoutStep): void => {
    state.currentStep = step
  }

  const setSessionExpiry = (date: Date | null): void => {
    state.sessionExpiresAt = date
  }

  const setLastSyncAt = (date: Date | null): void => {
    state.lastSyncAt = date
  }

  const setValidationErrors = (field: string, errors: string[]): void => {
    state.validationErrors[field] = errors
  }

  const clearValidationErrors = (): void => {
    state.validationErrors = {}
  }

  const clearFieldErrors = (field: string): void => {
    if (state.validationErrors[field]) {
      const { [field]: _removed, ...rest } = state.validationErrors
      state.validationErrors = rest
    }
  }

  const handleError = (error: CheckoutError): void => {
    state.lastError = error
    state.errors[error.field || 'general'] = error.message
  }

  const clearError = (field?: string): void => {
    if (field) {
      const { [field]: _removed, ...rest } = state.errors
      state.errors = rest
    }
    else {
      state.errors = {}
    }
    state.lastError = null
  }

  const retryLastAction = async (): Promise<void> => {
    if (state.lastError?.retryable) {
      clearError(state.lastError.field)
    }
  }

  const setTermsAccepted = (value: boolean): void => {
    state.termsAccepted = value
  }

  const setPrivacyAccepted = (value: boolean): void => {
    state.privacyAccepted = value
  }

  const setMarketingConsent = (value: boolean): void => {
    state.marketingConsent = value
  }

  // Single cookie instance for consistent access
  interface CheckoutCookieData {
    sessionId: string | null
    currentStep: string
    guestInfo: Record<string, any> | null
    contactEmail: string | null
    orderData: Record<string, any> | null
    sessionExpiresAt: Date | null
    lastSyncAt: Date
    termsAccepted: boolean
    privacyAccepted: boolean
    marketingConsent: boolean
    shippingInfo?: Record<string, any>
    paymentMethod?: Record<string, any>
  }

  const checkoutCookie = useCookie<CheckoutCookieData | null>(COOKIE_NAMES.CHECKOUT_SESSION, CHECKOUT_SESSION_COOKIE_CONFIG as any)

  const persist = async (payload: PersistPayload): Promise<void> => {
    try {
      const snapshot = {
        sessionId: state.sessionId,
        currentStep: state.currentStep,
        guestInfo: state.guestInfo,
        contactEmail: state.contactEmail,
        orderData: payload.orderData ?? state.orderData,
        sessionExpiresAt: state.sessionExpiresAt,
        lastSyncAt: new Date(),
        termsAccepted: state.termsAccepted,
        privacyAccepted: state.privacyAccepted,
        marketingConsent: state.marketingConsent,
        shippingInfo: payload.shippingInfo,
        paymentMethod: sanitizePaymentMethodForStorage(payload.paymentMethod),
      }

      checkoutCookie.value = snapshot as any
      await nextTick() // Wait for cookie write to complete
    }
    catch (error: any) {
      console.error('Failed to persist checkout session:', error)
    }
  }

  const restore = (): RestoredPayload | null => {
    try {
      const snapshot = checkoutCookie.value
      if (!snapshot) {
        return null
      }

      // Check if session has expired
      if (snapshot.sessionExpiresAt && new Date(snapshot.sessionExpiresAt) < new Date()) {
        clearStorage()
        return null
      }

      // Restore state from snapshot
      state.sessionId = snapshot.sessionId
      state.currentStep = (snapshot.currentStep as CheckoutStep) || 'shipping'
      state.guestInfo = (snapshot.guestInfo as { email: string, emailUpdates: boolean } | null) || null
      state.contactEmail = (snapshot.contactEmail as string | null) || null
      state.orderData = (snapshot.orderData as any) || null
      state.sessionExpiresAt = snapshot.sessionExpiresAt ? new Date(snapshot.sessionExpiresAt) : null
      state.lastSyncAt = snapshot.lastSyncAt ? new Date(snapshot.lastSyncAt) : null
      state.termsAccepted = snapshot.termsAccepted || false
      state.privacyAccepted = snapshot.privacyAccepted || false
      state.marketingConsent = snapshot.marketingConsent || false

      const sanitizedPaymentMethod = sanitizePaymentMethodForStorage((snapshot.paymentMethod || null) as any)
      state.paymentMethod = sanitizedPaymentMethod

      return {
        shippingInfo: (snapshot.shippingInfo as any) || null,
        paymentMethod: sanitizedPaymentMethod,
      }
    }
    catch (error: any) {
      console.error('Failed to restore checkout session:', error)
      clearStorage()
      return null
    }
  }

  const clearStorage = (): void => {
    checkoutCookie.value = null
  }

  const reset = (): void => {
    Object.assign(state, { ...INITIAL_STATE })
    clearStorage()
  }

  return {
    ...toRefs(state),
    currentStepIndex,
    isSessionExpired,
    setGuestInfo,
    setContactEmail,
    setOrderData,
    setShippingInfo,
    setPaymentMethodState,
    setAvailableShippingMethods,
    setSavedPaymentMethods,
    setSavedAddresses,
    setDataPrefetched,
    setPreferences,
    setPaymentIntent,
    setPaymentClientSecret,
    setLoading,
    setProcessing,
    generateSessionId,
    setSessionId,
    setCurrentStep,
    setSessionExpiry,
    setLastSyncAt,
    setValidationErrors,
    clearValidationErrors,
    clearFieldErrors,
    handleError,
    clearError,
    retryLastAction,
    setTermsAccepted,
    setPrivacyAccepted,
    setMarketingConsent,
    persist,
    restore,
    clearStorage,
    reset,
  }
})

export type CheckoutSessionStore = ReturnType<typeof useCheckoutSessionStore>
