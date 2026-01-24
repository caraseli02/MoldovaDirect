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
      <UiButton
        type="button"
        :aria-label="t('products.filters.title')"
        :aria-expanded="showFilterPanel"
        aria-controls="filter-panel"
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
      </UiButton>

      <!-- Sort Dropdown -->
      <div class="relative">
        <UiLabel for="product-sort">
          {{ t('products.sortLabel') }}
        </UiLabel>
        <UiSelect
          id="product-sort"
          :model-value="sortBy"
          :aria-label="t('products.sortLabel')"
          @update:model-value="$emit('sortChange', $event as string)"
        >
          <UiSelectTrigger>
            <UiSelectValue />
          </UiSelectTrigger>
          <UiSelectContent>
            <UiSelectItem value="created">
              {{ t('products.sortNewest') }}
            </UiSelectItem>
            <UiSelectItem value="name">
              {{ t('products.sortName') }}
            </UiSelectItem>
            <UiSelectItem value="price_asc">
              {{ t('products.sortPriceLowHigh') }}
            </UiSelectItem>
            <UiSelectItem value="price_desc">
              {{ t('products.sortPriceHighLow') }}
            </UiSelectItem>
            <UiSelectItem value="featured">
              {{ t('products.sortFeatured') }}
            </UiSelectItem>
          </UiSelectContent>
        </UiSelect>
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
