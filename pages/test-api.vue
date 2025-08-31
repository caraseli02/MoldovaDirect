<!--
  Test API Endpoints Page
  This page tests the admin dashboard API endpoints
-->

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin API Test</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Stats API Test -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Dashboard Stats API</h2>
          <button 
            @click="testStatsAPI" 
            :disabled="loading"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
          >
            {{ loading ? 'Loading...' : 'Test Stats API' }}
          </button>
          
          <div v-if="statsResult" class="mt-4">
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">Result:</h3>
            <pre class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-3 rounded text-sm overflow-auto">{{ JSON.stringify(statsResult, null, 2) }}</pre>
          </div>
          
          <div v-if="statsError" class="mt-4 text-red-600">
            <h3 class="font-medium mb-2">Error:</h3>
            <p>{{ statsError }}</p>
          </div>
        </div>

        <!-- Activity API Test -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity API</h2>
          <button 
            @click="testActivityAPI" 
            :disabled="loading"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 mb-4"
          >
            {{ loading ? 'Loading...' : 'Test Activity API' }}
          </button>
          
          <div v-if="activityResult" class="mt-4">
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">Result:</h3>
            <pre class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-3 rounded text-sm overflow-auto">{{ JSON.stringify(activityResult, null, 2) }}</pre>
          </div>
          
          <div v-if="activityError" class="mt-4 text-red-600">
            <h3 class="font-medium mb-2">Error:</h3>
            <p>{{ activityError }}</p>
          </div>
        </div>
      </div>

      <!-- Store Test -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Dashboard Store Test</h2>
        <button 
          @click="testStore" 
          :disabled="loading"
          class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 mb-4"
        >
          {{ loading ? 'Loading...' : 'Test Store' }}
        </button>
        
        <div v-if="storeResult" class="mt-4">
          <h3 class="font-medium text-gray-900 dark:text-white mb-2">Store State:</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Statistics:</h4>
              <pre class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-3 rounded text-sm overflow-auto">{{ JSON.stringify(storeResult.stats, null, 2) }}</pre>
            </div>
            <div>
              <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Activity:</h4>
              <pre class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-3 rounded text-sm overflow-auto">{{ JSON.stringify(storeResult.activity, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminDashboardStore } from '~/stores/adminDashboard'

// No authentication required for testing
definePageMeta({
  layout: false
})

// State
const loading = ref(false)
const statsResult = ref(null)
const statsError = ref('')
const activityResult = ref(null)
const activityError = ref('')
const storeResult = ref(null)

// Store
const dashboardStore = useAdminDashboardStore()

// Methods
const testStatsAPI = async () => {
  loading.value = true
  statsError.value = ''
  statsResult.value = null
  
  try {
    const response = await $fetch('/api/admin/dashboard/stats')
    statsResult.value = response
  } catch (error) {
    statsError.value = error.message || 'Failed to fetch stats'
    console.error('Stats API error:', error)
  } finally {
    loading.value = false
  }
}

const testActivityAPI = async () => {
  loading.value = true
  activityError.value = ''
  activityResult.value = null
  
  try {
    const response = await $fetch('/api/admin/dashboard/activity')
    activityResult.value = response
  } catch (error) {
    activityError.value = error.message || 'Failed to fetch activity'
    console.error('Activity API error:', error)
  } finally {
    loading.value = false
  }
}

const testStore = async () => {
  loading.value = true
  
  try {
    await dashboardStore.fetchDashboardData()
    storeResult.value = {
      stats: dashboardStore.stats,
      activity: dashboardStore.recentActivity,
      loading: dashboardStore.isLoading,
      error: dashboardStore.error
    }
  } catch (error) {
    console.error('Store test error:', error)
  } finally {
    loading.value = false
  }
}

// SEO
useHead({
  title: 'Test Admin API - Moldova Direct',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>