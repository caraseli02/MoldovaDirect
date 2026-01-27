# Bug Patterns & Anti-Patterns

**Purpose:** Catalog of bugs encountered in this codebase, their symptoms, root causes, and how to prevent them.

> This is a **living document**. Add new patterns when bugs are found. Don't archive fixed bugs - keep them here as warnings.

---

## Table of Contents

| Pattern | Severity | Frequency |
|--------|----------|-----------|
| [Self-Referential Component Rendering](#1-self-referential-component-rendering) | CRITICAL | Low |
| [SSR Hydration Mismatch from Duplicate State](#2-ssr-hydration-mismatch-from-duplicate-state) | HIGH | Medium |
| [Plugin Interference on Admin Routes](#3-plugin-interference-on-admin-routes) | HIGH | Low |
| [Vite Dynamic Import Resolution Failure](#4-vite-dynamic-import-resolution-failure) | CRITICAL | Low |
| [Infinite Recursion via useDebounceFn Missing Dependency](#5-infinite-recursion-via-usedebouncefn) | MEDIUM | Low |

---

## 1. Self-Referential Component Rendering

**Severity:** CRITICAL (causes server crash)
**Status:** ✅ Fixed and pattern documented
**Date Found:** 2026-01-21

### Symptoms
- Server crashes immediately on startup
- Error: `Maximum call stack size exceeded`
- SSR fails completely, no pages load
- Error trace shows recursive component calls

### Root Cause
A Vue component renders itself instead of the underlying HTML element.

### The Bug

**File:** `components/ui/input/Input.vue` (BEFORE FIX)

```vue
<script setup lang="ts">
import { useForwardPropsEmits } from 'reka-ui'

const props = defineProps<InputProps>()
const emits = defineEmits<InputEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <!-- ❌ BUG: Rendering UiInput which calls itself -->
  <UiInput v-bind="forwarded" :class="cn(inputVariants(), props.class)" />
</template>
```

### Why It Happens
1. Component uses `UiInput` (its own name) in template
2. During SSR, Vue tries to render `UiInput`
3. Which tries to render `UiInput`
4. Infinite recursion → stack overflow

### The Fix

**File:** `components/ui/input/Input.vue` (AFTER FIX)

```vue
<script setup lang="ts">
// No reka-ui Primitive import needed
const props = defineProps<InputProps>()
const emits = defineEmits<InputEmits>()
</script>

<template>
  <!-- ✅ FIXED: Raw HTML element -->
  <input
    v-model="modelValue"
    :class="cn(inputVariants(), props.class)"
    v-bind="forwarded"
  />
</template>
```

### Prevention Checklist

When creating shadcn-vue style components:

```
□ For simple form elements (Input, Textarea): Use raw HTML
□ For polymorphic components (Button): Use <Primitive>
□ Never use the component's own name in its template
□ Check official shadcn-vue source before implementing
```

### Reference
- Official shadcn-vue Input: https://github.com/unovue/shadcn-vue/blob/dev/apps/v4/registry/new-york-v4/ui/input/Input.vue
- Test report: `docs/reports/shadcn-vue-refactor-test-report.md`

---

## 2. SSR Hydration Mismatch from Duplicate State

**Severity:** HIGH (causes console errors, lost state)
**Status:** ✅ Pattern identified
**Date Found:** 2026-01-21

### Symptoms
- Console warning: `Hydration mismatch in component`
- State resets after page load
- User input lost on first render
- DevTools shows `vue-router` warnings

### Root Cause
Creating local `ref` for state that already exists in a composable/store, causing two sources of truth.

### The Bug

**File:** `pages/products/index.vue` (BEFORE FIX)

```vue
<script setup lang="ts">
import { useProductCatalog } from '~/composables/useProductCatalog'

const catalog = useProductCatalog()

// ❌ BUG: Duplicate state - catalog already has searchQuery!
const searchQuery = ref('')

// Try to sync them
watchEffect(() => {
  searchQuery.value = catalog.searchQuery.value
})

watch(searchQuery, (value) => {
  catalog.searchQuery.value = value
})

onMounted(() => {
  searchQuery.value = catalog.searchQuery.value
})
</script>
```

### Why It Happens
1. Component creates `searchQuery` ref (initially empty)
2. SSR renders with empty value
3. Client-side runs `watchEffect`, sets value from catalog
4. Hydration sees different values → mismatch error

### The Fix

**File:** `pages/products/index.vue` (AFTER FIX)

```vue
<script setup lang="ts">
import { useProductCatalog } from '~/composables/useProductCatalog'

const catalog = useProductCatalog()

// ✅ FIXED: Use catalog's searchQuery directly
const { searchQuery, filters, products } = catalog

// No local state needed!
</script>

<template>
  <!-- Use catalog.searchQuery directly -->
  <input v-model="catalog.searchQuery" />
</template>
```

### Prevention Checklist

```
□ Check if state already exists in composables/stores
□ Don't create local refs for shared state
□ Use destructuring to get state from composables
□ If you need local state, give it a different name
```

---

## 3. Plugin Interference on Admin Routes

**Severity:** HIGH (admin pages broken)
**Status:** ✅ Pattern documented
**Date Found:** 2025-11-21

### Symptoms
- Admin pages show 500 errors
- Errors about missing stores or composables
- Works on public pages, fails on `/admin/*`
- Error: `useCartStore is not defined` on admin pages

### Root Cause
Global plugins run on ALL pages, including admin, but admin pages don't have e-commerce context.

### The Bug

**File:** `plugins/cart.client.ts` (BEFORE FIX)

```typescript
export default defineNuxtPlugin(() => {
  // ❌ BUG: Runs on ALL pages, including admin
  const cartStore = useCartStore()  // Fails on admin pages!

  watch(() => cartStore.items, (items) => {
    // Track cart changes
  })
})
```

### Why It Happens
1. Plugin runs during SSR/client init
2. On `/admin`, cart store doesn't exist
3. `useCartStore()` throws
4. Admin pages fail to load

### The Fix

**File:** `plugins/cart.client.ts` (AFTER FIX)

```typescript
export default defineNuxtPlugin(() => {
  const route = useRoute()

  // ✅ FIXED: Skip admin pages
  if (route.path.startsWith('/admin')) return

  // Now safe to use cart store
  const cartStore = useCartStore()

  watch(() => cartStore.items, (items) => {
    // Track cart changes
  })
})
```

### Prevention Checklist

```
□ Add route check at top of ALL e-commerce plugins
□ Use: if (route.path.startsWith('/admin')) return
□ Add route check at top of ALL admin plugins (skip public routes)
□ Test admin pages after adding new plugins
```

### Reference
- Full details: `docs/archive/fixes/admin-fixes/ISSUES-AND-SOLUTIONS.md`

---

## 4. Vite Dynamic Import Resolution Failure

**Severity:** CRITICAL (all admin pages broken)
**Status:** ✅ Pattern documented
**Date Found:** 2025-11-21

### Symptoms
- Pages show 500 errors
- Error: `Unknown variable dynamic import`
- Dynamic imports work in dev, fail in production
- Affects code-split components

### Root Cause
Vite requires static analysis of imports. Template strings in composables can't be resolved during SSR.

### The Bug

**File:** `composables/useAsyncAdminComponent.ts` (DO NOT USE)

```typescript
// ❌ BUG: Dynamic import with template string
export function useAsyncAdminComponent(name: string) {
  const modules = import.meta.glob('~/components/admin/**/*.vue')

  // Vite can't resolve this at build time
  return modules[`~/components/admin/${name}.vue`]()
}
```

**Usage:** (DO NOT DO THIS)

```vue
<script setup lang="ts">
// ❌ FAILS during SSR
const AdminDashboardOverview = useAsyncAdminComponent('Dashboard/Overview')
</script>
```

### Why It Happens
1. Vite needs to know all imports at build time
2. Template strings prevent static analysis
3. SSR fails because path can't be resolved
4. Vite can't code-split properly

### The Fix

**File:** `pages/admin/index.vue` (AFTER FIX)

```vue
<script setup lang="ts">
// ✅ FIXED: Static import
import AdminDashboardOverview from '~/components/admin/Dashboard/Overview.vue'

// Component is now bundled correctly
</script>

<template>
  <AdminDashboardOverview />
</template>
```

### Prevention Checklist

```
□ NEVER use dynamic imports with template strings in Nuxt 4
□ ALWAYS use static imports: import X from '~/path/X.vue'
□ Use Nuxt's Lazy components: <LazyComponentName />
□ Accept bundle size increase for reliability
```

### Trade-off

| Approach | Bundle Size | Reliability |
|----------|-------------|-------------|
| Dynamic imports | Smaller | ❌ Breaks in SSR |
| Static imports | Larger | ✅ Always works |

**Verdict:** Use static imports. The bundle size increase is worth the reliability.

---

## 5. Missing useDebounceFn Dependency

**Severity:** MEDIUM (excessive API calls)
**Status:** ⚠️ Pattern to watch for
**Date Found:** 2026-01-21

### Symptoms
- API called on every keystroke
- Debounce doesn't work
- Network tab shows rapid-fire requests

### Root Cause
Forgetting to use `useDebounceFn` from VueUse, or using it incorrectly.

### The Bug

**File:** `pages/products/index.vue` (BEFORE FIX)

```vue
<script setup lang="ts">
// Custom debounce implementation (may not be SSR-safe)
import { debounce } from '~/utils/debounce'

const searchQuery = ref('')

// ❌ BUG: Wrong debounce pattern
const handleSearch = debounce(async () => {
  await search(searchQuery.value)
}, 300)

// Also easy to forget to call it!
watch(searchQuery, () => {
  handleSearch()  // Not debounced if we passed wrong reference
})
</script>
```

### The Fix

**File:** `composables/useProductsPage.ts` (AFTER FIX)

```typescript
import { useDebounceFn } from '@vueuse/core'

export function useProductsPage(options: UseProductsPageOptions) {
  const { search, searchQuery } = options

  // ✅ FIXED: Use VueUse's useDebounceFn
  const handleSearchInput = useDebounceFn(async () => {
    if (searchAbortController.value) {
      searchAbortController.value.abort()
    }

    searchAbortController.value = new AbortController()

    try {
      if (searchQuery.value.trim()) {
        await search(searchQuery.value.trim(), {
          ...filters.value,
          page: 1,
        }, searchAbortController.value.signal)
      }
    }
    catch (error: unknown) {
      // Ignore abort errors
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('[Products Page] Search failed:', getErrorMessage(error))
      }
    }
  }, 300)  // 300ms debounce

  return { handleSearchInput }
}
```

### Prevention Checklist

```
□ Use @vueuse/core's useDebounceFn for debouncing
□ It's explicitly SSR-safe
□ Remember the delay parameter (second argument)
□ For search: 300ms is typical
□ For auto-save: 500-1000ms is typical
```

---

## Quick Reference: Bug Prevention Checklist

```
┌─────────────────────────────────────────────────────────────┐
│  BEFORE COMMITTING UI COMPONENTS                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  □ Component doesn't render itself                          │
│    → Check template doesn't use own component name          │
│                                                             │
│  □ No duplicate state                                      │
│    → Check if state exists in composable/store first        │
│                                                             │
│  □ Plugins have route guards                               │
│    → if (route.path.startsWith('/admin')) return            │
│                                                             │
│  □ Imports are static                                      │
│    → No dynamic imports with template strings                │
│                                                             │
│  □ Debounce uses VueUse                                    │
│    → useDebounceFn from @vueuse/core                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Reporting New Bugs

When you find a new bug pattern, add it to this document using this template:

```markdown
## [Number]. [Bug Name]

**Severity:** CRITICAL/HIGH/MEDIUM/LOW
**Status:** ⚠️ Under investigation / ✅ Fixed and documented
**Date Found:** YYYY-MM-DD

### Symptoms
- What you see
- Error messages
- Impact on users

### Root Cause
Why it happens

### The Bug
[Code example of the bug]

### The Fix
[Code example of the fix]

### Prevention Checklist
```

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [refactoring/patterns.md](refactoring/patterns.md) | Safe refactoring patterns |
| [archive/fixes/admin-fixes/](../archive/fixes/admin-fixes/) | Historical bug fixes |
| [reports/shadcn-vue-refactor-test-report.md](../reports/shadcn-vue-refactor-test-report.md) | Detailed bug analysis |

---

**Last Updated:** 2026-01-25
**Maintainer:** Development team
**Status:** Living document - add new patterns as they emerge
