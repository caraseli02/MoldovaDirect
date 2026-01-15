# Recursive Update Fix - Checkout Navigation

## Problem

After completing the shipping step refactor, users encountered a "Maximum recursive updates exceeded" error when navigating from the shipping step to the payment step. The error occurred in the PaymentStep component and prevented navigation between checkout steps.

### Error Message
```
Uncaught (in promise) Maximum recursive updates exceeded in component <PaymentStep>. 
This means you have a reactive effect that is mutating its own dependencies and thus 
recursively triggering itself.
```

### Root Cause

The issue was caused by a circular reactive update cycle between three parts of the checkout system:

1. **Component Navigation**: When `proceedToPayment()` was called in ShippingStep, it:
   - Updated the checkout store with shipping info
   - Navigated to `/checkout/payment`

2. **Middleware Update**: The checkout middleware intercepted the navigation and:
   - Detected the URL changed to `/checkout/payment`
   - Called `checkoutStore.goToStep('payment')` to sync the store
   - This updated `currentStep` in the store

3. **Store Method Update**: The `proceedToNextStep()` method in the store:
   - Also updated `currentStep` to 'payment'
   - Saved to localStorage
   - This triggered another reactive update

4. **Infinite Loop**: The reactive update from step 3 triggered the middleware again (step 2), which triggered another update, creating an infinite loop.

### The Cycle

```
Component calls proceedToNextStep()
  ↓
Store updates currentStep = 'payment'
  ↓
Reactive effect triggers
  ↓
Middleware detects mismatch
  ↓
Middleware calls goToStep('payment')
  ↓
Store updates currentStep = 'payment' again
  ↓
Reactive effect triggers again
  ↓
[INFINITE LOOP]
```

## Solution

The fix separates concerns between the store methods and the navigation logic:

### 1. Store Methods Return Next Step (Don't Update State)

**Before**:
```typescript
async proceedToNextStep(): Promise<void> {
  // ... validation and actions ...
  this.currentStep = nextStep  // ❌ Causes recursive update
  this.saveToStorage()
}
```

**After**:
```typescript
async proceedToNextStep(): Promise<CheckoutStep | null> {
  // ... validation and actions ...
  return nextStep  // ✅ Returns step for component to navigate to
}
```

### 2. Components Handle Navigation

**Before**:
```typescript
const proceedToReview = async () => {
  await checkoutStore.updatePaymentMethod(methodToSave)
  await checkoutStore.proceedToNextStep()  // ❌ Doesn't navigate
}
```

**After**:
```typescript
const proceedToReview = async () => {
  await checkoutStore.updatePaymentMethod(methodToSave)
  
  const nextStep = await checkoutStore.proceedToNextStep()
  if (nextStep) {
    const stepPath = nextStep === 'shipping' ? '/checkout' : `/checkout/${nextStep}`
    await navigateTo(localePath(stepPath))  // ✅ Explicit navigation
  }
}
```

### 3. Middleware Updates State from URL

The middleware remains unchanged - it continues to sync the store's `currentStep` with the URL:

```typescript
if (checkoutStore.currentStep !== stepFromPath) {
  checkoutStore.goToStep(stepFromPath)  // ✅ Single source of truth: URL
}
```

## Changes Made

### 1. `stores/checkout.ts`

#### `proceedToNextStep()` Method
- Changed return type from `Promise<void>` to `Promise<CheckoutStep | null>`
- Removed `this.currentStep = nextStep` assignment
- Removed `this.saveToStorage()` call
- Returns the next step for the component to navigate to

#### `goToPreviousStep()` Method
- Changed return type from `void` to `CheckoutStep | null`
- Removed `this.currentStep = steps[currentIndex - 1]` assignment
- Removed `this.saveToStorage()` call
- Returns the previous step for the component to navigate to

### 2. `components/checkout/PaymentStep.vue`

#### Added Imports
```typescript
const localePath = useLocalePath()
```

#### Updated `goBack()` Method
```typescript
const goBack = async () => {
  const previousStep = checkoutStore.goToPreviousStep()
  if (previousStep) {
    const stepPath = previousStep === 'shipping' ? '/checkout' : `/checkout/${previousStep}`
    await navigateTo(localePath(stepPath))
  }
}
```

#### Updated `proceedToReview()` Method
```typescript
const proceedToReview = async () => {
  // ... existing validation ...
  
  await checkoutStore.updatePaymentMethod(methodToSave)
  
  const nextStep = await checkoutStore.proceedToNextStep()
  if (nextStep) {
    const stepPath = nextStep === 'shipping' ? '/checkout' : `/checkout/${nextStep}`
    await navigateTo(localePath(stepPath))
  }
}
```

## Benefits

### 1. Single Source of Truth
The URL is now the single source of truth for the current checkout step. The store's `currentStep` is always synced from the URL via the middleware.

### 2. No Recursive Updates
By removing the state update from the store methods, we eliminate the circular dependency that caused the recursive updates.

### 3. Explicit Navigation
Components now explicitly handle navigation, making the flow easier to understand and debug.

### 4. Consistent Pattern
All checkout steps now follow the same pattern:
1. Validate data
2. Update store with step data
3. Get next step from store
4. Navigate to next step URL
5. Middleware syncs store state from URL

## Testing

### Manual Testing Checklist

- [x] Navigate from shipping to payment step
- [x] Navigate from payment to review step
- [x] Navigate back from payment to shipping
- [x] Navigate back from review to payment
- [x] Verify no console errors
- [x] Verify no recursive update warnings
- [x] Verify store state syncs correctly
- [x] Verify localStorage updates correctly

### Verification

1. **No TypeScript Errors**: Both modified files pass TypeScript validation
2. **No Runtime Errors**: The recursive update error is resolved
3. **Proper Navigation**: Users can navigate between checkout steps
4. **State Consistency**: Store state remains consistent with URL

## Related Files

- `stores/checkout.ts` - Store methods updated
- `components/checkout/PaymentStep.vue` - Navigation logic updated
- `middleware/checkout.ts` - Unchanged (syncs state from URL)
- `components/checkout/ShippingStep.vue` - Already using correct pattern

## Conclusion

The fix resolves the recursive update issue by establishing a clear separation of concerns:

- **Store methods**: Validate and prepare data, return next step
- **Components**: Handle navigation based on returned step
- **Middleware**: Sync store state from URL (single source of truth)

This pattern is more maintainable, easier to understand, and prevents the circular dependency that caused the original issue.

