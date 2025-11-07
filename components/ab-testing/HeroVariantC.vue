<template>
  <section class="relative bg-white dark:bg-gray-900 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <!-- Carousel Hero -->
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Content -->
        <div class="space-y-8 order-2 lg:order-1">
          <div class="space-y-4">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="text-sm font-medium text-blue-600 dark:text-blue-400">Calificación 4.9/5 de clientes satisfechos</span>
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Auténtica Tradición
              <span class="block text-blue-600 dark:text-blue-400">Moldava</span>
            </h1>

            <p class="text-xl text-gray-600 dark:text-gray-300">
              Productos artesanales seleccionados cuidadosamente.
              Sabores que cuentan historias de generaciones.
            </p>
          </div>

          <!-- Customer Testimonial Slider -->
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 space-y-4">
            <div class="flex items-center gap-1">
              <svg v-for="i in 5" :key="i" class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>

            <Transition name="fade" mode="out-in">
              <div :key="currentTestimonial" class="space-y-3">
                <p class="text-gray-700 dark:text-gray-300 italic">
                  "{{ testimonials[currentTestimonial].text }}"
                </p>
                <div class="flex items-center gap-3">
                  <img
                    :src="testimonials[currentTestimonial].avatar"
                    :alt="testimonials[currentTestimonial].name"
                    class="w-12 h-12 rounded-full"
                  >
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">
                      {{ testimonials[currentTestimonial].name }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ testimonials[currentTestimonial].location }}
                    </p>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- Testimonial Navigation -->
            <div class="flex items-center justify-center gap-2 pt-2">
              <button
                v-for="(_, index) in testimonials"
                :key="index"
                @click="currentTestimonial = index"
                :class="[
                  'w-2 h-2 rounded-full transition-all duration-300',
                  currentTestimonial === index
                    ? 'w-8 bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                ]"
                :aria-label="`Ver testimonio ${index + 1}`"
              />
            </div>
          </div>

          <!-- Trust Elements -->
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <p class="text-3xl font-bold text-gray-900 dark:text-white">5,000+</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Clientes Felices</p>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-gray-900 dark:text-white">200+</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Productos</p>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-gray-900 dark:text-white">4.9</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Calificación</p>
            </div>
          </div>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row gap-4">
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
        </div>

        <!-- Image Carousel -->
        <div class="order-1 lg:order-2">
          <div class="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
            <Transition name="slide" mode="out-in">
              <img
                :key="currentSlide"
                :src="slides[currentSlide].image"
                :alt="slides[currentSlide].title"
                class="w-full h-full object-cover"
              >
            </Transition>

            <!-- Slide Info Overlay -->
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 class="text-2xl font-bold text-white mb-2">
                {{ slides[currentSlide].title }}
              </h3>
              <p class="text-gray-200">
                {{ slides[currentSlide].description }}
              </p>
            </div>

            <!-- Navigation Arrows -->
            <button
              @click="previousSlide"
              class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
              aria-label="Imagen anterior"
            >
              <svg class="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              @click="nextSlide"
              class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
              aria-label="Siguiente imagen"
            >
              <svg class="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <!-- Slide Indicators -->
            <div class="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
              <button
                v-for="(_, index) in slides"
                :key="index"
                @click="goToSlide(index)"
                :class="[
                  'w-2 h-2 rounded-full transition-all duration-300',
                  currentSlide === index
                    ? 'w-8 bg-white'
                    : 'bg-white/50'
                ]"
                :aria-label="`Ir a diapositiva ${index + 1}`"
              />
            </div>
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

const ctaText = computed(() => props.ctaText || 'Descubrir Moldova')
const secondaryCTAText = computed(() => props.secondaryCTAText || 'Buscar Mis Favoritos')

const { trackActivity } = useAnalytics()
const route = useRoute()

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop',
    title: 'Vinos Premiados',
    description: 'Selección exclusiva de bodegas moldavas reconocidas mundialmente'
  },
  {
    image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&h=600&fit=crop',
    title: 'Quesos Artesanales',
    description: 'Elaborados siguiendo tradiciones centenarias de maestros queseros'
  },
  {
    image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&h=600&fit=crop',
    title: 'Delicias Tradicionales',
    description: 'Auténticos sabores que transportan al corazón de Moldavia'
  }
]

const testimonials = [
  {
    text: 'Los vinos son excepcionales y la entrega fue rápida. ¡Recomendado al 100%!',
    name: 'María González',
    location: 'Madrid',
    avatar: 'https://i.pravatar.cc/40?img=1'
  },
  {
    text: 'Calidad increíble. Nunca había probado quesos tan auténticos.',
    name: 'Carlos Ruiz',
    location: 'Barcelona',
    avatar: 'https://i.pravatar.cc/40?img=2'
  },
  {
    text: 'Excelente servicio y productos únicos. Ya hice mi tercer pedido.',
    name: 'Ana Martínez',
    location: 'Valencia',
    avatar: 'https://i.pravatar.cc/40?img=3'
  }
]

const currentSlide = ref(0)
const currentTestimonial = ref(0)
let slideInterval: NodeJS.Timeout | null = null
let testimonialInterval: NodeJS.Timeout | null = null

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
  trackActivity({
    activityType: 'hero_carousel_navigate',
    pageUrl: route.path,
    metadata: {
      variant: 'C',
      slideIndex: currentSlide.value,
      direction: 'next'
    }
  })
}

const previousSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
  trackActivity({
    activityType: 'hero_carousel_navigate',
    pageUrl: route.path,
    metadata: {
      variant: 'C',
      slideIndex: currentSlide.value,
      direction: 'previous'
    }
  })
}

const goToSlide = (index: number) => {
  currentSlide.value = index
  trackActivity({
    activityType: 'hero_carousel_navigate',
    pageUrl: route.path,
    metadata: {
      variant: 'C',
      slideIndex: index,
      direction: 'direct'
    }
  })
}

const handlePrimaryCTA = () => {
  trackActivity({
    activityType: 'hero_cta_click',
    pageUrl: route.path,
    metadata: {
      variant: 'C',
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
      variant: 'C',
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
      variant: 'C'
    }
  })

  // Auto-advance slides every 5 seconds
  slideInterval = setInterval(nextSlide, 5000)

  // Auto-rotate testimonials every 7 seconds
  testimonialInterval = setInterval(() => {
    currentTestimonial.value = (currentTestimonial.value + 1) % testimonials.length
  }, 7000)
})

onBeforeUnmount(() => {
  if (slideInterval) clearInterval(slideInterval)
  if (testimonialInterval) clearInterval(testimonialInterval)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
