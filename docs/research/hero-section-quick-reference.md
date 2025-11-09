# Hero Section Quick Reference Guide

## Already Installed Dependencies

```json
{
  "@nuxt/image": "^1.11.0",          // ✅ Image optimization
  "@vueuse/motion": "^3.0.3",         // ✅ Animation library
  "@vueuse/core": "^13.9.0",          // ✅ Composables including useIntersectionObserver
  "tailwindcss": "^4.1.12",           // ✅ CSS framework
  "tailwindcss-animate": "^1.0.7"     // ✅ Animation utilities
}
```

## Quick Installation Commands

```bash
# GSAP (for advanced scroll animations)
pnpm add gsap

# Lottie animations
pnpm add vue3-lottie

# Font optimization (recommended)
pnpm add -D @nuxt/fonts

# YouTube lazy loading (optional)
pnpm add nuxt-lazytube
```

## Essential Code Snippets

### 1. Optimized Hero Image (LCP < 2.5s)

```vue
<NuxtImg
  src="/images/hero-banner.jpg"
  alt="Descriptive alt text"
  width="1920"
  height="1080"
  format="webp"
  quality="85"
  loading="eager"
  fetchpriority="high"
  preload
  sizes="100vw"
  class="w-full h-auto object-cover"
/>
```

### 2. Basic Fade-In Animation (@vueuse/motion)

```vue
<div
  v-motion
  :initial="{ opacity: 0, y: 100 }"
  :enter="{ opacity: 1, y: 0, transition: { duration: 800 } }"
>
  Animated content
</div>
```

### 3. Scroll-Triggered Animation (Intersection Observer)

```vue
<template>
  <div
    ref="target"
    :class="{ 'opacity-100': isVisible, 'opacity-0': !isVisible }"
    class="transition-all duration-700"
  >
    Content
  </div>
</template>

<script setup lang="ts">
const target = ref<HTMLElement>()
const isVisible = ref(false)

useIntersectionObserver(
  target,
  ([entry]) => {
    isVisible.value = entry.isIntersecting
  },
  { threshold: 0.3 }
)
</script>
```

### 4. Custom Tailwind Animation

Add to `/assets/css/tailwind.css`:

```css
@theme {
  --animate-fade-in: fade-in 1s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

Usage:
```vue
<div class="animate-[fade-in]">Fades in</div>
```

### 5. GSAP ScrollTrigger Setup

Plugin (`/plugins/gsap.client.ts`):
```typescript
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger)
  return { provide: { gsap, ScrollTrigger } }
})
```

Composable (`/composables/useGsap.ts`):
```typescript
export const useGsap = () => {
  const nuxtApp = useNuxtApp()
  return {
    gsap: nuxtApp.$gsap,
    ScrollTrigger: nuxtApp.$ScrollTrigger
  }
}
```

Usage:
```vue
<script setup lang="ts">
const heroRef = ref<HTMLElement>()
const { gsap } = useGsap()

onMounted(() => {
  nextTick(() => {
    gsap.from(heroRef.value, {
      opacity: 0,
      y: 100,
      duration: 1
    })
  })
})
</script>
```

### 6. Lottie Animation

Plugin (`/plugins/Vue3Lottie.client.ts`):
```typescript
import { Vue3Lottie } from 'vue3-lottie'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Vue3Lottie', Vue3Lottie)
})
```

Usage:
```vue
<client-only>
  <Vue3Lottie
    animationLink="https://assets.lottiefiles.com/packages/lf20_animation.json"
    :height="400"
    :width="400"
    :loop="true"
    :autoPlay="true"
  />
</client-only>
```

### 7. Lazy-Loaded Video

```vue
<template>
  <video
    autoplay
    muted
    loop
    playsinline
    preload="metadata"
    poster="/images/video-poster.jpg"
  >
    <source src="/videos/hero.webm" type="video/webm">
    <source src="/videos/hero.mp4" type="video/mp4">
  </video>
</template>
```

### 8. Accessibility - Skip Link

```vue
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
         focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded"
>
  Skip to main content
</a>
```

CSS (`/assets/css/tailwind.css`):
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### 9. Reduced Motion Support

Composable (`/composables/useReducedMotion.ts`):
```typescript
export const useReducedMotion = () => {
  const prefersReducedMotion = ref(false)

  onMounted(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      prefersReducedMotion.value = mediaQuery.matches

      mediaQuery.addEventListener('change', (e) => {
        prefersReducedMotion.value = e.matches
      })
    }
  })

  return prefersReducedMotion
}
```

Usage:
```vue
<div
  v-motion
  :initial="{ opacity: 0, y: prefersReducedMotion ? 0 : 100 }"
  :enter="{
    opacity: 1,
    y: 0,
    transition: { duration: prefersReducedMotion ? 0 : 800 }
  }"
>
  Content
</div>
```

### 10. Custom Animation Presets

Add to `/nuxt.config.ts`:
```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      motion: {
        directives: {
          'fade-up': {
            initial: { opacity: 0, y: 50 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 600, ease: 'easeOut' }
            }
          },
          'zoom-in': {
            initial: { opacity: 0, scale: 0.5 },
            visible: {
              opacity: 1,
              scale: 1,
              transition: { type: 'spring', stiffness: 260 }
            }
          }
        }
      }
    }
  }
})
```

Usage:
```vue
<div v-motion-fade-up>Fades up from bottom</div>
<div v-motion-zoom-in>Zooms in with spring</div>
```

## Performance Optimization Checklist

### LCP (Largest Contentful Paint) < 2.5s
- [ ] Use `loading="eager"` on hero images
- [ ] Set `fetchpriority="high"`
- [ ] Enable `preload` attribute
- [ ] Use WebP/AVIF format
- [ ] Optimize quality (80-85)
- [ ] Add preload link in head

### CLS (Cumulative Layout Shift) < 0.1
- [ ] Always specify width/height
- [ ] Use `aspect-ratio` CSS
- [ ] Reserve space for dynamic content
- [ ] Optimize font loading
- [ ] Avoid inserting content above existing content

### Accessibility (WCAG 2.2 AA)
- [ ] Semantic HTML (`<section>`, `<main>`)
- [ ] Descriptive alt text
- [ ] 4.5:1 color contrast
- [ ] 44x44px minimum touch targets
- [ ] Keyboard navigation support
- [ ] ARIA labels where needed
- [ ] Skip to main content link
- [ ] Respect `prefers-reduced-motion`

## File Structure

```
/Users/vladislavcaraseli/Documents/MoldovaDirect/
├── assets/
│   ├── animations/          # Lottie JSON files
│   │   └── hero.json
│   ├── css/
│   │   └── tailwind.css     # Custom Tailwind config
│   └── videos/
│       └── hero.mp4
├── composables/
│   ├── useGsap.ts           # GSAP composable
│   ├── useReducedMotion.ts  # Accessibility
│   ├── useRevealOnScroll.ts # Scroll animations
│   └── usePerformanceMetrics.ts
├── plugins/
│   ├── gsap.client.ts       # GSAP setup
│   └── Vue3Lottie.client.ts # Lottie setup
├── public/
│   ├── images/
│   │   └── hero-banner.jpg
│   └── videos/
│       └── hero.mp4
└── nuxt.config.ts           # Configuration
```

## Testing

### Performance Testing
```bash
# Lighthouse CI
npx lighthouse https://localhost:3000 --view

# Chrome DevTools Performance tab
# Check LCP, CLS, and other Core Web Vitals
```

### Accessibility Testing
```bash
# axe DevTools browser extension
# NVDA / VoiceOver screen readers
# Keyboard navigation (Tab, Enter, Space, Esc)
```

## Common Pitfalls

1. **Not setting image dimensions** → Causes CLS
2. **Using lazy loading on hero images** → Delays LCP
3. **Forgetting `preload` on critical assets** → Slower LCP
4. **Not respecting `prefers-reduced-motion`** → Accessibility issue
5. **Missing alt text** → WCAG violation
6. **Insufficient color contrast** → WCAG violation
7. **Using `<div>` instead of semantic HTML** → Poor accessibility
8. **Not cleaning up GSAP/observers** → Memory leaks
9. **Autoplay video with sound** → Browser blocks it
10. **Using `<client-only>` without hydration consideration** → Layout shifts

## Resources

- **Nuxt Image**: https://image.nuxt.com/
- **VueUse Motion**: https://motion.vueuse.org/
- **GSAP**: https://greensock.com/docs/
- **VueUse**: https://vueuse.org/
- **Tailwind CSS**: https://tailwindcss.com/
- **WCAG 2.2**: https://www.w3.org/WAI/WCAG22/quickref/
- **Web Vitals**: https://web.dev/vitals/

## Next Steps

1. Review full documentation: `/docs/research/hero-section-technical-implementation.md`
2. Install additional dependencies if needed
3. Create composables for reusable functionality
4. Set up plugins for global libraries
5. Implement hero section following accessibility guidelines
6. Test performance with Lighthouse
7. Validate accessibility with axe DevTools
8. Test with screen readers
9. Optimize based on metrics
10. Deploy and monitor Core Web Vitals
