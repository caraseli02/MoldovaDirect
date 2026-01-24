<template>
  <div>
    <div
      v-if="hasError"
      data-testid="error-boundary"
      class="rounded-md border p-4 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/40"
    >
      <div class="flex items-start gap-3">
        <svg
          class="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0v-5.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="flex-1">
          <p class="font-semibold text-red-800 dark:text-red-200">
            {{ titleText }}
          </p>
          <p
            v-if="messageText"
            class="mt-1 text-sm text-red-700 dark:text-red-300"
          >
            {{ messageText }}
          </p>
          <div class="mt-3 flex gap-2">
            <UiButton
              v-if="fallbackAction"
              type="button"
              @click="fallbackAction"
            >
              {{ fallbackActionText || 'Retry' }}
            </UiButton>
          </div>
        </div>
      </div>
    </div>

    <slot v-else></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, watch } from 'vue'

const props = defineProps<{
  fallbackAction?: () => void
  fallbackActionText?: string
  title?: string
  message?: string
}>()

const emit = defineEmits<{ (e: 'error', error: Error): void }>()

const hasError = ref(false)
const lastError = ref<Error | null>(null)

onErrorCaptured((err) => {
  lastError.value = err as Error
  hasError.value = true
  return false
})

watch(lastError, (e) => {
  if (e) emit('error', e)
})

const titleText = computed(() => props.title || 'Something went wrong')
const messageText = computed(() => props.message || lastError.value?.message)

const fallbackAction = props.fallbackAction
const fallbackActionText = props.fallbackActionText
</script>
