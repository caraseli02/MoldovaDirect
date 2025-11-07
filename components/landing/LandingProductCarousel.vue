<template>
  <section class="landing-section bg-white py-16 md:py-24">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <h2
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0 }"
          class="landing-h2 text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900"
        >
          {{ t('landing.products.heading') }}
        </h2>
        <p
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0 }"
          :delay="200"
          class="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
        >
          {{ t('landing.products.subheading') }}
        </p>
      </div>

      <!-- Carousel Container -->
      <div class="relative" ref="emblaRef">
        <div class="overflow-hidden">
          <div class="flex gap-4 md:gap-6">
            <div
              v-for="product in featuredProducts"
              :key="product.id"
              class="flex-none w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 min-w-0"
            >
              <LandingProductCard :product="product" />
            </div>
          </div>
        </div>

        <!-- Navigation Arrows (Desktop) -->
        <button
          v-if="canScrollPrev"
          @click="scrollPrev"
          class="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 items-center justify-center bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
          :aria-label="t('common.previous')"
        >
          <commonIcon name="lucide:chevron-left" class="w-6 h-6 text-gray-900" />
        </button>

        <button
          v-if="canScrollNext"
          @click="scrollNext"
          class="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 items-center justify-center bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
          :aria-label="t('common.next')"
        >
          <commonIcon name="lucide:chevron-right" class="w-6 h-6 text-gray-900" />
        </button>
      </div>

      <!-- Pagination Dots -->
      <div
        class="flex justify-center gap-2 mt-8"
        role="tablist"
        aria-label="Product carousel navigation"
      >
        <button
          v-for="(_, index) in scrollSnaps"
          :key="index"
          @click="scrollTo(index)"
          :class="[
            'transition-all duration-300 rounded-full',
            selectedIndex === index
              ? 'w-8 h-2 bg-rose-600'
              : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
          ]"
          :aria-label="`Go to slide ${index + 1}`"
          :aria-selected="selectedIndex === index"
          role="tab"
        />
      </div>

      <!-- View All CTA -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{ opacity: 1, y: 0 }"
        :delay="400"
        class="text-center mt-12"
      >
        <NuxtLink
          :to="localePath('/products')"
          class="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          {{ t('landing.products.viewAllCta') }}
          <commonIcon name="lucide:arrow-right" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import emblaCarouselVue from 'embla-carousel-vue'

const { t } = useI18n()
const localePath = useLocalePath()

// Embla Carousel setup
const [emblaRef, emblaApi] = emblaCarouselVue({
  loop: false,
  align: 'start',
  slidesToScroll: 1,
  breakpoints: {
    '(min-width: 640px)': { slidesToScroll: 1 },
    '(min-width: 1024px)': { slidesToScroll: 1 }
  }
})

// Carousel state
const selectedIndex = ref(0)
const scrollSnaps = ref<number[]>([])
const canScrollPrev = ref(false)
const canScrollNext = ref(false)

// Featured products (mock data - replace with actual product fetching)
const featuredProducts = ref([
  {
    id: '1',
    name: 'Purcari Roșu de Purcari',
    slug: 'purcari-rosu-de-purcari',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop',
    benefits: ['Award-Winning', 'Organic', '5000+ Years Heritage'],
    rating: 4.8,
    reviewCount: 124
  },
  {
    id: '2',
    name: 'Cricova Brut Sparkling',
    slug: 'cricova-brut',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&h=400&fit=crop',
    benefits: ['Underground Cellars', 'Premium Quality', 'Perfect for Celebrations'],
    rating: 4.9,
    reviewCount: 89
  },
  {
    id: '3',
    name: 'Asconi Cabernet Sauvignon',
    slug: 'asconi-cabernet',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1566995541075-c83e57d23c6e?w=400&h=400&fit=crop',
    benefits: ['Bold Flavor', 'Great Value', 'Pairs with Meat'],
    rating: 4.7,
    reviewCount: 156
  },
  {
    id: '4',
    name: 'Moldova Honey Collection',
    slug: 'honey-collection',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784ecb?w=400&h=400&fit=crop',
    benefits: ['100% Natural', 'Direct from Beekeepers', 'Gift Box'],
    rating: 5.0,
    reviewCount: 67
  },
  {
    id: '5',
    name: 'Traditional Cheese Selection',
    slug: 'cheese-selection',
    price: 27.99,
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop',
    benefits: ['Artisan Made', 'Rich Flavor', 'Perfect for Pairing'],
    rating: 4.8,
    reviewCount: 92
  }
])

// Carousel methods
const scrollPrev = () => emblaApi.value?.scrollPrev()
const scrollNext = () => emblaApi.value?.scrollNext()
const scrollTo = (index: number) => emblaApi.value?.scrollTo(index)

// Update carousel state
const updateCarouselState = () => {
  if (!emblaApi.value) return

  selectedIndex.value = emblaApi.value.selectedScrollSnap()
  canScrollPrev.value = emblaApi.value.canScrollPrev()
  canScrollNext.value = emblaApi.value.canScrollNext()
}

// Initialize carousel
onMounted(() => {
  if (!emblaApi.value) return

  scrollSnaps.value = emblaApi.value.scrollSnapList()
  emblaApi.value.on('select', updateCarouselState)
  emblaApi.value.on('reInit', updateCarouselState)
  updateCarouselState()
})

onUnmounted(() => {
  emblaApi.value?.destroy()
})
</script>

<style scoped>
.landing-section {
  scroll-margin-top: 80px; /* Account for sticky header */
}

/* Ensure smooth scrolling */
.overflow-hidden {
  -webkit-overflow-scrolling: touch;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .landing-h2 {
    font-size: 2rem;
  }
}
</style>
