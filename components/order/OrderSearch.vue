<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4" role="search" :aria-label="$t('orders.search.searchLabel')">
    <!-- Search Input -->
    <div class="relative">
      <label for="order-search-input" class="sr-only">{{ $t('orders.accessibility.searchInput') }}</label>
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        id="order-search-input"
        v-model="searchQuery"
        type="search"
        :placeholder="$t('orders.search.placeholder')"
        :aria-label="$t('orders.accessibility.searchInput')"
        class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
        @input="handleSearchInput"
      />
      <div v-if="searchQuery" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <button
          @click="clearSearch"
          :aria-label="$t('orders.accessibility.clearSearch')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4" role="group" aria-label="Order filters">
      <!-- Status Filter -->
      <div>
        <label for="status-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ $t('orders.search.status') }}
        </label>
        <select
          id="status-filter"
          v-model="selectedStatus"
          :aria-label="$t('orders.accessibility.statusFilter')"
          class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          @change="handleFilterChange"
        >
          <option value="">{{ $t('orders.search.allStatuses') }}</option>
          <option value="pending">{{ $t('orders.status.pending') }}</option>
          <option value="processing">{{ $t('orders.status.processing') }}</option>
          <option value="shipped">{{ $t('orders.status.shipped') }}</option>
          <option value="delivered">{{ $t('orders.status.delivered') }}</option>
          <option value="cancelled">{{ $t('orders.status.cancelled') }}</option>
        </select>
      </div>

      <!-- Date From -->
      <div>
        <label for="date-from-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ $t('orders.search.dateFrom') }}
        </label>
        <input
          id="date-from-filter"
          v-model="dateFrom"
          type="date"
          :aria-label="$t('orders.accessibility.dateFromFilter')"
          class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
          @change="handleFilterChange"
        />
      </div>

      <!-- Date To -->
      <div>
        <label for="date-to-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ $t('orders.search.dateTo') }}
        </label>
        <input
          id="date-to-filter"
          v-model="dateTo"
          type="date"
          :aria-label="$t('orders.accessibility.dateToFilter')"
          class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
          @change="handleFilterChange"
        />
      </div>
    </div>

    <!-- Active Filters & Clear Button -->
    <div v-if="hasActiveFilters" class="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700" role="region" aria-live="polite" :aria-label="$t('orders.accessibility.activeFilter', { filter: 'active' })">
      <div class="flex flex-wrap gap-2" role="list" aria-label="Active filters">
        <span
          v-if="searchQuery"
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
          role="listitem"
        >
          {{ $t('orders.search.searchLabel') }}: "{{ searchQuery }}"
          <button 
            @click="clearSearch" 
            class="ml-1 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            :aria-label="$t('orders.accessibility.removeFilter', { filter: $t('orders.search.searchLabel') })"
          >
            <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </span>
        <span
          v-if="selectedStatus"
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
          role="listitem"
        >
          {{ $t('orders.search.status') }}: {{ $t(`orders.status.${selectedStatus}`) }}
          <button 
            @click="clearStatus" 
            class="ml-1 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            :aria-label="$t('orders.accessibility.removeFilter', { filter: $t('orders.search.status') })"
          >
            <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </span>
        <span
          v-if="dateFrom || dateTo"
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
          role="listitem"
        >
          {{ $t('orders.search.dateRange') }}: {{ formatDateRange }}
          <button 
            @click="clearDateRange" 
            class="ml-1 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            :aria-label="$t('orders.accessibility.removeFilter', { filter: $t('orders.search.dateRange') })"
          >
            <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </span>
      </div>
      <button
        @click="clearAllFilters"
        :aria-label="$t('orders.accessibility.clearFilters')"
        class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
      >
        {{ $t('orders.search.clearAll') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderStatus } from '~/types'

interface OrderSearchFilters {
  search?: string
  status?: OrderStatus | ''
  dateFrom?: string
  dateTo?: string
}

interface Props {
  modelValue?: OrderSearchFilters
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({})
})

const emit = defineEmits<{
  'update:modelValue': [filters: OrderSearchFilters]
  search: [filters: OrderSearchFilters]
}>()

const { t, locale } = useI18n()

// Local state
const searchQuery = ref(props.modelValue.search || '')
const selectedStatus = ref<OrderStatus | ''>(props.modelValue.status || '')
const dateFrom = ref(props.modelValue.dateFrom || '')
const dateTo = ref(props.modelValue.dateTo || '')

// Debounced search
let searchTimeout: NodeJS.Timeout | null = null
const DEBOUNCE_DELAY = 500

// Computed properties
const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || selectedStatus.value || dateFrom.value || dateTo.value)
})

const formatDateRange = computed(() => {
  if (dateFrom.value && dateTo.value) {
    return `${formatDate(dateFrom.value)} - ${formatDate(dateTo.value)}`
  } else if (dateFrom.value) {
    return `${t('orders.search.from')} ${formatDate(dateFrom.value)}`
  } else if (dateTo.value) {
    return `${t('orders.search.to')} ${formatDate(dateTo.value)}`
  }
  return ''
})

// Helper functions
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

const emitFilters = () => {
  const filters: OrderSearchFilters = {
    search: searchQuery.value || undefined,
    status: selectedStatus.value || undefined,
    dateFrom: dateFrom.value || undefined,
    dateTo: dateTo.value || undefined
  }
  emit('update:modelValue', filters)
  emit('search', filters)
}

// Event handlers
const handleSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    emitFilters()
  }, DEBOUNCE_DELAY)
}

const handleFilterChange = () => {
  emitFilters()
}

const clearSearch = () => {
  searchQuery.value = ''
  emitFilters()
}

const clearStatus = () => {
  selectedStatus.value = ''
  emitFilters()
}

const clearDateRange = () => {
  dateFrom.value = ''
  dateTo.value = ''
  emitFilters()
}

const clearAllFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  emitFilters()
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue.search || ''
  selectedStatus.value = newValue.status || ''
  dateFrom.value = newValue.dateFrom || ''
  dateTo.value = newValue.dateTo || ''
}, { deep: true })
</script>
