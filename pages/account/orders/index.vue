<template>
  <div class="py-12">
    <!-- Pull to Refresh Indicator -->
    <div
      v-if="isPulling || isRefreshing"
      class="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4"
      :style="pullIndicatorStyle"
    >
      <div class="bg-white dark:bg-gray-800 rounded-full shadow-lg px-4 py-2 flex items-center space-x-2">
        <svg
          v-if="isRefreshing"
          class="animate-spin h-5 w-5 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <svg
          v-else
          class="h-5 w-5 text-blue-600"
          :class="{ 'transform rotate-180': canRefresh }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ pullStatusText }}
        </span>
      </div>
    </div>

    <div
      ref="scrollContainer"
      class="container"
    >
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {{ $t('account.orders') }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              {{ $t('orders.viewAndManage') }}
            </p>
          </div>

          <!-- Real-time connection indicator and unviewed updates badge -->
          <div class="flex items-center space-x-3">
            <!-- Unviewed updates badge -->
            <div
              v-if="hasUnviewedUpdates"
              class="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
                {{ unviewedCount }} {{ unviewedCount === 1 ? 'update' : 'updates' }}
              </span>
            </div>

            <!-- Connection status indicator -->
            <div
              v-if="isConnected"
              class="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400"
              :title="$t('orders.realTimeConnected')"
            >
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span class="hidden sm:inline">Live</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="mb-6">
        <OrderSearch
          v-model="searchFilters"
          @search="handleSearch"
        />
      </div>

      <!-- View Toggle (Grid/List) - Hidden on mobile -->
      <div class="flex justify-between items-center mb-6">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          <span
            v-if="!loading && hasOrders"
            class="hidden sm:inline"
          >
            {{ $t('orders.showing', {
              start: (paginationValue.page - 1) * paginationValue.limit + 1,
              end: Math.min(paginationValue.page * paginationValue.limit, paginationValue.total),
              total: paginationValue.total,
            }) }}
          </span>
          <span
            v-if="!loading && hasOrders"
            class="sm:hidden"
          >
            {{ paginationValue.total }} {{ $t('orders.orders') }}
          </span>
        </div>

        <div class="hidden md:flex items-center space-x-2">
          <button
            :class="[
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid'
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
            ]"
            :aria-label="$t('orders.gridView')"
            @click="viewMode = 'grid'"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            :class="[
              'p-2 rounded-lg transition-colors',
              viewMode === 'list'
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
            ]"
            :aria-label="$t('orders.listView')"
            @click="viewMode = 'list'"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="space-y-4"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse"
        >
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="errorValue"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center"
      >
        <svg
          class="w-12 h-12 text-red-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 class="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
          {{ $t('common.error') }}
        </h3>
        <p class="text-red-700 dark:text-red-300 mb-4">
          {{ errorValue }}
        </p>
        <button
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          @click="refreshOrders"
        >
          {{ $t('common.tryAgain') }}
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!hasOrders"
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center"
      >
        <svg
          class="w-16 h-16 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {{ $t('orders.noOrders') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ $t('orders.noOrdersDescription') }}
        </p>
        <NuxtLink
          :to="localePath('/products')"
          class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {{ $t('orders.startShopping') }}
        </NuxtLink>
      </div>

      <!-- Orders Grid/List -->
      <div v-else>
        <!-- Desktop view (grid or list based on toggle) -->
        <div
          class="hidden md:block"
          :class="[
            viewMode === 'grid'
              ? 'grid grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4',
          ]"
        >
          <OrderCard
            v-for="order in ordersValue"
            :key="order.id"
            :order="order"
            :compact="viewMode === 'list'"
            @click="handleOrderClick(order)"
            @reorder="handleReorder(order)"
            @view-details="handleViewDetails(order)"
          />
        </div>

        <!-- Mobile view (always list) -->
        <div class="md:hidden space-y-4">
          <OrderCard
            v-for="order in ordersValue"
            :key="order.id"
            :order="order"
            :compact="true"
            @click="handleOrderClick(order)"
            @reorder="handleReorder(order)"
            @view-details="handleViewDetails(order)"
          />
        </div>

        <!-- Pagination -->
        <div
          v-if="paginationValue.totalPages > 1"
          class="mt-8 flex justify-center"
        >
          <nav
            class="flex items-center space-x-2"
            aria-label="Pagination"
          >
            <button
              :disabled="paginationValue.page === 1"
              :class="[
                'px-3 py-2 rounded-lg border transition-colors',
                paginationValue.page === 1
                  ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
              ]"
              :aria-label="$t('common.previous')"
              @click="goToPage(paginationValue.page - 1)"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <template
              v-for="page in visiblePages"
              :key="page"
            >
              <button
                v-if="page !== '...'"
                :class="[
                  'px-4 py-2 rounded-lg border transition-colors',
                  page === paginationValue.page
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                ]"
                :aria-label="$t('orders.goToPage', { page })"
                :aria-current="page === paginationValue.page ? 'page' : undefined"
                @click="goToPage(page as number)"
              >
                {{ page }}
              </button>
              <span
                v-else
                class="px-2 text-gray-500"
              >...</span>
            </template>

            <button
              :disabled="paginationValue.page === paginationValue.totalPages"
              :class="[
                'px-3 py-2 rounded-lg border transition-colors',
                paginationValue.page === paginationValue.totalPages
                  ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
              ]"
              :aria-label="$t('common.next')"
              @click="goToPage(paginationValue.page + 1)"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderWithItems, OrderStatus } from '~/types'

// Apply authentication middleware
definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const route = useRoute()
const supabaseClient = useSupabaseClient()

// Use orders composable
const {
  orders,
  loading,
  error,
  pagination,
  filters: _filters,
  fetchOrders,
  refreshOrders,
  searchOrders: _searchOrders,
  filterByStatus: _filterByStatus,
  clearFilters: _clearFilters,
  hasOrders,
  filteredOrdersCount: _filteredOrdersCount,
} = useOrders()

// Use order tracking composable for real-time updates
const {
  isConnected,
  hasUnviewedUpdates,
  unviewedCount,
  subscribeToOrderUpdates,
  unsubscribeFromOrderUpdates,
  markUpdatesAsViewed,
} = useOrderTracking()

// Pull to refresh composable
const {
  isRefreshing,
  isPulling,
  canRefresh,
  pullIndicatorStyle,
  pullStatusText,
  setupPullToRefresh,
  cleanupPullToRefresh,
} = usePullToRefresh(async () => {
  await refreshOrders()
})

// Swipe gestures composable
const {
  setupSwipeListeners,
  cleanupSwipeListeners,
  setSwipeHandlers,
} = useSwipeGestures()

// Local state
const viewMode = ref<'grid' | 'list'>('grid')
const searchFilters = ref<{
  search?: string
  status?: OrderStatus | ''
  dateFrom?: string
  dateTo?: string
}>({})
const scrollContainer = ref<HTMLElement | null>(null)

// Convert readonly refs to writable for template usage
const ordersValue = computed(() => unref(orders) as OrderWithItems[])
const paginationValue = computed(() => unref(pagination))
const errorValue = computed(() => unref(error))

// Initialize filters from URL query params
const initializeFromUrl = (): Record<string, any> => {
  const query = route.query

  searchFilters.value = {
    search: (query.search as string) || undefined,
    status: (query.status as OrderStatus) || undefined,
    dateFrom: (query.dateFrom as string) || undefined,
    dateTo: (query.dateTo as string) || undefined,
  }

  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10

  return {
    ...searchFilters.value,
    page,
    limit,
  }
}

// Update URL with current filters
const updateUrl = (params: Record<string, any>) => {
  const query: Record<string, string> = {}

  if (params.search) query.search = params.search
  if (params.status) query.status = params.status
  if (params.dateFrom) query.dateFrom = params.dateFrom
  if (params.dateTo) query.dateTo = params.dateTo
  if (params.page && params.page !== 1) query.page = params.page.toString()
  if (params.limit && params.limit !== 10) query.limit = params.limit.toString()

  router.push({
    query: Object.keys(query).length > 0 ? query : undefined,
  })
}

// Computed properties
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const pag = unref(pagination)
  const current = pag.page
  const total = pag.totalPages

  if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  }
  else {
    // Always show first page
    pages.push(1)

    if (current > 3) {
      pages.push('...')
    }

    // Show pages around current
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < total - 2) {
      pages.push('...')
    }

    // Always show last page
    pages.push(total)
  }

  return pages
})

// Methods
const handleSearch = async (filters: typeof searchFilters.value) => {
  const params = {
    search: filters.search,
    status: filters.status as OrderStatus | undefined,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    page: 1,
  }

  // Update URL
  updateUrl(params)

  // Fetch orders
  await fetchOrders(params)
}

const goToPage = async (page: number) => {
  const pag = unref(pagination)
  if (page < 1 || page > pag.totalPages) return

  const params = {
    ...searchFilters.value,
    page,
  }

  // Update URL
  updateUrl(params)

  // Fetch orders
  await fetchOrders({ page })

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleOrderClick = (order: OrderWithItems) => {
  router.push(localePath(`/account/orders/${order.id}`))
}

const handleViewDetails = (order: OrderWithItems) => {
  router.push(localePath(`/account/orders/${order.id}`))
}

const handleReorder = async (order: OrderWithItems) => {
  // TODO: Implement reorder functionality
  // Will add items from this order to cart
}

// Setup mobile features
const setupMobileFeatures = () => {
  if (!scrollContainer.value) return

  try {
    // Setup pull to refresh
    setupPullToRefresh(scrollContainer.value)

    // Setup swipe gestures for pagination
    setupSwipeListeners(scrollContainer.value)
    const pag = unref(pagination)
    setSwipeHandlers({
      onLeft: () => {
        // Swipe left to go to next page
        const currentPag = unref(pagination)
        if (currentPag.page < currentPag.totalPages) {
          goToPage(currentPag.page + 1)
        }
      },
      onRight: () => {
        // Swipe right to go to previous page
        const currentPag = unref(pagination)
        if (currentPag.page > 1) {
          goToPage(currentPag.page - 1)
        }
      },
    })
  }
  catch (err) {
    console.warn('Failed to setup mobile features:', err)
  }
}

// Cleanup mobile features
const cleanupMobileFeatures = () => {
  cleanupPullToRefresh()
  cleanupSwipeListeners()
}

// Load orders on mount
onMounted(async () => {
  try {
    const urlParams = initializeFromUrl()
    await fetchOrders(urlParams)

    // Setup real-time subscription for order updates
    try {
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (user) {
        await subscribeToOrderUpdates(user.id)
      }

      // Mark updates as viewed when user visits the page
      markUpdatesAsViewed()
    }
    catch (subscriptionError) {
      console.warn('Failed to setup real-time updates:', subscriptionError)
      // Continue without real-time updates
    }

    // Setup mobile features after DOM is ready
    nextTick(() => {
      setupMobileFeatures()
    })
  }
  catch (err) {
    console.error('Failed to initialize orders page:', err)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  cleanupMobileFeatures()
  unsubscribeFromOrderUpdates()
})

// Watch for URL changes (browser back/forward)
watch(() => route.query, async (newQuery) => {
  const urlParams = initializeFromUrl()
  await fetchOrders(urlParams)
}, { deep: true })

// Set page title
useHead({
  title: t('account.orders'),
})
</script>
