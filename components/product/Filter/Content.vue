<template>
  <div class="space-y-8">
    <!-- Price Range Filter -->
    <div
      v-if="availableFilters.priceRange"
      class="space-y-4"
    >
      <UiLabel class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {{ $t('products.filters.priceRange') }}
      </UiLabel>

      <div class="space-y-6">
        <UiSlider
          :model-value="[localFilters.priceMin || availableFilters.priceRange.min, localFilters.priceMax || availableFilters.priceRange.max]"
          :min="availableFilters.priceRange.min"
          :max="availableFilters.priceRange.max"
          :step="1"
          class="w-full"
          @update:model-value="(v) => v && updatePriceRange(v)"
        />

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <UiLabel
              for="price-min"
              class="text-sm text-zinc-600 dark:text-zinc-400"
            >
              {{ $t('products.filters.minPrice') }}
            </UiLabel>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-600 dark:text-zinc-400">€</span>
              <UiInput
                id="price-min"
                type="number"
                :model-value="localFilters.priceMin || availableFilters.priceRange.min"
                :min="availableFilters.priceRange.min"
                :max="localFilters.priceMax || availableFilters.priceRange.max"
                class="pl-7"
                @update:model-value="updateMinPrice"
              />
            </div>
          </div>

          <div class="space-y-2">
            <UiLabel
              for="price-max"
              class="text-sm text-zinc-600 dark:text-zinc-400"
            >
              {{ $t('products.filters.maxPrice') }}
            </UiLabel>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-600 dark:text-zinc-400">€</span>
              <UiInput
                id="price-max"
                type="number"
                :model-value="localFilters.priceMax || availableFilters.priceRange.max"
                :min="localFilters.priceMin || availableFilters.priceRange.min"
                :max="availableFilters.priceRange.max"
                class="pl-7"
                @update:model-value="updateMaxPrice"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Availability Filter -->
    <div class="space-y-4">
      <UiLabel class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {{ $t('products.filters.availability') }}
      </UiLabel>

      <div class="space-y-3">
        <div class="flex items-center justify-between rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
          <UiLabel
            for="filter-in-stock"
            class="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer"
          >
            {{ $t('products.filters.inStockOnly') }}
          </UiLabel>
          <UiCheckbox
            id="filter-in-stock"
            :model-value="localFilters.inStock ?? false"
            @update:model-value="(val) => updateFilters({ inStock: val === true })"
          />
        </div>

        <div class="flex items-center justify-between rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
          <UiLabel
            for="filter-featured"
            class="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer"
          >
            {{ $t('products.filters.featuredOnly') }}
          </UiLabel>
          <UiCheckbox
            id="filter-featured"
            :model-value="localFilters.featured ?? false"
            @update:model-value="(val) => updateFilters({ featured: val === true })"
          />
        </div>
      </div>
    </div>

    <!-- Category Filter -->
    <div
      v-if="availableFilters.categories && availableFilters.categories.length > 0"
      class="space-y-4"
    >
      <UiLabel class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {{ $t('products.filters.categories') }}
      </UiLabel>

      <div class="space-y-2">
        <div
          v-for="category in availableFilters.categories"
          :key="category.id"
          class="flex items-center justify-between rounded-lg p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
        >
          <UiLabel
            :for="`category-${category.id}`"
            class="text-sm text-zinc-900 dark:text-zinc-100 cursor-pointer flex-1"
          >
            {{ getCategoryName(category) }}
          </UiLabel>
          <span
            v-if="category.count"
            class="text-sm text-zinc-500 dark:text-zinc-400 mr-3"
          >
            {{ category.count }}
          </span>
          <UiCheckbox
            :id="`category-${category.id}`"
            :checked="selectedCategories.includes(category.id.toString())"
            @update:checked="toggleCategory(category.id)"
          />
        </div>
      </div>
    </div>

    <!-- Attribute Filters -->
    <div
      v-for="attribute in availableFilters.attributes"
      :key="attribute.name"
      class="space-y-4"
    >
      <UiLabel class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {{ attribute.label }}
      </UiLabel>

      <div class="space-y-2">
        <div
          v-for="option in attribute.values"
          :key="option.value"
          class="flex items-center justify-between rounded-lg p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
        >
          <UiLabel
            :for="`${attribute.name}-${option.value}`"
            class="text-sm text-zinc-900 dark:text-zinc-100 cursor-pointer flex-1"
          >
            {{ option.label }}
          </UiLabel>
          <UiCheckbox
            :id="`${attribute.name}-${option.value}`"
            :checked="isAttributeSelected(attribute.name, option.value)"
            @update:checked="toggleAttribute(attribute.name, option.value)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductFilters, CategoryFilter, AttributeFilter, PriceRange } from '~/types'

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
const { locale } = useI18n()

// Local reactive state
const localFilters = ref<ProductFilters>({ ...props.filters })

// Computed properties
const selectedCategories = computed(() => {
  const category = localFilters.value.category
  if (category == null) return []
  return [String(category)]
})

// Methods
const getCategoryName = (category: CategoryFilter): string => {
  const categoryName = category.name
  if (typeof categoryName === 'string') {
    return categoryName
  }
  if (categoryName && typeof categoryName === 'object') {
    return categoryName[locale.value] || categoryName.es || categoryName.en || ''
  }
  return ''
}

const updateFilters = (newFilters: Partial<ProductFilters>) => {
  localFilters.value = { ...localFilters.value, ...newFilters }
  emit('update:filters', localFilters.value)
}

const updatePriceRange = (range: number[]) => {
  // Validate array structure
  if (!Array.isArray(range) || range.length !== 2) {
    console.warn('[Filter/Content] updatePriceRange received invalid range:', range)
    return
  }

  const [min, max] = range

  // Validate numeric values
  if (typeof min !== 'number' || typeof max !== 'number' || Number.isNaN(min) || Number.isNaN(max)) {
    console.warn('[Filter/Content] updatePriceRange received non-numeric values:', { min, max })
    return
  }

  const { min: availableMin, max: availableMax } = props.availableFilters.priceRange

  updateFilters({
    priceMin: availableMin !== undefined && min > availableMin ? min : undefined,
    priceMax: availableMax !== undefined && max < availableMax ? max : undefined,
  })
}

const updateMinPrice = (value: string | number) => {
  const numValue = typeof value === 'string' ? Number.parseFloat(value) : value
  if (Number.isNaN(numValue)) return

  const { min: availableMin } = props.availableFilters.priceRange
  updateFilters({
    priceMin: availableMin !== undefined && numValue > availableMin ? numValue : undefined,
  })
}

const updateMaxPrice = (value: string | number) => {
  const numValue = typeof value === 'string' ? Number.parseFloat(value) : value
  if (Number.isNaN(numValue)) return

  const { max: availableMax } = props.availableFilters.priceRange
  updateFilters({
    priceMax: availableMax !== undefined && numValue < availableMax ? numValue : undefined,
  })
}

const toggleCategory = (categoryId: number | string) => {
  const isSelected = selectedCategories.value.includes(categoryId.toString())
  updateFilters({ category: isSelected ? undefined : categoryId })
}

const isAttributeSelected = (attributeName: string, value: string): boolean => {
  const values = localFilters.value.attributes?.[attributeName] || []
  return values.includes(value)
}

const toggleAttribute = (attributeName: string, value: string) => {
  const currentValues = localFilters.value.attributes?.[attributeName] || []
  const newValues = currentValues.includes(value)
    ? currentValues.filter(v => v !== value)
    : [...currentValues, value]

  const { [attributeName]: _, ...rest } = localFilters.value.attributes || {}
  const attributes = newValues.length > 0
    ? { ...rest, [attributeName]: newValues }
    : rest

  updateFilters({ attributes })
}

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })
</script>
