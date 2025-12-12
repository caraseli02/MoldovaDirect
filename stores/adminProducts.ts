/**
 * Admin Products Store using Pinia
 *
 * Requirements addressed:
 * - 1.1: Paginated product listing with search and filters
 * - 1.7: Real-time search functionality
 * - 6.2: Performance optimization with pagination
 *
 * Manages:
 * - Product listing with admin-specific data
 * - Search and filtering functionality
 * - Pagination state
 * - Sorting capabilities
 * - Bulk operations state
 */

import { defineStore } from 'pinia'
import type { ProductWithRelations } from '~/types/database'

interface ProductFilters {
  search?: string
  categoryId?: number
  status?: 'active' | 'inactive' | ''
  stockLevel?: 'in-stock' | 'low-stock' | 'out-of-stock' | ''
  sortBy?: 'name' | 'price' | 'stock' | 'created_at'
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

interface AdminProductsState {
  products: ProductWithRelations[]
  filters: ProductFilters
  pagination: PaginationState
  loading: boolean
  error: string | null
  selectedProducts: number[]
  bulkOperationInProgress: boolean
}

export const useAdminProductsStore = defineStore('adminProducts', {
  state: (): AdminProductsState => ({
    products: [],
    filters: {
      search: '',
      categoryId: undefined,
      status: '',
      stockLevel: '',
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
    loading: false,
    error: null,
    selectedProducts: [],
    bulkOperationInProgress: false,
  }),

  getters: {
    /**
     * Get products with enhanced admin data
     */
    productsWithAdminData: (state) => {
      return state.products.map(product => ({
        ...product,
        stockStatus: product.stockQuantity > 10
          ? 'high'
          : product.stockQuantity > 5
            ? 'medium'
            : product.stockQuantity > 0 ? 'low' : 'out',
        stockStatusColor: product.stockQuantity > 10
          ? 'green'
          : product.stockQuantity > 5
            ? 'yellow'
            : product.stockQuantity > 0 ? 'orange' : 'red',
        isSelected: state.selectedProducts.includes(product.id),
      }))
    },

    /**
     * Get current query parameters for API calls
     */
    queryParams: (state) => {
      const params: Record<string, any> = {
        page: state.pagination.page,
        limit: state.pagination.limit,
        admin: true, // Flag for admin-specific data
      }

      if (state.filters.search) {
        params.search = state.filters.search
      }
      if (state.filters.categoryId) {
        params.categoryId = state.filters.categoryId
      }
      if (state.filters.status === 'active') {
        params.active = true
      }
      else if (state.filters.status === 'inactive') {
        params.active = false
      }
      if (state.filters.stockLevel === 'in-stock') {
        params.inStock = true
      }
      else if (state.filters.stockLevel === 'out-of-stock') {
        params.outOfStock = true
      }
      else if (state.filters.stockLevel === 'low-stock') {
        params.lowStock = true
      }
      if (state.filters.sortBy) {
        params.sortBy = state.filters.sortBy
        params.sortOrder = state.filters.sortOrder
      }

      return params
    },

    /**
     * Check if any products are selected
     */
    hasSelectedProducts: (state): boolean => {
      return state.selectedProducts.length > 0
    },

    /**
     * Check if all visible products are selected
     */
    allVisibleSelected: (state): boolean => {
      if (state.products.length === 0) return false
      return state.products.every(product =>
        state.selectedProducts.includes(product.id),
      )
    },

    /**
     * Get count of selected products
     */
    selectedCount: (state): number => {
      return state.selectedProducts.length
    },

    /**
     * Check if filters are applied
     */
    hasActiveFilters: (state): boolean => {
      return !!(
        state.filters.search
        || state.filters.categoryId
        || state.filters.status
        || state.filters.stockLevel
      )
    },
  },

  actions: {
    /**
     * Fetch products with current filters and pagination
     */
    async fetchProducts() {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<{
          products: ProductWithRelations[]
          pagination: PaginationState
        }>('/api/admin/products', {
          query: this.queryParams,
        })

        this.products = response.products
        this.pagination = response.pagination
      }
      catch (error: any) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch products'
        console.error('Error fetching admin products:', error)
      }
      finally {
        this.loading = false
      }
    },

    /**
     * Update search filter and refresh
     */
    async updateSearch(search: string) {
      this.filters.search = search
      this.pagination.page = 1 // Reset to first page
      await this.fetchProducts()
    },

    /**
     * Update category filter and refresh
     */
    async updateCategoryFilter(categoryId: number | undefined) {
      this.filters.categoryId = categoryId
      this.pagination.page = 1
      await this.fetchProducts()
    },

    /**
     * Update status filter and refresh
     */
    async updateStatusFilter(status: 'active' | 'inactive' | '') {
      this.filters.status = status
      this.pagination.page = 1
      await this.fetchProducts()
    },

    /**
     * Update stock level filter and refresh
     */
    async updateStockFilter(stockLevel: 'in-stock' | 'low-stock' | 'out-of-stock' | '') {
      this.filters.stockLevel = stockLevel
      this.pagination.page = 1
      await this.fetchProducts()
    },

    /**
     * Update sorting and refresh
     */
    async updateSort(sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') {
      this.filters.sortBy = sortBy as string
      this.filters.sortOrder = sortOrder
      await this.fetchProducts()
    },

    /**
     * Go to specific page
     */
    async goToPage(page: number) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.pagination.page = page
        await this.fetchProducts()
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
        categoryId: undefined,
        status: '',
        stockLevel: '',
        sortBy: 'created_at',
        sortOrder: 'desc',
      }
      this.pagination.page = 1
      await this.fetchProducts()
    },

    /**
     * Select/deselect a product
     */
    toggleProductSelection(productId: number) {
      const index = this.selectedProducts.indexOf(productId)
      if (index > -1) {
        this.selectedProducts.splice(index, 1)
      }
      else {
        this.selectedProducts.push(productId)
      }
    },

    /**
     * Select all visible products
     */
    selectAllVisible() {
      const visibleIds = this.products.map(p => p.id)
      visibleIds.forEach((id) => {
        if (!this.selectedProducts.includes(id)) {
          this.selectedProducts.push(id)
        }
      })
    },

    /**
     * Deselect all visible products
     */
    deselectAllVisible() {
      const visibleIds = this.products.map(p => p.id)
      this.selectedProducts = this.selectedProducts.filter(id =>
        !visibleIds.includes(id),
      )
    },

    /**
     * Toggle selection of all visible products
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
      this.selectedProducts = []
    },

    /**
     * Update inventory for a product
     */
    async updateInventory(productId: number, quantity: number, reason?: string, notes?: string) {
      try {
        const response = await $fetch<{
          success: boolean
          product: Record<string, any>
          movement: Record<string, any>
          statusChanged: boolean
          message: string
        }>(`/api/admin/products/${productId}/inventory`, {
          method: 'PUT',
          body: { quantity, reason, notes },
        })

        // Update local state with the response data
        const product = this.products.find(p => p.id === productId)
        if (product && response.product) {
          product.stockQuantity = response.product.stockQuantity
          product.lowStockThreshold = response.product.lowStockThreshold
          product.reorderPoint = response.product.reorderPoint
          product.isActive = response.product.isActive
          product.stockStatus = response.product.stockStatus
          product.updatedAt = response.product.updatedAt
        }

        // Show success toast with appropriate message
        const toast = useToast()
        toast.success(response.message)

        return response
      }
      catch (error: any) {
        const toast = useToast()
        toast.error('Failed to update inventory')
        throw error
      }
    },

    /**
     * Delete a product
     */
    async deleteProduct(productId: number) {
      try {
        await $fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
        }) as any

        // Remove from local state
        this.products = this.products.filter(p => p.id !== productId)
        this.selectedProducts = this.selectedProducts.filter(id => id !== productId)

        // Update pagination if needed
        if (this.products.length === 0 && this.pagination.page > 1) {
          await this.goToPage(this.pagination.page - 1)
        }

        const toast = useToast()
        toast.success('Product deleted successfully')
      }
      catch (error: any) {
        const toast = useToast()
        toast.error('Failed to delete product')
        throw error
      }
    },

    /**
     * Bulk delete selected products
     */
    async bulkDelete() {
      if (this.selectedProducts.length === 0) return

      this.bulkOperationInProgress = true
      try {
        await $fetch('/api/admin/products/bulk', {
          method: 'DELETE',
          body: { productIds: this.selectedProducts },
        }) as any

        // Remove from local state
        this.products = this.products.filter(p =>
          !this.selectedProducts.includes(p.id),
        )
        this.clearSelection()

        // Refresh if current page is empty
        if (this.products.length === 0 && this.pagination.page > 1) {
          await this.goToPage(this.pagination.page - 1)
        }
        else {
          await this.fetchProducts()
        }

        const toast = useToast()
        toast.success(`${this.selectedProducts.length} products deleted successfully`)
      }
      catch (error: any) {
        const toast = useToast()
        toast.error('Failed to delete products')
        throw error
      }
      finally {
        this.bulkOperationInProgress = false
      }
    },

    /**
     * Bulk update status of selected products
     */
    async bulkUpdateStatus(isActive: boolean) {
      if (this.selectedProducts.length === 0) return

      this.bulkOperationInProgress = true
      try {
        await $fetch('/api/admin/products/bulk', {
          method: 'PUT',
          body: {
            productIds: this.selectedProducts,
            updates: { isActive },
          },
        }) as any

        // Update local state
        this.products.forEach((product) => {
          if (this.selectedProducts.includes(product.id)) {
            product.isActive = isActive
          }
        })

        this.clearSelection()

        const toast = useToast()
        const action = isActive ? 'activated' : 'deactivated'
        toast.success(`${this.selectedProducts.length} products ${action} successfully`)
      }
      catch (error: any) {
        const toast = useToast()
        toast.error('Failed to update products')
        throw error
      }
      finally {
        this.bulkOperationInProgress = false
      }
    },

    /**
     * Initialize store (fetch initial data)
     */
    async initialize() {
      await this.fetchProducts()
    },

    /**
     * Reset store to initial state
     */
    reset() {
      this.$reset()
    },
  },
})
