<script setup lang="ts">
import { DialogTitle, type DialogTitleProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<DialogTitleProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <DialogTitle
    v-bind="forwarded"
    :class="cn('text-lg font-semibold leading-none tracking-tight', props.class)"
  >
    <slot></slot>
  </DialogTitle>
</template>
