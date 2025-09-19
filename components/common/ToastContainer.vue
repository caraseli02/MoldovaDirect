<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :duration="toast.duration"
      :action-text="toast.actionText"
      :action-handler="toast.actionHandler"
      @close="removeToast(toast.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '~/stores/toast'
import Toast from './Toast.vue'

// Safely access the toast store
let toastStore: any = null
let toasts = ref([])

try {
  if (process.client) {
    toastStore = useToastStore()
    toasts = computed(() => toastStore.toasts)
  }
} catch (error) {
  console.warn('Toast store not available during SSR/hydration')
  toasts = ref([])
}

const removeToast = (id: string) => {
  if (toastStore) {
    toastStore.removeToast(id)
  }
}
</script>