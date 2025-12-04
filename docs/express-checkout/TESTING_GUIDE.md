# Testing Guide - Express Checkout & Full Checkout Flow

## Overview

This project includes comprehensive E2E tests for the checkout flow, including the new Express Checkout feature.

---

## Test Credentials

All tests use credentials from `.env`:

```bash
TEST_USER_EMAIL=teste2e@example.com
TEST_USER_PASSWORD=N7jKAcu2FHbt7cj
```

**Important**: Make sure this user exists in your Supabase database before running tests.

---

## Test Suites

### 1. Pre-Commit Smoke Tests (Fast)
**File**: `tests/pre-commit/smoke.spec.ts`
**Duration**: < 60 seconds
**Purpose**: Quick validation before commits

```bash
pnpm test:pre-commit
```

**Tests**:
- Homepage loads without errors
- Products page loads with products
- Add to cart works
- Cart page loads with added item
- Checkout page loads (guest)
- Login page loads
- Admin/Profile redirect to login
- API endpoints work

---

### 2. Full Checkout Flow (Comprehensive)
**File**: `tests/e2e/checkout-full-flow.spec.ts`
**Duration**: 1-2 minutes
**Purpose**: End-to-end checkout validation

```bash
# Run in headless mode
pnpm test:checkout-flow

# Run in headed mode (watch browser)
pnpm test:checkout-flow:headed
```

**Test Scenarios**:

#### Scenario 1: Authenticated User Checkout
1. ✅ Login with test credentials
2. ✅ Add 2 products to cart
3. ✅ Navigate to cart
4. ✅ Proceed to checkout
5. ✅ Detect Express Checkout features:
   - Auto-routing to payment (if user has saved data)
   - Countdown timer (if preferred shipping method exists)
   - Express Checkout banner (if no preferred method)
   - Pre-filled forms
6. ✅ Fill shipping information (if not pre-filled)
7. ✅ Select shipping method
8. ✅ Navigate to payment page
9. ✅ Verify payment form visible

#### Scenario 2: Guest User Checkout
1. ✅ Add product without login
2. ✅ Navigate to checkout
3. ✅ Verify NO auto-routing (guests stay on shipping)
4. ✅ Verify NO Express Checkout banner
5. ✅ Verify guest email form visible

---

### 3. Express Checkout Specific Tests
**File**: `tests/e2e/express-checkout/express-checkout.spec.ts`
**Duration**: 2-3 minutes
**Purpose**: Detailed Express Checkout feature testing

```bash
pnpm test:express-checkout
pnpm test:express-checkout:headed
```

**Test Scenarios**:
- Auto-skip flow with countdown
- Countdown decreases from 5 to 1
- Cancel button stops countdown
- Manual Express Checkout flow
- Guest checkout (no express features)
- Edge cases and error handling
- Multi-language support

---

## Running Tests

### Prerequisites

1. **Dev server must be running**:
   ```bash
   npm run dev
   ```

2. **Test user must exist in database**:
   - Email: `teste2e@example.com`
   - Password: `N7jKAcu2FHbt7cj`

3. **Supabase connection** must be working

### Run All Tests

```bash
# All E2E tests (slow)
pnpm test

# Pre-commit tests only (fast)
pnpm test:pre-commit

# Full checkout flow
pnpm test:checkout-flow

# Express checkout tests
pnpm test:express-checkout
```

### Run in Headed Mode (Watch Browser)

```bash
pnpm test:checkout-flow:headed
pnpm test:express-checkout:headed
```

### Debug a Specific Test

```bash
# Run specific test file
npx playwright test tests/e2e/checkout-full-flow.spec.ts

# Debug mode (pause execution)
npx playwright test tests/e2e/checkout-full-flow.spec.ts --debug

# Run with browser visible
npx playwright test tests/e2e/checkout-full-flow.spec.ts --headed
```

---

## Test Data Setup

### Option 1: Using Existing User

If `teste2e@example.com` already exists, you're good to go!

### Option 2: Create Test User

Run this SQL in your Supabase SQL editor:

```sql
-- Create test user (if doesn't exist)
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
VALUES (
  'teste2e@example.com',
  crypt('N7jKAcu2FHbt7cj', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Optional: Add saved address for Express Checkout testing
INSERT INTO user_addresses (
  user_id,
  first_name,
  last_name,
  street,
  city,
  postal_code,
  country,
  is_default
)
SELECT
  id,
  'Test',
  'User',
  '123 Test Street',
  'Test City',
  '12345',
  'US',
  true
FROM auth.users
WHERE email = 'teste2e@example.com';

-- Optional: Add preferred shipping method for auto-skip testing
INSERT INTO user_checkout_preferences (
  user_id,
  preferred_shipping_method
)
SELECT
  id,
  'standard'
FROM auth.users
WHERE email = 'teste2e@example.com'
ON CONFLICT (user_id) DO UPDATE
SET preferred_shipping_method = 'standard';
```

---

## Expected Behavior

### Express Checkout: Auto-Skip Mode
**When**: User has saved address + preferred shipping method

1. Click "Checkout" from cart
2. **Auto-routes** to `/checkout/payment?express=1`
3. Shows **5-second countdown timer**
4. Progress bar fills up
5. "Cancel" button available
6. After countdown → Shows payment form with pre-filled data

### Express Checkout: Manual Mode
**When**: User has saved address but NO preferred shipping method

1. Click "Checkout" from cart
2. Lands on `/checkout` (shipping page)
3. Shows **Express Checkout Banner** at top
4. Click "Use Express Checkout" button
5. Form pre-fills with saved address
6. User selects shipping method
7. Continue to payment

### Guest Checkout
**When**: User not logged in

1. Click "Checkout" from cart
2. Lands on `/checkout` (shipping page)
3. **NO Express Checkout features**
4. Shows guest email form
5. Normal checkout flow

---

## Troubleshooting

### Tests Failing?

**Issue**: `page.goto: Timeout 30000ms exceeded`
- **Fix**: Make sure dev server is running on port 3000
- **Check**: `npm run dev` in terminal

**Issue**: `Login failed`
- **Fix**: Check test user exists in database
- **Verify**: Run SQL query: `SELECT * FROM auth.users WHERE email = 'teste2e@example.com'`

**Issue**: `Express Checkout not showing`
- **Fix**: User needs saved address in database
- **Add**: Run the SQL queries in "Test Data Setup" section

**Issue**: `Auto-skip not working`
- **Fix**: User needs `preferred_shipping_method` in `user_checkout_preferences` table
- **Add**: Run the SQL query to insert shipping preference

### View Test Results

```bash
# Generate HTML report
npx playwright show-report

# View last test results
ls test-results/
```

### Clear Test Cache

```bash
rm -rf test-results/
rm -rf playwright-report/
```

---

## CI/CD Integration

Tests are configured to run in GitHub Actions:

```yaml
# .github/workflows/test.yml
- name: Run E2E Tests
  run: pnpm test
  env:
    TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
    TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
```

---

## Test Coverage

| Feature | Smoke Tests | Full Flow | Express Tests |
|---------|-------------|-----------|---------------|
| Homepage | ✅ | - | - |
| Products | ✅ | ✅ | ✅ |
| Cart | ✅ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ |
| Checkout | ✅ | ✅ | ✅ |
| Express Auto-Skip | - | ✅ | ✅ |
| Countdown Timer | - | ✅ | ✅ |
| Express Banner | - | ✅ | ✅ |
| Guest Checkout | ✅ | ✅ | ✅ |
| Payment | - | ✅ | ✅ |
| Multi-language | - | - | ✅ |

---

## Next Steps

1. Run smoke tests: `pnpm test:pre-commit`
2. Run full checkout flow: `pnpm test:checkout-flow:headed`
3. Verify Express Checkout works manually in browser
4. Create pull request with test evidence

---

**Last Updated**: 2025-11-27
**Test User**: teste2e@example.com
**Status**: ✅ All tests created and ready to run
