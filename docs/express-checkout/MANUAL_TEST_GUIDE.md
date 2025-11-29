# Manual Testing Guide: Express Checkout Auto-Skip Flow

**Date**: 2025-11-27  
**Branch**: feat/checkout-smart-prepopulation  
**Server**: http://localhost:3000  
**Status**: Ready for testing

---

## Prerequisites

### 1. Start Development Server
```bash
cd /Users/vladislavcaraseli/Documents/MoldovaDirect
pnpm dev
```

Server should be running on: http://localhost:3000

### 2. Test User Accounts

You'll need:
- **Returning User**: User with saved address + previous order
- **New User**: User with saved address, no previous orders  
- **Guest**: Not logged in

### 3. Browser DevTools
Open browser console to monitor:
- Network requests
- Console logs
- Component state

---

## Test Scenario 1: Returning User with Complete Data

### Setup
1. Login to account that has:
   - Saved shipping address
   - Previous order (preferred shipping method)
2. Clear cart if needed

### Test Steps

#### Step 1: Add Item to Cart
- [ ] Navigate to product page
- [ ] Click "Add to Cart"
- [ ] Verify item appears in cart icon
- [ ] **Screenshot**: Cart with item

#### Step 2: Navigate to Checkout
- [ ] Open cart page: http://localhost:3000/cart
- [ ] Click "Proceder al Pago" button
- [ ] **Screenshot**: Cart page before clicking

#### Step 3: Expected vs. Actual

**Expected (Test Scenario)**:
- [X] Should auto-route to /checkout/payment
- [X] Should show countdown: "5...4...3...2...1"
- [X] Should have "Cancel" button to stay on shipping
- [X] User should land directly on payment step

**Actual (Current Implementation)**:
- [ ] Lands on /checkout (shipping step) - CORRECT PATH SHOWN?
- [ ] Shows ExpressCheckoutBanner - IS BANNER VISIBLE?
- [ ] Banner shows saved address - ADDRESS DISPLAYED?
- [ ] Banner shows preferred shipping method - METHOD SHOWN?
- [ ] No countdown timer visible - CONFIRMED?
- [ ] No automatic routing - CONFIRMED?
- [ ] Manual "Use Express Checkout" button present - BUTTON VISIBLE?

**Screenshots Needed**:
1. [ ] `/checkout` page on landing
2. [ ] ExpressCheckoutBanner (if visible)
3. [ ] Browser console showing any logs
4. [ ] Network tab showing API calls

#### Step 4: Test Manual Express Checkout
- [ ] Click "Use Express Checkout" button
- [ ] **Expected**: Should navigate to /checkout/payment
- [ ] **Verify**: URL changes to payment step
- [ ] **Verify**: Shipping info saved (check console)
- [ ] **Screenshot**: Payment page after navigation

### Results Documentation

**Banner Visibility**: [YES / NO]  
**Saved Address Shown**: [YES / NO]  
**Shipping Method Shown**: [YES / NO / N/A]  
**Auto-Skip Countdown**: [YES / NO]  
**Manual Button Works**: [YES / NO]  
**Navigation to Payment**: [AUTOMATIC / MANUAL / FAILED]

**Console Errors**:
```
[Paste any console errors here]
```

**API Calls Made**:
```
[List API calls from Network tab]
```

---

## Test Scenario 2: User Without Saved Shipping Method

### Setup
1. Login to account that has:
   - Saved shipping address
   - NO previous orders (no preferred shipping method)
2. Clear cart if needed

### Test Steps

#### Step 1: Add Item to Cart
- [ ] Navigate to product page
- [ ] Click "Add to Cart"
- [ ] **Screenshot**: Cart with item

#### Step 2: Navigate to Checkout
- [ ] Open cart page: http://localhost:3000/cart
- [ ] Click "Proceder al Pago" button
- [ ] **Screenshot**: Cart page before clicking

#### Step 3: Expected vs. Actual

**Expected (Test Scenario)**:
- [X] Should land on /checkout normally (no auto-skip)
- [X] Should show express banner with manual button
- [X] No countdown (no shipping method saved)

**Actual (Current Implementation)**:
- [ ] Lands on /checkout (shipping step) - CORRECT?
- [ ] Shows ExpressCheckoutBanner - VISIBLE?
- [ ] Banner shows saved address - ADDRESS SHOWN?
- [ ] Banner does NOT show shipping method - CONFIRMED?
- [ ] Manual button present - BUTTON VISIBLE?
- [ ] No auto-skip occurs - CONFIRMED?

**Screenshots Needed**:
1. [ ] `/checkout` page on landing
2. [ ] ExpressCheckoutBanner state
3. [ ] Address form pre-population

#### Step 4: Test Manual Express Checkout
- [ ] Click "Use Express Checkout" button
- [ ] **Expected**: Should pre-fill address, stay on shipping page
- [ ] **Verify**: Address fields populated
- [ ] **Verify**: Shipping method selector visible
- [ ] **Verify**: User must select shipping method manually
- [ ] **Screenshot**: Page after clicking button

### Results Documentation

**Banner Visibility**: [YES / NO]  
**Saved Address Shown**: [YES / NO]  
**Shipping Method Shown**: [YES / NO / N/A]  
**Auto-Skip Occurred**: [YES / NO]  
**Address Pre-Filled**: [YES / NO]  
**Shipping Selector Visible**: [YES / NO]

---

## Test Scenario 3: Guest User

### Setup
1. Logout (if logged in)
2. Clear cart
3. Ensure not authenticated

### Test Steps

#### Step 1: Add Item to Cart
- [ ] Navigate to product page
- [ ] Click "Add to Cart"
- [ ] **Screenshot**: Cart with item (guest)

#### Step 2: Navigate to Checkout
- [ ] Open cart page: http://localhost:3000/cart
- [ ] Click "Proceder al Pago" button
- [ ] **Screenshot**: Cart page before clicking

#### Step 3: Expected vs. Actual

**Expected (Test Scenario)**:
- [X] Should land on /checkout normally
- [X] No express banner (guest user)
- [X] Show guest checkout prompt or login option

**Actual (Current Implementation)**:
- [ ] Lands on /checkout (shipping step) - CORRECT?
- [ ] No ExpressCheckoutBanner - CONFIRMED?
- [ ] Shows GuestCheckoutPrompt - VISIBLE?
- [ ] OR shows login option - VISIBLE?
- [ ] No auto-skip - CONFIRMED?

**Screenshots Needed**:
1. [ ] `/checkout` page on landing (guest)
2. [ ] GuestCheckoutPrompt component
3. [ ] Full checkout page layout

### Results Documentation

**Express Banner Visible**: [YES / NO]  
**Guest Prompt Visible**: [YES / NO]  
**Login Option Available**: [YES / NO]  
**Checkout Flow Starts**: [YES / NO]

---

## Additional Manual Tests

### Test 4: Banner Dismissal
**Setup**: Logged in with saved address

1. [ ] Navigate to /checkout
2. [ ] Verify banner is visible
3. [ ] Click "X" close button on banner
4. [ ] **Verify**: Banner disappears
5. [ ] **Verify**: Can still fill form manually
6. [ ] **Screenshot**: Page after dismissing banner

### Test 5: Edit Details Button
**Setup**: Logged in with saved address

1. [ ] Navigate to /checkout
2. [ ] Click "Edit Details" button on banner
3. [ ] **Verify**: Banner closes
4. [ ] **Verify**: Form remains visible for editing
5. [ ] **Screenshot**: Page after clicking edit

### Test 6: Back Navigation
**Setup**: Used express checkout, now on payment step

1. [ ] On /checkout/payment page
2. [ ] Click browser back button
3. [ ] **Verify**: Returns to /checkout
4. [ ] **Verify**: Does NOT auto-skip again
5. [ ] **Verify**: Banner still shows or is dismissed
6. [ ] **Screenshot**: Page state after back navigation

### Test 7: Data Prefetch Verification
**Setup**: Logged in user

1. [ ] Open DevTools Network tab
2. [ ] Navigate to /checkout
3. [ ] **Look for**: API call to `/api/checkout/user-data`
4. [ ] **Verify**: Response contains addresses and preferences
5. [ ] **Screenshot**: Network request/response

---

## Issue Reporting Template

If you find issues during testing, document as follows:

```markdown
## Issue: [Brief Description]

**Scenario**: [Which test scenario]  
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots**:
[Attach screenshots]

**Console Errors**:
[Paste console output]

**Browser**: [Chrome/Firefox/Safari + version]  
**OS**: [macOS/Windows/Linux]  
**Date**: [YYYY-MM-DD]
```

---

## Success Criteria

### Current Implementation (What Should Work)

✅ **Must Pass**:
- [ ] ExpressCheckoutBanner shows for authenticated users with saved addresses
- [ ] Banner displays saved address correctly
- [ ] Banner displays preferred shipping method (if available)
- [ ] "Use Express Checkout" button works and navigates to payment
- [ ] "Edit Details" button dismisses banner
- [ ] Guest users see GuestCheckoutPrompt instead of banner
- [ ] No console errors during checkout flow
- [ ] Address form pre-populates with saved data

❌ **Expected to Fail** (Not Implemented):
- [ ] Auto-skip countdown (5 seconds)
- [ ] Automatic routing to payment step
- [ ] Cancel button during auto-skip
- [ ] Auto-skip detection logic

---

## Test Data Setup Helpers

### Create Test User with Saved Address

**Option 1: Via Database**
```sql
-- Insert test address
INSERT INTO addresses (user_id, full_name, address, city, postal_code, country, is_default)
VALUES 
  ('[USER_ID]', 'Test User', '123 Test Street', 'Madrid', '28001', 'ES', true);
```

**Option 2: Via UI**
1. Login to account
2. Go to Profile: http://localhost:3000/account/profile
3. Add shipping address
4. Set as default

### Create Test Order

**Option 3: Complete a full checkout**
1. Add item to cart
2. Complete checkout process
3. Select shipping method (this saves preference)
4. Complete payment
5. Now user has "preferred_shipping_method" saved

---

## Recording Test Results

Create screenshots folder:
```bash
mkdir -p /Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots
```

Screenshot naming convention:
- `scenario1-step1-cart.png`
- `scenario1-step2-checkout-landing.png`
- `scenario1-step3-banner.png`
- `scenario1-step4-payment.png`
- `scenario2-step1-cart.png`
- etc.

---

## Conclusion

After completing all tests, summarize:

**Working Features**:
- [List what works correctly]

**Missing Features** (Expected from test scenarios):
- Auto-skip countdown timer
- Automatic routing to payment
- Cancel button during auto-skip

**Bugs Found**:
- [List any bugs or unexpected behavior]

**Recommendations**:
- [Any UX improvements or fixes needed]

---

**Tester**: _______________  
**Date**: _______________  
**Time Spent**: _______________  
**Overall Status**: [PASS / FAIL / PARTIAL]
