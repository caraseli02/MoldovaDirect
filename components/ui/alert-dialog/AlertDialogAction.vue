<script setup lang="ts">
import type { ButtonHTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: ButtonHTMLAttributes['class']
}>()
</script>

<template>
  <button
    :class="
      cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90',
        props.class,
      )
    "
  >
    <slot></slot>
  </button>
</template>
