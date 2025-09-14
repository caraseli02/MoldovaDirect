<template>
  <div>
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
        <p class="text-gray-600 dark:text-gray-400">Manage your product catalog</p>
      </div>
      <nuxt-link
        to="/admin/products/new"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800"
      >
        <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Product
      </nuxt-link>
    </div>

    <!-- Filters -->
    <AdminProductFilters
      :search="adminProductsStore.filters.search"
      :category-id="adminProductsStore.filters.categoryId"
      :status="adminProductsStore.filters.status"
      :stock-level="adminProductsStore.filters.stockLevel"
      :categories="categories"
      :total="adminProductsStore.pagination.total"
      :loading="adminProductsStore.loading"
      @update-search="adminProductsStore.updateSearch"
      @update-category="adminProductsStore.updateCategoryFilter"
      @update-status="adminProductsStore.updateStatusFilter"
      @update-stock="adminProductsStore.updateStockFilter"
      @clear-filters="adminProductsStore.clearFilters"
    />

    <!-- Products Table -->
    <AdminProductTable
      :products="adminProductsStore.productsWithAdminData"
      :loading="adminProductsStore.loading"
      :has-active-filters="adminProductsStore.hasActiveFilters"
      :has-selected-products="adminProductsStore.hasSelectedProducts"
      :all-visible-selected="adminProductsStore.allVisibleSelected"
      :selected-count="adminProductsStore.selectedCount"
      :bulk-operation-in-progress="adminProductsStore.bulkOperationInProgress"
      :sort-by="adminProductsStore.filters.sortBy"
      :sort-order="adminProductsStore.filters.sortOrder"
      @toggle-product-selection="adminProductsStore.toggleProductSelection"
      @toggle-all-visible="adminProductsStore.toggleAllVisible"
      @clear-selection="adminProductsStore.clearSelection"
      @update-sort="adminProductsStore.updateSort"
      @edit-stock="handleEditStock"
      @delete-product="handleDeleteProduct"
      @bulk-activate="handleBulkActivate"
      @bulk-deactivate="handleBulkDeactivate"
      @bulk-delete="handleBulkDelete"
    />

    <!-- Pagination -->
    <AdminPagination
      :page="adminProductsStore.pagination.page"
      :limit="adminProductsStore.pagination.limit"
      :total="adminProductsStore.pagination.total"
      :total-pages="adminProductsStore.pagination.totalPages"
      :has-next="adminProductsStore.pagination.hasNext"
      :has-prev="adminProductsStore.pagination.hasPrev"
      @go-to-page="adminProductsStore.goToPage"
      @next-page="adminProductsStore.nextPage"
      @prev-page="adminProductsStore.prevPage"
      @update-limit="handleUpdateLimit"
    />

    <!-- Stock Edit Modal -->
    <div v-if="stockEditModal.show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Edit Stock for {{ stockEditModal.product?.name ? getLocalizedText(stockEditModal.product.name) : '' }}
          </h3>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stock Quantity
            </label>
            <input
              v-model.number="stockEditModal.quantity"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button
              @click="closeStockEditModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              @click="saveStockEdit"
              :disabled="stockEditModal.saving"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ stockEditModal.saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <CustomConfirmDialog
      :show="deleteDialog.show"
      type="danger"
      :title="deleteDialog.title"
      :message="deleteDialog.message"
      :details="deleteDialog.details"
      confirm-text="Delete"
      :loading="deleteDialog.loading"
      loading-text="Deleting..."
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <!-- Bulk Operations Progress Bar -->
    <AdminBulkOperationsBar
      :show="bulkOperations.show"
      :in-progress="bulkOperations.inProgress"
      :completed="bulkOperations.completed"
      :error="bulkOperations.error"
      :success="bulkOperations.success"
      :progress="bulkOperations.progress"
      :operation-text="bulkOperations.operationText"
      :progress-text="bulkOperations.progressText"
      :result-message="bulkOperations.resultMessage"
      :result-details="bulkOperations.resultDetails"
      :error-message="bulkOperations.errorMessage"
      @close="closeBulkOperations"
      @retry="retryBulkOperation"
    />
  </div>
</template>

<script setup lang="ts">
import type { CategoryWithChildren } from '~/types/database'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// Initialize stores - safely access with fallback
let adminProductsStore: any = null

try {
  if (process.client) {
    adminProductsStore = useAdminProductsStore()
  }
} catch (error) {
  console.warn('Admin products store not available during SSR/hydration')
}

if (!adminProductsStore) {
  adminProductsStore = {
    products: ref([]),
    isLoading: ref(false),
    loadProducts: () => Promise.resolve(),
    filters: {
      search: '',
      categoryId: undefined,
      status: '',
      stockLevel: '',
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
    loading: false,
    error: null,
    selectedProducts: [],
    bulkOperationInProgress: false,
    initialize: () => Promise.resolve()
  }
}

// Fetch categories
const { data: categoriesData } = await useFetch<{ categories: CategoryWithChildren[] }>('/api/categories')
const categories = computed(() => categoriesData.value?.categories || [])

// Stock edit modal state
const stockEditModal = ref({
  show: false,
  product: null as any,
  quantity: 0,
  saving: false
})

// Delete confirmation dialog state
const deleteDialog = ref({
  show: false,
  title: '',
  message: '',
  details: '',
  loading: false,
  productId: null as number | null,
  isBulk: false
})

// Bulk operations state
const bulkOperations = ref({
  show: false,
  inProgress: false,
  completed: false,
  error: false,
  success: false,
  progress: 0,
  operationText: '',
  progressText: '',
  resultMessage: '',
  resultDetails: '',
  errorMessage: '',
  currentOperation: null as (() => Promise<void>) | null
})

// Initialize the store on mount
onMounted(async () => {
  await adminProductsStore.initialize()
})

// Utility functions
const getLocalizedText = (text: Record<string, string> | null) => {
  if (!text) return ''
  return text.es || Object.values(text)[0] || ''
}

// Event handlers
const handleEditStock = (product: any) => {
  stockEditModal.value = {
    show: true,
    product,
    quantity: product.stockQuantity,
    saving: false
  }
}

const closeStockEditModal = () => {
  stockEditModal.value = {
    show: false,
    product: null,
    quantity: 0,
    saving: false
  }
}

const saveStockEdit = async () => {
  if (!stockEditModal.value.product) return
  
  stockEditModal.value.saving = true
  try {
    await adminProductsStore.updateInventory(
      stockEditModal.value.product.id,
      stockEditModal.value.quantity
    )
    closeStockEditModal()
  } catch (error) {
    console.error('Failed to update stock:', error)
  } finally {
    stockEditModal.value.saving = false
  }
}

const handleDeleteProduct = async (productId: number) => {
  const product = adminProductsStore.products.find(p => p.id === productId)
  const productName = product ? getLocalizedText(product.name) : 'this product'
  
  deleteDialog.value = {
    show: true,
    title: 'Delete Product',
    message: `Are you sure you want to delete "${productName}"?`,
    details: 'This action cannot be undone. The product will be permanently removed from your catalog.',
    loading: false,
    productId,
    isBulk: false
  }
}

const handleBulkActivate = async () => {
  const count = adminProductsStore.selectedCount
  await performBulkOperation(
    () => adminProductsStore.bulkUpdateStatus(true),
    `Activating ${count} products...`,
    `Successfully activated ${count} products`,
    'activate'
  )
}

const handleBulkDeactivate = async () => {
  const count = adminProductsStore.selectedCount
  await performBulkOperation(
    () => adminProductsStore.bulkUpdateStatus(false),
    `Deactivating ${count} products...`,
    `Successfully deactivated ${count} products`,
    'deactivate'
  )
}

const handleBulkDelete = async () => {
  const count = adminProductsStore.selectedCount
  
  deleteDialog.value = {
    show: true,
    title: 'Delete Products',
    message: `Are you sure you want to delete ${count} selected products?`,
    details: 'This action cannot be undone. All selected products will be permanently removed from your catalog.',
    loading: false,
    productId: null,
    isBulk: true
  }
}

const handleUpdateLimit = async (limit: number) => {
  adminProductsStore.pagination.limit = limit
  adminProductsStore.pagination.page = 1
  await adminProductsStore.fetchProducts()
}

// Delete confirmation handlers
const confirmDelete = async () => {
  deleteDialog.value.loading = true
  
  try {
    if (deleteDialog.value.isBulk) {
      const count = adminProductsStore.selectedCount
      await performBulkOperation(
        () => adminProductsStore.bulkDelete(),
        `Deleting ${count} products...`,
        `Successfully deleted ${count} products`,
        'delete'
      )
    } else if (deleteDialog.value.productId) {
      await adminProductsStore.deleteProduct(deleteDialog.value.productId)
    }
    
    deleteDialog.value.show = false
  } catch (error) {
    console.error('Failed to delete:', error)
  } finally {
    deleteDialog.value.loading = false
  }
}

const cancelDelete = () => {
  deleteDialog.value = {
    show: false,
    title: '',
    message: '',
    details: '',
    loading: false,
    productId: null,
    isBulk: false
  }
}

// Bulk operations handlers
const performBulkOperation = async (
  operation: () => Promise<void>,
  operationText: string,
  successMessage: string,
  operationType: string
) => {
  bulkOperations.value = {
    show: true,
    inProgress: true,
    completed: false,
    error: false,
    success: false,
    progress: 0,
    operationText,
    progressText: 'Initializing...',
    resultMessage: '',
    resultDetails: '',
    errorMessage: '',
    currentOperation: operation
  }

  try {
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      if (bulkOperations.value.progress < 90) {
        bulkOperations.value.progress += Math.random() * 20
        bulkOperations.value.progressText = `Processing... ${Math.round(bulkOperations.value.progress)}%`
      }
    }, 200)

    await operation()

    clearInterval(progressInterval)
    
    bulkOperations.value.progress = 100
    bulkOperations.value.inProgress = false
    bulkOperations.value.completed = true
    bulkOperations.value.success = true
    bulkOperations.value.resultMessage = successMessage
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      closeBulkOperations()
    }, 3000)
    
  } catch (error) {
    bulkOperations.value.inProgress = false
    bulkOperations.value.error = true
    bulkOperations.value.success = false
    bulkOperations.value.errorMessage = error instanceof Error ? error.message : `Failed to ${operationType} products`
  }
}

const closeBulkOperations = () => {
  bulkOperations.value = {
    show: false,
    inProgress: false,
    completed: false,
    error: false,
    success: false,
    progress: 0,
    operationText: '',
    progressText: '',
    resultMessage: '',
    resultDetails: '',
    errorMessage: '',
    currentOperation: null
  }
}

const retryBulkOperation = async () => {
  if (bulkOperations.value.currentOperation) {
    const operation = bulkOperations.value.currentOperation
    const operationText = bulkOperations.value.operationText
    
    bulkOperations.value.error = false
    bulkOperations.value.inProgress = true
    bulkOperations.value.progress = 0
    bulkOperations.value.progressText = 'Retrying...'
    
    try {
      await operation()
      bulkOperations.value.inProgress = false
      bulkOperations.value.completed = true
      bulkOperations.value.success = true
      bulkOperations.value.resultMessage = 'Operation completed successfully'
    } catch (error) {
      bulkOperations.value.inProgress = false
      bulkOperations.value.error = true
      bulkOperations.value.errorMessage = error instanceof Error ? error.message : 'Operation failed'
    }
  }
}

// SEO
useHead({
  title: 'Products - Admin - Moldova Direct',
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow'
    }
  ]
})
</script>