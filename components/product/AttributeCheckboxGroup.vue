<template>
  <div class="attribute-checkbox-group">
    <div class="space-y-2 max-h-48 overflow-y-auto">
      <label
        v-for="option in options"
        :key="option.value"
        class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
      >
        <input
          :checked="selected.includes(option.value)"
          type="checkbox"
          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          @change="toggleOption(option.value)"
        />
        <span class="ml-2 text-sm text-gray-700 flex-1">
          {{ option.label }}
        </span>
        <span class="text-xs text-gray-500 ml-2">
          ({{ option.count }})
        </span>
      </label>
    </div>

    <!-- Show More/Less for long lists -->
    <div
      v-if="options.length > showLimit"
      class="mt-3"
    >
      <button
        class="text-sm text-blue-700 hover:text-blue-800 font-medium"
        @click="showAll = !showAll"
      >
        {{ showAll ? $t('common.showLess') : $t('common.showMore') }}
        <commonIcon
          :name="showAll ? 'lucide:chevron-up' : 'lucide:chevron-down'"
          class="w-4 h-4 inline ml-1"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AttributeOption {
  value: string
  label: string
  count: number
}

interface Props {
  options: AttributeOption[]
  selected: string[]
  showLimit?: number
}

interface Emits {
  (e: 'update:selected', selected: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  showLimit: 8,
})

const emit = defineEmits<Emits>()

// Local state
const showAll = ref(false)

// Computed properties
const _visibleOptions = computed(() => {
  if (showAll.value || props.options.length <= props.showLimit) {
    return props.options
  }
  return props.options.slice(0, props.showLimit)
})

// Methods
const toggleOption = (value: string) => {
  const newSelected = [...props.selected]
  const index = newSelected.indexOf(value)

  if (index > -1) {
    newSelected.splice(index, 1)
  }
  else {
    newSelected.push(value)
  }

  emit('update:selected', newSelected)
}
</script>
