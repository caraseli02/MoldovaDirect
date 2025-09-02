<!--
  Admin User Table Component
  
  Requirements addressed:
  - 4.1: Display paginated list of all registered users with basic information
  - 4.2: Implement user search by name, email, and registration date
  - 4.3: Create user detail view with order history and account information
  
  Features:
  - Paginated user listing with search and filters
  - Sortable columns
  - User status indicators
  - Quick actions for each user
  - Responsive design for mobile devices
-->

<template>
  <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
    <!-- Table Header with Search and Filters -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex-1 max-w-md">
          <div class="relative">
            <Icon 
              name="heroicons:magnifying-glass" 
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" 
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search users by name or email..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              @input="debouncedSearch"
            />
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <!-- Status Filter -->
          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            @change="updateStatusFilter"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <!-- Date Range Filter -->
          <AdminUserDateRangePicker
            v-model:from="dateFrom"
            v-model:to="dateTo"
            @update="updateDateRange"
          />

          <!-- Clear Filters -->
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-8 text-center">
      <div class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
        Loading users...
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
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg"
      >
        Retry
      </button>
    </div>

    <!-- Users Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <button
                @click="updateSort('name')"
                class="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
              >
                User
                <Icon 
                  :name="getSortIcon('name')" 
                  class="w-4 h-4"
                />
              </button>
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <button
                @click="updateSort('email')"
                class="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Email
                <Icon 
                  :name="getSortIcon('email')" 
                  class="w-4 h-4"
                />
              </button>
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Orders
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Spent
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <button
                @click="updateSort('created_at')"
                class="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Registered
                <Icon 
                  :name="getSortIcon('created_at')" 
                  class="w-4 h-4"
                />
              </button>
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <button
                @click="updateSort('last_login')"
                class="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Last Login
                <Icon 
                  :name="getSortIcon('last_login')" 
                  class="w-4 h-4"
                />
              </button>
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="user in usersWithDisplayData"
            :key="user.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <!-- User Info -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <Icon name="heroicons:user" class="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ user.displayName }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    ID: {{ user.id.slice(0, 8) }}...
                  </div>
                </div>
              </div>
            </td>

            <!-- Email -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-gray-100">{{ user.email }}</div>
              <div v-if="user.profile?.phone" class="text-sm text-gray-500 dark:text-gray-400">
                {{ user.profile.phone }}
              </div>
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap">
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
              <div v-if="!user.email_confirmed_at" class="text-xs text-red-600 mt-1">
                Email not verified
              </div>
            </td>

            <!-- Orders -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              <div class="font-medium">{{ user.orderCount || 0 }}</div>
              <div class="text-gray-500 dark:text-gray-400">{{ user.formattedLastOrder }}</div>
            </td>

            <!-- Total Spent -->
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ user.formattedTotalSpent }}
            </td>

            <!-- Registration Date -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ user.formattedRegistration }}
            </td>

            <!-- Last Login -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ user.formattedLastLogin }}
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="viewUser(user.id)"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  title="View Details"
                >
                  <Icon name="heroicons:eye" class="w-4 h-4" />
                </button>
                <button
                  @click="editUser(user.id)"
                  class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Edit User"
                >
                  <Icon name="heroicons:pencil" class="w-4 h-4" />
                </button>
                <AdminUserActionsDropdown
                  :user="user"
                  @action="handleUserAction"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="users.length === 0" class="p-8 text-center">
        <Icon name="heroicons:users" class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No users found</h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ hasActiveFilters ? 'Try adjusting your filters' : 'No users have been registered yet' }}
        </p>
      </div>
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

// Import debounce utility
import { debounce } from '~/types/guards'

// Store
const adminUsersStore = useAdminUsersStore()

// Reactive state
const searchQuery = ref('')
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

// Computed
const { 
  users, 
  usersWithDisplayData, 
  pagination, 
  loading, 
  error, 
  hasActiveFilters 
} = storeToRefs(adminUsersStore)

// Debounced search
const debouncedSearch = debounce(() => {
  adminUsersStore.updateSearch(searchQuery.value)
}, 300)

// Methods
const updateStatusFilter = () => {
  adminUsersStore.updateStatusFilter(statusFilter.value as any)
}

const updateDateRange = () => {
  adminUsersStore.updateDateRange(
    dateFrom.value || undefined,
    dateTo.value || undefined
  )
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  adminUsersStore.clearFilters()
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

const viewUser = (userId: string) => {
  emit('userSelected', userId)
}

const editUser = (userId: string) => {
  emit('userAction', 'edit', userId)
}

const handleUserAction = (action: string, userId: string, data?: any) => {
  emit('userAction', action, userId, data)
}

const retry = () => {
  adminUsersStore.fetchUsers()
}

// Initialize
onMounted(() => {
  if (users.value.length === 0) {
    adminUsersStore.initialize()
  }
})
</script>