# LandingHeroSection - Usage Guide

## Quick Start

### 1. Import and Use

```vue
<template>
  <div>
    <LandingHeroSection @open-quiz="handleQuizOpen" />

    <!-- Rest of your landing page content -->
  </div>
</template>

<script setup lang="ts">
const handleQuizOpen = () => {
  // Handle quiz modal opening
  // Navigate to quiz page or open modal
  navigateTo('/quiz')
}
</script>
```

### 2. Add Translations

Add these keys to your locale files (`i18n/locales/*.json`):

```json
{
  "landing": {
    "hero": {
      "urgency": "Free Shipping on Orders Over $75",
      "headline": "Authentic Moldova, Delivered to Your Door",
      "subheadline": "Discover 5,000 years of winemaking tradition with our curated collection of premium Moldovan wines and gourmet delicacies.",
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

### 3. Add Video Assets (Optional)

For the best experience, add video files:

**WebM Format (Primary)**:
```bash
# Place in /public/videos/hero-vineyard.webm
# Size: <5MB
# Duration: 15-30 seconds
# Resolution: 1920x1080
```

**MP4 Format (Fallback)**:
```bash
# Place in /public/videos/hero-vineyard.mp4
# Size: <5MB
# Safari/iOS compatibility
```

**Update component to use videos**:
```vue
<script setup lang="ts">
// In LandingHeroSection.vue
const videoWebm = ref('/videos/hero-vineyard.webm')
const videoMp4 = ref('/videos/hero-vineyard.mp4')
</script>
```

### 4. Add Poster Image

**Required**: Poster image serves as:
- Video thumbnail (desktop)
- Main background (mobile)
- Fallback if video fails

```bash
# Place in /public/images/hero-poster.jpg
# Or use Unsplash URL (current default)
# Dimensions: 1920x1080
# Format: WebP or JPG
# Size: <200KB
```

## Integration Examples

### Full Landing Page

```vue
<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <LandingHeroSection @open-quiz="handleQuizOpen" />

    <!-- Features Section -->
    <section class="py-16">
      <div class="container">
        <h2 class="mb-8 text-3xl font-bold">Why Choose Us</h2>
        <!-- Feature cards -->
      </div>
    </section>

    <!-- Products Section -->
    <section class="bg-gray-50 py-16">
      <div class="container">
        <h2 class="mb-8 text-3xl font-bold">Featured Products</h2>
        <!-- Product grid -->
      </div>
    </section>

    <!-- Quiz Modal -->
    <HomeProductQuiz
      :is-open="isQuizOpen"
      @close="handleQuizClose"
      @complete="handleQuizComplete"
    />
  </div>
</template>

<script setup lang="ts">
const isQuizOpen = ref(false)

const handleQuizOpen = () => {
  isQuizOpen.value = true
}

const handleQuizClose = () => {
  isQuizOpen.value = false
}

const handleQuizComplete = (answers: any) => {
  // Handle quiz completion
  isQuizOpen.value = false
  navigateTo('/products?quiz=' + JSON.stringify(answers))
}
</script>
```

### A/B Testing Different Headlines

```vue
<template>
  <LandingHeroSection @open-quiz="handleQuizOpen" />
</template>

<script setup lang="ts">
// Modify translations based on A/B test variant
const { t } = useI18n()
const variant = useAbTestVariant('hero-headline')

if (variant === 'B') {
  // Override translations programmatically
  // Or use separate translation keys
}
</script>
```

### With Custom Analytics Tracking

```vue
<template>
  <LandingHeroSection
    @open-quiz="trackQuizOpen"
  />
</template>

<script setup lang="ts">
const trackQuizOpen = () => {
  // Track event
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', 'quiz_opened_from_hero', {
      event_category: 'engagement',
      event_label: 'landing_hero_cta'
    })
  }

  // Open quiz
  navigateTo('/quiz')
}
</script>
```

## Customization

### Changing Colors

```vue
<!-- Update button colors in component -->
<style scoped>
.btn-primary {
  /* Change from rose-600 to your brand color */
  @apply bg-brand-primary hover:bg-brand-primary-dark;
}
</style>
```

### Adjusting Animation Speed

```vue
<!-- Modify delay values -->
<div
  v-motion
  :initial="{ opacity: 0, y: 30 }"
  :visible="{ opacity: 1, y: 0 }"
  :delay="200"  <!-- Change this value -->
>
```

### Removing Video (Image Only)

```vue
<script setup lang="ts">
// Set both video refs to undefined
const videoWebm = ref<string | undefined>(undefined)
const videoMp4 = ref<string | undefined>(undefined)
// Component will automatically use poster image
</script>
```

## Demo Page

Visit `/landing-demo` to see the component in action.

```bash
# Start dev server
pnpm run dev

# Navigate to
http://localhost:3000/landing-demo
```

## Performance Checklist

- [ ] Poster image optimized (<200KB)
- [ ] Video files optimized (<5MB each)
- [ ] Translations added to all locale files
- [ ] Test on mobile (video should NOT load)
- [ ] Test on desktop (video should auto-play)
- [ ] Verify LCP < 2.5s
- [ ] Check accessibility (keyboard navigation)
- [ ] Test with reduced motion preference

## Troubleshooting

### Video Not Playing

1. **Check file paths**:
   ```bash
   ls -la public/videos/
   # Should show: hero-vineyard.webm, hero-vineyard.mp4
   ```

2. **Verify video refs are set**:
   ```vue
   const videoWebm = ref('/videos/hero-vineyard.webm')  // Not undefined
   ```

3. **Check browser console** for errors

4. **Test in different browsers** (Chrome, Safari, Firefox)

### Poor Performance

1. **Optimize poster image**:
   ```bash
   # Use Squoosh or ImageOptim
   # Target: <200KB, WebP format
   ```

2. **Reduce video file size**:
   ```bash
   # Use FFmpeg to re-encode
   ffmpeg -i input.mov -c:v libvpx-vp9 -b:v 1M ...
   ```

3. **Enable compression** on your server (gzip/brotli)

### Layout Issues

1. **Set minimum height**:
   ```css
   .landing-hero {
     min-height: 600px;  /* Prevents CLS */
   }
   ```

2. **Specify image dimensions**:
   ```vue
   <NuxtImg
     :width="1920"
     :height="1080"
     <!-- Prevents layout shift -->
   />
   ```

## Next Steps

1. Add your custom video files
2. Optimize poster image
3. Customize translations for your brand
4. Integrate quiz modal/page
5. Add analytics tracking
6. Run performance audit
7. Test on real devices

## Resources

- [Component Documentation](./LANDING_HERO_SECTION.md)
- [Video Optimization Guide](/public/videos/README.md)
- [Image Optimization Guide](/public/images/README.md)
- [VueUse Motion Docs](https://motion.vueuse.org/)
