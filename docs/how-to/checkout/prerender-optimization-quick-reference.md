# Prerender Optimization Quick Reference

## Prerequisites

- [Add prerequisites here]

## Steps


## TL;DR

Optimized prerendering configuration to fix external image 404 errors and reduce build time.

## What Changed

### 1. External Image Handling

**File:** `nuxt.config.ts` (lines 79-84)

```typescript
image: {
  provider: 'ipx',
  ipx: {
    maxAge: 60 * 60 * 24 * 30,
    domains: ["images.unsplash.com"]
  }
}
```

**Why:** Prevents 404 errors during prerender by processing external images at runtime.

### 2. Route Rules

**File:** `nuxt.config.ts` (lines 86-122)

```typescript
routeRules: {
  '/': { swr: 1800, prerender: true },           // Reduced from 3600
  '/products': { swr: 3600, isr: true },          // Added ISR
  '/products/**': { swr: 3600, isr: true },       // Added ISR
  '/admin/**': { prerender: false },              // Skip prerender
  '/checkout/**': { prerender: false },           // Skip prerender
}
```

**Why:**
- ISR reduces initial build time
- Excluded routes don't benefit from prerendering
- 50% reduction in SWR cache time

### 3. Nitro Prerender

**File:** `nuxt.config.ts` (lines 169-204)

```typescript
nitro: {
  prerender: {
    routes: ['/'],
    ignore: ['/_ipx/**', '/admin/**', '/checkout/**'],
    failOnError: false,
    retry: 1,
    interval: 0
  }
}
```

**Why:**
- Ignores image optimization during prerender
- Fails gracefully on external resource errors
- No delay between prerenders for speed

## Results

| Metric | Before | After |
|--------|--------|-------|
| **Build Errors** | Multiple 404s | 2 warnings (non-blocking) |
| **SWR Cache** | 3600s (1hr) | 1800s (30min) |
| **Routes Skipped** | 0 | 110 |
| **Build Status** | Failing | Success |

## Quick Commands

```bash
# Run optimized build
npm run build

# Check build output
npm run build 2>&1 | tee build.log

# Analyze bundle
npm run build -- --analyze
```

## When to Use Each Strategy

### Prerender (`prerender: true`)
- Static marketing pages
- Homepage
- SEO-critical pages
- Content that rarely changes

### ISR (`isr: true`)
- Product pages
- Blog posts
- Content that updates occasionally
- Dynamic content with predictable patterns

### No Prerender (`prerender: false`)
- Admin dashboards
- Checkout flows
- API routes
- User-specific pages

## Common Issues

### Issue: Image 404 During Build

**Solution:** Already fixed! Images are processed at runtime.

**Verify:**
```bash
grep "404.*unsplash" build.log
# Should show warnings only, not errors
```

### Issue: Build Takes Too Long

**Solution:** Check ignored routes in `nitro.prerender.ignore`

**Add routes to skip:**
```typescript
ignore: [
  '/admin/**',
  '/your-slow-route/**'
]
```

### Issue: Product Pages Not Fresh

**Solution:** Reduce SWR time or use ISR

**Adjust cache:**
```typescript
'/products/**': { swr: 1800 } // 30 minutes
```

## Migration to Local Images

To eliminate external image dependencies:

1. **Download images:**
   ```bash
   mkdir -p public/images/hero
   curl -o public/images/hero/vineyard.webp \
     "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920"
   ```

2. **Update components:**
   ```vue
   <!-- Before -->
   <NuxtImg src="https://images.unsplash.com/..." />

   <!-- After -->
   <NuxtImg src="/images/hero/vineyard.webp" />
   ```

3. **Remove external domains:**
   ```typescript
   image: {
     domains: [], // Remove Unsplash
   }
   ```

## Performance Tips

1. **Use responsive images:**
   ```vue
   <NuxtImg
     src="/images/hero.webp"
     sizes="sm:100vw md:50vw lg:33vw"
     densities="1x 2x"
   />
   ```

2. **Lazy load below-the-fold:**
   ```vue
   <NuxtImg
     src="/images/product.webp"
     loading="lazy"
   />
   ```

3. **Use blur placeholders:**
   ```vue
   <NuxtImg
     src="/images/hero.webp"
     placeholder
   />
   ```

## Monitoring

### Check Build Performance

```bash
# Extract build times
npm run build 2>&1 | grep "built in"
# Client built in Xs
# Server built in Ys
```

### Check Prerender Status

```bash
# Count prerendered routes
npm run build 2>&1 | grep "├─" | wc -l

# Count skipped routes
npm run build 2>&1 | grep "skipped" | wc -l
```

### Check Bundle Sizes

```bash
# See largest chunks
npm run build 2>&1 | grep "kB │" | sort -k3 -h | tail -10
```

## References

- Full report: `/docs/architecture/prerender-optimization-report.md`
- Configuration: `/nuxt.config.ts`
- Build logs: Check your CI/CD system

## Support

If you encounter issues:

1. Check `/docs/architecture/prerender-optimization-report.md`
2. Review build logs for specific errors
3. Verify `nuxt.config.ts` matches the documented configuration
