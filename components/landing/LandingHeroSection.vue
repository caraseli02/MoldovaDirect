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
      >
        <source v-if="videoWebm" :src="videoWebm" type="video/webm" />
        <source v-if="videoMp4" :src="videoMp4" type="video/mp4" />
      </video>

      <!-- Video Overlay Gradient -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50" />
    </div>

    <!-- Image Background (Mobile or Fallback) -->
    <div v-if="isMobile || !videoWebm" class="absolute inset-0 z-0">
      <NuxtImg
        :src="posterImage"
        alt="Moldova vineyard landscape"
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

      <!-- Subheadline -->
      <p
        class="mx-auto mb-12 max-w-2xl text-base leading-relaxed text-gray-100 drop-shadow-lg animate-fade-in-up animation-delay-100 sm:mb-14 sm:text-lg md:mb-16 md:text-xl"
      >
        {{ t('landing.hero.subheadline') }}
      </p>

      <!-- Primary CTA -->
      <div class="animate-fade-in-up animation-delay-200">
        <NuxtLink
          :to="localePath('/products')"
          class="btn-primary group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-rose-600 px-9 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 active:scale-[0.98] hover:bg-rose-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rose-600 sm:px-11 sm:py-4.5"
        >
          {{ t('landing.hero.primaryCta') }}
          <commonIcon name="lucide:arrow-right" class="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
        </NuxtLink>
      </div>

      <!-- Trust Indicators (Desktop Only, Subtle) -->
      <div
        class="mt-12 hidden items-center justify-center gap-5 text-sm text-gray-300/80 animate-fade-in animation-delay-300 sm:mt-14 sm:gap-6 md:mt-16 lg:flex"
      >
        <div class="flex items-center gap-2">
          <commonIcon name="lucide:shield-check" class="h-4 w-4 text-green-400/80" />
          <span class="whitespace-nowrap">{{ t('landing.hero.trustBadge1') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <commonIcon name="lucide:truck" class="h-4 w-4 text-blue-400/80" />
          <span class="whitespace-nowrap">{{ t('landing.hero.trustBadge2') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <commonIcon name="lucide:star" class="h-4 w-4 text-amber-400/80" />
          <span class="whitespace-nowrap">{{ t('landing.hero.trustBadge3') }}</span>
        </div>
      </div>
    </div>

    <!-- Scroll Indicator -->
    <div
      class="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 transform animate-fade-in animation-delay-400 sm:bottom-12"
    >
      <button
        type="button"
        class="flex flex-col items-center gap-2 text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        :aria-label="t('landing.hero.scrollHint')"
        @click="scrollToContent"
      >
        <span class="text-xs uppercase tracking-wider">{{ t('landing.hero.scrollHint') }}</span>
        <commonIcon name="lucide:chevron-down" class="h-6 w-6 animate-bounce" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const emit = defineEmits<{
  (e: 'open-quiz'): void
}>()

// Video sources - TODO: Replace with actual video files
// Video should be WebM format (<5MB), 15-30 seconds loop, 1920x1080
const videoWebm = ref<string | undefined>(undefined) // '/videos/hero-vineyard.webm'
const videoMp4 = ref<string | undefined>(undefined) // '/videos/hero-vineyard.mp4'
// TODO: Replace with self-hosted optimized image in /public/images/hero/
// Current: Using Unsplash (slow, external dependency)
// Recommended: /images/hero/moldova-vineyard-hero.webp (optimized, <200KB)
const posterImage = ref('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1920')

// Urgency badge removed for cleaner hero (see Iteration 1)

// Detect mobile
const isMobile = ref(false)
const videoLoaded = ref(false)
const videoEl = ref<HTMLVideoElement | null>(null)

onMounted(() => {
  // Check if mobile (no video on mobile for performance)
  isMobile.value = window.innerWidth < 768

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Listen for resize
  const handleResize = () => {
    const wasMobile = isMobile.value
    isMobile.value = window.innerWidth < 768

    // If switched from mobile to desktop, try to play video
    if (wasMobile && !isMobile.value && videoEl.value && !prefersReducedMotion) {
      videoEl.value.play().catch(console.error)
    }
  }

  window.addEventListener('resize', handleResize)

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})

const onVideoLoad = () => {
  videoLoaded.value = true
}

const onVideoError = (error: Event) => {
  console.error('Video failed to load:', error)
  // Fallback: show poster image (already shown as poster attribute)
}

const openQuiz = () => {
  emit('open-quiz')
}

const scrollToContent = () => {
  const heroHeight = window.innerHeight
  window.scrollTo({
    top: heroHeight,
    behavior: 'smooth'
  })
}
</script>

<style scoped>
/* ===== Performance-optimized animations ===== */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fast, GPU-accelerated animations */
.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: opacity, transform;
}

/* Stagger animation delays */
.animation-delay-100 {
  animation-delay: 0.1s;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-300 {
  animation-delay: 0.3s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

/* Ensure video covers full area */
video {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

/* Fade in video when loaded */
.landing-hero:not(.video-loaded) video {
  opacity: 0;
}

.landing-hero.video-loaded video {
  opacity: 1;
  transition: opacity 0.8s ease-in;
}

/* Enhanced button effects with better performance */
.btn-primary {
  box-shadow: 0 4px 14px 0 rgba(244, 63, 94, 0.39);
  will-change: transform;
}

.btn-primary:hover {
  box-shadow: 0 6px 20px rgba(244, 63, 94, 0.5);
}

.btn-primary:active,
.btn-secondary:active {
  transform: scale(0.98);
}

/* Improved text readability */
.landing-hero-text {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  line-height: 1.15;
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .animate-bounce {
    animation: none;
  }
}

/* Mobile-first responsive adjustments */
@media (max-width: 374px) {
  /* iPhone SE and smaller - more breathing room */
  .landing-hero {
    min-height: 540px;
  }

  .landing-hero-text {
    font-size: 1.75rem; /* Slightly smaller on tiny screens */
  }
}

@media (min-width: 375px) and (max-width: 640px) {
  /* Standard mobile phones */
  .landing-hero {
    min-height: 580px;
  }
}

/* Prevent horizontal scroll */
.landing-hero {
  overflow-x: hidden;
  position: relative;
}

/* Improve touch target feedback */
button,
a {
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0.1);
  touch-action: manipulation;
}

/* Better spacing on mobile */
@media (max-width: 640px) {
  .container {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}
</style>
