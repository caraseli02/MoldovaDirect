<template>
  <section class="landing-section bg-white py-16 sm:py-20 md:py-24">
    <div class="container mx-auto px-8 sm:px-10 md:px-12 lg:px-16">
      <!-- Section Header -->
      <div class="mb-12 text-center sm:mb-14 md:mb-16">
        <h2
          class="landing-h2 mb-4 text-2xl font-bold tracking-wide text-gray-900 animate-fade-in-up sm:mb-5 sm:text-3xl md:mb-6 md:text-4xl lg:text-5xl"
        >
          {{ t('landing.products.heading') }}
        </h2>
        <p
          class="mx-auto max-w-2xl px-2 text-base text-gray-600 animate-fade-in-up animation-delay-100 sm:text-lg md:text-xl"
        >
          {{ t('landing.products.subheading') }}
        </p>
      </div>

      <!-- Carousel Container -->
      <div ref="emblaRef" class="relative">
        <div class="overflow-hidden touch-pan-y">
          <div class="flex gap-3 sm:gap-4 md:gap-6">
            <div
              v-for="product in featuredProducts"
              :key="product.id"
              class="min-w-0 flex-none w-[85%] sm:w-1/2 lg:w-1/3 xl:w-1/4"
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
        class="mt-6 flex justify-center gap-2 sm:mt-8"
        role="tablist"
        aria-label="Product carousel navigation"
      >
        <button
          v-for="(_, index) in scrollSnaps"
          :key="index"
          type="button"
          @click="scrollTo(index)"
          :class="[
            'min-h-[44px] min-w-[44px] flex items-center justify-center transition-all duration-300',
            selectedIndex === index
              ? 'scale-110'
              : ''
          ]"
          :aria-label="`Go to slide ${index + 1}`"
          :aria-selected="selectedIndex === index"
          role="tab"
        >
          <span
            :class="[
              'rounded-full transition-all duration-300',
              selectedIndex === index
                ? 'h-2.5 w-8 bg-rose-600'
                : 'h-2.5 w-2.5 bg-gray-300'
            ]"
          />
        </button>
      </div>

      <!-- View All CTA -->
      <div
        class="mt-12 text-center sm:mt-14 md:mt-16"
      >
        <NuxtLink
          :to="localePath('/products')"
          class="group inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 active:scale-[0.98] hover:bg-gray-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 sm:px-10"
        >
          {{ t('landing.products.viewAllCta') }}
          <commonIcon name="lucide:arrow-right" class="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import emblaCarouselVue from 'embla-carousel-vue'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  image: string
  benefits: string[]
  rating: number
  reviewCount: number
}

interface Props {
  products?: Product[]
}

const props = withDefaults(defineProps<Props>(), {
  products: () => []
})

const { t } = useI18n()
const localePath = useLocalePath()

// Embla Carousel setup with mobile-first touch support
const [emblaRef, emblaApi] = emblaCarouselVue({
  loop: false,
  align: 'start',
  slidesToScroll: 1,
  dragFree: true,
  containScroll: 'trimSnaps',
  breakpoints: {
    '(min-width: 640px)': { slidesToScroll: 1, dragFree: false },
    '(min-width: 1024px)': { slidesToScroll: 1, dragFree: false }
  }
})

// Carousel state
const selectedIndex = ref(0)
const scrollSnaps = ref<number[]>([])
const canScrollPrev = ref(false)
const canScrollNext = ref(false)

// Use products from props or fallback to mock data for development
const featuredProducts = computed(() => {
  if (props.products && props.products.length > 0) {
    return props.products
  }

  // Fallback mock data for development/testing
  return [
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
  ]
})

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
/* ===== Performance-optimized animations ===== */
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
.animate-fade-in-up {
  animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: opacity, transform;
}

/* Stagger animation delay */
.animation-delay-100 {
  animation-delay: 0.1s;
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.landing-section {
  scroll-margin-top: 80px; /* Account for sticky header */
}

/* Ensure smooth touch scrolling on mobile */
.overflow-hidden {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* Improve touch interactions */
.touch-pan-y {
  touch-action: pan-y;
}

/* Prevent text selection during drag on mobile */
.flex {
  user-select: none;
  -webkit-user-select: none;
}

/* Responsive adjustments for mobile-first */
@media (max-width: 374px) {
  /* iPhone SE - show more of next card */
  .flex-none {
    width: 82%;
  }
}

@media (min-width: 768px) {
  /* Tablet and desktop - restore text selection */
  .flex {
    user-select: auto;
    -webkit-user-select: auto;
  }
}
</style>
