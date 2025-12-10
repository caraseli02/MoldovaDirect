<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
    <div class="p-6">
      <!-- Search and Filters Row -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <!-- Search Input -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              class="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            :value="search"
            type="text"
            placeholder="Search by name, SKU, or category..."
            class="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            @input="updateSearch(($event.target as HTMLInputElement)?.value || '')"
          />
          <div
            v-if="search"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <Button
              variant="ghost"
              size="icon"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              @click="clearSearch"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>

        <!-- Category Filter -->
        <select
          :value="categoryId || ''"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          @change="updateCategoryFilter(($event.target as HTMLSelectElement)?.value || '')"
        >
          <option value="">
            All Categories
          </option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ getLocalizedText(category.name) }}
          </option>
        </select>

        <!-- Status Filter -->
        <select
          :value="status"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          @change="updateStatusFilter(($event.target as HTMLSelectElement)?.value || '')"
        >
          <option value="">
            All Status
          </option>
          <option value="active">
            Active
          </option>
          <option value="inactive">
            Inactive
          </option>
        </select>

        <!-- Stock Level Filter -->
        <select
          :value="stockLevel"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          @change="updateStockFilter(($event.target as HTMLSelectElement)?.value || '')"
        >
          <option value="">
            All Stock Levels
          </option>
          <option value="in-stock">
            In Stock
          </option>
          <option value="low-stock">
            Low Stock
          </option>
          <option value="out-of-stock">
            Out of Stock
          </option>
        </select>
      </div>

      <!-- Active Filters and Actions Row -->
      <div class="flex items-center justify-between">
        <!-- Active Filters -->
        <div class="flex items-center space-x-2">
          <span
            v-if="hasActiveFilters"
            class="text-sm text-gray-600 dark:text-gray-400"
          >
            Active filters:
          </span>

          <!-- Search Filter Badge -->
          <span
            v-if="search"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            Search: "{{ search }}"
            <Button
              variant="ghost"
              size="icon"
              class="ml-1.5 w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 dark:hover:bg-blue-800"
              @click="clearSearch"
            >
              <svg
                class="w-2 h-2"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 8 8"
              >
                <path
                  stroke-linecap="round"
                  stroke-width="1.5"
                  d="m1 1 6 6m0-6-6 6"
                />
              </svg>
            </Button>
          </span>

          <!-- Category Filter Badge -->
          <span
            v-if="categoryId"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            Category: {{ getCategoryName(categoryId) }}
            <Button
              variant="ghost"
              size="icon"
              class="ml-1.5 w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-600 dark:hover:bg-green-800"
              @click="clearCategoryFilter"
            >
              <svg
                class="w-2 h-2"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 8 8"
              >
                <path
                  stroke-linecap="round"
                  stroke-width="1.5"
                  d="m1 1 6 6m0-6-6 6"
                />
              </svg>
            </Button>
          </span>

          <!-- Status Filter Badge -->
          <span
            v-if="status"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
          >
            Status: {{ status === 'active' ? 'Active' : 'Inactive' }}
            <Button
              variant="ghost"
              size="icon"
              class="ml-1.5 w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-600 dark:hover:bg-purple-800"
              @click="clearStatusFilter"
            >
              <svg
                class="w-2 h-2"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 8 8"
              >
                <path
                  stroke-linecap="round"
                  stroke-width="1.5"
                  d="m1 1 6 6m0-6-6 6"
                />
              </svg>
            </Button>
          </span>

          <!-- Stock Level Filter Badge -->
          <span
            v-if="stockLevel"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
          >
            Stock: {{ getStockLevelLabel(stockLevel) }}
            <Button
              variant="ghost"
              size="icon"
              class="ml-1.5 w-4 h-4 rounded-full text-orange-400 hover:bg-orange-200 hover:text-orange-600 dark:hover:bg-orange-800"
              @click="clearStockFilter"
            >
              <svg
                class="w-2 h-2"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 8 8"
              >
                <path
                  stroke-linecap="round"
                  stroke-width="1.5"
                  d="m1 1 6 6m0-6-6 6"
                />
              </svg>
            </Button>
          </span>

          <!-- Clear All Filters -->
          <Button
            v-if="hasActiveFilters"
            variant="link"
            class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            @click="clearAllFilters"
          >
            Clear all
          </Button>
        </div>

        <!-- Results Count -->
        <div class="text-sm text-gray-600 dark:text-gray-400">
          {{ total }} {{ total === 1 ? 'product' : 'products' }} found
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import type { CategoryWithChildren } from '~/types/database'

interface Props {
  search: string
  categoryId?: number
  status: string
  stockLevel: string
  categories: CategoryWithChildren[]
  total: number
  loading: boolean
}

interface Emits {
  (e: 'update-search', value: string): void
  (e: 'update-category', value: number | undefined): void
  (e: 'update-status', value: string): void
  (e: 'update-stock', value: string): void
  (e: 'clear-filters'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed properties
const hasActiveFilters = computed(() => {
  return !!(props.search || props.categoryId || props.status || props.stockLevel)
})

// Utility functions
const getLocalizedText = (text: Record<string, string> | null | undefined) => {
  if (!text) return ''
  return text.es || Object.values(text)[0] || ''
}

const getCategoryName = (categoryId: number) => {
  const category = props.categories.find(c => c.id === categoryId)
  return category ? getLocalizedText(category.name) : 'Unknown'
}

const getStockLevelLabel = (stockLevel: string) => {
  const labels = {
    'in-stock': 'In Stock',
    'low-stock': 'Low Stock',
    'out-of-stock': 'Out of Stock',
  }
  return labels[stockLevel as keyof typeof labels] || stockLevel
}

// Event handlers with debouncing for search
let searchTimeout: NodeJS.Timeout | null = null

const updateSearch = (value: string) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    emit('update-search', value)
  }, 300) // 300ms debounce
}

const clearSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  emit('update-search', '')
}

const updateCategoryFilter = (value: string) => {
  const categoryId = value ? Number(value) : undefined
  emit('update-category', categoryId)
}

const clearCategoryFilter = () => {
  emit('update-category', undefined)
}

const updateStatusFilter = (value: string) => {
  emit('update-status', value)
}

const clearStatusFilter = () => {
  emit('update-status', '')
}

const updateStockFilter = (value: string) => {
  emit('update-stock', value)
}

const clearStockFilter = () => {
  emit('update-stock', '')
}

const clearAllFilters = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  emit('clear-filters')
}

// Cleanup timeout on unmount
onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>
