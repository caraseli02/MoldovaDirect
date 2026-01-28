<script setup lang="ts">
import { PopoverTrigger, type PopoverTriggerProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'

const props = defineProps<PopoverTriggerProps>()
const forwarded = useForwardProps(props)
</script>

<template>
  <PopoverTrigger v-bind="forwarded">
    <slot></slot>
  </PopoverTrigger>
</template>
