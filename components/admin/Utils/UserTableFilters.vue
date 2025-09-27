<!--
  Admin User Table Filters Component
  
  Mobile-optimized search and filtering component for user table
  Follows mobile patterns from ProductCard.vue and mobile components
  
  Features:
  - Mobile-responsive search input
  - Touch-friendly filter controls  
  - Haptic feedback for mobile interactions
  - Optimized keyboard handling
-->

<template>
  <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- Search Input -->
      <div class="flex-1 max-w-md">
        <div class="relative">
          <commonIcon 
            name="heroicons:magnifying-glass" 
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" 
          />
          <input
            ref="searchInput"
            v-model="localSearchQuery"
            type="text"
            :placeholder="$t('admin.users.searchPlaceholder')"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 touch-manipulation"
            :class="{
              'min-h-[44px]': isMobile // Ensure minimum touch target size
            }"
            @input="handleSearchInput"
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
            @keydown="handleKeydown"
          />
          <!-- Clear search button -->
          <button
            v-if="localSearchQuery"
            @click="clearSearch"
            @touchstart="isMobile && vibrate('tap')"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 touch-manipulation"
            :class="{
              'p-2': isMobile // Larger touch target
            }"
            type="button"
          >
            <commonIcon name="heroicons:x-mark" class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <!-- Filter Controls -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <!-- Status Filter -->
        <select
          v-model="localStatusFilter"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 touch-manipulation"
          :class="{
            'min-h-[44px]': isMobile
          }"
          @change="handleStatusFilterChange"
          @focus="isMobile && vibrate('tap')"
        >
          <option value="">{{ $t('admin.users.filters.allStatus') }}</option>
          <option value="active">{{ $t('admin.users.filters.active') }}</option>
          <option value="inactive">{{ $t('admin.users.filters.inactive') }}</option>
        </select>

        <!-- Date Range Filter -->
        <AdminUtilsUserDateRangePicker
          v-model:from="localDateFrom"
          v-model:to="localDateTo"
          :class="{
            'mobile-optimized': isMobile
          }"
          @update="handleDateRangeUpdate"
        />

        <!-- Clear Filters Button -->
        <button
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          @touchstart="isMobile && vibrate('tap')"
          class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation active:scale-95"
          :class="{
            'min-h-[44px] px-4': isMobile,
            'active:bg-gray-100 dark:active:bg-gray-600': isMobile
          }"
          type="button"
        >
          {{ $t('admin.users.filters.clear') }}
        </button>

        <!-- Mobile Filter Toggle -->
        <button
          v-if="isMobile && (localStatusFilter || localDateFrom || localDateTo)"
          @click="toggleMobileFilters"
          @touchstart="vibrate('tap')"
          class="sm:hidden px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg touch-manipulation active:scale-95 min-h-[44px]"
          type="button"
        >
          <commonIcon :name="showMobileFilters ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" class="w-4 h-4 mr-1" />
          {{ $t('admin.users.filters.toggle') }}
        </button>
      </div>
    </div>

    <!-- Mobile Filters Expansion -->
    <div
      v-if="isMobile && showMobileFilters"
      class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3"
    >
      <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
        {{ $t('admin.users.filters.activeFilters') }}
      </div>
      <div class="flex flex-wrap gap-2">
        <span
          v-if="localStatusFilter"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
        >
          {{ $t(`admin.users.filters.${localStatusFilter}`) }}
          <button
            @click="localStatusFilter = ''; handleStatusFilterChange()"
            @touchstart="vibrate('tap')"
            class="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
          >
            <commonIcon name="heroicons:x-mark" class="w-3 h-3" />
          </button>
        </span>
        <span
          v-if="localDateFrom || localDateTo"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
        >
          {{ formatDateRange(localDateFrom, localDateTo) }}
          <button
            @click="clearDateRange"
            @touchstart="vibrate('tap')"
            class="ml-2 text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-green-100"
          >
            <commonIcon name="heroicons:x-mark" class="w-3 h-3" />
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

interface Props {
  searchQuery?: string
  statusFilter?: string
  dateFrom?: string
  dateTo?: string
}

interface Emits {
  (e: 'update:searchQuery', value: string): void
  (e: 'update:statusFilter', value: string): void
  (e: 'update:dateFrom', value: string): void
  (e: 'update:dateTo', value: string): void
  (e: 'search', query: string): void
  (e: 'statusChange', status: string): void
  (e: 'dateRangeChange', from?: string, to?: string): void
  (e: 'clearFilters'): void
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  statusFilter: '',
  dateFrom: '',
  dateTo: ''
})

const emit = defineEmits<Emits>()

// Composables
const { isMobile } = useDevice()
const { vibrate } = useHapticFeedback()
const { t } = useI18n()

// Template refs
const searchInput = ref<HTMLInputElement>()

// Local state
const localSearchQuery = ref(props.searchQuery)
const localStatusFilter = ref(props.statusFilter)
const localDateFrom = ref(props.dateFrom)
const localDateTo = ref(props.dateTo)
const showMobileFilters = ref(false)
const isSearchFocused = ref(false)

// Debounced search
const { debouncedFn: debouncedSearch } = useDebounceFn((query: string) => {
  emit('search', query)
  emit('update:searchQuery', query)
}, 300)

// Computed
const hasActiveFilters = computed(() => {
  return !!(localSearchQuery.value || localStatusFilter.value || localDateFrom.value || localDateTo.value)
})

// Methods
const handleSearchInput = () => {
  debouncedSearch(localSearchQuery.value)
  
  // Haptic feedback for mobile
  if (isMobile.value && localSearchQuery.value) {
    vibrate('light')
  }
}

const handleSearchFocus = () => {
  isSearchFocused.value = true
  if (isMobile.value) {
    vibrate('tap')
  }
}

const handleSearchBlur = () => {
  isSearchFocused.value = false
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    searchInput.value?.blur()
    if (isMobile.value) {
      vibrate('success')
    }
  } else if (event.key === 'Escape') {
    clearSearch()
    searchInput.value?.blur()
  }
}

const clearSearch = () => {
  localSearchQuery.value = ''
  emit('search', '')
  emit('update:searchQuery', '')
  
  if (isMobile.value) {
    vibrate('tap')
  }
}

const handleStatusFilterChange = () => {
  emit('statusChange', localStatusFilter.value)
  emit('update:statusFilter', localStatusFilter.value)
  
  if (isMobile.value) {
    vibrate('light')
  }
}

const handleDateRangeUpdate = () => {
  emit('dateRangeChange', localDateFrom.value || undefined, localDateTo.value || undefined)
  emit('update:dateFrom', localDateFrom.value)
  emit('update:dateTo', localDateTo.value)
  
  if (isMobile.value) {
    vibrate('light')
  }
}

const clearDateRange = () => {
  localDateFrom.value = ''
  localDateTo.value = ''
  handleDateRangeUpdate()
  
  if (isMobile.value) {
    vibrate('tap')
  }
}

const clearAllFilters = () => {
  localSearchQuery.value = ''
  localStatusFilter.value = ''
  localDateFrom.value = ''
  localDateTo.value = ''
  
  emit('clearFilters')
  emit('update:searchQuery', '')
  emit('update:statusFilter', '')
  emit('update:dateFrom', '')
  emit('update:dateTo', '')
  
  if (isMobile.value) {
    vibrate('success')
    showMobileFilters.value = false
  }
}

const toggleMobileFilters = () => {
  showMobileFilters.value = !showMobileFilters.value
  vibrate('tap')
}

const formatDateRange = (from?: string, to?: string) => {
  if (!from && !to) return ''
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString()
  }
  
  if (from && to) {
    return `${formatDate(from)} - ${formatDate(to)}`
  } else if (from) {
    return `${t('admin.users.filters.from')} ${formatDate(from)}`
  } else if (to) {
    return `${t('admin.users.filters.to')} ${formatDate(to)}`
  }
  
  return ''
}

// Watch for prop changes
watch(() => props.searchQuery, (newValue) => {
  localSearchQuery.value = newValue
})

watch(() => props.statusFilter, (newValue) => {
  localStatusFilter.value = newValue
})

watch(() => props.dateFrom, (newValue) => {
  localDateFrom.value = newValue
})

watch(() => props.dateTo, (newValue) => {
  localDateTo.value = newValue
})

// Auto-focus search input on desktop
onMounted(() => {
  if (!isMobile.value && searchInput.value) {
    nextTick(() => {
      // Delay auto-focus to avoid interfering with page load
      setTimeout(() => {
        searchInput.value?.focus()
      }, 100)
    })
  }
})
</script>

<style scoped>
/* Mobile-specific optimizations */
.mobile-optimized {
  touch-action: manipulation;
}

/* Smooth transitions for mobile interactions */
.touch-manipulation:active {
  transform: scale(0.95); transition: transform 100ms;
}

/* Enhanced focus states for accessibility */
input:focus {
  box-shadow: 0 0 0 2px #3b82f6; outline-offset: 2px;
}

select:focus {
  box-shadow: 0 0 0 2px #3b82f6; outline-offset: 2px;
}

/* Mobile keyboard optimization */
@media (max-width: 640px) {
  input[type="text"] {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
</style>