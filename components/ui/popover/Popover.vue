<script setup lang="ts">
import { useForwardPropsEmits, PopoverRoot } from 'reka-ui'
import type { PopoverRootEmits, PopoverRootProps } from 'reka-ui'

const props = defineProps<PopoverRootProps>()
const emits = defineEmits<PopoverRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <PopoverRoot v-bind="forwarded">
    <slot></slot>
  </PopoverRoot>
</template>
