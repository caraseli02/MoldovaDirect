<template>
  <Popover>
    <PopoverTrigger as-child>
      <button
        type="button"
        class="inline-flex items-center justify-center w-5 h-5 md:w-4 md:h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        :aria-label="ariaLabel || 'Help'"
      >
        <svg class="w-4 h-4 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </PopoverTrigger>
    <PopoverContent
      class="w-72 md:w-80 p-4 text-sm"
      :side="side"
      :align="align"
    >
      <div class="space-y-2">
        <h4 v-if="title" class="font-medium text-gray-900 dark:text-white">
          {{ title }}
        </h4>
        <div class="text-gray-600 dark:text-gray-300 space-y-2">
          <slot>
            <p>{{ content }}</p>
          </slot>
        </div>
        <a
          v-if="learnMoreUrl"
          :href="learnMoreUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium mt-2"
        >
          Learn more
          <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface Props {
  title?: string
  content?: string
  learnMoreUrl?: string
  ariaLabel?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}

withDefaults(defineProps<Props>(), {
  side: 'top',
  align: 'start'
})
</script>
