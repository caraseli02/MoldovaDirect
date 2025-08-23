// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxt/image'
  ],
  nitro: {
    preset: 'vercel'
  },
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: ['/', '/products', '/products/*', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email']
    }
  },
  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    public: {
      appUrl: process.env.APP_URL || 'http://localhost:3000'
    }
  },
  i18n: {
    locales: [
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ro', name: 'Română', file: 'ro.json' },
      { code: 'ru', name: 'Русский', file: 'ru.json' }
    ],
    defaultLocale: 'es',
    strategy: 'prefix_except_default',
    langDir: 'locales/'
  },
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: false
  },
  image: {
    provider: 'ipx',
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