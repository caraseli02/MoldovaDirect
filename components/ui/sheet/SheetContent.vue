<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import {
  DialogClose,
  DialogContent,
  type DialogContentEmits,
  type DialogContentProps,
  DialogOverlay,
  DialogPortal,
  useForwardPropsEmits,
} from 'reka-ui'
import { X } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<DialogContentProps & { class?: HTMLAttributes['class'], side?: 'top' | 'bottom' | 'left' | 'right' }>(),
  {
    side: 'bottom',
  },
)

const emits = defineEmits<DialogContentEmits>()

const delegatedProps = computed(() => {
  const { class: _, side: __, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <DialogContent
      v-bind="{ ...forwarded, ...$attrs }"
      :class="cn(
        'fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 dark:bg-zinc-950',
        {
          'inset-x-0 bottom-0 rounded-t-3xl border-t border-zinc-200 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom dark:border-zinc-800': side === 'bottom',
          'inset-x-0 top-0 rounded-b-3xl border-b border-zinc-200 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top dark:border-zinc-800': side === 'top',
          'inset-y-0 left-0 h-full w-3/4 rounded-r-3xl border-r border-zinc-200 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left dark:border-zinc-800 sm:max-w-sm': side === 'left',
          'inset-y-0 right-0 h-full w-3/4 rounded-l-3xl border-l border-zinc-200 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right dark:border-zinc-800 sm:max-w-sm': side === 'right',
        },
        props.class,
      )"
    >
      <slot />

      <DialogClose
        class="absolute right-6 top-6 rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:pointer-events-none dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus:ring-zinc-300"
      >
        <X class="h-5 w-5" />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
