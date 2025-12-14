import { defineStore, storeToRefs } from 'pinia'
import { useCheckoutSessionStore } from './session'
import { useCartStore } from '~/stores/cart'
import { useToast } from '~/composables/useToast'
import { useStoreI18n } from '~/composables/useStoreI18n'
import { useAuthStore } from '~/stores/auth'
import {
  createPaymentIntent,
  confirmPaymentIntent,
  createOrder as apiCreateOrder,
  sendConfirmationEmail as apiSendConfirmationEmail,
  updateInventory as apiUpdateInventory,
  fetchSavedPaymentMethods,
  savePaymentMethod,
  clearRemoteCart,
} from '~/lib/checkout/api'
import { validatePaymentMethod } from '~/utils/checkout-validation'
import {
  createValidationError,
  createPaymentError,
  createSystemError,
  CheckoutErrorCode,
  logCheckoutError,
} from '~/utils/checkout-errors'
import type { PaymentMethod, SavedPaymentMethod, OrderData, ShippingInformation } from '~/types/checkout'

// Payment method type constants
const PAYMENT_METHODS = {
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
} as const

export const useCheckoutPaymentStore = defineStore('checkout-payment', () => {
  const session = useCheckoutSessionStore()
  const cartStore = useCartStore()
  const authStore = useAuthStore()
  const toast = useToast()
  const { t, locale } = useStoreI18n()

  const {
    paymentMethod,
    savedPaymentMethods,
    paymentIntent,
    paymentClientSecret,
    orderData,
    shippingInfo,
    contactEmail,
    sessionId,
    guestInfo,
  } = storeToRefs(session)

  // =============================================
  // PAYMENT METHOD MANAGEMENT
  // =============================================

  async function loadSavedPaymentMethods(): Promise<void> {
    try {
      if (!authStore.isAuthenticated) {
        session.setSavedPaymentMethods([])
        return
      }

      const methods = await fetchSavedPaymentMethods()
      session.setSavedPaymentMethods(methods)
    }
    catch (error: any) {
      console.error('Failed to load saved payment methods:', error)
      session.setSavedPaymentMethods([])
    }
  }

  async function savePaymentMethodData(method: SavedPaymentMethod): Promise<void> {
    try {
      const savedMethod = await savePaymentMethod(method)
      const existingIndex = savedPaymentMethods.value.findIndex((m: SavedPaymentMethod) => m.id === savedMethod.id)

      if (existingIndex >= 0) {
        savedPaymentMethods.value.splice(existingIndex, 1, savedMethod)
      }
      else {
        savedPaymentMethods.value.push(savedMethod)
      }
    }
    catch (error: any) {
      console.error('Failed to save payment method:', error)
      throw error
    }
  }

  async function updatePaymentMethod(method: PaymentMethod): Promise<void> {
    session.setLoading(true)
    session.clearFieldErrors('payment')

    try {
      const validation = validatePaymentMethod(method)
      if (!validation.isValid) {
        const errorMessage = validation.errors.map(err => err.message).join(', ')
        session.setValidationErrors('payment', validation.errors.map(err => err.message))
        throw new Error(errorMessage)
      }

      session.setPaymentMethodState(method)
      await session.persist({
        shippingInfo: shippingInfo.value as unknown as ShippingInformation | null,
        paymentMethod: paymentMethod.value,
      })
    }
    catch (error: any) {
      const message = error instanceof Error ? error.message : 'Failed to update payment method'
      const checkoutError = createValidationError('payment', message, CheckoutErrorCode.VALIDATION_FAILED)
      session.handleError(checkoutError)
      throw error
    }
    finally {
      session.setLoading(false)
    }
  }

  // =============================================
  // PAYMENT PREPARATION
  // =============================================

  async function preparePayment(): Promise<void> {
    if (!paymentMethod.value || !orderData.value) return

    try {
      session.setProcessing(true)

      if (!sessionId.value) {
        session.setSessionId(session.generateSessionId())
      }

      // Only create payment intent for credit card payments
      if (paymentMethod.value.type === PAYMENT_METHODS.CREDIT_CARD) {
        const intent = await createPaymentIntent({
          amount: Math.round(orderData.value.total * 100),
          currency: orderData.value.currency.toLowerCase(),
          sessionId: sessionId.value as string,
        })

        session.setPaymentIntent(intent.id)
        session.setPaymentClientSecret(intent.clientSecret)
      }
    }
    catch (error: any) {
      const message = error instanceof Error ? error.message : 'Failed to prepare payment'
      const checkoutError = createPaymentError(message, CheckoutErrorCode.PAYMENT_PROCESSING_ERROR)
      session.handleError(checkoutError)
      logCheckoutError(checkoutError, {
        sessionId: sessionId.value ?? undefined,
        step: 'preparePayment',
      }, error)
      throw error
    }
    finally {
      session.setProcessing(false)
    }
  }

  // =============================================
  // PAYMENT PROCESSING
  // =============================================

  interface PaymentResult {
    success: boolean
    transactionId?: string
    paymentMethod: string
    status?: string
    pending?: boolean
    charges?: unknown
    error?: string
  }

  /**
   * Process payment based on the selected payment method
   */
  async function processPaymentByType(type: string): Promise<PaymentResult> {
    switch (type) {
      case PAYMENT_METHODS.CASH:
        return {
          success: true,
          transactionId: `cash_${Date.now()}`,
          paymentMethod: PAYMENT_METHODS.CASH,
          status: 'pending_delivery',
        }

      case PAYMENT_METHODS.CREDIT_CARD:
        return processCreditCardPayment()

      case PAYMENT_METHODS.PAYPAL:
        return {
          success: true,
          transactionId: `pp_${Date.now()}`,
          paymentMethod: PAYMENT_METHODS.PAYPAL,
          status: 'completed',
        }

      case PAYMENT_METHODS.BANK_TRANSFER:
        return {
          success: true,
          transactionId: `bt_${Date.now()}`,
          paymentMethod: PAYMENT_METHODS.BANK_TRANSFER,
          pending: true,
        }

      default:
        throw new Error(`Invalid payment method: ${type}`)
    }
  }

  async function processCreditCardPayment(): Promise<PaymentResult> {
    try {
      if (!paymentIntent.value || !paymentClientSecret.value) {
        throw new Error('Payment intent not initialized')
      }

      if (!sessionId.value) {
        session.setSessionId(session.generateSessionId())
      }

      const response = await confirmPaymentIntent({
        paymentIntentId: paymentIntent.value,
        sessionId: sessionId.value as string,
      })

      if (response.success && response.paymentIntent.status === 'succeeded') {
        return {
          success: true,
          transactionId: response.paymentIntent.id,
          paymentMethod: PAYMENT_METHODS.CREDIT_CARD,
          status: 'completed',
          charges: response.paymentIntent.charges,
        }
      }

      if (response.requiresAction) {
        throw new Error('Payment requires additional authentication')
      }

      throw new Error(response.error || 'Payment failed')
    }
    catch (error: any) {
      console.error('Credit card payment failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
        paymentMethod: PAYMENT_METHODS.CREDIT_CARD,
      }
    }
  }

  // =============================================
  // POST-PAYMENT OPERATIONS
  // =============================================

  async function clearCart(): Promise<void> {
    try {
      const activeSession = cartStore.sessionId || sessionId.value

      // Try to clear remote cart if session exists
      if (activeSession) {
        try {
          await clearRemoteCart(activeSession)
        }
        catch (error: any) {
          // Log CSRF errors for monitoring but don't block operation
          const errorMessage = error instanceof Error ? error.message : String(error)
          if (errorMessage.includes('CSRF') || errorMessage.includes('csrf')) {
            console.error('CSRF error when clearing cart - this may indicate a security issue:', error)
          }
          else {
            console.warn('Failed to clear remote cart:', error)
          }
        }
      }

      // Always clear local cart
      await cartStore.clearCart()
    }
    catch (error: any) {
      console.error('Failed to clear cart:', error)
      // Don't throw - this is a non-critical operation
    }
  }

  async function sendConfirmationEmail(): Promise<void> {
    if (!orderData.value) return

    try {
      // Determine the email to use
      const email = (
        orderData.value.customerEmail
        || contactEmail.value
        || guestInfo.value?.email
        || ''
      ).trim()

      if (email) {
        await apiSendConfirmationEmail({
          orderId: orderData.value.orderId,
          sessionId: sessionId.value,
          email,
        })
      }
    }
    catch (error: any) {
      console.error('Failed to send confirmation email:', error)
      // Don't throw - this is a non-critical operation
    }
  }

  async function updateInventory(): Promise<void> {
    if (!orderData.value) return

    try {
      await apiUpdateInventory(orderData.value.items, orderData.value.orderId)
    }
    catch (error: any) {
      console.error('Failed to update inventory:', error)
      // Don't throw - this is handled atomically in the order creation
    }
  }

  // =============================================
  // ORDER MANAGEMENT
  // =============================================

  async function createOrderRecord(paymentResult: PaymentResult): Promise<OrderData> {
    if (!orderData.value || !shippingInfo.value || !paymentMethod.value) {
      throw new Error('Missing required order information')
    }

    try {
      if (!sessionId.value) {
        session.setSessionId(session.generateSessionId())
      }

      // Prepare customer information
      // NOTE: Email hardcoded for development/testing with Resend
      // Resend requires verified email addresses in test mode
      // TODO: Use actual customer email in production (check NUXT_PUBLIC_APP_ENV)
      const guestEmail = 'caraseli02@gmail.com'
      const firstName = shippingInfo.value.address.firstName || ''
      const lastName = shippingInfo.value.address.lastName || ''
      const customerName = `${firstName} ${lastName}`.trim() || 'Customer'
      const resolvedEmail = guestEmail

      session.setContactEmail(resolvedEmail)

      // Create the order
      const response = await apiCreateOrder({
        sessionId: sessionId.value as string,
        items: orderData.value.items,
        shippingAddress: shippingInfo.value.address,
        billingAddress: shippingInfo.value.address,
        paymentMethod: paymentMethod.value.type,
        paymentResult,
        subtotal: orderData.value.subtotal,
        shippingCost: orderData.value.shippingCost,
        tax: orderData.value.tax,
        total: orderData.value.total,
        currency: orderData.value.currency,
        guestEmail,
        customerName,
        locale: locale.value,
        marketingConsent: guestInfo.value?.emailUpdates ?? false,
      })

      // Update order data with response
      const updatedOrderData = {
        ...orderData.value,
        orderId: response.id,
        orderNumber: response.orderNumber,
        customerEmail: resolvedEmail,
      }
      session.setOrderData(updatedOrderData)

      // Return the updated order data so completeCheckout can use it
      return updatedOrderData
    }
    catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const checkoutError = createSystemError(
        `Failed to create order: ${message}`,
        CheckoutErrorCode.ORDER_CREATION_FAILED,
      )
      logCheckoutError(checkoutError, {
        sessionId: sessionId.value ?? undefined,
        step: 'createOrder',
      }, error)
      throw new Error(`Failed to create order: ${message}`)
    }
  }

  async function completeCheckout(completedOrderData: OrderData): Promise<void> {
    try {
      // Non-blocking post-checkout operations
      // Note: Cart clearing moved to confirmation page to prevent race condition
      // with navigation. Cart is now cleared after user successfully lands on
      // confirmation page, ensuring middleware doesn't see empty cart during redirect.

      sendConfirmationEmail().catch((error: any) => {
        console.error('Failed to send confirmation email (non-blocking):', error)
      })

      // Unlock the cart after successful checkout
      if (sessionId.value) {
        cartStore.unlockCart(sessionId.value).catch((error: any) => {
          console.warn('Failed to unlock cart after checkout:', error)
          // Continue even if unlock fails - cart will auto-unlock on timeout
        })
      }

      // Navigate to confirmation step
      session.setCurrentStep('confirmation')

      // Persist with the completed order data passed as parameter (not from store to avoid stale refs)
      await session.persist({
        shippingInfo: shippingInfo.value as unknown as ShippingInformation | null,
        paymentMethod: paymentMethod.value,
        orderData: completedOrderData, // Use the fresh data passed from createOrderRecord
      })

      // Show success message
      try {
        toast.success(
          t('checkout.success.orderCompleted'),
          t('checkout.success.orderConfirmation'),
        )
      }
      catch {
        // Ignore toast errors
      }
    }
    catch (error: any) {
      console.error('Failed to complete checkout:', error)
    }
  }

  // =============================================
  // MAIN PAYMENT FLOW
  // =============================================

  async function processPayment(): Promise<void> {
    // Validate prerequisites
    if (!paymentMethod.value || !orderData.value || !shippingInfo.value) {
      throw new Error('Missing required checkout information')
    }

    session.setProcessing(true)

    try {
      // Process payment based on selected method
      const paymentResult = await processPaymentByType(paymentMethod.value.type)

      if (!paymentResult?.success) {
        throw new Error(paymentResult?.error || 'Payment processing failed')
      }

      // Create order and complete checkout
      const completedOrderData = await createOrderRecord(paymentResult)
      await completeCheckout(completedOrderData)
    }
    catch (error: any) {
      const message = error instanceof Error ? error.message : 'Payment processing failed'
      const checkoutError = createPaymentError(message, CheckoutErrorCode.PAYMENT_PROCESSING_ERROR)
      session.handleError(checkoutError)
      logCheckoutError(checkoutError, {
        sessionId: sessionId.value ?? undefined,
        step: 'processPayment',
      }, error)

      // Unlock cart on payment failure
      if (sessionId.value) {
        cartStore.unlockCart(sessionId.value).catch((error: any) => {
          console.warn('Failed to unlock cart after payment failure:', error)
        })
      }

      throw error
    }
    finally {
      session.setProcessing(false)
    }
  }

  // =============================================
  // STORE EXPORTS
  // =============================================

  return {
    // State
    paymentMethod,
    savedPaymentMethods,
    paymentIntent,
    paymentClientSecret,

    // Methods
    loadSavedPaymentMethods,
    savePaymentMethodData,
    updatePaymentMethod,
    preparePayment,
    processPayment,
    createOrderRecord,
    completeCheckout,
    clearCart,
    sendConfirmationEmail,
    updateInventory,

    // Legacy exports for backward compatibility
    processCashPayment: () => processPaymentByType(PAYMENT_METHODS.CASH),
    processCreditCardPayment,
    processPayPalPayment: () => processPaymentByType(PAYMENT_METHODS.PAYPAL),
    processBankTransferPayment: () => processPaymentByType(PAYMENT_METHODS.BANK_TRANSFER),
  }
})

export type CheckoutPaymentStore = ReturnType<typeof useCheckoutPaymentStore>
