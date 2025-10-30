<template>
  <Card class="rounded-2xl">
    <CardHeader>
      <CardTitle>Order Timeline</CardTitle>
      <CardDescription>
        Complete history of status changes and key events
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div v-if="timelineEvents.length === 0" class="text-center py-8">
        <commonIcon name="lucide:clock" class="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p class="text-sm text-gray-500 dark:text-gray-400">
          No timeline events yet
        </p>
      </div>

      <div v-else class="relative">
        <!-- Timeline line -->
        <div
          class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"
          aria-hidden="true"
        />

        <!-- Timeline events -->
        <div class="space-y-6">
          <div
            v-for="(event, index) in timelineEvents"
            :key="event.id"
            class="relative flex items-start space-x-4"
          >
            <!-- Event icon -->
            <div class="relative z-10 flex-shrink-0">
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-900',
                  getEventColorClass(event, index)
                ]"
              >
                <commonIcon
                  :name="getEventIcon(event)"
                  class="h-4 w-4"
                />
              </div>
            </div>

            <!-- Event content -->
            <div class="flex-1 min-w-0 pt-0.5">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ event.title }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {{ formatTimestamp(event.timestamp) }}
                  </p>
                </div>
                <AdminOrdersStatusBadge
                  v-if="event.type === 'status_change'"
                  :status="event.toStatus"
                  :show-icon="false"
                  class="ml-2"
                />
              </div>

              <!-- Event details -->
              <div v-if="event.description" class="mt-2">
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  {{ event.description }}
                </p>
              </div>

              <!-- Event metadata -->
              <div v-if="event.metadata" class="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span v-if="event.metadata.changedBy" class="flex items-center">
                  <commonIcon name="lucide:user" class="h-3 w-3 mr-1" />
                  {{ event.metadata.changedBy }}
                </span>
                <span v-if="event.metadata.automated" class="flex items-center">
                  <commonIcon name="lucide:bot" class="h-3 w-3 mr-1" />
                  Automated
                </span>
                <span v-if="event.metadata.trackingNumber" class="flex items-center font-mono">
                  <commonIcon name="lucide:package" class="h-3 w-3 mr-1" />
                  {{ event.metadata.trackingNumber }}
                </span>
              </div>

              <!-- Notes -->
              <div v-if="event.notes" class="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Note:
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ event.notes }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import type { OrderStatusHistory, OrderNote } from '~/types/database'

interface TimelineEvent {
  id: string
  type: 'status_change' | 'note' | 'order_created'
  title: string
  description?: string
  timestamp: string
  toStatus?: string
  notes?: string
  metadata?: {
    changedBy?: string
    automated?: boolean
    trackingNumber?: string
    fromStatus?: string
  }
}

interface Props {
  statusHistory?: OrderStatusHistory[]
  orderNotes?: OrderNote[]
  orderCreatedAt: string
  orderStatus: string
}

const props = withDefaults(defineProps<Props>(), {
  statusHistory: () => [],
  orderNotes: () => []
})

// Compute timeline events from status history and notes
const timelineEvents = computed<TimelineEvent[]>(() => {
  const events: TimelineEvent[] = []

  // Add order created event
  events.push({
    id: 'order-created',
    type: 'order_created',
    title: 'Order Created',
    description: 'Order was placed and is awaiting processing',
    timestamp: props.orderCreatedAt,
    toStatus: 'pending'
  })

  // Add status change events
  if (props.statusHistory) {
    props.statusHistory.forEach((history) => {
      const fromLabel = history.fromStatus ? getStatusLabel(history.fromStatus) : 'New'
      const toLabel = getStatusLabel(history.toStatus)
      
      events.push({
        id: `status-${history.id}`,
        type: 'status_change',
        title: `Status changed from ${fromLabel} to ${toLabel}`,
        description: getStatusChangeDescription(history.toStatus),
        timestamp: history.changedAt,
        toStatus: history.toStatus,
        notes: history.notes || undefined,
        metadata: {
          changedBy: history.changedBy ? 'Admin' : undefined,
          automated: history.automated,
          fromStatus: history.fromStatus || undefined
        }
      })
    })
  }

  // Add note events (only customer-facing notes)
  if (props.orderNotes) {
    props.orderNotes
      .filter(note => note.noteType === 'customer')
      .forEach((note) => {
        events.push({
          id: `note-${note.id}`,
          type: 'note',
          title: 'Note Added',
          description: note.content,
          timestamp: note.createdAt,
          metadata: {
            changedBy: note.createdBy ? 'Admin' : undefined
          }
        })
      })
  }

  // Sort by timestamp (most recent first)
  return events.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })
})

// Utility functions
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  }
  return labels[status] || status
}

const getStatusChangeDescription = (status: string): string => {
  const descriptions: Record<string, string> = {
    pending: 'Order is awaiting processing',
    processing: 'Order is being prepared for shipment',
    shipped: 'Order has been shipped and is on its way',
    delivered: 'Order has been successfully delivered',
    cancelled: 'Order has been cancelled'
  }
  return descriptions[status] || ''
}

const getEventIcon = (event: TimelineEvent): string => {
  if (event.type === 'order_created') {
    return 'lucide:shopping-cart'
  }
  
  if (event.type === 'note') {
    return 'lucide:message-square'
  }

  // Status change icons
  const icons: Record<string, string> = {
    pending: 'lucide:clock',
    processing: 'lucide:package',
    shipped: 'lucide:truck',
    delivered: 'lucide:check-circle',
    cancelled: 'lucide:x-circle'
  }
  return icons[event.toStatus || ''] || 'lucide:circle'
}

const getEventColorClass = (event: TimelineEvent, index: number): string => {
  // Most recent event gets highlighted
  if (index === 0) {
    if (event.toStatus === 'cancelled') {
      return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
    }
    if (event.toStatus === 'delivered') {
      return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
    }
    return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
  }

  // Older events get muted colors
  return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  // Relative time for recent events
  if (diffMins < 1) {
    return 'Just now'
  }
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
  }
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  }
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  }

  // Absolute time for older events
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
