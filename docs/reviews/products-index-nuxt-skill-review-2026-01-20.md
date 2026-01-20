# Nuxt 4 Review: pages/products/index.vue

**Date:** 2026-01-20
**Skill:** nuxt
**File:** `/pages/products/index.vue`
**Lines:** 910

---

## 1. SSR Compatibility Issues

### ⚠️ Critical: SSR Hydration Mismatch
**Lines:** 564, 795-800

```typescript
// Local state initialized empty on server
const searchQuery = ref('')

// Store state may have different value
searchQuery: storeSearchQuery

// watchEffect syncs store → local (client only)
watchEffect(() => {
  if (storeSearchQuery.value && storeSearchQuery.value !== searchQuery.value) {
    searchQuery.value = storeSearchQuery.value
  }
})
```

**Problem:**
- Server renders with empty search query
- Client hydrates with different value from store
- Causes hydration mismatch warning
- Can cause flash of wrong content

**Fix:** Use `useState` for shared state that persists SSR:
```typescript
const searchQuery = useState('product-search-query', () => '')
```

Or use store's state directly without local duplication.

### ✅ Good: SSR-Safe Custom Debounce
**Lines:** 484-506

The comment explains why custom debounce is used instead of VueUse:
```typescript
// CRITICAL: Custom debounce implementation (DO NOT replace with VueUse)
// Context: useDebounceFn from @vueuse/core caused 500 errors on mobile production
// Root cause: VueUse's debounce is not SSR-safe
```

This is excellent documentation for a critical SSR fix.

### ⚠️ Potential SSR Issue: `window` References
**Line:** 851

```typescript
window.scrollTo({ top: 0, behavior: 'smooth' })
```

This is in a watcher that runs after route changes, so it should be safe, but there's no guard.

**Recommendation:** Add client check:
```typescript
if (import.meta.client) {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

---

## 2. Proper Use of Nuxt Composables

### ✅ Correct Usage

```typescript
const route = useRoute()     // ✅ Correct
const router = useRouter()   // ✅ Correct
const { t } = useI18n()      // ✅ Correct
```

### ⚠️ Missing: `useAsyncData` for Initial Fetch

**Current approach (lines 543-544):**
```typescript
await initialize()
await fetchProducts({ sort: 'created', page: initialPage, limit: initialLimit })
```

**Better Nuxt 4 pattern:**
```typescript
const { data, pending, error } = await useAsyncData(
  'products',
  () => fetchProducts({ sort: 'created', page: initialPage, limit: initialLimit }),
  {
    transform: (data) => data.products,
    default: () => []
  }
)
```

**Benefits:**
- Automatic payload extraction (no duplicate fetch on client)
- Built-in loading, error states
- Better SSR handling
- Nuxt handles caching

---

## 3. Nuxt 4 Specific Patterns

### ✅ Good: Auto-imports Used
```typescript
// No explicit imports for these - Nuxt auto-imports
useRoute()
useRouter()
useI18n()
useState()
```

### ❌ Issue: Not Using `useHead` for Dynamic Meta

**Current (line 561):**
```typescript
const { setupWatchers: setupStructuredDataWatchers } = useProductStructuredData(products, pagination)
```

The SEO is handled via a composable, but Nuxt 4's `useHead` could be used directly in the page for better integration.

**Suggestion:**
```typescript
useHead({
  title: computed(() => t('products.meta.title')),
  meta: [
    {
      name: 'description',
      content: computed(() => t('products.meta.description'))
    }
  ]
})
```

---

## 4. Performance Optimization Opportunities

### ⚠️ Issue: Double Data Fetching

**Current flow:**
1. SSR: `fetchProducts()` called
2. Client: Page may call `fetchProducts()` again if state not synced

**Fix with `useAsyncData`:**
```typescript
const { data: products, pending, refresh } = await useAsyncData(
  'products-list',
  () => $fetch('/api/products', {
    query: { sort: 'created', page: initialPage, limit: initialLimit }
  })
)
```

Nuxt will:
- Fetch on server
- Pass data to client via payload
- NOT fetch again on client (unless explicitly refreshed)

### ⚠️ Issue: No Lazy Loading for Heavy Components

**Lines:** 269-274

```vue
<MobileVirtualProductGrid
  v-if="mobileInteractions.isMobile.value && products.length > 20"
  ...
/>
```

This component is always loaded. For better performance:
```vue
<MobileVirtualProductGrid
  v-if="mobileInteractions.isMobile.value && products.length > 20"
  v-lazy-load
  ...
/>
```

Or use dynamic import:
```vue
<script setup>
const MobileVirtualProductGrid = defineAsyncComponent(() =>
  import('~/components/mobile/VirtualProductGrid.vue')
)
</script>
```

### ✅ Good: Using `NuxtImg` in ProductCard
The `ProductCard` component uses `NuxtImg` which provides:
- Automatic optimization
- Responsive images
- Lazy loading
- Format conversion

---

## 5. Common Nuxt Pitfalls in Product Catalogs

### ✅ Avoided: `onMounted` for Data Fetching
The page fetches data at the top level (lines 543-544), not in `onMounted`. This is correct for SSR.

### ⚠️ Found: Client-Only Code Without Guard
**Lines:** 795-800, 851

```typescript
watchEffect(() => {
  // This runs in SSR context
  if (storeSearchQuery.value && storeSearchQuery.value !== searchQuery.value) {
    searchQuery.value = storeSearchQuery.value
  }
})
```

`watchEffect` runs during SSR. If this depends on browser-only state, add guard:
```typescript
watchEffect(() => {
  if (import.meta.server) return
  // ... client-only logic
})
```

### ⚠️ Issue: Using `useState` Without Key Collision Prevention

**Line:** 575
```typescript
const recentlyViewedProducts = useState<ProductWithRelations[]>('recentlyViewedProducts', () => [])
```

This state is shared across ALL pages. If user navigates to a different page that also uses this key, there could be collisions.

**Fix:** Use page-specific key:
```typescript
const recentlyViewedProducts = useState<ProductWithRelations[]>('products-catalog-recently-viewed', () => [])
```

---

## Summary: Key Recommendations

| Priority | Issue | Recommendation |
|----------|-------|----------------|
| **Critical** | SSR hydration mismatch | Use `useState` or remove duplicate state |
| **High** | Double data fetching | Use `useAsyncData` for initial fetch |
| **High** | Missing client guard | Add `import.meta.client` checks |
| **Medium** | Component lazy loading | Use `defineAsyncComponent` for heavy components |
| **Medium** | useState key collision | Use page-specific keys |
| **Low** | Use `useHead` directly | Better SEO integration |

---

## Nuxt 4 Migration Checklist for This Page

- [ ] Replace manual fetch with `useAsyncData`
- [ ] Fix search query SSR mismatch
- [ ] Add `import.meta.client` guards where needed
- [ ] Use page-specific `useState` keys
- [ ] Consider `useHead` for direct SEO control
- [ ] Add lazy loading for heavy components
- [ ] Verify payload extraction working (no duplicate fetches)
