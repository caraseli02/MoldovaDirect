# LandingProductCarousel - Usage Example

## Quick Start

### 1. Import and Use in Landing Page

```vue
<!-- pages/new.vue or pages/index.vue -->
<template>
  <div>
    <!-- Other landing sections -->
    <LandingHeroSection />
    <LandingMediaMentionsBar />

    <!-- Product Carousel Section -->
    <LandingProductCarousel />

    <!-- Other sections -->
    <LandingStatsCounter />
  </div>
</template>

<script setup lang="ts">
// No imports needed - auto-imported by Nuxt
</script>
```

### 2. Component Auto-Registration

The component is automatically registered by Nuxt thanks to the `components/` directory structure:

```
components/
  landing/
    LandingProductCarousel.vue  ← Auto-registered as <LandingProductCarousel>
    LandingProductCard.vue      ← Auto-registered as <LandingProductCard>
```

## Visual Preview

```
┌──────────────────────────────────────────────────────────────┐
│                    Curated Collection                         │
│     Discover our hand-picked selection of premium wines      │
└──────────────────────────────────────────────────────────────┘

       ┌────────────┐  ┌────────────┐  ┌────────────┐
     ◄ │  Product 1 │  │  Product 2 │  │  Product 3 │ ►
       │            │  │            │  │            │
       │  [Image]   │  │  [Image]   │  │  [Image]   │
       │            │  │            │  │            │
       │ [Award]    │  │ [Premium]  │  │ [Organic]  │
       │ [Organic]  │  │            │  │            │
       │            │  │            │  │            │
       │ Wine Name  │  │ Wine Name  │  │ Wine Name  │
       │ ★ 4.8 (124)│  │ ★ 4.9 (89) │  │ ★ 4.7 (156)│
       │            │  │            │  │            │
       │ €29.99 [+] │  │ €24.99 [+] │  │ €19.99 [+] │
       └────────────┘  └────────────┘  └────────────┘

                  ● ━━━━ ○ ○ ○

              [View All Products →]
```

## Features Demonstrated

### Mobile Experience (< 640px)
- **1 card visible** at a time
- **Touch swipe** to navigate
- **No arrows** (touch only)
- Cards stack vertically

### Desktop Experience (>= 1024px)
- **3-4 cards visible** simultaneously
- **Arrow navigation** visible
- **Hover effects**: Card lift, shadow, zoom image
- **Quick add** button appears on hover

## Responsive Behavior

| Breakpoint | Cards Visible | Navigation |
|------------|---------------|------------|
| < 640px (Mobile) | 1 | Touch swipe |
| 640px - 1023px (Tablet) | 2 | Touch + Dots |
| >= 1024px (Desktop) | 3-4 | Arrows + Dots + Keyboard |

## Accessibility Features

### Keyboard Navigation
```
Tab          → Navigate between cards
Arrow Keys   → Move carousel (via Embla)
Enter/Space  → Activate buttons/links
Escape       → (Future: Close quick view)
```

### Screen Reader Announcements
- Section heading: "Curated Collection"
- Navigation: "Previous" / "Next" buttons
- Pagination: "Go to slide 1 of 5"
- Product cards: Full product information

### ARIA Implementation
```html
<div role="tablist" aria-label="Product carousel navigation">
  <button role="tab" aria-selected="true" aria-label="Go to slide 1">
  <button role="tab" aria-selected="false" aria-label="Go to slide 2">
</div>
```

## Performance Metrics

### Lighthouse Scores (Target)
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

### Optimizations Applied
1. **Lazy Loading**: Images load as they scroll into view
2. **WebP Format**: Modern image format for smaller sizes
3. **Responsive Images**: Proper srcset for different devices
4. **Embla Carousel**: Only 7KB bundle size
5. **CSS Containment**: Smooth 60fps animations

### Bundle Impact
- Embla Carousel: **7KB** (gzipped)
- Component code: **~3KB** (gzipped)
- **Total**: ~10KB additional bundle

## Customization Examples

### Change Number of Visible Cards

```typescript
// In LandingProductCarousel.vue
const [emblaRef, emblaApi] = emblaCarouselVue({
  loop: false,
  align: 'start',
  slidesToScroll: 1,
  breakpoints: {
    '(min-width: 640px)': { slidesToScroll: 2 }, // Show 2 on tablet
    '(min-width: 1024px)': { slidesToScroll: 4 }  // Show 4 on desktop
  }
})
```

### Enable Auto-Scroll

```typescript
import Autoplay from 'embla-carousel-autoplay'

const [emblaRef, emblaApi] = emblaCarouselVue({
  // ... existing options
}, [
  Autoplay({ delay: 4000, stopOnInteraction: true })
])
```

### Connect to Real Product Data

```vue
<script setup lang="ts">
// Fetch from API
const { data: featuredProducts } = await useFetch('/api/products/featured', {
  transform: (products) => products.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    image: p.images[0]?.url || '/placeholder.jpg',
    benefits: p.tags.slice(0, 3),
    rating: p.averageRating || 0,
    reviewCount: p.reviewCount || 0
  }))
})
</script>
```

### Integrate with Cart Store

```typescript
// In LandingProductCard.vue
const addToCart = (productId: string) => {
  const cartStore = useCartStore()

  cartStore.addItem(productId, 1)

  // Show toast notification
  toast.success('Added to cart!')
}
```

## Troubleshooting

### Images Not Loading
```typescript
// Check image paths
const featuredProducts = ref([
  {
    image: 'https://images.unsplash.com/...' // ✓ Full URL
    // OR
    image: '/images/products/wine.jpg'        // ✓ Public folder
    // NOT
    image: '@/assets/wine.jpg'                // ✗ Won't work in Nuxt Image
  }
])
```

### Carousel Not Scrolling
```typescript
// Ensure proper initialization
onMounted(() => {
  if (!emblaApi.value) {
    console.error('Embla not initialized')
    return
  }

  // Setup listeners
  emblaApi.value.on('select', updateCarouselState)
})
```

### Translation Keys Missing
```json
// Add to i18n/locales/en.json
{
  "landing": {
    "products": {
      "heading": "Curated Collection",
      "subheading": "Discover our selection",
      "viewAllCta": "View All Products",
      "shopNow": "Shop Now"
    }
  }
}
```

## Browser Testing Checklist

- [ ] Chrome/Edge (Desktop & Mobile)
- [ ] Firefox (Desktop & Mobile)
- [ ] Safari (Desktop & iOS)
- [ ] Touch swipe gestures work
- [ ] Keyboard navigation functional
- [ ] Screen reader announces correctly
- [ ] Images lazy load properly
- [ ] Animations smooth (60fps)
- [ ] No layout shifts (CLS < 0.1)

## Next Steps

1. **Connect to API**: Replace mock data with real products
2. **Add Cart Integration**: Implement actual add to cart
3. **Analytics Tracking**: Track carousel interactions
4. **A/B Testing**: Test different layouts/copy
5. **Wishlist Feature**: Add save for later
6. **Quick View Modal**: Preview product without navigation
7. **Filters**: Add category/price filters
8. **Auto-scroll**: Enable automatic rotation

## Related Documentation

- [Embla Carousel Docs](https://www.embla-carousel.com/get-started/vue/)
- [Nuxt Image Module](https://image.nuxt.com/)
- [Vue Use Motion](https://motion.vueuse.org/)
- [Tailwind CSS](https://tailwindcss.com/)
