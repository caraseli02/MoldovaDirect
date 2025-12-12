<!--
  Admin Users Management Page

  Requirements addressed:
  - 4.1: Display searchable list of all registered users with basic information
  - 4.2: Implement user search by name, email, and registration date
  - 4.3: Create user detail view with order history and account information
  - 4.4, 4.5, 4.6: User account management actions

  Main admin page for user management with listing, search, and actions.
-->

<template>
  <div>
    <!-- Page Title -->
    <Head>
      <Title>User Management - Admin Dashboard</Title>
      <Meta
        name="description"
        content="Manage users, view profiles, and perform account actions"
      />
    </Head>

    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            User Management
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Manage user accounts, view profiles, and perform administrative actions
          </p>
        </div>

        <!-- Summary Stats -->
        <div
          v-if="summary"
          class="flex items-center gap-4"
        >
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {{ summary.totalUsers }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Total Users
            </div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ summary.activeUsers }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Active
            </div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {{ summary.inactiveUsers }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Inactive
            </div>
          </div>
        </div>
      </div>

      <!-- User Table -->
      <AdminUsersTable
        @user-selected="showUserDetail"
        @user-action="handleUserAction"
        @refetch="fetchUsersData"
      />

      <!-- User Detail Modal -->
      <div
        v-if="selectedUserId"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closeUserDetail"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-medium text-gray-900">
              User Details
            </h2>
            <button
              class="text-gray-400 hover:text-gray-600"
              @click="closeUserDetail"
            >
              <commonIcon
                name="lucide:x"
                class="w-6 h-6"
              />
            </button>
          </div>

          <!-- Modal Content -->
          <div class="overflow-y-auto max-h-[calc(90vh-80px)]">
            <AdminUsersDetailView
              :user-id="selectedUserId"
              @edit="handleUserEdit"
              @action="handleUserAction"
            />
          </div>
        </div>
      </div>

      <!-- Action Loading Overlay -->
      <div
        v-if="actionLoading"
        class="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40"
      >
        <div class="bg-white rounded-lg p-6 shadow-xl">
          <div class="flex items-center gap-3">
            <commonIcon
              name="lucide:refresh-ccw"
              class="w-6 h-6 animate-spin text-blue-600"
            />
            <span class="text-gray-900">Processing action...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminUsersTable from '~/components/admin/Users/Table.vue'
import AdminUsersDetailView from '~/components/admin/Users/DetailView.vue'

// Define page meta for admin layout and authentication
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

// SEO and meta
useHead({
  title: 'User Management - Admin Dashboard',
  meta: [
    { name: 'description', content: 'Manage users, view profiles, and perform account actions' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const toast = useToast()
const supabase = useSupabaseClient()

// Store
const adminUsersStore = useAdminUsersStore()

// State
const selectedUserId = ref<string | null>(null)

// Computed
const summary = computed(() => adminUsersStore.summary)
const actionLoading = computed(() => adminUsersStore.actionLoading)

// Methods
const showUserDetail = async (userId: string) => {
  selectedUserId.value = userId
  await fetchUserDetail(userId)
}

const closeUserDetail = () => {
  selectedUserId.value = null
  adminUsersStore.clearCurrentUser()
}

const handleUserEdit = (_userId: string) => {
  // For now, just show a message - you could implement an edit modal
  toast.info('User editing functionality will be implemented in a future update')
}

const handleUserAction = async (action: string, userId: string, _data?: unknown) => {
  try {
    switch (action) {
      case 'view':
        showUserDetail(userId)
        break

      case 'edit':
        handleUserEdit(userId)
        break

      default:
        // For now, other actions will be implemented in a future update
        console.warn('User action not yet implemented:', action)
        toast.info('This action will be implemented in a future update')
    }
  }
  catch (error: any) {
    console.error('Error performing user action:', error)
    toast.error(error instanceof Error ? error.message : 'Failed to perform action')
  }
}

// Fetch users data with proper authentication
const fetchUsersData = async () => {
  try {
    adminUsersStore.setLoading(true)

    // Get session
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      adminUsersStore.setError('Session expired. Please log in again.')
      await navigateTo('/auth/login')
      return
    }

    // Prepare headers with Bearer token
    const headers = {
      Authorization: `Bearer ${session.access_token}`,
    }

    // Use $fetch with Bearer token headers (same as dashboard)
    const response = await $fetch<{
      success: boolean
      data: {
        users: unknown[]
        pagination: unknown
        summary: unknown
      }
    }>('/api/admin/users', {
      headers,
      query: adminUsersStore.queryParams,
    })

    if (response.success) {
      // Update store with the fetched data using setter methods
      adminUsersStore.setUsers(response.data.users)
      adminUsersStore.setPagination(response.data.pagination)
      adminUsersStore.setSummary(response.data.summary)
    }
  }
  catch (err: any) {
    console.error('[AdminUsers] Error fetching users:', err)
    adminUsersStore.setError(err instanceof Error ? err.message : 'Failed to fetch users')
  }
  finally {
    adminUsersStore.setLoading(false)
  }
}

// Fetch user detail with proper authentication
const fetchUserDetail = async (userId: string) => {
  try {
    adminUsersStore.setUserDetailLoading(true)

    // Get session
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      adminUsersStore.setError('Session expired. Please log in again.')
      await navigateTo('/auth/login')
      return
    }

    // Prepare headers with Bearer token
    const headers = {
      Authorization: `Bearer ${session.access_token}`,
    }

    // Fetch user detail
    const response = await $fetch<{
      success: boolean
      data: unknown
    }>(`/api/admin/users/${userId}`, {
      headers,
    })

    if (response.success) {
      adminUsersStore.setCurrentUser(response.data)
    }
  }
  catch (err: any) {
    console.error('[AdminUsers] Error fetching user detail:', err)
    adminUsersStore.setError(err instanceof Error ? err.message : 'Failed to fetch user detail')
  }
  finally {
    adminUsersStore.setUserDetailLoading(false)
  }
}

// Initialize on mount
onMounted(() => {
  // Fetch initial data with proper Bearer token authentication
  fetchUsersData()
})

// Cleanup on unmount
onUnmounted(() => {
  adminUsersStore.reset()
})
</script>
