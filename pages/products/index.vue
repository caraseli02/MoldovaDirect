<template>
  <div class="py-6 lg:py-12">
    <div class="container">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl lg:text-4xl font-bold mb-4">{{ $t('common.shop') }}</h1>
        <p class="text-gray-600">{{ $t('products.browseDescription') }}</p>
      </div>

      <!-- Filters and Search -->
      <div class="mb-8">
        <div class="flex flex-col lg:flex-row gap-4 mb-6">
          <!-- Search -->
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('products.searchPlaceholder')"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="debouncedSearch"
            />
          </div>
          
          <!-- Category Filter -->
          <select
            v-model="selectedCategory"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="fetchProducts"
          >
            <option value="">{{ $t('products.allCategories') }}</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ getLocalizedText(category.name) }}
            </option>
          </select>

          <!-- Sort -->
          <select
            v-model="sortBy"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="fetchProducts"
          >
            <option value="created">{{ $t('products.sortNewest') }}</option>
            <option value="name">{{ $t('products.sortName') }}</option>
            <option value="price">{{ $t('products.sortPrice') }}</option>
            <option value="featured">{{ $t('products.sortFeatured') }}</option>
          </select>
        </div>

        <!-- Active Filters -->
        <div v-if="hasActiveFilters" class="flex flex-wrap gap-2">
          <span v-if="searchQuery" class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {{ $t('products.search') }}: "{{ searchQuery }}"
            <button @click="clearSearch" class="ml-2 text-blue-600 hover:text-blue-800">×</button>
          </span>
          <span v-if="selectedCategory" class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {{ $t('products.category') }}: {{ getSelectedCategoryName() }}
            <button @click="clearCategory" class="ml-2 text-blue-600 hover:text-blue-800">×</button>
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="n in 8" :key="n" class="animate-pulse">
          <div class="bg-gray-200 aspect-square rounded-lg mb-4"></div>
          <div class="h-4 bg-gray-200 rounded mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-else-if="products?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">
          {{ searchQuery || selectedCategory ? $t('products.noResults') : $t('products.noProducts') }}
        </h2>
        <p class="text-gray-600">
          {{ searchQuery || selectedCategory ? $t('products.tryDifferentFilters') : $t('products.comingSoon') }}
        </p>
      </div>

      <!-- Pagination -->
      <div v-if="products?.length && totalPages > 1" class="flex justify-center">
        <nav class="flex items-center space-x-2">
          <button
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
            class="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {{ $t('common.previous') }}
          </button>
          
          <span v-for="page in visiblePages" :key="page">
            <button
              v-if="page !== '...'"
              :class="[
                'px-3 py-2 border rounded-lg',
                page === currentPage ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 hover:bg-gray-50'
              ]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <span v-else class="px-3 py-2">...</span>
          </span>
          
          <button
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
            class="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {{ $t('common.next') }}
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductWithRelations, CategoryWithChildren, ProductFilters } from '~/types/database'

// Reactive state
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('created')
const currentPage = ref(1)
const pageSize = 12

// Data fetching
const { data: categoriesData } = await useFetch<{ categories: CategoryWithChildren[] }>('/api/categories')
const categories = computed(() => categoriesData.value?.categories || [])

// Build query parameters
const queryParams = computed((): ProductFilters => ({
  search: searchQuery.value || undefined,
  categoryId: selectedCategory.value ? Number(selectedCategory.value) : undefined,
  sortBy: sortBy.value as any,
  page: currentPage.value,
  limit: pageSize
}))

// Fetch products with reactivity
const { data: productsData, pending } = await useLazyFetch<{
  products: ProductWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}>('/api/products', {
  query: queryParams,
  server: true
})

// Computed properties
const products = computed(() => productsData.value?.products || [])
const totalPages = computed(() => productsData.value?.totalPages || 0)
const hasActiveFilters = computed(() => searchQuery.value || selectedCategory.value)

// Utility functions
const { locale } = useI18n()

const getLocalizedText = (text: Record<string, string> | null) => {
  if (!text) return ''
  return text[locale.value] || text.es || Object.values(text)[0] || ''
}

const getSelectedCategoryName = () => {
  if (!selectedCategory.value) return ''
  const category = categories.value.find(c => c.id === Number(selectedCategory.value))
  return category ? getLocalizedText(category.name) : ''
}

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
  }, 300)
}

// Filter actions
const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const clearCategory = () => {
  selectedCategory.value = ''
  currentPage.value = 1
}

// Pagination
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    
    if (current > 4) {
      pages.push('...')
    }
    
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (current < total - 3) {
      pages.push('...')
    }
    
    if (total > 1) {
      pages.push(total)
    }
  }
  
  return pages
})

const goToPage = (page: number) => {
  currentPage.value = page
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Watch for filter changes
watch([selectedCategory, sortBy], () => {
  currentPage.value = 1
})

// SEO Meta
useHead({
  title: 'Shop - Moldova Direct',
  meta: [
    {
      name: 'description',
      content: 'Browse authentic Moldovan food and wine products. Premium quality directly from Moldova to Spain.'
    }
  ]
})
</script>