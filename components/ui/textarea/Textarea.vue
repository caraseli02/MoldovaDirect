<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { PrimitiveProps } from 'reka-ui'
import { useVModel, reactiveOmit } from '@vueuse/core'
import { Primitive } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<PrimitiveProps & {
  class?: HTMLAttributes['class']
  defaultValue?: string | number
  modelValue?: string | number | null
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number | null): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const delegatedProps = reactiveOmit(props, 'class', 'modelValue', 'defaultValue')

const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement | null
  if (!target) return
  emits('update:modelValue', target.value)
}
</script>

<template>
  <Primitive
    v-bind="delegatedProps"
    :value="modelValue ?? ''"
    data-slot="textarea"
    :class="cn('border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', props.class)"
    as="textarea"
    @input="handleInput"
  />
</template>
