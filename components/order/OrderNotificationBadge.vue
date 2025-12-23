<template>
  <div
    v-if="hasUnviewedUpdates"
    class="relative"
  >
    <!-- Badge trigger button -->
    <Button
      variant="ghost"
      size="icon"
      class="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      :aria-label="$t('orders.notifications.title')"
      @click="toggleDropdown"
    >
      <svg
        class="w-6 h-6 text-gray-700 dark:text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      <!-- Notification count badge -->
      <span
        v-if="unviewedCount > 0"
        class="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
      >
        {{ unviewedCount > 9 ? '9+' : unviewedCount }}
      </span>
    </Button>

    <!-- Dropdown panel -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
            {{ $t('orders.notifications.title') }}
          </h3>
          <Button
            v-if="recentUpdates.length > 0"
            variant="link"
            size="sm"
            class="text-xs text-blue-600 dark:text-blue-400 hover:underline p-0 h-auto"
            @click="handleClearAll"
          >
            {{ $t('orders.notifications.clearAll') }}
          </Button>
        </div>

        <!-- Updates list -->
        <div class="max-h-96 overflow-y-auto">
          <div
            v-if="recentUpdates.length === 0"
            class="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
          >
            <svg
              class="w-12 h-12 mx-auto mb-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p class="text-sm">
              {{ $t('orders.notifications.noUpdates') }}
            </p>
          </div>

          <div
            v-for="update in recentUpdates"
            :key="`${update.orderId}-${update.timestamp}`"
            class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
            :class="{ 'bg-blue-50 dark:bg-blue-900/10': !isUpdateViewed(update) }"
            @click="handleUpdateClick(update)"
          >
            <div class="flex items-start space-x-3">
              <!-- Status icon -->
              <div
                class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                :class="getStatusIconClass(update.newStatus)"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    v-if="update.newStatus === 'delivered'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                  <path
                    v-else-if="update.newStatus === 'shipped'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                  <path
                    v-else-if="update.newStatus === 'cancelled'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                  <path
                    v-else
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <!-- Update content -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ getStatusTitle(update.newStatus) }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ $t('orders.orderNumber') }}: {{ update.orderNumber }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {{ formatTimestamp(update.timestamp) }}
                </p>
              </div>

              <!-- Unviewed indicator -->
              <div
                v-if="!isUpdateViewed(update)"
                class="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"
              ></div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          v-if="recentUpdates.length > 0"
          class="px-4 py-3 border-t border-gray-200 dark:border-gray-700"
        >
          <Button
            variant="link"
            class="w-full text-sm text-center text-blue-600 dark:text-blue-400 hover:underline p-0 h-auto"
            @click="handleViewAllOrders"
          >
            {{ $t('orders.notifications.viewAllOrders') }}
          </Button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import type { OrderStatusUpdate } from '~/composables/useOrderTracking'
import type { OrderStatus } from '~/types'

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

// Use order tracking composable
const {
  hasUnviewedUpdates,
  unviewedCount,
  recentUpdates,
  markUpdatesAsViewed,
  clearRecentUpdates,
} = useOrderTracking()

// Local state
const isOpen = ref(false)
const viewedUpdates = ref<Set<number>>(new Set())
const dropdownRef = ref<HTMLElement>()

// Load viewed updates from localStorage
onMounted(() => {
  if (import.meta.client) {
    try {
      const stored = localStorage.getItem('order_recent_updates')
      if (stored) {
        const parsed = JSON.parse(stored)
        viewedUpdates.value = new Set(parsed.viewed || [])
      }
    }
    catch (err: any) {
      console.error('Error loading viewed updates:', err)
    }
  }
})

// Methods
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    markUpdatesAsViewed()
  }
}

const closeDropdown = () => {
  isOpen.value = false
}

const handleUpdateClick = (update: OrderStatusUpdate) => {
  closeDropdown()
  router.push(localePath(`/account/orders/${update.orderId}`))
}

const handleClearAll = () => {
  clearRecentUpdates()
  closeDropdown()
}

const handleViewAllOrders = () => {
  closeDropdown()
  router.push(localePath('/account/orders'))
}

const isUpdateViewed = (update: OrderStatusUpdate): boolean => {
  return viewedUpdates.value.has(update.orderId)
}

const getStatusTitle = (status: OrderStatus): string => {
  const titles: Record<OrderStatus, string> = {
    pending: t('orders.notifications.processing.title'),
    processing: t('orders.notifications.processing.title'),
    shipped: t('orders.notifications.shipped.title'),
    delivered: t('orders.notifications.delivered.title'),
    cancelled: t('orders.notifications.cancelled.title'),
  }
  return titles[status] || t('orders.notifications.statusChanged.title')
}

const getStatusIconClass = (status: OrderStatus): string => {
  const classes: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    processing: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    shipped: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    delivered: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    cancelled: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  }
  return classes[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
}

const formatTimestamp = (timestamp: string): string => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return timestamp
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return t('orders.notifications.justNow')
  }
  else if (diffMins < 60) {
    return t('orders.notifications.minutesAgo', { count: diffMins })
  }
  else if (diffHours < 24) {
    return t('orders.notifications.hoursAgo', { count: diffHours })
  }
  else if (diffDays < 7) {
    return t('orders.notifications.daysAgo', { count: diffDays })
  }
  else {
    return date.toLocaleDateString()
  }
}

// Close dropdown when clicking outside
onClickOutside(dropdownRef, () => {
  if (isOpen.value) {
    closeDropdown()
  }
})
</script>
