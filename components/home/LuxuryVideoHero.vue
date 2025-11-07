<template>
  <div class="luxury-video-hero">
    <!-- Video Background -->
    <video
      v-if="!reducedMotion"
      autoplay
      muted
      loop
      playsinline
      class="hero-video"
      @loadeddata="videoLoaded = true"
    >
      <source
        src="https://assets.mixkit.co/videos/preview/mixkit-wine-bottles-in-a-vineyard-during-sunset-46664-large.mp4"
        type="video/mp4"
      >
    </video>

    <!-- Fallback Image for Reduced Motion -->
    <div v-else class="fallback-image">
      <NuxtImg
        src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2070"
        alt="Moldovan vineyard at golden hour"
        class="w-full h-full object-cover"
        loading="eager"
        preload
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
const reducedMotion = ref(false)
const videoLoaded = ref(false)

// Check for reduced motion preference
onMounted(() => {
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.value = mediaQuery.matches
  }
})
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

/* Mobile-optimized hero */
@media (max-width: 640px) {
  .luxury-video-hero {
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height for mobile browsers */
  }

  .luxury-hero-content {
    padding-top: 80px; /* Account for fixed header */
  }
}

/* Tablet adjustments */
@media (min-width: 641px) and (max-width: 1024px) {
  .luxury-hero-content {
    padding-top: 100px;
  }
}
</style>
