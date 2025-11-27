# Checkout Confirmation Flow Diagram

## Complete Order Flow (Success Path)

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER COMPLETES CHECKOUT                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  processPayment() - stores/checkout/payment.ts (line 421)       │
│  - Validates prerequisites                                       │
│  - Sets processing = true                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  processPaymentByType() - line 165                              │
│  - Handles cash/credit_card/paypal/bank_transfer                │
│  - Returns payment result                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  createOrderRecord() - line 310                                 │
│  - Creates order in database                                     │
│  - Receives orderId and orderNumber from API                    │
│  - Updates orderData in session store                           │
│  - RETURNS fresh orderData object                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  completeCheckout(completedOrderData) - line 374                │
│  - Receives orderData as PARAMETER (not from store ref)         │
│  - setCurrentStep('confirmation')                               │
│  - persist({ orderData: completedOrderData }) ← KEY FIX         │
│  - Shows success toast                                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  persist() - stores/checkout/session.ts (line 210)              │
│  🔍 Debug logs:                                                 │
│  - "hasPayloadOrderData: true"                                  │
│  - "orderId: abc-123..."                                        │
│  - "orderNumber: ORD-20251121-001"                              │
│  - Saves to checkout-session cookie                            │
│  ✅ "Cookie saved successfully"                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Navigation to /checkout/confirmation                            │
│  - Router navigates to confirmation page                         │
│  - Cart still has items (not cleared yet)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Middleware runs - middleware/checkout.ts (line 21)             │
│  - extractStepFromPath() returns 'confirmation'                 │
│  - Middleware RETURNS EARLY (line 22)                           │
│  - NO cart validation, NO session check                         │
│  - Allows access to confirmation page                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Page SSR renders - pages/checkout/confirmation.vue             │
│  - orderData exists in Pinia store (from memory)                │
│  - Shows success icon, order number                             │
│  - BUT: currentStep may be undefined during SSR                 │
│  - Progress indicator shows 0% briefly (hydration mismatch)     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Client-side hydration + onMounted() - line 298                 │
│  - Checks: if (!orderData.value) → FALSE (data exists)          │
│  - Logs: "OrderData already in memory, skipping restore"        │
│  - Sets currentStep = 'confirmation' (line 309)                 │
│  - Calls cartStore.clearCart() (line 321)                       │
│  - Logs: "Cart cleared after order confirmation"                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ✅ SUCCESS STATE                              │
│  - User sees order confirmation                                 │
│  - Order number displayed                                        │
│  - Order details shown (items, shipping, totals)                │
│  - Cart is now empty                                             │
│  - Session data in cookie (valid for 30 min)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Direct URL Access (No orderData)

```
┌─────────────────────────────────────────────────────────────────┐
│  User navigates to /checkout/confirmation                        │
│  - No prior checkout session                                     │
│  - No orderData in memory                                        │
│  - No cookie or expired cookie                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Middleware runs - middleware/checkout.ts                        │
│  - stepFromPath = 'confirmation'                                 │
│  - RETURNS EARLY (exempt from validation)                        │
│  - Allows page to load                                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Page SSR renders                                                │
│  - No orderData in store                                         │
│  - v-if="orderData" evaluates to FALSE                          │
│  - Shows v-else: Loading spinner (line 175)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Client-side: onMounted() - line 298                            │
│  - Checks: if (!orderData.value) → TRUE                         │
│  - Logs: "No orderData in memory, attempting restore"           │
│  - Calls: await checkoutStore.restore()                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  restore() - stores/checkout/session.ts (line 244)              │
│  - Reads: checkoutCookie.value                                   │
│  - Result: null (no cookie exists)                               │
│  - Returns: null                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Back in onMounted() - line 312                                  │
│  - Checks: if (!orderData.value) → still TRUE                   │
│  - Logs: "No order data found even after restore"               │
│  - Calls: navigateTo(localePath('/cart'))                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ⚠️ CURRENT UX ISSUE                          │
│  - User saw loading spinner (no timeout)                         │
│  - No error message shown                                        │
│  - Silent redirect to /cart                                      │
│  - User confused: "What happened?"                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Page Refresh (With Valid Cookie)

```
┌─────────────────────────────────────────────────────────────────┐
│  User refreshes /checkout/confirmation                           │
│  - Cookie still valid (< 30 min old)                             │
│  - orderData exists in cookie                                    │
│  - Pinia store reset (fresh page load)                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Middleware runs                                                  │
│  - Exempt from validation                                         │
│  - Allows access                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Page SSR renders                                                │
│  - No orderData in memory (store reset)                          │
│  - Shows loading spinner                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  onMounted() - line 298                                          │
│  - Checks: if (!orderData.value) → TRUE                         │
│  - Logs: "No orderData in memory, attempting restore"           │
│  - Calls: await checkoutStore.restore()                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  restore() - line 244                                            │
│  - Reads: checkoutCookie.value                                   │
│  - Cookie found with orderData                                   │
│  - Sets: state.orderData = snapshot.orderData                   │
│  - Returns: { shippingInfo, paymentMethod }                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Back in onMounted() - line 312                                  │
│  - Checks: if (!orderData.value) → FALSE (restored!)            │
│  - Sets: currentStep = 'confirmation'                           │
│  - Clears cart (if still has items)                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ✅ SUCCESS STATE                              │
│  - Page re-renders with orderData                               │
│  - Shows order details again                                     │
│  - User can view confirmation after refresh                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Fix Explanation

### Before (Bug):
```typescript
// completeCheckout() - OLD CODE
async function completeCheckout(): Promise<void> {
  session.persist({
    shippingInfo: shipping.shippingInfo.value,
    paymentMethod: paymentMethod.value,
    orderData: orderData.value  // ← Stale ref! May be empty
  })
}
```

Problem: `orderData.value` was a reactive ref that hadn't updated yet when persist() was called.

### After (Fixed):
```typescript
// completeCheckout() - NEW CODE
async function completeCheckout(completedOrderData: OrderData): Promise<void> {
  session.persist({
    shippingInfo: shipping.shippingInfo.value,
    paymentMethod: paymentMethod.value,
    orderData: completedOrderData  // ← Fresh data passed as parameter!
  })
}

// Called from processPayment()
const completedOrderData = await createOrderRecord(paymentResult)
await completeCheckout(completedOrderData)  // Pass fresh data directly
```

Solution: Pass orderData as a function parameter, ensuring fresh data is always persisted.

---

## Cookie Structure

```typescript
// Saved in: checkout-session cookie
{
  sessionId: "checkout_1732206896518_abc123def",
  currentStep: "confirmation",
  guestInfo: { email: "user@example.com", emailUpdates: true },
  contactEmail: "user@example.com",
  orderData: {  // ← This is what confirmation page needs!
    orderId: "550e8400-e29b-41d4-a716-446655440000",
    orderNumber: "ORD-20251121-001",
    customerEmail: "user@example.com",
    items: [...],
    subtotal: 29.99,
    shippingCost: 5.00,
    tax: 2.50,
    total: 37.49,
    currency: "EUR"
  },
  sessionExpiresAt: "2025-11-21T17:24:56.529Z",  // 30 min
  lastSyncAt: "2025-11-21T16:54:56.529Z",
  shippingInfo: { address: {...}, method: {...} },
  paymentMethod: { type: "cash" }  // Sanitized
}
```

---

## Debug Logs Timeline

### Normal Order Flow:
```
[processPayment]
  → Payment successful

[createOrderRecord]
  → Order created: abc-123-def-456
  → Order number: ORD-20251121-001

[completeCheckout]
🔍 PERSIST DEBUG - About to save to cookie:
  hasPayloadOrderData: true
  hasStateOrderData: true
  orderDataInSnapshot: true
  orderId: abc-123-def-456
  orderNumber: ORD-20251121-001
✅ PERSIST DEBUG - Cookie saved successfully
  Verify cookie after save: {orderId: "abc-123-def-456", ...}

[navigation to /checkout/confirmation]
  → Middleware allows access (confirmation exempt)

[confirmation.vue onMounted]
  → OrderData already in memory, skipping restore
  → Cart cleared after order confirmation
```

### Direct URL Access:
```
[navigation to /checkout/confirmation]
  → Middleware allows access (confirmation exempt)

[confirmation.vue onMounted]
  → No orderData in memory, attempting to restore from cookies
  → No order data found even after restore, redirecting to cart

[navigation to /cart]
```

---

## UX Improvement Needed

Current loading state (line 175-178):
```vue
<div v-else class="flex justify-center items-center py-12">
  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
  <span class="ml-3 text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</span>
</div>
```

Issue: No timeout, shows indefinitely until redirect

Recommended improvement:
```vue
<div v-else class="flex flex-col justify-center items-center py-12">
  <!-- Show spinner for first 3 seconds -->
  <div v-if="!loadingTimeout" class="flex items-center">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    <span class="ml-3 text-gray-600">{{ $t('common.loading') }}</span>
  </div>
  
  <!-- After 3 seconds, show error state -->
  <div v-else class="text-center max-w-md">
    <div class="mb-4">
      <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {{ $t('checkout.confirmation.noOrderFound') }}
    </h3>
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      {{ $t('checkout.confirmation.noOrderDataMessage') }}
    </p>
    <NuxtLink 
      :to="localePath('/cart')" 
      class="inline-flex items-center px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
    >
      {{ $t('common.returnToCart') }}
    </NuxtLink>
  </div>
</div>
```

With timeout logic:
```typescript
const loadingTimeout = ref(false)

onMounted(async () => {
  const timeoutId = setTimeout(() => {
    loadingTimeout.value = true
  }, 3000)

  if (!orderData.value) {
    console.log('No orderData in memory, attempting to restore from cookies')
    await checkoutStore.restore()
  }

  clearTimeout(timeoutId)
  
  // ... rest of logic
})
```

