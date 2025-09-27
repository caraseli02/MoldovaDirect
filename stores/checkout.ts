import { defineStore } from 'pinia'
import { useToastStore } from './toast'
import { useStoreI18n } from '~/composables/useStoreI18n'

// =============================================
// CHECKOUT TYPES
// =============================================

export type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation'

export interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: number
}

export interface Address {
  id?: number
  type: 'shipping' | 'billing'
  firstName: string
  lastName: string
  company?: string
  street: string
  city: string
  postalCode: string
  province?: string
  country: string
  phone?: string
  isDefault?: boolean
}

export interface PaymentMethod {
  type: 'credit_card' | 'paypal' | 'bank_transfer'
  creditCard?: {
    number: string
    expiryMonth: string
    expiryYear: string
    cvv: string
    holderName: string
  }
  paypal?: {
    email: string
  }
  bankTransfer?: {
    reference: string
  }
  saveForFuture?: boolean
}

export interface SavedPaymentMethod {
  id: string
  type: 'credit_card' | 'paypal'
  lastFour?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

export interface ShippingInformation {
  address: Address
  method: ShippingMethod
  instructions?: string
}

export interface OrderData {
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  currency: string
  items: OrderItem[]
}

export interface OrderItem {
  productId: number
  productSnapshot: any // Product type from existing system
  quantity: number
  price: number
  total: number
}

export interface CheckoutSession {
  id: string
  cartItems: any[] // CartItem type from existing system
  shippingInfo?: ShippingInformation
  paymentMethod?: PaymentMethod
  orderData?: OrderData
  currentStep: CheckoutStep
  expiresAt: Date
}

export interface CheckoutError {
  type: 'validation' | 'payment' | 'inventory' | 'network' | 'system'
  code: string
  message: string
  field?: string
  retryable: boolean
  userAction?: string
}

// =============================================
// CHECKOUT STORE STATE
// =============================================

interface CheckoutState {
  // Core checkout state
  currentStep: CheckoutStep
  sessionId: string | null
  
  // Checkout data
  shippingInfo: ShippingInformation | null
  paymentMethod: PaymentMethod | null
  orderData: OrderData | null
  
  // Processing states
  loading: boolean
  processing: boolean
  
  // Error handling
  errors: Record<string, string>
  lastError: CheckoutError | null
  
  // Payment processing
  paymentIntent: string | null
  paymentClientSecret: string | null
  
  // Session management
  sessionExpiresAt: Date | null
  lastSyncAt: Date | null
  
  // Validation
  validationErrors: Record<string, string[]>
  isValid: boolean
  
  // Saved data for authenticated users
  savedAddresses: Address[]
  savedPaymentMethods: SavedPaymentMethod[]
  
  // Available options
  availableShippingMethods: ShippingMethod[]
  availableCountries: string[]
}

// =============================================
// CHECKOUT STORE IMPLEMENTATION
// =============================================

export const useCheckoutStore = defineStore('checkout', {
  state: (): CheckoutState => ({
    // Core checkout state
    currentStep: 'shipping',
    sessionId: null,
    
    // Checkout data
    shippingInfo: null,
    paymentMethod: null,
    orderData: null,
    
    // Processing states
    loading: false,
    processing: false,
    
    // Error handling
    errors: {},
    lastError: null,
    
    // Payment processing
    paymentIntent: null,
    paymentClientSecret: null,
    
    // Session management
    sessionExpiresAt: null,
    lastSyncAt: null,
    
    // Validation
    validationErrors: {},
    isValid: false,
    
    // Saved data for authenticated users
    savedAddresses: [],
    savedPaymentMethods: [],
    
    // Available options
    availableShippingMethods: [],
    availableCountries: ['ES', 'RO', 'MD', 'FR', 'DE', 'IT']
  }),

  getters: {
    // Check if checkout is ready to proceed to next step
    canProceedToPayment: (state): boolean => {
      return !!state.shippingInfo && 
             !!state.shippingInfo.address && 
             !!state.shippingInfo.method &&
             Object.keys(state.validationErrors).length === 0
    },

    canProceedToReview: (state): boolean => {
      return !!state.shippingInfo && 
             !!state.paymentMethod &&
             Object.keys(state.validationErrors).length === 0
    },

    canCompleteOrder: (state): boolean => {
      return !!state.shippingInfo && 
             !!state.paymentMethod && 
             !!state.orderData &&
             Object.keys(state.validationErrors).length === 0
    },

    // Get current step index for progress indicators
    currentStepIndex: (state): number => {
      const steps: CheckoutStep[] = ['shipping', 'payment', 'review', 'confirmation']
      return steps.indexOf(state.currentStep)
    },

    // Check if session is expired
    isSessionExpired: (state): boolean => {
      if (!state.sessionExpiresAt) return false
      return new Date() > state.sessionExpiresAt
    },

    // Get total order amount
    orderTotal: (state): number => {
      if (!state.orderData) return 0
      return state.orderData.total
    },

    // Get formatted order total
    formattedOrderTotal: (state): string => {
      if (!state.orderData) return '€0.00'
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(state.orderData.total)
    },

    // Check if there are validation errors for a specific field
    hasFieldError: (state) => (field: string): boolean => {
      return !!state.validationErrors[field] && state.validationErrors[field].length > 0
    },

    // Get validation errors for a specific field
    getFieldErrors: (state) => (field: string): string[] => {
      return state.validationErrors[field] || []
    }
  },

  actions: {
    // =============================================
    // SESSION MANAGEMENT
    // =============================================

    generateSessionId(): string {
      return 'checkout_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    },

    async initializeCheckout(cartItems: any[]): Promise<void> {
      this.loading = true
      this.errors = {}
      
      try {
        // Generate session ID if not exists
        if (!this.sessionId) {
          this.sessionId = this.generateSessionId()
        }

        // Set session expiration (30 minutes)
        this.sessionExpiresAt = new Date(Date.now() + 30 * 60 * 1000)

        // Load saved data from localStorage
        this.loadFromStorage()

        // Initialize order data from cart
        await this.calculateOrderData(cartItems)

        // Load available shipping methods
        await this.loadShippingMethods()

        // Load saved addresses and payment methods for authenticated users
        await this.loadSavedData()

        this.lastSyncAt = new Date()
        this.saveToStorage()

      } catch (error) {
        this.handleError({
          type: 'system',
          code: 'INIT_FAILED',
          message: error instanceof Error ? error.message : 'Failed to initialize checkout',
          retryable: true,
          userAction: 'Please try again'
        })
        throw error
      } finally {
        this.loading = false
      }
    },

    async calculateOrderData(cartItems: any[]): Promise<void> {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      
      // Calculate shipping cost (will be updated when shipping method is selected)
      const shippingCost = 0
      
      // Calculate tax (simplified - would be more complex in real implementation)
      const tax = subtotal * 0.21 // 21% VAT for Spain
      
      const total = subtotal + shippingCost + tax

      this.orderData = {
        subtotal,
        shippingCost,
        tax,
        total,
        currency: 'EUR',
        items: cartItems.map(item => ({
          productId: item.product.id,
          productSnapshot: item.product,
          quantity: item.quantity,
          price: item.product.price,
          total: item.product.price * item.quantity
        }))
      }
    },

    // =============================================
    // STEP NAVIGATION
    // =============================================

    goToStep(step: CheckoutStep): void {
      // Validate current step before proceeding
      if (!this.validateCurrentStep()) {
        return
      }

      this.currentStep = step
      this.saveToStorage()
    },

    async proceedToNextStep(): Promise<void> {
      const steps: CheckoutStep[] = ['shipping', 'payment', 'review', 'confirmation']
      const currentIndex = steps.indexOf(this.currentStep)
      
      if (currentIndex < steps.length - 1) {
        const nextStep = steps[currentIndex + 1]
        
        // Validate current step
        if (!this.validateCurrentStep()) {
          return
        }

        // Perform step-specific actions
        if (this.currentStep === 'shipping' && nextStep === 'payment') {
          await this.updateShippingCosts()
        } else if (this.currentStep === 'payment' && nextStep === 'review') {
          await this.preparePayment()
        } else if (this.currentStep === 'review' && nextStep === 'confirmation') {
          await this.processPayment()
        }

        this.currentStep = nextStep
        this.saveToStorage()
      }
    },

    goToPreviousStep(): void {
      const steps: CheckoutStep[] = ['shipping', 'payment', 'review', 'confirmation']
      const currentIndex = steps.indexOf(this.currentStep)
      
      if (currentIndex > 0) {
        this.currentStep = steps[currentIndex - 1]
        this.saveToStorage()
      }
    },

    // =============================================
    // SHIPPING INFORMATION
    // =============================================

    async updateShippingInfo(info: ShippingInformation): Promise<void> {
      this.loading = true
      this.clearFieldErrors('shipping')

      try {
        // Validate shipping information
        const validationErrors = this.validateShippingInfo(info)
        if (validationErrors.length > 0) {
          this.validationErrors.shipping = validationErrors
          throw new Error('Shipping information validation failed')
        }

        this.shippingInfo = info
        
        // Update shipping costs based on selected method
        await this.updateShippingCosts()
        
        // Save to storage
        this.saveToStorage()

        try {
          const toastStore = useToastStore()
          const { t } = useStoreI18n()
          toastStore.success(t('checkout.success.shippingUpdated'), t('checkout.success.shippingInfoSaved'))
        } catch {
          // Toast not available (e.g., in tests)
        }

      } catch (error) {
        this.handleError({
          type: 'validation',
          code: 'SHIPPING_VALIDATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to update shipping information',
          field: 'shipping',
          retryable: true,
          userAction: 'Please check your shipping information'
        })
        throw error
      } finally {
        this.loading = false
      }
    },

    validateShippingInfo(info: ShippingInformation): string[] {
      const errors: string[] = []
      
      // Use fallback messages if i18n is not available (e.g., in tests)
      const getErrorMessage = (key: string, fallback: string) => {
        try {
          const { t } = useStoreI18n()
          return t(key)
        } catch {
          return fallback
        }
      }

      // Validate address
      if (!info.address.firstName?.trim()) {
        errors.push(getErrorMessage('checkout.validation.firstNameRequired', 'First name is required'))
      }
      if (!info.address.lastName?.trim()) {
        errors.push(getErrorMessage('checkout.validation.lastNameRequired', 'Last name is required'))
      }
      if (!info.address.street?.trim()) {
        errors.push(getErrorMessage('checkout.validation.streetRequired', 'Street address is required'))
      }
      if (!info.address.city?.trim()) {
        errors.push(getErrorMessage('checkout.validation.cityRequired', 'City is required'))
      }
      if (!info.address.postalCode?.trim()) {
        errors.push(getErrorMessage('checkout.validation.postalCodeRequired', 'Postal code is required'))
      }
      if (!info.address.country?.trim()) {
        errors.push(getErrorMessage('checkout.validation.countryRequired', 'Country is required'))
      }

      // Validate shipping method
      if (!info.method?.id) {
        errors.push(getErrorMessage('checkout.validation.shippingMethodRequired', 'Shipping method is required'))
      }

      return errors
    },

    async updateShippingCosts(): Promise<void> {
      if (!this.shippingInfo || !this.orderData) return

      try {
        // Update shipping cost based on selected method
        this.orderData.shippingCost = this.shippingInfo.method.price
        
        // Recalculate total
        this.orderData.total = this.orderData.subtotal + this.orderData.shippingCost + this.orderData.tax

      } catch (error) {
        console.error('Failed to update shipping costs:', error)
      }
    },

    async loadShippingMethods(): Promise<void> {
      try {
        // In a real implementation, this would fetch from API
        this.availableShippingMethods = [
          {
            id: 'standard',
            name: 'Standard Shipping',
            description: 'Delivery in 3-5 business days',
            price: 5.99,
            estimatedDays: 4
          },
          {
            id: 'express',
            name: 'Express Shipping',
            description: 'Delivery in 1-2 business days',
            price: 12.99,
            estimatedDays: 1
          },
          {
            id: 'free',
            name: 'Free Shipping',
            description: 'Delivery in 5-7 business days (orders over €50)',
            price: 0,
            estimatedDays: 6
          }
        ]
      } catch (error) {
        console.error('Failed to load shipping methods:', error)
      }
    },

    // =============================================
    // PAYMENT METHOD
    // =============================================

    async updatePaymentMethod(method: PaymentMethod): Promise<void> {
      this.loading = true
      this.clearFieldErrors('payment')

      try {
        // Validate payment method
        const validationErrors = this.validatePaymentMethod(method)
        if (validationErrors.length > 0) {
          this.validationErrors.payment = validationErrors
          throw new Error('Payment method validation failed')
        }

        this.paymentMethod = method
        this.saveToStorage()

        try {
          const toastStore = useToastStore()
          const { t } = useStoreI18n()
          toastStore.success(t('checkout.success.paymentUpdated'), t('checkout.success.paymentMethodSaved'))
        } catch {
          // Toast not available (e.g., in tests)
        }

      } catch (error) {
        this.handleError({
          type: 'validation',
          code: 'PAYMENT_VALIDATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to update payment method',
          field: 'payment',
          retryable: true,
          userAction: 'Please check your payment information'
        })
        throw error
      } finally {
        this.loading = false
      }
    },

    validatePaymentMethod(method: PaymentMethod): string[] {
      const errors: string[] = []
      
      // Use fallback messages if i18n is not available (e.g., in tests)
      const getErrorMessage = (key: string, fallback: string) => {
        try {
          const { t } = useStoreI18n()
          return t(key)
        } catch {
          return fallback
        }
      }

      if (method.type === 'credit_card' && method.creditCard) {
        const card = method.creditCard
        
        if (!card.number?.trim()) {
          errors.push(getErrorMessage('checkout.validation.cardNumberRequired', 'Card number is required'))
        } else if (!/^\d{13,19}$/.test(card.number.replace(/\s/g, ''))) {
          errors.push(getErrorMessage('checkout.validation.cardNumberInvalid', 'Invalid card number'))
        }

        if (!card.expiryMonth || !card.expiryYear) {
          errors.push(getErrorMessage('checkout.validation.expiryRequired', 'Expiry date is required'))
        }

        if (!card.cvv?.trim()) {
          errors.push(getErrorMessage('checkout.validation.cvvRequired', 'CVV is required'))
        } else if (!/^\d{3,4}$/.test(card.cvv)) {
          errors.push(getErrorMessage('checkout.validation.cvvInvalid', 'Invalid CVV'))
        }

        if (!card.holderName?.trim()) {
          errors.push(getErrorMessage('checkout.validation.holderNameRequired', 'Cardholder name is required'))
        }
      } else if (method.type === 'paypal' && method.paypal) {
        if (!method.paypal.email?.trim()) {
          errors.push(getErrorMessage('checkout.validation.paypalEmailRequired', 'PayPal email is required'))
        }
      }

      return errors
    },

    async preparePayment(): Promise<void> {
      if (!this.paymentMethod || !this.orderData) return

      try {
        this.processing = true

        if (this.paymentMethod.type === 'credit_card') {
          // Create payment intent with Stripe
          const response = await $fetch('/api/checkout/create-payment-intent', {
            method: 'POST',
            body: {
              amount: Math.round(this.orderData.total * 100), // Convert to cents
              currency: 'eur',
              sessionId: this.sessionId
            }
          })

          this.paymentIntent = response.paymentIntent.id
          this.paymentClientSecret = response.paymentIntent.client_secret
        }

      } catch (error) {
        this.handleError({
          type: 'payment',
          code: 'PAYMENT_PREPARATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to prepare payment',
          retryable: true,
          userAction: 'Please try again'
        })
        throw error
      } finally {
        this.processing = false
      }
    },

    // =============================================
    // ORDER PROCESSING
    // =============================================

    async processPayment(): Promise<void> {
      if (!this.paymentMethod || !this.orderData || !this.shippingInfo) {
        throw new Error('Missing required checkout information')
      }

      this.processing = true

      try {
        let paymentResult

        if (this.paymentMethod.type === 'credit_card') {
          paymentResult = await this.processCreditCardPayment()
        } else if (this.paymentMethod.type === 'paypal') {
          paymentResult = await this.processPayPalPayment()
        } else if (this.paymentMethod.type === 'bank_transfer') {
          paymentResult = await this.processBankTransferPayment()
        }

        if (paymentResult?.success) {
          await this.createOrder(paymentResult)
          await this.completeCheckout()
        } else {
          throw new Error(paymentResult?.error || 'Payment processing failed')
        }

      } catch (error) {
        this.handleError({
          type: 'payment',
          code: 'PAYMENT_PROCESSING_FAILED',
          message: error instanceof Error ? error.message : 'Payment processing failed',
          retryable: true,
          userAction: 'Please try again or use a different payment method'
        })
        throw error
      } finally {
        this.processing = false
      }
    },

    async processCreditCardPayment(): Promise<any> {
      // This would integrate with Stripe or other payment processor
      // For now, return a mock success response
      return {
        success: true,
        transactionId: 'txn_' + Date.now(),
        paymentMethod: 'credit_card'
      }
    },

    async processPayPalPayment(): Promise<any> {
      // This would integrate with PayPal
      return {
        success: true,
        transactionId: 'pp_' + Date.now(),
        paymentMethod: 'paypal'
      }
    },

    async processBankTransferPayment(): Promise<any> {
      // Bank transfer doesn't require immediate processing
      return {
        success: true,
        transactionId: 'bt_' + Date.now(),
        paymentMethod: 'bank_transfer',
        pending: true
      }
    },

    async createOrder(paymentResult: any): Promise<void> {
      if (!this.orderData || !this.shippingInfo || !this.paymentMethod) {
        throw new Error('Missing required order information')
      }

      try {
        const orderData = {
          sessionId: this.sessionId,
          items: this.orderData.items,
          shippingAddress: this.shippingInfo.address,
          billingAddress: this.shippingInfo.address, // Using same address for now
          paymentMethod: this.paymentMethod.type,
          paymentResult,
          subtotal: this.orderData.subtotal,
          shippingCost: this.orderData.shippingCost,
          tax: this.orderData.tax,
          total: this.orderData.total,
          currency: this.orderData.currency
        }

        const response = await $fetch('/api/checkout/create-order', {
          method: 'POST',
          body: orderData
        })

        // Store order information for confirmation step
        this.orderData = { ...this.orderData, orderId: response.order.id, orderNumber: response.order.orderNumber }

      } catch (error) {
        throw new Error('Failed to create order: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
    },

    async completeCheckout(): Promise<void> {
      try {
        // Clear cart (would integrate with cart store)
        // await cartStore.clearCart()

        // Send confirmation email
        await this.sendConfirmationEmail()

        // Update inventory
        await this.updateInventory()

        // Move to confirmation step
        this.currentStep = 'confirmation'
        this.saveToStorage()

        const toastStore = useToastStore()
        const { t } = useStoreI18n()
        toastStore.success(t('checkout.success.orderCompleted'), t('checkout.success.orderConfirmation'))

      } catch (error) {
        console.error('Failed to complete checkout:', error)
        // Don't throw here as payment was successful
      }
    },

    async sendConfirmationEmail(): Promise<void> {
      if (!this.orderData) return

      try {
        await $fetch('/api/checkout/send-confirmation', {
          method: 'POST',
          body: {
            orderId: this.orderData.orderId,
            sessionId: this.sessionId
          }
        })
      } catch (error) {
        console.error('Failed to send confirmation email:', error)
      }
    },

    async updateInventory(): Promise<void> {
      if (!this.orderData) return

      try {
        await $fetch('/api/checkout/update-inventory', {
          method: 'POST',
          body: {
            items: this.orderData.items,
            orderId: this.orderData.orderId
          }
        })
      } catch (error) {
        console.error('Failed to update inventory:', error)
      }
    },

    // =============================================
    // VALIDATION
    // =============================================

    validateCurrentStep(): boolean {
      this.clearValidationErrors()

      if (this.currentStep === 'shipping') {
        if (!this.shippingInfo) {
          this.validationErrors.shipping = ['Shipping information is required']
          return false
        }
        const errors = this.validateShippingInfo(this.shippingInfo)
        if (errors.length > 0) {
          this.validationErrors.shipping = errors
          return false
        }
      } else if (this.currentStep === 'payment') {
        if (!this.paymentMethod) {
          this.validationErrors.payment = ['Payment method is required']
          return false
        }
        const errors = this.validatePaymentMethod(this.paymentMethod)
        if (errors.length > 0) {
          this.validationErrors.payment = errors
          return false
        }
      }

      return true
    },

    clearValidationErrors(): void {
      this.validationErrors = {}
    },

    clearFieldErrors(field: string): void {
      if (this.validationErrors[field]) {
        delete this.validationErrors[field]
      }
    },

    // =============================================
    // SAVED DATA MANAGEMENT
    // =============================================

    async loadSavedData(): Promise<void> {
      // This would load saved addresses and payment methods for authenticated users
      // For now, using mock data
      this.savedAddresses = []
      this.savedPaymentMethods = []
    },

    async saveAddress(address: Address): Promise<void> {
      // This would save address to database for authenticated users
      this.savedAddresses.push(address)
    },

    async savePaymentMethodData(method: SavedPaymentMethod): Promise<void> {
      // This would save payment method to database for authenticated users
      this.savedPaymentMethods.push(method)
    },

    // =============================================
    // ERROR HANDLING
    // =============================================

    handleError(error: CheckoutError): void {
      this.lastError = error
      this.errors[error.field || 'general'] = error.message

      const toastStore = useToastStore()
      toastStore.error('Checkout Error', error.message, {
        actionText: error.userAction,
        actionHandler: error.retryable ? () => this.retryLastAction() : undefined
      })
    },

    async retryLastAction(): Promise<void> {
      // Implement retry logic based on last error
      if (this.lastError?.retryable) {
        // Clear error and retry
        this.clearError(this.lastError.field)
        // Retry logic would go here
      }
    },

    clearError(field?: string): void {
      if (field) {
        delete this.errors[field]
      } else {
        this.errors = {}
      }
      this.lastError = null
    },

    // =============================================
    // STORAGE MANAGEMENT
    // =============================================

    saveToStorage(): void {
      if (typeof window === 'undefined') return

      try {
        const checkoutData = {
          sessionId: this.sessionId,
          currentStep: this.currentStep,
          shippingInfo: this.shippingInfo,
          paymentMethod: this.paymentMethod ? {
            ...this.paymentMethod,
            // Don't store sensitive payment data
            creditCard: this.paymentMethod.creditCard ? {
              holderName: this.paymentMethod.creditCard.holderName,
              // Don't store card number, CVV, etc.
            } : undefined
          } : null,
          orderData: this.orderData,
          sessionExpiresAt: this.sessionExpiresAt,
          lastSyncAt: new Date()
        }

        localStorage.setItem('checkout_session', JSON.stringify(checkoutData))
      } catch (error) {
        console.error('Failed to save checkout session:', error)
      }
    },

    loadFromStorage(): void {
      if (typeof window === 'undefined') return

      try {
        const stored = localStorage.getItem('checkout_session')
        if (!stored) return

        const checkoutData = JSON.parse(stored)
        
        // Check if session is expired
        if (checkoutData.sessionExpiresAt && new Date(checkoutData.sessionExpiresAt) < new Date()) {
          this.clearStorage()
          return
        }

        // Restore checkout state
        this.sessionId = checkoutData.sessionId
        this.currentStep = checkoutData.currentStep || 'shipping'
        this.shippingInfo = checkoutData.shippingInfo
        this.paymentMethod = checkoutData.paymentMethod
        this.orderData = checkoutData.orderData
        this.sessionExpiresAt = checkoutData.sessionExpiresAt ? new Date(checkoutData.sessionExpiresAt) : null
        this.lastSyncAt = checkoutData.lastSyncAt ? new Date(checkoutData.lastSyncAt) : null

      } catch (error) {
        console.error('Failed to load checkout session:', error)
        this.clearStorage()
      }
    },

    clearStorage(): void {
      if (typeof window === 'undefined') return
      localStorage.removeItem('checkout_session')
    },

    // =============================================
    // RESET AND CLEANUP
    // =============================================

    resetCheckout(): void {
      // Reset all state to initial values
      this.currentStep = 'shipping'
      this.sessionId = null
      this.shippingInfo = null
      this.paymentMethod = null
      this.orderData = null
      this.loading = false
      this.processing = false
      this.errors = {}
      this.lastError = null
      this.paymentIntent = null
      this.paymentClientSecret = null
      this.sessionExpiresAt = null
      this.lastSyncAt = null
      this.validationErrors = {}
      this.isValid = false

      // Clear storage
      this.clearStorage()
    },

    // Initialize store when created
    $onAction({ name, after }) {
      // Auto-save after certain actions
      const autoSaveActions = ['updateShippingInfo', 'updatePaymentMethod', 'goToStep']
      if (autoSaveActions.includes(name)) {
        after(() => {
          this.saveToStorage()
        })
      }
    }
  }
})