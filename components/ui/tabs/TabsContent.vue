<script setup lang="ts">
import { TabsContent, type TabsContentProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<TabsContentProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <TabsContent
    v-bind="forwarded"
    :class="cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', props.class)"
  >
    <slot></slot>
  </TabsContent>
</template>
