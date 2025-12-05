#!/bin/bash

# Pre-commit hook to run quick unit tests on changed files
# This ensures basic test coverage before commits

set -e

echo "🔍 Running pre-commit checks..."
echo ""

# Check for misplaced .md files in root
./scripts/check-md-files.sh

echo ""

# Check if there are any staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|vue|js)$' || true)

if [ -z "$STAGED_FILES" ]; then
  echo "ℹ️  No TypeScript/Vue files staged for commit, skipping tests..."
  exit 0
fi

echo "📝 Changed files:"
echo "$STAGED_FILES"
echo ""

# Run quick unit tests on changed files
echo "🧪 Running unit tests..."
if pnpm run test:quick; then
  echo "✅ Unit tests passed!"
else
  echo "❌ Unit tests failed!"
  echo ""
  echo "💡 Tip: Fix the failing tests or use 'git commit --no-verify' to skip checks"
  exit 1
fi

echo ""

# Run fast smoke tests (< 30 seconds)
echo "🚀 Running pre-commit smoke tests..."
echo ""
echo "⚠️  Note: These tests require:"
echo "   - Dev server running on port 3000"
echo "   - If server is not running, tests will start it automatically"
echo ""

if pnpm run test:pre-commit; then
  echo "✅ Pre-commit smoke tests passed!"
else
  echo "❌ Pre-commit smoke tests failed!"
  echo ""
  echo "💡 Tip: Fix the failing tests or use 'git commit --no-verify' to skip checks"
  exit 1
fi

echo ""

# Run E2E checkout tests if enabled (opt-in via environment variable)
if [ "$RUN_E2E_CHECKOUT_TESTS" = "true" ]; then
  echo "🎭 Running E2E checkout smart pre-population tests..."
  echo ""
  echo "⚠️  Note: These tests require:"
  echo "   - Dev server running on port 3000"
  echo "   - Test user credentials in .env"
  echo "   - Supabase database with migrations applied"
  echo ""

  if pnpm run test:checkout:smart-prepopulation; then
    echo "✅ E2E checkout tests passed!"
  else
    echo "❌ E2E checkout tests failed!"
    echo ""
    echo "💡 Fix the failing tests or disable E2E tests: unset RUN_E2E_CHECKOUT_TESTS"
    exit 1
  fi
else
  echo "ℹ️  E2E checkout tests skipped (set RUN_E2E_CHECKOUT_TESTS=true to enable)"
fi

echo ""
echo "✅ Pre-commit tests passed!"
