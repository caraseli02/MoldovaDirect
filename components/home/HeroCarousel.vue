<template>
  <div class="relative group">
    <Carousel
      :items-to-show="1"
      :autoplay="5000"
      :wrap-around="true"
      :transition="700"
      class="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl"
    >
      <!-- Slide 1: Premium Wines -->
      <Slide v-for="(slide, index) in slides" :key="index">
        <div class="relative h-full w-full">
          <NuxtImg
            :src="slide.image"
            :alt="slide.alt"
            densities="1x 2x"
            class="h-[400px] w-full object-cover md:h-[500px] lg:h-[600px]"
            loading="eager"
            :preload="index === 0"
          />
          <!-- Gradient overlay for better text readability -->
          <div
            class="absolute inset-0 bg-gradient-to-r"
            :class="slide.gradientClass"
          ></div>

          <!-- Content overlay -->
          <div class="absolute inset-0 flex items-center">
            <div class="container mx-auto px-6">
              <div class="max-w-2xl">
                <!-- Badge -->
                <div
                  class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium backdrop-blur-sm"
                  :class="slide.badgeClass"
                >
                  <commonIcon :name="slide.badgeIcon" class="h-4 w-4" />
                  <span>{{ slide.badge }}</span>
                </div>

                <!-- Title -->
                <h2 class="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                  {{ slide.title }}
                </h2>

                <!-- Description -->
                <p class="mt-4 text-lg text-white/90 md:text-xl lg:text-2xl">
                  {{ slide.description }}
                </p>

                <!-- CTA Button -->
                <NuxtLink
                  :to="localePath(slide.ctaLink)"
                  class="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-primary-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  {{ slide.ctaText }}
                  <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      <!-- Navigation - Previous Button -->
      <template #addons>
        <Navigation>
          <template #prev>
            <button
              class="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 opacity-0 group-hover:opacity-100 duration-300"
              aria-label="Previous slide"
            >
              <commonIcon name="lucide:chevron-left" class="h-6 w-6" />
            </button>
          </template>
          <template #next>
            <button
              class="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 opacity-0 group-hover:opacity-100 duration-300"
              aria-label="Next slide"
            >
              <commonIcon name="lucide:chevron-right" class="h-6 w-6" />
            </button>
          </template>
        </Navigation>

        <!-- Pagination Dots -->
        <Pagination class="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          <template #default="{ slidesCount, currentSlide }">
            <button
              v-for="n in slidesCount"
              :key="n"
              @click="() => {}"
              :class="[
                'h-2 rounded-full transition-all duration-300',
                currentSlide === n - 1
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/40 hover:bg-white/60'
              ]"
              :aria-label="`Go to slide ${n}`"
            />
          </template>
        </Pagination>
      </template>
    </Carousel>

    <!-- Floating card (like the delivery card in original hero) -->
    <div class="absolute bottom-6 right-6 hidden rounded-3xl border border-white/10 bg-slate-950/75 p-6 text-white shadow-lg backdrop-blur lg:block">
      <div class="flex items-center gap-3">
        <div class="rounded-full bg-emerald-500/20 p-3 text-emerald-300">
          <commonIcon name="lucide:truck" class="h-6 w-6" />
        </div>
        <div>
          <p class="text-sm font-semibold">{{ t('home.hero.cards.delivery.title') }}</p>
          <p class="text-xs text-white/70">{{ t('home.hero.cards.delivery.highlight') }}</p>
        </div>
      </div>
      <p class="mt-3 text-xs text-white/70">{{ t('home.hero.cards.delivery.description') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

const { t } = useI18n()
const localePath = useLocalePath()

// Amazon-style carousel slides with different product categories
const slides = [
  {
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1200',
    alt: 'Premium Moldovan wines collection',
    badge: 'Premium Selection',
    badgeIcon: 'lucide:wine',
    badgeClass: 'bg-purple-500/20 text-purple-200 ring-1 ring-purple-300/30',
    title: 'Premium Moldovan Wines',
    description: 'Discover award-winning wines from the heart of Moldova',
    ctaText: 'Explore Wines',
    ctaLink: '/products?category=wines',
    gradientClass: 'from-purple-900/80 via-purple-900/50 to-transparent'
  },
  {
    image: 'https://images.unsplash.com/photo-1599974579688-8dbdd243c6b0?q=80&w=1200',
    alt: 'Artisan Moldovan foods and delicacies',
    badge: 'New Arrivals',
    badgeIcon: 'lucide:sparkles',
    badgeClass: 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-300/30',
    title: 'Artisan Delicacies',
    description: 'Authentic flavors crafted by traditional Moldovan producers',
    ctaText: 'Shop Delicacies',
    ctaLink: '/products?category=foods',
    gradientClass: 'from-amber-900/80 via-amber-900/50 to-transparent'
  },
  {
    image: 'https://images.unsplash.com/photo-1549388604-817d8e8310bb?q=80&w=1200',
    alt: 'Curated gift hampers with Moldovan products',
    badge: 'Perfect Gifts',
    badgeIcon: 'lucide:gift',
    badgeClass: 'bg-rose-500/20 text-rose-200 ring-1 ring-rose-300/30',
    title: 'Curated Gift Hampers',
    description: 'Thoughtfully assembled collections for every occasion',
    ctaText: 'Browse Gifts',
    ctaLink: '/products?category=hampers',
    gradientClass: 'from-rose-900/80 via-rose-900/50 to-transparent'
  },
  {
    image: 'https://images.unsplash.com/photo-1452251889946-8ff5ea7f27a3?q=80&w=1200',
    alt: 'Traditional Moldovan cheeses and dairy',
    badge: 'Best Sellers',
    badgeIcon: 'lucide:star',
    badgeClass: 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-300/30',
    title: 'Traditional Cheeses',
    description: 'Handcrafted dairy products from family farms',
    ctaText: 'Discover More',
    ctaLink: '/products',
    gradientClass: 'from-emerald-900/80 via-emerald-900/50 to-transparent'
  }
]
</script>

<style scoped>
/* Custom carousel styling to match your design system */
:deep(.carousel__prev),
:deep(.carousel__next) {
  background: transparent;
  border: none;
  color: white;
}

:deep(.carousel__pagination) {
  padding: 0;
  margin: 0;
}

:deep(.carousel__pagination-button) {
  display: none; /* Hide default pagination buttons, we're using custom ones */
}
</style>
