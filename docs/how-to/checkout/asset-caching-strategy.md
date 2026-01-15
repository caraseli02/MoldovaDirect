# Asset Caching Strategy


## Overview

This document describes the optimized asset naming and long-term caching strategy implemented for Moldova Direct. The strategy is designed to maximize cache hit rates, improve performance, and ensure efficient cache invalidation when assets change.

## Problem Statement

The previous configuration had basic chunk splitting but lacked:
- Organized asset file naming by type
- Immutable cache headers for hash-based assets
- Granular vendor chunk splitting
- Optimized cache invalidation strategy

This resulted in:
- Suboptimal cache hit rates
- Larger vendor bundles than necessary
- Inefficient cache invalidation

## Solution

### 1. Asset File Naming Strategy

Assets are now organized by type with content-based hashing:

```typescript
assetFileNames: (assetInfo) => {
  const info = assetInfo.name.split('.')
  const ext = info[info.length - 1]

  if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
    return 'assets/images/[name]-[hash][extname]'
  } else if (/woff2?|ttf|otf|eot/i.test(ext)) {
    return 'assets/fonts/[name]-[hash][extname]'
  } else if (/css/i.test(ext)) {
    return 'assets/css/[name]-[hash][extname]'
  }
  return 'assets/[name]-[hash][extname]'
}
```

#### Directory Structure

```
.output/public/
├── assets/
│   ├── css/
│   │   └── [name]-[hash].css
│   ├── fonts/
│   │   └── [name]-[hash].woff2
│   └── images/
│       └── [name]-[hash].png
├── chunks/
│   ├── vendor-vue-[hash].js
│   ├── vendor-chart-[hash].js
│   └── feature-admin-[hash].js
└── entries/
    └── [name]-[hash].js
```

### 2. Chunk Naming Strategy

Chunks are organized with descriptive names and content hashes:

```typescript
chunkFileNames: 'chunks/[name]-[hash].js'
entryFileNames: 'entries/[name]-[hash].js'
```

Benefits:
- Clear separation between chunks and entries
- Easy to identify chunk purpose in DevTools
- Content-based hashing ensures cache invalidation

### 3. Vendor Chunk Splitting

Vendors are split into granular chunks for better caching:

```typescript
manualChunks(id) {
  if (id.includes('node_modules')) {
    // Large packages get their own chunks
    if (id.includes('chart.js')) return 'vendor-chart'
    if (id.includes('@stripe')) return 'vendor-stripe'
    if (id.includes('@tanstack')) return 'vendor-table'
    if (id.includes('swiper')) return 'vendor-swiper'

    // Vue ecosystem packages together
    if (id.includes('vue') || id.includes('@vue')) return 'vendor-vue'
    if (id.includes('pinia')) return 'vendor-pinia'

    // Smaller packages together
    return 'vendor-misc'
  }

  // Feature-based splitting
  if (id.includes('/components/admin/')) return 'feature-admin'
  if (id.includes('/pages/admin/')) return 'feature-admin'

  if (id.includes('/components/checkout/')) return 'feature-checkout'
  if (id.includes('/pages/checkout/')) return 'feature-checkout'
}
```

#### Chunk Strategy Rationale

**Large Packages (Separate Chunks)**
- `vendor-chart`: Chart.js (~170KB) - Only loaded on admin pages
- `vendor-stripe`: Stripe SDK (~50KB) - Only loaded on checkout
- `vendor-table`: TanStack Table (~80KB) - Only loaded on admin tables
- `vendor-swiper`: Swiper (~100KB) - Only loaded on product galleries

**Vue Ecosystem (Grouped)**
- `vendor-vue`: Core Vue packages used everywhere
- `vendor-pinia`: State management used across the app

**Miscellaneous (Grouped)**
- `vendor-misc`: Small utilities and helpers

**Feature Chunks**
- `feature-admin`: Admin-specific code (lazy loaded)
- `feature-checkout`: Checkout-specific code (lazy loaded)

### 4. Cache Headers Strategy

Immutable cache headers are applied to all hash-based assets:

```typescript
routeRules: {
  '/assets/**': {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  '/_nuxt/**': {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  '/chunks/**': {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  '/entries/**': {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  }
}
```

#### Cache Header Configuration

**max-age=31536000 (1 year)**
- Maximum recommended cache duration
- Assets never expire until browser cache is cleared
- Safe because content hash changes when content changes

**immutable**
- Tells browser the file will never change
- Prevents conditional revalidation requests
- Reduces server load and improves performance

**public**
- Allows caching by both browser and CDN
- Maximizes cache hit rates across users

## Benefits

### 1. Improved Cache Hit Rates

**Before**: Single vendor chunk invalidated on any dependency update
**After**: Only changed vendor chunks invalidate

Example:
- Update Chart.js → Only `vendor-chart-[newhash].js` changes
- Other vendor chunks remain cached

### 2. Better Performance

- **Parallel Downloads**: Multiple smaller chunks download in parallel
- **Faster Updates**: Users only download changed chunks
- **Reduced Bandwidth**: No re-downloading unchanged vendor code

### 3. Optimized Bundle Size

**Chunk Size Comparison** (estimated):
```
vendor-vue:      ~150KB (core Vue)
vendor-chart:    ~170KB (Chart.js)
vendor-stripe:   ~50KB  (Stripe)
vendor-table:    ~80KB  (TanStack)
vendor-swiper:   ~100KB (Swiper)
vendor-pinia:    ~30KB  (Pinia)
vendor-misc:     ~100KB (utilities)
feature-admin:   ~50KB  (admin code)
feature-checkout: ~40KB (checkout code)
```

Total vendor size: ~770KB
- Previously: ~770KB in 1-2 chunks
- Now: ~770KB split across 9 chunks

### 4. Vercel Edge Network Integration

The strategy is optimized for Vercel's Edge Network:

- Hash-based URLs are cached at edge nodes
- Immutable headers prevent unnecessary revalidation
- Geographic distribution reduces latency

## Testing & Verification

### Local Development

```bash
# Build the application
pnpm build

# Check output structure
ls -R .output/public/

# Expected structure:
# .output/public/
# ├── assets/
# │   ├── css/
# │   ├── fonts/
# │   └── images/
# ├── chunks/
# └── entries/
```

### Production Verification

1. **Check Cache Headers**
```bash
curl -I https://moldovadirect.com/_nuxt/[hash].js
# Should return:
# Cache-Control: public, max-age=31536000, immutable
```

2. **Verify Asset Organization**
- Open DevTools → Network tab
- Check that assets are organized by type:
  - `/assets/css/` for CSS
  - `/assets/images/` for images
  - `/chunks/` for code chunks
  - `/entries/` for entry points

3. **Test Cache Invalidation**
- Make a change to admin code
- Build and deploy
- Verify only `feature-admin-[newhash].js` changed
- Other chunks should maintain same hash

### Performance Metrics

Monitor these metrics in production:

1. **Cache Hit Rate**
   - Target: >90% for vendor chunks
   - Measure: CloudFlare/Vercel analytics

2. **Bundle Size**
   - Target: <200KB initial load
   - Measure: Chrome DevTools Coverage

3. **Page Load Time**
   - Target: <2s for first contentful paint
   - Measure: Lighthouse/WebPageTest

## Troubleshooting

### Problem: Assets Not Cached

**Symptom**: Browser re-downloads assets on every visit

**Solution**:
1. Check that assets have content hash in filename
2. Verify cache headers are present
3. Ensure Vercel deployment succeeded

### Problem: Large Vendor Chunks

**Symptom**: Individual vendor chunks exceed 200KB

**Solution**:
1. Identify large dependency with bundle analyzer
2. Add specific chunk rule in `manualChunks`
3. Consider lazy loading if possible

### Problem: Too Many Chunks

**Symptom**: >15 parallel chunk downloads

**Solution**:
1. Group smaller related packages together
2. Adjust `chunkSizeWarningLimit` if needed
3. Use HTTP/2 server push for critical chunks

## Future Improvements

### 1. Preload Critical Chunks

```typescript
// In nuxt.config.ts
experimental: {
  resourceHints: {
    preload: [
      'vendor-vue',
      'vendor-pinia'
    ]
  }
}
```

### 2. Service Worker Caching

```typescript
// In pwa configuration
workbox: {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/moldovadirect\.com\/_nuxt\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'nuxt-assets',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        }
      }
    }
  ]
}
```

### 3. Bundle Analysis

Add bundle analyzer to monitor chunk sizes:

```bash
pnpm add -D rollup-plugin-visualizer
```

```typescript
// In nuxt.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

vite: {
  plugins: [
    visualizer({
      filename: './dist/stats.html',
      open: true
    })
  ]
}
```

## References

- [Vite Build Options](https://vitejs.dev/config/build-options.html)
- [Rollup Output Options](https://rollupjs.org/configuration-options/#output-manualchunks)
- [HTTP Caching Best Practices](https://web.dev/http-cache/)
- [Cache-Control Immutable](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#immutable)
- [Vercel Edge Network](https://vercel.com/docs/concepts/edge-network/overview)

## Version History

- **v1.0** (2025-01-11): Initial implementation
  - Added organized asset naming by type
  - Implemented granular vendor chunk splitting
  - Configured immutable cache headers
  - Optimized for Vercel Edge Network
