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
      <Meta name="description" content="Manage users, view profiles, and perform account actions" />
    </Head>

    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Manage user accounts, view profiles, and perform administrative actions
          </p>
        </div>
        
        <!-- Summary Stats -->
        <div v-if="summary" class="flex items-center gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ summary.totalUsers }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ summary.activeUsers }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Active</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ summary.inactiveUsers }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Inactive</div>
          </div>
        </div>
      </div>

      <!-- User Table -->
      <AdminUsersTable
        @user-selected="showUserDetail"
        @user-action="handleUserAction"
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
            <h2 class="text-lg font-medium text-gray-900">User Details</h2>
            <button
              @click="closeUserDetail"
              class="text-gray-400 hover:text-gray-600"
            >
              <commonIcon name="lucide:x" class="w-6 h-6" />
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
            <commonIcon name="lucide:refresh-ccw" class="w-6 h-6 animate-spin text-blue-600" />
            <span class="text-gray-900">Processing action...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define page meta for admin layout and authentication
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

// SEO and meta
useHead({
  title: 'User Management - Admin Dashboard',
  meta: [
    { name: 'description', content: 'Manage users, view profiles, and perform account actions' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

// Store - safely access with fallback
let adminUsersStore: any = null

try {
  adminUsersStore = useAdminUsersStore()
} catch (error) {
  console.warn('Admin users store not available during SSR/hydration')
}

if (!adminUsersStore) {
  adminUsersStore = {
    users: [],
    isLoading: false,
    loadUsers: () => Promise.resolve(),
    initialize: () => Promise.resolve(),
    clearCurrentUser: () => {},
    summary: {},
    actionLoading: false
  }
}

const toast = useToast()

// State
const selectedUserId = ref<string | null>(null)

// Computed
const summary = computed(() => adminUsersStore.summary)
const actionLoading = computed(() => adminUsersStore.actionLoading)

// Methods
const showUserDetail = (userId: string) => {
  selectedUserId.value = userId
}

const closeUserDetail = () => {
  selectedUserId.value = null
  adminUsersStore.clearCurrentUser()
}

const handleUserEdit = (userId: string) => {
  // For now, just show a message - you could implement an edit modal
  toast.info('User editing functionality will be implemented in a future update')
}

const handleUserAction = async (action: string, userId: string, data?: any) => {
  try {
    switch (action) {
      case 'view':
        showUserDetail(userId)
        break
        
      case 'lucide:square-pen':
        handleUserEdit(userId)
        break
        
      case 'suspend':
        await adminUsersStore.suspendUser(userId, data?.reason, data?.duration)
        break
        
      case 'unsuspend':
        await adminUsersStore.unsuspendUser(userId, data?.reason)
        break
        
      case 'ban':
        await adminUsersStore.banUser(userId, data?.reason)
        break
        
      case 'unban':
        await adminUsersStore.unbanUser(userId, data?.reason)
        break
        
      case 'verify_email':
        await adminUsersStore.verifyUserEmail(userId, data?.reason)
        break
        
      case 'reset_password':
        const result = await adminUsersStore.resetUserPassword(userId, data?.reason)
        if (result?.reset_link) {
          // Show the reset link to the admin
          toast.success('Password reset link generated. Check the console for the link.')
          console.log('Password reset link:', result.reset_link)
        }
        break
        
      case 'update_role':
        await adminUsersStore.updateUserRole(userId, data?.role, data?.reason)
        break
        
      default:
        console.warn('Unknown user action:', action)
    }
  } catch (error) {
    console.error('Error performing user action:', error)
    // Error is already handled by the store and toast
  }
}

// Initialize store on mount
onMounted(() => {
  adminUsersStore.initialize()
})

// Cleanup on unmount
onUnmounted(() => {
  adminUsersStore.reset()
})
</script>