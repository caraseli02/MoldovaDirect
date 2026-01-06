<template>
  <div
    class="w-full bg-white py-4 dark:bg-gray-900"
    role="region"
    aria-label="Product carousel"
  >
    <div class="container mx-auto px-4">
      <Carousel
        ref="carouselRef"
        :items-to-show="1"
        :autoplay="5000"
        :wrap-around="true"
        :transition="500"
        :breakpoints="{
          640: { itemsToShow: 1.5, snapAlign: 'start' },
          768: { itemsToShow: 2.2, snapAlign: 'start' },
          1024: { itemsToShow: 3, snapAlign: 'start' },
        }"
        snap-align="start"
        class="amazon-carousel"
        aria-live="polite"
        @slide-start="handleSlideChange"
      >
        <Slide
          v-for="(card, index) in cards"
          :key="index"
        >
          <div class="px-2">
            <NuxtLink
              :to="localePath(card.link)"
              :aria-label="`View ${card.title} category`"
              class="group relative block h-[400px] overflow-hidden rounded-3xl shadow-lg transition-all duration-300 hover:shadow-2xl sm:h-[450px] lg:h-[500px]"
              :style="{ backgroundColor: card.bgColor }"
            >
              <!-- Large Product Image - fills entire card -->
              <NuxtImg
                :src="card.image"
                :alt="card.alt"
                width="600"
                height="500"
                densities="1x 2x"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />

              <!-- Title overlaid on top-left of image -->
              <div class="absolute left-6 top-6 max-w-[70%] sm:left-8 sm:top-8 lg:left-10 lg:top-10">
                <h2
                  class="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
                  :class="card.textColor"
                >
                  {{ card.title }}
                </h2>
              </div>
            </NuxtLink>
          </div>
        </Slide>
      </Carousel>

      <!-- Navigation Dots -->
      <div
        class="mt-6 flex justify-center gap-2"
        role="tablist"
        aria-label="Carousel navigation"
      >
        <button
          v-for="(card, idx) in cards"
          :key="idx"
          :aria-label="`Go to slide ${idx + 1}: ${card.title}`"
          :aria-selected="currentSlide === idx"
          role="tab"
          class="h-2 w-2 rounded-full bg-gray-300 transition-all duration-300 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-500"
          :class="{ 'w-8 bg-gray-800 dark:bg-gray-400': currentSlide === idx }"
          @click="goToSlide(idx)"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Carousel, Slide } from 'vue3-carousel'
import type { CarouselExposed } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

// Types
interface CarouselCard {
  title: string
  bgColor: string
  textColor: string
  image: string
  alt: string
  link: string
}

// Composables
const localePath = useLocalePath()
const { t } = useI18n()

// State
const carouselRef = ref<(InstanceType<typeof Carousel> & CarouselExposed) | null>(null)
const currentSlide = ref(0)

// Amazon-style horizontal scrolling cards with vibrant backgrounds
const cards = computed<CarouselCard[]>(() => [
  {
    title: t('home.hero.carousel.slides.gifts.title'),
    bgColor: '#C73341',
    textColor: 'text-white',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600',
    alt: t('home.hero.carousel.slides.gifts.alt'),
    link: '/products?category=gift',
  },
  {
    title: t('home.hero.carousel.slides.wines.title'),
    bgColor: '#2C5F2D',
    textColor: 'text-white',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=600',
    alt: t('home.hero.carousel.slides.wines.alt'),
    link: '/products?category=wine',
  },
  {
    title: t('home.hero.carousel.slides.clothing.title'),
    bgColor: '#D4B896',
    textColor: 'text-gray-900',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600',
    alt: t('home.hero.carousel.slides.clothing.alt'),
    link: '/products?category=clothing',
  },
  {
    title: t('home.hero.carousel.slides.kitchen.title'),
    bgColor: '#E8E8E8',
    textColor: 'text-gray-900',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600',
    alt: t('home.hero.carousel.slides.kitchen.alt'),
    link: '/products?category=kitchen',
  },
  {
    title: t('home.hero.carousel.slides.foods.title'),
    bgColor: '#FFA94D',
    textColor: 'text-gray-900',
    image: 'https://images.unsplash.com/photo-1599974579688-8dbdd243c6b0?q=80&w=600',
    alt: t('home.hero.carousel.slides.foods.alt'),
    link: '/products?category=gourmet',
  },
  {
    title: t('home.hero.carousel.slides.cheese.title'),
    bgColor: '#4A6FA5',
    textColor: 'text-white',
    image: 'https://images.unsplash.com/photo-1452251889946-8ff5ea7f27a3?q=80&w=600',
    alt: t('home.hero.carousel.slides.cheese.alt'),
    link: '/products?category=cheese',
  },
])

// Methods
const handleSlideChange = ({ currentSlideIndex }: { currentSlideIndex: number }) => {
  currentSlide.value = currentSlideIndex
}

const goToSlide = (slideIndex: number) => {
  if (carouselRef.value) {
    carouselRef.value.slideTo(slideIndex)
  }
}
</script>

<style scoped>
/* Amazon-style horizontal scrolling carousel */
:deep(.carousel__viewport) {
  overflow: visible;
}

:deep(.carousel__track) {
  display: flex;
  gap: 0;
  align-items: stretch;
}

:deep(.carousel__slide) {
  flex: 0 0 auto;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

/* Hide default navigation - using swipe/drag only like Amazon */
:deep(.carousel__prev),
:deep(.carousel__next) {
  display: none;
}

/* Enable smooth scrolling */
.amazon-carousel {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Custom scrollbar styling (optional) */
:deep(.carousel__viewport)::-webkit-scrollbar {
  display: none;
}

:deep(.carousel__viewport) {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
