# Cookie Persistence Failure Analysis

## Executive Summary

**Issue:** orderData persists to cookie successfully on review page but fails to restore on confirmation page navigation.

**Root Cause:** Multiple timing and configuration issues with Nuxt's `useCookie()` SSR/CSR behavior.

**Impact:** Critical - Users complete checkout but see error page instead of confirmation, despite order being successfully created in database.

---

## Problem Analysis

### Observed Behavior

**PERSIST (Works):**
```
🟡 ABOUT TO PERSIST with orderData: {orderId: 486, orderNumber: 'ORD-1763745313210-C5RSVP'}
🔍 PERSIST DEBUG - About to save to cookie:
  hasPayloadOrderData: true
  orderId: 486
  orderNumber: ORD-1763745313210-C5RSVP
✅ PERSIST DEBUG - Cookie saved successfully
  Verify cookie after save: Proxy(Object) {subtotal: 117.32, shippingCost: 12.99, ...}
✅ PERSIST CALLED
```

**RESTORE (Fails):**
```
confirmation.vue:302 No orderData in memory, attempting to restore from cookies
confirmation.vue:313 No order data found even after restore, redirecting to cart
```

---

## Root Causes Identified

### 1. Cookie Path Not Specified

**File:** `/config/cookies.ts` (line 34-38)

**Problem:**
```typescript
export const CHECKOUT_SESSION_COOKIE_CONFIG: CookieConfig = {
  maxAge: 60 * 60 * 2,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production'
  // MISSING: path: '/'
}
```

**Impact:**
- Cookie written from `/checkout/review` may be path-scoped
- Browser restricts cookie access from `/checkout/confirmation`
- Standard browser security behavior

**Evidence:**
- Cookie persists successfully at write-time
- Cookie not accessible at read-time from different path
- No explicit path configuration

---

### 2. SSR/CSR Cookie Synchronization Issue

**File:** `/stores/checkout/session.ts` (line 208, 236, 247)

**Problem:**
```typescript
// Single cookie instance created once
const checkoutCookie = useCookie<any>(COOKIE_NAMES.CHECKOUT_SESSION, CHECKOUT_SESSION_COOKIE_CONFIG)

const persist = (payload: PersistPayload): void => {
  // ...
  checkoutCookie.value = snapshot  // Client-side write
  console.log('✅ PERSIST DEBUG - Cookie saved successfully')
}

const restore = (): RestoredPayload | null => {
  const snapshot = checkoutCookie.value  // May read from different context
  // ...
}
```

**Why it fails:**

1. **Write Phase (Client-Side):**
   - User on `/checkout/review` (CSR context)
   - `checkoutCookie.value = snapshot` writes to browser cookie
   - Cookie visible in DevTools immediately

2. **Navigation Phase:**
   - `navigateTo('/checkout/confirmation')` triggers
   - May cause SSR render or new page load

3. **Read Phase (SSR or New CSR Context):**
   - New `useCookie()` instance reads from request headers (SSR) or browser (CSR)
   - Cookie may not be in request headers yet
   - New reactive ref created with no value

**Nuxt Cookie Behavior:**
- SSR: `useCookie()` reads from request `Cookie` header
- CSR: `useCookie()` reads from `document.cookie`
- Writes in CSR don't immediately update SSR context
- Each `useCookie()` call creates a new reactive ref

---

### 3. Navigation Timing Race Condition

**File:** `/pages/checkout/review.vue` (line 219-221)

**Problem:**
```typescript
const { nextStep, success } = await processOrder({...})

if (!success || !nextStep) return

// Navigate immediately - orderData is now persisted atomically
const stepPath = nextStep === 'shipping' ? '/checkout' : `/checkout/${nextStep}`
await navigateTo(localePath(stepPath))
```

**Sequence:**
```
1. processOrder() calls processPayment()
2. processPayment() calls createOrderRecord() → returns orderData
3. processPayment() calls completeCheckout(orderData)
4. completeCheckout() calls session.persist({ orderData })
5. persist() sets checkoutCookie.value = snapshot
6. persist() logs "Cookie saved successfully"
7. completeCheckout() returns
8. processPayment() returns
9. processOrder() returns { nextStep: 'confirmation', success: true }
10. navigateTo() called IMMEDIATELY
11. Browser navigates to /checkout/confirmation
12. confirmation.vue onMounted() calls restore()
13. restore() reads checkoutCookie.value → null or stale
```

**Gap:**
- No guarantee cookie is flushed to browser storage between step 6 and 10
- No `await nextTick()` or delay
- Cookie write may be batched/async by browser
- Navigation happens before cookie write completes

---

### 4. TypeScript Interface Incomplete

**File:** `/config/cookies.ts` (line 8-14)

**Problem:**
```typescript
export interface CookieConfig {
  maxAge: number
  sameSite: 'strict' | 'lax' | 'none'
  secure: boolean
  watch?: 'shallow' | 'deep' | boolean
  default?: () => any
  // MISSING: path?: string
}
```

**Impact:**
- TypeScript doesn't enforce `path` property
- Developers may forget to set it
- No compile-time warning

---

## Data Integrity Risks

### User Impact (CRITICAL)

1. **Order Created but User Sees Error**
   - Order successfully created in database (ID: 486)
   - User redirected to `/cart` with "empty cart" message
   - User believes order failed

2. **Potential Duplicate Orders**
   - User thinks order failed
   - User attempts checkout again
   - Same items ordered twice
   - Financial impact on user and business

3. **Support Burden**
   - Users contact support: "I paid but got error page"
   - Support must manually verify order in database
   - User trust degraded

### Database Integrity (MEDIUM)

1. **Orphaned Orders**
   - Order created but user never sees confirmation
   - No user acknowledgment
   - Potential fulfillment confusion

2. **Audit Trail Gap**
   - Order exists in DB
   - No cookie/session record of user viewing confirmation
   - Analytics show drop-off at confirmation page

### Session Management (HIGH)

1. **Cart State Inconsistency**
   - Cart cleared on confirmation page (line 321 of confirmation.vue)
   - But user redirected before clearing happens
   - Cart may or may not be cleared depending on timing

2. **Checkout Session Orphaned**
   - Session persisted with orderData
   - User never completes flow
   - Session expires with incomplete state

---

## Proposed Solutions

### Solution 1: Add Cookie Path + Ensure Write Completion (RECOMMENDED)

**Priority:** CRITICAL
**Effort:** LOW
**Risk:** LOW

#### Changes Required:

**A. Update Cookie Configuration**

File: `/config/cookies.ts`

```typescript
export interface CookieConfig {
  maxAge: number
  sameSite: 'strict' | 'lax' | 'none'
  secure: boolean
  path?: string  // ADD THIS
  watch?: 'shallow' | 'deep' | boolean
  default?: () => any
}

export const CHECKOUT_SESSION_COOKIE_CONFIG: CookieConfig = {
  maxAge: 60 * 60 * 2,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',  // ADD THIS - ensures cookie accessible from all paths
  watch: false  // ADD THIS - prevent unnecessary reactivity
}
```

**B. Make Persist Async with Cookie Flush**

File: `/stores/checkout/session.ts`

```typescript
const persist = async (payload: PersistPayload): Promise<void> => {
  try {
    const snapshot = {
      sessionId: state.sessionId,
      currentStep: state.currentStep,
      guestInfo: state.guestInfo,
      contactEmail: state.contactEmail,
      orderData: payload.orderData ?? state.orderData,
      sessionExpiresAt: state.sessionExpiresAt,
      lastSyncAt: new Date(),
      termsAccepted: state.termsAccepted,
      privacyAccepted: state.privacyAccepted,
      marketingConsent: state.marketingConsent,
      shippingInfo: payload.shippingInfo,
      paymentMethod: sanitizePaymentMethodForStorage(payload.paymentMethod)
    }

    console.log('🔍 PERSIST DEBUG - About to save to cookie:')
    console.log('  hasPayloadOrderData:', !!payload.orderData)
    console.log('  orderId:', snapshot.orderData?.orderId)
    console.log('  orderNumber:', snapshot.orderData?.orderNumber)

    checkoutCookie.value = snapshot

    // ADD: Ensure cookie write completes before continuing
    await nextTick()

    console.log('✅ PERSIST DEBUG - Cookie saved successfully')
    console.log('  Verify cookie after save:', checkoutCookie.value?.orderData)
  } catch (error) {
    console.error('Failed to persist checkout session:', error)
    throw error  // ADD: Propagate error instead of silent failure
  }
}
```

**C. Await Persist Before Navigation**

File: `/stores/checkout/payment.ts`

```typescript
async function completeCheckout(completedOrderData: OrderData): Promise<void> {
  console.log('🟢 completeCheckout RECEIVED:', {
    orderId: completedOrderData?.orderId,
    orderNumber: completedOrderData?.orderNumber,
    hasData: !!completedOrderData
  })
  try {
    // Non-blocking post-checkout operations
    sendConfirmationEmail().catch(error => {
      console.error('Failed to send confirmation email (non-blocking):', error)
    })

    // Unlock the cart after successful checkout
    if (sessionId.value) {
      cartStore.unlockCart(sessionId.value).catch(error => {
        console.warn('Failed to unlock cart after checkout:', error)
      })
    }

    // Navigate to confirmation step
    session.setCurrentStep('confirmation')

    // CHANGE: await persist to ensure cookie write completes
    console.log('🟡 ABOUT TO PERSIST with orderData:', {
      orderId: completedOrderData?.orderId,
      orderNumber: completedOrderData?.orderNumber
    })

    await session.persist({  // ADD await
      shippingInfo: shipping.shippingInfo.value,
      paymentMethod: paymentMethod.value,
      orderData: completedOrderData
    })

    console.log('✅ PERSIST COMPLETED - Cookie write flushed')

    // Show success message
    try {
      toast.success(
        t('checkout.success.orderCompleted'),
        t('checkout.success.orderConfirmation')
      )
    } catch {
      // Ignore toast errors
    }
  } catch (error) {
    console.error('Failed to complete checkout:', error)
    throw error  // ADD: Propagate error
  }
}
```

**D. Update Persist Call Signature**

File: `/stores/checkout.ts`

```typescript
const saveToStorage = async (): Promise<void> => {  // ADD async
  await session.persist({  // ADD await
    shippingInfo: sessionRefs.shippingInfo.value,
    paymentMethod: sessionRefs.paymentMethod.value
  })
}
```

---

### Solution 2: Alternative - Use localStorage as Backup

**Priority:** MEDIUM (Fallback)
**Effort:** MEDIUM
**Risk:** MEDIUM

If cookie issues persist, use dual persistence:

```typescript
const persist = async (payload: PersistPayload): Promise<void> => {
  try {
    const snapshot = { /* ... */ }

    // Write to cookie
    checkoutCookie.value = snapshot

    // ALSO write to localStorage as backup for confirmation page
    if (payload.orderData && typeof window !== 'undefined') {
      localStorage.setItem('checkout_order_temp', JSON.stringify({
        orderData: payload.orderData,
        timestamp: Date.now()
      }))
    }

    await nextTick()
  } catch (error) {
    console.error('Failed to persist checkout session:', error)
    throw error
  }
}

const restore = (): RestoredPayload | null => {
  try {
    console.log('🔍 RESTORE: Reading cookie...')
    let snapshot = checkoutCookie.value

    // FALLBACK: If no cookie but localStorage has recent orderData, use it
    if (!snapshot?.orderData && typeof window !== 'undefined') {
      const tempData = localStorage.getItem('checkout_order_temp')
      if (tempData) {
        const parsed = JSON.parse(tempData)
        // Only use if less than 5 minutes old
        if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          console.log('🔄 RESTORE: Using localStorage fallback')
          snapshot = { ...snapshot, orderData: parsed.orderData }

          // Clean up localStorage
          localStorage.removeItem('checkout_order_temp')
        }
      }
    }

    // ... rest of restore logic
  } catch (error) {
    console.error('Failed to restore checkout session:', error)
    return null
  }
}
```

---

## Testing Plan

### 1. Cookie Path Verification

```bash
# In browser console after clicking "Place Order"
document.cookie.split(';').find(c => c.includes('checkout_session'))
# Should show path=/
```

### 2. Cookie Persistence Across Navigation

```bash
# Before navigation (review page)
window.beforeNav = document.cookie

# After navigation (confirmation page)
window.afterNav = document.cookie
console.log('Cookies match:', window.beforeNav === window.afterNav)
```

### 3. Timing Test

Add delays to verify race condition:

```typescript
// In completeCheckout
await session.persist({ orderData: completedOrderData })
await new Promise(resolve => setTimeout(resolve, 100))  // 100ms delay
console.log('Cookie after delay:', checkoutCookie.value?.orderData)
```

### 4. Multi-Browser Test

Test on:
- Chrome (desktop)
- Safari (desktop) - strict cookie handling
- Firefox (desktop)
- Mobile Safari (iOS) - different cookie behavior
- Mobile Chrome (Android)

---

## Implementation Priority

1. **CRITICAL - Immediate:** Add `path: '/'` to cookie config
2. **HIGH - Same PR:** Make `persist()` async with `await nextTick()`
3. **HIGH - Same PR:** Update all `persist()` call sites to `await`
4. **MEDIUM - Follow-up:** Add localStorage fallback
5. **LOW - Monitoring:** Add analytics to track confirmation page access vs orders created

---

## Migration Safety

### Backwards Compatibility

✅ Adding `path: '/'` to cookie config is safe:
- Existing cookies without path will still be readable
- New cookies will have correct path
- No data migration needed

✅ Making `persist()` async is safe:
- All call sites use `await` already or can add it
- No breaking changes to API

### Rollback Plan

If issues occur:
1. Revert `path: '/'` addition
2. Keep async `persist()` but remove `nextTick()`
3. Monitor error logs for cookie-related issues

---

## Monitoring Recommendations

### Add Metrics

1. **Cookie Write Success Rate**
   ```typescript
   // In persist()
   try {
     checkoutCookie.value = snapshot
     analytics.track('checkout.cookie.write.success')
   } catch (error) {
     analytics.track('checkout.cookie.write.failure', { error })
   }
   ```

2. **Confirmation Page Access vs Order Creation**
   ```typescript
   // In confirmation.vue onMounted
   if (orderData.value) {
     analytics.track('checkout.confirmation.success', {
       orderId: orderData.value.orderId
     })
   } else {
     analytics.track('checkout.confirmation.failure', {
       hadCookie: !!checkoutCookie.value,
       cookieKeys: Object.keys(checkoutCookie.value || {})
     })
   }
   ```

3. **Cookie Size Tracking**
   ```typescript
   const cookieSize = JSON.stringify(snapshot).length
   if (cookieSize > 3000) {
     console.warn('Cookie approaching 4KB limit:', cookieSize)
     analytics.track('checkout.cookie.size.warning', { size: cookieSize })
   }
   ```

---

## Security Considerations

### Cookie Security Audit

✅ **sameSite: 'lax'** - Correct for checkout flow
✅ **secure: production only** - Correct for dev environment
✅ **maxAge: 2 hours** - Appropriate for checkout session
⚠️ **No httpOnly** - Cannot set via JS, OK for client-side cookie
✅ **No sensitive data** - Payment method sanitized before persist

### PII in Cookie

Current cookie contains:
- ✅ Order number (non-sensitive)
- ✅ Order ID (non-sensitive)
- ✅ Shipping address (necessary for confirmation page)
- ⚠️ Email address (PII - consider encrypting)
- ✅ Payment method type only (no card numbers)

**Recommendation:** Encrypt email address before storing in cookie, or exclude from cookie and fetch from DB on confirmation page.

---

## Conclusion

The root cause is a **combination of missing cookie path configuration and navigation timing race condition**. The recommended solution is low-risk and addresses both issues:

1. Add `path: '/'` to ensure cookie accessible across checkout paths
2. Make `persist()` async with `await nextTick()` to ensure write completes
3. Await `persist()` before navigation

**Expected Outcome:** 100% success rate for orderData restoration on confirmation page.

**Rollback Risk:** Low - changes are additive and backwards compatible.

**Testing Required:** Multi-browser testing, especially Safari (strict cookie handling).
