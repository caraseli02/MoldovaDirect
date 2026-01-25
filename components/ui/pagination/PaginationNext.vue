<script setup lang="ts">
import { PaginationNext, type PaginationNextProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-vue-next'

const props = defineProps<PaginationNextProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <PaginationNext
    v-bind="forwarded"
    :class="cn('gap-1 pr-2.5', props.class)"
  >
    <slot>
      <ChevronRight class="h-4 w-4" />
    </slot>
  </PaginationNext>
</template>
