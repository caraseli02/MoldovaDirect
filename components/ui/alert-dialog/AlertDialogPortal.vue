<script setup lang="ts">
import { AlertDialogPortal, type AlertDialogPortalProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'

const props = defineProps<AlertDialogPortalProps>()
const forwarded = useForwardProps(props)
</script>

<template>
  <AlertDialogPortal v-bind="forwarded">
    <slot></slot>
  </AlertDialogPortal>
</template>
