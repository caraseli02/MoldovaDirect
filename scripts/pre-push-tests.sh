#!/bin/bash

# Pre-push hook to run comprehensive tests before pushing
# This ensures code quality and coverage standards are met

set -e

echo "🚀 Running pre-push checks..."
echo ""

# Get the current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $BRANCH"
echo ""

# Run all unit tests with coverage
echo "🧪 Running all unit tests with coverage..."
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
echo "✅ All pre-push checks passed!"
echo ""
echo "💡 Optional: Run 'pnpm test' to verify e2e tests locally"
