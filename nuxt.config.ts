// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

const BASE_COMPONENT_DIRS = [
  {
    path: "~/components",
    pathPrefix: true,
    // Only register Vue SFCs from our components directory.
    // Avoid picking up TypeScript barrels like `index.ts` inside shadcn-ui folders.
    extensions: ["vue"],
    // Also exclude the shadcn UI folder entirely, since those components are explicitly imported.
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
            // Disable gradient minification for Tailwind CSS v4 compatibility
            // postcss-minify-gradients v7.0.1 cannot parse Tailwind v4's
            // CSS custom property based gradients (e.g., var(--tw-gradient-stops))
            //
            // Impact: ~1.5KB increase in CSS bundle (negligible)
            // See: docs/architecture/tailwind-v4-build-fix-adr.md
            minifyGradients: false,
          },
        ],
      } : false,
    },
  },
  components: {
    // Restrict auto-registered components to .vue files globally
    // to prevent Nuxt from treating `index.ts` barrels as components.
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
    // Removed vue3-carousel-nuxt (duplicate of nuxt-swiper)
    "@vueuse/motion/nuxt",
    "nuxt-swiper",
    // Keep this last to post-process the components registry
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
      },
      productThumbnail: {
        modifiers: {
          format: 'webp',
          quality: 80,
          fit: 'cover',
          width: 400,
          height: 400,
        }
      },
      productDetail: {
        modifiers: {
          format: 'webp',
          quality: 85,
          fit: 'cover',
          width: 800,
          height: 800,
        }
      }
    },
    // Use Vercel's native image optimization in production (avoids sharp dependency issues)
    // Falls back to IPX in development
    provider: process.env.VERCEL ? 'vercel' : 'ipx',
    vercel: {
      // Vercel Image Optimization configuration
      // External domains are automatically allowed via domains array above
    },
    ipx: {
      maxAge: 60 * 60 * 24 * 30, // 30 days cache for external images (dev only)
      domains: ["images.unsplash.com"]
    }
  },
  routeRules: {
    // Landing page - SWR caching (1 hour)
    // Prerender disabled to avoid sharp binary issues with external images during build
    '/': { swr: 3600 },
    // Product pages - ISR every hour
    '/products': { swr: 3600 },
    '/products/**': { swr: 3600 },
    // Public API routes - Moderate SWR caching for customer-facing endpoints
    '/api/products': { swr: 300, headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' } },
    '/api/products/featured': { swr: 300, headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' } },
    '/api/products/**': { swr: 600, headers: { 'Cache-Control': 'public, max-age=600, stale-while-revalidate=120' } },
    '/api/categories': { swr: 600, headers: { 'Cache-Control': 'public, max-age=600, stale-while-revalidate=120' } },
    '/api/categories/**': { swr: 600, headers: { 'Cache-Control': 'public, max-age=600, stale-while-revalidate=120' } },
    '/api/search': { swr: 180, headers: { 'Cache-Control': 'public, max-age=180, stale-while-revalidate=60' } },
    '/api/landing/sections': { swr: 600, headers: { 'Cache-Control': 'public, max-age=600, stale-while-revalidate=120' } },
    // Admin API routes - Short SWR caching with private cache control
    '/api/admin/dashboard/stats': { swr: 60, headers: { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=30' } },
    '/api/admin/dashboard/activity': { swr: 30, headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=15' } },
    '/api/admin/analytics/**': { swr: 300, headers: { 'Cache-Control': 'private, max-age=300, stale-while-revalidate=60' } },
    '/api/admin/products': { swr: 60, headers: { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=30' } },
    '/api/admin/orders': { swr: 30, headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=15' } },
    '/api/admin/users': { swr: 60, headers: { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=30' } },
    '/api/admin/audit-logs': { swr: 120, headers: { 'Cache-Control': 'private, max-age=120, stale-while-revalidate=60' } },
    '/api/admin/email-logs/**': { swr: 60, headers: { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=30' } },
    '/api/admin/inventory/**': { swr: 120, headers: { 'Cache-Control': 'private, max-age=120, stale-while-revalidate=60' } },
    // Static assets with immutable cache (hash-based assets never change)
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
    // Chunks and entries with immutable cache
    '/chunks/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    '/entries/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
  },
  runtimeConfig: {
    // Private keys (only available on server-side)
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    // Supabase credentials for fallback service client (email jobs, etc.)
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    // Public keys (exposed to client-side)
    public: {
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.moldovadirect.com',
      enableTestUsers:
        process.env.ENABLE_TEST_USERS === 'true' || process.env.NODE_ENV !== 'production'
    },
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "Ui",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
  nitro: {
    preset: "vercel",
    ignore: [
      "**/*.test.ts",
      "**/*.spec.ts",
      "**/__tests__/**",
    ],
    externals: {
      // External dependencies for server (reduces bundle size)
      external: [
        "stripe",
        "nodemailer",
        "@supabase/supabase-js",
      ],
      inline: ["vue", "@vue/*"],
    },
    // Enable minification and compression
    minify: true,
    compressPublicAssets: true,
    // Prerender configuration - disable automatic crawling to prevent timeout
    prerender: {
      failOnError: false,
      crawlLinks: false, // Disable automatic route discovery to prevent hanging
      ignore: ['/_ipx/**', '/admin', '/checkout', '/api'],
      routes: [], // Only prerender explicitly listed routes (none)
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
    // Enable anonymous access for public pages (required for Google crawlers)
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production'
    },
    clientOptions: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Allow unauthenticated requests - critical for SEO and crawlers
        flowType: 'pkce'
      }
    }
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
      description:
        "Authentic Moldovan food and wine products delivered to Spain",
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

    build: {
      // Use esbuild for faster minification
      minify: 'esbuild',

      // Increase chunk size warning threshold
      chunkSizeWarningLimit: 1000,

      // Optimize CSS code splitting
      cssCodeSplit: true,

      // Disable source maps in production for faster builds
      sourcemap: process.env.NODE_ENV !== 'production',

      rollupOptions: {
        output: {
          // Optimize chunk naming for better cache invalidation
          chunkFileNames: 'chunks/[name]-[hash].js',
          entryFileNames: 'entries/[name]-[hash].js',

          // Manual chunk splitting for better caching
          manualChunks(id) {
            // Vendor chunks - split by package for better cache granularity
            if (id.includes('node_modules')) {
              // Large packages get their own chunks
              if (id.includes('chart.js')) return 'vendor-chart'
              if (id.includes('@stripe')) return 'vendor-stripe'
              if (id.includes('@tanstack')) return 'vendor-table'
              if (id.includes('swiper')) return 'vendor-swiper'

              // Group Vue ecosystem packages together
              if (id.includes('vue') || id.includes('@vue')) return 'vendor-vue'
              if (id.includes('pinia')) return 'vendor-pinia'

              // Group smaller packages together
              return 'vendor-misc'
            }

            // Feature-based splitting for better code organization
            if (id.includes('/components/admin/')) return 'feature-admin'
            if (id.includes('/pages/admin/')) return 'feature-admin'

            if (id.includes('/components/checkout/')) return 'feature-checkout'
            if (id.includes('/pages/checkout/')) return 'feature-checkout'
          },
        },
      },
    },
    // Pre-bundle dependencies for faster dev server
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
        'zod',
      ],
      exclude: [
        'chart.js',
        '@stripe/stripe-js',
        '@tanstack/vue-table',
      ],

      // Enable esbuild optimizer for faster dependency pre-bundling
      esbuildOptions: {
        target: 'es2020',
        supported: {
          'top-level-await': true,
        },
      },
    },
    ssr: {
      noExternal: ["vue", "@vue/*"],
    },
    server: {
      watch: {
        // Use polling on macOS to avoid "EMFILE: too many open files" error
        // This is less efficient but more reliable with large codebases
        // usePolling: true,
        // interval: 100,
        // binaryInterval: 300,
        ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/coverage/**',           // Vitest coverage reports
        '**/test-results/**',       // Playwright test results
        '**/playwright-report/**',  // Playwright HTML reports
        '**/.nuxt/**',             // Nuxt build artifacts
        '**/.output/**',           // Nuxt output
        '**/*.log',                // Log files
      ]
      }
    }
  },
  hooks: {
    // Ensure the shadcn-nuxt injected components directory does not register TS barrels as Vue components
    'components:dirs'(dirs) {
      // Remove any auto-registered UI directory added by modules (e.g., shadcn-nuxt),
      // since we import UI components explicitly in <script setup>.
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
