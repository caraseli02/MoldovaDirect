<!--
  Admin User Activity Tracker Component
  
  Requirements addressed:
  - 4.6: Build user activity tracking display with login history
  
  Features:
  - Display user login history
  - Show account modifications
  - Activity timeline with details
  - IP address and user agent tracking
-->

<template>
  <div class="bg-white shadow-sm rounded-lg border border-gray-200">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-medium text-gray-900">User Activity</h3>
          <p class="text-sm text-gray-500 mt-1">
            Login history and account modifications for {{ userName }}
          </p>
        </div>
        
        <!-- Activity Filter -->
        <div class="flex items-center gap-3">
          <select
            v-model="activityFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            @change="filterActivities"
          >
            <option value="">All Activities</option>
            <option value="login">Logins</option>
            <option value="logout">Logouts</option>
            <option value="password_change">Password Changes</option>
            <option value="profile_update">Profile Updates</option>
            <option value="order_create">Orders</option>
            <option value="cart_add">Cart Actions</option>
          </select>
          
          <select
            v-model="timeFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            @change="filterActivities"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">Last 3 Months</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-8 text-center">
      <div class="inline-flex items-center gap-2 text-gray-600">
        <Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
        Loading activity...
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-8 text-center">
      <div class="text-red-600 mb-4">
        <Icon name="heroicons:exclamation-triangle" class="w-8 h-8 mx-auto mb-2" />
        {{ error }}
      </div>
      <button
        @click="fetchActivity"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Retry
      </button>
    </div>

    <!-- Activity Timeline -->
    <div v-else class="p-6">
      <!-- Summary Stats -->
      <div v-if="activitySummary" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">
            {{ activitySummary.totalLogins }}
          </div>
          <div class="text-sm text-blue-800">Total Logins</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-green-600">
            {{ activitySummary.uniqueIPs }}
          </div>
          <div class="text-sm text-green-800">Unique IPs</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-purple-600">
            {{ activitySummary.activeDays }}
          </div>
          <div class="text-sm text-purple-800">Active Days</div>
        </div>
        <div class="bg-orange-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-orange-600">
            {{ activitySummary.lastSeenDays }}
          </div>
          <div class="text-sm text-orange-800">Days Since Last Seen</div>
        </div>
      </div>

      <!-- Activity List -->
      <div v-if="filteredActivities.length === 0" class="text-center py-8">
        <Icon name="heroicons:clock" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No activity found</h3>
        <p class="text-gray-500">
          {{ activityFilter ? 'No activities match the selected filter' : 'No activity recorded for this user' }}
        </p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="activity in paginatedActivities"
          :key="activity.id"
          class="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <!-- Activity Icon -->
          <div class="flex-shrink-0">
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center',
                getActivityIconClass(activity.event_type)
              ]"
            >
              <Icon :name="getActivityIcon(activity.event_type)" class="w-5 h-5" />
            </div>
          </div>

          <!-- Activity Details -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">
                  {{ formatActivityType(activity.event_type) }}
                </h4>
                <p class="text-sm text-gray-600 mt-1">
                  {{ formatActivityDescription(activity) }}
                </p>
                
                <!-- Technical Details -->
                <div class="mt-2 space-y-1">
                  <div v-if="activity.ip_address" class="text-xs text-gray-500">
                    <Icon name="heroicons:globe-alt" class="w-3 h-3 inline mr-1" />
                    IP: {{ activity.ip_address }}
                  </div>
                  <div v-if="activity.user_agent" class="text-xs text-gray-500 truncate">
                    <Icon name="heroicons:computer-desktop" class="w-3 h-3 inline mr-1" />
                    {{ formatUserAgent(activity.user_agent) }}
                  </div>
                  <div v-if="activity.metadata" class="text-xs text-gray-500">
                    <details class="cursor-pointer">
                      <summary class="hover:text-gray-700">Additional Details</summary>
                      <pre class="mt-1 text-xs bg-gray-100 p-2 rounded whitespace-pre-wrap">{{ JSON.stringify(activity.metadata, null, 2) }}</pre>
                    </details>
                  </div>
                </div>
              </div>
              
              <!-- Timestamp -->
              <div class="text-xs text-gray-500 text-right">
                <div>{{ formatDate(activity.created_at) }}</div>
                <div class="mt-1">{{ formatTime(activity.created_at) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between pt-4 border-t border-gray-200">
          <div class="text-sm text-gray-500">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredActivities.length) }} of {{ filteredActivities.length }} activities
          </div>
          
          <div class="flex items-center gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span class="text-sm text-gray-600">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  userId: string
  userName?: string
}

const props = defineProps<Props>()

interface Activity {
  id: string
  event_type: string
  created_at: string
  ip_address?: string
  user_agent?: string
  metadata?: any
}

interface ActivitySummary {
  totalLogins: number
  uniqueIPs: number
  activeDays: number
  lastSeenDays: number
}

// State
const activities = ref<Activity[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const activityFilter = ref('')
const timeFilter = ref('all')
const currentPage = ref(1)
const pageSize = 10

// Computed
const filteredActivities = computed(() => {
  let filtered = activities.value

  // Filter by activity type
  if (activityFilter.value) {
    filtered = filtered.filter(activity => activity.event_type === activityFilter.value)
  }

  // Filter by time
  if (timeFilter.value !== 'all') {
    const now = new Date()
    const cutoff = new Date()

    switch (timeFilter.value) {
      case 'today':
        cutoff.setHours(0, 0, 0, 0)
        break
      case 'week':
        cutoff.setDate(now.getDate() - 7)
        break
      case 'month':
        cutoff.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        cutoff.setMonth(now.getMonth() - 3)
        break
    }

    filtered = filtered.filter(activity => new Date(activity.created_at) >= cutoff)
  }

  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredActivities.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredActivities.value.length / pageSize)
})

const activitySummary = computed((): ActivitySummary | null => {
  if (activities.value.length === 0) return null

  const logins = activities.value.filter(a => a.event_type === 'login')
  const uniqueIPs = new Set(activities.value.map(a => a.ip_address).filter(Boolean)).size
  const uniqueDays = new Set(activities.value.map(a => new Date(a.created_at).toDateString())).size
  
  const lastActivity = activities.value.length > 0 
    ? new Date(activities.value[0].created_at)
    : new Date()
  const daysSinceLastSeen = Math.floor((new Date().getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

  return {
    totalLogins: logins.length,
    uniqueIPs,
    activeDays: uniqueDays,
    lastSeenDays: daysSinceLastSeen
  }
})

// Methods
const fetchActivity = async () => {
  loading.value = true
  error.value = null

  try {
    // This would typically fetch from an API endpoint
    // For now, we'll simulate some activity data
    const response = await $fetch<{
      success: boolean
      data: Activity[]
    }>(`/api/admin/users/${props.userId}/activity`)

    if (response.success) {
      activities.value = response.data
    } else {
      throw new Error('Failed to fetch activity')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch activity'
    console.error('Error fetching user activity:', err)
  } finally {
    loading.value = false
  }
}

const filterActivities = () => {
  currentPage.value = 1 // Reset to first page when filtering
}

const getActivityIcon = (eventType: string) => {
  switch (eventType) {
    case 'login':
      return 'heroicons:arrow-right-on-rectangle'
    case 'logout':
      return 'heroicons:arrow-left-on-rectangle'
    case 'password_change':
      return 'heroicons:key'
    case 'profile_update':
      return 'heroicons:user'
    case 'order_create':
      return 'heroicons:shopping-bag'
    case 'cart_add':
      return 'heroicons:shopping-cart'
    case 'page_view':
      return 'heroicons:eye'
    default:
      return 'heroicons:information-circle'
  }
}

const getActivityIconClass = (eventType: string) => {
  switch (eventType) {
    case 'login':
      return 'bg-green-100 text-green-600'
    case 'logout':
      return 'bg-red-100 text-red-600'
    case 'password_change':
      return 'bg-yellow-100 text-yellow-600'
    case 'profile_update':
      return 'bg-blue-100 text-blue-600'
    case 'order_create':
      return 'bg-purple-100 text-purple-600'
    case 'cart_add':
      return 'bg-orange-100 text-orange-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const formatActivityType = (eventType: string) => {
  return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatActivityDescription = (activity: Activity) => {
  switch (activity.event_type) {
    case 'login':
      return 'User logged into their account'
    case 'logout':
      return 'User logged out of their account'
    case 'password_change':
      return 'User changed their password'
    case 'profile_update':
      return 'User updated their profile information'
    case 'order_create':
      return 'User placed a new order'
    case 'cart_add':
      return 'User added item to cart'
    case 'page_view':
      return 'User viewed a page'
    default:
      return 'User performed an action'
  }
}

const formatUserAgent = (userAgent: string) => {
  // Simple user agent parsing - you might want to use a library for this
  if (userAgent.includes('Chrome')) return 'Chrome Browser'
  if (userAgent.includes('Firefox')) return 'Firefox Browser'
  if (userAgent.includes('Safari')) return 'Safari Browser'
  if (userAgent.includes('Edge')) return 'Edge Browser'
  if (userAgent.includes('Mobile')) return 'Mobile Device'
  return 'Unknown Browser'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString()
}

// Watch for userId changes
watch(() => props.userId, (newUserId) => {
  if (newUserId) {
    fetchActivity()
  }
}, { immediate: true })

// Reset pagination when filters change
watch([activityFilter, timeFilter], () => {
  currentPage.value = 1
})
</script>