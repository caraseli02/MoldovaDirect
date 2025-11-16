# E2E Cart Functionality Tests

## Overview

Comprehensive end-to-end tests for cart functionality that run automatically on every pull request to prevent regressions.

## Test Coverage

### Core Functionality Tests

1. **Add to Cart from Landing Page**
   - Verifies "Add to Cart" button works on landing page
   - Checks cart badge count increases
   - Verifies button state changes to "In Cart"

2. **Add to Cart from Products Listing**
   - Tests cart functionality on products page
   - Ensures product cards integrate correctly
   - Validates cart updates

3. **Add to Cart from Product Detail**
   - Tests detailed product page cart integration
   - Verifies quantity selection
   - Checks cart persistence

4. **Update Quantity in Cart**
   - Tests quantity increase/decrease
   - Validates input fields
   - Checks cart total updates

5. **Remove Item from Cart**
   - Verifies remove functionality
   - Checks cart count decreases
   - Validates empty cart state

6. **Cart Persistence**
   - Tests cart persists across navigation
   - Verifies localStorage integration
   - Checks session persistence

7. **Cart Badge Count**
   - Validates correct count display
   - Tests multi-item scenarios
   - Verifies real-time updates

8. **Out of Stock Handling**
   - Ensures disabled buttons don't add items
   - Validates stock status display
   - Prevents invalid cart operations

9. **Cart Total Calculation**
   - Verifies subtotal accuracy
   - Checks price formatting
   - Validates currency display

10. **Rapid Click Handling**
    - Tests debouncing/throttling
    - Prevents duplicate additions
    - Ensures graceful degradation

### Critical Smoke Tests

1. **Cart Badge Visibility**
   - Ensures cart icon renders
   - Validates header integration
   - Checks visual elements

2. **Cart Page Loads**
   - No JavaScript errors
   - Pinia initialized
   - All resources load

3. **JavaScript Bundles Load**
   - All `/_nuxt/*.js` files return 200
   - No MIME type errors
   - Client code executes

4. **Pinia Initialization**
   - State management works
   - Store hydration successful
   - Cart store accessible

## Running Tests

### Local Development

```bash
# Run all cart tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run only chromium (faster)
npm run test:e2e:ci
```

### Against Vercel Preview

```bash
# Set preview URL and run tests
PLAYWRIGHT_TEST_BASE_URL=https://your-preview.vercel.app npm run test:e2e
```

### In CI/CD

Tests run automatically on every PR via GitHub Actions.

**Workflow**: `.github/workflows/e2e-cart-tests.yml`

**Triggers**:
- Pull requests to main
- Changes to cart-related files
- Manual workflow dispatch

## Configuration

### Main Config: `playwright.cart.config.ts`

Optimized configuration for cart tests:
- Fast execution (2 workers)
- Chromium only by default
- Retry failed tests 2x in CI
- Screenshots and videos on failure

### Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `PLAYWRIGHT_TEST_BASE_URL` | Target URL to test | `http://localhost:3000` |
| `CI` | Enables CI-specific settings | `false` |
| `FULL_SUITE` | Run mobile tests too | `false` |

## CI/CD Integration

### Workflow Jobs

1. **test-cart-functionality**
   - Waits for Vercel preview deployment
   - Runs full cart test suite
   - Uploads test reports and screenshots
   - Comments on PR with results

2. **test-cart-critical-smoke**
   - Runs critical smoke tests
   - Must pass for deployment
   - Fast feedback (< 5 minutes)

### Workflow Artifacts

- **playwright-cart-test-report**: HTML report
- **test-failure-screenshots**: Screenshots if tests fail

### PR Comments

**On Success**:
```
✅ Cart E2E Tests Passed

All cart functionality tests passed on Vercel preview deployment.

Preview URL: https://...
```

**On Failure**:
```
❌ Cart E2E Tests Failed

The cart functionality tests failed on the Vercel preview deployment.

Preview URL: https://...

Common Issues:
- JavaScript bundles not loading
- Pinia not initialized
...

Artifacts:
- Playwright Report: Available in workflow artifacts
```

## Test Development

### Adding New Tests

1. Edit `tests/e2e/cart-functionality.spec.ts`
2. Follow existing test patterns
3. Use helper functions for common operations
4. Run locally to verify
5. Commit and push

### Helper Functions

```typescript
// Wait for page to be fully loaded
await waitForPageLoad(page)

// Get cart count from badge
const count = await getCartCount(page)

// Clear cart before test
await clearCart(page)
```

### Best Practices

1. **Always clear cart** before each test
2. **Use explicit waits** for async operations
3. **Check visibility** before interacting
4. **Verify state changes** after actions
5. **Handle timeouts** gracefully

## Debugging Failed Tests

### Local Debugging

```bash
# Run with UI mode
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test
npx playwright test --config=playwright.cart.config.ts -g "should add product to cart"
```

### CI Debugging

1. **Download artifacts**:
   - Playwright HTML report
   - Screenshots of failures
   - Test results JSON

2. **Check logs**:
   - GitHub Actions workflow logs
   - Browser console output
   - Network requests

3. **Reproduce locally**:
   ```bash
   PLAYWRIGHT_TEST_BASE_URL=<preview-url> npm run test:e2e
   ```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Tests timeout | Slow page load | Increase timeout, check server |
| Elements not found | Selector changed | Update selectors, add test IDs |
| Flaky tests | Race conditions | Add proper waits, use retry |
| Cart not updating | JavaScript errors | Check bundle loading, console |

## Performance

### Test Execution Times

| Test Type | Local | CI |
|-----------|-------|-----|
| Full Suite | ~2-3 min | ~4-5 min |
| Smoke Tests | ~30s | ~1 min |
| Single Test | ~10-15s | ~20-30s |

### Optimization Tips

1. **Run chromium only** in CI (fastest)
2. **Use `--max-failures=1`** to fail fast
3. **Parallelize tests** (2-4 workers)
4. **Cache dependencies** in CI
5. **Reuse browser context** where possible

## Maintenance

### When to Update Tests

- **Cart UI changes**: Update selectors
- **New cart features**: Add test cases
- **Localization changes**: Update text assertions
- **Performance improvements**: Adjust timeouts

### Regular Checks

- [ ] Tests pass on main branch
- [ ] No flaky tests (< 1% failure rate)
- [ ] Coverage includes new features
- [ ] Execution time < 5 minutes
- [ ] Screenshots/videos helpful for debugging

## Integration with Prevention Strategy

E2E cart tests are **Layer 5** of the prevention strategy:

1. ✅ Local verification (`npm run verify`)
2. ✅ GitHub Actions build check
3. ✅ Configuration guidelines
4. ✅ Post-deployment verification
5. **✅ E2E Cart Tests** ← You are here

These tests ensure:
- Cart functionality works end-to-end
- No regressions in user workflows
- Deployment doesn't break existing features
- Real-world scenarios are tested

## Monitoring and Alerts

### Test Results

Track these metrics:
- Pass rate (target: > 95%)
- Execution time (target: < 5 min)
- Flakiness rate (target: < 1%)
- Coverage (target: 10 tests minimum)

### Alerts

Set up alerts for:
- ❌ Tests failing on main branch
- ❌ Flaky tests (pass/fail inconsistently)
- ⚠️ Slow test execution (> 10 min)
- ⚠️ Low coverage (< 8 tests)

## Future Enhancements

- [ ] Add mobile-specific cart tests
- [ ] Test guest checkout flow
- [ ] Test coupon/discount codes
- [ ] Test saved cart recovery
- [ ] Add performance benchmarks
- [ ] Test offline cart behavior
- [ ] Add visual regression tests

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [CI/CD Integration](https://playwright.dev/docs/ci)
- `docs/DEPLOYMENT_CHECKLIST.md` - Related deployment checks
- `docs/PREVENTION_STRATEGY.md` - Overall prevention approach

---

**Last Updated**: 2025-11-16
**Test Count**: 14 (10 functionality + 4 smoke tests)
**CI Integration**: ✅ Active
**Coverage**: Landing, Products, Product Detail, Cart pages
