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
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">
          {{ getActionTitle() }}
        </h3>
        <p class="text-sm text-gray-500 mt-1">
          {{ getActionDescription() }}
        </p>
      </div>

      <!-- Content -->
      <div class="px-6 py-4">
        <!-- User Info -->
        <div class="mb-4 p-3 bg-gray-50 rounded-lg">
          <div class="text-sm font-medium text-gray-900">
            {{ user.profile?.name || 'No name' }}
          </div>
          <div class="text-sm text-gray-500">
            {{ user.email }}
          </div>
        </div>

        <!-- Action-specific forms -->
        <div class="space-y-4">
          <!-- Suspend Action -->
          <div v-if="action === 'suspend'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Suspension Duration
            </label>
            <select
              v-model="formData.duration"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option :value="undefined">
                Indefinite
              </option>
              <option :value="1">
                1 day
              </option>
              <option :value="3">
                3 days
              </option>
              <option :value="7">
                1 week
              </option>
              <option :value="30">
                1 month
              </option>
            </select>
          </div>

          <!-- Role Update Action -->
          <div v-if="action === 'update_role'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              New Role
            </label>
            <select
              v-model="formData.role"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">
                Select a role
              </option>
              <option value="user">
                User
              </option>
              <option value="moderator">
                Moderator
              </option>
              <option value="admin">
                Admin
              </option>
            </select>
          </div>

          <!-- Reason (for all actions) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Reason {{ isReasonRequired() ? '(Required)' : '(Optional)' }}
            </label>
            <textarea
              v-model="formData.reason"
              :required="isReasonRequired()"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="getReasonPlaceholder()"
            ></textarea>
          </div>

          <!-- Additional Notes -->
          <div v-if="showNotesField()">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              v-model="formData.notes"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional information..."
            ></textarea>
          </div>

          <!-- Warning Messages -->
          <div
            v-if="getWarningMessage()"
            class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div class="flex">
              <commonIcon
                name="lucide:alert-triangle"
                class="w-5 h-5 text-yellow-400 mr-2 mt-0.5"
              />
              <div class="text-sm text-yellow-800">
                {{ getWarningMessage() }}
              </div>
            </div>
          </div>

          <!-- Danger Messages -->
          <div
            v-if="getDangerMessage()"
            class="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div class="flex">
              <commonIcon
                name="lucide:alert-triangle"
                class="w-5 h-5 text-red-400 mr-2 mt-0.5"
              />
              <div class="text-sm text-red-800">
                {{ getDangerMessage() }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <UiButton
          variant="outline"
          @click="$emit('cancel')"
        >
          Cancel
        </UiButton>
        <UiButton
          :disabled="!isFormValid()"
          :class="getActionButtonClass()"
          @click="confirm"
        >
          {{ getActionButtonText() }}
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  duration: undefined as number | undefined,
  role: '',
  notes: '',
})

// Methods
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

const getActionButtonClass = () => {
  switch (props.action) {
    case 'ban':
      return 'bg-red-600 text-white hover:bg-red-700'
    case 'suspend':
      return 'bg-yellow-600 text-white hover:bg-yellow-700'
    case 'verify_email':
    case 'update_role':
      return 'bg-green-600 text-white hover:bg-green-700'
    default:
      return 'bg-blue-600 text-white hover:bg-blue-700'
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
    data.duration = formData.duration
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
