#!/bin/bash
# Verification script for FUNCTION_INVOCATION_FAILED fixes
# Run this after deployment to verify all fixes are working

set -e

echo "🔍 Verifying FUNCTION_INVOCATION_FAILED fixes..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for checks
PASSED=0
FAILED=0

check() {
  local name=$1
  local command=$2

  echo -n "Checking: $name... "

  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
  fi
}

echo "=== Code Changes Verification ==="
echo ""

# Check if publicCache.ts has error handling
check "publicCache.ts error handling" \
  "grep -q 'try {' server/utils/publicCache.ts"

# Check if featured.get.ts has optimized query
check "featured.get.ts query optimization" \
  "grep -q 'or.*featured.eq.true.*stock_quantity.gt.20' server/api/products/featured.get.ts"

# Check if nuxt.config.ts has Vercel config
check "nuxt.config.ts Vercel timeout" \
  "grep -q 'maxDuration: 10' nuxt.config.ts"

# Check if sharp is externalized
check "sharp externalization" \
  "grep -q '\"sharp\"' nuxt.config.ts"

# Check if ISR config is added
check "ISR configuration" \
  "grep -q 'isr:' nuxt.config.ts"

echo ""
echo "=== Cache Key Error Boundaries ==="
echo ""

# Check all major cached endpoints have try-catch in getKey
check "products/index.get.ts getKey error boundary" \
  "grep -A 5 'getKey:' server/api/products/index.get.ts | grep -q 'try'"

check "products/[slug].get.ts getKey error boundary" \
  "grep -A 5 'getKey:' server/api/products/\[slug\].get.ts | grep -q 'try'"

check "products/featured.get.ts getKey error boundary" \
  "grep -A 5 'getKey:' server/api/products/featured.get.ts | grep -q 'try'"

check "search/index.get.ts getKey error boundary" \
  "grep -A 5 'getKey:' server/api/search/index.get.ts | grep -q 'try'"

check "categories/index.get.ts getKey error boundary" \
  "grep -A 5 'getKey:' server/api/categories/index.get.ts | grep -q 'try'"

echo ""
echo "=== Migration Files ==="
echo ""

check "Database migration file exists" \
  "test -f supabase/migrations/20251114_add_performance_indexes.sql"

check "Migration has featured index" \
  "grep -q 'idx_products_featured_attribute' supabase/migrations/20251114_add_performance_indexes.sql"

check "Migration has stock/price index" \
  "grep -q 'idx_products_stock_price_active' supabase/migrations/20251114_add_performance_indexes.sql"

check "Migration has category index" \
  "grep -q 'idx_products_category_active' supabase/migrations/20251114_add_performance_indexes.sql"

echo ""
echo "=== Summary ==="
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All verification checks passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Commit and push changes: git add . && git commit -m 'fix: resolve FUNCTION_INVOCATION_FAILED' && git push"
  echo "2. After deployment, run database migration in Supabase Dashboard"
  echo "3. Monitor Vercel logs for execution times < 1s"
  exit 0
else
  echo -e "${RED}✗ Some checks failed. Please review the output above.${NC}"
  exit 1
fi
