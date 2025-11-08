<template>
  <div class="luxury-video-hero">
    <!-- Video Background - Desktop Only for Performance -->
    <video
      v-if="shouldShowVideo && !reducedMotion && !isMobile"
      ref="videoRef"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      poster="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2070&auto=format&fit=crop"
      class="hero-video"
      :class="{ 'opacity-0': !videoLoaded, 'opacity-85': videoLoaded }"
      @loadeddata="onVideoLoaded"
      @error="onVideoError"
      @canplay="onVideoCanPlay"
    >
      <source
        src="https://assets.mixkit.co/videos/preview/mixkit-wine-bottles-in-a-vineyard-during-sunset-46664-large.mp4"
        type="video/mp4"
      >
    </video>

    <!-- Fallback Image - Mobile, Reduced Motion, or Video Error -->
    <div v-if="showFallbackImage" class="fallback-image">
      <NuxtImg
        src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2070&auto=format&fit=crop"
        alt="Moldovan vineyard at golden hour"
        class="w-full h-full object-cover"
        :loading="isMobile ? 'eager' : 'lazy'"
        :preload="isMobile"
        @error="handleImageError($event, 'landscape')"
      />
    </div>

    <!-- Dark Overlay -->
    <div class="luxury-video-overlay" />

    <!-- Hero Content -->
    <div class="luxury-hero-content px-4 sm:px-6 lg:px-8">
      <div
        v-motion
        :initial="{ opacity: 0, y: 40 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 300, duration: 1000 } }"
        class="max-w-4xl mx-auto"
      >
        <p class="luxury-eyebrow text-white mb-4 md:mb-6 text-xs md:text-sm">
          {{ $t('luxury.hero.eyebrow') || 'Artisan Heritage Since 1950' }}
        </p>

        <h1 class="luxury-headline text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 md:mb-6 leading-tight">
          {{ $t('luxury.hero.title') || 'From Moldovan Soil to Spanish Tables' }}
        </h1>

        <p class="luxury-subhead text-white/90 text-base sm:text-lg md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto">
          {{ $t('luxury.hero.subtitle') || 'Curated wines and gourmet treasures from the heart of Moldova' }}
        </p>

        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <NuxtLink
            to="/products"
            class="luxury-btn text-sm md:text-base px-6 py-3 md:px-8 md:py-4 w-full sm:w-auto text-center min-h-[48px] flex items-center justify-center"
          >
            {{ $t('luxury.hero.cta_primary') || 'Discover Our Story' }}
          </NuxtLink>
          <NuxtLink
            to="/products?filter=featured"
            class="luxury-btn luxury-btn-dark text-sm md:text-base px-6 py-3 md:px-8 md:py-4 w-full sm:w-auto text-center min-h-[48px] flex items-center justify-center"
          >
            {{ $t('luxury.hero.cta_secondary') || 'Shop Collection' }}
          </NuxtLink>
        </div>
      </div>

      <!-- Scroll Indicator - Hidden on mobile -->
      <div
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { delay: 1500, duration: 800 } }"
        class="absolute bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2 hidden sm:block"
      >
        <div class="animate-luxury-pulse">
          <svg
            class="w-6 h-6 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { handleImageError } = useImageFallback()

const videoRef = ref<HTMLVideoElement | null>(null)
const reducedMotion = ref(false)
const videoLoaded = ref(false)
const videoError = ref(false)
const isMobile = ref(false)
const shouldShowVideo = ref(false)

// Check device type and reduced motion preference
onMounted(() => {
  if (typeof window !== 'undefined') {
    // Check for mobile device (< 768px)
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.value = mediaQuery.matches

    // Only load video on desktop after a short delay (improves LCP)
    if (!isMobile.value && !reducedMotion.value) {
      setTimeout(() => {
        shouldShowVideo.value = true
      }, 100)
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }
})

// Computed property to determine if fallback image should be shown
const showFallbackImage = computed(() => {
  return isMobile.value || reducedMotion.value || videoError.value || !shouldShowVideo.value
})

// Video event handlers
const onVideoLoaded = () => {
  videoLoaded.value = true
  if (process.client) {
    console.info('Hero video loaded successfully')
  }
}

const onVideoCanPlay = () => {
  // Ensure video plays on modern browsers
  if (videoRef.value) {
    videoRef.value.play().catch((err) => {
      console.warn('Video autoplay failed:', err)
      // Fallback to image if autoplay is blocked
      videoError.value = true
    })
  }
}

const onVideoError = (event: Event) => {
  console.error('Hero video failed to load, using fallback image')
  videoError.value = true

  // Hide the broken video element
  if (videoRef.value) {
    videoRef.value.style.display = 'none'
  }
}
</script>

<style scoped>
.hero-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  object-fit: cover;
  transition: opacity 0.6s ease-in-out;
}

.opacity-0 {
  opacity: 0;
}

.opacity-85 {
  opacity: 0.85;
}

.fallback-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.luxury-eyebrow {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--luxury-black);
}

/* Mobile viewport optimization */
@media (max-width: 640px) {
  .luxury-video-hero {
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height for mobile browsers */
  }
}
</style>
