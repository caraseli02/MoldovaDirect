<script setup lang="ts">
import type { DropdownMenuItemProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { DropdownMenuItem, useForwardProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<DropdownMenuItemProps & {
  class?: HTMLAttributes['class']
  inset?: boolean
}>()

const delegatedProps = reactiveOmit(props, 'class', 'inset')

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <DropdownMenuItem
    data-slot="dropdown-menu-item"
    v-bind="forwardedProps"
    :class="cn(
      'hover:bg-accent/90 focus:bg-accent hover:text-accent-foreground focus:text-accent-foreground [&_svg:not([class*=\'text-\'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-md px-2 py-2 text-sm outline-hidden select-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
      props.inset && 'pl-8',
      props.class,
    )"
  >
    <slot></slot>
  </DropdownMenuItem>
</template>
