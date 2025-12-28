<script setup lang="ts">
import { DialogDescription, type DialogDescriptionProps } from 'reka-ui'
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<DialogDescriptionProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <DialogDescription
    :class="cn('text-sm text-zinc-600 dark:text-zinc-400', props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </DialogDescription>
</template>
