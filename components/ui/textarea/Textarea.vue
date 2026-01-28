<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  modelValue?: string | null
  defaultValue?: string | null
  placeholder?: HTMLAttributes['placeholder']
  disabled?: boolean
  name?: string
  id?: string
  rows?: number | string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string): void
}>()
</script>

<template>
  <textarea
    :id="props.id"
    :name="props.name"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :rows="props.rows"
    :value="props.modelValue ?? props.defaultValue"
    :class="
      cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
    @input="emits('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  ></textarea>
</template>
