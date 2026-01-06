# SSR Error Fix Summary

## Problem

When accessing `/checkout`, the application returned a 500 error with:

```
H3Error: useCartStore is not defined
at middleware/checkout.ts:35
```

This occurred even after wrapping store access in `import.meta.client` blocks.

## Root Cause

**Nuxt 4 Execution Order**: Middleware executes BEFORE plugins initialize Pinia stores

```
1. SSR starts
2. Middleware runs (checkout.ts) ❌ useCartStore() called here
3. Plugins initialize (cart.client.ts initializes Pinia)
4. Components render
```

Even with `import.meta.client`, the middleware runs before Pinia is ready.

## Solution

### Created Plugin-Based Route Guard

**File**: `plugins/checkout-guard.client.ts`

Instead of using middleware, use `addRouteMiddleware()` inside a plugin:

```typescript
export default defineNuxtPlugin({
  name: 'checkout-guard',
  dependsOn: ['cart'], // Ensure cart plugin loads first

  setup() {
    addRouteMiddleware('checkout', async (to) => {
      // Store access is now safe - plugins have initialized
      const cartStore = useCartStore() // ✅ Works!
      // ... validation logic
    }, { global: true })
  }
})
```

### Updated Cart Plugin

**File**: `plugins/cart.client.ts`

Added explicit name for plugin dependency:

```typescript
export default defineNuxtPlugin({
  name: 'cart', // ✅ Added name for dependsOn

  setup(nuxtApp) {
    // ... cart initialization
  }
})
```

## Changes Made

### 1. plugins/checkout-guard.client.ts (NEW)
- Created plugin-based route guard
- Moved all checkout validation logic from middleware
- Uses `dependsOn: ['cart']` to ensure load order
- Global route guard with `{ global: true }`

### 2. plugins/cart.client.ts (UPDATED)
- Added `name: 'cart'` property
- Changed from `defineNuxtPlugin((nuxtApp) => {})` to object syntax
- No functional changes to cart logic

### 3. stores/cart/index.ts (FIXED EARLIER)
- Fixed cart deserialization to use proper API methods
- Cart persistence now works correctly across navigations

## Execution Order (FIXED)

```
1. SSR starts
2. Plugins initialize
   - cart.client.ts (name: 'cart') initializes Pinia
   - checkout-guard.client.ts (dependsOn: ['cart']) registers middleware
3. Route middleware runs (from plugin)
   - ✅ useCartStore() is now available
4. Components render
```

## Testing

### Direct Access Test
```bash
curl -s http://localhost:3000/checkout | grep -E "(500|useCartStore|H3Error)"
```

**Result**: ✅ No SSR errors, checkout page renders successfully

### Visual Confirmation
Screenshot shows checkout page loads without 500 error

## Old Middleware Status

**File**: `middleware/checkout.ts`

This file still exists but may be redundant now. The plugin-based guard (`plugins/checkout-guard.client.ts`) handles all the same validation logic.

**Decision Needed**:
- Remove `middleware/checkout.ts` entirely, OR
- Simplify it to only handle SSR redirects (non-store logic)

## Key Learnings

1. **Nuxt 4 Middleware Timing**: Middleware runs BEFORE plugins, even with `import.meta.client`
2. **Plugin-based Guards**: Use `addRouteMiddleware()` inside plugins for store-dependent validation
3. **Plugin Dependencies**: Use `dependsOn` array to control plugin load order
4. **Named Plugins**: Plugins must have `name` property to be referenced in `dependsOn`

## Files Modified

- ✅ `plugins/checkout-guard.client.ts` (created)
- ✅ `plugins/cart.client.ts` (updated - added name)
- ✅ `stores/cart/index.ts` (fixed deserialization earlier)
- ⏳ `middleware/checkout.ts` (pending cleanup decision)

## Status

✅ **SSR Error**: FIXED
✅ **Cart Persistence**: FIXED
✅ **Plugin Dependencies**: FIXED
⏳ **Middleware Cleanup**: PENDING

---

**Date**: 2025-11-26
**Issue**: SSR error on checkout page access
**Resolution**: Plugin-based route guard instead of middleware
