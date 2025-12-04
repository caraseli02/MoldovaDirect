# Manual Testing Checklist
## Express Checkout Smart Pre-Population Feature

Use this checklist to manually verify the checkout smart pre-population feature.

---

## Prerequisites

- [ ] Server running at http://localhost:3000
- [ ] Test user credentials: customer@moldovadirect.com / Customer123!@#
- [ ] Database has test user with saved addresses
- [ ] Browser DevTools open (for console monitoring)

---

## Test Scenario 1: New User (No Saved Addresses)

**Expected:** Standard checkout form, NO Express Checkout Banner

### Steps:
1. [ ] Create new test user account (or use user without saved addresses)
2. [ ] Add product to cart
3. [ ] Navigate to /checkout
4. [ ] **VERIFY:** No Express Checkout Banner visible
5. [ ] **VERIFY:** Standard shipping form displays
6. [ ] **VERIFY:** All form fields are empty
7. [ ] Fill out shipping form completely
8. [ ] Check "Save address for future purchases" checkbox
9. [ ] Complete checkout
10. [ ] **VERIFY:** Address saved to database

**Screenshot:** Capture checkout page for new user

---

## Test Scenario 2: Returning User (With Saved Addresses)

**Expected:** Express Checkout Banner appears, form pre-populated

### Steps:
1. [ ] Sign in as: customer@moldovadirect.com / Customer123!@#
2. [ ] Add product to cart
3. [ ] Navigate to /checkout

### CRITICAL VERIFICATION - Express Checkout Banner:
4. [ ] **VERIFY:** Express Checkout Banner is visible
5. [ ] **VERIFY:** Banner displays saved address details:
   - [ ] Full name shown
   - [ ] Street address shown
   - [ ] City, postal code shown
   - [ ] Country shown
6. [ ] **VERIFY:** Banner shows preferred shipping method (if set)
7. [ ] **VERIFY:** "Use Express Checkout" button present
8. [ ] **VERIFY:** "Edit Details" button present
9. [ ] **VERIFY:** Close/dismiss button present

**Screenshot:** Capture Express Checkout Banner (THIS IS THE KEY SCREENSHOT)

### Form Pre-Population:
10. [ ] Scroll down to shipping form
11. [ ] **VERIFY:** Shipping form fields are pre-populated with saved data:
    - [ ] Full name field
    - [ ] Address field
    - [ ] City field
    - [ ] Postal code field
    - [ ] Country field
    - [ ] Phone field
    - [ ] Email field
12. [ ] **VERIFY:** User can still edit any field
13. [ ] **VERIFY:** Changes don't affect saved address unless explicitly saved

**Screenshot:** Capture pre-populated form

---

## Test Scenario 3: Express Checkout Banner Interactions

### 3A: "Use Express Checkout" Button
1. [ ] Click "Use Express Checkout" button
2. [ ] **VERIFY:** Form scrolls or focuses to next section
3. [ ] **VERIFY:** Saved shipping method pre-selected (if applicable)
4. [ ] **VERIFY:** User can proceed to payment immediately
5. [ ] **VERIFY:** No required fields show validation errors

### 3B: "Edit Details" Button
1. [ ] Click "Edit Details" button
2. [ ] **VERIFY:** Banner dismisses or collapses
3. [ ] **VERIFY:** Form remains editable
4. [ ] **VERIFY:** Pre-populated data still present

### 3C: Dismiss Banner
1. [ ] Refresh page
2. [ ] Click close/dismiss button on banner
3. [ ] **VERIFY:** Banner disappears
4. [ ] **VERIFY:** Form still pre-populated
5. [ ] **VERIFY:** Banner doesn't re-appear on same session

---

## Test Scenario 4: Multiple Saved Addresses

**Expected:** Default address used, option to select different address

### Steps:
1. [ ] Ensure test user has 2+ saved addresses
2. [ ] Add product to cart
3. [ ] Navigate to /checkout
4. [ ] **VERIFY:** Express Checkout Banner shows default address
5. [ ] **VERIFY:** Option to select different address (if implemented)
6. [ ] Select different address
7. [ ] **VERIFY:** Form updates with new address
8. [ ] **VERIFY:** Express Checkout Banner updates

**Screenshot:** Capture address selection

---

## Test Scenario 5: Edge Cases

### 5A: Empty Cart
1. [ ] Navigate to /checkout with empty cart
2. [ ] **VERIFY:** Redirect to /cart with message
3. [ ] **VERIFY:** No errors in console

### 5B: Guest Checkout
1. [ ] Sign out
2. [ ] Add product to cart
3. [ ] Navigate to /checkout
4. [ ] **VERIFY:** No Express Checkout Banner
5. [ ] **VERIFY:** Standard checkout form
6. [ ] **VERIFY:** Option to sign in

### 5C: Incomplete Saved Address
1. [ ] Use account with incomplete saved address
2. [ ] Navigate to /checkout
3. [ ] **VERIFY:** Banner appears but shows warning OR
4. [ ] **VERIFY:** Banner doesn't appear and form partially filled

---

## Console Error Check

Throughout all tests, monitor browser console for:
- [ ] No JavaScript errors
- [ ] No failed network requests (500 errors)
- [ ] No React/Vue warnings
- [ ] No CORS errors

**Screenshot:** Console if any errors appear

---

## Visual Regression Comparison

For each critical screenshot, check:
- [ ] Express Checkout Banner styling correct
- [ ] Banner colors match design (indigo gradient)
- [ ] Lightning bolt icon visible
- [ ] Text properly aligned
- [ ] Responsive design works on mobile
- [ ] Dark mode styling correct
- [ ] Buttons have proper hover states

---

## Performance Check

- [ ] Banner loads within 1 second of page load
- [ ] No layout shift when banner appears
- [ ] Form pre-population immediate (no delay)
- [ ] Address data fetches efficiently

---

## Accessibility Check

- [ ] Banner has proper ARIA labels
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Screen reader announces banner
- [ ] All buttons keyboard accessible

---

## i18n Check

Test with different locales:
- [ ] Spanish (es): "Pago Express"
- [ ] English (en): "Express Checkout"
- [ ] Romanian (ro): Translated
- [ ] Russian (ru): Translated

---

## Success Criteria

Feature is ready to merge if:
- ✅ All checkboxes above are checked
- ✅ No critical errors in console
- ✅ Express Checkout Banner appears for returning users
- ✅ Form pre-population works correctly
- ✅ All buttons functional
- ✅ No visual regressions from main branch
- ✅ Performance acceptable
- ✅ Accessibility requirements met

---

## Results Template

```
Test Date: ___________
Tested By: ___________
Browser: ___________
Test Status: [ PASS / FAIL / PARTIAL ]

Scenario 1 (New User): [ PASS / FAIL ]
Scenario 2 (Returning User): [ PASS / FAIL ]
Scenario 3 (Banner Interactions): [ PASS / FAIL ]
Scenario 4 (Multiple Addresses): [ PASS / FAIL ]
Scenario 5 (Edge Cases): [ PASS / FAIL ]

Critical Issues Found:
-
-

Non-Critical Issues:
-
-

Screenshots Captured: _____ files
Ready for Merge: [ YES / NO ]

Notes:


```

---

## Screenshot Naming Convention

Save screenshots as:
- `manual-01-new-user-checkout.png`
- `manual-02-express-banner-visible.png`
- `manual-03-form-prepopulated.png`
- `manual-04-use-express-clicked.png`
- `manual-05-multiple-addresses.png`
- `manual-06-console-errors.png` (if any)

---

**Created:** 2025-11-23  
**For Feature:** Checkout Smart Pre-Population (commits 5869cd9, 57e4f63)  
**Reference:** /visual-regression-test/VISUAL_REGRESSION_TEST_REPORT.md
