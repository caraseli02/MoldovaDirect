<script setup lang="ts">
import { AlertDialogDescription, type AlertDialogDescriptionProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<AlertDialogDescriptionProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <AlertDialogDescription
    v-bind="forwarded"
    :class="cn('text-sm text-muted-foreground', props.class)"
  >
    <slot></slot>
  </AlertDialogDescription>
</template>
