# Moldova Direct - Testing Guide

## Testing Overview

The project uses a comprehensive testing strategy with:
- **Unit Tests**: Vitest for composables, utilities, components
- **E2E Tests**: Playwright for user flows
- **Visual Tests**: Screenshot comparison for UI regression

## Test Coverage

| Type | Coverage | Tools |
|------|----------|-------|
| Visual | 85% (40/47 pages) | Playwright |
| E2E | 51% (24/47 pages) | Playwright |
| Unit | 137 tests passing | Vitest |

## Quick Commands

```bash
# Run all tests
pnpm test

# Unit tests
pnpm test:unit
pnpm test:unit:watch     # Watch mode
pnpm test:unit:ui        # With UI
pnpm test:coverage       # With coverage

# E2E tests
pnpm test:e2e
pnpm test:headed         # See browser
pnpm test:debug          # Debug mode

# Browser-specific
pnpm test:chromium
pnpm test:firefox
pnpm test:webkit
pnpm test:mobile

# Feature-specific
pnpm test:auth
pnpm test:products
pnpm test:checkout
pnpm test:i18n

# Visual tests
pnpm test:visual
pnpm test:visual:update  # Update snapshots

# Reports
pnpm test:report
```

## Unit Testing (Vitest)

### Setup
```bash
pnpm test:unit
```

### Writing Unit Tests

```typescript
// tests/unit/composables/useCart.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useCart } from '~/composables/useCart'

describe('useCart', () => {
  beforeEach(() => {
    // Reset cart state
  })

  it('should add item to cart', () => {
    const { addItem, items } = useCart()

    addItem({ id: '1', name: 'Product', price: 10 }, 1)

    expect(items.value).toHaveLength(1)
    expect(items.value[0].quantity).toBe(1)
  })

  it('should calculate total correctly', () => {
    const { addItem, total } = useCart()

    addItem({ id: '1', price: 10 }, 2)
    addItem({ id: '2', price: 15 }, 1)

    expect(total.value).toBe(35)
  })
})
```

### Coverage Targets
- Global: 70% branches, 75% functions, 80% lines
- Critical paths (checkout, stripe): 85-90%

## E2E Testing (Playwright)

### Test Structure
```
tests/
├── e2e/                    # E2E tests
│   ├── auth.spec.ts       # Authentication
│   ├── products.spec.ts   # Product browsing
│   ├── checkout.spec.ts   # Checkout flow
│   └── i18n.spec.ts       # Internationalization
├── visual/                 # Visual regression
├── fixtures/              # Test utilities
│   ├── base.ts           # Base configuration
│   ├── helpers.ts        # Helper functions
│   └── pages.ts          # Page objects
├── setup/                 # Setup files
├── global-setup.ts       # Global setup
└── global-teardown.ts    # Global cleanup
```

### Writing E2E Tests

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '../fixtures/base'

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    // Arrange
    await page.goto('/auth/login')

    // Act
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'Password123!')
    await page.click('[data-testid="login-button"]')

    // Assert
    await expect(page).toHaveURL('/account')
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')

    await page.fill('[data-testid="email-input"]', 'wrong@example.com')
    await page.fill('[data-testid="password-input"]', 'wrongpassword')
    await page.click('[data-testid="login-button"]')

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })
})
```

### Using Page Objects

```typescript
// tests/fixtures/pages.ts
export class ProductPage {
  constructor(private page: Page) {}

  async goto(slug: string) {
    await this.page.goto(`/products/${slug}`)
  }

  async addToCart(quantity = 1) {
    await this.page.fill('[data-testid="quantity-input"]', String(quantity))
    await this.page.click('[data-testid="add-to-cart-btn"]')
  }

  async getPrice() {
    return this.page.locator('[data-testid="product-price"]').textContent()
  }
}

// Usage in test
test('should add product to cart', async ({ page }) => {
  const productPage = new ProductPage(page)
  await productPage.goto('wine-cabernet')
  await productPage.addToCart(2)

  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('2')
})
```

### Multi-Locale Testing

Tests run across all 4 languages automatically:

```typescript
// playwright.config.ts projects include locale matrix
test('should display correct language', async ({ page }) => {
  await page.goto('/en/products')
  await expect(page.locator('h1')).toContainText('Products')

  await page.goto('/es/products')
  await expect(page.locator('h1')).toContainText('Productos')
})
```

## Visual Regression Testing

### Directory Structure
```
.visual-testing/
├── baselines/          # Reference screenshots (git tracked)
├── snapshots/          # Current test run (gitignored)
├── reports/            # HTML reports (gitignored)
└── utils.ts            # Shared utilities
```

### Writing Visual Tests

```typescript
// tests/visual/products.spec.ts
import { test, expect } from '@playwright/test'

test('product page matches snapshot', async ({ page }) => {
  await page.goto('/products/wine-cabernet')

  // Wait for images to load
  await page.waitForLoadState('networkidle')

  // Mask dynamic content
  await expect(page).toHaveScreenshot('product-page.png', {
    fullPage: true,
    mask: [
      page.locator('[data-testid="timestamp"]'),
      page.locator('[data-testid="stock-count"]')
    ]
  })
})
```

### Updating Snapshots
```bash
# Update all visual snapshots
pnpm test:visual:update

# Update specific test
pnpm test:visual -- --update-snapshots products.spec.ts
```

## Test Data Management

### Database Seeding
Tests use isolated test data:

```typescript
// tests/fixtures/seed.ts
export async function seedTestProducts() {
  return [
    { id: 'test-1', name: 'Test Wine', price: 15.99 },
    { id: 'test-2', name: 'Test Food', price: 8.99 }
  ]
}
```

### Test Users
```env
# .env.test
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=AdminPassword123!
```

### Authentication States

```typescript
// Pre-authenticated user fixture
test('should access account page', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/account')
  await expect(authenticatedPage.locator('h1')).toContainText('My Account')
})
```

## CI/CD Integration

### GitHub Actions
Tests run automatically on:
- Push to main/develop
- Pull requests to main
- Manual dispatch

### Matrix Testing
- Browsers: Chrome, Firefox, Safari
- Locales: ES, EN, RO, RU
- Viewports: Desktop, Mobile

## Best Practices

### Element Selection
Use `data-testid` for stable selectors:
```vue
<button data-testid="submit-button">Submit</button>
```

### Waiting
Wait for network idle before assertions:
```typescript
await page.waitForLoadState('networkidle')
```

### Dynamic Content
Mask timestamps and dynamic content in visual tests:
```typescript
mask: [page.locator('[data-testid="timestamp"]')]
```

### Independence
Keep tests isolated:
```typescript
test.beforeEach(async ({ page }) => {
  // Reset state
  await page.goto('/')
  await clearCart(page)
})
```

## Troubleshooting Tests

### Browser Installation
```bash
pnpm test:setup
```

### Debug Mode
```bash
pnpm test:debug -- tests/e2e/auth.spec.ts
```

### View Test Report
```bash
pnpm test:report
```

### Clear Cache
```bash
rm -rf node_modules/.cache
pnpm install
```
