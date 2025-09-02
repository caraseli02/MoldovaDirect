<!--
  Admin User Actions Dropdown Component
  
  Requirements addressed:
  - 4.4: Implement user account suspension and ban functionality
  - 4.5: Create user permission management interface
  
  Features:
  - Dropdown menu with user management actions
  - Conditional actions based on user status
  - Confirmation dialogs for destructive actions
  - Role management interface
-->

<template>
  <div ref="dropdownRef" class="relative">
    <!-- Dropdown Trigger -->
    <button
      @click="toggleDropdown"
      class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded"
      title="User Actions"
    >
      <Icon name="heroicons:ellipsis-vertical" class="w-4 h-4" />
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
      @click.stop
    >
      <div class="py-1">
        <!-- View Details -->
        <button
          @click="handleAction('view')"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <Icon name="heroicons:eye" class="w-4 h-4" />
          View Details
        </button>

        <!-- Edit Profile -->
        <button
          @click="handleAction('edit')"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <Icon name="heroicons:pencil" class="w-4 h-4" />
          Edit Profile
        </button>

        <div class="border-t border-gray-100 dark:border-gray-600"></div>

        <!-- Email Actions -->
        <button
          v-if="!user.email_confirmed_at"
          @click="handleAction('verify_email')"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <Icon name="heroicons:check-badge" class="w-4 h-4" />
          Verify Email
        </button>

        <button
          @click="handleAction('reset_password')"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <Icon name="heroicons:key" class="w-4 h-4" />
          Reset Password
        </button>

        <div class="border-t border-gray-100 dark:border-gray-600"></div>

        <!-- Role Management -->
        <button
          @click="handleAction('update_role')"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <Icon name="heroicons:shield-check" class="w-4 h-4" />
          Manage Role
        </button>

        <div class="border-t border-gray-100 dark:border-gray-600"></div>

        <!-- Account Status Actions -->
        <button
          v-if="!isSuspended"
          @click="handleAction('suspend')"
          class="w-full text-left px-4 py-2 text-sm text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 flex items-center gap-2"
        >
          <Icon name="heroicons:pause" class="w-4 h-4" />
          Suspend Account
        </button>

        <button
          v-if="isSuspended"
          @click="handleAction('unsuspend')"
          class="w-full text-left px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2"
        >
          <Icon name="heroicons:play" class="w-4 h-4" />
          Unsuspend Account
        </button>

        <button
          v-if="!isBanned"
          @click="handleAction('ban')"
          class="w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
        >
          <Icon name="heroicons:no-symbol" class="w-4 h-4" />
          Ban Account
        </button>

        <button
          v-if="isBanned"
          @click="handleAction('unban')"
          class="w-full text-left px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2"
        >
          <Icon name="heroicons:check-circle" class="w-4 h-4" />
          Unban Account
        </button>
      </div>
    </div>

    <!-- Confirmation Modals -->
    <AdminUserActionModal
      v-if="showActionModal"
      :action="selectedAction"
      :user="user"
      @confirm="confirmAction"
      @cancel="cancelAction"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  user: {
    id: string
    email: string
    profile?: {
      name: string
    } | null
    status: string
    // Add user metadata fields for checking suspension/ban status
    user_metadata?: {
      suspended?: boolean
      banned?: boolean
      role?: string
    }
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  action: [action: string, userId: string, data?: any]
}>()

// State
const isOpen = ref(false)
const showActionModal = ref(false)
const selectedAction = ref('')

// Computed
const isSuspended = computed(() => {
  return props.user.user_metadata?.suspended || false
})

const isBanned = computed(() => {
  return props.user.user_metadata?.banned || false
})

// Methods
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const handleAction = (action: string) => {
  isOpen.value = false
  
  // Actions that need confirmation
  const confirmationActions = ['suspend', 'ban', 'reset_password', 'verify_email', 'update_role']
  
  if (confirmationActions.includes(action)) {
    selectedAction.value = action
    showActionModal.value = true
  } else {
    // Direct actions
    emit('action', action, props.user.id)
  }
}

const confirmAction = (data?: any) => {
  emit('action', selectedAction.value, props.user.id, data)
  showActionModal.value = false
  selectedAction.value = ''
}

const cancelAction = () => {
  showActionModal.value = false
  selectedAction.value = ''
}

// Close dropdown when clicking outside
const dropdownRef = ref()

onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
      isOpen.value = false
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>