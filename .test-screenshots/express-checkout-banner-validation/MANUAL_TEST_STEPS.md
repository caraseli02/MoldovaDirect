# Express Checkout Banner - Manual Testing Guide

## Prerequisites
- Server running at http://localhost:3000
- Test user with authentication credentials
- Products available in the catalog

---

## Test Scenario 1: First-Time Checkout (No Saved Address)
**Expected:** Banner SHOULD NOT appear

### Steps:
1. Open browser in incognito mode
2. Navigate to http://localhost:3000
3. Sign in with test user credentials
4. Add a product to cart
5. Click "Proceed to Checkout"
6. **VERIFY:** No Express Checkout Banner appears (user has no saved addresses)
7. Fill out shipping form completely
8. Select shipping method
9. Complete checkout and place order
10. **VERIFY:** Address is saved to database

---

## Test Scenario 2: Return User Checkout (Has Saved Address)
**Expected:** Banner SHOULD appear

### Steps:
1. Clear browser session/use new incognito window
2. Navigate to http://localhost:3000
3. Sign in with SAME test user from Scenario 1
4. Add a different product to cart
5. Click "Proceed to Checkout"
6. **VERIFY:** Express Checkout Banner appears at top of page
7. **VERIFY:** Banner displays:
   - User's saved name
   - Saved address
   - City, postal code, country
   - Preferred shipping method (if saved)
8. Take screenshot: `banner-visible.png`

---

## Test Scenario 3: Use Express Checkout Button
**Expected:** Form pre-population and navigation to payment

### Steps:
1. Continue from Scenario 2 (banner visible)
2. Click "Use Express Checkout" button
3. **VERIFY:** Button shows loading state
4. **VERIFY:** Toast notification appears (success message)
5. **VERIFY:** One of two outcomes:
   - If shipping method saved: Navigate to /checkout/payment
   - If no shipping method: Stay on page, show "select shipping" message
6. **VERIFY:** Address fields are pre-filled with saved data
7. Take screenshot: `express-checkout-activated.png`

---

## Test Scenario 4: Dismiss Banner
**Expected:** Banner hides but data remains available

### Steps:
1. Return to checkout page (refresh or navigate from cart)
2. **VERIFY:** Banner appears again
3. Click "Edit Details" or "X" close button
4. **VERIFY:** Banner disappears
5. **VERIFY:** Form is empty (not pre-filled)
6. **VERIFY:** Saved addresses dropdown still shows saved address
7. Take screenshot: `banner-dismissed.png`

---

## Test Scenario 5: Middleware Crash Prevention
**Expected:** No 500 errors during navigation

### Steps:
1. Open browser developer console (F12)
2. Navigate to http://localhost:3000/checkout
3. **VERIFY:** No console errors
4. **VERIFY:** No network requests returning 500 status
5. Check console for specific error: "Cannot read properties of undefined"
6. **VERIFY:** Middleware executes without crashing
7. Take screenshot: `console-no-errors.png`

---

## Test Scenario 6: Unauthenticated User
**Expected:** No banner, show guest checkout prompt

### Steps:
1. Open browser in incognito mode
2. Navigate to http://localhost:3000
3. Do NOT sign in
4. Add product to cart
5. Navigate to checkout
6. **VERIFY:** No Express Checkout Banner
7. **VERIFY:** Guest checkout prompt appears instead
8. Take screenshot: `guest-checkout.png`

---

## Debugging Checklist

### If Banner Does NOT Appear:
- [ ] Check browser console for JavaScript errors
- [ ] Verify user is authenticated (check user object in Vue DevTools)
- [ ] Verify `defaultAddress` is not null (Vue DevTools)
- [ ] Check `expressCheckoutDismissed` is false (Vue DevTools)
- [ ] Verify database has saved addresses for user
- [ ] Check network tab for failed API requests
- [ ] Verify `checkoutStore.prefetchCheckoutData()` completed successfully

### If Middleware Crashes:
- [ ] Check server terminal for error stack trace
- [ ] Verify async keyword in middleware/checkout.ts
- [ ] Check if error mentions "Cannot read properties of undefined"
- [ ] Verify composable exports defaultAddress and hasAddresses

### Database Queries to Run:
```sql
-- Check if user has saved addresses
SELECT * FROM addresses WHERE user_id = 'YOUR_USER_ID';

-- Check if addresses have default flag
SELECT id, full_name, is_default FROM addresses WHERE user_id = 'YOUR_USER_ID';

-- Check user preferences
SELECT * FROM user_preferences WHERE user_id = 'YOUR_USER_ID';
```

---

## Expected Test Results

### Passing Tests:
- ✅ Middleware executes without async errors
- ✅ Banner appears for authenticated users with saved addresses
- ✅ Banner does NOT appear for new users
- ✅ Banner does NOT appear for guest checkout
- ✅ "Use Express Checkout" pre-fills form correctly
- ✅ Dismiss functionality works
- ✅ No 500 errors during checkout flow

### Critical Failures:
- ❌ 500 error when accessing /checkout
- ❌ Middleware crash with undefined properties
- ❌ Banner appears but shows "undefined" for address fields
- ❌ "Use Express Checkout" button does nothing
- ❌ Console errors about missing computed properties

---

## Screenshot Naming Convention
Save all screenshots to:
`/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/.test-screenshots/express-checkout-banner-validation/`

Files:
- `01-first-time-checkout-no-banner.png`
- `02-return-user-banner-visible.png`
- `03-banner-details-close-up.png`
- `04-express-checkout-loading.png`
- `05-form-pre-filled.png`
- `06-banner-dismissed.png`
- `07-console-no-errors.png`
- `08-guest-checkout-no-banner.png`
- `09-network-tab-200-status.png`
- `10-vue-devtools-state.png`

