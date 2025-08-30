<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <UiToast
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

const toastStore = useToastStore()

const toasts = computed(() => toastStore.toasts)

const removeToast = (id: string) => {
  toastStore.removeToast(id)
}
</script>