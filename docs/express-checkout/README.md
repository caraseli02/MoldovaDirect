# E2E Tests - Checkout Smart Pre-population

This directory contains end-to-end tests for validating the checkout smart pre-population feature.

## Test Files

### `checkout-smart-prepopulation.spec.ts`

Comprehensive E2E test suite covering all phases of the checkout smart pre-population feature:

- **Phase 1**: Database migrations validation
- **Phase 2**: Guest checkout baseline
- **Phase 3**: First-time authenticated checkout with address saving
- **Phase 4**: Express Checkout Banner visibility for returning users
- **Phase 5**: Middleware prefetch error monitoring
- **Phase 6**: API endpoint validation
- **Phase 7**: Composable integration testing
- **Phase 8**: Console error monitoring

## Prerequisites

### 1. Environment Variables

Create a `.env.test` file (or add to your existing `.env`) with test user credentials:

```bash
# Test environment
BASE_URL=http://localhost:3000

# Test user credentials
# IMPORTANT: Use a dedicated test user account, not production data
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
```

### 2. Database Setup

Ensure Supabase migrations are applied:

```bash
# Check Supabase connection
npx supabase status

# If migrations not applied, run:
npx supabase db push
```

The tests require these tables:
- `user_addresses` - Stores shipping addresses
- `user_checkout_preferences` - Stores checkout preferences

### 3. Test User Setup

**Option A: Manual Setup**
1. Create a test user account via the app's signup flow
2. Complete at least one checkout to save address data
3. Use those credentials in `.env.test`

**Option B: Seed Script** (TODO - future improvement)
```bash
# Not yet implemented
npm run seed:test-users
```

### 4. Dev Server

Tests require the dev server to be running:

```bash
npm run dev
# Server should be available at http://localhost:3000
```

## Running Tests

### Manual Execution

```bash
# Run all checkout smart pre-population tests
npm run test:checkout:smart-prepopulation

# Run with UI (interactive mode)
PLAYWRIGHT_TEST=true playwright test tests/e2e/checkout-smart-prepopulation.spec.ts --ui

# Run in headed mode (see browser)
PLAYWRIGHT_TEST=true playwright test tests/e2e/checkout-smart-prepopulation.spec.ts --headed

# Run specific test
PLAYWRIGHT_TEST=true playwright test tests/e2e/checkout-smart-prepopulation.spec.ts -g "Express Checkout Banner"

# Debug mode
PLAYWRIGHT_TEST=true playwright test tests/e2e/checkout-smart-prepopulation.spec.ts --debug
```

### Pre-commit Integration

The tests are **disabled by default** in pre-commit hooks to avoid blocking fast commits.

**To enable E2E tests in pre-commit:**

```bash
# Set environment variable before committing
export RUN_E2E_CHECKOUT_TESTS=true
git commit -m "feat: add new feature"

# Or inline:
RUN_E2E_CHECKOUT_TESTS=true git commit -m "feat: add new feature"
```

**To enable permanently:**

Add to your shell profile (`~/.zshrc`, `~/.bashrc`, etc.):

```bash
export RUN_E2E_CHECKOUT_TESTS=true
```

**To disable again:**

```bash
unset RUN_E2E_CHECKOUT_TESTS
# or
export RUN_E2E_CHECKOUT_TESTS=false
```

## Test Output

### Screenshots

Tests automatically capture screenshots at key steps:

```
test-screenshots/e2e/
├── 01-guest-checkout.png
├── 02-first-checkout-form-filled.png
├── 03-express-checkout-banner-visible.png
├── 03-no-banner-no-saved-data.png
├── 04-checkout-loaded-no-errors.png
└── 05-composable-integration-working.png
```

### Test Reports

After running tests, view the HTML report:

```bash
npm run test:report
```

## Troubleshooting

### "Network error: ECONNREFUSED"

**Cause**: Dev server not running

**Fix**:
```bash
npm run dev
# Wait for server to start on port 3000
```

### "Element not found" or timeout errors

**Cause**: App might be in different locale or UI changes

**Fix**: Check locators support all 4 locales (es, en, ro, ru):
```typescript
// Good - supports multiple locales
await page.locator('text=/Pago Express|Express Checkout/i')

// Bad - only works in Spanish
await page.locator('text=Pago Express')
```

### "User has no saved addresses"

**Cause**: Test user hasn't completed checkout before

**Fix**: Run Phase 3 test first to save address data, or manually complete one checkout with the test user account

### "Database table does not exist"

**Cause**: Migrations not applied

**Fix**:
```bash
# Apply migrations
npx supabase db push

# Verify tables exist
npx supabase db diff
```

### Tests pass locally but fail in CI

**Cause**: Missing environment variables or database state

**Fix**: Ensure CI environment has:
1. `.env.test` with test credentials
2. Supabase connection configured
3. Database migrations applied
4. Test user account seeded

## Best Practices

1. **Use dedicated test account** - Don't use production user data
2. **Keep tests idempotent** - Tests should work regardless of initial state
3. **Clean up test data** - Consider adding cleanup hooks (future improvement)
4. **Multi-locale support** - Always use regex patterns that match all locales
5. **Screenshot evidence** - Capture screenshots at critical steps for debugging
6. **Error monitoring** - Track both console errors and network errors

## Maintenance

### Updating Tests

When checkout flow changes:

1. Update relevant test phases
2. Update screenshot expectations
3. Run tests to verify changes:
   ```bash
   npm run test:checkout:smart-prepopulation
   ```
4. Update this README if test setup changes

### Adding New Tests

Follow the existing pattern:

```typescript
test('Phase N: Description of what is being tested', async ({ page }) => {
  // 1. Setup (navigate, authenticate, etc.)

  // 2. Action (perform user action)

  // 3. Assertion (verify expected outcome)
  await expect(page.locator('...')).toBeVisible()

  // 4. Screenshot (capture evidence)
  await page.screenshot({ path: 'test-screenshots/e2e/NN-description.png' })
})
```

## Future Improvements

- [ ] Automated test user seeding script
- [ ] Test data cleanup after each run
- [ ] Parallel test execution configuration
- [ ] Visual regression testing integration
- [ ] Performance metrics collection
- [ ] API mocking for faster tests
- [ ] Cross-browser testing in CI
- [ ] Mobile viewport testing

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review test output and screenshots
3. Check console for error messages
4. Verify all prerequisites are met
5. Create issue with test logs attached
