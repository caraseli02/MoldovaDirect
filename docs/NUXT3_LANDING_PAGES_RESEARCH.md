# Nuxt 3 & Vue 3 Landing Page Development Guide

**Research Date:** 2025-11-09
**Project Version:** Nuxt 3.17.7, Vue 3.5.18
**Purpose:** Comprehensive guide for building high-performance landing pages with Nuxt 3

---

## Table of Contents

1. [Nuxt 3 Page Structure and Routing](#1-nuxt-3-page-structure-and-routing)
2. [SSR vs SSG Strategies](#2-ssr-vs-ssg-strategies)
3. [SEO Module and Meta Tag Management](#3-seo-module-and-meta-tag-management)
4. [Image Optimization](#4-image-optimization)
5. [Vue 3 Composition API Patterns](#5-vue-3-composition-api-patterns)
6. [Data Fetching Strategies](#6-data-fetching-strategies)
7. [Performance Optimization](#7-performance-optimization)
8. [Nuxt 3 Modules for Landing Pages](#8-nuxt-3-modules-for-landing-pages)
9. [TypeScript Best Practices](#9-typescript-best-practices)
10. [shadcn-vue Integration](#10-shadcn-vue-integration)

---

## 1. Nuxt 3 Page Structure and Routing

### Official Documentation
- **Main Guide:** https://nuxt.com/docs/guide/directory-structure/pages
- **Routing Guide:** https://nuxt.com/docs/getting-started/routing

### File-Based Routing

Nuxt 3 uses file-based routing with the `/pages` directory. Every `.vue` file automatically becomes a route.

**Directory Structure:**
```
pages/
├── index.vue              # / (homepage)
├── about.vue              # /about
├── products/
│   ├── index.vue         # /products
│   └── [slug].vue        # /products/:slug (dynamic route)
└── blog/
    └── [...slug].vue     # /blog/* (catch-all route)
```

### Best Practices for Landing Pages

#### 1. Root-Level Pages
Place main landing pages directly in `/pages`:
- `index.vue` - Homepage/main landing page
- `about.vue` - About page
- `contact.vue` - Contact landing page

#### 2. Dynamic Routes
Use square brackets for dynamic parameters:
```vue
<!-- pages/products/[slug].vue -->
<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug
</script>
```

#### 3. definePageMeta for Page-Level Config
```vue
<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  middleware: 'analytics',
  // Page-specific route rules
  alias: ['/home', '/start']
})
</script>
```

**Official API Reference:** https://nuxt.com/docs/api/utils/define-page-meta

### Current Project Implementation Example

From `/pages/index.vue`:
```vue
<template>
  <div class="text-gray-900 dark:text-gray-100">
    <HomeAnnouncementBar :show-cta="true" />
    <HomeHeroSection :highlights="heroHighlights" />
    <HomeCategoryGrid :categories="categoryCards" />
    <HomeFeaturedProductsSection
      :products="featuredProducts"
      :pending="featuredPending"
      :error="featuredErrorState"
      @retry="refreshFeatured"
    />
    <!-- Additional sections -->
  </div>
</template>

<script setup lang="ts">
// Composable pattern for content management
const { heroHighlights, categoryCards } = useHomeContent()

// Data fetching with SSR
const { data, pending, error } = await useFetch('/api/products/featured', {
  server: true,
  lazy: false
})
</script>
```

### Key Routing Concepts

1. **Nested Routes:** Use `<NuxtPage />` in parent components
2. **Route Params:** Access via `useRoute()` composable
3. **Programmatic Navigation:** Use `navigateTo()` or `useRouter()`
4. **Locale Routing:** Use `useLocalePath()` from `@nuxtjs/i18n`

---

## 2. SSR vs SSG Strategies

### Official Documentation
- **Rendering Modes:** https://nuxt.com/docs/guide/concepts/rendering
- **Prerendering:** https://nuxt.com/docs/getting-started/prerendering
- **Route Rules:** https://nuxt.com/docs/api/utils/define-route-rules

### Rendering Modes Overview

| Mode | Description | Use Case |
|------|-------------|----------|
| **SSR** | Server-Side Rendering | Dynamic content, personalized pages |
| **SSG** | Static Site Generation | Pre-rendered at build time |
| **ISR** | Incremental Static Regeneration | Static with periodic updates |
| **CSR** | Client-Side Rendering | Admin dashboards, protected routes |
| **Hybrid** | Mix of above modes per route | Optimal performance strategy |

### Hybrid Rendering (Recommended for Landing Pages)

Configure different rendering strategies per route using **Route Rules**:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // Landing pages: Pre-render at build time (SSG)
    '/': { prerender: true },
    '/about': { prerender: true },
    '/contact': { prerender: true },

    // Product listings: ISR with 1-hour cache
    '/products': { isr: 3600 },
    '/products/**': { isr: 3600 },

    // Dynamic product pages: SSR with caching
    '/products/[slug]': { swr: 3600 },

    // Admin routes: Client-side only
    '/admin/**': { ssr: false },

    // API routes: Edge rendering
    '/api/**': { cors: true, headers: { 'cache-control': 's-maxage=0' } }
  }
})
```

### Page-Level Route Rules

Use `defineRouteRules()` for page-specific configuration:

```vue
<script setup lang="ts">
// Pre-render this page at build time
defineRouteRules({
  prerender: true
})
</script>
```

### Static Generation Configuration

**Generate all routes at build time:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt'],
      crawlLinks: true,  // Auto-discover routes
      ignore: ['/admin/**', '/api/**']
    }
  }
})
```

### Landing Page Strategy Recommendations

**For High-Performance Landing Pages:**

1. **Homepage:** `prerender: true` (SSG)
   - Fastest initial load
   - Perfect for hero sections, CTAs
   - Rebuild on content changes

2. **Product Listings:** `isr: 3600` (ISR)
   - Static performance with fresh data
   - Regenerate every hour
   - Balances speed and freshness

3. **Dynamic Content Sections:** `swr: true` (Stale-While-Revalidate)
   - Serve cached version instantly
   - Update in background
   - Best for testimonials, stats

### Current Project Implementation

Your project uses SSR with Vercel preset:
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel',  // Optimized for Vercel deployment
  }
})
```

**Recommendation:** Add route rules for landing pages:
```typescript
routeRules: {
  '/': { prerender: true },
  '/about': { prerender: true },
  '/products': { isr: 3600 },
}
```

---

## 3. SEO Module and Meta Tag Management

### Official Documentation
- **SEO & Meta:** https://nuxt.com/docs/getting-started/seo-meta
- **useSeoMeta API:** https://nuxt.com/docs/api/composables/use-seo-meta
- **useHead API:** https://nuxt.com/docs/api/composables/use-head

### Core SEO Composables

#### 1. useSeoMeta (Recommended)

Type-safe SEO meta tags with auto-completion:

```typescript
<script setup lang="ts">
useSeoMeta({
  title: 'Moldova Direct - Authentic Moldovan Products',
  description: 'Shop curated Moldovan wines, gourmet foods delivered to Spain',
  ogTitle: 'Moldova Direct - Taste Moldova',
  ogDescription: 'Authentic Moldovan products delivered to your door',
  ogImage: 'https://moldovadirect.com/og-image.jpg',
  ogUrl: 'https://moldovadirect.com',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Moldova Direct',
  twitterDescription: 'Authentic Moldovan wines and gourmet foods',
  twitterImage: 'https://moldovadirect.com/twitter-image.jpg'
})
</script>
```

**Benefits:**
- Full TypeScript support
- Prevents typos (e.g., `name` vs `property`)
- Auto-completion in IDE
- Reactive by default

#### 2. useHead (Advanced Use Cases)

For complex meta tag scenarios:

```typescript
<script setup lang="ts">
const { locale } = useI18n()

useHead({
  title: 'My Page Title',
  meta: [
    { name: 'description', content: 'Page description' },
    { property: 'og:title', content: 'OG Title' }
  ],
  link: [
    { rel: 'canonical', href: 'https://example.com/page' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage'
      })
    }
  ],
  htmlAttrs: {
    lang: () => locale.value  // Reactive lang attribute
  }
})
</script>
```

### Reactive Meta Tags

Use computed values or arrow functions:

```typescript
<script setup lang="ts">
const product = ref({ name: 'Wine', price: 25 })

useSeoMeta({
  title: () => `${product.value.name} - ${product.value.price}€`,
  description: () => `Buy ${product.value.name} for only ${product.value.price}€`
})
</script>
```

### Project's Custom SEO Composable

Your project implements `useLandingSeo()` at `/composables/useLandingSeo.ts`:

```typescript
// Comprehensive SEO setup with i18n support
useLandingSeo({
  title: 'Moldova Direct – Taste Moldova in Every Delivery',
  description: 'Shop curated Moldovan wines, gourmet foods...',
  image: '/og-image.jpg',
  imageAlt: 'Selection of Moldovan delicacies',
  pageType: 'website',
  keywords: ['Moldovan wine', 'gourmet food', 'Spain delivery'],
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Moldova Direct'
  }
})
```

**Features:**
- Automatic canonical URLs with i18n support
- OpenGraph tags
- Twitter Card tags
- Structured data (JSON-LD)
- Breadcrumb schema
- Multi-language hreflang tags
- SEO-friendly URL generation

### Structured Data (Schema.org)

Add JSON-LD structured data for rich snippets:

```typescript
<script setup lang="ts">
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Premium Moldovan Wine',
  image: 'https://example.com/wine.jpg',
  description: 'Award-winning red wine from Moldova',
  offers: {
    '@type': 'Offer',
    price: '25.00',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock'
  }
}

useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(structuredData)
    }
  ]
})
</script>
```

### i18n SEO Best Practices

**1. Language-Specific Meta Tags:**
```typescript
const { locale, locales } = useI18n()

// Automatic hreflang generation
const links = locales.value.map(loc => ({
  rel: 'alternate',
  hreflang: loc.code,
  href: `https://example.com/${loc.code}/page`
}))

useHead({ link: links })
```

**2. Canonical URLs:**
```typescript
const localePath = useLocalePath()
const route = useRoute()

const canonicalUrl = `https://example.com${localePath(route.path)}`

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }]
})
```

### App-Wide SEO Configuration

Set global defaults in `app.vue`:

```vue
<script setup>
const { locale } = useI18n()

useHead({
  htmlAttrs: {
    lang: () => locale.value
  },
  titleTemplate: '%s - Moldova Direct',  // Append site name to all pages
})
</script>
```

---

## 4. Image Optimization

### Official Documentation
- **Nuxt Image Module:** https://image.nuxt.com/
- **GitHub Repository:** https://github.com/nuxt/image
- **Performance Guide:** https://nuxt.com/docs/guide/best-practices/performance

### Installation

Your project already has `@nuxt/image: ^1.11.0` installed.

**Configuration:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/image'],
  image: {
    domains: ['images.unsplash.com'],  // Whitelist external domains
    quality: 80,  // Default quality
    format: ['webp', 'jpg'],  // Supported formats
  }
})
```

### NuxtImg Component

Replace `<img>` with `<NuxtImg>` for automatic optimization:

```vue
<template>
  <!-- Basic usage -->
  <NuxtImg
    src="/hero-image.jpg"
    alt="Hero banner"
    width="1200"
    height="600"
  />

  <!-- With lazy loading -->
  <NuxtImg
    src="/product.jpg"
    alt="Product image"
    loading="lazy"
    width="400"
    height="400"
  />

  <!-- With provider (Cloudinary, Vercel, etc.) -->
  <NuxtImg
    provider="cloudinary"
    src="/sample.jpg"
    width="800"
    height="600"
    fit="cover"
  />

  <!-- Responsive with sizes -->
  <NuxtImg
    src="/responsive.jpg"
    sizes="sm:100vw md:50vw lg:400px"
    width="400"
    height="300"
  />
</template>
```

### NuxtPicture Component

Modern `<picture>` element with format fallbacks:

```vue
<template>
  <NuxtPicture
    src="/hero.jpg"
    alt="Hero image"
    :img-attrs="{ class: 'rounded-lg' }"
    width="1200"
    height="600"
    format="webp,jpg"
    sizes="sm:100vw md:80vw lg:1200px"
  />
</template>
```

**Benefits:**
- Automatic WebP/AVIF conversion
- Format fallbacks for older browsers
- Responsive image srcset generation

### Performance Best Practices

#### 1. Lazy Loading (Default)
```vue
<!-- Lazy load by default -->
<NuxtImg src="/below-fold.jpg" loading="lazy" />

<!-- Eager load for above-fold images -->
<NuxtImg src="/hero.jpg" loading="eager" />
```

#### 2. Priority Hints
```vue
<!-- Critical LCP image -->
<NuxtImg
  src="/hero.jpg"
  fetchpriority="high"
  loading="eager"
/>

<!-- Low priority decorative images -->
<NuxtImg
  src="/decoration.svg"
  fetchpriority="low"
/>
```

#### 3. Preloading Critical Images
```typescript
<script setup lang="ts">
useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: '/hero.webp',
      type: 'image/webp'
    }
  ]
})
</script>
```

#### 4. Responsive Images with Sizes

```vue
<NuxtImg
  src="/product.jpg"
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 1024px) 50vw,
    400px
  "
  width="400"
  height="400"
/>
```

### Image Modifiers

Apply transformations on-the-fly:

```vue
<template>
  <!-- Resize and crop -->
  <NuxtImg
    src="/image.jpg"
    width="300"
    height="300"
    fit="cover"
  />

  <!-- Adjust quality -->
  <NuxtImg
    src="/hero.jpg"
    quality="90"
  />

  <!-- Format conversion -->
  <NuxtImg
    src="/photo.png"
    format="webp"
  />

  <!-- Multiple modifiers -->
  <NuxtImg
    src="/product.jpg"
    width="600"
    height="400"
    fit="cover"
    quality="85"
    format="webp"
  />
</template>
```

### IPX Provider (Built-in)

Nuxt Image uses IPX for local image optimization:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  image: {
    provider: 'ipx',  // Default
    ipx: {
      maxAge: 60 * 60 * 24 * 365,  // Cache for 1 year
    }
  }
})
```

### External Providers

Configure popular CDNs:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  image: {
    providers: {
      cloudinary: {
        baseURL: 'https://res.cloudinary.com/demo/image/upload/'
      },
      vercel: {
        baseURL: process.env.VERCEL_URL
      }
    }
  }
})
```

### Current Project Usage

From `/pages/index.vue` and `useHomeContent.ts`:

```typescript
// Placeholder images (replace with actual product photos)
const categoryImages = {
  wines: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1200',
  gourmet: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1200',
  // ...
}
```

**Recommendation:** Use `<NuxtImg>` in components:
```vue
<NuxtImg
  :src="category.image"
  :alt="category.imageAlt"
  width="1200"
  height="800"
  loading="lazy"
  sizes="sm:100vw md:50vw lg:400px"
/>
```

---

## 5. Vue 3 Composition API Patterns

### Official Documentation
- **Composition API FAQ:** https://vuejs.org/guide/extras/composition-api-faq.html
- **Composables Guide:** https://vuejs.org/guide/reusability/composables.html
- **Reactivity API:** https://vuejs.org/api/reactivity-core.html

### Core Concepts

The Composition API is Vue 3's primary way to write components, focusing on:
- **Logical organization** by concern (not by option)
- **Code reusability** via composables
- **Better TypeScript** integration
- **Improved tree-shaking**

### Script Setup Syntax (Recommended)

```vue
<script setup lang="ts">
// Auto-imported Vue APIs
import { ref, computed, watch, onMounted } from 'vue'

// Component props
const props = defineProps<{
  title: string
  count?: number
}>()

// Component emits
const emit = defineEmits<{
  update: [value: number]
  delete: []
}>()

// Reactive state
const counter = ref(0)
const doubled = computed(() => counter.value * 2)

// Methods
function increment() {
  counter.value++
  emit('update', counter.value)
}

// Lifecycle hooks
onMounted(() => {
  console.log('Component mounted')
})

// Watchers
watch(counter, (newVal, oldVal) => {
  console.log(`Counter changed: ${oldVal} -> ${newVal}`)
})
</script>

<template>
  <div>
    <h1>{{ title }}</h1>
    <p>Count: {{ counter }} (Doubled: {{ doubled }})</p>
    <button @click="increment">Increment</button>
  </div>
</template>
```

### Composables Pattern

Composables encapsulate reusable stateful logic:

#### Basic Composable Structure

```typescript
// composables/useMouse.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return { x, y }
}
```

**Usage in component:**
```vue
<script setup lang="ts">
const { x, y } = useMouse()
</script>

<template>
  <div>Mouse position: {{ x }}, {{ y }}</div>
</template>
```

#### Advanced Composable: Async Data

```typescript
// composables/useFetch.ts
import { ref, toValue, watchEffect, type MaybeRefOrGetter } from 'vue'

export function useFetch<T>(url: MaybeRefOrGetter<string>) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(toValue(url))
      data.value = await response.json()
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }

  watchEffect(() => {
    fetchData()
  })

  return { data, error, loading, refetch: fetchData }
}
```

### Best Practices

#### 1. Naming Conventions
```typescript
// ✅ Good: Prefix with "use"
export function useAuth() { }
export function useCart() { }

// ❌ Bad: No "use" prefix
export function auth() { }
export function getCart() { }
```

#### 2. Return Values
```typescript
// ✅ Good: Return plain object with refs
export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++

  return { count, increment }  // Destructurable
}

// ❌ Bad: Return reactive object
export function useCounter() {
  return reactive({
    count: 0,
    increment() { this.count++ }
  })  // Loses reactivity when destructured
}
```

#### 3. Flexible Arguments
```typescript
import { toValue, type MaybeRefOrGetter } from 'vue'

export function useFeature(id: MaybeRefOrGetter<string>) {
  const actualId = toValue(id)  // Works with ref, getter, or plain value
}

// Usage
useFeature('123')              // Plain value
useFeature(ref('123'))         // Ref
useFeature(() => route.params.id)  // Getter
```

#### 4. Side Effects Management
```typescript
export function useEventListener(
  target: EventTarget,
  event: string,
  handler: EventListener
) {
  onMounted(() => {
    target.addEventListener(event, handler)
  })

  onUnmounted(() => {
    target.removeEventListener(event, handler)  // Clean up!
  })
}
```

### Project's Composable Examples

#### 1. Content Management (`useHomeContent.ts`)

```typescript
export const useHomeContent = () => {
  const { t, locale } = useI18n()

  // Computed reactive content
  const heroHighlights = computed(() => [
    {
      value: t('home.hero.highlights.orders.value'),
      label: t('home.hero.highlights.orders.label')
    }
  ])

  const categoryCards = computed(() =>
    categoryKeys.map((key) => ({
      title: t(`home.categories.items.${key}.title`),
      description: t(`home.categories.items.${key}.description`),
      // ...
    }))
  )

  return {
    heroHighlights,
    categoryCards,
    // ... more content
  }
}
```

**Benefits:**
- Reactive i18n content
- Centralized content logic
- Type-safe structure
- Reusable across components

#### 2. SEO Management (`useLandingSeo.ts`)

```typescript
export function useLandingSeo(input: LandingSeoInput) {
  const { locale } = useI18n()
  const { siteUrl, toAbsoluteUrl } = useSiteUrl()

  const canonicalUrl = toAbsoluteUrl(input.path)

  useHead({
    title: input.title,
    meta: [
      { name: 'description', content: input.description },
      { property: 'og:title', content: input.title },
      // ...
    ]
  })

  return { canonicalUrl, siteUrl }
}
```

### Composition vs Options API

| Feature | Composition API | Options API |
|---------|----------------|-------------|
| Organization | By logical concern | By option type |
| Reusability | Composables | Mixins |
| TypeScript | Excellent | Good |
| Tree-shaking | Better | Limited |
| Learning curve | Moderate | Easy |

**Recommendation:** Use Composition API with `<script setup>` for all new components.

---

## 6. Data Fetching Strategies

### Official Documentation
- **Data Fetching Guide:** https://nuxt.com/docs/getting-started/data-fetching
- **useFetch API:** https://nuxt.com/docs/api/composables/use-fetch
- **useAsyncData API:** https://nuxt.com/docs/api/composables/use-async-data

### Overview of Data Fetching Methods

| Method | Use Case | SSR Support | Navigation Blocking |
|--------|----------|-------------|---------------------|
| `useFetch()` | Simple API calls | Yes | Yes (default) |
| `useAsyncData()` | Complex data logic | Yes | Yes (default) |
| `$fetch()` | Event handlers, client-only | No | No |
| `useLazyFetch()` | Non-blocking fetches | Yes | No |
| `useLazyAsyncData()` | Non-blocking async logic | Yes | No |

### useFetch (Recommended for Most Cases)

**Basic usage:**
```typescript
<script setup lang="ts">
const { data, pending, error, refresh } = await useFetch('/api/products')
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <div v-for="product in data" :key="product.id">
      {{ product.name }}
    </div>
  </div>
</template>
```

**With TypeScript:**
```typescript
interface Product {
  id: string
  name: string
  price: number
}

const { data } = await useFetch<Product[]>('/api/products')
// data is typed as Ref<Product[] | null>
```

**With query parameters:**
```typescript
const page = ref(1)
const limit = ref(10)

const { data } = await useFetch('/api/products', {
  query: {
    page,
    limit,
    sort: 'name'
  }
})
// Automatically refetches when page or limit changes
```

**With request options:**
```typescript
const { data } = await useFetch('/api/products', {
  method: 'POST',
  body: { name: 'New Product', price: 25 },
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### useAsyncData (For Complex Logic)

Use when you need more control:

```typescript
<script setup lang="ts">
const route = useRoute()

const { data, pending, error } = await useAsyncData(
  'product-detail',  // Unique key for caching
  async () => {
    // Complex async logic
    const product = await $fetch(`/api/products/${route.params.id}`)
    const reviews = await $fetch(`/api/reviews?productId=${product.id}`)

    return {
      product,
      reviews,
      averageRating: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    }
  }
)
</script>
```

**Key parameter importance:**
```typescript
// ✅ Good: Explicit key prevents cache collisions
const { data } = await useAsyncData(
  `product-${route.params.id}`,
  () => $fetch(`/api/products/${route.params.id}`)
)

// ❌ Bad: Auto-generated key may cause issues
const { data } = await useAsyncData(
  () => $fetch(`/api/products/${route.params.id}`)
)
```

### $fetch (Client-Side Operations)

For event handlers and client-only operations:

```typescript
<script setup lang="ts">
const loading = ref(false)

async function submitForm() {
  loading.value = true

  try {
    const result = await $fetch('/api/contact', {
      method: 'POST',
      body: formData.value
    })

    console.log('Success:', result)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}
</script>
```

### Lazy Variants (Non-Blocking)

Use for below-the-fold content:

```typescript
<script setup lang="ts">
// Blocks navigation until data is loaded
const { data: critical } = await useFetch('/api/critical')

// Doesn't block navigation
const { data: optional, pending } = useLazyFetch('/api/optional')
</script>

<template>
  <div>
    <!-- Critical content always available -->
    <Hero :data="critical" />

    <!-- Optional content with loading state -->
    <section v-if="pending">Loading testimonials...</section>
    <Testimonials v-else :data="optional" />
  </div>
</template>
```

### Best Practices for Landing Pages

#### 1. Above-the-Fold Data (Blocking)

```typescript
<script setup lang="ts">
// Critical hero data - blocks navigation
const { data: hero } = await useFetch('/api/hero', {
  server: true,      // Fetch on server
  lazy: false,       // Block navigation
  dedupe: 'defer'    // Deduplicate requests
})
</script>
```

#### 2. Below-the-Fold Data (Non-Blocking)

```typescript
<script setup lang="ts">
// Testimonials can load after navigation
const { data: testimonials, pending } = useLazyFetch('/api/testimonials', {
  server: false  // Client-side only
})
</script>
```

#### 3. Conditional Fetching

```typescript
<script setup lang="ts">
const showReviews = ref(false)

// Only fetch when needed
const { data: reviews } = await useFetch('/api/reviews', {
  immediate: false,
  watch: [showReviews]
})

watch(showReviews, async (show) => {
  if (show && !reviews.value) {
    await refresh()
  }
})
</script>
```

#### 4. Pagination/Infinite Scroll

```typescript
<script setup lang="ts">
const page = ref(1)
const products = ref<Product[]>([])

const { data, pending } = await useFetch('/api/products', {
  query: { page, limit: 20 },
  watch: [page],
  onResponse({ response }) {
    products.value.push(...response._data)
  }
})

function loadMore() {
  page.value++
}
</script>
```

### Current Project Implementation

From `/pages/index.vue`:

```typescript
const { locale } = useI18n()

const {
  data: featuredData,
  pending: featuredPending,
  error: featuredError,
  refresh: refreshFeatured
} = await useFetch('/api/products/featured', {
  query: {
    limit: 12,
    locale: locale.value
  },
  server: true,    // Server-side fetch
  lazy: false      // Block navigation for featured products
})

const featuredProducts = computed(() =>
  featuredData.value?.products || []
)
```

**Strengths:**
- Server-side rendering for SEO
- Reactive to locale changes
- Type-safe with computed properties
- Error handling with retry mechanism

**Potential Optimization:**
```typescript
// Consider lazy loading if below fold
const { data, pending } = useLazyFetch('/api/products/featured', {
  query: { limit: 12, locale },
  server: true
})
```

### Error Handling

```typescript
<script setup lang="ts">
const { data, error, refresh } = await useFetch('/api/products')

// Handle errors
if (error.value) {
  if (error.value.statusCode === 404) {
    throw createError({ statusCode: 404, message: 'Products not found' })
  }
}
</script>

<template>
  <div v-if="error" class="error-state">
    <p>{{ error.message }}</p>
    <button @click="refresh">Retry</button>
  </div>
</template>
```

### Caching and Deduplication

```typescript
// Deduplicate identical requests
const { data } = await useFetch('/api/products', {
  dedupe: 'defer'  // or 'cancel'
})

// Custom cache key
const { data } = await useAsyncData(
  `products-${category.value}-${page.value}`,
  () => $fetch('/api/products', { query: { category, page } })
)

// Clear cache on demand
const { refresh } = await useFetch('/api/products')
await refresh()  // Bypasses cache
```

---

## 7. Performance Optimization

### Official Documentation
- **Performance Best Practices:** https://nuxt.com/docs/guide/best-practices/performance
- **Nuxt DevTools:** https://nuxt.com/docs/getting-started/dev-tools

### Lazy Loading Components

Use the `Lazy` prefix to defer component loading:

```vue
<template>
  <div>
    <!-- Loaded immediately -->
    <HeroSection />

    <!-- Loaded when visible or interacted with -->
    <LazyTestimonials />
    <LazyNewsletterSignup />
    <LazyFaqSection />
  </div>
</template>

<script setup lang="ts">
// No imports needed - auto-imported by Nuxt
// Components with 'Lazy' prefix are code-split automatically
</script>
```

**Manual lazy loading with defineAsyncComponent:**
```vue
<script setup lang="ts">
const HeavyChart = defineAsyncComponent(() =>
  import('~/components/HeavyChart.vue')
)
</script>
```

### Lazy Hydration (Nuxt 3.16+)

Control when components become interactive:

```vue
<template>
  <!-- Hydrate when visible in viewport -->
  <LazyTestimonials hydrate-on-visible />

  <!-- Hydrate when user hovers -->
  <LazyPricing hydrate-on-hover />

  <!-- Hydrate on specific event -->
  <LazyChart hydrate-on-interaction />

  <!-- Hydrate when idle -->
  <LazyFooter hydrate-on-idle />

  <!-- Never hydrate (static content) -->
  <LazyBanner :hydrate="false" />
</template>
```

**Benefits:**
- Reduces initial JavaScript payload
- Improves Time to Interactive (TTI)
- Better mobile performance

### Code Splitting

Nuxt automatically code-splits:
- Each page in `/pages`
- Each component in `/components` (with auto-imports)
- Lazy-loaded components

**Manual code splitting for large libraries:**
```typescript
<script setup lang="ts">
// Split heavy library into separate chunk
const { default: Chart } = await import('chart.js')
  .then(mod => ({ default: mod.Chart }))
</script>
```

### Optimize Images

Already covered in Section 4, but key points:

```vue
<template>
  <!-- Critical above-fold image -->
  <NuxtImg
    src="/hero.jpg"
    loading="eager"
    fetchpriority="high"
    width="1200"
    height="600"
  />

  <!-- Lazy load below-fold images -->
  <NuxtImg
    src="/product.jpg"
    loading="lazy"
    fetchpriority="low"
    width="400"
    height="400"
  />
</template>
```

### Preloading and Prefetching

```typescript
<script setup lang="ts">
// Preload critical resources
useHead({
  link: [
    // Preload critical images
    {
      rel: 'preload',
      as: 'image',
      href: '/hero.webp',
      type: 'image/webp'
    },
    // Preload critical fonts
    {
      rel: 'preload',
      as: 'font',
      href: '/fonts/inter.woff2',
      type: 'font/woff2',
      crossorigin: 'anonymous'
    },
    // Prefetch next page
    {
      rel: 'prefetch',
      href: '/products'
    }
  ]
})
</script>
```

### Bundle Size Optimization

**1. Analyze bundle:**
```bash
pnpm build --analyze
```

**2. Tree-shake unused code:**
```typescript
// ✅ Good: Import only what you need
import { ref, computed } from 'vue'

// ❌ Bad: Import everything
import * as Vue from 'vue'
```

**3. Dynamic imports for heavy dependencies:**
```typescript
// Only load when needed
async function openEditor() {
  const { Editor } = await import('~/components/HeavyEditor.vue')
  // Use editor...
}
```

### Optimize Third-Party Scripts

```typescript
<script setup lang="ts">
useHead({
  script: [
    // Defer non-critical scripts
    {
      src: 'https://analytics.example.com/script.js',
      defer: true
    },
    // Async load when possible
    {
      src: 'https://cdn.example.com/widget.js',
      async: true
    }
  ]
})
</script>
```

### Reduce JavaScript Execution

**1. Use CSS instead of JS when possible:**
```vue
<!-- ❌ Bad: JS-based animation -->
<div :style="{ transform: `translateX(${animatedX}px)` }">

<!-- ✅ Good: CSS animation -->
<div class="animate-slide-in">
```

**2. Debounce expensive operations:**
```typescript
import { useDebounceFn } from '@vueuse/core'

const debouncedSearch = useDebounceFn(async (query) => {
  await $fetch('/api/search', { query: { q: query } })
}, 300)
```

**3. Memoize expensive computations:**
```typescript
const expensiveResult = computed(() => {
  // Heavy calculation
  return data.value.map(item =>
    // Complex transformation
  )
})
```

### Optimize Data Fetching

```typescript
// ✅ Parallel requests
const [products, categories] = await Promise.all([
  $fetch('/api/products'),
  $fetch('/api/categories')
])

// ❌ Sequential requests (slower)
const products = await $fetch('/api/products')
const categories = await $fetch('/api/categories')
```

### PWA Optimization

Your project uses `@vite-pwa/nuxt`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    manifest: {
      name: 'Moldova Direct',
      theme_color: '#1e40af',
      icons: [
        { src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml' }
      ]
    }
  }
})
```

**Benefits:**
- Offline support
- Faster repeat visits
- App-like experience

### Current Project Optimizations

Your `nuxt.config.ts` already includes:

```typescript
vite: {
  ssr: {
    noExternal: ['vue', '@vue/*']  // Prevent SSR issues
  },
  server: {
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/coverage/**',
        '**/test-results/**'
      ]
    }
  }
}
```

**Recommendation:** Add lazy loading to heavy sections:
```vue
<!-- pages/index.vue -->
<template>
  <HomeHeroSection :highlights="heroHighlights" />

  <!-- Lazy load below-fold sections -->
  <LazyHomeFeaturedProductsSection />
  <LazyHomeTestimonials />
  <LazyHomeFaqPreviewSection />
</template>
```

### Performance Metrics to Monitor

1. **Lighthouse Core Web Vitals:**
   - LCP (Largest Contentful Paint) < 2.5s
   - FID (First Input Delay) < 100ms
   - CLS (Cumulative Layout Shift) < 0.1

2. **Nuxt DevTools:**
   - Bundle size analysis
   - Component dependencies
   - Route performance

3. **Server Response Time:**
   - TTFB (Time to First Byte) < 600ms

---

## 8. Nuxt 3 Modules for Landing Pages

### Installed Modules in Your Project

| Module | Version | Purpose |
|--------|---------|---------|
| `@nuxtjs/i18n` | 10.0.3 | Internationalization |
| `@nuxt/image` | 1.11.0 | Image optimization |
| `@pinia/nuxt` | 0.11.2 | State management |
| `shadcn-nuxt` | 2.2.0 | UI components |
| `@vite-pwa/nuxt` | 1.0.4 | PWA support |
| `vue3-carousel-nuxt` | 1.1.6 | Carousel component |
| `@nuxtjs/supabase` | 1.6.0 | Supabase integration |

### 1. @nuxtjs/i18n (Internationalization)

**Official Docs:** https://i18n.nuxtjs.org/

**Current Configuration:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  i18n: {
    locales: [
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ro', name: 'Română', file: 'ro.json' },
      { code: 'ru', name: 'Русский', file: 'ru.json' }
    ],
    langDir: 'locales',
    defaultLocale: 'es',
    strategy: 'prefix_except_default',  // /en/page, /page (default)
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  }
})
```

**Usage in Components:**
```vue
<script setup lang="ts">
const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div>
    <h1>{{ t('home.title') }}</h1>
    <NuxtLink :to="localePath('/about')">{{ t('nav.about') }}</NuxtLink>

    <!-- Language switcher -->
    <select v-model="locale">
      <option v-for="loc in locales" :value="loc.code">
        {{ loc.name }}
      </option>
    </select>
  </div>
</template>
```

**SEO Integration:**
```typescript
const { locale } = useI18n()

useSeoMeta({
  ogLocale: locale.value,
  ogLocaleAlternate: locales.value
    .filter(l => l.code !== locale.value)
    .map(l => l.code)
})
```

### 2. @nuxt/image (Already covered in Section 4)

Quick reference:
```vue
<NuxtImg src="/hero.jpg" width="1200" height="600" loading="eager" />
<NuxtPicture src="/hero.jpg" format="webp,jpg" />
```

### 3. @pinia/nuxt (State Management)

**Official Docs:** https://pinia.vuejs.org/

**Define a store:**
```typescript
// stores/cart.ts
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  function addItem(item: CartItem) {
    items.value.push(item)
  }

  return { items, total, addItem }
})
```

**Usage in components:**
```vue
<script setup lang="ts">
const cart = useCartStore()
</script>

<template>
  <div>
    <p>Total: {{ cart.total }}€</p>
    <button @click="cart.addItem(product)">Add to Cart</button>
  </div>
</template>
```

### 4. shadcn-nuxt (UI Components)

Covered in detail in Section 10.

### 5. @vite-pwa/nuxt (Progressive Web App)

**Official Docs:** https://vite-pwa-org.netlify.app/frameworks/nuxt.html

**Current Configuration:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    manifest: {
      name: 'Moldova Direct',
      short_name: 'Moldova Direct',
      description: 'Authentic Moldovan food and wine products',
      theme_color: '#1e40af',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        { src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml' }
      ],
      shortcuts: [
        {
          name: 'Products',
          url: '/products',
          icons: [{ src: '/icon.svg', sizes: '192x192' }]
        }
      ]
    }
  }
})
```

**Benefits for landing pages:**
- Installable as app
- Offline support
- Faster repeat visits
- Push notifications (optional)

### Additional Recommended Modules

#### 1. Nuxt SEO Kit
```bash
pnpm add @nuxtjs/seo
```

**Features:**
- Automatic sitemap generation
- robots.txt management
- Enhanced SEO composables

**Configuration:**
```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/seo'],
  seo: {
    sitemap: {
      hostname: 'https://moldovadirect.com',
      exclude: ['/admin/**']
    }
  }
})
```

#### 2. Nuxt Analytics (@nuxtjs/plausible or @nuxtjs/google-analytics)

**Plausible (Privacy-focused):**
```bash
pnpm add @nuxtjs/plausible
```

```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/plausible'],
  plausible: {
    domain: 'moldovadirect.com'
  }
})
```

#### 3. Nuxt Content (@nuxt/content)

For blog/content-driven landing pages:
```bash
pnpm add @nuxt/content
```

```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/content']
})
```

**Usage:**
```vue
<script setup lang="ts">
const { data } = await useAsyncData('blog', () =>
  queryContent('/blog').find()
)
</script>
```

---

## 9. TypeScript Best Practices

### Official Documentation
- **TypeScript Guide:** https://nuxt.com/docs/guide/concepts/typescript
- **TypeScript Config:** https://nuxt.com/docs/api/nuxt-config#typescript

### Zero-Config TypeScript

Nuxt 3 comes with TypeScript support out of the box:

```typescript
// nuxt.config.ts (recommended extension)
export default defineNuxtConfig({
  typescript: {
    strict: true,        // Enable strict checks (default in Nuxt 3)
    typeCheck: true,     // Type check on build
    shim: false          // Disable shims for better IDE support
  }
})
```

### TypeScript Configuration

Your project's minimal setup:
```json
// tsconfig.json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

**Auto-generated configs:**
- `.nuxt/tsconfig.json` - Main TypeScript config
- `.nuxt/tsconfig.app.json` - Application code config
- `.nuxt/tsconfig.node.json` - nuxt.config and modules config

### Type-Safe Components

#### Props with TypeScript

```vue
<script setup lang="ts">
// Inline type definition
const props = defineProps<{
  title: string
  count?: number
  items: Array<{ id: string; name: string }>
}>()

// With defaults
const props = withDefaults(
  defineProps<{
    title: string
    count?: number
  }>(),
  {
    count: 0
  }
)
</script>
```

#### Emits with TypeScript

```vue
<script setup lang="ts">
const emit = defineEmits<{
  update: [value: number]
  delete: []
  change: [id: string, value: string]
}>()

// Usage
emit('update', 42)
emit('change', 'id-1', 'new value')
</script>
```

### Type-Safe Composables

```typescript
// composables/useProducts.ts
import type { Ref } from 'vue'

export interface Product {
  id: string
  name: string
  price: number
  category: 'wine' | 'gourmet' | 'gift'
}

export interface UseProductsReturn {
  products: Ref<Product[]>
  loading: Ref<boolean>
  error: Ref<Error | null>
  fetchProducts: () => Promise<void>
}

export function useProducts(): UseProductsReturn {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchProducts() {
    loading.value = true
    try {
      products.value = await $fetch<Product[]>('/api/products')
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    loading,
    error,
    fetchProducts
  }
}
```

### API Route Types

```typescript
// server/api/products.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const products = await db.products.findMany({
    where: { category: query.category }
  })

  return products
})

// Type for the response
export type ProductsResponse = Awaited<ReturnType<typeof defineEventHandler>>
```

**Usage in components:**
```typescript
const { data } = await useFetch<Product[]>('/api/products')
// data is typed as Ref<Product[] | null>
```

### Type Imports and Exports

```typescript
// types/index.ts
export interface Product {
  id: string
  name: string
  price: number
}

export type ProductWithRelations = Product & {
  category: Category
  reviews: Review[]
}
```

**Auto-imported types:**
```typescript
// No import needed - auto-imported from ~/types
const product: Product = { id: '1', name: 'Wine', price: 25 }
```

### Runtime Type Validation with Zod

Your project uses Zod v4.0.17:

```typescript
import { z } from 'zod'

// Define schema
const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  category: z.enum(['wine', 'gourmet', 'gift'])
})

// Type inference
type Product = z.infer<typeof ProductSchema>

// Runtime validation
const product = ProductSchema.parse(data)  // Throws if invalid
const result = ProductSchema.safeParse(data)  // Returns { success: boolean, data/error }
```

**In API routes:**
```typescript
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate request body
  const validated = ProductSchema.parse(body)

  return await db.products.create({ data: validated })
})
```

### Generic Components

```vue
<script setup lang="ts" generic="T extends { id: string }">
defineProps<{
  items: T[]
  onSelect: (item: T) => void
}>()
</script>

<template>
  <div v-for="item in items" :key="item.id" @click="onSelect(item)">
    <slot :item="item" />
  </div>
</template>
```

**Usage:**
```vue
<DataList
  :items="products"
  :on-select="(product) => console.log(product.name)"
>
  <template #default="{ item }">
    {{ item.name }} <!-- Fully typed -->
  </template>
</DataList>
```

### Nuxt-Specific Types

```typescript
import type {
  NuxtApp,
  NuxtConfig,
  RouteLocationNormalized
} from 'nuxt/schema'

import type { FetchError } from 'ofetch'

// Plugin types
export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  // ...
})

// Middleware types
export default defineNuxtRouteMiddleware((to, from) => {
  // to and from are typed as RouteLocationNormalized
})
```

### Type-Safe Environment Variables

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Private (server-only)
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,

    // Public (client-accessible)
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://moldovadirect.com'
    }
  }
})
```

**Usage with types:**
```typescript
const config = useRuntimeConfig()

// config.stripeSecretKey - Only in server
// config.public.siteUrl - Available in client & server
```

### Best Practices

1. **Always use `.ts` extension for nuxt.config:**
   ```typescript
   // nuxt.config.ts (not .js)
   export default defineNuxtConfig({ })
   ```

2. **Enable strict mode:**
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noUncheckedIndexedAccess": true
     }
   }
   ```

3. **Use type imports:**
   ```typescript
   import type { Product } from '~/types'  // Type-only import
   ```

4. **Leverage auto-imports:**
   ```typescript
   // No need to import ref, computed, etc.
   const count = ref(0)
   const doubled = computed(() => count.value * 2)
   ```

5. **Use Nuxt type utilities:**
   ```typescript
   import type { PageMeta, MiddlewareKey } from '#app'
   ```

---

## 10. shadcn-vue Integration

### Official Documentation
- **shadcn-vue Nuxt Guide:** https://www.shadcn-vue.com/docs/installation/nuxt
- **shadcn-nuxt Module:** https://nuxt.com/modules/shadcn

### Installation (Already Done)

Your project has `shadcn-nuxt: ^2.2.0` installed.

**Current Configuration:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['shadcn-nuxt'],
  shadcn: {
    prefix: 'Ui',              // Component prefix (UiButton)
    componentDir: './components/ui'  // UI components directory
  }
})
```

### Adding Components

```bash
# Add individual components
pnpm dlx shadcn-vue@latest add button
pnpm dlx shadcn-vue@latest add card
pnpm dlx shadcn-vue@latest add dialog

# Add multiple components
pnpm dlx shadcn-vue@latest add button card dialog input
```

### Component Usage

With `prefix: 'Ui'`, components are auto-imported with the prefix:

```vue
<template>
  <div>
    <!-- Auto-imported as UiButton -->
    <UiButton variant="default" size="lg">
      Click me
    </UiButton>

    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Product Name</UiCardTitle>
        <UiCardDescription>Premium Moldovan wine</UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <p>Description here...</p>
      </UiCardContent>
      <UiCardFooter>
        <UiButton>Add to Cart</UiButton>
      </UiCardFooter>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
// No imports needed - auto-imported by Nuxt
</script>
```

### Project-Specific Implementation

Your project explicitly imports UI components (from `nuxt.config.ts` hooks):

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  components: {
    extensions: ['vue'],  // Only .vue files
    dirs: [
      {
        path: '~/components',
        ignore: ['ui/**', '**/index.ts']  // Exclude shadcn-ui folder
      }
    ]
  },
  hooks: {
    'components:dirs'(dirs) {
      // Remove auto-registered UI directory
      for (let i = dirs.length - 1; i >= 0; i--) {
        if (dirs[i]?.path?.includes('/components/ui')) {
          dirs.splice(i, 1)
        }
      }
    }
  }
})
```

**Reason:** Prevent TypeScript barrel files (`index.ts`) from being registered as components.

### SSR Width Plugin

Required for proper SSR hydration:

```typescript
// plugins/ssr-width.ts
import { provideSSRWidth } from '@vueuse/core'

export default defineNuxtPlugin((nuxtApp) => {
  provideSSRWidth(1024, nuxtApp.vueApp)
})
```

### Tailwind CSS v4 Integration

Your project uses Tailwind v4 with Vite:

```typescript
// nuxt.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [tailwindcss()]
  }
})
```

```css
/* assets/css/tailwind.css */
@import "tailwindcss";
```

### Component Variants with CVA

shadcn-vue uses `class-variance-authority` (already installed):

```typescript
// components/ui/button/index.ts
import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
```

### Custom Component Patterns

**Extend shadcn components:**
```vue
<!-- components/ProductCard.vue -->
<template>
  <UiCard class="product-card">
    <UiCardHeader>
      <NuxtImg :src="product.image" class="rounded-t-lg" />
    </UiCardHeader>
    <UiCardContent>
      <h3 class="font-semibold">{{ product.name }}</h3>
      <p class="text-muted-foreground">{{ product.price }}€</p>
    </UiCardContent>
    <UiCardFooter>
      <UiButton @click="addToCart" class="w-full">
        Add to Cart
      </UiButton>
    </UiCardFooter>
  </UiCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  product: Product
}>()

function addToCart() {
  // Cart logic
}
</script>
```

### Form Patterns with shadcn-vue

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <div>
        <UiLabel for="email">Email</UiLabel>
        <UiInput
          id="email"
          v-model="form.email"
          type="email"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <UiLabel for="message">Message</UiLabel>
        <UiTextarea
          id="message"
          v-model="form.message"
          placeholder="Your message..."
        />
      </div>

      <UiButton type="submit" :disabled="loading">
        {{ loading ? 'Sending...' : 'Send' }}
      </UiButton>
    </div>
  </form>
</template>

<script setup lang="ts">
const form = reactive({
  email: '',
  message: ''
})

const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  await $fetch('/api/contact', { method: 'POST', body: form })
  loading.value = false
}
</script>
```

### Dialog/Modal Pattern

```vue
<template>
  <UiDialog v-model:open="isOpen">
    <UiDialogTrigger as-child>
      <UiButton>Open Product Details</UiButton>
    </UiDialogTrigger>
    <UiDialogContent>
      <UiDialogHeader>
        <UiDialogTitle>{{ product.name }}</UiDialogTitle>
        <UiDialogDescription>
          {{ product.description }}
        </UiDialogDescription>
      </UiDialogHeader>
      <div class="py-4">
        <NuxtImg :src="product.image" class="rounded-lg" />
      </div>
      <UiDialogFooter>
        <UiButton @click="addToCart">Add to Cart</UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
const isOpen = ref(false)
</script>
```

### Recommended Components for Landing Pages

**Essential:**
- `button` - CTAs, actions
- `card` - Product cards, feature sections
- `badge` - Labels, tags
- `separator` - Section dividers

**Navigation:**
- `navigation-menu` - Main navigation
- `dropdown-menu` - User menus
- `sheet` - Mobile menu

**Content:**
- `accordion` - FAQs
- `tabs` - Product categories
- `carousel` - Image galleries (or use vue3-carousel-nuxt)

**Forms:**
- `input` - Text inputs
- `textarea` - Messages
- `select` - Dropdowns
- `checkbox` - Agreements
- `label` - Form labels

**Feedback:**
- `dialog` - Modals
- `alert` - Notifications
- `toast` - Success/error messages (or use vue-sonner)

### Integration with Project Components

Your project structure:
```
components/
├── ui/               # shadcn-vue components
│   ├── button/
│   ├── card/
│   └── ...
└── home/             # Custom landing components
    ├── HeroSection.vue
    ├── CategoryGrid.vue
    └── FeaturedProducts.vue
```

**Use shadcn in custom components:**
```vue
<!-- components/home/HeroSection.vue -->
<template>
  <section class="py-20 text-center">
    <h1 class="text-5xl font-bold mb-6">
      {{ $t('home.hero.title') }}
    </h1>
    <p class="text-xl text-muted-foreground mb-8">
      {{ $t('home.hero.subtitle') }}
    </p>
    <div class="flex gap-4 justify-center">
      <UiButton size="lg" as-child>
        <NuxtLink :to="localePath('/products')">
          {{ $t('home.hero.cta') }}
        </NuxtLink>
      </UiButton>
      <UiButton size="lg" variant="outline" as-child>
        <NuxtLink :to="localePath('/about')">
          {{ $t('home.hero.learnMore') }}
        </NuxtLink>
      </UiButton>
    </div>
  </section>
</template>
```

---

## Summary and Recommendations

### Current Project Strengths

1. **Modern Stack:** Nuxt 3.17.7, Vue 3.5.18, TypeScript
2. **Comprehensive i18n:** Multi-language support with SEO
3. **Image Optimization:** @nuxt/image configured
4. **PWA Ready:** Progressive Web App capabilities
5. **Component System:** shadcn-vue + custom components
6. **Type Safety:** Strong TypeScript integration
7. **SEO Foundation:** Custom `useLandingSeo` composable

### Optimization Opportunities

1. **Add Route Rules for Performance:**
   ```typescript
   routeRules: {
     '/': { prerender: true },
     '/about': { prerender: true },
     '/products': { isr: 3600 }
   }
   ```

2. **Implement Lazy Loading:**
   ```vue
   <LazyHomeFeaturedProducts />
   <LazyHomeTestimonials />
   ```

3. **Add Lazy Hydration (Nuxt 3.16+):**
   ```vue
   <LazyNewsletterSignup hydrate-on-visible />
   ```

4. **Optimize Images:**
   ```vue
   <NuxtImg
     src="/hero.jpg"
     loading="eager"
     fetchpriority="high"
   />
   ```

5. **Consider SEO Module:**
   ```bash
   pnpm add @nuxtjs/seo
   ```

### Landing Page Checklist

- [ ] Set `prerender: true` for static landing pages
- [ ] Lazy load below-fold sections
- [ ] Use `<NuxtImg>` for all images
- [ ] Implement lazy hydration for heavy components
- [ ] Add structured data (JSON-LD)
- [ ] Configure proper meta tags with `useLandingSeo`
- [ ] Set up hreflang tags for i18n
- [ ] Optimize Core Web Vitals (LCP, FID, CLS)
- [ ] Enable PWA manifest and service worker
- [ ] Add analytics integration

### Additional Resources

- **Nuxt 3 Docs:** https://nuxt.com/docs
- **Vue 3 Docs:** https://vuejs.org/
- **TypeScript:** https://www.typescriptlang.org/
- **shadcn-vue:** https://www.shadcn-vue.com/
- **Nuxt Image:** https://image.nuxt.com/
- **Nuxt i18n:** https://i18n.nuxtjs.org/

---

**Document Version:** 1.0
**Last Updated:** 2025-11-09
**Maintained By:** Development Team
