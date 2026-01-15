# Lesson 3: Testing and Action Plan


## Introduction

Welcome to lesson three, the final lesson in the Moldova Direct codebase review. In this lesson, we'll cover testing infrastructure, coverage gaps, and create a concrete action plan you can follow.

---

## Part 1: Current Testing State

Let's start with an honest assessment of your testing situation.

You have ninety-seven test files using Vitest for unit tests and Playwright for end-to-end tests. The test infrastructure is well-organized with separate directories for unit, integration, and E2E tests.

However, the actual coverage tells a different story. Statement coverage is only six point six four percent. That means ninety-three percent of your code has no test coverage.

---

## Part 2: The CI/CD Problem

Here's a critical finding. Your E2E tests are not running in your GitHub Actions CI/CD pipeline. This means code can be merged without passing E2E tests.

This happened because the database configuration is missing in the CI environment. The tests are there, they're just not executing.

Fixing this should be your top testing priority. When tests don't run automatically, they become stale. Developers stop trusting them.

---

## Part 3: Coverage by Area

Let's break down coverage by area.

### What's Well Tested

Your cart functionality has excellent coverage. The cart store modules, analytics, persistence, and security all have comprehensive unit tests. This is your gold standard.

### What's Poorly Tested

API routes have zero integration tests. You have one hundred twelve server API endpoints. None of them have integration tests. Your payment processing, checkout flow, and order management are completely untested at the API level.

Components have only three percent coverage. Out of two hundred sixty-one Vue components, only eight have unit tests. The entire admin panel, about fifty components, has no tests.

### Why This Matters

Your checkout flow handles money. Your admin panel manages products and orders. These are critical paths without safety nets.

---

## Part 4: Test Infrastructure Positives

Despite low coverage, your test infrastructure is solid.

Vitest is properly configured with path aliases and coverage reporting. Playwright is configured for multiple browsers and locales. You have a tests slash fixtures directory with test data.

You also have visual regression testing set up in the dot visual testing directory. And pre-commit hooks run fast smoke tests.

The foundation is there. You just need more tests.

---

## Part 5: Missing Test IDs

Only fifteen out of two hundred sixty-one components have data-testid attributes. Test IDs make E2E testing reliable because they don't break when CSS classes change.

Add data-testid attributes to interactive elements: buttons, inputs, links, and key content areas. Start with your most critical flows: checkout, cart, and authentication.

---

## Part 6: Recommended Testing Tools

Consider adding these tools to improve your testing.

Supertest is excellent for API route testing. It lets you make HTTP requests to your server and assert on responses.

Faker-js generates realistic test data. Instead of hardcoding test values, generate varied data to catch edge cases.

Test containers can spin up real Postgres databases for integration tests. This is more reliable than mocking.

---

## Part 7: Priority Tests to Add

Let's identify the most valuable tests to add.

### Critical Priority

First, checkout API tests. Test the entire checkout flow: cart to payment to order creation. Test error cases: invalid cards, insufficient inventory, failed payments.

Second, authentication API tests. Test login, logout, password reset, and session management. Test rate limiting and lockout behavior.

Third, cart component tests. Test add to cart, update quantity, remove item, and cart persistence across page refreshes.

### High Priority

Admin product management tests. Test create, update, delete product flows. Test image upload handling.

Order management tests. Test order creation, status updates, and fulfillment workflows.

Payment webhook tests. Test Stripe webhook handling for successful and failed payments.

---

## Part 8: Testing Effort Estimate

How long will it take to reach adequate coverage?

Enabling CI/CD tests: two days. This is configuration work.

API integration tests for critical paths: five days. Focus on checkout and auth.

Component tests for top twenty components: eight days. One component per half day.

Test data factories: three days. Create reusable test data generators.

Admin API tests: five days. Cover product and order management.

Total estimate: about thirty-six days of focused work. That's seven to eight weeks for one engineer, or three to four weeks with two engineers.

---

## Part 9: Coverage Goals

Set realistic, incremental goals.

### Thirty Day Goals

Increase overall coverage to fifteen percent. Achieve sixty percent API route coverage for critical paths. Enable CI/CD tests to run on every pull request.

### Ninety Day Goals

Reach fifty percent overall coverage. Achieve eighty percent API coverage. Have the top fifty components tested.

### Six Month Goals

Reach eighty percent overall coverage. Have comprehensive E2E tests for all user flows. Implement mutation testing to verify test quality.

---

## Part 10: The Complete Action Plan

Now let's create your complete action plan combining all three lessons.

### Today's Tasks

Run the security fix command: pnpm update markdownlint-cli at zero point four seven point zero.

Create dot env dot example file with all required environment variables.

### This Week's Tasks

Fix the CI/CD pipeline to run E2E tests. Fix the performed by null issue in admin audit logs. Update safe dependencies: nuxt, vue, zod, tailwindcss, and playwright.

### Week Two Tasks

Add API integration tests for checkout flow. Add API integration tests for authentication. Extract profile page into sub-components.

### Week Three Tasks

Add component tests for cart components. Extract HybridCheckout into separate components. Create centralized validation schemas.

### Week Four Tasks

Add component tests for checkout components. Replace console logs with proper logging. Update one major dependency with thorough testing.

### Month Two

Split remaining large files. Reach fifteen percent test coverage. Update remaining major dependencies.

### Month Three

Reach fifty percent test coverage. Complete validation schema migration. Complete TODO comment cleanup.

---

## Part 11: Quick Wins Summary

Here are tasks that take less than a day but provide high value.

Security fix: one hour. Just run the update command.

Create dot env dot example: one hour. Document your environment variables.

Enable CI tests: two hours. Fix the database configuration.

Add test IDs to critical components: four hours. Makes E2E tests reliable.

Fix audit log performed by: four hours. Important for compliance.

Extract magic numbers: two hours. Improves code readability.

---

## Part 12: Metrics to Track

Track these metrics to measure progress.

Security vulnerabilities: should be zero after the fix.

Outdated dependencies: start at thirty-five, target under ten.

Test coverage percentage: start at six point six four percent, target eighty percent.

Files over five hundred lines: start at twenty-five, target under twelve.

CI/CD test pass rate: should be one hundred percent on main branch.

---

## Part 13: Avoiding Future Debt

To prevent accumulating more technical debt, establish these practices.

Require tests for new features. No pull request merges without test coverage for new code.

Set file size limits. Flag files over three hundred lines in code review.

Regular dependency updates. Schedule monthly dependency review.

Address TODOs promptly. Either fix them, create issues, or delete them.

---

## Conclusion

That's the end of lesson three and the complete codebase review series.

Your Moldova Direct project has a solid foundation. The architecture is good. The tooling is modern. You have the infrastructure for quality.

The main issues are: one security vulnerability to fix today, technical debt in large files to address over the coming weeks, and test coverage to build over the coming months.

Follow the action plan. Track your metrics. Celebrate progress.

The key insight is this: you don't need to fix everything at once. Consistent, incremental improvement beats heroic rewrites. Every week, make the codebase a little better than you found it.

Good luck with your refactoring journey. You've got this.
