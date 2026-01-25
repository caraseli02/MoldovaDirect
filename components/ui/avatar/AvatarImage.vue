<script setup lang="ts">
import { AvatarImage, type AvatarImageProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'

const props = defineProps<AvatarImageProps>()
const forwarded = useForwardProps(props)
</script>

<template>
  <AvatarImage v-bind="forwarded" />
</template>
