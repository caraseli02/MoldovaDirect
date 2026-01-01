<!--
  Admin Dashboard Recent Activity Component

  Requirements addressed:
  - 3.1: Display recent system activities for dashboard overview
  - 6.4: Real-time data refresh functionality

  Shows:
  - Recent user registrations
  - New orders
  - Low stock alerts
  - Product updates
-->

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">
          {{ $t('admin.dashboard.recentActivity.title') }}
        </h3>
        <button
          :disabled="isLoading"
          class="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          @click="refresh"
        >
          <commonIcon
            name="lucide:refresh-ccw"
            :class="`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`"
          />
        </button>
      </div>
    </div>

    <div class="p-6">
      <!-- Loading State -->
      <div
        v-if="isLoading && !recentActivity.length"
        class="space-y-4"
      >
        <div
          v-for="i in 5"
          :key="i"
          class="animate-pulse"
        >
          <div class="flex items-start space-x-3">
            <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity List -->
      <div
        v-else-if="recentActivity.length"
        class="space-y-4"
      >
        <div
          v-for="activity in recentActivity"
          :key="activity.id"
          class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <!-- Activity Icon -->
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center"
              :class="getActivityIconClass(activity.type)"
            >
              <commonIcon
                :name="getActivityIcon(activity.type)"
                class="w-4 h-4"
              />
            </div>
          </div>

          <!-- Activity Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-900">
                {{ activity.title }}
              </p>
              <time class="text-xs text-gray-500">
                {{ formatTime(activity.timestamp) }}
              </time>
            </div>
            <p class="text-sm text-gray-600 mt-1">
              {{ activity.description }}
            </p>

            <!-- Activity Badge -->
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2"
              :class="getActivityBadgeClass(activity.type)"
            >
              {{ getActivityTypeLabel(activity.type) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-8"
      >
        <commonIcon
          name="lucide:clock"
          class="w-12 h-12 text-gray-400 mx-auto mb-4"
        />
        <p class="text-gray-500">
          {{ $t('admin.dashboard.recentActivity.noActivity') }}
        </p>
        <p class="text-sm text-gray-400 mt-1">
          {{ $t('admin.dashboard.recentActivity.activityDescription') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminDashboardStore } from '~/stores/adminDashboard'
import type { ActivityItem } from '~/server/api/admin/dashboard/activity.get'

const { t } = useI18n()

// Store - safely access with fallback for SSR
let dashboardStore: any = null

try {
  if (import.meta.client) {
    dashboardStore = useAdminDashboardStore()
  }
}
catch (_error: any) {
  console.warn('Admin dashboard store not available during SSR/hydration')
}

// Provide SSR-safe fallback
if (!dashboardStore) {
  dashboardStore = {
    recentActivity: [],
    activityLoading: false,
  }
}

// Emit event to parent to trigger refresh
const emit = defineEmits<{
  (e: 'refresh'): void
}>()

// Computed properties - ensure safe access during SSR
const recentActivity = computed(() => {
  if (!dashboardStore || !dashboardStore.recentActivity) {
    return []
  }
  // Handle both ref and direct value
  return unref(dashboardStore.recentActivity) || []
})

const isLoading = computed(() => {
  if (!dashboardStore || !dashboardStore.activityLoading) {
    return false
  }
  return unref(dashboardStore.activityLoading) || false
})

// Methods
const refresh = () => {
  emit('refresh')
}

const getActivityIcon = (type: ActivityItem['type']): string => {
  const icons = {
    user_registration: 'lucide:user-plus',
    new_order: 'lucide:shopping-bag',
    low_stock: 'lucide:alert-triangle',
    product_update: 'lucide:square-pen',
  }
  return icons[type] || 'lucide:info'
}

const getActivityIconClass = (type: ActivityItem['type']): string => {
  const classes = {
    user_registration: 'bg-green-100 text-green-600',
    new_order: 'bg-blue-100 text-blue-600',
    low_stock: 'bg-red-100 text-red-600',
    product_update: 'bg-yellow-100 text-yellow-600',
  }
  return classes[type] || 'bg-gray-100 text-gray-600'
}

const getActivityBadgeClass = (type: ActivityItem['type']): string => {
  const classes = {
    user_registration: 'bg-green-100 text-green-800',
    new_order: 'bg-blue-100 text-blue-800',
    low_stock: 'bg-red-100 text-red-800',
    product_update: 'bg-yellow-100 text-yellow-800',
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getActivityTypeLabel = (type: ActivityItem['type']): string => {
  const labels = {
    user_registration: t('admin.dashboard.recentActivity.types.userRegistration'),
    new_order: t('admin.dashboard.recentActivity.types.newOrder'),
    low_stock: t('admin.dashboard.recentActivity.types.lowStock'),
    product_update: t('admin.dashboard.recentActivity.types.productUpdate'),
  }
  return labels[type] || 'Activity'
}

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return t('admin.dashboard.recentActivity.justNow')
  if (diffMins < 60) return t('admin.dashboard.recentActivity.minutesAgo', { minutes: diffMins })
  if (diffHours < 24) return t('admin.dashboard.recentActivity.hoursAgo', { hours: diffHours })
  if (diffDays < 7) return t('admin.dashboard.recentActivity.daysAgo', { days: diffDays })

  return date.toLocaleDateString()
}

// Data will be fetched by parent component
</script>
