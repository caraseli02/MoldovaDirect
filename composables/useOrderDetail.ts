/**
 * Order Detail composable for individual order management
 *
 * Provides functionality for fetching order details, tracking, and actions
 * Requirements addressed:
 * - 2.1: Navigate to detailed order view
 * - 2.2: Display all purchased items with details
 * - 2.3: Show shipping, billing, payment, and order totals
 * - 6.1: Display available actions (reorder, return, support)
 * - 6.2: Implement reorder functionality
 * - 6.3: Implement return initiation
 */

import type { Order, OrderStatus, OrderItem } from '~/types'

export interface TrackingEvent {
  id: number
  order_id: number
  status: string
  location?: string
  description: string
  timestamp: string
  created_at: string
}

export interface TrackingInfo {
  tracking_number?: string
  carrier?: string
  estimated_delivery?: string
  current_status: OrderStatus
  events: TrackingEvent[]
  has_tracking: boolean
}

export interface OrderWithTracking extends Order {
  tracking_events?: TrackingEvent[]
  items?: OrderItem[]
  carrier?: string
  estimated_delivery?: string
}

export interface OrderDetailResponse {
  success: boolean
  data: OrderWithTracking
}

export interface TrackingResponse {
  success: boolean
  data: TrackingInfo
}

export interface CancelOrderResponse {
  success: boolean
  message: string
  order: {
    id: number
    orderNumber: string
    status: string
    cancelledAt: string
    cancellationReason: string
  }
  emailSent: boolean
}

export interface UseOrderDetailReturn {
  // State
  order: Ref<OrderWithTracking | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  tracking: Ref<TrackingInfo | null>

  // Actions
  fetchOrder: (id: number) => Promise<void>
  refreshTracking: () => Promise<void>
  reorder: () => Promise<void>
  initiateReturn: () => Promise<void>
  cancelOrder: (reason?: string) => Promise<boolean>

  // Computed
  canReorder: ComputedRef<boolean>
  canReturn: ComputedRef<boolean>
  canCancel: ComputedRef<boolean>
  isDelivered: ComputedRef<boolean>
}

export const useOrderDetail = (): UseOrderDetailReturn => {
  const supabaseClient = useSupabaseClient()
  const router = useRouter()
  const { addItem } = useCart()
  const toast = useToast()

  // State
  const order = ref<OrderWithTracking | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const tracking = ref<TrackingInfo | null>(null)

  // Cache for order details
  const orderCache = new Map<number, { data: OrderWithTracking, timestamp: number }>()
  const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

  /**
   * Fetch order details with caching
   */
  const fetchOrder = async (id: number) => {
    try {
      loading.value = true
      error.value = null

      // Check cache first
      const cached = orderCache.get(id)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        order.value = cached.data
        // Still fetch tracking in background
        fetchTrackingInfo(id)
        loading.value = false
        return
      }

      // Get auth token
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) {
        throw new Error('Authentication required')
      }

      // Fetch order from API
      const response = await $fetch<OrderDetailResponse>(`/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (response.success) {
        order.value = response.data

        // Cache the order
        orderCache.set(id, {
          data: response.data,
          timestamp: Date.now(),
        })

        // Extract tracking events if available
        if (response.data.tracking_events) {
          tracking.value = {
            tracking_number: response.data.trackingNumber,
            carrier: response.data.carrier,
            estimated_delivery: response.data.estimated_delivery,
            current_status: response.data.status,
            events: response.data.tracking_events,
            has_tracking: !!response.data.trackingNumber,
          }
        }
      }
      else {
        throw new Error('Failed to fetch order')
      }
    }
    catch (err: unknown) {
      console.error('Error fetching order:', getErrorMessage(err))

      const error_obj = err as { statusCode?: number, message?: string }
      if (error_obj.statusCode === 404) {
        error.value = 'Order not found'
      }
      else {
        error.value = error_obj.message || 'Failed to load order details'
      }

      order.value = null
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Fetch tracking information separately
   */
  const fetchTrackingInfo = async (id: number) => {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) return

      const response = await $fetch<TrackingResponse>(`/api/orders/${id}/tracking`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (response.success) {
        tracking.value = response.data
      }
    }
    catch (err: unknown) {
      console.error('Error fetching tracking:', getErrorMessage(err))
      // Don't set error state for tracking failures
    }
  }

  /**
   * Refresh tracking information
   */
  const refreshTracking = async () => {
    if (!order.value) return

    await fetchTrackingInfo(order.value.id)
  }

  /**
   * Reorder - add all items from order to cart
   */
  const reorder = async () => {
    if (!order.value || !canReorder.value) {
      toast.error(
        'Cannot reorder',
        'This order cannot be reordered at this time',
      )
      return
    }

    try {
      loading.value = true

      // Add each item to cart
      for (const item of order.value.items || []) {
        const product = item.productSnapshot as any
        if (product) {
          await addItem(product, item.quantity)
        }
      }

      toast.success(
        'Items added to cart',
        `${order.value.items?.length || 0} items from order ${order.value.orderNumber} added to your cart`,
      )

      // Navigate to cart
      router.push('/cart')
    }
    catch (err: unknown) {
      console.error('Error reordering:', getErrorMessage(err))
      toast.error(
        'Reorder failed',
        getErrorMessage(err) || 'Failed to add items to cart',
      )
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Initiate return process
   */
  const initiateReturn = async () => {
    if (!order.value || !canReturn.value) {
      toast.error(
        'Cannot return',
        'This order is not eligible for return',
      )
      return
    }

    // Navigate to return page (to be implemented)
    // For now, show a message
    toast.info(
      'Return process',
      'Return functionality will be available soon. Please contact support.',
    )
  }

  /**
   * Cancel order (only for pending orders)
   */
  const cancelOrder = async (reason?: string): Promise<boolean> => {
    if (!order.value || !canCancel.value) {
      toast.error(
        'Cannot cancel',
        'This order cannot be cancelled',
      )
      return false
    }

    try {
      loading.value = true

      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) {
        throw new Error('Authentication required')
      }

      const response = await $fetch<CancelOrderResponse>(`/api/orders/${order.value.id}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { reason },
      })

      if (response.success && order.value) {
        const currentOrder = order.value
        // Update local order state
        order.value = {
          ...currentOrder,
          status: 'cancelled' as OrderStatus,
          cancelledAt: response.order.cancelledAt,
        }

        // Clear cache for this order
        orderCache.delete(currentOrder.id)

        toast.success(
          'Order cancelled',
          `Order ${currentOrder.orderNumber} has been cancelled successfully`,
        )

        return true
      }
      else {
        throw new Error('Failed to cancel order')
      }
    }
    catch (err: unknown) {
      console.error('Error cancelling order:', getErrorMessage(err))
      const errorMessage = (err as { data?: { statusMessage?: string } })?.data?.statusMessage
        || getErrorMessage(err)
        || 'Failed to cancel order'
      toast.error('Cancel failed', errorMessage)
      return false
    }
    finally {
      loading.value = false
    }
  }

  // Computed properties
  const canReorder = computed(() => {
    if (!order.value) return false

    // Can reorder if order is delivered or cancelled (but not pending/processing)
    const reorderableStatuses: OrderStatus[] = ['delivered', 'cancelled']
    return reorderableStatuses.includes(order.value.status)
  })

  const canReturn = computed(() => {
    if (!order.value) return false

    // Can return if order is delivered and within return window (e.g., 30 days)
    if (order.value.status !== 'delivered' || !order.value.deliveredAt) {
      return false
    }

    const deliveredDate = new Date(order.value.deliveredAt)
    const now = new Date()
    const daysSinceDelivery = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24))

    // Allow returns within 30 days
    return daysSinceDelivery <= 30
  })

  const canCancel = computed(() => {
    if (!order.value) return false

    // Can only cancel pending orders
    return order.value.status === 'pending'
  })

  const isDelivered = computed(() => {
    return order.value?.status === 'delivered'
  })

  return {
    // State
    order: readonly(order) as Ref<OrderWithTracking | null>,
    loading: readonly(loading) as Ref<boolean>,
    error: readonly(error) as Ref<string | null>,
    tracking: readonly(tracking) as Ref<TrackingInfo | null>,

    // Actions
    fetchOrder,
    refreshTracking,
    reorder,
    initiateReturn,
    cancelOrder,

    // Computed
    canReorder,
    canReturn,
    canCancel,
    isDelivered,
  }
}
