<template>
  <div
    v-if="internal.totalPages > 1"
    class="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6"
  >
    <div class="flex items-center justify-between">
      <!-- Results Info -->
      <p class="hidden sm:block text-sm text-muted-foreground">
        Showing {{ startItem }} to {{ endItem }} of {{ internal.total }} results
      </p>

      <!-- Pagination -->
      <UiPagination>
        <UiPaginationContent>
          <UiPaginationPrevious
            :disabled="!internal.hasPrev"
            @click="emitPrev()"
          />

          <template
            v-for="pageNum in visiblePages"
            :key="pageKey(pageNum)"
          >
            <UiPaginationItem v-if="pageNum !== '...'">
              <button
                :data-testid="pageNum === internal.page ? 'current-page' : undefined"
                class="px-3 py-1 rounded-md"
                :class="pageNum === internal.page ? 'bg-accent text-accent-foreground' : ''"
                @click="emitGoTo(pageNum as number)"
              >
                {{ pageNum }}
              </button>
            </UiPaginationItem>
            <UiPaginationEllipsis v-else />
          </template>

          <UiPaginationNext
            :disabled="!internal.hasNext"
            @click="emitNext()"
          />
        </UiPaginationContent>
      </UiPagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Pagination as UiPagination,
  PaginationContent as UiPaginationContent,
  PaginationEllipsis as UiPaginationEllipsis,
  PaginationNext as UiPaginationNext,
  PaginationPrevious as UiPaginationPrevious,
  PaginationItem as UiPaginationItem,
} from '@/components/ui/pagination'

interface Props {
  // Primary prop names
  page?: number
  limit?: number
  total?: number
  totalPages?: number
  hasNext?: boolean
  hasPrev?: boolean
  // Alternate prop names used in some views
  currentPage?: number
  itemsPerPage?: number
  totalItems?: number
}

const props = defineProps<Props>()
const emit = defineEmits([
  'go-to-page',
  'page-change',
  'page-changed',
  'next-page',
  'prev-page',
  'update-limit',
])

const internal = computed(() => {
  const page = props.page ?? props.currentPage ?? 1
  const limit = props.limit ?? props.itemsPerPage ?? 10
  const total = props.total ?? props.totalItems ?? 0
  const totalPages = props.totalPages ?? Math.max(1, Math.ceil(total / limit))
  const hasPrev = page > 1
  const hasNext = page < totalPages
  return { page, limit, total, totalPages, hasPrev, hasNext }
})

// Computed properties
const startItem = computed(() => (internal.value.page - 1) * internal.value.limit + 1)

const endItem = computed(() => Math.min(internal.value.page * internal.value.limit, internal.value.total))

const visiblePages = computed<(number | string)[]>(() => {
  const pages: (number | string)[] = []
  const current = internal.value.page
  const total = internal.value.totalPages

  // Always show first page
  if (total > 0) {
    pages.push(1)
  }

  // Calculate range around current page
  const start = Math.max(2, current - 2)
  const end = Math.min(total - 1, current + 2)

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

const pageKey = (p: number | string) => (p === '...' ? `dots-${Math.random()}` : `p-${p}`)

const emitGoTo = (p: number) => {
  emit('go-to-page', p)
  emit('page-change', p)
  emit('page-changed', p)
}

const emitPrev = () => emit('prev-page')
const emitNext = () => emit('next-page')
</script>
