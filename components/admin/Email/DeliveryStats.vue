<!--
  Email Delivery Statistics Component

  Requirements addressed:
  - 4.4: Display email delivery statistics
-->

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <UiCard>
      <UiCardContent class="pt-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Emails
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ stats?.total || 0 }}
            </p>
          </div>
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <svg
              class="w-6 h-6 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <UiCard>
      <UiCardContent class="pt-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Delivered
            </p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {{ stats?.delivered || 0 }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{ stats?.deliveryRate || 0 }}% rate
            </p>
          </div>
          <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <svg
              class="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <UiCard>
      <UiCardContent class="pt-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Failed
            </p>
            <p class="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {{ stats?.failed || 0 }}
            </p>
          </div>
          <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <svg
              class="w-6 h-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <UiCard>
      <UiCardContent class="pt-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Bounced
            </p>
            <p class="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {{ stats?.bounced || 0 }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{ stats?.bounceRate || 0 }}% rate
            </p>
          </div>
          <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <svg
              class="w-6 h-6 text-orange-600 dark:text-orange-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardContent } from '~/components/ui/card'

const stats = ref<Record<string, any> | null | undefined>(null)

async function loadStats() {
  try {
    const { data } = await useFetch('/api/admin/email-logs/stats')
    stats.value = data.value as Record<string, any> | null | undefined
  }
  catch (error: unknown) {
    console.error('Failed to load email stats:', error)
  }
}

onMounted(() => {
  loadStats()

  // Refresh stats every 30 seconds
  setInterval(loadStats, 30000)
})
</script>
