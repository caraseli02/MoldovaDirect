// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/supabase",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@nuxt/image",
    "@nuxt/icon",
    "shadcn-nuxt",
    "@vite-pwa/nuxt",
  ],
  image: {
    domains: ["images.unsplash.com"],
  },
  runtimeConfig: {
    // Private keys (only available on server-side)
    supabaseServiceKey:
      process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
    paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,
    paypalEnvironment: process.env.PAYPAL_ENVIRONMENT || "sandbox",
    // Public keys (exposed to client-side)
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey:
        process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    },
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
  nitro: {
    preset: "vercel",
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
    lazy: true,
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
  },
});
