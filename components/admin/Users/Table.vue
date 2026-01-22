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
    <AdminUtilsUserTableFilters
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
    <div
      v-if="loading"
      class="p-8 text-center"
    >
      <div class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <commonIcon
          name="lucide:refresh-ccw"
          class="w-5 h-5 animate-spin"
        />
        {{ $t('admin.users.loading') }}
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="p-8 text-center"
    >
      <div class="text-red-600 dark:text-red-400 mb-4">
        <commonIcon
          name="lucide:alert-triangle"
          class="w-8 h-8 mx-auto mb-2"
        />
        {{ error }}
      </div>
      <UiButton>
        :class="{ 'min-h-[44px]': isMobile }"
        @click="retry"
        @touchstart="isMobile && vibrate('tap')"
        >
        {{ $t('admin.users.retry') }}
      </UiButton>
    </div>

    <!-- Users Content -->
    <div v-else>
      <!-- Desktop Table -->
      <div
        v-if="!isMobile"
        class="overflow-x-auto"
      >
        <UiTable>
          <UiTableHeader>
            <UiTableRow>
              <UiTableHead class="px-6">
                <UiButton>
                  variant="ghost"
                  class="flex items-center gap-1 h-auto p-0 font-normal"
                  @click="updateSort('name')"
                  >
                  {{ $t('admin.users.columns.user') }}
                  <commonIcon
                    :name="getSortIcon('name')"
                    class="w-4 h-4"
                  />
                </UiButton>
              </UiTableHead>
              <UiTableHead class="px-6">
                <UiButton>
                  variant="ghost"
                  class="flex items-center gap-1 h-auto p-0 font-normal"
                  @click="updateSort('email')"
                  >
                  {{ $t('admin.users.columns.email') }}
                  <commonIcon
                    :name="getSortIcon('email')"
                    class="w-4 h-4"
                  />
                </UiButton>
              </UiTableHead>
              <UiTableHead class="px-6">
                {{ $t('admin.users.columns.status') }}
              </UiTableHead>
              <UiTableHead class="px-6">
                {{ $t('admin.users.columns.orders') }}
              </UiTableHead>
              <UiTableHead class="px-6">
                {{ $t('admin.users.columns.totalSpent') }}
              </UiTableHead>
              <UiTableHead class="px-6">
                <UiButton>
                  variant="ghost"
                  class="flex items-center gap-1 h-auto p-0 font-normal"
                  @click="updateSort('created_at')"
                  >
                  {{ $t('admin.users.columns.registered') }}
                  <commonIcon
                    :name="getSortIcon('created_at')"
                    class="w-4 h-4"
                  />
                </UiButton>
              </UiTableHead>
              <UiTableHead class="px-6">
                <UiButton>
                  variant="ghost"
                  class="flex items-center gap-1 h-auto p-0 font-normal"
                  @click="updateSort('last_login')"
                  >
                  {{ $t('admin.users.columns.lastLogin') }}
                  <commonIcon
                    :name="getSortIcon('last_login')"
                    class="w-4 h-4"
                  />
                </UiButton>
              </UiTableHead>
              <UiTableHead class="px-6 text-right">
                {{ $t('admin.users.columns.actions') }}
              </UiTableHead>
            </UiTableRow>
          </UiTableHeader>
          <UiTableBody>
            <AdminUtilsUserTableRow
              v-for="user in usersWithDisplayData"
              :key="user.id"
              :user="user"
              :is-selected="selectedUserId === user.id"
              @view="handleViewUser"
              @edit="handleEditUser"
              @action="handleUserAction"
              @select="handleSelectUser"
            />
          </UiTableBody>
        </UiTable>
      </div>

      <!-- Mobile List -->
      <div
        v-else
        class="p-4"
      >
        <AdminUtilsUserTableRow
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
      <AdminUtilsUserTableEmpty
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
    <AdminUtilsPagination
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
// Import VueUse utilities
import { useDebounceFn } from '@vueuse/core'

interface Props {
  showActions?: boolean
}

const _props = withDefaults(defineProps<Props>(), {
  showActions: true,
})

const emit = defineEmits<{
  userSelected: [userId: string]
  userAction: [action: string, userId: string, data?: Record<string, any>]
  refetch: []
}>()

// Composables
const { isMobile } = useDevice()
const { vibrate } = useHapticFeedback()

// Store - safely access with fallback
let adminUsersStore: Record<string, any> = {}

try {
  if (import.meta.client) {
    adminUsersStore = useAdminUsersStore()
  }
}
catch (_error: any) {
  console.warn('Admin users store not available during SSR/hydration')
}

if (!adminUsersStore) {
  adminUsersStore = {
    users: ref([]),
    isLoading: ref(false),
    error: ref(null),
    loadUsers: () => Promise.resolve(),
    deleteUser: () => Promise.resolve(),
    filters: {
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
    updateSort: () => {},
    updateSearch: () => {},
    updateStatusFilter: () => {},
    updateDateRange: () => {},
    initialize: () => Promise.resolve(),
  }
}

// Reactive state
const searchQuery = ref('')
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const selectedUserId = ref<string | null>(null)
const totalUsers = ref(0)

// Computed - with type safety for storeToRefs
const storeRefs = storeToRefs(adminUsersStore as any)
const users = computed(() => (storeRefs as any).users?.value ?? [])
const usersWithDisplayData = computed(() => (storeRefs as any).usersWithDisplayData?.value ?? [])
const pagination = computed(() => (storeRefs as any).pagination?.value ?? { page: 1, totalPages: 1, total: 0, limit: 10 })
const loading = computed(() => (storeRefs as any).loading?.value ?? false)
const error = computed(() => (storeRefs as any).error?.value ?? null)
const hasActiveFilters = computed(() => (storeRefs as Record<string, any>).hasActiveFilters?.value ?? false)

// Debounced search function
const debouncedSearch = useDebounceFn((query: string) => {
  adminUsersStore.updateSearch(query)
  emit('refetch')
}, 300)

// Methods
const handleSearch = (query: string) => {
  debouncedSearch(query)
}

const handleStatusChange = (status: string) => {
  adminUsersStore.updateStatusFilter(status as unknown)
  emit('refetch')

  if (isMobile.value) {
    vibrate('light')
  }
}

const handleDateRangeChange = (from?: string, to?: string) => {
  adminUsersStore.updateDateRange(from, to)
  emit('refetch')

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
  emit('refetch')

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
  emit('refetch')
}

const getSortIcon = (column: string) => {
  const currentSort = adminUsersStore.filters.sortBy
  const currentOrder = adminUsersStore.filters.sortOrder

  if (currentSort !== column) {
    return 'lucide:chevrons-up-down'
  }

  return currentOrder === 'asc'
    ? 'lucide:chevron-up'
    : 'lucide:chevron-down'
}

const goToPage = (page: number) => {
  adminUsersStore.goToPage(page)
  emit('refetch')
}

const nextPage = () => {
  adminUsersStore.nextPage()
  emit('refetch')
}

const prevPage = () => {
  adminUsersStore.prevPage()
  emit('refetch')
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

const handleUserAction = (action: string, userId: string, data?: Record<string, any>) => {
  emit('userAction', action, userId, data)
}

const retry = () => {
  emit('refetch')

  if (isMobile.value) {
    vibrate('medium')
  }
}

// Initialize
// NOTE: Initialization now happens in parent page component with proper Bearer token auth
// onMounted(() => {
//   if (users.value.length === 0) {
//     adminUsersStore.initialize()
//   }
// })
</script>
