# Hero Section Technical Implementation Guide
**Nuxt 3 Advanced Features & Best Practices - 2025**

This comprehensive guide covers technical implementation options for creating impressive, performant, and accessible hero sections in Nuxt 3.

---

## Table of Contents
1. [Nuxt Image Optimization (@nuxt/image)](#1-nuxt-image-optimization)
2. [Vue 3 Animation Libraries](#2-vue-3-animation-libraries)
3. [Video Optimization & Lazy Loading](#3-video-optimization--lazy-loading)
4. [Intersection Observer API](#4-intersection-observer-api)
5. [Tailwind CSS Animation Utilities](#5-tailwind-css-animation-utilities)
6. [Performance Optimization (LCP, CLS)](#6-performance-optimization-lcp-cls)
7. [Accessibility Best Practices](#7-accessibility-best-practices)

---

## 1. Nuxt Image Optimization

### Current Project Setup
Your project already has `@nuxt/image` v1.11.0 configured in `/Users/vladislavcaraseli/Documents/MoldovaDirect/nuxt.config.ts`:

```typescript
image: {
  domains: ["images.unsplash.com"],
  formats: ["webp", "avif"],
  quality: 80,
  screens: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536,
  },
}
```

### NuxtImg Component

#### Basic Hero Image Implementation
```vue
<template>
  <NuxtImg
    src="/images/hero-banner.jpg"
    alt="Authentic Moldovan wines and products"
    width="1920"
    height="1080"
    format="webp"
    quality="85"
    loading="eager"
    fetchpriority="high"
    preload
    sizes="100vw sm:100vw md:100vw lg:100vw xl:100vw"
    class="w-full h-auto object-cover"
  />
</template>
```

#### Key Props for Hero Images

| Prop | Value | Purpose |
|------|-------|---------|
| `loading` | `"eager"` | Load immediately (critical for LCP) |
| `fetchpriority` | `"high"` | Browser prioritizes this resource |
| `preload` | `true` | Adds `<link rel="preload">` in head |
| `format` | `"webp"` or `"avif"` | Modern format for smaller file sizes |
| `quality` | `80-90` | Balance quality and file size |
| `sizes` | `"100vw"` | Full viewport width for hero |

#### Responsive Hero with Art Direction
```vue
<template>
  <NuxtImg
    src="/images/hero-desktop.jpg"
    alt="Moldovan vineyard landscape"
    width="1920"
    height="1080"
    sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw"
    :modifiers="{
      fit: 'cover',
      position: 'center',
      blur: isLoading ? 10 : 0
    }"
    loading="eager"
    fetchpriority="high"
    @load="isLoading = false"
  />
</template>

<script setup lang="ts">
const isLoading = ref(true)
</script>
```

#### Retina/HiDPI Support
```vue
<template>
  <NuxtImg
    src="/images/hero.jpg"
    alt="Hero image"
    width="1920"
    height="1080"
    densities="x1 x2"
    loading="eager"
    fetchpriority="high"
  />
</template>
```

The `densities` prop generates:
- `1x` for standard displays (1920x1080)
- `2x` for Retina displays (3840x2160)

### NuxtPicture Component

For maximum browser compatibility with modern formats:

```vue
<template>
  <NuxtPicture
    src="/images/hero.jpg"
    alt="Moldovan heritage and tradition"
    width="1920"
    height="1080"
    format="avif,webp"
    :imgAttrs="{
      loading: 'eager',
      fetchpriority: 'high',
      class: 'w-full h-auto object-cover'
    }"
    preload
  />
</template>
```

This generates:
```html
<picture>
  <source srcset="..." type="image/avif">
  <source srcset="..." type="image/webp">
  <img src="..." alt="..." loading="eager" fetchpriority="high">
</picture>
```

### Placeholder Strategies

#### Blur-up Technique
```vue
<template>
  <NuxtImg
    src="/images/hero.jpg"
    alt="Hero image"
    :placeholder="[50, 25, 75, 5]"
    placeholder-class="blur-xl"
    loading="eager"
  />
</template>
```

Parameters: `[width, height, quality, blur]`

#### Custom Placeholder with Animation
```vue
<template>
  <NuxtImg
    src="/images/hero-large.jpg"
    alt="Hero"
    width="1920"
    height="1080"
    :placeholder="true"
    loading="eager"
    class="transition-opacity duration-700"
    :class="{ 'opacity-100': imageLoaded, 'opacity-0': !imageLoaded }"
    @load="imageLoaded = true"
  />
</template>

<script setup lang="ts">
const imageLoaded = ref(false)
</script>
```

### Best Practices for Hero Images

1. **Always specify dimensions** - Prevents CLS (Cumulative Layout Shift)
2. **Use eager loading** - Hero images should load immediately
3. **Set fetchpriority="high"** - Browser optimization hint
4. **Enable preload** - Adds preload link in document head
5. **Choose optimal format** - WebP for broad support, AVIF for cutting edge
6. **Optimize quality** - 80-85 for heroes balances quality/size
7. **Provide descriptive alt text** - Critical for accessibility and SEO

---

## 2. Vue 3 Animation Libraries

### @vueuse/motion (Already Installed - v3.0.3)

Your project already has `@vueuse/motion` configured in `/Users/vladislavcaraseli/Documents/MoldovaDirect/nuxt.config.ts`:

```typescript
modules: [
  // ... other modules
  "@vueuse/motion/nuxt",
]
```

#### Basic v-motion Directive

```vue
<template>
  <section class="hero">
    <!-- Fade in from bottom -->
    <h1
      v-motion
      :initial="{ opacity: 0, y: 100 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 800 } }"
    >
      Welcome to Moldova Direct
    </h1>

    <!-- Scale and fade in -->
    <p
      v-motion
      :initial="{ opacity: 0, scale: 0.8 }"
      :enter="{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 600,
          delay: 200,
          ease: 'easeOut'
        }
      }"
    >
      Authentic Moldovan products delivered to Spain
    </p>

    <!-- Slide in from left -->
    <UiButton
      v-motion
      :initial="{ opacity: 0, x: -50 }"
      :enter="{
        opacity: 1,
        x: 0,
        transition: { duration: 500, delay: 400 }
      }"
    >
      Shop Now
    </UiButton>
  </section>
</template>
```

#### Custom Animation Presets

Add to `/Users/vladislavcaraseli/Documents/MoldovaDirect/nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  // ... existing config
  runtimeConfig: {
    public: {
      motion: {
        directives: {
          'pop-bottom': {
            initial: { scale: 0, opacity: 0, y: 100 },
            visible: { scale: 1, opacity: 1, y: 0 }
          },
          'slide-left': {
            initial: { opacity: 0, x: -100 },
            visible: { opacity: 1, x: 0 }
          },
          'slide-right': {
            initial: { opacity: 0, x: 100 },
            visible: { opacity: 1, x: 0 }
          },
          'fade-up': {
            initial: { opacity: 0, y: 50 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 600,
                ease: 'easeOut'
              }
            }
          },
          'zoom-in': {
            initial: { opacity: 0, scale: 0.5 },
            visible: {
              opacity: 1,
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 260,
                damping: 20
              }
            }
          }
        }
      }
    }
  }
})
```

Usage in components:

```vue
<template>
  <div v-motion-pop-bottom>Pop from bottom!</div>
  <div v-motion-slide-left>Slide from left!</div>
  <div v-motion-fade-up>Fade and slide up!</div>
  <div v-motion-zoom-in>Zoom in with spring!</div>
</template>
```

#### Advanced Hero Section with Staggered Animations

```vue
<template>
  <section class="hero relative h-screen flex items-center justify-center">
    <!-- Background Image -->
    <NuxtPicture
      src="/images/hero-bg.jpg"
      alt="Background"
      class="absolute inset-0 w-full h-full object-cover"
      loading="eager"
      fetchpriority="high"
    />

    <!-- Overlay -->
    <div
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 0.6, transition: { duration: 1000 } }"
      class="absolute inset-0 bg-black"
    />

    <!-- Content -->
    <div class="relative z-10 text-center text-white max-w-4xl px-4">
      <h1
        v-motion
        :initial="{ opacity: 0, y: 100 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            duration: 800,
            ease: 'easeOut'
          }
        }"
        class="text-5xl md:text-7xl font-bold mb-6"
      >
        Discover Moldovan Heritage
      </h1>

      <p
        v-motion
        :initial="{ opacity: 0, y: 50 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            duration: 600,
            delay: 300,
            ease: 'easeOut'
          }
        }"
        class="text-xl md:text-2xl mb-8"
      >
        Premium wines and traditional products from Moldova
      </p>

      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.8 }"
        :enter="{
          opacity: 1,
          scale: 1,
          transition: {
            duration: 500,
            delay: 600,
            type: 'spring',
            stiffness: 200
          }
        }"
        class="flex gap-4 justify-center"
      >
        <UiButton size="lg">Explore Products</UiButton>
        <UiButton variant="outline" size="lg">Learn More</UiButton>
      </div>
    </div>
  </section>
</template>
```

#### Scroll-based Animations with v-motion

```vue
<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 100 }"
    :visible="{ opacity: 1, y: 0 }"
    :visibleOnce="true"
  >
    Content animates when scrolled into view
  </div>
</template>
```

### GSAP with ScrollTrigger

#### Installation

```bash
pnpm add gsap
```

#### Plugin Setup

Create `/Users/vladislavcaraseli/Documents/MoldovaDirect/plugins/gsap.client.ts`:

```typescript
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

export default defineNuxtPlugin(() => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

  return {
    provide: {
      gsap,
      ScrollTrigger,
      ScrollToPlugin
    }
  }
})
```

#### Composable (Recommended)

Create `/Users/vladislavcaraseli/Documents/MoldovaDirect/composables/useGsap.ts`:

```typescript
export const useGsap = () => {
  const nuxtApp = useNuxtApp()

  return {
    gsap: nuxtApp.$gsap,
    ScrollTrigger: nuxtApp.$ScrollTrigger,
    ScrollToPlugin: nuxtApp.$ScrollToPlugin,
  }
}
```

#### Basic Hero Animation

```vue
<template>
  <section ref="heroRef" class="hero h-screen relative overflow-hidden">
    <div ref="titleRef" class="hero-title">
      <h1>Amazing Hero Title</h1>
    </div>
    <div ref="subtitleRef" class="hero-subtitle">
      <p>Captivating subtitle text</p>
    </div>
    <div ref="ctaRef" class="hero-cta">
      <button>Get Started</button>
    </div>
  </section>
</template>

<script setup lang="ts">
const heroRef = ref<HTMLElement>()
const titleRef = ref<HTMLElement>()
const subtitleRef = ref<HTMLElement>()
const ctaRef = ref<HTMLElement>()

const { gsap } = useGsap()

onMounted(() => {
  // Wait for refs to be available
  nextTick(() => {
    // Create animation timeline
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' }
    })

    tl.from(titleRef.value, {
      y: 100,
      opacity: 0,
      duration: 1
    })
    .from(subtitleRef.value, {
      y: 50,
      opacity: 0,
      duration: 0.8
    }, '-=0.5') // Start 0.5s before previous animation ends
    .from(ctaRef.value, {
      scale: 0.8,
      opacity: 0,
      duration: 0.6
    }, '-=0.4')
  })
})
</script>
```

#### Advanced ScrollTrigger Hero

```vue
<template>
  <section ref="heroSection" class="hero h-screen relative">
    <div ref="parallaxBg" class="absolute inset-0">
      <NuxtImg
        src="/images/hero-parallax.jpg"
        alt="Background"
        class="w-full h-full object-cover"
        loading="eager"
      />
    </div>

    <div class="relative z-10 flex items-center justify-center h-full">
      <div ref="content" class="text-center text-white">
        <h1 ref="title" class="text-6xl font-bold mb-4">
          Scroll Magic
        </h1>
        <p ref="subtitle" class="text-2xl">
          Experience smooth animations
        </p>
      </div>
    </div>
  </section>

  <section class="h-screen bg-gray-100">
    <!-- Next section content -->
  </section>
</template>

<script setup lang="ts">
const heroSection = ref<HTMLElement>()
const parallaxBg = ref<HTMLElement>()
const content = ref<HTMLElement>()
const title = ref<HTMLElement>()
const subtitle = ref<HTMLElement>()

const { gsap, ScrollTrigger } = useGsap()

onMounted(() => {
  nextTick(() => {
    // Parallax background effect
    gsap.to(parallaxBg.value, {
      yPercent: 50,
      ease: 'none',
      scrollTrigger: {
        trigger: heroSection.value,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        markers: false // Set to true for debugging
      }
    })

    // Fade out content on scroll
    gsap.to(content.value, {
      opacity: 0,
      y: -100,
      scrollTrigger: {
        trigger: heroSection.value,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    })

    // Title scale effect
    gsap.to(title.value, {
      scale: 1.2,
      scrollTrigger: {
        trigger: heroSection.value,
        start: 'top top',
        end: 'center top',
        scrub: true
      }
    })
  })
})

// Cleanup on unmount
onUnmounted(() => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill())
})
</script>
```

#### GSAP Best Practices for Nuxt 3

1. **Use `.client.ts` suffix** - Ensures plugin runs client-side only
2. **Wait for refs** - Always use `nextTick()` after `onMounted()`
3. **Clean up ScrollTriggers** - Kill triggers in `onUnmounted()`
4. **Use markers for debugging** - Set `markers: true` in ScrollTrigger
5. **Handle route changes** - Refresh ScrollTrigger on navigation:

```typescript
const route = useRoute()

watch(() => route.path, () => {
  nextTick(() => {
    ScrollTrigger.refresh()
  })
})
```

### Lottie Animations (vue3-lottie)

#### Installation

```bash
pnpm add vue3-lottie
```

#### Plugin Setup

Create `/Users/vladislavcaraseli/Documents/MoldovaDirect/plugins/Vue3Lottie.client.ts`:

```typescript
import { Vue3Lottie } from 'vue3-lottie'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Vue3Lottie', Vue3Lottie)
})
```

#### Basic Usage in Hero

```vue
<template>
  <section class="hero">
    <div class="container mx-auto">
      <div class="grid grid-cols-2 gap-8 items-center">
        <div>
          <h1>Welcome to Moldova Direct</h1>
          <p>Premium Moldovan products</p>
        </div>

        <client-only>
          <Vue3Lottie
            animationLink="https://assets10.lottiefiles.com/packages/lf20_wine_animation.json"
            :height="400"
            :width="400"
            :loop="true"
            :autoPlay="true"
            :speed="1"
          />
        </client-only>
      </div>
    </div>
  </section>
</template>
```

#### Advanced Lottie with Controls

```vue
<template>
  <section class="hero">
    <client-only>
      <Vue3Lottie
        ref="lottieAnimation"
        animationLink="https://assets.lottiefiles.com/packages/lf20_hero_animation.json"
        :height="500"
        :width="500"
        :loop="false"
        :autoPlay="false"
        :pauseOnHover="true"
        @on-animation-loaded="onAnimationLoaded"
        @on-complete="onAnimationComplete"
      />
    </client-only>

    <div class="controls">
      <button @click="playAnimation">Play</button>
      <button @click="pauseAnimation">Pause</button>
      <button @click="stopAnimation">Stop</button>
      <button @click="setSpeed(2)">2x Speed</button>
    </div>
  </section>
</template>

<script setup lang="ts">
const lottieAnimation = ref()

const playAnimation = () => {
  lottieAnimation.value?.play()
}

const pauseAnimation = () => {
  lottieAnimation.value?.pause()
}

const stopAnimation = () => {
  lottieAnimation.value?.stop()
}

const setSpeed = (speed: number) => {
  lottieAnimation.value?.setSpeed(speed)
}

const onAnimationLoaded = () => {
  console.log('Animation loaded')
  // Auto-play after load
  lottieAnimation.value?.play()
}

const onAnimationComplete = () => {
  console.log('Animation completed')
}
</script>
```

#### Local JSON Animation

```vue
<template>
  <client-only>
    <Vue3Lottie
      :animationData="heroAnimation"
      :height="400"
      :width="400"
      :loop="true"
      :autoPlay="true"
    />
  </client-only>
</template>

<script setup lang="ts">
import heroAnimation from '~/assets/animations/hero.json'
</script>
```

Place JSON files in `/Users/vladislavcaraseli/Documents/MoldovaDirect/assets/animations/`

#### Lottie Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animationData` | Object | — | Import JSON directly (faster) |
| `animationLink` | String | "" | URL to Lottie JSON |
| `loop` | Boolean/Number | true | Loop animation or set loop count |
| `autoPlay` | Boolean | true | Start automatically |
| `speed` | Number | 1 | Animation speed multiplier |
| `direction` | String | 'forward' | 'forward', 'reverse', 'alternate' |
| `pauseOnHover` | Boolean | false | Pause when hovering |
| `playOnHover` | Boolean | false | Play on hover |
| `backgroundColor` | String | 'transparent' | Background color |
| `scale` | Number | 1 | Scale the SVG canvas |

---

## 3. Video Optimization & Lazy Loading

### Native HTML5 Video Hero

```vue
<template>
  <section class="hero relative h-screen overflow-hidden">
    <video
      ref="videoRef"
      class="absolute inset-0 w-full h-full object-cover"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      poster="/images/video-poster.jpg"
      @loadeddata="onVideoLoaded"
    >
      <source src="/videos/hero.webm" type="video/webm">
      <source src="/videos/hero.mp4" type="video/mp4">
      Your browser does not support the video tag.
    </video>

    <!-- Overlay and content -->
    <div class="relative z-10 flex items-center justify-center h-full">
      <div class="text-center text-white">
        <h1>Video Hero Section</h1>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const videoRef = ref<HTMLVideoElement>()
const isVideoLoaded = ref(false)

const onVideoLoaded = () => {
  isVideoLoaded.value = true
  console.log('Video loaded and ready')
}

onMounted(() => {
  // Ensure video plays (some browsers block autoplay)
  videoRef.value?.play().catch(error => {
    console.warn('Autoplay prevented:', error)
  })
})
</script>
```

### Lazy-loaded Video with Intersection Observer

```vue
<template>
  <section class="hero relative h-screen">
    <div ref="videoContainerRef" class="absolute inset-0">
      <video
        v-if="shouldLoadVideo"
        ref="videoRef"
        class="w-full h-full object-cover"
        autoplay
        muted
        loop
        playsinline
        :poster="posterImage"
      >
        <source :src="videoSource" type="video/mp4">
      </video>

      <!-- Poster image while video loads -->
      <NuxtImg
        v-else
        :src="posterImage"
        alt="Video poster"
        class="w-full h-full object-cover"
        loading="eager"
        fetchpriority="high"
      />
    </div>

    <div class="relative z-10">
      <!-- Hero content -->
    </div>
  </section>
</template>

<script setup lang="ts">
const videoContainerRef = ref<HTMLElement>()
const videoRef = ref<HTMLVideoElement>()
const shouldLoadVideo = ref(false)

const posterImage = '/images/hero-poster.jpg'
const videoSource = '/videos/hero.mp4'

const { stop } = useIntersectionObserver(
  videoContainerRef,
  ([entry]) => {
    if (entry.isIntersecting) {
      shouldLoadVideo.value = true
      stop() // Stop observing once loaded
    }
  },
  {
    threshold: 0.5, // Load when 50% visible
  }
)
</script>
```

### YouTube Embed with Lazy Loading

```bash
pnpm add nuxt-lazytube
```

Add to `/Users/vladislavcaraseli/Documents/MoldovaDirect/nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    // ... existing modules
    'nuxt-lazytube'
  ]
})
```

Usage:

```vue
<template>
  <section class="hero">
    <LazyTube
      video-id="dQw4w9WgXcQ"
      :width="1920"
      :height="1080"
      thumbnail-quality="maxresdefault"
      :show-title="false"
    />
  </section>
</template>
```

### Video Optimization Best Practices

1. **Use modern formats** - WebM (VP9) for Chrome, MP4 (H.264) fallback
2. **Compress videos** - Use tools like HandBrake or FFmpeg
3. **Limit file size** - Keep under 5MB for hero videos
4. **Provide poster images** - Shows while video loads
5. **Mute by default** - Autoplay with sound often blocked
6. **Use playsinline** - Prevents fullscreen on iOS
7. **Lazy load below fold** - Only load when needed
8. **Consider connection speed** - Use reduced motion or static images on slow connections

### FFmpeg Compression Commands

```bash
# Compress MP4 for web
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 128k output.mp4

# Convert to WebM
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus output.webm

# Generate poster image
ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 poster.jpg
```

---

## 4. Intersection Observer API

### VueUse useIntersectionObserver

Your project already has `@vueuse/core` v13.9.0 installed.

#### Basic Scroll Animation Trigger

```vue
<template>
  <div ref="target" class="transition-all duration-700" :class="{
    'opacity-100 translate-y-0': targetIsVisible,
    'opacity-0 translate-y-20': !targetIsVisible
  }">
    <h2>Animated on scroll</h2>
    <p>This content fades in when scrolled into view</p>
  </div>
</template>

<script setup lang="ts">
const target = ref<HTMLElement>()
const targetIsVisible = ref(false)

const { stop } = useIntersectionObserver(
  target,
  ([entry]) => {
    if (entry.isIntersecting) {
      targetIsVisible.value = true
      // Optionally stop observing after first trigger
      // stop()
    }
  },
  {
    threshold: 0.3, // Trigger when 30% visible
  }
)
</script>
```

#### Reveal-on-Scroll Composable

Create `/Users/vladislavcaraseli/Documents/MoldovaDirect/composables/useRevealOnScroll.ts`:

```typescript
export const useRevealOnScroll = (options?: {
  threshold?: number
  once?: boolean
}) => {
  const elementRef = ref<HTMLElement>()
  const isVisible = ref(false)

  const { threshold = 0.3, once = true } = options || {}

  const { stop } = useIntersectionObserver(
    elementRef,
    ([entry]) => {
      if (entry.isIntersecting) {
        isVisible.value = true
        if (once) {
          stop()
        }
      } else if (!once) {
        isVisible.value = false
      }
    },
    { threshold }
  )

  return {
    elementRef,
    isVisible,
    stop
  }
}
```

Usage:

```vue
<template>
  <div
    ref="elementRef"
    class="transition-all duration-700"
    :class="{
      'opacity-100 scale-100': isVisible,
      'opacity-0 scale-90': !isVisible
    }"
  >
    Content revealed on scroll
  </div>
</template>

<script setup lang="ts">
const { elementRef, isVisible } = useRevealOnScroll({
  threshold: 0.5,
  once: true
})
</script>
```

#### Multiple Elements with Staggered Animation

```vue
<template>
  <section class="grid grid-cols-3 gap-8">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      :ref="el => setItemRef(el, index)"
      class="card transition-all duration-700"
      :style="{
        transitionDelay: `${index * 100}ms`
      }"
      :class="{
        'opacity-100 translate-y-0': visibleItems.has(index),
        'opacity-0 translate-y-20': !visibleItems.has(index)
      }"
    >
      {{ item.title }}
    </div>
  </section>
</template>

<script setup lang="ts">
const items = ref([
  { id: 1, title: 'Item 1' },
  { id: 2, title: 'Item 2' },
  { id: 3, title: 'Item 3' },
])

const itemRefs = ref<HTMLElement[]>([])
const visibleItems = ref(new Set<number>())

const setItemRef = (el: any, index: number) => {
  if (el) {
    itemRefs.value[index] = el
  }
}

onMounted(() => {
  itemRefs.value.forEach((element, index) => {
    useIntersectionObserver(
      ref(element),
      ([entry]) => {
        if (entry.isIntersecting) {
          visibleItems.value.add(index)
        }
      },
      { threshold: 0.5 }
    )
  })
})
</script>
```

#### Advanced: Progress-based Animation

```vue
<template>
  <div ref="sectionRef" class="relative h-screen">
    <div
      class="sticky top-0 transition-all"
      :style="{
        opacity: scrollProgress,
        transform: `scale(${0.8 + scrollProgress * 0.2})`
      }"
    >
      <h2>Scroll Progress: {{ Math.round(scrollProgress * 100) }}%</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
const sectionRef = ref<HTMLElement>()
const scrollProgress = ref(0)

useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    if (entry.isIntersecting) {
      const rect = entry.boundingClientRect
      const windowHeight = window.innerHeight

      // Calculate progress (0 to 1)
      const elementTop = rect.top
      const elementHeight = rect.height

      if (elementTop < windowHeight && elementTop > -elementHeight) {
        scrollProgress.value = Math.max(
          0,
          Math.min(1, 1 - elementTop / windowHeight)
        )
      }
    }
  },
  {
    threshold: Array.from({ length: 101 }, (_, i) => i / 100) // 0, 0.01, 0.02, ..., 1
  }
)
</script>
```

#### Intersection Observer with VueUse Motion

```vue
<template>
  <div
    ref="elementRef"
    v-motion
    :initial="{ opacity: 0, y: 100 }"
    :enter="animationState"
  >
    Combines Intersection Observer with VueUse Motion
  </div>
</template>

<script setup lang="ts">
const elementRef = ref<HTMLElement>()
const animationState = ref({ opacity: 0, y: 100 })

useIntersectionObserver(
  elementRef,
  ([entry]) => {
    if (entry.isIntersecting) {
      animationState.value = {
        opacity: 1,
        y: 0,
        transition: { duration: 800, ease: 'easeOut' }
      }
    }
  },
  { threshold: 0.5 }
)
</script>
```

---

## 5. Tailwind CSS Animation Utilities

### Built-in Tailwind Animations

```vue
<template>
  <!-- Spin Animation -->
  <div class="animate-spin">
    <LoadingIcon />
  </div>

  <!-- Ping Animation -->
  <div class="relative">
    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
    <span class="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
  </div>

  <!-- Pulse Animation -->
  <div class="animate-pulse bg-slate-200 h-4 rounded"></div>

  <!-- Bounce Animation -->
  <div class="animate-bounce">
    <ArrowDownIcon />
  </div>
</template>
```

### Custom Keyframe Animations (Tailwind v4)

Your project uses Tailwind CSS v4. Add custom animations to `/Users/vladislavcaraseli/Documents/MoldovaDirect/assets/css/tailwind.css`:

```css
@import "tailwindcss";

@theme {
  /* Custom Animation Variables */
  --animate-fade-in: fade-in 1s ease-out;
  --animate-slide-up: slide-up 0.6s ease-out;
  --animate-slide-down: slide-down 0.6s ease-out;
  --animate-slide-left: slide-left 0.6s ease-out;
  --animate-slide-right: slide-right 0.6s ease-out;
  --animate-zoom-in: zoom-in 0.5s ease-out;
  --animate-wiggle: wiggle 1s ease-in-out infinite;
  --animate-float: float 3s ease-in-out infinite;
  --animate-gradient: gradient 3s ease infinite;
}

/* Keyframe Definitions */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-left {
  from {
    opacity: 0;
    transform: translateX(2rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-right {
  from {
    opacity: 0;
    transform: translateX(-2rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes zoom-in {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes wiggle {
  0%, 100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
```

Usage in components:

```vue
<template>
  <!-- Using custom animations -->
  <div class="animate-[fade-in]">Fades in</div>
  <div class="animate-[slide-up]">Slides up</div>
  <div class="animate-[zoom-in]">Zooms in</div>
  <div class="animate-[wiggle]">Wiggles continuously</div>
  <div class="animate-[float]">Floats up and down</div>

  <!-- With delays -->
  <div class="animate-[fade-in] delay-100">Delayed fade</div>
  <div class="animate-[slide-up] delay-200">Delayed slide</div>

  <!-- With custom duration -->
  <div class="animate-[fade-in] duration-1000">Slow fade</div>
</template>
```

### Transition Utilities for Hero Sections

```vue
<template>
  <section class="hero relative overflow-hidden">
    <!-- Background with transition -->
    <div
      class="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900
             transition-all duration-1000 ease-out"
      :class="{ 'scale-110': isLoaded }"
    >
      <NuxtImg src="/hero-bg.jpg" alt="Background" class="w-full h-full object-cover opacity-50" />
    </div>

    <!-- Content with staggered transitions -->
    <div class="relative z-10 flex items-center justify-center h-screen">
      <div class="text-center text-white">
        <h1
          class="text-6xl font-bold mb-6
                 transition-all duration-700 ease-out
                 transform"
          :class="{
            'opacity-100 translate-y-0': isLoaded,
            'opacity-0 translate-y-12': !isLoaded
          }"
        >
          Welcome to Moldova Direct
        </h1>

        <p
          class="text-2xl mb-8
                 transition-all duration-700 ease-out delay-200
                 transform"
          :class="{
            'opacity-100 translate-y-0': isLoaded,
            'opacity-0 translate-y-12': !isLoaded
          }"
        >
          Discover authentic Moldovan products
        </p>

        <div
          class="flex gap-4 justify-center
                 transition-all duration-700 ease-out delay-400
                 transform"
          :class="{
            'opacity-100 scale-100': isLoaded,
            'opacity-0 scale-90': !isLoaded
          }"
        >
          <UiButton size="lg">Shop Now</UiButton>
          <UiButton variant="outline" size="lg">Learn More</UiButton>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const isLoaded = ref(false)

onMounted(() => {
  // Trigger animations after mount
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
</script>
```

### Animated Gradient Background

```vue
<template>
  <section class="hero h-screen relative">
    <div
      class="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600
             bg-[length:200%_200%]
             animate-[gradient]"
    />

    <div class="relative z-10 flex items-center justify-center h-full text-white">
      <h1 class="text-6xl font-bold">Animated Gradient Hero</h1>
    </div>
  </section>
</template>
```

### Hover Animations

```vue
<template>
  <div class="grid grid-cols-3 gap-6">
    <!-- Scale on hover -->
    <div class="card transition-transform duration-300 hover:scale-105">
      Hover to scale
    </div>

    <!-- Lift on hover -->
    <div class="card transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      Hover to lift
    </div>

    <!-- Rotate on hover -->
    <div class="card transition-transform duration-300 hover:rotate-3">
      Hover to rotate
    </div>

    <!-- Glow on hover -->
    <div class="card transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]">
      Hover to glow
    </div>

    <!-- Color shift on hover -->
    <div class="card bg-blue-500 transition-colors duration-300 hover:bg-purple-500">
      Hover to change color
    </div>

    <!-- Multiple effects -->
    <div class="card transition-all duration-300
                hover:scale-105 hover:-translate-y-1 hover:shadow-xl
                hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500">
      Multiple effects
    </div>
  </div>
</template>
```

### Scroll-based Animations with CSS

```vue
<template>
  <section ref="sectionRef" class="relative min-h-screen">
    <div
      class="sticky top-20 transition-all duration-500"
      :style="{
        opacity: scrollOpacity,
        transform: `translateY(${scrollOffset}px)`
      }"
    >
      <h2>Scroll-based Animation</h2>
    </div>
  </section>
</template>

<script setup lang="ts">
const sectionRef = ref<HTMLElement>()
const scrollOpacity = ref(1)
const scrollOffset = ref(0)

const { y } = useWindowScroll()

watch(y, (newY) => {
  if (sectionRef.value) {
    const rect = sectionRef.value.getBoundingClientRect()
    const sectionTop = rect.top + newY
    const progress = Math.max(0, Math.min(1, (newY - sectionTop) / 500))

    scrollOpacity.value = 1 - progress
    scrollOffset.value = progress * 100
  }
})
</script>
```

---

## 6. Performance Optimization (LCP, CLS)

### Core Web Vitals Targets (2025)

- **LCP (Largest Contentful Paint)**: < 2.5s
- **CLS (Cumulative Layout Shift)**: < 0.1
- **INP (Interaction to Next Paint)**: < 200ms (replaced FID in 2024)

### LCP Optimization for Hero Sections

#### 1. Optimize Hero Image Loading

```vue
<template>
  <section class="hero h-screen relative">
    <!-- Optimized hero image -->
    <NuxtImg
      src="/images/hero-main.jpg"
      alt="Moldova Direct - Authentic Moldovan Products"
      width="1920"
      height="1080"
      format="webp"
      quality="85"
      loading="eager"
      fetchpriority="high"
      preload
      sizes="100vw"
      class="absolute inset-0 w-full h-full object-cover"
      @load="onImageLoad"
    />

    <!-- Content overlay -->
    <div class="relative z-10 flex items-center justify-center h-full">
      <div class="text-center text-white max-w-4xl px-4">
        <h1 class="text-5xl md:text-7xl font-bold mb-6">
          Discover Moldovan Heritage
        </h1>
        <p class="text-xl md:text-2xl mb-8">
          Premium wines and traditional products
        </p>
        <UiButton size="lg">Explore Products</UiButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const onImageLoad = () => {
  console.log('Hero image loaded - LCP candidate')
}
</script>
```

#### 2. Font Optimization

Install `@nuxt/fonts`:

```bash
pnpm add -D @nuxt/fonts
```

Add to `/Users/vladislavcaraseli/Documents/MoldovaDirect/nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    // ... existing modules
    '@nuxt/fonts'
  ],

  fonts: {
    families: [
      { name: 'Inter', provider: 'google' },
      { name: 'Playfair Display', provider: 'google' }
    ],
    defaults: {
      weights: [400, 600, 700],
      styles: ['normal'],
      preload: true
    }
  }
})
```

#### 3. Resource Hints

Add to `/Users/vladislavcaraseli/Documents/MoldovaDirect/app.vue` or specific pages:

```vue
<script setup>
useHead({
  link: [
    // Preload critical hero image
    {
      rel: 'preload',
      as: 'image',
      href: '/images/hero-main.webp',
      type: 'image/webp',
      fetchpriority: 'high'
    },
    // Preconnect to external domains
    {
      rel: 'preconnect',
      href: 'https://images.unsplash.com'
    },
    {
      rel: 'dns-prefetch',
      href: 'https://images.unsplash.com'
    }
  ]
})
</script>
```

#### 4. Critical CSS Inlining

Nuxt 3 automatically inlines critical CSS. Verify in your build output.

#### 5. Lazy Load Below-the-Fold Content

```vue
<template>
  <div>
    <!-- Hero (above fold) - eager loading -->
    <section class="hero h-screen">
      <NuxtImg
        src="/hero.jpg"
        loading="eager"
        fetchpriority="high"
        preload
      />
    </section>

    <!-- Secondary content (below fold) - lazy loading -->
    <section class="features">
      <NuxtImg
        src="/feature-1.jpg"
        loading="lazy"
      />
      <NuxtImg
        src="/feature-2.jpg"
        loading="lazy"
      />
    </section>
  </div>
</template>
```

### CLS Optimization

#### 1. Always Specify Image Dimensions

```vue
<template>
  <!-- ✅ GOOD - Prevents CLS -->
  <NuxtImg
    src="/hero.jpg"
    width="1920"
    height="1080"
    alt="Hero"
    class="w-full h-auto"
  />

  <!-- ❌ BAD - Causes CLS -->
  <img src="/hero.jpg" alt="Hero" class="w-full">
</template>
```

#### 2. Reserve Space for Dynamic Content

```vue
<template>
  <div class="hero relative h-screen">
    <!-- Skeleton/placeholder with exact dimensions -->
    <div
      v-if="!imageLoaded"
      class="absolute inset-0 bg-gray-200 animate-pulse"
      style="aspect-ratio: 16/9;"
    />

    <!-- Actual image -->
    <NuxtImg
      v-show="imageLoaded"
      src="/hero.jpg"
      width="1920"
      height="1080"
      alt="Hero"
      @load="imageLoaded = true"
      class="absolute inset-0 w-full h-full object-cover"
    />
  </div>
</template>

<script setup lang="ts">
const imageLoaded = ref(false)
</script>
```

#### 3. Avoid Layout Shifts from Fonts

```vue
<template>
  <h1 class="font-display" style="font-display: swap;">
    Hero Title
  </h1>
</template>
```

Add to `/Users/vladislavcaraseli/Documents/MoldovaDirect/assets/css/tailwind.css`:

```css
@import "tailwindcss";

/* Prevent CLS from font loading */
.font-display {
  font-display: swap;
}

/* Match fallback font metrics */
@font-face {
  font-family: 'Inter Fallback';
  src: local('Arial');
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
  size-adjust: 107%;
}
```

#### 4. Use `aspect-ratio` for Media

```vue
<template>
  <!-- Maintains aspect ratio during load -->
  <div class="relative w-full" style="aspect-ratio: 16/9;">
    <NuxtImg
      src="/video-poster.jpg"
      alt="Video poster"
      class="absolute inset-0 w-full h-full object-cover"
    />
  </div>
</template>
```

### Performance Monitoring Composable

Create `/Users/vladislavcaraseli/Documents/MoldovaDirect/composables/usePerformanceMetrics.ts`:

```typescript
export const usePerformanceMetrics = () => {
  const metrics = ref({
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    ttfb: 0
  })

  onMounted(() => {
    if (typeof window === 'undefined') return

    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        metrics.value.lcp = lastEntry.renderTime || lastEntry.loadTime
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // CLS (Cumulative Layout Shift)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            metrics.value.cls = clsValue
          }
        }
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // FCP (First Contentful Paint)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
        if (fcpEntry) {
          metrics.value.fcp = fcpEntry.startTime
        }
      })
      fcpObserver.observe({ entryTypes: ['paint'] })
    }

    // TTFB (Time to First Byte)
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      metrics.value.ttfb = navigationEntry.responseStart - navigationEntry.requestStart
    }
  })

  return { metrics }
}
```

Usage:

```vue
<template>
  <div>
    <h1>Performance Metrics</h1>
    <ul>
      <li>LCP: {{ metrics.lcp.toFixed(2) }}ms</li>
      <li>CLS: {{ metrics.cls.toFixed(3) }}</li>
      <li>FCP: {{ metrics.fcp.toFixed(2) }}ms</li>
      <li>TTFB: {{ metrics.ttfb.toFixed(2) }}ms</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const { metrics } = usePerformanceMetrics()
</script>
```

### Route-based Optimization

Update `/Users/vladislavcaraseli/Documents/MoldovaDirect/nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  routeRules: {
    // Prerender landing page with hero
    '/': { prerender: true },

    // ISR for product pages
    '/products': { swr: 3600 },
    '/products/**': { swr: 3600 },

    // SPA mode for dashboard
    '/account/**': { ssr: false }
  }
})
```

---

## 7. Accessibility Best Practices

### WCAG 2.2 Compliance (2025 Standard)

Referenced in 4,605 ADA lawsuits in 2024 - compliance is both legal and ethical.

### Semantic HTML Structure

```vue
<template>
  <!-- ✅ GOOD - Semantic HTML -->
  <header class="site-header">
    <nav aria-label="Main navigation">
      <!-- Navigation items -->
    </nav>
  </header>

  <main id="main-content">
    <section class="hero" aria-labelledby="hero-heading">
      <h1 id="hero-heading" class="text-6xl font-bold">
        Welcome to Moldova Direct
      </h1>
      <p class="text-xl">
        Authentic Moldovan products delivered to Spain
      </p>
      <a href="/products" class="btn btn-primary">
        Explore Products
      </a>
    </section>

    <section class="features" aria-labelledby="features-heading">
      <h2 id="features-heading" class="sr-only">
        Our Features
      </h2>
      <!-- Features content -->
    </section>
  </main>

  <footer class="site-footer">
    <!-- Footer content -->
  </footer>
</template>
```

### ARIA Labels and Roles

```vue
<template>
  <section
    class="hero"
    role="region"
    aria-labelledby="hero-title"
  >
    <!-- Hero image with proper alt text -->
    <NuxtImg
      src="/hero.jpg"
      alt="Moldovan vineyard with traditional wine barrels at sunset"
      role="img"
      aria-label="Scenic Moldovan vineyard landscape"
    />

    <!-- Hero content -->
    <div class="hero-content">
      <h1 id="hero-title">
        Discover Moldovan Heritage
      </h1>

      <!-- Call-to-action with descriptive aria-label -->
      <a
        href="/products"
        class="cta-button"
        aria-label="Explore our collection of Moldovan wines and products"
      >
        Shop Now
        <span aria-hidden="true">→</span>
      </a>
    </div>

    <!-- Decorative elements hidden from screen readers -->
    <div class="decorative-pattern" aria-hidden="true">
      <!-- SVG patterns -->
    </div>
  </section>
</template>
```

### Skip to Main Content Link

```vue
<template>
  <div>
    <!-- Skip link (appears on focus) -->
    <a
      href="#main-content"
      class="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
             focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded"
    >
      Skip to main content
    </a>

    <header>
      <!-- Header content -->
    </header>

    <main id="main-content" tabindex="-1">
      <!-- Main content -->
    </main>
  </div>
</template>
```

Add to `/Users/vladislavcaraseli/Documents/MoldovaDirect/assets/css/tailwind.css`:

```css
/* Screen reader only - accessible but visually hidden */
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

.sr-only:not(.focus\:not-sr-only:focus) {
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

### Color Contrast Requirements

**WCAG 2.2 AA Standard:**
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+ or 14pt+ bold): 3:1 contrast ratio

```vue
<template>
  <section class="hero bg-blue-900 text-white">
    <!-- ✅ GOOD - High contrast (white on dark blue) -->
    <h1 class="text-white">
      Welcome to Moldova Direct
    </h1>

    <!-- ✅ GOOD - Sufficient contrast for large text -->
    <p class="text-blue-100 text-xl">
      Premium Moldovan products
    </p>

    <!-- ❌ BAD - Insufficient contrast (light gray on white) -->
    <!-- <p class="text-gray-300">This is hard to read</p> -->
  </section>
</template>
```

### Keyboard Navigation

```vue
<template>
  <section class="hero">
    <!-- Focusable interactive elements -->
    <button
      class="cta-button focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"
      @click="handleClick"
      @keydown.enter="handleClick"
      @keydown.space.prevent="handleClick"
    >
      Explore Products
    </button>

    <!-- Custom interactive element -->
    <div
      role="button"
      tabindex="0"
      class="custom-control focus:outline-none focus:ring-4 focus:ring-blue-500"
      @click="handleAction"
      @keydown.enter="handleAction"
      @keydown.space.prevent="handleAction"
      aria-label="Open product gallery"
    >
      View Gallery
    </div>
  </section>
</template>

<script setup lang="ts">
const handleClick = () => {
  // Handle button click
}

const handleAction = () => {
  // Handle custom action
}
</script>
```

### Focus Management

```vue
<template>
  <div>
    <!-- Focus trap for modal/dialog -->
    <div
      v-if="isModalOpen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      class="modal"
      @keydown.esc="closeModal"
    >
      <div ref="modalRef">
        <h2 id="modal-title">Modal Title</h2>

        <button @click="closeModal" aria-label="Close modal">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isModalOpen = ref(false)
const modalRef = ref<HTMLElement>()

watch(isModalOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      // Focus first focusable element in modal
      const firstFocusable = modalRef.value?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      firstFocusable?.focus()
    })
  }
})

const closeModal = () => {
  isModalOpen.value = false
}
</script>
```

### Video Accessibility

```vue
<template>
  <section class="hero">
    <video
      class="hero-video"
      autoplay
      muted
      loop
      playsinline
      aria-label="Background video showing Moldovan vineyards"
    >
      <source src="/videos/hero.mp4" type="video/mp4">
      <track
        kind="captions"
        src="/videos/hero-captions.vtt"
        srclang="en"
        label="English captions"
      >
    </video>

    <!-- Video controls for accessibility -->
    <div class="video-controls" role="group" aria-label="Video controls">
      <button
        @click="togglePlay"
        :aria-label="isPlaying ? 'Pause video' : 'Play video'"
      >
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>

      <button
        @click="toggleMute"
        :aria-label="isMuted ? 'Unmute video' : 'Mute video'"
      >
        {{ isMuted ? 'Unmute' : 'Mute' }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
const isPlaying = ref(true)
const isMuted = ref(true)

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
}
</script>
```

### Reduced Motion Preference

```vue
<template>
  <section class="hero">
    <div
      v-motion
      :initial="{ opacity: 0, y: prefersReducedMotion ? 0 : 100 }"
      :enter="{
        opacity: 1,
        y: 0,
        transition: {
          duration: prefersReducedMotion ? 0 : 800
        }
      }"
    >
      Respects user's motion preferences
    </div>
  </section>
</template>

<script setup lang="ts">
const prefersReducedMotion = useReducedMotion()
</script>
```

Create `/Users/vladislavcaraseli/Documents/MoldovaDirect/composables/useReducedMotion.ts`:

```typescript
export const useReducedMotion = () => {
  const prefersReducedMotion = ref(false)

  onMounted(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      prefersReducedMotion.value = mediaQuery.matches

      // Listen for changes
      const handler = (e: MediaQueryListEvent) => {
        prefersReducedMotion.value = e.matches
      }

      mediaQuery.addEventListener('change', handler)

      onUnmounted(() => {
        mediaQuery.removeEventListener('change', handler)
      })
    }
  })

  return prefersReducedMotion
}
```

CSS approach:

```css
/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Touch Target Size

```vue
<template>
  <section class="hero">
    <!-- ✅ GOOD - Minimum 44x44px touch target -->
    <button class="min-h-[44px] min-w-[44px] px-6 py-3 text-lg">
      Shop Now
    </button>

    <!-- ✅ GOOD - Adequate spacing between targets -->
    <div class="flex gap-4">
      <button class="min-h-[44px] min-w-[44px]">Button 1</button>
      <button class="min-h-[44px] min-w-[44px]">Button 2</button>
    </div>
  </section>
</template>
```

### Accessible Forms in Hero CTAs

```vue
<template>
  <section class="hero">
    <form @submit.prevent="handleSubmit" aria-labelledby="newsletter-heading">
      <h2 id="newsletter-heading" class="text-2xl font-bold mb-4">
        Subscribe to Our Newsletter
      </h2>

      <div class="form-group">
        <label for="email-input" class="block mb-2">
          Email Address
          <span aria-label="required" class="text-red-500">*</span>
        </label>

        <input
          id="email-input"
          v-model="email"
          type="email"
          required
          aria-required="true"
          aria-invalid="emailError ? 'true' : 'false'"
          aria-describedby="email-error email-hint"
          class="form-control"
          placeholder="your@email.com"
        />

        <span id="email-hint" class="text-sm text-gray-600">
          We'll never share your email
        </span>

        <span
          v-if="emailError"
          id="email-error"
          class="text-red-500 text-sm"
          role="alert"
        >
          {{ emailError }}
        </span>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        :aria-busy="isSubmitting"
        class="btn btn-primary"
      >
        <span v-if="!isSubmitting">Subscribe</span>
        <span v-else>
          <span class="sr-only">Submitting...</span>
          <span aria-hidden="true">⏳</span>
        </span>
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
const email = ref('')
const emailError = ref('')
const isSubmitting = ref(false)

const handleSubmit = async () => {
  // Form submission logic
}
</script>
```

### Live Regions for Dynamic Content

```vue
<template>
  <section class="hero">
    <!-- Announce dynamic updates to screen readers -->
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ statusMessage }}
    </div>

    <!-- Alert for critical updates -->
    <div
      v-if="criticalError"
      role="alert"
      aria-live="assertive"
      class="alert alert-error"
    >
      {{ criticalError }}
    </div>
  </section>
</template>

<script setup lang="ts">
const statusMessage = ref('')
const criticalError = ref('')

// Update status message
const updateStatus = (message: string) => {
  statusMessage.value = message
}

// Example: Announce image load
const onImageLoad = () => {
  updateStatus('Hero image loaded successfully')
}
</script>
```

---

## Complete Hero Section Example

Bringing it all together:

```vue
<template>
  <section
    class="hero relative h-screen overflow-hidden"
    role="region"
    aria-labelledby="hero-heading"
  >
    <!-- Skip to main content -->
    <a
      href="#main-content"
      class="skip-link sr-only focus:not-sr-only"
    >
      Skip to main content
    </a>

    <!-- Optimized background image -->
    <NuxtPicture
      src="/images/hero-moldovan-vineyard.jpg"
      alt="Panoramic view of Moldovan vineyard with traditional wine cellar at golden hour"
      width="1920"
      height="1080"
      format="avif,webp"
      :imgAttrs="{
        loading: 'eager',
        fetchpriority: 'high',
        class: 'absolute inset-0 w-full h-full object-cover'
      }"
      preload
    />

    <!-- Gradient overlay -->
    <div
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{
        opacity: 0.6,
        transition: { duration: prefersReducedMotion ? 0 : 1000 }
      }"
      class="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"
      aria-hidden="true"
    />

    <!-- Main content -->
    <div class="relative z-10 flex items-center justify-center h-full px-4">
      <div class="text-center text-white max-w-4xl">
        <!-- Heading with animation -->
        <h1
          id="hero-heading"
          v-motion
          :initial="{ opacity: 0, y: prefersReducedMotion ? 0 : 100 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              duration: prefersReducedMotion ? 0 : 800,
              ease: 'easeOut'
            }
          }"
          class="text-5xl md:text-7xl font-bold mb-6"
        >
          Discover Authentic Moldovan Heritage
        </h1>

        <!-- Subtitle with staggered animation -->
        <p
          v-motion
          :initial="{ opacity: 0, y: prefersReducedMotion ? 0 : 50 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              duration: prefersReducedMotion ? 0 : 600,
              delay: prefersReducedMotion ? 0 : 300,
              ease: 'easeOut'
            }
          }"
          class="text-xl md:text-2xl mb-8 text-gray-100"
        >
          Premium wines and traditional products from Moldova, delivered to Spain
        </p>

        <!-- CTAs with animation -->
        <div
          v-motion
          :initial="{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.8 }"
          :enter="{
            opacity: 1,
            scale: 1,
            transition: {
              duration: prefersReducedMotion ? 0 : 500,
              delay: prefersReducedMotion ? 0 : 600,
              type: 'spring',
              stiffness: 200
            }
          }"
          class="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <UiButton
            as="a"
            href="/products"
            size="lg"
            class="min-h-[44px] min-w-[44px]"
            aria-label="Explore our collection of Moldovan products"
          >
            Explore Products
          </UiButton>

          <UiButton
            as="a"
            href="/about"
            variant="outline"
            size="lg"
            class="min-h-[44px] min-w-[44px] border-white text-white hover:bg-white hover:text-blue-900"
            aria-label="Learn more about Moldova Direct and our story"
          >
            Learn More
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Decorative Lottie animation (hidden from screen readers) -->
    <client-only>
      <div
        class="absolute bottom-10 right-10 opacity-30"
        aria-hidden="true"
      >
        <Vue3Lottie
          animationLink="/animations/wine-glass.json"
          :height="200"
          :width="200"
          :loop="true"
          :autoPlay="!prefersReducedMotion"
        />
      </div>
    </client-only>

    <!-- Scroll indicator -->
    <button
      @click="scrollToContent"
      class="absolute bottom-8 left-1/2 -translate-x-1/2
             text-white animate-bounce
             focus:outline-none focus:ring-4 focus:ring-white/50 rounded-full p-2"
      aria-label="Scroll down to view products"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    </button>
  </section>
</template>

<script setup lang="ts">
// Composables
const prefersReducedMotion = useReducedMotion()
const { metrics } = usePerformanceMetrics()

// Scroll to content function
const scrollToContent = () => {
  const mainContent = document.getElementById('main-content')
  if (mainContent) {
    mainContent.scrollIntoView({ behavior: 'smooth' })
    mainContent.focus()
  }
}

// SEO meta tags
useHead({
  title: 'Moldova Direct - Authentic Moldovan Products',
  meta: [
    {
      name: 'description',
      content: 'Discover premium Moldovan wines and traditional products. Authentic heritage delivered to Spain.'
    },
    {
      property: 'og:title',
      content: 'Moldova Direct - Authentic Moldovan Products'
    },
    {
      property: 'og:description',
      content: 'Premium wines and traditional products from Moldova'
    },
    {
      property: 'og:image',
      content: '/images/og-hero.jpg'
    }
  ],
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: '/images/hero-moldovan-vineyard.webp',
      type: 'image/webp',
      fetchpriority: 'high'
    }
  ]
})
</script>

<style scoped>
.skip-link {
  @apply fixed top-4 left-4 z-50 bg-white text-blue-900 px-4 py-2 rounded shadow-lg;
}
</style>
```

---

## Summary & Best Practices Checklist

### Performance
- [ ] Use `NuxtImg` with `loading="eager"` and `fetchpriority="high"` for hero images
- [ ] Specify width and height to prevent CLS
- [ ] Enable `preload` for critical images
- [ ] Use WebP/AVIF formats with quality 80-85
- [ ] Optimize fonts with `@nuxt/fonts`
- [ ] Lazy load below-the-fold content
- [ ] Monitor Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms)

### Animations
- [ ] Use `@vueuse/motion` for simple animations (already installed)
- [ ] Implement GSAP + ScrollTrigger for complex scroll animations
- [ ] Respect `prefers-reduced-motion` user preference
- [ ] Clean up animations/observers on component unmount
- [ ] Use Lottie for illustrative animations (lightweight JSON)
- [ ] Leverage Tailwind transitions for hover/focus states

### Accessibility
- [ ] Use semantic HTML (`<header>`, `<main>`, `<section>`)
- [ ] Provide descriptive `alt` text for all images
- [ ] Maintain 4.5:1 color contrast for normal text
- [ ] Ensure 44x44px minimum touch target size
- [ ] Add skip to main content link
- [ ] Support keyboard navigation
- [ ] Use ARIA labels appropriately (but prefer semantic HTML)
- [ ] Test with screen readers (NVDA, VoiceOver, JAWS)

### Video
- [ ] Provide poster images
- [ ] Compress videos to < 5MB
- [ ] Mute by default for autoplay
- [ ] Add `playsinline` for iOS
- [ ] Lazy load below-the-fold videos
- [ ] Provide captions/transcripts

This guide provides production-ready code examples specifically tailored to your Nuxt 3 project configuration and installed dependencies.
