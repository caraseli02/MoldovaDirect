<template>
  <div class="attribute-checkbox-group">
    <div class="space-y-2 max-h-48 overflow-y-auto">
      <div
        v-for="option in options"
        :key="option.value"
        class="flex items-center gap-2"
      >
        <UiCheckbox
          :checked="selected.includes(option.value)"
          class="shrink-0"
          @update:checked="toggleOption(option.value)"
        />
        <span class="text-sm text-gray-700 flex-1">
          {{ option.label }}
        </span>
        <span class="text-xs text-gray-500">
          ({{ option.count }})
        </span>
      </div>
    </div>

    <!-- Show More/Less for long lists -->
    <div
      v-if="options.length > showLimit"
      class="mt-3"
    >
      <UiButton @click="showAll = !showAll">
        {{ showAll ? $t('common.showLess') : $t('common.showMore') }}
        <commonIcon
          :name="showAll ? 'lucide:chevron-up' : 'lucide:chevron-down'"
          class="w-4 h-4 inline ml-1"
        />
      </UiButton>
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
