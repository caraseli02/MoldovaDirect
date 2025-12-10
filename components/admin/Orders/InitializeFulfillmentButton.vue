<template>
  <Button
    :disabled="loading"
    variant="outline"
    size="sm"
    @click="initializeTasks"
  >
    <commonIcon
      v-if="loading"
      name="lucide:loader-2"
      class="h-4 w-4 mr-2 animate-spin"
    />
    <commonIcon
      v-else
      name="lucide:clipboard-list"
      class="h-4 w-4 mr-2"
    />
    {{ loading ? 'Creating Tasks...' : 'Initialize Fulfillment Tasks' }}
  </Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

interface Props {
  orderId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  initialized: []
}>()

const loading = ref(false)
const toast = useToast()

const initializeTasks = async () => {
  loading.value = true

  try {
    const response = await $fetch(`/api/admin/orders/${props.orderId}/fulfillment-tasks`, {
      method: 'POST',
    })

    if (response.success) {
      toast.success('Success', 'Fulfillment tasks have been created')
      emit('initialized')
    }
  }
  catch (error: unknown) {
    console.error('Error initializing fulfillment tasks:', error)
    const errorData = error as Record<string, unknown>
    const errorMessage = (errorData.data as Record<string, unknown>)?.statusMessage as string
    toast.error('Error', errorMessage || 'Failed to create fulfillment tasks')
  }
  finally {
    loading.value = false
  }
}
</script>
