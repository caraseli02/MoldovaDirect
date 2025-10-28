<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
    <!-- Table Header with Bulk Actions -->
    <div v-if="hasSelectedProducts" class="bg-blue-50 dark:bg-blue-900/20 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span class="text-sm font-medium text-blue-900 dark:text-blue-100">
            {{ selectedCount }} {{ selectedCount === 1 ? 'product' : 'products' }} selected
          </span>
          <Button
            @click="clearSelection"
            variant="link"
            class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Clear selection
          </Button>
        </div>
        <div class="flex items-center space-x-2">
          <Button
            @click="$emit('bulk-activate')"
            :disabled="bulkOperationInProgress"
            size="sm"
            class="text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800"
          >
            <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Activate
          </Button>
          <Button
            @click="$emit('bulk-deactivate')"
            :disabled="bulkOperationInProgress"
            variant="secondary"
            size="sm"
            class="dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          >
            <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
            Deactivate
          </Button>
          <Button
            @click="$emit('bulk-delete')"
            :disabled="bulkOperationInProgress"
            variant="destructive"
            size="sm"
            class="bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800 text-red-700"
          >
            <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-6">
      <div class="animate-pulse space-y-4">
        <div v-for="n in 5" :key="n" class="flex space-x-4">
          <div class="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!products?.length" class="p-12 text-center">
      <svg class="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {{ hasActiveFilters ? 'Try adjusting your filters' : 'Get started by creating your first product' }}
      </p>
      <nuxt-link
        v-if="!hasActiveFilters"
        to="/admin/products/new"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800"
      >
        Add Product
      </nuxt-link>
    </div>

    <!-- Products Table -->
    <div v-else class="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="px-6">
              <UiCheckbox
                id="products-select-all"
                :checked="allVisibleSelected ? true : (hasSelectedProducts && !allVisibleSelected ? 'indeterminate' : false)"
                @update:checked="toggleAllVisible"
                :aria-label="$t('admin.products.selectAll')"
              />
            </TableHead>
            <TableHead 
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              @click="updateSort('name')"
            >
              <div class="flex items-center space-x-1">
                <span>Product</span>
                <svg v-if="sortBy === 'name'" class="h-4 w-4" :class="sortOrder === 'asc' ? 'transform rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </TableHead>
            <TableHead class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Category
            </TableHead>
            <TableHead 
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              @click="updateSort('price')"
            >
              <div class="flex items-center space-x-1">
                <span>Price</span>
                <svg v-if="sortBy === 'price'" class="h-4 w-4" :class="sortOrder === 'asc' ? 'transform rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </TableHead>
            <TableHead 
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              @click="updateSort('stock')"
            >
              <div class="flex items-center space-x-1">
                <span>Stock</span>
                <svg v-if="sortBy === 'stock'" class="h-4 w-4" :class="sortOrder === 'asc' ? 'transform rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </TableHead>
            <TableHead class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead 
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              @click="updateSort('created_at')"
            >
              <div class="flex items-center space-x-1">
                <span>Created</span>
                <svg v-if="sortBy === 'created_at'" class="h-4 w-4" :class="sortOrder === 'asc' ? 'transform rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </TableHead>
            <TableHead class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr 
            v-for="product in products" 
            :key="product.id" 
            class="hover:bg-gray-50 dark:hover:bg-gray-700"
            :class="{ 'bg-blue-50 dark:bg-blue-900/20': product.isSelected }"
          >
            <!-- Selection Checkbox -->
            <td class="px-6 py-4 whitespace-nowrap">
              <UiCheckbox
                :checked="product.isSelected"
                @update:checked="() => toggleProductSelection(product.id)"
                :aria-label="$t('admin.products.select')"
              />
            </td>

            <!-- Product Info -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <img
                    v-if="product.images?.[0]?.url"
                    :src="product.images[0].url"
                    :alt="getLocalizedText(product.name)"
                    class="w-10 h-10 rounded-lg object-cover"
                  />
                  <svg v-else class="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ getLocalizedText(product.name) }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    SKU: {{ product.sku || 'N/A' }}
                  </div>
                </div>
              </div>
            </td>

            <!-- Category -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {{ getLocalizedText(product.category?.name) || 'Uncategorized' }}
            </td>

            <!-- Price -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              €{{ formatPrice(product.price) }}
              <div v-if="product.comparePrice && product.comparePrice > product.price" class="text-xs text-gray-500 line-through">
                €{{ formatPrice(product.comparePrice) }}
              </div>
            </td>

            <!-- Stock -->
            <td class="px-6 py-4 whitespace-nowrap">
              <AdminInventoryEditor
                :product-id="product.id"
                :stock-quantity="product.stockQuantity"
                :low-stock-threshold="product.lowStockThreshold || 5"
                :reorder-point="product.reorderPoint || 10"
                size="sm"
                @updated="handleInventoryUpdated"
                @error="handleInventoryError"
              />
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                product.isActive ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              ]">
                {{ product.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <!-- Created Date -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(product.createdAt) }}
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <nuxt-link
                :to="`/products/${product.slug}`"
                target="_blank"
                class="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                title="View Product"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </nuxt-link>
              <nuxt-link
                :to="`/admin/products/${product.id}`"
                class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                title="Edit Product"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </nuxt-link>
              <Button
                @click="$emit('delete-product', product.id)"
                variant="ghost"
                size="icon"
                class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                title="Delete Product"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </td>
          </tr>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table'
import { Checkbox as UiCheckbox } from '@/components/ui/checkbox'
import type { ProductWithRelations } from '~/types/database'

interface Props {
  products: any[]
  loading: boolean
  hasActiveFilters: boolean
  hasSelectedProducts: boolean
  allVisibleSelected: boolean
  selectedCount: number
  bulkOperationInProgress: boolean
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface Emits {
  (e: 'toggle-product-selection', productId: number): void
  (e: 'toggle-all-visible'): void
  (e: 'clear-selection'): void
  (e: 'update-sort', sortBy: string, sortOrder?: 'asc' | 'desc'): void
  (e: 'delete-product', productId: number): void
  (e: 'bulk-activate'): void
  (e: 'bulk-deactivate'): void
  (e: 'bulk-delete'): void
  (e: 'inventory-updated', data: { productId: number; newQuantity: number; oldQuantity: number }): void
  (e: 'inventory-error', error: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Utility functions
const getLocalizedText = (text: Record<string, string> | null) => {
  if (!text) return ''
  return text.es || Object.values(text)[0] || ''
}

const formatPrice = (price: string | number) => {
  return Number(price).toFixed(2)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}



// Event handlers
const toggleProductSelection = (productId: number) => {
  emit('toggle-product-selection', productId)
}

const toggleAllVisible = () => {
  emit('toggle-all-visible')
}

const clearSelection = () => {
  emit('clear-selection')
}

const updateSort = (sortBy: string) => {
  const newOrder = props.sortBy === sortBy && props.sortOrder === 'asc' ? 'desc' : 'asc'
  emit('update-sort', sortBy, newOrder)
}

const handleInventoryUpdated = (data: { productId: number; newQuantity: number; oldQuantity: number }) => {
  emit('inventory-updated', data)
}

const handleInventoryError = (error: string) => {
  emit('inventory-error', error)
}
</script>
