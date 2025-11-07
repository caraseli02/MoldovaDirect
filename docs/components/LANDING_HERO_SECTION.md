# LandingHeroSection Component

## Overview

The `LandingHeroSection` is a high-impact hero component designed following Rhode Skin's authentic video approach and To'ak's luxury storytelling patterns. It serves as the main entry point for landing pages with a full-viewport video background, compelling copy, and clear CTAs.

## Location

`/components/landing/LandingHeroSection.vue`

## Features

### Visual Design
- **Full-viewport height** - Adapts to screen size (min 600px, max 100vh)
- **Video background** (desktop only) - Auto-playing, looping vineyard footage
- **Responsive poster image** (mobile) - Optimized WebP fallback
- **Dark gradient overlay** - Ensures text readability (30-50% opacity)
- **Smooth animations** - VueUse Motion for staggered entrance effects

### Performance Optimizations
1. **Mobile-first approach** - No video on mobile (width < 768px)
2. **Lazy video loading** - Uses `preload="metadata"` to optimize LCP
3. **WebP poster image** - Optimized with NuxtImg
4. **Reduced motion support** - Respects `prefers-reduced-motion` media query
5. **Video error handling** - Graceful fallback to poster image

### Accessibility
- **Semantic HTML** - Proper `<section>`, `<h1>`, heading hierarchy
- **Keyboard navigation** - All CTAs are keyboard accessible
- **ARIA labels** - Descriptive labels for icon buttons
- **Minimum touch targets** - 48px minimum for mobile (WCAG 2.1 AA)
- **Motion preferences** - Respects user's motion preferences

## Props

This component has no props - all content is managed through i18n translations.

## Emits

- `open-quiz` - Emitted when the secondary CTA (Wine Quiz) is clicked

## Usage

```vue
<template>
  <LandingHeroSection @open-quiz="handleQuizOpen" />
</template>

<script setup lang="ts">
const handleQuizOpen = () => {
  // Open wine quiz modal/page
}
</script>
```

## Translations

All text content is managed through i18n. Add these keys to your locale files:

```json
{
  "landing": {
    "hero": {
      "urgency": "Free Shipping on Orders Over $75",
      "headline": "Authentic Moldova, Delivered to Your Door",
      "subheadline": "Discover 5,000 years of winemaking tradition...",
      "primaryCta": "Explore Collection",
      "secondaryCta": "Take Our Wine Quiz",
      "trustBadge1": "Authentic & Certified",
      "trustBadge2": "Free Shipping",
      "trustBadge3": "4.9/5 Stars (2,400+ Reviews)",
      "scrollHint": "Discover More"
    }
  }
}
```

## Video Assets

### Required Files
Place in `/public/videos/`:
1. **hero-vineyard.webm** (<5MB, VP9 codec)
2. **hero-vineyard.mp4** (<5MB, H.264 fallback)

### Specifications
- Duration: 15-30 seconds (seamless loop)
- Resolution: 1920x1080 (16:9)
- Bitrate: 1-2 Mbps
- No audio track needed
- See `/public/videos/README.md` for optimization tips

### Poster Image
Place in `/public/images/`:
- **hero-poster.webp** or **hero-poster.jpg**
- Dimensions: 1920x1080
- File size: <200KB
- See `/public/images/README.md` for optimization

## Component Structure

```vue
<section class="landing-hero">
  <!-- Video Background (Desktop) -->
  <div v-if="!isMobile">
    <video />
    <div class="gradient-overlay" />
  </div>

  <!-- Image Background (Mobile) -->
  <div v-if="isMobile">
    <NuxtImg />
    <div class="gradient-overlay" />
  </div>

  <!-- Content -->
  <div class="container">
    <div class="urgency-badge" />
    <h1>{{ headline }}</h1>
    <p>{{ subheadline }}</p>

    <!-- CTAs -->
    <div class="cta-buttons">
      <NuxtLink to="/products">Primary CTA</NuxtLink>
      <button @click="openQuiz">Secondary CTA</button>
    </div>

    <!-- Trust Indicators -->
    <div class="trust-badges">...</div>
  </div>

  <!-- Scroll Indicator -->
  <button @click="scrollToContent">↓</button>
</section>
```

## Animation Timeline

1. **200ms** - Urgency badge fades in + scales up
2. **400ms** - Headline fades in + slides up
3. **600ms** - Subheadline fades in + slides up
4. **800ms** - CTA buttons fade in + slide up
5. **1000ms** - Trust indicators fade in
6. **1200ms** - Scroll indicator appears

## Performance Targets

- **LCP (Largest Contentful Paint)**: <2.5s
- **CLS (Cumulative Layout Shift)**: <0.1
- **FCP (First Contentful Paint)**: <1.8s
- **Video load**: Non-blocking (poster shows immediately)

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Video formats**: WebM (VP9) for Chrome/Firefox, MP4 (H.264) for Safari
- **Fallback**: Poster image for all browsers if video fails

## Mobile Behavior

On mobile (width < 768px):
- Video does NOT load (saves bandwidth)
- Poster image serves as background
- Same gradient overlay applied
- All other functionality identical

## Customization

### Changing Video Sources
```vue
<script setup lang="ts">
const videoWebm = ref('/videos/custom-hero.webm')
const videoMp4 = ref('/videos/custom-hero.mp4')
const posterImage = ref('/images/custom-poster.webp')
</script>
```

### Adjusting Overlay Opacity
```css
.bg-gradient-to-b {
  /* Change from-black/30 to adjust top opacity */
  /* Change to-black/50 to adjust bottom opacity */
}
```

## Testing

Run component tests:
```bash
pnpm run test:unit tests/components/landing/LandingHeroSection.test.ts
```

Tests cover:
- Rendering and content display
- CTA button functionality
- Scroll behavior
- Mobile responsiveness
- Event emissions
- Accessibility attributes

## Common Issues

### Video Not Playing
1. Check file paths in `/public/videos/`
2. Verify video files are <5MB
3. Check browser console for errors
4. Ensure video has no audio track

### Poor LCP Score
1. Optimize poster image (<200KB)
2. Use `fetchpriority="high"` on NuxtImg
3. Ensure video is non-blocking
4. Consider using blur-up technique

### Layout Shift
1. Set explicit `min-h-[600px]` on hero section
2. Ensure poster image has width/height attributes
3. Preload critical fonts

## Future Enhancements

- [ ] Add blur-up placeholder for poster image
- [ ] Implement video quality selection based on connection speed
- [ ] Add A/B testing for different headlines
- [ ] Integrate with analytics for CTA click tracking
- [ ] Add video controls for accessibility

## Related Components

- `HomeVideoHero` - Similar video hero for homepage
- `HomeHeroCarousel` - Carousel variation
- `HomeProductQuiz` - Wine quiz modal (triggered by secondary CTA)

## References

- [Rhode Skin Hero Pattern](https://rhode.com)
- [To'ak Chocolate Storytelling](https://toakchocolate.com)
- [VueUse Motion](https://motion.vueuse.org/)
- [Nuxt Image](https://image.nuxt.com/)
