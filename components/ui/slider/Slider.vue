<script setup lang="ts">
import type { SliderRootEmits, SliderRootProps } from 'reka-ui'
import { SliderRange, SliderRoot, SliderThumb, SliderTrack, useForwardPropsEmits } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<SliderRootProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<SliderRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <SliderRoot
    v-bind="forwarded"
    :class="cn('relative flex w-full touch-none select-none items-center', props.class)"
  >
    <SliderTrack
      class="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary"
    >
      <SliderRange class="absolute h-full bg-slate-900 dark:bg-slate-100" />
    </SliderTrack>
    <SliderThumb
      v-for="(_, key) in (props.modelValue ?? [0])"
      :key="key"
      class="block h-5 w-5 rounded-full border-2 border-slate-900 bg-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-100 dark:bg-slate-950"
    />
  </SliderRoot>
</template>
