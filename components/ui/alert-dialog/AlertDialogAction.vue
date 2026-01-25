<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { AlertDialogAction as AlertDialogActionRoot, useForwardProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import type { ButtonVariants } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'

const props = defineProps<{
  class?: HTMLAttributes['class']
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
}>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <AlertDialogActionRoot
    v-bind="forwardedProps"
    :class="cn(buttonVariants({ variant: props.variant ?? 'default' }), props.class)"
  >
    <slot></slot>
  </AlertDialogActionRoot>
</template>
