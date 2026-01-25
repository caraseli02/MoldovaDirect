<script setup lang="ts">
import { AvatarRoot, type AvatarRootProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<AvatarRootProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <AvatarRoot
    v-bind="forwarded"
    :class="cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', props.class)"
  >
    <slot></slot>
  </AvatarRoot>
</template>
