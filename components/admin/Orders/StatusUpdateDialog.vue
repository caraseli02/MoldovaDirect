<template>
  <UiDialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <slot name="trigger">
        <UiButton
          variant="outline"
          size="sm"
        >
          <commonIcon
            name="lucide:edit"
            class="h-4 w-4 mr-2"
          />
          Update Status
        </UiButton>
      </slot>
    </DialogTrigger>

    <UiDialogContent class="sm:max-w-[500px]">
      <UiDialogHeader>
        <UiDialogTitle>Update Order Status</UiDialogTitle>
        <UiDialogDescription>
          Change the status of order #{{ orderNumber }}. Status transitions are validated.
        </UiDialogDescription>
      </UiDialogHeader>

      <form
        class="space-y-4 mt-4"
        @submit.prevent="handleSubmit"
      >
        <!-- Current Status Display -->
        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Current Status:</span>
          <AdminOrdersStatusBadge :status="currentStatus" />
        </div>

        <!-- New Status Selection -->
        <div class="space-y-2">
          <UiLabel>New Status <span class="text-red-500">*</span></UiLabel>
          <UiSelect
            v-model="formData.status"
            :disabled="loading"
          >
            <UiSelectTrigger>
              <UiSelectValue placeholder="Select new status" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="status in availableStatuses"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
          <p
            v-if="!isValidTransition && formData.status"
            class="text-xs text-red-600 dark:text-red-400"
          >
            Invalid status transition from {{ currentStatus }} to {{ formData.status }}
          </p>
        </div>

        <!-- Status Transition Arrow -->
        <div
          v-if="formData.status && isValidTransition"
          class="flex items-center justify-center space-x-3 py-2"
        >
          <AdminOrdersStatusBadge
            :status="currentStatus"
            :show-icon="false"
          />
          <commonIcon
            name="lucide:arrow-right"
            class="h-5 w-5 text-gray-400"
          />
          <AdminOrdersStatusBadge
            :status="formData.status"
            :show-icon="false"
          />
        </div>

        <!-- Tracking Information (Required for Shipped Status) -->
        <div
          v-if="formData.status === 'shipped'"
          class="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <p class="text-sm font-medium text-blue-900 dark:text-blue-100">
            Shipping Information Required
          </p>

          <div class="space-y-2">
            <UiLabel>Tracking Number <span class="text-red-500">*</span></UiLabel>
            <UiInput
              v-model="formData.trackingNumber"
              type="text"
              placeholder="Enter tracking number"
              :disabled="loading"
              required
            />
          </div>

          <div class="space-y-2">
            <UiLabel>Carrier <span class="text-red-500">*</span></UiLabel>
            <UiSelect
              v-model="formData.carrier"
              :disabled="loading"
            >
              <UiSelectTrigger>
                <UiSelectValue placeholder="Select carrier" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem value="DHL">
                  DHL
                </UiSelectItem>
                <UiSelectItem value="FedEx">
                  FedEx
                </UiSelectItem>
                <UiSelectItem value="UPS">
                  UPS
                </UiSelectItem>
                <UiSelectItem value="USPS">
                  USPS
                </UiSelectItem>
                <UiSelectItem value="Posta Moldovei">
                  Posta Moldovei
                </UiSelectItem>
                <UiSelectItem value="Other">
                  Other
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </div>
        </div>

        <!-- Admin Notes -->
        <div class="space-y-2">
          <UiLabel>Admin Notes (Optional)</UiLabel>
          <UiTextarea
            v-model="formData.adminNotes"
            rows="3"
            placeholder="Add internal notes about this status change..."
            :disabled="loading"
          />
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p class="text-sm text-red-600 dark:text-red-400">
            {{ error }}
          </p>
        </div>

        <!-- Dialog Footer -->
        <UiDialogFooter>
          <UiButton
            type="button"
            variant="outline"
            :disabled="loading"
            @click="handleCancel"
          >
            Cancel
          </UiButton>
          <UiButton
            type="submit"
            :disabled="loading || !isValidTransition || !formData.status"
          >
            <commonIcon
              v-if="loading"
              name="lucide:loader-2"
              class="h-4 w-4 mr-2 animate-spin"
            />
            <span>{{ loading ? 'Updating...' : 'Update Status' }}</span>
          </UiButton>
        </UiDialogFooter>
      </form>
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
  DialogTrigger,
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/composables/useToast'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface Props {
  orderId: number
  orderNumber: string
  currentStatus: OrderStatus
}

interface Emits {
  (e: 'updated', data: { status: OrderStatus, trackingNumber?: string, carrier?: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toast = useToast()

// State
const isOpen = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

const formData = ref({
  status: '' as OrderStatus | '',
  trackingNumber: '',
  carrier: '',
  adminNotes: '',
})

// Valid status transitions map
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [], // Terminal state
  cancelled: [], // Terminal state
}

// Available status options with labels
const statusOptions: Array<{ value: OrderStatus, label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

// Computed: Available statuses based on current status
const availableStatuses = computed(() => {
  const allowedTransitions = STATUS_TRANSITIONS[props.currentStatus] || []
  return statusOptions.filter(option => allowedTransitions.includes(option.value))
})

// Computed: Check if selected transition is valid
const isValidTransition = computed(() => {
  if (!formData.value.status) return true
  const allowedTransitions = STATUS_TRANSITIONS[props.currentStatus] || []
  return allowedTransitions.includes(formData.value.status as OrderStatus)
})

// Reset form when dialog opens/closes
watch(isOpen, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

// Reset form data
const resetForm = () => {
  formData.value = {
    status: '',
    trackingNumber: '',
    carrier: '',
    adminNotes: '',
  }
  error.value = null
}

// Handle form submission
const handleSubmit = async () => {
  if (!formData.value.status) {
    error.value = 'Please select a new status'
    return
  }

  if (!isValidTransition.value) {
    error.value = `Invalid status transition from ${props.currentStatus} to ${formData.value.status}`
    return
  }

  // Validate required fields for shipped status
  if (formData.value.status === 'shipped') {
    if (!formData.value.trackingNumber?.trim()) {
      error.value = 'Tracking number is required when marking order as shipped'
      return
    }
    if (!formData.value.carrier?.trim()) {
      error.value = 'Carrier is required when marking order as shipped'
      return
    }
  }

  loading.value = true
  error.value = null

  try {
    const response = await $fetch(`/api/admin/orders/${props.orderId}/status`, {
      method: 'PATCH',
      body: {
        status: formData.value.status,
        adminNotes: formData.value.adminNotes || undefined,
        trackingNumber: formData.value.trackingNumber || undefined,
        carrier: formData.value.carrier || undefined,
      },
    }) as any

    if (response.success) {
      toast.success(`Order status updated to ${formData.value.status}`)

      emit('updated', {
        status: formData.value.status as OrderStatus,
        trackingNumber: formData.value.trackingNumber || undefined,
        carrier: formData.value.carrier || undefined,
      })

      isOpen.value = false
      resetForm()
    }
    else {
      throw new Error('Failed to update order status')
    }
  }
  catch (err: unknown) {
    console.error('Error updating order status:', err)

    // Type-safe error extraction
    let errorMessage = 'Failed to update order status'

    if (err instanceof Error) {
      errorMessage = err.message
    }
    else if (typeof err === 'string') {
      errorMessage = err
    }
    else if (err && typeof err === 'object' && 'data' in err) {
      const errorData = err as { data?: { statusMessage?: string } }
      errorMessage = errorData.data?.statusMessage || errorMessage
    }

    error.value = errorMessage
    toast.error('Error', errorMessage)
  }
  finally {
    loading.value = false
  }
}

// Handle cancel
const handleCancel = () => {
  isOpen.value = false
  resetForm()
}
</script>
