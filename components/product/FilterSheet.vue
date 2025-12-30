<template>
  <UiSheet v-model:open="isOpen">
    <UiSheetContent
      side="bottom"
      class="max-h-[90vh] flex flex-col p-0"
    >
      <!-- Drag Handle -->
      <div class="flex justify-center px-4 pt-4 pb-2">
        <div
          class="h-1 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700"
          aria-hidden="true"
        ></div>
      </div>

      <!-- Header -->
      <UiSheetHeader class="px-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div class="flex items-center gap-3">
          <UiSheetTitle>
            {{ title }}
          </UiSheetTitle>
          <UiBadge
            v-if="activeFilterCount > 0"
            variant="default"
            class="h-6 min-w-[1.5rem] rounded-full px-2"
          >
            {{ activeFilterCount }}
          </UiBadge>
        </div>
        <UiSheetDescription class="sr-only">
          {{ $t('products.filters.description') }}
        </UiSheetDescription>
      </UiSheetHeader>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-6 py-6">
        <slot></slot>
      </div>

      <!-- Footer -->
      <UiSheetFooter class="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-6 py-4">
        <div class="flex w-full gap-3">
          <UiButton
            v-if="showClearButton && activeFilterCount > 0"
            type="button"
            variant="outline"
            class="flex-1"
            @click="handleClear"
          >
            {{ clearButtonLabel || $t('products.filters.clear') }}
          </UiButton>
          <UiButton
            type="button"
            variant="default"
            class="flex-1"
            @click="handleApply"
          >
            {{ applyButtonLabel || $t('products.filters.applyFilters') }}
          </UiButton>
        </div>
      </UiSheetFooter>
    </UiSheetContent>
  </UiSheet>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  activeFilterCount?: number
  filteredCount?: number
  showClearButton?: boolean
  clearButtonLabel?: string
  applyButtonLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Filters',
  activeFilterCount: 0,
  showClearButton: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'apply': []
  'clear': []
  'close': []
}>()

// Computed v-model pattern - single source of truth
const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
    if (!value) {
      emit('close')
    }
  },
})

const handleApply = () => {
  emit('apply')
}

const handleClear = () => {
  emit('clear')
}
</script>
