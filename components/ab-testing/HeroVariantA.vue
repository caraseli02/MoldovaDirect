<template>
  <section class="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle, #1e40af 1px, transparent 1px); background-size: 40px 40px;" />
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Content -->
        <div class="text-center lg:text-left space-y-8">
          <div class="space-y-4">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span class="text-gray-900 dark:text-white">Auténticos Sabores de</span>
              <span class="block text-blue-600 dark:text-blue-400">Moldavia</span>
            </h1>

            <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
              Descubre productos tradicionales moldavos: vinos premiados, quesos artesanales y delicias caseras.
              Entregados directamente a tu puerta en España.
            </p>
          </div>

          <!-- Trust Badges -->
          <div class="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="font-medium">Envío Gratis €50+</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="font-medium">Productos Auténticos</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="font-medium">Entrega 3-5 Días</span>
            </div>
          </div>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <UiButton
              size="lg"
              class="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
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
              class="text-lg px-8 py-6 border-2"
              @click="handleSecondaryCTA"
            >
              {{ secondaryCTAText }}
            </UiButton>
          </div>

          <!-- Social Proof -->
          <div class="pt-8 border-t border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">Confiado por más de 5,000+ clientes</p>
            <div class="flex items-center gap-2">
              <div class="flex -space-x-2">
                <img v-for="i in 5" :key="i" class="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800" :src="`https://i.pravatar.cc/40?img=${i}`" :alt="`Cliente ${i}`">
              </div>
              <div class="flex items-center gap-1 ml-2">
                <svg v-for="i in 5" :key="i" class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">4.9/5</span>
            </div>
          </div>
        </div>

        <!-- Image -->
        <div class="relative lg:h-[600px] hidden lg:block">
          <div class="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl transform rotate-3"></div>
          <div class="relative h-full rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&h=600&fit=crop"
              alt="Productos moldavos auténticos"
              class="w-full h-full object-cover"
            >
          </div>
        </div>
      </div>
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

const ctaText = computed(() => props.ctaText || 'Comprar Ahora')
const secondaryCTAText = computed(() => props.secondaryCTAText || 'Hacer Quiz')

const { trackActivity } = useAnalytics()
const route = useRoute()

const handlePrimaryCTA = () => {
  trackActivity({
    activityType: 'hero_cta_click',
    pageUrl: route.path,
    metadata: {
      variant: 'A',
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
      variant: 'A',
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
      variant: 'A'
    }
  })
})
</script>
