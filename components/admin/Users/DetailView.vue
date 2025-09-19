<!--
  Admin User Detail View Component
  
  Requirements addressed:
  - 4.3: Display detailed user information including order history and account information
  - 4.6: Display login history and account modifications
  
  Features:
  - Comprehensive user profile information
  - Order history with details
  - Account activity and login history
  - User statistics and metrics
  - Quick action buttons
-->

<template>
  <div class="bg-white shadow-sm rounded-lg border border-gray-200">
    <!-- Loading State -->
    <div v-if="loading" class="p-8 text-center">
      <div class="inline-flex items-center gap-2 text-gray-600">
        <commonIcon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
        Loading user details...
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-8 text-center">
      <div class="text-red-600 mb-4">
        <commonIcon name="heroicons:exclamation-triangle" class="w-8 h-8 mx-auto mb-2" />
        {{ error }}
      </div>
      <button
        @click="retry"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Retry
      </button>
    </div>

    <!-- User Detail Content -->
    <div v-else-if="user" class="divide-y divide-gray-200">
      <!-- Header -->
      <div class="px-6 py-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div class="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
              <commonIcon name="heroicons:user" class="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900">
                {{ user.profile?.name || 'No name' }}
              </h2>
              <p class="text-gray-600">{{ user.email }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ user.status }}
                </span>
                <span v-if="!user.email_confirmed_at" class="text-xs text-red-600">
                  Email not verified
                </span>
              </div>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="flex items-center gap-2">
            <button
              @click="editUser"
              class="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <commonIcon name="heroicons:pencil" class="w-4 h-4 mr-1" />
              Edit
            </button>
            <AdminUserActionsDropdown
              :user="user"
              @action="handleUserAction"
            />
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="px-6 py-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">
              {{ user.statistics.totalOrders }}
            </div>
            <div class="text-sm text-blue-800">Total Orders</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-green-600">
              {{ formatCurrency(user.statistics.totalSpent) }}
            </div>
            <div class="text-sm text-green-800">Total Spent</div>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">
              {{ formatCurrency(user.statistics.averageOrderValue) }}
            </div>
            <div class="text-sm text-purple-800">Avg Order Value</div>
          </div>
          <div class="bg-orange-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-orange-600">
              {{ user.statistics.accountAge }}
            </div>
            <div class="text-sm text-orange-800">Days Active</div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="px-6">
        <nav class="flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.name }}
            <span v-if="tab.count !== undefined" class="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {{ tab.count }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="px-6 py-4">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="space-y-6">
          <!-- Basic Information -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <div class="mt-1 text-sm text-gray-900">{{ user.profile?.name || 'Not provided' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <div class="mt-1 text-sm text-gray-900">{{ user.email }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Phone</label>
                <div class="mt-1 text-sm text-gray-900">{{ user.profile?.phone || 'Not provided' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Preferred Language</label>
                <div class="mt-1 text-sm text-gray-900">{{ user.profile?.preferred_language || 'Not set' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Registration Date</label>
                <div class="mt-1 text-sm text-gray-900">{{ formatDate(user.created_at) }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Last Login</label>
                <div class="mt-1 text-sm text-gray-900">
                  {{ user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Addresses -->
          <div v-if="user.addresses.length > 0">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Addresses</h3>
            <div class="space-y-3">
              <div
                v-for="address in user.addresses"
                :key="address.id"
                class="p-4 border border-gray-200 rounded-lg"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <div class="font-medium text-gray-900">
                      {{ address.type === 'billing' ? 'Billing' : 'Shipping' }} Address
                      <span v-if="address.is_default" class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Default
                      </span>
                    </div>
                    <div class="mt-1 text-sm text-gray-600">
                      {{ address.street }}<br>
                      {{ address.city }}, {{ address.postal_code }}<br>
                      {{ address.province ? `${address.province}, ` : '' }}{{ address.country }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Orders Tab -->
        <div v-if="activeTab === 'orders'">
          <div v-if="user.orders.length === 0" class="text-center py-8">
            <commonIcon name="heroicons:shopping-bag" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p class="text-gray-500">This user hasn't placed any orders.</p>
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="order in user.orders"
              :key="order.id"
              class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div class="flex items-start justify-between">
                <div>
                  <div class="font-medium text-gray-900">
                    Order #{{ order.order_number }}
                  </div>
                  <div class="text-sm text-gray-600 mt-1">
                    {{ formatDate(order.created_at) }} • {{ order.items_count }} items
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        getOrderStatusClass(order.status)
                      ]"
                    >
                      {{ order.status }}
                    </span>
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        getPaymentStatusClass(order.payment_status)
                      ]"
                    >
                      {{ order.payment_status }}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-medium text-gray-900">
                    {{ formatCurrency(order.total_eur) }}
                  </div>
                  <button
                    @click="viewOrder(order.id)"
                    class="text-sm text-blue-600 hover:text-blue-800 mt-1"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Tab -->
        <div v-if="activeTab === 'activity'">
          <AdminUserActivityTracker
            :user-id="userId"
            :user-name="user.profile?.name || user.email"
          />
        </div>

        <!-- Permissions Tab -->
        <div v-if="activeTab === 'permissions'">
          <AdminUserPermissionManager
            :user-id="userId"
            :user-name="user.profile?.name || user.email"
            @permission-changed="handlePermissionChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  userId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [userId: string]
  action: [action: string, userId: string, data?: any]
}>()

// Store - safely access with fallback
let adminUsersStore: any = null

try {
  if (process.client) {
    adminUsersStore = useAdminUsersStore()
  }
} catch (error) {
  console.warn('Admin users store not available during SSR/hydration')
}

if (!adminUsersStore) {
  adminUsersStore = {
    // Add fallback properties as needed
    users: ref([]),
    isLoading: ref(false),
    error: ref(null),
  }
}

// State
const activeTab = ref('profile')

// Computed
const { currentUser: user, userDetailLoading: loading, error } = storeToRefs(adminUsersStore)

const tabs = computed(() => [
  { id: 'profile', name: 'Profile' },
  { id: 'orders', name: 'Orders', count: user.value?.orders.length },
  { id: 'activity', name: 'Activity', count: user.value?.activity.length },
  { id: 'permissions', name: 'Permissions' }
])

// Methods
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}



const getOrderStatusClass = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-800'
    case 'shipped':
      return 'bg-blue-100 text-blue-800'
    case 'processing':
      return 'bg-yellow-100 text-yellow-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getPaymentStatusClass = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'failed':
    case 'refunded':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const editUser = () => {
  emit('edit', props.userId)
}

const handleUserAction = (action: string, userId: string, data?: any) => {
  emit('action', action, userId, data)
}

const handlePermissionChange = (userId: string, changes: any) => {
  console.log('Permission changed for user:', userId, changes)
  // Optionally refresh user data or emit event
}

const viewOrder = (orderId: number) => {
  // Navigate to order detail or emit event
  console.log('View order:', orderId)
}

const retry = () => {
  adminUsersStore.fetchUserDetail(props.userId)
}

// Watch for userId changes
watch(() => props.userId, (newUserId) => {
  if (newUserId) {
    adminUsersStore.fetchUserDetail(newUserId)
  }
}, { immediate: true })

// Cleanup when component unmounts
onUnmounted(() => {
  adminUsersStore.clearCurrentUser()
})
</script>