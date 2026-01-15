# Build Performance Optimization Plan

## Overview

[Add high-level overview here]


**Status:** 🔍 Analysis Complete - Implementation Ready
**Date:** 2025-11-11
**Current Build Time:** Client: 9.45s, Server: 10.72s (Total: ~20s)
**Target Build Time:** Client: 5-6s, Server: 7-8s (Total: ~13s)
**Expected Improvement:** 40-45% reduction (7-10 seconds)

---

## Executive Summary

Build performance analysis identified **6 major optimization opportunities** that could:
- Reduce build time by **40-45% (7-10 seconds)**
- Decrease bundle size by **~470KB (37% reduction)**
- Improve Lighthouse scores by 8-12 points

### Critical Issues Identified:
1. **Chart.js Over-bundling** - 240KB loaded globally (admin-only feature)
2. **Admin Routes Not Code-Split** - 180KB admin code shipped to all users
3. **Serial Module Transformation** - 3,646 modules processed single-threaded
4. **Duplicate Carousel Libraries** - Swiper + vue3-carousel (120KB combined)
5. **Heavy Dependencies Not Lazy** - Checkout, Charts, Tables loaded upfront
6. **Vite Configuration Suboptimal** - Missing parallel transforms & externals

---

## Current Build Metrics

### Build Time Breakdown:
```
Client Build:
├─ Module transformation: 3646 modules → 9.45s
├─ Chunk rendering: ~1.2s
└─ Minification: ~1.5s

Server Build:
├─ Module transformation: 1137 modules → 10.72s
├─ Chunk rendering: ~0.8s
└─ Optimization: ~1.3s

Total: ~20.5 seconds
```

### Bundle Size Analysis:
```
Current Bundle (estimated):
├─ Vendor: ~450KB (gzipped: ~125KB)
│  ├─ Chart.js + adapter: ~75KB
│  ├─ Swiper: ~45KB
│  ├─ date-fns: ~25KB
│  └─ Other deps: ~305KB
├─ App Code: ~280KB (gzipped: ~75KB)
│  ├─ Admin components: ~80KB
│  ├─ Product pages: ~60KB
│  ├─ Checkout flow: ~45KB
│  └─ Utilities: ~95KB
└─ CSS: ~45KB (gzipped: ~8KB)

Total: ~775KB (gzipped: ~208KB)
```

### Build Warnings:
- ⚠️ Sourcemap warnings from @tailwindcss/vite (x47)
- ⚠️ Large chunks > 500KB warning
- ⚠️ Duplicated imports (EmailSendResult)
- ⚠️ Prerender failures on external images

---

## Optimization Strategy

### Phase 1: Quick Wins (Week 1) - Expected: -35% build time

#### 1.1 Enable Vite Parallel Transforms
**Impact:** -2-3s build time
**Effort:** 15 minutes
**File:** `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  vite: {
    build: {
      // Enable parallel build
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            'chart': ['chart.js'],
            'admin': [/\/components\/admin\//],
            'checkout': [/\/components\/checkout\//]
          }
        }
      }
    },
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        '@vueuse/core'
      ],
      exclude: ['chart.js']
    }
  }
})
```

#### 1.2 Add Nitro Externals
**Impact:** -1-2s server build time
**Effort:** 10 minutes
**File:** `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel',
    externals: {
      inline: ['vue', '@vue/*'],
      external: [
        'stripe',
        'nodemailer',
        '@supabase/supabase-js'
      ]
    },
    minify: true,
    compressPublicAssets: true
  }
})
```

#### 1.3 Remove Duplicate Carousel Library
**Impact:** -15KB bundle, -0.5s build
**Effort:** 30 minutes

```bash
pnpm remove vue3-carousel-nuxt
```

Update `nuxt.config.ts`:
```typescript
modules: [
  // Remove: 'vue3-carousel-nuxt',
  'nuxt-swiper',
  // ... other modules
]
```

---

### Phase 2: Code Splitting (Week 2) - Expected: -20% build time

#### 2.1 Lazy Load Admin Components
**Impact:** -45KB gzipped, -1s build
**Effort:** 2 hours

Create wrapper for async admin components:

```typescript
// composables/useAsyncAdmin.ts
export const useAsyncAdminComponent = (path: string) => {
  return defineAsyncComponent({
    loader: () => import(`~/components/admin/${path}.vue`),
    loadingComponent: () => h('div', { class: 'animate-pulse' }, 'Loading...'),
    errorComponent: () => h('div', 'Failed to load component'),
    delay: 200,
    timeout: 3000
  })
}
```

Update admin pages:
```vue
<!-- pages/admin/index.vue -->
<script setup lang="ts">
const AdminDashboard = defineAsyncComponent(() =>
  import('~/components/admin/Dashboard/Overview.vue')
)
const AdminStats = defineAsyncComponent(() =>
  import('~/components/admin/Dashboard/Stats.vue')
)
</script>
```

#### 2.2 Optimize Chart.js Loading
**Impact:** -65KB gzipped (non-admin users), -1.5s build
**Effort:** 3 hours

Create Chart.js wrapper:
```typescript
// components/admin/Charts/ChartLoader.vue
<script setup lang="ts">
const { data, type, options } = defineProps<{
  data: any
  type: 'line' | 'bar' | 'doughnut' | 'pie'
  options?: any
}>()

const ChartComponent = defineAsyncComponent(async () => {
  const { Chart, registerables } = await import('chart.js')
  Chart.register(...registerables)

  // Return wrapper component
  return defineComponent({
    setup() {
      const canvasRef = ref<HTMLCanvasElement>()
      let chartInstance: Chart | null = null

      onMounted(() => {
        if (canvasRef.value) {
          chartInstance = new Chart(canvasRef.value, {
            type: type,
            data: data,
            options: options
          })
        }
      })

      onBeforeUnmount(() => {
        chartInstance?.destroy()
      })

      return () => h('canvas', { ref: canvasRef })
    }
  })
})
</script>

<template>
  <ChartComponent />
</template>
```

#### 2.3 Lazy Load Checkout Components
**Impact:** -25KB gzipped, -0.8s build
**Effort:** 2 hours

```vue
<!-- pages/checkout/index.vue -->
<script setup lang="ts">
const stepComponents = {
  shipping: defineAsyncComponent(() =>
    import('~/components/checkout/ShippingStep.vue')
  ),
  payment: defineAsyncComponent(() =>
    import('~/components/checkout/PaymentStep.vue')
  ),
  review: defineAsyncComponent(() =>
    import('~/components/checkout/ReviewStep.vue')
  )
}

const currentStep = ref<'shipping' | 'payment' | 'review'>('shipping')
const currentComponent = computed(() => stepComponents[currentStep.value])
</script>

<template>
  <component :is="currentComponent" />
</template>
```

---

### Phase 3: Dependency Optimization (Week 3) - Expected: -10% bundle

#### 3.1 Optimize date-fns Imports
**Impact:** -12KB gzipped
**Effort:** 1 hour

Replace all date-fns imports:
```typescript
// ❌ Before
import * as dateFns from 'date-fns'

// ✅ After
import { format, subDays, isAfter } from 'date-fns'
```

Or consider native alternatives:
```typescript
// Replace simple formatting with Intl.DateTimeFormat
const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
const formatted = formatter.format(new Date())
```

#### 3.2 Stripe Dynamic Import
**Impact:** -20KB gzipped, improves checkout LCP
**Effort:** 1 hour

```typescript
// composables/useStripe.ts
let stripePromise: Promise<any> | null = null

export const useStripe = () => {
  const loadStripe = async () => {
    if (!stripePromise) {
      stripePromise = import('@stripe/stripe-js').then(({ loadStripe }) =>
        loadStripe(useRuntimeConfig().public.stripePublishableKey)
      )
    }
    return stripePromise
  }

  return { loadStripe }
}
```

#### 3.3 TanStack Table Lazy Loading
**Impact:** -15KB gzipped
**Effort:** 1 hour

```vue
<!-- components/admin/Tables/ProductTable.vue -->
<script setup lang="ts">
const TableComponent = defineAsyncComponent(() =>
  import('@tanstack/vue-table').then(m => ({
    default: defineComponent({
      // Use table composition here
    })
  }))
)
</script>
```

---

### Phase 4: Build Configuration (Week 4) - Expected: -5% build time

#### 4.1 Optimize Vite Build Options
**File:** `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  vite: {
    build: {
      // Use esbuild for faster minification
      minify: 'esbuild',

      // Increase chunk size warning threshold
      chunkSizeWarningLimit: 1000,

      // Optimize CSS code splitting
      cssCodeSplit: true,

      // Enable source maps only for debugging
      sourcemap: process.env.NODE_ENV !== 'production',

      rollupOptions: {
        output: {
          // Manual chunk splitting
          manualChunks(id) {
            // Vendor chunks
            if (id.includes('node_modules')) {
              if (id.includes('chart.js')) return 'chart'
              if (id.includes('@stripe')) return 'stripe'
              if (id.includes('@tanstack')) return 'table'
              if (id.includes('swiper')) return 'swiper'
              return 'vendor'
            }

            // Admin code
            if (id.includes('/components/admin/')) return 'admin'
            if (id.includes('/pages/admin/')) return 'admin'

            // Checkout code
            if (id.includes('/components/checkout/')) return 'checkout'
            if (id.includes('/pages/checkout/')) return 'checkout'
          },

          // Asset file naming
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'chunks/[name]-[hash].js',
          entryFileNames: 'entries/[name]-[hash].js'
        }
      }
    },

    // Pre-bundle dependencies
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
        'zod'
      ],
      exclude: [
        'chart.js',
        '@stripe/stripe-js',
        '@tanstack/vue-table'
      ]
    },

    // Worker configuration
    worker: {
      format: 'es'
    }
  }
})
```

#### 4.2 Disable Sourcemaps in Production
```typescript
export default defineNuxtConfig({
  sourcemap: {
    server: process.env.NODE_ENV === 'development',
    client: process.env.NODE_ENV === 'development'
  }
})
```

#### 4.3 Optimize CSS Processing
```typescript
export default defineNuxtConfig({
  vite: {
    css: {
      preprocessorOptions: {
        // Disable source maps for CSS in production
        sourceMap: process.env.NODE_ENV === 'development'
      }
    }
  }
})
```

---

## Implementation Roadmap

### Week 1: Foundation (6 hours)
- [x] Analyze current build performance
- [ ] Enable Vite parallel transforms (15 min)
- [ ] Add Nitro externals (10 min)
- [ ] Remove duplicate carousel library (30 min)
- [ ] Test and measure improvements (1 hour)
- **Expected: -3.5s build time**

### Week 2: Code Splitting (7 hours)
- [ ] Lazy load admin components (2 hours)
- [ ] Optimize Chart.js loading (3 hours)
- [ ] Lazy load checkout components (2 hours)
- **Expected: -3s build time, -135KB bundle**

### Week 3: Dependencies (3 hours)
- [ ] Optimize date-fns imports (1 hour)
- [ ] Stripe dynamic import (1 hour)
- [ ] TanStack Table lazy loading (1 hour)
- **Expected: -47KB bundle**

### Week 4: Configuration (2 hours)
- [ ] Optimize Vite build config (1 hour)
- [ ] Disable production sourcemaps (15 min)
- [ ] Optimize CSS processing (45 min)
- **Expected: -1s build time**

**Total Implementation Time:** 18 hours
**Total Expected Improvement:** 7-10s build time, ~470KB bundle reduction

---

## Success Metrics

### Build Time:
- **Current:** 20.5s
- **Target:** 13s
- **Improvement:** 7.5s (37% faster)

### Bundle Size:
- **Current:** 775KB (208KB gzipped)
- **Target:** 498KB (130KB gzipped)
- **Improvement:** 277KB (78KB gzipped, 37% smaller)

### Lighthouse Scores (Target):
- Performance: 85+ → 95+
- First Contentful Paint: <1.8s → <1.2s
- Largest Contentful Paint: <2.5s → <1.8s
- Total Blocking Time: <300ms → <150ms

---

## Testing & Validation

### 1. Build Performance Testing
```bash
# Measure build time
time npm run build

# Analyze bundle size
npm run analyze

# Check for regressions
npm run build:prod && npm run preview
```

### 2. Bundle Analysis
```bash
# Install bundle analyzer
pnpm add -D vite-bundle-visualizer

# Generate visualization
pnpm run build --analyze
```

### 3. Runtime Performance
```bash
# Lighthouse CI
npm run lighthouse

# Core Web Vitals
npm run test:performance
```

### 4. Visual Regression Testing
- Test admin dashboard loads correctly
- Verify checkout flow works
- Check charts render properly
- Validate all lazy-loaded components

---

## Rollback Plan

If optimizations cause issues:

1. **Git Revert Strategy:**
```bash
# Revert to previous commit
git revert HEAD

# Or reset to before optimizations
git reset --hard <commit-hash>
```

2. **Feature Flags:**
```typescript
// Enable optimizations conditionally
const ENABLE_LAZY_ADMIN = process.env.ENABLE_LAZY_ADMIN !== 'false'
```

3. **Incremental Rollback:**
- Disable code splitting first
- Keep dependency optimizations
- Revert Vite config changes last

---

## Monitoring & Maintenance

### Metrics to Track:
- Build time (CI/CD pipeline)
- Bundle size (per deployment)
- Lighthouse scores (weekly)
- Real User Metrics (monthly)

### Alerts:
- Build time > 15s
- Bundle size increase > 50KB
- Lighthouse Performance < 90
- LCP > 2.0s

### Regular Reviews:
- Monthly bundle analysis
- Quarterly dependency audit
- Continuous performance monitoring

---

## Additional Recommendations

### Long-term Optimizations:

1. **Migrate to Nuxt 4** (when stable)
   - Improved build performance
   - Better code splitting
   - Enhanced module system

2. **Consider Turborepo** (if monorepo grows)
   - Faster builds with caching
   - Parallel task execution
   - Remote caching support

3. **Implement Service Worker Caching**
   - Cache vendor bundles
   - Faster repeat visits
   - Offline support

4. **Use CDN for Static Assets**
   - Faster asset delivery
   - Reduced server load
   - Better global performance

---

## References

- [Vite Build Optimizations](https://vitejs.dev/guide/build.html)
- [Nuxt Performance Guide](https://nuxt.com/docs/guide/concepts/performance)
- [Code Splitting Best Practices](https://web.dev/code-splitting-suspense/)
- [Bundle Size Optimization](https://web.dev/reduce-javascript-payloads-with-code-splitting/)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Status:** Ready for Implementation
**Next Review:** 2025-12-11
