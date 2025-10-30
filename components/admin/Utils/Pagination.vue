<template>
  <div v-if="totalPages > 1" class="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
    <div class="flex items-center justify-between">
      <!-- Mobile Pagination -->
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          :disabled="!hasPrev"
          @click="$emit('prev-page')"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ $t('common.previous') }}
        </button>
        <button
          :disabled="!hasNext"
          @click="$emit('next-page')"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ $t('common.next') }}
        </button>
      </div>

      <!-- Desktop Pagination -->
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <!-- Results Info -->
        <div>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            {{ $t('common.showing') }} {{ startItem }} {{ $t('common.to') }} {{ endItem }} {{ $t('common.of') }} {{ total }} {{ $t('common.results') }}
          </p>
        </div>

        <!-- Page Navigation -->
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <!-- Previous Button -->
            <button
              :disabled="!hasPrev"
              @click="$emit('prev-page')"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">{{ $t('common.previous') }}</span>
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <!-- Page Numbers -->
            <template v-for="pageNum in visiblePages" :key="pageNum">
              <button
                v-if="pageNum !== '...'"
                @click="$emit('go-to-page', pageNum)"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  pageNum === page
                    ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-200'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                ]"
              >
                {{ pageNum }}
              </button>
              <span
                v-else
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                ...
              </span>
            </template>

            <!-- Next Button -->
            <button
              :disabled="!hasNext"
              @click="$emit('next-page')"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">{{ $t('common.next') }}</span>
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Page Size Selector -->
    <div class="mt-3 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <label for="page-size" class="text-sm text-gray-700 dark:text-gray-300">
          {{ $t('common.itemsPerPage') }}:
        </label>
        <select
          id="page-size"
          :value="limit"
          @change="$emit('update-limit', Number($event.target.value))"
          class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>

      <!-- Quick Jump -->
      <div class="flex items-center space-x-2">
        <label for="page-jump" class="text-sm text-gray-700 dark:text-gray-300">
          {{ $t('common.goToPage') }}:
        </label>
        <input
          id="page-jump"
          type="number"
          :min="1"
          :max="totalPages"
          :value="page"
          @keyup.enter="jumpToPage($event.target.value)"
          class="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          @click="jumpToPage($refs.pageJump?.value)"
          class="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
        >
          {{ $t('common.go') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface Emits {
  (e: 'go-to-page', page: number): void
  (e: 'next-page'): void
  (e: 'prev-page'): void
  (e: 'update-limit', limit: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed properties
const startItem = computed(() => {
  return (props.page - 1) * props.limit + 1
})

const endItem = computed(() => {
  return Math.min(props.page * props.limit, props.total)
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const current = props.page
  const total = props.totalPages
  
  // Always show first page
  if (total > 0) {
    pages.push(1)
  }
  
  // Calculate range around current page
  let start = Math.max(2, current - 2)
  let end = Math.min(total - 1, current + 2)
  
  // Add ellipsis after first page if needed
  if (start > 2) {
    pages.push('...')
  }
  
  // Add pages around current
  for (let i = start; i <= end; i++) {
    if (i !== 1 && i !== total) {
      pages.push(i)
    }
  }
  
  // Add ellipsis before last page if needed
  if (end < total - 1) {
    pages.push('...')
  }
  
  // Always show last page (if different from first)
  if (total > 1) {
    pages.push(total)
  }
  
  return pages
})

// Methods
const jumpToPage = (value: string | number) => {
  const pageNum = Number(value)
  if (pageNum >= 1 && pageNum <= props.totalPages && pageNum !== props.page) {
    emit('go-to-page', pageNum)
  }
}
</script>