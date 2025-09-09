# Cart Analytics System

## Overview

The cart analytics system provides comprehensive tracking of user shopping cart interactions, including add/remove events, abandonment patterns, and conversion metrics. The system is designed with offline capability, memory optimization, and performance in mind.

## Architecture

### Plugin-based Initialization

Cart analytics are automatically initialized through a client-side Nuxt plugin (`plugins/cart-analytics.client.ts`) that:

- Sets up automatic cart view tracking on navigation
- Initializes periodic server synchronization (every 5 minutes)
- Handles cleanup on page unload to prevent memory leaks
- Provides global cleanup function for manual resource management

### Memory Management Improvements (Latest Update)

Recent improvements to the cart analytics plugin include:

- **Proper Interval Management**: Intervals are now properly scoped and can be cleared to prevent memory leaks
- **Event Handler Extraction**: Event handlers are extracted into named functions for better cleanup
- **Global Cleanup Function**: Added `window.__cartAnalyticsCleanup()` for manual resource cleanup
- **Resource Cleanup**: Proper removal of event listeners and clearing of intervals

## Features

### Automatic Event Tracking

- **Cart View Events**: Automatically tracked when users navigate to `/cart`
- **Add to Cart**: Tracks product additions with detailed metadata
- **Remove from Cart**: Tracks product removals and quantity changes
- **Checkout Events**: Tracks checkout start and completion
- **Abandonment Detection**: Monitors for cart abandonment with 30-minute timeout

### Offline Capability

- **Local Storage**: Events are stored locally using localStorage
- **Automatic Sync**: Events are synchronized with server every 5 minutes
- **Batch Processing**: Events are batched for efficient server communication
- **Storage Limits**: Maintains only last 100 events to prevent storage bloat

### Session Management

- **Session Tracking**: Each cart session has unique identifier
- **Activity Monitoring**: Tracks time spent in cart and activity patterns
- **Cross-tab Persistence**: Session data persists across browser tabs
- **Conversion Metrics**: Tracks time-to-conversion and abandonment stages

## Cart System Integration

### Pinia Availability Check

The cart analytics system integrates with the cart composable, which now includes intelligent Pinia availability detection:

```typescript
// composables/useCart.ts
export const useCart = () => {
  // Check if Pinia is available
  const isPiniaAvailable = () => {
    try {
      const pinia = getActivePinia()
      return !!pinia
    } catch {
      return false
    }
  }

  // Only initialize store when Pinia is available
  if (!process.client || !isPiniaAvailable()) {
    // Return minimal interface for SSR/initialization timing
    return {
      items: ref([]),
      itemCount: ref(0),
      // ... other minimal interface methods
    }
  }

  // Full cart functionality when Pinia is ready
  const cartStore = useCartStore()
  // ... full implementation
}
```

This improvement ensures:
- **Graceful SSR Handling**: Prevents initialization errors during server-side rendering
- **Timing Resilience**: Handles cases where Pinia isn't ready yet
- **Error Prevention**: Avoids crashes when store access fails
- **Fallback Interface**: Provides minimal functionality when store is unavailable

## Technical Implementation

### Plugin Structure

```typescript
// plugins/cart-analytics.client.ts

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __cartAnalyticsCleanup?: () => void;
  }
}

export default defineNuxtPlugin(() => {
  // Only run on client side
  if (!import.meta.client) return

  const { $router } = useNuxtApp()
  
  // Automatic cart view tracking
  $router.afterEach((to) => {
    if (to.path === '/cart') {
      setTimeout(() => {
        const { trackCartView } = useCart()
        trackCartView()
      }, 100)
    }
  })

  // Periodic sync with memory management
  let syncInterval: NodeJS.Timeout | null = null
  
  setTimeout(() => {
    syncInterval = setInterval(async () => {
      const { syncEventsWithServer } = useCartAnalytics()
      await syncEventsWithServer()
    }, 5 * 60 * 1000) // 5 minutes

    // Cleanup on page unload
    const handleBeforeUnload = async () => {
      const { syncEventsWithServer } = useCartAnalytics()
      await syncEventsWithServer()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // Global cleanup function
    window.__cartAnalyticsCleanup = () => {
      if (syncInterval) {
        clearInterval(syncInterval)
        syncInterval = null
      }
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, 1000) // Wait for Pinia initialization
})
```

### Composable Usage

```typescript
// Using cart analytics in components
const {
  trackAddToCart,
  trackRemoveFromCart,
  trackCartView,
  trackCheckoutStart,
  syncEventsWithServer,
  setupAbandonmentDetection
} = useCartAnalytics()

// Track add to cart
await trackAddToCart(product, quantity, cartValue, itemCount)

// Track cart view
await trackCartView(cartValue, itemCount)

// Setup abandonment detection
const cleanup = setupAbandonmentDetection(cartItems)
```

## Event Types

### Cart Analytics Events

```typescript
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
```

### Abandonment Data

```typescript
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
```

### Conversion Metrics

```typescript
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
```

## API Integration

### Server Endpoint

Cart analytics data is synchronized with the server via:

```
POST /api/analytics/cart-events
```

**Request Body:**
```json
{
  "events": [...], // Array of CartAnalyticsEvent
  "conversions": [...], // Array of CartConversionMetrics
  "abandonments": [...] // Array of CartAbandonmentData
}
```

## Performance Considerations

### Memory Management

- **Interval Cleanup**: All intervals are properly cleared to prevent memory leaks
- **Event Listener Removal**: Event listeners are removed on cleanup
- **Storage Limits**: Local storage is limited to prevent excessive memory usage
- **Batch Processing**: Events are batched for efficient processing

### Optimization Features

- **Lazy Initialization**: Analytics are initialized only when needed
- **Debounced Events**: Rapid events are debounced to prevent spam
- **Offline Resilience**: System works offline and syncs when connection is restored
- **Error Handling**: Comprehensive error handling prevents system crashes

## Configuration

### Sync Interval

The sync interval can be configured by modifying the plugin:

```typescript
// Current: 5 minutes
setInterval(syncFunction, 5 * 60 * 1000)

// Custom: 2 minutes
setInterval(syncFunction, 2 * 60 * 1000)
```

### Abandonment Timeout

The abandonment detection timeout can be configured:

```typescript
// Current: 30 minutes
const ABANDONMENT_TIMEOUT = 30 * 60 * 1000

// Custom: 15 minutes
const ABANDONMENT_TIMEOUT = 15 * 60 * 1000
```

### Storage Limits

Storage limits can be adjusted in the composable:

```typescript
// Current limits
const MAX_EVENTS = 100
const MAX_CONVERSIONS = 50
const MAX_ABANDONMENTS = 50
```

## Troubleshooting

### Common Issues

1. **Events Not Syncing**
   - Check network connectivity
   - Verify server endpoint is accessible
   - Check browser console for errors

2. **Memory Leaks**
   - Ensure cleanup functions are called
   - Check for uncleaned intervals
   - Monitor browser memory usage

3. **Storage Issues**
   - Check localStorage availability
   - Verify storage quotas
   - Clear old analytics data if needed

### Debug Mode

Enable debug logging by adding to the plugin:

```typescript
const DEBUG = true

if (DEBUG) {
  console.log('Cart analytics event:', event)
}
```

## Future Enhancements

- **Real-time Analytics**: WebSocket-based real-time event streaming
- **Advanced Segmentation**: User behavior segmentation and analysis
- **A/B Testing Integration**: Cart analytics integration with A/B testing
- **Machine Learning**: Predictive abandonment detection
- **Dashboard Integration**: Real-time analytics dashboard for admin users

## Related Documentation

- [Analytics System](./ANALYTICS_SYSTEM.md)
- [Performance Optimization](./PERFORMANCE.md)
- [Memory Management](./MEMORY_MANAGEMENT.md)
- [API Documentation](./API.md)