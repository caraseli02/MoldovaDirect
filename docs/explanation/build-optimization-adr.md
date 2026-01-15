# ADR: Build Architecture Optimization Strategy

## Overview

[Add high-level overview here]


**Date:** 2025-11-11
**Status:** Proposed
**Context:** Nuxt 3.20.1 with Vite 7.2.2, Vercel deployment
**Current Build Time:** ~10s client + server

## Executive Summary

Build analysis reveals several optimization opportunities:
- **Critical:** 540KB chunk exceeding recommended 500KB limit
- **Warning:** Prerender failures for 2 image assets
- **Issue:** Dynamic import conflicts with testUserPersonas
- **Opportunity:** Minimal Vite build optimizations configured
- **Issue:** Limited caching strategy (only 6 cached files)

## Current Architecture Analysis

### 1. Bundle Analysis

**Largest Chunks:**
```
Dx3-dxwa.js    540.60 KB (159.36 KB gzip) ⚠️ TOO LARGE
xbwIke2l.js    248.74 KB (79.36 KB gzip)
KCXceC5p.js    201.49 KB (67.65 KB gzip)
DjUBIFIi.js    125.50 KB (25.70 KB gzip)
DvZ_oG60.js    124.33 KB (26.39 KB gzip)
CbV7DpsU.js    120.98 KB (24.94 KB gzip)
BQvRts6U.js    107.85 KB (22.66 KB gzip)
```

**Issues Identified:**
1. **Oversized Main Chunk (540KB):** Likely contains all dependencies without proper code splitting
2. **Mixed Import Strategy:** Dynamic + static imports causing conflicts
3. **Test Code in Production:** Test utilities being bundled

### 2. Vite Configuration Gaps

**Currently Missing:**
- Manual chunk splitting configuration
- Build optimization options
- Rollup output customization
- Source map optimization
- Worker optimization

**Current Config:**
```typescript
vite: {
  plugins: [tailwindcss()],
  ssr: {
    noExternal: ["vue", "@vue/*"],
  },
  server: { watch: { ... } }
}
// Missing: build.rollupOptions, build.chunkSizeWarningLimit, etc.
```

### 3. Nitro Preset Configuration

**Current Settings:**
```typescript
nitro: {
  preset: "vercel",
  ignore: ["**/*.test.ts", "**/*.spec.ts", "**/__tests__/**"],
  externals: {
    external: [],
    inline: ["vue", "@vue/*"],
  },
}
```

**Analysis:**
- ✅ Good: Test files excluded
- ✅ Good: Vue inlined for SSR
- ⚠️ Missing: Compression settings
- ⚠️ Missing: Minification options
- ⚠️ Missing: Prerender error handling

### 4. Prerender Issues

**Failing Routes:**
```
/_ipx/q_80/https://images.unsplash.com/photo-1566754436750-9393f43f02b3
/_ipx/q_80/https://images.unsplash.com/photo-1606787365614-d990e8c69f0e
```

**Root Cause:** Images referenced in landing page but returning 404 during prerender

### 5. Module Resolution Issues

**Warning:** testUserPersonas causing dynamic/static import conflict
```
stores/auth.ts: dynamic import
plugins/testUserDevTools.client.ts: static import
lib/testing/simulationHelpers.ts: static import
```

### 6. Cache Analysis

**Current State:**
- Only 6 files in `.nuxt/cache`
- No `.vite` cache directory exists
- Limited build artifact reuse

## Decision: Comprehensive Optimization Strategy

### Phase 1: Critical Fixes (Immediate)

#### 1.1 Manual Chunk Splitting

**Goal:** Reduce main chunk from 540KB to <250KB per chunk

**Implementation:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            'vendor-vue': ['vue', 'vue-router', '@vue/runtime-core', '@vue/runtime-dom'],
            'vendor-nuxt': ['nuxt', '#app', '@nuxt/schema'],
            'vendor-ui': [
              'reka-ui',
              'class-variance-authority',
              'tailwind-merge',
              'clsx',
              'lucide-vue-next'
            ],

            // Feature chunks
            'chunk-stripe': ['@stripe/stripe-js', 'stripe'],
            'chunk-charts': ['chart.js', 'chartjs-adapter-date-fns'],
            'chunk-motion': ['@vueuse/motion', '@vueuse/core'],
            'chunk-i18n': ['@nuxtjs/i18n'],
            'chunk-supabase': ['@supabase/supabase-js'],
            'chunk-swiper': ['swiper', 'vue3-carousel-nuxt'],

            // Data management
            'chunk-store': ['pinia', '@pinia/nuxt'],
            'chunk-table': ['@tanstack/vue-table'],

            // Utilities
            'chunk-date': ['date-fns'],
            'chunk-validation': ['zod'],
            'chunk-utils': ['uuid', 'jsonwebtoken']
          },
        },
      },
      // Increase warning limit to 400KB (still enforce best practices)
      chunkSizeWarningLimit: 400,
    },
  },
})
```

**Expected Impact:**
- Main chunk: 540KB → ~180KB
- Vendor chunks: Split into 5-8 chunks of 80-120KB each
- Feature chunks: Lazy loaded on demand
- Total bundle size: Similar, but better distribution

#### 1.2 Fix Test Code Leakage

**Problem:** Test utilities bundled in production

**Solution:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    build: {
      rollupOptions: {
        external: process.env.NODE_ENV === 'production' ? [
          /\/lib\/testing\/.*/,
          /testUserPersonas/,
          /simulationHelpers/,
        ] : [],
      },
    },
  },

  // Exclude test pages in production
  nitro: {
    ignore: [
      "**/*.test.ts",
      "**/*.spec.ts",
      "**/__tests__/**",
      ...(process.env.NODE_ENV === 'production' ? [
        '**/pages/test-*.vue',
        '**/lib/testing/**',
        '**/tests/**',
      ] : []),
    ],
  },
})
```

#### 1.3 Fix Prerender Errors

**Option A: Skip Failed Images**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      failOnError: false, // Don't fail build on 404s
      ignore: [
        // Ignore failed IPX transformations
        '/_ipx/**/*photo-1566754436750*',
        '/_ipx/**/*photo-1606787365614*',
      ],
    },
  },
})
```

**Option B: Fix Image URLs** (Recommended)
```typescript
// Check and fix image URLs in landing components
// Ensure all Unsplash URLs are valid and accessible
```

### Phase 2: Performance Optimizations

#### 2.1 Enable Build Optimizations

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    build: {
      // Target modern browsers for smaller bundles
      target: 'es2020',

      // Minification
      minify: 'esbuild', // Faster than terser

      // CSS code splitting
      cssCodeSplit: true,

      // Source maps
      sourcemap: false, // Disable in production for smaller builds

      // Module preload
      modulePreload: {
        polyfill: true,
      },

      // Optimize dependencies
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
    },

    // Optimize deps
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        '@vueuse/core',
        'pinia',
        'date-fns',
        'zod',
      ],
      exclude: [
        '@nuxt/kit',
        '@nuxt/schema',
      ],
    },
  },
})
```

#### 2.2 Enhanced SSR Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    ssr: {
      noExternal: [
        'vue',
        '@vue/*',
        'reka-ui', // UI components need SSR
        'class-variance-authority',
        'tailwind-merge',
      ],
      external: [
        'sharp', // Image processing (external)
        'canvas', // Heavy deps
      ],
    },
  },
})
```

#### 2.3 Nitro Compression

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: "vercel",

    // Compression
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },

    // Minification
    minify: true,

    // Route caching
    routeRules: {
      // Static pages - prerender + long cache
      '/': {
        prerender: true,
        headers: {
          'cache-control': 'public, max-age=3600, s-maxage=3600',
        },
      },

      // Product pages - ISR with stale-while-revalidate
      '/products': {
        swr: 3600,
        isr: true,
      },
      '/products/**': {
        swr: 3600,
        isr: true,
      },

      // API routes - no caching
      '/api/**': {
        cache: false,
        headers: {
          'cache-control': 'no-cache, no-store, must-revalidate',
        },
      },

      // Static assets - long cache
      '/_nuxt/**': {
        headers: {
          'cache-control': 'public, max-age=31536000, immutable',
        },
      },
    },

    // Error handling
    prerender: {
      failOnError: false,
      crawlLinks: true,
      ignore: [
        '/admin',
        '/auth',
        '/api',
      ],
    },
  },
})
```

### Phase 3: Advanced Optimizations

#### 3.1 Module Federation (Future)

```typescript
// For micro-frontend architecture (Phase 3)
export default defineNuxtConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          // Dynamic chunk naming for better caching
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId || '';
            if (facadeModuleId.includes('node_modules')) {
              return 'vendor/[name]-[hash].js';
            }
            if (facadeModuleId.includes('components')) {
              return 'components/[name]-[hash].js';
            }
            return 'chunks/[name]-[hash].js';
          },
        },
      },
    },
  },
})
```

#### 3.2 Worker Optimization

```typescript
// For background processing
export default defineNuxtConfig({
  vite: {
    worker: {
      format: 'es',
      plugins: () => [tailwindcss()],
      rollupOptions: {
        output: {
          format: 'es',
        },
      },
    },
  },
})
```

#### 3.3 Build Cache Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    cacheDir: '.vite',
    build: {
      // Enable build cache
      cache: true,
    },
  },

  // Nuxt build cache
  buildDir: '.nuxt',

  // TypeScript cache
  typescript: {
    typeCheck: false, // Disable in dev for speed
    strict: true,
  },
})
```

## Implementation Strategy

### Priority 1 (Immediate - This Week)
1. ✅ Fix prerender errors (disable failOnError or fix URLs)
2. ✅ Implement manual chunk splitting (reduce 540KB chunk)
3. ✅ Exclude test code from production builds
4. ✅ Add basic build optimizations (minify, target)

### Priority 2 (Next Sprint)
1. Optimize SSR externals
2. Enable Nitro compression
3. Enhance route caching strategy
4. Add source map configuration

### Priority 3 (Future Optimization)
1. Module federation for micro-frontends
2. Worker optimization for background tasks
3. Advanced caching strategies
4. Performance monitoring

## Monitoring & Validation

### Metrics to Track

**Bundle Size:**
```bash
# Before optimization
Main chunk: 540KB (159KB gzip)
Total: ~2.8MB uncompressed

# Target after optimization
Largest chunk: <250KB (75KB gzip)
Total: ~2.5MB uncompressed (10% reduction)
```

**Build Time:**
```bash
# Current
Client: ~10s
Server: ~5s
Total: ~15s

# Target
Client: ~8s (20% faster via caching)
Server: ~4s
Total: ~12s
```

**Lighthouse Scores:**
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Total Blocking Time: <300ms
- Cumulative Layout Shift: <0.1

### Validation Commands

```bash
# Build analysis
npm run build -- --analyze

# Bundle size check
du -sh .nuxt/dist/client/_nuxt/*.js | sort -h | tail -10

# Cache effectiveness
find .nuxt/cache -type f | wc -l

# Lighthouse CI
npx lighthouse-ci collect --url=http://localhost:3000

# Build time tracking
time npm run build
```

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking chunk splitting | Medium | Test all routes post-deployment |
| Increased initial load time | Low | Monitor FCP/LCP metrics |
| Cache invalidation issues | Medium | Use content-based hashing |
| Prerender failures | Low | Already handled with failOnError |
| Test code leakage | High | Add production build validation |

## Rollback Plan

If optimizations cause issues:
1. Revert `vite.build.rollupOptions` configuration
2. Re-enable `prerender.failOnError` if needed
3. Remove test exclusions if causing build failures
4. Monitor error rates in Vercel dashboard

## Success Criteria

✅ Main chunk reduced from 540KB to <250KB
✅ No prerender errors in build logs
✅ Test code excluded from production bundles
✅ Build time maintained or improved
✅ Lighthouse performance score >90
✅ No increase in JavaScript execution time
✅ Zero runtime errors in production

## References

- [Vite Build Optimizations](https://vitejs.dev/guide/build.html)
- [Nuxt 3 Performance](https://nuxt.com/docs/guide/concepts/rendering)
- [Rollup Manual Chunks](https://rollupjs.org/configuration-options/#output-manualchunks)
- [Vercel Build Configuration](https://vercel.com/docs/frameworks/nuxt)
- [Web Vitals Thresholds](https://web.dev/vitals/)

## Next Steps

1. Review and approve Phase 1 changes
2. Create feature branch: `feat/build-optimization`
3. Implement Phase 1 optimizations
4. Run build analysis and validation
5. Deploy to preview environment
6. Validate performance metrics
7. Merge to main after approval
