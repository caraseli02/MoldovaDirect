# Visual Regression Testing

Comprehensive visual regression testing suite for Moldova Direct using Playwright's screenshot comparison capabilities.

## Overview

Visual regression tests capture screenshots of the application and compare them against baseline images to detect unintended UI changes. This helps catch:

- Layout shifts and CSS regressions
- Component rendering issues
- Responsive design breakpoints
- Multi-locale display problems
- Visual inconsistencies across browsers

## Test Structure

### Files

- `playwright.visual-regression.config.ts` - Playwright configuration for visual tests
- `critical-pages.spec.ts` - Homepage, products, cart, and auth pages
- `checkout-flow.spec.ts` - Hybrid Progressive Checkout flow (NEW)
- `screenshots/` - Baseline screenshot storage directory

### Checkout Flow Coverage (30+ screenshots)

The `checkout-flow.spec.ts` file provides comprehensive coverage of the Hybrid Progressive Checkout:

#### 1. Empty State (2 screenshots)
- Desktop empty checkout redirect/state
- Mobile empty checkout redirect/state

#### 2. Guest Checkout Flow (8 screenshots)
- Guest prompt - desktop EN
- Initial state - desktop & mobile
- Address form filled - desktop
- Shipping methods loaded - desktop
- Shipping method selected - desktop
- Payment selected - desktop
- Ready to place order - desktop & mobile

#### 3. Multi-Locale Coverage (4 screenshots)
- Spanish (es) - desktop
- English (en) - desktop
- Romanian (ro) - desktop
- Russian (ru) - desktop

#### 4. Component Screenshots (4 screenshots)
- Order summary sidebar - desktop
- Address form empty - desktop
- Address form filled - desktop
- Mobile sticky footer

#### 5. Error States (1 screenshot)
- Address validation errors - desktop

#### 6. Express Checkout Banner (3 screenshots)
- Express banner for returning users - desktop
- Express banner dismissed - desktop
- Express banner - mobile

#### 7. Tablet Viewport (2 screenshots)
- Initial state - tablet
- Ready to order - tablet

## Usage

### Prerequisites

1. **Development server running:**
   ```bash
   npm run dev
   ```
   Server must be running on `http://localhost:3000`

2. **Environment variables (optional for express checkout tests):**
   ```bash
   # .env.test
   TEST_USER_EMAIL=teste2e@example.com
   TEST_USER_PASSWORD=your-test-password
   ```

### Generate Baseline Screenshots

**First time setup:** Generate all baseline screenshots:

```bash
# All visual regression tests
npx playwright test --config=playwright.visual-regression.config.ts

# Only checkout flow tests (recommended for initial setup)
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts

# Only critical pages tests
npx playwright test critical-pages --config=playwright.visual-regression.config.ts
```

This will create baseline screenshots in `tests/visual-regression/screenshots/`

### Run Visual Regression Tests

**Compare against baselines:**

```bash
# All visual tests
npx playwright test --config=playwright.visual-regression.config.ts

# Only checkout flow
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts

# Specific test
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts -g "guest checkout initial state"
```

### Update Baseline Screenshots

When intentional UI changes are made, update baselines:

```bash
# Update all baselines
npx playwright test --config=playwright.visual-regression.config.ts --update-snapshots

# Update only checkout baselines
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts --update-snapshots

# Update specific test baseline
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts --update-snapshots -g "guest checkout initial state"
```

### View Test Results

After running tests:

```bash
# Open HTML report
npx playwright show-report test-results/visual-regression-html
```

The report shows:
- Which screenshots passed/failed
- Visual diff comparisons for failures
- Screenshot preview for each test

## Configuration

### Screenshot Options

From `checkout-flow.spec.ts`:

```typescript
const screenshotOptions = {
  maxDiffPixelRatio: 0.02, // Allow 2% pixel difference
  threshold: 0.2,          // Per-pixel color threshold
  animations: 'disabled',  // Disable CSS animations
}
```

### Viewports

Tests cover three viewport sizes:

- **Desktop:** 1920x1080
- **Tablet:** 768x1024
- **Mobile:** 375x667

### Dynamic Content Masking

Dynamic content (prices, timestamps, etc.) is masked during comparison:

```typescript
const dynamicContentMasks = [
  '[data-testid="item-price"]',
  '[data-testid="cart-total"]',
  '[data-testid="order-total"]',
  '[data-testid="timestamp"]',
  '.skeleton-loader',
  '.animate-pulse',
]
```

## Best Practices

### 1. Run Tests Before Committing UI Changes

```bash
# Quick check before commit
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts
```

### 2. Review Diffs Carefully

When tests fail:
1. Open the HTML report
2. Review the visual diff
3. Determine if the change is intentional
4. Update baselines if intentional, fix code if not

### 3. Test Data Consistency

- Tests use `TEST_DATA.TEST_ADDRESS` for consistent form data
- Guest email: `guest.test@example.com`
- All tests add same product to cart for consistency

### 4. Conditional Screenshots

Some tests are conditional and skip if requirements aren't met:

```typescript
// Express checkout tests require authentication
if (!CriticalTestHelpers.hasTestUserCredentials()) {
  test.skip()
  return
}
```

### 5. Waiting for Content

Tests wait for content to load before screenshots:

```typescript
await page.waitForLoadState('networkidle')
await page.waitForTimeout(1000) // Additional time for lazy content
```

## Troubleshooting

### Screenshots Don't Match

**Causes:**
- Timing issues (content still loading)
- Dynamic content not masked
- Font rendering differences
- Browser/OS differences

**Solutions:**
1. Increase wait times in test
2. Add dynamic elements to mask list
3. Adjust `maxDiffPixelRatio` threshold
4. Regenerate baselines on your environment

### Tests Timeout

**Causes:**
- Dev server not running
- API endpoints slow/failing
- Network issues

**Solutions:**
1. Verify dev server: `curl http://localhost:3000`
2. Check Supabase connection
3. Increase timeout in config
4. Mock slow API calls

### Missing Screenshots

**Causes:**
- Conditional tests skipped
- Test failures before screenshot
- Required elements not visible

**Solutions:**
1. Check test requirements (auth, data, etc.)
2. Review test output for errors
3. Run with `--debug` flag for details

### Flaky Tests

**Causes:**
- Race conditions
- Inconsistent timing
- External dependencies

**Solutions:**
1. Use `waitForLoadState('networkidle')`
2. Add explicit waits for critical elements
3. Mock external APIs
4. Disable animations in screenshots

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Visual Regression Tests

on: [pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium

      - name: Start dev server
        run: npm run dev &
        env:
          NODE_ENV: test

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Run visual regression tests
        run: npx playwright test --config=playwright.visual-regression.config.ts
        env:
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: visual-regression-results
          path: test-results/
          retention-days: 7
```

## Screenshot Naming Convention

Screenshots follow a consistent naming pattern:

**Format:** `{feature}-{state}-{viewport}-{locale}.png`

**Examples:**
- `checkout-guest-initial-desktop-en.png`
- `checkout-express-banner-mobile-es.png`
- `checkout-ready-to-order-tablet.png`
- `component-address-form-filled.png`

**Component screenshots:** `component-{name}-{viewport}.png`

## Maintenance

### Regular Updates

Update baselines when:
- Design system changes
- Component library updates
- Intentional UI/UX improvements
- New features added

### Cleanup Old Screenshots

Remove unused baselines:

```bash
# List all screenshots
ls -la tests/visual-regression/screenshots/

# Remove specific baseline
rm tests/visual-regression/screenshots/old-feature-*.png
```

### Baseline Review Schedule

Recommended: Review baselines quarterly or after major releases
1. Run all tests
2. Review any failures
3. Update baselines if intentional
4. Document changes in changelog

## Related Documentation

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [E2E Testing Guide](../e2e/README.md)
- [Checkout Page Object](../e2e/page-objects/CheckoutPage.ts)
- [Critical Test Helpers](../e2e/critical/helpers/critical-test-helpers.ts)

## Support

For issues or questions:
1. Check Playwright documentation
2. Review existing baselines in `screenshots/`
3. Examine test output and HTML report
4. Consult team for baseline update approval
