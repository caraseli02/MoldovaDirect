# Vue 3 Composition API Review: pages/products/index.vue

**Date:** 2026-01-20
**Skill:** vue
**File:** `/pages/products/index.vue`
**Lines:** 910

---

## 1. Composition API Best Practices

### ✅ Good Practices

- **Proper import organization:** Vue imports from `#imports` and explicit imports where needed
- **Reactive destructuring not used:** Good - using `ref()` directly instead of reactive destructuring which can cause reactivity loss
- **Composable usage:** Well-structured use of composables for state management

### ❌ Issues Found

#### Issue 1: Duplicate State for Search Query
**Lines:** 564, 532, 795-800

```typescript
// Local state (line 564)
const searchQuery = ref('')

// Store state (line 532)
searchQuery: storeSearchQuery

// Watch to sync (lines 795-800)
watchEffect(() => {
  if (storeSearchQuery.value && storeSearchQuery.value !== searchQuery.value) {
    searchQuery.value = storeSearchQuery.value
  }
})
```

**Problem:** Having two separate refs for the same data creates:
- Unnecessary complexity
- Potential sync issues
- Harder to track data flow

**Fix:** Use a computed with getter/setter or bind directly to store:
```typescript
const searchQuery = computed({
  get: () => storeSearchQuery.value,
  set: (val) => {
    storeSearchQuery.value = val
    handleSearchInput()
  }
})
```

#### Issue 2: Manual Watch Chain Instead of Reactive Derivation
**Lines:** 795-820

Multiple watchers doing coordination could be simplified with `watchEffect` or reactive computed values.

---

## 2. Reactivity Patterns

### ⚠️ Potential Reactivity Loss

#### Issue: Destructuring from Reactive in Template
**Lines:** 324, 597

```vue
@click="goToPage(page as number)"
```

The `visiblePages` is `(number | string)[]` but the handler assumes `number`. The guard `v-if="page !== '...'"` protects it, but this is fragile.

**Fix:** Type the handler properly:
```typescript
const goToPage = (page: number | string) => {
  if (typeof page !== 'number') return
  // ... rest of logic
}
```

### ✅ Good: Proper Ref Usage
```typescript
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement>()
const searchAbortController = ref<AbortController | null>(null)
```

All refs are properly typed and initialized.

---

## 3. Component Composition Opportunities

### Large Template Sections That Could Be Components

| Section | Lines | Suggested Component |
|---------|-------|---------------------|
| Search bar with icon | 72-121 | `ProductSearch.vue` |
| Header + filters + sort | 124-211 | `ProductToolbar.vue` |
| Product grid + states | 262-346 | `ProductGrid.vue` |
| Pagination | 287-345 | `ProductPagination.vue` |
| Editorial stories | 405-440 | `EditorialStories.vue` (may exist) |

---

## 4. Vue 3.5+ Features That Could Improve Code

### Suggestion: Use `watchPostEffect` for DOM-dependent Operations

**Lines:** 869-871

```typescript
nextTick(() => {
  mobileInteractions.setup()
})
```

Could use `watchPostEffect` for cleaner DOM-dependent side effects.

### Suggestion: Use `toValue` for Composable Args

If creating new composables, use `toValue()` to accept both refs and plain values:
```typescript
function useProductSearchState(query: MaybeRef<string>) {
  const value = toValue(query)
  // ...
}
```

---

## 5. Common Vue Pitfalls

### ✅ Avoided Pitfalls

1. **No reactive destructuring loss** - Not using `const { products } = store`
2. **Proper cleanup in onUnmounted** - AbortController canceled
3. **No direct array mutations** - Using proper state updates

### ⚠️ Found Pitfalls

#### Pitfall 1: Event Listener Cleanup Not Guaranteed
**Lines:** 869-871, 907

```typescript
nextTick(() => {
  mobileInteractions.setup()
})

onUnmounted(() => {
  mobileInteractions.cleanup()
})
```

If component unmounts before `nextTick` callback, cleanup won't match setup.

**Fix:**
```typescript
let mobileCleanup: (() => void) | null = null

onMounted(() => {
  nextTick(() => {
    mobileCleanup = mobileInteractions.setup()
  })
})

onUnmounted(() => {
  mobileCleanup?.() // Direct cleanup
})
```

#### Pitfall 2: Memory Leak with AbortController
**Lines:** 566, 593-595

The `searchAbortController` is only cleaned up on unmount. If many searches happen rapidly, old controllers aren't cleared until the next search.

**Fix:** Clear immediately after aborting:
```typescript
if (searchAbortController.value) {
  searchAbortController.value.abort()
  searchAbortController.value = null // Clear reference
}
```

---

## Summary: Key Recommendations

| Priority | Issue | Recommendation |
|----------|-------|----------------|
| **High** | Duplicate search query state | Use computed with getter/setter |
| **High** | Event listener cleanup | Store cleanup function directly |
| **Medium** | Unsafe type assertion | Add runtime check in goToPage |
| **Medium** | Extract 4 UI components | Reduce template complexity |
| **Low** | Use Vue 3.5+ features | Consider watchPostEffect |

---

## Refactoring Priority

1. **Fix duplicate state** - Use computed for search query
2. **Extract components** - Search, Toolbar, Grid, Pagination
3. **Improve cleanup** - Store cleanup functions directly
4. **Add runtime validation** - Type-safe handlers
