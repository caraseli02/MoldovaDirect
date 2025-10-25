<template>
  <div class="category-tree-item">
    <div
      class="flex items-center py-1"
      :class="{ 'pl-4': level > 0 }"
    >
      <button
        v-if="category.children && category.children.length > 0"
        @click="toggleExpanded"
        class="mr-2 p-0.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
      >
        <commonIcon
          :name="isExpanded ? 'lucide:chevron-down' : 'lucide:chevron-right'"
          class="w-4 h-4"
        />
      </button>
      <div v-else class="w-6" />

      <label class="flex items-center flex-1 cursor-pointer">
        <input
          :checked="isSelected"
          type="radio"
          :name="'category-' + level"
          class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
          @change="handleSelection"
        >
        <span class="ml-2 text-sm text-gray-700 dark:text-gray-300 flex-1">
          {{ category.name }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
          ({{ category.count }})
        </span>
      </label>
    </div>

    <div
      v-if="category.children && category.children.length > 0 && isExpanded"
      class="ml-2"
    >
      <productCategoryTreeItem
        v-for="child in category.children"
        :key="child.id"
        :category="child"
        :selected="selected"
        :level="level + 1"
        @update:selected="$emit('update:selected', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryFilter } from '~/types'

interface Props {
  category: CategoryFilter
  selected: string[]
  level: number
}

interface Emits {
  (e: 'update:selected', selected: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local state
const isExpanded = ref(false)

// Computed properties
const isSelected = computed(() => {
  return props.selected.includes(props.category.id.toString())
})

// Methods
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const handleSelection = () => {
  if (isSelected.value) {
    // Deselect
    emit('update:selected', [])
  } else {
    // Select this category (single selection)
    emit('update:selected', [props.category.id.toString()])
  }
}

// Auto-expand if this category or any child is selected
watch(() => props.selected, (newSelected) => {
  if (props.category.children) {
    const hasSelectedChild = props.category.children.some(child =>
      newSelected.includes(child.id.toString()) ||
      (child.children && child.children.some(grandchild =>
        newSelected.includes(grandchild.id.toString())
      ))
    )
    if (hasSelectedChild) {
      isExpanded.value = true
    }
  }
}, { immediate: true })
</script>