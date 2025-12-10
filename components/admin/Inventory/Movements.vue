<!--
  Inventory Movements Component

  Requirements addressed:
  - 2.6: Inventory history display showing stock changes over time

  Features:
  - Display inventory movements with filtering
  - Pagination support
  - Movement type indicators
  - Product information
  - Date range filtering
-->

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
    <!-- Header with Filters -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          Inventory Movements
        </h3>
        <UiButton
          :disabled="loading"
          variant="outline"
          size="sm"
          @click="refreshMovements"
        >
          <commonIcon
            name="lucide:refresh-ccw"
            class="mr-2 h-4 w-4"
            :class="{ 'animate-spin': loading }"
          />
          Refresh
        </UiButton>
      </div>

      <!-- Filters -->
      <div class="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Movement Type Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Movement Type
          </label>
          <select
            v-model="filters.movementType"
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            @change="applyFilters"
          >
            <option value="">
              All Types
            </option>
            <option value="in">
              Stock In
            </option>
            <option value="out">
              Stock Out
            </option>
            <option value="adjustment">
              Adjustment
            </option>
          </select>
        </div>

        <!-- Start Date Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input
            v-model="filters.startDate"
            type="date"
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            @change="applyFilters"
          />
        </div>

        <!-- End Date Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date
          </label>
          <input
            v-model="filters.endDate"
            type="date"
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            @change="applyFilters"
          />
        </div>

        <!-- Clear Filters -->
        <div class="flex items-end">
          <UiButton
            variant="outline"
            size="sm"
            class="w-full"
            @click="clearFilters"
          >
            Clear Filters
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="p-6"
    >
      <div class="animate-pulse space-y-4">
        <div
          v-for="n in 5"
          :key="n"
          class="flex space-x-4"
        >
          <div class="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!movements?.length"
      class="p-12 text-center"
    >
      <svg
        class="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No movements found
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        {{ hasActiveFilters ? 'Try adjusting your filters' : 'No inventory movements have been recorded yet' }}
      </p>
    </div>

    <!-- Movements Table -->
    <div
      v-else
      class="overflow-x-auto"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="px-6">
              Date
            </TableHead>
            <TableHead class="px-6">
              Product
            </TableHead>
            <TableHead class="px-6">
              Type
            </TableHead>
            <TableHead class="px-6">
              Quantity
            </TableHead>
            <TableHead class="px-6">
              Before/After
            </TableHead>
            <TableHead class="px-6">
              Reason
            </TableHead>
            <TableHead class="px-6">
              Performed By
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="movement in movements"
            :key="movement.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <!-- Date -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {{ formatDate(movement.createdAt) }}
            </td>

            <!-- Product -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ getLocalizedText(movement.product?.name) || 'Unknown Product' }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                SKU: {{ movement.product?.sku || 'N/A' }}
              </div>
            </td>

            <!-- Type -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getMovementTypeClasses(movement.movementType)">
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="getMovementTypeIcon(movement.movementType)"
                  />
                </svg>
                {{ getMovementTypeLabel(movement.movementType) }}
              </span>
            </td>

            <!-- Quantity -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'text-sm font-medium',
                  movement.movementType === 'in' ? 'text-green-600 dark:text-green-400'
                  : movement.movementType === 'out' ? 'text-red-600 dark:text-red-400'
                    : 'text-blue-600 dark:text-blue-400',
                ]"
              >
                {{ movement.movementType === 'in' ? '+' : movement.movementType === 'out' ? '-' : '±' }}{{ movement.quantity }}
              </span>
            </td>

            <!-- Before/After -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {{ movement.quantityBefore }} → {{ movement.quantityAfter }}
            </td>

            <!-- Reason -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-white">
                {{ formatReason(movement.reason) }}
              </div>
              <div
                v-if="movement.notes"
                class="text-xs text-gray-500 dark:text-gray-400 mt-1"
              >
                {{ movement.notes }}
              </div>
            </td>

            <!-- Performed By -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ movement.performedBy?.name || 'System' }}
            </td>
          </tr>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination && pagination.totalPages > 1"
      class="px-6 py-4 border-t border-gray-200 dark:border-gray-700"
    >
      <AdminUtilsPagination
        :current-page="pagination.page"
        :total-pages="pagination.totalPages"
        :total-items="pagination.total"
        :items-per-page="pagination.limit"
        @page-changed="goToPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table'

interface InventoryMovement {
  id: number
  productId: number
  product?: {
    id: number
    sku: string
    name: Record<string, string>
  }
  movementType: 'in' | 'out' | 'adjustment'
  quantity: number
  quantityBefore: number
  quantityAfter: number
  reason?: string
  referenceId?: string
  notes?: string
  performedBy?: {
    id: string
    name: string
  }
  createdAt: string
}

interface Props {
  productId?: number
}

const props = defineProps<Props>()

// Composables
const { getMovementTypeLabel } = useInventory()

// Reactive state
const movements = ref<InventoryMovement[]>([])
const pagination = ref<any>(null)
const loading = ref(false)
const filters = ref({
  movementType: '',
  startDate: '',
  endDate: '',
})

// Computed
const hasActiveFilters = computed(() => {
  return !!(filters.value.movementType || filters.value.startDate || filters.value.endDate)
})

// Methods
const fetchMovements = async (page = 1) => {
  loading.value = true

  try {
    const queryParams: any = {
      page,
      limit: 20,
      sortBy: 'created_at',
      sortOrder: 'desc',
    }

    if (props.productId) {
      queryParams.productId = props.productId
    }

    if (filters.value.movementType) {
      queryParams.movementType = filters.value.movementType
    }

    if (filters.value.startDate) {
      queryParams.startDate = filters.value.startDate
    }

    if (filters.value.endDate) {
      queryParams.endDate = filters.value.endDate
    }

    const response = await $fetch('/api/admin/inventory/movements', {
      query: queryParams,
    })

    movements.value = response.movements
    pagination.value = response.pagination
  }
  catch (error) {
    console.error('Failed to fetch inventory movements:', error)
    const toast = useToast()
    toast.error('Failed to load inventory movements')
  }
  finally {
    loading.value = false
  }
}

const refreshMovements = () => {
  fetchMovements(pagination.value?.page || 1)
}

const applyFilters = () => {
  fetchMovements(1) // Reset to first page when applying filters
}

const clearFilters = () => {
  filters.value = {
    movementType: '',
    startDate: '',
    endDate: '',
  }
  fetchMovements(1)
}

const goToPage = (page: number) => {
  fetchMovements(page)
}

// Utility functions
const getLocalizedText = (text: Record<string, string> | null) => {
  if (!text) return ''
  return text.es || Object.values(text)[0] || ''
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatReason = (reason?: string) => {
  if (!reason) return 'No reason specified'

  return reason
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getMovementTypeClasses = (type: string) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'

  switch (type) {
    case 'in':
      return `${baseClasses} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200`
    case 'out':
      return `${baseClasses} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200`
    case 'adjustment':
      return `${baseClasses} bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200`
    default:
      return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200`
  }
}

const getMovementTypeIcon = (type: string) => {
  switch (type) {
    case 'in':
      return 'M12 6v6m0 0v6m0-6h6m-6 0H6' // Plus icon
    case 'out':
      return 'M18 12H6' // Minus icon
    case 'adjustment':
      return 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' // Arrows icon
    default:
      return 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
  }
}

// Lifecycle
onMounted(() => {
  fetchMovements()
})

// Watch for prop changes
watch(() => props.productId, () => {
  fetchMovements(1)
})
</script>
