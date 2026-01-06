# Checkout Smart Pre-population Fixes

## Summary
Fixed critical issues preventing saved addresses from appearing in checkout and Express Checkout banner from displaying.

## Issues Fixed

### 1. **Reactivity Breaking - readonly() Wrappers** ✅
**File:** `composables/useShippingAddress.ts` (lines 207-220)

**Problem:** All exported refs were wrapped in `readonly()`, which prevented Vue components from detecting when address data changed.

**Fix:** Removed `readonly()` wrappers from all exported refs:
```typescript
// BEFORE - BROKEN:
return {
  shippingAddress,
  savedAddresses: readonly(savedAddresses),  // ❌ Breaks reactivity
  defaultAddress: readonly(defaultAddress),
  hasAddresses: readonly(hasAddresses),
  // ...
}

// AFTER - FIXED:
return {
  shippingAddress,
  savedAddresses,  // ✅ Normal ref - components can detect changes
  defaultAddress,
  hasAddresses,
  // ...
}
```

**Impact:** This fix restores Vue's reactivity system, allowing:
- AddressForm to detect when savedAddresses updates
- ShippingStep to detect when defaultAddress changes
- Express Checkout banner to appear when defaultAddress exists

---

### 2. **Missing Default Address Auto-selection** ✅
**File:** `components/checkout/AddressForm.vue` (lines 453-484)

**Problem:** Component didn't auto-select a default address on mount or when addresses loaded asynchronously.

**Fix:** Added comprehensive auto-selection logic:
```typescript
// Auto-select on component mount
onMounted(() => {
  if (props.savedAddresses?.length) {
    const defaultAddr = props.savedAddresses.find(addr => addr.isDefault || addr.is_default)
    selectedSavedAddressId.value = defaultAddr?.id || props.savedAddresses[0]?.id || null

    if (selectedSavedAddressId.value) {
      const address = props.savedAddresses.find(addr => addr.id === selectedSavedAddressId.value)
      if (address) {
        selectSavedAddress(address)
      }
    }
  }
})

// Watch for async address loading
watch(() => props.savedAddresses, (newAddresses) => {
  if (newAddresses?.length && selectedSavedAddressId.value === null) {
    const defaultAddr = newAddresses.find(addr => addr.isDefault || addr.is_default)
    selectedSavedAddressId.value = defaultAddr?.id || newAddresses[0]?.id || null

    if (selectedSavedAddressId.value) {
      const address = newAddresses.find(addr => addr.id === selectedSavedAddressId.value)
      if (address) {
        selectSavedAddress(address)
      }
    }
  }
}, { immediate: false })
```

**Impact:**
- Default address (or first address) is automatically selected when checkout loads
- Works even when addresses load after component mounts (async)
- Manual form stays hidden when saved addresses exist

---

### 3. **Missing address-complete Event Emit** ✅
**File:** `components/checkout/AddressForm.vue` (lines 296-299, 343)

**Problem:** ShippingStep component expected `address-complete` event to trigger shipping method loading, but AddressForm didn't emit it.

**Fix:**
1. Added event to Emits interface:
```typescript
interface Emits {
  (e: 'update:modelValue', value: Address): void
  (e: 'save-address', address: Address): void
  (e: 'address-complete'): void  // ✅ Added
}
```

2. Emit event when address is selected:
```typescript
const selectSavedAddress = (address: Address) => {
  emit('update:modelValue', { ...address })
  clearAllErrors()
  emit('address-complete')  // ✅ Added
}
```

**Impact:**
- Shipping methods now load automatically when user selects saved address
- Checkout flow progresses smoothly without manual intervention

---

### 4. **Development Data Pre-population Removed** ✅
**File:** `composables/useShippingAddress.ts` (lines 21-32)

**Problem:** Form was pre-populated with hardcoded "John Doe" test data in development mode.

**Fix:** Removed all development pre-population:
```typescript
// BEFORE:
const shippingAddress = ref<Address>({
  type: 'shipping',
  firstName: process.env.NODE_ENV === 'development' ? 'John' : '',
  // ...
})

// AFTER:
const shippingAddress = ref<Address>({
  type: 'shipping',
  firstName: '',
  lastName: '',
  // ...
})
```

**Impact:** Clean form state that properly reflects actual saved address data.

---

## Expected Behavior After Fixes

### For Users WITH Saved Addresses:
1. ✅ Checkout page shows list of saved addresses as radio buttons
2. ✅ Express Checkout banner appears at top of page
3. ✅ Default address is auto-selected immediately
4. ✅ Manual form is hidden
5. ✅ "Use New Address" button is available to show manual form
6. ✅ Shipping methods load automatically when address is selected

### For Users WITHOUT Saved Addresses:
1. ✅ Manual address form is shown
2. ✅ No Express Checkout banner
3. ✅ Standard checkout flow

---

## Testing Instructions

### Manual Test (Recommended):
1. Ensure you have at least one saved address in your profile (`/account/profile`)
2. Add a product to cart
3. Navigate to `/checkout`
4. **Verify:**
   - [ ] Saved addresses appear as radio button list
   - [ ] Express Checkout banner visible at top
   - [ ] Default address is automatically selected
   - [ ] Manual form is hidden
   - [ ] Clicking "Use New Address" shows manual form
   - [ ] Selecting different saved address updates form data

### Automated Test:
```bash
npx playwright test tests/e2e/checkout-smart-prepopulation.spec.ts --headed
```

---

## Files Modified

1. `composables/useShippingAddress.ts`
   - Removed readonly() wrappers (lines 207-220)
   - Removed development data pre-population (lines 21-32)

2. `components/checkout/AddressForm.vue`
   - Added `watch` import (line 284)
   - Added `address-complete` emit definition (line 299)
   - Added auto-selection logic in onMounted (lines 453-468)
   - Added watch for async address loading (lines 470-484)
   - Emit `address-complete` when address selected (line 343)

---

## Root Cause Analysis

The core issue was **Vue's reactivity system being blocked by readonly() wrappers**. When `loadSavedAddresses()` successfully fetched data and updated `savedAddresses.value`, the readonly wrapper prevented AddressForm from detecting the change. This cascade caused:

- No saved addresses showing (component didn't see data)
- No Express Checkout banner (defaultAddress stayed empty)
- Always showing manual form (showForm computed always returned true)

The secondary issues (missing auto-selection and missing emit) compounded the UX problems, but the readonly() issue was the critical blocker.

---

## Prevention

To avoid similar issues in the future:

1. **Avoid readonly() in composables** - Let consuming components decide if they need readonly
2. **Test async data loading** - Ensure components handle data arriving after mount
3. **Verify all prop/emit contracts** - Parent expectations should match child implementations
4. **Remove development data pollution** - Use proper test fixtures instead of hardcoded data

---

**Date:** 2024-11-24
**Branch:** feat/checkout-smart-prepopulation
**Status:** ✅ All fixes implemented and verified
