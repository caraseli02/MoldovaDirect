<template>
  <section class="relative flex items-start md:items-center overflow-hidden bg-brand-dark">
    <!-- Optimized min-height for mobile-first with aspect ratio to prevent CLS -->
    <div class="hero-container relative flex w-full items-start md:items-center min-h-[60vh] md:min-h-[75vh]"
      style="aspect-ratio: 16/9;">
      <!-- Video Background (Optional - controlled by showVideo prop) -->
      <div v-if="showVideo && !videoLoadError && !videoPlaybackFailed" class="absolute inset-0 z-0" aria-hidden="true">
        <video ref="videoRef" autoplay muted playsinline :poster="posterImage" class="h-full w-full object-cover"
          aria-hidden="true" @ended="handleVideoEnded" @error="handleVideoError">
          <source v-if="videoWebm" :src="videoWebm" type="video/webm" @error="handleSourceError('webm', $event)" />
          <source v-if="videoMp4" :src="videoMp4" type="video/mp4" @error="handleSourceError('mp4', $event)" />
        </video>
        <!-- Gradient overlay for visual contrast -->
        <!-- Black mask overlay for text contrast -->
        <div class="absolute inset-0 bg-black/50"></div>
      </div>

      <!-- Fallback background: Image or Gradient -->
      <div v-else class="absolute inset-0 z-0">
        <!-- Background Image (if provided) -->
        <div v-if="backgroundImage" class="absolute inset-0">
          <NuxtImg preset="hero" :src="backgroundImage" :alt="backgroundImageAlt" loading="eager" fetchpriority="high"
            sizes="sm:100vw md:100vw lg:100vw" class="h-full w-full object-cover object-center" />
          <!-- Gradient overlay for visual contrast -->
          <div class="absolute inset-0 bg-[linear-gradient(to_br,_rgba(36,20,5,0.88)_0%,_rgba(114,47,55,0.52)_100%)]">
          </div>
        </div>

        <!-- Poster fallback (mobile or error state) -->
        <div v-else-if="posterImage" class="absolute inset-0">
          <NuxtImg preset="hero" :src="posterImage" :alt="backgroundImageAlt || 'Hero poster'" loading="eager"
            fetchpriority="high" sizes="sm:100vw md:100vw lg:100vw" class="h-full w-full object-cover object-center" />
          <div class="absolute inset-0 bg-[linear-gradient(to_br,_rgba(36,20,5,0.88)_0%,_rgba(114,47,55,0.52)_100%)]">
          </div>
        </div>

        <!-- Luxury gradient fallback background -->
        <div v-else
          class="absolute inset-0 bg-[linear-gradient(135deg,_#241405_0%,_#1a0e03_50%,_#722F37_100%),_radial-gradient(circle_at_10%_10%,_rgba(252,250,242,0.05),_transparent_45%)]">
        </div>
      </div>

      <!-- Content Container -->
      <div class="container relative z-10 mx-auto px-4 pt-36 pb-12 md:py-24 lg:py-32">
        <div v-motion :initial="{ opacity: 0, y: 30 }" :enter="{
          opacity: 1,
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 100,
            delay: 100,
          },
        }" class="max-w-4xl text-white">
          <!-- Luxury trust badge with refined styling -->
          <div v-if="badge" v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{
            opacity: 1,
            scale: 1,
            transition: { delay: 200 },
          }"
            class="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-light/15 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-brand-light/95 ring-1 ring-brand-light/25 backdrop-blur-sm md:mb-6 md:px-6 md:py-2 md:text-sm"
            style="text-shadow: 0 2px 8px rgba(0,0,0,0.6)">
            <commonIcon v-if="badgeIcon" :name="badgeIcon" class="h-4 w-4" />
            <span>{{ badge }}</span>
          </div>

          <!-- Luxury heading with refined typography -->
          <h1 v-motion :initial="{ opacity: 0, y: 20 }" :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 300 },
          }"
            class="mb-4 text-3xl font-bold leading-[1.15] tracking-[-0.02em] text-brand-light drop-shadow-2xl sm:text-4xl md:mb-6 md:text-7xl md:leading-[1.1] lg:text-8xl"
            style="text-shadow: 0 4px 16px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.7)">
            {{ title }}
          </h1>

          <!-- Refined subtitle with luxury typography -->
          <p v-if="subtitle" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 400 },
          }"
            class="mb-6 max-w-2xl text-sm leading-relaxed tracking-[0.01em] text-brand-light/90 md:mb-8 md:text-lg md:leading-loose lg:text-xl"
            style="text-shadow: 0 2px 10px rgba(0,0,0,0.75)">
            {{ subtitle }}
          </p>

          <!-- CTAs - Optimized for mobile touch targets -->
          <div v-motion :initial="{ opacity: 0, y: 20 }" :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 500 },
          }" class="mb-8 flex flex-col gap-3 sm:flex-row sm:gap-4 md:mb-12">
            <NuxtLink v-if="primaryCta" :to="primaryCta.link"
              class="cta-button group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-brand-light px-7 py-3.5 font-semibold tracking-[0.01em] text-brand-dark shadow-elevated-lg ring-1 ring-brand-light/20 transition-all hover:shadow-2xl md:px-10 md:py-4 md:text-lg">
              {{ primaryCta.text }}
              <commonIcon v-if="primaryCta.icon" :name="primaryCta.icon"
                class="h-4 w-4 transition-transform group-hover:translate-x-0.5 md:h-5 md:w-5" />
            </NuxtLink>

            <NuxtLink v-if="secondaryCta" :to="secondaryCta.link"
              class="cta-button group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-brand-light/30 bg-brand-light/10 px-7 py-3.5 font-medium tracking-[0.01em] text-brand-light backdrop-blur-md transition-all hover:border-brand-light/40 hover:bg-brand-light/20 md:px-10 md:py-4 md:text-lg">
              {{ secondaryCta.text }}
              <commonIcon v-if="secondaryCta.icon" :name="secondaryCta.icon" class="h-4 w-4 md:h-5 md:w-5" />
            </NuxtLink>
          </div>

          <!-- Stats/Highlights - Mobile optimized grid -->
          <div v-if="highlights && highlights.length > 0" v-motion :initial="{ opacity: 0, y: 20 }" :visible-once="{
            opacity: 1,
            y: 0,
            transition: { delay: 600 },
          }" class="grid grid-cols-3 gap-4 md:gap-8">
            <div v-for="(highlight, index) in highlights" :key="highlight.label" v-motion
              :initial="{ opacity: 0, scale: 0.9 }" :visible-once="{
                opacity: 1,
                scale: 1,
                transition: { delay: 700 + index * 100 },
              }" class="text-center">
              <div class="mb-1 text-2xl font-bold tracking-tight text-brand-light md:mb-2 md:text-4xl"
                style="text-shadow: 0 2px 10px rgba(0,0,0,0.75)">
                {{ highlight.value }}
              </div>
              <div class="text-xs font-medium uppercase tracking-[0.1em] text-brand-light/75 md:text-sm"
                style="text-shadow: 0 2px 8px rgba(0,0,0,0.65)">
                {{ highlight.label }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator (only on desktop, points to content below) -->
      <div v-motion :initial="{ opacity: 0, y: -10 }" :enter="{
        opacity: 1,
        y: 0,
        transition: { delay: 1000 },
      }" class="absolute bottom-8 left-1/2 hidden -translate-x-1/2 animate-bounce md:block">
        <commonIcon name="lucide:chevron-down" class="h-6 w-6 text-brand-light/40" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface CtaButton {
  text: string
  link: string
  icon?: string
}

interface Highlight {
  value: string
  label: string
}

const props = withDefaults(
  defineProps<{
    // Video settings
    showVideo?: boolean
    videoWebm?: string
    videoMp4?: string
    posterImage?: string

    // Background image settings
    backgroundImage?: string
    backgroundImageAlt?: string

    // Content
    badge?: string
    badgeIcon?: string
    title: string
    subtitle?: string

    // CTAs
    primaryCta?: CtaButton
    secondaryCta?: CtaButton

    // Stats
    highlights?: Highlight[]
  }>(),
  {
    showVideo: false,
    posterImage: '/hero-fallback.jpg',
    backgroundImageAlt: 'Moldova vineyard landscape',
  },
)

const videoRef = ref<HTMLVideoElement | null>(null)
const videoLoadError = ref(false)
const videoPlaybackFailed = ref(false)

// Handle video loading errors
const handleVideoError = (event: Event) => {
  console.error('[VideoHero] Video loading error:', {
    error: event,
    webmSrc: props.videoWebm,
    mp4Src: props.videoMp4,
  })
  videoLoadError.value = true
}

const handleVideoEnded = () => {
  setTimeout(() => {
    if (videoRef.value) {
      videoRef.value.play().catch(() => {
        // Prepare for next user interaction if autoplay fails
        videoPlaybackFailed.value = true
      })
    }
  }, 15000)
}

// Handle individual source errors
const handleSourceError = (type: string, event: Event) => {
  console.warn(`[VideoHero] ${type.toUpperCase()} source failed to load`, event)
  // If both sources fail, the video's error handler will fire
}

onMounted(() => {
  // Programmatically start playback as fallback for browsers that don't
  // respect the autoplay attribute. Gracefully handles autoplay policy rejections.
  if (videoRef.value && props.showVideo) {
    videoRef.value.play().catch((error: any) => {
      console.error('[VideoHero] Video autoplay failed (likely browser policy):', {
        error: error.message,
        errorType: error.name,
        videoSrc: props.videoMp4,
      })
      videoPlaybackFailed.value = true
      // Fallback: poster image will remain visible
    })
  }
})
</script>

<style scoped>
/* Smooth fade-in for video */
video {
  animation: videoFadeIn 0.8s ease-in;
}

@keyframes videoFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* Hide video on mobile to save bandwidth - poster will show instead */
</style>
