/**
 * Cart Analytics Module
 *
 * Handles cart behavior tracking, abandonment detection, and analytics events
 * Provides offline capability and server synchronization
 */

import { ref } from 'vue'
import type {
  CartAnalyticsState,
  CartAnalyticsActions,
  AnalyticsEvent,
  Product,
} from './types'

// =============================================
// STATE MANAGEMENT
// =============================================

const state = ref<CartAnalyticsState>({
  sessionStartTime: null,
  lastActivity: null,
  events: [],
  abandonmentTimer: null,
  syncInProgress: false,
  offlineEvents: [],
})

// Configuration
const ABANDONMENT_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const SYNC_INTERVAL = 5 * 60 * 1000 // 5 minutes
const MAX_OFFLINE_EVENTS = 100

// Sync worker reference
let syncWorker: NodeJS.Timeout | null = null

// =============================================
// EVENT MANAGEMENT
// =============================================

/**
 * Generate unique event ID
 */
function generateEventId(): string {
  return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

/**
 * Create analytics event
 */
function createAnalyticsEvent(
  type: AnalyticsEvent['type'],
  sessionId: string,
  userId?: string,
  productId?: string,
  quantity?: number,
  value?: number,
  metadata?: Record<string, any>,
): AnalyticsEvent {
  return {
    id: generateEventId(),
    type,
    timestamp: new Date(),
    sessionId,
    userId,
    productId,
    quantity,
    value,
    metadata,
  }
}

/**
 * Add event to analytics
 */
function addEvent(event: AnalyticsEvent): void {
  state.value.events.push(event)
  state.value.lastActivity = new Date()

  // Store offline for sync
  state.value.offlineEvents.push(event)

  // Limit offline events to prevent memory issues
  if (state.value.offlineEvents.length > MAX_OFFLINE_EVENTS) {
    state.value.offlineEvents = state.value.offlineEvents.slice(-MAX_OFFLINE_EVENTS)
  }

  // Save to localStorage for persistence
  saveEventsToStorage()

  // Reset abandonment timer
  resetAbandonmentTimer()
}

/**
 * Save events to localStorage
 */
function saveEventsToStorage(): void {
  if (typeof window === 'undefined') return

  try {
    const eventsData = {
      events: state.value.offlineEvents,
      sessionStartTime: state.value.sessionStartTime,
      lastActivity: state.value.lastActivity,
    }

    localStorage.setItem('cart_analytics_events', JSON.stringify(eventsData))
  }
  catch (error: unknown) {
    console.warn('Failed to save analytics events to storage:', error)
  }
}

/**
 * Load events from localStorage
 */
function loadEventsFromStorage(): void {
  if (typeof window === 'undefined') return

  try {
    const stored = localStorage.getItem('cart_analytics_events')
    if (stored) {
      const eventsData = JSON.parse(stored)

      state.value.offlineEvents = eventsData.events || []
      state.value.sessionStartTime = eventsData.sessionStartTime ? new Date(eventsData.sessionStartTime) : null
      state.value.lastActivity = eventsData.lastActivity ? new Date(eventsData.lastActivity) : null
    }
  }
  catch (error: unknown) {
    console.warn('Failed to load analytics events from storage:', error)
  }
}

// =============================================
// ABANDONMENT DETECTION
// =============================================

/**
 * Reset abandonment timer
 */
function resetAbandonmentTimer(): void {
  if (state.value.abandonmentTimer) {
    clearTimeout(state.value.abandonmentTimer)
  }

  state.value.abandonmentTimer = setTimeout(() => {
    trackAbandonmentWarning()
  }, ABANDONMENT_TIMEOUT)
}

/**
 * Clear abandonment timer
 */
function clearAbandonmentTimer(): void {
  if (state.value.abandonmentTimer) {
    clearTimeout(state.value.abandonmentTimer)
    state.value.abandonmentTimer = null
  }
}

/**
 * Track cart abandonment warning
 */
function trackAbandonmentWarning(): void {
  // This would be called by the main store with session info
  console.log('Cart abandonment detected')
}

// =============================================
// SERVER SYNCHRONIZATION
// =============================================

/**
 * Sync events with server
 */
async function syncEventsWithServer(): Promise<void> {
  if (state.value.syncInProgress || state.value.offlineEvents.length === 0) {
    return
  }

  state.value.syncInProgress = true

  try {
    // Prepare events for sync
    const eventsToSync = [...state.value.offlineEvents]

    // Send to server
    const response = await $fetch('/api/analytics/cart-events', {
      method: 'POST',
      body: {
        events: eventsToSync,
      },
    }) as any

    if (response.success) {
      // Clear synced events
      state.value.offlineEvents = []
      saveEventsToStorage()

      console.log(`Synced ${eventsToSync.length} cart analytics events`)
    }
  }
  catch (error: unknown) {
    console.warn('Failed to sync analytics events:', error)
  }
  finally {
    state.value.syncInProgress = false
  }
}

/**
 * Start sync worker
 */
function startSyncWorker(): void {
  if (syncWorker) return

  syncWorker = setInterval(async () => {
    await syncEventsWithServer()
  }, SYNC_INTERVAL)
}

/**
 * Stop sync worker
 */
function stopSyncWorker(): void {
  if (syncWorker) {
    clearInterval(syncWorker)
    syncWorker = null
  }
}

// =============================================
// ANALYTICS TRACKING FUNCTIONS
// =============================================

/**
 * Track add to cart event
 */
function trackAddToCart(
  product: Product,
  quantity: number,
  subtotal: number,
  itemCount: number,
  sessionId: string,
  userId?: string,
): void {
  const event = createAnalyticsEvent(
    'add_to_cart',
    sessionId,
    userId,
    product.id,
    quantity,
    product.price * quantity,
    {
      productName: product.name,
      productPrice: product.price,
      productCategory: product.category,
      cartSubtotal: subtotal,
      cartItemCount: itemCount,
    },
  )

  addEvent(event)
}

/**
 * Track remove from cart event
 */
function trackRemoveFromCart(
  product: Product,
  quantity: number,
  subtotal: number,
  itemCount: number,
  sessionId: string,
  userId?: string,
): void {
  const event = createAnalyticsEvent(
    'remove_from_cart',
    sessionId,
    userId,
    product.id,
    quantity,
    product.price * quantity,
    {
      productName: product.name,
      productPrice: product.price,
      productCategory: product.category,
      cartSubtotal: subtotal,
      cartItemCount: itemCount,
    },
  )

  addEvent(event)
}

/**
 * Track quantity update event
 */
function trackQuantityUpdate(
  product: Product,
  oldQuantity: number,
  newQuantity: number,
  subtotal: number,
  itemCount: number,
  sessionId: string,
  userId?: string,
): void {
  const event = createAnalyticsEvent(
    'update_quantity',
    sessionId,
    userId,
    product.id,
    newQuantity,
    product.price * newQuantity,
    {
      productName: product.name,
      productPrice: product.price,
      productCategory: product.category,
      oldQuantity,
      newQuantity,
      quantityChange: newQuantity - oldQuantity,
      cartSubtotal: subtotal,
      cartItemCount: itemCount,
    },
  )

  addEvent(event)
}

/**
 * Track cart view event
 */
function trackCartView(
  sessionId: string,
  userId?: string,
  subtotal?: number,
  itemCount?: number,
): void {
  const event = createAnalyticsEvent(
    'view_cart',
    sessionId,
    userId,
    undefined,
    undefined,
    subtotal,
    {
      cartSubtotal: subtotal,
      cartItemCount: itemCount,
      viewSource: 'direct', // Could be 'navigation', 'button', etc.
    },
  )

  addEvent(event)
}

/**
 * Track cart abandonment
 */
function trackCartAbandonment(
  sessionId: string,
  userId?: string,
  subtotal?: number,
  itemCount?: number,
  timeSpent?: number,
): void {
  const event = createAnalyticsEvent(
    'abandon_cart',
    sessionId,
    userId,
    undefined,
    undefined,
    subtotal,
    {
      cartSubtotal: subtotal,
      cartItemCount: itemCount,
      timeSpent,
      abandonmentReason: 'timeout', // Could be 'navigation', 'close', etc.
    },
  )

  addEvent(event)
}

// =============================================
// SESSION MANAGEMENT
// =============================================

/**
 * Initialize cart analytics session
 */
function initializeCartSession(sessionId: string, userId?: string): void {
  state.value.sessionStartTime = new Date()
  state.value.lastActivity = new Date()

  // Load existing events from storage
  loadEventsFromStorage()

  // Start sync worker if in client environment
  if (import.meta.client) {
    startSyncWorker()
  }

  // Track session start
  const event = createAnalyticsEvent(
    'view_cart',
    sessionId,
    userId,
    undefined,
    undefined,
    undefined,
    {
      sessionStart: true,
      userAgent: import.meta.client ? navigator.userAgent : undefined,
      referrer: import.meta.client ? document.referrer : undefined,
    },
  )

  addEvent(event)
}

/**
 * End cart analytics session
 */
function endCartSession(
  sessionId: string,
  userId?: string,
  reason: 'checkout' | 'abandonment' | 'navigation' = 'navigation',
): void {
  const timeSpent = state.value.sessionStartTime
    ? Date.now() - state.value.sessionStartTime.getTime()
    : 0

  if (reason === 'abandonment') {
    trackCartAbandonment(sessionId, userId, undefined, undefined, timeSpent)
  }

  // Clear timers
  clearAbandonmentTimer()
  stopSyncWorker()

  // Final sync attempt
  if (import.meta.client) {
    syncEventsWithServer().catch((error: any) => {
      console.warn('Final sync failed:', error)
    })
  }
}

// =============================================
// ANALYTICS INSIGHTS
// =============================================

/**
 * Get cart analytics summary
 */
function getAnalyticsSummary(): {
  totalEvents: number
  sessionDuration: number
  addToCartEvents: number
  removeFromCartEvents: number
  viewCartEvents: number
  lastActivity: Date | null
} {
  const addToCartEvents = state.value.events.filter(e => e.type === 'add_to_cart').length
  const removeFromCartEvents = state.value.events.filter(e => e.type === 'remove_from_cart').length
  const viewCartEvents = state.value.events.filter(e => e.type === 'view_cart').length

  const sessionDuration = state.value.sessionStartTime
    ? Date.now() - state.value.sessionStartTime.getTime()
    : 0

  return {
    totalEvents: state.value.events.length,
    sessionDuration,
    addToCartEvents,
    removeFromCartEvents,
    viewCartEvents,
    lastActivity: state.value.lastActivity,
  }
}

/**
 * Get events by type
 */
function getEventsByType(type: AnalyticsEvent['type']): AnalyticsEvent[] {
  return state.value.events.filter(event => event.type === type)
}

/**
 * Get events for product
 */
function getEventsForProduct(productId: string): AnalyticsEvent[] {
  return state.value.events.filter(event => event.productId === productId)
}

// =============================================
// ACTIONS INTERFACE
// =============================================

const actions: CartAnalyticsActions = {
  trackAddToCart: (_product: Product, _quantity: number, _subtotal: number, _itemCount: number) => {
    // This will be called by the main store with session info
    console.warn('trackAddToCart called without session info')
  },

  trackRemoveFromCart: (_product: Product, _quantity: number, _subtotal: number, _itemCount: number) => {
    // This will be called by the main store with session info
    console.warn('trackRemoveFromCart called without session info')
  },

  trackQuantityUpdate: (_product: Product, _oldQuantity: number, _newQuantity: number, _subtotal: number, _itemCount: number) => {
    // This will be called by the main store with session info
    console.warn('trackQuantityUpdate called without session info')
  },

  trackCartView: () => {
    // This will be called by the main store with session info
    console.warn('trackCartView called without session info')
  },

  trackAbandonmentWarning,
  syncEventsWithServer,
  initializeCartSession,
}

// =============================================
// COMPOSABLE INTERFACE
// =============================================

export function useCartAnalytics() {
  return {
    // State
    state: readonly(state),

    // Actions
    ...actions,

    // Utilities
    trackAddToCart,
    trackRemoveFromCart,
    trackQuantityUpdate,
    trackCartView,
    trackCartAbandonment,
    initializeCartSession,
    endCartSession,
    getAnalyticsSummary,
    getEventsByType,
    getEventsForProduct,
    syncEventsWithServer,
    startSyncWorker,
    stopSyncWorker,
  }
}

// =============================================
// DIRECT EXPORTS FOR STORE USAGE
// =============================================

export {
  state as cartAnalyticsState,
  actions as cartAnalyticsActions,
  trackAddToCart,
  trackRemoveFromCart,
  trackQuantityUpdate,
  trackCartView,
  trackCartAbandonment,
  initializeCartSession,
  endCartSession,
  syncEventsWithServer,
  getAnalyticsSummary,
}
