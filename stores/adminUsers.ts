/**
 * Admin Users Store using Pinia
 *
 * Requirements addressed:
 * - 4.1: Paginated user listing with search and filtering capabilities
 * - 4.2: User search by name, email, and registration date
 * - 4.3: User detail view with order history and account information
 * - 4.4, 4.5, 4.6: User account management actions
 *
 * Manages:
 * - User listing with admin-specific data
 * - Search and filtering functionality
 * - Pagination state
 * - User detail information
 * - User account actions (suspend, ban, etc.)
 */

import { defineStore } from 'pinia'

interface UserWithProfile {
  id: string
  email: string
  email_confirmed_at: string | null
  last_sign_in_at: string | null
  created_at: string
  updated_at: string
  profile: {
    name: string
    phone: string | null
    preferred_language: string
    created_at: string
    updated_at: string
  } | null
  status: 'active' | 'inactive'
  orderCount?: number
  lastOrderDate?: string
  totalSpent?: number
}

interface UserDetail extends UserWithProfile {
  addresses: Array<{
    id: number
    type: string
    street: string
    city: string
    postal_code: string
    province: string | null
    country: string
    is_default: boolean
    created_at: string
  }>
  orders: Array<{
    id: number
    order_number: string
    status: string
    payment_status: string
    total_eur: number
    created_at: string
    items_count: number
  }>
  activity: Array<{
    id: string
    event_type: string
    created_at: string
    ip_address?: string
    user_agent?: string
    metadata?: Record<string, any>
  }>
  statistics: {
    totalOrders: number
    totalSpent: number
    averageOrderValue: number
    lastOrderDate: string | null
    accountAge: number
    loginCount: number
    lastLogin: string | null
  }
}

interface UserFilters {
  search?: string
  registrationDateFrom?: string
  registrationDateTo?: string
  status?: 'active' | 'inactive' | ''
  sortBy?: 'name' | 'email' | 'created_at' | 'last_login'
  sortOrder?: 'asc' | 'desc'
}

interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface UsersSummary {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  totalOrders: number
  totalRevenue: number
}

interface AdminUsersState {
  users: UserWithProfile[]
  currentUser: UserDetail | null
  filters: UserFilters
  pagination: PaginationState
  summary: UsersSummary | null
  loading: boolean
  userDetailLoading: boolean
  actionLoading: boolean
  error: string | null
}

export const useAdminUsersStore = defineStore('adminUsers', {
  state: (): AdminUsersState => ({
    users: [],
    currentUser: null,
    filters: {
      search: '',
      registrationDateFrom: undefined,
      registrationDateTo: undefined,
      status: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    summary: null,
    loading: false,
    userDetailLoading: false,
    actionLoading: false,
    error: null,
  }),

  getters: {
    /**
     * Get users with enhanced display data
     */
    usersWithDisplayData: (state) => {
      return state.users.map(user => ({
        ...user,
        displayName: user.profile?.name || 'No name',
        statusBadge: user.status === 'active' ? 'success' : 'warning',
        formattedTotalSpent: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EUR',
        }).format(user.totalSpent || 0),
        formattedLastOrder: user.lastOrderDate
          ? new Date(user.lastOrderDate).toLocaleDateString()
          : 'Never',
        formattedRegistration: new Date(user.created_at).toLocaleDateString(),
        formattedLastLogin: user.last_sign_in_at
          ? new Date(user.last_sign_in_at).toLocaleDateString()
          : 'Never',
      }))
    },

    /**
     * Get current query parameters for API calls
     */
    queryParams: (state) => {
      const params: Record<string, any> = {
        page: state.pagination.page,
        limit: state.pagination.limit,
      }

      if (state.filters.search) {
        params.search = state.filters.search
      }
      if (state.filters.registrationDateFrom) {
        params.registrationDateFrom = state.filters.registrationDateFrom
      }
      if (state.filters.registrationDateTo) {
        params.registrationDateTo = state.filters.registrationDateTo
      }
      if (state.filters.status) {
        params.status = state.filters.status
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
        state.filters.search
        || state.filters.registrationDateFrom
        || state.filters.registrationDateTo
        || state.filters.status
      )
    },

    /**
     * Get formatted summary statistics
     */
    formattedSummary: (state) => {
      if (!state.summary) return null

      return {
        ...state.summary,
        formattedRevenue: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EUR',
        }).format(state.summary.totalRevenue),
        activePercentage: state.summary.totalUsers > 0
          ? Math.round((state.summary.activeUsers / state.summary.totalUsers) * 100)
          : 0,
      }
    },
  },

  actions: {
    /**
     * Set users data (called by component after fetching)
     */
    setUsers(users: UserWithProfile[]) {
      this.users = users
      this.error = null
    },

    /**
     * Set pagination data (called by component after fetching)
     */
    setPagination(pagination: PaginationState) {
      this.pagination = pagination
    },

    /**
     * Set summary data (called by component after fetching)
     */
    setSummary(summary: UsersSummary) {
      this.summary = summary
    },

    /**
     * Set current user detail (called by component after fetching)
     */
    setCurrentUser(user: UserDetail) {
      this.currentUser = user
      this.error = null
    },

    /**
     * Set loading states
     */
    setLoading(loading: boolean) {
      this.loading = loading
    },

    setUserDetailLoading(loading: boolean) {
      this.userDetailLoading = loading
    },

    setActionLoading(loading: boolean) {
      this.actionLoading = loading
    },

    /**
     * Set error state
     */
    setError(error: string) {
      this.error = error
    },

    /**
     * Update search filter (component will handle refetch)
     */
    updateSearch(search: string) {
      this.filters.search = search
      this.pagination.page = 1
    },

    /**
     * Update date range filter (component will handle refetch)
     */
    updateDateRange(from?: string, to?: string) {
      this.filters.registrationDateFrom = from
      this.filters.registrationDateTo = to
      this.pagination.page = 1
    },

    /**
     * Update status filter (component will handle refetch)
     */
    updateStatusFilter(status: 'active' | 'inactive' | '') {
      this.filters.status = status
      this.pagination.page = 1
    },

    /**
     * Update sorting (component will handle refetch)
     */
    updateSort(sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') {
      this.filters.sortBy = sortBy as string
      this.filters.sortOrder = sortOrder
    },

    /**
     * Go to specific page (component will handle refetch)
     */
    goToPage(page: number) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.pagination.page = page
      }
    },

    /**
     * Go to next page (component will handle refetch)
     */
    nextPage() {
      if (this.pagination.hasNext) {
        this.goToPage(this.pagination.page + 1)
      }
    },

    /**
     * Go to previous page (component will handle refetch)
     */
    prevPage() {
      if (this.pagination.hasPrev) {
        this.goToPage(this.pagination.page - 1)
      }
    },

    /**
     * Clear all filters (component will handle refetch)
     */
    clearFilters() {
      this.filters = {
        search: '',
        registrationDateFrom: undefined,
        registrationDateTo: undefined,
        status: '',
        sortBy: 'created_at',
        sortOrder: 'desc',
      }
      this.pagination.page = 1
    },

    /**
     * Clear current user detail
     */
    clearCurrentUser() {
      this.currentUser = null
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
    },
  },
})
