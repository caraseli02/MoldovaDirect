<!--
  Admin User Table Component - Refactored
  
  Requirements addressed:
  - 4.1: Display paginated list of all registered users with basic information
  - 4.2: Implement user search by name, email, and registration date
  - 4.3: Create user detail view with order history and account information
  
  Features:
  - Mobile-optimized with responsive sub-components
  - Touch-friendly interactions with haptic feedback
  - Follows mobile patterns from ProductCard.vue
  - Modular architecture with dedicated sub-components
-->

<template>
  <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
    <!-- Table Filters -->
    <AdminUserTableFilters
      v-model:search-query="searchQuery"
      v-model:status-filter="statusFilter"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      @search="handleSearch"
      @status-change="handleStatusChange"
      @date-range-change="handleDateRangeChange"
      @clear-filters="handleClearFilters"
    />

    <!-- Loading State -->
    <div v-if="loading" class="p-8 text-center">
      <div class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
        {{ $t('admin.users.loading') }}
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-8 text-center">
      <div class="text-red-600 dark:text-red-400 mb-4">
        <Icon name="heroicons:exclamation-triangle" class="w-8 h-8 mx-auto mb-2" />
        {{ error }}
      </div>
      <button
        @click="retry"
        @touchstart="isMobile && vibrate('tap')"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg touch-manipulation active:scale-95"
        :class="{ 'min-h-[44px]': isMobile }"
      >
        {{ $t('admin.users.retry') }}
      </button>
    </div>

    <!-- Users Content -->
    <div v-else>
      <!-- Desktop Table -->
      <div v-if="!isMobile" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button
                  @click="updateSort('name')"
                  class="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 touch-manipulation"
                >
                  {{ $t('admin.users.columns.user') }}
                  <Icon :name="getSortIcon('name')" class="w-4 h-4" />
                </button>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button
                  @click="updateSort('email')"
                  class="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 touch-manipulation"
                >
                  {{ $t('admin.users.columns.email') }}
                  <Icon :name="getSortIcon('email')" class="w-4 h-4" />
                </button>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ $t('admin.users.columns.status') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ $t('admin.users.columns.orders') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ $t('admin.users.columns.totalSpent') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button
                  @click="updateSort('created_at')"
                  class="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 touch-manipulation"
                >
                  {{ $t('admin.users.columns.registered') }}
                  <Icon :name="getSortIcon('created_at')" class="w-4 h-4" />
                </button>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button
                  @click="updateSort('last_login')"
                  class="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 touch-manipulation"
                >
                  {{ $t('admin.users.columns.lastLogin') }}
                  <Icon :name="getSortIcon('last_login')" class="w-4 h-4" />
                </button>
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ $t('admin.users.columns.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <AdminUserTableRow
              v-for="user in usersWithDisplayData"
              :key="user.id"
              :user="user"
              :is-selected="selectedUserId === user.id"
              @view="handleViewUser"
              @edit="handleEditUser"
              @action="handleUserAction"
              @select="handleSelectUser"
            />
          </tbody>
        </table>
      </div>

      <!-- Mobile List -->
      <div v-else class="p-4">
        <AdminUserTableRow
          v-for="user in usersWithDisplayData"
          :key="user.id"
          :user="user"
          :is-selected="selectedUserId === user.id"
          @view="handleViewUser"
          @edit="handleEditUser"
          @action="handleUserAction"
          @select="handleSelectUser"
        />
      </div>

      <!-- Empty State -->
      <AdminUserTableEmpty
        v-if="users.length === 0"
        :has-active-filters="hasActiveFilters"
        :total-users="totalUsers"
        :search-query="searchQuery"
        :status-filter="statusFilter"
        @clear-filters="handleClearFilters"
        @refresh="retry"
        @invite-user="handleInviteUser"
      />
    </div>

    <!-- Pagination -->
    <AdminPagination
      v-if="users.length > 0"
      :current-page="pagination.page"
      :total-pages="pagination.totalPages"
      :total-items="pagination.total"
      :items-per-page="pagination.limit"
      @page-change="goToPage"
      @prev-page="prevPage"
      @next-page="nextPage"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true
})

const emit = defineEmits<{
  userSelected: [userId: string]
  userAction: [action: string, userId: string, data?: any]
}>()

// Import VueUse utilities
import { useDebounceFn } from '@vueuse/core'

// Composables
const { isMobile } = useDevice()
const { vibrate } = useHapticFeedback()

// Store
const adminUsersStore = useAdminUsersStore()

// Reactive state
const searchQuery = ref('')
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const selectedUserId = ref<string | null>(null)
const totalUsers = ref(0)

// Computed
const { 
  users, 
  usersWithDisplayData, 
  pagination, 
  loading, 
  error, 
  hasActiveFilters 
} = storeToRefs(adminUsersStore)

// Debounced search function
const debouncedSearch = useDebounceFn((query: string) => {
  adminUsersStore.updateSearch(query)
}, 300)

// Methods
const handleSearch = (query: string) => {
  debouncedSearch(query)
}

const handleStatusChange = (status: string) => {
  adminUsersStore.updateStatusFilter(status as any)
  if (isMobile.value) {
    vibrate('light')
  }
}

const handleDateRangeChange = (from?: string, to?: string) => {
  adminUsersStore.updateDateRange(from, to)
  if (isMobile.value) {
    vibrate('light')
  }
}

const handleClearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  adminUsersStore.clearFilters()
  
  if (isMobile.value) {
    vibrate('success')
  }
}

const updateSort = (column: string) => {
  const currentSort = adminUsersStore.filters.sortBy
  const currentOrder = adminUsersStore.filters.sortOrder
  
  let newOrder: 'asc' | 'desc' = 'asc'
  if (currentSort === column && currentOrder === 'asc') {
    newOrder = 'desc'
  }
  
  adminUsersStore.updateSort(column, newOrder)
}

const getSortIcon = (column: string) => {
  const currentSort = adminUsersStore.filters.sortBy
  const currentOrder = adminUsersStore.filters.sortOrder
  
  if (currentSort !== column) {
    return 'heroicons:chevron-up-down'
  }
  
  return currentOrder === 'asc' 
    ? 'heroicons:chevron-up' 
    : 'heroicons:chevron-down'
}

const goToPage = (page: number) => {
  adminUsersStore.goToPage(page)
}

const nextPage = () => {
  adminUsersStore.nextPage()
}

const prevPage = () => {
  adminUsersStore.prevPage()
}

const handleViewUser = (userId: string) => {
  selectedUserId.value = userId
  emit('userSelected', userId)
  
  if (isMobile.value) {
    vibrate('success')
  }
}

const handleEditUser = (userId: string) => {
  emit('userAction', 'edit', userId)
  
  if (isMobile.value) {
    vibrate('medium')
  }
}

const handleSelectUser = (userId: string) => {
  selectedUserId.value = selectedUserId.value === userId ? null : userId
}

const handleInviteUser = () => {
  emit('userAction', 'invite', '')
  
  if (isMobile.value) {
    vibrate('success')
  }
}

const handleUserAction = (action: string, userId: string, data?: any) => {
  emit('userAction', action, userId, data)
}

const retry = () => {
  adminUsersStore.fetchUsers()
  
  if (isMobile.value) {
    vibrate('medium')
  }
}

// Initialize
onMounted(() => {
  if (users.value.length === 0) {
    adminUsersStore.initialize()
  }
})
</script>