# Asset Optimization Quick Reference

## Quick Commands

### Build and Analyze

```bash
# Production build
pnpm build

# Check output structure
ls -R .output/public/

# View asset sizes
du -sh .output/public/*
```

### Verify Asset Organization

```bash
# Check CSS assets
ls -lh .output/public/assets/css/

# Check image assets
ls -lh .output/public/assets/images/

# Check font assets
ls -lh .output/public/assets/fonts/

# Check chunks
ls -lh .output/public/chunks/

# Check entries
ls -lh .output/public/entries/
```

## Asset Naming Patterns

| Asset Type | Pattern | Example |
|------------|---------|---------|
| CSS | `assets/css/[name]-[hash].css` | `assets/css/main-a1b2c3d4.css` |
| Images | `assets/images/[name]-[hash].ext` | `assets/images/logo-e5f6g7h8.png` |
| Fonts | `assets/fonts/[name]-[hash].ext` | `assets/fonts/inter-i9j0k1l2.woff2` |
| JS Chunks | `chunks/[name]-[hash].js` | `chunks/vendor-vue-m3n4o5p6.js` |
| JS Entries | `entries/[name]-[hash].js` | `entries/app-q7r8s9t0.js` |

## Cache Headers Cheat Sheet

| Route | Cache-Control | Max Age | Immutable |
|-------|--------------|---------|-----------|
| `/assets/**` | public | 1 year | Yes |
| `/_nuxt/**` | public | 1 year | Yes |
| `/chunks/**` | public | 1 year | Yes |
| `/entries/**` | public | 1 year | Yes |

## Vendor Chunk Map

```
vendor-vue       → Vue 3 + core Vue packages
vendor-pinia     → Pinia state management
vendor-chart     → Chart.js (admin only)
vendor-stripe    → Stripe SDK (checkout only)
vendor-table     → TanStack Table (admin only)
vendor-swiper    → Swiper carousel (products)
vendor-misc      → Other small packages
```

## Feature Chunk Map

```
feature-admin    → /components/admin/* + /pages/admin/*
feature-checkout → /components/checkout/* + /pages/checkout/*
```

## Testing Checklist

### After Build

- [ ] Assets organized in correct directories
- [ ] All assets have content hash in filename
- [ ] Chunk sizes under 200KB (except vendor-vue)
- [ ] No duplicate chunks

### After Deploy

- [ ] Cache headers present on /_nuxt/**
- [ ] Cache headers present on /assets/**
- [ ] Cache headers present on /chunks/**
- [ ] Cache headers present on /entries/**
- [ ] Assets load from CDN edge nodes

### Performance

- [ ] Cache hit rate >90% for vendor chunks
- [ ] Initial bundle <200KB
- [ ] First Contentful Paint <2s
- [ ] Time to Interactive <3s

## Debugging Commands

### Check Cache Headers (Production)

```bash
# Check _nuxt assets
curl -I https://moldovadirect.com/_nuxt/vendor-vue-[hash].js

# Check custom assets
curl -I https://moldovadirect.com/assets/css/main-[hash].css

# Expected output:
# Cache-Control: public, max-age=31536000, immutable
```

### Analyze Bundle Size

```bash
# Generate bundle analysis
pnpm build --analyze

# Or manually check sizes
du -h .output/public/chunks/* | sort -h
```

### Find Large Dependencies

```bash
# Check node_modules size
du -sh node_modules/* | sort -h | tail -20

# Analyze specific package
npm ls chart.js
npm ls @stripe/stripe-js
```

## Common Issues & Fixes

### Issue: Assets Not Cached

**Symptom**: Browser re-downloads on every visit

**Fix**:
1. Check build output for hash in filenames
2. Verify cache headers in production
3. Clear browser cache and test again

### Issue: Chunk Too Large

**Symptom**: Warning about chunk size >1000KB

**Fix**:
```typescript
// Add new vendor chunk in nuxt.config.ts
if (id.includes('large-package')) return 'vendor-large-package'
```

### Issue: Too Many Parallel Downloads

**Symptom**: >15 chunks downloading at once

**Fix**:
```typescript
// Group smaller packages together
if (id.includes('small-util-1') || id.includes('small-util-2')) {
  return 'vendor-utils'
}
```

## Performance Monitoring

### Key Metrics to Track

1. **Cache Hit Rate**
   - Vercel Analytics → Bandwidth
   - Target: >90% for assets

2. **Bundle Size**
   - Chrome DevTools → Network → Size
   - Target: <200KB initial load

3. **Load Time**
   - Lighthouse Performance Score
   - Target: >90

4. **Core Web Vitals**
   - LCP: <2.5s
   - FID: <100ms
   - CLS: <0.1

### Monitoring Tools

```bash
# Lighthouse CLI
npx lighthouse https://moldovadirect.com --view

# WebPageTest
open https://www.webpagetest.org/

# Bundle analyzer
pnpm add -D rollup-plugin-visualizer
pnpm build --analyze
```

## Optimization Workflow

### Making Changes

1. **Update Code**
   ```bash
   # Make your changes
   vim components/MyComponent.vue
   ```

2. **Build Locally**
   ```bash
   pnpm build
   ```

3. **Check Output**
   ```bash
   # Verify only changed chunks have new hash
   ls -lt .output/public/chunks/ | head -10
   ```

4. **Deploy**
   ```bash
   git push origin main
   # Vercel auto-deploys
   ```

5. **Verify**
   ```bash
   # Check cache headers
   curl -I https://moldovadirect.com/_nuxt/[new-hash].js
   ```

### Adding New Vendor Package

1. **Install Package**
   ```bash
   pnpm add new-package
   ```

2. **Update nuxt.config.ts**
   ```typescript
   if (id.includes('new-package')) return 'vendor-new-package'
   ```

3. **Build and Verify**
   ```bash
   pnpm build
   ls .output/public/chunks/vendor-new-package-*.js
   ```

## Best Practices

1. **Always use content hashing** for cache invalidation
2. **Group related packages** to reduce HTTP requests
3. **Split large packages** to improve granular caching
4. **Use immutable headers** for hash-based assets
5. **Monitor bundle sizes** regularly
6. **Test cache behavior** after changes
7. **Document new chunks** when adding vendors

## Related Documentation

- [Asset Caching Strategy](../architecture/asset-caching-strategy.md)
- [Build Optimization Guide](./build-optimization-implementation.md)
- [Nuxt Build Configuration](https://nuxt.com/docs/api/nuxt-config#build)
- [Vite Build Options](https://vitejs.dev/config/build-options.html)
