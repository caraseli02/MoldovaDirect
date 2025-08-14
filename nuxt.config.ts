// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxthub/core',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxt/image'
  ],
  hub: {
    database: true,  // Enable Cloudflare D1
    kv: true,        // Enable KV storage for sessions/cache
    blob: false,     // Disable R2 for now (requires paid plan)
    cache: true,     // Enable edge caching
    analytics: true, // Enable Cloudflare Analytics
    ai: false        // Disable AI features for now
  },
  nitro: {
    preset: 'cloudflare-pages',
    experimental: {
      wasm: true
    }
  },
  i18n: {
    locales: [
      { code: 'es', name: 'Español' },
      { code: 'en', name: 'English' },
      { code: 'ro', name: 'Română' },
      { code: 'ru', name: 'Русский' }
    ],
    defaultLocale: 'es',
    strategy: 'prefix_except_default'
  },
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: false
  },
  image: {
    provider: 'cloudflare',
    quality: 80,
    format: ['webp', 'avif'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    }
  },
  app: {
    head: {
      title: 'Moldova Direct - Authentic Moldovan Products in Spain',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          name: 'description', 
          content: 'Discover authentic Moldovan food and wine products with home delivery in Spain. Premium quality directly from the best producers in Moldova.' 
        },
        { name: 'keywords', content: 'Moldova, Moldovan products, wine, food, Spain, authentic, delivery' },
        { name: 'author', content: 'Moldova Direct' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Moldova Direct' },
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' }
      ]
    }
  }
})