<template>
  <div class="mobile-category-item">
    <div 
      class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
      :class="{ 
        'bg-blue-50 text-blue-600': isCurrentCategory,
        'pl-6': level === 1,
        'pl-9': level === 2,
        'pl-12': level >= 3
      }"
    >
      <button
        class="flex items-center flex-1 text-left"
        @click="handleCategoryClick"
      >
        <button
          v-if="category.children && category.children.length > 0"
          @click.stop="toggleExpanded"
          class="mr-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon 
            :name="isExpanded ? 'heroicons:chevron-down' : 'heroicons:chevron-right'" 
            class="w-4 h-4" 
          />
        </button>
        <div v-else class="w-6" />
        
        <Icon v-if="category.icon" :name="category.icon" class="w-5 h-5 mr-3" />
        <span class="font-medium">{{ category.name }}</span>
      </button>
      
      <div class="flex items-center space-x-2">
        <span v-if="showProductCount" class="text-sm text-gray-500">
          {{ category.productCount }}
        </span>
        <Icon 
          v-if="isCurrentCategory"
          name="heroicons:check" 
          class="w-5 h-5 text-blue-600" 
        />
      </div>
    </div>
    
    <!-- Children -->
    <div
      v-if="category.children && category.children.length > 0 && isExpanded"
      class="mt-1 space-y-1"
    >
      <MobileCategoryItem
        v-for="child in category.children"
        :key="child.id"
        :category="child"
        :current-category="currentCategory"
        :show-product-count="showProductCount"
        :level="level + 1"
        @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryWithChildren } from '~/types'

interface Props {
  category: CategoryWithChildren
  currentCategory?: string
  showProductCount?: boolean
  level: number
}

interface Emits {
  (e: 'select', category: CategoryWithChildren): void
}

const props = withDefaults(defineProps<Props>(), {
  showProductCount: true
})

const emit = defineEmits<Emits>()

// Local state
const isExpanded = ref(false)

// Computed properties
const isCurrentCategory = computed(() => {
  return props.category.id.toString() === props.currentCategory || 
         props.category.slug === props.currentCategory
})

// Methods
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const handleCategoryClick = () => {
  emit('select', props.category)
}

// Auto-expand if this category or any child is selected
watch(() => props.currentCategory, (newCategory) => {
  if (newCategory && props.category.children) {
    const hasSelectedChild = (categories: CategoryWithChildren[]): boolean => {
      return categories.some(child => 
        child.id.toString() === newCategory || 
        child.slug === newCategory ||
        (child.children && hasSelectedChild(child.children))
      )
    }
    
    if (hasSelectedChild(props.category.children)) {
      isExpanded.value = true
    }
  }
}, { immediate: true })
</script>