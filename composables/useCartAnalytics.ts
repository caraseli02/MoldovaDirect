/**
 * Cart Analytics Composable
 * 
 * Requirements addressed:
 * - Track add-to-cart events with product details
 * - Monitor cart abandonment patterns
 * - Implement cart value and conversion tracking
 * 
 * Provides comprehensive analytics tracking for shopping cart interactions.
 */

import { useAnalytics } from './useAnalytics'
import type { Product, CartItem } from '~/stores/cart'

interface CartAnalyticsEvent {
  eventType: 'cart_add' | 'cart_remove' | 'cart_update' | 'cart_view' | 'cart_abandon' | 'cart_checkout_start' | 'cart_checkout_complete'
  sessionId: string
  timestamp: Date
  cartValue: number
  itemCount: number
  productDetails?: {
    id: string
    name: string
    price: number
    category?: string
    quantity: number
  }
  metadata?: Record<string, any>
}

interface CartAbandonmentData {
  sessionId: string
  cartValue: number
  itemCount: number
  timeSpentInCart: number
  lastActivity: Date
  abandonmentStage: 'cart_view' | 'quantity_change' | 'checkout_start' | 'checkout_process'
  products: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}

interface CartConversionMetrics {
  sessionId: string
  cartCreatedAt: Date
  cartValue: number
  itemCount: number
  timeToConversion?: number
  conversionStage: 'cart_created' | 'checkout_started' | 'checkout_completed'
  products: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}

export const useCartAnalytics = () => {
  const analytics = useAnalytics()
  
  // Session tracking for cart analytics
  const cartSessionData = ref<{
    sessionId: string
    cartCreatedAt: Date | null
    lastActivity: Date
    checkoutStartedAt: Date | null
    totalTimeInCart: number
    activityCount: number
  }>({
    sessionId: '',
    cartCreatedAt: null,
    lastActivity: new Date(),
    checkoutStartedAt: null,
    totalTimeInCart: 0,
    activityCount: 0
  })

  // Initialize cart session tracking
  const initializeCartSession = (sessionId: string) => {
    cartSessionData.value.sessionId = sessionId
    cartSessionData.value.lastActivity = new Date()
    
    // Load existing session data from localStorage if available
    if (process.client) {
      try {
        const stored = localStorage.getItem(`cart-analytics-${sessionId}`)
        if (stored) {
          const data = JSON.parse(stored)
          cartSessionData.value = {
            ...cartSessionData.value,
            ...data,
            cartCreatedAt: data.cartCreatedAt ? new Date(data.cartCreatedAt) : null,
            lastActivity: new Date(data.lastActivity),
            checkoutStartedAt: data.checkoutStartedAt ? new Date(data.checkoutStartedAt) : null
          }
        }
      } catch (error) {
        console.warn('Failed to load cart analytics session data:', error)
      }
    }
  }

  // Save cart session data
  const saveCartSession = () => {
    if (process.client && cartSessionData.value.sessionId) {
      try {
        localStorage.setItem(
          `cart-analytics-${cartSessionData.value.sessionId}`,
          JSON.stringify({
            ...cartSessionData.value,
            cartCreatedAt: cartSessionData.value.cartCreatedAt?.toISOString(),
            lastActivity: cartSessionData.value.lastActivity.toISOString(),
            checkoutStartedAt: cartSessionData.value.checkoutStartedAt?.toISOString()
          })
        )
      } catch (error) {
        console.warn('Failed to save cart analytics session data:', error)
      }
    }
  }

  // Update activity tracking
  const updateActivity = () => {
    const now = new Date()
    const timeDiff = now.getTime() - cartSessionData.value.lastActivity.getTime()
    cartSessionData.value.totalTimeInCart += timeDiff
    cartSessionData.value.lastActivity = now
    cartSessionData.value.activityCount++
    saveCartSession()
  }

  // Track detailed add-to-cart events
  const trackAddToCart = async (product: Product, quantity: number, cartValue: number, itemCount: number) => {
    updateActivity()
    
    // Set cart creation time if this is the first item
    if (!cartSessionData.value.cartCreatedAt) {
      cartSessionData.value.cartCreatedAt = new Date()
      saveCartSession()
    }

    const event: CartAnalyticsEvent = {
      eventType: 'cart_add',
      sessionId: cartSessionData.value.sessionId,
      timestamp: new Date(),
      cartValue,
      itemCount,
      productDetails: {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        category: product.category || 'uncategorized'
      },
      metadata: {
        timeInSession: cartSessionData.value.totalTimeInCart,
        activityCount: cartSessionData.value.activityCount,
        isFirstItem: itemCount === quantity
      }
    }

    // Track with existing analytics system
    await analytics.trackCartAddition(parseInt(product.id), {
      productName: product.name,
      productPrice: product.price,
      quantity,
      cartValue,
      itemCount,
      sessionId: cartSessionData.value.sessionId,
      timeInSession: cartSessionData.value.totalTimeInCart,
      category: product.category
    })

    // Store detailed event for cart-specific analytics
    await storeCartEvent(event)
  }

  // Track cart item removal
  const trackRemoveFromCart = async (product: Product, quantity: number, cartValue: number, itemCount: number) => {
    updateActivity()

    const event: CartAnalyticsEvent = {
      eventType: 'cart_remove',
      sessionId: cartSessionData.value.sessionId,
      timestamp: new Date(),
      cartValue,
      itemCount,
      productDetails: {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        category: product.category || 'uncategorized'
      },
      metadata: {
        timeInSession: cartSessionData.value.totalTimeInCart,
        activityCount: cartSessionData.value.activityCount,
        isCartEmpty: itemCount === 0
      }
    }

    await analytics.trackActivity({
      activityType: 'cart_add', // Using existing type, but with negative quantity in metadata
      productId: parseInt(product.id),
      sessionId: cartSessionData.value.sessionId,
      metadata: {
        action: 'remove',
        productName: product.name,
        productPrice: product.price,
        quantity: -quantity, // Negative to indicate removal
        cartValue,
        itemCount,
        timeInSession: cartSessionData.value.totalTimeInCart,
        category: product.category
      }
    })

    await storeCartEvent(event)
  }

  // Track quantity updates
  const trackQuantityUpdate = async (product: Product, oldQuantity: number, newQuantity: number, cartValue: number, itemCount: number) => {
    updateActivity()

    const event: CartAnalyticsEvent = {
      eventType: 'cart_update',
      sessionId: cartSessionData.value.sessionId,
      timestamp: new Date(),
      cartValue,
      itemCount,
      productDetails: {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: newQuantity,
        category: product.category || 'uncategorized'
      },
      metadata: {
        oldQuantity,
        quantityChange: newQuantity - oldQuantity,
        timeInSession: cartSessionData.value.totalTimeInCart,
        activityCount: cartSessionData.value.activityCount
      }
    }

    await analytics.trackActivity({
      activityType: 'cart_add',
      productId: parseInt(product.id),
      sessionId: cartSessionData.value.sessionId,
      metadata: {
        action: 'update',
        productName: product.name,
        productPrice: product.price,
        oldQuantity,
        newQuantity,
        quantityChange: newQuantity - oldQuantity,
        cartValue,
        itemCount,
        timeInSession: cartSessionData.value.totalTimeInCart,
        category: product.category
      }
    })

    await storeCartEvent(event)
  }

  // Track cart view events
  const trackCartView = async (cartValue: number, itemCount: number) => {
    updateActivity()

    const event: CartAnalyticsEvent = {
      eventType: 'cart_view',
      sessionId: cartSessionData.value.sessionId,
      timestamp: new Date(),
      cartValue,
      itemCount,
      metadata: {
        timeInSession: cartSessionData.value.totalTimeInCart,
        activityCount: cartSessionData.value.activityCount
      }
    }

    await analytics.trackPageView('/cart', {
      cartValue,
      itemCount,
      sessionId: cartSessionData.value.sessionId,
      timeInSession: cartSessionData.value.totalTimeInCart
    })

    await storeCartEvent(event)
  }

  // Track checkout start
  const trackCheckoutStart = async (cartValue: number, itemCount: number, products: CartItem[]) => {
    updateActivity()
    cartSessionData.value.checkoutStartedAt = new Date()
    saveCartSession()

    const conversionMetrics: CartConversionMetrics = {
      sessionId: cartSessionData.value.sessionId,
      cartCreatedAt: cartSessionData.value.cartCreatedAt || new Date(),
      cartValue,
      itemCount,
      conversionStage: 'checkout_started',
      products: products.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }))
    }

    const event: CartAnalyticsEvent = {
      eventType: 'cart_checkout_start',
      sessionId: cartSessionData.value.sessionId,
      timestamp: new Date(),
      cartValue,
      itemCount,
      metadata: {
        timeInSession: cartSessionData.value.totalTimeInCart,
        timeToCheckout: cartSessionData.value.cartCreatedAt ? 
          Date.now() - cartSessionData.value.cartCreatedAt.getTime() : 0,
        activityCount: cartSessionData.value.activityCount,
        products: conversionMetrics.products
      }
    }

    await analytics.trackActivity({
      activityType: 'page_view',
      pageUrl: '/checkout',
      sessionId: cartSessionData.value.sessionId,
      metadata: {
        action: 'checkout_start',
        cartValue,
        itemCount,
        timeInSession: cartSessionData.value.totalTimeInCart,
        timeToCheckout: event.metadata?.timeToCheckout,
        products: conversionMetrics.products
      }
    })

    await storeCartEvent(event)
    await storeConversionMetrics(conversionMetrics)
  }

  // Track checkout completion
  const trackCheckoutComplete = async (orderId: number, cartValue: number, itemCount: number, products: CartItem[]) => {
    updateActivity()

    const timeToConversion = cartSessionData.value.cartCreatedAt ? 
      Date.now() - cartSessionData.value.cartCreatedAt.getTime() : 0

    const conversionMetrics: CartConversionMetrics = {
      sessionId: cartSessionData.value.sessionId,
      cartCreatedAt: cartSessionData.value.cartCreatedAt || new Date(),
      cartValue,
      itemCount,
      timeToConversion,
      conversionStage: 'checkout_completed',
      products: products.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }))
    }

    const event: CartAnalyticsEvent = {
      eventType: 'cart_checkout_complete',
      sessionId: cartSessionData.value.sessionId,
      timestamp: new Date(),
      cartValue,
      itemCount,
      metadata: {
        orderId,
        timeInSession: cartSessionData.value.totalTimeInCart,
        timeToConversion,
        activityCount: cartSessionData.value.activityCount,
        products: conversionMetrics.products
      }
    }

    await analytics.trackOrderCreation(orderId, {
      cartValue,
      itemCount,
      sessionId: cartSessionData.value.sessionId,
      timeInSession: cartSessionData.value.totalTimeInCart,
      timeToConversion,
      products: conversionMetrics.products
    })

    await storeCartEvent(event)
    await storeConversionMetrics(conversionMetrics)

    // Clear cart session data after successful conversion
    clearCartSession()
  }

  // Track cart abandonment
  const trackCartAbandonment = async (cartValue: number, itemCount: number, products: CartItem[], stage: CartAbandonmentData['abandonmentStage']) => {
    if (!cartSessionData.value.cartCreatedAt || itemCount === 0) return

    const abandonmentData: CartAbandonmentData = {
      sessionId: cartSessionData.value.sessionId,
      cartValue,
      itemCount,
      timeSpentInCart: cartSessionData.value.totalTimeInCart,
      lastActivity: cartSessionData.value.lastActivity,
      abandonmentStage: stage,
      products: products.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }))
    }

    const event: CartAnalyticsEvent = {
      eventType: 'cart_abandon',
      sessionId: cartSessionData.value.sessionId,
      timestamp: new Date(),
      cartValue,
      itemCount,
      metadata: {
        abandonmentStage: stage,
        timeSpentInCart: cartSessionData.value.totalTimeInCart,
        activityCount: cartSessionData.value.activityCount,
        products: abandonmentData.products
      }
    }

    await analytics.trackActivity({
      activityType: 'page_view',
      pageUrl: '/cart-abandon',
      sessionId: cartSessionData.value.sessionId,
      metadata: {
        action: 'cart_abandon',
        cartValue,
        itemCount,
        abandonmentStage: stage,
        timeSpentInCart: cartSessionData.value.totalTimeInCart,
        products: abandonmentData.products
      }
    })

    await storeCartEvent(event)
    await storeAbandonmentData(abandonmentData)
  }

  // Store cart event in localStorage for offline capability
  const storeCartEvent = async (event: CartAnalyticsEvent) => {
    if (!process.client) return

    try {
      const key = 'cart-analytics-events'
      const stored = localStorage.getItem(key)
      const events = stored ? JSON.parse(stored) : []
      
      events.push({
        ...event,
        timestamp: event.timestamp.toISOString()
      })

      // Keep only last 100 events to prevent storage bloat
      if (events.length > 100) {
        events.splice(0, events.length - 100)
      }

      localStorage.setItem(key, JSON.stringify(events))

      // Try to sync with server
      await syncEventsWithServer()
    } catch (error) {
      console.warn('Failed to store cart analytics event:', error)
    }
  }

  // Store conversion metrics
  const storeConversionMetrics = async (metrics: CartConversionMetrics) => {
    if (!process.client) return

    try {
      const key = 'cart-conversion-metrics'
      const stored = localStorage.getItem(key)
      const conversions = stored ? JSON.parse(stored) : []
      
      conversions.push({
        ...metrics,
        cartCreatedAt: metrics.cartCreatedAt.toISOString()
      })

      // Keep only last 50 conversions
      if (conversions.length > 50) {
        conversions.splice(0, conversions.length - 50)
      }

      localStorage.setItem(key, JSON.stringify(conversions))
    } catch (error) {
      console.warn('Failed to store conversion metrics:', error)
    }
  }

  // Store abandonment data
  const storeAbandonmentData = async (data: CartAbandonmentData) => {
    if (!process.client) return

    try {
      const key = 'cart-abandonment-data'
      const stored = localStorage.getItem(key)
      const abandonments = stored ? JSON.parse(stored) : []
      
      abandonments.push({
        ...data,
        lastActivity: data.lastActivity.toISOString()
      })

      // Keep only last 50 abandonments
      if (abandonments.length > 50) {
        abandonments.splice(0, abandonments.length - 50)
      }

      localStorage.setItem(key, JSON.stringify(abandonments))
    } catch (error) {
      console.warn('Failed to store abandonment data:', error)
    }
  }

  // Sync events with server
  const syncEventsWithServer = async () => {
    if (!process.client) return

    try {
      const eventsKey = 'cart-analytics-events'
      const metricsKey = 'cart-conversion-metrics'
      const abandonmentKey = 'cart-abandonment-data'

      const events = localStorage.getItem(eventsKey)
      const metrics = localStorage.getItem(metricsKey)
      const abandonments = localStorage.getItem(abandonmentKey)

      if (events || metrics || abandonments) {
        await $fetch('/api/analytics/cart-events', {
          method: 'POST',
          body: {
            events: events ? JSON.parse(events) : [],
            conversions: metrics ? JSON.parse(metrics) : [],
            abandonments: abandonments ? JSON.parse(abandonments) : []
          }
        })

        // Clear synced data
        localStorage.removeItem(eventsKey)
        localStorage.removeItem(metricsKey)
        localStorage.removeItem(abandonmentKey)
      }
    } catch (error) {
      console.warn('Failed to sync cart analytics with server:', error)
    }
  }

  // Clear cart session data
  const clearCartSession = () => {
    if (process.client && cartSessionData.value.sessionId) {
      localStorage.removeItem(`cart-analytics-${cartSessionData.value.sessionId}`)
    }
    
    cartSessionData.value = {
      sessionId: '',
      cartCreatedAt: null,
      lastActivity: new Date(),
      checkoutStartedAt: null,
      totalTimeInCart: 0,
      activityCount: 0
    }
  }

  // Setup abandonment detection
  const setupAbandonmentDetection = (cartItems: Ref<CartItem[]>) => {
    if (!process.client) return

    let abandonmentTimer: NodeJS.Timeout | null = null
    const ABANDONMENT_TIMEOUT = 30 * 60 * 1000 // 30 minutes

    const resetAbandonmentTimer = () => {
      if (abandonmentTimer) {
        clearTimeout(abandonmentTimer)
      }

      if (cartItems.value.length > 0) {
        abandonmentTimer = setTimeout(() => {
          trackCartAbandonment(
            cartItems.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
            cartItems.value.reduce((sum, item) => sum + item.quantity, 0),
            cartItems.value,
            'cart_view'
          )
        }, ABANDONMENT_TIMEOUT)
      }
    }

    // Watch for cart changes
    watch(cartItems, resetAbandonmentTimer, { deep: true })

    // Reset timer on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        resetAbandonmentTimer()
      }
    })

    // Reset timer on user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    activityEvents.forEach(event => {
      document.addEventListener(event, resetAbandonmentTimer, { passive: true })
    })

    // Initial timer setup
    resetAbandonmentTimer()

    // Cleanup function
    return () => {
      if (abandonmentTimer) {
        clearTimeout(abandonmentTimer)
      }
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetAbandonmentTimer)
      })
    }
  }

  return {
    // Session management
    initializeCartSession,
    clearCartSession,
    cartSessionData: readonly(cartSessionData),

    // Event tracking
    trackAddToCart,
    trackRemoveFromCart,
    trackQuantityUpdate,
    trackCartView,
    trackCheckoutStart,
    trackCheckoutComplete,
    trackCartAbandonment,

    // Utility functions
    syncEventsWithServer,
    setupAbandonmentDetection
  }
}