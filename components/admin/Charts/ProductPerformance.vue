<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Product Performance
      </h3>
      <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <ChartBarIcon class="w-4 h-4" />
        <span>Revenue & Views</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center h-64">
      <div class="text-center">
        <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p class="text-gray-600 dark:text-gray-400">Failed to load chart data</p>
      </div>
    </div>

    <!-- Chart Content -->
    <div v-else class="h-64">
      <div class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div class="text-center">
          <ChartBarIcon class="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Product performance chart will be rendered here</p>
          <p class="text-sm mt-2">Chart library integration needed</p>
        </div>
      </div>
    </div>

    <!-- Chart Legend -->
    <div class="mt-4 flex items-center justify-center gap-6 text-sm">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span class="text-gray-600 dark:text-gray-400">Revenue</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
        <span class="text-gray-600 dark:text-gray-400">Views</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

interface Props {
  data?: any
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
  loading: false,
  error: null
})
</script>