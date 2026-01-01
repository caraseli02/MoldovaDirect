# Hero Section Implementation Guide - Code Examples & Patterns

**Companion Document to:** hero-section-best-practices-2025.md
**Focus:** Practical implementation examples for premium wine e-commerce

---

## Quick Reference: Hero Section Anatomy

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [Trust Badge]     [Publication Logos]   [Social Proof] │ ← Mini trust signals
│                                                         │
│                                                         │
│              Main Headline (H1)                         │ ← Primary value prop
│         Supporting subtext description                  │ ← Secondary message
│                                                         │
│              [Primary CTA Button]                       │ ← Single focused action
│                                                         │
│         "Free shipping over $50" • Award badges         │ ← Additional trust
│                                                         │
│              [Hero Image/Video]                         │ ← Premium visual
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Pattern 1: Full-Width Background Hero (Brightland Style)

### HTML Structure
```html
<section class="hero" role="banner" aria-label="Premium Moldovan wine collection">
  <!-- Background Image -->
  <picture class="hero__background">
    <source
      srcset="/images/hero-mobile.avif"
      media="(max-width: 768px)"
      type="image/avif"
    >
    <source
      srcset="/images/hero-desktop.avif"
      type="image/avif"
    >
    <source
      srcset="/images/hero-desktop.webp"
      type="image/webp"
    >
    <img
      src="/images/hero-desktop.jpg"
      alt="Premium Moldovan wine bottles in vineyard setting"
      fetchpriority="high"
      width="1920"
      height="1080"
      class="hero__image"
    >
  </picture>

  <!-- Content Overlay -->
  <div class="hero__content">
    <!-- Mini Trust Signals -->
    <div class="hero__trust-bar">
      <span class="trust-badge">Award-Winning Wines</span>
      <span class="trust-badge">Free Shipping $85+</span>
      <span class="trust-badge">600+ Varieties</span>
    </div>

    <!-- Main Message -->
    <h1 class="hero__headline">
      Authentic Moldovan Wines, Direct to Your Door
    </h1>

    <p class="hero__subtext">
      Discover centuries of winemaking tradition from Europe's hidden gem
    </p>

    <!-- Primary CTA -->
    <a
      href="/collections/wines"
      class="hero__cta btn-primary"
      aria-label="Shop our wine collection"
    >
      Explore Our Collection
    </a>

    <!-- Additional Trust Signals -->
    <div class="hero__social-proof">
      <div class="as-seen-in">
        <span>As featured in:</span>
        <img src="/logos/wine-spectator.svg" alt="Wine Spectator" width="80" height="30">
        <img src="/logos/forbes.svg" alt="Forbes" width="80" height="30">
      </div>
    </div>
  </div>
</section>
```

### CSS (Nuxt/Vue with Tailwind)
```vue
<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  isolation: isolate;
}

.hero__background {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero__content {
  position: relative;
  max-width: 1200px;
  padding: 2rem;
  text-align: center;
  color: white;
  z-index: 1;

  /* Dark overlay for readability */
  &::before {
    content: '';
    position: absolute;
    inset: -2rem;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(0, 0, 0, 0.6) 100%
    );
    z-index: -1;
    border-radius: 1rem;
  }
}

.hero__trust-bar {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.trust-badge {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero__headline {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.hero__subtext {
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  font-weight: 400;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  opacity: 0.95;
}

.hero__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  background: white;
  color: #1a1a1a;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  /* Ensure minimum tap target size */
  min-height: 44px;
  min-width: 44px;

  &:hover,
  &:focus {
    background: transparent;
    color: white;
    border-color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:focus-visible {
    outline: 3px solid #fff;
    outline-offset: 4px;
  }
}

.hero__social-proof {
  margin-top: 3rem;
}

.as-seen-in {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 0.875rem;
  opacity: 0.9;

  img {
    height: 30px;
    width: auto;
    filter: brightness(0) invert(1); /* White logos */
    opacity: 0.8;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 1;
    }
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .hero {
    min-height: 80vh;
  }

  .hero__content::before {
    inset: -1rem;
  }

  .hero__trust-bar {
    font-size: 0.75rem;
  }

  .hero__cta {
    width: 100%;
    max-width: 320px;
  }
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .hero__cta {
    transition: none;

    &:hover {
      transform: none;
    }
  }
}

/* Dark mode considerations */
@media (prefers-color-scheme: dark) {
  .hero__content::before {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.5) 0%,
      rgba(0, 0, 0, 0.8) 100%
    );
  }
}
</style>
```

---

## Pattern 2: Product Carousel Hero (Rhode Skin Style)

### Vue/Nuxt Component
```vue
<template>
  <section class="hero-carousel" aria-label="Featured wine collections">
    <!-- Swiper Container -->
    <div class="swiper" ref="swiperContainer">
      <div class="swiper-wrapper">
        <!-- Slide 1 -->
        <div class="swiper-slide">
          <div class="product-hero">
            <div class="product-hero__image">
              <img
                src="/images/collections/premium-reds.jpg"
                alt="Premium Moldovan red wine collection"
                fetchpriority="high"
                width="600"
                height="800"
              >
              <div class="award-badge">
                <img src="/icons/award.svg" alt="">
                <span>Best of Moldova 2025</span>
              </div>
            </div>

            <div class="product-hero__content">
              <span class="product-category">Wine Collection</span>
              <h2 class="product-title">Premium Red Selection</h2>
              <p class="product-description">
                Handpicked varietals from Moldova's finest vineyards
              </p>
              <a href="/collections/reds" class="btn-primary">
                Explore Collection
              </a>
            </div>
          </div>
        </div>

        <!-- Slide 2 -->
        <div class="swiper-slide">
          <div class="product-hero">
            <div class="product-hero__image">
              <img
                src="/images/collections/organic-whites.jpg"
                alt="Organic Moldovan white wine collection"
                loading="lazy"
                width="600"
                height="800"
              >
              <div class="exclusive-badge">Only at MoldovaDirect</div>
            </div>

            <div class="product-hero__content">
              <span class="product-category">Limited Edition</span>
              <h2 class="product-title">Organic White Collection</h2>
              <p class="product-description">
                Sustainably farmed, naturally delicious
              </p>
              <a href="/collections/organic" class="btn-primary">
                Shop Now
              </a>
            </div>
          </div>
        </div>

        <!-- Additional slides... -->
      </div>

      <!-- Navigation -->
      <div class="swiper-button-prev" aria-label="Previous slide"></div>
      <div class="swiper-button-next" aria-label="Next slide"></div>

      <!-- Pagination -->
      <div class="swiper-pagination"></div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Swiper from 'swiper'
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const swiperContainer = ref(null)
let swiper = null

onMounted(() => {
  swiper = new Swiper(swiperContainer.value, {
    modules: [Navigation, Pagination, A11y, Autoplay],
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: true,
      pauseOnMouseEnter: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      type: 'bullets',
    },
    a11y: {
      enabled: true,
      prevSlideMessage: 'Previous slide',
      nextSlideMessage: 'Next slide',
      paginationBulletMessage: 'Go to slide {{index}}',
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
    },
  })
})
</script>

<style scoped>
.hero-carousel {
  padding: 2rem 0;
  background: #f8f7f4;
}

.product-hero {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  height: 100%;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
}

.product-hero__image {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.award-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  img {
    width: 16px;
    height: 16px;
  }
}

.exclusive-badge {
  position: absolute;
  bottom: 1rem;
  left: 0;
  background: #1a1a1a;
  color: white;
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0 2rem 2rem 0;
}

.product-hero__content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-category {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #666;
}

.product-title {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  color: #1a1a1a;
}

.product-description {
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 1.75rem;
  margin-top: 0.5rem;
  background: #1a1a1a;
  color: white;
  font-weight: 600;
  border-radius: 2.5rem;
  text-decoration: none;
  transition: all 0.3s ease;
  min-height: 44px;

  &:hover,
  &:focus {
    background: #333;
    transform: scale(1.02);
  }

  &:focus-visible {
    outline: 3px solid #1a1a1a;
    outline-offset: 4px;
  }
}

/* Swiper customization */
:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
  color: #1a1a1a;
  background: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &::after {
    font-size: 1rem;
  }

  &:focus-visible {
    outline: 3px solid #1a1a1a;
    outline-offset: 4px;
  }
}

:deep(.swiper-pagination-bullet) {
  background: #1a1a1a;
  opacity: 0.3;
  width: 10px;
  height: 10px;

  &-active {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .product-hero__content {
    padding: 1.5rem;
  }

  .product-title {
    font-size: 1.5rem;
  }
}
</style>
```

---

## Pattern 3: Split-Screen Hero (Modern Minimal)

### HTML Structure
```html
<section class="hero-split">
  <div class="hero-split__container">
    <!-- Left: Content -->
    <div class="hero-split__content">
      <div class="content-wrapper">
        <span class="eyebrow">New Release</span>

        <h1 class="headline">
          Discover Moldova's
          <span class="highlight">Wine Renaissance</span>
        </h1>

        <p class="subtext">
          From ancient cellars to modern vintages, explore wines
          that tell a story 7,000 years in the making.
        </p>

        <div class="cta-group">
          <a href="/shop" class="btn-primary">
            Start Exploring
          </a>
          <a href="/about" class="btn-secondary">
            Our Story
          </a>
        </div>

        <div class="trust-metrics">
          <div class="metric">
            <strong>600+</strong>
            <span>Wine Varieties</span>
          </div>
          <div class="metric">
            <strong>4.9/5</strong>
            <span>Customer Rating</span>
          </div>
          <div class="metric">
            <strong>20+</strong>
            <span>Awards Won</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Visual -->
    <div class="hero-split__visual">
      <picture>
        <source
          srcset="/images/hero-visual.avif"
          type="image/avif"
        >
        <source
          srcset="/images/hero-visual.webp"
          type="image/webp"
        >
        <img
          src="/images/hero-visual.jpg"
          alt="Moldovan wine cellar with oak barrels"
          fetchpriority="high"
          width="800"
          height="1000"
        >
      </picture>
    </div>
  </div>
</section>
```

### CSS
```css
.hero-split {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: #fafaf9;
}

.hero-split__container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  align-items: center;
}

.hero-split__content {
  padding: 2rem;
}

.content-wrapper {
  max-width: 540px;
}

.eyebrow {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #f0e6d2;
  color: #8b4513;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 2rem;
  margin-bottom: 1.5rem;
}

.headline {
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
}

.highlight {
  color: #8b4513;
  display: block;
}

.subtext {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #666;
  margin-bottom: 2rem;
}

.cta-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  font-weight: 600;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.3s ease;
  min-height: 44px;
  min-width: 44px;
}

.btn-primary {
  background: #1a1a1a;
  color: white;

  &:hover {
    background: #333;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.btn-secondary {
  background: transparent;
  color: #1a1a1a;
  border: 2px solid #1a1a1a;

  &:hover {
    background: #1a1a1a;
    color: white;
  }
}

.trust-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e5e5;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  strong {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1a1a1a;
  }

  span {
    font-size: 0.875rem;
    color: #666;
  }
}

.hero-split__visual {
  position: relative;
  height: 80vh;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

/* Mobile responsive */
@media (max-width: 1024px) {
  .hero-split__container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .hero-split__visual {
    height: 50vh;
    order: -1; /* Image first on mobile */
  }

  .content-wrapper {
    max-width: 100%;
  }

  .trust-metrics {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .cta-group {
    flex-direction: column;

    .btn-primary,
    .btn-secondary {
      width: 100%;
    }
  }
}
```

---

## Performance Optimization Checklist

### Critical CSS Inlining
```html
<!-- In your Nuxt layout or app.html -->
<head>
  <!-- Inline critical CSS for hero -->
  <style>
    /* Minimum styles needed for hero to render */
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero__image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    /* Add more critical styles... */
  </style>

  <!-- Preload critical resources -->
  <link
    rel="preload"
    as="image"
    href="/images/hero-desktop.avif"
    type="image/avif"
    fetchpriority="high"
  >
  <link
    rel="preload"
    as="font"
    href="/fonts/heading-font.woff2"
    type="font/woff2"
    crossorigin
  >
</head>
```

### Image Optimization Script (Node.js)
```javascript
// scripts/optimize-hero-images.js
import sharp from 'sharp'
import { promises as fs } from 'fs'

async function optimizeHeroImage(inputPath, outputDir) {
  const filename = inputPath.split('/').pop().split('.')[0]

  // Desktop WebP
  await sharp(inputPath)
    .resize(1920, 1080, { fit: 'cover', position: 'center' })
    .webp({ quality: 85 })
    .toFile(`${outputDir}/${filename}-desktop.webp`)

  // Desktop AVIF (best compression)
  await sharp(inputPath)
    .resize(1920, 1080, { fit: 'cover', position: 'center' })
    .avif({ quality: 80 })
    .toFile(`${outputDir}/${filename}-desktop.avif`)

  // Mobile WebP
  await sharp(inputPath)
    .resize(768, 1024, { fit: 'cover', position: 'center' })
    .webp({ quality: 80 })
    .toFile(`${outputDir}/${filename}-mobile.webp`)

  // Mobile AVIF
  await sharp(inputPath)
    .resize(768, 1024, { fit: 'cover', position: 'center' })
    .avif({ quality: 75 })
    .toFile(`${outputDir}/${filename}-mobile.avif`)

  // Fallback JPEG
  await sharp(inputPath)
    .resize(1920, 1080, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 85, progressive: true })
    .toFile(`${outputDir}/${filename}-desktop.jpg`)

  console.log(`✅ Optimized ${filename}`)
}

// Usage
optimizeHeroImage('./source/hero-image.jpg', './public/images/optimized')
```

---

## Accessibility Composable (Nuxt)

```typescript
// composables/useA11yHero.ts
export const useA11yHero = () => {
  const prefersReducedMotion = ref(false)

  onMounted(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches

    // Listen for changes
    mediaQuery.addEventListener('change', (e) => {
      prefersReducedMotion.value = e.matches
    })
  })

  // Announce slide changes to screen readers
  const announceSlideChange = (slideNumber: number, totalSlides: number) => {
    const announcement = `Slide ${slideNumber} of ${totalSlides}`

    // Create or update live region
    let liveRegion = document.getElementById('slide-announcer')
    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'slide-announcer'
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.className = 'sr-only'
      document.body.appendChild(liveRegion)
    }

    liveRegion.textContent = announcement
  }

  // Check color contrast
  const checkContrast = (foreground: string, background: string) => {
    // Simplified contrast calculation
    // In production, use a library like 'wcag-contrast'
    const getLuminance = (color: string) => {
      // Implementation details...
      return 0.5 // Placeholder
    }

    const fgLuminance = getLuminance(foreground)
    const bgLuminance = getLuminance(background)

    const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) /
                  (Math.min(fgLuminance, bgLuminance) + 0.05)

    return {
      ratio,
      passesAA: ratio >= 4.5,
      passesAAA: ratio >= 7,
    }
  }

  return {
    prefersReducedMotion,
    announceSlideChange,
    checkContrast,
  }
}
```

### Usage in Component
```vue
<script setup>
const { prefersReducedMotion, announceSlideChange } = useA11yHero()

// Disable autoplay if user prefers reduced motion
const autoplayConfig = computed(() => {
  return prefersReducedMotion.value ? false : {
    delay: 5000,
    disableOnInteraction: true,
  }
})
</script>
```

---

## Animation Examples

### Scroll-Triggered Fade In
```vue
<template>
  <div ref="heroElement" class="hero" :class="{ 'is-visible': isVisible }">
    <!-- Hero content -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const heroElement = ref(null)
const isVisible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isVisible.value = true
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )

  if (heroElement.value) {
    observer.observe(heroElement.value)
  }
})
</script>

<style scoped>
.hero {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.hero.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .hero {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
```

### Parallax Effect (Subtle)
```vue
<template>
  <div class="hero-parallax" ref="parallaxContainer">
    <div
      class="hero-parallax__background"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <img src="/hero-bg.jpg" alt="Background">
    </div>

    <div class="hero-parallax__content">
      <!-- Content here -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const parallaxContainer = ref(null)
const offsetY = ref(0)

const handleScroll = () => {
  if (!parallaxContainer.value) return

  const scrolled = window.pageYOffset
  const rect = parallaxContainer.value.getBoundingClientRect()
  const containerTop = rect.top + scrolled

  // Only apply parallax when element is in view
  if (scrolled > containerTop - window.innerHeight &&
      scrolled < containerTop + rect.height) {
    // Subtle parallax: move at 30% of scroll speed
    offsetY.value = (scrolled - containerTop) * 0.3
  }
}

onMounted(() => {
  // Check for motion preference
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  if (!prefersReducedMotion) {
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.hero-parallax {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.hero-parallax__background {
  position: absolute;
  top: -20%;
  left: 0;
  width: 100%;
  height: 120%;
  will-change: transform;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.hero-parallax__content {
  position: relative;
  z-index: 1;
}
</style>
```

---

## Testing & Validation

### Lighthouse CI Configuration
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
      },
    },
  },
}
```

### Playwright Accessibility Tests
```typescript
// tests/hero-accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Hero Section Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('.hero')
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('hero CTA should be keyboard accessible', async ({ page }) => {
    await page.goto('/')

    // Tab to CTA
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Check if CTA is focused
    const focusedElement = await page.evaluate(() =>
      document.activeElement?.classList.contains('hero__cta')
    )

    expect(focusedElement).toBeTruthy()

    // Activate with Enter
    await page.keyboard.press('Enter')

    // Should navigate
    await expect(page).toHaveURL(/\/collections\/wines/)
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)

    const h1Text = await page.locator('h1').textContent()
    expect(h1Text).toBeTruthy()
  })

  test('images should have alt text', async ({ page }) => {
    await page.goto('/')

    const heroImages = await page.locator('.hero img').all()

    for (const img of heroImages) {
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
  })
})
```

---

## Quick Wins: Immediate Improvements

### 1. Add fetchpriority to Hero Image
```diff
  <img
    src="hero.jpg"
    alt="Moldovan wine collection"
+   fetchpriority="high"
  >
```

### 2. Remove lazy loading from above-fold images
```diff
- <img src="hero.jpg" loading="lazy">
+ <img src="hero.jpg" fetchpriority="high">
```

### 3. Add Preload Link in Head
```html
<link rel="preload" as="image" href="/hero.avif" type="image/avif" fetchpriority="high">
```

### 4. Ensure Minimum Button Size
```css
.hero__cta {
  min-height: 44px;
  min-width: 44px;
  padding: 1rem 2rem;
}
```

### 5. Add Focus Visible Styles
```css
.hero__cta:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 4px;
}
```

---

## Resources & Tools

### Image Optimization
- **Squoosh**: https://squoosh.app - Browser-based image compression
- **Sharp**: https://sharp.pixelplumbing.com - Node.js image processing
- **ImageOptim**: https://imageoptim.com - Mac app for optimization

### Performance Testing
- **PageSpeed Insights**: https://pagespeed.web.dev
- **WebPageTest**: https://www.webpagetest.org
- **Lighthouse CI**: https://github.com/GoogleChrome/lighthouse-ci

### Accessibility Testing
- **WAVE**: https://wave.webaim.org
- **axe DevTools**: https://www.deque.com/axe/devtools
- **Accessibility Insights**: https://accessibilityinsights.io

### Animation Libraries
- **GSAP**: https://greensock.com/gsap
- **Swiper**: https://swiperjs.com
- **AOS**: https://michalsnik.github.io/aos

---

## Next Steps

1. Choose a hero pattern that fits your brand (full-width, carousel, or split-screen)
2. Optimize all hero images using the provided script
3. Implement accessibility features from the composable
4. Add performance optimizations (preload, fetchpriority)
5. Test with Lighthouse and accessibility tools
6. Conduct A/B testing on CTA copy and placement

Remember: Start with performance and accessibility foundations, then layer on visual enhancements. A beautiful hero that loads slowly or isn't accessible serves no one.
