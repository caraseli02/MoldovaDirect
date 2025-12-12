/**
 * Orders composable for order list management
 *
 * Provides functionality for fetching, filtering, and searching user orders
 * Requirements addressed:
 * - 1.1: Display paginated list of orders
 * - 1.2: Show order summary information
 * - 1.3: Handle empty state
 * - 5.1: Search orders by order number, product name, or date range
 * - 5.2: Filter by order status, date range, and price range
 * - 5.3: Handle empty search/filter results
 */

import type { Order, OrderStatus, Pagination } from '~/types'

export interface OrderFilters {
  status?: OrderStatus
  dateFrom?: string
  dateTo?: string
  search?: string
  page: number
  limit: number
}

export interface OrdersResponse {
  success: boolean
  data: {
    orders: Order[]
    pagination: Pagination
  }
}

export interface UseOrdersReturn {
  // State
  orders: Ref<Order[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  pagination: Ref<Pagination>
  filters: Ref<OrderFilters>

  // Actions
  fetchOrders: (params?: Partial<OrderFilters>) => Promise<void>
  refreshOrders: () => Promise<void>
  searchOrders: (query: string) => Promise<void>
  filterByStatus: (status: OrderStatus | undefined) => Promise<void>
  clearFilters: () => void

  // Computed
  hasOrders: ComputedRef<boolean>
  filteredOrdersCount: ComputedRef<number>
}

export const useOrders = (): UseOrdersReturn => {
  const supabaseClient = useSupabaseClient()

  // State
  const orders = ref<Order[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const filters = ref<OrderFilters>({
    page: 1,
    limit: 10,
  })

  // Debounced search
  let searchTimeout: NodeJS.Timeout | null = null
  const SEARCH_DEBOUNCE_MS = 300

  /**
   * Fetch orders with current filters
   */
  const fetchOrders = async (params?: Partial<OrderFilters>) => {
    try {
      loading.value = true
      error.value = null

      // Merge params with current filters
      if (params) {
        filters.value = {
          ...filters.value,
          ...params,
        }
      }

      // Get auth token
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) {
        throw new Error('Authentication required')
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: filters.value.page.toString(),
        limit: filters.value.limit.toString(),
      })

      if (filters.value.status) {
        queryParams.append('status', filters.value.status)
      }
      if (filters.value.search) {
        queryParams.append('search', filters.value.search)
      }
      if (filters.value.dateFrom) {
        queryParams.append('dateFrom', filters.value.dateFrom)
      }
      if (filters.value.dateTo) {
        queryParams.append('dateTo', filters.value.dateTo)
      }

      // Fetch orders from API
      const response = await $fetch<OrdersResponse>(`/api/orders?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (response.success) {
        orders.value = response.data.orders
        pagination.value = response.data.pagination
      }
      else {
        throw new Error('Failed to fetch orders')
      }
    }
    catch (err: any) {
      console.error('Error fetching orders:', err)
      error.value = err.message || 'Failed to load orders'
      orders.value = []
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Refresh orders with current filters
   */
  const refreshOrders = async () => {
    await fetchOrders()
  }

  /**
   * Search orders with debouncing
   */
  const searchOrders = async (query: string) => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Set new timeout for debounced search
    searchTimeout = setTimeout(async () => {
      await fetchOrders({
        search: query,
        page: 1, // Reset to first page on new search
      })
    }, SEARCH_DEBOUNCE_MS)
  }

  /**
   * Filter orders by status
   */
  const filterByStatus = async (status: OrderStatus | undefined) => {
    await fetchOrders({
      status,
      page: 1, // Reset to first page on filter change
    })
  }

  /**
   * Clear all filters and reset to default
   */
  const clearFilters = () => {
    filters.value = {
      page: 1,
      limit: 10,
    }
    fetchOrders()
  }

  // Computed properties
  const hasOrders = computed(() => orders.value.length > 0)
  const filteredOrdersCount = computed(() => pagination.value.total)

  return {
    // State
    orders: readonly(orders),
    loading: readonly(loading),
    error: readonly(error),
    pagination: readonly(pagination),
    filters: readonly(filters),

    // Actions
    fetchOrders,
    refreshOrders,
    searchOrders,
    filterByStatus,
    clearFilters,

    // Computed
    hasOrders,
    filteredOrdersCount,
  }
}
