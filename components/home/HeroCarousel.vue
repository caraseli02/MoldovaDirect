<template>
  <div class="w-full bg-white py-4 dark:bg-gray-900">
    <div class="container mx-auto px-4">
      <Carousel
        :items-to-show="1"
        :autoplay="4000"
        :wrap-around="true"
        :transition="500"
        :breakpoints="{
          640: { itemsToShow: 1.5, snapAlign: 'start' },
          768: { itemsToShow: 2.2, snapAlign: 'start' },
          1024: { itemsToShow: 3, snapAlign: 'start' }
        }"
        snap-align="start"
        class="amazon-carousel"
      >
        <!-- Card 1: Shop Holiday Gift Guides (Red) -->
        <Slide v-for="(card, index) in cards" :key="index">
          <div class="px-2">
            <NuxtLink
              :to="localePath(card.link)"
              class="group relative block h-[400px] overflow-hidden rounded-3xl shadow-lg transition-all duration-300 hover:shadow-2xl sm:h-[450px] lg:h-[500px]"
              :style="{ backgroundColor: card.bgColor }"
            >
              <!-- Large Product Image - fills entire card -->
              <NuxtImg
                :src="card.image"
                :alt="card.alt"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />

              <!-- Title overlaid on top-left of image -->
              <div class="absolute left-6 top-6 max-w-[70%] sm:left-8 sm:top-8 lg:left-10 lg:top-10">
                <h2 class="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl" :class="card.textColor">
                  {{ card.title }}
                </h2>
              </div>
            </NuxtLink>
          </div>
        </Slide>
      </Carousel>

      <!-- Navigation Dots -->
      <div class="mt-6 flex justify-center gap-2">
        <div
          v-for="n in cards.length"
          :key="n"
          class="h-2 w-2 rounded-full bg-gray-300 transition-all duration-300 dark:bg-gray-600"
          :class="{ 'w-8 bg-gray-800 dark:bg-gray-400': false }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Carousel, Slide } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

const localePath = useLocalePath()

// Amazon-style horizontal scrolling cards with vibrant backgrounds
const cards = [
  {
    title: 'Shop holiday gift guides',
    bgColor: '#C73341',
    textColor: 'text-white',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600',
    alt: 'Wrapped gift boxes',
    link: '/products?category=gifts'
  },
  {
    title: 'Premium Moldovan wines',
    bgColor: '#2C5F2D',
    textColor: 'text-white',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=600',
    alt: 'Wine bottles collection',
    link: '/products?category=wines'
  },
  {
    title: 'Start looking sharp',
    bgColor: '#D4B896',
    textColor: 'text-gray-900',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600',
    alt: 'Clothing rack display',
    link: '/products?category=clothing'
  },
  {
    title: 'Kitchen must-haves',
    bgColor: '#E8E8E8',
    textColor: 'text-gray-900',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600',
    alt: 'Kitchen appliances',
    link: '/products?category=kitchen'
  },
  {
    title: 'Artisan delicacies',
    bgColor: '#FFA94D',
    textColor: 'text-gray-900',
    image: 'https://images.unsplash.com/photo-1599974579688-8dbdd243c6b0?q=80&w=600',
    alt: 'Artisan food products',
    link: '/products?category=foods'
  },
  {
    title: 'Traditional cheeses',
    bgColor: '#4A6FA5',
    textColor: 'text-white',
    image: 'https://images.unsplash.com/photo-1452251889946-8ff5ea7f27a3?q=80&w=600',
    alt: 'Traditional cheese selection',
    link: '/products?category=cheese'
  }
]
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
