<!--
  Product Pricing Component
  
  Handles product pricing fields with mobile optimizations
  Extracted from ProductForm.vue for better maintainability
  
  Features:
  - Price and compare price inputs with validation
  - Mobile-friendly numeric inputs
  - Real-time discount calculation
  - Touch optimizations and haptic feedback
  - Currency formatting and validation
-->

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-6">
      {{ $t('admin.products.sections.pricing') }}
    </h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Price -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ $t('admin.products.fields.price') }} *
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 dark:text-gray-400">€</span>
          </div>
          <input
            ref="priceInput"
            v-model.number="localForm.price"
            type="number"
            step="0.01"
            min="0"
            :placeholder="$t('admin.products.placeholders.price')"
            class="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white touch-manipulation"
            :class="{ 
              'border-red-500': errors?.price,
              'min-h-[44px]': isMobile
            }"
            @input="handlePriceInput"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
          />
        </div>
        <p v-if="errors?.price" class="mt-1 text-sm text-red-600">
          {{ errors.price }}
        </p>
        <p v-if="formattedPrice && localForm.price" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {{ $t('admin.products.hints.displayPrice', { price: formattedPrice }) }}
        </p>
      </div>

      <!-- Compare Price -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ $t('admin.products.fields.comparePrice') }}
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 dark:text-gray-400">€</span>
          </div>
          <input
            v-model.number="localForm.comparePrice"
            type="number"
            step="0.01"
            min="0"
            :placeholder="$t('admin.products.placeholders.comparePrice')"
            class="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white touch-manipulation"
            :class="{ 
              'border-red-500': errors?.comparePrice,
              'min-h-[44px]': isMobile,
              'border-orange-300 bg-orange-50 dark:bg-orange-900/20': comparePriceWarning
            }"
            @input="handleComparePriceInput"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
          />
          <!-- Warning icon for invalid compare price -->\n          <div\n            v-if="comparePriceWarning"\n            class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"\n          >\n            <commonIcon name="lucide:alert-triangle" class="w-5 h-5 text-orange-500" />\n          </div>\n        </div>\n        <p v-if="errors?.comparePrice" class="mt-1 text-sm text-red-600">\n          {{ errors.comparePrice }}\n        </p>\n        <p v-if="comparePriceWarning" class="mt-1 text-sm text-orange-600 dark:text-orange-400">\n          {{ $t('admin.products.warnings.comparePriceTooLow') }}\n        </p>\n        <p v-if="discountPercentage && !comparePriceWarning" class="mt-1 text-xs text-green-600 dark:text-green-400">\n          {{ $t('admin.products.hints.discount', { percentage: discountPercentage }) }}\n        </p>\n      </div>\n    </div>\n\n    <!-- Pricing Summary Card -->\n    <div v-if="pricingSummary" class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">\n      <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">\n        {{ $t('admin.products.sections.pricingSummary') }}\n      </h4>\n      \n      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">\n        <!-- Current Price -->\n        <div class="text-center">\n          <div class="text-lg font-bold text-gray-900 dark:text-gray-100">\n            {{ formattedPrice }}\n          </div>\n          <div class="text-xs text-gray-500 dark:text-gray-400">\n            {{ $t('admin.products.labels.currentPrice') }}\n          </div>\n        </div>\n        \n        <!-- Original Price (if on sale) -->\n        <div v-if="localForm.comparePrice && discountPercentage" class="text-center">\n          <div class="text-lg font-bold text-gray-500 dark:text-gray-400 line-through">\n            {{ formattedComparePrice }}\n          </div>\n          <div class="text-xs text-gray-500 dark:text-gray-400">\n            {{ $t('admin.products.labels.originalPrice') }}\n          </div>\n        </div>\n        \n        <!-- Discount -->\n        <div v-if="discountPercentage && !comparePriceWarning" class="text-center">\n          <div class="text-lg font-bold text-green-600 dark:text-green-400">\n            -{{ discountPercentage }}%\n          </div>\n          <div class="text-xs text-green-600 dark:text-green-400">\n            {{ $t('admin.products.labels.discount') }}\n          </div>\n        </div>\n      </div>\n      \n      <!-- Profit Margin (if cost is available) -->\n      <div v-if="profitMargin" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">\n        <div class="flex justify-between items-center">\n          <span class="text-sm text-gray-600 dark:text-gray-400">\n            {{ $t('admin.products.labels.profitMargin') }}\n          </span>\n          <span \n            class="text-sm font-medium"\n            :class="{\n              'text-green-600 dark:text-green-400': profitMargin >= 20,\n              'text-yellow-600 dark:text-yellow-400': profitMargin >= 10 && profitMargin < 20,\n              'text-red-600 dark:text-red-400': profitMargin < 10\n            }"\n          >\n            {{ profitMargin }}%\n          </span>\n        </div>\n      </div>\n    </div>\n\n    <!-- Mobile Price Preview -->\n    <div v-if="isMobile && (localForm.price || localForm.comparePrice)" class="mt-6">\n      <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">\n        <div class="flex items-center mb-2">\n          <commonIcon name="lucide:smartphone" class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />\n          <span class="text-sm font-medium text-blue-800 dark:text-blue-200">\n            {{ $t('admin.products.preview.mobileTitle') }}\n          </span>\n        </div>\n        \n        <div class="flex items-center space-x-2">\n          <!-- Current Price -->\n          <span class="text-lg font-bold text-blue-900 dark:text-blue-100">\n            {{ formattedPrice }}\n          </span>\n          \n          <!-- Compare Price -->\n          <span v-if="localForm.comparePrice && discountPercentage" class="text-sm text-gray-500 line-through">\n            {{ formattedComparePrice }}\n          </span>\n          \n          <!-- Discount Badge -->\n          <span v-if="discountPercentage && !comparePriceWarning" class="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">\n            -{{ discountPercentage }}%\n          </span>\n        </div>\n        \n        <p class="text-xs text-blue-700 dark:text-blue-300 mt-2">\n          {{ $t('admin.products.preview.mobileDescription') }}\n        </p>\n      </div>\n    </div>\n\n    <!-- Pricing Tips for Mobile -->\n    <div v-if="isMobile && showPricingTips" class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">\n      <div class="flex items-start space-x-3">\n        <commonIcon name="lucide:euro" class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />\n        <div class="text-sm text-green-800 dark:text-green-200">\n          <p class="font-medium mb-1">{{ $t('admin.products.tips.pricingTitle') }}</p>\n          <ul class="space-y-1 text-xs">\n            <li>{{ $t('admin.products.tips.pricing1') }}</li>\n            <li>{{ $t('admin.products.tips.pricing2') }}</li>\n            <li>{{ $t('admin.products.tips.pricing3') }}</li>\n          </ul>\n        </div>\n        <button\n          @click="showPricingTips = false"\n          @touchstart="vibrate('tap')"\n          class="text-green-600 dark:text-green-400 touch-manipulation p-1"\n        >\n          <commonIcon name="lucide:x" class="w-4 h-4" />\n        </button>\n      </div>\n    </div>\n  </div>\n</template>\n\n<script setup lang="ts">\ninterface Props {\n  modelValue: {\n    price: number\n    comparePrice: number | null\n  }\n  errors?: Record<string, any>\n  disabled?: boolean\n  costPrice?: number // Optional cost price for profit margin calculation\n}\n\ninterface Emits {\n  (e: 'update:modelValue', value: Props['modelValue']): void\n  (e: 'validate'): void\n  (e: 'price-calculated', data: { discount?: number, margin?: number }): void\n}\n\nconst props = withDefaults(defineProps<Props>(), {\n  disabled: false\n})\n\nconst emit = defineEmits<Emits>()\n\n// Composables\nconst { isMobile } = useDevice()\nconst { vibrate } = useHapticFeedback()\nconst { t } = useI18n()\n\n// Template refs\nconst priceInput = ref<HTMLInputElement>()\n\n// Local state\nconst localForm = ref({ ...props.modelValue })\nconst showPricingTips = ref(isMobile.value)\nconst isFocused = ref(false)\n\n// Computed\nconst formattedPrice = computed(() => {\n  if (!localForm.value.price) return ''\n  return new Intl.NumberFormat('en-US', {\n    style: 'currency',\n    currency: 'EUR'\n  }).format(localForm.value.price)\n})\n\nconst formattedComparePrice = computed(() => {\n  if (!localForm.value.comparePrice) return ''\n  return new Intl.NumberFormat('en-US', {\n    style: 'currency',\n    currency: 'EUR'\n  }).format(localForm.value.comparePrice)\n})\n\nconst discountPercentage = computed(() => {\n  if (!localForm.value.price || !localForm.value.comparePrice) return null\n  if (localForm.value.comparePrice <= localForm.value.price) return null\n  \n  const discount = Math.round(\n    ((localForm.value.comparePrice - localForm.value.price) / localForm.value.comparePrice) * 100\n  )\n  \n  return discount > 0 ? discount : null\n})\n\nconst comparePriceWarning = computed(() => {\n  if (!localForm.value.price || !localForm.value.comparePrice) return false\n  return localForm.value.comparePrice <= localForm.value.price\n})\n\nconst profitMargin = computed(() => {\n  if (!props.costPrice || !localForm.value.price) return null\n  if (props.costPrice >= localForm.value.price) return 0\n  \n  return Math.round(\n    ((localForm.value.price - props.costPrice) / localForm.value.price) * 100\n  )\n})\n\nconst pricingSummary = computed(() => {\n  return localForm.value.price || localForm.value.comparePrice\n})\n\n// Event handlers\nconst handleInputFocus = () => {\n  isFocused.value = true\n  if (isMobile.value) {\n    vibrate('tap')\n  }\n}\n\nconst handleInputBlur = () => {\n  isFocused.value = false\n  emit('validate')\n}\n\nconst handlePriceInput = () => {\n  // Ensure price is not negative\n  if (localForm.value.price < 0) {\n    localForm.value.price = 0\n  }\n  \n  updateModel()\n  emitCalculations()\n  \n  if (isMobile.value) {\n    vibrate('light')\n  }\n}\n\nconst handleComparePriceInput = () => {\n  // Ensure compare price is not negative\n  if (localForm.value.comparePrice && localForm.value.comparePrice < 0) {\n    localForm.value.comparePrice = 0\n  }\n  \n  updateModel()\n  emitCalculations()\n  \n  if (isMobile.value) {\n    vibrate('light')\n  }\n}\n\nconst updateModel = () => {\n  emit('update:modelValue', { ...localForm.value })\n}\n\nconst emitCalculations = () => {\n  const data: { discount?: number, margin?: number } = {}\n  \n  if (discountPercentage.value) {\n    data.discount = discountPercentage.value\n  }\n  \n  if (profitMargin.value !== null) {\n    data.margin = profitMargin.value\n  }\n  \n  emit('price-calculated', data)\n}\n\n// Watch for prop changes\nwatch(() => props.modelValue, (newValue) => {\n  localForm.value = { ...newValue }\n}, { deep: true })\n\n// Watch for compare price warnings and provide haptic feedback\nwatch(comparePriceWarning, (hasWarning) => {\n  if (hasWarning && isMobile.value) {\n    vibrate('warning')\n  }\n})\n\n// Auto-focus price input on desktop\nonMounted(() => {\n  if (!isMobile.value && priceInput.value) {\n    nextTick(() => {\n      setTimeout(() => {\n        priceInput.value?.focus()\n      }, 100)\n    })\n  }\n})\n</script>\n\n<style scoped>\n.touch-manipulation {\n  touch-action: manipulation;\n  -webkit-tap-highlight-color: transparent;\n}\n\n/* Enhanced focus states for accessibility */\ninput:focus {\n  @apply ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800;\n}\n\n/* Mobile number input optimization */\n@media (max-width: 640px) {\n  input[type="number"] {\n    font-size: 16px; /* Prevents zoom on iOS */\n  }\n}\n\n/* Smooth transitions */\n.transition-colors {\n  transition-property: background-color, border-color, color;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 200ms;\n}\n\n/* Number input styling */\ninput[type="number"]::-webkit-outer-spin-button,\ninput[type="number"]::-webkit-inner-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\n\ninput[type="number"] {\n  -moz-appearance: textfield;\n}\n</style>"