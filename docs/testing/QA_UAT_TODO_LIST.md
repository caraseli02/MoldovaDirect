# Moldova Direct - QA & UAT Development TODO List
**Created:** 2025-12-30
**Updated:** 2025-12-30 (Post PR #332 & #336 review)
**Status:** Updated based on recent fixes
**Target:** Production release blockers and UX improvements

---

## 📋 Overview

This document provides a validated, prioritized TODO list based on Q&A and UAT testing performed on https://moldova-direct.vercel.app/. Each item has been cross-referenced with the actual codebase to verify validity and provide accurate technical context.

**⚠️ IMPORTANT UPDATE:** After reviewing PRs #332 and #336, several issues appear to have been FIXED. See `QA_UAT_STATUS_UPDATE.md` for details.

**Next Action Required:** Test production URL to verify which issues are actually resolved.

---

## 🔴 P0 - Critical Blockers (Must Fix Before Public Release)

### 1. ⚠️ **[NEEDS VERIFICATION] Search Functionality**
**User Report:** Searching for keywords (e.g., "wine") returns the full catalog instead of filtered results.
**Status After Code Review:** ⚠️ Code appears correct - may already work, needs production testing

**Code Investigation:**
- ✅ Backend API exists and looks correct: `/server/api/search/index.get.ts`
- ✅ Frontend composable exists: `composables/useProductCatalog.ts` (lines 183-244)
- ✅ Search calls `/api/search?q={query}` with proper parameters
- ✅ PostgreSQL JSONB operators search across all 4 locales (es, en, ro, ru)

**Possible Root Cause:**
- Runtime issue: Search function may not be triggered properly
- Frontend-backend mismatch: Response might not update the UI state
- Caching issue: Search results might be cached incorrectly

**Technical Details:**
```typescript
// File: pages/products/index.vue, lines 587-610
const handleSearchInput = debounce(() => {
  if (searchQuery.value.trim()) {
    search(searchQuery.value.trim(), {
      ...filters.value,
      page: 1,
      sort: localSortBy.value,
    }, searchAbortController.value.signal)
  }
}, 300)
```

**Action Items:**
- [ ] Test search functionality on production (https://moldova-direct.vercel.app/)
- [ ] Add browser console logging to `handleSearchInput` to verify it's being called
- [ ] Check network tab to see if `/api/search` is being called with correct parameters
- [ ] Verify `products.value` is being updated after search response (line 219 in useProductCatalog.ts)
- [ ] Check if caching is interfering with search results

**Acceptance Criteria:**
- Searching "wine" returns only wine-related products
- Searching a non-existing term returns "No results found" state
- Product count updates correctly
- Search query is visible in URL or preserved on page reload

**Files to Review:**
- `pages/products/index.vue` (lines 587-610, handleSearchInput)
- `composables/useProductCatalog.ts` (lines 183-244, search function)
- `server/api/search/index.get.ts` (entire file)

---

### 2. ✅ **[LIKELY FIXED] Filters Causing Blank Product Grid**
**User Report:** Applying filters (price, availability) results in an empty page or broken state.
**Status After PR #332:** ✅ Filter bindings fixed, shadcn components added - likely resolved

**Code Investigation:**
- ✅ Backend supports filters: `/server/api/products/index.get.ts` (lines 143-164)
- ✅ Frontend filter handling exists: `pages/products/index.vue` (lines 630-651)
- ✅ Empty state UI exists: `pages/products/index.vue` (lines 349-380)

**What Was Fixed in PR #332 (Dec 28, 2025):**
```
- Fixed checkbox bindings (@update:checked → @update:model-value)
- Fixed Slider component model-value binding
- Replaced custom FilterSheet with shadcn-vue Sheet component
- Added proper event handling for inStock/featured filters
- Improved overall filter state management
```

**Original Root Cause (Now Fixed):**
- ✅ Filter checkbox events were using wrong event name
- ✅ Slider component had binding issues
- ✅ Custom sheet implementation was buggy

**Technical Details:**
```typescript
// File: pages/products/index.vue, lines 634-651
const handleApplyFilters = (closePanel = false) => {
  const currentFilters: ProductFilters = {
    ...filters.value,
    sort: localSortBy.value,
    page: 1,
  }

  if (searchQuery.value.trim()) {
    search(searchQuery.value.trim(), currentFilters)
  } else {
    fetchProducts(currentFilters)
  }
}
```

**Action Items (Verification Only):**
- [ ] ✅ Test filter functionality on https://moldova-direct.vercel.app/
- [ ] Confirm price range slider works correctly
- [ ] Confirm "In stock only" checkbox works
- [ ] Confirm "Featured only" checkbox works
- [ ] Verify empty state shows when no products match
- [ ] Test "Clear all filters" button
- [ ] ~~Add logging~~ (not needed unless still broken)
- [ ] ~~Check network tab~~ (not needed unless still broken)

**Acceptance Criteria:**
- Applying any combination of filters never blanks the page
- User can reset filters and recover state without refresh
- Grid always shows either products or a clear empty message: "No products match your filters. Try adjusting your selections."
- Active filters are displayed as removable chips above product grid

**Files to Review:**
- `pages/products/index.vue` (lines 630-651, filter handling)
- `server/api/products/index.get.ts` (lines 143-180, filter application)
- `components/product/Filter/Main.vue` (filter UI component)

---

### 3. ✅ **[LIKELY FIXED] Search + Filter Combo Issues**
**User Report:** Using search and filters together leaves the page in a non-recoverable blank state.
**Status After PR #332:** ✅ Filter fixes should resolve this - both features share same state

**Possible Root Cause:**
- Search clears filter state or vice versa
- Multiple API calls race and overwrite each other
- State management conflict between search results and filtered products

**Action Items:**
- [ ] Test search + filter combinations on production
- [ ] Verify both features share single source of truth (`products.value` in useProductCatalog)
- [ ] Add integration test for combined usage
- [ ] Ensure abort controller cancels previous requests properly

**Acceptance Criteria:**
- Search and filters can be used in any order
- No blank page or broken UI
- Back/forward navigation restores state correctly
- URL reflects both search query and active filters

**Files to Review:**
- `composables/useProductCatalog.ts` (search and fetchProducts functions)
- `pages/products/index.vue` (handleSearchInput and handleApplyFilters)

---

## 🟠 P1 - High Priority Improvements

### 4. **Improve Product Image Handling**
**User Report:** Many products show "Product image coming soon" placeholder.

**Code Investigation:**
- ✅ Fallback UI exists: `pages/products/[slug].vue` (lines 112-137)
- ✅ Fallback shows wine icon with message
- ⚠️ Fallback is intentional but still affects perceived quality

**Current Fallback UI:**
```vue
<div class="text-center space-y-4 px-6 max-w-sm">
  <commonIcon name="wine" class="h-20 w-20 text-blue-500" />
  <h3>{{ $t('products.imageFallback.title') }}</h3>
  <p>{{ $t('products.imageFallback.subtitle') }}</p>
</div>
```

**Recommended Actions:**
- [ ] Audit product catalog for missing images
- [ ] Create category-specific placeholders:
  - Wine: Wine bottle silhouette
  - Food: Gourmet food icon
  - Textile: Fabric/clothing icon
  - Gifts: Gift box icon
- [ ] Ensure all placeholders follow brand design system
- [ ] Add image upload requirements to admin product creation flow

**Acceptance Criteria:**
- No product card appears "broken"
- Placeholders look designed and intentional
- Grid remains visually balanced with mix of real images and placeholders
- Admin panel enforces image upload or category selection

**Files to Modify:**
- `components/product/Card.vue` (product card image display)
- `pages/products/[slug].vue` (product detail fallback)
- `components/admin/Products/Form.vue` (admin image upload)

---

### 5. **Add Empty & Loading States Across the App**
**Status:** ✅ MOSTLY COMPLETE

**Code Investigation:**
- ✅ Loading skeletons exist: `pages/products/index.vue` (lines 247-260)
- ✅ Empty state exists: `pages/products/index.vue` (lines 349-380)
- ✅ Error state exists: `pages/products/index.vue` (lines 214-244)

**Remaining Gaps:**
- [ ] Verify all states show correctly on production
- [ ] Add loading state for filter panel
- [ ] Add loading state for product detail page images
- [ ] Ensure consistent empty states across cart, orders, and account pages

**Acceptance Criteria:**
- No "dead" UI states
- User always understands what is happening
- Skeleton loaders match final content structure

**Files to Review:**
- `pages/products/index.vue` (reference implementation)
- `pages/cart.vue`
- `pages/account/orders/index.vue`

---

### 6. **Enable Language Switcher**
**User Report:** Only "English" is available in the language dropdown.

**Code Investigation:**
- ✅ All 4 locales exist: `i18n/locales/{es,en,ro,ru}.json`
- ✅ Spanish: 3,109 lines, English: 2,792 lines, Romanian: 2,397 lines, Russian: 2,379 lines
- ❓ Language switcher UI might be disabled or hidden

**Action Items:**
- [ ] Find language switcher component
- [ ] Verify Nuxt i18n config includes all 4 locales
- [ ] Check if switcher is hidden on production but enabled in dev
- [ ] Test locale switching on production

**Acceptance Criteria:**
- Language switcher shows all 4 locales (es, en, ro, ru)
- Switching languages reloads content in selected language
- User preference is persisted (cookie or localStorage)
- URLs reflect current locale (e.g., `/es/products`, `/en/products`)

**Files to Investigate:**
- `nuxt.config.ts` (i18n configuration)
- `components/layout/AppHeader.vue` (language switcher)
- Search for: `<select.*locale` or `LanguageSwitch`

---

## 🟡 P2 - UX & Conversion Enhancements

### 7. **Improve Search UX Feedback**
**Current State:** Search input accepts text but no visual feedback shows active search context.

**Recommended Enhancements:**
- [ ] Show active search term clearly above results: "Showing X results for 'wine'"
- [ ] Display result count that updates in real-time
- [ ] Add clear "Reset search" or "X" button to clear search
- [ ] Persist search query in URL (`?q=wine`)
- [ ] Add search suggestions dropdown (backend already supports this)

**Technical Details:**
```typescript
// Backend already returns suggestions:
// File: server/api/search/index.get.ts, line 189
suggestions: generateSearchSuggestions(searchTerm, matchingProducts || [], locale)
```

**Acceptance Criteria:**
- Users understand current search context
- One-click reset available
- Search state survives page reload
- Suggestions appear after typing 2+ characters

**Files to Modify:**
- `pages/products/index.vue` (add search result header)
- `components/product/SearchBar.vue` (add suggestions dropdown)

---

### 8. **Enhance Filter Usability**
**Current State:** Filters exist but UX could be improved.

**Recommended Enhancements:**
- [ ] Show active filters as removable chips (✅ DONE: lines 204-211 in products/index.vue)
- [ ] Add "Clear all filters" button (✅ DONE: exists in UI)
- [ ] Persist filters on pagination/reload (❓ VERIFY)
- [ ] Add filter count badge on "Filters" button (✅ DONE: lines 156-160)

**Status Check:**
- ✅ Active filter chips implemented
- ✅ Clear all filters exists
- ⚠️ Need to verify filter persistence
- ✅ Filter count badge exists

**Action Items:**
- [ ] Verify filters persist when user navigates back
- [ ] Test filter state with browser back/forward buttons
- [ ] Ensure filters reflected in URL for shareable links

**Acceptance Criteria:**
- Filters are transparent and reversible
- No hidden state
- Shareable URLs with filters applied

---

### 9. **Improve Product Recommendations Logic**
**User Report:** Recommended products feel generic.

**Current State:** Recommendations shown on cart page and product detail page.

**Recommended Improvements:**
- [ ] Base recommendations on:
  - Category similarity
  - Price range (±20% of cart total)
  - Cart contents (complementary products)
  - User's browsing history
- [ ] Avoid recommending items already in cart
- [ ] Show "Customers also bought" instead of generic recommendations

**Acceptance Criteria:**
- Recommendations feel relevant
- Improves average order value (AOV)
- Recommendations update when cart changes

**Files to Review:**
- `server/api/recommendations/cart.post.ts`
- `components/cart/Recommendations.vue`
- `components/product/RelatedProducts.vue`

---

## 🟢 P3 - Nice to Have / Future Work

### 10. **Address Autocomplete Enhancement**
**Current State:** Checkout address form requires manual entry.

**Recommended Enhancement:**
- [ ] Integrate Google Places API or similar
- [ ] Auto-detect country from user's locale
- [ ] Validate postal codes against country rules
- [ ] Format phone numbers by country

**Estimated Effort:** 2-3 days
**Impact:** Medium (reduces checkout errors, improves UX)

**Files to Modify:**
- `components/checkout/AddressForm.vue`
- `composables/useAddressAutocomplete.ts` (new file)

---

### 11. **Product Storytelling Improvements**
**Current State:** Product detail page works but could be more engaging.

**Recommended Enhancements:**
- [ ] Detect product category/type
- [ ] Conditionally render category-specific content:
  - **Wine:** Tasting notes, region, pairing suggestions
  - **Textile:** Material, origin story, care instructions
  - **Food:** Ingredients, recipes, origin
  - **Generic:** Hide wine-specific sections
- [ ] Avoid showing empty sections (e.g., tasting notes on non-wine products)

**Acceptance Criteria:**
- Copy matches product category
- No wine language on non-wine products
- Empty sections are hidden, not padded with generic text

**Files to Modify:**
- `pages/products/[slug].vue` (add conditional rendering)
- Create: `composables/useProductStorytel ling.ts`

---

### 12. **SEO & Performance Optimizations**
**Recommended Enhancements:**
- [ ] Add structured data for products (JSON-LD)
- [ ] Optimize images with lazy loading
- [ ] Implement infinite scroll for product grid (mobile)
- [ ] Add "Back to top" button on long pages
- [ ] Preload critical fonts and images

**Files to Review:**
- `composables/useProductStructuredData.ts` (already exists!)
- `nuxt.config.ts` (image optimization config)

---

## 📊 Testing & Validation Process

### Step 1: Verify P0 Issues on Production
```bash
# Test search
1. Go to https://moldova-direct.vercel.app/products
2. Search for "wine"
3. Expected: Only wine products shown
4. Actual: Document result in issue tracker

# Test filters
1. Click "Filters" button
2. Set price range: €10 - €50
3. Toggle "In stock only"
4. Click "Apply"
5. Expected: Products matching filters or empty state message
6. Actual: Document result
```

### Step 2: Reproduce Issues Locally
```bash
npm run dev
# Navigate to http://localhost:3000/products
# Repeat tests above
# Check browser console for errors
# Check network tab for API calls
```

### Step 3: Add Logging for Debugging
```typescript
// Temporary debugging - Remove before commit
console.log('[Search] Query:', searchQuery.value)
console.log('[Search] Filters:', filters.value)
console.log('[Search] API Response:', response)
console.log('[Search] Products Updated:', products.value.length)
```

### Step 4: Fix and Test
- Make minimal changes to fix root cause
- Verify fix locally
- Deploy to preview environment (Vercel preview)
- Test on preview URL
- Get QA approval
- Merge to main

---

## 🔗 Related Documentation

- [Testing Strategy](./TESTING_STRATEGY.md)
- [Production Testing Strategy](./PRODUCTION_TESTING_STRATEGY.md)
- [Checkout UX Checklist](../CHECKOUT_UX_CHECKLIST.md)
- [Feature List](../../feature_list.json)

---

## 📝 Notes for Dev Team

### Investigation Priority
1. **Search broken?** Check if `/api/search` is being called at all
2. **Filters broken?** Check if filter parameters reach the API
3. **Both broken together?** Likely state management issue

### Quick Debugging Commands
```bash
# Check if search endpoint works directly
curl "https://moldova-direct.vercel.app/api/search?q=wine&limit=5"

# Check if products endpoint works with search param
curl "https://moldova-direct.vercel.app/api/products?search=wine&limit=5"

# Check if filters work
curl "https://moldova-direct.vercel.app/api/products?priceMin=10&priceMax=50&inStock=true"
```

### Code Quality Reminders
- ✅ DO add console.warn for unexpected states
- ✅ DO use TypeScript types for all parameters
- ✅ DO add JSDoc comments for complex functions
- ❌ DON'T remove existing error handling
- ❌ DON'T skip writing tests for fixes
- ❌ DON'T commit debugging console.logs

---

**Last Updated:** 2025-12-30
**Next Review:** After P0 issues are fixed
**Status:** 🔴 Blocking issues present - prioritize P0 items first
