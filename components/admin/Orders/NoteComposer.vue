<template>
  <div class="space-y-4">
    <!-- Note Type Selector -->
    <div class="flex items-center space-x-4">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Note Type:
      </label>
      <div class="flex items-center space-x-2">
        <Button
          :variant="noteType === 'internal' ? 'default' : 'outline'"
          size="sm"
          type="button"
          @click="noteType = 'internal'"
        >
          <commonIcon
            name="lucide:lock"
            class="h-4 w-4 mr-1"
          />
          Internal
        </Button>
        <Button
          :variant="noteType === 'customer' ? 'default' : 'outline'"
          size="sm"
          type="button"
          @click="noteType = 'customer'"
        >
          <commonIcon
            name="lucide:user"
            class="h-4 w-4 mr-1"
          />
          Customer
        </Button>
      </div>
    </div>

    <!-- Note Type Description -->
    <div class="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
      <commonIcon
        :name="noteType === 'internal' ? 'lucide:info' : 'lucide:alert-circle'"
        class="h-3 w-3 inline mr-1"
      />
      <span v-if="noteType === 'internal'">
        Internal notes are only visible to admins and will not be shown to customers.
      </span>
      <span v-else>
        Customer notes will be visible to the customer in their order history.
      </span>
    </div>

    <!-- Note Content -->
    <div>
      <label
        for="note-content"
        class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
      >
        Note Content
      </label>
      <Textarea
        id="note-content"
        v-model="content"
        :placeholder="noteType === 'internal'
          ? 'Add internal notes about this order...'
          : 'Add a note that will be visible to the customer...'"
        rows="4"
        :disabled="submitting"
        class="w-full"
      />
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {{ content.length }} / 1000 characters
      </p>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end space-x-2">
      <Button
        variant="outline"
        size="sm"
        :disabled="submitting"
        type="button"
        @click="handleCancel"
      >
        Cancel
      </Button>
      <Button
        size="sm"
        :disabled="!canSubmit || submitting"
        type="button"
        @click="handleSubmit"
      >
        <commonIcon
          v-if="submitting"
          name="lucide:loader-2"
          class="h-4 w-4 mr-1 animate-spin"
        />
        <commonIcon
          v-else
          name="lucide:plus"
          class="h-4 w-4 mr-1"
        />
        {{ submitting ? 'Adding...' : 'Add Note' }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  orderId: number
}

interface Emits {
  (e: 'note-added'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const noteType = ref<'internal' | 'customer'>('internal')
const content = ref('')
const submitting = ref(false)

// Computed
const canSubmit = computed(() => {
  return content.value.trim().length > 0 && content.value.length <= 1000
})

// Methods
const handleSubmit = async () => {
  if (!canSubmit.value) return

  submitting.value = true

  try {
    const response = await $fetch(`/api/admin/orders/${props.orderId}/notes`, {
      method: 'POST',
      body: {
        noteType: noteType.value,
        content: content.value.trim(),
      },
    })

    if (response.success) {
      // Show success toast
      const toast = useToast()
      toast.success('Success', response.message || 'Note added successfully')

      // Reset form
      content.value = ''
      noteType.value = 'internal'

      // Emit event to parent
      emit('note-added')
    }
  }
  catch (error: any) {
    console.error('Error adding note:', error)
    const toast = useToast()
    toast.error('Error', 'Failed to add note. Please try again.')
  }
  finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  content.value = ''
  noteType.value = 'internal'
  emit('cancel')
}
</script>
