<template>
  <div class="bg-gray-50 dark:bg-gray-950 min-h-screen">
    <!-- Breadcrumb Navigation -->
    <ProductBreadcrumbs
      :current-category="currentCategory"
      :search-query="searchQuery"
    />

    <div class="relative" ref="mainContainer">
      <!-- Mobile Filter Sheet -->
      <ProductFilterSheet
        v-model="showFilterPanel"
        :title="t('products.filters.title')"
        :active-filter-count="activeFilterChips.length"
        :filtered-count="products?.length || 0"
        :show-clear-button="hasActiveFilters"
        @apply="handleApplyFilters(true)"
        @clear="clearAllFilters"
      >
        <productFilterMain
          :filters="filters"
          :available-filters="availableFilters"
          :filtered-product-count="products?.length || 0"
          :show-title="false"
          @update:filters="handleFiltersUpdate"
          @apply-filters="handleApplyFilters(true)"
        />
      </ProductFilterSheet>

      <div class="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8" ref="contentContainer">
        <div class="w-full" ref="scrollContainer">
          <MobilePullToRefreshIndicator
            v-if="isMobile"
            :is-refreshing="pullToRefresh.isRefreshing.value"
            :is-pulling="pullToRefresh.isPulling.value"
            :can-refresh="pullToRefresh.canRefresh.value"
            :pull-distance="pullToRefresh.pullDistance.value"
            :status-text="pullToRefresh.pullStatusText.value"
            :indicator-style="pullToRefresh.pullIndicatorStyle.value"
          />

          <div id="results" class="space-y-12">
            <!-- Clean Header Section -->
            <div class="flex items-end justify-between border-b border-gray-200 pb-6 dark:border-gray-800">
              <div class="flex-1">
                <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-4xl">
                  {{ t('products.discovery.title') }}
                </h1>
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {{ t('products.showingResults', {
                    start: ((pagination.page - 1) * pagination.limit) + 1,
                    end: Math.min(pagination.page * pagination.limit, pagination.total || 0),
                    total: pagination.total || 0
                  }) }}
                </p>
              </div>

              <!-- Right Side Controls -->
              <div class="flex items-center gap-4">
                <!-- Filter Button -->
                <button
                  type="button"
                  :aria-label="t('products.filters.title')"
                  :aria-expanded="showFilterPanel"
                  aria-controls="filter-panel"
                  class="relative inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750"
                  @click="openFilterPanel"
                >
                  <commonIcon name="lucide:sliders-horizontal" class="h-4 w-4" aria-hidden="true" />
                  <span>{{ t('products.filters.title') }}</span>
                  <span v-if="activeFilterChips.length" class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white ring-2 ring-white dark:ring-gray-900">
                    {{ activeFilterChips.length }}
                  </span>
                </button>

                <!-- Sort Dropdown -->
                <div class="relative">
                  <label for="product-sort" class="sr-only">
                    {{ t('products.sortLabel') }}
                  </label>
                  <select
                    id="product-sort"
                    v-model="sortBy"
                    :aria-label="t('products.sortLabel')"
                    class="h-10 appearance-none rounded-lg border border-gray-300 bg-white pl-4 pr-10 text-sm font-medium text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    @change="handleSortChange"
                  >
                    <option value="created">{{ t('products.sortNewest') }}</option>
                    <option value="name">{{ t('products.sortName') }}</option>
                    <option value="price_asc">{{ t('products.sortPriceLowHigh') }}</option>
                    <option value="price_desc">{{ t('products.sortPriceHighLow') }}</option>
                    <option value="featured">{{ t('products.sortFeatured') }}</option>
                  </select>
                  <commonIcon name="lucide:chevron-down" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                </div>
              </div>
            </div>

            <!-- Active Filter Chips -->
            <ProductActiveFilters
              v-if="activeFilterChips.length"
              :chips="activeFilterChips"
              :show-clear-all="true"
              @remove-chip="removeActiveChip"
              @clear-all="clearAllFilters"
            />

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
              <UiButton type="button" class="rounded-full" @click="retryLoad">
                {{ t('common.tryAgain') }}
              </UiButton>
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
                <p class="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
                  {{ t('products.pagination.pageOf', { page: pagination.page, total: pagination.totalPages }) }} ·
                  {{ t('products.pagination.showing', { count: pagination.total || products.length }) }}
                </p>
                <nav class="flex items-center justify-center gap-2" aria-label="Pagination">
                  <UiButton
                    :disabled="pagination.page <= 1"
                    variant="outline"
                    size="sm"
                    class="rounded-full"
                    :aria-label="t('products.pagination.previousPage')"
                    @click="goToPage(pagination.page - 1)"
                  >
                    {{ t('common.previous') }}
                  </UiButton>
                  <UiButton
                    v-for="page in visiblePages"
                    :key="`page-${page}`"
                    v-if="page !== '...'"
                    size="sm"
                    :variant="page === pagination.page ? 'default' : 'ghost'"
                    class="rounded-full"
                    :class="page === pagination.page ? 'shadow-lg shadow-blue-500/30' : ''"
                    :aria-label="t('products.pagination.goToPage', { page })"
                    :aria-current="page === pagination.page ? 'page' : undefined"
                    @click="goToPage(page as number)"
                  >
                    {{ page }}
                  </UiButton>
                  <span v-else class="px-3 py-2 text-sm text-gray-500" aria-hidden="true">…</span>
                  <UiButton
                    :disabled="pagination.page >= pagination.totalPages"
                    variant="outline"
                    size="sm"
                    class="rounded-full"
                    :aria-label="t('products.pagination.nextPage')"
                    @click="goToPage(pagination.page + 1)"
                  >
                    {{ t('common.next') }}
                  </UiButton>
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
              <UiButton v-if="hasActiveFilters" type="button" class="mt-6 rounded-full" @click="clearAllFilters">
                {{ t('products.clearFilters') }}
              </UiButton>
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
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount, nextTick, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

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
import { useDebounceFn } from '@vueuse/core'

import { useHead } from '#imports'

const { t, locale } = useI18n()

const {
  initialize,
  fetchProducts,
  search,
  updateFilters,
  clearFilters,
  openFilterPanel,
  closeFilterPanel,
  updateSort,
  products,
  categoriesTree,
  currentCategory,
  searchQuery: storeSearchQuery,
  filters,
  pagination,
  loading,
  error,
  sortBy,
  showFilterPanel
} = useProductCatalog()

const searchQuery = ref('')
const priceRange = ref<{ min: number; max: number }>({ min: 0, max: 200 })
const route = useRoute()
const router = useRouter()
let searchAbortController: AbortController | null = null

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

const totalProducts = computed(() => pagination.value?.total || products.value?.length || 0)

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

// Debounced search handler to prevent excessive API calls
const handleSearchInput = useDebounceFn(() => {
  // Cancel previous search request if it exists
  if (searchAbortController) {
    searchAbortController.abort()
  }

  // Create new abort controller for this search
  searchAbortController = new AbortController()

  if (searchQuery.value.trim()) {
    search(searchQuery.value.trim(), {
      ...filters.value,
      page: 1,
      sort: sortBy.value as any
    }, searchAbortController.signal)
  } else {
    fetchProducts({
      ...filters.value,
      page: 1,
      sort: sortBy.value as any
    }, searchAbortController.signal)
  }
}, 300)

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

// Build category lookup Map for O(1) access instead of O(n) tree traversal
const categoriesLookup = computed(() => {
  const map = new Map<string | number, string>()

  const buildMap = (nodes: any[]) => {
    nodes.forEach(node => {
      // Get localized name with fallback
      const name = node.name?.[locale.value] || node.name?.es || Object.values(node.name || {})[0] || ''

      // Store by both slug and ID for flexible lookup
      if (node.slug) map.set(node.slug, name)
      if (node.id) map.set(node.id, name)

      // Recursively process children
      if (node.children?.length) {
        buildMap(node.children)
      }
    })
  }

  buildMap(categoriesTree.value || [])
  return map
})

// O(1) category name lookup
const getCategoryName = (slugOrId: string | number | undefined): string => {
  if (!slugOrId) return ''
  return categoriesLookup.value.get(slugOrId) || ''
}

const activeFilterChips = computed(() => {
  const chips: Array<{ id: string; label: string; type: string; attributeKey?: string; attributeValue?: string }> = []

  if (filters.value.category) {
    chips.push({
      id: 'category',
      label: t('products.chips.category', { value: getCategoryName(filters.value.category) || t('products.filters.unknownCategory') }),
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

// Sync store search query to local (read-only sync, no fetch trigger)
watchEffect(() => {
  if (storeSearchQuery.value && storeSearchQuery.value !== searchQuery.value) {
    searchQuery.value = storeSearchQuery.value
  }
})

// Sync filters.sort to sortBy (read-only sync, no fetch trigger)
watch(() => filters.value.sort, newValue => {
  if (newValue && newValue !== sortBy.value) {
    sortBy.value = newValue as string
  }
}, { immediate: false })

// Close filter panel when switching to desktop
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
  await refreshPriceRange()
})

// Cleanup session storage to prevent accumulation over multiple navigations
onBeforeUnmount(() => {
  if (process.client) {
    try {
      // Clean up any products-related session storage
      sessionStorage.removeItem('products-scroll-position')
      sessionStorage.removeItem('products-filter-state')
    } catch (error) {
      // Silently fail if session storage is unavailable
      console.debug('Session storage cleanup failed:', error)
    }
  }
})

onUnmounted(() => {
  cleanupMobileInteractions()
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
