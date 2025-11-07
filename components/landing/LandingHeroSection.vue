<template>
  <section
    class="landing-hero relative flex min-h-[600px] items-center justify-center overflow-hidden md:h-screen"
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
      />
      <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50" />
    </div>

    <!-- Hero Content -->
    <div class="container relative z-10 px-4 text-center text-white">
      <!-- Urgency Badge -->
      <div
        v-if="urgencyBadge"
        v-motion
        :initial="{ opacity: 0, scale: 0.8 }"
        :visible="{ opacity: 1, scale: 1 }"
        :delay="200"
        class="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm"
      >
        <commonIcon name="lucide:zap" class="h-4 w-4 text-amber-400" />
        <span>{{ urgencyBadge }}</span>
      </div>

      <!-- Main Headline -->
      <h1
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible="{ opacity: 1, y: 0 }"
        :delay="400"
        class="landing-hero-text mb-6 text-4xl font-bold tracking-tight text-white drop-shadow-2xl md:text-5xl lg:text-6xl"
      >
        {{ t('landing.hero.headline') }}
      </h1>

      <!-- Subheadline -->
      <p
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{ opacity: 1, y: 0 }"
        :delay="600"
        class="mx-auto mb-10 max-w-3xl text-xl text-gray-100 drop-shadow-lg md:text-2xl"
      >
        {{ t('landing.hero.subheadline') }}
      </p>

      <!-- CTAs -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{ opacity: 1, y: 0 }"
        :delay="800"
        class="flex flex-col items-center justify-center gap-4 sm:flex-row"
      >
        <!-- Primary CTA -->
        <NuxtLink
          :to="localePath('/products')"
          class="btn-primary inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-rose-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rose-600"
        >
          {{ t('landing.hero.primaryCta') }}
          <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
        </NuxtLink>

        <!-- Secondary CTA -->
        <button
          type="button"
          class="btn-secondary inline-flex min-h-[48px] items-center gap-2 rounded-lg border-2 border-white/50 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          @click="openQuiz"
        >
          <commonIcon name="lucide:sparkles" class="h-5 w-5" />
          {{ t('landing.hero.secondaryCta') }}
        </button>
      </div>

      <!-- Trust Indicators -->
      <div
        v-motion
        :initial="{ opacity: 0 }"
        :visible="{ opacity: 1 }"
        :delay="1000"
        class="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-200"
      >
        <div class="flex items-center gap-2">
          <commonIcon name="lucide:shield-check" class="h-5 w-5 text-green-400" />
          <span>{{ t('landing.hero.trustBadge1') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <commonIcon name="lucide:truck" class="h-5 w-5 text-blue-400" />
          <span>{{ t('landing.hero.trustBadge2') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <commonIcon name="lucide:star" class="h-5 w-5 text-amber-400" />
          <span>{{ t('landing.hero.trustBadge3') }}</span>
        </div>
      </div>
    </div>

    <!-- Scroll Indicator -->
    <div
      v-motion
      :initial="{ opacity: 0 }"
      :visible="{ opacity: 1 }"
      :delay="1200"
      class="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 transform"
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
const posterImage = ref('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1920')

// Urgency badge (optional)
const urgencyBadge = computed(() => t('landing.hero.urgency'))

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
.landing-hero {
  position: relative;
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

/* Button hover effects */
.btn-primary {
  box-shadow: 0 4px 14px 0 rgba(244, 63, 94, 0.39);
}

.btn-primary:hover {
  box-shadow: 0 6px 20px rgba(244, 63, 94, 0.5);
}

/* Ensure text is readable on all backgrounds */
.landing-hero-text {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .animate-bounce {
    animation: none;
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .landing-hero {
    min-height: 500px;
  }

  .landing-hero-text {
    font-size: 2rem;
  }
}
</style>
