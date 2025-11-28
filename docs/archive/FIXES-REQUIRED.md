# Required Fixes for Express Checkout Banner

## Overview
This document provides the exact code changes needed to make the Express Checkout Banner feature functional.

**Estimated Time:** 30 minutes  
**Priority:** CRITICAL  
**Files to Modify:** 2

---

## Fix #1: Make Checkout Middleware Async

### File
`/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/middleware/checkout.ts`

### Current Code (Line 11)
```typescript
export default defineNuxtRouteMiddleware((to) => {
  const localePath = useLocalePath()
  const { items, itemCount } = useCart()
  const checkoutStore = useCheckoutStore()
  
  // ... more code ...
  
  // Line 60 - This causes error because function is not async
  await checkoutStore.prefetchCheckoutData()
  
  // ... rest of middleware
})
```

### Fixed Code
```typescript
export default defineNuxtRouteMiddleware(async (to) => {  // ADD async HERE
  const localePath = useLocalePath()
  const { items, itemCount } = useCart()
  const checkoutStore = useCheckoutStore()
  
  // ... more code ...
  
  // Line 60 - Now this works correctly
  await checkoutStore.prefetchCheckoutData()
  
  // ... rest of middleware
})
```

### Change Required
**Line 11:** Change `(to) => {` to `async (to) => {`

---

## Fix #2: Add Missing Computed Properties to useShippingAddress

### File
`/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/composables/useShippingAddress.ts`

### Location
Add these computed properties before the `return` statement (around line 150)

### Code to Add

```typescript
/**
 * Get the default address from saved addresses
 * Prioritizes address marked as default, otherwise returns first address
 */
const defaultAddress = computed(() => {
  if (savedAddresses.value.length === 0) {
    return null
  }
  
  // Find address marked as default
  const defaultAddr = savedAddresses.value.find(addr => addr.is_default)
  if (defaultAddr) {
    return defaultAddr
  }
  
  // Fallback to first address if no default is set
  return savedAddresses.value[0]
})

/**
 * Check if user has any saved addresses
 */
const hasAddresses = computed(() => 
  savedAddresses.value.length > 0
)
```

### Update Return Statement

Find the current return statement (around line 150-160):

**Current:**
```typescript
return {
  shippingAddress,
  savedAddresses: readonly(savedAddresses),
  loading: readonly(loading),
  error: readonly(error),
  isAddressValid: readonly(isAddressValid),
  loadSavedAddresses,
  handleSaveAddress,
  loadFromStore,
  formatAddress,
  reset
}
```

**Updated:**
```typescript
return {
  shippingAddress,
  savedAddresses: readonly(savedAddresses),
  defaultAddress: readonly(defaultAddress),  // ADD THIS LINE
  hasAddresses: readonly(hasAddresses),      // ADD THIS LINE
  loading: readonly(loading),
  error: readonly(error),
  isAddressValid: readonly(isAddressValid),
  loadSavedAddresses,
  handleSaveAddress,
  loadFromStore,
  formatAddress,
  reset
}
```

---

## Post-Fix Steps

### 1. Clear Nuxt Cache
After applying fixes, clear the Nuxt cache to ensure changes take effect:

```bash
pkill -9 node && rm -rf .nuxt node_modules/.vite .output && npm run dev
```

### 2. Re-run Visual Regression Test
Execute the test script to verify the banner now appears:

```bash
node test-express-checkout.mjs
```

### 3. Manual Verification Checklist

- [ ] Dev server starts without errors
- [ ] No 500 errors in console when navigating to `/checkout`
- [ ] Middleware no longer throws import errors
- [ ] User can sign in successfully
- [ ] First checkout visit: No express banner (expected)
- [ ] Fill shipping form with "Save this address" checked
- [ ] Select shipping method
- [ ] Return to `/checkout`: Express banner SHOULD appear
- [ ] Banner displays saved address correctly
- [ ] Banner displays preferred shipping method
- [ ] "Use Express Checkout" button works
- [ ] Clicking button pre-populates form or redirects to payment
- [ ] "Edit Details" button dismisses banner
- [ ] Form can still be filled manually if needed

---

## Complete Fixed Files

### middleware/checkout.ts (FULL FILE)

```typescript
/**
 * Checkout middleware for protecting checkout routes and validating checkout state
 *
 * Requirements addressed:
 * - 1.1: Redirect to checkout from cart with items validation
 * - 1.2: Prevent access to checkout with empty cart
 * - 6.1: Mobile-responsive checkout protection
 * - 6.5: Clear progress indicators and navigation protection
 */

export default defineNuxtRouteMiddleware(async (to) => {  // ← CHANGED: Added async
  const localePath = useLocalePath()
  const { items, itemCount } = useCart()
  const checkoutStore = useCheckoutStore()

  // Extract the checkout step from path first
  const stepFromPath = extractStepFromPath(to.path)

  // Skip ALL validation for confirmation page - order is done, cart is cleared
  if (stepFromPath === 'confirmation') {
    return
  }

  // Check if cart has items
  if (itemCount.value === 0) {
    return navigateTo({
      path: localePath('/cart'),
      query: {
        message: 'empty-cart-checkout'
      }
    })
  }

  // Initialize checkout if not already initialized
  if (!checkoutStore.sessionId) {
    try {
      checkoutStore.initializeCheckout(items.value)
    } catch (error) {
      console.error('Failed to initialize checkout:', error)
      return navigateTo({
        path: localePath('/cart'),
        query: {
          message: 'checkout-initialization-failed'
        }
      })
    }
  }

  // Prefetch all checkout data in parallel
  if (!checkoutStore.dataPrefetched) {
    try {
      await checkoutStore.prefetchCheckoutData()  // ← Now works with async
    } catch (error) {
      console.error('Failed to prefetch checkout data:', error)
    }
  }

  // Validate checkout session hasn't expired
  if (checkoutStore.isSessionExpired) {
    checkoutStore.resetCheckout()
    return navigateTo({
      path: localePath('/cart'),
      query: {
        message: 'checkout-session-expired'
      }
    })
  }

  // Step-specific validations
  if (stepFromPath) {
    if (!canAccessStep(stepFromPath, checkoutStore)) {
      const allowedStep = getHighestAllowedStep(checkoutStore)
      const redirectPath = getStepPath(allowedStep, localePath)
      return navigateTo({
        path: redirectPath,
        query: {
          message: 'step-access-denied'
        }
      })
    }
    
    if (checkoutStore.currentStep !== stepFromPath) {
      checkoutStore.goToStep(stepFromPath)
    }
  }
})

// Helper functions remain unchanged
function extractStepFromPath(path: string): CheckoutStep | null {
  if (path.includes('/checkout/shipping')) return 'shipping'
  if (path.includes('/checkout/payment')) return 'payment'
  if (path.includes('/checkout/review')) return 'review'
  if (path.includes('/checkout/confirmation')) return 'confirmation'
  if (path.includes('/checkout')) return 'shipping'
  return null
}

function canAccessStep(step: CheckoutStep, store: any): boolean {
  switch (step) {
    case 'shipping':
      return true
    case 'payment':
      return store.canProceedToPayment
    case 'review':
      return store.canProceedToReview
    case 'confirmation':
      return store.currentStep === 'confirmation' ||
             store.currentStep === 'review' ||
             Boolean(store.orderData?.orderId)
    default:
      return false
  }
}

function getHighestAllowedStep(store: any): CheckoutStep {
  if (store.canCompleteOrder && store.orderData?.orderId) {
    return 'confirmation'
  } else if (store.canProceedToReview) {
    return 'review'
  } else if (store.canProceedToPayment) {
    return 'payment'
  } else {
    return 'shipping'
  }
}

function getStepPath(step: CheckoutStep, localePath: (path: string) => string): string {
  switch (step) {
    case 'shipping':
      return localePath('/checkout')
    case 'payment':
      return localePath('/checkout/payment')
    case 'review':
      return localePath('/checkout/review')
    case 'confirmation':
      return localePath('/checkout/confirmation')
    default:
      return localePath('/checkout')
  }
}

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation'
```

---

## Testing After Fixes

### Expected Console Output (Should be clean)
```
✓ No 500 errors
✓ No middleware import errors
✓ No "Failed to fetch dynamically imported module" errors
```

### Expected Visual Behavior

**First Visit:**
```
User → /checkout
↓
Standard form (no banner)
```

**Return Visit:**
```
User → /checkout
↓
Express Checkout Banner appears!
  ⚡ Express Checkout Available
  [Saved address displayed]
  [Use Express Checkout] button
```

---

## Verification Commands

### 1. Check TypeScript Compilation
```bash
npm run type-check
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Check for Errors
Open browser console and navigate to:
- http://localhost:3001/checkout (should load without 500 errors)

### 4. Run Automated Test
```bash
node test-express-checkout.mjs
```

Look for this in test output:
```
✅ EXPRESS CHECKOUT BANNER DETECTED!
✓ Banner element count: 1
✓ "Use Express Checkout" button found
```

---

## Rollback Plan

If fixes cause issues, revert using:

```bash
git diff HEAD middleware/checkout.ts
git diff HEAD composables/useShippingAddress.ts

# If needed:
git checkout HEAD middleware/checkout.ts
git checkout HEAD composables/useShippingAddress.ts
```

---

## Additional Improvements (Optional)

### Add TypeScript Types

In `composables/useShippingAddress.ts`, add return type:

```typescript
export function useShippingAddress(): {
  shippingAddress: Ref<Address>
  savedAddresses: Readonly<Ref<Address[]>>
  defaultAddress: Readonly<Ref<Address | null>>  // ADD THIS
  hasAddresses: Readonly<Ref<boolean>>           // ADD THIS
  loading: Readonly<Ref<boolean>>
  error: Readonly<Ref<string | null>>
  isAddressValid: Readonly<Ref<boolean>>
  loadSavedAddresses: () => Promise<void>
  handleSaveAddress: (address: Address) => Promise<void>
  loadFromStore: () => void
  formatAddress: (address: Address) => string
  reset: () => void
}
```

### Add Missing i18n Keys

In all locale files (`i18n/locales/es.json`, `en.json`, `ro.json`, `ru.json`):

```json
{
  "checkout": {
    "expressCheckout": {
      "title": "Express Checkout Available",
      "description": "Use your saved address and preferences for a faster checkout experience.",
      "preferredShipping": "Preferred shipping",
      "useButton": "Use Express Checkout",
      "editButton": "Edit Details",
      "success": "Express checkout activated",
      "successDetails": "Your saved details have been loaded",
      "addressLoaded": "Address loaded",
      "selectShipping": "Please select a shipping method"
    }
  },
  "products": {
    "quickViewProduct": "Quick View",
    "addProductToCart": "Add to Cart"
  }
}
```

---

## Success Criteria

### ✅ Fixes are successful when:

1. Dev server starts without errors
2. No 500 errors when navigating to `/checkout`
3. No middleware import errors in console
4. Express Checkout Banner appears for returning users
5. Banner displays saved address
6. Banner displays preferred shipping method
7. "Use Express Checkout" button works
8. Form pre-populates or redirects to payment
9. Manual form entry still works
10. All visual regression tests pass

---

**Document Created:** 2025-11-23  
**Priority:** CRITICAL  
**Estimated Fix Time:** 30 minutes  
**Testing Time:** 20 minutes  
**Total Time:** ~50 minutes
