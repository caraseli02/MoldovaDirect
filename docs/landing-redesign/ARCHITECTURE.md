# Landing Page Complete Redesign - Technical Architecture

**Status**: Planning Phase
**Version**: 1.0.0
**Last Updated**: 2025-11-07
**Owner**: Architecture Team

---

## Executive Summary

This document outlines the complete technical architecture for redesigning the Moldova Direct landing page. This is NOT an enhancement but a full redesign inspired by top-performing e-commerce sites (Gymshark, Rhode Skin, Brightland, etc.).

### Key Principles

1. **Mobile-First**: Design starts at 320px and scales up
2. **Performance-First**: Target LCP < 2.5s, FID < 100ms, CLS < 0.1
3. **Conversion-Focused**: Every element drives toward purchase or signup
4. **Accessible**: WCAG 2.1 AA compliance minimum
5. **Modern Stack**: Vue 3 Composition API, Nuxt 3, TypeScript, Tailwind CSS

---

## Current State Analysis

### Existing Page Structure (pages/index.vue)

```vue
<!-- Current landing page structure -->
<template>
  <div>
    <HomeAnnouncementBar />
    <HomeHeroSection />
    <HomeCategoryGrid />
    <HomeFeaturedProductsSection />
    <HomeCollectionsShowcase />
    <HomeSocialProofSection />
    <HomeHowItWorksSection />
    <HomeServicesSection />
    <HomeNewsletterSignup />
    <HomeFaqPreviewSection />
  </div>
</template>
```

**Current Components** (`/components/home/`):
- AnnouncementBar.vue
- HeroSection.vue
- CategoryGrid.vue
- FeaturedProductsSection.vue
- CollectionsShowcase.vue
- SocialProofSection.vue
- HowItWorksSection.vue
- ServicesSection.vue
- NewsletterSignup.vue
- FaqPreviewSection.vue
- MediaMentions.vue (exists but not used)
- VideoTestimonials.vue (exists but not used)
- TrustBadges.vue (exists but not used)
- RealTimeStats.vue (exists but not used)
- ProductQuiz.vue (exists but not used)

**Content Management**:
- `composables/useHomeContent.ts` - Manages all content data
- i18n translations for multi-language support
- No CMS integration (all content hardcoded in composable)

---

## New Architecture Overview

### 1. New Page Structure

```vue
<!-- pages/new.vue - New landing page for testing -->
<template>
  <div class="landing-page-redesign">
    <!-- Above the fold - Critical for conversion -->
    <LandingMediaMentionsBar />
    <LandingHeroSection />

    <!-- Immediate trust signals -->
    <LandingTrustBadges />
    <LandingStatsCounter />

    <!-- Product showcase with benefits -->
    <LandingProductCarousel />

    <!-- Interactive engagement -->
    <LandingQuizCTA />

    <!-- Social proof layer 1: Visual testimonials -->
    <LandingUGCGallery />

    <!-- Social proof layer 2: Video testimonials -->
    <LandingVideoTestimonials />

    <!-- Category exploration -->
    <LandingFeaturedCollections />

    <!-- Email capture -->
    <LandingNewsletterSignup />

    <!-- Footer with trust elements -->
    <LandingFooter />
  </div>
</template>
```

### 2. Component Architecture

```
/components/landing/              # NEW - All new components
├── MediaMentionsBar.vue         # Brightland pattern - press logos scrolling
├── HeroSection.vue              # Rhode Skin pattern - video background
├── TrustBadges.vue              # SSL, payments, certifications
├── StatsCounter.vue             # Animated counting numbers
├── ProductCarousel.vue          # Olipop pattern - benefits-driven
├── QuizCTA.vue                  # Jones Road pattern - quiz promotion
├── UGCGallery.vue               # Rare Beauty pattern - customer photos
├── VideoTestimonials.vue        # To'ak pattern - video stories
├── FeaturedCollections.vue      # Modern collection cards
├── NewsletterSignup.vue         # Email capture with incentive
└── Footer.vue                   # Trust elements footer

/components/quiz/                 # NEW - Quiz feature components
├── QuizModal.vue                # Full-screen quiz modal
├── QuizStep.vue                 # Individual question component
├── QuizProgress.vue             # Progress indicator
├── QuizResults.vue              # Personalized recommendations
└── QuizQuestion.vue             # Reusable question component

/components/animations/           # NEW - Reusable animation components
├── ScrollReveal.vue             # Scroll-triggered reveal
├── FadeIn.vue                   # Fade in animation wrapper
├── SlideUp.vue                  # Slide up animation wrapper
├── CountUp.vue                  # Number counter animation
└── Stagger.vue                  # Staggered children animation

/components/home-old/             # ARCHIVE - Old components (backup)
└── ... (move all current home components here)
```

### 3. Composables Architecture

```typescript
/composables/
├── useLandingContent.ts         # NEW - Landing page content
├── useQuiz.ts                   # NEW - Quiz logic
├── useAnimations.ts             # NEW - Animation helpers
├── useTracking.ts               # NEW - Analytics tracking
├── useABTest.ts                 # NEW - A/B testing utilities
├── useVideoPlayer.ts            # NEW - Video player logic
└── useHomeContent.ts            # KEEP - For backwards compatibility
```

### 4. Type Definitions

```typescript
// types/landing.ts - NEW type definitions
export interface LandingSection {
  id: string
  component: string
  order: number
  enabled: boolean
  config: Record<string, any>
}

export interface MediaMention {
  id: string
  name: string
  logo: string
  url?: string
  quote?: string
}

export interface TrustBadge {
  id: string
  label: string
  icon: string
  verified: boolean
}

export interface AnimatedStat {
  id: string
  value: number
  label: string
  icon: string
  prefix?: string
  suffix?: string
  duration?: number
  color?: string
}

export interface ProductCard {
  id: string
  name: string
  image: string
  price: number
  benefits: string[]
  rating: number
  reviews: number
}

export interface QuizQuestion {
  id: string
  type: 'single' | 'multiple' | 'scale'
  question: string
  options: QuizOption[]
  required: boolean
}

export interface QuizOption {
  id: string
  label: string
  value: string
  image?: string
}

export interface UGCPost {
  id: string
  image: string
  author: string
  product?: string
  caption?: string
  verified: boolean
}

export interface VideoTestimonial {
  id: string
  name: string
  location: string
  thumbnail: string
  videoUrl: string
  quote: string
  rating: number
  verified: boolean
}

export interface CollectionCard {
  id: string
  name: string
  description: string
  image: string
  productCount: number
  href: string
}
```

---

## Design System

### Color Palette

```scss
// Primary - Moldova Direct brand (wine/authenticity)
--primary-50: #FFF1F2;
--primary-100: #FFE4E6;
--primary-200: #FECDD3;
--primary-300: #FDA4AF;
--primary-400: #FB7185;
--primary-500: #F43F5E;     // Main primary
--primary-600: #E11D48;
--primary-700: #BE123C;
--primary-800: #9F1239;
--primary-900: #881337;

// Secondary - Warmth/tradition (gold/amber)
--secondary-50: #FFFBEB;
--secondary-100: #FEF3C7;
--secondary-200: #FDE68A;
--secondary-300: #FCD34D;
--secondary-400: #FBBF24;
--secondary-500: #F59E0B;   // Main secondary
--secondary-600: #D97706;
--secondary-700: #B45309;
--secondary-800: #92400E;
--secondary-900: #78350F;

// Neutral grays
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;

// Semantic colors
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

### Typography Scale

```scss
// Font families
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Cal Sans', 'Inter', sans-serif;  // For hero headings

// Type scale (fluid typography)
--text-hero: clamp(2.5rem, 5vw, 4.5rem);      // 40-72px
--text-h1: clamp(2rem, 4vw, 3.5rem);          // 32-56px
--text-h2: clamp(1.75rem, 3vw, 2.5rem);       // 28-40px
--text-h3: clamp(1.5rem, 2.5vw, 2rem);        // 24-32px
--text-h4: clamp(1.25rem, 2vw, 1.5rem);       // 20-24px
--text-lg: 1.125rem;                          // 18px
--text-base: 1rem;                            // 16px
--text-sm: 0.875rem;                          // 14px
--text-xs: 0.75rem;                           // 12px

// Line heights
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;

// Font weights
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Spacing System

```scss
// Spacing scale (8px base unit)
--space-0: 0;
--space-px: 1px;
--space-0.5: 0.125rem;  // 2px
--space-1: 0.25rem;     // 4px
--space-2: 0.5rem;      // 8px
--space-3: 0.75rem;     // 12px
--space-4: 1rem;        // 16px
--space-5: 1.25rem;     // 20px
--space-6: 1.5rem;      // 24px
--space-8: 2rem;        // 32px
--space-10: 2.5rem;     // 40px
--space-12: 3rem;       // 48px
--space-16: 4rem;       // 64px
--space-20: 5rem;       // 80px
--space-24: 6rem;       // 96px
--space-32: 8rem;       // 128px
--space-40: 10rem;      // 160px
--space-48: 12rem;      // 192px
--space-56: 14rem;      // 224px
--space-64: 16rem;      // 256px

// Section spacing
--section-padding-mobile: var(--space-12);    // 48px
--section-padding-tablet: var(--space-16);    // 64px
--section-padding-desktop: var(--space-24);   // 96px
```

### Breakpoints

```scss
// Tailwind CSS breakpoints (already configured)
$breakpoints: (
  'sm': 640px,   // Small tablets portrait
  'md': 768px,   // Tablets landscape
  'lg': 1024px,  // Laptops
  'xl': 1280px,  // Desktop
  '2xl': 1536px  // Large desktop
);

// Container max-widths
$containers: (
  'sm': 640px,
  'md': 768px,
  'lg': 1024px,
  'xl': 1280px,
  '2xl': 1400px
);
```

### Border Radius

```scss
--radius-none: 0;
--radius-sm: 0.125rem;    // 2px
--radius-default: 0.25rem; // 4px
--radius-md: 0.375rem;     // 6px
--radius-lg: 0.5rem;       // 8px
--radius-xl: 0.75rem;      // 12px
--radius-2xl: 1rem;        // 16px
--radius-3xl: 1.5rem;      // 24px
--radius-full: 9999px;
```

### Shadows

```scss
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-default: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
```

---

## Animation Strategy

### Animation Presets

```typescript
// composables/useAnimations.ts
import { useMotion } from '@vueuse/motion'

export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    enter: {
      opacity: 1,
      transition: { duration: 600, ease: 'easeOut' }
    }
  },

  fadeInUp: {
    initial: { opacity: 0, y: 50 },
    enter: {
      opacity: 1,
      y: 0,
      transition: { duration: 600, ease: 'easeOut' }
    }
  },

  fadeInDown: {
    initial: { opacity: 0, y: -50 },
    enter: {
      opacity: 1,
      y: 0,
      transition: { duration: 600, ease: 'easeOut' }
    }
  },

  slideInLeft: {
    initial: { opacity: 0, x: -100 },
    enter: {
      opacity: 1,
      x: 0,
      transition: { duration: 700, ease: 'easeOut' }
    }
  },

  slideInRight: {
    initial: { opacity: 0, x: 100 },
    enter: {
      opacity: 1,
      x: 0,
      transition: { duration: 700, ease: 'easeOut' }
    }
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    enter: {
      opacity: 1,
      scale: 1,
      transition: { duration: 500, ease: 'easeOut' }
    }
  },

  stagger: (index: number, total: number = 6) => ({
    initial: { opacity: 0, y: 30 },
    enter: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 100,
        duration: 500,
        ease: 'easeOut'
      }
    }
  })
}
```

### Scroll Animations

Use `@vueuse/motion` with Intersection Observer:

```vue
<template>
  <div v-motion :initial="initial" :enter="enter">
    <!-- Content -->
  </div>
</template>

<script setup lang="ts">
const { initial, enter } = useAnimations().fadeInUp
</script>
```

---

## Performance Optimization

### Core Web Vitals Targets

| Metric | Target | Current | Priority |
|--------|--------|---------|----------|
| LCP (Largest Contentful Paint) | < 2.5s | TBD | Critical |
| FID (First Input Delay) | < 100ms | TBD | High |
| CLS (Cumulative Layout Shift) | < 0.1 | TBD | Critical |
| TTFB (Time to First Byte) | < 600ms | TBD | Medium |
| FCP (First Contentful Paint) | < 1.8s | TBD | High |

### Optimization Strategies

#### 1. Image Optimization
```vue
<!-- Use Nuxt Image for all images -->
<NuxtImg
  src="/hero-image.jpg"
  width="1920"
  height="1080"
  format="webp"
  quality="80"
  loading="lazy"
  :preload="isAboveFold"
  sizes="sm:100vw md:50vw lg:800px"
/>
```

#### 2. Code Splitting
```typescript
// Lazy load heavy components
const LandingQuizModal = defineAsyncComponent(
  () => import('~/components/quiz/QuizModal.vue')
)

const LandingVideoPlayer = defineAsyncComponent(
  () => import('~/components/landing/VideoPlayer.vue')
)
```

#### 3. Font Loading
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: 'preload',
          href: '/fonts/inter-var.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: 'anonymous'
        }
      ]
    }
  }
})
```

#### 4. Critical CSS
```vue
<!-- Inline critical CSS for above-the-fold content -->
<style>
  /* Critical styles */
  .hero-section {
    min-height: 100vh;
    background: linear-gradient(...);
  }
</style>
```

#### 5. Resource Hints
```typescript
// Preconnect to external domains
{
  rel: 'preconnect',
  href: 'https://images.unsplash.com'
},
{
  rel: 'dns-prefetch',
  href: 'https://cdn.example.com'
}
```

---

## Migration Strategy

### Phase 1: Setup (Week 1)
- Create `/pages/new.vue` for testing
- Set up new component directories
- Install any missing dependencies
- Create new `useLandingContent.ts` composable
- Archive old components to `/components/home-old/`

### Phase 2: Core Components (Week 2-3)
- Build `LandingHeroSection.vue` with video
- Build `LandingMediaMentionsBar.vue`
- Build `LandingTrustBadges.vue`
- Build `LandingStatsCounter.vue`
- Add animations system

### Phase 3: Product Showcase (Week 3-4)
- Build `LandingProductCarousel.vue`
- Implement lazy loading
- Add product benefit callouts
- Mobile optimization

### Phase 4: Social Proof (Week 4-5)
- Build `LandingUGCGallery.vue`
- Build `LandingVideoTestimonials.vue`
- Implement video player
- Add lightbox functionality

### Phase 5: Quiz Feature (Week 5-6)
- Build quiz modal
- Build quiz questions
- Build results page
- Add analytics tracking

### Phase 6: Polish (Week 6-7)
- Build `LandingFeaturedCollections.vue`
- Build `LandingNewsletterSignup.vue`
- Build `LandingFooter.vue`
- Mobile optimization pass

### Phase 7: A/B Testing Setup (Week 7)
- Implement A/B testing framework
- Create feature flags
- Set up analytics
- Test both versions

### Phase 8: Performance Optimization (Week 8)
- Lighthouse audits
- Image optimization
- Code splitting
- Bundle size optimization

### Phase 9: Go Live (Week 9)
- Gradual rollout (10% → 50% → 100%)
- Monitor analytics
- Gather feedback
- Replace `pages/index.vue` with new version

---

## Feature Flags

```typescript
// composables/useABTest.ts
export const useLandingPage = () => {
  const variant = useCookie('landing-variant', {
    default: () => 'control', // old page
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })

  // Randomly assign variant on first visit
  if (!variant.value) {
    variant.value = Math.random() < 0.5 ? 'control' : 'treatment'
  }

  return {
    variant,
    isNewLanding: computed(() => variant.value === 'treatment')
  }
}
```

Usage:
```vue
<!-- pages/index.vue -->
<script setup lang="ts">
const { isNewLanding } = useLandingPage()
</script>

<template>
  <div>
    <LandingPageNew v-if="isNewLanding" />
    <LandingPageOld v-else />
  </div>
</template>
```

---

## Analytics & Tracking

### Events to Track

```typescript
// composables/useTracking.ts
export const useLandingTracking = () => {
  const trackEvent = (event: string, data?: Record<string, any>) => {
    // Send to analytics
    console.log('Track:', event, data)
  }

  return {
    trackHeroView: () => trackEvent('landing_hero_view'),
    trackCTAClick: (location: string) => trackEvent('landing_cta_click', { location }),
    trackQuizStart: () => trackEvent('landing_quiz_start'),
    trackQuizComplete: (results: any) => trackEvent('landing_quiz_complete', results),
    trackProductView: (productId: string) => trackEvent('landing_product_view', { productId }),
    trackNewsletterSignup: () => trackEvent('landing_newsletter_signup'),
    trackVideoPlay: (videoId: string) => trackEvent('landing_video_play', { videoId })
  }
}
```

### Metrics to Monitor

- **Engagement**:
  - Time on page
  - Scroll depth
  - Click-through rate on CTAs
  - Quiz completion rate
  - Video play rate

- **Conversion**:
  - Add to cart rate
  - Newsletter signup rate
  - Product page visits
  - Bounce rate

- **Performance**:
  - Page load time
  - LCP by section
  - CLS by component
  - Error rate

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// tests/unit/components/landing/HeroSection.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingHeroSection from '~/components/landing/HeroSection.vue'

describe('LandingHeroSection', () => {
  it('renders hero content', () => {
    const wrapper = mount(LandingHeroSection)
    expect(wrapper.find('h1').exists()).toBe(true)
  })

  it('shows CTA button', () => {
    const wrapper = mount(LandingHeroSection)
    expect(wrapper.find('[data-testid="hero-cta"]').exists()).toBe(true)
  })
})
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/landing-page.spec.ts
import { test, expect } from '@playwright/test'

test.describe('New Landing Page', () => {
  test('loads hero section', async ({ page }) => {
    await page.goto('/new')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('opens quiz modal', async ({ page }) => {
    await page.goto('/new')
    await page.click('[data-testid="quiz-cta"]')
    await expect(page.locator('[data-testid="quiz-modal"]')).toBeVisible()
  })

  test('navigates through quiz', async ({ page }) => {
    await page.goto('/new')
    await page.click('[data-testid="quiz-cta"]')

    // Answer question 1
    await page.click('[data-testid="quiz-option-1"]')
    await page.click('[data-testid="quiz-next"]')

    // Answer question 2
    await page.click('[data-testid="quiz-option-2"]')
    await page.click('[data-testid="quiz-next"]')

    // See results
    await expect(page.locator('[data-testid="quiz-results"]')).toBeVisible()
  })
})
```

### Visual Regression Tests

```typescript
// tests/visual/landing-page.spec.ts
import { test } from '@playwright/test'

test.describe('Landing Page Visual Tests', () => {
  test('hero section desktop', async ({ page }) => {
    await page.goto('/new')
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('[data-testid="hero-section"]')).toHaveScreenshot()
  })

  test('hero section mobile', async ({ page }) => {
    await page.goto('/new')
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('[data-testid="hero-section"]')).toHaveScreenshot()
  })
})
```

---

## Dependencies

### Current Stack (Already Installed)

```json
{
  "dependencies": {
    "@nuxt/image": "^1.11.0",
    "@nuxtjs/i18n": "^10.0.3",
    "@vueuse/core": "^13.9.0",
    "@vueuse/motion": "^3.0.3",
    "nuxt": "^3.17.7",
    "tailwindcss": "^4.1.12",
    "vue": "^3.5.18"
  }
}
```

### Additional Dependencies Needed

```bash
# Video player (if needed)
pnpm add @vime/vue-next

# Carousel/Swiper (already installed)
# "swiper": "^12.0.3" ✓

# Lightbox for images
pnpm add yet-another-react-lightbox  # or vue alternative

# Intersection Observer utilities (already in @vueuse/core) ✓
```

---

## Next Steps

### Immediate Actions

1. **Wait for Research Agent**: Best practices analysis from top 10 sites
2. **Review & Approve**: Architecture document (this document)
3. **Create Component Specs**: Detailed specs for each component
4. **Set Up Development**: Create directories and base files

### Decision Points Needed

1. **Page Strategy**: Build at `/pages/new.vue` or directly modify `/pages/index.vue`?
   - **Recommendation**: Build at `/pages/new.vue` for A/B testing

2. **Content Management**: Keep `useHomeContent.ts` or create new `useLandingContent.ts`?
   - **Recommendation**: Create new `useLandingContent.ts`, keep old for backwards compatibility

3. **Old Components**: Archive or delete?
   - **Recommendation**: Move to `/components/home-old/` for reference

4. **A/B Testing**: Implement from start or after launch?
   - **Recommendation**: Implement from start for data-driven decisions

5. **Video Hosting**: Self-hosted or CDN (Cloudflare, Vimeo)?
   - **Recommendation**: TBD based on video file sizes

---

## Success Criteria

### Technical Metrics
- ✅ Lighthouse Performance Score > 90
- ✅ LCP < 2.5s on 4G mobile
- ✅ FID < 100ms
- ✅ CLS < 0.1
- ✅ Bundle size < 200KB (main chunk)
- ✅ 100% TypeScript coverage
- ✅ 80%+ test coverage

### Business Metrics
- ✅ Increase conversion rate by 15%+
- ✅ Reduce bounce rate by 10%+
- ✅ Increase time on page by 20%+
- ✅ Newsletter signup rate > 5%
- ✅ Quiz completion rate > 40%

### UX Metrics
- ✅ WCAG 2.1 AA compliance
- ✅ Mobile-first design
- ✅ 60fps animations
- ✅ Smooth scroll behavior
- ✅ No layout shifts

---

## Appendix

### Inspiration Sites Reference

1. **Gymshark** - Dynamic hero, social proof
2. **Rhode Skin** - Video backgrounds, minimal design
3. **Brightland** - Press mentions, editorial feel
4. **Olipop** - Benefits-driven product cards
5. **Jones Road** - Quiz funnel, personalization
6. **Rare Beauty** - UGC gallery, community feel
7. **To'ak** - Video testimonials, storytelling
8. **Liquid Death** - Bold typography, humor
9. **Caraway** - Clean product photography
10. **Blueland** - Impact stats, sustainability

### Resources

- **Design Tokens**: TailwindCSS config
- **Icons**: Lucide Vue Next (already installed)
- **Images**: Nuxt Image (already installed)
- **Animations**: VueUse Motion (already installed)
- **i18n**: Nuxt i18n (already installed)

---

**End of Architecture Document**
