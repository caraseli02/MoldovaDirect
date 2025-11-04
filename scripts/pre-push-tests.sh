#!/bin/bash

# Pre-push hook to run smart tests before pushing
# Runs unit tests and relevant e2e tests based on changed files

set -e

echo "🚀 Running pre-push checks..."
echo ""

# Get the current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $BRANCH"
echo ""

# Get changed files compared to main/master
MAIN_BRANCH="main"
if ! git rev-parse --verify $MAIN_BRANCH >/dev/null 2>&1; then
  MAIN_BRANCH="master"
fi

# Get list of changed files
CHANGED_FILES=$(git diff --name-only $MAIN_BRANCH...HEAD 2>/dev/null || git diff --name-only --cached)

echo "📝 Changed files:"
echo "$CHANGED_FILES" | sed 's/^/   - /'
echo ""

# Determine which e2e tests to run based on changed files
E2E_TESTS=()

# Check for auth-related changes
if echo "$CHANGED_FILES" | grep -qE "(auth|login|register|password|mfa|security|stores/auth)"; then
  E2E_TESTS+=("tests/e2e/auth.spec.ts")
fi

# Check for product-related changes
if echo "$CHANGED_FILES" | grep -qE "(products|categories|search|stores/products|pages/products)"; then
  E2E_TESTS+=("tests/e2e/products.spec.ts")
fi

# Check for checkout/cart-related changes
if echo "$CHANGED_FILES" | grep -qE "(checkout|cart|payment|stripe|shipping|stores/cart|stores/checkout|composables/useStripe|composables/useShipping|composables/useGuest)"; then
  E2E_TESTS+=("tests/e2e/checkout.spec.ts")
fi

# Check for i18n-related changes
if echo "$CHANGED_FILES" | grep -qE "(i18n|locales|translations)"; then
  E2E_TESTS+=("tests/e2e/i18n.spec.ts")
fi

# Visual tests are skipped in pre-push checks
# They can be run manually with: pnpm run test:visual-review
# Or: pnpm run test:visual

# Run unit tests with coverage
echo "🧪 Running unit tests with coverage..."
if ! pnpm run test:coverage:check; then
  echo ""
  echo "❌ Unit tests or coverage check failed!"
  echo ""
  echo "💡 Options:"
  echo "   - Fix the failing tests or improve coverage"
  echo "   - Use 'git push --no-verify' to skip checks (not recommended)"
  echo "   - View coverage report: open coverage/index.html"
  exit 1
fi

echo ""
echo "✅ Unit tests passed!"
echo ""

# Run relevant e2e tests if any were detected
if [ ${#E2E_TESTS[@]} -gt 0 ]; then
  echo "🎭 Related e2e tests detected:"
  for test in "${E2E_TESTS[@]}"; do
    echo "   - $test"
  done
  echo ""
  echo "⚠️  E2E tests require a dev server to be running."
  echo "💡 Options:"
  echo "   1. Skip e2e tests now and run manually later:"
  echo "      - Continue push (tests will run in CI/CD)"
  echo "   2. Run e2e tests manually after push:"
  echo "      - npm run dev (in one terminal)"
  echo "      - npm test (in another terminal)"
  echo ""
  echo "ℹ️  Skipping e2e tests for faster push..."
  echo "   CI/CD will run full e2e test suite automatically"
else
  echo "ℹ️  No related e2e tests detected for changed files"
fi

echo ""
echo "✅ All pre-push checks passed!"
echo ""
