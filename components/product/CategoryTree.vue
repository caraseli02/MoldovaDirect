<template>
  <div class="category-tree">
    <div class="space-y-1">
      <CategoryTreeItem
        v-for="category in categories"
        :key="category.id"
        :category="category"
        :selected="selected"
        :level="0"
        @update:selected="$emit('update:selected', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryFilter } from '~/types'

interface Props {
  categories: CategoryFilter[]
  selected: string[]
}

interface Emits {
  (e: 'update:selected', selected: string[]): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>