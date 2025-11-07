# LandingProductCarousel Component

## Overview
A responsive product carousel component inspired by Olipop's benefits-driven showcase style. Features smooth horizontal scrolling with Embla Carousel, benefit pills, quick add-to-cart functionality, and full accessibility support.

## Features
- **Lightweight**: Uses Embla Carousel (7KB) for smooth scrolling
- **Responsive**:
  - Mobile: Single card with touch swipe
  - Tablet: 2 cards visible
  - Desktop: 3-4 cards visible
- **Accessibility**:
  - Keyboard navigation support
  - ARIA labels and roles
  - Screen reader friendly
- **Performance**:
  - Lazy loading images
  - Optimized with Nuxt Image
  - Auto-imports composables

## Usage

### Basic Implementation

```vue
<template>
  <div>
    <LandingProductCarousel />
  </div>
</template>
```

### With Custom Products

```vue
<script setup lang="ts">
// Fetch products from API/store
const { data: products } = await useFetch('/api/featured-products')
</script>

<template>
  <LandingProductCarousel :products="products" />
</template>
```

## Component Structure

### Main Component: `LandingProductCarousel.vue`
- Section wrapper with header
- Embla carousel container
- Navigation arrows (desktop only)
- Pagination dots
- View All CTA button

### Sub-component: `LandingProductCard.vue`
- Product image with hover zoom
- Benefits pills (max 2 displayed)
- Product name and link
- Star rating
- Price display
- Quick add to cart button (hover only)
- Shop Now CTA

## Props

### LandingProductCarousel
Currently uses internal mock data. Can be extended to accept:

```typescript
interface Props {
  products?: Product[]
  autoplay?: boolean
  autoplayInterval?: number
}
```

### LandingProductCard

```typescript
interface Props {
  product: {
    id: string
    name: string
    slug: string
    price: number
    image: string
    benefits: string[]
    rating: number
    reviewCount: number
  }
}
```

## Carousel Configuration

### Embla Options
```typescript
{
  loop: false,
  align: 'start',
  slidesToScroll: 1,
  breakpoints: {
    '(min-width: 640px)': { slidesToScroll: 1 },
    '(min-width: 1024px)': { slidesToScroll: 1 }
  }
}
```

### Responsive Breakpoints
- **Mobile** (<640px): 1 card visible, full width
- **Tablet** (640px-1023px): 2 cards visible
- **Desktop** (1024px+): 3-4 cards visible with navigation arrows

## Styling

### Tailwind Classes
Uses utility-first approach with:
- `group` hover patterns for interactive states
- `transition-all duration-300` for smooth animations
- `shadow-md hover:shadow-xl` for elevation
- `transform hover:-translate-y-2` for lift effect

### Custom Styles
```css
.product-card {
  min-height: 450px; /* Consistent card heights */
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

## Accessibility Features

### Keyboard Navigation
- Tab through products
- Arrow keys for carousel navigation (via Embla)
- Enter/Space to activate buttons

### ARIA Attributes
- `role="tablist"` on pagination container
- `role="tab"` on pagination dots
- `aria-selected` on active dot
- `aria-label` on all interactive elements

### Screen Reader Support
- Semantic HTML (`<section>`, `<h2>`, `<h3>`)
- Descriptive link text
- Alt text on images
- Button labels describe actions

## Performance Optimizations

### Images
```vue
<NuxtImg
  loading="lazy"
  format="webp"
  quality="80"
  :width="400"
  :height="400"
/>
```

### Carousel
- Touch-optimized with `-webkit-overflow-scrolling`
- Cleanup on component unmount
- No memory leaks with proper event listener removal

## Internationalization

### Translation Keys Required
```json
{
  "landing": {
    "products": {
      "heading": "Curated Collection",
      "subheading": "Discover our hand-picked selection...",
      "viewAllCta": "View All Products",
      "shopNow": "Shop Now"
    }
  },
  "common": {
    "previous": "Previous",
    "next": "Next"
  }
}
```

## Integration with Cart

### Quick Add Functionality
```typescript
const addToCart = (productId: string) => {
  // TODO: Integrate with cart store
  const cartStore = useCartStore()
  cartStore.addItem(productId, 1)
}
```

## Testing

### Unit Tests
Located at: `/tests/components/landing/LandingProductCarousel.test.ts`

Run tests:
```bash
npm run test:unit
```

### Test Coverage
- Component rendering
- Product display
- Navigation functionality
- Accessibility compliance
- Responsive behavior

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Touch events for mobile swipe
- Keyboard navigation for desktop

## Future Enhancements
1. Auto-scroll with pause on hover
2. Product filtering/sorting
3. Skeleton loading states
4. Product quick view modal
5. Wishlist integration
6. Analytics tracking
7. A/B testing variants
8. Product comparison feature

## Related Components
- `LandingHeroSection.vue` - Hero banner
- `LandingMediaMentionsBar.vue` - Media logos
- Product detail pages - `/pages/products/[slug].vue`

## API Integration Example

```typescript
// composables/useProducts.ts
export const useFeaturedProducts = async () => {
  const { data, error } = await useFetch('/api/products/featured', {
    transform: (products) => products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: p.images[0]?.url,
      benefits: p.tags.slice(0, 3),
      rating: p.averageRating,
      reviewCount: p.reviewCount
    }))
  })

  return { products: data, error }
}
```

## Maintenance Notes
- Update mock product data when connecting to real API
- Review Embla Carousel version for updates
- Monitor Core Web Vitals for performance
- Test on real devices quarterly
- Update i18n translations for new locales
