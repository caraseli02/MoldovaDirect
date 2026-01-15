# Playwright and E2E Testing Best Practices Analysis

**Date:** December 4, 2025
**Project:** Moldova Direct
**Review Focus:** Test restructuring against industry standards

---

## Executive Summary

Your 3-tier test structure (smoke, critical, full) aligns well with industry best practices and demonstrates thoughtful test organization. After comparing against Playwright documentation, industry standards, and real-world implementations, your approach is **solid and appropriate** for your e-commerce platform, with some opportunities for refinement.

**Key Findings:**
- ✅ Smoke test count (3 tests) is appropriate
- ⚠️ Critical test suite slightly small but well-focused
- ✅ Timeout configurations align with best practices
- ⚠️ Selector strategy needs improvement (overuse of data-testid vs role-based)
- ⚠️ Missing page object pattern implementation
- ✅ Test isolation and fixtures well-implemented

---

## 1. Test Organization & Structure

### Your Approach

```
Smoke Tests:    3 tests, < 30s target
Critical Tests: 12 tests across 5 files, < 5min target
Full E2E:       30 total test files
```

### Industry Best Practices Comparison

#### Test Pyramid Ratio

**Recommended Industry Standard:**
- **70% Unit Tests** - Fast, isolated, testing individual components
- **20% Integration Tests** - Component interactions
- **10% E2E Tests** - Critical user flows

**Source:** [The Testing Pyramid 2025](https://supatest.ai/blog/testing-pyramid), [Modern Test Pyramid Guide](https://fullscale.io/blog/modern-test-pyramid-guide/)

**Your Current State (from TESTING_REVIEW.md):**
```
Component Tests: 2% coverage (5 of 239 components)
Store Tests:     0% coverage (0 of 25 stores)
API Tests:       9% coverage (10 of 108 routes)
E2E Tests:       30 test files, robust coverage
```

**Analysis:** Your test suite has an **inverted pyramid** (ice cream cone anti-pattern), heavily weighted toward E2E tests. This creates:
- Slower test execution
- Higher maintenance burden
- Flakier test suite
- Longer feedback loops

**Recommendation:** Continue investing in unit/integration tests while maintaining your E2E suite. Your E2E structure is good, but needs support from lower-level tests.

---

### Smoke Test Suite

#### Your Implementation
```typescript
// tests/pre-commit/smoke.spec.ts
- 3 tests
- No authentication required
- < 30s total runtime
- Tests: homepage load, products navigation, add to cart
```

#### Industry Standards

**Recommended Size:** 20-50 tests is typical, but **3-10 tests for ultra-fast smoke tests** in pre-commit hooks

**Source:** [Smoke Testing Best Practices](https://www.functionize.com/blog/smoke-testing-suite-what-it-is-why-you-need-it-and-how-to-automate)

> "The recommended number of test cases for a smoke test suite is generally 20 on the low end to around 50 on the high end. Any less than this and you're probably not getting enough relevant coverage."

**HOWEVER**, for **pre-commit smoke tests** specifically:
- Pre-commit hooks should run in < 30 seconds total ([Pre-commit Best Practices](https://softwareengineering.stackexchange.com/questions/260778/is-it-a-good-practice-to-run-unit-tests-in-version-control-hooks))
- Industry consensus: "Commits should be fast" - 500ms is considered slow
- E2E tests should NOT run in pre-commit; they belong in CI

**Analysis:** Your 3-test smoke suite is **appropriate for pre-commit usage**, but:

✅ **Strengths:**
- Fast execution (< 30s target)
- No auth overhead
- Tests critical paths (homepage, products, cart)
- Minimal assertions for speed

⚠️ **Considerations:**
- These are actually E2E tests running in pre-commit (unconventional)
- Most teams run only linting/formatting in pre-commit
- E2E tests typically run in CI only

**Best Practice Guidance:**

> "E2E testing should be integrated early in development and run frequently through a 'shift-left' approach, with teams executing a suite of E2E tests (even a slimmed-down smoke test version) on every code commit or pull request **in the CI pipeline**" - [E2E Testing Best Practices 2025](https://www.bunnyshell.com/blog/best-practices-for-end-to-end-testing-in-2025/)

**Recommendation:**

**Option A (Conservative):** Move smoke E2E tests to CI only, use pre-commit for linting/type-checking
```bash
# .git/hooks/pre-commit
npm run lint
npm run type-check
# Total time: < 10s
```

**Option B (Aggressive - Your Current Approach):** Keep 3 E2E smoke tests in pre-commit BUT:
- Add git hook skip mechanism: `git commit --no-verify` for WIP commits
- Document this non-standard approach
- Ensure developers have fast machines/network
- Monitor developer feedback on commit speed

---

### Critical Test Suite

#### Your Implementation
```
tests/e2e/critical/
├── auth-critical.spec.ts (3 tests)
├── cart-critical.spec.ts (3 tests)
├── checkout-critical.spec.ts (2 tests)
├── products-critical.spec.ts (2 tests)
└── admin-critical.spec.ts (2 tests)
Total: 12 tests across 5 files
Target: < 5 minutes
```

#### Industry Standards

**Playwright Best Practice:**
- Run critical tests in CI on every PR
- 5-10 minute execution time is ideal
- Focus on "must work" functionality before deployment

**Source:** [Playwright Testing at Scale](https://gitnation.com/contents/at-the-top-of-the-pyramid-playwright-testing-at-scale)

**E2E Suite Size Guidance:**
> "By focusing E2E tests on critical scenarios and key checkpoints (like pre-release), you get the best return on investment, with experts advising to keep the number of E2E tests relatively small but high-value." - [E2E Testing Guide 2025](https://talent500.com/blog/end-to-end-testing-guide/)

**Analysis:**

✅ **Strengths:**
- Well-organized by feature area
- Covers critical user journeys (auth, cart, checkout)
- Reasonable test count per file (2-3 tests)
- Includes admin functionality

⚠️ **Potential Issues:**
- 12 tests seems small for "critical" suite
- Missing critical flows:
  - Password reset (critical auth recovery path)
  - Order confirmation
  - Payment failure handling
  - Admin product CRUD operations

**Comparison to 100+ Test Suite Study:**

From [Building Comprehensive E2E Suite](https://dev.to/bugslayer/building-a-comprehensive-e2e-test-suite-with-playwright-lessons-from-100-test-cases-171k):
- Start with 10-20 critical path tests
- Expand to 50-100 tests for comprehensive coverage
- Use tags to separate critical vs optional tests

**Recommendation:**

Expand critical suite to **20-25 tests** covering:
```typescript
// Suggested additions (8-13 more tests)

// Auth Critical (add 2 tests)
- Password reset flow
- Session persistence after refresh

// Checkout Critical (add 3 tests)
- Payment success confirmation
- Payment failure handling
- Order creation validation

// Products Critical (add 2 tests)
- Product search
- Product filtering

// Admin Critical (add 3 tests)
- Create product
- Update product
- Delete product (soft delete)
```

---

## 2. Timeout & Retry Configuration

### Your Configuration

```typescript
// playwright.config.ts

// Global defaults
retries: process.env.CI ? 2 : 0
actionTimeout: 10000
navigationTimeout: 30000

// Pre-commit (smoke)
retries: 0
timeout: 10000  // 10s per test

// Critical
retries: 1
timeout: 30000  // 30s per test

// Full E2E
retries: 2 (CI only)
timeout: 30000 (default)
```

### Industry Best Practices

#### Retries

**Playwright Official Recommendation:**
```typescript
retries: process.env.CI ? 2 : 0
```

**Source:** [Playwright Retries Documentation](https://playwright.dev/docs/test-retries)

> "Test retries are configured in the configuration file. You can configure retries globally by setting retries: 3 in your Playwright config, and by default, Playwright runs each test exactly once with no automatic retries."

**Best Practice:**
- 0 retries locally (fast feedback on real issues)
- 2 retries in CI (handle environmental flakiness)
- 1 retry for critical tests (balance between speed and reliability)

**Analysis:** ✅ **Your retry configuration is perfect** and follows industry standards exactly.

#### Timeouts

**Playwright Official Defaults:**
- Test timeout: 30000ms (30s)
- Expect timeout: 5000ms (5s)
- Action timeout: No default (uses expect timeout)
- Navigation timeout: 30000ms (30s)

**Source:** [Playwright Timeouts Documentation](https://playwright.dev/docs/test-timeouts)

**Your Configuration Analysis:**

✅ **Strengths:**
- 10s action timeout is reasonable (default is 5s)
- 30s navigation timeout matches Playwright default
- 10s timeout for smoke tests ensures speed
- 30s timeout for critical tests allows complex flows

⚠️ **Considerations:**
- No explicit `expect` timeout configuration (defaults to 5s)
- Checkout tests might need longer timeouts for Stripe API calls

**Recommendation:**

```typescript
// Add to playwright.config.ts
use: {
  baseURL: '...',
  actionTimeout: 10000,
  navigationTimeout: 30000,

  // Add explicit expect timeout
  expect: {
    timeout: 5000, // Match Playwright default
  },
}

// For checkout tests specifically
// tests/e2e/checkout-*.spec.ts
test.use({
  actionTimeout: 15000, // Longer for payment processing
  navigationTimeout: 45000, // Allow for redirects
})
```

---

## 3. Selector Strategy

### Your Current Usage

**Analysis of test files:**
```
data-testid usage:     383 occurrences
getByRole usage:        43 occurrences
text-based selectors:   91 occurrences (has-text, getByText)
```

**Ratio:** 74% data-testid, 8% role-based, 18% text-based

### Industry Best Practices

#### Playwright Selector Priority

**Official Recommendation:**
1. **getByRole()** - Locates by ARIA role, ARIA attributes, accessible name
2. **getByText()** - Locates by text content
3. **getByTestId()** - Locates by data-testid attribute

**Source:** [Playwright Locators Documentation](https://playwright.dev/docs/locators)

> "Playwright recommends prioritizing user-facing attributes and explicit contracts such as page.getByRole() to make tests resilient."

**Accessibility Benefits:**
> "getByRole allows locating elements by their ARIA role, ARIA attributes and accessible name, which improves test stability and ensures better accessibility compliance." - [Playwright Locators Guide](https://momentic.ai/blog/playwright-locators-guide)

**When to Use data-testid:**
> "When you have control of the DOM, data-testid is a fantastic convention to implement across dev teams. When labels and attributes are subject to frequent changes, data-testid offers a stable anchor in dynamic applications." - [Strengthen Selectors in Playwright](https://www.browsercat.com/post/strengthen-selectors-and-locators-in-playwright)

### Analysis

❌ **Your selector strategy is inverted** - 74% data-testid vs 8% role-based

**Problems with over-relying on data-testid:**
1. Doesn't validate accessibility
2. Requires maintaining test-specific attributes
3. Doesn't match how users interact with the page
4. Can hide accessibility issues

**Example from your tests:**

```typescript
// Current approach (login.spec.ts)
await page.fill('[data-testid="email-input"]', testUser.email)
await page.fill('[data-testid="password-input"]', testUser.password)
await page.click('[data-testid="login-button"]')

// Recommended approach
await page.getByRole('textbox', { name: 'Email' }).fill(testUser.email)
await page.getByRole('textbox', { name: 'Password' }).fill(testUser.password)
await page.getByRole('button', { name: 'Log in' }).click()

// OR with labels
await page.getByLabel('Email').fill(testUser.email)
await page.getByLabel('Contraseña').fill(testUser.password)
await page.getByRole('button', { name: /iniciar sesión|log in/i }).click()
```

### Recommendation

**Refactor selector strategy to follow Playwright best practices:**

**Priority 1: getByRole() - 50-60% of selectors**
```typescript
// Buttons
page.getByRole('button', { name: 'Add to Cart' })
page.getByRole('button', { name: /submit|enviar/i })

// Links
page.getByRole('link', { name: 'Products' })

// Form inputs
page.getByRole('textbox', { name: 'Email' })
page.getByRole('checkbox', { name: 'Remember me' })

// Headings
page.getByRole('heading', { name: 'Checkout' })
```

**Priority 2: getByLabel() / getByText() - 20-30%**
```typescript
// Form inputs with labels
page.getByLabel('Email address')
page.getByLabel('Dirección de correo')

// Text content
page.getByText('Your order has been confirmed')
```

**Priority 3: getByTestId() - 10-20%**
```typescript
// Complex components where role isn't clear
page.getByTestId('product-card')
page.getByTestId('cart-summary')

// Dynamic lists/grids
page.getByTestId(`product-${productId}`)
```

**Implementation Plan:**

1. **Phase 1:** New tests use role-based selectors
2. **Phase 2:** Refactor critical tests to use roles
3. **Phase 3:** Update components to have proper ARIA labels
4. **Phase 4:** Gradually refactor remaining tests

**Tool to help:** Use Playwright Inspector to generate role-based selectors
```bash
npx playwright codegen http://localhost:3000
```

---

## 4. Test Organization Patterns

### Your Current Structure

```
tests/
├── e2e/
│   ├── critical/           # 5 files, 12 tests
│   ├── auth/               # 4 files
│   ├── admin/              # 9 files
│   └── *.spec.ts          # 12+ files
├── pre-commit/
│   └── smoke.spec.ts      # 3 tests
├── fixtures/
│   ├── base.ts            # Test fixtures
│   ├── helpers.ts
│   ├── pages.ts           # Page helpers (not true POM)
│   └── cart-helpers.ts
├── setup/
└── utils/
```

**Page Objects:** ❌ Not found (grep found 0 matches)

### Industry Best Practices

#### Page Object Model (POM)

**Playwright Official Guidance:**

> "Page Object Model is a design pattern that organizes test automation by separating page-specific locators and actions into dedicated classes. The Page Object Model in Playwright helps write clean, maintainable tests by separating page interactions from test logic." - [Playwright POM Documentation](https://playwright.dev/docs/pom)

**Benefits:**
- **Easy Maintenance** - Changes in DOM require updates only in page object
- **Increased Reusability** - Share common page interactions
- **Improved Readability** - Test logic is clearer

**Structure Recommendation:**

```
tests/
├── page-objects/
│   ├── auth/
│   │   ├── LoginPage.ts
│   │   └── RegisterPage.ts
│   ├── products/
│   │   ├── ProductListPage.ts
│   │   └── ProductDetailPage.ts
│   ├── cart/
│   │   └── CartPage.ts
│   └── checkout/
│       ├── CheckoutPage.ts
│       └── OrderConfirmationPage.ts
```

**Example Implementation:**

```typescript
// tests/page-objects/auth/LoginPage.ts
import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly rememberMeCheckbox: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    // Use role-based selectors
    this.emailInput = page.getByRole('textbox', { name: /email/i })
    this.passwordInput = page.getByRole('textbox', { name: /password|contraseña/i })
    this.loginButton = page.getByRole('button', { name: /log in|iniciar sesión/i })
    this.rememberMeCheckbox = page.getByRole('checkbox', { name: /remember/i })
    this.errorMessage = page.getByRole('alert')
  }

  async goto() {
    await this.page.goto('/auth/login')
  }

  async login(email: string, password: string, rememberMe = false) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    if (rememberMe) {
      await this.rememberMeCheckbox.check()
    }
    await this.loginButton.click()
  }

  async loginAndWaitForRedirect(email: string, password: string) {
    await this.login(email, password)
    await this.page.waitForURL(/\/(account|dashboard)/)
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent()
  }
}

// tests/e2e/auth/login.spec.ts
import { test, expect } from '../../fixtures/base'
import { LoginPage } from '../../page-objects/auth/LoginPage'

test.describe('Login Flow', () => {
  let loginPage: LoginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.goto()
  })

  test('should login successfully with valid credentials', async ({ testUser }) => {
    await loginPage.loginAndWaitForRedirect(testUser.email, testUser.password)

    // Verify authenticated state
    await expect(loginPage.page.getByTestId('user-menu')).toBeVisible()
  })

  test('should show error with invalid credentials', async () => {
    await loginPage.login('wrong@example.com', 'wrongpassword')

    const error = await loginPage.getErrorMessage()
    expect(error).toContain('Invalid credentials')
  })
})
```

### Your Current Approach

**You have helpers instead of page objects:**

```typescript
// tests/fixtures/pages.ts - Not a true page object pattern
// tests/fixtures/helpers.ts - Utility functions
// tests/fixtures/cart-helpers.ts - Cart-specific helpers
```

**Analysis:**
- ⚠️ Helpers are functions, not classes
- ⚠️ Selectors scattered across test files
- ⚠️ No centralized selector management
- ✅ Good: You have reusable utilities
- ✅ Good: Cart helpers show domain organization

### Recommendation

**Implement Page Object Model pattern:**

**Phase 1: Create page objects for critical paths**
1. `LoginPage.ts`
2. `ProductListPage.ts`
3. `CartPage.ts`
4. `CheckoutPage.ts`
5. `AdminDashboardPage.ts`

**Phase 2: Migrate tests to use page objects**
- Start with critical tests
- Refactor one test file at a time
- Keep existing helpers for non-page-specific utilities

**Phase 3: Add component objects for reusable UI elements**
```typescript
// tests/page-objects/components/ProductCard.ts
export class ProductCard {
  constructor(private locator: Locator) {}

  async addToCart() {
    await this.locator.getByRole('button', { name: /add to cart/i }).click()
  }

  async getPrice() {
    return await this.locator.getByTestId('product-price').textContent()
  }
}
```

**Best Practice Source:**
- [Playwright POM Official Docs](https://playwright.dev/docs/pom)
- [Page Object Model with Playwright Tutorial](https://www.browserstack.com/guide/page-object-model-with-playwright)
- [Mastering Playwright Best Practices](https://medium.com/@lucgagan/mastering-playwright-best-practices-for-web-automation-with-the-page-object-model-3541412b03d1)

---

## 5. Test Pyramid Compliance

### Current State vs Best Practices

```
RECOMMENDED PYRAMID          YOUR CURRENT PYRAMID

     /\                           /\
    /  \  E2E (10%)              /  \  Component (2%)
   /----\                       /----\
  /      \  Integration (20%)  /      \  Store (0%)
 /--------\                   /--------\
/          \ Unit (70%)      /          \ API (9%)
/------------\              /------------\
                           /              \
                          /      E2E       \
                         /    (30 files)   \
                        /------------------\

INVERTED PYRAMID (Anti-pattern)
```

**Analysis:**
Your pyramid is inverted, which leads to:
- Slower test execution (E2E tests take minutes vs seconds for unit tests)
- Higher flakiness (E2E tests depend on network, database, UI)
- Expensive maintenance (E2E tests break with any UI change)
- Poor developer experience (slow feedback loop)

**Best Practice:**
> "Without a structured testing approach, teams often fall into the 'ice cream cone' anti-pattern, where they rely heavily on end-to-end tests and manual testing, which creates bottlenecks and slows delivery." - [Test Pyramid 2025](https://supatest.ai/blog/testing-pyramid)

### Recommendation

**Target Distribution (3-month goal):**
```
Unit Tests:        70% coverage (vs current ~10%)
Integration Tests: 20% coverage (vs current ~5%)
E2E Tests:         10% coverage (maintain current 30 files)
```

**Action Items from TESTING_REVIEW.md:**

1. **Add Store Tests** (Priority: HIGH)
   ```typescript
   // stores/cart/core.test.ts
   // stores/auth.test.ts
   // stores/checkout.test.ts
   ```

2. **Add Component Tests** (Priority: HIGH)
   ```typescript
   // components/checkout/*.test.ts
   // components/cart/*.test.ts
   // components/product/*.test.ts
   ```

3. **Add API Tests** (Priority: HIGH)
   ```typescript
   // server/api/checkout/create-payment-intent.test.ts
   // server/api/checkout/confirm-payment.test.ts
   // server/api/orders/create.test.ts
   ```

This aligns with your existing recommendation in TESTING_REVIEW.md (good existing analysis!).

---

## 6. Flaky Test Prevention

### Current Configuration Analysis

```typescript
// playwright.config.ts
trace: 'on-first-retry',
screenshot: 'only-on-failure',
video: 'retain-on-failure',
```

✅ **Your debugging configuration is excellent**

### Best Practices for Avoiding Flaky Tests

**Source:** [Avoiding Flaky Tests in Playwright](https://betterstack.com/community/guides/testing/avoid-flaky-playwright-tests/)

#### 1. Use Auto-Waiting (You're doing this)

```typescript
// ❌ Bad - arbitrary timeout
await page.waitForTimeout(3000)

// ✅ Good - wait for condition (you use this)
await expect(page.locator('[data-testid="product-card"]')).toBeVisible()
```

#### 2. Avoid ElementHandles

```typescript
// ❌ Bad - ElementHandles don't auto-wait
const button = await page.$('button')
await button.click()

// ✅ Good - Locators auto-wait (you use this)
await page.locator('button').click()
```

#### 3. Use Soft Assertions for Non-Critical Checks

```typescript
// tests/e2e/critical/products-critical.spec.ts
test('product page loads', async ({ page }) => {
  await page.goto('/products')

  // Critical assertion - test fails if missing
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible()

  // Soft assertion - logs error but continues
  await expect.soft(page.getByText('New arrivals')).toBeVisible()

  // Critical assertion
  const products = page.getByTestId('product-card')
  await expect(products).toHaveCount.toBeGreaterThan(0)
})
```

#### 4. Test Isolation

**Your Implementation:**
```typescript
// tests/e2e/auth/login.spec.ts
test.beforeEach(async ({ page }) => {
  await page.context().clearCookies()
  await page.goto('/auth/login')
  await page.waitForLoadState('networkidle')
})
```

✅ **Good test isolation**

**Best Practice Enhancement:**
```typescript
test.beforeEach(async ({ page, context }) => {
  // Clear all state
  await context.clearCookies()
  await context.clearPermissions()
  await page.goto('/auth/login')
  await page.waitForLoadState('domcontentloaded') // Faster than networkidle
})
```

#### 5. Avoid waitForTimeout

**Check your codebase:**
```bash
grep -r "waitForTimeout" tests/e2e/
```

If found, replace with explicit waits:
```typescript
// ❌ Bad
await page.waitForTimeout(1000)

// ✅ Good
await page.waitForSelector('[data-testid="cart-count"]', { state: 'visible' })
await expect(page.getByTestId('cart-count')).toBeVisible()
```

**Source:** [How to Avoid Flaky Tests](https://semaphore.io/blog/flaky-tests-playwright)

---

## 7. Missing Best Practices

### 1. Test Data Factories

**Current State:**
```typescript
// tests/fixtures/base.ts
testUser: async ({ locale }, use) => {
  const user: TestUser = {
    email: process.env.TEST_USER_EMAIL || `test-${locale}@example.test`,
    password: process.env.TEST_USER_PASSWORD || generateSecurePassword(),
    name: `Test User ${locale.toUpperCase()}`,
    locale,
  }
  await use(user)
}
```

✅ Good start with fixtures

**Recommendation: Add Test Data Factories**

```typescript
// tests/factories/ProductFactory.ts
export class ProductFactory {
  static create(overrides?: Partial<Product>): Product {
    return {
      id: `prod_${Date.now()}`,
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      stock: faker.number.int({ min: 0, max: 100 }),
      images: [faker.image.url()],
      ...overrides
    }
  }

  static createMany(count: number): Product[] {
    return Array.from({ length: count }, () => this.create())
  }
}

// Usage in tests
const outOfStockProduct = ProductFactory.create({ stock: 0 })
const products = ProductFactory.createMany(5)
```

**Source:** [Building Comprehensive E2E Suite](https://dev.to/bugslayer/building-a-comprehensive-e2e-test-suite-with-playwright-lessons-from-100-test-cases-171k)

### 2. API State Setup

**Instead of UI-based setup, use API:**

```typescript
// tests/fixtures/base.ts
export const test = base.extend({
  authenticatedPage: async ({ page, testUser }, use) => {
    // ❌ Current approach - login via UI (slow)
    await page.goto('/auth/login')
    await page.fill('[data-testid="email-input"]', testUser.email)
    await page.fill('[data-testid="password-input"]', testUser.password)
    await page.click('[data-testid="login-button"]')

    // ✅ Better approach - login via API (fast)
    const response = await page.request.post('/api/auth/login', {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    })

    const cookies = response.headers()['set-cookie']
    await page.context().addCookies(parseCookies(cookies))

    await use(page)
  }
})
```

### 3. Accessibility Testing

You have `@axe-core/playwright` installed but not used much.

**Recommendation:**

```typescript
// tests/e2e/critical/accessibility-critical.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Critical Accessibility', () => {
  test('homepage is accessible', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('checkout flow is accessible', async ({ page }) => {
    // Setup cart
    await page.goto('/checkout')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})
```

**Source:** [Playwright Assertions](https://playwright.dev/docs/test-assertions)

### 4. Visual Regression Testing

**Your config includes:**
```typescript
'test:visual': 'PLAYWRIGHT_TEST=true playwright test tests/visual',
```

But `/tests/visual/` directory is empty (from TESTING_REVIEW.md).

**Recommendation:**

```typescript
// tests/visual/critical-pages.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Visual Regression - Critical Pages', () => {
  test('homepage visual snapshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixels: 100
    })
  })

  test('product list visual snapshot', async ({ page }) => {
    await page.goto('/products')

    await expect(page).toHaveScreenshot('products.png', {
      fullPage: true,
      mask: [page.locator('[data-testid="dynamic-content"]')]
    })
  })
})
```

Run once to generate baselines:
```bash
npm run test:visual -- --update-snapshots
```

---

## 8. Recommendations Summary

### Immediate Actions (Week 1)

1. **Start using Page Object Model**
   - Create `LoginPage`, `ProductListPage`, `CartPage`
   - Refactor critical tests to use page objects

2. **Improve selector strategy**
   - Audit existing tests for data-testid overuse
   - Use Playwright codegen to generate role-based selectors
   - Update components to have proper ARIA labels

3. **Expand critical test suite**
   - Add 8-10 more critical tests (password reset, payment flows, admin CRUD)
   - Target: 20-25 critical tests total

### Short-term Actions (Weeks 2-4)

4. **Add test data factories**
   - Install `@faker-js/faker`
   - Create factories for Product, User, Order

5. **Implement visual regression tests**
   - Add 5-10 critical page snapshots
   - Set up CI to run visual tests

6. **Add accessibility tests**
   - Use `@axe-core/playwright` for critical paths
   - Add to critical test suite

### Medium-term Actions (Months 2-3)

7. **Rebalance test pyramid**
   - Add store tests (0% → 70% coverage)
   - Add component tests (2% → 50% coverage)
   - Add API tests (9% → 60% coverage)
   - Maintain E2E suite at current size

8. **Consider pre-commit strategy**
   - Evaluate if E2E smoke tests in pre-commit are worth the speed tradeoff
   - Consider moving to CI-only
   - Add git hook skip documentation

---

## 9. Comparison to Industry Examples

### Microsoft Playwright Examples

**Repository:** [microsoft/playwright-examples](https://github.com/microsoft/playwright-examples)

**Common Patterns:**
- Page Object Model for all examples
- Role-based selectors as default
- Fixtures for common setup
- API state management instead of UI setup

**Lessons:**
- Official examples use POM exclusively
- Minimal use of data-testid
- Heavy use of accessibility selectors

### Real-World Case Study

**Source:** [100+ Test Cases Study](https://dev.to/bugslayer/building-a-comprehensive-e2e-test-suite-with-playwright-lessons-from-100-test-cases-171k)

**Key Findings:**
- Started with 20 critical tests
- Expanded to 100+ tests over 6 months
- Used tags to separate critical vs full suite
- Implemented Page Object Model from day 1
- Used factories for test data
- API setup for authenticated states

**Lessons for Your Project:**
- Your 12 critical tests is a good start
- Page Object Model should be priority #1
- Consider test tagging system
- Plan for 100+ tests long-term

---

## 10. Final Assessment

### What You're Doing Well ✅

1. **Test Organization** - Clear smoke/critical/full structure
2. **Timeout Configuration** - Perfect retry and timeout settings
3. **Test Isolation** - Good use of beforeEach and fixtures
4. **CI Configuration** - Multi-browser, multi-locale support
5. **Debugging Setup** - Traces, screenshots, videos on failure

### What Needs Improvement ⚠️

1. **Selector Strategy** - 74% data-testid vs recommended 10-20%
2. **Page Object Model** - Not implemented
3. **Test Pyramid** - Inverted (too many E2E, too few unit/integration)
4. **Critical Suite Size** - 12 tests is small, target 20-25
5. **Smoke Tests in Pre-commit** - Non-standard (consider moving to CI)

### Priority Rankings

| Priority | Action | Impact | Effort |
|----------|--------|--------|--------|
| 1 | Implement Page Object Model | High | Medium |
| 2 | Refactor to role-based selectors | High | High |
| 3 | Expand critical test suite to 20-25 tests | Medium | Low |
| 4 | Add store/component/API tests (pyramid) | High | High |
| 5 | Add visual regression tests | Medium | Low |
| 6 | Add accessibility tests | Medium | Low |
| 7 | Evaluate pre-commit strategy | Low | Low |
| 8 | Add test data factories | Medium | Medium |

---

## Conclusion

Your test restructuring approach is **fundamentally sound** and demonstrates good understanding of testing principles. The 3-tier structure (smoke, critical, full) aligns with industry best practices, and your timeout/retry configurations are textbook perfect.

However, there are three critical areas for improvement:

1. **Selector Strategy** - Move from data-testid-heavy to role-based selectors for better accessibility and resilience
2. **Page Object Model** - Implement this pattern to reduce maintenance burden and improve test readability
3. **Test Pyramid** - Add unit/integration tests to support your E2E suite and prevent the "ice cream cone" anti-pattern

Your E2E test suite is well-structured and doesn't need major changes. Focus your efforts on adding lower-level tests and refactoring selector strategies rather than restructuring what you have.

---

## Sources

This analysis is based on research from the following authoritative sources:

### Official Documentation
- [Playwright Locators](https://playwright.dev/docs/locators)
- [Playwright Retries](https://playwright.dev/docs/test-retries)
- [Playwright Timeouts](https://playwright.dev/docs/test-timeouts)
- [Playwright Page Object Model](https://playwright.dev/docs/pom)

### Industry Best Practices (2025)
- [End-to-End Testing in 2025: Complete Guide](https://www.bunnyshell.com/blog/introduction-to-end-to-end-testing-everything-you/)
- [E2E Testing Best Practices 2025](https://www.bunnyshell.com/blog/best-practices-for-end-to-end-testing-in-2025/)
- [The Testing Pyramid 2025](https://supatest.ai/blog/testing-pyramid)
- [Modern Test Pyramid Guide](https://fullscale.io/blog/modern-test-pyramid-guide/)
- [Software Testing Pyramid 2025](https://www.devzery.com/post/software-testing-pyramid-guide-2025)

### Playwright-Specific Guides
- [Avoiding Flaky Tests in Playwright](https://betterstack.com/community/guides/testing/avoid-flaky-playwright-tests/)
- [How to Avoid Flaky Tests](https://semaphore.io/blog/flaky-tests-playwright)
- [Playwright Testing at Scale](https://gitnation.com/contents/at-the-top-of-the-pyramid-playwright-testing-at-scale)
- [Building Comprehensive E2E Suite with Playwright](https://dev.to/bugslayer/building-a-comprehensive-e2e-test-suite-with-playwright-lessons-from-100-test-cases-171k)

### Selector Strategy
- [Playwright Locators Guide](https://momentic.ai/blog/playwright-locators-guide)
- [Strengthen Selectors and Locators](https://www.browsercat.com/post/strengthen-selectors-and-locators-in-playwright)
- [Playwright Get by Test ID Guide](https://autify.com/blog/playwright-get-by-id)

### Page Object Model
- [Page Object Model with Playwright](https://www.browserstack.com/guide/page-object-model-with-playwright)
- [Playwright Page Object Model Tutorial](https://autify.com/blog/playwright-page-object-model)
- [Mastering Playwright Best Practices](https://medium.com/@lucgagan/mastering-playwright-best-practices-for-web-automation-with-the-page-object-model-3541412b03d1)

### Smoke Testing
- [Smoke Testing Best Practices](https://www.functionize.com/blog/smoke-testing-suite-what-it-is-why-you-need-it-and-how-to-automate)
- [Smoke Testing Guide](https://launchdarkly.com/blog/comprehensive-guide-smoke-testing-software-development/)
- [Smoke Testing Your SaaS](https://makerkit.dev/blog/tutorials/smoke-testing-saas-playwright)

### Pre-commit Hooks
- [Pre-commit Testing Best Practices](https://softwareengineering.stackexchange.com/questions/260778/is-it-a-good-practice-to-run-unit-tests-in-version-control-hooks)
- [Testing in Pre-commit Hooks](https://pdc-support.github.io/software-engineering-intro/11-pre-commit-hook/)

### Microsoft Examples
- [microsoft/playwright](https://github.com/microsoft/playwright)
- [microsoft/playwright-examples](https://github.com/microsoft/playwright-examples)

---

**Document Version:** 1.0
**Last Updated:** December 4, 2025
**Next Review:** After implementing Phase 1 recommendations
