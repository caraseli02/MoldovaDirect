# Testing Documentation

This directory contains authoritative testing guides and strategies for the Moldova Direct project.

## Authoritative Guides

### Strategy & Coverage
- [TESTING_AUDIT_AND_STRATEGY.md](./TESTING_AUDIT_AND_STRATEGY.md) - Testing audit and strategy overview
- [PRODUCTION_TESTING_STRATEGY.md](./PRODUCTION_TESTING_STRATEGY.md) - Production testing approach
- [TEST_COVERAGE_ANALYSIS.md](./TEST_COVERAGE_ANALYSIS.md) - Current test coverage analysis
- [TEST_COVERAGE_SUMMARY.md](./TEST_COVERAGE_SUMMARY.md) - Coverage summary report
- [TESTING_REVIEW.md](./TESTING_REVIEW.md) - Testing review and recommendations

### Feature-Specific Testing
- [COMPREHENSIVE_CHECKOUT_REVIEW.md](./COMPREHENSIVE_CHECKOUT_REVIEW.md) - Checkout flow testing guide
- [E2E_CART_TESTS.md](./E2E_CART_TESTS.md) - Cart E2E test documentation
- [ADMIN_PAGES_COMPREHENSIVE_REPORT.md](./ADMIN_PAGES_COMPREHENSIVE_REPORT.md) - Admin pages testing

### Specialized Testing
- [MUTATION_TESTING_FINAL_REPORT.md](./MUTATION_TESTING_FINAL_REPORT.md) - Mutation testing results
- [VISUAL-REGRESSION-SETUP.md](./VISUAL-REGRESSION-SETUP.md) - Visual regression test setup
- [VISUAL-REGRESSION-SUMMARY.md](./VISUAL-REGRESSION-SUMMARY.md) - Visual regression summary

## Test Types

### E2E Tests (Playwright)
- **Location:** `/tests/e2e/`
- **Coverage:** Authentication, cart, checkout, visual regression
- **Run:** `npm run test:e2e`

### Unit Tests (Vitest)
- **Location:** `/tests/unit/`
- **Coverage:** Utilities, composables, stores
- **Run:** `npm run test:unit`

### Visual Regression Tests
- **Location:** `/tests/e2e/visual/`
- **Baselines:** `/.visual-testing/baselines/`
- **Run:** `npm run test:visual:all`

## Quick Reference

```bash
# All tests
npm run test

# E2E tests only
npm run test:e2e

# Unit tests only
npm run test:unit

# Visual regression
npm run test:visual:all

# Specific auth tests
npm run test:auth
```

## Related Documentation

- [Testing Strategy](../guides/TESTING_STRATEGY.md) - Overall testing approach
- [Authentication Testing](/tests/AUTH_TESTING_GUIDE.md) - Auth E2E test guide
- [Admin Testing](../guides/ADMIN_TESTING.md) - Admin testing dashboard
- [Test User Simulation](../guides/TEST_USER_SIMULATION.md) - Test user personas

## Archived Documentation

Historical testing docs, implementation reports, and superseded guides are archived in:
- `docs/archive/testing/` - General archived testing docs
- `docs/archive/testing/mutation/` - Mutation testing historical reports
- `docs/archive/testing/checkout/` - Checkout testing historical docs
- `docs/archive/testing/playwright/` - Playwright best practices archives

---

**Last Updated:** January 2026
