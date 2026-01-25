<script setup lang="ts">
import { DialogPortal, type DialogPortalProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'

const props = defineProps<DialogPortalProps>()
const forwarded = useForwardProps(props)
</script>

<template>
  <DialogPortal v-bind="forwarded">
    <slot></slot>
  </DialogPortal>
</template>
