# Quick Start Testing Guide

**Last Updated:** 2025-12-04

---

## TL;DR - Run Tests

```bash
# Pre-commit smoke tests (< 30 seconds)
pnpm run test:pre-commit

# Unit tests only
pnpm run test:unit

# Quick unit tests on changed files
pnpm run test:quick

# Full e2e test suite
pnpm test

# Visual regression tests
pnpm run test:visual
```

---

## Test Tiers

### Tier 0: Smoke Tests (Pre-Commit)
**Run:** Every commit via git hook
**Duration:** < 30 seconds
**Location:** `tests/pre-commit/`
**Command:** `pnpm run test:pre-commit`

**What it tests:**
- Homepage loads
- Can navigate to products
- Can add product to cart

**Purpose:** Catch obvious breakage before commit.

---

### Tier 1: Unit Tests
**Run:** Every commit via git hook
**Duration:** < 10 seconds
**Location:** `tests/unit/`
**Command:** `pnpm run test:unit`

**What it tests:**
- Individual functions and composables
- Business logic in isolation
- Edge cases and error handling

**Purpose:** Fast feedback on code changes.

---

### Tier 2: Full E2E Suite
**Run:** Pre-push, CI/CD
**Duration:** < 20 minutes (39 files)
**Location:** `tests/e2e/`
**Command:** `pnpm test`

**What it tests:**
- Complete user journeys
- Auth flows (login, register, logout)
- Shopping flows (products, cart, checkout)
- Admin panel functionality
- i18n, accessibility, mobile

**Purpose:** Comprehensive feature testing.

---

### Tier 3: Visual Regression
**Run:** On-demand, weekly
**Duration:** < 10 minutes
**Location:** `tests/visual/`
**Command:** `pnpm run test:visual`

**What it tests:**
- UI consistency across themes
- Layout across devices
- Component visual stability

**Purpose:** Catch visual regressions.

---

## Pre-Commit Hook

The pre-commit hook automatically runs when you commit:

```bash
git commit -m "your message"
```

**What it does:**
1. Checks for misplaced .md files
2. Runs unit tests on changed files
3. Runs smoke tests (< 30 seconds)

**To skip (not recommended):**
```bash
git commit --no-verify -m "your message"
```

---

## Pre-Push Hook

The pre-push hook runs when you push:

```bash
git push
```

**What it does:**
1. Runs unit tests with coverage
2. Detects relevant e2e tests based on changed files
3. Shows which tests should be run (but doesn't run them)

**Note:** E2E tests are skipped in pre-push for speed. CI/CD will run full suite.

---

## Common Test Commands

### Development
```bash
# Run tests in watch mode
pnpm run test:unit:watch

# Run tests with UI
pnpm run test:ui

# Run tests in headed mode (see browser)
pnpm run test:headed

# Run specific test file
pnpm test tests/e2e/home.spec.ts

# Debug tests
pnpm run test:debug
```

### Coverage
```bash
# Run tests with coverage report
pnpm run test:coverage

# Check coverage meets thresholds
pnpm run test:coverage:check

# View coverage report in browser
pnpm run test:coverage:ui
# Then open: http://localhost:51204/__vitest__/
```

### Specific Test Suites
```bash
# Auth tests
pnpm run test:auth

# Checkout tests
pnpm run test:checkout

# Product tests
pnpm run test:products

# Visual tests
pnpm run test:visual

# Update visual snapshots
pnpm run test:visual:update
```

### Browser-Specific
```bash
# Chrome only
pnpm run test:chromium

# Firefox only
pnpm run test:firefox

# Safari only
pnpm run test:webkit

# Mobile
pnpm run test:mobile
```

---

## Test File Structure

```
tests/
├── pre-commit/           # Smoke tests (Tier 0)
│   └── smoke.spec.ts     # 3 tests, < 30 seconds
│
├── unit/                 # Unit tests (Tier 1)
│   ├── cart/             # Cart logic tests
│   ├── checkout/         # Checkout logic tests
│   └── *.spec.ts         # Various unit tests
│
├── e2e/                  # E2E tests (Tier 2)
│   ├── auth/             # Authentication tests
│   ├── admin/            # Admin panel tests
│   ├── home.spec.ts      # Homepage tests
│   ├── cart-functionality.spec.ts
│   ├── checkout-full-flow.spec.ts
│   ├── products-pagination.spec.ts
│   └── ... (39 files total)
│
├── visual/               # Visual regression (Tier 3)
│   ├── theme-validation.spec.ts
│   └── ui-validation.spec.ts
│
├── fixtures/             # Test data and utilities
├── setup/                # Test setup scripts
└── global-setup.ts       # Global test setup
```

---

## Writing Tests

### Smoke Test Example
```typescript
// tests/pre-commit/smoke.spec.ts
import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Moldova Direct/i)
})
```

### Unit Test Example
```typescript
// tests/unit/cart/cart-math.spec.ts
import { describe, it, expect } from 'vitest'
import { calculateTotal } from '~/composables/useCart'

describe('Cart calculations', () => {
  it('calculates total correctly', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 1 }
    ]
    expect(calculateTotal(items)).toBe(25)
  })
})
```

### E2E Test Example
```typescript
// tests/e2e/products.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Products', () => {
  test('can view product list', async ({ page }) => {
    await page.goto('/products')
    const products = page.locator('[data-testid="product-card"]')
    await expect(products).toHaveCount(10, { timeout: 5000 })
  })
})
```

---

## Troubleshooting

### Tests are slow
```bash
# Run only changed tests
pnpm run test:quick

# Run specific browser
pnpm run test:chromium
```

### Tests fail locally but pass in CI
```bash
# Clear cache and rebuild
pkill -9 node
rm -rf .nuxt node_modules/.vite
pnpm install
pnpm run dev

# In another terminal
pnpm test
```

### Pre-commit hook fails
```bash
# See what's failing
pnpm run test:pre-commit

# Skip if urgent (not recommended)
git commit --no-verify -m "message"
```

### Visual snapshots don't match
```bash
# Update snapshots (review changes first!)
pnpm run test:visual:update

# View the diff
open test-results/visual-report/index.html
```

### Global setup authentication fails
```bash
# Check your .env file has:
TEST_USER_EMAIL=teste2e@example.com
TEST_USER_PASSWORD=your-password

# Check user exists in Supabase
# Check dev server is running on port 3000
```

---

## CI/CD Integration

### GitHub Actions
The CI/CD pipeline runs tests automatically:

1. **On Pull Request:**
   - Unit tests with coverage
   - E2E tests (Chrome, Spanish locale)
   - Visual regression tests

2. **On Push to Main:**
   - Full test suite (all browsers, all locales)
   - Coverage reports uploaded
   - Test results published

### Test Results
- **HTML Report:** Available in Actions artifacts
- **Coverage Report:** Posted as PR comment
- **Test Summary:** Shown in PR checks

---

## Best Practices

### DO
- ✅ Run `pnpm run test:pre-commit` before committing
- ✅ Write tests for new features
- ✅ Keep tests focused and fast
- ✅ Use data-testid for reliable selectors
- ✅ Mock external APIs in tests

### DON'T
- ❌ Skip pre-commit hooks (use --no-verify)
- ❌ Write overly complex tests
- ❌ Use fragile CSS selectors
- ❌ Commit failing tests
- ❌ Ignore failing tests in CI

---

## Getting Help

### Test Not Found
```bash
# List all available tests
pnpm test --list

# Run with verbose output
pnpm test --reporter=verbose
```

### Need More Info
- See: `docs/testing/E2E_TEST_REVIEW_AND_FIXES.md`
- See: `tests/AUTH_TESTING_GUIDE.md`
- See: Playwright config: `playwright.config.ts`

### Still Stuck?
1. Check test output for error messages
2. Run tests in headed mode: `pnpm run test:headed`
3. Use debug mode: `pnpm run test:debug`
4. Ask the team in Slack

---

## Test Coverage Goals

| Type | Current | Target |
|------|---------|--------|
| Unit Tests | ~60% | 80% |
| E2E Tests | ~70% | 60% (focused) |
| Visual Tests | ~30% | 50% |

---

**Happy Testing!** 🎭
