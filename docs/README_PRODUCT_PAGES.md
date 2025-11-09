# Product Pages Documentation - Moldova Direct

Complete documentation package for building optimized product listing and detail pages with Nuxt 3.

---

## Documentation Files

### 1. [NUXT3_PRODUCT_PAGE_DOCUMENTATION.md](./NUXT3_PRODUCT_PAGE_DOCUMENTATION.md)
**Comprehensive technical documentation** covering all aspects of product page development.

**Covers:**
- Nuxt 3 Core (useFetch, useAsyncData, lazy loading)
- Route Rules & Hybrid Rendering (SWR, ISR)
- Nuxt Image Module (responsive images, optimization)
- Pinia Store Patterns (Setup Stores, SSR)
- Vue 3 Composition API (route watching, virtual scrolling)
- TypeScript Patterns (type definitions, type safety)
- Supabase Integration (querying, filtering, pagination)
- SEO & Head Management
- Common Patterns & Pitfalls
- Implementation Checklist

**Use When:** You need detailed explanations, official documentation links, and best practices.

---

### 2. [QUICK_REFERENCE_PRODUCT_PAGES.md](./QUICK_REFERENCE_PRODUCT_PAGES.md)
**Quick reference guide** with code snippets and cheat sheets.

**Covers:**
- Data Fetching Cheat Sheet (when to use what)
- Route Rules Quick Reference
- Nuxt Image Quick Patterns
- Pinia Store Patterns
- Supabase Queries
- Vue Router Patterns
- TypeScript Quick Types
- SEO Quick Pattern
- Performance Checklist
- Common Mistakes to Avoid

**Use When:** You need a quick reminder or code snippet while implementing.

---

### 3. [IMPLEMENTATION_EXAMPLES.md](./IMPLEMENTATION_EXAMPLES.md)
**Practical implementation examples** tailored to your Moldova Direct project.

**Covers:**
- Refactoring Products Store to Setup Stores
- Optimized Product Card Component
- Enhanced Filter Component with URL Sync
- Server API Route with Supabase
- Infinite Scroll Implementation
- SEO-Optimized Product Detail Page
- Implementation Priority Checklist

**Use When:** You're ready to implement features and need copy-paste examples.

---

## Your Current Tech Stack

```json
{
  "nuxt": "3.19.2",
  "@nuxt/image": "1.11.0",
  "@pinia/nuxt": "0.11.2",
  "@nuxtjs/supabase": "1.6.2",
  "vue": "3.5.18",
  "pinia": "3.0.4",
  "typescript": "^5.x"
}
```

**Current Route Rules (nuxt.config.ts):**
```typescript
routeRules: {
  '/': { swr: 3600, prerender: true },
  '/products': { swr: 3600 },
  '/products/**': { swr: 3600 },
}
```

---

## Quick Start Guide

### 1. Read the Docs
Start with the comprehensive documentation:
```bash
open docs/NUXT3_PRODUCT_PAGE_DOCUMENTATION.md
```

### 2. Reference While Coding
Keep the quick reference handy:
```bash
open docs/QUICK_REFERENCE_PRODUCT_PAGES.md
```

### 3. Implement Features
Use practical examples:
```bash
open docs/IMPLEMENTATION_EXAMPLES.md
```

---

## Key Recommendations

Based on your current `/pages/products/index.vue` and `/stores/products.ts`:

### Immediate Wins (Low Effort, High Impact)

1. **Optimize Product Images**
   ```vue
   <!-- First 4 products -->
   <NuxtImg loading="eager" fetchpriority="high" />

   <!-- Rest of products -->
   <NuxtImg loading="lazy" fetchpriority="low" />
   ```

2. **Add Cache Headers to API Routes**
   ```typescript
   // server/api/products/index.get.ts
   setResponseHeaders(event, {
     'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
   })
   ```

3. **Sync Filters with URL**
   - Already partially implemented
   - Enhance with `useDebounceFn` from @vueuse/core

4. **Add SEO Meta Tags**
   - Use `useSeoMeta` for product listing
   - Add JSON-LD structured data

### Future Enhancements (Higher Effort)

1. **Refactor to Setup Stores**
   - Modern, type-safe pattern
   - Better composition with composables
   - See: `IMPLEMENTATION_EXAMPLES.md` Section 1

2. **Implement Infinite Scroll**
   - Alternative to pagination
   - Better mobile experience
   - See: `IMPLEMENTATION_EXAMPLES.md` Section 5

3. **Virtual Scrolling for 100+ Products**
   - Already have `/components/mobile/VirtualProductGrid.vue`
   - Optimize for desktop as well

4. **Real-time Stock Updates**
   - Use Supabase Realtime
   - See: `NUXT3_PRODUCT_PAGE_DOCUMENTATION.md` Section 7.4

---

## File Structure Overview

```
/stores
  /products.ts              ← Options API (consider Setup Stores)
  /categories.ts
  /search.ts

/pages
  /products
    /index.vue              ← Main products listing page
    /[slug].vue             ← Product detail page

/components
  /product
    /Card.vue               ← Product card (needs image optimization)
    /Filter/
      /Main.vue
    /CategoryNavigation.vue
  /mobile
    /VirtualProductGrid.vue ← Already implemented!

/server/api
  /products
    /index.get.ts           ← Needs cache headers
    /[slug].get.ts
    /price-range.get.ts

/docs
  /NUXT3_PRODUCT_PAGE_DOCUMENTATION.md  ← Comprehensive guide
  /QUICK_REFERENCE_PRODUCT_PAGES.md     ← Quick reference
  /IMPLEMENTATION_EXAMPLES.md           ← Practical examples
  /README_PRODUCT_PAGES.md              ← This file
```

---

## Performance Checklist

Use this checklist when implementing product pages:

### Data Fetching
- [ ] Using `useFetch` or `useAsyncData` with unique keys
- [ ] Lazy loading non-critical data
- [ ] Not using `$fetch` for initial component data
- [ ] Proper error and loading state handling

### Images
- [ ] First 4 products use `loading="eager"`
- [ ] Remaining products use `loading="lazy"`
- [ ] All images have `width` and `height` attributes
- [ ] Using `sizes` attribute for responsive images
- [ ] Format is `webp` or `avif`

### Caching
- [ ] Route rules configured (`swr: 3600`)
- [ ] API routes have cache headers
- [ ] Client-side caching in store (already implemented)
- [ ] Proper cache invalidation

### SEO
- [ ] `useSeoMeta` implemented
- [ ] Unique titles and descriptions
- [ ] Open Graph tags
- [ ] JSON-LD structured data
- [ ] Canonical URLs

### TypeScript
- [ ] All API responses typed
- [ ] Component props typed
- [ ] Store actions typed
- [ ] Supabase types generated

---

## Common Patterns You'll Use

### Pattern 1: Fetch Products with Filters
```vue
<script setup>
const { data, pending } = await useFetch('/api/products', {
  key: 'products-filtered',
  query: {
    category: 'wine',
    page: 1,
    limit: 24,
  },
})
</script>
```

### Pattern 2: Watch Route and Refetch
```vue
<script setup>
const route = useRoute()

watch(
  () => route.query.category,
  async (newCategory) => {
    if (newCategory) {
      await fetchProducts({ category: newCategory })
    }
  }
)
</script>
```

### Pattern 3: Optimized Product Images
```vue
<NuxtImg
  :src="product.image"
  width="400"
  height="400"
  format="webp"
  loading="lazy"
  sizes="sm:100vw md:50vw lg:33vw xl:25vw"
/>
```

### Pattern 4: Supabase Pagination
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

---

## Helpful Resources

### Official Documentation
- [Nuxt 3 Docs](https://nuxt.com/docs) - Official Nuxt documentation
- [Nuxt Image](https://image.nuxt.com) - Image optimization module
- [Pinia](https://pinia.vuejs.org) - State management
- [Vue Router](https://router.vuejs.org) - Routing
- [Supabase JS](https://supabase.com/docs/reference/javascript) - Database client

### Community Resources
- [Mastering Nuxt](https://masteringnuxt.com) - Advanced Nuxt patterns
- [VueUse](https://vueuse.org) - Composition utilities
- [Vue School](https://vueschool.io) - Video tutorials

### Tools
- [Nuxt DevTools](https://devtools.nuxt.com) - Built-in development tools
- [Vue DevTools](https://devtools.vuejs.org) - Browser extension
- [Supabase Studio](https://supabase.com/docs/guides/platform) - Database management

---

## Questions & Troubleshooting

### Q: Should I refactor to Setup Stores now?
**A:** Not urgent. Your current Options API store works well. Consider it when:
- You need better TypeScript inference
- You want to extract reusable logic
- You're building new stores

### Q: When should I use virtual scrolling?
**A:** When displaying 100+ products. You already have it for mobile. Consider for desktop if:
- Users frequently browse large catalogs
- Performance metrics show slowdowns
- You want to implement infinite scroll

### Q: How do I handle real-time stock updates?
**A:** See Section 7.4 in `NUXT3_PRODUCT_PAGE_DOCUMENTATION.md`. Use Supabase Realtime subscriptions.

### Q: My images are loading slowly
**A:** Check:
1. Using `loading="lazy"` for below-fold images?
2. Set proper `sizes` attribute?
3. Using `format="webp"`?
4. Images have `width` and `height`?

### Q: Filters aren't persisting across navigation
**A:** Implement URL sync (see `IMPLEMENTATION_EXAMPLES.md` Section 3) or use localStorage with `useStorage` from @vueuse/core.

---

## Next Steps

1. **Review Current Implementation**
   - Read through `/pages/products/index.vue`
   - Check `/stores/products.ts`
   - Understand current patterns

2. **Plan Your Approach**
   - Identify quick wins (image optimization)
   - Prioritize features (SEO, caching)
   - Consider long-term refactoring (Setup Stores)

3. **Implement Incrementally**
   - Start with low-hanging fruit
   - Test each change
   - Monitor performance

4. **Measure Results**
   - Use Lighthouse for performance
   - Check Core Web Vitals
   - Monitor Supabase query performance

---

**Documentation Created:** 2025-11-09
**For:** Moldova Direct Wine E-commerce
**Nuxt Version:** 3.19.2
**Author:** Framework Documentation Researcher (Claude)
