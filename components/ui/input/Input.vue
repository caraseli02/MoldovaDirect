<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: InputHTMLAttributes['class']
  modelValue?: string | number | null
  defaultValue?: string | number | null
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'range' | 'file' | 'hidden' | 'checkbox' | 'radio' | 'submit' | 'reset' | 'button' | 'datetime-local' | 'month' | 'time' | 'week'
  placeholder?: InputHTMLAttributes['placeholder']
  disabled?: boolean
  name?: string
  id?: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string): void
}>()
</script>

<template>
  <input
    :id="props.id"
    :type="props.type ?? 'text'"
    :name="props.name"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :value="props.modelValue ?? props.defaultValue"
    :class="
      cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
    @input="emits('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
