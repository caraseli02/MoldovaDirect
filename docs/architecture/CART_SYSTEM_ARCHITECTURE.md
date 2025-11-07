# Cart System Architecture

## Overview

The Moldova Direct cart system is built with robust error handling, intelligent initialization, and comprehensive state management. The system uses Pinia for state management with intelligent availability detection to prevent initialization errors and provide graceful fallbacks.

## Architecture Components

### 1. Cart Composable (`composables/useCart.ts`)

The main cart composable provides a unified interface for cart operations with intelligent Pinia availability detection:

```typescript
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
      subtotal: ref(0),
      isEmpty: ref(true),
      // ... other minimal interface methods
    }
  }

  // Full cart functionality when Pinia is ready
  const cartStore = useCartStore()
  // ... full implementation
}
```

#### Key Features:
- **Pinia Availability Check**: Prevents initialization errors when Pinia isn't ready
- **SSR Compatibility**: Provides minimal interface during server-side rendering
- **Graceful Fallbacks**: Returns functional interface even when store is unavailable
- **Error Resilience**: Comprehensive error handling for all cart operations

### 2. Initialization Patterns

#### Pinia Availability Detection

The system uses a robust availability check:

```typescript
const isPiniaAvailable = () => {
  try {
    // Try to get the Pinia instance
    const pinia = getActivePinia()
    return !!pinia
  } catch {
    return false
  }
}
```

This check ensures:
- **Safe Initialization**: Only initializes when Pinia is ready
- **Error Prevention**: Catches and handles Pinia access errors
- **Timing Independence**: Works regardless of initialization order

#### Conditional Store Access

```typescript
// Only initialize store when conditions are met
if (!process.client || !isPiniaAvailable()) {
  return minimalInterface
}

// Safe to access store
const cartStore = useCartStore()
```

### 3. Fallback Interface

When Pinia is not available, the composable returns a minimal but functional interface:

```typescript
const minimalInterface = {
  // State
  items: ref([]),
  itemCount: ref(0),
  subtotal: ref(0),
  isEmpty: ref(true),
  loading: ref(false),
  error: ref(null),
  
  // Methods (no-op implementations)
  addItem: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  
  // Utility methods
  formatPrice: (price: number) => `€${price.toFixed(2)}`,
  formattedSubtotal: ref("€0.00"),
}
```

This ensures:
- **No Runtime Errors**: All expected methods and properties are available
- **Consistent Interface**: Components can use the same API regardless of store availability
- **Graceful Degradation**: Basic functionality works even without full store access

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

### 5. Cart Store (`stores/cart.ts`)

The Pinia store manages cart state and operations:

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
- **Session Persistence**: Maintains cart state across page reloads

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
   - Check if Pinia is properly configured
   - Verify client-side execution context
   - Ensure proper plugin order in nuxt.config.ts

2. **Analytics Not Working**
   - Verify cart analytics plugin is loaded
   - Check for JavaScript errors in console
   - Ensure proper cleanup of event listeners

3. **State Not Persisting**
   - Check localStorage availability
   - Verify session ID generation
   - Check for storage quota issues

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

### Recent Improvements (September 2025)

The cart system was enhanced with Pinia availability detection:

**Before:**
```typescript
export const useCart = () => {
  if (!process.client) {
    return minimalInterface
  }
  
  const cartStore = useCartStore() // Could fail if Pinia not ready
}
```

**After:**
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
  
  const cartStore = useCartStore() // Safe initialization
}
```

This change provides:
- **Better Error Handling**: Prevents initialization errors
- **Improved Reliability**: Works regardless of initialization timing
- **Enhanced SSR Support**: Better server-side rendering compatibility
- **Graceful Degradation**: Functional interface even when store is unavailable

## Related Documentation

- [Cart Analytics System](./CART_ANALYTICS.md)
- [Authentication Architecture](./AUTHENTICATION_ARCHITECTURE.md)
- [Performance Optimization](./PERFORMANCE.md)
- [State Management](./STATE_MANAGEMENT.md)