# Visual Regression Tests - Quick Start Guide

## Prerequisites

1. **Start dev server:**
   ```bash
   npm run dev
   ```
   Must be running on `http://localhost:3000`

2. **Optional (for express checkout tests):**
   ```bash
   # Add to .env.test
   TEST_USER_EMAIL=teste2e@example.com
   TEST_USER_PASSWORD=your-password
   ```

---

## Common Commands

### Generate Baselines (First Time)

```bash
# All checkout screenshots (28 total)
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts

# Only guest checkout flow (faster)
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts -g "Guest Checkout Flow"

# Only multi-locale coverage
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts -g "Multi-Locale"
```

### Run Tests (Compare Against Baselines)

```bash
# All checkout visual tests
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts

# Specific test
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts -g "ready to place order"
```

### Update Baselines (After Intentional UI Changes)

```bash
# Update all baselines
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts --update-snapshots

# Update specific category
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts --update-snapshots -g "Guest Checkout"
```

### View Results

```bash
# Open HTML report with visual diffs
npx playwright show-report test-results/visual-regression-html
```

---

## Screenshot Coverage (28 Total)

### Empty State (4)
- Desktop empty redirect
- Desktop empty state
- Mobile empty redirect
- Mobile empty state

### Guest Checkout Flow (9)
- Guest prompt - desktop
- Initial state - desktop
- Initial state - mobile
- Address filled - desktop
- Shipping methods - desktop
- Shipping selected - desktop
- Payment selected - desktop
- Ready to order - desktop
- Ready to order - mobile

### Multi-Locale (4)
- Spanish (es) - desktop
- English (en) - desktop
- Romanian (ro) - desktop
- Russian (ru) - desktop

### Components (4)
- Order summary sidebar
- Address form empty
- Address form filled
- Mobile sticky footer

### Error States (1)
- Validation errors - desktop

### Express Checkout (3)
- Express banner - desktop
- Express dismissed - desktop
- Express banner - mobile

### Tablet Viewport (2)
- Initial state - tablet
- Ready to order - tablet

---

## Test Categories

Run specific test categories:

```bash
# Empty state tests only
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts -g "Empty State"

# Guest checkout only
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts -g "Guest Checkout Flow"

# Multi-locale only
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts -g "Multi-Locale"

# Component screenshots only
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts -g "Component Screenshots"

# Error states only
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts -g "Error States"

# Express checkout only (requires auth)
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts -g "Express Checkout"

# Tablet viewport only
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts -g "Tablet Viewport"
```

---

## Debugging Failed Tests

### 1. View Visual Diff
```bash
npx playwright show-report test-results/visual-regression-html
```
The report shows side-by-side comparison of expected vs actual.

### 2. Run in Debug Mode
```bash
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts --debug -g "specific test name"
```

### 3. Run in UI Mode
```bash
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts --ui
```

### 4. Check Screenshot Diff Manually
Failed screenshots are saved in:
- Expected: `tests/visual-regression/screenshots/`
- Actual: `test-results/visual-regression/`
- Diff: `test-results/visual-regression/`

---

## Common Issues

### All Tests Fail on First Run
**Solution:** This is expected! Run with `--update-snapshots` to generate baselines.

### Tests Timeout
**Solution:**
1. Check dev server is running: `curl http://localhost:3000`
2. Check Supabase connection
3. Increase timeout in playwright config

### Screenshots Don't Match After Git Pull
**Solution:**
1. Teammate may have updated baselines
2. Pull latest screenshots: `git pull`
3. If still failing, regenerate: `--update-snapshots`

### Express Checkout Tests Skip
**Solution:** Set `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` in `.env.test`

### Flaky Tests (Sometimes Pass, Sometimes Fail)
**Solution:**
1. Check for dynamic content not masked
2. Increase wait times in test
3. Disable animations in app during tests

---

## Quick Tips

- **Faster runs:** Use `-g` to run specific test groups
- **Parallel execution:** Not recommended for visual tests (can cause inconsistent screenshots)
- **Update baselines carefully:** Always review diffs before updating
- **Mask dynamic content:** Prices, timestamps, etc. should be masked
- **Consistent environment:** Run on same OS/browser as CI for best results

---

## File Locations

- **Test file:** `tests/visual-regression/checkout-flow.spec.ts`
- **Config:** `playwright.visual-regression.config.ts`
- **Baselines:** `tests/visual-regression/screenshots/`
- **Results:** `test-results/visual-regression/`
- **HTML Report:** `test-results/visual-regression-html/`
- **Full docs:** `tests/visual-regression/README.md`
