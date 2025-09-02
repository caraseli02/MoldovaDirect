<!--
  Admin Date Range Picker Component
  
  Simple date range picker for filtering users by registration date.
-->

<template>
  <div class="flex items-center gap-2">
    <div class="relative">
      <input
        v-model="fromDate"
        type="date"
        class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        @change="updateRange"
      />
    </div>
    <span class="text-gray-500 text-sm">to</span>
    <div class="relative">
      <input
        v-model="toDate"
        type="date"
        class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
  update: [from?: string, to?: string]
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