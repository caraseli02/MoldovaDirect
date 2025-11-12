<script setup lang="ts">
import type { AlertDialogRootEmits, AlertDialogRootProps } from "reka-ui"
import { AlertDialogRoot, useForwardPropsEmits } from "reka-ui"

const props = defineProps<AlertDialogRootProps>()
const emits = defineEmits<AlertDialogRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <AlertDialogRoot v-bind="forwarded">
    <slot />
  </AlertDialogRoot>
</template>
