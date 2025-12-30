<template>
  <section class="producer-stories-section">
    <div class="container">
      <!-- Section Header -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{
          opacity: 1,
          y: 0,
          transition: { duration: 600 },
        }"
        class="section-header"
      >
        <div class="section-badge">
          <span class="badge-line"></span>
          <commonIcon
            name="lucide:users"
            class="badge-icon"
          />
          <span>{{ t('wineStory.producers.badge', 'Our Producers') }}</span>
          <span class="badge-line"></span>
        </div>

        <h2 class="section-title">
          {{ t('wineStory.producers.title') }}
        </h2>
        <p class="section-subtitle">
          {{ t('wineStory.producers.subtitle') }}
        </p>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="loading-grid"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="loading-card"
        ></div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="error-state"
      >
        <commonIcon
          name="lucide:alert-circle"
          class="error-icon"
        />
        <p class="error-title">
          {{ t('wineStory.producers.error') }}
        </p>
        <p class="error-message">
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
        class="carousel-wrapper"
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
          class="producer-swiper"
          @swiper="onSwiper"
          @slide-change="onSlideChange"
        >
          <SwiperSlide
            v-for="producer in featuredProducers"
            :key="producer.id"
            class="swiper-slide-height"
          >
            <ProducerCard
              :producer="producer as Producer"
              @click="openProducerModal"
            />
          </SwiperSlide>
        </Swiper>

        <!-- Custom Navigation Buttons -->
        <button
          class="nav-button nav-prev swiper-button-prev-custom"
          :aria-label="t('common.previous')"
        >
          <commonIcon
            name="lucide:chevron-left"
            class="nav-icon"
          />
        </button>

        <button
          class="nav-button nav-next swiper-button-next-custom"
          :aria-label="t('common.next')"
        >
          <commonIcon
            name="lucide:chevron-right"
            class="nav-icon"
          />
        </button>

        <!-- Custom Pagination -->
        <div class="swiper-pagination-custom pagination-dots"></div>

        <!-- Keyboard/Touch Hints -->
        <div class="interaction-hints">
          <span class="hint-item">
            <commonIcon
              name="lucide:mouse-pointer-2"
              class="hint-icon"
            />
            {{ t('wineStory.producers.swipeHint') }}
          </span>
          <span class="hint-item hint-desktop">
            <commonIcon
              name="lucide:keyboard"
              class="hint-icon"
            />
            {{ t('wineStory.producers.keyboardHint') }}
          </span>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="empty-state"
      >
        <commonIcon
          name="lucide:wine"
          class="empty-icon"
        />
        <p class="empty-text">
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

// Handle slide change
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
/* ===== SECTION ===== */
.producer-stories-section {
  position: relative;
  padding: 6rem 0;
  background: linear-gradient(to bottom, #fff 0%, var(--md-cream) 100%);
  overflow: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* ===== SECTION HEADER ===== */
.section-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 4rem;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(201, 162, 39, 0.1);
  border: 1px solid rgba(201, 162, 39, 0.2);
  border-radius: var(--md-radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--md-gold);
  margin-bottom: 2rem;
}

.badge-line {
  width: 24px;
  height: 1px;
  background: var(--md-gradient-gold-line);
}

.badge-icon {
  width: 18px;
  height: 18px;
  color: var(--md-gold);
}

.section-title {
  font-family: var(--md-font-serif);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: var(--md-tracking-tight);
  color: var(--md-charcoal);
  margin-bottom: 1.5rem;
}

.section-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.6;
  color: rgba(10, 10, 10, 0.7);
}

/* ===== LOADING STATE ===== */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 3rem;
}

.loading-card {
  height: 420px;
  background: linear-gradient(90deg, rgba(10, 10, 10, 0.05) 0%, rgba(10, 10, 10, 0.1) 50%, rgba(10, 10, 10, 0.05) 100%);
  background-size: 200% 100%;
  border-radius: var(--md-radius-2xl);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===== ERROR STATE ===== */
.error-state {
  margin-top: 3rem;
  padding: 3rem;
  text-align: center;
  background: rgba(220, 38, 38, 0.05);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: var(--md-radius-2xl);
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #dc2626;
  margin: 0 auto;
}

.error-title {
  margin-top: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #991b1b;
}

.error-message {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #b91c1c;
}

/* ===== CAROUSEL ===== */
.carousel-wrapper {
  position: relative;
  margin-top: 3rem;
}

.producer-swiper :deep(.swiper-slide) {
  height: auto;
  display: flex;
}

.swiper-slide-height {
  height: auto;
}

.producer-swiper :deep(.swiper-slide > *) {
  height: 100%;
}

/* ===== NAVIGATION BUTTONS ===== */
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #fff;
  border: 1px solid rgba(10, 10, 10, 0.1);
  border-radius: 50%;
  box-shadow: var(--md-shadow-lg);
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-button:hover {
  background: var(--md-gold);
  border-color: var(--md-gold);
  transform: translateY(-50%) scale(1.1);
  box-shadow: var(--md-shadow-gold-lg);
}

.nav-button:hover .nav-icon {
  color: #fff;
}

.nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-button:disabled:hover {
  transform: translateY(-50%);
  background: #fff;
}

.nav-prev {
  left: -24px;
}

.nav-next {
  right: -24px;
}

.nav-icon {
  width: 24px;
  height: 24px;
  color: var(--md-charcoal);
  transition: color 0.3s ease;
}

/* ===== PAGINATION ===== */
.pagination-dots {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.pagination-dots :deep(.swiper-pagination-bullet) {
  width: 8px;
  height: 8px;
  background: rgba(10, 10, 10, 0.2);
  opacity: 1;
  transition: all 0.3s ease;
  margin: 0 4px;
  cursor: pointer;
}

.pagination-dots :deep(.swiper-pagination-bullet-active) {
  width: 32px;
  background: var(--md-gold);
  border-radius: 4px;
}

/* ===== INTERACTION HINTS ===== */
.interaction-hints {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  font-size: 0.875rem;
  color: rgba(10, 10, 10, 0.5);
}

.hint-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.hint-icon {
  width: 16px;
  height: 16px;
}

.hint-desktop {
  display: none;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  margin-top: 3rem;
  padding: 4rem 2rem;
  text-align: center;
  background: rgba(10, 10, 10, 0.03);
  border-radius: var(--md-radius-2xl);
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: rgba(10, 10, 10, 0.2);
  margin: 0 auto;
}

.empty-text {
  margin-top: 1.5rem;
  font-size: 1.125rem;
  font-weight: 500;
  color: rgba(10, 10, 10, 0.5);
}

/* ===== RESPONSIVE ===== */
@media (min-width: 768px) {
  .producer-stories-section {
    padding: 8rem 0;
  }

  .hint-desktop {
    display: inline-flex;
  }

  .nav-prev {
    left: -64px;
  }

  .nav-next {
    right: -64px;
  }
}

@media (max-width: 1024px) {
  .nav-prev {
    left: 8px;
  }

  .nav-next {
    right: 8px;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 1rem;
  }

  .section-header {
    margin-bottom: 3rem;
  }

  .nav-button {
    width: 40px;
    height: 40px;
  }

  .nav-icon {
    width: 20px;
    height: 20px;
  }
}
</style>
