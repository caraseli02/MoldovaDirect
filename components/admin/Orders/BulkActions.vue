<template>
  <div
    v-if="show"
    class="bg-blue-50 dark:bg-blue-900/20 px-6 py-3 border-b border-gray-200 dark:border-gray-700"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <span class="text-sm font-medium text-blue-900 dark:text-blue-100">
          {{ selectedCount }} {{ selectedCount === 1 ? 'order' : 'orders' }} selected
        </span>
        <Button
          variant="link"
          class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          @click="$emit('clear-selection')"
        >
          Clear selection
        </Button>
      </div>
      <div class="flex items-center space-x-2">
        <Button
          :disabled="disabled"
          size="sm"
          variant="secondary"
          class="dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          @click="handleBulkStatusUpdate('processing')"
        >
          <commonIcon
            name="lucide:clock"
            class="w-4 h-4 mr-1"
          />
          Mark Processing
        </Button>
        <Button
          :disabled="disabled"
          size="sm"
          class="text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
          @click="handleBulkStatusUpdate('shipped')"
        >
          <commonIcon
            name="lucide:truck"
            class="w-4 h-4 mr-1"
          />
          Mark Shipped
        </Button>
        <Button
          :disabled="disabled"
          size="sm"
          class="text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800"
          @click="handleBulkStatusUpdate('delivered')"
        >
          <commonIcon
            name="lucide:check-circle"
            class="w-4 h-4 mr-1"
          />
          Mark Delivered
        </Button>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <Dialog
      :open="confirmDialog.show"
      @update:open="handleDialogOpen"
    >
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <commonIcon
              name="lucide:alert-circle"
              class="w-5 h-5 text-blue-600 dark:text-blue-400"
            />
            Confirm Bulk Status Update
          </DialogTitle>
          <DialogDescription>
            {{ confirmDialog.message }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            {{ confirmDialog.details }}
          </p>

          <!-- Optional notes for bulk update -->
          <div
            v-if="confirmDialog.status === 'shipped'"
            class="space-y-2"
          >
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tracking Information (Optional)
            </label>
            <Textarea
              v-model="confirmDialog.notes"
              placeholder="Enter tracking numbers or shipping notes..."
              rows="3"
              class="w-full"
            />
          </div>
        </div>

        <DialogFooter class="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            :disabled="confirmDialog.loading"
            @click="cancelBulkUpdate"
          >
            Cancel
          </Button>
          <Button
            :disabled="confirmDialog.loading"
            @click="confirmBulkUpdate"
          >
            <commonIcon
              v-if="confirmDialog.loading"
              name="lucide:refresh-ccw"
              class="w-4 h-4 mr-2 animate-spin"
            />
            {{ confirmDialog.loading ? 'Updating...' : 'Confirm Update' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  show: boolean
  selectedCount: number
  disabled?: boolean
}

interface Emits {
  (e: 'clear-selection'): void
  (e: 'bulk-update-status', status: string, notes?: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Confirmation dialog state
const confirmDialog = ref({
  show: false,
  status: '',
  message: '',
  details: '',
  notes: '',
  loading: false,
})

// Status display names
const statusNames: Record<string, string> = {
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
}

// Handle bulk status update button click
const handleBulkStatusUpdate = (status: string) => {
  const count = props.selectedCount
  const statusName = statusNames[status] || status

  confirmDialog.value = {
    show: true,
    status,
    message: `Update ${count} ${count === 1 ? 'order' : 'orders'} to "${statusName}"?`,
    details: `This will change the status of all selected orders to "${statusName}". ${
      status === 'shipped'
        ? 'Customers will receive shipping confirmation emails.'
        : status === 'delivered'
          ? 'Customers will receive delivery confirmation emails.'
          : 'This action can be reversed if needed.'
    }`,
    notes: '',
    loading: false,
  }
}

// Confirm bulk update
const confirmBulkUpdate = async () => {
  confirmDialog.value.loading = true

  try {
    emit('bulk-update-status', confirmDialog.value.status, confirmDialog.value.notes || undefined)

    // Close dialog after a short delay to show loading state
    setTimeout(() => {
      confirmDialog.value = {
        show: false,
        status: '',
        message: '',
        details: '',
        notes: '',
        loading: false,
      }
    }, 500)
  }
  catch (error) {
    console.error('Bulk update failed:', error)
    confirmDialog.value.loading = false
  }
}

// Cancel bulk update
const cancelBulkUpdate = () => {
  confirmDialog.value = {
    show: false,
    status: '',
    message: '',
    details: '',
    notes: '',
    loading: false,
  }
}

// Handle dialog open/close
const handleDialogOpen = (open: boolean) => {
  if (!open) {
    cancelBulkUpdate()
  }
}
</script>
