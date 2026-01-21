<script setup lang="ts">
import type { ProgressRootEmits, ProgressRootProps } from 'reka-ui'
import { ProgressIndicator, ProgressRoot } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface Props extends ProgressRootProps {
  class?: HTMLAttributes['class']
  indicatorClass?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
})

const emits = defineEmits<ProgressRootEmits>()
</script>

<template>
  <ProgressRoot
    v-bind="props"
    :class="cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
      props.class,
    )"
    @update:model-value="emits('update:modelValue', $event)"
  >
    <ProgressIndicator
      :class="cn(
        'h-full w-full flex-1 bg-primary transition-all',
        props.indicatorClass,
      )"
      :style="`transform: translateX(-${100 - (props.modelValue ?? 0)}%)`"
    />
  </ProgressRoot>
</template>
