#!/bin/bash
# Script to create all products page GitHub issues
# Run this script manually: bash scripts/create-product-issues.sh

echo "Creating GitHub issues for Products Page Review..."
echo "================================================"
echo ""

# CRITICAL ISSUES (Week 1)

echo "Creating Issue #1: Add comprehensive test coverage for products listing page"
gh issue create \
  --title "Add comprehensive test coverage for products listing page" \
  --label "testing,critical,products,tech-debt" \
  --body "## Description
The products listing page (\`pages/products/index.vue\`) has ZERO test coverage. This is a critical business page that handles product browsing, filtering, search, and pagination.

## Tasks
- [ ] Add unit tests for component logic
- [ ] Add integration tests for filtering
- [ ] Add integration tests for search
- [ ] Add integration tests for pagination
- [ ] Add E2E tests for complete user flows
- [ ] Add tests for mobile-specific features (pull-to-refresh, swipe)

## Test Coverage Goals
- Unit tests: 80%+ coverage
- E2E tests: All critical user paths

## Files to test
- \`pages/products/index.vue\`
- \`components/product/Card.vue\`
- \`components/product/Filter/Main.vue\`
- \`composables/useProductCatalog.ts\`
- \`stores/products.ts\`

## Acceptance Criteria
- [ ] All critical user flows have E2E tests
- [ ] Component logic has unit tests
- [ ] Tests run in CI/CD pipeline
- [ ] Test coverage meets 80% threshold

## Estimated Effort
3 days

## Priority
Critical - Week 1

## Related Files
- pages/products/index.vue
- components/product/Card.vue
- components/product/Filter/Main.vue"

echo "✓ Issue #1 created"
echo ""

echo "Creating Issue #2: Add comprehensive test coverage for product detail page"
gh issue create \
  --title "Add comprehensive test coverage for product detail page" \
  --label "testing,critical,products,tech-debt" \
  --body "## Description
The product detail page (\`pages/products/[slug].vue\`) has ZERO test coverage. This is the primary conversion page.

## Tasks
- [ ] Add unit tests for computed properties
- [ ] Add integration tests for add to cart
- [ ] Add integration tests for wishlist
- [ ] Add integration tests for share functionality
- [ ] Add E2E tests for product viewing and purchase flow
- [ ] Add tests for related products
- [ ] Add tests for image gallery

## Files to test
- \`pages/products/[slug].vue\`
- \`server/api/products/[slug].get.ts\`

## Acceptance Criteria
- [ ] Add to cart flow fully tested
- [ ] Stock status handling tested
- [ ] Related products loading tested
- [ ] Image gallery interaction tested
- [ ] All error states tested

## Estimated Effort
2 days

## Priority
Critical - Week 1

## Related Files
- pages/products/[slug].vue
- server/api/products/[slug].get.ts"

echo "✓ Issue #2 created"
echo ""

echo "Creating Issue #3: Fix silent add-to-cart failures on product detail page"
gh issue create \
  --title "Fix silent add-to-cart failures on product detail page" \
  --label "bug,critical,products,ux" \
  --body "## Description
When adding a product to cart fails, users receive NO feedback. The button just stops loading without any indication of success or failure.

**Current Code** (\`pages/products/[slug].vue:642-652\`):
\`\`\`typescript
const addToCart = async () => {
  if (!product.value) return
  try {
    await addItem({
      productId: product.value.id,
      quantity: selectedQuantity.value
    })
  } catch (err) {
    console.error('Add to cart failed', err)
  }
}
\`\`\`

## Issues
1. No success toast/notification
2. No error toast/notification
3. No loading indicator while processing
4. User has no idea if item was added

## Tasks
- [ ] Add loading state to button
- [ ] Add success toast notification
- [ ] Add error toast notification
- [ ] Consider auto-opening cart on success
- [ ] Add haptic feedback on mobile for success

## Acceptance Criteria
- [ ] User sees loading state while adding
- [ ] User sees success message when added
- [ ] User sees error message if failed
- [ ] Cart icon updates to show new item count
- [ ] Button shows visual feedback (checkmark on success)

## Estimated Effort
4 hours

## Priority
Critical - Week 1

## Related Files
- pages/products/[slug].vue:642-652"

echo "✓ Issue #3 created"
echo ""

echo "Creating Issue #4: Fix cart item format inconsistency between listing and detail pages"
gh issue create \
  --title "Fix cart item format inconsistency between listing and detail pages" \
  --label "bug,critical,products,cart" \
  --body "## Description
The product listing page and detail page use DIFFERENT formats when adding items to cart, which may cause cart errors.

**Product Card** (\`components/product/Card.vue:233-242\`):
\`\`\`typescript
const cartProduct = {
  id: props.product.id,
  slug: props.product.slug,
  name: getLocalizedText(props.product.name),
  price: Number(props.product.price),
  images: props.product.images?.map(img => img.url) || [],
  stock: props.product.stockQuantity
}
await addItem(cartProduct, 1)
\`\`\`

**Product Detail** (\`pages/products/[slug].vue:645-648\`):
\`\`\`typescript
await addItem({
  productId: product.value.id,
  quantity: selectedQuantity.value
})
\`\`\`

## Tasks
- [ ] Investigate \`useCart\` composable to determine correct format
- [ ] Create standardized cart item type
- [ ] Update both pages to use same format
- [ ] Add type checking to prevent future inconsistencies
- [ ] Test cart functionality from both entry points

## Acceptance Criteria
- [ ] Single source of truth for cart item format
- [ ] TypeScript types enforce correct format
- [ ] Both pages add items successfully
- [ ] Cart displays items correctly from both sources

## Estimated Effort
3 hours

## Priority
Critical - Week 1

## Related Files
- components/product/Card.vue:233-242
- pages/products/[slug].vue:645-648
- composables/useCart.ts"

echo "✓ Issue #4 created"
echo ""

echo "Creating Issue #5: Fix SSR crash in product share functionality"
gh issue create \
  --title "Fix SSR crash in product share functionality" \
  --label "bug,critical,products,ssr" \
  --body "## Description
The share product functionality uses \`window.location.href\` without checking if we're on server or client, which will cause SSR crashes.

**Location**: \`pages/products/[slug].vue:617-640\`

**Current Code**:
\`\`\`typescript
const shareProduct = async () => {
  try {
    const shareData = {
      title: getLocalizedText(product.value?.name),
      text: getLocalizedText(product.value?.shortDescription) || t('products.actions.shareText'),
      url: window.location.href  // ❌ SSR crash
    }
    // ...
  }
}
\`\`\`

## Tasks
- [ ] Add \`if (process.server) return\` guard
- [ ] Use \`useRequestURL()\` for SSR-safe URL construction
- [ ] Add proper error handling
- [ ] Add analytics tracking for shares
- [ ] Test on both server and client

## Acceptance Criteria
- [ ] No SSR errors when page renders
- [ ] Share works correctly on client
- [ ] Share analytics tracked
- [ ] Proper fallback if share API not available

## Estimated Effort
2 hours

## Priority
Critical - Week 1

## Related Files
- pages/products/[slug].vue:617-640"

echo "✓ Issue #5 created"
echo ""

echo "Creating Issue #6: Implement or remove wishlist functionality"
gh issue create \
  --title "Implement or remove wishlist functionality" \
  --label "feature,critical,products,wishlist" \
  --body "## Description
The wishlist toggle button on product detail page only toggles local state - it doesn't actually save the wishlist. This is misleading to users who think their items are saved.

**Current Code** (\`pages/products/[slug].vue:613-615\`):
\`\`\`typescript
const toggleWishlist = () => {
  wishlistAdded.value = !wishlistAdded.value  // Only local state!
}
\`\`\`

## Decision Required
- **Option A**: Implement full wishlist feature
- **Option B**: Remove the feature entirely

## If Implementing (Option A)
- [ ] Create wishlist database table
- [ ] Create wishlist API endpoints
- [ ] Add wishlist to user store
- [ ] Persist wishlist across sessions
- [ ] Add wishlist page
- [ ] Add remove from wishlist
- [ ] Add \"move to cart\" functionality
- [ ] Add wishlist count badge

## If Removing (Option B)
- [ ] Remove wishlist button from UI
- [ ] Remove wishlist state
- [ ] Remove wishlist translations

## Acceptance Criteria
- [ ] Decision made and documented
- [ ] If implementing: Full wishlist feature works
- [ ] If removing: No wishlist references remain

## Estimated Effort
1 day (implement) or 1 hour (remove)

## Priority
Critical - Week 1

## Related Files
- pages/products/[slug].vue:613-615"

echo "✓ Issue #6 created"
echo ""

echo "Creating Issue #7: Fix accessibility issues on products listing page"
gh issue create \
  --title "Fix accessibility issues on products listing page" \
  --label "accessibility,critical,products,a11y" \
  --body "## Description
Multiple accessibility issues found that prevent keyboard navigation and screen reader usage.

## Issues Found

### 1. Filter chips missing accessible labels
\`\`\`vue
<!-- Current -->
<button @click=\"removeActiveChip(chip)\">
  <span>{{ chip.label }}</span>
  <span aria-hidden=\"true\">×</span>
</button>

<!-- Should be -->
<button
  @click=\"removeActiveChip(chip)\"
  :aria-label=\"\\\`Remove \${chip.label} filter\\\`\"
>
  <span>{{ chip.label }}</span>
  <span aria-hidden=\"true\">×</span>
</button>
\`\`\`

### 2. Anti-pattern: v-if inside v-for
Location: \`pages/products/index.vue:240-249\`

### 3. Mobile swipe actions not announced
Screen readers don't know about swipe-to-paginate

## Tasks
- [ ] Add ARIA labels to all interactive elements
- [ ] Fix v-if in v-for anti-pattern
- [ ] Add screen reader announcements for filter changes
- [ ] Add keyboard shortcuts for common actions
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Add skip links
- [ ] Ensure focus management in modals

## Acceptance Criteria
- [ ] All interactive elements have proper labels
- [ ] No accessibility linting errors
- [ ] Keyboard navigation works for all features
- [ ] Screen reader announces state changes
- [ ] Passes WAVE accessibility audit

## Estimated Effort
1 day

## Priority
Critical - Week 1

## Related Files
- pages/products/index.vue"

echo "✓ Issue #7 created"
echo ""

echo "Creating Issue #8: Fix accessibility issues on product detail page"
gh issue create \
  --title "Fix accessibility issues on product detail page" \
  --label "accessibility,critical,products,a11y" \
  --body "## Description
Product detail page has accessibility gaps that prevent full keyboard navigation and screen reader usage.

## Issues Found

### 1. Image gallery not keyboard navigable
Location: \`pages/products/[slug].vue:88-99\`
- Only mouse click works
- Needs arrow key navigation

### 2. Breadcrumb missing ARIA
\`\`\`vue
<!-- Current -->
<nav class=\"flex...\">

<!-- Should be -->
<nav aria-label=\"Breadcrumb\">
\`\`\`

### 3. Missing structured data for breadcrumbs
- No Schema.org breadcrumb markup

### 4. FAQ details don't announce expanded state
- Screen readers don't indicate open/closed state clearly

## Tasks
- [ ] Add keyboard navigation to image gallery (arrow keys)
- [ ] Add ARIA labels to breadcrumb
- [ ] Add breadcrumb structured data
- [ ] Improve FAQ accessibility
- [ ] Add focus indicators to all interactive elements
- [ ] Test with screen reader
- [ ] Add keyboard shortcut guide

## Acceptance Criteria
- [ ] Image gallery navigable with keyboard
- [ ] Breadcrumb properly announced
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Passes accessibility audit

## Estimated Effort
1 day

## Priority
Critical - Week 1

## Related Files
- pages/products/[slug].vue"

echo "✓ Issue #8 created"
echo ""

echo "================================================"
echo "✓ All 8 CRITICAL issues created successfully!"
echo ""
echo "To create HIGH PRIORITY issues, run:"
echo "  bash scripts/create-product-issues-high.sh"
echo ""
