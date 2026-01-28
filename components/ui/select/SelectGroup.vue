<script setup lang="ts">
import { SelectGroup, type SelectGroupProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<SelectGroupProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <SelectGroup :class="cn('w-full p-1', props.class)">
    <slot></slot>
  </SelectGroup>
</template>
