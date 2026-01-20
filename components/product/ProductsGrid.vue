<template>
  <div
    id="main-content"
    class="space-y-10"
    role="main"
  >
    <MobileVirtualProductGrid
      v-if="isMobile && products.length > 20"
      :items="products"
      :container-height="600"
      :loading="loading"
      @load-more="$emit('loadMore')"
    />
    <!-- Standard Grid: Clean, predictable layout -->
    <div
      v-else
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>

    <div
      v-if="pagination.totalPages > 1"
      class="space-y-4 text-center"
    >
      <p
        class="text-sm text-gray-600 dark:text-gray-400"
        aria-live="polite"
      >
        {{ t('products.pagination.pageOf', { page: pagination.page, total: pagination.totalPages }) }} ·
        {{ t('products.pagination.showing', { count: pagination.total || products.length }) }}
      </p>
      <nav
        class="flex items-center justify-center gap-2"
        aria-label="Pagination"
      >
        <UiButton
          :disabled="pagination.page <= 1"
          variant="outline"
          size="sm"
          class="rounded-full"
          :aria-label="t('products.pagination.previousPage')"
          @click="$emit('goToPage', pagination.page - 1)"
        >
          {{ t('common.previous') }}
        </UiButton>
        <template
          v-for="page in visiblePages"
          :key="`page-${page}`"
        >
          <UiButton
            v-if="isValidPage(page)"
            size="sm"
            :variant="page === pagination.page ? 'default' : 'ghost'"
            class="rounded-full"
            :class="page === pagination.page ? 'shadow-lg shadow-blue-500/30' : ''"
            :aria-label="t('products.pagination.goToPage', { page })"
            :aria-current="page === pagination.page ? 'page' : undefined"
            @click="$emit('goToPage', page)"
          >
            {{ page }}
          </UiButton>
          <span
            v-else
            class="px-3 py-2 text-sm text-gray-600"
            aria-hidden="true"
          >…</span>
        </template>
        <UiButton
          :disabled="pagination.page >= pagination.totalPages"
          variant="outline"
          size="sm"
          class="rounded-full"
          :aria-label="t('products.pagination.nextPage')"
          @click="$emit('goToPage', pagination.page + 1)"
        >
          {{ t('common.next') }}
        </UiButton>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Products Grid Component
 *
 * Displays the product grid with virtual scrolling for mobile
 * and pagination controls.
 * Extracted from pages/products/index.vue to reduce component size.
 */
import type { ProductWithRelations } from '~/types'
import ProductCard from '~/components/product/Card.vue'
import MobileVirtualProductGrid from '~/components/mobile/VirtualProductGrid.vue'

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface Props {
  products: ProductWithRelations[]
  pagination: Pagination
  loading: boolean
  isMobile: boolean
  visiblePages: (number | string)[]
}

defineProps<Props>()

defineEmits<{
  loadMore: []
  goToPage: [page: number]
}>()

const { t } = useI18n()

// Type guard for pagination page (number | string '...')
function isValidPage(page: number | string): page is number {
  return typeof page === 'number'
}
</script>
