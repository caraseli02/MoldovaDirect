<template>
  <div
    class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200"
    :class="[
      variantClasses,
      size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'
    ]"
  >
    <!-- Icon -->
    <commonIcon
      v-if="icon"
      :name="icon"
      :class="size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'"
    />

    <!-- Text Content -->
    <span>{{ text }}</span>

    <!-- Tooltip (optional) -->
    <UiTooltip v-if="tooltip">
      <UiTooltipTrigger as-child>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          :class="size === 'sm' ? 'p-0.5' : 'p-1'"
          :aria-label="`More info about ${text}`"
        >
          <commonIcon
            name="lucide:help-circle"
            :class="size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'"
          />
        </button>
      </UiTooltipTrigger>
      <UiTooltipContent>
        <p>{{ tooltip }}</p>
      </UiTooltipContent>
    </UiTooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Tooltip as UiTooltip, TooltipTrigger as UiTooltipTrigger, TooltipContent as UiTooltipContent } from '@/components/ui/tooltip'

interface Props {
  text: string
  icon?: string
  tooltip?: string
  variant?: 'primary' | 'success' | 'info' | 'warning' | 'neutral'
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'md'
})

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
  }
  return variants[props.variant]
})
</script>
