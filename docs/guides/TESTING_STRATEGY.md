# Testing Strategy

## Overview

This project uses a smart testing strategy that runs relevant tests based on the files you've changed, ensuring fast feedback while maintaining quality.

## Test Types

### 1. Unit Tests (Vitest)
- **Location**: `composables/*.test.ts`, `server/**/__tests__/*.test.ts`
- **What**: Tests individual functions, composables, and utilities
- **When**: Run on every commit and push
- **Speed**: Very fast (< 5 seconds)

### 2. E2E Tests (Playwright)
- **Location**: `tests/e2e/*.spec.ts`
- **What**: Tests complete user flows (auth, checkout, products, i18n)
- **When**: Run intelligently based on changed files
- **Speed**: Moderate (10-30 seconds per test file)

### 3. Visual Regression Tests (Playwright)
- **Location**: `tests/visual/*.spec.ts`
- **What**: Screenshot comparison tests for visual changes
- **When**: Run when components, pages, or styles change
- **Speed**: Slower (30-60 seconds per test file)

## Smart Test Selection

### Pre-commit Hook
Runs only unit tests for changed files:
```bash
# Example: Changed composables/useStripe.ts
✓ Runs tests in composables/useStripe.test.ts
✗ Skips unrelated tests
```

### Pre-push Hook
Runs unit tests + relevant e2e tests based on file patterns:

#### Auth Changes
**Triggers**: `auth`, `login`, `register`, `password`, `mfa`, `security`, `stores/auth`
**Runs**: `tests/e2e/auth.spec.ts`
```bash
# Example files that trigger auth tests:
- pages/auth/login.vue
- stores/auth.ts
- composables/useAuth.ts
- middleware/auth.ts
```

#### Product Changes
**Triggers**: `products`, `categories`, `search`, `stores/products`, `pages/products`
**Runs**: `tests/e2e/products.spec.ts`
```bash
# Example files that trigger product tests:
- pages/products/[id].vue
- stores/products.ts
- components/product/Card.vue
```

#### Checkout Changes
**Triggers**: `checkout`, `cart`, `payment`, `stripe`, `shipping`, `stores/cart`, `stores/checkout`, `composables/useStripe`, `composables/useShipping`, `composables/useGuest`
**Runs**: `tests/e2e/checkout.spec.ts`
```bash
# Example files that trigger checkout tests:
- pages/checkout/index.vue
- composables/useStripe.ts
- stores/cart/index.ts
- components/checkout/PaymentForm.vue
```

#### I18n Changes
**Triggers**: `i18n`, `locales`, `translations`
**Runs**: `tests/e2e/i18n.spec.ts`
```bash
# Example files that trigger i18n tests:
- i18n/locales/en.json
- nuxt.config.ts (if i18n config changed)
```

#### Admin Changes
**Triggers**: `admin`, `components/admin`, `pages/admin`, `stores/admin`
**Runs**: `tests/visual/admin-visual.spec.ts`
```bash
# Example files that trigger admin tests:
- pages/admin/dashboard.vue
- components/admin/Orders/Table.vue
- stores/adminOrders.ts
```

#### Account Changes
**Triggers**: `account`, `profile`, `orders`, `pages/account`
**Runs**: `tests/visual/account-visual.spec.ts`
```bash
# Example files that trigger account tests:
- pages/account/profile.vue
- pages/account/orders/[id].vue
```

#### Visual Changes
**Triggers**: `components/`, `pages/`, `.vue$`, `tailwind`, `.css$`
**Runs**: `tests/visual/checkout-and-static-visual.spec.ts`
```bash
# Example files that trigger visual tests:
- components/layout/AppHeader.vue
- tailwind.config.ts
- assets/styles/main.css
```

## Benefits

### 🚀 Fast Feedback
- Only runs tests related to your changes
- Pre-commit: < 5 seconds (unit tests only)
- Pre-push: 10-60 seconds (unit + relevant e2e)

### ✅ High Confidence
- Still catches regressions in affected areas
- Full test suite can run in CI/CD

### 💰 Cost Effective
- Reduces CI/CD time and cost
- Developers get faster feedback locally

## Manual Testing

### Run All Tests
```bash
# All unit tests
npm run test:unit

# All e2e tests
npm test

# All visual tests
npm run test:visual
```

### Run Specific Tests
```bash
# Specific e2e test
npm run test:auth
npm run test:checkout
npm run test:products
npm run test:i18n

# Specific visual test
npm run test:visual -- tests/visual/admin-visual.spec.ts
```

### Debug Tests
```bash
# Debug e2e tests with UI
npm run test:debug

# Debug specific test
npm run test:debug -- tests/e2e/auth.spec.ts
```

## Coverage Thresholds

### Current Status
**Temporarily disabled** (see vitest.config.ts:36-70)

Coverage thresholds are disabled to allow critical fixes while improving test coverage. They will be re-enabled once:
- Stripe composable is refactored to support test isolation
- Supabase import issues in server tests are resolved
- Additional tests are written for uncovered code

### Target Thresholds (To Be Re-enabled)
```typescript
{
  global: {
    branches: 70,
    functions: 75,
    lines: 80,
    statements: 80
  },
  'components/checkout/**': {
    branches: 85,
    functions: 90,
    lines: 90,
    statements: 90
  },
  'composables/useStripe.ts': {
    branches: 85,
    functions: 90,
    lines: 90,
    statements: 90
  },
  'composables/useShipping*.ts': {
    branches: 85,
    functions: 90,
    lines: 90,
    statements: 90
  },
  'composables/useGuestCheckout.ts': {
    branches: 85,
    functions: 90,
    lines: 90,
    statements: 90
  }
}
```

## Bypassing Hooks

⚠️ **Use with caution!**

```bash
# Skip pre-commit hook
git commit --no-verify

# Skip pre-push hook
git push --no-verify
```

Only bypass hooks if:
- You're pushing a critical hotfix
- Tests are failing due to infrastructure issues
- You've manually verified the changes elsewhere

## CI/CD Integration

### GitHub Actions
Full test suite runs on:
- Pull requests to main
- Pushes to main
- All browsers (Chromium, Firefox, WebKit)
- All locales (es, en, ro, ru)

### Vercel
- Preview deployments run unit tests
- Production deployments run full test suite

## Troubleshooting

### Hook Not Running
```bash
# Reinstall hooks
npm run prepare
```

### Hook Permission Denied
```bash
# Make scripts executable
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
chmod +x scripts/pre-commit-tests.sh
chmod +x scripts/pre-push-tests.sh
```

### E2E Tests Failing Locally
```bash
# Install playwright browsers
npm run test:setup

# Check if dev server is running
npm run dev
```

### False Positives in Visual Tests
```bash
# Update snapshots after intentional changes
npm run test:visual:update

# Review changes before committing
git diff tests/visual/**/*.png
```

## Best Practices

1. **Write tests as you code** - Don't accumulate testing debt
2. **Run tests locally first** - Don't rely solely on CI/CD
3. **Keep tests fast** - Aim for < 1s per unit test
4. **Isolate tests** - No shared state between tests
5. **Use descriptive names** - Make failures easy to understand
6. **Mock external services** - Don't hit real APIs in tests
7. **Update snapshots carefully** - Review visual diffs before updating

## Future Improvements

- [ ] Add mutation testing with Stryker
- [ ] Add performance testing with Lighthouse CI
- [ ] Add accessibility testing with axe-core
- [ ] Add contract testing for API endpoints
- [ ] Re-enable coverage thresholds after fixing singleton issues
- [ ] Add test impact analysis for better test selection
