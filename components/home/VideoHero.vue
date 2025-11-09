<template>
  <section class="relative flex items-center overflow-hidden bg-gradient-to-br from-wine-burgundy-950 via-wine-burgundy-900 to-slate-900">
    <!-- Optimized min-height for mobile-first (60vh mobile, 75vh desktop) -->
    <div class="relative flex min-h-[60vh] w-full items-center md:min-h-[75vh]">
      <!-- Video Background (Optional - controlled by showVideo prop) -->
      <div v-if="showVideo" class="absolute inset-0 z-0" aria-hidden="true">
        <video
          ref="videoRef"
          autoplay
          muted
          loop
          playsinline
          :poster="posterImage"
          class="h-full w-full object-cover"
          aria-hidden="true"
        >
          <source v-if="videoWebM" :src="videoWebM" type="video/webm" />
          <source v-if="videoMp4" :src="videoMp4" type="video/mp4" />
        </video>
        <!-- Dark overlay for text readability -->
        <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
      </div>

      <!-- Fallback background: Image or Gradient -->
      <div v-else class="absolute inset-0 z-0">
        <!-- Background Image (if provided) -->
        <div v-if="backgroundImage" class="absolute inset-0">
          <NuxtImg
            preset="hero"
            :src="backgroundImage"
            :alt="backgroundImageAlt"
            loading="eager"
            fetchpriority="high"
            sizes="sm:100vw md:100vw lg:100vw"
            class="h-full w-full object-cover object-center"
          />
          <!-- Gradient Overlay for Text Readability -->
          <div class="absolute inset-0 bg-gradient-to-br from-wine-burgundy-950/75 via-wine-burgundy-900/60 to-slate-900/70" />
        </div>

        <!-- Gradient Fallback (if no image) -->
        <div v-else class="absolute inset-0">
          <!-- Gradient Base -->
          <div class="absolute inset-0 bg-gradient-to-br from-wine-burgundy-950 via-wine-burgundy-900 to-slate-900" />

          <!-- Radial Highlights for Visual Interest -->
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_50%)]" />
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(198,141,37,0.12),_transparent_60%)]" />
        </div>
      </div>

      <!-- Content Container -->
      <div class="container relative z-10 mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 100,
              delay: 100,
            },
          }"
          class="max-w-4xl text-white"
        >
          <!-- Trust Badge (Smaller, more refined) -->
          <div
            v-if="badge"
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :enter="{
              opacity: 1,
              scale: 1,
              transition: { delay: 200 },
            }"
            class="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white/90 ring-1 ring-white/20 backdrop-blur-sm md:mb-6 md:text-sm"
            style="text-shadow: 0 2px 6px rgba(0,0,0,0.5)"
          >
            <commonIcon v-if="badgeIcon" :name="badgeIcon" class="h-4 w-4" />
            <span>{{ badge }}</span>
          </div>

          <!-- Main Heading - FIXED: Reduced from text-9xl to reasonable sizes -->
          <h1
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { delay: 300 },
            }"
            class="mb-4 text-5xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-2xl md:mb-6 md:text-7xl lg:text-8xl"
            style="text-shadow: 0 4px 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)"
          >
            {{ title }}
          </h1>

          <!-- Subtitle - More readable sizing -->
          <p
            v-if="subtitle"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { delay: 400 },
            }"
            class="mb-6 max-w-2xl text-base leading-relaxed text-white/90 md:mb-8 md:text-lg lg:text-xl"
            style="text-shadow: 0 2px 8px rgba(0,0,0,0.7)"
          >
            {{ subtitle }}
          </p>

          <!-- CTAs - Optimized for mobile touch targets -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { delay: 500 },
            }"
            class="mb-8 flex flex-col gap-3 sm:flex-row sm:gap-4 md:mb-12"
          >
            <NuxtLink
              v-if="primaryCta"
              :to="primaryCta.link"
              class="cta-button group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-900 shadow-xl transition-all hover:scale-105 hover:shadow-2xl md:px-8 md:py-4 md:text-lg"
            >
              {{ primaryCta.text }}
              <commonIcon
                v-if="primaryCta.icon"
                :name="primaryCta.icon"
                class="h-4 w-4 transition-transform group-hover:translate-x-0.5 md:h-5 md:w-5"
              />
            </NuxtLink>

            <NuxtLink
              v-if="secondaryCta"
              :to="secondaryCta.link"
              class="cta-button group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-3 font-semibold text-white ring-1 ring-white/30 backdrop-blur-sm transition-all hover:bg-white/20 md:px-8 md:py-4 md:text-lg"
            >
              {{ secondaryCta.text }}
              <commonIcon
                v-if="secondaryCta.icon"
                :name="secondaryCta.icon"
                class="h-4 w-4 md:h-5 md:w-5"
              />
            </NuxtLink>
          </div>

          <!-- Stats/Highlights - Mobile optimized grid -->
          <div
            v-if="highlights && highlights.length > 0"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { delay: 600 },
            }"
            class="grid grid-cols-3 gap-4 md:gap-8"
          >
            <div
              v-for="(highlight, index) in highlights"
              :key="highlight.label"
              v-motion
              :initial="{ opacity: 0, scale: 0.9 }"
              :visible-once="{
                opacity: 1,
                scale: 1,
                transition: { delay: 700 + index * 100 },
              }"
              class="text-center"
            >
              <div class="mb-1 text-2xl font-bold md:mb-2 md:text-4xl" style="text-shadow: 0 2px 8px rgba(0,0,0,0.7)">{{ highlight.value }}</div>
              <div class="text-xs text-white/80 md:text-sm" style="text-shadow: 0 2px 6px rgba(0,0,0,0.6)">{{ highlight.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator (only on desktop, points to content below) -->
      <div
        v-motion
        :initial="{ opacity: 0, y: -10 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { delay: 1000 },
        }"
        class="absolute bottom-8 left-1/2 hidden -translate-x-1/2 animate-bounce md:block"
      >
        <commonIcon name="lucide:chevron-down" class="h-6 w-6 text-white/50" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
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
    videoWebM?: string
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
  }
)

const videoRef = ref<HTMLVideoElement | null>(null)

onMounted(() => {
  // Ensure video plays on mobile devices
  if (videoRef.value && props.showVideo) {
    videoRef.value.play().catch((error) => {
      console.warn('Video autoplay failed:', error)
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
</style>
