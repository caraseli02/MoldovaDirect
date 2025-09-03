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
    metadata?: any
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
      sortOrder: 'desc'
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    },
    summary: null,
    loading: false,
    userDetailLoading: false,
    actionLoading: false,
    error: null
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
          currency: 'EUR'
        }).format(user.totalSpent || 0),
        formattedLastOrder: user.lastOrderDate 
          ? new Date(user.lastOrderDate).toLocaleDateString()
          : 'Never',
        formattedRegistration: new Date(user.created_at).toLocaleDateString(),
        formattedLastLogin: user.last_sign_in_at
          ? new Date(user.last_sign_in_at).toLocaleDateString()
          : 'Never'
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
        state.filters.search ||
        state.filters.registrationDateFrom ||
        state.filters.registrationDateTo ||
        state.filters.status
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
          currency: 'EUR'
        }).format(state.summary.totalRevenue),
        activePercentage: state.summary.totalUsers > 0 
          ? Math.round((state.summary.activeUsers / state.summary.totalUsers) * 100)
          : 0
      }
    }
  },

  actions: {
    /**
     * Fetch users with current filters and pagination
     */
    async fetchUsers() {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<{
          success: boolean
          data: {
            users: UserWithProfile[]
            pagination: PaginationState
            summary: UsersSummary
          }
        }>('/api/admin/users', {
          query: this.queryParams
        })

        if (response.success) {
          this.users = response.data.users
          this.pagination = response.data.pagination
          this.summary = response.data.summary
        } else {
          throw new Error('Failed to fetch users')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch users'
        console.error('Error fetching admin users:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch detailed user information
     */
    async fetchUserDetail(userId: string) {
      this.userDetailLoading = true
      this.error = null

      try {
        const response = await $fetch<{
          success: boolean
          data: UserDetail
        }>(`/api/admin/users/${userId}`)

        if (response.success) {
          this.currentUser = response.data
        } else {
          throw new Error('Failed to fetch user details')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch user details'
        console.error('Error fetching user detail:', error)
      } finally {
        this.userDetailLoading = false
      }
    },

    /**
     * Update search filter and refresh
     */
    async updateSearch(search: string) {
      this.filters.search = search
      this.pagination.page = 1
      await this.fetchUsers()
    },

    /**
     * Update date range filter and refresh
     */
    async updateDateRange(from?: string, to?: string) {
      this.filters.registrationDateFrom = from
      this.filters.registrationDateTo = to
      this.pagination.page = 1
      await this.fetchUsers()
    },

    /**
     * Update status filter and refresh
     */
    async updateStatusFilter(status: 'active' | 'inactive' | '') {
      this.filters.status = status
      this.pagination.page = 1
      await this.fetchUsers()
    },

    /**
     * Update sorting and refresh
     */
    async updateSort(sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') {
      this.filters.sortBy = sortBy as any
      this.filters.sortOrder = sortOrder
      await this.fetchUsers()
    },

    /**
     * Go to specific page
     */
    async goToPage(page: number) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.pagination.page = page
        await this.fetchUsers()
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
        registrationDateFrom: undefined,
        registrationDateTo: undefined,
        status: '',
        sortBy: 'created_at',
        sortOrder: 'desc'
      }
      this.pagination.page = 1
      await this.fetchUsers()
    },

    /**
     * Perform user account action
     */
    async performUserAction(
      userId: string, 
      action: 'suspend' | 'unsuspend' | 'ban' | 'unban' | 'verify_email' | 'reset_password' | 'update_role',
      options: {
        reason?: string
        duration?: number
        role?: string
        notes?: string
      } = {}
    ) {
      this.actionLoading = true

      try {
        const response = await $fetch<{
          success: boolean
          data: any
          message: string
        }>(`/api/admin/users/${userId}/actions`, {
          method: 'POST',
          body: {
            action,
            ...options
          }
        })

        if (response.success) {
          // Update local state if current user is affected
          if (this.currentUser && this.currentUser.id === userId) {
            // Refresh user detail to get updated data
            await this.fetchUserDetail(userId)
          }

          // Update user in the list if present
          const userIndex = this.users.findIndex(u => u.id === userId)
          if (userIndex !== -1) {
            // Refresh the list to get updated data
            await this.fetchUsers()
          }

          // Show success message
          const toast = useToastStore()
          toast.success(response.message)

          return response.data
        } else {
          throw new Error('Action failed')
        }
      } catch (error) {
        const toast = useToastStore()
        toast.error(error instanceof Error ? error.message : 'Failed to perform action')
        throw error
      } finally {
        this.actionLoading = false
      }
    },

    /**
     * Suspend user account
     */
    async suspendUser(userId: string, reason: string, duration?: number) {
      return this.performUserAction(userId, 'suspend', { reason, duration })
    },

    /**
     * Unsuspend user account
     */
    async unsuspendUser(userId: string, reason?: string) {
      return this.performUserAction(userId, 'unsuspend', { reason })
    },

    /**
     * Ban user account
     */
    async banUser(userId: string, reason: string) {
      return this.performUserAction(userId, 'ban', { reason })
    },

    /**
     * Unban user account
     */
    async unbanUser(userId: string, reason?: string) {
      return this.performUserAction(userId, 'unban', { reason })
    },

    /**
     * Verify user email
     */
    async verifyUserEmail(userId: string, reason?: string) {
      return this.performUserAction(userId, 'verify_email', { reason })
    },

    /**
     * Reset user password
     */
    async resetUserPassword(userId: string, reason?: string) {
      return this.performUserAction(userId, 'reset_password', { reason })
    },

    /**
     * Update user role
     */
    async updateUserRole(userId: string, role: string, reason?: string) {
      return this.performUserAction(userId, 'update_role', { role, reason })
    },

    /**
     * Initialize store (fetch initial data)
     */
    async initialize() {
      await this.fetchUsers()
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
    }
  }
})