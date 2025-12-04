# E2E Tests: Express Checkout Auto-Skip

## Overview

Comprehensive end-to-end test suite for the Express Checkout auto-skip feature, covering all user scenarios, edge cases, and multi-language support.

## Test Structure

```
tests/e2e/
├── express-checkout-auto-skip.spec.ts    # Main test suite
├── page-objects/                         # Page Object Models
│   ├── CheckoutPage.ts                   # Checkout page interactions
│   └── AuthPage.ts                       # Authentication interactions
├── helpers/                              # Test utilities
│   ├── CartHelper.ts                     # Cart operations
│   ├── WaitHelper.ts                     # Timing utilities
│   └── LocaleHelper.ts                   # i18n utilities
├── fixtures/                             # Test data
│   └── express-checkout-fixtures.ts      # User personas & test data
├── setup/                                # Setup scripts
│   └── express-checkout.setup.ts         # Test environment setup
└── express-checkout-README.md            # This file
```

## Test Scenarios

### 1. Auto-Skip Flow (Returning User)
Tests for users with saved address AND preferred shipping method.

- **Auto-navigation**: Countdown timer triggers automatic navigation to payment
- **Countdown UI**: Timer, progress bar, and animations work correctly
- **Cancel functionality**: User can stop countdown
- **Data pre-population**: Checkout store is updated with saved data
- **Performance**: Navigation timing is accurate

### 2. Manual Express (User Without Shipping Method)
Tests for users with saved address but NO order history.

- **Banner display**: Shows without countdown
- **Manual activation**: Button pre-fills form but stays on shipping page
- **Toast feedback**: Shows info message about selecting shipping method
- **Form editing**: User can modify pre-filled data

### 3. Guest Checkout (No Express Features)
Tests for non-authenticated users.

- **No banner**: Express checkout not shown
- **Guest flow**: Normal checkout process
- **No auto-skip**: Express query param ignored

### 4. Multi-Language Support
Tests for all 4 locales: ES, EN, RO, RU.

- **Countdown messages**: Translated correctly
- **Banner text**: All UI elements in correct language
- **Toast messages**: Feedback in user's locale

### 5. Edge Cases
Critical error handling and boundary conditions.

- **Navigation during countdown**: Cleanup and cancellation
- **Multiple triggers**: Prevent stacking countdowns
- **Back button**: Proper history handling
- **Session expiry**: Graceful degradation
- **Missing data**: Handles incomplete user profiles
- **API errors**: Error recovery
- **Concurrent navigation**: Race condition handling

### 6. Accessibility & UX
User experience and accessibility compliance.

- **ARIA labels**: Proper semantic markup
- **Keyboard navigation**: Full keyboard support
- **Loading states**: Visual feedback during operations
- **Address formatting**: Readable display

### 7. Performance
Timing and performance validation.

- **Countdown accuracy**: Within specified tolerance
- **UI smoothness**: No layout shifts or jank
- **Update frequency**: Smooth countdown progression

## Running Tests

### All Express Checkout Tests
```bash
npm run test -- tests/e2e/express-checkout-auto-skip.spec.ts
```

### Specific Browser
```bash
npm run test -- --project=chromium tests/e2e/express-checkout-auto-skip.spec.ts
```

### Specific Locale
```bash
npm run test -- --project=chromium-es tests/e2e/express-checkout-auto-skip.spec.ts
```

### Debug Mode
```bash
npm run test:debug tests/e2e/express-checkout-auto-skip.spec.ts
```

### Headed Mode (Watch Tests)
```bash
npm run test:headed tests/e2e/express-checkout-auto-skip.spec.ts
```

### UI Mode (Interactive)
```bash
npm run test:ui
```

## Test Data

### User Personas

1. **Returning User with Preferences**
   - Email: `returning.user@test.com`
   - Has saved address: ✅
   - Has preferred shipping: ✅
   - Should auto-skip: ✅

2. **User with Address Only**
   - Email: `new.user@test.com`
   - Has saved address: ✅
   - Has preferred shipping: ❌
   - Should auto-skip: ❌

3. **User Without Data**
   - Email: `empty.user@test.com`
   - Has saved address: ❌
   - Has preferred shipping: ❌
   - Should auto-skip: ❌

4. **Guest User**
   - Not authenticated
   - No express features

### Environment Variables

Set these in `.env.test` or CI environment:

```bash
# Base URL
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000

# Test users (optional, uses defaults if not set)
TEST_USER_WITH_PREFERENCES=returning.user@test.com
TEST_USER_ADDRESS_ONLY=new.user@test.com
TEST_USER_NO_DATA=empty.user@test.com
TEST_USER_PASSWORD=TestPassword123!

# Test configuration
TEST_COUNTDOWN_DURATION=5000
TEST_COUNTDOWN_TOLERANCE=500
```

## Page Object Models

### CheckoutPage
Encapsulates all checkout page interactions.

**Key Methods:**
- `navigateWithExpress()` - Navigate with express query param
- `getCountdownValue()` - Get current countdown number
- `getProgressBarWidth()` - Get progress bar percentage
- `fillShippingAddress()` - Fill address form
- `verifyAddressDisplay()` - Assert address shown correctly

### AuthPage
Handles authentication flows.

**Key Methods:**
- `signIn(email, password)` - Sign in user
- `signOut()` - Sign out current user
- `isSignedIn()` - Check auth status

## Helpers

### CartHelper
Cart management utilities.

- `addProductToCart()` - Add product to cart
- `clearCart()` - Remove all items
- `getCartCount()` - Get number of items

### WaitHelper
Custom wait utilities for timing-sensitive operations.

- `waitForCountdown(duration)` - Wait for countdown timer
- `pollFor(condition)` - Poll until condition true
- `waitWithBackoff(condition)` - Exponential backoff wait

### LocaleHelper
Internationalization testing utilities.

- `setLocale(locale)` - Set page locale
- `getExpressCheckoutTranslations()` - Get translated strings
- `switchLocale(newLocale)` - Change language

## Fixtures

### ExpressCheckoutFixtures
Test data factory for user personas and scenarios.

**Key Methods:**
- `returningUserWithPreferences()` - Complete user data
- `userWithAddressOnly()` - User without shipping pref
- `userWithoutAddress()` - Empty user profile
- `createScenario(type)` - Complete test scenario
- `generateRandomUser()` - Random test user

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Express Checkout Tests
  run: npm run test -- tests/e2e/express-checkout-auto-skip.spec.ts
  env:
    PLAYWRIGHT_TEST_BASE_URL: ${{ secrets.STAGING_URL }}
    TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: express-checkout-test-results
    path: test-results/
```

## Debugging Tips

### View Test in Browser
```bash
npm run test:headed tests/e2e/express-checkout-auto-skip.spec.ts
```

### Slow Down Tests
Add to test:
```typescript
test.use({ launchOptions: { slowMo: 1000 } })
```

### Take Screenshots
Tests automatically capture screenshots on failure. For manual screenshots:
```typescript
await page.screenshot({ path: 'debug.png', fullPage: true })
```

### Inspect Element
```typescript
await page.pause() // Opens Playwright Inspector
```

### Console Logs
```typescript
page.on('console', msg => console.log('PAGE LOG:', msg.text()))
```

## Known Issues & Limitations

1. **Timing Sensitivity**: Countdown tests may be flaky on slow CI runners. Adjust `TEST_COUNTDOWN_TOLERANCE` if needed.

2. **Database State**: Tests assume certain users exist. Run setup script before first execution.

3. **Locale Switching**: Some locale tests may fail if i18n files are incomplete.

4. **API Mocking**: Some tests mock API responses. Ensure mocks match actual API contract.

## Contributing

When adding new tests:

1. Follow existing patterns (Page Objects, Helpers, Fixtures)
2. Add descriptive test names
3. Group related tests in `describe` blocks
4. Use appropriate helpers for waits and assertions
5. Test across all 4 locales when UI text is involved
6. Add edge cases to Edge Cases section
7. Update this README if adding new scenarios

## Architecture Review

### Compliance with System Architecture

This test suite follows architectural best practices:

1. **Separation of Concerns**: Page Objects separate interaction logic from test logic
2. **DRY Principle**: Helpers and fixtures eliminate code duplication
3. **Single Responsibility**: Each class has one clear purpose
4. **Testability**: Modular design enables isolated testing
5. **Maintainability**: Clear structure makes updates easy
6. **Scalability**: Pattern supports adding new test scenarios

### Dependencies

- **Playwright**: E2E testing framework
- **TypeScript**: Type safety for test code
- **Test fixtures**: Isolated test data
- **Page Object Models**: Reusable page interactions

### Integration Points

Tests integrate with:
- Nuxt application routes
- Supabase authentication
- Checkout store (Pinia)
- i18n translation system
- API endpoints

## License

Part of Moldova Direct e-commerce platform.
