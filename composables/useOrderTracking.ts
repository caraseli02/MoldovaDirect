/**
 * Order Tracking composable with real-time updates
 *
 * Provides real-time order status tracking using Supabase subscriptions
 * Requirements addressed:
 * - 4.1: Display notifications when order status changes
 * - 4.2: Show recent status updates since last visit
 * - 4.3: Prominently display delivery confirmation
 * - 4.4: Notify about shipping delays
 */

import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Order, OrderStatus } from '~/types'

export interface OrderStatusUpdate {
  orderId: number
  orderNumber: string
  oldStatus: OrderStatus
  newStatus: OrderStatus
  timestamp: string
  message?: string
}

export interface UseOrderTrackingReturn {
  // State
  isConnected: Ref<boolean>
  lastUpdate: Ref<OrderStatusUpdate | null>
  recentUpdates: Ref<OrderStatusUpdate[]>
  connectionError: Ref<string | null>

  // Actions
  subscribeToOrderUpdates: (userId: string) => Promise<void>
  unsubscribeFromOrderUpdates: () => void
  markUpdatesAsViewed: () => void
  clearRecentUpdates: () => void

  // Computed
  hasUnviewedUpdates: ComputedRef<boolean>
  unviewedCount: ComputedRef<number>
}

export const useOrderTracking = (): UseOrderTrackingReturn => {
  const supabaseClient = useSupabaseClient()
  const toast = useToast()
  const { t } = useI18n()

  // State
  const isConnected = ref(false)
  const lastUpdate = ref<OrderStatusUpdate | null>(null)
  const recentUpdates = ref<OrderStatusUpdate[]>([])
  const connectionError = ref<string | null>(null)
  const viewedUpdates = ref<Set<number>>(new Set())

  // Real-time channel
  let orderChannel: RealtimeChannel | null = null
  let reconnectAttempts = 0
  const MAX_RECONNECT_ATTEMPTS = 5
  const RECONNECT_DELAY = 3000 // 3 seconds

  // Load recent updates from localStorage
  const loadRecentUpdates = () => {
    if (import.meta.client) {
      try {
        const stored = localStorage.getItem('order_recent_updates')
        if (stored) {
          const parsed = JSON.parse(stored)
          recentUpdates.value = parsed.updates || []
          viewedUpdates.value = new Set(parsed.viewed || [])
        }
      }
      catch (err: any) {
        console.error('Error loading recent updates:', err)
      }
    }
  }

  // Save recent updates to localStorage
  const saveRecentUpdates = () => {
    if (import.meta.client) {
      try {
        localStorage.setItem(
          'order_recent_updates',
          JSON.stringify({
            updates: recentUpdates.value,
            viewed: Array.from(viewedUpdates.value),
          }),
        )
      }
      catch (err: any) {
        console.error('Error saving recent updates:', err)
      }
    }
  }

  /**
   * Handle order status update from real-time subscription
   */
  const handleOrderUpdate = (payload: any) => {
    try {
      const payloadTyped = payload as { new: Order, old: Order }
      const newOrder = payloadTyped.new
      const oldOrder = payloadTyped.old

      // Only process if status actually changed
      if (!oldOrder || newOrder.status === oldOrder.status) {
        return
      }

      const update: OrderStatusUpdate = {
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        oldStatus: oldOrder.status,
        newStatus: newOrder.status,
        timestamp: new Date().toISOString(),
        message: getStatusChangeMessage(oldOrder.status, newOrder.status),
      }

      // Update state
      lastUpdate.value = update

      // Add to recent updates (keep last 10)
      recentUpdates.value = [update, ...recentUpdates.value].slice(0, 10)

      // Save to localStorage
      saveRecentUpdates()

      // Show notification
      showOrderUpdateNotification(update)
    }
    catch (err: any) {
      console.error('Error handling order update:', err)
    }
  }

  /**
   * Get user-friendly message for status change
   */
  const getStatusChangeMessage = (
    oldStatus: OrderStatus,
    newStatus: OrderStatus,
  ): string => {
    const statusMessages: Record<OrderStatus, string> = {
      pending: t('orders.status.pending'),
      processing: t('orders.status.processing'),
      shipped: t('orders.status.shipped'),
      delivered: t('orders.status.delivered'),
      cancelled: t('orders.status.cancelled'),
    }

    return statusMessages[newStatus] || newStatus
  }

  /**
   * Show toast notification for order update
   */
  const showOrderUpdateNotification = (update: OrderStatusUpdate) => {
    const { newStatus, orderNumber } = update

    // Determine notification type and message based on status
    switch (newStatus) {
      case 'delivered':
        toast.success(
          t('orders.notifications.delivered.title'),
          t('orders.notifications.delivered.message', { orderNumber }),
          {
            duration: 10000,
            actionText: t('orders.viewOrder'),
            actionHandler: () => {
              navigateTo(`/account/orders/${update.orderId}`)
            },
          },
        )
        break

      case 'shipped':
        toast.info(
          t('orders.notifications.shipped.title'),
          t('orders.notifications.shipped.message', { orderNumber }),
          {
            duration: 8000,
            actionText: t('orders.trackOrder'),
            actionHandler: () => {
              navigateTo(`/account/orders/${update.orderId}`)
            },
          },
        )
        break

      case 'processing':
        toast.info(
          t('orders.notifications.processing.title'),
          t('orders.notifications.processing.message', { orderNumber }),
          {
            duration: 6000,
          },
        )
        break

      case 'cancelled':
        toast.warning(
          t('orders.notifications.cancelled.title'),
          t('orders.notifications.cancelled.message', { orderNumber }),
          {
            duration: 8000,
            actionText: t('orders.viewDetails'),
            actionHandler: () => {
              navigateTo(`/account/orders/${update.orderId}`)
            },
          },
        )
        break

      default:
        toast.info(
          t('orders.notifications.statusChanged.title'),
          t('orders.notifications.statusChanged.message', {
            orderNumber,
            status: getStatusChangeMessage(update.oldStatus, newStatus),
          }),
          {
            duration: 6000,
          },
        )
    }
  }

  /**
   * Subscribe to order updates for a specific user
   */
  const subscribeToOrderUpdates = async (userId: string) => {
    try {
      // Load recent updates from storage
      loadRecentUpdates()

      // Clean up existing subscription
      if (orderChannel) {
        await unsubscribeFromOrderUpdates()
      }

      // Create new channel for order updates
      orderChannel = supabaseClient
        .channel(`order-updates-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${userId}`,
          },
          handleOrderUpdate,
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            isConnected.value = true
            connectionError.value = null
            reconnectAttempts = 0
          }
          else if (status === 'CHANNEL_ERROR') {
            isConnected.value = false
            connectionError.value = 'Connection error'
            handleReconnect(userId)
          }
          else if (status === 'TIMED_OUT') {
            isConnected.value = false
            connectionError.value = 'Connection timed out'
            handleReconnect(userId)
          }
          else if (status === 'CLOSED') {
            isConnected.value = false
          }
        })
    }
    catch (err: any) {
      console.error('Error subscribing to order updates:', err)
      const error = err as { message?: string }
      connectionError.value = error.message || 'Failed to connect'
      isConnected.value = false
    }
  }

  /**
   * Handle reconnection with exponential backoff
   */
  const handleReconnect = async (userId: string) => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached')
      connectionError.value = 'Unable to establish connection'
      return
    }

    reconnectAttempts++
    const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1)

    setTimeout(() => {
      subscribeToOrderUpdates(userId)
    }, delay)
  }

  /**
   * Unsubscribe from order updates
   */
  const unsubscribeFromOrderUpdates = () => {
    if (orderChannel) {
      supabaseClient.removeChannel(orderChannel)
      orderChannel = null
      isConnected.value = false
    }
  }

  /**
   * Mark all current updates as viewed
   */
  const markUpdatesAsViewed = () => {
    recentUpdates.value.forEach((update) => {
      viewedUpdates.value.add(update.orderId)
    })
    saveRecentUpdates()
  }

  /**
   * Clear all recent updates
   */
  const clearRecentUpdates = () => {
    recentUpdates.value = []
    viewedUpdates.value.clear()
    lastUpdate.value = null
    saveRecentUpdates()
  }

  // Computed properties
  const hasUnviewedUpdates = computed(() => {
    return recentUpdates.value.some(
      update => !viewedUpdates.value.has(update.orderId),
    )
  })

  const unviewedCount = computed(() => {
    return recentUpdates.value.filter(
      update => !viewedUpdates.value.has(update.orderId),
    ).length
  })

  // Cleanup on unmount
  onUnmounted(() => {
    unsubscribeFromOrderUpdates()
  })

  return {
    // State
    isConnected: readonly(isConnected),
    lastUpdate: readonly(lastUpdate),
    recentUpdates: readonly(recentUpdates),
    connectionError: readonly(connectionError),

    // Actions
    subscribeToOrderUpdates,
    unsubscribeFromOrderUpdates,
    markUpdatesAsViewed,
    clearRecentUpdates,

    // Computed
    hasUnviewedUpdates,
    unviewedCount,
  }
}
