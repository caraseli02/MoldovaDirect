<template>
  <div class="filter-content space-y-6">
    <!-- Active Filters -->
    <div v-if="hasActiveFilters" class="filter-section">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
        {{ $t('products.filters.active') }}
      </h3>
      <div class="flex flex-wrap gap-2">
        <ProductFilterTag
          v-for="filter in activeFilters"
          :key="filter.id"
          :label="filter.label"
          @remove="removeFilter(filter.id, filter.type, filter.value)"
        />
      </div>
    </div>

    <!-- Category Filter -->
    <div v-if="availableFilters.categories.length > 0" class="filter-section">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
        {{ $t('products.filters.categories') }}
      </h3>
      <ProductCategoryTree
        :categories="availableFilters.categories"
        :selected="selectedCategories"
        @update:selected="updateCategoryFilter"
      />
    </div>

    <!-- Price Range Filter -->
    <div v-if="availableFilters.priceRange" class="filter-section">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
        {{ $t('products.filters.priceRange') }}
      </h3>
      <ProductPriceRangeSlider
        :min="availableFilters.priceRange.min"
        :max="availableFilters.priceRange.max"
        :value="[localFilters.priceMin || availableFilters.priceRange.min, localFilters.priceMax || availableFilters.priceRange.max]"
        @update:value="updatePriceRange"
      />
    </div>

    <!-- Stock Filter -->
    <div class="filter-section">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
        {{ $t('products.filters.availability') }}
      </h3>
      <div class="space-y-2">
        <label class="flex items-center">
          <input
            v-model="localFilters.inStock"
            type="checkbox"
            class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
            @change="updateFilters({ inStock: localFilters.inStock })"
          >
          <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
            {{ $t('products.filters.inStockOnly') }}
          </span>
        </label>
        <label class="flex items-center">
          <input
            v-model="localFilters.featured"
            type="checkbox"
            class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
            @change="updateFilters({ featured: localFilters.featured })"
          >
          <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
            {{ $t('products.filters.featuredOnly') }}
          </span>
        </label>
      </div>
    </div>

    <!-- Attribute Filters -->
    <div
      v-for="attribute in availableFilters.attributes"
      :key="attribute.name"
      class="filter-section"
    >
      <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
        {{ attribute.label }}
      </h3>
      <ProductAttributeCheckboxGroup
        :options="attribute.values"
        :selected="localFilters.attributes?.[attribute.name] || []"
        @update:selected="updateAttributeFilter(attribute.name, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductFilters, CategoryFilter, AttributeFilter, PriceRange } from '~/types'

interface ActiveFilter {
  id: string
  label: string
  type: 'category' | 'price' | 'stock' | 'featured' | 'attribute'
  value?: any
}

interface Props {
  filters: ProductFilters
  availableFilters: {
    categories: CategoryFilter[]
    priceRange: PriceRange
    attributes: AttributeFilter[]
  }
}

interface Emits {
  (e: 'update:filters', filters: ProductFilters): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { t } = useI18n()

// Local reactive state
const localFilters = ref<ProductFilters>({ ...props.filters })

// Computed properties
const selectedCategories = computed(() => {
  if (typeof localFilters.value.category === 'string') {
    return [localFilters.value.category]
  } else if (typeof localFilters.value.category === 'number') {
    return [localFilters.value.category.toString()]
  }
  return []
})

const hasActiveFilters = computed(() => {
  return !!(
    localFilters.value.category ||
    localFilters.value.priceMin ||
    localFilters.value.priceMax ||
    localFilters.value.inStock ||
    localFilters.value.featured ||
    (localFilters.value.attributes && Object.keys(localFilters.value.attributes).length > 0)
  )
})

const activeFilters = computed((): ActiveFilter[] => {
  const filters: ActiveFilter[] = []

  // Category filter
  if (localFilters.value.category) {
    const categoryName = getCategoryName(localFilters.value.category)
    filters.push({
      id: 'category',
      label: categoryName,
      type: 'category'
    })
  }

  // Price range filter
  if (localFilters.value.priceMin || localFilters.value.priceMax) {
    const min = localFilters.value.priceMin || props.availableFilters.priceRange.min
    const max = localFilters.value.priceMax || props.availableFilters.priceRange.max
    filters.push({
      id: 'price',
      label: `€${min} - €${max}`,
      type: 'price'
    })
  }

  // Stock filter
  if (localFilters.value.inStock) {
    filters.push({
      id: 'stock',
      label: t('products.filters.inStockOnly'),
      type: 'stock'
    })
  }

  // Featured filter
  if (localFilters.value.featured) {
    filters.push({
      id: 'featured',
      label: t('products.filters.featuredOnly'),
      type: 'featured'
    })
  }

  // Attribute filters
  if (localFilters.value.attributes) {
    Object.entries(localFilters.value.attributes).forEach(([attributeName, values]) => {
      if (values.length > 0) {
        const attribute = props.availableFilters.attributes.find(a => a.name === attributeName)
        values.forEach(value => {
          const option = attribute?.values.find(v => v.value === value)
          if (option) {
            filters.push({
              id: `${attributeName}-${value}`,
              label: `${attribute.label}: ${option.label}`,
              type: 'attribute',
              value: { attributeName, value }
            })
          }
        })
      }
    })
  }

  return filters
})

// Methods
const getCategoryName = (categoryId: string | number): string => {
  const findCategory = (categories: CategoryFilter[], id: string | number): CategoryFilter | undefined => {
    for (const category of categories) {
      if (category.id.toString() === id.toString()) {
        return category
      }
      if (category.children) {
        const found = findCategory(category.children, id)
        if (found) return found
      }
    }
    return undefined
  }

  const category = findCategory(props.availableFilters.categories, categoryId)
  return category?.name || t('products.filters.unknownCategory')
}

const updateFilters = (newFilters: Partial<ProductFilters>) => {
  localFilters.value = { ...localFilters.value, ...newFilters }
  emit('update:filters', localFilters.value)
}

const updateCategoryFilter = (categories: string[]) => {
  const category = categories.length > 0 ? categories[0] : undefined
  updateFilters({ category })
}

const updatePriceRange = (range: [number, number]) => {
  const [min, max] = range
  const { min: availableMin, max: availableMax } = props.availableFilters.priceRange
  
  updateFilters({
    priceMin: min > availableMin ? min : undefined,
    priceMax: max < availableMax ? max : undefined
  })
}

const updateAttributeFilter = (attributeName: string, values: string[]) => {
  const attributes = { ...localFilters.value.attributes }
  
  if (values.length > 0) {
    attributes[attributeName] = values
  } else {
    delete attributes[attributeName]
  }
  
  updateFilters({ attributes })
}

const removeFilter = (id: string, type: string, value?: any) => {
  switch (type) {
    case 'category':
      updateFilters({ category: undefined })
      break
    case 'price':
      updateFilters({ priceMin: undefined, priceMax: undefined })
      break
    case 'stock':
      updateFilters({ inStock: false })
      break
    case 'featured':
      updateFilters({ featured: false })
      break
    case 'attribute':
      if (value) {
        const { attributeName, value: attributeValue } = value
        const currentValues = localFilters.value.attributes?.[attributeName] || []
        const newValues = currentValues.filter(v => v !== attributeValue)
        updateAttributeFilter(attributeName, newValues)
      }
      break
  }
}

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })
</script>

