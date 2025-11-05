<template>
  <div class="relative group">
    <Carousel
      :items-to-show="1"
      :autoplay="5000"
      :wrap-around="true"
      :transition="700"
      class="relative overflow-hidden"
    >
      <!-- Modern Amazon-style slides with glassmorphism -->
      <Slide v-for="(slide, index) in slides" :key="index">
        <div class="relative h-full w-full">
          <!-- Image with subtle zoom animation -->
          <NuxtImg
            :src="slide.image"
            :alt="slide.alt"
            densities="1x 2x"
            class="h-[500px] w-full object-cover md:h-[600px] lg:h-[700px] transition-transform duration-[8000ms] ease-out scale-105 animate-ken-burns"
            loading="eager"
            :preload="index === 0"
          />

          <!-- Modern layered gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-r" :class="slide.gradientClass"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

          <!-- Glassmorphism content overlay -->
          <div class="absolute inset-0 flex items-center">
            <div class="container mx-auto px-6 lg:px-8">
              <div class="max-w-3xl">
                <!-- Modern badge with glassmorphism -->
                <div
                  class="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-base font-medium backdrop-blur-md border border-white/20 shadow-lg"
                  :class="slide.badgeClass"
                >
                  <commonIcon :name="slide.badgeIcon" class="h-5 w-5" />
                  <span>{{ slide.badge }}</span>
                </div>

                <!-- Bold title with text shadow for depth -->
                <h2 class="mt-6 text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl drop-shadow-2xl">
                  {{ slide.title }}
                </h2>

                <!-- Description with subtle shadow -->
                <p class="mt-6 text-xl text-white/95 md:text-2xl lg:text-3xl drop-shadow-lg font-light">
                  {{ slide.description }}
                </p>

                <!-- Modern CTA with hover animation -->
                <NuxtLink
                  :to="localePath(slide.ctaLink)"
                  class="group/cta mt-8 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-semibold text-primary-700 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.3)] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  {{ slide.ctaText }}
                  <commonIcon name="lucide:arrow-right" class="h-6 w-6 transition-transform duration-300 group-hover/cta:translate-x-1" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      <!-- Modern glassmorphic navigation -->
      <template #addons>
        <Navigation>
          <template #prev>
            <button
              class="absolute left-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-4 text-white backdrop-blur-xl border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent opacity-0 group-hover:opacity-100 shadow-2xl"
              aria-label="Previous slide"
            >
              <commonIcon name="lucide:chevron-left" class="h-8 w-8" />
            </button>
          </template>
          <template #next>
            <button
              class="absolute right-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-4 text-white backdrop-blur-xl border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent opacity-0 group-hover:opacity-100 shadow-2xl"
              aria-label="Next slide"
            >
              <commonIcon name="lucide:chevron-right" class="h-8 w-8" />
            </button>
          </template>
        </Navigation>

        <!-- Modern glassmorphic pagination -->
        <Pagination class="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-3 rounded-full bg-black/20 backdrop-blur-md px-4 py-3 border border-white/10">
          <template #default="{ slidesCount, currentSlide }">
            <button
              v-for="n in slidesCount"
              :key="n"
              @click="() => {}"
              :class="[
                'rounded-full transition-all duration-300',
                currentSlide === n - 1
                  ? 'h-3 w-10 bg-white shadow-lg shadow-white/50'
                  : 'h-3 w-3 bg-white/40 hover:bg-white/60 hover:scale-110'
              ]"
              :aria-label="`Go to slide ${n}`"
            />
          </template>
        </Pagination>
      </template>
    </Carousel>

    <!-- Modern glassmorphic floating card -->
    <div class="absolute bottom-8 right-8 hidden rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 text-white shadow-2xl lg:block max-w-sm transition-all duration-300 hover:scale-105 hover:bg-slate-900/50">
      <div class="flex items-center gap-4">
        <div class="rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 p-4 text-emerald-300 backdrop-blur-sm border border-emerald-400/20">
          <commonIcon name="lucide:truck" class="h-8 w-8" />
        </div>
        <div>
          <p class="text-base font-semibold">{{ t('home.hero.cards.delivery.title') }}</p>
          <p class="text-sm text-white/70">{{ t('home.hero.cards.delivery.highlight') }}</p>
        </div>
      </div>
      <p class="mt-4 text-sm text-white/80 leading-relaxed">{{ t('home.hero.cards.delivery.description') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

const { t } = useI18n()
const localePath = useLocalePath()

// Modern carousel slides with enhanced visuals
const slides = [
  {
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1200',
    alt: 'Premium Moldovan wines collection',
    badge: 'Premium Selection',
    badgeIcon: 'lucide:wine',
    badgeClass: 'bg-purple-500/20 text-purple-100',
    title: 'Premium Moldovan Wines',
    description: 'Discover award-winning wines from the heart of Moldova',
    ctaText: 'Explore Wines',
    ctaLink: '/products?category=wines',
    gradientClass: 'from-purple-900/70 via-purple-900/40 to-transparent'
  },
  {
    image: 'https://images.unsplash.com/photo-1599974579688-8dbdd243c6b0?q=80&w=1200',
    alt: 'Artisan Moldovan foods and delicacies',
    badge: 'New Arrivals',
    badgeIcon: 'lucide:sparkles',
    badgeClass: 'bg-amber-500/20 text-amber-100',
    title: 'Artisan Delicacies',
    description: 'Authentic flavors crafted by traditional Moldovan producers',
    ctaText: 'Shop Delicacies',
    ctaLink: '/products?category=foods',
    gradientClass: 'from-amber-900/70 via-amber-900/40 to-transparent'
  },
  {
    image: 'https://images.unsplash.com/photo-1549388604-817d8e8310bb?q=80&w=1200',
    alt: 'Curated gift hampers with Moldovan products',
    badge: 'Perfect Gifts',
    badgeIcon: 'lucide:gift',
    badgeClass: 'bg-rose-500/20 text-rose-100',
    title: 'Curated Gift Hampers',
    description: 'Thoughtfully assembled collections for every occasion',
    ctaText: 'Browse Gifts',
    ctaLink: '/products?category=hampers',
    gradientClass: 'from-rose-900/70 via-rose-900/40 to-transparent'
  },
  {
    image: 'https://images.unsplash.com/photo-1452251889946-8ff5ea7f27a3?q=80&w=1200',
    alt: 'Traditional Moldovan cheeses and dairy',
    badge: 'Best Sellers',
    badgeIcon: 'lucide:star',
    badgeClass: 'bg-emerald-500/20 text-emerald-100',
    title: 'Traditional Cheeses',
    description: 'Handcrafted dairy products from family farms',
    ctaText: 'Discover More',
    ctaLink: '/products',
    gradientClass: 'from-emerald-900/70 via-emerald-900/40 to-transparent'
  }
]
</script>

<style scoped>
/* Custom carousel styling with modern effects */
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
  display: none; /* Hide default pagination, using custom glassmorphic ones */
}

/* Subtle Ken Burns zoom effect for images */
@keyframes ken-burns {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

.animate-ken-burns {
  animation: ken-burns 8s ease-out infinite alternate;
}

/* Glassmorphism effect for better browser support */
@supports (backdrop-filter: blur(10px)) or (-webkit-backdrop-filter: blur(10px)) {
  .backdrop-blur-xl {
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .backdrop-blur-md {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
}
</style>
