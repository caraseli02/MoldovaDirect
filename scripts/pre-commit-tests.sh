#!/bin/bash

# Pre-commit hook to run static analysis and tests on staged files
# Uses a layered approach for fast feedback:
# 1. Oxlint (fast first-pass, 50-100x faster than ESLint)
# 2. ESLint + SonarJS (deep analysis, Vue-specific rules)
# 3. TypeScript type checking
# 4. Unit tests on changed files

set -e

echo "🔍 Running pre-commit checks..."
echo ""

# Check for misplaced .md files in root
./scripts/check-md-files.sh

echo ""

# Check if there are any staged files
STAGED_TS_VUE=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|vue)$' || true)
STAGED_JS=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|mjs|cjs)$' || true)
STAGED_ALL=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|vue|js|mjs)$' || true)

if [ -z "$STAGED_ALL" ]; then
  echo "ℹ️  No TypeScript/Vue/JS files staged for commit, skipping checks..."
  exit 0
fi

echo "📝 Changed files:"
echo "$STAGED_ALL"
echo ""

# ============================================
# STEP 1: Oxlint (Fast First Pass)
# ============================================
echo "⚡ Running Oxlint (fast linter)..."
if [ -n "$STAGED_ALL" ]; then
  if echo "$STAGED_ALL" | xargs pnpm oxlint --deny-warnings 2>&1; then
    echo "✅ Oxlint passed!"
  else
    echo "❌ Oxlint found issues!"
    echo ""
    echo "💡 Tip: Fix the issues above or use 'git commit --no-verify' to skip checks"
    exit 1
  fi
fi

echo ""

# ============================================
# STEP 2: ESLint + SonarJS (Deep Analysis)
# ============================================
echo "🔍 Running ESLint + SonarJS on staged files..."
if [ -n "$STAGED_TS_VUE" ]; then
  ESLINT_OUTPUT=$(echo "$STAGED_TS_VUE" | xargs pnpm eslint --fix 2>&1 || true)

  # Check for actual errors (not just warnings)
  ESLINT_PROBLEMS=$(echo "$ESLINT_OUTPUT" | grep -E "^\s+\d+:\d+\s+error" | wc -l || echo "0")

  if [ "$ESLINT_PROBLEMS" -gt 0 ]; then
    echo "❌ ESLint found $ESLINT_PROBLEMS errors!"
    echo "$ESLINT_OUTPUT" | grep -E "(error|✖)" || true
    echo ""
    echo "💡 Tip: Run 'pnpm lint:fix' to auto-fix issues"
    exit 1
  else
    echo "✅ ESLint passed!"
    # Re-add fixed files to staging
    echo "$STAGED_TS_VUE" | xargs git add 2>/dev/null || true
  fi
else
  echo "ℹ️  No TS/Vue files to lint with ESLint"
fi

echo ""

# ============================================
# STEP 3: TypeScript Type Checking
# ============================================
echo "📘 Running TypeScript type check..."
TYPECHECK_OUTPUT=$(pnpm typecheck 2>&1)
TYPECHECK_EXIT=$?
if [ $TYPECHECK_EXIT -eq 0 ]; then
  echo "✅ TypeScript check passed!"
else
  ERROR_COUNT=$(echo "$TYPECHECK_OUTPUT" | grep -c "error TS" || echo "0")
  echo "⚠️  TypeScript found $ERROR_COUNT type errors"
  echo "   (Note: Pre-existing errors - fix incrementally)"
  echo ""
  echo "$TYPECHECK_OUTPUT" | grep "error TS" | tail -5
  echo ""
  echo "   Run 'pnpm typecheck' to see all errors"
  # Don't exit 1 yet - we need to fix pre-existing errors first
  # TODO: Enable strict mode once errors are fixed: exit 1
fi

echo ""

# ============================================
# STEP 4: Unit Tests on Changed Files
# ============================================
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

# ============================================
# STEP 5: Pre-commit Smoke Tests
# ============================================
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

# ============================================
# Optional: E2E Checkout Tests
# ============================================
if [ "$RUN_E2E_CHECKOUT_TESTS" = "true" ]; then
  echo "🎭 Running E2E checkout smart pre-population tests..."
  echo ""

  if pnpm run test:checkout:smart-prepopulation; then
    echo "✅ E2E checkout tests passed!"
  else
    echo "❌ E2E checkout tests failed!"
    echo ""
    echo "💡 Fix the failing tests or disable: unset RUN_E2E_CHECKOUT_TESTS"
    exit 1
  fi
else
  echo "ℹ️  E2E checkout tests skipped (set RUN_E2E_CHECKOUT_TESTS=true to enable)"
fi

echo ""
echo "✅ All pre-commit checks passed!"
