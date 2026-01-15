# Cart Store Refactoring Migration Guide


## Overview

The cart store has been refactored from a single large file (2,666 lines) into a modular system for better maintainability, testability, and developer experience. This guide explains the changes and how to migrate your code.

## What Changed

### Before (Legacy System)
```typescript
// Single large file: stores/cart.ts
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()
cartStore.addItem(product, quantity)
```

### After (Modular System)
```typescript
// Modular system: stores/cart/index.ts + modules
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()
cartStore.addItem(product, quantity) // Same API!
```

## Backward Compatibility

**Good news!** The public API remains exactly the same. Your existing code will continue to work without changes.

```typescript
// This still works exactly as before
const cartStore = useCartStore()

// All existing methods work the same
await cartStore.addItem(product, 2)
await cartStore.removeItem(itemId)
await cartStore.updateQuantity(itemId, 3)

// All existing getters work the same
console.log(cartStore.itemCount)
console.log(cartStore.subtotal)
console.log(cartStore.isEmpty)
```

## New Modular Structure

### Directory Structure
```
stores/cart/
├── index.ts           # Main coordinator store
├── types.ts           # TypeScript interfaces
├── core.ts            # Basic cart operations
├── persistence.ts     # Storage management
├── validation.ts      # Product validation (coming soon)
├── analytics.ts       # Cart analytics (coming soon)
├── security.ts        # Security features (coming soon)
└── advanced.ts        # Advanced features (coming soon)
```

### Module Responsibilities

#### Core Module (`stores/cart/core.ts`)
- Add, remove, update items
- Basic cart calculations
- Session management
- Item validation

#### Persistence Module (`stores/cart/persistence.ts`)
- localStorage/sessionStorage management
- Fallback to memory storage
- Debounced saving
- Data serialization/deserialization

#### Types Module (`stores/cart/types.ts`)
- Comprehensive TypeScript interfaces
- Shared type definitions
- Configuration types

## Using the New System

### Option 1: Continue Using the Main Store (Recommended)
```typescript
// No changes needed - same as before
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()
```

### Option 2: Use Individual Modules (Advanced)
```typescript
// For advanced use cases, access individual modules
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()

// Access individual modules
const coreModule = cartStore._modules.core
const persistenceModule = cartStore._modules.persistence
```

### Option 3: Use Composables (New)
```typescript
// Use composables for component-level cart functionality
import { useCartCore } from '~/composables/cart/useCartCore'

const cart = useCartCore()
await cart.addItem(product, 2)
```

## Benefits of the New System

### 1. Better Performance
- Smaller bundle sizes through code splitting
- Lazy loading of non-critical features
- Optimized caching and memoization

### 2. Improved Maintainability
- Single responsibility modules
- Easier to understand and modify
- Better separation of concerns

### 3. Enhanced Testing
- Unit tests for individual modules
- Easier to mock specific functionality
- Better test coverage

### 4. Better Developer Experience
- Clear module boundaries
- Comprehensive TypeScript types
- Better IDE support and autocomplete

## Migration Steps

### Phase 1: No Action Required (Current)
Your existing code continues to work without any changes.

### Phase 2: Optional Optimization (Future)
Consider using composables for new components:

```typescript
// Instead of importing the full store
import { useCartStore } from '~/stores/cart'

// Consider using focused composables
import { useCartCore } from '~/composables/cart/useCartCore'
```

### Phase 3: Advanced Usage (Future)
For advanced use cases, you can access individual modules:

```typescript
const cartStore = useCartStore()

// Access specific modules for advanced functionality
const analytics = cartStore._modules.analytics
const security = cartStore._modules.security
```

## Common Patterns

### Adding Items with Error Handling
```typescript
// Before and After - same code!
try {
  await cartStore.addItem(product, quantity)
  // Success handling
} catch (error) {
  // Error handling
}
```

### Reactive Cart State
```typescript
// Before and After - same code!
const itemCount = computed(() => cartStore.itemCount)
const subtotal = computed(() => cartStore.subtotal)
const isEmpty = computed(() => cartStore.isEmpty)
```

### Cart Persistence
```typescript
// Before and After - same code!
await cartStore.saveToStorage()
await cartStore.loadFromStorage()
```

## New Features Available

### Enhanced Error Handling
```typescript
// More detailed error information
try {
  await cartStore.addItem(product, quantity)
} catch (error) {
  console.log(error.type)     // 'validation', 'inventory', etc.
  console.log(error.code)     // Specific error code
  console.log(error.retryable) // Whether operation can be retried
}
```

### Better TypeScript Support
```typescript
import type { Product, CartItem, CartError } from '~/stores/cart'

// Full type safety for all cart operations
```

### Composable Usage
```typescript
// Use cart functionality without Pinia dependency
import { useCartCore } from '~/composables/cart/useCartCore'

const cart = useCartCore()
// Same API as the store, but as a composable
```

## Troubleshooting

### Issue: Import Errors
```typescript
// ❌ Don't do this
import { useCartStore } from '~/stores/cart/index'

// ✅ Do this instead
import { useCartStore } from '~/stores/cart'
```

### Issue: Type Errors
```typescript
// ✅ Import types from the main module
import type { Product, CartItem } from '~/stores/cart'
```

### Issue: Module Not Found
Make sure you're importing from the correct path:
```typescript
// ✅ Correct
import { useCartStore } from '~/stores/cart'

// ❌ Incorrect
import { useCartStore } from '~/stores/cart.ts'
```

## Performance Improvements

### Bundle Size Reduction
- **Before**: Single 2,666-line file loaded entirely
- **After**: Modular system with code splitting

### Memory Usage
- **Before**: All cart functionality loaded at once
- **After**: Only needed modules loaded

### Caching Improvements
- **Before**: Basic caching
- **After**: Advanced caching with TTL and invalidation

## Testing Improvements

### Before
```typescript
// Hard to test specific functionality
import { useCartStore } from '~/stores/cart'
// Test entire store
```

### After
```typescript
// Test individual modules
import { useCartCore } from '~/stores/cart/core'
// Test only core functionality

// Or test via composables
import { useCartCore } from '~/composables/cart/useCartCore'
// Test composable interface
```

## Future Enhancements

The modular system enables future enhancements:

1. **Advanced Analytics**: Detailed cart behavior tracking
2. **Security Features**: Enhanced validation and fraud detection
3. **Offline Support**: Better offline cart functionality
4. **Performance Monitoring**: Real-time performance metrics
5. **A/B Testing**: Easy feature flag integration

## Getting Help

### Documentation
- Check the module-specific documentation in each file
- Review the comprehensive type definitions in `types.ts`
- Look at the test files for usage examples

### Support
- Create an issue if you encounter problems
- Check the migration guide for common solutions
- Review the test files for expected behavior

## Summary

The cart store refactoring provides:

✅ **Zero Breaking Changes** - Your code continues to work  
✅ **Better Performance** - Smaller bundles, faster loading  
✅ **Improved Maintainability** - Modular, focused code  
✅ **Enhanced Testing** - Better test coverage and isolation  
✅ **Future-Proof** - Easy to extend and modify  

The migration is designed to be seamless. You can continue using the cart store exactly as before while benefiting from the improved architecture under the hood.