# Moldova Direct - Testing Strategy Review

**Review Date:** November 27, 2025
**Status:** In-depth analysis of current testing state and recommendations

---

## Executive Summary

The project has a foundational testing infrastructure with **65+ test files** across unit, integration, and E2E tests. However, there are significant gaps in coverage, especially for components (2% coverage) and stores (0% coverage). The testing strategy is partially implemented with good patterns in place but requires systematic expansion.

---

## Current Testing State

### Test File Distribution

| Category | Total Files | Tests | Coverage |
|----------|-------------|-------|----------|
| Composables | 50 | 9 | **18%** |
| Components | 239 | 5 | **2%** |
| Pinia Stores | 25 | 0 | **0%** |
| Server API Routes | 108 | 10 | **9%** |
| Server Utils | 31 | 6 | **19%** |
| Middleware | 7 | 2 | **29%** |
| Pages | 47 | 0 | **0%** (E2E only) |

### Testing Frameworks

| Framework | Purpose | Status |
|-----------|---------|--------|
| Vitest | Unit & Integration tests | Configured |
| Playwright | E2E tests | Configured |
| @vue/test-utils | Component testing | Available |
| @pinia/testing | Store testing | Available |
| @axe-core/playwright | Accessibility | Installed |

---

## What's Working Well

### 1. Test Infrastructure
- **Dual Vitest configuration**: Separate configs for unit (`vitest.config.ts`) and integration tests (`vitest.config.integration.ts`)
- **Comprehensive Playwright setup**: Multi-browser, multi-locale support (es, en, ro, ru)
- **Test utilities**: Well-organized mock utilities (`tests/utils/`) for Stripe, Supabase, etc.
- **Nuxt auto-import mocking**: Proper mocking of Nuxt composables in `tests/setup/vitest.setup.ts`

### 2. Test Quality Patterns
- **Security-focused tests**: RBAC authorization tests for admin endpoints (`authorization.test.ts`)
- **Critical path coverage**: Cart auto-save, checkout session persistence
- **Regression tests**: Admin middleware security regression tests
- **Error handling tests**: Stripe error formatting, payment failures

### 3. E2E Test Coverage
- **41 E2E test files** covering:
  - Authentication flows (login, register, password reset, logout)
  - Cart functionality
  - Admin dashboard operations
  - Security/GDPR compliance
  - Accessibility testing

### 4. Test Organization
```
tests/
├── e2e/              # Playwright E2E tests
│   ├── admin/        # Admin panel tests
│   ├── auth/         # Authentication tests
│   └── ...
├── unit/             # Unit tests
├── integration/      # Integration tests
├── server/           # Server-side tests
│   ├── api/          # API endpoint tests
│   └── utils/        # Utility tests
├── middleware/       # Middleware tests
├── setup/            # Test configuration
└── utils/            # Test utilities
```

---

## Critical Gaps & Issues

### 1. Zero Store Coverage (Priority: HIGH)

**Problem:** Pinia stores have **0% test coverage** despite being critical for state management.

**Impact:**
- Cart store (`stores/cart/`) handles payment-critical logic
- Auth store manages user sessions
- Checkout stores coordinate multi-step purchase flow

**Affected Files:**
- `stores/cart/core.ts` - Cart operations
- `stores/cart/persistence.ts` - Cookie persistence
- `stores/cart/validation.ts` - Input validation
- `stores/checkout.ts` - Checkout flow
- `stores/auth.ts` - Authentication state
- `stores/adminOrders.ts` - Order management

### 2. Minimal Component Coverage (Priority: HIGH)

**Problem:** Only **5 of 239 components** (2%) have unit tests.

**Tested Components:**
- `VideoHero.test.ts`
- `ChartLoader.test.ts`
- `AsyncTableWrapper.test.ts`
- `AppFooter.test.ts`
- `AppHeader.test.ts`

**Missing Critical Components:**
- `components/checkout/*` - Payment forms
- `components/cart/*` - Cart UI
- `components/product/*` - Product display
- `components/admin/*` - Admin interfaces

### 3. Disabled Coverage Thresholds (Priority: MEDIUM)

**Problem:** Coverage thresholds are commented out in `vitest.config.ts:56-90`:
```typescript
// TODO: Re-enable coverage thresholds after completing test coverage improvements
// Temporarily disabled to allow lockfile fix to be pushed
// thresholds: {
//   global: {
//     branches: 70,
//     functions: 75,
//     lines: 80,
//     statements: 80,
//   },
// ...
```

**Impact:** No enforcement of minimum coverage, leading to coverage regression.

### 4. E2E Tests Disabled in CI (Priority: HIGH)

**Problem:** E2E tests are disabled in `.github/workflows/e2e-tests.yml`:
```yaml
# E2E tests are temporarily disabled - uncomment when database setup is configured
placeholder:
  name: Tests Placeholder
  runs-on: ubuntu-latest
  steps:
    - name: Tests disabled
      run: echo "E2E tests are temporarily disabled"
```

**Impact:** No automated E2E test execution on PRs or main branch.

### 5. Skipped Tests (Priority: MEDIUM)

**Problem:** Multiple tests are skipped due to architectural issues:

In `useStripe.test.ts`:
```typescript
// Note: The following tests are skipped due to module-level singleton pattern
// TODO: Refactor composable to support test isolation or use vi.resetModules()
it.skip('handles missing publishable key', async () => { ... })
it.skip('handles Stripe loading failure', async () => { ... })
```

**Impact:** Error handling paths are not tested for payment processing.

### 6. No Visual Regression Tests (Priority: MEDIUM)

**Problem:** `tests/visual/` directory is empty despite being configured:
```typescript
// playwright.config.ts
'test:visual': 'PLAYWRIGHT_TEST=true playwright test tests/visual',
```

**Impact:** UI changes can break without detection.

### 7. Missing API Route Tests (Priority: HIGH)

**Problem:** Only 10 of 108 API routes (9%) have tests.

**Untested Critical Endpoints:**
- `server/api/checkout/create-payment-intent.post.ts`
- `server/api/checkout/confirm-payment.post.ts`
- `server/api/orders/create.post.ts`
- Most `server/api/admin/*` endpoints

---

## Best Practices Comparison

### Applied Best Practices

| Practice | Status | Location |
|----------|--------|----------|
| Test isolation | Partial | `beforeEach` cleanup in most tests |
| Meaningful test names | Yes | Descriptive `describe` and `it` blocks |
| AAA pattern | Yes | Arrange-Act-Assert in unit tests |
| Mock external services | Yes | Stripe, Supabase mocks in `tests/utils/` |
| Security testing | Yes | RBAC, auth middleware tests |
| Multi-locale E2E | Yes | All 4 locales in Playwright config |

### Missing Best Practices

| Practice | Status | Recommendation |
|----------|--------|----------------|
| Coverage thresholds | Disabled | Re-enable with realistic targets |
| CI test execution | Disabled | Fix database setup, enable CI |
| Snapshot testing | None | Add for component output |
| Performance testing | None | Add load tests for critical APIs |
| Contract testing | None | Add for API versioning |
| Mutation testing | None | Consider for critical paths |
| Test data factories | Partial | Expand `tests/utils/create*.ts` |

---

## Recommended Actions

### Immediate (Week 1-2)

1. **Enable E2E tests in CI**
   - Configure test database in GitHub Actions
   - Use Supabase CLI for local database
   - Uncomment workflow jobs

2. **Add Pinia store tests**
   - Priority: `cart/core.ts`, `auth.ts`, `checkout.ts`
   - Use `@pinia/testing` package
   - Test computed properties and actions

3. **Re-enable coverage thresholds**
   - Start with lower thresholds (50% global)
   - Incrementally increase as tests are added

### Short-term (Week 3-4)

4. **Test critical composables**
   - `useCart.ts`
   - `useAuth.ts`
   - `useOrders.ts`
   - `useCheckout*.ts`

5. **Add checkout component tests**
   - Payment form validation
   - Address form handling
   - Order review display

6. **Fix skipped tests**
   - Refactor `useStripe` to support test isolation
   - Use `vi.resetModules()` between tests

### Medium-term (Month 2)

7. **API endpoint tests**
   - All checkout endpoints
   - Order creation/management
   - Admin CRUD operations

8. **Visual regression testing**
   - Add Playwright visual comparison
   - Set up baseline screenshots
   - Cover critical pages

9. **Component test expansion**
   - Product components
   - Cart components
   - Navigation components

### Long-term (Month 3+)

10. **Performance testing**
    - Load testing for API endpoints
    - Lighthouse CI integration
    - Bundle size monitoring

11. **Test documentation**
    - Testing guidelines
    - Mock patterns
    - Coverage requirements

---

## Specific Test Recommendations

### High-Priority Tests to Add

```typescript
// 1. Cart Store Tests (stores/cart/core.test.ts)
describe('Cart Store', () => {
  it('should add item to cart')
  it('should update item quantity')
  it('should calculate totals correctly')
  it('should persist to cookie')
  it('should handle stock limits')
})

// 2. Auth Store Tests (stores/auth.test.ts)
describe('Auth Store', () => {
  it('should handle login')
  it('should handle logout')
  it('should refresh session')
  it('should handle token expiration')
})

// 3. Checkout Flow Tests
describe('Checkout Integration', () => {
  it('should validate shipping address')
  it('should calculate shipping costs')
  it('should process payment')
  it('should create order on success')
})

// 4. Payment API Tests
describe('POST /api/checkout/create-payment-intent', () => {
  it('should create payment intent for valid cart')
  it('should reject empty cart')
  it('should handle Stripe errors')
  it('should require authentication')
})
```

---

## Test Configuration Issues

### vitest.config.ts Exclusions

Many tests are excluded from the standard unit test run:
```typescript
exclude: [
  // These should be in integration config only
  'tests/server/api/admin/__tests__/**/*.test.ts',
  'tests/server/api/admin/orders/__tests__/**/*.test.ts',
  'tests/server/api/admin/products/__tests__/**/*.test.ts',
  // ...
]
```

**Recommendation:** Ensure excluded tests run in integration config and add CI job for integration tests.

### Integration Test Setup

Integration tests require environment variables but setup is minimal:
```typescript
// vitest.integration.setup.ts
beforeAll(() => {
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
  // Only checks existence, not validity
})
```

**Recommendation:** Add database connection validation and test data seeding.

---

## Metrics & Targets

### Current State
- Unit test files: 25+
- E2E test files: 41
- Overall estimated coverage: ~15-20%

### Target State (3 months)
- Unit test coverage: 70%+
- Critical path coverage: 90%+
- E2E test coverage: 80%+ of user flows
- CI test pass rate: 95%+

---

## Conclusion

The project has a solid testing foundation with appropriate tooling and some well-written tests. However, the coverage gaps in stores, components, and API routes represent significant risk, especially for payment and authentication flows. The disabled CI pipeline means tests aren't running automatically, reducing their value.

**Priority Actions:**
1. Enable CI E2E tests
2. Add Pinia store tests
3. Enable coverage thresholds
4. Test payment/checkout flows

With focused effort over 2-3 months, the project can achieve industry-standard test coverage and significantly reduce regression risk.
