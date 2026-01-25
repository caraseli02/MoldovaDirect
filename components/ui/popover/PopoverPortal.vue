<script setup lang="ts">
import { PopoverPortal, type PopoverPortalProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'

const props = defineProps<PopoverPortalProps>()
const forwarded = useForwardProps(props)
</script>

<template>
  <PopoverPortal v-bind="forwarded">
    <slot></slot>
  </PopoverPortal>
</template>
