<script setup lang="ts">
import { PaginationEllipsis, type PaginationEllipsisProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { MoreHorizontal } from 'lucide-vue-next'

const props = defineProps<PaginationEllipsisProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <PaginationEllipsis
    v-bind="forwarded"
    :class="cn('gap-1', props.class)"
  >
    <slot>
      <MoreHorizontal class="h-4 w-4" />
    </slot>
  </PaginationEllipsis>
</template>
