<script setup lang="ts">
import { SelectValue, type SelectValueProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'

const props = defineProps<SelectValueProps>()
const forwarded = useForwardProps(props)
</script>

<template>
  <SelectValue v-bind="forwarded">
    <slot></slot>
  </SelectValue>
</template>
