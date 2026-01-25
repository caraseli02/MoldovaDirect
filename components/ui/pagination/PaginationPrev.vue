<script setup lang="ts">
import { PaginationPrev, type PaginationPrevProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { ChevronLeft } from 'lucide-vue-next'

const props = defineProps<PaginationPrevProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <PaginationPrev
    v-bind="forwarded"
    :class="cn('gap-1 pl-2.5', props.class)"
  >
    <slot>
      <ChevronLeft class="h-4 w-4" />
    </slot>
  </PaginationPrev>
</template>
