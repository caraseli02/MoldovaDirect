<template>
  <div>
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Products
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Manage your product catalog
        </p>
      </div>
      <nuxt-link
        to="/admin/products/new"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800"
      >
        <svg
          class="h-5 w-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Product
      </nuxt-link>
    </div>

    <!-- Filters -->
    <AdminProductsFilters
      :search="adminProductsStore.filters.search || ''"
      :category-id="adminProductsStore.filters.categoryId"
      :status="adminProductsStore.filters.status || ''"
      :stock-level="adminProductsStore.filters.stockLevel || ''"
      :categories="categories"
      :total="adminProductsStore.pagination.total"
      :loading="adminProductsStore.loading"
      @update-search="adminProductsStore.updateSearch"
      @update-category="adminProductsStore.updateCategoryFilter"
      @update-status="(val: string) => adminProductsStore.updateStatusFilter(val as '' | 'active' | 'inactive')"
      @update-stock="(val: string) => adminProductsStore.updateStockFilter(val as '' | 'in-stock' | 'low-stock' | 'out-of-stock')"
      @clear-filters="adminProductsStore.clearFilters"
    />

    <!-- Products Table -->
    <AdminProductsTable
      :products="adminProductsStore.productsWithAdminData"
      :loading="adminProductsStore.loading"
      :has-active-filters="adminProductsStore.hasActiveFilters"
      :has-selected-products="adminProductsStore.hasSelectedProducts"
      :all-visible-selected="adminProductsStore.allVisibleSelected"
      :selected-count="adminProductsStore.selectedCount"
      :bulk-operation-in-progress="adminProductsStore.bulkOperationInProgress"
      :sort-by="adminProductsStore.filters.sortBy || 'created_at'"
      :sort-order="adminProductsStore.filters.sortOrder || 'desc'"
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
    <AdminUtilsPagination
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
    <div
      v-if="stockEditModal.show"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Edit Stock for {{ stockEditModal.product?.name ? getLocalizedText(stockEditModal.product.name) : '' }}
          </h3>
          <div class="mb-4">
            <UiLabel>Stock Quantity</UiLabel>
            <UiInput
              v-model.number="stockEditModal.quantity"
              type="number"
              min="0"
            />
          </div>
          <div class="flex justify-end space-x-3">
            <Button
              variant="outline"
              @click="closeStockEditModal"
            >
              Cancel
            </Button>
            <Button
              :disabled="stockEditModal.saving"
              type="submit"
              @click="saveStockEdit"
            >
              {{ stockEditModal.saving ? 'Saving...' : 'Save' }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      :open="deleteDialog.show"
      @update:open="handleDeleteDialogOpen"
    >
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="text-red-600 dark:text-red-400 flex items-center gap-2">
            <commonIcon
              name="lucide:alert-triangle"
              class="w-5 h-5"
            />
            {{ deleteDialog.title }}
          </DialogTitle>
          <DialogDescription>
            {{ deleteDialog.message }}
          </DialogDescription>
        </DialogHeader>

        <p class="text-sm text-gray-600 dark:text-gray-300">
          {{ deleteDialog.details }}
        </p>

        <DialogFooter class="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            :disabled="deleteDialog.loading"
            @click="cancelDelete"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            :disabled="deleteDialog.loading"
            @click="confirmDelete"
          >
            <commonIcon
              v-if="deleteDialog.loading"
              name="lucide:refresh-ccw"
              class="w-4 h-4 mr-2 animate-spin"
            />
            {{ deleteDialog.loading ? 'Deleting...' : 'Delete' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Bulk Operations Progress Bar -->
    <AdminUtilsBulkOperationsBar
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
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { CategoryWithChildren, ProductWithRelations } from '~/types/database'
import { usePinia } from '#imports'
import AdminProductsFilters from '~/components/admin/Products/Filters.vue'
import AdminProductsTable from '~/components/admin/Products/Table.vue'
import AdminUtilsPagination from '~/components/admin/Utils/Pagination.vue'
import AdminUtilsBulkOperationsBar from '~/components/admin/Utils/BulkOperationsBar.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

// Initialize stores - safely access with fallback
const pinia = usePinia()
const adminProductsStore = useAdminProductsStore(pinia)

// Fetch categories
const { data: categoriesData } = await useFetch<{ categories: CategoryWithChildren[] }>('/api/categories')
const categories = computed(() => categoriesData.value?.categories || [])

// Stock edit modal state
interface StockEditModalState {
  show: boolean
  product: ProductWithRelations | null
  quantity: number
  saving: boolean
}

const stockEditModal = ref<StockEditModalState>({
  show: false,
  product: null,
  quantity: 0,
  saving: false,
})

// Delete confirmation dialog state
interface DeleteDialogState {
  show: boolean
  title: string
  message: string
  details: string
  loading: boolean
  productId: number | null
  isBulk: boolean
}

const deleteDialog = ref<DeleteDialogState>({
  show: false,
  title: '',
  message: '',
  details: '',
  loading: false,
  productId: null,
  isBulk: false,
})

// Bulk operations state
interface BulkOperationsState {
  show: boolean
  inProgress: boolean
  completed: boolean
  error: boolean
  success: boolean
  progress: number
  operationText: string
  progressText: string
  resultMessage: string
  resultDetails: string
  errorMessage: string
  currentOperation: (() => Promise<void>) | null
}

const bulkOperations = ref<BulkOperationsState>({
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
  currentOperation: null,
})

// Initialize the store on mount
onMounted(async () => {
  await adminProductsStore.initialize()
})

// Utility functions
const getLocalizedText = (text: Record<string, string | undefined> | null | undefined): string => {
  if (!text) return ''
  const textValue = text.es || text.en || Object.values(text).find(v => v !== undefined)
  return textValue || ''
}

// Event handlers
const handleEditStock = (product: ProductWithRelations) => {
  stockEditModal.value = {
    show: true,
    product,
    quantity: product.stockQuantity || 0,
    saving: false,
  }
}

const closeStockEditModal = () => {
  stockEditModal.value = {
    show: false,
    product: null,
    quantity: 0,
    saving: false,
  }
}

const saveStockEdit = async () => {
  if (!stockEditModal.value.product) return

  stockEditModal.value.saving = true
  try {
    await adminProductsStore.updateInventory(
      stockEditModal.value.product.id,
      stockEditModal.value.quantity,
    )
    closeStockEditModal()
  }
  catch (error: unknown) {
    console.error('Failed to update stock:', getErrorMessage(error))
  }
  finally {
    stockEditModal.value.saving = false
  }
}

const handleDeleteProduct = async (productId: number) => {
  const product = adminProductsStore.products.find((p: ProductWithRelations) => p.id === productId)
  const productName = product?.name ? getLocalizedText(product.name) : 'this product'

  deleteDialog.value = {
    show: true,
    title: 'Delete Product',
    message: `Are you sure you want to delete "${productName}"?`,
    details: 'This action cannot be undone. The product will be permanently removed from your catalog.',
    loading: false,
    productId,
    isBulk: false,
  }
}

const handleBulkActivate = async () => {
  const count = adminProductsStore.selectedCount
  await performBulkOperation(
    () => adminProductsStore.bulkUpdateStatus(true),
    `Activating ${count} products...`,
    `Successfully activated ${count} products`,
    'activate',
  )
}

const handleBulkDeactivate = async () => {
  const count = adminProductsStore.selectedCount
  await performBulkOperation(
    () => adminProductsStore.bulkUpdateStatus(false),
    `Deactivating ${count} products...`,
    `Successfully deactivated ${count} products`,
    'deactivate',
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
    isBulk: true,
  }
}

const handleUpdateLimit = async (limit: number) => {
  if (adminProductsStore.pagination) {
    adminProductsStore.pagination.limit = limit
    adminProductsStore.pagination.page = 1
  }
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
        'delete',
      )
    }
    else if (deleteDialog.value.productId) {
      await adminProductsStore.deleteProduct(deleteDialog.value.productId)
    }

    deleteDialog.value.show = false
  }
  catch (error: unknown) {
    console.error('Failed to delete:', getErrorMessage(error))
  }
  finally {
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
    isBulk: false,
  }
}

const handleDeleteDialogOpen = (open: boolean) => {
  if (!open) {
    cancelDelete()
  }
}

// Bulk operations handlers
const performBulkOperation = async (
  operation: () => Promise<void>,
  operationText: string,
  successMessage: string,
  operationType: string,
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
    currentOperation: operation,
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
  }
  catch (error: unknown) {
    bulkOperations.value.inProgress = false
    bulkOperations.value.error = true
    bulkOperations.value.success = false
    bulkOperations.value.errorMessage = error instanceof Error ? getErrorMessage(error) : `Failed to ${operationType} products`
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
    currentOperation: null,
  }
}

const retryBulkOperation = async () => {
  if (bulkOperations.value.currentOperation) {
    const operation = bulkOperations.value.currentOperation

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
    }
    catch (error: unknown) {
      bulkOperations.value.inProgress = false
      bulkOperations.value.error = true
      bulkOperations.value.errorMessage = error instanceof Error ? getErrorMessage(error) : 'Operation failed'
    }
  }
}

// SEO
useHead({
  title: 'Products - Admin - Moldova Direct',
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
})
</script>
