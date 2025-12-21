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
import { useAuthStore } from './auth'
import type {
  OrderWithAdminDetails,
  AdminOrderFilters,
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
  selectedOrders: number[]
  bulkOperationInProgress: boolean
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
      limit: 20,
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    aggregates: null,
    loading: false,
    orderDetailLoading: false,
    actionLoading: false,
    error: null,
    lastRefresh: null,
    selectedOrders: [],
    bulkOperationInProgress: false,
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
          currency: 'EUR',
        }).format(order.totalEur),
        formattedDate: new Date(order.createdAt).toLocaleDateString(),
        formattedStatus: order.status.charAt(0).toUpperCase() + order.status.slice(1),
        statusBadgeVariant: getStatusBadgeVariant(order.status),
        paymentStatusBadgeVariant: getPaymentStatusBadgeVariant(order.paymentStatus),
        urgencyLevel: getOrderUrgency(order),
        isOverdue: isOrderOverdue(order),
      }))
    },

    /**
     * Get current query parameters for API calls
     * Uses snake_case to match server expectations
     */
    queryParams: (state) => {
      const params: Record<string, any> = {
        page: state.pagination.page,
        limit: state.pagination.limit,
      }

      if (state.filters.search) {
        params.search = state.filters.search
      }
      // Send only first status for now (server doesn't support multiple)
      if (state.filters.status && state.filters.status.length > 0) {
        params.status = state.filters.status[0]
      }
      // Send only first payment status (server doesn't support multiple)
      if (state.filters.paymentStatus && state.filters.paymentStatus.length > 0) {
        params.payment_status = state.filters.paymentStatus[0]
      }
      if (state.filters.dateRange) {
        params.date_from = state.filters.dateRange.start
        params.date_to = state.filters.dateRange.end
      }
      if (state.filters.amountRange) {
        params.amount_min = state.filters.amountRange.min
        params.amount_max = state.filters.amountRange.max
      }
      // Priority and shipping method not yet supported by server
      if (state.filters.priority && state.filters.priority.length > 0) {
        params.priority = state.filters.priority[0]
      }
      if (state.filters.shippingMethod && state.filters.shippingMethod.length > 0) {
        params.shipping_method = state.filters.shippingMethod[0]
      }
      if (state.filters.sortBy) {
        params.sort_by = state.filters.sortBy
        params.sort_order = state.filters.sortOrder
      }

      return params
    },

    /**
     * Check if filters are applied
     */
    hasActiveFilters: (state): boolean => {
      return !!(
        state.filters.search
        || (state.filters.status && state.filters.status.length > 0)
        || (state.filters.paymentStatus && state.filters.paymentStatus.length > 0)
        || state.filters.dateRange
        || state.filters.amountRange
        || (state.filters.priority && state.filters.priority.length > 0)
        || (state.filters.shippingMethod && state.filters.shippingMethod.length > 0)
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
          currency: 'EUR',
        }).format(state.aggregates.totalRevenue),
        formattedAverageOrderValue: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EUR',
        }).format(state.aggregates.averageOrderValue),
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
    ordersByStatus: state => (status: string) => {
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
    },

    /**
     * Check if any orders are selected
     */
    hasSelectedOrders: (state): boolean => {
      return state.selectedOrders.length > 0
    },

    /**
     * Check if all visible orders are selected
     */
    allVisibleSelected: (state): boolean => {
      if (state.orders.length === 0) return false
      return state.orders.every(order =>
        state.selectedOrders.includes(order.id),
      )
    },

    /**
     * Get count of selected orders
     */
    selectedCount: (state): number => {
      return state.selectedOrders.length
    },
  },

  actions: {
    /**
     * Fetch orders with current filters and pagination
     */
    async fetchOrders() {
      const authStore = useAuthStore()

      if (authStore.isTestSession) {
        this.loading = true
        await new Promise(resolve => setTimeout(resolve, 800))

        const mockOrders: OrderListItem[] = [
          {
            id: 1,
            orderNumber: 'ORD-2024-001',
            status: 'pending',
            paymentMethod: 'stripe',
            paymentStatus: 'paid',
            subtotalEur: 120.50,
            shippingCostEur: 25.00,
            taxEur: 0,
            totalEur: 145.50,
            shippingAddress: { id: 1, type: 'shipping', street: 'Calle Principal 123', city: 'Madrid', postalCode: '28001', country: 'ES', isDefault: true },
            billingAddress: { id: 2, type: 'billing', street: 'Calle Principal 123', city: 'Madrid', postalCode: '28001', country: 'ES', isDefault: true },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            itemCount: 3,
            daysSinceOrder: 0,
            customerName: 'Juan Pérez',
            customerEmail: 'juan@example.com',
          },
          {
            id: 2,
            orderNumber: 'ORD-2024-002',
            status: 'processing',
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            subtotalEur: 85.00,
            shippingCostEur: 15.00,
            taxEur: 0,
            totalEur: 100.00,
            shippingAddress: { id: 3, type: 'shipping', street: 'Strada Albă 45', city: 'Chișinău', postalCode: 'MD-2001', country: 'MD', isDefault: true },
            billingAddress: { id: 4, type: 'billing', street: 'Strada Albă 45', city: 'Chișinău', postalCode: 'MD-2001', country: 'MD', isDefault: true },
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            itemCount: 2,
            daysSinceOrder: 1,
            customerName: 'Maria Popescu',
            customerEmail: 'maria@example.com',
          },
        ]

        this.orders = mockOrders
        this.pagination = {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        }
        this.aggregates = {
          totalRevenue: 245.50,
          averageOrderValue: 122.75,
          statusCounts: { pending: 1, processing: 1 },
        }
        this.lastRefresh = new Date()
        this.loading = false
        return
      }

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
          query: this.queryParams,
        })

        if (response.success) {
          this.orders = response.data.orders
          this.pagination = response.data.pagination
          this.aggregates = response.data.aggregates
          this.lastRefresh = new Date()
        }
        else {
          throw new Error('Failed to fetch orders')
        }
      }
      catch (error: any) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch orders'
        console.error('Error fetching admin orders:', error)
      }
      finally {
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
        }
        else {
          throw new Error('Failed to fetch order details')
        }
      }
      catch (error: any) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch order details'
        console.error('Error fetching order detail:', error)
        throw error
      }
      finally {
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
      }
      else {
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
      }
      else {
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
        limit: 20,
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
     * Select/deselect an order
     */
    toggleOrderSelection(orderId: number) {
      const index = this.selectedOrders.indexOf(orderId)
      if (index > -1) {
        this.selectedOrders.splice(index, 1)
      }
      else {
        this.selectedOrders.push(orderId)
      }
    },

    /**
     * Select all visible orders
     */
    selectAllVisible() {
      const visibleIds = this.orders.map(o => o.id)
      visibleIds.forEach((id) => {
        if (!this.selectedOrders.includes(id)) {
          this.selectedOrders.push(id)
        }
      })
    },

    /**
     * Deselect all visible orders
     */
    deselectAllVisible() {
      const visibleIds = this.orders.map(o => o.id)
      this.selectedOrders = this.selectedOrders.filter(id =>
        !visibleIds.includes(id),
      )
    },

    /**
     * Toggle selection of all visible orders
     */
    toggleAllVisible() {
      if (this.allVisibleSelected) {
        this.deselectAllVisible()
      }
      else {
        this.selectAllVisible()
      }
    },

    /**
     * Clear all selections
     */
    clearSelection() {
      this.selectedOrders = []
    },

    /**
     * Bulk update status of selected orders
     */
    async bulkUpdateStatus(status: string, notes?: string) {
      if (this.selectedOrders.length === 0) return

      this.bulkOperationInProgress = true
      this.error = null

      try {
        const response = await $fetch<{
          success: boolean
          data: {
            updated: number
            failed: number
            errors: Array<{ orderId: number, error: string }>
          }
          message: string
        }>('/api/admin/orders/bulk', {
          method: 'POST',
          body: {
            orderIds: this.selectedOrders,
            status,
            notes,
          },
        })

        if (response.success) {
          // Update local state for successfully updated orders
          this.orders.forEach((order) => {
            if (this.selectedOrders.includes(order.id)) {
              order.status = status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
            }
          })

          this.clearSelection()

          // Show success toast
          const toast = useToast()
          toast.success('Success', response.message)

          // Show warning if some failed
          if (response.data.failed > 0) {
            toast.warning('Warning', `${response.data.failed} orders failed to update`)
          }

          // Refresh orders to get latest data
          await this.fetchOrders()

          return response.data
        }
        else {
          throw new Error('Failed to update orders')
        }
      }
      catch (error: any) {
        this.error = error instanceof Error ? error.message : 'Failed to update orders'
        const toast = useToast()
        toast.error('Error', this.error)
        throw error
      }
      finally {
        this.bulkOperationInProgress = false
      }
    },

    /**
     * Reset store to initial state
     */
    reset() {
      this.$reset()
    },
  },
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
    cancelled: 'destructive',
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
    refunded: 'secondary',
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
