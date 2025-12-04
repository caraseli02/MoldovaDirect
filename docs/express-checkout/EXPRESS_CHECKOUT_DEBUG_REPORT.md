# Express Checkout Banner - Debug Report

## Issue

User `customer@moldovadirect.com` (or `teste2e@example.com`) is not seeing the **Express Checkout Banner** on the checkout shipping page, even after running the SQL setup script.

---

## Root Cause Analysis

### Banner Visibility Conditions

The `ExpressCheckoutBanner` component is rendered in `components/checkout/ShippingStep.vue` line 16-22:

```vue
<ExpressCheckoutBanner
  v-if="user && defaultAddress && !expressCheckoutDismissed"
  :default-address="defaultAddress"
  :preferred-shipping-method="checkoutStore.preferences?.preferred_shipping_method"
  @use-express="handleExpressCheckout"
  @dismiss="handleExpressCheckoutDismiss"
/>
```

**Required conditions**:
1. ✅ `user` - User must be authenticated
2. ❓ `defaultAddress` - Must have a default address loaded in component
3. ✅ `!expressCheckoutDismissed` - Banner hasn't been dismissed

### The Problem: `defaultAddress` Not Loading

The `defaultAddress` comes from `composables/useShippingAddress.ts` (line 56-68):

```typescript
const defaultAddress = computed(() => {
  // Check local saved addresses first
  const localDefault = savedAddresses.value.find(addr => addr.isDefault || addr.is_default)
  if (localDefault) return localDefault

  // Fallback to checkout store addresses
  const storeAddresses = checkoutStore.savedAddresses || []
  const storeDefault = storeAddresses.find((addr: any) => addr.isDefault || addr.is_default)
  if (storeDefault) return storeDefault

  // Return first address if no default
  return savedAddresses.value[0] || storeAddresses[0] || null
})
```

This requires EITHER:
- `savedAddresses.value` to be populated (via `loadSavedAddresses()`)
- OR `checkoutStore.savedAddresses` to be populated (via prefetch)

### Issue #1: `loadSavedAddresses()` May Not Be Called

Looking at `ShippingStep.vue`, the component uses the composable but **may not call** `loadSavedAddresses()` on mount.

### Issue #2: Prefetch Might Fail Silently

The checkout guard prefetches data, but if the API call fails, it logs an error but doesn't block:

```typescript
// plugins/checkout-guard.client.ts:88-96
try {
  console.log('📥 [Checkout Guard] Prefetching user data...')
  await checkoutStore.prefetchCheckoutData()
  console.log('✅ [Checkout Guard] Prefetch complete')
} catch (error) {
  console.error('❌ [Checkout Guard] Failed to prefetch checkout data:', error)
  // Don't block checkout on prefetch failure - user can still enter data manually
}
```

---

## Debugging Steps

### 1. Check Browser Console

When you navigate to checkout, look for these log messages:

**Expected Success**:
```
📥 [Checkout Guard] Prefetching user data (addresses, preferences)...
✅ [Checkout Guard] Prefetch complete
```

**If you see this instead**:
```
❌ [Checkout Guard] Failed to prefetch checkout data: [error message]
```

Then the prefetch is failing!

### 2. Check Network Tab

Look for this API call:
- **URL**: `/api/checkout/addresses`
- **Method**: GET
- **Status**: Should be 200
- **Response**: Should contain your saved address

**If 401 Unauthorized**:
- User not properly authenticated
- Session cookie missing

**If 500 Server Error**:
- Database query failing
- Check server logs

**If 404 Not Found**:
- API endpoint not implemented or misconfigured

### 3. Check Vue DevTools

Install Vue DevTools and inspect:
- **Component**: `ShippingStep`
- **Props/Data**: Look for `defaultAddress`
- **Should show**: Your saved address object
- **If null**: Address not loading

### 4. Check Database

Run this query in Supabase SQL Editor:

```sql
-- Check if address exists for user
SELECT
  ua.*,
  u.email
FROM user_addresses ua
JOIN auth.users u ON u.id = ua.user_id
WHERE u.email = 'teste2e@example.com'  -- or customer@moldovadirect.com
AND ua.is_default = true;
```

**Should return**: 1 row with your address
**If empty**: SQL script didn't run successfully

---

## Quick Fixes

### Fix #1: Force Load Addresses on Mount

Edit `components/checkout/ShippingStep.vue`, add to the script section:

```typescript
// Add this to the end of the script setup
onMounted(async () => {
  if (user.value && !defaultAddress.value) {
    console.log('[ShippingStep] No default address found, loading saved addresses...')
    await loadSavedAddresses()
  }
})
```

### Fix #2: Check API Endpoint

Verify `/api/checkout/addresses.get.ts` exists and works:

```bash
curl -X GET http://localhost:3000/api/checkout/addresses \
  -H "Cookie: sb-access-token=YOUR_SESSION_TOKEN"
```

### Fix #3: Add Debug Logging

Temporarily add debug logging to see what's happening:

```typescript
// In composables/useShippingAddress.ts, add to computed:
const defaultAddress = computed(() => {
  console.log('[useShippingAddress] Computing defaultAddress')
  console.log('  savedAddresses:', savedAddresses.value)
  console.log('  checkoutStore.savedAddresses:', checkoutStore.savedAddresses)

  // ... rest of the code

  const result = savedAddresses.value[0] || storeAddresses[0] || null
  console.log('  defaultAddress result:', result)
  return result
})
```

---

## Permanent Solution

Create a dedicated initialization method in `ShippingStep.vue`:

```typescript
// Add this method
const initializeShippingStep = async () => {
  console.log('[ShippingStep] Initializing...')

  if (user.value) {
    // Load saved addresses if not already loaded
    if (!hasAddresses.value) {
      console.log('[ShippingStep] Loading saved addresses...')
      await loadSavedAddresses()
    }

    // Load address from store if available
    if (checkoutStore.shippingInfo) {
      console.log('[ShippingStep] Loading address from store')
      loadAddressFromStore()
    }
  }

  console.log('[ShippingStep] Initialization complete')
  console.log('  hasAddresses:', hasAddresses.value)
  console.log('  defaultAddress:', defaultAddress.value)
}

// Call on mount
onMounted(() => {
  initializeShippingStep()
})
```

---

## Test User Data Verification

After running the SQL script, verify data exists:

```sql
-- 1. Check user exists
SELECT id, email FROM auth.users WHERE email = 'teste2e@example.com';

-- 2. Check address exists
SELECT * FROM user_addresses
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'teste2e@example.com');

-- 3. Check preferences exist
SELECT * FROM user_checkout_preferences
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'teste2e@example.com');

-- 4. All in one verification
SELECT
  u.email,
  COUNT(DISTINCT ua.id) as address_count,
  COUNT(DISTINCT ucp.user_id) as has_preferences,
  MAX(ucp.preferred_shipping_method) as preferred_method
FROM auth.users u
LEFT JOIN user_addresses ua ON ua.user_id = u.id
LEFT JOIN user_checkout_preferences ucp ON ucp.user_id = u.id
WHERE u.email = 'teste2e@example.com'
GROUP BY u.email;
```

**Expected result**:
- `address_count`: 1 or more
- `has_preferences`: 1
- `preferred_method`: 'standard'

---

## Auto-Skip vs Manual Banner

### If Banner STILL Doesn't Show

The user is in **Standard Checkout Mode**:
- No saved addresses found
- Banner won't appear
- User fills form manually

### If Banner Shows WITHOUT Countdown

The user is in **Manual Express Checkout Mode**:
- Saved address found ✅
- NO preferred shipping method ❌
- Shows banner with "Use Express Checkout" button
- Click to pre-fill form

### If Banner Shows WITH Countdown

The user is in **Auto-Skip Mode**:
- Saved address found ✅
- Preferred shipping method found ✅
- Auto-routes to payment with 5-second countdown
- Can cancel to review

---

## Next Steps

1. **Check Browser Console** for prefetch success/failure messages
2. **Check Network Tab** for `/api/checkout/addresses` response
3. **Run SQL verification** queries above
4. **Add debug logging** to `useShippingAddress.ts`
5. **Force load addresses** on mount if needed

---

## Status

- ✅ SQL Script Created: `tests/setup/create-test-user.sql`
- ✅ User executed SQL script
- ⏳ Debugging banner visibility
- ⏳ Need to verify API response
- ⏳ May need to add `onMounted` initialization

---

**Created**: 2025-11-27
**User**: teste2e@example.com / customer@moldovadirect.com
**Issue**: Express Checkout Banner not visible
**Priority**: High
