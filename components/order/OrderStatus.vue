<template>
  <div>
    <!-- Status Badge -->
    <div
      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
      :class="statusClasses"
      role="status"
      :aria-label="$t('orders.accessibility.statusBadge', { status: statusLabel })"
    >
      <span
        class="w-2 h-2 rounded-full mr-2"
        :class="dotClasses"
        aria-hidden="true"
      ></span>
      {{ statusLabel }}
    </div>

    <!-- Progress Timeline (optional) -->
    <div
      v-if="showTimeline && timeline"
      class="mt-4"
    >
      <nav
        class="relative"
        :aria-label="$t('orders.accessibility.trackingTimeline')"
      >
        <!-- Timeline Line -->
        <div
          class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"
          aria-hidden="true"
        ></div>

        <!-- Timeline Events -->
        <ol class="space-y-4">
          <li
            v-for="(event, index) in timeline"
            :key="index"
            class="relative flex items-start"
          >
            <!-- Event Dot -->
            <div
              class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2"
              :class="getEventClasses(event)"
              :aria-label="event.completed ? $t('common.completed') : $t('common.upcoming')"
              role="img"
            >
              <svg
                v-if="event.completed"
                class="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <div
                v-else
                class="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"
                aria-hidden="true"
              ></div>
            </div>

            <!-- Event Content -->
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ event.label }}
              </p>
              <p
                v-if="event.timestamp"
                class="text-xs text-gray-500 dark:text-gray-400 mt-1"
              >
                <time :datetime="event.timestamp">{{ formatTimestamp(event.timestamp) }}</time>
              </p>
              <p
                v-if="event.description"
                class="text-xs text-gray-600 dark:text-gray-400 mt-1"
              >
                {{ event.description }}
              </p>
            </div>
          </li>
        </ol>
      </nav>

      <!-- Estimated Delivery -->
      <div
        v-if="estimatedDelivery"
        class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
        role="region"
        :aria-label="$t('orders.estimatedDelivery')"
      >
        <div class="flex items-center">
          <svg
            class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <div>
            <p class="text-xs font-medium text-blue-900 dark:text-blue-100">
              {{ $t('orders.estimatedDelivery') }}
            </p>
            <p class="text-sm font-semibold text-blue-600 dark:text-blue-400">
              <time
                :datetime="estimatedDelivery"
                :aria-label="$t('orders.accessibility.estimatedDelivery', { date: formatDate(estimatedDelivery) })"
              >
                {{ formatDate(estimatedDelivery) }}
              </time>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderStatus as OrderStatusType } from '~/types'

interface TimelineEvent {
  label: string
  timestamp?: string
  description?: string
  completed: boolean
}

interface Props {
  status: OrderStatusType
  timeline?: TimelineEvent[]
  showTimeline?: boolean
  estimatedDelivery?: string
}

const props = withDefaults(defineProps<Props>(), {
  showTimeline: false,
})

const { t, locale } = useI18n()

// Status configuration
const statusConfig = {
  pending: {
    label: 'orders.status.pending',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
    dotClass: 'bg-yellow-500',
  },
  processing: {
    label: 'orders.status.processing',
    bgClass: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
    dotClass: 'bg-blue-500',
  },
  shipped: {
    label: 'orders.status.shipped',
    bgClass: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300',
    dotClass: 'bg-purple-500',
  },
  delivered: {
    label: 'orders.status.delivered',
    bgClass: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    dotClass: 'bg-green-500',
  },
  cancelled: {
    label: 'orders.status.cancelled',
    bgClass: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
    dotClass: 'bg-red-500',
  },
}

// Computed properties
const statusClasses = computed(() => {
  return statusConfig[props.status]?.bgClass || statusConfig.pending.bgClass
})

const dotClasses = computed(() => {
  return statusConfig[props.status]?.dotClass || statusConfig.pending.dotClass
})

const statusLabel = computed(() => {
  const key = statusConfig[props.status]?.label || statusConfig.pending.label
  return t(key)
})

// Helper functions
const getEventClasses = (event: TimelineEvent) => {
  if (event.completed) {
    return 'bg-blue-600 border-blue-600'
  }
  return 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
}

const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return timestamp
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
</script>
