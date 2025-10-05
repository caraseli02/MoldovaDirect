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

import type { Order, OrderStatus } from '~/types'

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

export interface OrderDetailResponse {
  success: boolean
  data: Order & {
    tracking_events?: TrackingEvent[]
  }
}

export interface TrackingResponse {
  success: boolean
  data: TrackingInfo
}

export interface UseOrderDetailReturn {
  // State
  order: Ref<Order | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  tracking: Ref<TrackingInfo | null>
  
  // Actions
  fetchOrder: (id: number) => Promise<void>
  refreshTracking: () => Promise<void>
  reorder: () => Promise<void>
  initiateReturn: () => Promise<void>
  contactSupport: () => void
  
  // Computed
  canReorder: ComputedRef<boolean>
  canReturn: ComputedRef<boolean>
  isDelivered: ComputedRef<boolean>
}

export const useOrderDetail = (): UseOrderDetailReturn => {
  const supabaseClient = useSupabaseClient()
  const router = useRouter()
  const { addItem } = useCart()
  const toast = useToast()
  
  // State
  const order = ref<Order | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const tracking = ref<TrackingInfo | null>(null)
  
  // Cache for order details
  const orderCache = new Map<number, { data: Order, timestamp: number }>()
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
          Authorization: `Bearer ${session.access_token}`
        }
      })
      
      if (response.success) {
        order.value = response.data
        
        // Cache the order
        orderCache.set(id, {
          data: response.data,
          timestamp: Date.now()
        })
        
        // Extract tracking events if available
        if (response.data.tracking_events) {
          tracking.value = {
            tracking_number: response.data.tracking_number,
            carrier: response.data.carrier,
            estimated_delivery: response.data.estimated_delivery,
            current_status: response.data.status,
            events: response.data.tracking_events,
            has_tracking: !!response.data.tracking_number
          }
        }
      } else {
        throw new Error('Failed to fetch order')
      }
    } catch (err: any) {
      console.error('Error fetching order:', err)
      
      if (err.statusCode === 404) {
        error.value = 'Order not found'
      } else {
        error.value = err.message || 'Failed to load order details'
      }
      
      order.value = null
    } finally {
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
          Authorization: `Bearer ${session.access_token}`
        }
      })
      
      if (response.success) {
        tracking.value = response.data
      }
    } catch (err) {
      console.error('Error fetching tracking:', err)
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
      toast.add({
        title: 'Cannot reorder',
        description: 'This order cannot be reordered at this time',
        color: 'red'
      })
      return
    }
    
    try {
      loading.value = true
      
      // Add each item to cart
      for (const item of order.value.items || []) {
        const product = item.productSnapshot
        if (product) {
          await addItem(product, item.quantity)
        }
      }
      
      toast.add({
        title: 'Items added to cart',
        description: `${order.value.items?.length || 0} items from order ${order.value.orderNumber} added to your cart`,
        color: 'green'
      })
      
      // Navigate to cart
      router.push('/cart')
    } catch (err: any) {
      console.error('Error reordering:', err)
      toast.add({
        title: 'Reorder failed',
        description: err.message || 'Failed to add items to cart',
        color: 'red'
      })
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Initiate return process
   */
  const initiateReturn = async () => {
    if (!order.value || !canReturn.value) {
      toast.add({
        title: 'Cannot return',
        description: 'This order is not eligible for return',
        color: 'red'
      })
      return
    }
    
    // Navigate to return page (to be implemented)
    // For now, show a message
    toast.add({
      title: 'Return process',
      description: 'Return functionality will be available soon. Please contact support.',
      color: 'blue'
    })
  }
  
  /**
   * Contact support about this order
   */
  const contactSupport = () => {
    if (!order.value) return
    
    // Navigate to contact page with order context
    router.push({
      path: '/contact',
      query: {
        order: order.value.orderNumber,
        subject: `Order ${order.value.orderNumber}`
      }
    })
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
  
  const isDelivered = computed(() => {
    return order.value?.status === 'delivered'
  })
  
  return {
    // State
    order: readonly(order),
    loading: readonly(loading),
    error: readonly(error),
    tracking: readonly(tracking),
    
    // Actions
    fetchOrder,
    refreshTracking,
    reorder,
    initiateReturn,
    contactSupport,
    
    // Computed
    canReorder,
    canReturn,
    isDelivered
  }
}
