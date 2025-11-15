<script setup lang="ts">
import type { AccordionItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { AccordionItem } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<AccordionItemProps & { class?: HTMLAttributes["class"] }>()
const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <AccordionItem
    data-slot="accordion-item"
    v-bind="delegatedProps"
    :class="cn('border-b border-border', props.class)"
  >
    <slot />
  </AccordionItem>
</template>
