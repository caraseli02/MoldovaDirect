<template>
  <section class="bg-white py-20 dark:bg-gray-950 md:py-28">
    <div class="container">
      <!-- Header with fade-in animation -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible-once="{
          opacity: 1,
          y: 0,
          transition: { duration: 600 },
        }"
        class="mx-auto max-w-3xl text-center"
      >
        <h2 class="text-4xl font-bold md:text-5xl lg:text-6xl tracking-tight">{{ t('home.featuredProducts.title') }}</h2>
        <p class="mt-4 text-sm md:text-base text-gray-600 dark:text-gray-400">{{ t('home.featuredProducts.subtitle') }}</p>
      </div>

      <!-- Filter tabs with stagger animation -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible-once="{
          opacity: 1,
          y: 0,
          transition: { duration: 500, delay: 100 },
        }"
        class="mt-8 flex flex-wrap justify-center gap-2"
        role="tablist"
        aria-label="Product filters"
        @keydown="handleTabKeydown"
      >
        <button
          v-for="(filter, index) in filters"
          :key="filter.value"
          :ref="el => { if (el) tabRefs[index] = el as HTMLButtonElement }"
          type="button"
          role="tab"
          :tabindex="activeFilter === filter.value ? 0 : -1"
          :aria-selected="activeFilter === filter.value"
          :aria-controls="'products-panel'"
          @click="activeFilter = filter.value"
          :class="[
            'rounded-full px-6 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950',
            activeFilter === filter.value
              ? 'bg-primary-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Loading state - Carousel on mobile, Grid on desktop -->
      <div v-if="pending">
        <!-- Mobile: Loading carousel -->
        <div class="mt-12 md:hidden">
          <Swiper
            :modules="[]"
            :slides-per-view="1.15"
            :space-between="16"
            :breakpoints="{
              480: { slidesPerView: 1.5, spaceBetween: 20 },
              640: { slidesPerView: 2, spaceBetween: 24 }
            }"
          >
            <SwiperSlide v-for="i in 8" :key="i">
              <div class="rounded-3xl bg-gray-100/80 p-6 dark:bg-gray-900">
                <div class="h-40 rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 bg-[length:200%_100%]"></div>
                <div class="mt-4 space-y-3">
                  <div class="h-4 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 bg-[length:200%_100%]"></div>
                  <div class="h-4 w-2/3 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 bg-[length:200%_100%]"></div>
                  <div class="h-10 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 bg-[length:200%_100%]"></div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
        <!-- Desktop: Loading grid -->
        <div class="mt-12 hidden gap-6 md:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div v-for="i in 12" :key="i" class="rounded-3xl bg-gray-100/80 p-6 dark:bg-gray-900">
            <div class="h-40 rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 bg-[length:200%_100%]"></div>
            <div class="mt-4 space-y-3">
              <div class="h-4 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 bg-[length:200%_100%]"></div>
              <div class="h-4 w-2/3 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 bg-[length:200%_100%]"></div>
              <div class="h-10 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 bg-[length:200%_100%]"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Products - Carousel on mobile, Grid on desktop -->
      <div v-else-if="filteredProducts.length">
        <!-- Mobile: Horizontal carousel -->
        <div class="mt-12 md:hidden">
          <Swiper
            :modules="[SwiperPagination]"
            :slides-per-view="1.15"
            :space-between="16"
            :pagination="{ clickable: true, dynamicBullets: true }"
            :breakpoints="{
              480: { slidesPerView: 1.5, spaceBetween: 20 },
              640: { slidesPerView: 2, spaceBetween: 24 }
            }"
            class="products-carousel"
          >
            <SwiperSlide
              v-for="product in filteredProducts"
              :key="product.id"
            >
              <ProductCard :product="product" />
            </SwiperSlide>
          </Swiper>
        </div>

        <!-- Desktop: Grid layout -->
        <div id="products-panel" role="tabpanel" class="mt-12 hidden gap-6 md:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>

      <div v-else class="mt-12 text-center">
        <p class="text-gray-500 dark:text-gray-400">{{ t('home.featuredProducts.noProducts') }}</p>
        <NuxtLink
          :to="localePath('/products')"
          class="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
        >
          {{ t('home.featuredProducts.viewAll') }}
          <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
        </NuxtLink>
      </div>

      <div v-if="error" class="mt-8 text-center">
        <p class="text-red-500 dark:text-red-400">{{ t('home.featuredProducts.error') }}</p>
        <button
          type="button"
          @click="emit('retry')"
          class="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
        >
          <commonIcon name="lucide:refresh-ccw" class="h-5 w-5" />
          {{ t('common.retry') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProductWithRelations } from '~/types'

const props = defineProps<{
  products: ProductWithRelations[]
  pending: boolean
  error: Error | null
}>()

const emit = defineEmits<{
  (e: 'retry'): void
}>()

const { t } = useI18n()
const localePath = useLocalePath()

// Filter state
const activeFilter = ref('all')

// Tab refs for keyboard navigation
const tabRefs: HTMLButtonElement[] = reactive([])

// Filter options
const filters = computed(() => [
  { value: 'all', label: t('home.featuredProducts.filters.all') },
  { value: 'bestsellers', label: t('home.featuredProducts.filters.bestsellers') },
  { value: 'new', label: t('home.featuredProducts.filters.new') },
  { value: 'sale', label: t('home.featuredProducts.filters.sale') }
])

// Keyboard navigation for tabs (ARIA best practices)
const handleTabKeydown = (event: KeyboardEvent) => {
  const currentIndex = filters.value.findIndex(f => f.value === activeFilter.value)
  let nextIndex = currentIndex

  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault()
      nextIndex = currentIndex > 0 ? currentIndex - 1 : filters.value.length - 1
      break
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault()
      nextIndex = currentIndex < filters.value.length - 1 ? currentIndex + 1 : 0
      break
    case 'Home':
      event.preventDefault()
      nextIndex = 0
      break
    case 'End':
      event.preventDefault()
      nextIndex = filters.value.length - 1
      break
    default:
      return
  }

  // Update active filter and focus the new tab
  activeFilter.value = filters.value[nextIndex].value
  nextTick(() => {
    tabRefs[nextIndex]?.focus()
  })
}

// Filtered products based on active filter
const filteredProducts = computed(() => {
  if (activeFilter.value === 'all') {
    return props.products
  }

  if (activeFilter.value === 'bestsellers') {
    // Sort by low stock as proxy for popularity (low stock = more sales)
    // Products with isFeatured flag shown first, then sorted by stock depletion
    return [...props.products].sort((a, b) => {
      // Prioritize featured products
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      // Then sort by stock quantity (lower stock = more popular)
      return (a.stockQuantity || 0) - (b.stockQuantity || 0)
    })
  }

  if (activeFilter.value === 'new') {
    // Sort by createdAt date (newest first)
    return [...props.products].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  if (activeFilter.value === 'sale') {
    // Filter products with sale prices (comparePrice > price)
    return props.products.filter(p => p.comparePrice && p.comparePrice > p.price)
  }

  return props.products
})
</script>

<style scoped>
/* Swiper pagination dots styling */
:deep(.products-carousel .swiper-pagination) {
  bottom: -2rem;
}

:deep(.products-carousel .swiper-pagination-bullet) {
  background-color: rgb(156 163 175 / 0.5); /* gray-400 with 50% opacity */
}

:deep(.products-carousel .swiper-pagination-bullet-active) {
  background-color: hsl(var(--color-primary-600));
  opacity: 1;
}
</style>
