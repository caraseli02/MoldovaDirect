<template>
  <div class="bg-gray-50 dark:bg-gray-950 min-h-screen">
    <ProductCategoryNavigation
      v-if="isSectionEnabled('categoryNavigation')"
      :categories="categoriesTree"
      :current-category="currentCategory?.slug"
      :show-product-count="true"
    />

    <ProductHero
      v-if="isSectionEnabled('heroSection')"
      :seasonal-badge="t('products.hero.seasonal')"
      :title="t('products.hero.title')"
      :subtitle="t('products.hero.subtitle')"
      :cta-text="t('products.hero.cta')"
      :collections="isSectionEnabled('discoveryCollections') ? discoveryCollections : []"
      :active-collection-id="activeCollectionId"
      @scroll-to-results="scrollToResults"
      @select-collection="applyDiscoveryCollection"
    />

    <div class="relative" ref="mainContainer">
      <!-- Mobile/Tablet Filter Panel -->
      <Transition name="fade">
        <div v-if="showFilterPanel" class="fixed inset-0 z-40 flex" role="dialog" aria-modal="true" aria-labelledby="filter-panel-title">
          <div class="flex-1 bg-black/40 backdrop-blur-sm" @click="closeFilterPanel" aria-label="Close filters"></div>
          <div id="filter-panel" class="relative ml-auto flex h-full w-full max-w-md flex-col bg-white dark:bg-gray-900 shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <h2 id="filter-panel-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('products.filters.title') }}
              </h2>
              <UiButton
                type="button"
                variant="ghost"
                size="icon"
                @click="closeFilterPanel"
                :aria-label="t('common.close')"
              >
                <commonIcon name="lucide:x" class="h-5 w-5" aria-hidden="true" />
              </UiButton>
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
            v-if="isSectionEnabled('pullToRefresh') && isMobile"
            :is-refreshing="pullToRefresh.isRefreshing.value"
            :is-pulling="pullToRefresh.isPulling.value"
            :can-refresh="pullToRefresh.canRefresh.value"
            :pull-distance="pullToRefresh.pullDistance.value"
            :status-text="pullToRefresh.pullStatusText.value"
            :indicator-style="pullToRefresh.pullIndicatorStyle.value"
          />

          <div id="results" class="space-y-10">
            <div v-if="isSectionEnabled('searchAndFilters')" class="space-y-6">
              <ProductSearchBar
                :title="t('products.discovery.title')"
                :description="t('products.discovery.description')"
                :search-query="searchQuery"
                :sort-by="sortBy"
                :sort-options="sortOptions"
                :active-filter-count="activeFilterChips.length"
                :show-filter-panel="showFilterPanel"
                :loading="loading"
                :search-label="t('products.searchLabel')"
                :search-placeholder="t('products.searchPlaceholder')"
                :filter-button-label="t('products.filters.title')"
                :sort-label="t('products.sortLabel')"
                @update:search-query="handleSearchQueryUpdate"
                @update:sort-by="handleSortByUpdate"
                @open-filters="openFilterPanel"
              />

              <ProductActiveFilters
                :chips="activeFilterChips"
                :quick-toggles="isSectionEnabled('quickFilters') ? quickToggleOptions : []"
                :results-text="t('products.showingResults', {
                  start: ((pagination.page - 1) * pagination.limit) + 1,
                  end: Math.min(pagination.page * pagination.limit, pagination.total || 0),
                  total: pagination.total || 0
                })"
                :active-filters-title="t('products.filterSummary.title')"
                :active-filters-label="t('products.filterSummary.activeFilters')"
                :clear-all-text="t('products.filterSummary.clear')"
                :clear-all-label="t('products.filterSummary.clearAllFilters')"
                :quick-filters-label="t('products.quickFilters.label')"
                @remove-chip="removeActiveChip"
                @clear-all="clearAllFilters"
                @toggle-filter="toggleQuickFilter"
              />
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
              <UiButton type="button" class="rounded-full" @click="retryLoad">
                {{ t('common.tryAgain') }}
              </UiButton>
            </div>

            <div v-else-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div v-for="n in PRODUCTS.SKELETON_CARD_COUNT" :key="`skeleton-${n}`" class="animate-pulse rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div class="mb-4 aspect-square rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                <div class="mb-2 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div class="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>

            <div v-else-if="products?.length" class="space-y-10">
              <MobileVirtualProductGrid
                v-if="isSectionEnabled('virtualScrolling') && isMobile && products.length > PRODUCTS.VIRTUAL_SCROLL_THRESHOLD"
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

            <section v-if="isSectionEnabled('recentlyViewed') && recentlyViewedProducts.length" class="space-y-6">
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
                <ProductCard v-for="item in recentlyViewedProducts.slice(0, PRODUCTS.RECENTLY_VIEWED_MAX)" :key="`recent-${item.id}`" :product="item" />
              </div>
            </section>

            <ProductEditorialStories
              v-if="isSectionEnabled('editorialStories')"
              :title="t('products.editorial.title')"
              :subtitle="t('products.editorial.subtitle')"
              :cta-text="t('products.editorial.cta')"
              :stories="editorialStories"
            />
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

// Components
import ProductCategoryNavigation from '~/components/product/CategoryNavigation.vue'
import ProductHero from '~/components/product/Hero.vue'
import ProductSearchBar from '~/components/product/SearchBar.vue'
import ProductActiveFilters from '~/components/product/ActiveFilters.vue'
import ProductEditorialStories from '~/components/product/EditorialStories.vue'
import productFilterMain from '~/components/product/Filter/Main.vue'
import ProductCard from '~/components/product/Card.vue'
import commonIcon from '~/components/common/Icon.vue'
import MobileVirtualProductGrid from '~/components/mobile/VirtualProductGrid.vue'
import MobilePullToRefreshIndicator from '~/components/mobile/PullToRefreshIndicator.vue'

// Composables
import { useProductCatalog } from '~/composables/useProductCatalog'
import { useProductsConfig } from '~/composables/useProductsConfig'
import { useDevice } from '~/composables/useDevice'
import { useHapticFeedback } from '~/composables/useHapticFeedback'
import { usePullToRefresh } from '~/composables/usePullToRefresh'
import { useSwipeGestures } from '~/composables/useSwipeGestures'

// Constants
import { PRODUCTS, PRODUCT_SORT_OPTIONS } from '~/constants/products'

import { useHead } from '#imports'

const { t, locale } = useI18n()

// Feature flags
const { isSectionEnabled } = useProductsConfig()

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
const priceRange = ref<{ min: number; max: number }>({ min: PRODUCTS.DEFAULT_PRICE_MIN, max: PRODUCTS.DEFAULT_PRICE_MAX })
const route = useRoute()
const router = useRouter()
const sortBy = ref<string>(PRODUCT_SORT_OPTIONS.CREATED)
const showFilterPanel = ref(false)
const activeCollectionId = ref<string | null>(null)

const { isMobile } = useDevice()
const { vibrate } = useHapticFeedback()

const mainContainer = ref<HTMLElement>()
const contentContainer = ref<HTMLElement>()
const scrollContainer = ref<HTMLElement>()

const pullToRefresh = isSectionEnabled('pullToRefresh') ? usePullToRefresh(async () => {
  vibrate('pullRefresh')
  await refreshProducts()
}) : {
  isRefreshing: ref(false),
  isPulling: ref(false),
  canRefresh: ref(false),
  pullDistance: ref(0),
  pullStatusText: ref(''),
  pullIndicatorStyle: ref({}),
  setupPullToRefresh: () => {},
  cleanupPullToRefresh: () => {}
}

const swipeGestures = useSwipeGestures()

// Sort options for the search bar
const sortOptions = computed(() => [
  { value: PRODUCT_SORT_OPTIONS.CREATED, label: t('products.sortNewest') },
  { value: PRODUCT_SORT_OPTIONS.NAME, label: t('products.sortName') },
  { value: PRODUCT_SORT_OPTIONS.PRICE_ASC, label: t('products.sortPriceLowHigh') },
  { value: PRODUCT_SORT_OPTIONS.PRICE_DESC, label: t('products.sortPriceHighLow') },
  { value: PRODUCT_SORT_OPTIONS.FEATURED, label: t('products.sortFeatured') },
])

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

// Event handlers for the new components
const handleSearchQueryUpdate = (value: string) => {
  searchQuery.value = value
  handleSearchInput()
}

const handleSortByUpdate = (value: string) => {
  sortBy.value = value
  handleSortChange()
}

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
  }, PRODUCTS.SEARCH_DEBOUNCE_MS)
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
  sortBy.value = PRODUCT_SORT_OPTIONS.CREATED
  activeCollectionId.value = null
  clearFilters()
  fetchProducts({ sort: PRODUCT_SORT_OPTIONS.CREATED, page: 1, limit: PRODUCTS.DEFAULT_PER_PAGE })
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
  fetchProducts({ sort: PRODUCT_SORT_OPTIONS.CREATED, page: 1, limit: PRODUCTS.DEFAULT_PER_PAGE })
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
        const next: ProductFilters = { ...filters.value, inStock: !filters.value.inStock, page: 1 }
        if (!next.inStock) {
          const { inStock, ...rest } = next
          fetchProducts({ ...rest, sort: sortBy.value as any })
        } else {
          fetchProducts({ ...next, sort: sortBy.value as any })
        }
      }
    },
    {
      id: 'featured',
      label: t('products.toggles.featured'),
      active: !!filters.value.featured,
      apply: () => {
        const nextFeatured = !filters.value.featured
        if (!nextFeatured) {
          const { featured, ...rest } = filters.value
          fetchProducts({ ...rest, page: 1, sort: sortBy.value as any })
        } else {
          sortBy.value = PRODUCT_SORT_OPTIONS.FEATURED
          fetchProducts({ ...filters.value, featured: true, page: 1, sort: PRODUCT_SORT_OPTIONS.FEATURED as any })
        }
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
  await fetchProducts({ sort: PRODUCT_SORT_OPTIONS.CREATED, page: 1, limit: PRODUCTS.DEFAULT_PER_PAGE })

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
      priceRange.value = { min: res.min ?? PRODUCTS.DEFAULT_PRICE_MIN, max: res.max ?? PRODUCTS.DEFAULT_PRICE_MAX }
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
