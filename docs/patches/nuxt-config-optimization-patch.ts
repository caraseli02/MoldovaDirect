/**
 * Nuxt Configuration Optimization Patch
 *
 * This file contains all recommended configuration changes from the
 * build configuration review. Apply changes incrementally and test
 * after each major section.
 *
 * @see docs/architecture/build-configuration-review.md
 */

import tailwindcss from '@tailwindcss/vite'

const BASE_COMPONENT_DIRS = [
  {
    path: '~/components',
    pathPrefix: true,
    // ONLY register Vue SFCs, never TypeScript files
    extensions: ['vue'],
    // ✅ FIX: Add explicit pattern to prevent ENOTDIR errors
    pattern: '**/*.vue',
    // Exclude shadcn UI, barrel exports, test files
    ignore: [
      'ui/**',
      '**/index.ts',
      '**/*.test.vue',
      '**/*.stories.vue',
      '**/*.spec.vue',
    ],
    watch: true,
    transpile: false,
  },
]

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // ===================================
  // PostCSS & CSS Processing
  // ===================================
  postcss: {
    plugins: {
      cssnano: process.env.NODE_ENV === 'production' ? {
        preset: [
          'default',
          {
            // Tailwind v4 compatibility - DO NOT CHANGE
            minifyGradients: false,
            // ✅ NEW: Additional safe optimizations
            cssDeclarationSorter: true,
            discardComments: { removeAll: true },
            normalizeWhitespace: true,
            // Preserve CSS custom properties
            reduceIdents: false,
            zindex: false,
          },
        ],
      } : false,
      // ✅ NEW: Add autoprefixer for browser support
      autoprefixer: {
        overrideBrowserslist: [
          'last 2 versions',
          'not dead',
          '> 0.2%',
        ],
      },
    },
  },

  // ===================================
  // Component Auto-Registration
  // ===================================
  components: {
    extensions: ['vue'],
    dirs: [...BASE_COMPONENT_DIRS],
    // ✅ NEW: Explicit global registration
    global: true,
    // ✅ NEW: Target specification
    target: 'client',
  },

  // ===================================
  // Modules Configuration
  // ===================================
  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxt/image',
    'shadcn-nuxt',
    // ⚠️ REVIEW: Consider removing if PWA features not used
    '@vite-pwa/nuxt',
    // ⚠️ REVIEW: Consider removing - Swiper might be sufficient
    'vue3-carousel-nuxt',
    // ⚠️ REVIEW: Check usage vs bundle size impact
    '@vueuse/motion/nuxt',
    'nuxt-swiper',
    // Keep this last to post-process components registry
    '~/modules/fix-components',
  ],

  // ===================================
  // Image Optimization
  // ===================================
  image: {
    domains: ['images.unsplash.com'],
    formats: ['webp', 'avif'],
    quality: 80,
    // ✅ NEW: Retina support
    densities: [1, 2],
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
        },
      },
    },
    // ✅ NEW: IPX caching
    ipx: {
      maxAge: 60 * 60 * 24 * 365, // 1 year
    },
    // ✅ NEW: Default loading behavior
    loading: 'lazy',
    placeholder: 'blur',
  },

  // ===================================
  // Route Rules & Caching
  // ===================================
  routeRules: {
    // Static pages - prerender
    '/': { swr: 3600, prerender: true },
    '/about': { prerender: true },
    '/wine-story': { prerender: true },

    // Product pages - ISR
    '/products': { swr: 3600, prerender: true },
    '/products/**': {
      swr: 3600,
      isr: 3600, // ✅ NEW: Incremental Static Regeneration
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
        'cache-control': 'public, max-age=31536000, immutable',
      },
    },
  },

  // ===================================
  // Runtime Config
  // ===================================
  runtimeConfig: {
    // Private keys (server-side only)
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,

    // Public keys (client-side)
    public: {
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.moldovadirect.com',
      enableTestUsers: process.env.ENABLE_TEST_USERS === 'true' || process.env.NODE_ENV !== 'production',
    },
  },

  // ===================================
  // Shadcn Configuration
  // ===================================
  shadcn: {
    prefix: 'Ui',
    componentDir: './components/ui',
  },

  // ===================================
  // Nitro Server Configuration
  // ===================================
  nitro: {
    preset: 'vercel',
    // ✅ NEW: Enable minification
    minify: true,
    // ✅ NEW: Disable sourcemaps in production
    sourceMap: process.env.NODE_ENV !== 'production',
    ignore: [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/__tests__/**',
    ],
    externals: {
      inline: ['vue', '@vue/*'],
    },
    // ✅ NEW: Enable compression
    compressPublicAssets: true,
    // ✅ NEW: Experimental features
    experimental: {
      asyncContext: true,
    },
  },

  // ===================================
  // Supabase Configuration
  // ===================================
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: [
        '/',
        '/products',
        '/products/*',
        '/cart',
        '/en',
        '/ro',
        '/ru',
        '/en/*',
        '/ro/*',
        '/ru/*',
        '/auth/register',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/auth/verify-email',
      ],
    },
  },

  // ===================================
  // i18n Configuration
  // ===================================
  i18n: {
    locales: [
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ro', name: 'Română', file: 'ro.json' },
      { code: 'ru', name: 'Русский', file: 'ru.json' },
    ],
    langDir: 'locales',
    defaultLocale: 'es',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },

  // ===================================
  // Global CSS
  // ===================================
  css: ['~/assets/css/tailwind.css'],

  // ===================================
  // PWA Configuration
  // ===================================
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      // ✅ NEW: Include webp/avif formats
      globPatterns: ['**/*.{js,css,html,png,svg,ico,webp,avif}'],
      // ✅ NEW: Runtime caching strategies
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'unsplash-images',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
          },
        },
        {
          urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'supabase-api',
            networkTimeoutSeconds: 10,
          },
        },
      ],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20,
    },
    manifest: {
      name: 'Moldova Direct',
      short_name: 'Moldova Direct',
      description: 'Authentic Moldovan food and wine products delivered to Spain',
      theme_color: '#1e40af',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/icon.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
        },
        {
          src: '/icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
        },
        {
          src: '/icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        },
      ],
      categories: ['shopping', 'food'],
      shortcuts: [
        {
          name: 'Products',
          short_name: 'Products',
          description: 'Browse all products',
          url: '/products',
          icons: [{ src: '/icon.svg', sizes: '192x192' }],
        },
        {
          name: 'Cart',
          short_name: 'Cart',
          description: 'View shopping cart',
          url: '/cart',
          icons: [{ src: '/icon.svg', sizes: '192x192' }],
        },
      ],
    },
  },

  // ===================================
  // Vite Configuration
  // ===================================
  vite: {
    plugins: [tailwindcss()],

    // ✅ NEW: Build optimization with manual chunking
    build: {
      rollupOptions: {
        output: {
          // Manual chunking for large dependencies
          manualChunks: {
            // Separate heavy vendor libraries
            'swiper': ['swiper'],
            'charts': ['chart.js', 'chartjs-adapter-date-fns'],
            'motion': ['@vueuse/motion'],
            'ui-table': ['@tanstack/vue-table'],
            'stripe': ['@stripe/stripe-js'],
            // Group shadcn-ui primitives
            'ui-primitives': ['reka-ui', 'class-variance-authority'],
          },
        },
      },
      // ✅ NEW: Lower chunk size warning threshold
      chunkSizeWarningLimit: 400, // 400KB (down from 500KB)
      // ✅ NEW: Report compressed sizes
      reportCompressedSize: true,
      // ✅ NEW: Environment-aware sourcemaps
      sourcemap: process.env.NODE_ENV !== 'production',
    },

    ssr: {
      noExternal: ['vue', '@vue/*'],
    },

    server: {
      watch: {
        // Ignore patterns to prevent file watcher issues
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/coverage/**',
          '**/test-results/**',
          '**/playwright-report/**',
          '**/.nuxt/**',
          '**/.output/**',
          '**/*.log',
        ],
      },
    },
  },

  // ===================================
  // Hooks - Component Directory Cleanup
  // ===================================
  hooks: {
    'components:dirs'(dirs) {
      // Remove auto-registered UI directory added by shadcn-nuxt
      // We import UI components explicitly in <script setup>
      for (let i = dirs.length - 1; i >= 0; i--) {
        const entry = dirs[i]
        if (typeof entry === 'string') continue
        if (entry?.path && String(entry.path).includes('/components/ui')) {
          dirs.splice(i, 1)
        }
      }
    },
  },
})
