# Express Checkout Tests - Quick Reference

## 🚀 Quick Start

```bash
# Run all express checkout tests
npm run test -- tests/e2e/express-checkout-auto-skip.spec.ts

# Run in UI mode (recommended)
npm run test:ui

# Run in debug mode
npm run test:debug tests/e2e/express-checkout-auto-skip.spec.ts
```

## 📁 File Locations

```
tests/e2e/
├── express-checkout-auto-skip.spec.ts        # Main test file
├── page-objects/
│   ├── CheckoutPage.ts                       # Checkout interactions
│   └── AuthPage.ts                           # Auth interactions
├── helpers/
│   ├── CartHelper.ts                         # Cart operations
│   ├── WaitHelper.ts                         # Timing utilities
│   └── LocaleHelper.ts                       # i18n utilities
├── fixtures/
│   └── express-checkout-fixtures.ts          # Test data
└── setup/
    └── express-checkout.setup.ts             # Setup scripts
```

## 🧪 Test Categories

| Category | Count | Run Command |
|----------|-------|-------------|
| Auto-Skip Flow | 5 | `-g "Auto-Skip Flow"` |
| Manual Express | 4 | `-g "Manual Express"` |
| Guest Checkout | 3 | `-g "Guest Checkout"` |
| Multi-Language | 8 | `-g "Multi-Language"` |
| Edge Cases | 9 | `-g "Edge Cases"` |
| Accessibility | 4 | `-g "Accessibility"` |
| Performance | 3 | `-g "Performance"` |

## 🎯 Common Commands

### Run Specific Tests

```bash
# Auto-skip tests only
npm run test -- tests/e2e/express-checkout-auto-skip.spec.ts -g "Auto-Skip"

# Locale tests only
npm run test -- tests/e2e/express-checkout-auto-skip.spec.ts -g "Multi-Language"

# Single browser
npm run test -- --project=chromium tests/e2e/express-checkout-auto-skip.spec.ts

# Single locale
npm run test -- --project=chromium-es tests/e2e/express-checkout-auto-skip.spec.ts
```

### Debug & Development

```bash
# UI mode (interactive)
npm run test:ui

# Headed mode (see browser)
npm run test:headed tests/e2e/express-checkout-auto-skip.spec.ts

# Debug mode (inspector)
npm run test:debug tests/e2e/express-checkout-auto-skip.spec.ts

# Slow motion
npm run test -- --headed --slow-mo=1000
```

### Reports

```bash
# Generate report
npm run test:report

# View HTML report
npx playwright show-report

# View JSON results
cat test-results/results.json | jq
```

## 📝 Test Data

### User Personas

```typescript
// Returning user (auto-skip)
const user1 = ExpressCheckoutFixtures.returningUserWithPreferences()

// New user (manual express)
const user2 = ExpressCheckoutFixtures.userWithAddressOnly()

// Empty profile
const user3 = ExpressCheckoutFixtures.userWithoutAddress()

// Guest
const guest = ExpressCheckoutFixtures.guestUser()
```

### Scenarios

```typescript
// Complete scenario
const scenario = ExpressCheckoutFixtures.createScenario('auto-skip')
// Returns: { user, product, shippingMethod, shouldAutoSkip }
```

## 🔍 Page Object Usage

### CheckoutPage

```typescript
const checkoutPage = new CheckoutPage(page)

// Navigation
await checkoutPage.navigate()
await checkoutPage.navigateWithExpress()

// Countdown
const count = await checkoutPage.getCountdownValue()
const width = await checkoutPage.getProgressBarWidth()

// Forms
await checkoutPage.fillShippingAddress(address)
await checkoutPage.selectShippingMethod(0)

// Verification
await checkoutPage.verifyAddressDisplay(address)
await checkoutPage.waitForExpressBanner()
```

### AuthPage

```typescript
const authPage = new AuthPage(page)

// Sign in
await authPage.signIn('user@test.com', 'password')

// Sign out
await authPage.signOut()

// Check status
const isSignedIn = await authPage.isSignedIn()
```

## 🛠 Helper Usage

### CartHelper

```typescript
const cartHelper = new CartHelper(page)

await cartHelper.addProductToCart()
await cartHelper.clearCart()
await cartHelper.verifyCartHasItems()
const count = await cartHelper.getCartCount()
```

### WaitHelper

```typescript
const waitHelper = new WaitHelper(page)

await waitHelper.waitForCountdown(5000)
await waitHelper.waitForNavigationPattern(/\/payment/)
await waitHelper.pollFor(async () => {
  return await element.isVisible()
})
```

### LocaleHelper

```typescript
const localeHelper = new LocaleHelper(page, 'es')

await localeHelper.setLocale()
const translations = localeHelper.getExpressCheckoutTranslations()
await localeHelper.switchLocale('en')
```

## ⚙️ Configuration

### Environment Variables

```bash
# .env.test
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
TEST_USER_WITH_PREFERENCES=returning.user@test.com
TEST_USER_ADDRESS_ONLY=new.user@test.com
TEST_USER_NO_DATA=empty.user@test.com
TEST_USER_PASSWORD=TestPassword123!
TEST_COUNTDOWN_DURATION=5000
TEST_COUNTDOWN_TOLERANCE=500
```

### Timeouts

```typescript
const TEST_CONFIG = {
  countdownDuration: 5000,      // 5 seconds
  countdownTolerance: 500,      // ±500ms
  navigationTimeout: 10000,     // 10 seconds
  shortTimeout: 2000,           // 2 seconds
}
```

## 🐛 Troubleshooting

### Tests Timing Out

```bash
# Increase timeout
npm run test -- --timeout=60000

# Check if app is running
curl http://localhost:3000

# Run in headed mode to see what's happening
npm run test:headed
```

### Locale Tests Failing

```bash
# Verify translations exist
grep -r "expressCheckout" i18n/locales/

# Check specific locale
cat i18n/locales/es.json | jq '.checkout.expressCheckout'
```

### Flaky Countdown Tests

```typescript
// Add retry logic
await expect(async () => {
  const count = await checkoutPage.getCountdownValue()
  expect(count).toBeLessThan(5)
}).toPass({ timeout: 3000 })

// Increase tolerance
TEST_COUNTDOWN_TOLERANCE=1000 npm run test
```

## 📊 Expected Results

### All Tests Pass

```
✓ express-checkout-auto-skip.spec.ts (36)
  ✓ Auto-Skip Flow (5)
  ✓ Manual Express (4)
  ✓ Guest Checkout (3)
  ✓ Multi-Language (8)
  ✓ Edge Cases (9)
  ✓ Accessibility (4)
  ✓ Performance (3)

36 passed (3.4min)
```

### Per-Locale Results

```
chromium-es: 36 passed
chromium-en: 36 passed
chromium-ro: 36 passed
chromium-ru: 36 passed
```

## 📚 Documentation

- **Main Guide**: `EXPRESS_CHECKOUT_TEST_SUITE.md`
- **Architecture**: `ARCHITECTURE_ANALYSIS.md`
- **README**: `express-checkout-README.md`
- **This File**: `QUICK_REFERENCE.md`

## 💡 Tips

1. **Use UI Mode for Development**
   ```bash
   npm run test:ui
   ```

2. **Run Single Test While Developing**
   ```bash
   npm run test -- -g "should auto-navigate"
   ```

3. **Take Screenshots for Debugging**
   ```typescript
   await page.screenshot({ path: 'debug.png', fullPage: true })
   ```

4. **Pause Test Execution**
   ```typescript
   await page.pause()  // Opens inspector
   ```

5. **Check Console Logs**
   ```typescript
   page.on('console', msg => console.log('PAGE:', msg.text()))
   ```

## 🔗 Links

- Playwright Docs: https://playwright.dev
- Nuxt Testing: https://nuxt.com/docs/getting-started/testing
- Project Docs: `README.md`

## ✅ Checklist Before Running

- [ ] App is running on localhost:3000
- [ ] Test users exist in database
- [ ] Translations are complete
- [ ] Environment variables set
- [ ] Playwright installed (`npx playwright install`)

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| `Cannot find module` | Run `npm install` |
| `Target closed` | Check if app is running |
| `Timeout waiting for element` | Increase timeout or check selectors |
| `Translation not found` | Add missing i18n key |
| `Test user not found` | Seed test database |

## 📞 Support

1. Check documentation
2. Review code comments
3. Check Playwright docs
4. Ask development team

---

**Quick Reference v1.0.0**
**Last Updated:** 2025-11-27
