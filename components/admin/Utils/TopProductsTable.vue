<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ title }}
        </h3>
        <div class="flex items-center gap-2">
          <select
            v-model="sortBy"
            class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="views">Most Viewed</option>
            <option value="revenue">Best Selling</option>
            <option value="conversionRate">Best Converting</option>
            <option value="cartAdditions">Most Added to Cart</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Product
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Views
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Cart Adds
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Purchases
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Revenue
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Conversion
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="(product, index) in sortedProducts"
            :key="product.productId"
            class="hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
                  {{ index + 1 }}
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ product.productName }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    €{{ product.price.toFixed(2) }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-gray-100">
                {{ product.views.toLocaleString() }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-gray-100">
                {{ product.cartAdditions.toLocaleString() }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ product.viewToCartRate.toFixed(1) }}% of views
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-gray-100">
                {{ product.purchases.toLocaleString() }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ product.cartToPurchaseRate.toFixed(1) }}% of carts
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                €{{ product.revenue.toLocaleString() }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ product.conversionRate.toFixed(2) }}%
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div 
                      class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${Math.min(product.conversionRate, 100)}%` }"
                    />
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Empty state -->
    <div
      v-if="!loading && (!products || products.length === 0)"
      class="px-6 py-12 text-center"
    >
      <ShoppingBag class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        No product data available
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        Product analytics will appear here once there's activity data.
      </p>
    </div>
    
    <!-- Loading state -->
    <div
      v-if="loading"
      class="px-6 py-12 text-center"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400">Loading product data...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShoppingBag } from 'lucide-vue-next'
import type { ProductAnalyticsData } from '~/types/analytics'

interface Props {
  data?: ProductAnalyticsData | null
  loading?: boolean
  error?: string | null
  title?: string
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
  loading: false,
  error: null,
  title: 'Top Products',
  limit: 10
})

// Sort options
const sortBy = ref<'views' | 'revenue' | 'conversionRate' | 'cartAdditions'>('revenue')

// Get products based on current data
const products = computed(() => {
  return props.data?.productPerformance || []
})

// Sorted products
const sortedProducts = computed(() => {
  if (!products.value || products.value.length === 0) {
    return []
  }

  const sorted = [...products.value].sort((a, b) => {
    switch (sortBy.value) {
      case 'views':
        return b.views - a.views
      case 'revenue':
        return b.revenue - a.revenue
      case 'conversionRate':
        return b.conversionRate - a.conversionRate
      case 'cartAdditions':
        return b.cartAdditions - a.cartAdditions
      default:
        return b.revenue - a.revenue
    }
  })

  return sorted.slice(0, props.limit)
})
</script>