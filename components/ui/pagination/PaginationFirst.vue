<script setup lang="ts">
import { PaginationFirst, type PaginationFirstProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { ChevronFirst } from 'lucide-vue-next'

const props = defineProps<PaginationFirstProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <PaginationFirst
    v-bind="forwarded"
    :class="cn('gap-1 pr-2.5', props.class)"
  >
    <slot>
      <ChevronFirst class="h-4 w-4" />
    </slot>
  </PaginationFirst>
</template>
