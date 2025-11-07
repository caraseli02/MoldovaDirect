<template>
  <section class="relative min-h-[70vh] flex items-center overflow-hidden">
    <!-- Video Background (Optional - controlled by showVideo prop) -->
    <div v-if="showVideo" class="absolute inset-0 z-0">
      <video
        ref="videoRef"
        autoplay
        muted
        loop
        playsinline
        :poster="posterImage"
        class="w-full h-full object-cover"
        @loadeddata="videoLoaded = true"
      >
        <source v-if="videoWebM" :src="videoWebM" type="video/webm" />
        <source v-if="videoMp4" :src="videoMp4" type="video/mp4" />
      </video>
      <!-- Dark overlay for text readability -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
    </div>

    <!-- Fallback gradient background when no video -->
    <div v-else class="absolute inset-0 z-0 bg-gradient-to-b from-slate-950 to-slate-800">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_rgba(15,23,42,0.05)_65%)]" />
    </div>

    <!-- Content Container -->
    <div class="container relative z-10 mx-auto px-4 py-16 md:py-24">
      <div
        v-motion
        :initial="{ opacity: 0, y: 50 }"
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
        <!-- Trust Badge -->
        <div
          v-if="badge"
          class="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 mb-6 text-sm font-medium ring-1 ring-white/30 backdrop-blur"
        >
          <commonIcon v-if="badgeIcon" :name="badgeIcon" class="h-4 w-4" />
          <span>{{ badge }}</span>
        </div>

        <!-- Main Heading -->
        <h1
          class="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 leading-tight tracking-tight"
        >
          {{ title }}
        </h1>

        <!-- Subtitle -->
        <p
          v-if="subtitle"
          class="text-sm md:text-base mb-8 text-white/70 max-w-xl"
        >
          {{ subtitle }}
        </p>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row gap-4 mb-12">
          <NuxtLink
            v-if="primaryCta"
            :to="primaryCta.link"
            class="cta-button inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-slate-900 shadow-lg text-lg"
          >
            {{ primaryCta.text }}
            <commonIcon
              v-if="primaryCta.icon"
              :name="primaryCta.icon"
              class="h-5 w-5"
            />
          </NuxtLink>

          <NuxtLink
            v-if="secondaryCta"
            :to="secondaryCta.link"
            class="cta-button inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-8 py-4 font-semibold text-white ring-1 ring-white/30 backdrop-blur text-lg"
          >
            {{ secondaryCta.text }}
            <commonIcon
              v-if="secondaryCta.icon"
              :name="secondaryCta.icon"
              class="h-5 w-5"
            />
          </NuxtLink>
        </div>

        <!-- Stats/Highlights -->
        <div
          v-if="highlights && highlights.length > 0"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible-once="{
            opacity: 1,
            y: 0,
            transition: { delay: 300 },
          }"
          class="grid grid-cols-1 sm:grid-cols-3 gap-8"
        >
          <div
            v-for="(highlight, index) in highlights"
            :key="highlight.label"
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :visible-once="{
              opacity: 1,
              scale: 1,
              transition: { delay: 400 + index * 100 },
            }"
            class="text-center sm:text-left"
          >
            <div class="text-3xl font-bold mb-2">{{ highlight.value }}</div>
            <div class="text-sm text-white/70">{{ highlight.label }}</div>
          </div>
        </div>
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
  }
)

const videoRef = ref<HTMLVideoElement | null>(null)
const videoLoaded = ref(false)

onMounted(() => {
  // Ensure video plays on mobile devices
  if (videoRef.value && props.showVideo) {
    videoRef.value.play().catch((error) => {
      console.warn('Video autoplay failed:', error)
    })
  }
})
</script>
