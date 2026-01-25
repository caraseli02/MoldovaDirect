<script setup lang="ts">
import { TooltipProvider, type TooltipProviderProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'

const props = defineProps<TooltipProviderProps>()
const forwarded = useForwardProps(props)
</script>

<template>
  <TooltipProvider v-bind="forwarded">
    <slot></slot>
  </TooltipProvider>
</template>
