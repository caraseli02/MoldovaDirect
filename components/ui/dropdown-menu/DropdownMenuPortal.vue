<script setup lang="ts">
import { DropdownMenuPortal, type DropdownMenuPortalProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'

const props = defineProps<DropdownMenuPortalProps>()
const forwarded = useForwardProps(props)
</script>

<template>
  <DropdownMenuPortal v-bind="forwarded">
    <slot></slot>
  </DropdownMenuPortal>
</template>
