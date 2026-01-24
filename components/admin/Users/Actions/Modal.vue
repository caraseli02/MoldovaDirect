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
  <UiDialog
    :open="true"
    @update:open="handleClose"
  >
    <UiDialogContent class="sm:max-w-md">
      <UiDialogHeader>
        <UiDialogTitle>{{ getActionTitle() }}</UiDialogTitle>
        <UiDialogDescription>{{ getActionDescription() }}</UiDialogDescription>
      </UiDialogHeader>

      <!-- Content -->
      <div class="space-y-4">
        <!-- User Info -->
        <div class="p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
          <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ user.profile?.name || $t('admin.users.modal.noName') }}
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
              {{ $t('admin.users.modal.suspensionDuration') }}
            </UiLabel>
            <UiSelect v-model="formData.duration">
              <UiSelectTrigger>
                <UiSelectValue :placeholder="$t('admin.users.modal.selectDuration')" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem value="0">
                  {{ $t('admin.users.modal.durations.indefinite') }}
                </UiSelectItem>
                <UiSelectItem value="1">
                  {{ $t('admin.users.modal.durations.oneDay') }}
                </UiSelectItem>
                <UiSelectItem value="3">
                  {{ $t('admin.users.modal.durations.threeDays') }}
                </UiSelectItem>
                <UiSelectItem value="7">
                  {{ $t('admin.users.modal.durations.oneWeek') }}
                </UiSelectItem>
                <UiSelectItem value="30">
                  {{ $t('admin.users.modal.durations.oneMonth') }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </div>

          <!-- Role Update Action -->
          <div v-if="action === 'update_role'">
            <UiLabel class="mb-2">
              {{ $t('admin.users.modal.newRole') }}
            </UiLabel>
            <UiSelect v-model="formData.role">
              <UiSelectTrigger>
                <UiSelectValue :placeholder="$t('admin.users.modal.selectRole')" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem value="user">
                  {{ $t('admin.users.modal.roles.user') }}
                </UiSelectItem>
                <UiSelectItem value="moderator">
                  {{ $t('admin.users.modal.roles.moderator') }}
                </UiSelectItem>
                <UiSelectItem value="admin">
                  {{ $t('admin.users.modal.roles.admin') }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </div>

          <!-- Reason (for all actions) -->
          <div>
            <UiLabel class="mb-2">
              {{ $t('admin.users.modal.reason') }} {{ isReasonRequired() ? $t('admin.users.modal.required') : $t('admin.users.modal.optional') }}
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
              {{ $t('admin.users.modal.additionalNotes') }}
            </UiLabel>
            <UiTextarea
              v-model="formData.notes"
              rows="2"
              :placeholder="$t('admin.users.modal.additionalNotesPlaceholder')"
            />
          </div>

          <!-- Warning Messages -->
          <UiAlert v-if="getWarningMessage()">
            <commonIcon
              name="lucide:alert-triangle"
              class="h-4 w-4"
            />
            <UiAlertDescription>{{ getWarningMessage() }}</UiAlertDescription>
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
            <UiAlertDescription>{{ getDangerMessage() }}</UiAlertDescription>
          </UiAlert>
        </div>
      </div>

      <UiDialogFooter>
        <UiButton
          variant="outline"
          @click="$emit('cancel')"
        >
          {{ $t('common.cancel') }}
        </UiButton>
        <UiButton
          :disabled="!isFormValid()"
          :variant="getActionButtonVariant()"
          @click="confirm"
        >
          {{ getActionButtonText() }}
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
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

const { t } = useI18n()

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
      return t('admin.users.modal.titles.suspend')
    case 'ban':
      return t('admin.users.modal.titles.ban')
    case 'verify_email':
      return t('admin.users.modal.titles.verifyEmail')
    case 'reset_password':
      return t('admin.users.modal.titles.resetPassword')
    case 'update_role':
      return t('admin.users.modal.titles.updateRole')
    default:
      return t('admin.users.modal.titles.confirm')
  }
}

const getActionDescription = () => {
  switch (props.action) {
    case 'suspend':
      return t('admin.users.modal.descriptions.suspend')
    case 'ban':
      return t('admin.users.modal.descriptions.ban')
    case 'verify_email':
      return t('admin.users.modal.descriptions.verifyEmail')
    case 'reset_password':
      return t('admin.users.modal.descriptions.resetPassword')
    case 'update_role':
      return t('admin.users.modal.descriptions.updateRole')
    default:
      return t('admin.users.modal.descriptions.confirm')
  }
}

const getReasonPlaceholder = () => {
  switch (props.action) {
    case 'suspend':
      return t('admin.users.modal.placeholders.suspend')
    case 'ban':
      return t('admin.users.modal.placeholders.ban')
    case 'verify_email':
      return t('admin.users.modal.placeholders.verifyEmail')
    case 'reset_password':
      return t('admin.users.modal.placeholders.resetPassword')
    case 'update_role':
      return t('admin.users.modal.placeholders.updateRole')
    default:
      return t('admin.users.modal.placeholders.default')
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
      return t('admin.users.modal.warnings.suspend')
    case 'reset_password':
      return t('admin.users.modal.warnings.resetPassword')
    case 'update_role':
      return t('admin.users.modal.warnings.updateRole')
    default:
      return null
  }
}

const getDangerMessage = () => {
  switch (props.action) {
    case 'ban':
      return t('admin.users.modal.dangers.ban')
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
      return t('admin.users.modal.buttons.suspend')
    case 'ban':
      return t('admin.users.modal.buttons.ban')
    case 'verify_email':
      return t('admin.users.modal.buttons.verifyEmail')
    case 'reset_password':
      return t('admin.users.modal.buttons.resetPassword')
    case 'update_role':
      return t('admin.users.modal.buttons.updateRole')
    default:
      return t('admin.users.modal.buttons.confirm')
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
