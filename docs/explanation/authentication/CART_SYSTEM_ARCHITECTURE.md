# Cart System Architecture


## Overview

The Moldova Direct cart system is built with robust error handling, intelligent initialization, and comprehensive state management. The system uses Pinia for state management with client-side detection to prevent SSR initialization errors and provide graceful fallbacks.

**Last Updated**: January 2026

## Architecture Components

### 1. Cart Composable (`composables/useCart.ts`)

The main cart composable provides a unified interface for cart operations with client-side detection to prevent SSR errors:

```typescript
export const useCart = () => {
  // Check if running on client side
  if (!import.meta.client) {
    // Return minimal interface for SSR
    return {
      items: computed(() => []),
      itemCount: computed(() => 0),
      subtotal: computed(() => 0),
      isEmpty: computed(() => true),
      // ... other minimal interface methods
    }
  }

  // Full cart functionality when on client
  const cartStore = useCartStore()
  
  // Initialize cart on client side only
  if (cartStore && !cartStore.sessionId) {
    cartStore.initializeCart()
  }
  
  // ... full implementation
}
```

#### Key Features:
- **Client-Side Detection**: Uses `import.meta.client` to prevent SSR initialization errors
- **SSR Compatibility**: Provides minimal interface during server-side rendering
- **Graceful Fallbacks**: Returns functional interface even when store is unavailable
- **Error Resilience**: Comprehensive error handling for all cart operations
- **Automatic Initialization**: Cart store initializes automatically on first client-side access

### 2. Initialization Patterns

#### Client-Side Detection

The system uses a simple and reliable client-side check:

```typescript
if (!import.meta.client) {
  return minimalInterface
}

// Safe to access store on client
const cartStore = useCartStore()
```

This check ensures:
- **Safe Initialization**: Only initializes when running in the browser
- **Error Prevention**: Avoids SSR hydration mismatches
- **Timing Independence**: Works regardless of initialization order
- **Performance**: Minimal overhead with compile-time optimization

#### Conditional Store Access

```typescript
// Only initialize store when on client
if (!import.meta.client) {
  return minimalInterface
}

// Safe to access store
const cartStore = useCartStore()

// Initialize cart if not already initialized
if (cartStore && !cartStore.sessionId) {
  cartStore.initializeCart()
}
```

### 3. Fallback Interface

When running on the server (SSR), the composable returns a minimal but functional interface:

```typescript
const minimalInterface = {
  // State
  items: computed(() => []),
  itemCount: computed(() => 0),
  subtotal: computed(() => 0),
  isEmpty: computed(() => true),
  loading: computed(() => false),
  error: computed(() => null),
  
  // Methods (no-op implementations)
  addItem: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  
  // Utility methods
  formatPrice: (price: number) => `€${price.toFixed(2)}`,
  formattedSubtotal: computed(() => "€0.00"),
}
```

This ensures:
- **No Runtime Errors**: All expected methods and properties are available
- **Consistent Interface**: Components can use the same API regardless of environment
- **Graceful Degradation**: Basic functionality works even without full store access
- **SSR Compatibility**: Pages render correctly on the server without cart data

### 4. Error Handling Strategies

#### Store Operation Errors

```typescript
const safeAddItem = async (product: any, quantity: number = 1) => {
  try {
    await cartStore.addItem(product, quantity)
  } catch (error) {
    console.error("Failed to add item:", error)
    throw error // Re-throw to allow component-level handling
  }
}
```

#### Toast Integration

```typescript
const toast = (() => {
  try {
    return useToast()
  } catch {
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
    }
  }
})()
```

### 5. Cart Store (`stores/cart/index.ts`)

The Pinia store manages cart state and operations with a dual persistence strategy:

```typescript
export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    sessionId: null,
    loading: false,
    error: null,
    // ... other state
  }),
  
  getters: {
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: (state) => state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    isEmpty: (state) => state.items.length === 0,
  },
  
  actions: {
    async addItem(product, quantity) {
      // Implementation with error handling
    },
    
    async removeItem(itemId) {
      // Implementation with error handling
    }
  }
})
```

#### Persistence Strategy

The cart uses a **dual persistence strategy** for maximum reliability:

1. **Primary: HTTP-only Cookie**
   - Works with SSR and client-side rendering
   - Automatically sent with requests
   - Secure and tamper-resistant
   - Limited size (~4KB)

2. **Secondary: localStorage Backup**
   - Client-side only
   - More reliable for persistence
   - Larger storage capacity
   - Survives cookie clearing

**Synchronization Logic**:
```typescript
async function saveToStorage() {
  const data = serializeCartData()
  
  // Save to cookie (primary - works with SSR)
  cartCookie.value = data
  
  // Save to localStorage backup (secondary - more reliable)
  if (import.meta.client) {
    localStorage.setItem(COOKIE_NAMES.CART + '_backup', JSON.stringify(data))
  }
}

async function loadFromStorage() {
  // Try both sources and use the most recent
  const cookieData = cartCookie.value
  const localStorageData = localStorage.getItem(COOKIE_NAMES.CART + '_backup')
  
  // Compare timestamps and use newer data
  // Sync both sources to keep them in sync
}
```

#### Auto-Save with Debouncing

Cart changes are automatically saved with a 300ms debounce:

```typescript
// Watch for cart changes and automatically save
watch(
  () => items.value,
  () => {
    saveAndCacheCartData() // Debounced save
  },
  { deep: true }
)
```

#### Critical Save Operations

For critical operations (page unload, navigation), the cart uses immediate saves:

```typescript
async function forceImmediateSave() {
  // Cancel any pending debounced save
  if (saveTimeoutId) {
    clearTimeout(saveTimeoutId)
    saveTimeoutId = null
  }
  
  // Save immediately to both storage locations
  await saveToStorage()
}
```

**Lifecycle Hooks**:
- `beforeunload`: Saves cart before page refresh/close
- `visibilitychange`: Saves when tab becomes hidden (mobile browsers)
- `pagehide`: Saves on page hide (Safari/iOS compatibility)

## Integration with Analytics

### Analytics Initialization

The cart analytics system integrates seamlessly with the cart composable:

```typescript
// In cart composable initialization
if (cartStore && cartAnalytics) {
  const cleanupAbandonmentDetection = cartAnalytics.setupAbandonmentDetection(
    computed(() => cartStore.items)
  )
  
  // Cleanup on unmount
  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (cleanupAbandonmentDetection) {
        cleanupAbandonmentDetection()
      }
    })
  }
}
```

### Analytics Methods

```typescript
// Analytics methods in cart composable
trackCartView: () => {
  if (process.client && cartAnalytics) {
    cartAnalytics.trackCartView(cartStore.subtotal, cartStore.itemCount)
  }
},

trackCheckoutStart: () => {
  if (process.client && cartAnalytics) {
    cartAnalytics.trackCheckoutStart(
      cartStore.subtotal,
      cartStore.itemCount,
      cartStore.items
    )
  }
}
```

## Advanced Features

### Bulk Operations

The cart system supports bulk operations for enhanced user experience:

```typescript
// Bulk selection state
selectedItems: computed(() => cartStore.selectedItems),
selectedItemsCount: computed(() => cartStore.selectedItemsCount),
selectedItemsSubtotal: computed(() => cartStore.selectedItemsSubtotal),

// Bulk operations
bulkRemoveSelected: async () => {
  try {
    await cartStore.bulkRemoveSelected()
  } catch (error) {
    toast.error("Error al eliminar", "No se pudieron eliminar los productos seleccionados")
  }
}
```

### Save for Later

```typescript
// Save for later functionality
savedForLater: computed(() => cartStore.savedForLater),
saveItemForLater: async (itemId: string) => {
  try {
    await cartStore.saveItemForLater(itemId)
  } catch (error) {
    toast.error("Error al guardar", "No se pudo guardar el producto")
  }
}
```

### Recommendations

```typescript
// Product recommendations
recommendations: computed(() => cartStore.recommendations),
loadRecommendations: async () => {
  try {
    await cartStore.loadRecommendations()
  } catch (error) {
    toast.error("Error al cargar recomendaciones", "No se pudieron cargar las recomendaciones")
  }
}
```

## Performance Optimizations

### Lazy Loading

- **Store Initialization**: Cart store is only initialized when needed
- **Analytics Integration**: Analytics are loaded separately to avoid blocking cart operations
- **Component Code Splitting**: Cart components are code-split for optimal loading

### Memory Management

- **Event Cleanup**: Proper cleanup of event listeners and intervals
- **Reactive State**: Efficient reactive state updates with computed properties
- **Storage Optimization**: Intelligent storage management with size limits

### Caching Strategies

- **Validation Cache**: Caches product validation results to reduce API calls
- **Recommendation Cache**: Caches product recommendations for improved performance
- **Session Persistence**: Maintains cart state across page reloads using dual storage strategy (cookie + localStorage)
- **Debounced Saves**: 300ms debounce for responsive UX with immediate save on critical events (beforeunload, visibilitychange, pagehide)

## Development Guidelines

### Using the Cart Composable

```typescript
// In Vue components
<script setup>
const {
  items,
  itemCount,
  subtotal,
  addItem,
  removeItem,
  loading,
  error
} = useCart()

// Add item with error handling
const handleAddToCart = async (product) => {
  try {
    await addItem(product, 1)
    // Success handling
  } catch (error) {
    // Error handling
  }
}
</script>
```

### Error Handling Best Practices

1. **Use Safe Methods**: Prefer the safe wrapper methods (safeAddItem, safeRemoveItem)
2. **Handle Errors Gracefully**: Always provide user feedback for errors
3. **Fallback States**: Design components to work with minimal interface
4. **Loading States**: Show loading indicators during operations

### Testing Cart Functionality

```typescript
// Test with Pinia availability
const { items, addItem } = useCart()

// Test fallback interface
vi.mock('pinia', () => ({
  getActivePinia: () => null
}))

const fallbackCart = useCart()
expect(fallbackCart.items.value).toEqual([])
```

## Troubleshooting

### Common Issues

1. **Store Not Initializing**
   - Check if running on client side (`import.meta.client`)
   - Verify Pinia is properly configured in `nuxt.config.ts`
   - Ensure proper plugin order in nuxt.config.ts
   - Check browser console for initialization errors

2. **Analytics Not Working**
   - Verify cart analytics plugin is loaded
   - Check for JavaScript errors in console
   - Ensure proper cleanup of event listeners

3. **State Not Persisting**
   - Check cookie availability (browser settings, privacy mode)
   - Verify localStorage availability (quota, browser support)
   - Check for storage quota issues
   - Verify both cookie and localStorage are being written
   - Check browser console for storage errors

### Debug Mode

Enable debug logging for cart operations:

```typescript
// In cart composable
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('Cart operation:', operation, data)
}
```

## Migration Notes

### Recent Improvements (January 2026)

The cart system was simplified with client-side detection and dual persistence strategy:

**Before (Older Implementation)**:
```typescript
export const useCart = () => {
  const isPiniaAvailable = () => {
    try {
      const pinia = getActivePinia()
      return !!pinia
    } catch {
      return false
    }
  }

  if (!process.client || !isPiniaAvailable()) {
    return minimalInterface
  }
  
  const cartStore = useCartStore()
}
```

**After (Current Implementation)**:
```typescript
export const useCart = () => {
  if (!import.meta.client) {
    return minimalInterface
  }
  
  const cartStore = useCartStore()
  
  // Initialize cart on client side only
  if (cartStore && !cartStore.sessionId) {
    cartStore.initializeCart()
  }
}
```

This change provides:
- **Simpler Logic**: Direct client-side check instead of Pinia availability detection
- **Better Performance**: Compile-time optimization with `import.meta.client`
- **Improved Reliability**: Dual persistence strategy (cookie + localStorage)
- **Enhanced SSR Support**: Better server-side rendering compatibility
- **Graceful Degradation**: Functional interface even when store is unavailable
- **Critical Save Operations**: Immediate saves on page unload events

## Related Documentation

- [Cart Analytics System](./CART_ANALYTICS.md)
- [Authentication Architecture](./AUTHENTICATION_ARCHITECTURE.md)
- [Performance Optimization](./PERFORMANCE.md)
- [State Management](./STATE_MANAGEMENT.md)