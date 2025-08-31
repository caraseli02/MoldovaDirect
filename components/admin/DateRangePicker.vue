<template>
  <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
    <div class="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        Date Range:
      </label>
      <div class="flex gap-2 items-center">
        <input
          v-model="localStartDate"
          type="date"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          @change="updateDateRange"
        />
        <span class="text-gray-500 dark:text-gray-400">to</span>
        <input
          v-model="localEndDate"
          type="date"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          @change="updateDateRange"
        />
      </div>
    </div>
    
    <div class="flex gap-2">
      <button
        v-for="preset in presets"
        :key="preset.label"
        @click="applyPreset(preset)"
        :class="[
          'px-3 py-2 text-sm rounded-md border transition-colors',
          isActivePreset(preset) 
            ? 'bg-blue-600 text-white border-blue-600' 
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
        ]"
      >
        {{ preset.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DatePreset {
  label: string
  days: number
}

interface Props {
  startDate?: string
  endDate?: string
  modelValue?: {
    startDate: string
    endDate: string
  }
}

interface Emits {
  (e: 'update:modelValue', value: { startDate: string; endDate: string }): void
  (e: 'change', value: { startDate: string; endDate: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  startDate: '',
  endDate: ''
})

const emit = defineEmits<Emits>()

// Date presets
const presets: DatePreset[] = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last year', days: 365 }
]

// Local date state
const localStartDate = ref('')
const localEndDate = ref('')
const activePreset = ref<DatePreset | null>(null)

// Initialize dates
const initializeDates = () => {
  if (props.modelValue) {
    localStartDate.value = props.modelValue.startDate
    localEndDate.value = props.modelValue.endDate
  } else if (props.startDate && props.endDate) {
    localStartDate.value = props.startDate
    localEndDate.value = props.endDate
  } else {
    // Default to last 30 days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    
    localStartDate.value = startDate.toISOString().split('T')[0]
    localEndDate.value = endDate.toISOString().split('T')[0]
    
    activePreset.value = presets.find(p => p.days === 30) || null
  }
}

// Apply date preset
const applyPreset = (preset: DatePreset) => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - preset.days)
  
  localStartDate.value = startDate.toISOString().split('T')[0]
  localEndDate.value = endDate.toISOString().split('T')[0]
  activePreset.value = preset
  
  updateDateRange()
}

// Check if preset is active
const isActivePreset = (preset: DatePreset) => {
  return activePreset.value?.days === preset.days
}

// Update date range
const updateDateRange = () => {
  if (localStartDate.value && localEndDate.value) {
    const dateRange = {
      startDate: localStartDate.value,
      endDate: localEndDate.value
    }
    
    // Clear active preset if dates don't match any preset
    const matchingPreset = presets.find(preset => {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - preset.days)
      
      return startDate.toISOString().split('T')[0] === localStartDate.value &&
             endDate.toISOString().split('T')[0] === localEndDate.value
    })
    
    activePreset.value = matchingPreset || null
    
    emit('update:modelValue', dateRange)
    emit('change', dateRange)
  }
}

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    localStartDate.value = newValue.startDate
    localEndDate.value = newValue.endDate
  }
}, { deep: true })

watch(() => [props.startDate, props.endDate], ([newStart, newEnd]) => {
  if (newStart && newEnd) {
    localStartDate.value = newStart
    localEndDate.value = newEnd
  }
})

// Initialize on mount
onMounted(() => {
  initializeDates()
  updateDateRange()
})
</script>