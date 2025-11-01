---
status: pending
priority: p1
issue_id: "005"
tags: [test-infrastructure, performance, flaky-tests, code-review, anti-pattern]
dependencies: []
---

# Eliminate waitForTimeout Anti-Pattern from Test Infrastructure

## Problem Statement

Test helpers contain **7 instances** of `waitForTimeout()` with arbitrary hard waits (500ms-1000ms). This is a severe anti-pattern that makes tests slower, flakier, and unreliable.

**Locations:**
- `tests/fixtures/helpers.ts:13` - 500ms wait after network idle
- `tests/fixtures/cart-helpers.ts:73` - 500ms wait after quantity increase
- `tests/fixtures/cart-helpers.ts:81` - 500ms wait after quantity decrease
- `tests/fixtures/cart-helpers.ts:91` - 500ms wait after quantity set
- `tests/fixtures/cart-helpers.ts:101` - **1000ms** wait after item removal
- `tests/fixtures/cart-helpers.ts:116` - **1000ms** wait after clear cart
- `tests/fixtures/cart-helpers.ts:164` - **1000ms** wait in waitForCartUpdate

## Impact

- **Slow Tests:** Adds 4.5-7 seconds of unnecessary waiting per cart test
- **Flaky Tests:** Arbitrary timeouts may be too short on slow machines/CI
- **False Confidence:** Tests may pass even when app is broken
- **Poor Developer Experience:** Developers wait unnecessarily during test runs
- **Hides Real Issues:** Masks timing bugs that should be fixed in application code

**Example Impact:**
A simple cart test that adds 3 items, removes 1, and checks out:
- Current: ~8-10 seconds (with waits)
- Optimized: ~2-3 seconds (without waits)
- **60-70% faster!**

## Findings

**Discovered by:** pattern-recognition-specialist and performance-oracle agents
**Review date:** 2025-11-01

**Why This Is Bad (Playwright Documentation):**
> "Never use `page.waitForTimeout()` in production. Rely on web assertions and proper synchronization instead."

**Examples:**

```typescript
// ❌ BAD - Line 11-14 in helpers.ts
async waitForPageLoad() {
  await this.page.waitForLoadState('networkidle')
  await this.page.waitForTimeout(500)  // Why wait MORE after networkidle?
}

// ❌ BAD - Line 73 in cart-helpers.ts
async increaseQuantity(productId: string): Promise<void> {
  await this.page.click(`[data-testid="increase-quantity-${productId}"]`)
  await this.page.waitForTimeout(500) // Wait for update - but what if it takes 501ms?
}

// ❌ BAD - Line 101 in cart-helpers.ts
async removeItem(productId: string): Promise<void> {
  await this.page.click(`[data-testid="remove-item-${productId}"]`)
  await this.page.waitForTimeout(1000)  // 1 FULL SECOND!
}

// ❌ WORST - Line 163-172 in cart-helpers.ts
async waitForCartUpdate(): Promise<void> {
  await this.page.waitForTimeout(1000)  // ALWAYS waits 1 second first!

  // Then checks for loading... backwards!
  const loadingElements = this.page.locator('[data-testid*="loading"]')
  if (await loadingElements.count() > 0) {
    await loadingElements.first().waitFor({ state: 'hidden', timeout: 5000 })
  }
}
```

## Proposed Solutions

### Option 1: Wait for Element State Changes (RECOMMENDED)

Replace fixed timeouts with assertions on actual state changes:

```typescript
// ✅ GOOD - Wait for quantity to actually change
async increaseQuantity(productId: string): Promise<void> {
  const quantityDisplay = this.getQuantityDisplay(productId)
  const initialQuantity = await quantityDisplay.textContent()

  await this.page.click(`[data-testid="increase-quantity-${productId}"]`)

  // Wait for quantity to be different from initial
  await expect(quantityDisplay).not.toHaveText(initialQuantity || '')
}

// ✅ GOOD - Wait for item to actually disappear
async removeItem(productId: string): Promise<void> {
  const cartItem = this.getCartItem(productId)

  await this.page.click(`[data-testid="remove-item-${productId}"]`)

  // Wait for item to be removed from DOM
  await expect(cartItem).not.toBeVisible()
}

// ✅ GOOD - Wait for loading to appear AND disappear
async waitForCartUpdate(): Promise<void> {
  const loadingIndicator = this.page.locator('[data-testid="cart-loading"]')

  // If loading appears, wait for it to disappear
  if (await loadingIndicator.isVisible({ timeout: 100 })) {
    await expect(loadingIndicator).not.toBeVisible({ timeout: 5000 })
  }
}
```

**Pros:**
- Tests wait exactly as long as needed (not more, not less)
- More reliable on slow/fast machines
- Catches actual bugs (if element never appears, test fails correctly)
- Playwright auto-retries assertions

**Cons:**
- Requires understanding what state changes to wait for
- Need proper data-testid or loading indicators in components

**Effort:** Medium (4-5 hours)
**Risk:** Low

### Option 2: Wait for Network Requests

For operations that trigger API calls, wait for the network request:

```typescript
// ✅ GOOD - Wait for cart update API call
async increaseQuantity(productId: string): Promise<void> {
  const responsePromise = this.page.waitForResponse(
    response => response.url().includes('/api/cart') && response.status() === 200
  )

  await this.page.click(`[data-testid="increase-quantity-${productId}"]`)

  await responsePromise  // Wait for API to complete
}
```

**Pros:**
- Waits for actual backend completion
- Very reliable
- Fast (no extra waiting)

**Cons:**
- Couples tests to API structure
- More complex
- Need to know which endpoints are called

**Effort:** Medium-Large (6-8 hours)
**Risk:** Medium

### Option 3: Reduce Timeout Values (NOT RECOMMENDED)

Quick fix: reduce from 1000ms to 100ms:

```typescript
await this.page.waitForTimeout(100)  // Still bad, but less bad
```

**Pros:**
- Quick fix
- Tests run faster

**Cons:**
- Still an anti-pattern
- Still flaky
- Doesn't solve root problem

**Effort:** Small (30 minutes)
**Risk:** High (tests may become flakier)

## Recommended Action

**THIS WEEK:**

Implement Option 1 for all 7 instances:

### 1. Fix helpers.ts:11-14

```typescript
// BEFORE
async waitForPageLoad() {
  await this.page.waitForLoadState('networkidle')
  await this.page.waitForTimeout(500)
}

// AFTER - Remove entirely, use specific waits in tests
// OR if really needed:
async waitForPageLoad() {
  await this.page.waitForLoadState('domcontentloaded')
  // No timeout - networkidle is already sufficient
}
```

### 2. Fix cart-helpers.ts:71-74 (increaseQuantity)

```typescript
// BEFORE
async increaseQuantity(productId: string): Promise<void> {
  await this.page.click(`[data-testid="increase-quantity-${productId}"]`)
  await this.page.waitForTimeout(500)
}

// AFTER
async increaseQuantity(productId: string): Promise<void> {
  const quantityDisplay = this.getQuantityDisplay(productId)
  const before = await quantityDisplay.textContent()

  await this.page.click(`[data-testid="increase-quantity-${productId}"]`)

  await expect(quantityDisplay).not.toHaveText(before || '')
}
```

### 3. Fix cart-helpers.ts:79-82 (decreaseQuantity)

```typescript
// BEFORE
async decreaseQuantity(productId: string): Promise<void> {
  await this.page.click(`[data-testid="decrease-quantity-${productId}"]`)
  await this.page.waitForTimeout(500)
}

// AFTER
async decreaseQuantity(productId: string): Promise<void> {
  const quantityDisplay = this.getQuantityDisplay(productId)
  const before = await quantityDisplay.textContent()

  await this.page.click(`[data-testid="decrease-quantity-${productId}"]`)

  await expect(quantityDisplay).not.toHaveText(before || '')
}
```

### 4. Fix cart-helpers.ts:87-92 (setQuantity)

```typescript
// BEFORE
async setQuantity(productId: string, quantity: number): Promise<void> {
  const quantityInput = this.page.locator(`[data-testid="quantity-input-${productId}"]`)
  await quantityInput.fill(quantity.toString())
  await quantityInput.press('Enter')
  await this.page.waitForTimeout(500)
}

// AFTER
async setQuantity(productId: string, quantity: number): Promise<void> {
  const quantityInput = this.page.locator(`[data-testid="quantity-input-${productId}"]`)
  const quantityDisplay = this.getQuantityDisplay(productId)

  await quantityInput.fill(quantity.toString())
  await quantityInput.press('Enter')

  await expect(quantityDisplay).toHaveText(quantity.toString())
}
```

### 5. Fix cart-helpers.ts:97-102 (removeItem)

```typescript
// BEFORE
async removeItem(productId: string): Promise<void> {
  await this.page.click(`[data-testid="remove-item-${productId}"]`)
  await this.page.waitForTimeout(1000)  // 1 SECOND!
}

// AFTER
async removeItem(productId: string): Promise<void> {
  const cartItem = this.getCartItem(productId)

  await this.page.click(`[data-testid="remove-item-${productId}"]`)

  // Wait for item to disappear (with animation)
  await expect(cartItem).not.toBeVisible({ timeout: 2000 })
}
```

### 6. Fix cart-helpers.ts:107-117 (clearCart)

```typescript
// BEFORE
async clearCart(): Promise<void> {
  await this.page.click('[data-testid="clear-cart-button"]')

  const confirmButton = this.page.locator('button:has-text("OK")').first()
  if (await confirmButton.isVisible({ timeout: 2000 })) {
    await confirmButton.click()
  }

  await this.page.waitForTimeout(1000)
}

// AFTER
async clearCart(): Promise<void> {
  await this.page.click('[data-testid="clear-cart-button"]')

  const confirmButton = this.page.locator('[data-testid="confirm-button"]')
  if (await confirmButton.isVisible({ timeout: 2000 })) {
    await confirmButton.click()
  }

  // Wait for empty cart message
  const emptyMessage = this.page.locator('[data-testid="empty-cart-message"]')
  await expect(emptyMessage).toBeVisible({ timeout: 3000 })
}
```

### 7. Fix cart-helpers.ts:163-172 (waitForCartUpdate)

```typescript
// BEFORE
async waitForCartUpdate(): Promise<void> {
  await this.page.waitForTimeout(1000)  // ALWAYS 1 SECOND

  const loadingElements = this.page.locator('[data-testid*="loading"]')
  if (await loadingElements.count() > 0) {
    await loadingElements.first().waitFor({ state: 'hidden', timeout: 5000 })
  }
}

// AFTER
async waitForCartUpdate(): Promise<void> {
  // Wait for loading indicator to disappear (if it appears)
  const loadingIndicator = this.page.locator('[data-testid="cart-loading"]')

  // Check if loading is visible (short timeout)
  const isLoading = await loadingIndicator.isVisible({ timeout: 100 })

  if (isLoading) {
    // Wait for it to disappear
    await expect(loadingIndicator).not.toBeVisible({ timeout: 5000 })
  }

  // Alternatively, wait for cart to have stable count
  const cartIcon = this.getCartIcon()
  await expect(cartIcon).toBeVisible()
}
```

## Technical Details

- **Files to Update:**
  - `tests/fixtures/helpers.ts` (1 instance)
  - `tests/fixtures/cart-helpers.ts` (6 instances)

- **Performance Impact:**
  - Current: 4500-7000ms of fixed waits per cart test
  - After: ~0-500ms actual waiting (only when needed)
  - **Estimated speedup: 60-90% faster tests**

- **Components that May Need Updates:**
  - Add `data-testid="cart-loading"` to loading indicator
  - Add `data-testid="empty-cart-message"` if missing

## Resources

- Playwright Best Practices: https://playwright.dev/docs/best-practices#avoid-wait-for-timeout
- Web-First Assertions: https://playwright.dev/docs/test-assertions
- Auto-Waiting: https://playwright.dev/docs/actionability

## Acceptance Criteria

- [ ] All 7 `waitForTimeout` calls removed
- [ ] Replaced with proper element state assertions
- [ ] Tests still pass (and are faster)
- [ ] No new flaky tests introduced
- [ ] Verified test speed improvement (measure before/after)
- [ ] Loading indicators have proper data-testid if needed
- [ ] Documentation updated with best practices
- [ ] Code review confirms no arbitrary waits remain

## Work Log

### 2025-11-01 - Code Review Discovery
**By:** Claude Code Review System (pattern-recognition-specialist, performance-oracle)
**Actions:**
- Discovered during comprehensive e2e test infrastructure review
- Found 7 instances of waitForTimeout anti-pattern
- Calculated performance impact (4.5-7 seconds waste per test)
- Categorized as P1 high priority performance issue

**Learnings:**
- waitForTimeout is a red flag in all test frameworks
- Proper state assertions are more reliable and faster
- Need to establish testing best practices documentation
- Should add pre-commit hook or linter to prevent this pattern

## Notes

**Quick Wins:**

The fastest improvement comes from fixing `waitForCartUpdate()` (line 164) since it:
- ALWAYS waits 1 second (even when not needed)
- Is called by many other helper methods
- Fixing it speeds up multiple operations

**Before/After Comparison:**

Run this test to measure improvement:

```typescript
test('cart operations speed', async ({ page }) => {
  const startTime = Date.now()

  // Add 5 items
  for (let i = 0; i < 5; i++) {
    await helpers.cart.addProductFromListing(`prod-${i}`)
  }

  // Remove 2 items
  await helpers.cart.removeItem('prod-0')
  await helpers.cart.removeItem('prod-1')

  const duration = Date.now() - startTime
  console.log(`Test duration: ${duration}ms`)

  // Before: ~8000ms
  // After:  ~2000ms
})
```

**Prevent Regression:**

Add ESLint rule:

```json
// .eslintrc.js
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.property.name='waitForTimeout']",
        "message": "Don't use waitForTimeout - use proper assertions instead"
      }
    ]
  }
}
```

Source: E2E test infrastructure review performed on 2025-11-01
Review command: `/compounding-engineering:review e2e tests setup files`
