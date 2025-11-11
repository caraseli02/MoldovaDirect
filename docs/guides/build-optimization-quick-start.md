# Build Optimization Quick Start Guide

This guide provides step-by-step instructions for implementing the build configuration improvements identified in the review.

## 📋 Prerequisites

- [x] Read the [Build Configuration Review](../architecture/build-configuration-review.md)
- [x] Current branch: `feat/admin-page`
- [x] All changes committed (clean working tree)
- [x] Node.js 22.4.0+ and pnpm 9.0.0+ installed

## 🚀 Implementation Steps

### Phase 1: Critical Fixes (30 minutes)

#### 1. Fix Duplicate Email Types (5 min)

**Status:** ✅ File already created at `server/utils/types/email.ts`

**Apply changes:**

```bash
# 1. The shared type file is already created
# 2. Update orderEmails.ts
```

Edit `/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/feature-adminPage/server/utils/orderEmails.ts`:

```typescript
// Remove lines 18-26 (existing EmailSendResult interface)
// Add at top of file:
import type { EmailSendResult, EmailSendOptions } from './types/email'

// Remove lines 32-34 (existing EmailSendOptions interface)
// It's now imported from types/email
```

Edit `/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/feature-adminPage/server/utils/supportEmails.ts`:

```typescript
// Remove lines 18-26 (existing EmailSendResult interface)
// Remove lines 28-30 (existing EmailSendOptions interface)
// Add at top of file:
import type { EmailSendResult, EmailSendOptions } from './types/email'
```

**Test:**
```bash
npm run build 2>&1 | grep "Duplicated imports"
# Should NOT show EmailSendResult warning
```

---

#### 2. Fix Component ENOTDIR Errors (10 min)

Edit `nuxt.config.ts` - Update the `BASE_COMPONENT_DIRS` constant:

```typescript
const BASE_COMPONENT_DIRS = [
  {
    path: "~/components",
    pathPrefix: true,
    extensions: ["vue"],
    // ✅ ADD THIS LINE:
    pattern: "**/*.vue",
    ignore: [
      "ui/**",
      "**/index.ts",
      // ✅ ADD THESE LINES:
      "**/*.test.vue",
      "**/*.stories.vue",
      "**/*.spec.vue"
    ],
    // ✅ ADD THESE LINES:
    watch: true,
    transpile: false
  }
];
```

**Test:**
```bash
npm run build 2>&1 | grep "ENOTDIR"
# Should show 0 errors
```

---

#### 3. Add Manual Chunk Splitting (10 min)

Edit `nuxt.config.ts` - Update the `vite` section:

```typescript
vite: {
  plugins: [tailwindcss()],

  // ✅ ADD THIS ENTIRE BUILD SECTION:
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'swiper': ['swiper'],
          'charts': ['chart.js', 'chartjs-adapter-date-fns'],
          'motion': ['@vueuse/motion'],
          'ui-table': ['@tanstack/vue-table'],
          'stripe': ['@stripe/stripe-js'],
          'ui-primitives': ['reka-ui', 'class-variance-authority']
        }
      }
    },
    chunkSizeWarningLimit: 400,
    reportCompressedSize: true,
    sourcemap: process.env.NODE_ENV !== 'production'
  },

  ssr: {
    noExternal: ["vue", "@vue/*"]
  },
  // ... rest of vite config
}
```

**Test:**
```bash
npm run build 2>&1 | grep "larger than 500 kB"
# Should show 0 warnings (or check actual chunk sizes)

# Check largest chunks
ls -lh .nuxt/dist/client/_nuxt/*.js | sort -k5 -hr | head -5
# Should see multiple smaller chunks instead of one 528KB file
```

---

#### 4. Fix Dynamic Import Warning (5 min)

Edit `lib/testing/simulationHelpers.ts`:

```typescript
// ❌ REMOVE any static imports of testUserPersonas
// import { testUserPersonas, type TestUserPersonaKey } from './testUserPersonas'

// ✅ ADD: Keep only type imports
import type { TestUserPersonaKey, TestUserPersona } from './testUserPersonas'

// ✅ UPDATE functions to use dynamic imports:
export async function getPersona(key: TestUserPersonaKey): Promise<TestUserPersona> {
  const { testUserPersonas } = await import('./testUserPersonas')
  return testUserPersonas[key]
}

// Apply similar pattern to all functions in this file
```

**Test:**
```bash
npm run build 2>&1 | grep "dynamically imported"
# Should NOT show testUserPersonas warning
```

---

### Phase 2: Quick Wins (20 minutes)

#### 5. Optimize Nitro Configuration (2 min)

Edit `nuxt.config.ts` - Update the `nitro` section:

```typescript
nitro: {
  preset: "vercel",
  // ✅ ADD THESE LINES:
  minify: true,
  sourceMap: process.env.NODE_ENV !== 'production',
  ignore: [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/__tests__/**"
  ],
  externals: {
    inline: ["vue", "@vue/*"]
  },
  // ✅ ADD THESE LINES:
  compressPublicAssets: true,
  experimental: {
    asyncContext: true
  }
}
```

---

#### 6. Enhanced Route Rules (5 min)

Edit `nuxt.config.ts` - Replace `routeRules` section:

```typescript
routeRules: {
  // Static pages
  '/': { swr: 3600, prerender: true },
  '/about': { prerender: true },
  '/wine-story': { prerender: true },

  // Product pages with ISR
  '/products': { swr: 3600, prerender: true },
  '/products/**': {
    swr: 3600,
    isr: 3600  // ✅ NEW
  },

  // ✅ NEW: Cart & checkout - always fresh
  '/cart': { ssr: true, swr: false },
  '/checkout': { ssr: true, swr: false },
  '/checkout/**': { ssr: true, swr: false },

  // ✅ NEW: Auth pages - static
  '/auth/**': { prerender: true },

  // ✅ NEW: Account pages - always fresh
  '/account/**': { ssr: true, swr: false },

  // ✅ NEW: API routes - never cache
  '/api/**': { cors: true, swr: false },

  // ✅ NEW: Static assets - aggressive caching
  '/_nuxt/**': {
    headers: {
      'cache-control': 'public, max-age=31536000, immutable'
    }
  }
}
```

---

#### 7. PWA Runtime Caching (5 min)

Edit `nuxt.config.ts` - Update the `pwa.workbox` section:

```typescript
pwa: {
  registerType: "autoUpdate",
  workbox: {
    navigateFallback: "/",
    // ✅ UPDATE: Add webp/avif
    globPatterns: ["**/*.{js,css,html,png,svg,ico,webp,avif}"],

    // ✅ ADD: Runtime caching strategies
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'unsplash-images',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
          }
        }
      },
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api',
          networkTimeoutSeconds: 10
        }
      }
    ]
  },
  // ... rest of PWA config
}
```

---

#### 8. Image Module Optimization (3 min)

Edit `nuxt.config.ts` - Update the `image` section:

```typescript
image: {
  domains: ["images.unsplash.com"],
  formats: ["webp", "avif"],
  quality: 80,
  // ✅ ADD THESE LINES:
  densities: [1, 2],
  screens: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536
  },
  presets: {
    hero: {
      modifiers: {
        format: 'webp',
        quality: 85,
        fit: 'cover'
      }
    }
  },
  // ✅ ADD THESE LINES:
  ipx: {
    maxAge: 60 * 60 * 24 * 365 // 1 year
  },
  loading: 'lazy',
  placeholder: 'blur'
}
```

---

#### 9. PostCSS Optimization (5 min)

Edit `nuxt.config.ts` - Update the `postcss` section:

```typescript
postcss: {
  plugins: {
    cssnano: process.env.NODE_ENV === 'production' ? {
      preset: [
        'default',
        {
          minifyGradients: false, // Keep for Tailwind v4
          // ✅ ADD THESE LINES:
          cssDeclarationSorter: true,
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
          reduceIdents: false,
          zindex: false
        }
      ]
    } : false,
    // ✅ ADD AUTOPREFIXER:
    autoprefixer: {
      overrideBrowserslist: [
        'last 2 versions',
        'not dead',
        '> 0.2%'
      ]
    }
  }
}
```

**Install autoprefixer:**
```bash
pnpm add -D autoprefixer
```

---

### Phase 3: Testing & Validation (15 minutes)

#### Full Build Test

```bash
# 1. Clean build artifacts
rm -rf .nuxt .output

# 2. Run build
npm run build 2>&1 | tee build-output.log

# 3. Check for warnings
echo "=== Build Warnings Summary ==="
grep -c "WARN.*ENOTDIR" build-output.log || echo "✅ No ENOTDIR errors"
grep -c "Duplicated imports" build-output.log || echo "✅ No duplicate imports"
grep -c "larger than 500 kB" build-output.log || echo "✅ No large chunk warnings"
grep -c "dynamically imported" build-output.log || echo "✅ No mixed import warnings"

# 4. Check chunk sizes
echo -e "\n=== Top 5 Largest Chunks ==="
ls -lh .nuxt/dist/client/_nuxt/*.js | sort -k5 -hr | head -5 | awk '{print $5, $9}'

# 5. Count total chunks
echo -e "\n=== Chunk Statistics ==="
echo "Total JS chunks: $(ls .nuxt/dist/client/_nuxt/*.js | wc -l)"
echo "Total CSS chunks: $(ls .nuxt/dist/client/_nuxt/*.css | wc -l)"

# 6. Test production build
npm run preview &
PREVIEW_PID=$!
sleep 3

# 7. Run Lighthouse (if available)
if command -v lighthouse &> /dev/null; then
  echo -e "\n=== Running Lighthouse ==="
  npx lighthouse http://localhost:3000 \
    --only-categories=performance \
    --output=json \
    --output-path=./lighthouse-report.json \
    --quiet

  # Extract performance score
  cat lighthouse-report.json | grep -o '"score":[0-9.]*' | head -1
fi

# 8. Kill preview server
kill $PREVIEW_PID

echo -e "\n✅ Build optimization complete!"
```

---

### Phase 4: Module Review (30 minutes - Optional)

#### Check Module Usage

```bash
# 1. Check PWA feature usage
echo "=== PWA Feature Usage ==="
grep -r "registerSW\|serviceWorker\|installPrompt" pages/ components/ --include="*.vue" | wc -l
# If 0, consider removing @vite-pwa/nuxt

# 2. Check carousel usage
echo -e "\n=== Carousel Usage ==="
echo "vue3-carousel: $(grep -r "Carousel" components/ pages/ --include="*.vue" | wc -l)"
echo "Swiper: $(grep -r "Swiper\|swiper" components/ pages/ --include="*.vue" | wc -l)"
# Keep only the one that's used

# 3. Check motion library usage
echo -e "\n=== Motion Library Usage ==="
grep -r "v-motion\|useMotion" components/ pages/ --include="*.vue" | wc -l
# If < 5 uses, consider replacing with CSS animations

# 4. Check for unused dependencies
echo -e "\n=== Checking for Unused Dependencies ==="
npx depcheck --ignores="@nuxt/*,@types/*,husky,playwright,vitest,@vitest/*"
```

#### Remove Unused Modules (if identified)

Example if PWA is not used:

```bash
# 1. Remove from nuxt.config.ts modules array
# Remove: "@vite-pwa/nuxt"

# 2. Remove dependency
pnpm remove @vite-pwa/nuxt

# 3. Remove PWA configuration from nuxt.config.ts
# Delete the entire pwa: { ... } section

# 4. Test build
npm run build
```

---

## 🎯 Success Metrics

After implementing all changes, you should see:

### Build Output
- [ ] ✅ 0 ENOTDIR component errors
- [ ] ✅ 0 duplicate import warnings
- [ ] ✅ 0 chunk size warnings (>500KB)
- [ ] ✅ 0 dynamic import mixing warnings
- [ ] ⚠️  47 Tailwind sourcemap warnings (expected, harmless)

### Bundle Analysis
- [ ] ✅ Largest chunk < 400KB
- [ ] ✅ Total chunks increased (10-15 more chunks is good)
- [ ] ✅ Vendor code properly split

### Performance
- [ ] ✅ Build time: Similar or faster
- [ ] ✅ Lighthouse Performance: > 90
- [ ] ✅ First Contentful Paint: < 1.5s
- [ ] ✅ Largest Contentful Paint: < 2.5s

---

## 🔄 Rollback Plan

If something breaks:

```bash
# 1. Stash current changes
git stash

# 2. Return to previous working state
git checkout HEAD~1

# 3. Clean build artifacts
rm -rf .nuxt .output node_modules/.vite

# 4. Reinstall and rebuild
pnpm install
npm run build

# 5. If you want to recover changes
git stash pop
```

---

## 📊 Before/After Comparison

Create a comparison report:

```bash
# Before optimization
git checkout <before-commit>
npm run build 2>&1 | tee build-before.log
ls -lh .nuxt/dist/client/_nuxt/*.js | wc -l > chunks-before.txt

# After optimization
git checkout <after-commit>
npm run build 2>&1 | tee build-after.log
ls -lh .nuxt/dist/client/_nuxt/*.js | wc -l > chunks-after.txt

# Compare
diff build-before.log build-after.log
diff chunks-before.txt chunks-after.txt
```

---

## 🚨 Common Issues & Solutions

### Issue: Build fails after chunk splitting
**Solution:** Check that all dependencies are properly installed:
```bash
pnpm install
rm -rf node_modules/.vite
npm run build
```

### Issue: Tailwind styles not loading
**Solution:** Verify Tailwind v4 plugin is correctly configured:
```typescript
import tailwindcss from "@tailwindcss/vite";
vite: {
  plugins: [tailwindcss()]
}
```

### Issue: Component auto-registration not working
**Solution:** Clear Nuxt cache:
```bash
rm -rf .nuxt
npm run dev
```

### Issue: Type errors after moving EmailSendResult
**Solution:** Run TypeScript check:
```bash
npx nuxt typecheck
```

---

## 📚 Next Steps

1. **Monitor in Production:**
   - Set up bundle size monitoring in CI
   - Track Core Web Vitals with RUM
   - Monitor error rates for 48 hours

2. **Performance Budgets:**
   - Add performance budgets to CI pipeline
   - Set up alerts for bundle size increases
   - Track build time trends

3. **Documentation:**
   - Update team wiki with new configuration
   - Document manual chunking strategy
   - Create performance monitoring runbook

4. **Future Optimization:**
   - Consider route-based code splitting
   - Evaluate lazy loading for heavy components
   - Investigate dynamic import opportunities

---

## ✅ Sign-off Checklist

Before marking this task complete:

- [ ] All Phase 1 fixes implemented and tested
- [ ] All Phase 2 quick wins applied
- [ ] Full build test passed without critical warnings
- [ ] Production preview tested manually
- [ ] Lighthouse score > 90
- [ ] Build output logged for comparison
- [ ] Team notified of configuration changes
- [ ] Documentation updated
- [ ] PR created with before/after metrics
- [ ] Code review requested

---

**Estimated Total Time:** 1.5 - 2 hours
**Last Updated:** 2025-01-11
**Author:** Code Review Agent
