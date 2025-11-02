---
status: pending
priority: p1
issue_id: "004"
tags: [i18n, test-infrastructure, localization, code-review, bug]
dependencies: []
---

# Remove Hardcoded Spanish Text from Test Helpers

## Problem Statement

Cart helper methods contain hardcoded Spanish text, which will cause tests to fail for all non-Spanish locales (English, Romanian, Russian).

**Location:** `/Users/vladislavcaraseli/Documents/MoldovaDirect/tests/fixtures/cart-helpers.ts`

**Instances Found:**
- Line 23: `button:has-text("Añadir al Carrito")`
- Line 51: `h1:has-text("Carrito")`
- Line 112: `button:has-text("OK")`
- Line 261: `text=Seleccionar todo`
- Line 272: `button:has-text("Eliminar seleccionados")`

## Impact

- **Multi-locale testing completely broken** - Tests will only pass in Spanish
- Playwright config has 4 locales configured (es, en, ro, ru) but only Spanish works
- False test failures when running English/Romanian/Russian configurations
- Defeats entire purpose of multi-locale test infrastructure
- Will cause confusion and wasted debugging time

## Findings

**Discovered by:** pattern-recognition-specialist and kieran-typescript-reviewer agents
**Review date:** 2025-11-01

**Examples:**

```typescript
// ❌ BAD - Line 23
async addProductFromListing(productId: string): Promise<void> {
  const productCard = this.page.locator(`[data-testid="product-card-${productId}"]`)
  await productCard.locator('button:has-text("Añadir al Carrito")').click()
  // This will FAIL in English (should be "Add to Cart")
}

// ❌ BAD - Line 51
async goToCart(): Promise<void> {
  await this.page.goto('/cart')
  await this.page.waitForSelector('h1:has-text("Carrito")', { timeout: 10000 })
  // This will FAIL in English (should be "Cart")
}

// ❌ BAD - Line 261
async selectAllItems(): Promise<void> {
  const selectAllButton = this.page.locator('text=Seleccionar todo')
  // This will FAIL in English (should be "Select All")
}
```

## Proposed Solutions

### Option 1: Use data-testid Selectors (RECOMMENDED)

Replace all text-based selectors with data-testid attributes:

```typescript
// ✅ GOOD - Locale-independent
async addProductFromListing(productId: string): Promise<void> {
  const productCard = this.page.locator(`[data-testid="product-card-${productId}"]`)
  await productCard.locator('[data-testid="add-to-cart-button"]').click()
  // Works in ALL locales
}

async goToCart(): Promise<void> {
  await this.page.goto('/cart')
  await this.page.waitForSelector('[data-testid="cart-heading"]', { timeout: 10000 })
  // Works in ALL locales
}

async selectAllItems(): Promise<void> {
  const selectAllButton = this.page.locator('[data-testid="select-all-button"]')
  // Works in ALL locales
}
```

**Pros:**
- Locale-independent
- More stable (text changes don't break tests)
- Consistent with existing test strategy
- Works across all 4 configured locales

**Cons:**
- Requires adding data-testid attributes to components
- Need to update 6 components

**Effort:** Medium (2-3 hours)
**Risk:** Low

### Option 2: Locale-Aware Text Selectors

Use locale context to select appropriate text:

```typescript
async addProductFromListing(productId: string): Promise<void> {
  const locale = this.page.context().locale || 'es'
  const buttonText = {
    es: 'Añadir al Carrito',
    en: 'Add to Cart',
    ro: 'Adaugă în Coș',
    ru: 'Добавить в корзину'
  }[locale]

  await productCard.locator(`button:has-text("${buttonText}")`).click()
}
```

**Pros:**
- No component changes needed
- Tests validate actual text users see

**Cons:**
- Fragile (breaks if wording changes)
- Duplicates translation logic
- More complex and error-prone
- Doesn't follow test best practices

**Effort:** Medium (3-4 hours)
**Risk:** Medium

### Option 3: Simplify to Single Locale Initially

Reduce Playwright config to only Spanish until ready for multi-locale:

```typescript
// playwright.config.ts
const locales = ['es']  // Only Spanish for now
```

**Pros:**
- Quick fix
- Tests will pass
- Can add locales later when ready

**Cons:**
- Doesn't solve the root problem
- Still breaks if Spanish text changes
- Defeats multi-locale infrastructure

**Effort:** Small (15 minutes)
**Risk:** Very Low

## Recommended Action

**THIS WEEK:**

1. **Audit all components** to add missing data-testid attributes:

   ```vue
   <!-- ProductCard.vue -->
   <button data-testid="add-to-cart-button">
     {{ $t('cart.addToCart') }}
   </button>

   <!-- Cart.vue -->
   <h1 data-testid="cart-heading">
     {{ $t('cart.title') }}
   </h1>

   <button data-testid="select-all-button">
     {{ $t('cart.selectAll') }}
   </button>

   <button data-testid="remove-selected-button">
     {{ $t('cart.removeSelected') }}
   </button>

   <!-- Modal/Dialog -->
   <button data-testid="confirm-button">
     {{ $t('common.ok') }}
   </button>
   ```

2. **Update cart-helpers.ts** to use data-testid:

   ```typescript
   // Line 23 - Fix addProductFromListing
   async addProductFromListing(productId: string): Promise<void> {
     const productCard = this.page.locator(`[data-testid="product-card-${productId}"]`)
     await productCard.locator('[data-testid="add-to-cart-button"]').click()
     await this.page.waitForSelector('[data-testid="toast"]', { timeout: 5000 })
   }

   // Line 51 - Fix goToCart
   async goToCart(): Promise<void> {
     await this.page.goto('/cart')
     await this.page.waitForSelector('[data-testid="cart-heading"]', { timeout: 10000 })
   }

   // Line 112 - Fix clearCart
   async clearCart(): Promise<void> {
     await this.page.click('[data-testid="clear-cart-button"]')

     const confirmButton = this.page.locator('[data-testid="confirm-button"]')
     if (await confirmButton.isVisible({ timeout: 2000 })) {
       await confirmButton.click()
     }

     await this.page.waitForTimeout(1000)
   }

   // Line 261 - Fix selectAllItems
   async selectAllItems(): Promise<void> {
     const selectAllButton = this.page.locator('[data-testid="select-all-button"]')
     if (await selectAllButton.isVisible()) {
       await selectAllButton.click()
       await this.waitForCartUpdate()
     }
   }

   // Line 272 - Fix bulkRemoveSelected
   async bulkRemoveSelected(): Promise<void> {
     const bulkRemoveButton = this.page.locator('[data-testid="remove-selected-button"]')
     if (await bulkRemoveButton.isVisible()) {
       await bulkRemoveButton.click()

       const confirmButton = this.page.locator('[data-testid="confirm-button"]')
       if (await confirmButton.isVisible({ timeout: 2000 })) {
         await confirmButton.click()
       }

       await this.waitForCartUpdate()
     }
   }
   ```

3. **Add data-testid consistency check** to prevent regression:

   ```typescript
   // tests/utils/validate-testids.ts
   export function validateTestIds(page: Page) {
     // Verify no text-based selectors in use
     const textSelectors = [
       'has-text("Añadir")',
       'has-text("Carrito")',
       'text=',
     ]

     // Could add automated check in tests
   }
   ```

## Technical Details

- **Affected Files:**
  - `tests/fixtures/cart-helpers.ts` (6 hardcoded text instances)
  - Components that need data-testid:
    - `ProductCard.vue`
    - `Cart.vue` (heading, buttons)
    - `Modal.vue` or `Dialog.vue` (confirm button)

- **Locales Affected:**
  - ❌ English (en)
  - ❌ Romanian (ro)
  - ❌ Russian (ru)
  - ✅ Spanish (es) - currently works

- **Test Projects Impacted:**
  - All 12 browser/locale combinations
  - 9 of 12 projects currently broken (all non-Spanish)

## Resources

- Playwright Locators: https://playwright.dev/docs/locators
- Best Practices: Use data-testid: https://playwright.dev/docs/best-practices#use-data-testid
- Testing Library Guide: https://testing-library.com/docs/queries/bytestid/

## Acceptance Criteria

- [ ] All hardcoded Spanish text removed from cart-helpers.ts
- [ ] data-testid attributes added to all referenced components
- [ ] Tests pass in all 4 locales (es, en, ro, ru)
- [ ] Verified tests work in all browser projects
- [ ] No text-based selectors remain in test helpers
- [ ] Component data-testid attributes follow naming convention
- [ ] Documentation updated with data-testid standards

## Work Log

### 2025-11-01 - Code Review Discovery
**By:** Claude Code Review System (pattern-recognition-specialist, kieran-typescript-reviewer)
**Actions:**
- Discovered during comprehensive e2e test infrastructure review
- Found 6 instances of hardcoded Spanish text
- Identified that multi-locale testing is completely broken
- Categorized as P1 high priority bug

**Learnings:**
- Text-based selectors break multi-locale testing
- data-testid is the correct approach for locale-independent tests
- Need to establish data-testid naming conventions
- Should audit all test helpers for similar issues

## Notes

**Quick Test to Verify Multi-Locale:**

After fixing, run tests in all locales:

```bash
# Test Spanish (should still work)
npx playwright test --project=chromium-es

# Test English (should now work)
npx playwright test --project=chromium-en

# Test Romanian (should now work)
npx playwright test --project=chromium-ro

# Test Russian (should now work)
npx playwright test --project=chromium-ru
```

**data-testid Naming Convention:**

Establish standard format:
- Buttons: `{action}-button` (e.g., `add-to-cart-button`, `confirm-button`)
- Headings: `{page}-heading` (e.g., `cart-heading`)
- Forms: `{field}-input` (e.g., `email-input`)
- Containers: `{content}-container` (e.g., `product-card-${id}`)

**Other Files to Audit:**

Check these for similar issues:
- `tests/fixtures/helpers.ts` - May have hardcoded text
- `tests/fixtures/pages.ts` - Check all page objects
- Any future test spec files

Source: E2E test infrastructure review performed on 2025-11-01
Review command: `/compounding-engineering:review e2e tests setup files`
