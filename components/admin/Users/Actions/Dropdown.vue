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
  <DropdownMenu>
    <!-- Dropdown Trigger -->
    <DropdownMenuTrigger as-child>
      <UiButton
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        :aria-label="$t('admin.users.actions.menu')"
      >
        <commonIcon name="lucide:more-vertical" class="h-4 w-4" />
      </UiButton>
    </DropdownMenuTrigger>

    <!-- Dropdown Menu Content -->
    <DropdownMenuContent class="w-48">
      <!-- View Details -->
      <DropdownMenuItem @select="handleAction('view')">
        <commonIcon name="lucide:eye" class="w-4 h-4" />
        <span>View Details</span>
      </DropdownMenuItem>

      <!-- Edit Profile -->
      <DropdownMenuItem @select="handleAction('edit')">
        <commonIcon name="lucide:pencil" class="w-4 h-4" />
        <span>Edit Profile</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <!-- Email Actions -->
      <DropdownMenuItem
        v-if="!user.email_confirmed_at"
        @select="handleAction('verify_email')"
      >
        <commonIcon name="lucide:badge-check" class="w-4 h-4" />
        <span>Verify Email</span>
      </DropdownMenuItem>

      <DropdownMenuItem @select="handleAction('reset_password')">
        <commonIcon name="lucide:key" class="w-4 h-4" />
        <span>Reset Password</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <!-- Role Management -->
      <DropdownMenuItem @select="handleAction('update_role')">
        <commonIcon name="lucide:shield-check" class="w-4 h-4" />
        <span>Manage Role</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <!-- Account Status Actions -->
      <DropdownMenuItem
        v-if="!isSuspended"
        @select="handleAction('suspend')"
        class="text-yellow-700 dark:text-yellow-400 focus:bg-yellow-50 dark:focus:bg-yellow-900/20"
      >
        <commonIcon name="lucide:pause" class="w-4 h-4" />
        <span>Suspend Account</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        v-if="isSuspended"
        @select="handleAction('unsuspend')"
        class="text-green-700 dark:text-green-400 focus:bg-green-50 dark:focus:bg-green-900/20"
      >
        <commonIcon name="lucide:play" class="w-4 h-4" />
        <span>Unsuspend Account</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        v-if="!isBanned"
        @select="handleAction('ban')"
        class="text-red-700 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
      >
        <commonIcon name="lucide:ban" class="w-4 h-4" />
        <span>Ban Account</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        v-if="isBanned"
        @select="handleAction('unban')"
        class="text-green-700 dark:text-green-400 focus:bg-green-50 dark:focus:bg-green-900/20"
      >
        <commonIcon name="lucide:check-circle-2" class="w-4 h-4" />
        <span>Unban Account</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <!-- Confirmation Modals -->
  <AdminUsersActionsModal
    v-if="showActionModal"
    :action="selectedAction"
    :user="user"
    @confirm="confirmAction"
    @cancel="cancelAction"
  />
</template>

<script setup lang="ts">
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

interface Props {
  user: {
    id: string
    email: string
    email_confirmed_at?: string | null
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
const handleAction = (action: string) => {
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
</script>
