# Quick Reference: Product Pages


## Data Fetching Cheat Sheet

### When to Use What

| Scenario | Use | Example |
|----------|-----|---------|
| Simple API call | `useFetch` | `useFetch('/api/products')` |
| Supabase query | `useAsyncData` | `useAsyncData('products', async () => supabase.from('products').select())` |
| Below-fold data | `useLazyFetch` | `useLazyFetch('/api/filters')` |
| User interaction | `$fetch` | `$fetch('/api/cart', { method: 'POST' })` |

### Common Patterns

**Basic Product List:**
```vue
<script setup>
const { data, pending } = await useFetch('/api/products', {
  key: 'products-all',
  query: { category: 'wine' }
})
</script>
```

**With Supabase:**
```vue
<script setup>
const { data } = await useAsyncData('products', async () => {
  const supabase = useSupabaseClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .range(0, 23)
  return data
})
</script>
```

---

## Route Rules Quick Reference

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // SWR - 1 hour cache
    '/products': { swr: 3600 },

    // ISR - CDN cache
    '/products/**': { isr: 3600 },

    // Client-only (no SSR)
    '/cart': { ssr: false },

    // Prerender + SWR
    '/': { prerender: true, swr: 3600 },
  }
})
```

---

## Nuxt Image Quick Patterns

**Product Card:**
```vue
<NuxtImg
  :src="product.image"
  width="400"
  height="400"
  format="webp"
  loading="lazy"
  sizes="sm:100vw md:50vw lg:33vw xl:25vw"
  :alt="product.name"
/>
```

**Hero Image (above fold):**
```vue
<NuxtImg
  :src="heroImage"
  loading="eager"
  fetchpriority="high"
  format="webp"
  sizes="100vw"
/>
```

**With Placeholder:**
```vue
<NuxtImg
  :src="product.image"
  placeholder
  sizes="sm:100vw md:50vw lg:400px"
/>
```

---

## Pinia Store Patterns

**Setup Store (Modern):**
```typescript
export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)

  async function fetchProducts(filters = {}) {
    loading.value = true
    const { data } = await $fetch('/api/products', { query: filters })
    products.value = data
    loading.value = false
  }

  return { products, loading, fetchProducts }
})
```

**Use in Component:**
```vue
<script setup>
import { storeToRefs } from 'pinia'

const store = useProductsStore()
const { products, loading } = storeToRefs(store)
const { fetchProducts } = store

await callOnce('products', () => fetchProducts())
</script>
```

---

## Supabase Queries

**Basic Query:**
```typescript
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
```

**With Relations:**
```typescript
const { data } = await supabase
  .from('products')
  .select(`
    *,
    categories(*),
    images:product_images(*)
  `)
```

**Pagination:**
```typescript
const page = 1
const limit = 24
const from = (page - 1) * limit
const to = from + limit - 1

const { data } = await supabase
  .from('products')
  .select('*')
  .order('created_at', { ascending: false })
  .range(from, to)
```

**Filters:**
```typescript
let query = supabase.from('products').select('*')

if (category) query = query.eq('category_id', category)
if (search) query = query.ilike('name', `%${search}%`)
if (priceMin) query = query.gte('price', priceMin)
if (priceMax) query = query.lte('price', priceMax)
if (inStock) query = query.gt('stock_quantity', 0)

const { data } = await query
```

---

## Vue Router Patterns

**Watch Route Params:**
```vue
<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

watch(
  () => route.query.category,
  async (newCategory) => {
    await fetchProducts({ category: newCategory })
  }
)
</script>
```

**Sync with URL:**
```vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function updateURL(filters) {
  router.push({
    query: {
      category: filters.category || undefined,
      page: filters.page || undefined,
    }
  })
}
</script>
```

---

## TypeScript Quick Types

```typescript
// Product Types
interface Product {
  id: number
  name: Translations
  slug: string
  price: number
  stockQuantity: number
}

interface ProductWithRelations extends Product {
  categories: Category[]
  images: ProductImage[]
  attributes: ProductAttribute[]
}

// Filter Types
interface ProductFilters {
  category?: string | number
  search?: string
  priceMin?: number
  priceMax?: number
  inStock?: boolean
  page?: number
  limit?: number
}

// API Response
interface ProductListResponse {
  success: boolean
  products: ProductWithRelations[]
  pagination: Pagination
}
```

---

## SEO Quick Pattern

```vue
<script setup>
useSeoMeta({
  title: 'Shop Moldovan Wine - Moldova Direct',
  description: 'Browse authentic Moldovan wine and food products.',
  ogTitle: 'Shop Moldovan Wine',
  ogDescription: 'Premium quality directly from Moldova to Spain.',
  ogImage: '/images/og-products.jpg',
  ogType: 'website',
})
</script>
```

---

## Performance Checklist

### Product Listing Page
- [ ] Use `useFetch` with unique `key`
- [ ] Add route rule: `{ swr: 3600 }`
- [ ] Lazy load images below fold
- [ ] Set image `width` and `height`
- [ ] Use `sizes` attribute
- [ ] Debounce search (300ms)
- [ ] Add loading skeletons
- [ ] Implement pagination

### Images
- [ ] First 4 products: `loading="eager"`
- [ ] Rest: `loading="lazy"`
- [ ] Use `format="webp"`
- [ ] Set proper `sizes`
- [ ] Add placeholders

### Caching
- [ ] Route rule configured
- [ ] Unique keys for `useFetch`
- [ ] Client-side cache in store
- [ ] Filter persistence (optional)

---

## Common Mistakes to Avoid

1. **Don't watch entire route object**
   ```typescript
   // ❌ Bad
   watch(route, ...)

   // ✅ Good
   watch(() => route.query.category, ...)
   ```

2. **Don't forget keys**
   ```typescript
   // ❌ Bad - cache collision
   useFetch('/api/products')

   // ✅ Good
   useFetch('/api/products', { key: 'products-all' })
   ```

3. **Don't use $fetch in components (for initial data)**
   ```typescript
   // ❌ Bad - fetches twice
   const data = await $fetch('/api/products')

   // ✅ Good
   const { data } = await useFetch('/api/products')
   ```

4. **Don't forget loading states with lazy**
   ```vue
   <!-- ❌ Bad -->
   <div>{{ data.products }}</div>

   <!-- ✅ Good -->
   <div v-if="pending">Loading...</div>
   <div v-else>{{ data.products }}</div>
   ```

5. **Don't forget to order before range**
   ```typescript
   // ❌ Bad - unpredictable results
   supabase.from('products').select().range(0, 23)

   // ✅ Good
   supabase.from('products').select().order('created_at').range(0, 23)
   ```

---

## Useful Composables from @vueuse/core

```typescript
import {
  useDebounceFn,        // Debounce function calls
  useIntersectionObserver, // Infinite scroll
  useStorage,           // localStorage persistence
  useWindowScroll,      // Scroll position
  useBreakpoints,       // Responsive breakpoints
} from '@vueuse/core'
```

---

**Quick Links:**
- [Full Documentation](../../how-to/authentication/nuxt3-product-page-documentation.md)
- [Nuxt Docs](https://nuxt.com/docs)
- [Nuxt Image](https://image.nuxt.com)
- [Pinia](https://pinia.vuejs.org)
- [Supabase](https://supabase.com/docs)
