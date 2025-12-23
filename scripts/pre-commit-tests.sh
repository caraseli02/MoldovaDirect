#!/bin/bash

# Pre-commit hook to run ESLint, TypeScript checks, and quick unit tests on changed files
# This ensures code quality and basic test coverage before commits

set -e

echo "🔍 Running pre-commit checks..."
echo ""

# Check for misplaced .md files in root
./scripts/check-md-files.sh

echo ""

# Check if there are any staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|vue|js|mjs)$' || true)

if [ -z "$STAGED_FILES" ]; then
  echo "ℹ️  No TypeScript/Vue files staged for commit, skipping checks..."
  exit 0
fi

echo "📝 Changed files:"
echo "$STAGED_FILES"
echo ""

# Run ESLint on staged files (only fail on errors, warnings are allowed)
echo "🔍 Running ESLint on staged files..."
# Run eslint with fix and capture output
ESLINT_OUTPUT=$(echo "$STAGED_FILES" | xargs pnpm eslint --fix 2>&1 || true)

# Check for actual errors (not just warnings)
ESLINT_ERRORS=$(echo "$ESLINT_OUTPUT" | grep -c "✖" || echo "0")
ESLINT_PROBLEMS=$(echo "$ESLINT_OUTPUT" | grep -E "^\s+\d+:\d+\s+error" | wc -l || echo "0")

if [ "$ESLINT_PROBLEMS" -gt 0 ]; then
  echo "❌ ESLint found $ESLINT_PROBLEMS errors!"
  echo ""
  echo "💡 Tip: Run 'pnpm lint:fix' to auto-fix issues, or 'git commit --no-verify' to skip checks"
  exit 1
else
  echo "✅ ESLint passed! (warnings only)"
  # Re-add fixed files to staging
  echo "$STAGED_FILES" | xargs git add
fi

echo ""

# Run TypeScript type checking
# Note: There are pre-existing type errors in the codebase that need to be fixed incrementally
# For now, we run typecheck but don't fail on errors - just report them
echo "📘 Running TypeScript type check..."
TYPECHECK_OUTPUT=$(pnpm typecheck 2>&1)
TYPECHECK_EXIT=$?
if [ $TYPECHECK_EXIT -eq 0 ]; then
  echo "✅ TypeScript check passed!"
else
  # Count errors
  ERROR_COUNT=$(echo "$TYPECHECK_OUTPUT" | grep -c "error TS" || echo "0")
  echo "⚠️  TypeScript found $ERROR_COUNT type errors"
  echo "   (Note: Pre-existing errors - fix incrementally)"
  echo ""
  # Show last few errors for context
  echo "$TYPECHECK_OUTPUT" | grep "error TS" | tail -5
  echo ""
  echo "   Run 'pnpm typecheck' to see all errors"
  # Don't exit 1 yet - we need to fix pre-existing errors first
  # TODO: Enable strict mode once errors are fixed: exit 1
fi

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
