<template>
  <section class="relative h-[600px] lg:h-[700px] overflow-hidden">
    <!-- Video Background -->
    <div class="absolute inset-0">
      <video
        ref="videoRef"
        class="w-full h-full object-cover"
        autoplay
        loop
        muted
        playsinline
        @canplay="handleVideoLoad"
      >
        <source src="/videos/hero-background.mp4" type="video/mp4">
        <!-- Fallback to image if video not available -->
        <img
          src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1920&h=1080&fit=crop"
          alt="Moldovan wine and food"
          class="w-full h-full object-cover"
        >
      </video>

      <!-- Dark Overlay -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
    </div>

    <!-- Content -->
    <div class="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col justify-center h-full max-w-3xl">
        <div class="space-y-8">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="text-sm font-medium text-white">Productos Premiados Internacionalmente</span>
          </div>

          <!-- Heading -->
          <div class="space-y-4">
            <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Sabores de Moldavia
              <span class="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                En Tu Mesa
              </span>
            </h1>

            <p class="text-xl sm:text-2xl text-gray-100 max-w-2xl">
              Vinos excepcionales, quesos artesanales y delicias tradicionales
              directamente desde el corazón de Moldavia.
            </p>
          </div>

          <!-- Features -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div class="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <svg class="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-semibold text-white mb-1">100% Auténtico</h3>
                <p class="text-sm text-gray-300">Importado directamente de Moldavia</p>
              </div>
            </div>

            <div class="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <svg class="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 class="font-semibold text-white mb-1">Envío Rápido</h3>
                <p class="text-sm text-gray-300">3-5 días laborables</p>
              </div>
            </div>

            <div class="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <svg class="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <div>
                <h3 class="font-semibold text-white mb-1">Envío Gratis</h3>
                <p class="text-sm text-gray-300">Pedidos superiores a €50</p>
              </div>
            </div>
          </div>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row gap-4">
            <UiButton
              size="lg"
              class="text-lg px-8 py-6 bg-white text-gray-900 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300"
              @click="handlePrimaryCTA"
            >
              {{ ctaText }}
              <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </UiButton>

            <UiButton
              variant="outline"
              size="lg"
              class="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
              @click="handleSecondaryCTA"
            >
              {{ secondaryCTAText }}
            </UiButton>
          </div>

          <!-- Social Proof -->
          <div class="flex items-center gap-8 pt-4">
            <div class="flex items-center gap-2">
              <div class="flex -space-x-2">
                <img v-for="i in 4" :key="i" class="w-10 h-10 rounded-full border-2 border-gray-800" :src="`https://i.pravatar.cc/40?img=${i + 10}`" :alt="`Cliente ${i}`">
              </div>
              <span class="text-white font-medium">5,000+ clientes felices</span>
            </div>

            <div class="flex items-center gap-1">
              <svg v-for="i in 5" :key="i" class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="text-white font-medium ml-2">4.9/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  </section>
</template>

<script setup lang="ts">
import { UiButton } from '#components'

const props = defineProps<{
  ctaText?: string
  secondaryCTAText?: string
}>()

const emit = defineEmits<{
  (e: 'primary-cta'): void
  (e: 'secondary-cta'): void
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const ctaText = computed(() => props.ctaText || 'Explorar Productos')
const secondaryCTAText = computed(() => props.secondaryCTAText || 'Hacer Quiz')

const { trackActivity } = useAnalytics()
const route = useRoute()

const handleVideoLoad = () => {
  trackActivity({
    activityType: 'hero_video_play',
    pageUrl: route.path,
    metadata: {
      variant: 'B'
    }
  })
}

const handlePrimaryCTA = () => {
  trackActivity({
    activityType: 'hero_cta_click',
    pageUrl: route.path,
    metadata: {
      variant: 'B',
      ctaText: ctaText.value,
      ctaType: 'primary'
    }
  })
  emit('primary-cta')
}

const handleSecondaryCTA = () => {
  trackActivity({
    activityType: 'hero_cta_click',
    pageUrl: route.path,
    metadata: {
      variant: 'B',
      ctaText: secondaryCTAText.value,
      ctaType: 'secondary'
    }
  })
  emit('secondary-cta')
}

onMounted(() => {
  trackActivity({
    activityType: 'hero_view',
    pageUrl: route.path,
    metadata: {
      variant: 'B'
    }
  })
})
</script>
