# Testing Documentation

This directory contains testing strategies, guides, and test documentation.

## Test Strategy

- [TESTING_STRATEGY.md](../guides/TESTING_STRATEGY.md) - Overall testing approach and coverage
- [TEST_COVERAGE_ANALYSIS.md](/TEST_COVERAGE_ANALYSIS.md) - Test coverage analysis (Oct 2025)
- [TEST_COVERAGE_IMPLEMENTATION.md](/TEST_COVERAGE_IMPLEMENTATION.md) - Visual test implementation

## Test Guides by Feature

### Authentication Testing
- [AUTH_TESTING_GUIDE.md](/tests/AUTH_TESTING_GUIDE.md) - Authentication E2E test guide
- **Coverage:** Login, register, password reset, MFA, i18n (2,100+ lines of tests)

### Cart & Checkout Testing
- [E2E_CART_TESTS.md](./E2E_CART_TESTS.md) - Cart E2E test documentation

### Admin Testing
- [ADMIN_TESTING.md](../guides/ADMIN_TESTING.md) - Admin testing dashboard guide
- [TEST_USER_SIMULATION.md](../guides/TEST_USER_SIMULATION.md) - Test user personas

## Test Types

### E2E Tests (Playwright)
- **Location:** `/tests/e2e/`
- **Coverage:** Authentication, cart, checkout, visual regression
- **Run:** `npm run test:e2e`

### Unit Tests
- **Location:** `/tests/unit/`
- **Coverage:** Utilities, composables, stores
- **Run:** `npm run test:unit`

### Visual Regression Tests
- **Location:** `/tests/e2e/visual-regression.spec.ts`
- **Coverage:** 40 pages (85% of site)
- **Run:** `npm run test:visual`

## Quick Reference

**Running Tests:**
```bash
# All tests
npm run test

# E2E tests only
npm run test:e2e

# Unit tests only
npm run test:unit

# Visual regression
npm run test:visual

# Specific auth tests
npm run test:auth
```

**Test Data Setup:**
```bash
# Create E2E test user
node scripts/create-e2e-test-user.mjs
```

## Related Documentation

- [Test Scripts](/scripts/README.md)
- [Authentication Architecture](/docs/architecture/AUTHENTICATION_ARCHITECTURE.md)
- [Cart System Architecture](/docs/architecture/CART_SYSTEM_ARCHITECTURE.md)

---

**Last Updated:** November 16, 2025
