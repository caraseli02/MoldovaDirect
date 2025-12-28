<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { SliderRange, SliderRoot, SliderThumb, SliderTrack, type SliderRootEmits, type SliderRootProps } from 'reka-ui'
import { cn } from '~/lib/utils'

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
    :class="cn(
      'relative flex w-full touch-none select-none items-center',
      props.class,
    )"
    v-bind="forwarded"
  >
    <SliderTrack class="relative h-1.5 w-full grow overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
      <SliderRange class="absolute h-full bg-zinc-900 dark:bg-zinc-50" />
    </SliderTrack>
    <SliderThumb
      v-for="(_, key) in modelValue"
      :key="key"
      class="block h-5 w-5 rounded-full border-2 border-zinc-900 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-50 dark:bg-zinc-950 dark:focus-visible:ring-zinc-300"
    />
  </SliderRoot>
</template>
