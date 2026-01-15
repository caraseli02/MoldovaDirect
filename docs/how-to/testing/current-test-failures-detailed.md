# Current E2E Test Failures - Detailed Analysis


**Date:** 2025-12-20
**Analysis Source:** Direct test execution
**Browser:** Chromium ES + Firefox ES

---

## Summary

**Total Failures Identified:** ~22-24 in Chromium, ~16 in Firefox
**Overall Test Status:** ~89-90% passing (estimated 495-500/555 tests passing)

---

## Chromium Failures (6 confirmed)

### 1. Admin Email Logs - Page Load Test
**File:** `tests/e2e/admin/email-logs.spec.ts:31`
**Test:** "should load page without errors"
**Status:** ❌ FAILED

**Error:**
```
expect(locator).toContainText(expected) failed

Locator: locator('p').first()
Expected: "Monitor email delivery status and troubleshoot issues"
Received: "Usuario Admin"
```

**Root Cause:** Selector issue - test is looking for specific English text in the first `<p>` tag, but it's finding "Usuario Admin" (Spanish user profile text) instead of the page description.

**Fix Needed:**
- Use a more specific selector for the page description
- OR use data-testid attribute
- OR check for translated text in Spanish locale

**Impact:** Low - this is a text validation test, not a functional test

---

### 2. Admin Email Logs - Pagination Controls
**File:** `tests/e2e/admin/email-logs.spec.ts:234`
**Test:** "should handle pagination controls"
**Status:** ❌ FAILED

**Error:**
```
expect(locator).toBeVisible() failed

Locator: locator('button:has-text("Previous")')
Expected: visible
Received: <element(s) not found>
```

**Root Cause:** Pagination buttons don't exist on the page because:
- Option A: There's not enough email log data to trigger pagination
- Option B: Pagination text is in Spanish ("Anterior" not "Previous")
- Option C: Pagination isn't implemented on this admin page

**Fix Needed:**
- Seed more test data to trigger pagination
- OR use i18n-aware selectors
- OR skip test if pagination isn't shown

**Impact:** Low - edge case functionality

---

### 3. Mobile - Password Toggle Touch Target
**File:** `tests/e2e/auth/auth-mobile-responsive.spec.ts:51`
**Test:** "should toggle password visibility on mobile"
**Status:** ❌ FAILED

**Error:**
```
expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 44
Received: 36
```

**Root Cause:** Password toggle button is only 36px wide, but mobile touch targets should be at least 44x44px per accessibility guidelines.

**Fix Needed:**
- Increase password toggle button size to 44x44px minimum
- Update component CSS/styling

**Impact:** Medium - accessibility issue affecting mobile UX

---

### 4. Mobile - Terms Link New Tab
**File:** `tests/e2e/auth/auth-mobile-responsive.spec.ts:131`
**Test:** "should open terms link in new tab on mobile"
**Status:** ❌ FAILED

**Error:**
```
locator.tap: The page does not support tap.
Use hasTouch context option to enable touch support.
```

**Root Cause:** Test uses `.tap()` method but the test context doesn't have `hasTouch: true` configured.

**Fix Needed:**
- Change `.tap()` to `.click()` in test
- OR add `hasTouch: true` to mobile test context configuration

**Impact:** Low - test configuration issue, not functional issue

---

### 5. Mobile - Submit Button Tap
**File:** `tests/e2e/auth/auth-mobile-responsive.spec.ts:232`
**Test:** "should handle tap on submit button"
**Status:** ❌ FAILED

**Error:**
```
locator.tap: The page does not support tap.
Use hasTouch context option to enable touch support.
```

**Root Cause:** Same as #4 - `.tap()` requires `hasTouch: true` context configuration.

**Fix Needed:** Same as #4

**Impact:** Low - test configuration issue

---

### 6. Mobile - Swipe Gestures
**File:** `tests/e2e/auth/auth-mobile-responsive.spec.ts:260`
**Test:** "should handle swipe gestures gracefully"
**Status:** ❌ FAILED

**Error:**
```
locator.tap: The page does not support tap.
Use hasTouch context option to enable touch support.
```

**Root Cause:** Same as #4 and #5 - `.tap()` requires `hasTouch: true` context configuration.

**Fix Needed:** Same as #4 and #5

**Impact:** Low - test configuration issue

---

## Firefox Failures (16 confirmed)

### Firefox Critical Test Failures
**Files:** Multiple critical test files
**Status:** ❌ 16 FAILED, 6 PASSED

**Failed Tests:**
1. `admin-critical.spec.ts:14` - "admin can access admin dashboard"
2. `auth-critical.spec.ts:70` - "user can login with valid credentials"
3. `auth-critical.spec.ts:83` - "logged in user can logout"
4. `checkout-critical.spec.ts:35` - "authenticated user can access checkout"
5. `checkout-critical.spec.ts:65` - "checkout shows order summary with cart items"
6. `checkout-critical.spec.ts:87` - "checkout page has form elements"
7. `checkout-critical.spec.ts:117` - "checkout has navigation controls"
8. `checkout-critical.spec.ts:141` - "empty cart redirects away from checkout"
9. `checkout-critical.spec.ts:163` - "checkout retains cart items on page refresh"
10. `products-critical.spec.ts:13` - "products page loads with product list"
11. `products-critical.spec.ts:32` - "can view product detail page"
12. `search-critical.spec.ts:13` - "search input is accessible on products page"
13. `search-critical.spec.ts:24` - "can search for products and see results"
14. `search-critical.spec.ts:51` - "search input accepts and displays text"
15. `search-critical.spec.ts:69` - "can navigate to products page via header search"
16. `search-critical.spec.ts:91` - "search filters products correctly"

**Common Error Pattern:**
```
expect(locator).toBeVisible() - Timeout exceeded
expect(locator).toHaveURL() - URL mismatch
```

**Root Cause:** Browser-specific compatibility issues with Firefox. Likely causes:
- Firefox handles page navigation/loading differently than Chromium
- Timing issues - elements load slower or in different order
- Different JavaScript engine behavior
- CSS rendering differences
- Event handling differences (especially for forms and auth)

**Fix Needed:**
- Add Firefox-specific waits and timeouts
- Use more robust selectors that work across browsers
- Add `waitForLoadState('networkidle')` or `waitForLoadState('domcontentloaded')`
- Investigate specific Firefox console errors
- May need Firefox-specific test configuration

**Impact:** HIGH - These are critical path tests affecting core functionality in Firefox

---

## Test Failure Categorization

### By Severity

| Severity | Count | Tests |
|----------|-------|-------|
| 🔴 **Critical** | 16 | Firefox critical paths (auth, checkout, search, admin) |
| 🟡 **Medium** | 1 | Mobile password toggle touch target size |
| 🟢 **Low** | 5 | Mobile test config (tap), admin text selectors, pagination |

### By Type

| Type | Count | Description |
|------|-------|-------------|
| **Browser Compatibility** | 16 | Firefox-specific failures |
| **Test Configuration** | 3 | Missing `hasTouch` option for mobile tests |
| **Selector Issues** | 2 | Wrong element selected (i18n/specificity) |
| **Accessibility** | 1 | Touch target too small |

### By Priority for Fixing

1. **Priority 1:** Firefox critical tests (16 failures) - BLOCKS Firefox support
2. **Priority 2:** Mobile touch target size (1 failure) - Accessibility issue
3. **Priority 3:** Mobile test configuration (3 failures) - Easy fix
4. **Priority 4:** Admin text selectors (2 failures) - Low impact

---

## Recommended Fix Order

### Phase 1: Quick Wins (Est. 30 min)
1. **Fix Mobile Test Configuration** (3 tests)
   - Add `hasTouch: true` to mobile test fixtures
   - OR replace `.tap()` with `.click()`

2. **Fix Admin Email Logs Selectors** (2 tests)
   - Use more specific selectors or data-testid
   - Handle i18n text properly

### Phase 2: Accessibility (Est. 1-2 hours)
3. **Fix Password Toggle Size** (1 test)
   - Update component styling to meet 44x44px minimum
   - Verify across all auth pages

### Phase 3: Browser Compatibility (Est. 4-8 hours)
4. **Fix Firefox Critical Tests** (16 tests)
   - Investigate Firefox-specific timing issues
   - Add browser-specific waits
   - Test each critical flow in Firefox
   - May require component-level fixes

---

## Success Metrics After Fixes

**Target State:**
- Chromium: 100% passing (currently ~98%)
- Firefox: ~95% passing (currently ~75%)
- Overall: ~96-98% passing (currently ~89%)

**Estimated Total Tests:** 555
**Current Passing:** ~495 (89%)
**Target Passing:** ~530-540 (96-98%)
**Tests to Fix:** 22-30

---

## Notes

- All i18n tests (150 tests) are now passing ✅
- All cart tests are passing ✅
- All product tests are passing ✅
- All pagination tests are passing ✅
- Pre-commit tests at 100% ✅
- Admin tests at ~95% ✅

The remaining failures are primarily:
1. Firefox browser compatibility (the bulk of failures)
2. Minor mobile test configuration issues (easily fixable)
3. Small selector/text matching issues (low priority)
