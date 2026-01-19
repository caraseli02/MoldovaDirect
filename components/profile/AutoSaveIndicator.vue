<!-- eslint-disable tailwindcss/no-custom-classname -->
<script setup lang="ts">
/**
 * Auto Save Indicator Component
 *
 * Fixed toast notification (bottom-right) showing save status.
 * Displays saving spinner, saved checkmark, or error x icon.
 *
 * @example
 * ```vue
 * <AutoSaveIndicator :status="saveStatus" />
 * ```
 */

import type { SaveStatus } from '~/composables/profile/validation-constants'

interface Props {
  /** Current save status */
  status: SaveStatus
}

const { status } = defineProps<Props>()

const saveStatusText = computed(() => {
  switch (status) {
    case 'saving':
      return 'Saving...'
    case 'saved':
      return 'All changes saved'
    case 'error':
      return 'Failed to save changes'
    default:
      return ''
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-300 ease-in"
    enter-from-class="opacity-0 translate-y-2"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="status !== 'idle'"
      class="fixed bottom-6 right-6 z-50"
      data-testid="save-status"
    >
      <div
        class="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-colors duration-200"
        :class="{
          'bg-zinc-800 text-white': status === 'saving',
          'bg-green-600 text-white': status === 'saved',
          'bg-red-600 text-white': status === 'error',
        }"
      >
        <commonIcon
          v-if="status === 'saving'"
          name="lucide:loader-2"
          class="h-4 w-4 animate-spin"
          aria-hidden="true"
        />
        <commonIcon
          v-else-if="status === 'saved'"
          name="lucide:check"
          class="h-4 w-4"
          aria-hidden="true"
        />
        <commonIcon
          v-else
          name="lucide:x"
          class="h-4 w-4"
          aria-hidden="true"
        />
        <span class="text-sm font-medium">
          {{ saveStatusText }}
        </span>
      </div>
    </div>
  </Transition>
</template>
