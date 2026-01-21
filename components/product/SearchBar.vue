<template>
  <div class="relative">
    <div class="relative">
      <UiInput
        ref="inputRef"
        :value="modelValue"
        type="search"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value); $emit('search', ($event.target as HTMLInputElement).value)"
      />
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          class="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <UiButton
        v-if="modelValue"
        type="button"
        :aria-label="clearLabel"
        @click="$emit('clear')"
      >
        <svg
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Search Bar Component
 *
 * Displays the product search input with clear button.
 * Extracted from pages/products/index.vue to reduce component size.
 */
import { ref } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  clearLabel?: string
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: string]
  'search': [value: string]
  'clear': []
}>()

const inputRef = ref<HTMLInputElement>()

defineExpose({
  focus: () => inputRef.value?.focus(),
})
</script>
