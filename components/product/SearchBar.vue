<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <!-- Title and description -->
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ description }}
        </p>
      </div>

      <!-- Controls -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Filter button (mobile/tablet only) -->
        <UiButton
          type="button"
          variant="outline"
          size="sm"
          :aria-label="filterButtonLabel"
          :aria-expanded="showFilterPanel"
          aria-controls="filter-panel"
          @click="$emit('open-filters')"
        >
          <commonIcon
            name="lucide:filter"
            class="mr-2 h-4 w-4"
            aria-hidden="true"
          />
          <span>{{ filterButtonLabel }}</span>
          <span
            v-if="activeFilterCount"
            class="ml-1 inline-flex items-center justify-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
            aria-label="Active filters count"
          >
            {{ activeFilterCount }}
          </span>
        </UiButton>

        <div class="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <!-- Search input -->
          <div class="relative flex-1">
            <label
              :for="searchInputId"
              class="sr-only"
            >
              {{ searchLabel }}
            </label>
            <commonIcon
              v-if="!loading"
              name="lucide:search"
              class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <div
              v-else
              class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2"
              role="status"
              :aria-label="$t('common.loading')"
            >
              <svg
                class="h-5 w-5 animate-spin text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <input
              :id="searchInputId"
              ref="searchInputRef"
              :value="searchQuery"
              type="search"
              role="searchbox"
              :placeholder="searchPlaceholder"
              :disabled="loading"
              :aria-label="searchLabel"
              :aria-busy="loading"
              class="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              @input="handleSearchInput"
            />
          </div>

          <!-- Sort dropdown -->
          <div class="relative">
            <label
              :for="sortSelectId"
              class="sr-only"
            >
              {{ sortLabel }}
            </label>
            <select
              :id="sortSelectId"
              :value="sortBy"
              :aria-label="sortLabel"
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:w-48"
              @change="$emit('update:sortBy', ($event.target as HTMLSelectElement).value)"
            >
              <option
                v-for="option in sortOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface SortOption {
  value: string
  label: string
}

interface Props {
  title: string
  description: string
  searchQuery: string
  sortBy: string
  sortOptions: SortOption[]
  activeFilterCount?: number
  showFilterPanel?: boolean
  loading?: boolean
  searchLabel: string
  searchPlaceholder: string
  filterButtonLabel: string
  sortLabel: string
  searchInputId?: string
  sortSelectId?: string
}

withDefaults(defineProps<Props>(), {
  activeFilterCount: 0,
  showFilterPanel: false,
  loading: false,
  searchInputId: 'product-search',
  sortSelectId: 'product-sort',
})

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:sortBy': [value: string]
  'open-filters': []
}>()

const searchInputRef = ref<HTMLInputElement | null>(null)

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:searchQuery', target.value)
}

// Expose ref for parent component to focus if needed
defineExpose({
  searchInputRef,
})
</script>
