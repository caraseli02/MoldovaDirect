<template>
  <!-- Just render the filter content directly without any wrapper modal -->
  <productFilterContent
    :filters="localFilters"
    :available-filters="availableFilters"
    @update:filters="updateFilters"
  />
</template>

<script setup lang="ts">
import type { ProductFilters, CategoryFilter, AttributeFilter, PriceRange } from '~/types'
import ProductFilterContent from '~/components/product/Filter/Content.vue'

interface Props {
  filters: ProductFilters
  availableFilters: {
    categories: CategoryFilter[]
    priceRange: PriceRange
    attributes: AttributeFilter[]
  }
  filteredProductCount?: number
  showTitle?: boolean
}

interface Emits {
  (e: 'update:filters', filters: ProductFilters): void
  (e: 'apply-filters'): void
}

const props = withDefaults(defineProps<Props>(), {
  filteredProductCount: 0,
  showTitle: true,
})

const emit = defineEmits<Emits>()

// Reactive state
const localFilters = ref<ProductFilters>({ ...props.filters })

// Methods
const updateFilters = (newFilters: Partial<ProductFilters>) => {
  localFilters.value = { ...localFilters.value, ...newFilters }
  // Always emit filter updates - parent decides when to fetch
  emit('update:filters', localFilters.value)
}

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })
</script>
