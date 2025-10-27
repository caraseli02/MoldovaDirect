#!/bin/bash

# Admin Orders E2E Test Runner
# This script ensures a clean test environment

echo "🧪 Admin Orders E2E Test Runner"
echo "================================"
echo ""

# Check if dev server is running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Dev server is already running on port 3000"
    echo "   Tests will use the existing server"
    echo ""
else
    echo "❌ No dev server detected on port 3000"
    echo "   Please start the dev server first:"
    echo "   npm run dev"
    echo ""
    exit 1
fi

# Check middleware bypass
echo "🔍 Checking middleware bypass..."
if grep -q "BYPASSED FOR TESTING" middleware/auth.ts; then
    echo "✅ Auth middleware bypass: ACTIVE"
else
    echo "❌ Auth middleware bypass: NOT ACTIVE"
    echo "   Please ensure middleware/auth.ts has the bypass code"
    exit 1
fi

if grep -q "BYPASSED FOR TESTING" middleware/admin.ts; then
    echo "✅ Admin middleware bypass: ACTIVE"
else
    echo "❌ Admin middleware bypass: NOT ACTIVE"
    echo "   Please ensure middleware/admin.ts has the bypass code"
    exit 1
fi

echo ""
echo "🚀 Running tests..."
echo ""

# Run tests
npx playwright test tests/e2e/admin-orders.spec.ts --project=chromium-en "$@"

TEST_EXIT_CODE=$?

echo ""
echo "================================"
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed (exit code: $TEST_EXIT_CODE)"
    echo ""
    echo "📊 View detailed report:"
    echo "   npx playwright show-report"
    echo ""
    echo "🔍 Check test artifacts:"
    echo "   - Screenshots: test-results/*/test-failed-*.png"
    echo "   - Videos: test-results/*/video.webm"
fi
echo ""

echo "⚠️  REMINDER: Restore middleware after testing!"
echo "   See TEST_ADMIN_ORDERS.md for instructions"
echo ""

exit $TEST_EXIT_CODE
