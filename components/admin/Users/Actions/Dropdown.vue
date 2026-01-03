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
  <div>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <UiButton
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          :aria-label="$t('admin.users.actions.menu')"
        >
          <commonIcon
            name="lucide:more-vertical"
            class="h-4 w-4"
          />
        </UiButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        class="w-48"
      >
        <!-- View Details -->
        <DropdownMenuItem @click="handleAction('view')">
          <commonIcon
            name="lucide:eye"
            class="w-4 h-4"
          />
          <span>{{ $t('admin.users.actions.viewDetails') }}</span>
        </DropdownMenuItem>

        <!-- Edit Profile -->
        <DropdownMenuItem @click="handleAction('edit')">
          <commonIcon
            name="lucide:pencil"
            class="w-4 h-4"
          />
          <span>{{ $t('admin.users.actions.editProfile') }}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <!-- Email Actions -->
        <DropdownMenuItem
          v-if="!user.email_confirmed_at"
          @click="handleAction('verify_email')"
        >
          <commonIcon
            name="lucide:badge-check"
            class="w-4 h-4"
          />
          <span>{{ $t('admin.users.actions.verifyEmail') }}</span>
        </DropdownMenuItem>

        <DropdownMenuItem @click="handleAction('reset_password')">
          <commonIcon
            name="lucide:key"
            class="w-4 h-4"
          />
          <span>{{ $t('admin.users.actions.resetPassword') }}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <!-- Role Management -->
        <DropdownMenuItem @click="handleAction('update_role')">
          <commonIcon
            name="lucide:shield-check"
            class="w-4 h-4"
          />
          <span>{{ $t('admin.users.actions.manageRole') }}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <!-- Account Status Actions -->
        <DropdownMenuItem
          v-if="!isSuspended"
          class="text-yellow-700 dark:text-yellow-400 focus:text-yellow-700 dark:focus:text-yellow-400 focus:bg-yellow-50 dark:focus:bg-yellow-900/20"
          @click="handleAction('suspend')"
        >
          <commonIcon
            name="lucide:pause"
            class="w-4 h-4"
          />
          <span>{{ $t('admin.users.actions.suspendAccount') }}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          v-if="isSuspended"
          class="text-green-700 dark:text-green-400 focus:text-green-700 dark:focus:text-green-400 focus:bg-green-50 dark:focus:bg-green-900/20"
          @click="handleAction('unsuspend')"
        >
          <commonIcon
            name="lucide:play"
            class="w-4 h-4"
          />
          <span>{{ $t('admin.users.actions.unsuspendAccount') }}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          v-if="!isBanned"
          class="text-red-700 dark:text-red-400 focus:text-red-700 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
          @click="handleAction('ban')"
        >
          <commonIcon
            name="lucide:ban"
            class="w-4 h-4"
          />
          <span>{{ $t('admin.users.actions.banAccount') }}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          v-if="isBanned"
          class="text-green-700 dark:text-green-400 focus:text-green-700 dark:focus:text-green-400 focus:bg-green-50 dark:focus:bg-green-900/20"
          @click="handleAction('unban')"
        >
          <commonIcon
            name="lucide:check-circle-2"
            class="w-4 h-4"
          />
          <span>{{ $t('admin.users.actions.unbanAccount') }}</span>
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
  </div>
</template>

<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  action: [action: string, userId: string, data?: Record<string, any>]
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
  }
  else {
    // Direct actions
    emit('action', action, props.user.id)
  }
}

const confirmAction = (data?: Record<string, any>) => {
  emit('action', selectedAction.value, props.user.id, data)
  showActionModal.value = false
  selectedAction.value = ''
}

const cancelAction = () => {
  showActionModal.value = false
  selectedAction.value = ''
}
</script>
