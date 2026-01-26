<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  as?: string
}>(), {
  as: 'h3',
})
</script>

<template>
  <component
    :is="props.as"
    :class="
      cn('text-2xl font-semibold leading-none tracking-tight', props.class)
    "
  >
    <slot></slot>
  </component>
</template>
