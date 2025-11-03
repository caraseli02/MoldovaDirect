import { defineStore, storeToRefs } from 'pinia'
import { useCheckoutSessionStore } from './session'
import { useCheckoutShippingStore } from './shipping'
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
  clearRemoteCart
} from '~/lib/checkout/api'
import { validatePaymentMethod } from '~/utils/checkout-validation'
import {
  createValidationError,
  createPaymentError,
  createSystemError,
  CheckoutErrorCode,
  logCheckoutError
} from '~/utils/checkout-errors'
import type { PaymentMethod, SavedPaymentMethod } from '~/types/checkout'

export const useCheckoutPaymentStore = defineStore('checkout-payment', () => {
  const session = useCheckoutSessionStore()
  const shipping = useCheckoutShippingStore()
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
    guestInfo
  } = storeToRefs(session)

  const loadSavedPaymentMethods = async (): Promise<void> => {
    try {
      if (!authStore.isAuthenticated) {
        session.setSavedPaymentMethods([])
        return
      }

      const methods = await fetchSavedPaymentMethods()
      session.setSavedPaymentMethods(methods)
    } catch (error) {
      console.error('Failed to load saved payment methods:', error)
      session.setSavedPaymentMethods([])
    }
  }

  const savePaymentMethodData = async (method: SavedPaymentMethod): Promise<void> => {
    try {
      const savedMethod = await savePaymentMethod(method)
      const existingIndex = savedPaymentMethods.value.findIndex(m => m.id === savedMethod.id)
      if (existingIndex >= 0) {
        savedPaymentMethods.value.splice(existingIndex, 1, savedMethod)
      } else {
        savedPaymentMethods.value.push(savedMethod)
      }
    } catch (error) {
      console.error('Failed to save payment method:', error)
      throw error
    }
  }

  const updatePaymentMethod = async (method: PaymentMethod): Promise<void> => {
    session.setLoading(true)
    session.clearFieldErrors('payment')

    try {
      const validation = validatePaymentMethod(method)
      if (!validation.isValid) {
        session.setValidationErrors('payment', validation.errors.map(err => err.message))
        throw new Error(validation.errors.map(err => err.message).join(', '))
      }

      session.setPaymentMethodState(method)
      session.persist({
        shippingInfo: shipping.shippingInfo.value,
        paymentMethod: paymentMethod.value
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update payment method'
      const checkoutError = createValidationError('payment', message, CheckoutErrorCode.VALIDATION_FAILED)
      session.handleError(checkoutError)
      throw error
    } finally {
      session.setLoading(false)
    }
  }

  const preparePayment = async (): Promise<void> => {
    if (!paymentMethod.value || !orderData.value) return

    try {
      session.setProcessing(true)
      if (!sessionId.value) {
        session.setSessionId(session.generateSessionId())
      }

      if (paymentMethod.value.type === 'credit_card') {
        const intent = await createPaymentIntent({
          amount: Math.round(orderData.value.total * 100),
          currency: orderData.value.currency.toLowerCase(),
          sessionId: sessionId.value as string
        })

        session.setPaymentIntent(intent.id)
        session.setPaymentClientSecret(intent.clientSecret)
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to prepare payment'
      const checkoutError = createPaymentError(message, CheckoutErrorCode.PAYMENT_PROCESSING_ERROR)
      session.handleError(checkoutError)
      logCheckoutError(checkoutError, {
        sessionId: sessionId.value ?? undefined,
        step: 'preparePayment'
      }, error)
      throw error
    } finally {
      session.setProcessing(false)
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
      if (!paymentIntent.value || !paymentClientSecret.value) {
        throw new Error('Payment intent not initialized')
      }

      if (!sessionId.value) {
        session.setSessionId(session.generateSessionId())
      }

      const response = await confirmPaymentIntent({
        paymentIntentId: paymentIntent.value,
        sessionId: sessionId.value as string
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
      const activeSession = cartStore.sessionId?.value || sessionId.value

      if (activeSession) {
        await clearRemoteCart(activeSession).catch(error => {
          console.warn('Failed to clear remote cart:', error)
        })
      }

      await cartStore.clearCart()
    } catch (error) {
      console.error('Failed to clear cart:', error)
    }
  }

  const sendConfirmationEmail = async (): Promise<void> => {
    if (!orderData.value) return

    try {
      const candidateEmail = orderData.value.customerEmail || contactEmail.value || guestInfo.value?.email || null
      const trimmedEmail = candidateEmail ? candidateEmail.trim() : undefined
      await apiSendConfirmationEmail({
        orderId: orderData.value.orderId,
        sessionId: sessionId.value,
        email: trimmedEmail
      })
    } catch (error) {
      console.error('Failed to send confirmation email:', error)
    }
  }

  const updateInventory = async (): Promise<void> => {
    if (!orderData.value) return

    try {
      await apiUpdateInventory(orderData.value.items, orderData.value.orderId)
    } catch (error) {
      console.error('Failed to update inventory:', error)
    }
  }

  const createOrderRecord = async (paymentResult: any): Promise<void> => {
    if (!orderData.value || !shippingInfo.value || !paymentMethod.value) {
      throw new Error('Missing required order information')
    }

    try {
      if (!sessionId.value) {
        session.setSessionId(session.generateSessionId())
      }

      const guestEmail = guestInfo.value?.email?.trim() || null
      const customerName = `${shippingInfo.value.address.firstName || ''} ${shippingInfo.value.address.lastName || ''}`.trim() || 'Customer'
      const authenticatedEmail = contactEmail.value || null
      const resolvedEmail = guestEmail || authenticatedEmail || contactEmail.value || null
      session.setContactEmail(resolvedEmail)

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
        marketingConsent: guestInfo.value?.emailUpdates ?? false
      })

      session.setOrderData({
        ...orderData.value,
        orderId: response.id,
        orderNumber: response.orderNumber,
        customerEmail: resolvedEmail
      })

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const checkoutError = createSystemError(`Failed to create order: ${message}`, CheckoutErrorCode.ORDER_CREATION_FAILED)
      logCheckoutError(checkoutError, {
        sessionId: sessionId.value ?? undefined,
        step: 'createOrder'
      }, error)
      throw new Error('Failed to create order: ' + message)
    }
  }

  const completeCheckout = async (): Promise<void> => {
    try {
      await clearCart()
      await sendConfirmationEmail()
      // NOTE: Inventory update is now handled atomically in create-order endpoint
      // via the create_order_with_inventory RPC function (see issue #89)
      session.setCurrentStep('confirmation')
      session.persist({
        shippingInfo: shipping.shippingInfo.value,
        paymentMethod: paymentMethod.value
      })
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
    if (!paymentMethod.value || !orderData.value || !shippingInfo.value) {
      throw new Error('Missing required checkout information')
    }

    session.setProcessing(true)

    try {
      let paymentResult

      if (paymentMethod.value.type === 'cash') {
        paymentResult = await processCashPayment()
      } else if (paymentMethod.value.type === 'credit_card') {
        paymentResult = await processCreditCardPayment()
      } else if (paymentMethod.value.type === 'paypal') {
        paymentResult = await processPayPalPayment()
      } else if (paymentMethod.value.type === 'bank_transfer') {
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
      session.handleError(checkoutError)
      logCheckoutError(checkoutError, {
        sessionId: sessionId.value ?? undefined,
        step: 'processPayment'
      }, error)
      throw error
    } finally {
    session.setProcessing(false)
    }
  }

  return {
    paymentMethod,
    savedPaymentMethods,
    paymentIntent,
    paymentClientSecret,
    loadSavedPaymentMethods,
    savePaymentMethodData,
    updatePaymentMethod,
    preparePayment,
    processPayment,
    processCashPayment,
    processCreditCardPayment,
    processPayPalPayment,
    processBankTransferPayment,
    createOrderRecord,
    completeCheckout,
    clearCart,
    sendConfirmationEmail,
    updateInventory
  }
})

export type CheckoutPaymentStore = ReturnType<typeof useCheckoutPaymentStore>
