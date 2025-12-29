// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

const BASE_COMPONENT_DIRS = [
  {
    path: '~/components',
    pathPrefix: true,
    extensions: ['vue'],
    // Exclude shadcn UI folder - those components are explicitly imported
    ignore: ['ui/**', '**/index.ts'],
  },
]

export default defineNuxtConfig({

  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxt/eslint',
    'shadcn-nuxt',
    '@vite-pwa/nuxt',
    '@vueuse/motion/nuxt',
    'nuxt-swiper',
    '~/modules/fix-components', // Keep last to post-process components registry
  ],

  components: {
    dirs: [...BASE_COMPONENT_DIRS],
  },
  devtools: { enabled: false },

  css: ['~/assets/css/tailwind.css'],

  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    public: {
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      siteUrl: process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NUXT_PUBLIC_SITE_URL || 'https://moldova-direct.vercel.app',
      enableTestUsers: process.env.ENABLE_TEST_USERS === 'true' || process.env.NODE_ENV !== 'production',
      supportEmail: process.env.NUXT_PUBLIC_SUPPORT_EMAIL || 'support@moldovadirect.com',
    },
  },

  routeRules: {
    '/': { ssr: true },
    '/products': { ssr: true },
    '/products/**': { ssr: true },
    // Public API caching (TEMPORARILY DISABLED for /api/products: SWR ignores query params causing pagination bug)
    // '/api/products': { swr: 300, headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' } },
    '/api/products/featured': { swr: 300, headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' } },
    '/api/products/**': { swr: 600, headers: { 'Cache-Control': 'public, max-age=600, stale-while-revalidate=120' } },
    '/api/categories': { swr: 600, headers: { 'Cache-Control': 'public, max-age=600, stale-while-revalidate=120' } },
    '/api/categories/**': { swr: 600, headers: { 'Cache-Control': 'public, max-age=600, stale-while-revalidate=120' } },
    '/api/search': { swr: 180, headers: { 'Cache-Control': 'public, max-age=180, stale-while-revalidate=60' } },
    '/api/landing/sections': { swr: 600, headers: { 'Cache-Control': 'public, max-age=600, stale-while-revalidate=120' } },
    // Static assets - immutable cache
    '/assets/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    '/_nuxt/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
  },
  compatibilityDate: '2024-11-01',

  nitro: {
    preset: 'vercel',
    minify: true,
    compressPublicAssets: true,
    ignore: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**'],
    prerender: {
      failOnError: false,
      crawlLinks: false,
      ignore: ['/_ipx/**', '/admin', '/checkout', '/api'],
      routes: [],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      chunkSizeWarningLimit: 1000,
      sourcemap: process.env.NODE_ENV !== 'production',
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', '@vueuse/core', 'zod', '@supabase/supabase-js'],
      exclude: ['chart.js', '@stripe/stripe-js', '@tanstack/vue-table'],
    },
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
          '**/*.log',
        ],
      },
    },
  },

  postcss: {
    plugins: {
      // Disable gradient minification for Tailwind CSS v4 compatibility
      // See: docs/architecture/tailwind-v4-build-fix-adr.md
      cssnano: process.env.NODE_ENV === 'production'
        ? {
            preset: ['default', { minifyGradients: false }],
          }
        : false,
    },
  },

  hooks: {
    // Remove shadcn-nuxt auto-registered UI directory (we import explicitly)
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

  eslint: {
    config: {
      stylistic: true, // Enable stylistic rules
    },
    // Disable in-dev-server checking - use CLI and pre-commit hooks
    checker: false,
  },

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

  image: {
    domains: ['images.unsplash.com'],
    formats: ['webp', 'avif'],
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
        modifiers: { format: 'avif', quality: 80, fit: 'cover' },
      },
      productThumbnail: {
        modifiers: { format: 'avif', quality: 75, fit: 'cover', width: 400, height: 400 },
      },
      productThumbnailSmall: {
        modifiers: { format: 'avif', quality: 75, fit: 'cover', width: 112, height: 112 },
      },
      productDetail: {
        modifiers: { format: 'avif', quality: 80, fit: 'cover', width: 800, height: 800 },
      },
    },
    // Vercel's native image optimization in production, IPX in development
    provider: process.env.VERCEL ? 'vercel' : 'ipx',
  },

  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
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
        { src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
        { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' },
        { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
      ],
      categories: ['shopping', 'food'],
      shortcuts: [
        { name: 'Products', short_name: 'Products', description: 'Browse all products', url: '/products', icons: [{ src: '/icon.svg', sizes: '192x192' }] },
        { name: 'Cart', short_name: 'Cart', description: 'View shopping cart', url: '/cart', icons: [{ src: '/icon.svg', sizes: '192x192' }] },
      ],
    },
  },

  shadcn: {
    prefix: 'Ui',
    componentDir: './components/ui',
  },

  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: [
        '/', '/products', '/products/*', '/cart',
        '/about', '/contact', '/faq', '/privacy', '/returns', '/shipping', '/terms', '/track-order', '/wine-story',
        '/checkout', '/checkout/*', // Guest checkout
        '/api/**',
        '/es', '/es/*', '/en', '/ro', '/ru', '/en/*', '/ro/*', '/ru/*',
        '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email',
        '/test-users', '/test-users/*',
      ],
    },
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
    clientOptions: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    },
  },
})
