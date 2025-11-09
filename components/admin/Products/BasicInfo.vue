<!--
  Product Basic Info Component

  Handles basic product information fields with mobile optimizations
  Extracted from ProductForm.vue for better maintainability

  Features:
  - Multi-language product name inputs
  - SKU and category selection
  - Mobile-friendly form design
  - Touch optimizations and haptic feedback
-->

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-6">
      {{ $t('admin.products.sections.basicInfo') }}
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Product Name -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ $t('admin.products.fields.name') }} *
        </label>
        <div class="space-y-3">
          <div v-for="locale in locales" :key="locale.code">
            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              {{ locale.name }}
            </label>
            <input
              ref="nameInputs"
              v-model="localForm.name[locale.code]"
              type="text"
              :placeholder="$t('admin.products.placeholders.productName', { language: locale.name })"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white touch-manipulation"
              :class="{
                'border-red-500': errors?.name?.[locale.code],
                'min-h-[44px]': isMobile
              }"
              @input="handleNameInput(locale.code)"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
            />
            <p v-if="errors?.name?.[locale.code]" class="mt-1 text-sm text-red-600">
              {{ errors.name[locale.code] }}
            </p>
          </div>
        </div>
      </div>

      <!-- SKU -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ $t('admin.products.fields.sku') }} *
        </label>
        <div class="relative">
          <input
            ref="skuInput"
            v-model="localForm.sku"
            type="text"
            :placeholder="$t('admin.products.placeholders.sku')"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white touch-manipulation"
            :class="{
              'border-red-500': errors?.sku,
              'min-h-[44px]': isMobile,
              'pr-10': isGeneratingSku
            }"
            @input="handleSkuInput"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
          />
          <!-- Auto-generate SKU button -->
          <UiButton
            v-if="!localForm.sku && localForm.name.es"
            @click="generateSku"
            @touchstart="isMobile && vibrate('tap')"
            type="button"
            variant="ghost"
            size="icon"
            class="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 touch-manipulation"
            :aria-label="$t('admin.products.actions.generateSku')"
          >
            <commonIcon name="lucide:sparkles" class="h-4 w-4" />
          </UiButton>
          <!-- Loading spinner for SKU generation -->
          <div
            v-if="isGeneratingSku"
            class="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <commonIcon name="lucide:refresh-ccw" class="w-4 h-4 animate-spin text-blue-600" />
          </div>
        </div>
        <p v-if="errors?.sku" class="mt-1 text-sm text-red-600">
          {{ errors.sku }}
        </p>
        <p v-if="skuSuggestion" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {{ $t('admin.products.hints.skuSuggestion', { suggestion: skuSuggestion }) }}
        </p>
      </div>

      <!-- Category -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ $t('admin.products.fields.category') }} *
        </label>
        <select
          v-model="localForm.categoryId"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white touch-manipulation"
          :class="{
            'border-red-500': errors?.categoryId,
            'min-h-[44px]': isMobile
          }"
          @change="handleCategoryChange"
          @focus="handleInputFocus"
        >
          <option value="">{{ $t('admin.products.placeholders.selectCategory') }}</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ getLocalizedText(category.name) }}
          </option>
        </select>
        <p v-if="errors?.categoryId" class="mt-1 text-sm text-red-600">
          {{ errors.categoryId }}
        </p>
        <p v-if="selectedCategoryInfo" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {{ selectedCategoryInfo }}
        </p>
      </div>
    </div>

    <!-- Mobile-specific help text -->
    <div v-if="isMobile && showMobileHints" class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <div class="flex items-start space-x-3">
        <commonIcon name="lucide:lightbulb" class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div class="text-sm text-blue-800 dark:text-blue-200">
          <p class="font-medium mb-1">{{ $t('admin.products.hints.mobileTitle') }}</p>
          <ul class="space-y-1 text-xs">
            <li>{{ $t('admin.products.hints.mobile1') }}</li>
            <li>{{ $t('admin.products.hints.mobile2') }}</li>
            <li>{{ $t('admin.products.hints.mobile3') }}</li>
          </ul>
        </div>
        <button
          @click="showMobileHints = false"
          @touchstart="vibrate('tap')"
          class="text-blue-600 dark:text-blue-400 touch-manipulation p-1"
        >
          <commonIcon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryWithChildren } from '~/types/database'

interface Props {
  modelValue: {
    name: Record<string, string>
    sku: string
    categoryId: number | null
  }
  categories: CategoryWithChildren[]
  errors?: Record<string, any>
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: Props['modelValue']): void
  (e: 'validate'): void
  (e: 'sku-generated', sku: string): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

// Composables
const { isMobile } = useDevice()
const { vibrate } = useHapticFeedback()
const { t, locale } = useI18n()

// Template refs
const nameInputs = ref<HTMLInputElement[]>([])
const skuInput = ref<HTMLInputElement>()

// Local state
const localForm = ref({ ...props.modelValue })
const isGeneratingSku = ref(false)
const skuSuggestion = ref('')
const showMobileHints = ref(isMobile.value)
const isFocused = ref(false)

// Locales for multilingual support
const locales = [
  { code: 'es', name: 'Spanish' },
  { code: 'en', name: 'English' },
  { code: 'ro', name: 'Romanian' }
]

// Computed
const selectedCategoryInfo = computed(() => {
  if (!localForm.value.categoryId) return ''

  const category = props.categories.find(c => c.id === localForm.value.categoryId)
  if (!category) return ''

  const productCount = category.products?.length || 0
  return t('admin.products.hints.categoryInfo', { count: productCount })
})

// Utility functions
const getLocalizedText = (text: Record<string, string> | null) => {
  if (!text) return ''
  return text[locale.value] || text.es || Object.values(text)[0] || ''
}

const generateSkuFromName = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .substring(0, 20) // Limit length
    .replace(/-+$/, '') // Remove trailing hyphens
}

// Event handlers
const handleInputFocus = () => {
  isFocused.value = true
  if (isMobile.value) {
    vibrate('tap')
  }
}

const handleInputBlur = () => {
  isFocused.value = false
  emit('validate')
}

const handleNameInput = (localeCode: string) => {
  // Auto-generate SKU suggestion from primary language (Spanish)
  if (localeCode === 'es' && localForm.value.name.es && !localForm.value.sku) {
    skuSuggestion.value = generateSkuFromName(localForm.value.name.es)
  }

  updateModel()

  if (isMobile.value) {
    vibrate('light')
  }
}

const handleSkuInput = () => {
  // Clear suggestion when user types their own SKU
  if (localForm.value.sku) {
    skuSuggestion.value = ''
  }

  updateModel()

  if (isMobile.value) {
    vibrate('light')
  }
}

const handleCategoryChange = () => {
  updateModel()

  if (isMobile.value) {
    vibrate('medium')
  }
}

const generateSku = async () => {
  if (!localForm.value.name.es) return

  isGeneratingSku.value = true

  try {
    // Simulate API call or use actual SKU generation logic
    await new Promise(resolve => setTimeout(resolve, 500))

    const generated = generateSkuFromName(localForm.value.name.es)
    localForm.value.sku = generated
    skuSuggestion.value = ''

    emit('sku-generated', generated)
    updateModel()

    if (isMobile.value) {
      vibrate('success')
    }

    // Focus the SKU input for easy editing
    nextTick(() => {
      skuInput.value?.focus()
    })
  } catch (error) {
    console.error('Failed to generate SKU:', error)

    if (isMobile.value) {
      vibrate('error')
    }
  } finally {
    isGeneratingSku.value = false
  }
}

const updateModel = () => {
  emit('update:modelValue', { ...localForm.value })
}

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  localForm.value = { ...newValue }
}, { deep: true })

// Auto-focus first input on desktop
onMounted(() => {
  if (!isMobile.value && nameInputs.value?.[0]) {
    nextTick(() => {
      setTimeout(() => {
        nameInputs.value[0]?.focus()
      }, 100)
    })
  }
})
</script>

<style scoped>
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Enhanced focus states for accessibility */
input:focus,
select:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px white, 0 0 0 4px rgb(59 130 246);
}

@media (prefers-color-scheme: dark) {
  input:focus,
  select:focus {
    box-shadow: 0 0 0 2px rgb(31 41 55), 0 0 0 4px rgb(59 130 246);
  }
}

/* Mobile keyboard optimization */
@media (max-width: 640px) {
  input[type="text"] {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

/* Smooth transitions */
.transition-colors {
  transition-property: background-color, border-color, color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>