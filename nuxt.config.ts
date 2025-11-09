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
    "vue3-carousel-nuxt",
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
      }
    }
  },
  routeRules: {
    // Landing page - SWR caching (1 hour) + prerender
    '/': { swr: 3600, prerender: true },
    // Product pages - ISR every hour
    '/products': { swr: 3600 },
    '/products/**': { swr: 3600 },
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
      external: [],
      inline: ["vue", "@vue/*"],
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
