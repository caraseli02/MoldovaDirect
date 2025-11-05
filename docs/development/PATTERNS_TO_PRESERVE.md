# Critical Architecture Patterns to Preserve

**Project:** MoldovaDirect
**Purpose:** Document exemplary patterns that should be preserved and replicated
**Last Updated:** 2025-11-01

---

## Overview

During architecture refactoring and improvements, these patterns represent **best-in-class implementations** that should be preserved, protected, and used as templates for future development.

---

## 🏆 Pattern 1: Modular Store Architecture (Cart Store)

**File:** `stores/cart/index.ts` + modules
**Status:** ✅ PRESERVE & REPLICATE
**Grade:** A+

### Why This Is Exemplary

The cart store demonstrates perfect application of:
- Single Responsibility Principle
- Composition over Inheritance
- Separation of Concerns
- Testability
- Backward Compatibility

### Structure

```
stores/cart/
├── index.ts           # Main coordinator (680 LOC)
├── core.ts            # State & core operations
├── persistence.ts     # LocalStorage/SessionStorage
├── validation.ts      # Background validation
├── analytics.ts       # Tracking & metrics
├── security.ts        # Rate limiting, CSRF protection
├── advanced.ts        # Bulk operations, recommendations
└── types.ts           # TypeScript definitions
```

### Key Implementation Details

#### 1. Module Composition Pattern

```typescript
// stores/cart/index.ts
export const useCartStore = defineStore('cart', () => {
  // ✅ GOOD: Initialize independent modules
  const core = useCartCore()
  const persistence = useCartPersistence()
  const validation = useCartValidation()
  const analytics = useCartAnalytics()
  const security = useCartSecurity()
  const advanced = useCartAdvanced()

  // ✅ GOOD: Compose state from multiple modules
  const items = computed(() => core.state.value.items)
  const sessionId = computed(() => core.state.value.sessionId)
  const loading = computed(() => core.state.value.loading)

  // ✅ GOOD: Coordinated actions across modules
  async function addItem(product: Product, quantity: number = 1) {
    // Security check
    if (securityEnabled.value && sessionId.value) {
      await security.secureAddItem(product.id, quantity, sessionId.value)
    }

    // Core operation
    await core.addItem(product, quantity)

    // Analytics tracking
    analytics.trackAddToCart(product, quantity, subtotal.value)

    // Persistence
    await saveAndCacheCartData()
  }

  return {
    // Unified API
    items,
    sessionId,
    addItem,
    removeItem,
    // ... module access for advanced usage
    _modules: { core, persistence, validation, analytics, security, advanced }
  }
})
```

#### 2. Single Responsibility per Module

**Core Module** (`core.ts`):
```typescript
// ✅ ONLY handles cart state and basic operations
export function useCartCore() {
  const state = ref<CartCoreState>({
    items: [],
    sessionId: generateSessionId(),
    loading: false,
    error: null,
    lastSyncAt: null
  })

  async function addItem(product: Product, quantity: number) {
    // Only cart logic, no persistence, no analytics
    const existingItem = state.value.items.find(i => i.product.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      state.value.items.push({
        id: generateItemId(),
        product,
        quantity,
        addedAt: new Date()
      })
    }
  }

  return { state, addItem, removeItem, updateQuantity }
}
```

**Persistence Module** (`persistence.ts`):
```typescript
// ✅ ONLY handles storage, no business logic
export function useCartPersistence() {
  const state = ref<CartPersistenceState>({
    storageType: 'localStorage',
    lastSaveAt: null,
    saveInProgress: false
  })

  async function saveCartData(cartData: any) {
    state.value.saveInProgress = true

    try {
      const serialized = JSON.stringify(cartData)
      localStorage.setItem('cart', serialized)
      state.value.lastSaveAt = new Date()
      return { success: true }
    } catch (error) {
      return { success: false, error }
    } finally {
      state.value.saveInProgress = false
    }
  }

  return { state, saveCartData, loadCartData, clearCartData }
}
```

#### 3. Backward Compatibility

```typescript
// ✅ GOOD: Main store maintains unified API
// Old code still works:
const cart = useCartStore()
cart.addItem(product, 2)  // Works exactly as before

// ✅ GOOD: Advanced users can access modules directly
const cart = useCartStore()
cart._modules.analytics.getConversionRate()  // Advanced usage
```

### When to Use This Pattern

**Apply to:**
- Auth store (currently 1,172 lines - needs refactoring)
- Product catalog store (if created)
- Admin dashboard store (if complex)

**Don't Apply to:**
- Simple stores (<200 lines)
- Single-purpose utilities
- Static configuration

### Template for Other Stores

```
stores/{feature}/
├── index.ts           # Main coordinator
│   └── defineStore('{feature}', () => {
│       const moduleA = useModuleA()
│       const moduleB = useModuleB()
│       // Compose and coordinate
│   })
├── core.ts            # Core state and operations
├── {concern1}.ts      # Specific concern (e.g., persistence)
├── {concern2}.ts      # Specific concern (e.g., validation)
├── {concern3}.ts      # Specific concern (e.g., analytics)
└── types.ts           # TypeScript definitions
```

---

## 🏆 Pattern 2: Composable Architecture

**Files:** `composables/*.ts` (33 composables)
**Status:** ✅ PRESERVE & EXTEND
**Grade:** A-

### Why This Is Exemplary

Demonstrates proper use of Vue 3 Composition API:
- Single responsibility
- Reusable logic
- Type-safe
- Testable in isolation

### Good Examples

#### Example 1: Simple, Focused Composable

```typescript
// composables/useToast.ts
// ✅ GOOD: Does ONE thing well
export function useToast() {
  const toast = useNuxtApp().$toast

  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
    warning: (message: string) => toast.warning(message)
  }
}
```

#### Example 2: Composable Composition

```typescript
// composables/checkout/useCheckoutReview.ts
// ✅ GOOD: Composes other composables
export function useCheckoutReview() {
  const cart = useCartStore()
  const shipping = useShippingAddress()
  const payment = useStripe()

  const total = computed(() => {
    return cart.subtotal + shipping.cost + (payment.processingFee || 0)
  })

  const isValid = computed(() => {
    return cart.items.length > 0 &&
           shipping.isValid &&
           payment.isValid
  })

  return {
    total,
    isValid,
    // Expose composed composables
    cart,
    shipping,
    payment
  }
}
```

#### Example 3: Stateful Composable with Cleanup

```typescript
// composables/usePullToRefresh.ts
// ✅ GOOD: Proper lifecycle management
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const isRefreshing = ref(false)
  const pullDistance = ref(0)

  let startY = 0
  const threshold = 80

  const handleTouchStart = (e: TouchEvent) => {
    startY = e.touches[0].clientY
  }

  const handleTouchMove = (e: TouchEvent) => {
    const currentY = e.touches[0].clientY
    const distance = currentY - startY

    if (distance > 0 && window.scrollY === 0) {
      pullDistance.value = Math.min(distance, threshold * 1.5)
      e.preventDefault()
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance.value >= threshold) {
      isRefreshing.value = true
      await onRefresh()
      isRefreshing.value = false
    }
    pullDistance.value = 0
  }

  // ✅ GOOD: Setup and cleanup
  onMounted(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
  })

  onUnmounted(() => {
    window.removeEventListener('touchstart', handleTouchStart)
    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('touchend', handleTouchEnd)
  })

  return {
    isRefreshing: readonly(isRefreshing),
    pullDistance: readonly(pullDistance)
  }
}
```

### Composable Organization

**Current Structure:** ✅ GOOD
```
composables/
├── useCart.ts              # Cart operations
├── useAuth.ts              # Authentication
├── useStripe.ts            # Payments
├── useToast.ts             # Notifications
├── useTheme.ts             # Theming
├── useDevice.ts            # Device detection
├── checkout/               # Grouped by feature
│   └── useCheckoutReview.ts
└── cart/                   # Grouped by feature
    └── useCartCore.ts
```

### Anti-Pattern to Avoid

```typescript
// ❌ BAD: Composable doing too much
export function useEverything() {
  // Don't create god composables
  const auth = useAuth()
  const cart = useCart()
  const products = useProducts()
  const analytics = useAnalytics()
  const theme = useTheme()

  // This violates single responsibility
  return { auth, cart, products, analytics, theme }
}
```

---

## 🏆 Pattern 3: i18n Implementation

**Files:** `nuxt.config.ts`, `i18n/locales/*.json`
**Status:** ✅ PRESERVE
**Grade:** A

### Why This Is Exemplary

- Properly configured for SSR
- 4 locales with complete translations
- Strategy: `prefix_except_default` (SEO-friendly)
- Browser language detection
- Cookie persistence

### Configuration

```typescript
// nuxt.config.ts
i18n: {
  locales: [
    { code: "es", name: "Español", file: "es.json" },
    { code: "en", name: "English", file: "en.json" },
    { code: "ro", name: "Română", file: "ro.json" },
    { code: "ru", name: "Русский", file: "ru.json" },
  ],
  langDir: "locales",
  defaultLocale: "es",
  strategy: "prefix_except_default",  // ✅ GOOD: /en/products, but /products (Spanish)
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: "i18n_redirected",
    redirectOn: "root",
  },
}
```

### Usage Pattern

```typescript
// ✅ GOOD: Type-safe translations
const { t, locale } = useI18n()

// In template
<h1>{{ t('products.title') }}</h1>

// In script
const productName = t('products.item.name', { name: product.name })

// Locale switching
const switchLocale = async (newLocale: string) => {
  await setLocale(newLocale)
}
```

### Translation File Structure

```json
{
  "common": {
    "loading": "Cargando...",
    "error": "Error",
    "success": "Éxito"
  },
  "products": {
    "title": "Productos",
    "addToCart": "Añadir al Carrito",
    "item": {
      "name": "{name}",
      "price": "€{price}"
    }
  }
}
```

---

## 🏆 Pattern 4: TypeScript Type Safety

**Files:** Throughout codebase
**Status:** ✅ PRESERVE & EXTEND
**Grade:** A-

### Why This Is Exemplary

- Comprehensive interfaces
- Proper type inference
- No `any` types in critical paths
- Zod schemas for runtime validation

### Good Examples

#### Example 1: Product Types

```typescript
// types/product.ts
export interface Product {
  id: string
  sku: string
  slug: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  stock: number
  isInStock: boolean
  images: string[]
  category: Category
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: number
  slug: string
  name: string
  parent?: Category
}
```

#### Example 2: API Response Types

```typescript
// types/api.ts
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

// Usage
async function fetchProduct(slug: string): Promise<ApiResponse<Product>> {
  // Type-safe response
}
```

#### Example 3: Zod Validation

```typescript
// schemas/checkout.ts
import { z } from 'zod'

export const CheckoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive().max(99)
  })),
  shippingAddress: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    postalCode: z.string().regex(/^\d{5}$/),
    country: z.string().length(2)
  }),
  paymentMethod: z.string()
})

export type CheckoutInput = z.infer<typeof CheckoutSchema>

// Usage in API
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // ✅ Runtime validation with TypeScript types
  const validated = CheckoutSchema.parse(body)
  // validated is now type CheckoutInput
})
```

---

## 🏆 Pattern 5: Component Organization

**Files:** `components/**/*.vue`
**Status:** ✅ PRESERVE
**Grade:** A-

### Structure

```
components/
├── ui/                    # shadcn-vue components (NOT auto-registered)
│   ├── button/
│   ├── card/
│   └── dialog/
├── product/               # Product-related components
│   ├── ProductCard.vue
│   ├── ProductGrid.vue
│   └── ProductDetail.vue
├── cart/                  # Cart components
│   ├── CartItem.vue
│   ├── CartSummary.vue
│   └── CartDrawer.vue
└── layout/                # Layout components
    ├── Header.vue
    ├── Footer.vue
    └── Navigation.vue
```

### Configuration

```typescript
// nuxt.config.ts
components: {
  extensions: ["vue"],  // ✅ GOOD: Only .vue files, not .ts barrels
  dirs: [
    {
      path: "~/components",
      pathPrefix: true,
      extensions: ["vue"],
      ignore: ["ui/**", "**/index.ts"],  // ✅ GOOD: Exclude shadcn-ui
    }
  ]
}
```

### Why This Works

1. **Auto-registration for app components:** `ProductCard.vue` available everywhere
2. **Manual import for UI components:** `import { Button } from '@/components/ui/button'`
3. **No barrel file confusion:** TypeScript index files not treated as components
4. **Clear organization:** Feature-based grouping

---

## 🏆 Pattern 6: PWA Configuration

**File:** `nuxt.config.ts`
**Status:** ✅ PRESERVE
**Grade:** A

### Configuration

```typescript
pwa: {
  registerType: "autoUpdate",
  workbox: {
    navigateFallback: "/",
    globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
  },
  client: {
    installPrompt: true,
    periodicSyncForUpdates: 20,  // Check every 20 seconds
  },
  manifest: {
    name: "Moldova Direct",
    short_name: "Moldova Direct",
    description: "Authentic Moldovan food and wine products delivered to Spain",
    theme_color: "#1e40af",
    background_color: "#ffffff",
    display: "standalone",
    orientation: "portrait",
    scope: "/",
    start_url: "/",
    icons: [/* ... */],
    categories: ["shopping", "food"],
    shortcuts: [
      {
        name: "Products",
        url: "/products",
        icons: [{ src: "/icon.svg", sizes: "192x192" }],
      },
      {
        name: "Cart",
        url: "/cart",
        icons: [{ src: "/icon.svg", sizes: "192x192" }],
      },
    ],
  },
}
```

### Why This Is Good

- ✅ Auto-updates when new version deployed
- ✅ Offline support with workbox
- ✅ Install prompt for mobile
- ✅ App shortcuts for common actions
- ✅ Proper manifest configuration

---

## 🏆 Pattern 7: Environment Configuration

**File:** `nuxt.config.ts`
**Status:** ✅ PRESERVE (with fix for duplicate)
**Grade:** A-

### Pattern

```typescript
runtimeConfig: {
  // ✅ GOOD: Private keys (server-side only)
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,

  // ✅ GOOD: Public keys (exposed to client)
  public: {
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.moldovadirect.com',
    enableTestUsers: process.env.ENABLE_TEST_USERS === 'true' || process.env.NODE_ENV !== 'production'
  },
}
```

### Usage

```typescript
// Server-side (full access)
const config = useRuntimeConfig()
const secretKey = config.stripeSecretKey  // ✅ Available

// Client-side (public only)
const config = useRuntimeConfig()
const publicKey = config.public.stripePublishableKey  // ✅ Available
const secretKey = config.stripeSecretKey  // ❌ Undefined
```

**Fix Required:** Remove duplicate `siteUrl` on line 48

---

## 📋 Checklist for Future Development

When adding new features, ensure:

### Store Development
- [ ] If store >200 lines, split into modules like cart store
- [ ] Each module has single responsibility
- [ ] Main store composes modules
- [ ] Backward compatible API
- [ ] Type-safe state and actions

### Composable Development
- [ ] Single purpose per composable
- [ ] Proper lifecycle management (onMounted/onUnmounted)
- [ ] Type-safe return values
- [ ] Grouped by feature if related

### Component Development
- [ ] Auto-registered if app component
- [ ] Manually imported if UI component
- [ ] Feature-based organization
- [ ] Props properly typed

### i18n Development
- [ ] Add translations to all 4 locale files
- [ ] Use `t()` for all user-facing text
- [ ] Test in all locales
- [ ] No hardcoded strings

### Type Safety
- [ ] Define interfaces before implementation
- [ ] Use Zod for runtime validation
- [ ] No `any` types in critical paths
- [ ] Proper null/undefined handling

---

## 🚫 Anti-Patterns to Avoid

### 1. God Stores (Like Current Auth Store)

```typescript
// ❌ BAD: 1,172 lines, multiple responsibilities
export const useAuthStore = defineStore('auth', () => {
  // Auth logic
  // Profile management
  // Admin checks
  // Session handling
  // Validation
  // Analytics
  // All mixed together!
})
```

**Fix:** Apply modular pattern like cart store

### 2. Direct Database Access in Components

```typescript
// ❌ BAD: Component directly querying database
<script setup>
const supabase = useSupabaseClient()
const { data } = await supabase.from('products').select('*')
</script>
```

**Fix:** Use composables or stores

```typescript
// ✅ GOOD: Component uses composable
<script setup>
const { products, loading } = useProducts()
</script>
```

### 3. Hardcoded Text

```typescript
// ❌ BAD: Hardcoded Spanish
<button>Añadir al Carrito</button>

// ✅ GOOD: i18n translation
<button>{{ t('cart.addToCart') }}</button>
```

### 4. Missing Error Handling

```typescript
// ❌ BAD: No error handling
const { data } = await supabase.from('products').select('*')

// ✅ GOOD: Proper error handling
const { data, error } = await supabase.from('products').select('*')
if (error) {
  console.error('Failed to fetch products:', error)
  throw createError({
    statusCode: 500,
    statusMessage: 'Failed to load products'
  })
}
```

---

## Conclusion

These patterns represent **architectural excellence** in the MoldovaDirect codebase. They should be:

1. **Preserved** during refactoring
2. **Replicated** in new features
3. **Referenced** in code reviews
4. **Taught** to new team members

The cart store modular architecture, in particular, should become the **standard template** for all complex stores in the application.

---

**Maintained By:** Development Team
**Review Frequency:** Quarterly
**Last Updated:** 2025-11-01
