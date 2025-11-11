<!--
  Admin Inventory Management Page
  
  Requirements addressed:
  - 2.6: Inventory movement tracking and reporting
  
  Features:
  - Inventory movements display
  - Inventory reports
  - Stock level monitoring
  - Movement history
-->

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Inventory Management
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Monitor stock levels, track movements, and generate inventory reports
        </p>
      </div>
      
      <div class="flex items-center space-x-3">
        <button
          @click="setupInventorySchema"
          :disabled="setupLoading"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          <svg v-if="setupLoading" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          Setup Database
        </button>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          ]"
        >
          <svg class="h-5 w-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
          </svg>
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="mt-6">
      <!-- Inventory Reports Tab -->
      <div v-if="activeTab === 'reports'">
        <AdminInventoryReports />
      </div>

      <!-- Inventory Movements Tab -->
      <div v-if="activeTab === 'movements'">
        <AdminInventoryMovements />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

// Lazy load admin inventory components to reduce main bundle size
const AdminInventoryReports = useAsyncAdminComponent('Inventory/Reports')
const AdminInventoryMovements = useAsyncAdminComponent('Inventory/Movements')

// Reactive state
const activeTab = ref('reports')
const setupLoading = ref(false)

// Tab configuration
const tabs = [
  {
    id: 'reports',
    name: 'Inventory Reports',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  {
    id: 'movements',
    name: 'Movement History',
    icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
  }
]

// Methods
const setupInventorySchema = async () => {
  setupLoading.value = true
  
  try {
    await $fetch('/api/admin/setup-inventory', {
      method: 'POST'
    })
    
    const toast = useToast()
    toast.success('Inventory database schema setup successfully')
  } catch (error) {
    console.error('Failed to setup inventory schema:', error)
    const toast = useToast()
    toast.error('Failed to setup inventory database schema')
  } finally {
    setupLoading.value = false
  }
}

// Head
useHead({
  title: 'Inventory Management - Admin Dashboard'
})
</script>