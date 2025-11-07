# LandingUGCGallery Component

## Overview
A user-generated content (UGC) gallery component inspired by Rare Beauty's authentic customer photos approach. Displays real customer photos in a masonry/Pinterest-style grid layout with hover overlays and lightbox functionality.

## Features

### Core Functionality
- ✅ Masonry/Pinterest-style responsive grid layout
- ✅ Hover overlays showing customer information and captions
- ✅ Click-to-expand lightbox modal for full-size images
- ✅ Instagram platform indicator icons
- ✅ Staggered entrance animations using @vueuse/motion
- ✅ Lazy-loaded, optimized images via @nuxt/image
- ✅ Fully responsive (2 cols mobile, 3-4 desktop)
- ✅ "Share Your Photo" CTA button
- ✅ Accessibility-compliant with proper ARIA labels

### Technical Implementation
- Vue 3 Composition API with `<script setup>` syntax
- TypeScript for type safety
- Tailwind CSS for styling
- NuxtImg for image optimization
- i18n internationalization support
- Motion animations with proper reduced-motion support

## Usage

### Basic Integration

```vue
<template>
  <div>
    <!-- Other landing sections -->
    <LandingUGCGallery />
    <!-- More landing sections -->
  </div>
</template>
```

### Props
This component doesn't currently accept props as it uses static data. To make it dynamic:

```vue
<script setup lang="ts">
defineProps<{
  photos?: UGCPhoto[]
}>()
</script>
```

### Customizing Photos

To replace placeholder photos with real customer content, update the `photos` array:

```typescript
const photos: UGCPhoto[] = [
  {
    id: '1',
    image: '/path/to/customer-photo.jpg',
    customerName: 'Maria S.',
    caption: 'Perfect gift for my wine-loving parents! #MoldovaDirect',
    platform: 'instagram', // Optional: shows Instagram icon
    tall: false // Optional: makes photo span 2 rows on desktop
  },
  // ... more photos
]
```

### i18n Translations

Required translation keys in your locale files:

```json
{
  "landing": {
    "ugc": {
      "heading": "Join Our Community",
      "subheading": "See how our customers enjoy authentic Moldova delivered to their homes",
      "hashtag": "Tag us on Instagram",
      "shareCta": "Share Your Photo"
    }
  }
}
```

## API Integration

### Fetching Real Customer Photos

To fetch photos from an API or CMS:

```vue
<script setup lang="ts">
const { data: photos } = await useFetch('/api/ugc-photos', {
  transform: (data) => data.slice(0, 8) // Limit to 8 photos
})
</script>
```

### Instagram API Integration

For automatic Instagram photo fetching:

```typescript
// server/api/instagram-ugc.ts
export default defineEventHandler(async (event) => {
  // Fetch Instagram posts with specific hashtag
  const posts = await fetchInstagramHashtag('#MoldovaDirect')

  return posts.map(post => ({
    id: post.id,
    image: post.media_url,
    customerName: post.username,
    caption: post.caption,
    platform: 'instagram'
  }))
})
```

## Styling Customization

### Grid Layout

Modify grid columns by editing Tailwind classes:

```vue
<!-- Default: 2 cols mobile, 3 medium, 4 large -->
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

<!-- Alternative: More columns on larger screens -->
<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
```

### Colors

Update gradient colors in the CTA button:

```vue
<!-- Default: purple to pink -->
class="bg-gradient-to-r from-purple-600 to-pink-600"

<!-- Alternative: brand colors -->
class="bg-gradient-to-r from-rose-600 to-amber-600"
```

### Animations

Adjust animation delays and durations:

```vue
<!-- Faster animations -->
:delay="index * 30" <!-- Instead of 50 -->

<!-- Longer transition -->
class="transition-transform duration-700" <!-- Instead of 500 -->
```

## Accessibility Features

- Semantic HTML structure
- Proper ARIA labels on interactive elements
- Keyboard navigation support for lightbox
- Reduced motion support via CSS media queries
- Focus visible states on buttons
- Alt text for all images

## Performance Optimizations

### Image Loading
- Lazy loading for off-screen images
- WebP format with quality optimization
- Responsive image sizes via NuxtImg
- Proper width/height attributes to prevent layout shift

### Bundle Size
- Component is tree-shakeable
- CSS scoped to component
- No heavy dependencies

### Best Practices
- Use CDN for customer photos
- Compress images before upload (max 5MB recommended)
- Limit to 6-12 photos for optimal performance
- Consider pagination for larger galleries

## Mobile Optimization

### Touch Interactions
- Tap to open lightbox
- Swipe to dismiss lightbox (can be added)
- Responsive grid adapts to screen size

### Performance
- Fewer columns on mobile (2 instead of 4)
- Smaller image sizes loaded on mobile devices
- Touch-friendly tap targets (min 44x44px)

## Testing

### Component Tests (Vitest)

```typescript
// tests/components/landing/LandingUGCGallery.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingUGCGallery from '~/components/landing/LandingUGCGallery.vue'

describe('LandingUGCGallery', () => {
  it('renders the correct number of photos', () => {
    const wrapper = mount(LandingUGCGallery)
    const photos = wrapper.findAll('.ugc-photo-card')
    expect(photos.length).toBe(8)
  })

  it('opens lightbox when photo is clicked', async () => {
    const wrapper = mount(LandingUGCGallery)
    const firstPhoto = wrapper.find('.ugc-photo-card')
    await firstPhoto.trigger('click')

    expect(wrapper.find('.lightbox').exists()).toBe(true)
  })

  it('closes lightbox when X button is clicked', async () => {
    const wrapper = mount(LandingUGCGallery)
    // Open lightbox first
    await wrapper.find('.ugc-photo-card').trigger('click')

    // Close it
    await wrapper.find('[aria-label="Close lightbox"]').trigger('click')

    expect(wrapper.find('.lightbox').exists()).toBe(false)
  })
})
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/landing-ugc-gallery.spec.ts
import { test, expect } from '@playwright/test'

test.describe('UGC Gallery', () => {
  test('displays customer photos', async ({ page }) => {
    await page.goto('/')

    const gallery = page.locator('.ugc-gallery')
    await expect(gallery).toBeVisible()

    const photos = page.locator('.ugc-photo-card')
    await expect(photos).toHaveCount(8)
  })

  test('opens and closes lightbox', async ({ page }) => {
    await page.goto('/')

    // Click first photo
    await page.locator('.ugc-photo-card').first().click()

    // Lightbox should be visible
    const lightbox = page.locator('[class*="z-50"]')
    await expect(lightbox).toBeVisible()

    // Close lightbox
    await page.locator('[aria-label="Close lightbox"]').click()
    await expect(lightbox).not.toBeVisible()
  })

  test('share CTA opens Instagram', async ({ page, context }) => {
    await page.goto('/')

    // Listen for new page
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('text="Share Your Photo"')
    ])

    expect(newPage.url()).toContain('instagram.com')
  })
})
```

## Future Enhancements

### Planned Features
- [ ] Infinite scroll or pagination for more photos
- [ ] Filter by product category
- [ ] Real-time Instagram feed integration
- [ ] Video support in addition to photos
- [ ] Photo submission form for customers
- [ ] Moderation dashboard for admins
- [ ] Like/reaction system
- [ ] Social sharing buttons in lightbox
- [ ] Swipe gestures in lightbox (left/right to navigate)

### API Endpoints Needed

```typescript
// GET /api/ugc-photos - Fetch approved customer photos
// POST /api/ugc-submit - Submit new customer photo
// GET /api/ugc-moderate - Admin: view pending photos
// PUT /api/ugc-approve/:id - Admin: approve photo
// DELETE /api/ugc-remove/:id - Admin: remove photo
```

## Integration with Other Landing Sections

### Recommended Order

```vue
<template>
  <div>
    <LandingHeroSection />
    <LandingMediaMentionsBar />
    <LandingProductGrid />
    <LandingUGCGallery /> <!-- Works great here -->
    <LandingTestimonials />
    <LandingNewsletter />
  </div>
</template>
```

## File Structure

```
components/landing/
├── LandingUGCGallery.vue         # Main component
├── LandingHeroSection.vue
└── LandingMediaMentionsBar.vue

i18n/locales/
├── en.json                       # English translations
├── es.json                       # Spanish translations
├── ro.json                       # Romanian translations
└── ru.json                       # Russian translations

docs/
└── landing-ugc-gallery.md        # This file
```

## Support

For issues or questions:
- GitHub Issues: [Report a bug]
- Documentation: [Full component docs]
- Examples: See `/pages/landing-demo.vue` for usage

---

**Last Updated**: November 7, 2025
**Component Version**: 1.0.0
**Nuxt Version**: 3.x
