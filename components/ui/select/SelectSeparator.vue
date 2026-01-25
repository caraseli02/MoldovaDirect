<script setup lang="ts">
import { SelectSeparator, type SelectSeparatorProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<SelectSeparatorProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <SelectSeparator :class="cn('-mx-1 my-1 h-px bg-muted', props.class)" />
</template>
