<script setup lang="ts">
import { DialogDescription, type DialogDescriptionProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<DialogDescriptionProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <DialogDescription
    v-bind="forwarded"
    :class="cn('text-sm text-muted-foreground', props.class)"
  >
    <slot></slot>
  </DialogDescription>
</template>
