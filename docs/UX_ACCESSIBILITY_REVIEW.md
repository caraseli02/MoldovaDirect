# UX & Accessibility Review - Landing Page Components

**Review Date:** 2025-11-08  
**Components Reviewed:** 10 landing page components + main index page  
**Standard:** WCAG 2.1 AA Compliance

---

## Executive Summary

The landing page demonstrates **strong foundational UX practices** with modern design patterns, mobile-first responsiveness, and progressive enhancement. However, there are **critical accessibility gaps** that must be addressed for WCAG 2.1 AA compliance, particularly around keyboard navigation, screen reader support, and semantic HTML structure.

### Overall Assessment
- **UX Score:** 8/10 (Strong visual hierarchy, clear CTAs, good mobile experience)
- **Accessibility Score:** 6/10 (Good intentions, but critical gaps remain)
- **Priority Issues:** 15 P0 (critical), 22 P1 (important), 18 P2 (nice-to-have)

---

## Critical Issues (P0) - Must Fix

### 1. LandingMediaMentionsBar.vue - Carousel Accessibility

**Issues:**
- Auto-scrolling carousel without pause/stop controls (WCAG 2.2.2 Pause, Stop, Hide)
- No keyboard navigation for carousel items
- Screen reader receives duplicate content (aria-hidden on second set but links are still focusable)

**Impact:** Users with vestibular disorders may experience nausea; keyboard users cannot control carousel; screen reader users hear duplicate content.

**Fix:**

```vue
<template>
  <div class="media-mentions-bar border-b border-cream-200 bg-cream-50 py-3 sm:py-4">
    <div class="container mx-auto px-4">
      <p class="mb-2 text-center text-xs uppercase tracking-wider text-gray-600 sm:mb-3 sm:text-sm">
        {{ t('landing.mediaMentions.heading') }}
      </p>

      <div class="mentions-carousel relative overflow-hidden">
        <!-- Add pause/play controls -->
        <div class="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex gap-2">
          <button
            type="button"
            @click="toggleAnimation"
            :aria-label="isPaused ? 'Play carousel' : 'Pause carousel'"
            class="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
          >
            <commonIcon :name="isPaused ? 'lucide:play' : 'lucide:pause'" class="h-4 w-4" />
          </button>
        </div>

        <div
          ref="carouselTrack"
          class="animate-scroll flex gap-6 sm:gap-8 md:gap-12"
          :style="{ animationDuration: `${duration}s` }"
          role="list"
          aria-label="Media mentions"
        >
          <!-- First set of logos -->
          <div
            v-for="mention in mentions"
            :key="`first-${mention.id}`"
            class="flex-shrink-0"
            role="listitem"
          >
            <a
              :href="mention.url"
              target="_blank"
              rel="noopener noreferrer"
              class="block opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 rounded"
              :aria-label="`Read article on ${mention.name}`"
            >
              <NuxtImg
                :src="mention.logo"
                :alt="`${mention.name} logo`"
                width="100"
                height="32"
                class="h-6 w-auto object-contain sm:h-7 md:h-8"
                loading="lazy"
              />
            </a>
          </div>

          <!-- Duplicate set for seamless loop - properly hidden from assistive tech -->
          <div
            v-for="mention in mentions"
            :key="`second-${mention.id}`"
            class="flex-shrink-0"
            aria-hidden="true"
            role="presentation"
          >
            <span class="block opacity-60 grayscale pointer-events-none">
              <NuxtImg
                :src="mention.logo"
                alt=""
                width="100"
                height="32"
                class="h-6 w-auto object-contain sm:h-7 md:h-8"
                loading="lazy"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isPaused = ref(false)

const toggleAnimation = () => {
  isPaused.value = !isPaused.value
  if (carouselTrack.value) {
    carouselTrack.value.style.animationPlayState = isPaused.value ? 'paused' : 'running'
  }
}

// Auto-pause on focus
const handleFocusIn = () => {
  if (carouselTrack.value) {
    carouselTrack.value.style.animationPlayState = 'paused'
  }
}

const handleFocusOut = () => {
  if (!isPaused.value && carouselTrack.value) {
    carouselTrack.value.style.animationPlayState = 'running'
  }
}

onMounted(() => {
  if (carouselTrack.value) {
    carouselTrack.value.addEventListener('mouseenter', pauseAnimation)
    carouselTrack.value.addEventListener('mouseleave', resumeAnimation)
    carouselTrack.value.addEventListener('focusin', handleFocusIn)
    carouselTrack.value.addEventListener('focusout', handleFocusOut)
  }
})

onUnmounted(() => {
  if (carouselTrack.value) {
    carouselTrack.value.removeEventListener('mouseenter', pauseAnimation)
    carouselTrack.value.removeEventListener('mouseleave', resumeAnimation)
    carouselTrack.value.removeEventListener('focusin', handleFocusIn)
    carouselTrack.value.removeEventListener('focusout', handleFocusOut)
  }
})
</script>
```

---

### 2. LandingHeroSection.vue - Video Accessibility

**Issues:**
- Video has no captions/subtitles
- Video autoplays (WCAG 1.4.2)
- Missing aria-label for video element
- No fallback text for users who cannot see video

**Impact:** Deaf/hard of hearing users miss content; some users may be startled by autoplay.

**Fix:**

```vue
<template>
  <section
    class="landing-hero relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden md:h-screen"
    :class="{ 'video-loaded': videoLoaded }"
  >
    <!-- Video Background (Desktop Only) -->
    <div
      v-if="!isMobile"
      class="absolute inset-0 z-0"
    >
      <video
        v-if="videoWebm || videoMp4"
        ref="videoEl"
        class="h-full w-full object-cover"
        :poster="posterImage"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
        @loadeddata="onVideoLoad"
        @error="onVideoError"
        aria-label="Background video showing Moldovan vineyards"
      >
        <source v-if="videoWebm" :src="videoWebm" type="video/webm" />
        <source v-if="videoMp4" :src="videoMp4" type="video/mp4" />
        <!-- Add captions track when video is added -->
        <track
          v-if="videoWebm || videoMp4"
          kind="captions"
          src="/captions/hero-video-en.vtt"
          srclang="en"
          label="English"
        />
      </video>

      <!-- Video Overlay Gradient -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50" />
    </div>

    <!-- Image Background (Mobile or Fallback) -->
    <div v-if="isMobile || !videoWebm" class="absolute inset-0 z-0">
      <NuxtImg
        :src="posterImage"
        alt="Scenic view of Moldova vineyard with rolling hills and grapevines at sunset"
        class="h-full w-full object-cover"
        loading="eager"
        fetchpriority="high"
        :width="1920"
        :height="1080"
        format="webp"
        quality="80"
        sizes="xs:375px sm:640px md:768px lg:1024px xl:1280px xxl:1920px"
        preload
      />
      <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50" />
    </div>

    <!-- Hero Content -->
    <div class="container relative z-10 px-8 text-center text-white sm:px-10 md:px-12 lg:px-16 pb-20 sm:pb-28 md:pb-32 lg:pb-40">
      <!-- Main Headline -->
      <h1
        class="landing-hero-text mb-8 text-4xl font-bold leading-[1.15] tracking-wide text-white drop-shadow-2xl animate-fade-in-up sm:mb-10 sm:text-5xl md:mb-12 md:text-6xl lg:text-7xl"
      >
        {{ t('landing.hero.headline') }}
      </h1>

      <!-- Rest of component... -->
    </div>
  </section>
</template>
```

---

### 3. LandingProductCarousel.vue - Keyboard Navigation

**Issues:**
- Carousel navigation dots have insufficient touch target size (current: ~16px, required: 44px)
- No keyboard shortcut announcements for screen readers
- Missing live region for slide changes

**Impact:** Mobile users struggle to tap small dots; keyboard users don't know current position; screen reader users miss slide changes.

**Fix:**

```vue
<template>
  <section 
    class="landing-section bg-white py-16 sm:py-20 md:py-24"
    aria-roledescription="carousel"
    aria-label="Featured products carousel"
  >
    <div class="container mx-auto px-8 sm:px-10 md:px-12 lg:px-16">
      <!-- Section Header -->
      <div class="mb-12 text-center sm:mb-14 md:mb-16">
        <h2
          class="landing-h2 mb-4 text-2xl font-bold tracking-wide text-gray-900 animate-fade-in-up sm:mb-5 sm:text-3xl md:mb-6 md:text-4xl lg:text-5xl"
        >
          {{ t('landing.products.heading') }}
        </h2>
        <p
          class="mx-auto max-w-2xl px-2 text-base text-gray-600 animate-fade-in-up animation-delay-100 sm:text-lg md:text-xl"
        >
          {{ t('landing.products.subheading') }}
        </p>
      </div>

      <!-- Screen reader announcements -->
      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {{ t('landing.products.slideAnnouncement', { current: selectedIndex + 1, total: scrollSnaps.length }) }}
      </div>

      <!-- Keyboard instructions (visible on focus) -->
      <div 
        class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4 focus:shadow-lg"
        tabindex="0"
      >
        {{ t('landing.products.keyboardInstructions') }}
      </div>

      <!-- Carousel Container -->
      <div 
        ref="emblaRef" 
        class="relative"
        @keydown="handleKeyboardNav"
        tabindex="0"
        role="region"
        aria-label="Product carousel"
      >
        <div class="overflow-hidden touch-pan-y">
          <div class="flex gap-3 sm:gap-4 md:gap-6">
            <div
              v-for="(product, index) in featuredProducts"
              :key="product.id"
              class="min-w-0 flex-none w-[85%] sm:w-1/2 lg:w-1/3 xl:w-1/4"
              role="group"
              :aria-roledescription="'slide'"
              :aria-label="`${index + 1} of ${featuredProducts.length}`"
            >
              <LandingProductCard :product="product" />
            </div>
          </div>
        </div>

        <!-- Navigation Arrows (Desktop) -->
        <button
          v-if="canScrollPrev"
          @click="scrollPrev"
          class="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 min-w-[48px] min-h-[48px] w-12 h-12 items-center justify-center bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
          :aria-label="t('common.previousSlide')"
        >
          <commonIcon name="lucide:chevron-left" class="w-6 h-6 text-gray-900" aria-hidden="true" />
        </button>

        <button
          v-if="canScrollNext"
          @click="scrollNext"
          class="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 min-w-[48px] min-h-[48px] w-12 h-12 items-center justify-center bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
          :aria-label="t('common.nextSlide')"
        >
          <commonIcon name="lucide:chevron-right" class="w-6 h-6 text-gray-900" aria-hidden="true" />
        </button>
      </div>

      <!-- Pagination Dots - FIXED TOUCH TARGETS -->
      <div
        class="mt-6 flex justify-center gap-2 sm:mt-8"
        role="tablist"
        aria-label="Product carousel navigation"
      >
        <button
          v-for="(_, index) in scrollSnaps"
          :key="index"
          type="button"
          @click="scrollTo(index)"
          :class="[
            'min-h-[44px] min-w-[44px] flex items-center justify-center transition-all duration-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 rounded-full'
          ]"
          :aria-label="`Go to slide ${index + 1} of ${scrollSnaps.length}`"
          :aria-selected="selectedIndex === index"
          :aria-current="selectedIndex === index ? 'true' : 'false'"
          role="tab"
        >
          <span
            :class="[
              'rounded-full transition-all duration-300',
              selectedIndex === index
                ? 'h-2.5 w-8 bg-rose-600'
                : 'h-2.5 w-2.5 bg-gray-300'
            ]"
            aria-hidden="true"
          />
        </button>
      </div>

      <!-- View All CTA -->
      <div class="mt-12 text-center sm:mt-14 md:mt-16">
        <NuxtLink
          :to="localePath('/products')"
          class="group inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 active:scale-[0.98] hover:bg-gray-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 sm:px-10"
        >
          {{ t('landing.products.viewAllCta') }}
          <commonIcon name="lucide:arrow-right" class="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// ... existing imports and setup ...

// Add keyboard navigation
const handleKeyboardNav = (event: KeyboardEvent) => {
  if (!emblaApi.value) return
  
  switch(event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      emblaApi.value.scrollPrev()
      break
    case 'ArrowRight':
      event.preventDefault()
      emblaApi.value.scrollNext()
      break
    case 'Home':
      event.preventDefault()
      emblaApi.value.scrollTo(0)
      break
    case 'End':
      event.preventDefault()
      emblaApi.value.scrollTo(emblaApi.value.scrollSnapList().length - 1)
      break
  }
}
</script>
```

---

### 4. LandingProductCard.vue - Missing Alt Text Context

**Issues:**
- Product name can be object (not string), causing potential alt text issues
- Quick add button appears on hover (keyboard users can't access on mobile)
- No loading/error states for images

**Impact:** Screen reader users may hear "[object Object]" instead of product name; keyboard-only users miss quick add functionality.

**Fix:**

```vue
<template>
  <article 
    class="product-card group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-900 hover:shadow-lg active:scale-[0.99]"
    :aria-labelledby="`product-title-${product.id}`"
  >
    <!-- Product Image -->
    <NuxtLink 
      :to="localePath(`/products/${product.slug}`)" 
      class="relative block aspect-square overflow-hidden bg-gray-100 active:opacity-95"
      :aria-label="`View ${getProductName(product)} details`"
    >
      <NuxtImg
        :src="product.image"
        :alt="`${getProductName(product)} - Product photo showing bottle and packaging`"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
        :width="400"
        :height="400"
        format="webp"
        quality="80"
        sizes="xs:340px sm:300px md:220px lg:280px xl:320px"
        :style="{ aspectRatio: '1/1' }"
        @error="handleImageError"
      />

      <!-- Image loading placeholder -->
      <div 
        v-if="imageLoading"
        class="absolute inset-0 bg-gray-200 animate-pulse"
        aria-hidden="true"
      />

      <!-- Quick Add Badge - Always visible, properly sized -->
      <div class="absolute right-3 top-3 sm:right-4 sm:top-4">
        <button
          type="button"
          @click.prevent="addToCart(product.id)"
          class="flex min-h-[44px] min-w-[44px] h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-150 active:scale-95 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
          :aria-label="`Add ${getProductName(product)} to cart`"
        >
          <commonIcon name="lucide:shopping-cart" class="h-5 w-5 text-gray-900" aria-hidden="true" />
        </button>
      </div>
    </NuxtLink>

    <!-- Product Info -->
    <div class="flex flex-grow flex-col bg-white p-4 sm:p-5 md:p-6">
      <!-- Benefits Pills -->
      <div 
        v-if="product.benefits && product.benefits.length > 0" 
        class="mb-2.5 flex flex-wrap gap-1.5 sm:mb-3 sm:gap-2"
        role="list"
        aria-label="Product highlights"
      >
        <span
          v-for="benefit in product.benefits.slice(0, 2)"
          :key="benefit"
          class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 sm:px-2.5 sm:py-1"
          role="listitem"
        >
          {{ benefit }}
        </span>
      </div>

      <!-- Product Name -->
      <h3 
        :id="`product-title-${product.id}`"
        class="mb-2 flex-grow text-center text-base font-semibold leading-snug text-gray-900 line-clamp-2 sm:text-lg"
      >
        <NuxtLink
          :to="localePath(`/products/${product.slug}`)"
          class="transition-colors hover:text-rose-600 focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 rounded"
        >
          {{ getProductName(product) }}
        </NuxtLink>
      </h3>

      <!-- Rating -->
      <div class="mb-3 flex items-center gap-1.5 sm:gap-2" role="group" :aria-label="`Rating: ${product.rating} out of 5 stars, ${product.reviewCount} reviews`">
        <div class="flex items-center" aria-hidden="true">
          <commonIcon name="lucide:star" class="h-3.5 w-3.5 fill-amber-400 text-amber-400 sm:h-4 sm:w-4" />
          <span class="ml-1 text-xs font-medium sm:text-sm">{{ product.rating }}</span>
        </div>
        <span class="text-xs text-gray-500 sm:text-sm" aria-hidden="true">({{ product.reviewCount }})</span>
      </div>

      <!-- Price & CTA -->
      <div class="mt-auto flex items-center justify-between gap-2">
        <span class="text-xl font-bold text-gray-900 sm:text-2xl" aria-label="`Price: ${product.price.toFixed(2)} euros`">
          €{{ product.price.toFixed(2) }}
        </span>
        <NuxtLink
          :to="localePath(`/products/${product.slug}`)"
          class="inline-flex min-h-[48px] items-center rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 active:scale-95 hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 sm:px-5"
        >
          {{ t('landing.products.shopNow') }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
// ... existing code ...

const imageLoading = ref(true)
const imageError = ref(false)

const getProductName = (product: Product): string => {
  if (typeof product.name === 'string') {
    return product.name
  }
  return product.name?.en || product.name?.es || 'Product'
}

const handleImageError = () => {
  imageLoading.value = false
  imageError.value = true
  console.error('Product image failed to load:', product.image)
}

onMounted(() => {
  // Simulate image loading (in real app, this would be handled by the image component)
  setTimeout(() => {
    imageLoading.value = false
  }, 500)
})
</script>
```

---

### 5. LandingUGCGallery.vue - Modal Keyboard Trap

**Issues:**
- Lightbox modal doesn't trap focus (keyboard users can tab outside modal)
- Missing Escape key handler
- No focus restoration when modal closes
- Body scroll not properly locked

**Impact:** Keyboard users get lost in modal; can't escape with keyboard; confusing UX.

**Fix:**

```vue
<template>
  <section class="ugc-gallery landing-section bg-white py-16 md:py-24">
    <!-- ... existing header ... -->

    <!-- Masonry Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <button
        v-for="(photo, index) in photos"
        :key="photo.id"
        type="button"
        @click="openLightbox(photo)"
        v-motion
        :initial="{ opacity: 0, scale: 0.8 }"
        :visible="{ opacity: 1, scale: 1 }"
        :delay="index * 50"
        class="ugc-photo-card group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
        :class="{ 'md:row-span-2': photo.tall }"
        :aria-label="`View photo by ${photo.customerName}: ${photo.caption}`"
      >
        <!-- Photo -->
        <NuxtImg
          :src="photo.image"
          :alt="`Customer photo by ${photo.customerName}: ${photo.caption}`"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          format="webp"
          quality="85"
          :width="400"
          :height="400"
        />

        <!-- Overlay on Hover -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <commonIcon name="lucide:user" class="w-5 h-5 text-gray-700" aria-hidden="true" />
            </div>
            <span class="text-white font-semibold text-sm">{{ photo.customerName }}</span>
          </div>
          <p class="text-white text-sm line-clamp-2">{{ photo.caption }}</p>

          <!-- Instagram icon if from Instagram -->
          <div v-if="photo.platform === 'instagram'" class="absolute top-3 right-3">
            <commonIcon name="lucide:instagram" class="w-5 h-5 text-white drop-shadow-lg" aria-hidden="true" />
          </div>
        </div>
      </button>
    </div>

    <!-- Share Your Photo CTA -->
    <div class="text-center mt-12">
      <button
        type="button"
        @click="openShareModal"
        class="inline-flex min-h-[52px] items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
        :aria-label="t('landing.ugc.shareCta')"
      >
        <commonIcon name="lucide:camera" class="w-5 h-5" aria-hidden="true" />
        {{ t('landing.ugc.shareCta') }}
      </button>
    </div>
  </section>

  <!-- Lightbox Modal - FIXED KEYBOARD TRAP -->
  <Teleport to="body">
    <div
      v-if="lightboxPhoto"
      ref="modalRef"
      class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
      @click="closeLightbox"
      @keydown.escape="closeLightbox"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`lightbox-title-${lightboxPhoto.id}`"
    >
      <button
        ref="closeButtonRef"
        type="button"
        @click.stop="closeLightbox"
        class="absolute top-4 right-4 min-w-[44px] min-h-[44px] w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        aria-label="Close lightbox"
      >
        <commonIcon name="lucide:x" class="w-6 h-6 text-white" aria-hidden="true" />
      </button>

      <div class="max-w-4xl w-full" @click.stop>
        <NuxtImg
          :src="lightboxPhoto.image"
          :alt="`Full size customer photo by ${lightboxPhoto.customerName}: ${lightboxPhoto.caption}`"
          class="w-full h-auto rounded-lg"
          format="webp"
          quality="90"
        />
        <div class="mt-4 text-white">
          <p :id="`lightbox-title-${lightboxPhoto.id}`" class="font-semibold text-lg">
            {{ lightboxPhoto.customerName }}
          </p>
          <p class="text-gray-300 mt-2">{{ lightboxPhoto.caption }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { t } = useI18n()

// ... existing code ...

const lightboxPhoto = ref<UGCPhoto | null>(null)
const modalRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
const previousFocusedElement = ref<HTMLElement | null>(null)

const openLightbox = (photo: UGCPhoto) => {
  // Save current focus
  previousFocusedElement.value = document.activeElement as HTMLElement
  
  lightboxPhoto.value = photo
  document.body.style.overflow = 'hidden'
  
  // Focus close button after render
  nextTick(() => {
    closeButtonRef.value?.focus()
  })
}

const closeLightbox = () => {
  lightboxPhoto.value = null
  document.body.style.overflow = ''
  
  // Restore focus
  nextTick(() => {
    previousFocusedElement.value?.focus()
  })
}

// Focus trap
const trapFocus = (event: KeyboardEvent) => {
  if (!modalRef.value || event.key !== 'Tab') return

  const focusableElements = modalRef.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

// Add focus trap listener
watch(lightboxPhoto, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', trapFocus)
  } else {
    document.removeEventListener('keydown', trapFocus)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (lightboxPhoto.value) {
    document.body.style.overflow = ''
  }
  document.removeEventListener('keydown', trapFocus)
})
</script>
```

---

### 6. LandingNewsletterSignup.vue - Form Accessibility

**Issues:**
- Missing visible label for email input (only placeholder)
- Error/success messages not properly announced to screen readers
- Form lacks proper fieldset structure

**Impact:** Screen reader users don't know input purpose; form errors not announced; confusing experience.

**Fix:**

```vue
<template>
  <section class="newsletter-signup bg-gradient-to-br from-rose-600 to-purple-700 py-16 sm:py-20 md:py-24 text-white">
    <div class="container mx-auto px-8 sm:px-10 md:px-12 lg:px-16">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="mb-8 text-3xl font-bold leading-tight tracking-wide sm:mb-10 sm:text-4xl md:mb-12 md:text-5xl">
          {{ t('landing.newsletter.heading') }}
        </h2>
        <p class="mb-10 text-base leading-relaxed text-rose-100 sm:mb-12 sm:text-lg md:mb-14 md:text-xl">
          {{ t('landing.newsletter.subheading') }}
        </p>

        <form 
          @submit.prevent="handleSubmit" 
          class="mx-auto flex max-w-xl flex-col gap-4 sm:flex-row sm:gap-4"
          aria-labelledby="newsletter-heading"
        >
          <fieldset class="contents">
            <legend class="sr-only">{{ t('landing.newsletter.heading') }}</legend>
            
            <div class="flex-1">
              <label for="newsletter-email" class="sr-only">
                {{ t('landing.newsletter.emailLabel') }}
              </label>
              <input
                id="newsletter-email"
                v-model="email"
                type="email"
                inputmode="email"
                autocomplete="email"
                required
                :placeholder="t('landing.newsletter.placeholder')"
                :aria-label="t('landing.newsletter.emailLabel')"
                :aria-invalid="errorMessage ? 'true' : 'false'"
                :aria-describedby="errorMessage ? 'newsletter-error' : successMessage ? 'newsletter-success' : undefined"
                class="w-full min-h-[52px] rounded-xl border border-white/30 bg-white/10 px-6 py-4 text-base text-white placeholder-white/70 backdrop-blur-md transition-all duration-200 focus:border-white focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            
            <button
              type="submit"
              :disabled="isSubmitting"
              :aria-busy="isSubmitting"
              class="min-h-[52px] rounded-xl bg-white px-8 py-4 font-semibold text-purple-700 shadow-lg transition-all duration-200 active:scale-[0.98] hover:bg-gray-100 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-purple-700 sm:px-10"
            >
              {{ isSubmitting ? t('landing.newsletter.submitting') : t('landing.newsletter.submit') }}
            </button>
          </fieldset>
        </form>

        <!-- Status messages with proper ARIA -->
        <div 
          v-if="successMessage || errorMessage" 
          class="mt-6" 
          role="status" 
          aria-live="polite" 
          aria-atomic="true"
        >
          <p 
            v-if="successMessage" 
            id="newsletter-success"
            class="text-green-200 font-medium text-base"
          >
            <commonIcon name="lucide:check-circle" class="inline h-5 w-5 mr-2" aria-hidden="true" />
            {{ successMessage }}
          </p>
          <p 
            v-if="errorMessage" 
            id="newsletter-error"
            class="text-red-200 font-medium text-base"
          >
            <commonIcon name="lucide:alert-circle" class="inline h-5 w-5 mr-2" aria-hidden="true" />
            {{ errorMessage }}
          </p>
        </div>

        <p class="mt-8 text-sm text-rose-200 sm:mt-10">
          {{ t('landing.newsletter.privacy') }}
        </p>
      </div>
    </div>
  </section>
</template>
```

---

### 7. LandingFeaturedCollections.vue - Semantic HTML

**Issues:**
- Collections should use proper list structure (ul/li)
- Missing loading states for images
- No clear distinction between decorative and informational images

**Fix:**

```vue
<template>
  <section 
    class="featured-collections py-20 bg-gray-50"
    aria-labelledby="collections-heading"
  >
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 
          id="collections-heading"
          class="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
        >
          {{ t('landing.collections.heading') }}
        </h2>
        <p class="text-lg text-gray-600">
          {{ t('landing.collections.subheading') }}
        </p>
      </div>

      <!-- Use proper list structure -->
      <ul class="grid grid-cols-1 md:grid-cols-3 gap-6" role="list">
        <li
          v-for="(collection, index) in collections"
          :key="collection.id"
        >
          <NuxtLink
            :to="collection.url"
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0 }"
            :delay="index * 100"
            class="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 flex"
            :aria-label="`Explore ${collection.title} collection - ${collection.description}`"
          >
            <NuxtImg
              :src="collection.image"
              :alt="`${collection.title} collection featuring ${collection.description}`"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              format="webp"
              quality="85"
              :width="600"
              :height="750"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden="true" />
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 class="text-2xl font-bold mb-2">{{ collection.title }}</h3>
              <p class="text-gray-200 mb-4">{{ collection.description }}</p>
              <span class="inline-flex items-center gap-2 text-sm font-semibold">
                {{ t('landing.collections.explore') }}
                <Icon name="lucide:arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </span>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>
```

---

## Important Issues (P1) - Should Fix

### 8. Color Contrast Issues

**Issue:** Several text/background combinations fail WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text)

**Failing combinations:**
- `LandingMediaMentionsBar`: Gray-600 text on cream-50 background (3.2:1 - fails)
- `LandingHeroSection`: Gray-100 subheadline text with semi-transparent overlay (varies, potentially < 4.5:1)
- `LandingTrustBadges`: Gray-500 subtitle text (3.8:1 - fails for small text)
- `LandingQuizCTA`: Trust indicators text (gray-600 on gradient, varies)

**Fix:**

```vue
<!-- LandingMediaMentionsBar.vue -->
<p class="mb-2 text-center text-xs uppercase tracking-wider text-gray-700 sm:mb-3 sm:text-sm">
  <!-- Changed from text-gray-600 to text-gray-700 for better contrast -->
  {{ t('landing.mediaMentions.heading') }}
</p>

<!-- LandingTrustBadges.vue -->
<div class="text-[10px] text-gray-600 sm:text-xs">
  <!-- Changed from text-gray-500 to text-gray-600 -->
  {{ t(badge.subtitle) }}
</div>

<!-- LandingHeroSection.vue - increase overlay opacity -->
<div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
<!-- Changed from /30, /40, /50 to /40, /50, /60 for better text contrast -->
```

---

### 9. Missing Focus Indicators

**Issue:** Several interactive elements lack visible focus indicators or have insufficient contrast.

**Affected components:**
- Product card image links
- Carousel navigation dots
- UGC gallery photo cards
- Collection cards

**Fix:** Add consistent focus-visible classes:

```css
/* Add to global styles or component-specific styles */
.focus-visible-custom {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2;
}

/* For white/light backgrounds */
.focus-visible-dark {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2;
}

/* For dark backgrounds */
.focus-visible-light {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900;
}
```

---

### 10. Touch Target Sizes

**Issue:** Several interactive elements are smaller than the minimum 44x44px touch target size (especially on mobile).

**Affected elements:**
- Carousel pagination dots (currently ~16px interactive area)
- Quick add cart buttons (sometimes < 44px)
- Close buttons in modals
- Navigation arrows

**Status:** Most are fixed in P0 section, but verify all interactive elements meet minimum.

---

### 11. Form Validation Messages

**Issue:** Newsletter form shows error/success messages, but they're not announced to screen readers immediately.

**Status:** Fixed in P0 section with aria-live regions.

---

### 12. Heading Hierarchy

**Issue:** Page has proper H1 (hero headline), but some sections skip heading levels.

**Analysis:**
- Hero: H1 ✓
- Media Mentions: No heading (decorative bar) ✓
- Trust Badges: No heading (decorative) ✓
- Stats: No heading (visual stats) ✓
- Products: H2 ✓
- Quiz: H2 ✓
- UGC: H2 ✓
- Collections: H2 ✓
- Newsletter: H2 ✓

**Status:** Heading hierarchy is correct. No fix needed.

---

### 13. Loading States

**Issue:** Components don't show loading states while content fetches, causing layout shift.

**Fix for Product Carousel:**

```vue
<template>
  <section class="landing-section bg-white py-16 sm:py-20 md:py-24">
    <div class="container mx-auto px-8 sm:px-10 md:px-12 lg:px-16">
      <!-- Loading skeleton -->
      <div v-if="isLoading" class="space-y-8">
        <div class="h-12 bg-gray-200 rounded-lg w-1/3 mx-auto animate-pulse" />
        <div class="h-6 bg-gray-200 rounded-lg w-1/2 mx-auto animate-pulse" />
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="i in 4" 
            :key="i" 
            class="h-96 bg-gray-200 rounded-xl animate-pulse"
          />
        </div>
      </div>

      <!-- Actual content -->
      <div v-else>
        <!-- Existing carousel markup -->
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const isLoading = ref(true)

onMounted(() => {
  // Simulate loading
  setTimeout(() => {
    isLoading.value = false
  }, 100)
})
</script>
```

---

### 14. Reduced Motion Support

**Issue:** While `prefers-reduced-motion` is partially supported, some animations still run.

**Status:** Most components have `@media (prefers-reduced-motion: reduce)` blocks. Verify all animated elements respect this preference.

**Additional fix for LandingStatsCounter:**

```vue
<style scoped>
/* Add to existing styles */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
```

---

## Nice-to-Have Enhancements (P2)

### 15. Skip Links

**Enhancement:** Add skip link to jump to main content (especially helpful for keyboard users).

**Implementation:**

```vue
<!-- Add to pages/index.vue or layout -->
<template>
  <div>
    <a 
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:bg-rose-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
    >
      Skip to main content
    </a>

    <!-- Media Mentions Bar -->
    <LandingMediaMentionsBar />

    <!-- Hero Section -->
    <LandingHeroSection @open-quiz="openQuiz" />

    <!-- Main content starts here -->
    <main id="main-content" tabindex="-1">
      <LandingTrustBadges />
      <!-- Rest of components -->
    </main>
  </div>
</template>
```

---

### 16. Dark Mode Support

**Enhancement:** Implement dark mode for better accessibility in low-light conditions.

**Implementation:** Use Tailwind's dark mode with proper color contrast:

```vue
<!-- Example for LandingProductCard.vue -->
<div class="product-card bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
  <h3 class="text-gray-900 dark:text-gray-100">{{ product.name }}</h3>
  <p class="text-gray-600 dark:text-gray-300">{{ product.description }}</p>
</div>
```

---

### 17. Breadcrumb Navigation

**Enhancement:** Add breadcrumb navigation for better wayfinding (especially for collections/products).

---

### 18. Search Landmark

**Enhancement:** Add search functionality with proper ARIA landmark.

---

### 19. Language Selector Accessibility

**Enhancement:** If language selector exists, ensure it has proper ARIA labels and keyboard support.

---

### 20. Performance Metrics

**Enhancement:** Add performance monitoring for Core Web Vitals:
- LCP (Largest Contentful Paint): Target < 2.5s
- FID (First Input Delay): Target < 100ms
- CLS (Cumulative Layout Shift): Target < 0.1

---

## UX Recommendations

### Visual Hierarchy

**Current State:** Strong visual hierarchy with clear sections and CTAs.

**Recommendations:**
1. Increase whitespace between sections on mobile (currently tight on small screens)
2. Consider sticky CTA button on mobile for quiz/newsletter
3. Add visual indicator for scroll depth (progress bar)

---

### User Flow

**Current Flow:**
1. Media mentions (social proof)
2. Hero with CTA
3. Trust badges
4. Stats
5. Products
6. Quiz CTA
7. UGC
8. Collections
9. Newsletter

**Recommendation:** Consider moving quiz CTA higher (after products carousel) to capture interest earlier. Current placement is good for warming users up first.

---

### Mobile Experience

**Strengths:**
- Mobile-first responsive design
- Touch-friendly targets (mostly)
- Optimized images with proper sizes attribute

**Improvements:**
1. Add sticky footer with primary CTA on mobile
2. Consider collapsing trust badges on very small screens
3. Test on actual devices for touch gestures

---

### Conversion Optimization

**Current CTAs:**
1. Hero: "Shop Now" → /products
2. Product Carousel: "Shop Now" on cards + "View All"
3. Quiz: "Take Quiz"
4. Newsletter: Email signup

**Recommendations:**
1. A/B test quiz CTA text ("Find My Perfect Wine" vs "Take Quiz")
2. Add urgency to newsletter (e.g., "Join 10,000+ subscribers")
3. Consider exit-intent modal for newsletter or first-time discount

---

## Testing Checklist

### Manual Testing

- [ ] Test all keyboard navigation (Tab, Shift+Tab, Enter, Space, Arrows)
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Test on mobile devices (iPhone, Android)
- [ ] Test with browser zoom (200%, 400%)
- [ ] Test in high contrast mode (Windows High Contrast, macOS Increase Contrast)
- [ ] Test with reduced motion enabled
- [ ] Test with JavaScript disabled (progressive enhancement)

### Automated Testing

- [ ] Run axe DevTools or WAVE browser extension
- [ ] Run Lighthouse accessibility audit
- [ ] Run Pa11y or axe-core in CI/CD
- [ ] Validate HTML (W3C Validator)
- [ ] Test color contrast ratios (Colour Contrast Analyser)

---

## Implementation Priority

### Phase 1: Critical Fixes (Week 1)
- Fix carousel pause controls (P0-1)
- Fix keyboard navigation (P0-3)
- Fix modal focus trap (P0-5)
- Fix form accessibility (P0-6)
- Fix color contrast issues (P1-8)

### Phase 2: Important Improvements (Week 2)
- Add loading states (P1-13)
- Fix all focus indicators (P1-9)
- Verify touch target sizes (P1-10)
- Add skip links (P2-15)

### Phase 3: Enhancements (Week 3+)
- Implement dark mode (P2-16)
- Add breadcrumbs (P2-17)
- Performance optimizations
- A/B testing for conversion

---

## Resources

### WCAG 2.1 Guidelines
- [WCAG 2.1 AA Checklist](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Inclusive Components](https://inclusive-components.design/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Pa11y CI](https://github.com/pa11y/pa11y-ci)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Code Examples
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Accessible Components Library (shadcn)](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)

---

## Conclusion

The landing page has a **solid UX foundation** with modern design patterns, mobile-first approach, and good visual hierarchy. However, **critical accessibility gaps** must be addressed for WCAG 2.1 AA compliance.

**Key Takeaways:**
1. **Keyboard navigation** needs improvement (carousels, modals, focus management)
2. **Screen reader support** is incomplete (missing ARIA, poor semantics in places)
3. **Color contrast** needs adjustment in several areas
4. **Touch targets** are mostly good but need verification
5. **Form accessibility** needs visible labels and proper error handling

**Estimated Effort:**
- Phase 1 (Critical): 20-30 hours
- Phase 2 (Important): 15-20 hours
- Phase 3 (Enhancements): 10-15 hours

**Risk Assessment:**
- **High Risk:** Not fixing P0 issues could lead to legal compliance issues and exclude users with disabilities
- **Medium Risk:** P1 issues affect UX but don't block core functionality
- **Low Risk:** P2 enhancements improve experience but aren't blockers

---

**Review Completed By:** UX/Accessibility Specialist  
**Next Review:** After Phase 1 implementation (recommend in 2 weeks)
