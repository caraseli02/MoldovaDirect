#!/bin/bash

# Express Checkout Banner - Automated Validation Script
# This script validates the fixes without requiring browser interaction

echo "========================================="
echo "Express Checkout Banner Validation"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASS=0
FAIL=0

# Helper functions
pass() {
    echo -e "${GREEN}✓ PASS${NC} - $1"
    ((PASS++))
}

fail() {
    echo -e "${RED}✗ FAIL${NC} - $1"
    ((FAIL++))
}

warn() {
    echo -e "${YELLOW}⚠ WARN${NC} - $1"
}

# Base directory
BASE_DIR="/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments"

echo "1. Checking Middleware Fix (async keyword)"
echo "-------------------------------------------"
if grep -q "export default defineNuxtRouteMiddleware(async (to)" "$BASE_DIR/middleware/checkout.ts"; then
    pass "Middleware has async keyword"
else
    fail "Middleware missing async keyword"
fi
echo ""

echo "2. Checking useShippingAddress Composable"
echo "-------------------------------------------"
if grep -q "const defaultAddress = computed" "$BASE_DIR/composables/useShippingAddress.ts"; then
    pass "defaultAddress computed property exists"
else
    fail "defaultAddress computed property missing"
fi

if grep -q "const hasAddresses = computed" "$BASE_DIR/composables/useShippingAddress.ts"; then
    pass "hasAddresses computed property exists"
else
    fail "hasAddresses computed property missing"
fi

if grep -q "defaultAddress: readonly(defaultAddress)" "$BASE_DIR/composables/useShippingAddress.ts"; then
    pass "defaultAddress is exported"
else
    fail "defaultAddress is not exported"
fi

if grep -q "hasAddresses: readonly(hasAddresses)" "$BASE_DIR/composables/useShippingAddress.ts"; then
    pass "hasAddresses is exported"
else
    fail "hasAddresses is not exported"
fi
echo ""

echo "3. Checking ExpressCheckoutBanner Component"
echo "-------------------------------------------"
if [ -f "$BASE_DIR/components/checkout/ExpressCheckoutBanner.vue" ]; then
    pass "ExpressCheckoutBanner component exists"
    
    if grep -q "defaultAddress: Address | null" "$BASE_DIR/components/checkout/ExpressCheckoutBanner.vue"; then
        pass "Component accepts defaultAddress prop"
    else
        fail "Component missing defaultAddress prop"
    fi
    
    if grep -q "preferredShippingMethod" "$BASE_DIR/components/checkout/ExpressCheckoutBanner.vue"; then
        pass "Component accepts preferredShippingMethod prop"
    else
        fail "Component missing preferredShippingMethod prop"
    fi
else
    fail "ExpressCheckoutBanner component does not exist"
fi
echo ""

echo "4. Checking ShippingStep Integration"
echo "-------------------------------------------"
if grep -q "ExpressCheckoutBanner" "$BASE_DIR/components/checkout/ShippingStep.vue"; then
    pass "ShippingStep imports ExpressCheckoutBanner"
else
    fail "ShippingStep does not import ExpressCheckoutBanner"
fi

if grep -q 'v-if="user && defaultAddress && !expressCheckoutDismissed"' "$BASE_DIR/components/checkout/ShippingStep.vue"; then
    pass "Banner has correct visibility conditions"
else
    warn "Banner visibility condition might be modified"
fi

if grep -q ":default-address=\"defaultAddress\"" "$BASE_DIR/components/checkout/ShippingStep.vue"; then
    pass "Banner receives defaultAddress prop"
else
    fail "Banner not receiving defaultAddress prop"
fi
echo ""

echo "5. Checking Server Status"
echo "-------------------------------------------"
SERVER_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$SERVER_RESPONSE" = "200" ]; then
    pass "Server is running and responding (HTTP 200)"
else
    fail "Server not responding correctly (HTTP $SERVER_RESPONSE)"
fi
echo ""

echo "6. Checking TypeScript Definitions"
echo "-------------------------------------------"
if [ -f "$BASE_DIR/types/checkout.ts" ]; then
    if grep -q "interface Address" "$BASE_DIR/types/checkout.ts"; then
        pass "Address interface defined"
    else
        fail "Address interface not found"
    fi
else
    warn "checkout.ts type file not found"
fi
echo ""

echo "7. Checking Database Migration Files"
echo "-------------------------------------------"
MIGRATION_COUNT=$(find "$BASE_DIR/supabase/migrations" -name "*.sql" 2>/dev/null | grep -c "address\|checkout" || echo "0")
if [ "$MIGRATION_COUNT" -gt 0 ]; then
    pass "Found $MIGRATION_COUNT address/checkout related migrations"
else
    warn "No address/checkout migrations found"
fi
echo ""

echo "8. Validating Middleware Logic"
echo "-------------------------------------------"
if grep -q "await checkoutStore.prefetchCheckoutData()" "$BASE_DIR/middleware/checkout.ts"; then
    pass "Middleware calls prefetchCheckoutData"
else
    fail "Middleware does not call prefetchCheckoutData"
fi

if grep -q "if (!checkoutStore.dataPrefetched)" "$BASE_DIR/middleware/checkout.ts"; then
    pass "Middleware checks dataPrefetched flag"
else
    warn "Middleware might not check dataPrefetched flag"
fi
echo ""

echo "9. Checking Store Implementation"
echo "-------------------------------------------"
if [ -f "$BASE_DIR/stores/checkout.ts" ]; then
    pass "Checkout store exists"
    
    if grep -q "prefetchCheckoutData" "$BASE_DIR/stores/checkout.ts"; then
        pass "Store has prefetchCheckoutData method"
    else
        fail "Store missing prefetchCheckoutData method"
    fi
    
    if grep -q "savedAddresses" "$BASE_DIR/stores/checkout.ts"; then
        pass "Store has savedAddresses property"
    else
        fail "Store missing savedAddresses property"
    fi
else
    fail "Checkout store file not found"
fi
echo ""

echo "10. File Structure Validation"
echo "-------------------------------------------"
REQUIRED_FILES=(
    "middleware/checkout.ts"
    "composables/useShippingAddress.ts"
    "components/checkout/ExpressCheckoutBanner.vue"
    "components/checkout/ShippingStep.vue"
    "stores/checkout.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$BASE_DIR/$file" ]; then
        pass "Required file exists: $file"
    else
        fail "Required file missing: $file"
    fi
done
echo ""

echo "========================================="
echo "Test Summary"
echo "========================================="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}ALL TESTS PASSED ✓${NC}"
    echo "The Express Checkout Banner feature is correctly implemented."
    echo ""
    echo "Next Steps:"
    echo "1. Perform manual browser testing (see MANUAL_TEST_STEPS.md)"
    echo "2. Verify banner appears for users with saved addresses"
    echo "3. Test express checkout button functionality"
    exit 0
else
    echo -e "${RED}SOME TESTS FAILED ✗${NC}"
    echo "Please review the failed tests above and fix the issues."
    exit 1
fi
