<template>
  <section class="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 py-16 md:py-24">
    <!-- Background Decoration -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute left-0 top-0 h-96 w-96 rounded-full bg-primary blur-3xl"></div>
      <div class="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/50 blur-3xl"></div>
    </div>

    <div class="container relative">
      <!-- Section Header -->
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
        <p class="mt-4 text-lg text-slate-600">
          {{ t('wineStory.producers.subtitle') }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 3" :key="i" class="h-[500px] animate-pulse rounded-2xl bg-slate-200"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="mt-12 rounded-lg bg-red-50 p-6 text-center">
        <commonIcon name="lucide:alert-circle" class="mx-auto h-12 w-12 text-red-500" />
        <p class="mt-2 text-lg font-medium text-red-900">{{ t('wineStory.producers.error') }}</p>
        <p class="mt-1 text-sm text-red-700">{{ error }}</p>
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
        class="relative mt-12"
      >
        <!-- Swiper Container -->
        <Swiper
          :modules="[SwiperAutoplay, SwiperNavigation, SwiperPagination, SwiperA11y]"
          :slides-per-view="1"
          :space-between="24"
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
            1280: {
              slidesPerView: 3,
              spaceBetween: 32,
            },
          }"
          :a11y="{
            prevSlideMessage: t('common.previous'),
            nextSlideMessage: t('common.next'),
          }"
          class="producer-stories-swiper"
          @swiper="onSwiper"
          @slideChange="onSlideChange"
        >
          <SwiperSlide
            v-for="producer in featuredProducers"
            :key="producer.id"
            class="h-auto"
          >
            <ProducerCard
              :producer="producer"
              @click="openProducerModal"
            />
          </SwiperSlide>
        </Swiper>

        <!-- Custom Navigation Buttons -->
        <button
          class="swiper-button-prev-custom absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all hover:scale-110 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 md:-left-4 lg:-left-6"
          :aria-label="t('common.previous')"
        >
          <commonIcon name="lucide:chevron-left" class="h-6 w-6 text-slate-700" />
        </button>

        <button
          class="swiper-button-next-custom absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all hover:scale-110 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 md:-right-4 lg:-right-6"
          :aria-label="t('common.next')"
        >
          <commonIcon name="lucide:chevron-right" class="h-6 w-6 text-slate-700" />
        </button>

        <!-- Custom Pagination -->
        <div class="swiper-pagination-custom mt-8 flex justify-center"></div>

        <!-- Keyboard/Touch Hints -->
        <div class="mt-8 flex flex-wrap justify-center gap-4 text-sm text-slate-500">
          <span class="inline-flex items-center gap-2">
            <commonIcon name="lucide:mouse-pointer-2" class="h-4 w-4" />
            {{ t('wineStory.producers.swipeHint') }}
          </span>
          <span class="hidden items-center gap-2 md:inline-flex">
            <commonIcon name="lucide:keyboard" class="h-4 w-4" />
            {{ t('wineStory.producers.keyboardHint') }}
          </span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="mt-12 rounded-lg bg-slate-100 p-12 text-center">
        <commonIcon name="lucide:wine" class="mx-auto h-16 w-16 text-slate-400" />
        <p class="mt-4 text-lg font-medium text-slate-600">{{ t('wineStory.producers.noProducers') }}</p>
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
  // console.log('Slide changed to:', swiperInstance.value?.activeIndex)
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
  } else if (event.key === 'ArrowRight') {
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

/* Pagination Styles */
.swiper-pagination-custom :deep(.swiper-pagination-bullet) {
  height: 0.5rem;
  width: 0.5rem;
  background-color: rgb(203 213 225);
  opacity: 1;
  transition: all 0.2s ease;
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
