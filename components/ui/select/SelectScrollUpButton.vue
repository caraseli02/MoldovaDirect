<script setup lang="ts">
import { SelectScrollUpButton, type SelectScrollUpButtonProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { ChevronUp } from 'lucide-vue-next'

const props = defineProps<SelectScrollUpButtonProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <SelectScrollUpButton
    v-bind="forwarded"
    :class="
      cn(
        'flex cursor-default items-center justify-center py-1',
        props.class,
      )
    "
  >
    <slot>
      <ChevronUp class="h-4 w-4" />
    </slot>
  </SelectScrollUpButton>
</template>
