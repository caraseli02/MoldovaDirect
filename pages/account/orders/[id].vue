<template>
  <div class="py-12">
    <div class="container max-w-6xl">
      <!-- Back Button -->
      <button
        class="mb-6 inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        @click="router.back()"
      >
        <svg
          class="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {{ $t('common.back', 'Back to Orders') }}
      </button>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="space-y-6"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
          <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="errorValue"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center"
      >
        <svg
          class="w-12 h-12 text-red-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 class="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
          {{ $t('common.error') }}
        </h3>
        <p class="text-red-700 dark:text-red-300 mb-4">
          {{ errorValue }}
        </p>
        <button
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          @click="router.push(localePath('/account/orders'))"
        >
          {{ $t('orders.backToOrders', 'Back to Orders') }}
        </button>
      </div>

      <!-- Order Details -->
      <div
        v-else-if="orderValue"
        class="space-y-6"
      >
        <!-- Header Section -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {{ $t('orders.orderNumber', 'Order') }} {{ orderValue.orderNumber }}
              </h1>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ $t('orders.placedOn', 'Placed on') }} {{ formatDate(orderValue.createdAt) }}
              </p>
            </div>
            <div class="flex-shrink-0">
              <OrderStatus :status="orderValue.status" />
            </div>
          </div>
        </div>

        <!-- Delivery Confirmation (Prominent Display) -->
        <OrderDeliveryConfirmation
          :order="orderValue"
          :can-reorder="canReorder"
          :can-return="canReturn"
          @reorder="handleReorder"
          @return="handleReturn"
          @contact-support="handleSupport"
        />

        <!-- Mobile: Stacked Layout with Swipe Navigation -->
        <div class="md:hidden space-y-6">
          <!-- Section Indicator -->
          <div class="flex justify-center gap-2 py-2">
            <div
              v-for="(section, index) in sections"
              :key="section"
              class="h-1 rounded-full transition-all"
              :class="[
                currentSection === index
                  ? 'w-8 bg-blue-600 dark:bg-blue-400'
                  : 'w-2 bg-gray-300 dark:bg-gray-600',
              ]"
            ></div>
          </div>

          <!-- Order Items -->
          <div id="section-items">
            <OrderItemsSection :order="orderValue" />
          </div>

          <!-- Tracking Information -->
          <div
            v-if="trackingValue?.has_tracking"
            id="section-tracking"
          >
            <OrderTrackingSection
              :tracking="trackingValue"
              :order="orderValue"
              @refresh="refreshTracking"
            />
          </div>

          <!-- Addresses -->
          <div id="section-addresses">
            <OrderAddressesSection :order="orderValue" />
          </div>

          <!-- Payment & Summary -->
          <div id="section-summary">
            <OrderSummarySection :order="orderValue" />
          </div>

          <!-- Actions -->
          <div id="section-actions">
            <OrderActionsSection
              :order="orderValue"
              :can-reorder="canReorder"
              :can-return="canReturn"
              @reorder="handleReorder"
              @return="handleReturn"
              @support="handleSupport"
            />
          </div>

          <!-- Swipe Hint -->
          <div class="text-center py-4">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ $t('orders.swipeHint', 'Swipe left or right to navigate sections') }}
            </p>
          </div>
        </div>

        <!-- Desktop: Two Column Layout -->
        <div class="hidden md:grid md:grid-cols-3 gap-6">
          <!-- Left Column (2/3) -->
          <div class="md:col-span-2 space-y-6">
            <!-- Order Items -->
            <OrderItemsSection :order="orderValue" />

            <!-- Tracking Information -->
            <OrderTrackingSection
              v-if="trackingValue"
              :tracking="trackingValue"
              :order="orderValue"
              @refresh="refreshTracking"
            />

            <!-- Addresses -->
            <OrderAddressesSection :order="orderValue" />
          </div>

          <!-- Right Column (1/3) -->
          <div class="space-y-6">
            <!-- Payment & Summary -->
            <OrderSummarySection :order="orderValue" />

            <!-- Actions -->
            <OrderActionsSection
              :order="orderValue"
              :can-reorder="canReorder"
              :can-return="canReturn"
              @reorder="handleReorder"
              @return="handleReturn"
              @support="handleSupport"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderWithItems } from '~/types'
import type { TrackingInfo } from '~/composables/useOrderDetail'

// Apply authentication middleware
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { t, locale } = useI18n()
const supabaseClient = useSupabaseClient()

// Get order ID from route
const orderId = computed(() => parseInt(route.params.id as string))

// Use order detail composable
const {
  order,
  loading,
  error,
  tracking,
  fetchOrder,
  refreshTracking,
  reorder,
  initiateReturn,
  contactSupport,
  canReorder,
  canReturn,
  isDelivered,
} = useOrderDetail()

// Use order tracking composable for real-time updates
const {
  subscribeToOrderUpdates,
  unsubscribeFromOrderUpdates,
} = useOrderTracking()

// Mobile swipe gestures
const {
  setupSwipeListeners,
  cleanupSwipeListeners,
  setSwipeHandlers,
} = useSwipeGestures()

// Convert readonly refs to computed values for template usage
// OrderWithTracking extends Order and includes items, so it's compatible with OrderWithItems
const orderValue = computed(() => unref(order) as OrderWithItems | null)
const trackingValue = computed(() => unref(tracking))
const errorValue = computed(() => unref(error))

// Mobile section navigation
const currentSection = ref<number>(0)
const sections = computed(() => {
  const allSections = ['items', 'tracking', 'addresses', 'summary', 'actions']
  // Filter out tracking if not available
  const trackingData = unref(tracking)
  if (!trackingData?.has_tracking) {
    return allSections.filter(s => s !== 'tracking')
  }
  return allSections
})

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return ''

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return dateString // Return original string if invalid
  }

  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Action handlers
const handleReorder = async () => {
  await reorder()
}

const handleReturn = async () => {
  await initiateReturn()
}

const handleSupport = () => {
  contactSupport()
}

// Setup mobile swipe navigation
const setupMobileFeatures = () => {
  const container = document.querySelector('.container')
  if (!container) return

  setupSwipeListeners(container as HTMLElement)
  setSwipeHandlers({
    onLeft: () => {
      // Swipe left to go to next section
      const sectionsArr = sections.value
      if (currentSection.value < sectionsArr.length - 1) {
        currentSection.value++
        scrollToSection(currentSection.value)
      }
    },
    onRight: () => {
      // Swipe right to go to previous section
      if (currentSection.value > 0) {
        currentSection.value--
        scrollToSection(currentSection.value)
      }
    },
  })
}

// Scroll to section
const scrollToSection = (index: number) => {
  const sectionsArr = sections.value
  if (!sectionsArr[index]) return

  const sectionId = sectionsArr[index]
  const element = document.getElementById(`section-${sectionId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Cleanup mobile features
const cleanupMobileFeatures = () => {
  cleanupSwipeListeners()
}

// Load order on mount
onMounted(async () => {
  if (orderId.value) {
    await fetchOrder(orderId.value)

    // Setup real-time subscription for order updates
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (user) {
      await subscribeToOrderUpdates(user.id)
    }

    // Setup mobile features after order is loaded
    nextTick(() => {
      setupMobileFeatures()
    })
  }
})

// Cleanup on unmount
onUnmounted(() => {
  cleanupMobileFeatures()
  unsubscribeFromOrderUpdates()
})

// Watch for order updates and refresh if this order is updated
watch(() => order.value, (newOrder, oldOrder) => {
  if (newOrder && oldOrder && newOrder.status !== oldOrder.status) {
    // Refresh tracking info when status changes
    refreshTracking()
  }
}, { deep: true })

// Set page title
useHead({
  title: computed(() => {
    const currentOrder = unref(order)
    return currentOrder
      ? `${t('orders.orderNumber', 'Order')} ${currentOrder.orderNumber}`
      : t('orders.orderDetails', 'Order Details')
  }),
})
</script>
