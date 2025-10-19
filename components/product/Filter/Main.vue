<template>
  <div class="product-filter">
    <!-- Desktop Sidebar -->
    <aside
      v-if="!isMobile"
      class="hidden lg:block w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto"
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-6" :class="{ 'justify-end': !showTitle }">
          <h2 v-if="showTitle" class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('products.filters.title') }}
          </h2>
          <button
            v-if="hasActiveFilters"
            @click="clearAllFilters"
            class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            {{ $t('products.filters.clearAll') }}
          </button>
        </div>

        <productFilterContent
          :filters="localFilters"
          :available-filters="availableFilters"
          @update:filters="updateFilters"
        />
      </div>
    </aside>

    <!-- Mobile Filter Button -->
    <button
      v-if="isMobile"
      @click="showMobileFilters = true"
      class="lg:hidden fixed bottom-4 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
    >
      <commonIcon name="heroicons:funnel" class="w-6 h-6" />
      <span v-if="activeFilterCount > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {{ activeFilterCount }}
      </span>
    </button>

    <!-- Mobile Filter Modal -->
    <Teleport to="body">
      <div
        v-if="showMobileFilters"
        class="fixed inset-0 z-50 lg:hidden"
        @click="showMobileFilters = false"
      >
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

        <div
          class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl max-h-[80vh] overflow-hidden transform transition-transform"
          :class="showMobileFilters ? 'translate-y-0' : 'translate-y-full'"
          @click.stop
        >
          <!-- Mobile Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 v-if="showTitle" class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ $t('products.filters.title') }}
            </h2>
            <div class="flex items-center space-x-2">
              <button
                v-if="hasActiveFilters"
                @click="clearAllFilters"
                class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                {{ $t('products.filters.clearAll') }}
              </button>
              <button
                @click="showMobileFilters = false"
                class="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
              >
                <commonIcon name="heroicons:x-mark" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Mobile Filter Content -->
          <div class="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
            <productFilterContent
              :filters="localFilters"
              :available-filters="availableFilters"
              @update:filters="updateFilters"
            />
          </div>

          <!-- Mobile Actions -->
          <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div class="flex space-x-3">
              <button
                @click="applyFilters"
                class="flex-1 bg-blue-600 dark:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
              >
                {{ $t('products.filters.apply') }} ({{ filteredProductCount }})
              </button>
              <button
                @click="showMobileFilters = false"
                class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {{ $t('common.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
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
