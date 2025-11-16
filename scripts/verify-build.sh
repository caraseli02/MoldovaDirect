#!/bin/bash
# Verify Nuxt build output for Vercel deployment
# This script ensures client JavaScript bundles are generated correctly

set -e

echo "🔍 Verifying Nuxt build output..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if build output exists
if [ ! -d ".vercel/output/static/_nuxt" ]; then
    echo -e "${RED}❌ ERROR: Build output not found${NC}"
    echo "Run 'npm run build' first"
    exit 1
fi

# Count JavaScript files
JS_COUNT=$(find .vercel/output/static/_nuxt -name "*.js" -type f 2>/dev/null | wc -l | tr -d ' ')
CSS_COUNT=$(find .vercel/output/static/_nuxt -name "*.css" -type f 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Build Output Summary:"
echo "   JavaScript files: $JS_COUNT"
echo "   CSS files: $CSS_COUNT"
echo ""

# Verify minimum JavaScript files
MIN_JS_FILES=100
if [ "$JS_COUNT" -lt "$MIN_JS_FILES" ]; then
    echo -e "${RED}❌ CRITICAL: Only $JS_COUNT JavaScript files found!${NC}"
    echo -e "${RED}   Expected at least $MIN_JS_FILES files${NC}"
    echo ""
    echo "This indicates client bundles are not being generated."
    echo ""
    echo "Common causes:"
    echo "  1. Custom Vite rollupOptions.output configuration"
    echo "  2. Conflicts with Nitro's Vercel preset"
    echo "  3. Build errors during client bundle generation"
    echo ""
    echo "Check nuxt.config.ts and build logs for issues."
    exit 1
fi

echo -e "${GREEN}✅ JavaScript bundles: $JS_COUNT files${NC}"

# Verify cart bundles
echo ""
echo "🛒 Checking cart functionality..."
CART_BUNDLES=$(grep -l "useCart\|cartStore" .vercel/output/static/_nuxt/*.js 2>/dev/null || echo "")

if [ -z "$CART_BUNDLES" ]; then
    echo -e "${RED}❌ ERROR: Cart code not found in bundles${NC}"
    echo "   Cart functionality will not work on deployment"
    exit 1
fi

CART_COUNT=$(echo "$CART_BUNDLES" | wc -l | tr -d ' ')
echo -e "${GREEN}✅ Cart code found in $CART_COUNT bundles${NC}"

# Verify Pinia
echo ""
echo "🏪 Checking Pinia state management..."
PINIA_BUNDLES=$(grep -l "pinia\|createPinia" .vercel/output/static/_nuxt/*.js 2>/dev/null || echo "")

if [ -z "$PINIA_BUNDLES" ]; then
    echo -e "${RED}❌ ERROR: Pinia code not found in bundles${NC}"
    echo "   State management will not work on deployment"
    exit 1
fi

echo -e "${GREEN}✅ Pinia found in bundles${NC}"

# Check for HTML in JS files (MIME type issues)
echo ""
echo "🔍 Checking for MIME type issues..."
HTML_IN_JS=0

for file in .vercel/output/static/_nuxt/*.js; do
    if [ -f "$file" ]; then
        if head -1 "$file" | grep -q "<!DOCTYPE\|<html"; then
            echo -e "${RED}❌ ERROR: $file contains HTML instead of JavaScript!${NC}"
            HTML_IN_JS=1
        fi
    fi
done

if [ "$HTML_IN_JS" -eq 1 ]; then
    echo -e "${RED}   Build configuration is broken${NC}"
    exit 1
fi

echo -e "${GREEN}✅ No MIME type issues detected${NC}"

# Check bundle sizes
echo ""
echo "📦 Bundle size analysis:"
TOTAL_SIZE=$(du -sh .vercel/output/static/_nuxt 2>/dev/null | cut -f1)
echo "   Total size: $TOTAL_SIZE"

# List largest bundles
echo ""
echo "📊 Largest bundles:"
find .vercel/output/static/_nuxt -name "*.js" -type f -exec du -h {} + 2>/dev/null | \
    sort -rh | head -5 | while read size file; do
    echo "   $size  $(basename $file)"
done

# Success
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Build verification passed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Safe to deploy to Vercel"
