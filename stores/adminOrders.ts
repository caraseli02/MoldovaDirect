/**
 * Admin Orders Store using Pinia
 * 
 * Requirements addressed:
 * - 1.1: Paginated order listing with search and filtering capabilities
 * - 1.2: Order fetching with customer information and status tracking
 * 
 * Manages:
 * - Order listing with admin-specific data
 * - Search and filtering functionality
 * - Pagination state
 * - Order detail information
 * - Error handling and loading states
 */

import { defineStore } from 'pinia'
import type { 
  OrderWithAdminDetails, 
  AdminOrderFilters,
  Pagination,
  OrderStatusHistory,
  OrderNote,
  OrderFulfillmentTask
} from '~/types/database'

interface OrderListItem extends OrderWithAdminDetails {
  customerName?: string
  customerEmail?: string
  itemCount: number
  daysSinceOrder: number
}

interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface OrderAggregates {
  totalRevenue: number
  averageOrderValue: number
  statusCounts: Record<string, number>
}

interface AdminOrdersState {
  orders: OrderListItem[]
  currentOrder: OrderWithAdminDetails | null
  filters: AdminOrderFilters
  pagination: PaginationState
  aggregates: OrderAggregates | null
  loading: boolean
  orderDetailLoading: boolean
  actionLoading: boolean
  error: string | null
  lastRefresh: Date | null
}

export const useAdminOrdersStore = defineStore('adminOrders', {
  state: (): AdminOrdersState => ({
    orders: [],
    currentOrder: null,
    filters: {
      search: '',
      status: undefined,
      paymentStatus: undefined,
      dateRange: undefined,
      amountRange: undefined,
      priority: undefined,
      shippingMethod: undefined,
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1,
      limit: 20
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    },
    aggregates: null,
    loading: false,
    orderDetailLoading: false,
    actionLoading: false,
    error: null,
    lastRefresh: null
  }),

  getters: {
    /**
     * Get orders with enhanced display data
     */
    ordersWithDisplayData: (state) => {
      return state.orders.map(order => ({
        ...order,
        formattedTotal: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EUR'
        }).format(order.totalEur),
        formattedDate: new Date(order.createdAt).toLocaleDateString(),
        formattedStatus: order.status.charAt(0).toUpperCase() + order.status.slice(1),
        statusBadgeVariant: getStatusBadgeVariant(order.status),
        paymentStatusBadgeVariant: getPaymentStatusBadgeVariant(order.paymentStatus),
        urgencyLevel: getOrderUrgency(order),
        isOverdue: isOrderOverdue(order)
      }))
    },

    /**
     * Get current query parameters for API calls
     */
    queryParams: (state) => {
      const params: any = {
        page: state.pagination.page,
        limit: state.pagination.limit
      }

      if (state.filters.search) {
        params.search = state.filters.search
      }
      if (state.filters.status && state.filters.status.length > 0) {
        params.status = state.filters.status.join(',')
      }
      if (state.filters.paymentStatus && state.filters.paymentStatus.length > 0) {
        params.paymentStatus = state.filters.paymentStatus.join(',')
      }
      if (state.filters.dateRange) {
        params.dateFrom = state.filters.dateRange.start
        params.dateTo = state.filters.dateRange.end
      }
      if (state.filters.amountRange) {
        params.amountMin = state.filters.amountRange.min
        params.amountMax = state.filters.amountRange.max
      }
      if (state.filters.priority && state.filters.priority.length > 0) {
        params.priority = state.filters.priority.join(',')
      }
      if (state.filters.shippingMethod && state.filters.shippingMethod.length > 0) {
        params.shippingMethod = state.filters.shippingMethod.join(',')
      }
      if (state.filters.sortBy) {
        params.sortBy = state.filters.sortBy
        params.sortOrder = state.filters.sortOrder
      }

      return params
    },

    /**
     * Check if filters are applied
     */
    hasActiveFilters: (state): boolean => {
      return !!(
        state.filters.search ||
        (state.filters.status && state.filters.status.length > 0) ||
        (state.filters.paymentStatus && state.filters.paymentStatus.length > 0) ||
        state.filters.dateRange ||
        state.filters.amountRange ||
        (state.filters.priority && state.filters.priority.length > 0) ||
        (state.filters.shippingMethod && state.filters.shippingMethod.length > 0)
      )
    },

    /**
     * Get formatted aggregates
     */
    formattedAggregates: (state) => {
      if (!state.aggregates) return null

      return {
        ...state.aggregates,
        formattedRevenue: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EUR'
        }).format(state.aggregates.totalRevenue),
        formattedAverageOrderValue: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EUR'
        }).format(state.aggregates.averageOrderValue)
      }
    },

    /**
     * Check if data needs refresh (older than 5 minutes)
     */
    needsRefresh: (state): boolean => {
      if (!state.lastRefresh) return true
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      return state.lastRefresh < fiveMinutesAgo
    },

    /**
     * Get orders by status
     */
    ordersByStatus: (state) => (status: string) => {
      return state.orders.filter(order => order.status === status)
    },

    /**
     * Get pending orders count
     */
    pendingOrdersCount: (state): number => {
      return state.orders.filter(order => order.status === 'pending').length
    },

    /**
     * Get processing orders count
     */
    processingOrdersCount: (state): number => {
      return state.orders.filter(order => order.status === 'processing').length
    }
  },

  actions: {
    /**
     * Fetch orders with current filters and pagination
     */
    async fetchOrders() {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<{
          success: boolean
          data: {
            orders: OrderListItem[]
            pagination: PaginationState
            aggregates: OrderAggregates
          }
        }>('/api/admin/orders', {
          query: this.queryParams
        })

        if (response.success) {
          this.orders = response.data.orders
          this.pagination = response.data.pagination
          this.aggregates = response.data.aggregates
          this.lastRefresh = new Date()
        } else {
          throw new Error('Failed to fetch orders')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch orders'
        console.error('Error fetching admin orders:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch detailed order information
     */
    async fetchOrderById(orderId: number) {
      this.orderDetailLoading = true
      this.error = null

      try {
        const response = await $fetch<{
          success: boolean
          data: OrderWithAdminDetails
        }>(`/api/admin/orders/${orderId}`)

        if (response.success) {
          this.currentOrder = response.data
          return response.data
        } else {
          throw new Error('Failed to fetch order details')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch order details'
        console.error('Error fetching order detail:', error)
        throw error
      } finally {
        this.orderDetailLoading = false
      }
    },

    /**
     * Update search filter and refresh
     */
    async updateSearch(search: string) {
      this.filters.search = search
      this.pagination.page = 1
      await this.fetchOrders()
    },

    /**
     * Update status filter and refresh
     */
    async updateStatusFilter(status: Array<'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'> | undefined) {
      this.filters.status = status
      this.pagination.page = 1
      await this.fetchOrders()
    },

    /**
     * Update payment status filter and refresh
     */
    async updatePaymentStatusFilter(paymentStatus: Array<'pending' | 'paid' | 'failed' | 'refunded'> | undefined) {
      this.filters.paymentStatus = paymentStatus
      this.pagination.page = 1
      await this.fetchOrders()
    },

    /**
     * Update date range filter and refresh
     */
    async updateDateRange(start?: string, end?: string) {
      if (start && end) {
        this.filters.dateRange = { start, end }
      } else {
        this.filters.dateRange = undefined
      }
      this.pagination.page = 1
      await this.fetchOrders()
    },

    /**
     * Update amount range filter and refresh
     */
    async updateAmountRange(min?: number, max?: number) {
      if (min !== undefined && max !== undefined) {
        this.filters.amountRange = { min, max }
      } else {
        this.filters.amountRange = undefined
      }
      this.pagination.page = 1
      await this.fetchOrders()
    },

    /**
     * Update priority filter and refresh
     */
    async updatePriorityFilter(priority: number[] | undefined) {
      this.filters.priority = priority
      this.pagination.page = 1
      await this.fetchOrders()
    },

    /**
     * Update sorting and refresh
     */
    async updateSort(sortBy: 'created_at' | 'total_eur' | 'status' | 'priority_level', sortOrder: 'asc' | 'desc' = 'asc') {
      this.filters.sortBy = sortBy
      this.filters.sortOrder = sortOrder
      await this.fetchOrders()
    },

    /**
     * Go to specific page
     */
    async goToPage(page: number) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.pagination.page = page
        await this.fetchOrders()
      }
    },

    /**
     * Go to next page
     */
    async nextPage() {
      if (this.pagination.hasNext) {
        await this.goToPage(this.pagination.page + 1)
      }
    },

    /**
     * Go to previous page
     */
    async prevPage() {
      if (this.pagination.hasPrev) {
        await this.goToPage(this.pagination.page - 1)
      }
    },

    /**
     * Clear all filters
     */
    async clearFilters() {
      this.filters = {
        search: '',
        status: undefined,
        paymentStatus: undefined,
        dateRange: undefined,
        amountRange: undefined,
        priority: undefined,
        shippingMethod: undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
        page: 1,
        limit: 20
      }
      this.pagination.page = 1
      await this.fetchOrders()
    },

    /**
     * Refresh orders data
     */
    async refresh() {
      await this.fetchOrders()
    },

    /**
     * Initialize store (fetch initial data)
     */
    async initialize() {
      await this.fetchOrders()
    },

    /**
     * Clear current order detail
     */
    clearCurrentOrder() {
      this.currentOrder = null
    },

    /**
     * Clear error state
     */
    clearError() {
      this.error = null
    },

    /**
     * Reset store to initial state
     */
    reset() {
      this.$reset()
    }
  }
})

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Get badge variant for order status
 */
function getStatusBadgeVariant(status: string): string {
  const variants: Record<string, string> = {
    pending: 'secondary',
    processing: 'default',
    shipped: 'default',
    delivered: 'default',
    cancelled: 'destructive'
  }
  return variants[status] || 'secondary'
}

/**
 * Get badge variant for payment status
 */
function getPaymentStatusBadgeVariant(status: string): string {
  const variants: Record<string, string> = {
    pending: 'secondary',
    paid: 'default',
    failed: 'destructive',
    refunded: 'secondary'
  }
  return variants[status] || 'secondary'
}

/**
 * Calculate order urgency level
 */
function getOrderUrgency(order: OrderListItem): 'low' | 'medium' | 'high' {
  const daysSinceOrder = order.daysSinceOrder

  if (order.status === 'pending' && daysSinceOrder > 2) {
    return 'high'
  }
  if (order.status === 'processing' && daysSinceOrder > 3) {
    return 'high'
  }
  if (order.priorityLevel && order.priorityLevel > 2) {
    return 'high'
  }
  if (daysSinceOrder > 1) {
    return 'medium'
  }
  return 'low'
}

/**
 * Check if order is overdue
 */
function isOrderOverdue(order: OrderListItem): boolean {
  const daysSinceOrder = order.daysSinceOrder
  
  if (order.status === 'pending' && daysSinceOrder > 2) {
    return true
  }
  if (order.status === 'processing' && daysSinceOrder > 5) {
    return true
  }
  if (order.estimatedShipDate) {
    const estimatedDate = new Date(order.estimatedShipDate)
    return new Date() > estimatedDate
  }
  
  return false
}
