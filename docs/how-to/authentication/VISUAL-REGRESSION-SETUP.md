# Visual Regression Testing Setup

## Prerequisites

- [Add prerequisites here]

## Steps


**Status:** ✅ Comprehensive baselines created for Hybrid Progressive Checkout
**Coverage:** 28 screenshot assertions across all checkout states, locales, and devices
**Date:** 2025-12-26

---

## Overview

Visual regression testing has been implemented for the Hybrid Progressive Checkout flow using Playwright's screenshot comparison capabilities. This ensures UI consistency and catches unintended visual changes.

## What's Included

### Test Files

1. **`tests/visual-regression/checkout-flow.spec.ts`** (NEW)
   - 22 test cases
   - 28 screenshot assertions
   - Comprehensive checkout flow coverage

2. **`tests/visual-regression/critical-pages.spec.ts`** (Existing)
   - Homepage, products, cart, auth pages
   - Additional ~20 screenshots

### Documentation

- **`tests/visual-regression/README.md`** - Complete guide
- **`tests/visual-regression/QUICK-START.md`** - Quick reference
- **`playwright.visual-regression.config.ts`** - Configuration

### Coverage Breakdown

#### Checkout Flow Screenshots (28 total)

**Empty State (4):**
- Desktop empty redirect/state
- Mobile empty redirect/state

**Guest Checkout Flow (9):**
- Guest prompt (desktop)
- Initial state (desktop + mobile)
- Address filled (desktop)
- Shipping methods loaded (desktop)
- Shipping method selected (desktop)
- Payment selected (desktop)
- Ready to place order (desktop + mobile)

**Multi-Locale (4):**
- Spanish (es)
- English (en)
- Romanian (ro)
- Russian (ru)

**Component Screenshots (4):**
- Order summary sidebar
- Address form (empty + filled)
- Mobile sticky footer

**Error States (1):**
- Validation errors (desktop)

**Express Checkout (3):**
- Express banner (desktop + mobile)
- Express dismissed (desktop)

**Tablet Viewport (2):**
- Initial state
- Ready to order

---

## Quick Start

### Generate Baselines (First Time)

```bash
# Ensure dev server is running
npm run dev

# Generate all checkout baselines
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts
```

### Run Tests

```bash
# Compare against baselines
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts

# View results
npx playwright show-report test-results/visual-regression-html
```

### Update Baselines

After intentional UI changes:

```bash
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts --update-snapshots
```

---

## Integration with Development Workflow

### Before Committing Checkout Changes

1. **Make UI changes**
2. **Run visual tests:**
   ```bash
   npx playwright test checkout-flow --config=playwright.visual-regression.config.ts
   ```
3. **Review diffs:** If tests fail, check HTML report
4. **Update baselines** if changes are intentional:
   ```bash
   npx playwright test checkout-flow --config=playwright.visual-regression.config.ts --update-snapshots
   ```
5. **Commit both code AND baseline screenshots**

### Pull Request Checklist

- [ ] Visual regression tests pass OR
- [ ] Baseline screenshots updated (with justification)
- [ ] Visual diffs reviewed and approved
- [ ] Screenshots committed to repo

---

## CI/CD Integration

Visual regression tests can be integrated into GitHub Actions:

```yaml
- name: Run visual regression tests
  run: npx playwright test --config=playwright.visual-regression.config.ts

- name: Upload visual test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: visual-regression-results
    path: test-results/
```

---

## Key Features

### Dynamic Content Masking

Prices, totals, and timestamps are automatically masked to prevent false positives:

```typescript
const dynamicContentMasks = [
  '[data-testid="item-price"]',
  '[data-testid="cart-total"]',
  '[data-testid="order-total"]',
  '[data-testid="timestamp"]',
]
```

### Multi-Viewport Testing

- **Desktop:** 1920x1080
- **Tablet:** 768x1024
- **Mobile:** 375x667

### Tolerance Settings

```typescript
maxDiffPixelRatio: 0.02  // 2% pixel difference allowed
threshold: 0.2           // Per-pixel color tolerance
```

---

## Test Data Consistency

Tests use standardized test data from `tests/e2e/critical/constants.ts`:

```typescript
TEST_ADDRESS: {
  fullName: 'Test User',
  street: '123 Test Street',
  city: 'Test City',
  postalCode: '12345',
  country: 'ES',
  phone: '+34 600 123 456',
}
```

---

## Next Steps

### Immediate Actions

1. **Generate baselines** (user will run the tests)
2. **Review screenshots** for quality and coverage
3. **Commit baselines** to version control

### Future Enhancements

- Add admin panel visual regression tests
- Add product detail page variations
- Add cart variations (multiple items, discounts)
- Integrate into CI/CD pipeline
- Add visual regression for error pages

---

## Related Documentation

- [Visual Regression README](../../tests/visual-regression/README.md)
- [Quick Start Guide](../../tests/visual-regression/QUICK-START.md)
- [E2E Testing Guide](../../tests/e2e/README.md)
- [Checkout Page Object](../../tests/e2e/page-objects/CheckoutPage.ts)

---

## Maintenance

### When to Update Baselines

- Design system changes
- Component library updates
- Intentional UI/UX improvements
- Bug fixes that change visual appearance

### Review Process

1. Developer updates baselines locally
2. Commit updated screenshots
3. PR reviewer checks visual diffs
4. Approve if changes are intentional
5. Merge PR with updated baselines

---

**Questions?** See [tests/visual-regression/README.md](../../tests/visual-regression/README.md) for comprehensive documentation.
