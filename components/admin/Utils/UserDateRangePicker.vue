<!--
  Admin Date Range Picker Component

  Simple date range picker for filtering users by registration date.
-->

<template>
  <div class="flex items-center gap-2">
    <div class="relative">
      <UiInput
        v-model="fromDate"
        type="date"
        @change="updateRange"
      />
    </div>
    <span class="text-gray-500 text-sm">{{ $t('common.to') }}</span>
    <div class="relative">
      <UiInput
        v-model="toDate"
        type="date"
        @change="updateRange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  from?: string
  to?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:from': [value: string]
  'update:to': [value: string]
  'update': [from?: string, to?: string]
}>()

const fromDate = ref(props.from || '')
const toDate = ref(props.to || '')

const updateRange = () => {
  emit('update:from', fromDate.value)
  emit('update:to', toDate.value)
  emit('update', fromDate.value || undefined, toDate.value || undefined)
}

watch(() => props.from, (newValue) => {
  fromDate.value = newValue || ''
})

watch(() => props.to, (newValue) => {
  toDate.value = newValue || ''
})
</script>
