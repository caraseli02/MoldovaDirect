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
  showTitle: true
})

const emit = defineEmits<Emits>()

// Composables
const { isMobile } = useDevice()
const { t } = useI18n()

// Reactive state
const showMobileFilters = ref(false)
const localFilters = ref<ProductFilters>({ ...props.filters })

// Computed properties
const hasActiveFilters = computed(() => {
  return !!(
    localFilters.value.category ||
    localFilters.value.search ||
    localFilters.value.priceMin ||
    localFilters.value.priceMax ||
    localFilters.value.inStock ||
    localFilters.value.featured ||
    (localFilters.value.attributes && Object.keys(localFilters.value.attributes).length > 0)
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  if (localFilters.value.category) count++
  if (localFilters.value.priceMin || localFilters.value.priceMax) count++
  if (localFilters.value.inStock) count++
  if (localFilters.value.featured) count++
  if (localFilters.value.attributes) {
    count += Object.values(localFilters.value.attributes).filter(arr => arr.length > 0).length
  }
  return count
})

// Methods
const updateFilters = (newFilters: Partial<ProductFilters>) => {
  localFilters.value = { ...localFilters.value, ...newFilters }
  if (!isMobile.value) {
    emit('update:filters', localFilters.value)
  }
}

const applyFilters = () => {
  emit('update:filters', localFilters.value)
  emit('apply-filters')
  if (isMobile.value) {
    showMobileFilters.value = false
  }
}

const clearAllFilters = () => {
  localFilters.value = {}
  emit('update:filters', {})
  emit('apply-filters')
}

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

// Close mobile filters on escape key
const setupEscapeHandler = () => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && showMobileFilters.value) {
      showMobileFilters.value = false
    }
  }

  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
}

onMounted(setupEscapeHandler)
</script>
