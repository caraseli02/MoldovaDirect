<template>
  <div class="relative w-full bg-white dark:bg-gray-900">
    <Carousel
      :items-to-show="1"
      :autoplay="5000"
      :wrap-around="true"
      :transition="500"
      class="relative"
    >
      <Slide v-for="(slide, index) in slides" :key="index">
        <div class="relative w-full">
          <!-- Full-width image like Amazon -->
          <NuxtImg
            :src="slide.image"
            :alt="slide.alt"
            densities="1x 2x"
            class="h-[400px] w-full object-cover sm:h-[450px] md:h-[500px] lg:h-[600px]"
            loading="eager"
            :preload="index === 0"
          />

          <!-- Simple gradient overlay for text readability (Amazon style) -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

          <!-- Minimal content overlay - Amazon keeps it simple -->
          <div class="absolute inset-0 flex items-end pb-12 lg:pb-16">
            <div class="container mx-auto px-6 lg:px-8">
              <div class="max-w-xl">
                <h2 class="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                  {{ slide.title }}
                </h2>
                <p class="mt-3 text-lg text-white sm:text-xl lg:text-2xl">
                  {{ slide.description }}
                </p>
                <!-- Amazon-style simple button -->
                <NuxtLink
                  :to="localePath(slide.ctaLink)"
                  class="mt-6 inline-block rounded bg-white px-8 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
                >
                  {{ slide.ctaText }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      <!-- Amazon-style navigation arrows - always visible -->
      <template #addons>
        <Navigation>
          <template #prev>
            <!-- Amazon uses large, always-visible white rectangular buttons on the left edge -->
            <button
              class="absolute left-0 top-0 z-10 flex h-full w-16 items-center justify-center bg-gradient-to-r from-white/95 to-white/0 transition-colors hover:from-white dark:from-gray-900/95 dark:to-gray-900/0 dark:hover:from-gray-900"
              aria-label="Previous slide"
            >
              <div class="flex h-12 w-12 items-center justify-center rounded-sm bg-white shadow-lg dark:bg-gray-800">
                <commonIcon name="lucide:chevron-left" class="h-8 w-8 text-gray-800 dark:text-gray-200" />
              </div>
            </button>
          </template>
          <template #next>
            <!-- Amazon uses large, always-visible white rectangular buttons on the right edge -->
            <button
              class="absolute right-0 top-0 z-10 flex h-full w-16 items-center justify-center bg-gradient-to-l from-white/95 to-white/0 transition-colors hover:from-white dark:from-gray-900/95 dark:to-gray-900/0 dark:hover:from-gray-900"
              aria-label="Next slide"
            >
              <div class="flex h-12 w-12 items-center justify-center rounded-sm bg-white shadow-lg dark:bg-gray-800">
                <commonIcon name="lucide:chevron-right" class="h-8 w-8 text-gray-800 dark:text-gray-200" />
              </div>
            </button>
          </template>
        </Navigation>
      </template>
    </Carousel>
  </div>
</template>

<script setup lang="ts">
import { Carousel, Slide, Navigation } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

const localePath = useLocalePath()

// Amazon-style simple, product-focused slides
const slides = [
  {
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1920',
    alt: 'Premium Moldovan wines collection',
    title: 'Premium Moldovan Wines',
    description: 'Discover award-winning wines from the heart of Moldova',
    ctaText: 'Shop now',
    ctaLink: '/products?category=wines'
  },
  {
    image: 'https://images.unsplash.com/photo-1599974579688-8dbdd243c6b0?q=80&w=1920',
    alt: 'Artisan Moldovan foods and delicacies',
    title: 'Artisan Delicacies',
    description: 'Authentic flavors from traditional producers',
    ctaText: 'Shop now',
    ctaLink: '/products?category=foods'
  },
  {
    image: 'https://images.unsplash.com/photo-1549388604-817d8e8310bb?q=80&w=1920',
    alt: 'Curated gift hampers',
    title: 'Gift Hampers',
    description: 'Thoughtfully curated Moldovan collections',
    ctaText: 'Shop now',
    ctaLink: '/products?category=hampers'
  },
  {
    image: 'https://images.unsplash.com/photo-1452251889946-8ff5ea7f27a3?q=80&w=1920',
    alt: 'Traditional cheeses',
    title: 'Traditional Cheeses',
    description: 'Handcrafted dairy from family farms',
    ctaText: 'Shop now',
    ctaLink: '/products'
  }
]
</script>

<style scoped>
/* Amazon-style clean carousel */
:deep(.carousel__prev),
:deep(.carousel__next) {
  background: transparent;
  border: none;
}

:deep(.carousel__track) {
  /* Ensure smooth transitions */
  transition-timing-function: ease-in-out;
}

/* Hide default pagination - Amazon doesn't use dots */
:deep(.carousel__pagination) {
  display: none;
}
</style>
