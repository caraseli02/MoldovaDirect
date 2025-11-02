---
status: pending
priority: p2
issue_id: "006"
tags: [test-infrastructure, yagni, over-engineering, code-review, simplification]
dependencies: ["001", "002", "003", "004", "005"]
---

# Simplify Over-Engineered Test Infrastructure

## Problem Statement

Extensive test infrastructure has been built (1,300+ lines) but **ZERO actual e2e test spec files exist**. This is premature optimization and violates YAGNI (You Aren't Gonna Need It) principles.

**Key Statistics:**
- Infrastructure LOC: ~1,300 lines
- Actual test spec files: 0
- Unused code: ~95%
- Playwright projects configured: 15
- Tests written: 0

## Impact

- **Maintenance burden** for code that isn't used
- **False complexity** making it harder to write actual tests
- **Confusion** for new developers about what's needed
- **Wasted time** building features before understanding needs
- **Risk** of building wrong abstractions

## Findings

**Discovered by:** code-simplicity-reviewer and architecture-strategist agents
**Review date:** 2025-11-01

**Files That Can Be Deleted:**

| File | Lines | Reason |
|------|-------|--------|
| `tests/fixtures/cart-helpers.ts` | 445 | No cart tests exist |
| `tests/run-auth-tests.ts` | 311 | Test runner for non-existent tests |
| `tests/fixtures/pages.ts` | 212 | POMs before tests |
| `tests/fixtures/helpers.ts` | 135 | Duplicate functionality |
| `tests/fixtures/base.ts` | 145 | Over-abstracted fixtures |
| `tests/global-setup.ts` | 48 | Fake auth setup |
| `tests/global-teardown.ts` | 25 | Unnecessary cleanup |
| **Total** | **1,321** | **95% can be deleted** |

## Proposed Solutions

### Option 1: Delete Everything, Start Fresh (RECOMMENDED)

Most impactful approach - remove all infrastructure and rebuild as needed:

**Step 1: Backup and Delete**
```bash
# Create backup branch
git checkout -b backup/test-infrastructure-before-simplification
git push origin backup/test-infrastructure-before-simplification

# Switch back to main
git checkout main

# Delete unused infrastructure
rm -rf tests/fixtures/
rm tests/run-auth-tests.ts
rm tests/global-setup.ts
rm tests/global-teardown.ts
```

**Step 2: Minimal playwright.config.ts**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**Step 3: Write First Test**
```typescript
// tests/e2e/homepage.spec.ts
import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
})
```

**Step 4: Extract Helpers ONLY When Duplicating Code 3+ Times**

**Pros:**
- Immediate 95% LOC reduction
- Start with what you actually need
- Build correct abstractions based on real usage
- Faster to write first tests

**Cons:**
- Loses existing code (mitigated by backup branch)
- Need to rebuild some helpers eventually

**Effort:** Small (1-2 hours)
**Risk:** Very Low (code is backed up, not being used anyway)

### Option 2: Incremental Cleanup

Keep infrastructure but fix critical issues:

1. Fix P0 security issues (#001, #002)
2. Fix P1 functionality issues (#003, #004, #005)
3. Write 5 actual tests
4. Delete helpers that aren't used by those tests
5. Repeat

**Pros:**
- Less disruptive
- Preserves some work
- Gradual learning

**Cons:**
- Still maintaining unused code
- Slower progress
- May build wrong abstractions

**Effort:** Large (ongoing, 2-3 weeks)
**Risk:** Medium (may never fully clean up)

### Option 3: Keep Infrastructure, Write Tests to Match

Write tests that use the existing infrastructure:

1. Implement auth tests to use run-auth-tests.ts
2. Implement cart tests to use cart-helpers.ts
3. Implement page tests to use page objects

**Pros:**
- Uses existing work
- Tests might be comprehensive

**Cons:**
- Forced to use potentially wrong abstractions
- Still over-engineered
- Tests built to match infrastructure (backwards)

**Effort:** Very Large (4-6 weeks)
**Risk:** High (wrong abstractions, technical debt)

## Recommended Action

**THIS WEEK: Implement Option 1**

### Day 1: Backup and Simplify

1. **Create backup:**
   ```bash
   git checkout -b backup/test-infrastructure-2025-11-01
   git push origin backup/test-infrastructure-2025-11-01
   ```

2. **Simplify playwright.config.ts:**
   - Reduce from 15 projects to 1 (chromium only)
   - Remove global setup/teardown
   - Remove storage state configs
   - Keep webServer and basic settings

3. **Delete unused files:**
   ```bash
   rm tests/fixtures/cart-helpers.ts
   rm tests/fixtures/helpers.ts
   rm tests/fixtures/pages.ts
   rm tests/run-auth-tests.ts
   rm tests/global-setup.ts
   rm tests/global-teardown.ts
   ```

4. **Simplify base.ts:**
   Keep minimal fixtures:
   ```typescript
   export const test = base.extend({
     // Just baseURL, maybe locale
   })
   ```

### Day 2-3: Write First Tests

5. **Create 3 simple tests:**
   - `tests/e2e/homepage.spec.ts` - Homepage loads
   - `tests/e2e/navigation.spec.ts` - Can navigate to products
   - `tests/e2e/product-detail.spec.ts` - Product page shows details

6. **Extract helpers ONLY if you duplicate code 3+ times**

### Day 4-5: Validate Approach

7. **Run tests in CI**
8. **Measure test speed**
9. **Evaluate if abstractions are needed yet**
10. **Document learnings**

## Technical Details

- **Before:**
  - 1,321 lines of infrastructure
  - 15 Playwright projects
  - 0 test spec files
  - Complex global setup/teardown

- **After:**
  - ~100 lines of infrastructure
  - 1 Playwright project
  - 3-5 test spec files
  - No global setup needed
  - Helpers extracted as needed

- **LOC Reduction:** 1,221 lines (92%)
- **Complexity Reduction:** 93% (15 projects → 1)

## Resources

- YAGNI Principle: https://martinfowler.com/bliki/Yagni.html
- Playwright Getting Started: https://playwright.dev/docs/intro
- Test-Driven Development: https://www.jamesshore.com/v2/books/aoad1/test_driven_development

## Acceptance Criteria

### For Option 1 (Recommended):
- [ ] Backup branch created and pushed
- [ ] playwright.config.ts simplified to ~50 lines
- [ ] Reduced from 15 projects to 1
- [ ] Unused infrastructure files deleted
- [ ] base.ts simplified to minimal fixtures
- [ ] 3-5 simple test spec files created
- [ ] All tests passing
- [ ] Tests run faster than before (if comparable)
- [ ] Documentation updated with new approach
- [ ] Team aligned on "extract helpers when needed" principle

## Work Log

### 2025-11-01 - Code Review Discovery
**By:** Claude Code Review System (code-simplicity-reviewer, architecture-strategist)
**Actions:**
- Discovered during comprehensive e2e test infrastructure review
- Analyzed all infrastructure files for usage
- Found 0 test spec files using the infrastructure
- Calculated 95% waste (1,321 lines unused)
- Categorized as P2 simplification opportunity

**Learnings:**
- Infrastructure before tests is premature optimization
- YAGNI is especially important in test code
- Better to extract abstractions from real usage patterns
- 3+ duplications is good heuristic for when to abstract
- Page Object Models should emerge from tests, not be pre-built

**Evidence of Over-Engineering:**
1. **445-line cart helper** for feature with no tests
2. **311-line test runner** for tests that don't exist
3. **12 locale/browser combinations** before first test
4. **Global setup creating fake auth** not used anywhere
5. **Visual snapshots** exist but spec files that created them are gone

## Notes

**Quick Start After Simplification:**

```typescript
// tests/e2e/smoke.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('can navigate to products', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-testid="products-link"]')
    await expect(page).toHaveURL(/.*products/)
  })

  test('can view product detail', async ({ page }) => {
    await page.goto('/products')
    const firstProduct = page.locator('[data-testid^="product-card"]').first()
    await firstProduct.click()
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible()
  })
})
```

**When to Extract Helpers:**

```typescript
// After writing 3 similar tests like this:
test('add product 1 to cart', async ({ page }) => {
  await page.goto('/products/wine-1')
  await page.click('[data-testid="add-to-cart-button"]')
  await page.waitForSelector('[data-testid="toast"]')
})

test('add product 2 to cart', async ({ page }) => {
  await page.goto('/products/wine-2')
  await page.click('[data-testid="add-to-cart-button"]')
  await page.waitForSelector('[data-testid="toast"]')
})

// THEN extract helper:
async function addToCart(page: Page, slug: string) {
  await page.goto(`/products/${slug}`)
  await page.click('[data-testid="add-to-cart-button"]')
  await page.waitForSelector('[data-testid="toast"]')
}
```

**Philosophy Change:**

- **Before:** Build infrastructure, then write tests to use it
- **After:** Write tests, extract infrastructure when it becomes painful

This is test-driven infrastructure development.

Source: E2E test infrastructure review performed on 2025-11-01
Review command: `/compounding-engineering:review e2e tests setup files`
