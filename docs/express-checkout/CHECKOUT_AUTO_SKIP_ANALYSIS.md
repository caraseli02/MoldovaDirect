# Checkout Auto-Skip Analysis

## Executive Summary

**Current State**: Auto-skip functionality is **NOT implemented** in the checkout flow.

**What Exists**: An ExpressCheckoutBanner component that allows users to manually activate express checkout, but NO automatic step skipping when users have saved data.

**What's Missing**: Logic to automatically detect saved user data and skip completed steps in the checkout flow.

---

## Architecture Overview

### Current Checkout Flow Structure

```
/checkout (index.vue) → ShippingStep.vue
/checkout/payment → PaymentStep.vue
/checkout/review → ReviewStep.vue
/checkout/confirmation → ConfirmationStep.vue
```

### Key Components Analyzed

1. **Middleware** (`middleware/checkout.ts`)
2. **Plugin Guard** (`plugins/checkout-guard.client.ts`)
3. **Checkout Store** (`stores/checkout.ts`)
4. **Session Store** (`stores/checkout/session.ts`)
5. **ShippingStep Component** (`components/checkout/ShippingStep.vue`)
6. **PaymentStep Component** (`components/checkout/PaymentStep.vue`)
7. **ExpressCheckoutBanner** (`components/checkout/ExpressCheckoutBanner.vue`)
8. **Composables** (`composables/useShippingAddress.ts`)

---

## Current State Analysis

### 1. What Currently Exists

#### ExpressCheckoutBanner Component
**Location**: `/components/checkout/ExpressCheckoutBanner.vue`

**Functionality**:
- Shows a banner to authenticated users with saved addresses
- Allows users to **manually** click "Use Express Checkout"
- Pre-populates shipping info when clicked
- Optionally navigates to payment step if shipping method is available

**Trigger**: Displayed when `user && defaultAddress && !expressCheckoutDismissed`

**Problem**: This is a MANUAL action, not automatic step skipping.

```vue
<!-- ShippingStep.vue lines 16-22 -->
<ExpressCheckoutBanner
  v-if="user && defaultAddress && !expressCheckoutDismissed"
  :default-address="defaultAddress"
  :preferred-shipping-method="checkoutStore.preferences?.preferred_shipping_method"
  @use-express="handleExpressCheckout"
  @dismiss="handleExpressCheckoutDismiss"
/>
```

#### Data Detection Logic
**Location**: `composables/useShippingAddress.ts`

**Capabilities**:
- `hasAddresses` - Detects if user has saved addresses
- `defaultAddress` - Retrieves default address
- `loadSavedAddresses()` - Fetches saved addresses from API

**Location**: `stores/checkout.ts`

**Capabilities**:
- `prefetchCheckoutData()` - Fetches user addresses and preferences
- `canProceedToPayment` - Validates if shipping step is complete
- `canProceedToReview` - Validates if payment step is complete

#### Navigation Logic
**Location**: `middleware/checkout.ts` and `plugins/checkout-guard.client.ts`

**Current Behavior**:
- Validates cart has items
- Initializes checkout session
- Prefetches checkout data
- Enforces step access control (can't skip to payment without shipping)
- **DOES NOT auto-skip steps**

**Step Access Control**:
```typescript
// Lines 131-149 from checkout-guard.client.ts
function canAccessStep(step: CheckoutStep, store: any): boolean {
  switch (step) {
    case 'shipping':
      return true // Always accessible
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
```

This only **prevents** skipping forward, but doesn't **enable** auto-skipping.

---

### 2. What's NOT Implemented

#### Missing: Auto-Skip Detection Logic

**No logic exists to**:
1. Detect when user has complete shipping info saved
2. Detect when user has saved payment method
3. Automatically navigate past completed steps
4. Determine which step should be the "landing step" based on saved data

#### Missing: Smart Entry Point

**Current behavior**:
- User always lands on `/checkout` (shipping step)
- No intelligence to redirect to `/checkout/payment` or `/checkout/review`

**Expected behavior**:
- If shipping complete → redirect to `/checkout/payment`
- If shipping + payment complete → redirect to `/checkout/review`
- Otherwise → stay on `/checkout`

#### Missing: Auto-Population on Mount

**Current behavior** (ShippingStep.vue lines 277-284):
```typescript
// Auto-select default address if no address is currently set
if (defaultAddress.value && !shippingAddress.value.street) {
  shippingAddress.value = { ...defaultAddress.value }
  // Load shipping methods since we have a valid address
  if (shippingAddress.value.country && shippingAddress.value.postalCode) {
    loadShippingMethods()
  }
}
```

This auto-populates the form, but **doesn't auto-skip the step**.

---

## Where Auto-Skip Logic Should Be Added

### Recommended Implementation Approach

#### Option 1: Plugin-Based Auto-Skip (Recommended)

**Location**: `plugins/checkout-guard.client.ts`

**Why**:
- Runs after Pinia initialization
- Has access to all stores
- Can intercept route navigation
- Can make async calls to fetch data

**Implementation**:
```typescript
// In plugins/checkout-guard.client.ts after line 82

// 7. Auto-skip logic for users with saved data
if (!stepFromPath || stepFromPath === 'shipping') {
  // Only apply auto-skip when navigating to base checkout or shipping
  const shouldAutoSkip = await checkShouldAutoSkip(checkoutStore, to)

  if (shouldAutoSkip.skip) {
    const targetStep = shouldAutoSkip.targetStep
    const redirectPath = getStepPath(targetStep, localePath)

    console.log(`🛒 [Checkout Guard] Auto-skipping to ${targetStep}`)

    return navigateTo({
      path: redirectPath,
      query: { autoSkipped: 'true' }
    })
  }
}
```

**Helper Function**:
```typescript
async function checkShouldAutoSkip(
  store: any,
  route: any
): Promise<{ skip: boolean; targetStep: CheckoutStep | null }> {
  // Don't auto-skip if user explicitly navigated or dismissed auto-skip
  if (route.query.autoSkipped === 'false' || route.query.manual === 'true') {
    return { skip: false, targetStep: null }
  }

  // Check if shipping is complete
  const hasShipping = store.canProceedToPayment
  const hasPayment = store.canProceedToReview

  if (hasPayment) {
    // Both shipping and payment complete → go to review
    return { skip: true, targetStep: 'review' }
  } else if (hasShipping) {
    // Only shipping complete → go to payment
    return { skip: true, targetStep: 'payment' }
  }

  return { skip: false, targetStep: null }
}
```

#### Option 2: Component-Level Auto-Skip

**Location**: `components/checkout/ShippingStep.vue` and `PaymentStep.vue`

**Why**:
- Simpler to implement
- Component-specific logic
- Can show loading state during skip

**Implementation** (ShippingStep.vue):
```typescript
onMounted(async () => {
  // ... existing code ...

  // Auto-skip logic
  if (user.value && defaultAddress.value && selectedMethod.value) {
    // User has complete shipping info
    console.log('Auto-skipping shipping step - data already saved')

    // Update store with saved data
    const shippingInfo: ShippingInformation = {
      address: defaultAddress.value,
      method: selectedMethod.value,
      instructions: shippingInstructions.value || undefined
    }

    await checkoutStore.updateShippingInfo(shippingInfo)

    // Navigate to payment
    await navigateTo(localePath('/checkout/payment'))
  }
})
```

#### Option 3: Middleware-Based Auto-Skip

**Location**: `middleware/checkout.ts`

**Why**:
- Centralized logic
- Runs before component mount
- Can handle all steps in one place

**Problem**:
- Middleware runs on EVERY navigation
- Might cause redirect loops if not careful
- Less flexible than plugin approach

---

## Compliance Check

### Architectural Principles

#### ✅ Maintained
- **Single Responsibility**: Each component/composable has clear purpose
- **Separation of Concerns**: Store handles state, components handle UI
- **DRY Principle**: Logic is reusable via composables

#### ⚠️ Potential Violations with Auto-Skip
- **Navigation Coupling**: Auto-skip logic tightly couples data state to navigation
- **Component Lifecycle**: Auto-skip in `onMounted` can cause race conditions
- **User Agency**: Automatically skipping might confuse users who want to review/edit

#### ✅ Best Practices Followed
- **Lazy Loading**: Components use `defineAsyncComponent`
- **Type Safety**: TypeScript types for all data structures
- **Error Handling**: Try-catch blocks for async operations

---

## Risk Analysis

### Technical Risks

1. **Redirect Loops**
   - Auto-skip could cause infinite redirects if not properly guarded
   - **Mitigation**: Use query params like `?autoSkipped=true` to prevent re-skip

2. **Race Conditions**
   - Data might not be loaded when auto-skip logic runs
   - **Mitigation**: Ensure `prefetchCheckoutData()` completes before checking

3. **Session Restore Issues**
   - Restored session data might be stale or incomplete
   - **Mitigation**: Validate data completeness, not just existence

4. **Navigation State Conflicts**
   - Store's `currentStep` might not match actual route
   - **Mitigation**: Sync route and store state atomically

### User Experience Risks

1. **Confusion**
   - Users might want to review/edit their saved data
   - **Mitigation**: Show notification: "Skipped to payment - your saved address was loaded"

2. **Loss of Control**
   - Users feel the app is "doing things" without their permission
   - **Mitigation**: Add "Review Details" link in notification

3. **Accessibility**
   - Screen reader users might miss the skip
   - **Mitigation**: Announce skip via ARIA live region

---

## Recommended Implementation Strategy

### Phase 1: Detection (No Auto-Skip Yet)

1. Add detection logic to identify complete steps
2. Log to console when auto-skip would trigger
3. Add UI indicator showing "We can skip this for you"
4. Collect user feedback

### Phase 2: Opt-In Auto-Skip

1. Implement ExpressCheckoutBanner enhancement
2. When user clicks "Use Express Checkout", skip ALL completed steps
3. Navigate directly to first incomplete step
4. Show success notification with what was skipped

### Phase 3: Smart Auto-Skip (Optional)

1. Add user preference: "Always use express checkout"
2. Store preference in user settings
3. Auto-skip only for users who opted in
4. Add "Edit Details" link on each step for opted-in users

---

## Implementation Priority

### High Priority (Phase 2)
- Enhance ExpressCheckoutBanner to skip to first incomplete step
- Show clear notification of what was auto-populated
- Add "Review Details" link

### Medium Priority (Phase 3)
- Add user preference for auto-skip
- Implement middleware-based auto-skip for opted-in users
- Add analytics to track skip rates

### Low Priority
- Full automatic skip on every checkout entry
- Predictive pre-population (AI-based)

---

## Code Locations Reference

### Files to Modify

1. **`plugins/checkout-guard.client.ts`**
   - Add auto-skip logic after data prefetch
   - Lines 75-82 (after prefetchCheckoutData)

2. **`components/checkout/ExpressCheckoutBanner.vue`**
   - Enhance to navigate to first incomplete step
   - Lines 103-150 (useExpressCheckout method)

3. **`stores/checkout.ts`**
   - Add helper methods:
     - `getFirstIncompleteStep(): CheckoutStep`
     - `isStepComplete(step: CheckoutStep): boolean`

4. **`i18n/locales/*.json`**
   - Add translation keys:
     - `checkout.autoSkip.notification`
     - `checkout.autoSkip.reviewDetails`

### Files to Read (for context)

1. **`composables/useShippingAddress.ts`**
   - Already has `hasAddresses` and `defaultAddress`

2. **`stores/checkout/session.ts`**
   - Has `canProceedToPayment` and `canProceedToReview`

---

## Conclusion

**Current State**: No auto-skip functionality exists. ExpressCheckoutBanner provides manual express checkout.

**What's Missing**: Automatic detection and navigation past completed steps.

**Recommended Approach**: Implement Phase 2 (Opt-In Auto-Skip via ExpressCheckoutBanner enhancement) first, then evaluate Phase 3 based on user feedback.

**Architecture Impact**: Low - can be implemented without violating existing patterns. Use composables for detection logic, plugin for navigation interception.

**Estimated Effort**:
- Phase 1: 2-4 hours
- Phase 2: 4-8 hours
- Phase 3: 8-16 hours

---

**Generated**: 2025-11-27
**Status**: Analysis Complete
**Next Action**: Decide on implementation phase and priority
