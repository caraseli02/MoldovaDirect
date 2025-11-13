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
  echo "✅ Pre-commit tests passed!"
else
  echo "❌ Pre-commit tests failed!"
  echo ""
  echo "💡 Tip: Fix the failing tests or use 'git commit --no-verify' to skip checks"
  exit 1
fi
