# Products Page - GitHub Issues

> **Summary**: 45 issues identified across Products Listing and Product Detail pages
> **Total Estimated Effort**: ~15-20 developer days
> **Priority Breakdown**: 8 Critical, 12 High, 15 Medium, 10 Low

---

## 🚨 CRITICAL PRIORITY (Week 1)

### Issue #1: Add comprehensive test coverage for products listing page
**Labels**: `testing`, `critical`, `products`, `tech-debt`
**Estimated Effort**: 3 days
**Assignee**: TBD

**Description**:
The products listing page (`pages/products/index.vue`) has ZERO test coverage. This is a critical business page that handles product browsing, filtering, search, and pagination.

**Tasks**:
- [ ] Add unit tests for component logic
- [ ] Add integration tests for filtering
- [ ] Add integration tests for search
- [ ] Add integration tests for pagination
- [ ] Add E2E tests for complete user flows
- [ ] Add tests for mobile-specific features (pull-to-refresh, swipe)

**Test Coverage Goals**:
- Unit tests: 80%+ coverage
- E2E tests: All critical user paths

**Files to test**:
- `pages/products/index.vue`
- `components/product/Card.vue`
- `components/product/Filter/Main.vue`
- `composables/useProductCatalog.ts`
- `stores/products.ts`

**Acceptance Criteria**:
- [ ] All critical user flows have E2E tests
- [ ] Component logic has unit tests
- [ ] Tests run in CI/CD pipeline
- [ ] Test coverage meets 80% threshold

---

### Issue #2: Add comprehensive test coverage for product detail page
**Labels**: `testing`, `critical`, `products`, `tech-debt`
**Estimated Effort**: 2 days
**Assignee**: TBD

**Description**:
The product detail page (`pages/products/[slug].vue`) has ZERO test coverage. This is the primary conversion page.

**Tasks**:
- [ ] Add unit tests for computed properties
- [ ] Add integration tests for add to cart
- [ ] Add integration tests for wishlist
- [ ] Add integration tests for share functionality
- [ ] Add E2E tests for product viewing and purchase flow
- [ ] Add tests for related products
- [ ] Add tests for image gallery

**Files to test**:
- `pages/products/[slug].vue`
- `server/api/products/[slug].get.ts`

**Acceptance Criteria**:
- [ ] Add to cart flow fully tested
- [ ] Stock status handling tested
- [ ] Related products loading tested
- [ ] Image gallery interaction tested
- [ ] All error states tested

---

### Issue #3: Fix silent add-to-cart failures on product detail page
**Labels**: `bug`, `critical`, `products`, `ux`
**Estimated Effort**: 4 hours
**Assignee**: TBD

**Description**:
When adding a product to cart fails, users receive NO feedback. The button just stops loading without any indication of success or failure.

**Current Code** (`pages/products/[slug].vue:642-652`):
```typescript
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
```

**Issues**:
1. No success toast/notification
2. No error toast/notification
3. No loading indicator while processing
4. User has no idea if item was added

**Tasks**:
- [ ] Add loading state to button
- [ ] Add success toast notification
- [ ] Add error toast notification
- [ ] Consider auto-opening cart on success
- [ ] Add haptic feedback on mobile for success

**Acceptance Criteria**:
- [ ] User sees loading state while adding
- [ ] User sees success message when added
- [ ] User sees error message if failed
- [ ] Cart icon updates to show new item count
- [ ] Button shows visual feedback (checkmark on success)

---

### Issue #4: Fix cart item format inconsistency between listing and detail pages
**Labels**: `bug`, `critical`, `products`, `cart`
**Estimated Effort**: 3 hours
**Assignee**: TBD

**Description**:
The product listing page and detail page use DIFFERENT formats when adding items to cart, which may cause cart errors.

**Product Card** (`components/product/Card.vue:233-242`):
```typescript
const cartProduct = {
  id: props.product.id,
  slug: props.product.slug,
  name: getLocalizedText(props.product.name),
  price: Number(props.product.price),
  images: props.product.images?.map(img => img.url) || [],
  stock: props.product.stockQuantity
}
await addItem(cartProduct, 1)
```

**Product Detail** (`pages/products/[slug].vue:645-648`):
```typescript
await addItem({
  productId: product.value.id,
  quantity: selectedQuantity.value
})
```

**Tasks**:
- [ ] Investigate `useCart` composable to determine correct format
- [ ] Create standardized cart item type
- [ ] Update both pages to use same format
- [ ] Add type checking to prevent future inconsistencies
- [ ] Test cart functionality from both entry points

**Acceptance Criteria**:
- [ ] Single source of truth for cart item format
- [ ] TypeScript types enforce correct format
- [ ] Both pages add items successfully
- [ ] Cart displays items correctly from both sources

---

### Issue #5: Fix SSR crash in product share functionality
**Labels**: `bug`, `critical`, `products`, `ssr`
**Estimated Effort**: 2 hours
**Assignee**: TBD

**Description**:
The share product functionality uses `window.location.href` without checking if we're on server or client, which will cause SSR crashes.

**Location**: `pages/products/[slug].vue:617-640`

**Current Code**:
```typescript
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
```

**Tasks**:
- [ ] Add `if (process.server) return` guard
- [ ] Use `useRequestURL()` for SSR-safe URL construction
- [ ] Add proper error handling
- [ ] Add analytics tracking for shares
- [ ] Test on both server and client

**Acceptance Criteria**:
- [ ] No SSR errors when page renders
- [ ] Share works correctly on client
- [ ] Share analytics tracked
- [ ] Proper fallback if share API not available

---

### Issue #6: Implement or remove wishlist functionality
**Labels**: `feature`, `critical`, `products`, `wishlist`
**Estimated Effort**: 1 day (implement) or 1 hour (remove)
**Assignee**: TBD

**Description**:
The wishlist toggle button on product detail page only toggles local state - it doesn't actually save the wishlist. This is misleading to users who think their items are saved.

**Current Code** (`pages/products/[slug].vue:613-615`):
```typescript
const toggleWishlist = () => {
  wishlistAdded.value = !wishlistAdded.value  // Only local state!
}
```

**Decision Required**:
- **Option A**: Implement full wishlist feature
- **Option B**: Remove the feature entirely

**If Implementing (Option A)**:
- [ ] Create wishlist database table
- [ ] Create wishlist API endpoints
- [ ] Add wishlist to user store
- [ ] Persist wishlist across sessions
- [ ] Add wishlist page
- [ ] Add remove from wishlist
- [ ] Add "move to cart" functionality
- [ ] Add wishlist count badge

**If Removing (Option B)**:
- [ ] Remove wishlist button from UI
- [ ] Remove wishlist state
- [ ] Remove wishlist translations

**Acceptance Criteria**:
- [ ] Decision made and documented
- [ ] If implementing: Full wishlist feature works
- [ ] If removing: No wishlist references remain

---

### Issue #7: Fix accessibility issues on products listing page
**Labels**: `accessibility`, `critical`, `products`, `a11y`
**Estimated Effort**: 1 day
**Assignee**: TBD

**Description**:
Multiple accessibility issues found that prevent keyboard navigation and screen reader usage.

**Issues Found**:

1. **Filter chips missing accessible labels** (`pages/products/index.vue:162-171`)
```vue
<!-- Current -->
<button @click="removeActiveChip(chip)">
  <span>{{ chip.label }}</span>
  <span aria-hidden="true">×</span>
</button>

<!-- Should be -->
<button
  @click="removeActiveChip(chip)"
  :aria-label="`Remove ${chip.label} filter`"
>
  <span>{{ chip.label }}</span>
  <span aria-hidden="true">×</span>
</button>
```

2. **Close button missing label** (`pages/products/index.vue:57-60`)
```vue
<!-- Already correct, verify it's working -->
<button type="button" @click="closeFilterPanel">
  <span class="sr-only">{{ t('common.close') }}</span>
  ×
</button>
```

3. **Anti-pattern: v-if inside v-for** (`pages/products/index.vue:240-249`)
```vue
<!-- Current -->
<button
  v-for="page in visiblePages"
  :key="`page-${page}`"
  v-if="page !== '...'"  <!-- ❌ Anti-pattern -->
>

<!-- Should use computed property to filter first -->
```

4. **Mobile swipe actions not announced**
- Screen readers don't know about swipe-to-paginate

**Tasks**:
- [ ] Add ARIA labels to all interactive elements
- [ ] Fix v-if in v-for anti-pattern
- [ ] Add screen reader announcements for filter changes
- [ ] Add keyboard shortcuts for common actions
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Add skip links
- [ ] Ensure focus management in modals

**Acceptance Criteria**:
- [ ] All interactive elements have proper labels
- [ ] No accessibility linting errors
- [ ] Keyboard navigation works for all features
- [ ] Screen reader announces state changes
- [ ] Passes WAVE accessibility audit

---

### Issue #8: Fix accessibility issues on product detail page
**Labels**: `accessibility`, `critical`, `products`, `a11y`
**Estimated Effort**: 1 day
**Assignee**: TBD

**Description**:
Product detail page has accessibility gaps that prevent full keyboard navigation and screen reader usage.

**Issues Found**:

1. **Image gallery not keyboard navigable** (`pages/products/[slug].vue:88-99`)
```vue
<!-- Current: Only mouse click -->
<button @click="selectedImageIndex = index">

<!-- Needs: Arrow key navigation -->
```

2. **Breadcrumb missing ARIA** (`pages/products/[slug].vue:38-56`)
```vue
<!-- Current -->
<nav class="flex...">

<!-- Should be -->
<nav aria-label="Breadcrumb">
```

3. **Missing structured data for breadcrumbs**
- No Schema.org breadcrumb markup

4. **FAQ details don't announce expanded state**
- Screen readers don't indicate open/closed state clearly

**Tasks**:
- [ ] Add keyboard navigation to image gallery (arrow keys)
- [ ] Add ARIA labels to breadcrumb
- [ ] Add breadcrumb structured data
- [ ] Improve FAQ accessibility
- [ ] Add focus indicators to all interactive elements
- [ ] Test with screen reader
- [ ] Add keyboard shortcut guide

**Acceptance Criteria**:
- [ ] Image gallery navigable with keyboard
- [ ] Breadcrumb properly announced
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Passes accessibility audit

---

## 🔴 HIGH PRIORITY (Week 2)

### Issue #9: Optimize search performance with database full-text search
**Labels**: `performance`, `high`, `products`, `backend`
**Estimated Effort**: 1 day
**Assignee**: TBD

**Description**:
Current search implementation fetches ALL products and filters in JavaScript, which is extremely inefficient and will not scale.

**Current Implementation** (`server/api/products/index.get.ts:92-122`):
```typescript
if (search) {
  // ❌ Fetches ALL products first
  const { data: searchProducts } = await queryBuilder

  // ❌ Filters in JavaScript
  const searchTermLower = search.toLowerCase().trim()
  allProductsForSearch = (searchProducts || []).filter(product => {
    const nameMatches = Object.values(product.name_translations || {}).some(name =>
      (name as string).toLowerCase().includes(searchTermLower)
    )
    // ...
  })
}
```

**Problems**:
- Fetches all products from database (slow with 1000+ products)
- JavaScript filtering on server (inefficient)
- No ranking/relevance scoring
- No support for fuzzy matching
- No search analytics

**Tasks**:
- [ ] Implement PostgreSQL full-text search
- [ ] Add search indexes to database
- [ ] Support multi-language search
- [ ] Add relevance ranking
- [ ] Add fuzzy matching for typos
- [ ] Track search analytics (popular terms, no-result searches)
- [ ] Add search suggestions/autocomplete
- [ ] Benchmark performance improvement

**Recommended Implementation**:
```typescript
// Use PostgreSQL full-text search
queryBuilder = supabase
  .from('products')
  .select('...')
  .textSearch('name_translations', search, {
    type: 'websearch',
    config: 'english'
  })
  .textSearch('description_translations', search, {
    type: 'websearch',
    config: 'english'
  })
```

**Acceptance Criteria**:
- [ ] Search executes in <100ms for 10,000 products
- [ ] Results ranked by relevance
- [ ] Supports fuzzy matching
- [ ] Multi-language search works
- [ ] Search analytics tracked

---

### Issue #10: Add request cancellation for search queries
**Labels**: `performance`, `high`, `products`, `ux`
**Estimated Effort**: 4 hours
**Assignee**: TBD

**Description**:
When users type quickly, multiple search requests fire simultaneously. Previous requests should be cancelled to avoid race conditions and wasted resources.

**Current Behavior**:
```
User types: "w" -> Request 1 fires
User types: "i" -> Request 2 fires (Request 1 still pending)
User types: "n" -> Request 3 fires (Requests 1&2 still pending)
User types: "e" -> Request 4 fires (Requests 1-3 still pending)

Result: 4 requests, only the last one matters
```

**Tasks**:
- [ ] Implement AbortController for search requests
- [ ] Cancel previous request when new search starts
- [ ] Add visual indicator during search
- [ ] Test with slow network conditions
- [ ] Add error handling for cancelled requests

**Implementation**:
```typescript
let searchController: AbortController | null = null

const handleSearchInput = () => {
  // Cancel previous request
  if (searchController) {
    searchController.abort()
  }

  searchController = new AbortController()

  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    try {
      await search(searchQuery.value.trim(), {
        ...filters.value,
        page: 1,
        sort: sortBy.value as any
      }, { signal: searchController.signal })
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Handle real errors
      }
    }
  }, 300)
}
```

**Acceptance Criteria**:
- [ ] Previous searches cancelled when new search starts
- [ ] No race conditions in results
- [ ] Proper error handling for cancellations
- [ ] Works in all browsers

---

### Issue #11: Add URL state management for filters
**Labels**: `feature`, `high`, `products`, `ux`, `seo`
**Estimated Effort**: 1 day
**Assignee**: TBD

**Description**:
Filters are not persisted in URL, which means:
- Users can't share filtered views
- Browser back/forward doesn't work correctly
- Filters lost on page reload
- Bad for SEO (can't index filtered pages)

**Current Behavior**:
```
User filters by category: /products
User filters by price: /products  (URL unchanged)
User shares link: Recipient sees unfiltered products
```

**Desired Behavior**:
```
User filters by category: /products?category=wine
User filters by price: /products?category=wine&priceMin=10&priceMax=50
User shares link: Recipient sees same filtered view
Browser back: Returns to previous filter state
```

**Tasks**:
- [ ] Create `useProductFilters` composable
- [ ] Read filters from URL query params on mount
- [ ] Update URL when filters change (without page reload)
- [ ] Support browser back/forward navigation
- [ ] Handle invalid/malformed query params gracefully
- [ ] Add canonical tags for SEO
- [ ] Update meta descriptions based on filters

**Implementation**:
```typescript
// composables/useProductFilters.ts
export const useProductFilters = () => {
  const route = useRoute()
  const router = useRouter()

  const initFiltersFromURL = (): ProductFilters => {
    return {
      category: route.query.category as string,
      search: route.query.q as string,
      priceMin: route.query.priceMin ? Number(route.query.priceMin) : undefined,
      priceMax: route.query.priceMax ? Number(route.query.priceMax) : undefined,
      inStock: route.query.inStock === 'true',
      featured: route.query.featured === 'true',
      sort: route.query.sort as any,
      page: route.query.page ? Number(route.query.page) : 1
    }
  }

  const updateURL = (filters: ProductFilters) => {
    const query: Record<string, string> = {}

    if (filters.category) query.category = filters.category.toString()
    if (filters.search) query.q = filters.search
    if (filters.priceMin) query.priceMin = filters.priceMin.toString()
    if (filters.priceMax) query.priceMax = filters.priceMax.toString()
    if (filters.inStock) query.inStock = 'true'
    if (filters.featured) query.featured = 'true'
    if (filters.sort) query.sort = filters.sort
    if (filters.page && filters.page > 1) query.page = filters.page.toString()

    router.push({ query })
  }

  return { initFiltersFromURL, updateURL }
}
```

**Acceptance Criteria**:
- [ ] Filters persist in URL
- [ ] Sharing URLs preserves filters
- [ ] Browser back/forward works
- [ ] Page reload maintains filters
- [ ] Clean URLs (no empty params)
- [ ] SEO-friendly canonical tags

---

### Issue #12: Add structured data (JSON-LD) for products
**Labels**: `seo`, `high`, `products`
**Estimated Effort**: 4 hours
**Assignee**: TBD

**Description**:
Product detail page is missing JSON-LD structured data, which limits rich snippets in search results and reduces visibility.

**Benefits of Structured Data**:
- Rich snippets in Google (price, availability, ratings)
- Better product discoverability
- Voice search optimization
- Improved SEO rankings

**Tasks**:
- [ ] Add Product schema
- [ ] Add Offer schema (price, availability)
- [ ] Add Review/AggregateRating schema
- [ ] Add Breadcrumb schema
- [ ] Add Organization schema
- [ ] Test with Google Rich Results Test
- [ ] Validate with Schema.org validator

**Implementation** (`pages/products/[slug].vue`):
```vue
<script setup lang="ts">
// ... existing code

const structuredData = computed(() => ({
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": getLocalizedText(product.value?.name),
  "image": product.value?.images?.map(img => img.url) || [],
  "description": getLocalizedText(product.value?.description),
  "sku": product.value?.sku,
  "brand": {
    "@type": "Brand",
    "name": "Moldova Direct"
  },
  "offers": {
    "@type": "Offer",
    "url": `https://moldovadirect.com/products/${product.value?.slug}`,
    "priceCurrency": "EUR",
    "price": product.value?.price,
    "availability": product.value?.stockQuantity > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    "seller": {
      "@type": "Organization",
      "name": "Moldova Direct"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": reviewSummary.value.rating,
    "reviewCount": reviewSummary.value.count
  }
}))
</script>

<template>
  <div>
    <!-- Structured Data -->
    <script type="application/ld+json" v-html="JSON.stringify(structuredData)" />

    <!-- Rest of template -->
  </div>
</template>
```

**Acceptance Criteria**:
- [ ] All products have valid structured data
- [ ] Passes Google Rich Results Test
- [ ] Passes Schema.org validation
- [ ] Rich snippets appear in search results
- [ ] Breadcrumbs appear in search results

---

### Issue #13: Persist recently viewed products to localStorage
**Labels**: `feature`, `high`, `products`, `ux`
**Estimated Effort**: 3 hours
**Assignee**: TBD

**Description**:
Recently viewed products are stored only in Vue state, so they're lost on page reload. This reduces the value of the feature for returning users.

**Current Implementation** (`pages/products/[slug].vue:669-672`):
```typescript
recentlyViewedProducts.value = [
  newProduct,
  ...recentlyViewedProducts.value.filter(item => item.id !== newProduct.id)
].slice(0, 8)
// ❌ Lost on page reload
```

**Tasks**:
- [ ] Create `useRecentlyViewed` composable
- [ ] Save to localStorage on add
- [ ] Load from localStorage on mount
- [ ] Handle localStorage quota exceeded
- [ ] Add timestamp to expire old entries (30 days)
- [ ] Sync across tabs using storage events
- [ ] Handle SSR safely

**Implementation**:
```typescript
// composables/useRecentlyViewed.ts
export const useRecentlyViewed = () => {
  const STORAGE_KEY = 'recentlyViewed'
  const MAX_ITEMS = 8
  const EXPIRY_DAYS = 30

  const products = useState<ProductWithRelations[]>('recentlyViewed', () => {
    if (process.client) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          // Filter out expired items
          const now = Date.now()
          return parsed
            .filter(item => {
              const age = now - new Date(item.viewedAt).getTime()
              return age < EXPIRY_DAYS * 24 * 60 * 60 * 1000
            })
            .map(item => item.product)
        }
      } catch (err) {
        console.error('Failed to load recently viewed', err)
      }
    }
    return []
  })

  const addToRecentlyViewed = (product: ProductWithRelations) => {
    products.value = [
      product,
      ...products.value.filter(p => p.id !== product.id)
    ].slice(0, MAX_ITEMS)

    if (process.client) {
      try {
        const toSave = products.value.map(p => ({
          product: p,
          viewedAt: new Date().toISOString()
        }))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
      } catch (err) {
        // Handle quota exceeded
        if (err.name === 'QuotaExceededError') {
          // Clear old items and try again
          products.value = products.value.slice(0, 4)
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(
              products.value.map(p => ({ product: p, viewedAt: new Date().toISOString() }))
            ))
          } catch (e) {
            console.error('Failed to save recently viewed', e)
          }
        }
      }
    }
  }

  // Sync across tabs
  if (process.client) {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          products.value = parsed.map(item => item.product)
        } catch (err) {
          console.error('Failed to sync recently viewed', err)
        }
      }
    })
  }

  return { products, addToRecentlyViewed }
}
```

**Acceptance Criteria**:
- [ ] Recently viewed persists across sessions
- [ ] Syncs across browser tabs
- [ ] Handles localStorage errors gracefully
- [ ] Old entries expire after 30 days
- [ ] Works in SSR without crashes

---

### Issue #14: Debounce price range API calls
**Labels**: `performance`, `high`, `products`, `backend`
**Estimated Effort**: 2 hours
**Assignee**: TBD

**Description**:
Price range API is called every time a filter changes, causing unnecessary server load and API calls.

**Current Implementation** (`pages/products/index.vue:911-913`):
```typescript
watch(() => [filters.value.category, filters.value.inStock, filters.value.featured], async () => {
  await refreshPriceRange()  // ❌ Calls API immediately on every change
})
```

**Problem**:
```
User clicks category -> API call
User toggles inStock -> API call
User toggles featured -> API call
Total: 3 API calls in quick succession
```

**Tasks**:
- [ ] Add debounce to price range updates (300ms)
- [ ] Cancel pending requests on new changes
- [ ] Cache price ranges per filter combination
- [ ] Show loading state while fetching
- [ ] Handle errors gracefully

**Implementation**:
```typescript
let priceRangeTimeout: NodeJS.Timeout
let priceRangeController: AbortController | null = null

const refreshPriceRange = async () => {
  // Clear existing timeout
  clearTimeout(priceRangeTimeout)

  // Cancel pending request
  if (priceRangeController) {
    priceRangeController.abort()
  }

  // Debounce the API call
  priceRangeTimeout = setTimeout(async () => {
    try {
      priceRangeController = new AbortController()

      const params = new URLSearchParams()
      if (filters.value.category) params.append('category', String(filters.value.category))
      if (filters.value.inStock) params.append('inStock', 'true')
      if (filters.value.featured) params.append('featured', 'true')

      const res = await $fetch<{ success: boolean; min: number; max: number }>(
        `/api/products/price-range?${params.toString()}`,
        { signal: priceRangeController.signal }
      )

      if (res.success) {
        priceRange.value = { min: res.min ?? 0, max: res.max ?? 200 }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Failed to load price range', e)
      }
    }
  }, 300)
}

watch(() => [filters.value.category, filters.value.inStock, filters.value.featured], refreshPriceRange)
```

**Acceptance Criteria**:
- [ ] Price range API debounced by 300ms
- [ ] Previous requests cancelled
- [ ] Reduced server load
- [ ] Maintains user experience

---

### Issue #15: Improve error messages and add retry mechanisms
**Labels**: `ux`, `high`, `products`, `error-handling`
**Estimated Effort**: 4 hours
**Assignee**: TBD

**Description**:
Current error handling only logs to console. Users see generic error messages with no way to retry or understand what went wrong.

**Current Issues**:
1. Generic error messages
2. No retry buttons
3. Errors only in console
4. No user guidance on how to fix
5. No error analytics tracking

**Current Implementation** (`pages/products/index.vue:558, 608`):
```typescript
catch (error) {
  console.error('Failed to refresh products:', error)  // ❌ User sees nothing
}
```

**Tasks**:
- [ ] Add specific error messages for different failure types
- [ ] Add retry buttons to error states
- [ ] Add error analytics tracking
- [ ] Add offline detection
- [ ] Add error toast notifications
- [ ] Add error boundaries for components
- [ ] Create error recovery flows

**Implementation**:
```typescript
// composables/useErrorHandling.ts
export const useErrorHandling = () => {
  const toast = useToast()
  const analytics = useAnalytics()

  const handleProductError = (error: Error, context: string) => {
    // Track error
    analytics.track('product_error', {
      error: error.message,
      context,
      timestamp: new Date().toISOString()
    })

    // Determine error type
    let userMessage = ''
    let canRetry = true

    if (error.message.includes('network')) {
      userMessage = t('errors.network')
      canRetry = true
    } else if (error.message.includes('404')) {
      userMessage = t('errors.notFound')
      canRetry = false
    } else if (error.message.includes('timeout')) {
      userMessage = t('errors.timeout')
      canRetry = true
    } else {
      userMessage = t('errors.generic')
      canRetry = true
    }

    // Show toast
    toast.error(userMessage, {
      action: canRetry ? {
        label: t('common.retry'),
        onClick: () => retryLastAction()
      } : undefined
    })
  }

  return { handleProductError }
}
```

**Error States to Handle**:
- Network errors (offline)
- Timeout errors
- 404 Not Found
- 500 Server errors
- Rate limiting
- Invalid filters
- Empty results vs error results

**Acceptance Criteria**:
- [ ] Specific error messages for each error type
- [ ] Retry buttons where applicable
- [ ] Errors tracked in analytics
- [ ] Offline state detected and communicated
- [ ] Error recovery guidance provided

---

### Issue #16: Remove TypeScript 'any' usage and improve type safety
**Labels**: `code-quality`, `high`, `products`, `typescript`
**Estimated Effort**: 1 day
**Assignee**: TBD

**Description**:
Multiple instances of `any` type usage reduce type safety and can hide bugs.

**Instances Found**:

1. **Category conversion** (`pages/products/index.vue:411-426`):
```typescript
const convertCategories = (cats: any[]): any[] => {  // ❌ any
```

2. **Cache data** (`stores/products.ts:43`):
```typescript
cache: Map<string, { data: any; timestamp: number; ttl: number }>  // ❌ any
```

3. **Product attributes** (`pages/products/[slug].vue:421`):
```typescript
attributes?: Record<string, any>  // ❌ any
```

4. **Category type assertion** (`pages/products/[slug].vue:463`):
```typescript
const category: any = product.value.category  // ❌ any
```

**Tasks**:
- [ ] Define proper ProductAttributes interface
- [ ] Define proper CategoryNode interface
- [ ] Create CacheData generic type
- [ ] Remove all 'any' usage
- [ ] Add type guards where needed
- [ ] Enable strict TypeScript mode
- [ ] Fix any new type errors

**Proposed Types**:
```typescript
// types/product.ts
export interface ProductAttributes {
  origin?: string
  volume?: number
  alcoholContent?: number
  producer_story?: string
  producerStory?: string
  tasting_notes?: string[] | string
  tastingNotes?: string[] | string
  pairings?: string[] | string
  awards?: string[] | string
  terroir?: string
  rating?: number
  review_count?: number
  reviewCount?: number
  review_highlights?: string[] | string
  reviewHighlights?: string[] | string
  organic?: boolean
  organicCertified?: boolean
  handcrafted?: boolean
  smallBatch?: boolean
  familyOwned?: boolean
  limitedRelease?: boolean
  limitedEdition?: boolean
  protectedOrigin?: boolean
  geographicIndication?: boolean
  featured?: boolean
  tags?: string[]
}

export interface CategoryNode {
  id: number
  slug: string
  name: Record<string, string>
  parentId?: number
  children?: CategoryNode[]
  productCount?: number
  sortOrder: number
}

export interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
  ttl: number
}
```

**Acceptance Criteria**:
- [ ] Zero 'any' types in products code
- [ ] All types properly defined
- [ ] Type guards for runtime validation
- [ ] No type errors in strict mode
- [ ] Better IDE autocomplete

---

### Issue #17: Refactor large products listing page into smaller components
**Labels**: `refactoring`, `high`, `products`, `maintainability`
**Estimated Effort**: 1.5 days
**Assignee**: TBD

**Description**:
The products listing page is 914 lines, making it hard to maintain, test, and reason about.

**Current Structure** (`pages/products/index.vue`):
- Hero section (lines 9-46)
- Filter panel (lines 48-74)
- Search and controls (lines 89-190)
- Product grid (lines 215-260)
- Recently viewed (lines 277-291)
- Editorial stories (lines 293-325)
- All logic (lines 333-914)

**Tasks**:
- [ ] Extract ProductsHero component
- [ ] Extract ProductsControls component
- [ ] Extract ProductsGrid component
- [ ] Extract RecentlyViewed component
- [ ] Extract EditorialStories component
- [ ] Extract filter logic to composable
- [ ] Extract pagination logic to composable
- [ ] Move discovery collections to config
- [ ] Add component documentation

**Proposed Structure**:
```
components/products/
├── ProductsHero.vue (hero section)
├── ProductsControls.vue (search, sort, filter button)
├── ProductsGrid.vue (grid with loading/error states)
├── ProductsPagination.vue (pagination controls)
├── RecentlyViewed.vue (recently viewed section)
└── EditorialStories.vue (editorial content)

composables/
├── useProductFiltering.ts
├── useProductPagination.ts
└── useDiscoveryCollections.ts

config/
└── discoveryCollections.ts
```

**Acceptance Criteria**:
- [ ] Main page file <300 lines
- [ ] Each component <200 lines
- [ ] Logic in composables
- [ ] All components documented
- [ ] Existing functionality preserved
- [ ] Tests updated for new structure

---

### Issue #18: Add product image zoom functionality
**Labels**: `feature`, `high`, `products`, `ux`
**Estimated Effort**: 4 hours
**Assignee**: TBD

**Description**:
Users cannot zoom in on product images to see details, which is especially important for wine labels and product packaging.

**Desired Behavior**:
- **Desktop**: Hover to show zoom overlay
- **Mobile**: Pinch-to-zoom or tap to enter zoom mode
- **Both**: Click image to open full-screen gallery

**Tasks**:
- [ ] Add hover zoom on desktop
- [ ] Add pinch-to-zoom on mobile
- [ ] Add full-screen image gallery
- [ ] Add image navigation in gallery (arrows, keyboard)
- [ ] Add zoom indicator icon
- [ ] Optimize images for zoom (larger resolution)
- [ ] Add loading states for zoom images

**Implementation Example**:
```vue
<template>
  <div
    class="relative overflow-hidden rounded-3xl cursor-zoom-in"
    @mouseenter="showZoom = true"
    @mouseleave="showZoom = false"
    @mousemove="handleMouseMove"
    @click="openFullscreen"
  >
    <!-- Main Image -->
    <img
      :src="selectedImage.url"
      :alt="getLocalizedText(selectedImage.altText)"
      class="w-full h-full object-cover transition-transform"
      :class="{ 'scale-110': showZoom }"
    />

    <!-- Zoom Lens (Desktop) -->
    <div
      v-if="showZoom && !isMobile"
      class="absolute inset-0 pointer-events-none"
      :style="zoomStyle"
    >
      <img
        :src="selectedImage.url"
        class="absolute w-[200%] h-[200%]"
        :style="zoomImageStyle"
      />
    </div>

    <!-- Zoom Indicator -->
    <div class="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
      <Icon name="lucide:zoom-in" class="w-4 h-4 inline mr-1" />
      {{ $t('products.clickToZoom') }}
    </div>
  </div>

  <!-- Full Screen Gallery Modal -->
  <ProductImageGallery
    v-if="showGallery"
    :images="product.images"
    :initial-index="selectedImageIndex"
    @close="showGallery = false"
  />
</template>

<script setup lang="ts">
const showZoom = ref(false)
const showGallery = ref(false)
const zoomPosition = ref({ x: 0, y: 0 })

const handleMouseMove = (e: MouseEvent) => {
  const rect = e.currentTarget.getBoundingClientRect()
  zoomPosition.value = {
    x: ((e.clientX - rect.left) / rect.width) * 100,
    y: ((e.clientY - rect.top) / rect.height) * 100
  }
}

const zoomImageStyle = computed(() => ({
  transform: `translate(-${zoomPosition.value.x}%, -${zoomPosition.value.y}%)`
}))

const openFullscreen = () => {
  showGallery.value = true
}
</script>
```

**Acceptance Criteria**:
- [ ] Desktop hover zoom works smoothly
- [ ] Mobile pinch-to-zoom works
- [ ] Full-screen gallery functional
- [ ] Keyboard navigation in gallery
- [ ] Smooth animations
- [ ] Works on all browsers
- [ ] Performance optimized

---

### Issue #19: Add stock notification feature for out-of-stock products
**Labels**: `feature`, `high`, `products`, `engagement`
**Estimated Effort**: 1 day
**Assignee**: TBD

**Description**:
When products are out of stock, users have no way to be notified when they're back in stock. This loses potential sales.

**Desired Behavior**:
- Show "Notify Me" button when out of stock
- Collect email address
- Send notification when back in stock
- Track notification conversions

**Tasks**:
- [ ] Create stock_notifications database table
- [ ] Create API endpoint to register notification
- [ ] Create API endpoint to send notifications
- [ ] Add "Notify Me" button to product detail page
- [ ] Create notification email template
- [ ] Set up background job to check stock and send emails
- [ ] Add unsubscribe functionality
- [ ] Track notification effectiveness

**Database Schema**:
```sql
CREATE TABLE stock_notifications (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  notified_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  conversion_tracked BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_stock_notifications_product ON stock_notifications(product_id);
CREATE INDEX idx_stock_notifications_pending ON stock_notifications(product_id, notified_at)
  WHERE notified_at IS NULL AND unsubscribed_at IS NULL;
```

**UI Implementation**:
```vue
<template>
  <div v-if="product.stockQuantity === 0" class="mt-4">
    <button
      v-if="!notificationRequested"
      @click="showNotificationModal = true"
      class="w-full rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
    >
      <Icon name="lucide:bell" class="inline mr-2" />
      {{ $t('products.notifyWhenInStock') }}
    </button>

    <div v-else class="text-center text-green-600">
      <Icon name="lucide:check-circle" class="inline mr-2" />
      {{ $t('products.notificationRegistered') }}
    </div>
  </div>

  <!-- Notification Modal -->
  <Modal v-if="showNotificationModal" @close="showNotificationModal = false">
    <h3>{{ $t('products.notifyModal.title') }}</h3>
    <p>{{ $t('products.notifyModal.description') }}</p>
    <form @submit.prevent="registerNotification">
      <input
        v-model="notificationEmail"
        type="email"
        required
        :placeholder="$t('products.notifyModal.emailPlaceholder')"
      />
      <button type="submit">
        {{ $t('products.notifyModal.submit') }}
      </button>
    </form>
  </Modal>
</template>
```

**Background Job** (e.g., runs every hour):
```typescript
// jobs/checkStockNotifications.ts
export async function checkStockNotifications() {
  // Find products that are now in stock
  const productsBackInStock = await db
    .select()
    .from('products')
    .where('stock_quantity', '>', 0)
    .whereIn('id',
      db.select('product_id')
        .from('stock_notifications')
        .whereNull('notified_at')
        .whereNull('unsubscribed_at')
        .distinct()
    )

  for (const product of productsBackInStock) {
    // Get all pending notifications for this product
    const notifications = await db
      .select()
      .from('stock_notifications')
      .where('product_id', product.id)
      .whereNull('notified_at')
      .whereNull('unsubscribed_at')

    // Send emails
    for (const notification of notifications) {
      await sendEmail({
        to: notification.email,
        template: 'stock-notification',
        data: { product }
      })

      // Mark as notified
      await db
        .update('stock_notifications')
        .set({ notified_at: new Date() })
        .where('id', notification.id)
    }
  }
}
```

**Acceptance Criteria**:
- [ ] Users can register for notifications
- [ ] Emails sent when product back in stock
- [ ] Users can unsubscribe
- [ ] Notification conversions tracked
- [ ] GDPR compliant
- [ ] Email validation

---

### Issue #20: Combine duplicate watchers on product detail page
**Labels**: `refactoring`, `high`, `products`, `performance`
**Estimated Effort**: 1 hour
**Assignee**: TBD

**Description**:
Product detail page has two separate watchers on the same `product` value, both with `immediate: true`. This is inefficient and can be consolidated.

**Current Code** (`pages/products/[slug].vue`):

**Watcher 1** (lines 663-674):
```typescript
watch(product, newProduct => {
  if (newProduct) {
    selectedImageIndex.value = 0
    if ((newProduct.stockQuantity || 0) < selectedQuantity.value) {
      selectedQuantity.value = Math.max(1, newProduct.stockQuantity || 1)
    }
    recentlyViewedProducts.value = [
      newProduct,
      ...recentlyViewedProducts.value.filter(item => item.id !== newProduct.id)
    ].slice(0, 8)
  }
}, { immediate: true })
```

**Watcher 2** (lines 676-712):
```typescript
watch(product, newProduct => {
  if (newProduct) {
    useHead({
      title: `${getLocalizedText(newProduct.name)} - Moldova Direct`,
      meta: [ /* ... */ ]
    })
  }
}, { immediate: true })
```

**Problems**:
- Both watchers run on every product change
- Duplicate `if (newProduct)` checks
- Less maintainable
- Slightly worse performance

**Tasks**:
- [ ] Combine into single watcher
- [ ] Ensure all side effects still execute
- [ ] Test that SEO tags still update
- [ ] Test that recently viewed still works

**Proposed Implementation**:
```typescript
watch(product, (newProduct) => {
  if (!newProduct) return

  // Reset image selection
  selectedImageIndex.value = 0

  // Adjust quantity if needed
  if ((newProduct.stockQuantity || 0) < selectedQuantity.value) {
    selectedQuantity.value = Math.max(1, newProduct.stockQuantity || 1)
  }

  // Add to recently viewed
  const recentlyViewed = useRecentlyViewed()
  recentlyViewed.addToRecentlyViewed(newProduct)

  // Update SEO meta tags
  useHead({
    title: `${getLocalizedText(newProduct.name)} - Moldova Direct`,
    meta: [
      {
        name: 'description',
        content: getLocalizedText(newProduct.metaDescription) ||
                 getLocalizedText(newProduct.shortDescription) ||
                 getLocalizedText(newProduct.description) ||
                 `${getLocalizedText(newProduct.name)} - Authentic Moldovan product`
      },
      {
        property: 'og:title',
        content: getLocalizedText(newProduct.name)
      },
      {
        property: 'og:description',
        content: getLocalizedText(newProduct.shortDescription) || getLocalizedText(newProduct.description)
      },
      {
        property: 'og:image',
        content: newProduct.images?.[0]?.url
      },
      {
        property: 'og:type',
        content: 'product'
      },
      {
        property: 'product:price:amount',
        content: newProduct.price
      },
      {
        property: 'product:price:currency',
        content: 'EUR'
      }
    ]
  })
}, { immediate: true })
```

**Acceptance Criteria**:
- [ ] Single watcher instead of two
- [ ] All functionality preserved
- [ ] Tests pass
- [ ] Code more maintainable

---

## 🟡 MEDIUM PRIORITY (Week 3-4)

### Issue #21: Add breadcrumb structured data for SEO
**Labels**: `seo`, `medium`, `products`
**Estimated Effort**: 2 hours
**Assignee**: TBD

**Description**:
Breadcrumb navigation exists but has no structured data markup, missing out on breadcrumb rich snippets in search results.

**Current Implementation** (`pages/products/[slug].vue:38-56`):
```vue
<nav class="flex flex-wrap items-center text-sm text-gray-500">
  <!-- Breadcrumb items -->
</nav>
```

**Tasks**:
- [ ] Add ARIA label to breadcrumb nav
- [ ] Add BreadcrumbList structured data
- [ ] Test with Google Rich Results Test
- [ ] Ensure works with dynamic categories

**Implementation**:
```vue
<script setup lang="ts">
const breadcrumbStructuredData = computed(() => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://moldovadirect.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Products",
      "item": "https://moldovadirect.com/products"
    },
    ...(product.value?.category?.breadcrumb?.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 3,
      "name": crumb.name,
      "item": `https://moldovadirect.com/products?category=${crumb.slug}`
    })) || []),
    {
      "@type": "ListItem",
      "position": (product.value?.category?.breadcrumb?.length || 0) + 3,
      "name": getLocalizedText(product.value?.name),
      "item": `https://moldovadirect.com/products/${product.value?.slug}`
    }
  ]
}))
</script>

<template>
  <nav aria-label="Breadcrumb" class="flex flex-wrap items-center text-sm text-gray-500">
    <!-- existing breadcrumb markup -->
  </nav>

  <script type="application/ld+json" v-html="JSON.stringify(breadcrumbStructuredData)" />
</template>
```

**Acceptance Criteria**:
- [ ] Breadcrumb structured data validates
- [ ] Rich snippets appear in search
- [ ] ARIA label present
- [ ] Works with all product categories

---

### Issue #22: Fix v-if inside v-for anti-pattern in pagination
**Labels**: `code-quality`, `medium`, `products`, `vue`
**Estimated Effort**: 1 hour
**Assignee**: TBD

**Description**:
The pagination component uses `v-if` inside `v-for`, which is a Vue anti-pattern that can cause performance issues and bugs.

**Current Code** (`pages/products/index.vue:240-249`):
```vue
<button
  v-for="page in visiblePages"
  :key="`page-${page}`"
  v-if="page !== '...'"  <!-- ❌ Anti-pattern -->
  @click="goToPage(page as number)"
>
  {{ page }}
</button>
<span v-else>…</span>
```

**Problems**:
- Vue evaluates v-for before v-if
- Creates unnecessary virtual DOM nodes
- Harder to maintain
- Can cause key conflicts

**Tasks**:
- [ ] Create computed property to filter pages first
- [ ] Remove v-if from template
- [ ] Test pagination still works
- [ ] Verify ellipsis still shows

**Proposed Implementation**:
```vue
<script setup lang="ts">
const paginationItems = computed(() => {
  return visiblePages.value.map((page, index) => ({
    key: `page-${index}`,
    value: page,
    isEllipsis: page === '...',
    isActive: page === pagination.value.page
  }))
})
</script>

<template>
  <nav class="flex items-center justify-center gap-2">
    <button
      v-for="item in paginationItems"
      :key="item.key"
      v-if="!item.isEllipsis"
      class="rounded-full px-4 py-2 text-sm font-semibold transition"
      :class="item.isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'"
      @click="goToPage(item.value as number)"
    >
      {{ item.value }}
    </button>
    <span v-else :key="item.key" class="px-3 py-2 text-sm text-gray-500">…</span>
  </nav>
</template>
```

**Alternative (cleaner)**:
```vue
<template>
  <nav class="flex items-center justify-center gap-2">
    <template v-for="(page, index) in visiblePages" :key="`page-${index}`">
      <button
        v-if="page !== '...'"
        class="rounded-full px-4 py-2 text-sm font-semibold transition"
        :class="page === pagination.page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'"
        @click="goToPage(page as number)"
      >
        {{ page }}
      </button>
      <span v-else class="px-3 py-2 text-sm text-gray-500">…</span>
    </template>
  </nav>
</template>
```

**Acceptance Criteria**:
- [ ] No v-if inside v-for
- [ ] Pagination works correctly
- [ ] Ellipsis displays properly
- [ ] No Vue warnings

---

### Issue #23: Add loading states for related products
**Labels**: `ux`, `medium`, `products`
**Estimated Effort**: 2 hours
**Assignee**: TBD

**Description**:
Related products section has no loading state, causing a jarring experience when they pop in after the main product loads.

**Current Behavior**:
1. Page loads with main product
2. Related products appear suddenly 200-500ms later
3. Page jumps/shifts

**Tasks**:
- [ ] Add skeleton loading for related products
- [ ] Prevent layout shift
- [ ] Add error state if related products fail
- [ ] Add empty state if no related products

**Implementation**:
```vue
<template>
  <section v-if="relatedProducts.length || relatedProductsLoading" class="space-y-6">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {{ $t('products.related.title') }}
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t('products.related.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="relatedProductsLoading"
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div
        v-for="n in 4"
        :key="`skeleton-${n}`"
        class="animate-pulse rounded-2xl border border-gray-200 bg-white p-4"
      >
        <div class="mb-4 aspect-square rounded-xl bg-gray-200"></div>
        <div class="mb-2 h-4 rounded bg-gray-200"></div>
        <div class="h-3 w-2/3 rounded bg-gray-200"></div>
      </div>
    </div>

    <!-- Related Products -->
    <div
      v-else-if="relatedProducts.length"
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <ProductCard
        v-for="related in relatedProducts"
        :key="`related-${related.id}`"
        :product="related"
      />
    </div>

    <!-- Error State -->
    <div v-else-if="relatedProductsError" class="text-center py-8">
      <p class="text-gray-600">{{ $t('products.related.error') }}</p>
      <button @click="retryRelatedProducts" class="mt-4 text-blue-600 hover:text-blue-700">
        {{ $t('common.retry') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
const relatedProductsLoading = ref(false)
const relatedProductsError = ref(false)

const loadRelatedProducts = async () => {
  relatedProductsLoading.value = true
  relatedProductsError.value = false

  try {
    // Load related products
    await fetchRelatedProducts(product.value.id)
  } catch (err) {
    relatedProductsError.value = true
  } finally {
    relatedProductsLoading.value = false
  }
}

const retryRelatedProducts = () => {
  loadRelatedProducts()
}
</script>
```

**Acceptance Criteria**:
- [ ] Skeleton loading shows while fetching
- [ ] No layout shift when products load
- [ ] Error state shows if fetch fails
- [ ] Retry button works
- [ ] Smooth transition when loaded

---

### Issue #24: Add analytics tracking for product interactions
**Labels**: `analytics`, `medium`, `products`, `tracking`
**Estimated Effort**: 4 hours
**Assignee**: TBD

**Description**:
No analytics tracking for important product interactions, making it impossible to measure engagement and optimize the experience.

**Events to Track**:
1. Product viewed
2. Product searched
3. Filter applied
4. Product added to cart
5. Product shared
6. Image viewed
7. Related product clicked
8. Wishlist toggled
9. Review read
10. FAQ opened

**Tasks**:
- [ ] Set up analytics composable
- [ ] Add tracking to all product interactions
- [ ] Set up Google Analytics 4 events
- [ ] Set up custom events for analytics platform
- [ ] Add user properties (returning visitor, etc.)
- [ ] Create analytics dashboard
- [ ] Document tracked events

**Implementation**:
```typescript
// composables/useAnalytics.ts
export const useAnalytics = () => {
  const track = (eventName: string, properties?: Record<string, any>) => {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', eventName, properties)
    }

    // Custom analytics
    if (window.analytics) {
      window.analytics.track(eventName, properties)
    }

    // Server-side tracking for important events
    if (['product_purchased', 'product_added_to_cart'].includes(eventName)) {
      $fetch('/api/analytics/track', {
        method: 'POST',
        body: { event: eventName, properties }
      })
    }
  }

  return { track }
}
```

**Usage in Product Pages**:
```typescript
// pages/products/[slug].vue
const analytics = useAnalytics()

// Track product view
watch(product, (newProduct) => {
  if (newProduct) {
    analytics.track('product_viewed', {
      product_id: newProduct.id,
      product_name: getLocalizedText(newProduct.name),
      product_price: newProduct.price,
      product_category: newProduct.category?.slug,
      currency: 'EUR'
    })
  }
}, { immediate: true })

// Track add to cart
const addToCart = async () => {
  try {
    await addItem({ /* ... */ })

    analytics.track('product_added_to_cart', {
      product_id: product.value.id,
      product_name: getLocalizedText(product.value.name),
      product_price: product.value.price,
      quantity: selectedQuantity.value,
      currency: 'EUR'
    })
  } catch (err) {
    // ...
  }
}

// Track share
const shareProduct = async () => {
  try {
    await navigator.share(/* ... */)

    analytics.track('product_shared', {
      product_id: product.value.id,
      product_name: getLocalizedText(product.value.name),
      share_method: 'native_share'
    })
  } catch (err) {
    // ...
  }
}
```

**Acceptance Criteria**:
- [ ] All key interactions tracked
- [ ] Events appear in analytics dashboard
- [ ] User properties set correctly
- [ ] GDPR compliant (consent checked)
- [ ] Documentation for all events

---

### Issue #25: Add keyboard navigation to product image gallery
**Labels**: `accessibility`, `medium`, `products`, `a11y`
**Estimated Effort**: 3 hours
**Assignee**: TBD

**Description**:
Product image gallery on detail page can only be navigated with mouse clicks. Keyboard users cannot navigate between images.

**Current Implementation** (`pages/products/[slug].vue:88-99`):
```vue
<button
  v-for="(image, index) in product.images"
  :key="image.id || index"
  type="button"
  @click="selectedImageIndex = index"
>
  <!-- Image thumbnail -->
</button>
```

**Desired Keyboard Controls**:
- Arrow Up/Down: Navigate thumbnails
- Arrow Left/Right: Navigate thumbnails (alternative)
- Enter/Space: Select thumbnail
- Escape: Close full-screen (if implemented)
- Tab: Move focus through thumbnails

**Tasks**:
- [ ] Add keyboard event listeners
- [ ] Add focus management
- [ ] Add visual focus indicators
- [ ] Add ARIA labels
- [ ] Add keyboard shortcut hints
- [ ] Test with keyboard only
- [ ] Test with screen reader

**Implementation**:
```vue
<script setup lang="ts">
const galleryRef = ref<HTMLElement>()

const handleKeyDown = (event: KeyboardEvent) => {
  const currentIndex = selectedImageIndex.value
  const totalImages = product.value?.images?.length || 0

  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      event.preventDefault()
      selectedImageIndex.value = (currentIndex + 1) % totalImages
      break

    case 'ArrowUp':
    case 'ArrowLeft':
      event.preventDefault()
      selectedImageIndex.value = currentIndex === 0 ? totalImages - 1 : currentIndex - 1
      break

    case 'Home':
      event.preventDefault()
      selectedImageIndex.value = 0
      break

    case 'End':
      event.preventDefault()
      selectedImageIndex.value = totalImages - 1
      break
  }

  // Focus the selected thumbnail
  nextTick(() => {
    const thumbnails = galleryRef.value?.querySelectorAll('button')
    thumbnails?.[selectedImageIndex.value]?.focus()
  })
}

onMounted(() => {
  galleryRef.value?.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  galleryRef.value?.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div ref="galleryRef" class="space-y-3" role="group" aria-label="Product images">
    <button
      v-for="(image, index) in product.images"
      :key="image.id || index"
      type="button"
      :aria-label="`View ${getLocalizedText(image.altText)} - Image ${index + 1} of ${product.images.length}`"
      :aria-pressed="selectedImageIndex === index"
      class="flex items-center gap-3 rounded-2xl border px-3 py-2 transition focus:ring-2 focus:ring-blue-500 focus:outline-none"
      :class="selectedImageIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
      @click="selectedImageIndex = index"
    >
      <img :src="image.url" :alt="getLocalizedText(image.altText)" class="h-14 w-14 rounded-xl object-cover" />
      <span class="text-sm font-medium">
        {{ getLocalizedText(image.altText) || `Image ${index + 1}` }}
      </span>
    </button>

    <!-- Keyboard hints -->
    <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">
      {{ $t('products.gallery.keyboardHints') }}
    </div>
  </div>
</template>
```

**Acceptance Criteria**:
- [ ] Arrow keys navigate gallery
- [ ] Focus visible on selected thumbnail
- [ ] ARIA labels present
- [ ] Works with screen readers
- [ ] Keyboard hints displayed
- [ ] Passes keyboard-only test

---

### Issue #26: Extract discovery collections to configuration file
**Labels**: `refactoring`, `medium`, `products`, `maintainability`
**Estimated Effort**: 1 hour
**Assignee**: TBD

**Description**:
Discovery collections are hard-coded in the component, making them hard to manage and update.

**Current Implementation** (`pages/products/index.vue:629-665`):
```typescript
const discoveryCollections = computed(() => {
  return [
    {
      id: 'featured',
      label: t('products.discovery.collections.celebration'),
      filters: { featured: true, sort: 'featured' }
    },
    // ... more collections
  ]
})
```

**Problems**:
- Hard to add/remove collections
- Can't A/B test different collections
- Can't customize per user segment
- Can't manage from CMS

**Tasks**:
- [ ] Create config file for collections
- [ ] Move collections to config
- [ ] Add TypeScript types
- [ ] Support dynamic collections (from CMS)
- [ ] Add analytics for collection clicks
- [ ] Document collection structure

**Proposed Structure**:
```typescript
// config/discoveryCollections.ts
import type { ProductFilters } from '~/types'

export interface DiscoveryCollection {
  id: string
  labelKey: string  // i18n key
  descriptionKey?: string
  icon?: string
  filters: Partial<ProductFilters>
  color?: string
  badge?: string
}

export const discoveryCollections: DiscoveryCollection[] = [
  {
    id: 'featured',
    labelKey: 'products.discovery.collections.celebration',
    descriptionKey: 'products.discovery.collections.celebrationDesc',
    icon: 'lucide:star',
    color: 'yellow',
    filters: {
      featured: true,
      sort: 'featured'
    }
  },
  {
    id: 'weekday',
    labelKey: 'products.discovery.collections.weeknight',
    icon: 'lucide:calendar',
    color: 'blue',
    filters: {
      priceMax: 25,
      sort: 'price_asc'
    }
  },
  {
    id: 'gifts',
    labelKey: 'products.discovery.collections.gift',
    icon: 'lucide:gift',
    color: 'red',
    badge: 'Popular',
    filters: {
      priceMin: 25,
      priceMax: 60,
      sort: 'created'
    }
  },
  {
    id: 'cellar',
    labelKey: 'products.discovery.collections.cellar',
    icon: 'lucide:archive',
    color: 'purple',
    filters: {
      sort: 'created',
      inStock: true
    }
  }
]

// For dynamic collections from CMS
export async function getDiscoveryCollections(): Promise<DiscoveryCollection[]> {
  try {
    const { data } = await $fetch('/api/collections/discovery')
    return data || discoveryCollections
  } catch {
    return discoveryCollections
  }
}
```

**Usage**:
```vue
<script setup lang="ts">
import { discoveryCollections } from '~/config/discoveryCollections'

const collections = computed(() =>
  discoveryCollections.map(col => ({
    ...col,
    label: t(col.labelKey),
    description: col.descriptionKey ? t(col.descriptionKey) : undefined
  }))
)
</script>
```

**Acceptance Criteria**:
- [ ] Collections in separate config file
- [ ] Easy to add/remove collections
- [ ] TypeScript types defined
- [ ] Existing functionality preserved
- [ ] Documentation updated

---

### Issue #27: Add JSDoc comments to complex functions
**Labels**: `documentation`, `medium`, `products`, `maintainability`
**Estimated Effort**: 4 hours
**Assignee**: TBD

**Description**:
Complex functions lack documentation, making the codebase harder to understand and maintain.

**Functions Needing Documentation**:

1. **visiblePages** (`pages/products/index.vue:428-461`)
2. **findCategoryName** (`pages/products/index.vue:721-738`)
3. **removeActiveChip** (`pages/products/index.vue:784-819`)
4. **refreshPriceRange** (`pages/products/index.vue:895-909`)
5. **transformProduct** (if exists in type guards)
6. **buildTree** (`composables/useProductCatalog.ts:189-197`)

**Tasks**:
- [ ] Add JSDoc comments to all public functions
- [ ] Document parameters
- [ ] Document return values
- [ ] Add examples where helpful
- [ ] Document edge cases
- [ ] Add @throws documentation for error cases

**Example Documentation**:
```typescript
/**
 * Generates a list of visible page numbers for pagination with ellipsis
 *
 * Shows first page, last page, current page, and pages around current.
 * Uses ellipsis (...) when there are gaps in the sequence.
 *
 * @example
 * // With 10 total pages, current page 5
 * visiblePages() // [1, '...', 4, 5, 6, '...', 10]
 *
 * @example
 * // With 5 total pages, current page 3
 * visiblePages() // [1, 2, 3, 4, 5]
 *
 * @returns Array of page numbers (number) and ellipsis markers (string '...')
 */
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = pagination.value.totalPages
  const current = pagination.value.page

  if (total <= 7) {
    // Show all pages if total is 7 or less
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Complex pagination with ellipsis
    pages.push(1)

    if (current > 4) {
      pages.push('...')
    }

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < total - 3) {
      pages.push('...')
    }

    if (total > 1) {
      pages.push(total)
    }
  }

  return pages
})

/**
 * Finds a category name by slug or ID from the categories tree
 *
 * Recursively searches through the category tree to find a matching
 * category and returns its localized name.
 *
 * @param slugOrId - Category slug (string) or ID (number)
 * @returns Localized category name, or empty string if not found
 *
 * @example
 * findCategoryName('wine') // 'Wine'
 * findCategoryName(123) // 'Beverages'
 * findCategoryName('invalid') // ''
 */
const findCategoryName = (slugOrId: string | number | undefined): string => {
  if (!slugOrId) return ''

  /**
   * Internal recursive function to search category tree
   * @param nodes - Array of category nodes to search
   * @returns Category name if found, undefined otherwise
   */
  const findInTree = (nodes: any[]): string | undefined => {
    for (const node of nodes) {
      if (node.slug === slugOrId || node.id === slugOrId) {
        return node.name?.[locale.value] || node.name?.es || Object.values(node.name || {})[0]
      }
      if (node.children?.length) {
        const child = findInTree(node.children)
        if (child) return child
      }
    }
    return undefined
  }

  return findInTree(categoriesTree.value || []) || ''
}

/**
 * Removes a filter chip and updates the product listing
 *
 * Handles different chip types (category, price, stock, etc.) and
 * removes the corresponding filter from the active filters object.
 * Special handling for attribute filters which can have multiple values.
 *
 * @param chip - The filter chip to remove
 * @param chip.type - Type of filter (category, priceMin, priceMax, inStock, featured, attribute)
 * @param chip.attributeKey - For attribute filters: the attribute key
 * @param chip.attributeValue - For attribute filters: the specific value to remove
 *
 * @example
 * // Remove category filter
 * removeActiveChip({ type: 'category' })
 *
 * @example
 * // Remove specific attribute value
 * removeActiveChip({
 *   type: 'attribute',
 *   attributeKey: 'color',
 *   attributeValue: 'red'
 * })
 */
const removeActiveChip = (chip: {
  type: string
  attributeKey?: string
  attributeValue?: string
}) => {
  const nextFilters: ProductFilters = { ...filters.value }

  switch (chip.type) {
    case 'category':
      delete nextFilters.category
      break

    case 'priceMin':
      delete nextFilters.priceMin
      break

    case 'priceMax':
      delete nextFilters.priceMax
      break

    case 'inStock':
      delete nextFilters.inStock
      break

    case 'featured':
      delete nextFilters.featured
      break

    case 'attribute':
      if (chip.attributeKey && chip.attributeValue && nextFilters.attributes?.[chip.attributeKey]) {
        // Remove only the specific value
        const filtered = nextFilters.attributes[chip.attributeKey].filter(
          value => value !== chip.attributeValue
        )

        if (filtered.length) {
          nextFilters.attributes![chip.attributeKey] = filtered
        } else {
          // Remove the entire attribute key if no values left
          delete nextFilters.attributes![chip.attributeKey]
        }

        // Clean up empty attributes object
        if (Object.keys(nextFilters.attributes || {}).length === 0) {
          delete nextFilters.attributes
        }
      }
      break
  }

  // Fetch products with updated filters
  fetchProducts({ ...nextFilters, page: 1, sort: sortBy.value as any })
}
```

**Acceptance Criteria**:
- [ ] All complex functions documented
- [ ] JSDoc comments follow standard format
- [ ] Examples provided where helpful
- [ ] IDE autocomplete shows documentation
- [ ] Documentation is accurate and helpful

---

### Issue #28: Add canonical URLs for SEO
**Labels**: `seo`, `medium`, `products`
**Estimated Effort**: 2 hours
**Assignee**: TBD

**Description**:
Product pages lack canonical URLs, which can cause duplicate content issues when products are accessible via multiple URLs (different filters, UTM parameters, etc.).

**Problem**:
```
Same product accessible via:
/products/wine-123
/products/wine-123?ref=facebook
/products/wine-123?utm_source=email
/products/wine-123?category=wine

Google sees these as different pages -> duplicate content penalty
```

**Tasks**:
- [ ] Add canonical link to product detail page
- [ ] Add canonical link to products listing page
- [ ] Strip query parameters from canonical URL
- [ ] Handle pagination in canonical URLs
- [ ] Test with Google Search Console

**Implementation**:
```vue
<!-- pages/products/[slug].vue -->
<script setup lang="ts">
const route = useRoute()
const canonicalUrl = computed(() => {
  const baseUrl = 'https://moldovadirect.com'
  return `${baseUrl}${route.path}`
})

watch(product, (newProduct) => {
  if (newProduct) {
    useHead({
      title: `${getLocalizedText(newProduct.name)} - Moldova Direct`,
      link: [
        {
          rel: 'canonical',
          href: canonicalUrl.value
        }
      ],
      meta: [
        // ... existing meta tags
      ]
    })
  }
}, { immediate: true })
</script>
```

```vue
<!-- pages/products/index.vue -->
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const canonicalUrl = computed(() => {
  const baseUrl = 'https://moldovadirect.com'
  const path = '/products'

  // Include important query params in canonical
  const query = new URLSearchParams()

  if (filters.value.category) {
    query.set('category', filters.value.category.toString())
  }

  if (pagination.value.page > 1) {
    query.set('page', pagination.value.page.toString())
  }

  const queryString = query.toString()
  return queryString ? `${baseUrl}${path}?${queryString}` : `${baseUrl}${path}`
})

useHead({
  title: 'Shop - Moldova Direct',
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl
    }
  ],
  meta: [
    // ... existing meta tags
  ]
})
</script>
```

**Acceptance Criteria**:
- [ ] Canonical URLs present on all product pages
- [ ] Query parameters stripped appropriately
- [ ] Important filters preserved in canonical
- [ ] Validates in Google Search Console
- [ ] No duplicate content warnings

---

### Issue #29: Add product quick view modal
**Labels**: `feature`, `medium`, `products`, `ux`
**Estimated Effort**: 1 day
**Assignee**: TBD

**Description**:
Users must navigate to the full product page to see basic details. A quick view modal would allow faster browsing and comparison.

**Desired Behavior**:
- Click "Quick View" button on product card
- Modal opens with product summary
- Shows image, price, description, add to cart
- Link to full product page for more details

**Tasks**:
- [ ] Create ProductQuickView component
- [ ] Add "Quick View" button to product card
- [ ] Implement modal functionality
- [ ] Add keyboard navigation (Escape to close)
- [ ] Add analytics tracking
- [ ] Make accessible
- [ ] Add loading state

**Implementation**:
```vue
<!-- components/product/QuickView.vue -->
<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="close"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close" />

      <!-- Modal -->
      <div
        class="relative z-10 w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        :aria-label="`Quick view: ${getLocalizedText(product.name)}`"
      >
        <!-- Close Button -->
        <button
          type="button"
          class="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          @click="close"
          aria-label="Close quick view"
        >
          <Icon name="lucide:x" class="w-6 h-6" />
        </button>

        <div class="grid gap-8 p-8 md:grid-cols-2">
          <!-- Left: Image -->
          <div>
            <img
              :src="product.images?.[0]?.url || '/placeholder-product.svg'"
              :alt="getLocalizedText(product.name)"
              class="w-full rounded-xl"
            />
          </div>

          <!-- Right: Details -->
          <div class="space-y-6">
            <!-- Category -->
            <div class="text-sm font-medium text-blue-600 dark:text-blue-400">
              {{ getLocalizedText(product.category?.name) }}
            </div>

            <!-- Title -->
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ getLocalizedText(product.name) }}
            </h2>

            <!-- Price -->
            <div class="flex items-center gap-3">
              <span class="text-3xl font-bold text-gray-900 dark:text-white">
                €{{ formatPrice(product.price) }}
              </span>
              <span
                v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)"
                class="text-lg text-gray-500 line-through"
              >
                €{{ formatPrice(product.comparePrice) }}
              </span>
            </div>

            <!-- Description -->
            <p class="text-gray-600 dark:text-gray-400">
              {{ getLocalizedText(product.shortDescription) }}
            </p>

            <!-- Stock Status -->
            <div>
              <span
                class="inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-medium"
                :class="stockStatusClass"
              >
                <span class="inline-block h-2 w-2 rounded-full bg-current"></span>
                {{ stockStatusText }}
              </span>
            </div>

            <!-- Quantity Selector -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-900 dark:text-white">
                {{ $t('common.quantity') }}
              </label>
              <select
                v-model="quantity"
                :disabled="product.stockQuantity <= 0"
                class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium"
              >
                <option v-for="n in Math.min(10, product.stockQuantity)" :key="n" :value="n">
                  {{ n }}
                </option>
              </select>
            </div>

            <!-- Actions -->
            <div class="space-y-3">
              <Button
                :disabled="product.stockQuantity <= 0 || loading"
                class="w-full"
                @click="handleAddToCart"
              >
                <Icon v-if="!loading" name="lucide:shopping-cart" class="mr-2" />
                <Icon v-else name="lucide:loader-2" class="mr-2 animate-spin" />
                {{ loading ? $t('products.adding') : $t('products.addToCart') }}
              </Button>

              <nuxt-link
                :to="`/products/${product.slug}`"
                class="block w-full rounded-xl border border-gray-300 px-6 py-3 text-center font-medium hover:border-blue-500 hover:text-blue-600"
              >
                {{ $t('products.viewFullDetails') }}
              </nuxt-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ProductWithRelations } from '~/types'

interface Props {
  modelValue: boolean
  product: ProductWithRelations
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { locale, t } = useI18n()
const { addItem, loading } = useCart()
const analytics = useAnalytics()

const quantity = ref(1)

const close = () => {
  emit('update:modelValue', false)
}

const handleAddToCart = async () => {
  try {
    await addItem({
      productId: props.product.id,
      quantity: quantity.value
    })

    analytics.track('product_added_from_quick_view', {
      product_id: props.product.id,
      quantity: quantity.value
    })

    // Close modal on success
    close()
  } catch (err) {
    console.error('Failed to add to cart', err)
  }
}

// Keyboard handling
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    close()
  }
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    analytics.track('product_quick_view_opened', {
      product_id: props.product.id
    })
  } else {
    document.removeEventListener('keydown', handleKeyDown)
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})

const getLocalizedText = (text: Record<string, string> | null | undefined) => {
  if (!text) return ''
  return text[locale.value] || text.es || Object.values(text)[0] || ''
}

const formatPrice = (price: string | number) => {
  return Number(price).toFixed(2)
}

const stockStatusClass = computed(() => {
  const stock = props.product.stockQuantity
  if (stock > 10) return 'bg-green-100 text-green-800'
  if (stock > 0) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
})

const stockStatusText = computed(() => {
  const stock = props.product.stockQuantity
  if (stock > 10) return t('products.stockStatus.inStock')
  if (stock > 0) return t('products.stockStatus.onlyLeft', { count: stock })
  return t('products.stockStatus.outOfStock')
})
</script>
```

**Usage in Product Card**:
```vue
<!-- components/product/Card.vue -->
<template>
  <div class="relative">
    <!-- Existing card content -->

    <!-- Quick View Button -->
    <button
      type="button"
      class="absolute top-2 right-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
      @click.prevent="showQuickView = true"
      :aria-label="`Quick view ${getLocalizedText(product.name)}`"
    >
      <Icon name="lucide:eye" class="w-5 h-5" />
    </button>

    <!-- Quick View Modal -->
    <ProductQuickView
      v-model="showQuickView"
      :product="product"
    />
  </div>
</template>

<script setup lang="ts">
const showQuickView = ref(false)
</script>
```

**Acceptance Criteria**:
- [ ] Quick view button appears on hover
- [ ] Modal opens smoothly
- [ ] All key info displayed
- [ ] Add to cart works from modal
- [ ] Escape key closes modal
- [ ] Click outside closes modal
- [ ] Accessible with keyboard
- [ ] Analytics tracked

---

### Issue #30: Add product comparison feature
**Labels**: `feature`, `medium`, `products`, `ux`
**Estimated Effort**: 2 days
**Assignee**: TBD

**Description**:
Users cannot easily compare multiple products side-by-side to make purchase decisions.

**Desired Behavior**:
- Checkbox on product cards to add to comparison
- Floating "Compare" button shows count
- Compare page shows products side-by-side
- Highlight differences
- Easy add to cart from comparison

**Tasks**:
- [ ] Create comparison store
- [ ] Add compare checkbox to product cards
- [ ] Create floating compare button
- [ ] Create comparison page/modal
- [ ] Highlight differences
- [ ] Add print/export functionality
- [ ] Persist comparison across sessions
- [ ] Add analytics tracking

**Implementation** (abbreviated):
```typescript
// stores/comparison.ts
export const useComparisonStore = defineStore('comparison', {
  state: () => ({
    products: [] as ProductWithRelations[],
    maxProducts: 4
  }),

  getters: {
    count: (state) => state.products.length,
    isFull: (state) => state.products.length >= state.maxProducts,
    isComparing: (state) => (productId: number) =>
      state.products.some(p => p.id === productId)
  },

  actions: {
    add(product: ProductWithRelations) {
      if (this.isFull) {
        throw new Error('Maximum products reached')
      }
      if (!this.isComparing(product.id)) {
        this.products.push(product)
        this.saveToStorage()
      }
    },

    remove(productId: number) {
      this.products = this.products.filter(p => p.id !== productId)
      this.saveToStorage()
    },

    clear() {
      this.products = []
      this.saveToStorage()
    },

    saveToStorage() {
      if (process.client) {
        localStorage.setItem('comparison', JSON.stringify(this.products.map(p => p.id)))
      }
    }
  }
})
```

**Acceptance Criteria**:
- [ ] Up to 4 products can be compared
- [ ] Comparison persists across sessions
- [ ] Differences highlighted
- [ ] Works on mobile
- [ ] Analytics tracked

---

## 🟢 LOW PRIORITY (Future Sprints)

### Issue #31: Add 360° product view for bottles
**Labels**: `feature`, `low`, `products`, `enhancement`
**Estimated Effort**: 2 days
**Assignee**: TBD

**Description**:
For wine bottles and packaged products, a 360° view would help customers see labels and packaging from all angles.

**Requirements**:
- Upload multiple images (24-36 frames)
- Interactive rotation (drag or auto-rotate)
- Mobile-optimized
- Loading optimization

**Estimated Value**: Medium - would differentiate from competitors

---

### Issue #32: Add virtual sommelier AI for wine pairing suggestions
**Labels**: `feature`, `low`, `products`, `ai`, `enhancement`
**Estimated Effort**: 3 days
**Assignee**: TBD

**Description**:
AI-powered sommelier that suggests food pairings based on product attributes and user preferences.

**Requirements**:
- Integration with OpenAI or similar
- Product attribute analysis
- User meal input
- Pairing explanations

**Estimated Value**: Medium-High - unique feature

---

### Issue #33: Add product video support
**Labels**: `feature`, `low`, `products`, `enhancement`
**Estimated Effort**: 1 day
**Assignee**: TBD

**Description**:
Support video in product gallery for producer stories, tastings, or how-to content.

**Requirements**:
- Video upload to S3/CDN
- Video player component
- Thumbnails
- Autoplay controls

---

### Issue #34: Add shipping cost calculator
**Labels**: `feature`, `low`, `products`, `checkout`
**Estimated Effort**: 1.5 days
**Assignee**: TBD

**Description**:
Allow users to see shipping costs based on postal code before adding to cart.

**Requirements**:
- Postal code input
- Shipping API integration
- Estimated delivery date
- Multiple shipping options

---

### Issue #35: Add gift wrapping option
**Labels**: `feature`, `low`, `products`, `checkout`
**Estimated Effort**: 1 day
**Assignee**: TBD

**Description**:
Option to add gift wrapping with custom message.

**Requirements**:
- Gift wrapping checkbox
- Gift message input
- Additional cost
- Gift receipt option

---

### Issue #36: Add delivery date picker
**Labels**: `feature`, `low`, `products`, `checkout`
**Estimated Effort**: 1.5 days
**Assignee**: TBD

**Description**:
Let customers choose preferred delivery date.

**Requirements**:
- Calendar picker
- Available dates calculation
- Integration with logistics
- Price adjustments for express

---

### Issue #37: Add customer questions section
**Labels**: `feature`, `low`, `products`, `community`
**Estimated Effort**: 2 days
**Assignee**: TBD

**Description**:
Allow customers to ask questions about products, with answers from staff or community.

**Requirements**:
- Question submission
- Answer moderation
- Voting on helpful answers
- Email notifications

---

### Issue #38: Add customer photos section
**Labels**: `feature`, `low`, `products`, `social-proof`
**Estimated Effort**: 1.5 days
**Assignee**: TBD

**Description**:
Display customer-uploaded photos of products.

**Requirements**:
- Photo upload
- Moderation queue
- Gallery display
- Photo voting

---

### Issue #39: Add size/serving guide calculator
**Labels**: `feature`, `low`, `products`, `tools`
**Estimated Effort**: 1 day
**Assignee**: TBD

**Description**:
Help customers determine how much to order based on number of guests, occasion, etc.

**Requirements**:
- Guest count input
- Occasion selection
- Serving calculations
- Recommendations

---

### Issue #40: Improve meta descriptions with dynamic content
**Labels**: `seo`, `low`, `products`
**Estimated Effort**: 2 hours
**Assignee**: TBD

**Description**:
Meta descriptions are currently static or too generic. Make them more dynamic and compelling.

**Current**:
```
"Browse authentic Moldovan food and wine products"
```

**Desired**:
```
"Buy [Product Name] - €[Price]. [Short Description]. ⭐[Rating] ([Reviews] reviews). Free shipping over €50."
```

---

### Issue #41: Add product review schema for rich snippets
**Labels**: `seo`, `low`, `products`
**Estimated Effort**: 2 hours
**Assignee**: TBD

**Description**:
Add AggregateRating schema to show star ratings in search results.

**Requirements**:
- Schema.org AggregateRating
- Google Rich Results validation
- Works with existing review data

---

### Issue #42: Add sitemap generation for products
**Labels**: `seo`, `low`, `products`
**Estimated Effort**: 3 hours
**Assignee**: TBD

**Description**:
Generate dynamic sitemap.xml with all product pages.

**Requirements**:
- Automated generation
- Update frequency metadata
- Priority levels
- Image sitemap

---

### Issue #43: Add product price history tracking
**Labels**: `feature`, `low`, `products`, `analytics`
**Estimated Effort**: 1 day
**Assignee**: TBD

**Description**:
Track and display historical prices to show value of sales.

**Requirements**:
- Price history database table
- Price change tracking
- Price history chart
- "Lowest price in 30 days" badge

---

### Issue #44: Add automated product recommendations based on browsing history
**Labels**: `feature`, `low`, `products`, `ai`, `personalization`
**Estimated Effort**: 3 days
**Assignee**: TBD

**Description**:
Use machine learning to suggest products based on user's browsing history and similar users.

**Requirements**:
- User behavior tracking
- Recommendation engine
- A/B testing framework
- Performance monitoring

---

### Issue #45: Add progressive image loading with blur-up effect
**Labels**: `performance`, `low`, `products`, `ux`
**Estimated Effort**: 4 hours
**Assignee**: TBD

**Description**:
Improve perceived performance with blur-up image loading technique.

**Requirements**:
- Generate low-quality placeholders
- Blur-up effect
- Lazy loading
- WebP support

---

## 📋 Summary

**Total Issues**: 45

**By Priority**:
- 🚨 Critical: 8 issues (~8 days)
- 🔴 High: 12 issues (~12 days)
- 🟡 Medium: 15 issues (~10 days)
- 🟢 Low: 10 issues (~15 days)

**By Category**:
- Testing: 2 issues
- Accessibility: 4 issues
- Performance: 5 issues
- SEO: 6 issues
- Features: 15 issues
- Bug Fixes: 4 issues
- Refactoring: 5 issues
- Documentation: 2 issues
- Code Quality: 2 issues

**Recommended Sprint Plan**:

**Sprint 1 (Week 1)**: Critical Issues #1-8
**Sprint 2 (Week 2)**: High Priority #9-15
**Sprint 3 (Week 3)**: High Priority #16-20
**Sprint 4 (Week 4)**: Medium Priority #21-30
**Future Sprints**: Low Priority #31-45

---

## 📝 Notes for Implementation

1. **Testing First**: Issues #1-2 should be tackled first to prevent regressions
2. **Quick Wins**: Issues #3, #4, #5 are critical bugs that can be fixed quickly
3. **User Impact**: Issues #6, #11, #18 have highest user value
4. **Technical Debt**: Issues #16, #17, #22 improve maintainability
5. **SEO Value**: Issues #12, #21, #28, #40 improve discoverability

---

## 🎯 Success Metrics

After completing these issues, we should see:

**Performance**:
- Search response time < 100ms ✓
- Page load time < 2s ✓
- Lighthouse score > 90 ✓

**Quality**:
- Test coverage > 80% ✓
- Zero accessibility violations ✓
- Zero TypeScript 'any' types ✓

**SEO**:
- Rich snippets in search results ✓
- Improved search rankings ✓
- More organic traffic ✓

**User Experience**:
- Lower bounce rate ✓
- Higher conversion rate ✓
- Better user engagement ✓

---

Would you like me to:
1. Create individual GitHub issue files for each item?
2. Generate a project board view?
3. Add more technical specifications to any issue?
4. Prioritize differently based on business needs?
