<template>
  <div class="flex flex-col gap-4 border-b border-gray-200 pb-6 dark:border-gray-800 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0 flex-1">
      <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
        {{ t('products.discovery.title') }}
      </h1>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {{ t('products.showingResults', {
          start: ((pagination.page - 1) * pagination.limit) + 1,
          end: Math.min(pagination.page * pagination.limit, pagination.total || 0),
          total: pagination.total || 0,
        }) }}
      </p>
    </div>

    <!-- Right Side Controls -->
    <div class="flex items-center gap-3 sm:gap-4">
      <!-- Filter Button -->
      <button
        type="button"
        :aria-label="t('products.filters.title')"
        :aria-expanded="showFilterPanel"
        aria-controls="filter-panel"
        class="relative inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750"
        @click="$emit('openFilters')"
      >
        <CommonIcon
          name="lucide:sliders-horizontal"
          class="h-4 w-4"
          aria-hidden="true"
        />
        <span>{{ t('products.filters.title') }}</span>
        <span
          v-if="activeFilterCount"
          class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white ring-2 ring-white dark:ring-gray-900"
        >
          {{ activeFilterCount }}
        </span>
      </button>

      <!-- Sort Dropdown -->
      <div class="relative">
        <label
          for="product-sort"
          class="sr-only"
        >
          {{ t('products.sortLabel') }}
        </label>
        <select
          id="product-sort"
          :model-value="sortBy"
          :aria-label="t('products.sortLabel')"
          class="h-10 appearance-none rounded-lg border border-gray-300 bg-white pl-4 pr-10 text-sm font-medium text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          @change="$emit('sortChange', ($event.target as HTMLSelectElement).value)"
        >
          <option value="created">
            {{ t('products.sortNewest') }}
          </option>
          <option value="name">
            {{ t('products.sortName') }}
          </option>
          <option value="price_asc">
            {{ t('products.sortPriceLowHigh') }}
          </option>
          <option value="price_desc">
            {{ t('products.sortPriceHighLow') }}
          </option>
          <option value="featured">
            {{ t('products.sortFeatured') }}
          </option>
        </select>
        <CommonIcon
          name="lucide:chevron-down"
          class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600"
          aria-hidden="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Products Toolbar Component
 *
 * Displays the page header, results count, filter button, and sort dropdown.
 * Extracted from pages/products/index.vue to reduce component size.
 */
import CommonIcon from '~/components/common/Icon.vue'

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface Props {
  pagination: Pagination
  sortBy: string
  showFilterPanel: boolean
  activeFilterCount: number
}

defineProps<Props>()

defineEmits<{
  openFilters: []
  sortChange: [value: string]
}>()

const { t } = useI18n()
</script>
