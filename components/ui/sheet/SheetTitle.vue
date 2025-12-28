<script setup lang="ts">
import { DialogTitle, type DialogTitleProps } from 'reka-ui'
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<DialogTitleProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <DialogTitle
    :class="cn('text-xl font-semibold text-zinc-900 dark:text-zinc-50', props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </DialogTitle>
</template>
