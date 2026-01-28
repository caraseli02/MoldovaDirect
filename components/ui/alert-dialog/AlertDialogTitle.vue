<script setup lang="ts">
import { AlertDialogTitle, type AlertDialogTitleProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<AlertDialogTitleProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <AlertDialogTitle
    v-bind="forwarded"
    :class="cn('text-lg font-semibold', props.class)"
  >
    <slot></slot>
  </AlertDialogTitle>
</template>
