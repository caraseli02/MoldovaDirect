<!--
  Inventory Reports Component

  Requirements addressed:
  - 2.6: Inventory reports with movement history and current levels

  Features:
  - Multiple report types
  - Stock level reports
  - Low stock alerts
  - Reorder recommendations
  - Export functionality
-->

<template>
  <div class="space-y-6">
    <!-- Report Type Selection -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Inventory Reports
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          v-for="reportType in reportTypes"
          :key="reportType.value"
          :class="[
            'p-4 border-2 rounded-lg text-left transition-colors',
            selectedReportType === reportType.value
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
          ]"
          @click="selectedReportType = reportType.value; generateReport()"
        >
          <div class="flex items-center mb-2">
            <svg
              class="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="reportType.icon"
              />
            </svg>
            <span class="font-medium text-gray-900 dark:text-white">{{ reportType.label }}</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ reportType.description }}
          </p>
        </button>
      </div>

      <!-- Date Range Filter (for movements summary) -->
      <div
        v-if="selectedReportType === 'movements-summary'"
        class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input
            v-model="dateRange.startDate"
            type="date"
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date
          </label>
          <input
            v-model="dateRange.endDate"
            type="date"
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          />
        </div>
        <div class="flex items-end">
          <button
            :disabled="loading"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            @click="generateReport"
          >
            Update Report
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
    >
      <div class="animate-pulse space-y-4">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div class="space-y-2">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>

    <!-- Report Content -->
    <div
      v-else-if="reportData"
      class="space-y-6"
    >
      <!-- Stock Levels Report -->
      <div
        v-if="selectedReportType === 'stock-levels'"
        class="space-y-6"
      >
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ reportData.summary.totalProducts }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Total Products
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">
              {{ reportData.summary.outOfStock }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Out of Stock
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {{ reportData.summary.lowStock }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Low Stock
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {{ reportData.summary.mediumStock }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Medium Stock
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ reportData.summary.highStock }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              High Stock
            </div>
          </div>
        </div>

        <!-- Stock Value -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Total Stock Value
          </h4>
          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
            €{{ formatCurrency(reportData.summary.totalStockValue) }}
          </div>
        </div>
      </div>

      <!-- Movements Summary Report -->
      <div
        v-if="selectedReportType === 'movements-summary'"
        class="space-y-6"
      >
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ reportData.summary.totalMovements }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Total Movements
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              +{{ reportData.summary.totalStockIn }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Stock In
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">
              -{{ reportData.summary.totalStockOut }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Stock Out
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {{ reportData.summary.netChange >= 0 ? '+' : '' }}{{ reportData.summary.netChange }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Net Change
            </div>
          </div>
        </div>

        <!-- Recent Movements -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h4 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ $t('admin.inventory.reports.recentMovements') }}
            </h4>
          </div>
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="px-6">
                    {{ $t('admin.inventory.reports.headers.product') }}
                  </TableHead>
                  <TableHead class="px-6">
                    {{ $t('admin.inventory.reports.headers.type') }}
                  </TableHead>
                  <TableHead class="px-6">
                    {{ $t('admin.inventory.reports.headers.quantity') }}
                  </TableHead>
                  <TableHead class="px-6">
                    {{ $t('admin.inventory.reports.headers.date') }}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="movement in reportData.recentMovements"
                  :key="movement.id"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {{ getLocalizedText(movement.productName) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <Badge :variant="movementVariant(movement.movementType)">
                      {{ getMovementTypeLabel(movement.movementType) }}
                    </Badge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {{ movement.quantity }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ formatDate(movement.createdAt) }}
                  </td>
                </tr>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <!-- Low Stock Report -->
      <div
        v-if="selectedReportType === 'low-stock'"
        class="space-y-6"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-medium text-gray-900 dark:text-white">
              Low Stock Products ({{ reportData.totalLowStockProducts }})
            </h4>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Total Value: €{{ formatCurrency(reportData.totalValue) }}
            </div>
          </div>

          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="px-6">
                    {{ $t('admin.inventory.reports.headers.product') }}
                  </TableHead>
                  <TableHead class="px-6">
                    {{ $t('admin.inventory.reports.headers.currentStock') }}
                  </TableHead>
                  <TableHead class="px-6">
                    {{ $t('admin.inventory.reports.headers.threshold') }}
                  </TableHead>
                  <TableHead class="px-6">
                    {{ $t('admin.inventory.reports.headers.stockValue') }}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="product in reportData.products"
                  :key="product.productId"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ getLocalizedText(product.name) }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ product.sku }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <AdminInventoryStockIndicator
                      :stock-quantity="product.stockQuantity"
                      :low-stock-threshold="product.lowThreshold"
                      size="sm"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {{ product.lowThreshold }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    €{{ formatCurrency(product.stockValue) }}
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>
      </div>

      <!-- Reorder Alerts Report -->
      <div
        v-if="selectedReportType === 'reorder-alerts'"
        class="space-y-6"
      >
        <!-- Priority Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">
              {{ reportData.byPriority.critical }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Critical
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {{ reportData.byPriority.high }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              High Priority
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {{ reportData.byPriority.medium }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Medium Priority
            </div>
          </div>
        </div>

        <!-- Reorder List -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h4 class="text-lg font-medium text-gray-900 dark:text-white">
                Reorder Recommendations ({{ reportData.totalReorderProducts }})
              </h4>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Estimated Cost: €{{ formatCurrency(reportData.totalEstimatedCost) }}
              </div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="px-6">
                    {{ $t('admin.inventory.reports.headers.priority') }}
                  </TableHead>
                  <TableHead class="px-6">
                    {{ $t('admin.inventory.reports.headers.product') }}
                  </TableHead>
                  <TableHead class="px-6">
                    {{ $t('admin.inventory.reports.headers.currentStock') }}
                  </TableHead>
                  <TableHead class="px-6">
                    {{ $t('admin.inventory.reports.headers.recommendedOrder') }}
                  </TableHead>
                  <TableHead class="px-6">
                    {{ $t('admin.inventory.reports.headers.estimatedCost') }}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="product in reportData.products"
                  :key="product.productId"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <Badge :variant="priorityVariant(product.priority)">
                      {{ product.priority.charAt(0).toUpperCase() + product.priority.slice(1) }}
                    </Badge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ getLocalizedText(product.name) }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ product.sku }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <AdminInventoryStockIndicator
                      :stock-quantity="product.stockQuantity"
                      :reorder-point="product.reorderPoint"
                      size="sm"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {{ product.recommendedOrderQuantity }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    €{{ formatCurrency(product.estimatedCost) }}
                  </td>
                </tr>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { movementVariant, priorityVariant } from '@/lib/uiVariants'
// Composables
const { getMovementTypeLabel } = useInventory()

// Reactive state
const selectedReportType = ref('stock-levels')
const reportData = ref<any>(null)
const loading = ref(false)
const dateRange = ref({
  startDate: '',
  endDate: '',
})

// Report types configuration
const reportTypes = [
  {
    value: 'stock-levels',
    label: 'Stock Levels',
    description: 'Current inventory levels and stock status',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    value: 'movements-summary',
    label: 'Movements Summary',
    description: 'Inventory movement trends and statistics',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    value: 'low-stock',
    label: 'Low Stock Alert',
    description: 'Products running low on inventory',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z',
  },
  {
    value: 'reorder-alerts',
    label: 'Reorder Alerts',
    description: 'Products that need to be reordered',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
]

// Methods
const generateReport = async () => {
  loading.value = true

  try {
    const queryParams: any = {
      reportType: selectedReportType.value,
    }

    if (selectedReportType.value === 'movements-summary') {
      if (dateRange.value.startDate) {
        queryParams.startDate = dateRange.value.startDate
      }
      if (dateRange.value.endDate) {
        queryParams.endDate = dateRange.value.endDate
      }
    }

    const response = await $fetch('/api/admin/inventory/reports', {
      query: queryParams,
    })

    reportData.value = response.data
  }
  catch (error) {
    console.error('Failed to generate report:', error)
    const toast = useToast()
    toast.error('Failed to generate inventory report')
  }
  finally {
    loading.value = false
  }
}

// Utility functions
const getLocalizedText = (text: Record<string, string> | null) => {
  if (!text) return ''
  return text.es || Object.values(text)[0] || ''
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Badge variant mappings centralized in lib/uiVariants

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

const getPriorityClasses = (priority: string) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'

  switch (priority) {
    case 'critical':
      return `${baseClasses} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200`
    case 'high':
      return `${baseClasses} bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200`
    case 'medium':
      return `${baseClasses} bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200`
    default:
      return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200`
  }
}

// Lifecycle
onMounted(() => {
  generateReport()
})
</script>
