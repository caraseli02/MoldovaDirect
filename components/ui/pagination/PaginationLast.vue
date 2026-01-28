<script setup lang="ts">
import { PaginationLast, type PaginationLastProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { ChevronLast } from 'lucide-vue-next'

const props = defineProps<PaginationLastProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <PaginationLast
    v-bind="forwarded"
    :class="cn('gap-1 pl-2.5', props.class)"
  >
    <slot>
      <ChevronLast class="h-4 w-4" />
    </slot>
  </PaginationLast>
</template>
