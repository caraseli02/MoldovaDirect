# Nuxt 3 + Pinia Shopping Cart SSR Best Practices Research

**Research Date**: 2025-11-16
**Project**: Moldova Direct E-commerce Platform
**Focus**: Shopping Cart Implementation with SSR on Vercel

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Official Best Practices](#official-best-practices)
3. [Common Issues and Solutions](#common-issues-and-solutions)
4. [Current Implementation Analysis](#current-implementation-analysis)
5. [Specific Recommendations](#specific-recommendations)
6. [Code Examples from Successful Implementations](#code-examples-from-successful-implementations)
7. [Red Flags and Warnings](#red-flags-and-warnings)
8. [References and Sources](#references-and-sources)

---

## Executive Summary

### Key Findings

1. **Pinia with Nuxt 3 is SSR-safe by default** when using the `@pinia/nuxt` module (which this project already has)
2. **Cookies are recommended over localStorage** for SSR shopping carts to avoid hydration mismatches
3. **Setup Stores have known hydration issues** compared to Option Stores
4. **`import.meta.client` should replace `process.client`** (deprecated in Nuxt 3+)
5. **Vercel edge runtime has specific limitations** (5MB limit, restricted Node.js features)

### Critical Issues Identified in Current Implementation

1. Using `process.client` instead of `import.meta.client` (deprecated)
2. Using localStorage instead of cookies (causes SSR hydration mismatches)
3. Setup Store pattern (current implementation) has known hydration issues
4. Client-side initialization in multiple places (plugin + composable) may cause race conditions
5. Missing `pinia-plugin-persistedstate` for proper SSR-safe persistence

---

## Official Best Practices

### 1. Nuxt 3 + Pinia Integration

**Source**: [Official Pinia Documentation - Nuxt SSR](https://pinia.vuejs.org/ssr/nuxt.html)

#### Installation & Setup

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
})
```

**Status in Project**: ✅ Already configured correctly

#### Key Advantages of @pinia/nuxt

- Automatic serialization and XSS protection
- No manual SSR configuration needed
- Auto-imports for `defineStore`, `storeToRefs`, `usePinia()`
- Stores in `stores/` folder are auto-imported

#### Calling Stores in Setup Context

**Best Practice**: Always call `useStore()` at the top of setup functions, getters, and actions for SSR compatibility.

```typescript
// ✅ CORRECT - SSR Safe
export default defineComponent({
  setup() {
    const store = useStore()
    // use store...
  }
})

// ❌ WRONG - Not SSR Safe
const store = useStore() // Outside setup
export default defineComponent({
  setup() {
    // use store...
  }
})
```

**Status in Project**: ⚠️ Needs review - composable may access store outside proper context

#### Using Stores Outside Setup Context

**Warning**: When accessing stores outside `setup()` or injection-aware contexts (navigation guards, middleware, other stores), you must pass the Pinia instance:

```typescript
import { useStore } from '~/stores/myStore'
const store = useStore(pinia) // Must pass pinia instance
```

**Status in Project**: ⚠️ Not applicable currently but important for middleware

### 2. State Management with SSR

**Source**: [Nuxt Documentation - State Management](https://nuxt.com/docs/getting-started/state-management)

#### useState vs Pinia Decision Matrix

| Feature | useState | Pinia |
|---------|----------|-------|
| SSR Hydration | Built-in, automatic | Built-in via @pinia/nuxt |
| Performance | Negligible difference | Negligible difference |
| Best For | Simple apps, small state | Complex apps, scalable features |
| Developer Experience | Basic | Rich (actions, getters, devtools) |
| Type Safety | Basic | Excellent with TypeScript |

**Recommendation**: For shopping cart with complex features (analytics, validation, security), **Pinia is the correct choice**.

**Status in Project**: ✅ Correct choice of Pinia

### 3. SSR-Safe Persistence

**Source**: [Pinia Plugin Persistedstate - Nuxt Usage](https://prazdevs.github.io/pinia-plugin-persistedstate/frameworks/nuxt.html)

#### Installation

```bash
npm install @pinia-plugin-persistedstate/nuxt
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt', // Add this
  ],
})
```

**Status in Project**: ❌ NOT INSTALLED - Critical missing dependency

#### Storage Options for SSR

**Cookies (Recommended for SSR)**:
```typescript
export const useCartStore = defineStore('cart', {
  state: () => ({ items: [] }),
  persist: {
    storage: piniaPluginPersistedstate.cookies(),
  },
})
```

**Benefits**:
- SSR-compatible (readable on server)
- No hydration mismatches
- Works with Vercel edge runtime
- Automatically synced between server/client

**Limitations**:
- 4,098 bytes max size per cookie
- Store only cart IDs, fetch full data from backend

**LocalStorage (Not Recommended for SSR)**:
```typescript
export const useCartStore = defineStore('cart', {
  state: () => ({ items: [] }),
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
})
```

**Issues**:
- Not accessible on server
- Causes hydration mismatches
- Requires manual client-only guards

**Status in Project**: ⚠️ Currently using localStorage - should migrate to cookies

---

## Common Issues and Solutions

### Issue 1: Hydration Mismatch with localStorage

**Source**: [State Hydration & Persisted State in Nuxt with Pinia](https://dev.to/jacobandrewsky/state-hydration-persisted-state-in-nuxt-with-pinia-1d1e)

#### Problem

```typescript
// ❌ CAUSES HYDRATION MISMATCH
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: localStorage.getItem('cart') || [], // undefined on server
  }),
})
```

**Why It Fails**:
1. Server renders with empty array (localStorage doesn't exist)
2. Client hydrates with actual localStorage data
3. Vue detects mismatch and throws hydration error

#### Solution Pattern

```typescript
// ✅ SSR-SAFE PATTERN
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [], // SSR-safe default
    initialized: false,
  }),
  actions: {
    init() {
      if (import.meta.client) { // Use import.meta.client, not process.client
        this.items = JSON.parse(localStorage.getItem('cart') || '[]')
        this.initialized = true
      }
    },
  },
})
```

**Status in Project**: ⚠️ Currently has client guards but using deprecated `process.client`

### Issue 2: Setup Stores vs Option Stores Hydration

**Source**: [Pinia Discussion #2175 - Store property not hydrated](https://github.com/vuejs/pinia/discussions/2175)

#### Finding

Testing has shown that **hydration works correctly using Option Stores, but not with Setup Stores**.

#### Setup Store Hydration Requirements

```typescript
// Setup stores need skipHydrate() for properties that shouldn't hydrate
import { skipHydrate } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const tempData = ref({}) // Won't be hydrated

  return {
    items, // Will hydrate
    tempData: skipHydrate(tempData), // Won't hydrate
  }
})
```

**Critical**: You must return all state properties in setup stores for Pinia to pick them up as state. Not returning properties or making them readonly will break SSR.

**Status in Project**: ⚠️ Using Setup Store - potential hydration issues

### Issue 3: Vercel Deployment Errors

**Source**: [GitHub Issue - vueDemi2.effectScope is not a function](https://dev.to/jeanjavi/fixing-the-vuedemi2effectscope-is-not-a-function-error-in-nuxt-3-pinia-ssr-vercel-deploy-2jih)

#### Problem

Error occurs in SSR mode production builds, particularly with Node.js 22 on Vercel.

#### Solutions

1. **Primary**: Explicitly install Pinia as direct dependency alongside @pinia/nuxt
```json
{
  "dependencies": {
    "pinia": "^3.0.4", // ✅ Already in project
    "@pinia/nuxt": "^0.11.3" // ✅ Already in project
  }
}
```

2. **Alternative**: Downgrade to @pinia/nuxt@0.5.5 (loses newer features)
3. **Alternative**: Switch to Node.js 20 instead of Node.js 22

**Status in Project**: ✅ Has both dependencies, but Node.js 22 may cause issues

### Issue 4: Deprecated process.client

**Source**: [Nuxt Issue #25323 - Remove support for process.server/process.client](https://github.com/nuxt/nuxt/issues/25323)

#### Migration Required

```typescript
// ❌ DEPRECATED (will be removed in Nuxt 5)
if (process.client) {
  // client code
}

// ✅ CURRENT STANDARD
if (import.meta.client) {
  // client code
}
```

**Status in Project**: ❌ Using `process.client` throughout codebase - needs migration

### Issue 5: Cookies vs localStorage for Shopping Carts

**Source**: [StackOverflow - is storing jwt token in cookies in nuxt js a best option](https://stackoverflow.com/questions/69969455/is-storing-jwt-token-in-cookies-in-nuxt-js-a-best-option-cause-ssr-doesnt-suppor)

#### Security & SSR Comparison

| Aspect | Cookies | localStorage |
|--------|---------|--------------|
| SSR Support | ✅ Yes | ❌ No |
| Security | ✅ HttpOnly, Secure, SameSite | ❌ Accessible via JS |
| XSS Protection | ✅ Can be protected | ❌ Vulnerable |
| Size Limit | ⚠️ 4,098 bytes | ✅ ~5-10MB |
| Hydration | ✅ No mismatches | ❌ Causes mismatches |

#### Best Practice for Shopping Carts

**Recommendation**: Store only cart item IDs in cookies, fetch full product data from backend.

**Benefits**:
- Avoids outdated pricing issues
- Prevents client-side data manipulation
- Stays within cookie size limits
- SSR-compatible

```typescript
// ✅ RECOMMENDED PATTERN
interface CartCookie {
  items: Array<{ productId: string; quantity: number }>
  sessionId: string
}

// Full product data fetched from API
const cartWithProducts = await $fetch('/api/cart', {
  body: { items: cartCookie.items }
})
```

**Status in Project**: ⚠️ Storing full product objects in localStorage - should optimize

---

## Current Implementation Analysis

### File: `/stores/cart/index.ts`

#### Strengths

1. ✅ Well-organized modular architecture
2. ✅ Comprehensive feature set (analytics, validation, security)
3. ✅ Good error handling
4. ✅ Debounced save functionality

#### Issues Identified

| Issue | Severity | Line | Description |
|-------|----------|------|-------------|
| Deprecated syntax | High | 168, 175, 206, 211, 216, 376, 337 | Using `process.client` instead of `import.meta.client` |
| Setup Store pattern | Medium | 31 | May cause hydration issues (use Option Store) |
| Complex initialization | Medium | 163-224 | Multiple initialization points risk race conditions |
| Mock data in production | Low | 175-203 | Development mock data added on client side |

### File: `/stores/cart/persistence.ts`

#### Strengths

1. ✅ Good fallback mechanism (localStorage → sessionStorage → memory)
2. ✅ Debounced save implementation
3. ✅ Comprehensive error handling

#### Issues Identified

| Issue | Severity | Line | Description |
|-------|----------|------|-------------|
| localStorage-first approach | High | 23-27 | Should use cookies for SSR |
| No SSR check | High | 36-47 | `typeof window` check instead of `import.meta.client` |
| Manual serialization | Medium | 74-87 | Should use pinia-plugin-persistedstate |

### File: `/plugins/cart.client.ts`

#### Strengths

1. ✅ Proper `.client.ts` suffix for client-only plugin
2. ✅ Uses `import.meta.client` guard

#### Issues Identified

| Issue | Severity | Line | Description |
|-------|----------|------|-------------|
| Duplicate initialization | Medium | 4-23 | Plugin + composable both initialize cart |
| nextTick complexity | Low | 7-19 | May not be necessary with proper Pinia setup |

### File: `/composables/useCart.ts`

#### Strengths

1. ✅ Clean composable API
2. ✅ Comprehensive method exposure

#### Issues Identified

| Issue | Severity | Line | Description |
|-------|----------|------|-------------|
| Duplicate initialization | High | 11-14 | Already initialized in plugin |
| Deprecated syntax | High | 12 | Using `process.client` instead of `import.meta.client` |

---

## Specific Recommendations

### Priority 1: Critical Fixes (Breaking Issues)

#### 1.1 Migrate from localStorage to Cookies

**Why**: Prevents hydration mismatches, SSR-compatible, better security

**Action Items**:
1. Install `@pinia-plugin-persistedstate/nuxt`
2. Update `nuxt.config.ts` to include the module
3. Refactor cart store to use cookie storage
4. Store only cart item IDs (not full product objects)
5. Fetch full product data from API on load

**Files to Modify**:
- `/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/nuxt.config.ts`
- `/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/stores/cart/index.ts`
- `/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/stores/cart/persistence.ts`

**Code Example**:
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt', // Add this
  ],
})

// stores/cart/index.ts
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    sessionId: null,
  }),
  persist: {
    storage: piniaPluginPersistedstate.cookies(),
    // Only store IDs, not full objects
    serializer: {
      serialize: (state) => JSON.stringify({
        items: state.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        sessionId: state.sessionId,
      }),
      deserialize: (value) => JSON.parse(value),
    },
  },
})
```

#### 1.2 Replace `process.client` with `import.meta.client`

**Why**: `process.client` is deprecated and will be removed in Nuxt 5

**Action Items**:
1. Global find/replace: `process.client` → `import.meta.client`
2. Test all client-only code paths

**Files to Modify**:
- `/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/stores/cart/index.ts`
- `/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/composables/useCart.ts`
- All other files using `process.client`

#### 1.3 Fix Duplicate Initialization

**Why**: Plugin and composable both initialize cart, causing race conditions

**Action Items**:
1. Remove initialization from `useCart.ts` composable
2. Keep only plugin initialization
3. Add initialization check to prevent double-init

**Files to Modify**:
- `/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/composables/useCart.ts`
- `/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/plugins/cart.client.ts`

**Code Example**:
```typescript
// composables/useCart.ts
export const useCart = () => {
  const cartStore = useCartStore()

  // Remove this block - initialization happens in plugin
  // if (import.meta.client && !cartStore.sessionId) {
  //   cartStore.initializeCart()
  // }

  return {
    // ... rest of composable
  }
}
```

### Priority 2: High-Priority Improvements

#### 2.1 Consider Option Store Instead of Setup Store

**Why**: Setup Stores have known hydration issues

**Action Items**:
1. Evaluate effort to convert to Option Store syntax
2. If keeping Setup Store, ensure all state is properly returned
3. Use `skipHydrate()` for non-persistent state

**Files to Modify**:
- `/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/stores/cart/index.ts`

**Code Example**:
```typescript
// Option Store syntax (more SSR-friendly)
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    sessionId: null,
  }),
  getters: {
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: (state) => state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  },
  actions: {
    async addItem(product, quantity = 1) {
      // action logic
    },
  },
})
```

#### 2.2 Optimize Cart Data Structure

**Why**: Reduce cookie size, improve performance, prevent stale data

**Action Items**:
1. Store only cart item IDs and quantities in cookies
2. Fetch full product data from API on cart load
3. Implement server-side cart validation

**Files to Modify**:
- `/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/stores/cart/types.ts`
- `/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/stores/cart/index.ts`

**Code Example**:
```typescript
// Lightweight cart structure for cookies
interface CartCookieData {
  items: Array<{
    productId: string
    quantity: number
  }>
  sessionId: string
}

// Full cart with product data (fetched from API)
interface CartWithProducts {
  items: Array<{
    id: string
    product: Product
    quantity: number
  }>
  sessionId: string
}
```

### Priority 3: Code Quality & Maintenance

#### 3.1 Simplify Plugin Initialization

**Why**: Current `nextTick` complexity may be unnecessary

**Action Items**:
1. Test if `nextTick` is still needed with proper Pinia setup
2. Simplify initialization logic

**Files to Modify**:
- `/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/plugins/cart.client.ts`

#### 3.2 Add SSR-Specific Tests

**Why**: Verify hydration works correctly on Vercel

**Action Items**:
1. Create SSR test suite for cart functionality
2. Test hydration scenarios
3. Test Vercel edge runtime compatibility

**Files to Create**:
- `/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/tests/integration/cart-ssr.spec.ts`

---

## Code Examples from Successful Implementations

### Example 1: Prime Store (Nuxt 3 Shopping Cart)

**Source**: [GitHub - selemondev/prime-store](https://github.com/selemondev/prime-store)

**Stack**: Nuxt 3 + PrimeVue + Pinia + TailwindCSS

**Key Patterns**:
- Standard Nuxt 3 directory structure
- Dedicated `stores/` folder for Pinia stores
- Component-based architecture
- TypeScript for type safety

### Example 2: SSR-Safe Cart Pattern

**Source**: [DEV.to - Managing state with Pinia and Nuxt 3](https://dev.to/hannahadora/managing-state-with-pinia-and-nuxt-3-using-a-simple-add-to-cart-instance-1faf)

```typescript
// SSR-safe cart store with proper initialization
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    initialized: false,
  }),
  actions: {
    init() {
      if (import.meta.client && !this.initialized) {
        const saved = useCookie('cart').value
        if (saved) {
          this.items = JSON.parse(saved)
        }
        this.initialized = true
      }
    },
    addItem(product, quantity) {
      const existingItem = this.items.find(i => i.productId === product.id)
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({ productId: product.id, quantity })
      }
      this.saveToStorage()
    },
    saveToStorage() {
      if (import.meta.client) {
        useCookie('cart').value = JSON.stringify(this.items)
      }
    },
  },
})
```

### Example 3: Nuxt 3 useCookie for Cart

**Source**: [Mastering Nuxt - The Ultimate Guide to Cookies](https://masteringnuxt.com/blog/the-ultimate-guide-to-cookies-in-nuxt-3)

```typescript
// Using Nuxt's useCookie composable (SSR-safe)
export const useCartCookie = () => {
  const cart = useCookie<CartCookieData>('cart', {
    default: () => ({ items: [], sessionId: null }),
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return cart
}
```

---

## Red Flags and Warnings

### 1. Critical: localStorage in SSR

**Current State**: ⚠️ Project uses localStorage for cart persistence

**Impact**:
- Hydration mismatches on Vercel
- Potential data loss on navigation
- SEO issues (server can't see cart state)

**Solution**: Migrate to cookies immediately (Priority 1)

### 2. Critical: Deprecated process.client

**Current State**: ⚠️ Used throughout codebase

**Impact**:
- Will break in Nuxt 5
- May cause issues in current Nuxt 4.1.3

**Solution**: Replace with `import.meta.client` (Priority 1)

### 3. High: Setup Store Hydration Issues

**Current State**: ⚠️ Using Setup Store pattern

**Impact**:
- Known hydration issues with Pinia
- May cause state loss on SSR

**Solution**: Consider Option Store or ensure proper hydration (Priority 2)

### 4. High: Missing pinia-plugin-persistedstate

**Current State**: ❌ Not installed

**Impact**:
- Manual persistence implementation (error-prone)
- No SSR-optimized persistence
- Missing cookie serialization

**Solution**: Install and configure (Priority 1)

### 5. Medium: Duplicate Initialization

**Current State**: ⚠️ Plugin + composable both initialize

**Impact**:
- Race conditions
- Unpredictable behavior
- Performance overhead

**Solution**: Remove from composable (Priority 1)

### 6. Medium: Full Product Objects in Storage

**Current State**: ⚠️ Storing complete product data

**Impact**:
- Cookie size limit issues (4KB)
- Stale pricing data
- Security risks (client manipulation)

**Solution**: Store only IDs (Priority 2)

### 7. Low: Node.js 22 Compatibility

**Current State**: ✅ Using Node.js >= 22.4.0

**Impact**:
- Potential Pinia SSR issues on Vercel
- `effectScope is not a function` errors

**Solution**: Monitor Vercel deployments, consider Node.js 20 fallback

---

## References and Sources

### Official Documentation

1. **Pinia - Server Side Rendering (SSR)**
   https://pinia.vuejs.org/ssr/nuxt.html
   Installation, setup, and SSR best practices

2. **Nuxt - State Management**
   https://nuxt.com/docs/getting-started/state-management
   useState vs Pinia comparison

3. **Pinia Plugin Persistedstate - Nuxt Usage**
   https://prazdevs.github.io/pinia-plugin-persistedstate/frameworks/nuxt.html
   SSR-safe state persistence with cookies

4. **Nuxt - Deploy to Vercel**
   https://nuxt.com/deploy/vercel
   Vercel deployment configuration

5. **Mastering Nuxt - The Ultimate Guide to Cookies in Nuxt 3**
   https://masteringnuxt.com/blog/the-ultimate-guide-to-cookies-in-nuxt-3
   useCookie composable and SSR patterns

### Community Resources

6. **DEV.to - State Hydration & Persisted State in Nuxt with Pinia**
   https://dev.to/jacobandrewsky/state-hydration-persisted-state-in-nuxt-with-pinia-1d1e
   Practical examples and common pitfalls

7. **DEV.to - Fixing the effectScope Error in Nuxt 3 + Pinia (Vercel Deploy)**
   https://dev.to/jeanjavi/fixing-the-vuedemi2effectscope-is-not-a-function-error-in-nuxt-3-pinia-ssr-vercel-deploy-2jih
   Vercel-specific Pinia issues

8. **Vue Mastery - Nuxt 3 State Management: Pinia vs useState**
   https://www.vuemastery.com/blog/nuxt-3-state-mangement-pinia-vs-usestate/
   Performance comparison and decision guide

### GitHub Issues & Discussions

9. **Pinia Discussion #2175 - Store property not hydrated from server to client**
   https://github.com/vuejs/pinia/discussions/2175
   Setup Stores hydration issues

10. **Nuxt Issue #25323 - Remove support for process.server/process.client**
    https://github.com/nuxt/nuxt/issues/25323
    Migration to import.meta.client

11. **Pinia Issue #2284 - Cannot find module pinia\dist\pinia (Vercel)**
    https://github.com/vuejs/pinia/issues/2284
    Vercel deployment issues

### Example Implementations

12. **GitHub - selemondev/prime-store**
    https://github.com/selemondev/prime-store
    Nuxt 3 shopping cart with PrimeVue and Pinia

13. **GitHub - ztxone/nuxt3-ts-pinia-vite-shopping-cart**
    https://github.com/ztxone/nuxt3-ts-pinia-vite-shopping-cart
    Nuxt 3 + Pinia + TypeScript shopping cart

14. **DEV.to - Managing state with Pinia and Nuxt 3 (Add to Cart)**
    https://dev.to/hannahadora/managing-state-with-pinia-and-nuxt-3-using-a-simple-add-to-cart-instance-1faf
    Simple cart implementation tutorial

### Stack Overflow Discussions

15. **StackOverflow - Nuxt 3, Pinia vs useState()**
    https://stackoverflow.com/questions/72081334/nuxt-3-pinia-vs-usestate
    When to use each approach

16. **StackOverflow - is storing jwt token in cookies in nuxt js a best option**
    https://stackoverflow.com/questions/69969455/is-storing-jwt-token-in-cookies-in-nuxt-js-a-best-option-cause-ssr-doesnt-suppor
    Cookies vs localStorage security comparison

17. **StackOverflow - localStorage in Nuxt.js is not working in SSR mode**
    https://stackoverflow.com/questions/67136558/localstorage-in-nuxt-js-is-not-working-in-ssr-mode
    Common localStorage SSR issues

---

## Conclusion

The Moldova Direct cart implementation has a solid foundation with Pinia and modular architecture. However, **critical SSR compatibility issues** must be addressed before production deployment on Vercel:

### Must-Fix Issues (P1)
1. Migrate from localStorage to cookies
2. Replace deprecated `process.client` with `import.meta.client`
3. Remove duplicate initialization
4. Install and configure `@pinia-plugin-persistedstate/nuxt`

### High-Priority Improvements (P2)
1. Consider Option Store pattern for better hydration
2. Optimize cart data structure (IDs only in cookies)
3. Add SSR-specific test coverage

### Recommended Next Steps
1. Review this research document with the team
2. Create implementation tasks for P1 fixes
3. Test on Vercel preview deployments
4. Monitor for hydration errors in production

**Estimated Effort**: 2-3 days for P1 fixes + testing

---

**Research compiled by**: Claude Code (Anthropic)
**Based on**: Official documentation, community best practices, and real-world implementations
**Last updated**: 2025-11-16
