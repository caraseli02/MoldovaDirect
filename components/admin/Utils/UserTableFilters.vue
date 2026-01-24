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
            name="lucide:search"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5"
          />
          <UiInput
            ref="searchInput"
            v-model="localSearchQuery"
            type="text"
            :placeholder="$t('admin.users.searchPlaceholder')"
            :class="{ 'min-h-[44px]': isMobile }"
            @input="handleSearchInput"
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
            @keydown="handleKeydown"
          />
          <!-- Clear search button -->
          <UiButton
            v-if="localSearchQuery"
            :class="{ 'p-2': isMobile }"
            type="button"
            @click="clearSearch"
            @touchstart="isMobile && vibrate('tap')"
          >
            <commonIcon
              name="lucide:x"
              class="w-4 h-4"
            />
          </UiButton>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <!-- Status Filter -->
        <UiSelect
          v-model="localStatusFilter"
          :class="{ 'min-h-[44px]': isMobile }"
          @update:model-value="handleStatusFilterChange"
          @focus="isMobile && vibrate('tap')"
        >
          <UiSelectTrigger>
            <UiSelectValue />
          </UiSelectTrigger>
          <UiSelectContent>
            <UiSelectItem value="">
              {{ $t('admin.users.filters.allStatus') }}
            </UiSelectItem>
            <UiSelectItem value="active">
              {{ $t('admin.users.filters.active') }}
            </UiSelectItem>
            <UiSelectItem value="inactive">
              {{ $t('admin.users.filters.inactive') }}
            </UiSelectItem>
          </UiSelectContent>
        </UiSelect>

        <!-- Date Range Filter -->
        <AdminUtilsUserDateRangePicker
          v-model:from="localDateFrom"
          v-model:to="localDateTo"
          :class="{
            'mobile-optimized': isMobile,
          }"
          @update="handleDateRangeUpdate"
        />

        <!-- Clear Filters Button -->
        <UiButton
          v-if="hasActiveFilters"
          :class="{ 'min-h-[44px] px-4': isMobile, 'active:bg-gray-100 dark:active:bg-gray-600': isMobile }"
          type="button"
          @click="clearAllFilters"
          @touchstart="isMobile && vibrate('tap')"
        >
          {{ $t('admin.users.filters.clear') }}
        </UiButton>

        <!-- Mobile Filter Toggle -->
        <UiButton
          v-if="isMobile && (localStatusFilter || localDateFrom || localDateTo)"
          type="button"
          @click="toggleMobileFilters"
          @touchstart="vibrate('tap')"
        >
          <commonIcon
            :name="showMobileFilters ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            class="w-4 h-4 mr-1"
          />
          {{ $t('admin.users.filters.toggle') }}
        </UiButton>
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
          <UiButton
            @click="localStatusFilter = ''; handleStatusFilterChange()"
            @touchstart="vibrate('tap')"
          ><commonIcon
            name="lucide:x"
            class="w-3 h-3"
          /></UiButton>
        </span>
        <span
          v-if="localDateFrom || localDateTo"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
        >
          {{ formatDateRange(localDateFrom, localDateTo) }}
          <UiButton
            @click="clearDateRange"
            @touchstart="vibrate('tap')"
          ><commonIcon
            name="lucide:x"
            class="w-3 h-3"
          /></UiButton>
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
  dateTo: '',
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
const debouncedSearch = useDebounceFn((query: string) => {
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
  }
  else if (event.key === 'Escape') {
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
  }
  else if (from) {
    return `${t('admin.users.filters.from')} ${formatDate(from)}`
  }
  else if (to) {
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
