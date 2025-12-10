/**
 * Cart Analytics Module Tests
 * Tests for analytics event tracking, abandonment detection, and server sync
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock $fetch before importing the module
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => { mockLocalStorage.store[key] = value }),
  removeItem: vi.fn((key: string) => { delete mockLocalStorage.store[key] }),
  clear: vi.fn(() => { mockLocalStorage.store = {} })
}

// Set up localStorage mock
vi.stubGlobal('localStorage', mockLocalStorage)

// Mock process.client
vi.stubGlobal('process', { client: true, dev: false })

// Mock navigator
vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Test Browser)' })

// Mock document
vi.stubGlobal('document', { referrer: 'https://example.com' })

import {
  cartAnalyticsState,
  trackAddToCart,
  trackRemoveFromCart,
  trackQuantityUpdate,
  trackCartView,
  trackCartAbandonment,
  initializeCartSession,
  endCartSession,
  syncEventsWithServer,
  getAnalyticsSummary
} from '~/stores/cart/analytics'
import type { Product } from '~/stores/cart/types'

// Mock product data
const mockProduct: Product = {
  id: 'prod-1',
  slug: 'test-wine',
  name: 'Test Wine',
  price: 25.99,
  images: ['/images/wine.jpg'],
  stock: 10,
  category: 'Wines'
}

// Helper to reset analytics state
function resetAnalyticsState() {
  cartAnalyticsState.value = {
    sessionStartTime: null,
    lastActivity: null,
    events: [],
    abandonmentTimer: null,
    syncInProgress: false,
    offlineEvents: []
  }
}

describe('Cart Analytics Module', () => {
  beforeEach(() => {
    resetAnalyticsState()
    mockLocalStorage.store = {}
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    resetAnalyticsState()
    vi.useRealTimers()
  })

  describe('State Management', () => {
    it('should initialize with correct default state', () => {
      resetAnalyticsState()

      expect(cartAnalyticsState.value.sessionStartTime).toBeNull()
      expect(cartAnalyticsState.value.lastActivity).toBeNull()
      expect(cartAnalyticsState.value.events).toEqual([])
      expect(cartAnalyticsState.value.abandonmentTimer).toBeNull()
      expect(cartAnalyticsState.value.syncInProgress).toBe(false)
      expect(cartAnalyticsState.value.offlineEvents).toEqual([])
    })

    it('should track session state changes', () => {
      const startTime = new Date()
      cartAnalyticsState.value.sessionStartTime = startTime
      expect(cartAnalyticsState.value.sessionStartTime).toBe(startTime)

      const activity = new Date()
      cartAnalyticsState.value.lastActivity = activity
      expect(cartAnalyticsState.value.lastActivity).toBe(activity)
    })

    it('should track sync progress state', () => {
      expect(cartAnalyticsState.value.syncInProgress).toBe(false)

      cartAnalyticsState.value.syncInProgress = true
      expect(cartAnalyticsState.value.syncInProgress).toBe(true)

      cartAnalyticsState.value.syncInProgress = false
      expect(cartAnalyticsState.value.syncInProgress).toBe(false)
    })
  })

  describe('Event Tracking - Add to Cart', () => {
    it('should track add to cart event', () => {
      trackAddToCart(mockProduct, 2, 51.98, 2, 'session-123', 'user-456')

      expect(cartAnalyticsState.value.events).toHaveLength(1)
      expect(cartAnalyticsState.value.events[0].type).toBe('add_to_cart')
      expect(cartAnalyticsState.value.events[0].sessionId).toBe('session-123')
      expect(cartAnalyticsState.value.events[0].userId).toBe('user-456')
      expect(cartAnalyticsState.value.events[0].productId).toBe('prod-1')
      expect(cartAnalyticsState.value.events[0].quantity).toBe(2)
    })

    it('should include correct metadata in add to cart event', () => {
      trackAddToCart(mockProduct, 2, 51.98, 2, 'session-123')

      const event = cartAnalyticsState.value.events[0]
      expect(event.metadata).toBeDefined()
      expect(event.metadata?.productName).toBe('Test Wine')
      expect(event.metadata?.productPrice).toBe(25.99)
      expect(event.metadata?.productCategory).toBe('Wines')
      expect(event.metadata?.cartSubtotal).toBe(51.98)
      expect(event.metadata?.cartItemCount).toBe(2)
    })

    it('should calculate correct value for add to cart event', () => {
      trackAddToCart(mockProduct, 3, 77.97, 3, 'session-123')

      const event = cartAnalyticsState.value.events[0]
      expect(event.value).toBeCloseTo(77.97) // 25.99 * 3
    })

    it('should update lastActivity on add to cart', () => {
      expect(cartAnalyticsState.value.lastActivity).toBeNull()

      trackAddToCart(mockProduct, 1, 25.99, 1, 'session-123')

      expect(cartAnalyticsState.value.lastActivity).toBeInstanceOf(Date)
    })
  })

  describe('Event Tracking - Remove from Cart', () => {
    it('should track remove from cart event', () => {
      trackRemoveFromCart(mockProduct, 1, 25.99, 1, 'session-123', 'user-456')

      expect(cartAnalyticsState.value.events).toHaveLength(1)
      expect(cartAnalyticsState.value.events[0].type).toBe('remove_from_cart')
      expect(cartAnalyticsState.value.events[0].productId).toBe('prod-1')
    })

    it('should include metadata in remove event', () => {
      trackRemoveFromCart(mockProduct, 2, 51.98, 3, 'session-123')

      const event = cartAnalyticsState.value.events[0]
      expect(event.metadata?.productName).toBe('Test Wine')
      expect(event.metadata?.cartSubtotal).toBe(51.98)
      expect(event.metadata?.cartItemCount).toBe(3)
    })
  })

  describe('Event Tracking - Quantity Update', () => {
    it('should track quantity update event', () => {
      trackQuantityUpdate(mockProduct, 1, 3, 77.97, 1, 'session-123')

      expect(cartAnalyticsState.value.events).toHaveLength(1)
      expect(cartAnalyticsState.value.events[0].type).toBe('update_quantity')
    })

    it('should include old and new quantity in metadata', () => {
      trackQuantityUpdate(mockProduct, 2, 5, 129.95, 1, 'session-123')

      const event = cartAnalyticsState.value.events[0]
      expect(event.metadata?.oldQuantity).toBe(2)
      expect(event.metadata?.newQuantity).toBe(5)
      expect(event.metadata?.quantityChange).toBe(3)
    })

    it('should track quantity decrease', () => {
      trackQuantityUpdate(mockProduct, 5, 2, 51.98, 1, 'session-123')

      const event = cartAnalyticsState.value.events[0]
      expect(event.metadata?.quantityChange).toBe(-3)
    })
  })

  describe('Event Tracking - Cart View', () => {
    it('should track cart view event', () => {
      trackCartView('session-123', 'user-456', 100.00, 4)

      expect(cartAnalyticsState.value.events).toHaveLength(1)
      expect(cartAnalyticsState.value.events[0].type).toBe('view_cart')
    })

    it('should include cart summary in view event', () => {
      trackCartView('session-123', undefined, 150.50, 5)

      const event = cartAnalyticsState.value.events[0]
      expect(event.value).toBe(150.50)
      expect(event.metadata?.cartSubtotal).toBe(150.50)
      expect(event.metadata?.cartItemCount).toBe(5)
    })

    it('should handle view event without user ID', () => {
      trackCartView('session-123')

      const event = cartAnalyticsState.value.events[0]
      expect(event.userId).toBeUndefined()
      expect(event.sessionId).toBe('session-123')
    })
  })

  describe('Event Tracking - Cart Abandonment', () => {
    it('should track cart abandonment event', () => {
      trackCartAbandonment('session-123', 'user-456', 200.00, 5, 1800000)

      expect(cartAnalyticsState.value.events).toHaveLength(1)
      expect(cartAnalyticsState.value.events[0].type).toBe('abandon_cart')
    })

    it('should include abandonment details in metadata', () => {
      trackCartAbandonment('session-123', undefined, 150.00, 3, 900000)

      const event = cartAnalyticsState.value.events[0]
      expect(event.metadata?.cartSubtotal).toBe(150.00)
      expect(event.metadata?.cartItemCount).toBe(3)
      expect(event.metadata?.timeSpent).toBe(900000)
      expect(event.metadata?.abandonmentReason).toBe('timeout')
    })
  })

  describe('Session Management', () => {
    it('should initialize cart session', () => {
      initializeCartSession('session-123', 'user-456')

      expect(cartAnalyticsState.value.sessionStartTime).toBeInstanceOf(Date)
      expect(cartAnalyticsState.value.lastActivity).toBeInstanceOf(Date)
    })

    it('should track session start event on initialization', () => {
      initializeCartSession('session-123')

      // Find the session start event
      const sessionStartEvent = cartAnalyticsState.value.events.find(
        e => e.metadata?.sessionStart === true
      )
      expect(sessionStartEvent).toBeDefined()
      expect(sessionStartEvent?.type).toBe('view_cart')
    })

    it('should end cart session', () => {
      initializeCartSession('session-123')
      endCartSession('session-123', undefined, 'navigation')

      // Session should still have timestamp (not cleared)
      expect(cartAnalyticsState.value.sessionStartTime).toBeInstanceOf(Date)
    })

    it('should track abandonment on session end with abandonment reason', () => {
      initializeCartSession('session-123')

      // Clear events from initialization
      const initialEventCount = cartAnalyticsState.value.events.length

      endCartSession('session-123', undefined, 'abandonment')

      // Should have added abandonment event
      expect(cartAnalyticsState.value.events.length).toBeGreaterThan(initialEventCount)

      const abandonEvent = cartAnalyticsState.value.events.find(
        e => e.type === 'abandon_cart'
      )
      expect(abandonEvent).toBeDefined()
    })
  })

  describe('Offline Events Storage', () => {
    it('should store events in offlineEvents array', () => {
      trackAddToCart(mockProduct, 1, 25.99, 1, 'session-123')

      expect(cartAnalyticsState.value.offlineEvents).toHaveLength(1)
      expect(cartAnalyticsState.value.offlineEvents[0].type).toBe('add_to_cart')
    })

    it('should limit offline events to prevent memory issues', () => {
      // Add 110 events (limit is 100)
      for (let i = 0; i < 110; i++) {
        trackCartView(`session-${i}`)
      }

      // Should be limited to 100
      expect(cartAnalyticsState.value.offlineEvents.length).toBeLessThanOrEqual(100)
    })

    it('should save events to localStorage', () => {
      trackAddToCart(mockProduct, 1, 25.99, 1, 'session-123')

      expect(mockLocalStorage.setItem).toHaveBeenCalled()
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'cart_analytics_events',
        expect.any(String)
      )
    })
  })

  describe('Server Synchronization', () => {
    it('should sync events with server', async () => {
      mockFetch.mockResolvedValueOnce({ success: true })

      // Add an event first
      trackAddToCart(mockProduct, 1, 25.99, 1, 'session-123')

      await syncEventsWithServer()

      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/cart-events', {
        method: 'POST',
        body: {
          events: expect.any(Array)
        }
      })
    })

    it('should clear offline events after successful sync', async () => {
      mockFetch.mockResolvedValueOnce({ success: true })

      trackAddToCart(mockProduct, 1, 25.99, 1, 'session-123')
      expect(cartAnalyticsState.value.offlineEvents.length).toBeGreaterThan(0)

      await syncEventsWithServer()

      expect(cartAnalyticsState.value.offlineEvents).toHaveLength(0)
    })

    it('should not sync when no offline events', async () => {
      await syncEventsWithServer()

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should not sync when sync already in progress', async () => {
      cartAnalyticsState.value.syncInProgress = true
      trackAddToCart(mockProduct, 1, 25.99, 1, 'session-123')

      await syncEventsWithServer()

      expect(mockFetch).not.toHaveBeenCalled()

      cartAnalyticsState.value.syncInProgress = false
    })

    it('should handle sync failure gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      trackAddToCart(mockProduct, 1, 25.99, 1, 'session-123')
      const eventsBefore = cartAnalyticsState.value.offlineEvents.length

      // Should not throw
      await syncEventsWithServer()

      // Events should still be there for retry
      expect(cartAnalyticsState.value.offlineEvents.length).toBe(eventsBefore)
    })

    it('should track sync progress state', async () => {
      mockFetch.mockImplementation(() => {
        expect(cartAnalyticsState.value.syncInProgress).toBe(true)
        return Promise.resolve({ success: true })
      })

      trackAddToCart(mockProduct, 1, 25.99, 1, 'session-123')
      await syncEventsWithServer()

      expect(cartAnalyticsState.value.syncInProgress).toBe(false)
    })
  })

  describe('Analytics Summary', () => {
    it('should return correct analytics summary', () => {
      trackAddToCart(mockProduct, 1, 25.99, 1, 'session-123')
      trackAddToCart(mockProduct, 1, 51.98, 2, 'session-123')
      trackRemoveFromCart(mockProduct, 1, 25.99, 1, 'session-123')
      trackCartView('session-123')
      trackCartView('session-123')

      const summary = getAnalyticsSummary()

      expect(summary.totalEvents).toBe(5)
      expect(summary.addToCartEvents).toBe(2)
      expect(summary.removeFromCartEvents).toBe(1)
      expect(summary.viewCartEvents).toBe(2)
    })

    it('should return session duration', () => {
      // Initialize session
      cartAnalyticsState.value.sessionStartTime = new Date(Date.now() - 60000) // 1 minute ago

      const summary = getAnalyticsSummary()

      expect(summary.sessionDuration).toBeGreaterThanOrEqual(60000)
    })

    it('should return zero duration when no session', () => {
      const summary = getAnalyticsSummary()

      expect(summary.sessionDuration).toBe(0)
    })

    it('should return last activity timestamp', () => {
      trackAddToCart(mockProduct, 1, 25.99, 1, 'session-123')

      const summary = getAnalyticsSummary()

      expect(summary.lastActivity).toBeInstanceOf(Date)
    })
  })

  describe('Event ID Generation', () => {
    it('should generate unique event IDs', () => {
      trackAddToCart(mockProduct, 1, 25.99, 1, 'session-123')
      trackAddToCart(mockProduct, 1, 25.99, 1, 'session-123')

      const ids = cartAnalyticsState.value.events.map(e => e.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should generate IDs with event prefix', () => {
      trackAddToCart(mockProduct, 1, 25.99, 1, 'session-123')

      const eventId = cartAnalyticsState.value.events[0].id
      expect(eventId).toMatch(/^event_/)
    })
  })

  describe('Multiple Events', () => {
    it('should track multiple events in sequence', () => {
      trackAddToCart(mockProduct, 1, 25.99, 1, 'session-123')
      trackQuantityUpdate(mockProduct, 1, 2, 51.98, 1, 'session-123')
      trackRemoveFromCart(mockProduct, 2, 0, 0, 'session-123')

      expect(cartAnalyticsState.value.events).toHaveLength(3)
      expect(cartAnalyticsState.value.events[0].type).toBe('add_to_cart')
      expect(cartAnalyticsState.value.events[1].type).toBe('update_quantity')
      expect(cartAnalyticsState.value.events[2].type).toBe('remove_from_cart')
    })

    it('should maintain event order', () => {
      trackCartView('session-1')
      trackAddToCart(mockProduct, 1, 25.99, 1, 'session-1')
      trackCartView('session-1')

      const types = cartAnalyticsState.value.events.map(e => e.type)
      expect(types).toEqual(['view_cart', 'add_to_cart', 'view_cart'])
    })
  })
})
