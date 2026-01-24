<template>
  <div class="category-tree-item">
    <div
      class="flex items-center py-1"
      :class="{ 'pl-4': level > 0 }"
    >
      <UiButton
        v-if="category.children && category.children.length > 0"
        variant="ghost"
        size="icon"
        class="mr-2 h-6 w-6"
        :aria-label="isExpanded ? $t('common.collapse') : $t('common.expand')"
        @click="toggleExpanded"
      >
        <commonIcon
          :name="isExpanded ? 'lucide:chevron-down' : 'lucide:chevron-right'"
          class="h-4 w-4"
        />
      </UiButton>
      <div
        v-else
        class="w-6"
      ></div>

      <div
        class="flex items-center gap-2 flex-1 cursor-pointer"
        @click="handleSelection"
      >
        <!-- Custom radio button styling -->
        <div class="size-4 rounded-full border border-input shrink-0 flex items-center justify-center relative">
          <div
            v-if="isSelected"
            class="size-2 rounded-full bg-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          ></div>
        </div>
        <span class="text-sm text-gray-700 dark:text-gray-300 flex-1">
          {{ category.name }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          ({{ category.count }})
        </span>
      </div>
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
  }
  else {
    // Select this category (single selection)
    emit('update:selected', [props.category.id.toString()])
  }
}

// Auto-expand if this category or any child is selected
watch(() => props.selected, (newSelected) => {
  if (props.category.children) {
    const hasSelectedChild = props.category.children.some(child =>
      newSelected.includes(child.id.toString())
      || (child.children && child.children.some(grandchild =>
        newSelected.includes(grandchild.id.toString()),
      )),
    )
    if (hasSelectedChild) {
      isExpanded.value = true
    }
  }
}, { immediate: true })
</script>
