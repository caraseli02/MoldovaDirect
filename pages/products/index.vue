<template>
  <div class="bg-gray-50 dark:bg-gray-950 min-h-screen">
    <ProductCategoryNavigation
      :categories="categoriesTree"
      :current-category="currentCategory"
      :show-product-count="true"
    />

    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-blue-500/70 to-indigo-500/70 dark:from-blue-900/80 dark:via-blue-800/70 dark:to-indigo-900/70"></div>
      <div class="absolute inset-x-0 -bottom-32 h-64 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_60%)]"></div>
      <div class="relative z-10 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div class="mx-auto max-w-5xl text-white">
          <div class="inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-sm font-semibold uppercase tracking-wider backdrop-blur shadow-sm">
            {{ t('products.hero.seasonal') }}
          </div>
          <h1 class="mt-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
            {{ t('products.hero.title') }}
          </h1>
          <p class="mt-4 max-w-2xl text-lg">
            {{ t('products.hero.subtitle') }}
          </p>
          <div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-lg shadow-blue-900/20 transition hover:bg-blue-50"
              @click="scrollToResults"
            >
              {{ t('products.hero.cta') }}
            </button>
            <div class="flex flex-wrap items-center gap-2">
              <button
                v-for="collection in discoveryCollections"
                :key="collection.id"
                type="button"
                class="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/20"
                :class="{ 'bg-white text-blue-600 shadow-lg shadow-blue-900/10': activeCollectionId === collection.id }"
                @click="applyDiscoveryCollection(collection)"
              >
                {{ collection.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="relative" ref="mainContainer">
      <Transition name="fade">
        <div v-if="showFilterPanel" class="fixed inset-0 z-40 flex" role="dialog" aria-modal="true" aria-labelledby="filter-panel-title">
          <div class="flex-1 bg-black/40 backdrop-blur-sm" @click="closeFilterPanel" aria-label="Close filters"></div>
          <div id="filter-panel" class="relative ml-auto flex h-full w-full max-w-md flex-col bg-white dark:bg-gray-900 shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <h2 id="filter-panel-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('products.filters.title') }}
              </h2>
              <button
                type="button"
                class="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                @click="closeFilterPanel"
                :aria-label="t('common.close')"
              >
                <commonIcon name="lucide:x" class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-4">
              <productFilterMain
                :filters="filters"
                :available-filters="availableFilters"
                :filtered-product-count="products?.length || 0"
                :show-title="false"
                @update:filters="handleFiltersUpdate"
                @apply-filters="handleApplyFilters(true)"
              />
            </div>
          </div>
        </div>
      </Transition>

      <div class="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-20 pt-10 sm:px-6 lg:px-8" ref="contentContainer">
        <div class="flex-1" ref="scrollContainer">
          <MobilePullToRefreshIndicator
            v-if="isMobile"
            :is-refreshing="pullToRefresh.isRefreshing.value"
            :is-pulling="pullToRefresh.isPulling.value"
            :can-refresh="pullToRefresh.canRefresh.value"
            :pull-distance="pullToRefresh.pullDistance.value"
            :status-text="pullToRefresh.pullStatusText.value"
            :indicator-style="pullToRefresh.pullIndicatorStyle.value"
          />

          <div id="results" class="space-y-10">
            <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
                    {{ t('products.discovery.title') }}
                  </h2>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ t('products.discovery.description') }}
                  </p>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    :aria-label="t('products.filters.title')"
                    :aria-expanded="showFilterPanel"
                    aria-controls="filter-panel"
                    class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    @click="openFilterPanel"
                  >
                    <commonIcon name="lucide:filter" class="h-4 w-4" aria-hidden="true" />
                    <span>{{ t('products.filters.title') }}</span>
                    <span v-if="activeFilterChips.length" class="inline-flex items-center justify-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" aria-label="Active filters count">
                      {{ activeFilterChips.length }}
                    </span>
                  </button>
                  <div class="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <div class="relative flex-1">
                      <label for="product-search" class="sr-only">{{ t('products.searchLabel') }}</label>
                      <label for="productSearch" class="sr-only">
                        {{ t('products.searchLabel') || t('common.search') }}
                      </label>
                      <commonIcon
                        v-if="!loading"
                        name="lucide:search"
                        class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                        aria-hidden="true"
                      />
                      <div v-else class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2">
                        <svg class="h-5 w-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      <input
                        id="product-search"
                        id="productSearch"
                        ref="searchInputRef"
                        v-model="searchQuery"
                        type="search"
                        :placeholder="t('products.searchPlaceholder')"
                        :disabled="loading"
                        :aria-label="t('products.searchLabel')"
                        :aria-label="t('products.searchLabel') || t('common.search')"
                        class="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
                        @input="handleSearchInput"
                      />
                    </div>
                    <div class="relative">
                      <label for="product-sort" class="sr-only">{{ t('products.sortLabel') }}</label>
                      <select
                        id="product-sort"
                        v-model="sortBy"
                        :aria-label="t('products.sortLabel')"
                        class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 sm:w-48"
                        @change="handleSortChange"
                      >
                        <option value="created">{{ t('products.sortNewest') }}</option>
                        <option value="name">{{ t('products.sortName') }}</option>
                        <option value="price_asc">{{ t('products.sortPriceLowHigh') }}</option>
                        <option value="price_desc">{{ t('products.sortPriceHighLow') }}</option>
                        <option value="featured">{{ t('products.sortFeatured') }}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  {{ t('products.showingResults', {
                    start: ((pagination.page - 1) * pagination.limit) + 1,
                    end: Math.min(pagination.page * pagination.limit, pagination.total || 0),
                    total: pagination.total || 0
                  }) }}
                </span>
                <template v-if="activeFilterChips.length">
                  <span class="text-gray-400">•</span>
                  <span class="font-medium text-gray-700 dark:text-gray-200">
                    {{ t('products.filterSummary.title') }}
                  </span>
                </template>
              </div>

              <div v-if="activeFilterChips.length" class="mt-4 flex flex-wrap gap-2">
                <button
                  v-for="chip in activeFilterChips"
                  :key="chip.id"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-200"
                  @click="removeActiveChip(chip)"
                >
                  <span>{{ chip.label }}</span>
                  <span aria-hidden="true">×</span>
                </button>
                <button type="button" class="rounded-full border border-blue-100 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:border-blue-900/40 dark:text-blue-300" @click="clearAllFilters">
                  {{ t('products.filterSummary.clear') }}
                </button>
              </div>

              <div class="mt-6 flex flex-wrap items-center gap-3">
                <button
                  v-for="toggle in quickToggleOptions"
                  :key="toggle.id"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition"
                  :class="toggle.active ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500/60 dark:bg-blue-900/40 dark:text-blue-200' : 'border-gray-300 bg-white text-gray-700 hover:border-blue-500 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'"
                  @click="toggleQuickFilter(toggle)"
                >
                  <span class="inline-block h-2.5 w-2.5 rounded-full" :class="toggle.active ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'"></span>
                  {{ toggle.label }}
                </button>
              </div>
            </div>

            <div v-if="error" class="rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm dark:border-red-900/40 dark:bg-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto mb-4 h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {{ t('common.error') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                {{ error || t('common.errorGeneric') }}
              </p>
              <button type="button" class="inline-flex items-center rounded-full bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700" @click="retryLoad">
                {{ t('common.tryAgain') }}
              </button>
            </div>

            <div v-else-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div v-for="n in 8" :key="`skeleton-${n}`" class="animate-pulse rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div class="mb-4 aspect-square rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                <div class="mb-2 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div class="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>

            <div v-else-if="products?.length" class="space-y-10">
              <MobileVirtualProductGrid
                v-if="isMobile && products.length > 20"
                :items="products"
                :container-height="600"
                :loading="loading"
                @load-more="loadMoreProducts"
              />
              <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <ProductCard v-for="product in products" :key="product.id" :product="product" />
              </div>

              <div v-if="pagination.totalPages > 1" class="space-y-4 text-center">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ t('products.pagination.pageOf', { page: pagination.page, total: pagination.totalPages }) }} ·
                  {{ t('products.pagination.showing', { count: pagination.total || products.length }) }}
                </p>
                <nav class="flex items-center justify-center gap-2">
                  <button
                    :disabled="pagination.page <= 1"
                    class="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    @click="goToPage(pagination.page - 1)"
                  >
                    {{ t('common.previous') }}
                  </button>
                  <button
                    v-for="page in visiblePages"
                    :key="`page-${page}`"
                    v-if="page !== '...'"
                    class="rounded-full px-4 py-2 text-sm font-semibold transition"
                    :class="page === pagination.page ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-gray-700 hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-200'"
                    @click="goToPage(page as number)"
                  >
                    {{ page }}
                  </button>
                  <span v-else class="px-3 py-2 text-sm text-gray-500">…</span>
                  <button
                    :disabled="pagination.page >= pagination.totalPages"
                    class="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    @click="goToPage(pagination.page + 1)"
                  >
                    {{ t('common.next') }}
                  </button>
                </nav>
              </div>
            </div>

            <div v-else class="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto mb-4 h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {{ hasActiveFilters ? t('products.noResults') : t('products.noProducts') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400">
                {{ hasActiveFilters ? t('products.tryDifferentFilters') : t('products.comingSoon') }}
              </p>
              <button v-if="hasActiveFilters" type="button" class="mt-6 inline-flex items-center rounded-full bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700" @click="clearAllFilters">
                {{ t('products.clearFilters') }}
              </button>
            </div>

            <section v-if="recentlyViewedProducts.length" class="space-y-6">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    {{ t('products.recentlyViewed.title') }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ t('products.recentlyViewed.subtitle') }}
                  </p>
                </div>
              </div>
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <ProductCard v-for="item in recentlyViewedProducts" :key="`recent-${item.id}`" :product="item" />
              </div>
            </section>

            <section class="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    {{ t('products.editorial.title') }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ t('products.editorial.subtitle') }}
                  </p>
                </div>
              </div>
              <div class="grid gap-4 md:grid-cols-3">
                <article
                  v-for="story in editorialStories"
                  :key="story.id"
                  class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:from-gray-900 dark:to-gray-800"
                >
                  <span class="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:bg-blue-900/60 dark:text-blue-300">
                    {{ story.tag }}
                  </span>
                  <h4 class="mt-4 text-lg font-semibold text-gray-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-300">
                    {{ story.title }}
                  </h4>
                  <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {{ story.description }}
                  </p>
                  <button type="button" class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200">
                    {{ t('products.editorial.cta') }}
                    <span aria-hidden="true">→</span>
                  </button>
                </article>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductFilters, ProductWithRelations } from '~/types'
import { ref, computed, onMounted, onUnmounted, nextTick, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

import ProductCategoryNavigation from '~/components/product/CategoryNavigation.vue'
import productFilterMain from '~/components/product/Filter/Main.vue'
import ProductCard from '~/components/product/Card.vue'
import commonIcon from '~/components/common/Icon.vue'
import MobileVirtualProductGrid from '~/components/mobile/VirtualProductGrid.vue'
import MobilePullToRefreshIndicator from '~/components/mobile/PullToRefreshIndicator.vue'

import { useProductCatalog } from '~/composables/useProductCatalog'
import { useDevice } from '~/composables/useDevice'
import { useHapticFeedback } from '~/composables/useHapticFeedback'
import { usePullToRefresh } from '~/composables/usePullToRefresh'
import { useSwipeGestures } from '~/composables/useSwipeGestures'

import { useHead } from '#imports'

const { t, locale } = useI18n()

const {
  initialize,
  fetchProducts,
  search,
  updateFilters,
  clearFilters,
  products,
  categoriesTree,
  currentCategory,
  searchQuery: storeSearchQuery,
  filters,
  pagination,
  loading,
  error
} = useProductCatalog()

const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const priceRange = ref<{ min: number; max: number }>({ min: 0, max: 200 })
const route = useRoute()
const router = useRouter()
const sortBy = ref<string>('created')
const showFilterPanel = ref(false)
const activeCollectionId = ref<string | null>(null)

const { isMobile } = useDevice()
const { vibrate } = useHapticFeedback()

const mainContainer = ref<HTMLElement>()
const contentContainer = ref<HTMLElement>()
const scrollContainer = ref<HTMLElement>()

const pullToRefresh = usePullToRefresh(async () => {
  vibrate('pullRefresh')
  await refreshProducts()
})

const swipeGestures = useSwipeGestures()

await initialize()

const recentlyViewedProducts = useState<ProductWithRelations[]>('recentlyViewedProducts', () => [])

const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value ||
    filters.value.category ||
    filters.value.priceMin ||
    filters.value.priceMax ||
    (filters.value.attributes && Object.keys(filters.value.attributes).length > 0) ||
    filters.value.inStock ||
    filters.value.featured
  )
})

const availableFilters = computed(() => {
  const convertCategories = (cats: any[]): any[] => {
    return cats.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      productCount: cat.productCount || 0,
      children: cat.children ? convertCategories(cat.children) : []
    }))
  }

  return {
    categories: convertCategories(categoriesTree.value || []),
    priceRange: priceRange.value,
    attributes: []
  }
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = pagination.value.totalPages
  const current = pagination.value.page

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)

    if (current > 4) {
      pages.push('...')
    }

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < total - 3) {
      pages.push('...')
    }

    if (total > 1) {
      pages.push(total)
    }
  }

  return pages
})

let searchTimeout: NodeJS.Timeout

const handleSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (searchQuery.value.trim()) {
      search(searchQuery.value.trim(), {
        ...filters.value,
        page: 1,
        sort: sortBy.value as any
      })
    } else {
      fetchProducts({
        ...filters.value,
        page: 1,
        sort: sortBy.value as any
      })
    }
  }, 300)
}

const handleSortChange = () => {
  const currentFilters = {
    ...filters.value,
    sort: sortBy.value as any,
    page: 1
  }

  if (searchQuery.value.trim()) {
    search(searchQuery.value.trim(), currentFilters)
  } else {
    fetchProducts(currentFilters)
  }
}

const handleFiltersUpdate = (newFilters: Partial<ProductFilters>) => {
  updateFilters(newFilters)
}

const handleApplyFilters = (closePanel = false) => {
  const currentFilters = {
    ...filters.value,
    sort: sortBy.value as any,
    page: 1
  }

  if (searchQuery.value.trim()) {
    search(searchQuery.value.trim(), currentFilters)
  } else {
    fetchProducts(currentFilters)
  }

  if (closePanel) {
    closeFilterPanel()
  }
}

const clearAllFilters = () => {
  searchQuery.value = ''
  sortBy.value = 'created'
  activeCollectionId.value = null
  clearFilters()
  fetchProducts({ sort: 'created', page: 1, limit: 12 })
}

const goToPage = (page: number) => {
  const currentFilters = {
    ...filters.value,
    sort: sortBy.value as any,
    page
  }

  if (searchQuery.value.trim()) {
    search(searchQuery.value.trim(), currentFilters)
  } else {
    fetchProducts(currentFilters)
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const refreshProducts = async () => {
  try {
    const currentFilters = {
      ...filters.value,
      sort: sortBy.value as any,
      page: 1
    }

    if (searchQuery.value.trim()) {
      await search(searchQuery.value.trim(), currentFilters)
    } else {
      await fetchProducts(currentFilters)
    }
  } catch (error) {
    console.error('Failed to refresh products:', error)
  }
}

const retryLoad = () => {
  fetchProducts({ sort: 'created', page: 1, limit: 12 })
}

const setupMobileInteractions = () => {
  if (!isMobile.value || !scrollContainer.value) return

  pullToRefresh.setupPullToRefresh(scrollContainer.value)

  swipeGestures.setupSwipeListeners(scrollContainer.value)
  swipeGestures.setSwipeHandlers({
    onLeft: () => {
      if (pagination.value.page < pagination.value.totalPages) {
        goToPage(pagination.value.page + 1)
      }
    },
    onRight: () => {
      if (pagination.value.page > 1) {
        goToPage(pagination.value.page - 1)
      }
    }
  })
}

const cleanupMobileInteractions = () => {
  pullToRefresh.cleanupPullToRefresh()
  swipeGestures.cleanupSwipeListeners()
}

const loadMoreProducts = async () => {
  if (loading.value || pagination.value.page >= pagination.value.totalPages) return

  try {
    const nextPage = pagination.value.page + 1
    const currentFilters = {
      ...filters.value,
      sort: sortBy.value as any,
      page: nextPage
    }

    if (searchQuery.value.trim()) {
      await search(searchQuery.value.trim(), currentFilters)
    } else {
      await fetchProducts(currentFilters)
    }
  } catch (error) {
    console.error('Failed to load more products:', error)
  }
}

const scrollToResults = () => {
  nextTick(() => {
    const el = document.getElementById('results')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

const openFilterPanel = () => {
  showFilterPanel.value = true
  // Prevent body scroll when panel is open
  document.body.style.overflow = 'hidden'
}

const closeFilterPanel = () => {
  showFilterPanel.value = false
  // Restore body scroll
  document.body.style.overflow = ''
}

// Handle Escape key to close filter panel
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showFilterPanel.value) {
    closeFilterPanel()
  }
}

const discoveryCollections = computed(() => {
  return [
    {
      id: 'featured',
      label: t('products.discovery.collections.celebration'),
      filters: {
        featured: true,
        sort: 'featured'
      }
    },
    {
      id: 'weekday',
      label: t('products.discovery.collections.weeknight'),
      filters: {
        priceMax: 25,
        sort: 'price_asc'
      }
    },
    {
      id: 'gifts',
      label: t('products.discovery.collections.gift'),
      filters: {
        priceMin: 25,
        priceMax: 60,
        sort: 'created'
      }
    },
    {
      id: 'cellar',
      label: t('products.discovery.collections.cellar'),
      filters: {
        sort: 'created',
        inStock: true
      }
    }
  ]
})

const applyDiscoveryCollection = (collection: { id: string; filters: ProductFilters; label: string }) => {
  activeCollectionId.value = collection.id
  searchQuery.value = ''

  const nextFilters: ProductFilters = {
    ...filters.value,
    ...collection.filters,
    page: 1,
    sort: (collection.filters.sort as any) || 'created'
  }

  if (!collection.filters.priceMin) delete nextFilters.priceMin
  if (!collection.filters.priceMax) delete nextFilters.priceMax
  if (!collection.filters.featured) delete nextFilters.featured
  if (!collection.filters.inStock) delete nextFilters.inStock

  sortBy.value = (nextFilters.sort as string) || 'created'
  fetchProducts(nextFilters)
}

const quickToggleOptions = computed(() => {
  return [
    {
      id: 'inStock',
      label: t('products.toggles.inStock'),
      active: !!filters.value.inStock,
      apply: () => {
        const next = { ...filters.value, inStock: !filters.value.inStock, page: 1 }
        if (!next.inStock) delete next.inStock
        fetchProducts({ ...next, sort: sortBy.value as any })
      }
    },
    {
      id: 'featured',
      label: t('products.toggles.featured'),
      active: !!filters.value.featured,
      apply: () => {
        const next = { ...filters.value, featured: !filters.value.featured, page: 1, sort: 'featured' as const }
        if (!next.featured) {
          delete next.featured
          next.sort = sortBy.value as any
        } else {
          sortBy.value = 'featured'
        }
        fetchProducts(next)
      }
    }
  ]
})

const toggleQuickFilter = (toggle: { apply: () => void }) => {
  toggle.apply()
}

const findCategoryName = (slugOrId: string | number | undefined) => {
  if (!slugOrId) return ''

  const findInTree = (nodes: any[]): string | undefined => {
    for (const node of nodes) {
      if (node.slug === slugOrId || node.id === slugOrId) {
        return node.name?.[locale.value] || node.name?.es || Object.values(node.name || {})[0]
      }
      if (node.children?.length) {
        const child = findInTree(node.children)
        if (child) return child
      }
    }
    return undefined
  }

  return findInTree(categoriesTree.value || []) || ''
}

const activeFilterChips = computed(() => {
  const chips: Array<{ id: string; label: string; type: string; attributeKey?: string; attributeValue?: string }> = []

  if (filters.value.category) {
    chips.push({
      id: 'category',
      label: t('products.chips.category', { value: findCategoryName(filters.value.category) || t('products.filters.unknownCategory') }),
      type: 'category'
    })
  }

  if (filters.value.priceMin) {
    chips.push({ id: 'priceMin', label: t('products.chips.priceMin', { value: filters.value.priceMin }), type: 'priceMin' })
  }

  if (filters.value.priceMax) {
    chips.push({ id: 'priceMax', label: t('products.chips.priceMax', { value: filters.value.priceMax }), type: 'priceMax' })
  }

  if (filters.value.inStock) {
    chips.push({ id: 'inStock', label: t('products.chips.inStock'), type: 'inStock' })
  }

  if (filters.value.featured) {
    chips.push({ id: 'featured', label: t('products.chips.featured'), type: 'featured' })
  }

  if (filters.value.attributes) {
    Object.entries(filters.value.attributes).forEach(([key, values]) => {
      values.forEach(value => {
        chips.push({
          id: `attr-${key}-${value}`,
          label: t('products.chips.attribute', { label: key, value }),
          type: 'attribute',
          attributeKey: key,
          attributeValue: value
        })
      })
    })
  }

  return chips
})

const removeActiveChip = (chip: { type: string; attributeKey?: string; attributeValue?: string }) => {
  const nextFilters: ProductFilters = { ...filters.value }

  switch (chip.type) {
    case 'category':
      delete nextFilters.category
      break
    case 'priceMin':
      delete nextFilters.priceMin
      break
    case 'priceMax':
      delete nextFilters.priceMax
      break
    case 'inStock':
      delete nextFilters.inStock
      break
    case 'featured':
      delete nextFilters.featured
      break
    case 'attribute':
      if (chip.attributeKey && chip.attributeValue && nextFilters.attributes?.[chip.attributeKey]) {
        const filtered = nextFilters.attributes[chip.attributeKey].filter(value => value !== chip.attributeValue)
        if (filtered.length) {
          nextFilters.attributes![chip.attributeKey] = filtered
        } else {
          delete nextFilters.attributes![chip.attributeKey]
        }
        if (Object.keys(nextFilters.attributes || {}).length === 0) {
          delete nextFilters.attributes
        }
      }
      break
  }

  fetchProducts({ ...nextFilters, page: 1, sort: sortBy.value as any })
}

const editorialStories = computed(() => {
  return [
    {
      id: 'wineries',
      title: t('products.editorial.stories.wineries.title'),
      description: t('products.editorial.stories.wineries.description'),
      tag: t('products.editorial.stories.wineries.tag')
    },
    {
      id: 'pairings',
      title: t('products.editorial.stories.pairings.title'),
      description: t('products.editorial.stories.pairings.description'),
      tag: t('products.editorial.stories.pairings.tag')
    },
    {
      id: 'heritage',
      title: t('products.editorial.stories.heritage.title'),
      description: t('products.editorial.stories.heritage.description'),
      tag: t('products.editorial.stories.heritage.tag')
    }
  ]
})

watchEffect(() => {
  if (storeSearchQuery.value && storeSearchQuery.value !== searchQuery.value) {
    searchQuery.value = storeSearchQuery.value
  }
})

watch(() => filters.value.sort, newValue => {
  if (newValue) {
    sortBy.value = newValue as string
  }
})

watch(isMobile, value => {
  if (!value) {
    closeFilterPanel()
  }
})

onMounted(async () => {
  searchQuery.value = storeSearchQuery.value || ''
  await fetchProducts({ sort: 'created', page: 1, limit: 12 })

  nextTick(() => {
    setupMobileInteractions()
  })
  // Focus search if requested
  if (route.query.focus === 'search') {
    nextTick(() => {
      searchInputRef.value?.focus()
      const { focus, ...rest } = route.query
      router.replace({ query: rest })
    })
  }
  await refreshPriceRange()

  // Set up keyboard listener for filter panel
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  cleanupMobileInteractions()
  // Clean up keyboard listener
  document.removeEventListener('keydown', handleKeyDown)
  // Restore body scroll if panel was open
  document.body.style.overflow = ''
})

useHead({
  title: 'Shop - Moldova Direct',
  meta: [
    {
      name: 'description',
      content: 'Browse authentic Moldovan food and wine products. Premium quality directly from Moldova to Spain.'
    }
  ]
})

// Fetch dynamic price range (category/inStock/featured scope)
const refreshPriceRange = async () => {
  try {
    const params = new URLSearchParams()
    if (filters.value.category) params.append('category', String(filters.value.category))
    if (filters.value.inStock) params.append('inStock', 'true')
    if (filters.value.featured) params.append('featured', 'true')
    const res = await $fetch<{ success: boolean; min: number; max: number }>(`/api/products/price-range?${params.toString()}`)
    if (res.success) {
      priceRange.value = { min: res.min ?? 0, max: res.max ?? 200 }
    }
  } catch (e) {
    // keep existing range on error
    console.error('Failed to load price range', e)
  }
}

watch(() => [filters.value.category, filters.value.inStock, filters.value.featured], async () => {
  await refreshPriceRange()
})
</script>
