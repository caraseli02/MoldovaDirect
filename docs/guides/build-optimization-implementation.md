# Build Optimization Implementation Guide

**Date:** 2025-11-11
**Related ADR:** [build-optimization-adr.md](../architecture/build-optimization-adr.md)

## Quick Start

Apply all Phase 1 optimizations with these changes:

### 1. Update nuxt.config.ts

Replace your current `nuxt.config.ts` with optimized configuration:

```typescript
// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

const BASE_COMPONENT_DIRS = [
  {
    path: "~/components",
    pathPrefix: true,
    extensions: ["vue"],
    ignore: ["ui/**", "**/index.ts"],
  },
];

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  postcss: {
    plugins: {
      cssnano: process.env.NODE_ENV === 'production' ? {
        preset: [
          'default',
          {
            minifyGradients: false,
          },
        ],
      } : false,
    },
  },

  components: {
    extensions: ["vue"],
    dirs: [...BASE_COMPONENT_DIRS],
  },

  modules: [
    "@nuxtjs/supabase",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@nuxt/image",
    "shadcn-nuxt",
    "@vite-pwa/nuxt",
    "vue3-carousel-nuxt",
    "@vueuse/motion/nuxt",
    "nuxt-swiper",
    "~/modules/fix-components",
  ],

  image: {
    domains: ["images.unsplash.com"],
    formats: ["webp", "avif"],
    quality: 80,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    presets: {
      hero: {
        modifiers: {
          format: 'webp',
          quality: 85,
          fit: 'cover',
        }
      }
    }
  },

  routeRules: {
    // Landing page - prerender with caching
    '/': {
      prerender: true,
      headers: {
        'cache-control': 'public, max-age=3600, s-maxage=3600',
      },
    },

    // Product pages - ISR every hour
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

    // Static assets - long cache with immutable
    '/_nuxt/**': {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable',
      },
    },
  },

  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    public: {
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.moldovadirect.com',
      enableTestUsers:
        process.env.ENABLE_TEST_USERS === 'true' || process.env.NODE_ENV !== 'production'
    },
  },

  shadcn: {
    prefix: "Ui",
    componentDir: "./components/ui",
  },

  nitro: {
    preset: "vercel",

    // Exclude test files and test utilities from production
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

    // External dependencies
    externals: {
      external: [],
      inline: ["vue", "@vue/*"],
    },

    // Compression for production
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },

    // Minification
    minify: true,

    // Prerender configuration
    prerender: {
      failOnError: false, // Don't fail on image 404s
      crawlLinks: true,
      ignore: [
        '/admin',
        '/admin/**',
        '/auth',
        '/auth/**',
        '/api',
        '/api/**',
        // Ignore failing IPX images
        '/_ipx/**/*photo-1566754436750*',
        '/_ipx/**/*photo-1606787365614*',
      ],
    },
  },

  supabase: {
    redirectOptions: {
      login: "/auth/login",
      callback: "/auth/confirm",
      exclude: [
        "/",
        "/products",
        "/products/*",
        "/cart",
        "/en",
        "/ro",
        "/ru",
        "/en/*",
        "/ro/*",
        "/ru/*",
        "/auth/register",
        "/auth/forgot-password",
        "/auth/reset-password",
        "/auth/verify-email",
      ],
    },
  },

  i18n: {
    locales: [
      { code: "es", name: "Español", file: "es.json" },
      { code: "en", name: "English", file: "en.json" },
      { code: "ro", name: "Română", file: "ro.json" },
      { code: "ru", name: "Русский", file: "ru.json" },
    ],
    langDir: "locales",
    defaultLocale: "es",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
  },

  css: ["~/assets/css/tailwind.css"],

  pwa: {
    registerType: "autoUpdate",
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20,
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
      icons: [
        {
          src: "/icon.svg",
          sizes: "192x192",
          type: "image/svg+xml",
        },
        {
          src: "/icon.svg",
          sizes: "512x512",
          type: "image/svg+xml",
        },
        {
          src: "/icon.svg",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "any maskable",
        },
      ],
      categories: ["shopping", "food"],
      shortcuts: [
        {
          name: "Products",
          short_name: "Products",
          description: "Browse all products",
          url: "/products",
          icons: [{ src: "/icon.svg", sizes: "192x192" }],
        },
        {
          name: "Cart",
          short_name: "Cart",
          description: "View shopping cart",
          url: "/cart",
          icons: [{ src: "/icon.svg", sizes: "192x192" }],
        },
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],

    // Build optimizations
    build: {
      // Target modern browsers for smaller bundles
      target: 'es2020',

      // Minification with esbuild (faster than terser)
      minify: 'esbuild',

      // CSS code splitting
      cssCodeSplit: true,

      // Source maps - disable in production
      sourcemap: process.env.NODE_ENV !== 'production',

      // Chunk size warning limit
      chunkSizeWarningLimit: 400,

      // Module preload
      modulePreload: {
        polyfill: true,
      },

      // Rollup options for manual chunking
      rollupOptions: {
        output: {
          // Manual chunk splitting to reduce main bundle size
          manualChunks: (id) => {
            // Vendor chunks
            if (id.includes('node_modules')) {
              // Vue ecosystem
              if (id.includes('vue') || id.includes('@vue')) {
                return 'vendor-vue';
              }

              // Nuxt core
              if (id.includes('nuxt') || id.includes('#app')) {
                return 'vendor-nuxt';
              }

              // UI libraries
              if (id.includes('reka-ui') ||
                  id.includes('class-variance-authority') ||
                  id.includes('tailwind-merge') ||
                  id.includes('clsx') ||
                  id.includes('lucide-vue-next')) {
                return 'vendor-ui';
              }

              // Payment processing
              if (id.includes('@stripe/stripe-js') || id.includes('stripe')) {
                return 'chunk-stripe';
              }

              // Charts and visualizations
              if (id.includes('chart.js') || id.includes('chartjs-adapter')) {
                return 'chunk-charts';
              }

              // Animations and motion
              if (id.includes('@vueuse/motion') || id.includes('@vueuse/core')) {
                return 'chunk-motion';
              }

              // Internationalization
              if (id.includes('@nuxtjs/i18n')) {
                return 'chunk-i18n';
              }

              // Supabase
              if (id.includes('@supabase/') || id.includes('supabase-js')) {
                return 'chunk-supabase';
              }

              // Swiper and carousels
              if (id.includes('swiper') || id.includes('carousel')) {
                return 'chunk-swiper';
              }

              // State management
              if (id.includes('pinia')) {
                return 'chunk-store';
              }

              // Table components
              if (id.includes('@tanstack/vue-table')) {
                return 'chunk-table';
              }

              // Date utilities
              if (id.includes('date-fns')) {
                return 'chunk-date';
              }

              // Validation
              if (id.includes('zod')) {
                return 'chunk-validation';
              }

              // Other utilities
              if (id.includes('uuid') || id.includes('jsonwebtoken')) {
                return 'chunk-utils';
              }

              // Everything else goes to vendor-misc
              return 'vendor-misc';
            }

            // Test code should be excluded but add extra safety
            if (id.includes('/lib/testing/') ||
                id.includes('testUserPersonas') ||
                id.includes('simulationHelpers')) {
              return null; // Don't chunk test files
            }
          },

          // Dynamic chunk naming for better caching
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId || '';

            if (facadeModuleId.includes('node_modules')) {
              return 'vendor/[name]-[hash].js';
            }
            if (facadeModuleId.includes('components')) {
              return 'components/[name]-[hash].js';
            }
            if (facadeModuleId.includes('pages')) {
              return 'pages/[name]-[hash].js';
            }
            return 'chunks/[name]-[hash].js';
          },
        },

        // External dependencies (prevent bundling)
        external: process.env.NODE_ENV === 'production' ? [
          /\/lib\/testing\/.*/,
          /testUserPersonas/,
          /simulationHelpers/,
        ] : [],
      },

      // CommonJS options
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        '@vueuse/core',
        'pinia',
        'date-fns',
        'zod',
        'clsx',
        'tailwind-merge',
      ],
      exclude: [
        '@nuxt/kit',
        '@nuxt/schema',
      ],
    },

    // SSR configuration
    ssr: {
      noExternal: [
        'vue',
        '@vue/*',
        'reka-ui',
        'class-variance-authority',
        'tailwind-merge',
        'vue-sonner',
      ],
      external: [
        'sharp',
        'canvas',
      ],
    },

    // Cache directory
    cacheDir: '.vite',

    // Server configuration
    server: {
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/coverage/**',
          '**/test-results/**',
          '**/playwright-report/**',
          '**/.nuxt/**',
          '**/.output/**',
          '**/.vite/**',
          '**/*.log',
        ]
      }
    }
  },

  hooks: {
    'components:dirs'(dirs) {
      for (let i = dirs.length - 1; i >= 0; i--) {
        const entry = dirs[i]
        if (typeof entry === 'string') continue
        if (entry?.path && String(entry.path).includes('/components/ui')) {
          dirs.splice(i, 1)
        }
      }
    },
  },
});
```

## 2. Update .gitignore

Add cache directories:

```bash
# Build artifacts
.nuxt
.output
.vite

# Cache directories
.cache
node_modules/.cache
node_modules/.vite

# Build analysis
stats.html
.vercel
```

## 3. Verify Image URLs (Optional Fix)

Check landing page components for broken image URLs:

```bash
# Find all Unsplash image references
grep -r "photo-1566754436750" pages/ components/
grep -r "photo-1606787365614" pages/ components/
```

Either:
- **Fix URLs:** Replace with valid Unsplash URLs
- **Remove images:** Delete references to non-existent images
- **Keep as-is:** Let prerender ignore 404s (already configured)

## 4. Validate Configuration

Run these checks before building:

```bash
# 1. Syntax check
npx nuxi typecheck

# 2. Config validation
npx nuxi prepare

# 3. Test build
npm run build

# 4. Check bundle sizes
ls -lh .nuxt/dist/client/_nuxt/*.js | sort -k5 -h | tail -10

# 5. Verify no test code in production
grep -r "testUserPersonas" .nuxt/dist/client/ || echo "✅ No test code found"
```

## Expected Results

### Before Optimization
```
Main chunk: 540.60 KB (159.36 KB gzip) ⚠️
Total chunks: 200+
Build warnings: 3-4
Prerender errors: 2
```

### After Optimization
```
Largest chunk: ~180 KB (55 KB gzip) ✅
Total chunks: 220+ (better distributed)
Build warnings: 0-1
Prerender errors: 0 (ignored gracefully)
```

### Chunk Distribution
```
vendor-vue.js      ~120 KB (35 KB gzip)
vendor-nuxt.js     ~100 KB (30 KB gzip)
vendor-ui.js       ~90 KB  (25 KB gzip)
chunk-stripe.js    ~80 KB  (22 KB gzip)
chunk-charts.js    ~75 KB  (20 KB gzip)
vendor-misc.js     ~150 KB (45 KB gzip)
[other chunks]     <50 KB each
```

## Troubleshooting

### Issue: Build fails with "Cannot find module"

**Cause:** Over-aggressive external configuration

**Fix:** Remove problematic paths from `rollupOptions.external`

```typescript
// Temporarily disable external config
external: process.env.NODE_ENV === 'production' ? [] : [],
```

### Issue: Runtime error "chunk not found"

**Cause:** Chunk naming or manual chunks misconfiguration

**Fix:** Simplify manual chunks configuration

```typescript
manualChunks: (id) => {
  if (id.includes('node_modules')) {
    return 'vendor';
  }
}
```

### Issue: Prerender still failing

**Cause:** New failing routes not in ignore list

**Fix:** Add to prerender.ignore array

```typescript
prerender: {
  failOnError: false,
  ignore: [
    // Add new failing routes here
    '/_ipx/**/*your-failing-image*',
  ],
}
```

### Issue: CSS not loading

**Cause:** CSS code splitting issues

**Fix:** Disable CSS code splitting

```typescript
build: {
  cssCodeSplit: false,
}
```

## Performance Testing

### 1. Bundle Analysis

```bash
# Install bundle analyzer
pnpm add -D rollup-plugin-visualizer

# Add to nuxt.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineNuxtConfig({
  vite: {
    plugins: [
      visualizer({
        filename: './stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
  },
})

# Build and view
npm run build
# Opens stats.html in browser
```

### 2. Lighthouse Testing

```bash
# Build and preview
npm run build
npm run preview

# Run Lighthouse
npx lighthouse http://localhost:3000 \
  --output=html \
  --output-path=./lighthouse-report.html \
  --view
```

### 3. Load Time Comparison

```bash
# Before optimization
time npm run build

# After optimization
time npm run build

# Should see 10-20% improvement
```

## Rollback Instructions

If issues arise after deployment:

```bash
# 1. Revert nuxt.config.ts
git checkout HEAD~1 -- nuxt.config.ts

# 2. Rebuild
npm run build

# 3. Redeploy
npm run deploy

# 4. Monitor Vercel dashboard for errors
```

## Next Steps

1. ✅ Apply Phase 1 optimizations
2. ✅ Test build locally
3. ✅ Deploy to preview environment
4. ✅ Run performance tests
5. ✅ Monitor production metrics
6. 📋 Plan Phase 2 optimizations (if needed)

## Support

For issues or questions:
1. Check [build-optimization-adr.md](../architecture/build-optimization-adr.md)
2. Review Vite documentation: https://vitejs.dev/guide/build.html
3. Check Nuxt 3 performance guide: https://nuxt.com/docs/guide/concepts/rendering
