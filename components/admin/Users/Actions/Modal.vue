<!--
  Admin User Action Modal Component

  Requirements addressed:
  - 4.4: User account suspension and ban functionality with confirmation
  - 4.5: User permission management interface
  - 5.5: Audit logging with reason tracking

  Features:
  - Confirmation dialogs for user actions
  - Reason input for audit trail
  - Role selection interface
  - Duration selection for temporary suspensions
-->

<template>
  <Dialog
    :open="true"
    @update:open="handleClose"
  >
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ getActionTitle() }}</DialogTitle>
        <DialogDescription>{{ getActionDescription() }}</DialogDescription>
      </DialogHeader>

      <!-- Content -->
      <div class="space-y-4">
        <!-- User Info -->
        <div class="p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
          <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ user.profile?.name || 'No name' }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ user.email }}
          </div>
        </div>

        <!-- Action-specific forms -->
        <div class="space-y-4">
          <!-- Suspend Action -->
          <div v-if="action === 'suspend'">
            <UiLabel class="mb-2">
              Suspension Duration
            </UiLabel>
            <UiSelect v-model="formData.duration">
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">
                  Indefinite
                </SelectItem>
                <SelectItem value="1">
                  1 day
                </SelectItem>
                <SelectItem value="3">
                  3 days
                </SelectItem>
                <SelectItem value="7">
                  1 week
                </SelectItem>
                <SelectItem value="30">
                  1 month
                </SelectItem>
              </SelectContent>
            </UiSelect>
          </div>

          <!-- Role Update Action -->
          <div v-if="action === 'update_role'">
            <UiLabel class="mb-2">
              New Role
            </UiLabel>
            <UiSelect v-model="formData.role">
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">
                  User
                </SelectItem>
                <SelectItem value="moderator">
                  Moderator
                </SelectItem>
                <SelectItem value="admin">
                  Admin
                </SelectItem>
              </SelectContent>
            </UiSelect>
          </div>

          <!-- Reason (for all actions) -->
          <div>
            <UiLabel class="mb-2">
              Reason {{ isReasonRequired() ? '(Required)' : '(Optional)' }}
            </UiLabel>
            <UiTextarea
              v-model="formData.reason"
              :required="isReasonRequired()"
              rows="3"
              :placeholder="getReasonPlaceholder()"
            />
          </div>

          <!-- Additional Notes -->
          <div v-if="showNotesField()">
            <UiLabel class="mb-2">
              Additional Notes (Optional)
            </UiLabel>
            <UiTextarea
              v-model="formData.notes"
              rows="2"
              placeholder="Any additional information..."
            />
          </div>

          <!-- Warning Messages -->
          <UiAlert v-if="getWarningMessage()">
            <commonIcon
              name="lucide:alert-triangle"
              class="h-4 w-4"
            />
            <AlertDescription>{{ getWarningMessage() }}</AlertDescription>
          </UiAlert>

          <!-- Danger Messages -->
          <UiAlert
            v-if="getDangerMessage()"
            variant="destructive"
          >
            <commonIcon
              name="lucide:alert-triangle"
              class="h-4 w-4"
            />
            <AlertDescription>{{ getDangerMessage() }}</AlertDescription>
          </UiAlert>
        </div>
      </div>

      <DialogFooter>
        <UiButton
          variant="outline"
          @click="$emit('cancel')"
        >
          Cancel
        </UiButton>
        <UiButton
          :disabled="!isFormValid()"
          :variant="getActionButtonVariant()"
          @click="confirm"
        >
          {{ getActionButtonText() }}
        </UiButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label as UiLabel } from '@/components/ui/label'
import { Textarea as UiTextarea } from '@/components/ui/textarea'
import { Alert as UiAlert, AlertDescription } from '@/components/ui/alert'

interface Props {
  action: string
  user: {
    id: string
    email: string
    profile?: {
      name: string
    } | null
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  confirm: [data?: Record<string, any>]
  cancel: []
}>()

// Form data
const formData = reactive({
  reason: '',
  duration: undefined as string | undefined,
  role: '',
  notes: '',
})

// Methods
const handleClose = (open: boolean) => {
  if (!open) {
    emit('cancel')
  }
}

const getActionTitle = () => {
  switch (props.action) {
    case 'suspend':
      return 'Suspend User Account'
    case 'ban':
      return 'Ban User Account'
    case 'verify_email':
      return 'Verify User Email'
    case 'reset_password':
      return 'Reset User Password'
    case 'update_role':
      return 'Update User Role'
    default:
      return 'Confirm Action'
  }
}

const getActionDescription = () => {
  switch (props.action) {
    case 'suspend':
      return 'Temporarily restrict user access to their account.'
    case 'ban':
      return 'Permanently disable user access to their account.'
    case 'verify_email':
      return 'Mark the user\'s email address as verified.'
    case 'reset_password':
      return 'Generate a password reset link for the user.'
    case 'update_role':
      return 'Change the user\'s role and permissions.'
    default:
      return 'Please confirm this action.'
  }
}

const getReasonPlaceholder = () => {
  switch (props.action) {
    case 'suspend':
      return 'Why is this account being suspended?'
    case 'ban':
      return 'Why is this account being banned?'
    case 'verify_email':
      return 'Why is the email being verified manually?'
    case 'reset_password':
      return 'Why is the password being reset?'
    case 'update_role':
      return 'Why is the role being changed?'
    default:
      return 'Reason for this action...'
  }
}

const isReasonRequired = () => {
  return ['suspend', 'ban'].includes(props.action)
}

const showNotesField = () => {
  return ['suspend', 'ban', 'update_role'].includes(props.action)
}

const getWarningMessage = () => {
  switch (props.action) {
    case 'suspend':
      return 'The user will not be able to log in until the suspension is lifted.'
    case 'reset_password':
      return 'The user will receive a password reset email and their current session will be invalidated.'
    case 'update_role':
      return 'Changing the user role will affect their permissions immediately.'
    default:
      return null
  }
}

const getDangerMessage = () => {
  switch (props.action) {
    case 'ban':
      return 'This action will permanently disable the user account. This cannot be easily undone.'
    default:
      return null
  }
}

const getActionButtonVariant = () => {
  switch (props.action) {
    case 'ban':
      return 'destructive'
    case 'suspend':
      return 'destructive'
    default:
      return 'default'
  }
}

const getActionButtonText = () => {
  switch (props.action) {
    case 'suspend':
      return 'Suspend Account'
    case 'ban':
      return 'Ban Account'
    case 'verify_email':
      return 'Verify Email'
    case 'reset_password':
      return 'Reset Password'
    case 'update_role':
      return 'Update Role'
    default:
      return 'Confirm'
  }
}

const isFormValid = () => {
  if (isReasonRequired() && !formData.reason.trim()) {
    return false
  }

  if (props.action === 'update_role' && !formData.role) {
    return false
  }

  return true
}

const confirm = () => {
  if (!isFormValid()) return

  const data: Record<string, any> = {}

  if (formData.reason.trim()) {
    data.reason = formData.reason.trim()
  }

  if (formData.duration !== undefined) {
    const durationNum = Number(formData.duration)
    if (durationNum > 0) {
      data.duration = durationNum
    }
  }

  if (formData.role) {
    data.role = formData.role
  }

  if (formData.notes.trim()) {
    data.notes = formData.notes.trim()
  }

  emit('confirm', Object.keys(data).length > 0 ? data : undefined)
}

// Initialize form data based on action
onMounted(() => {
  if (props.action === 'update_role') {
    // Set current role if available
    formData.role = 'user' // Default role
  }
})
</script>
