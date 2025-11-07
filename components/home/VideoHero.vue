<template>
  <div class="relative h-[500px] w-full overflow-hidden md:h-[600px] lg:h-[700px]">
    <!-- Video Background -->
    <div
      v-if="shouldPlayVideo"
      v-motion
      :initial="{ opacity: 0 }"
      :visible="{ opacity: 1 }"
      :delay="100"
      class="absolute inset-0"
    >
      <video
        ref="videoRef"
        :src="videoUrl"
        :poster="fallbackImage"
        autoplay
        loop
        muted
        playsinline
        class="h-full w-full object-cover"
        @loadeddata="onVideoLoaded"
        @error="onVideoError"
      />
    </div>

    <!-- Fallback Image (for slow connections or video errors) -->
    <div
      v-if="!shouldPlayVideo || showFallback"
      class="absolute inset-0"
    >
      <NuxtImg
        :src="fallbackImage"
        :alt="fallbackAlt"
        format="webp"
        quality="80"
        sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw"
        class="h-full w-full object-cover"
        loading="eager"
        fetchpriority="high"
      />
    </div>

    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950/80"></div>

    <!-- Content Overlay -->
    <div class="absolute inset-0 flex items-center">
      <div class="container">
        <div class="max-w-3xl">
          <!-- Urgency Badge -->
          <div
            v-if="urgencyMessage"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible="{ opacity: 1, y: 0 }"
            :delay="200"
            class="mb-6 inline-flex items-center gap-2 rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm"
          >
            <commonIcon name="lucide:zap" class="h-4 w-4" />
            <span>{{ urgencyMessage }}</span>
          </div>

          <!-- Title -->
          <h1
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0 }"
            :delay="300"
            class="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
          >
            {{ title }}
          </h1>

          <!-- Subtitle -->
          <p
            v-if="subtitle"
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0 }"
            :delay="400"
            class="mt-4 text-lg text-white/90 md:text-xl lg:text-2xl"
          >
            {{ subtitle }}
          </p>

          <!-- CTAs -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0 }"
            :delay="500"
            class="mt-8 flex flex-wrap gap-4"
          >
            <NuxtLink
              :to="primaryCta.href"
              class="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-slate-950 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {{ primaryCta.text }}
              <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
            </NuxtLink>

            <NuxtLink
              v-if="secondaryCta"
              :to="secondaryCta.href"
              class="inline-flex items-center gap-2 rounded-full bg-white/10 px-8 py-4 text-lg font-semibold text-white ring-1 ring-white/30 backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {{ secondaryCta.text }}
            </NuxtLink>
          </div>

          <!-- Trust Indicators -->
          <div
            v-if="trustIndicators && trustIndicators.length > 0"
            v-motion
            :initial="{ opacity: 0 }"
            :visible="{ opacity: 1 }"
            :delay="600"
            class="mt-8 flex flex-wrap items-center gap-6 text-sm text-white/80"
          >
            <div
              v-for="(indicator, index) in trustIndicators"
              :key="index"
              class="flex items-center gap-2"
            >
              <commonIcon :name="indicator.icon" class="h-5 w-5" />
              <span>{{ indicator.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Metrics (hidden, for LCP tracking) -->
    <div v-if="isDev" class="absolute bottom-4 right-4 rounded bg-black/50 p-2 text-xs text-white">
      <div>Video Loaded: {{ videoLoaded ? 'Yes' : 'No' }}</div>
      <div>Fallback: {{ showFallback ? 'Yes' : 'No' }}</div>
      <div>Connection: {{ connectionSpeed }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CtaButton {
  text: string
  href: string
}

interface TrustIndicator {
  icon: string
  text: string
}

interface Props {
  videoUrl?: string
  fallbackImage: string
  fallbackAlt?: string
  title: string
  subtitle?: string
  urgencyMessage?: string
  primaryCta: CtaButton
  secondaryCta?: CtaButton
  trustIndicators?: TrustIndicator[]
}

const props = withDefaults(defineProps<Props>(), {
  videoUrl: undefined,
  fallbackAlt: 'Hero background',
  subtitle: undefined,
  urgencyMessage: undefined,
  secondaryCta: undefined,
  trustIndicators: undefined,
})

const videoRef = ref<HTMLVideoElement>()
const videoLoaded = ref(false)
const showFallback = ref(false)
const isDev = ref(process.env.NODE_ENV === 'development')

// Detect connection speed
const connectionSpeed = ref<'slow' | 'fast'>('fast')
const shouldPlayVideo = computed(() => {
  return props.videoUrl && connectionSpeed.value === 'fast'
})

// Check network connection
onMounted(() => {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection
    if (connection) {
      // Don't play video on slow connections (2G, slow-2g) or if saveData is enabled
      const slowConnection = connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g'
      const saveData = connection.saveData === true
      if (slowConnection || saveData) {
        connectionSpeed.value = 'slow'
        showFallback.value = true
      }
    }
  }

  // Set timeout to show fallback if video takes too long to load (>2.5s for LCP)
  if (shouldPlayVideo.value) {
    setTimeout(() => {
      if (!videoLoaded.value) {
        showFallback.value = true
      }
    }, 2500)
  }
})

const onVideoLoaded = () => {
  videoLoaded.value = true
}

const onVideoError = () => {
  console.warn('Video failed to load, showing fallback image')
  showFallback.value = true
}
</script>
