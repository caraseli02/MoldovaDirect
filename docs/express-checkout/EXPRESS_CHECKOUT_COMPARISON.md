# Express Checkout: Current vs. Expected Behavior

## Visual Flow Comparison

### Current Implementation (What Exists Today)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CART PAGE                                │
│                                                                   │
│  Items in Cart: 2                                                │
│  Total: €45.99                                                   │
│                                                                   │
│  [ Proceder al Pago ] ←─── User clicks                          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CHECKOUT - SHIPPING STEP                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  ⚡ Express Checkout Available                            │  │
│  │                                                            │  │
│  │  Use your saved address and preferences                   │  │
│  │                                                            │  │
│  │  📍 John Doe                                              │  │
│  │     123 Main Street                                       │  │
│  │     Madrid, 28001, Spain                                  │  │
│  │     Preferred: Standard Shipping                          │  │
│  │                                                            │  │
│  │  [ Use Express Checkout ]  [ Edit Details ]         [X]   │  │
│  │   ↑                                                        │  │
│  │   └─── USER MUST CLICK THIS MANUALLY                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Shipping Address Form                                           │
│  [Pre-populated but still visible]                               │
│                                                                   │
│  [ Continue to Payment ]                                         │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ (Only if user clicks banner button)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CHECKOUT - PAYMENT STEP                        │
│                                                                   │
│  Payment Method Selection                                        │
│  [User selects payment method]                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Key Points**:
- ✅ Banner shows for authenticated users with saved data
- ✅ Pre-populates form fields
- ❌ NO automatic countdown
- ❌ NO automatic routing
- ❌ User MUST manually click button

---

### Expected Implementation (Test Scenarios)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CART PAGE                                │
│                                                                   │
│  Items in Cart: 2                                                │
│  Total: €45.99                                                   │
│                                                                   │
│  [ Proceder al Pago ] ←─── User clicks                          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────────┐
            │  AUTO-SKIP DETECTION LOGIC    │
            │  - Has saved address? ✓       │
            │  - Has shipping method? ✓     │
            │  → TRIGGER AUTO-SKIP          │
            └───────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              CHECKOUT - AUTO-SKIP COUNTDOWN                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  ⏱️ Redirecting to Payment in 5 seconds...               │  │
│  │                                                            │  │
│  │  We found your saved shipping information:                │  │
│  │                                                            │  │
│  │  📍 John Doe                                              │  │
│  │     123 Main Street                                       │  │
│  │     Madrid, 28001, Spain                                  │  │
│  │     Standard Shipping                                     │  │
│  │                                                            │  │
│  │           ┌─────────────────────┐                         │  │
│  │           │ Countdown: 5 → 4 → 3│                         │  │
│  │           └─────────────────────┘                         │  │
│  │                                                            │  │
│  │  [ Cancel - Stay on this page ]                           │  │
│  │   ↑                                                        │  │
│  │   └─── User can interrupt auto-skip                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  (Shipping form hidden or minimized during countdown)            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ (Automatic after 5 seconds)
                            │ (Unless user clicks Cancel)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CHECKOUT - PAYMENT STEP                        │
│                                                                   │
│  ✅ Shipping details saved automatically                         │
│                                                                   │
│  Payment Method Selection                                        │
│  [User selects payment method]                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Key Points**:
- ✅ Automatic detection of complete data
- ✅ Countdown timer (5 seconds)
- ✅ Auto-routing to payment step
- ✅ Cancel button to interrupt
- ✅ Visual countdown indicator

---

## Side-by-Side Feature Comparison

| Feature | Current | Expected | Status |
|---------|---------|----------|--------|
| **Saved data detection** | ✅ Yes | ✅ Yes | ✅ IMPLEMENTED |
| **Express checkout banner** | ✅ Yes | ✅ Yes | ✅ IMPLEMENTED |
| **Manual button to use saved data** | ✅ Yes | ✅ Yes | ✅ IMPLEMENTED |
| **Auto-skip countdown timer** | ❌ No | ✅ Yes | ❌ MISSING |
| **Automatic routing** | ❌ No | ✅ Yes | ❌ MISSING |
| **Cancel/Stay button** | ❌ No | ✅ Yes | ❌ MISSING |
| **Countdown display (5→4→3→2→1)** | ❌ No | ✅ Yes | ❌ MISSING |
| **Smart step detection** | ⚠️ Partial | ✅ Yes | ⚠️ PARTIAL |
| **Guest user handling** | ✅ Correct | ✅ Yes | ✅ IMPLEMENTED |

---

## User Experience Comparison

### Current UX Journey

```
User Action                    System Response                  User Control
────────────────────────────────────────────────────────────────────────────
1. Click "Proceder al Pago"  → Loads /checkout                   Full control
2. See express banner        → Banner displays                   Full control
3. Click "Use Express"       → Pre-fills form                    Full control
   (optional)                → Routes to payment                 Full control
4. OR manually fill form     → User enters data                  Full control
5. Click continue            → Proceeds to payment               Full control
```

**User Friction**: Medium  
**Steps Required**: 3-4 clicks  
**Time to Payment**: ~30-60 seconds

---

### Expected UX Journey (Auto-Skip)

```
User Action                    System Response                  User Control
────────────────────────────────────────────────────────────────────────────
1. Click "Proceder al Pago"  → Detects saved data              Passive
2. —                         → Shows countdown (5s)             Can cancel
3. (Wait 5s or click cancel) → Auto-routes to payment          Can interrupt
4. Select payment method     → User interacts                   Full control
5. Click continue            → Proceeds to review               Full control
```

**User Friction**: Low  
**Steps Required**: 1-2 clicks  
**Time to Payment**: ~5-10 seconds

**Key Difference**: Expected flow reduces clicks by 50-66% for returning users

---

## Technical Implementation Gap

### What Exists in Code

```typescript
// ✅ ExpressCheckoutBanner.vue - MANUAL button
const useExpressCheckout = async () => {
  await checkoutStore.updateShippingInfo(shippingInfo)
  await navigateTo(localePath('/checkout/payment')) // Manual navigation
}
```

### What's Missing in Code

```typescript
// ❌ Auto-skip countdown logic - DOES NOT EXIST
const startAutoSkipCountdown = () => {
  let countdown = 5
  const interval = setInterval(() => {
    countdown--
    if (countdown === 0) {
      clearInterval(interval)
      navigateTo('/checkout/payment') // Automatic navigation
    }
  }, 1000)
}

// ❌ Auto-skip detection - DOES NOT EXIST
onMounted(() => {
  if (shouldAutoSkip.value) {
    startAutoSkipCountdown()
  }
})
```

---

## Test Scenarios Status

### Scenario 1: Returning User with Complete Data

**Test Steps**:
1. Login with saved address + previous order
2. Add item to cart
3. Click "Proceder al Pago"

**Expected**:
- ✅ Auto-route to /checkout/payment
- ✅ Show countdown: 5...4...3...2...1
- ✅ Can click Cancel

**Actual**:
- ❌ Lands on /checkout (shipping step)
- ❌ No countdown shown
- ❌ No Cancel button (no auto-skip happening)
- ⚠️ Shows banner with manual button

**Result**: ❌ FAIL

---

### Scenario 2: User Without Saved Shipping Method

**Test Steps**:
1. Login with saved address, no previous orders
2. Add item to cart
3. Click "Proceder al Pago"

**Expected**:
- ✅ Lands on /checkout normally
- ✅ Shows express banner (manual mode)
- ❌ No auto-skip

**Actual**:
- ✅ Lands on /checkout
- ✅ Shows express banner
- ✅ No auto-skip (but not for the reason expected)

**Result**: ⚠️ PASS (correct outcome, wrong reason)

---

### Scenario 3: Guest User

**Test Steps**:
1. Logout
2. Add item to cart
3. Click "Proceder al Pago"

**Expected**:
- ✅ Lands on /checkout normally
- ✅ No express banner

**Actual**:
- ✅ Lands on /checkout
- ✅ Shows GuestCheckoutPrompt instead

**Result**: ✅ PASS

---

## Implementation Checklist

To pass all test scenarios, implement:

### Phase 1: Auto-Skip Detection
- [ ] Add `shouldAutoSkip` computed property
- [ ] Check for: user + address + shipping method
- [ ] Add preference check (don't skip if user disabled it)

### Phase 2: Countdown Component
- [ ] Create `AutoSkipCountdown.vue` component
- [ ] Display countdown: 5 → 4 → 3 → 2 → 1
- [ ] Show destination: "Redirecting to Payment..."
- [ ] Add Cancel button
- [ ] Implement countdown timer logic

### Phase 3: Auto-Route Logic
- [ ] Trigger countdown on component mount
- [ ] Navigate to payment after countdown ends
- [ ] Handle cancellation (stop timer)
- [ ] Prevent re-triggering on back navigation

### Phase 4: UX Enhancements
- [ ] Add ARIA announcements
- [ ] Add animation for countdown
- [ ] Show success notification on payment page
- [ ] Add "Edit shipping" link on payment page

### Phase 5: Edge Cases
- [ ] Handle stale data (address updated elsewhere)
- [ ] Handle network errors during data fetch
- [ ] Handle user navigating back during countdown
- [ ] Handle page reload during countdown

### Phase 6: Testing
- [ ] E2E test: Scenario 1 (auto-skip with data)
- [ ] E2E test: Scenario 2 (no auto-skip without method)
- [ ] E2E test: Scenario 3 (guest user)
- [ ] E2E test: Cancel during countdown
- [ ] Accessibility audit

---

## Conclusion

**Current State**: Express checkout is a **manual opt-in** feature.

**Expected State**: Express checkout is an **automatic feature** with user control (cancel).

**Implementation Gap**: ~60% of expected functionality is missing.

**Components Needed**:
1. Auto-skip detection logic
2. Countdown timer component
3. Auto-routing mechanism
4. Cancel/interrupt functionality

**Estimated Effort**: 8-12 hours for complete implementation

---

**Last Updated**: 2025-11-27  
**Status**: Documentation complete, implementation pending
