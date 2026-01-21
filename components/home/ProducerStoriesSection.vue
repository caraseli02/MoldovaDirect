<template>
  <section class="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 py-16 md:py-24">
    <!-- Background Decoration - Reduced opacity for subtlety -->
    <div class="absolute inset-0 opacity-[0.03]">
      <div class="absolute left-0 top-0 h-96 w-96 rounded-full bg-primary blur-3xl"></div>
      <div class="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/50 blur-3xl"></div>
    </div>

    <div class="container relative">
      <!-- Section Header - More compact spacing -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{
          opacity: 1,
          y: 0,
          transition: { duration: 600 },
        }"
        class="mx-auto max-w-3xl text-center"
      >
        <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
          {{ t('wineStory.producers.title') }}
        </h2>
        <p class="mt-4 text-base leading-relaxed text-slate-600 md:mt-6 md:text-lg">
          {{ t('wineStory.producers.subtitle') }}
        </p>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="mt-8 grid gap-4 md:mt-12 md:grid-cols-2 md:gap-6 lg:grid-cols-3"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="h-[420px] animate-pulse rounded-2xl bg-slate-200 md:h-[480px]"
        ></div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="mt-8 rounded-lg bg-red-50 p-6 text-center md:mt-12"
      >
        <commonIcon
          name="lucide:alert-circle"
          class="mx-auto h-12 w-12 text-red-500"
        />
        <p class="mt-2 text-lg font-medium text-red-900">
          {{ t('wineStory.producers.error') }}
        </p>
        <p class="mt-1 text-sm text-red-700">
          {{ error }}
        </p>
      </div>

      <!-- Producer Carousel -->
      <div
        v-else-if="featuredProducers.length > 0"
        v-motion
        :initial="{ opacity: 0, y: 40 }"
        :visible="{
          opacity: 1,
          y: 0,
          transition: { duration: 600, delay: 200 },
        }"
        class="relative mt-8 md:mt-12"
      >
        <!-- Swiper Container -->
        <Swiper
          :modules="[SwiperAutoplay, SwiperNavigation, SwiperPagination, SwiperA11y]"
          :slides-per-view="1"
          :space-between="16"
          :loop="featuredProducers.length > 3"
          :autoplay="{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }"
          :navigation="{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }"
          :pagination="{
            el: '.swiper-pagination-custom',
            clickable: true,
            dynamicBullets: true,
          }"
          :breakpoints="{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
          }"
          :a11y="{
            prevSlideMessage: t('common.previous'),
            nextSlideMessage: t('common.next'),
          }"
          class="producer-stories-swiper"
          @swiper="onSwiper"
          @slide-change="onSlideChange"
        >
          <SwiperSlide
            v-for="producer in featuredProducers"
            :key="producer.id"
            class="h-auto"
          >
            <ProducerCard
              :producer="producer as Producer"
              @click="openProducerModal"
            />
          </SwiperSlide>
        </Swiper>

        <!-- Custom Navigation Buttons - Mobile optimized positioning -->
        <UiButton :aria-label="t('common.previous')">
          <commonIcon
            name="lucide:chevron-left"
            class="h-5 w-5 text-slate-700 transition-colors hover:text-gold-600 md:h-6 md:w-6"
          />
        </UiButton>

        <UiButton :aria-label="t('common.next')">
          <commonIcon
            name="lucide:chevron-right"
            class="h-5 w-5 text-slate-700 transition-colors hover:text-gold-600 md:h-6 md:w-6"
          />
        </UiButton>

        <!-- Custom Pagination -->
        <div class="swiper-pagination-custom mt-6 flex justify-center md:mt-8"></div>

        <!-- Keyboard/Touch Hints - Smaller on mobile -->
        <div class="mt-6 flex flex-wrap justify-center gap-3 text-xs text-slate-500 md:gap-4 md:text-sm">
          <span class="inline-flex items-center gap-1.5 md:gap-2">
            <commonIcon
              name="lucide:mouse-pointer-2"
              class="h-3.5 w-3.5 md:h-4 md:w-4"
            />
            {{ t('wineStory.producers.swipeHint') }}
          </span>
          <span class="hidden items-center gap-2 md:inline-flex">
            <commonIcon
              name="lucide:keyboard"
              class="h-4 w-4"
            />
            {{ t('wineStory.producers.keyboardHint') }}
          </span>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="mt-8 rounded-lg bg-slate-100 p-12 text-center md:mt-12"
      >
        <commonIcon
          name="lucide:wine"
          class="mx-auto h-16 w-16 text-slate-400"
        />
        <p class="mt-4 text-lg font-medium text-slate-600">
          {{ t('wineStory.producers.noProducers') }}
        </p>
      </div>
    </div>

    <!-- Producer Detail Modal -->
    <ProducerDetailModal
      v-model:open="isModalOpen"
      :producer="selectedProducer"
    />
  </section>
</template>

<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import type { Producer } from '~/types'
import type { Swiper as SwiperType } from 'swiper'

const { t } = useI18n()

// Producer data
const { featuredProducers, loading, error, fetchProducers } = useProducers()

// Modal state
const isModalOpen = ref(false)
const selectedProducer = ref<Producer | null>(null)

// Swiper instance
const swiperInstance = ref<SwiperType | null>(null)

// Fetch producers on mount
onMounted(async () => {
  await fetchProducers()
})

// Handle swiper instance
const onSwiper = (swiper: SwiperType) => {
  swiperInstance.value = swiper
}

// Handle slide change (for analytics, etc.)
const onSlideChange = () => {
  // Could track analytics here if needed
}

// Open producer modal
const openProducerModal = (producer: Producer) => {
  selectedProducer.value = producer
  isModalOpen.value = true
}

// Keyboard navigation for accessibility
useEventListener('keydown', (event: KeyboardEvent) => {
  if (!swiperInstance.value || isModalOpen.value) return

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    swiperInstance.value.slidePrev()
  }
  else if (event.key === 'ArrowRight') {
    event.preventDefault()
    swiperInstance.value.slideNext()
  }
})
</script>

<style scoped>
/* Custom Swiper Styles */
.producer-stories-swiper :deep(.swiper-slide) {
  height: auto;
  display: flex;
}

/* Pagination Styles - WCAG 2.5.5 compliant touch targets (44x44px) */
.swiper-pagination-custom :deep(.swiper-pagination-bullet) {
  height: 0.5rem;
  width: 0.5rem;
  background-color: rgb(203 213 225);
  opacity: 1;
  transition: all 0.2s ease;
  /* Expand clickable area to meet WCAG 2.5.5 minimum touch target */
  padding: 1.125rem; /* (44px - 8px) / 2 = 18px = 1.125rem */
  cursor: pointer;
}

.swiper-pagination-custom :deep(.swiper-pagination-bullet-active) {
  width: 2rem;
  background-color: var(--color-primary);
}

.swiper-pagination-custom :deep(.swiper-pagination-bullet-active-main) {
  background-color: var(--color-primary);
  filter: brightness(0.9);
}

/* Ensure cards stretch full height */
.producer-stories-swiper :deep(.swiper-slide > *) {
  height: 100%;
}

/* Navigation button states */
.swiper-button-prev-custom:disabled,
.swiper-button-next-custom:disabled {
  cursor: not-allowed;
  opacity: 0.3;
}
</style>
