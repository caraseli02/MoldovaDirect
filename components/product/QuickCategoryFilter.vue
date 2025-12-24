<template>
  <div class="relative">
    <!-- Horizontal scrollable container -->
    <div
      ref="scrollContainer"
      class="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide"
    >
      <!-- All Categories Button -->
      <button
        type="button"
        :class="[
          'shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
          !selectedCategory
            ? 'bg-primary-600 text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
        ]"
        @click="selectCategory(undefined)"
      >
        {{ $t('products.quickFilters.all') }}
      </button>

      <!-- Category Pills -->
      <button
        v-for="category in rootCategories"
        :key="category.id"
        type="button"
        :class="[
          'shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap',
          String(selectedCategory) === String(category.id)
            ? 'bg-primary-600 text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
        ]"
        @click="selectCategory(String(category.id))"
      >
        {{ getLocalizedName(category.name) }}
        <span
          v-if="category.productCount"
          class="ml-1.5 text-xs opacity-70"
        >
          ({{ category.productCount }})
        </span>
      </button>

      <!-- More Filters Button -->
      <button
        type="button"
        class="shrink-0 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
        @click="$emit('open-filters')"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        {{ $t('products.quickFilters.moreFilters') }}
        <span
          v-if="activeFilterCount > 0"
          class="ml-1 px-1.5 py-0.5 bg-primary-600 text-white text-xs rounded-full"
        >
          {{ activeFilterCount }}
        </span>
      </button>
    </div>

    <!-- Fade edges indicator -->
    <div
      v-if="showLeftFade"
      class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 dark:from-gray-950 to-transparent pointer-events-none"
    ></div>
    <div
      v-if="showRightFade"
      class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 dark:from-gray-950 to-transparent pointer-events-none"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface CategoryItem {
  id: number
  name: Record<string, string>
  slug: string
  productCount: number
  children?: CategoryItem[]
}

interface Props {
  categories: CategoryItem[]
  selectedCategory?: string | number
  activeFilterCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  selectedCategory: undefined,
  activeFilterCount: 0,
})

const emit = defineEmits<{
  'update:selectedCategory': [category: string | undefined]
  'open-filters': []
}>()

const { locale } = useI18n()

// Template refs
const scrollContainer = ref<HTMLElement>()

// State for fade indicators
const showLeftFade = ref(false)
const showRightFade = ref(true)

// Get only root-level categories (no nested)
const rootCategories = computed(() => {
  return props.categories.slice(0, 6) // Limit to 6 for horizontal space
})

// Get localized category name
const getLocalizedName = (name: Record<string, string>): string => {
  if (!name) return ''
  const localeText = name[locale.value]
  if (localeText) return localeText
  // Fallback to Spanish, then any available
  const esText = name.es
  if (esText) return esText
  const values = Object.values(name).filter((v): v is string => typeof v === 'string')
  return values[0] || ''
}

// Handle category selection
const selectCategory = (categoryId: string | undefined) => {
  emit('update:selectedCategory', categoryId)
}

// Update fade indicators based on scroll position
const updateFadeIndicators = () => {
  if (!scrollContainer.value) return

  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
  showLeftFade.value = scrollLeft > 10
  showRightFade.value = scrollLeft < scrollWidth - clientWidth - 10
}

// Setup scroll listener
onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', updateFadeIndicators, { passive: true })
    updateFadeIndicators()
  }
})

onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', updateFadeIndicators)
  }
})
</script>
