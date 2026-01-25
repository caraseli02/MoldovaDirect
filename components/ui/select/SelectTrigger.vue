<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { SelectTrigger, useForwardProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const forwardedProps = useForwardProps(props)
</script>

<template>
  <SelectTrigger
    v-bind="forwardedProps"
    :class="
      cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        props.class,
      )
    "
  >
    <slot></slot>
  </SelectTrigger>
</template>
