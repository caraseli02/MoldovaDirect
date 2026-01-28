<script setup lang="ts">
import { PaginationList, type PaginationListProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<PaginationListProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <PaginationList
    v-bind="forwarded"
    :class="cn('flex items-center gap-1', props.class)"
  >
    <slot></slot>
  </PaginationList>
</template>
