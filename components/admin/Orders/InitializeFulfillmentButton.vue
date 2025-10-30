<template>
  <Button
    @click="initializeTasks"
    :disabled="loading"
    variant="outline"
    size="sm"
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
      method: 'POST'
    })

    if (response.success) {
      toast.add({
        title: 'Success',
        description: 'Fulfillment tasks have been created',
        type: 'success'
      })
      emit('initialized')
    }
  } catch (error: any) {
    console.error('Error initializing fulfillment tasks:', error)
    toast.add({
      title: 'Error',
      description: error.data?.statusMessage || 'Failed to create fulfillment tasks',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>
