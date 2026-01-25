<script setup lang="ts">
import { useForwardPropsEmits, PaginationRoot } from 'reka-ui'
import type { PaginationRootEmits, PaginationRootProps } from 'reka-ui'

const props = defineProps<PaginationRootProps>()
const emits = defineEmits<PaginationRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <PaginationRoot v-bind="forwarded">
    <slot></slot>
  </PaginationRoot>
</template>
