<script setup lang="ts">
import { AlertDialogTrigger, type AlertDialogTriggerProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'

const props = defineProps<AlertDialogTriggerProps>()
const forwarded = useForwardProps(props)
</script>

<template>
  <AlertDialogTrigger v-bind="forwarded">
    <slot></slot>
  </AlertDialogTrigger>
</template>
