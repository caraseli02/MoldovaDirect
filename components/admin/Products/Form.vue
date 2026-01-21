<template>
  <form
    class="space-y-4 md:space-y-8 pb-24 md:pb-0"
    @submit.prevent="handleSubmit"
  >
    <!-- Basic Information -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <UiButton
        type="button"
        @click="toggleSection('basic')"
      >
        <h3 class="text-base md:text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <span class="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs md:text-sm font-semibold mr-3">1</span>
          Basic Information
        </h3>
        <svg
          class="w-5 h-5 md:w-6 md:h-6 text-gray-500 transform transition-transform"
          :class="{ 'rotate-180': expandedSections.basic }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </UiButton>

      <div
        v-show="expandedSections.basic"
        class="px-4 pb-4 md:px-6 md:pb-6 space-y-4 md:space-y-6"
      >
        <div class="grid grid-cols-1 gap-4 md:gap-6">
          <!-- Product Name -->
          <div>
            <UiLabel>Product Name *</UiLabel>
            <div class="space-y-3">
              <div
                v-for="locale in locales"
                :key="locale.code"
              >
                <UiLabel>{{ locale.name }}</UiLabel>
                <UiInput
                  v-model="form.name[locale.code]"
                  type="text"
                  :placeholder="`Product name in ${locale.name}`"
                  :class="{ 'border-red-500': errors.name?.[locale.code] }"
                />
                <p
                  v-if="errors.name?.[locale.code]"
                  class="mt-1 text-sm text-red-600"
                >
                  {{ errors.name[locale.code] }}
                </p>
              </div>
            </div>
          </div>

          <!-- SKU -->
          <div>
            <UiLabel>SKU *</UiLabel>
            <UiInput
              v-model="form.sku"
              type="text"
              placeholder="Product SKU"
              :class="{ 'border-red-500': errors.sku }"
            />
            <p
              v-if="errors.sku"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.sku }}
            </p>
          </div>

          <!-- Category -->
          <div>
            <UiLabel>Category *</UiLabel>
            <UiSelect
              v-model="form.categoryId"
              :class="{ 'border-red-500': errors.categoryId }"
            >
              <UiSelectTrigger>
                <UiSelectValue placeholder="Select a category" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ getLocalizedText(category.name) }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
            <p
              v-if="errors.categoryId"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.categoryId }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Description -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <UiButton
        type="button"
        @click="toggleSection('description')"
      >
        <h3 class="text-base md:text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <span class="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs md:text-sm font-semibold mr-3">2</span>
          Description
        </h3>
        <svg
          class="w-5 h-5 md:w-6 md:h-6 text-gray-500 transform transition-transform"
          :class="{ 'rotate-180': expandedSections.description }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </UiButton>

      <div
        v-show="expandedSections.description"
        class="px-4 pb-4 md:px-6 md:pb-6 space-y-4"
      >
        <div
          v-for="locale in locales"
          :key="locale.code"
        >
          <UiLabel>Description ({{ locale.name }})</UiLabel>
          <UiTextarea
            v-model="form.description[locale.code]"
            rows="4"
            :placeholder="`Product description in ${locale.name}`"
            :class="{ 'border-red-500': errors.description?.[locale.code] }"
          />
          <p
            v-if="errors.description?.[locale.code]"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.description[locale.code] }}
          </p>
        </div>
      </div>
    </div>

    <!-- Pricing -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <UiButton
        type="button"
        @click="toggleSection('pricing')"
      >
        <h3 class="text-base md:text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <span class="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs md:text-sm font-semibold mr-3">3</span>
          Pricing
        </h3>
        <svg
          class="w-5 h-5 md:w-6 md:h-6 text-gray-500 transform transition-transform"
          :class="{ 'rotate-180': expandedSections.pricing }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </UiButton>

      <div
        v-show="expandedSections.pricing"
        class="px-4 pb-4 md:px-6 md:pb-6"
      >
        <div class="grid grid-cols-1 gap-4 md:gap-6">
          <!-- Price -->
          <div>
            <UiLabel>Price (EUR) *</UiLabel>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 md:pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 dark:text-gray-400">€</span>
              </div>
              <UiInput
                v-model.number="form.price"
                type="number"
                step="0.01"
                min="0"
                inputmode="decimal"
                placeholder="0.00"
                :class="{ 'border-red-500': errors.price }"
              />
            </div>
            <p
              v-if="errors.price"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.price }}
            </p>
          </div>

          <!-- Compare Price -->
          <div>
            <UiLabel>Compare at Price (EUR)</UiLabel>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 md:pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 dark:text-gray-400">€</span>
              </div>
              <UiInput
                v-model.number="form.comparePrice"
                type="number"
                step="0.01"
                min="0"
                inputmode="decimal"
                placeholder="0.00"
                :class="{ 'border-red-500': errors.comparePrice }"
              />
            </div>
            <p
              v-if="errors.comparePrice"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.comparePrice }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Inventory -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <UiButton
        type="button"
        @click="toggleSection('inventory')"
      >
        <h3 class="text-base md:text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <span class="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs md:text-sm font-semibold mr-3">4</span>
          Inventory
        </h3>
        <svg
          class="w-5 h-5 md:w-6 md:h-6 text-gray-500 transform transition-transform"
          :class="{ 'rotate-180': expandedSections.inventory }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </UiButton>

      <div
        v-show="expandedSections.inventory"
        class="px-4 pb-4 md:px-6 md:pb-6"
      >
        <div class="grid grid-cols-1 gap-4 md:gap-6">
          <!-- Stock Quantity -->
          <div>
            <UiLabel>Stock Quantity *</UiLabel>
            <UiInput
              v-model.number="form.stockQuantity"
              type="number"
              min="0"
              inputmode="numeric"
              placeholder="0"
              :class="{ 'border-red-500': errors.stockQuantity }"
            />
            <p
              v-if="errors.stockQuantity"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.stockQuantity }}
            </p>
          </div>

          <!-- Low Stock Threshold -->
          <div>
            <UiLabel>Low Stock Threshold</UiLabel>
            <UiInput
              v-model.number="form.lowStockThreshold"
              type="number"
              min="0"
              inputmode="numeric"
              placeholder="5"
              :class="{ 'border-red-500': errors.lowStockThreshold }"
            />
            <p
              v-if="errors.lowStockThreshold"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.lowStockThreshold }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Images -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <UiButton
        type="button"
        @click="toggleSection('images')"
      >
        <h3 class="text-base md:text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <span class="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs md:text-sm font-semibold mr-3">5</span>
          Product Images
        </h3>
        <svg
          class="w-5 h-5 md:w-6 md:h-6 text-gray-500 transform transition-transform"
          :class="{ 'rotate-180': expandedSections.images }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </UiButton>

      <div
        v-show="expandedSections.images"
        class="px-4 pb-4 md:px-6 md:pb-6"
      >
        <AdminUtilsImageUpload
          v-model="form.images"
          :max-files="5"
          :max-file-size="5 * 1024 * 1024"
          accept="image/*"
          @error="handleImageError"
        />
        <p
          v-if="errors.images"
          class="mt-2 text-sm text-red-600"
        >
          {{ errors.images }}
        </p>
      </div>
    </div>

    <!-- Product Attributes -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <UiButton
        type="button"
        @click="toggleSection('attributes')"
      >
        <h3 class="text-base md:text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <span class="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs md:text-sm font-semibold mr-3">6</span>
          Product Attributes
        </h3>
        <svg
          class="w-5 h-5 md:w-6 md:h-6 text-gray-500 transform transition-transform"
          :class="{ 'rotate-180': expandedSections.attributes }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </UiButton>

      <div
        v-show="expandedSections.attributes"
        class="px-4 pb-4 md:px-6 md:pb-6"
      >
        <div class="grid grid-cols-1 gap-4 md:gap-6">
          <!-- Origin -->
          <div>
            <UiLabel>Origin</UiLabel>
            <UiInput
              v-model="form.attributes.origin"
              type="text"
              placeholder="e.g., Moldova"
            />
          </div>

          <!-- Volume -->
          <div>
            <UiLabel>Volume (ml)</UiLabel>
            <UiInput
              v-model.number="form.attributes.volume"
              type="number"
              min="0"
              inputmode="numeric"
              placeholder="750"
            />
          </div>

          <!-- Alcohol Content -->
          <div>
            <UiLabel>Alcohol Content (%)</UiLabel>
            <UiInput
              v-model.number="form.attributes.alcoholContent"
              type="number"
              step="0.1"
              min="0"
              max="100"
              inputmode="decimal"
              placeholder="14.5"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Status and Visibility -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <UiButton
        type="button"
        @click="toggleSection('status')"
      >
        <h3 class="text-base md:text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <span class="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs md:text-sm font-semibold mr-3">7</span>
          Status & Visibility
        </h3>
        <svg
          class="w-5 h-5 md:w-6 md:h-6 text-gray-500 transform transition-transform"
          :class="{ 'rotate-180': expandedSections.status }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </UiButton>

      <div
        v-show="expandedSections.status"
        class="px-4 pb-4 md:px-6 md:pb-6 space-y-4"
      >
        <!-- Active Status -->
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <UiCheckbox
              id="is-active"
              :checked="form.isActive"
              @update:checked="form.isActive = $event"
            />
          </div>
          <UiLabel
            for="is-active"
            class="ml-2"
          >
            Product is active and visible to customers
          </UiLabel>
        </div>

        <!-- Featured Status -->
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <UiCheckbox
              id="is-featured"
              :checked="form.attributes.featured"
              @update:checked="(val: boolean) => form.attributes.featured = val"
            />
          </div>
          <UiLabel
            for="is-featured"
            class="ml-2"
          >
            Feature this product on the homepage
          </UiLabel>
        </div>
      </div>
    </div>

    <!-- Mobile Sticky Action Bar -->
    <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 md:hidden z-40 flex space-x-3">
      <nuxt-link
        to="/admin/products"
        class="flex-1 px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        Cancel
      </nuxt-link>
      <Button
        type="submit"
        :disabled="submitting"
        class="flex-1 px-4 py-3"
      >
        {{ submitting ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
      </Button>
    </div>

    <!-- Desktop Form Actions -->
    <div class="hidden md:flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
      <nuxt-link
        to="/admin/products"
        class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        Cancel
      </nuxt-link>
      <Button
        type="submit"
        :disabled="submitting"
      >
        {{ submitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product') }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Checkbox as UiCheckbox } from '@/components/ui/checkbox'
import { z } from 'zod'
import type { CategoryWithChildren } from '~/types/database'

interface ImageFile {
  id?: string
  url?: string
  preview?: string
  file?: File
  altText?: string
  isPrimary?: boolean
  uploading?: boolean
  progress?: number
}

interface Props {
  product?: Record<string, any>
  categories: CategoryWithChildren[]
  isEditing?: boolean
}

interface Emits {
  (e: 'submit', data: Record<string, any>): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
})

const emit = defineEmits<Emits>()

// Locales for multilingual support
const locales = [
  { code: 'es', name: 'Spanish' },
  { code: 'en', name: 'English' },
  { code: 'ro', name: 'Romanian' },
]

// Form state
const form = ref({
  name: {} as Record<string, string>,
  description: {} as Record<string, string>,
  sku: '',
  categoryId: null as number | null,
  price: 0,
  comparePrice: null as number | null,
  stockQuantity: 0,
  lowStockThreshold: 5,
  images: [] as ImageFile[],
  attributes: {
    origin: '',
    volume: null as number | null,
    alcoholContent: null as number | null,
    featured: false,
  },
  isActive: true,
})

const errors = ref({} as Record<string, any>)
const submitting = ref(false)

// Collapsible sections state - on mobile, start with only basic section expanded
const isMobile = ref(false)
const expandedSections = ref({
  basic: true,
  description: false,
  pricing: false,
  inventory: false,
  images: false,
  attributes: false,
  status: false,
})

// Toggle section visibility
const toggleSection = (section: keyof typeof expandedSections.value) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

// Validation schema
const productSchema = z.object({
  name: z.record(z.string(), z.string().min(1, 'Product name is required')),
  description: z.record(z.string(), z.string().optional()),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.number().min(1, 'Category is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  comparePrice: z.number().min(0).optional().nullable(),
  stockQuantity: z.number().min(0, 'Stock quantity must be 0 or greater'),
  lowStockThreshold: z.number().min(0, 'Low stock threshold must be 0 or greater').optional(),
  images: z.array(z.unknown()).optional(),
  attributes: z.object({
    origin: z.string().optional(),
    volume: z.number().positive().optional().nullable(),
    alcoholContent: z.number().min(0).max(100).optional().nullable(),
    featured: z.boolean().optional(),
  }).optional(),
  isActive: z.boolean(),
})

// Initialize form with product data if editing
onMounted(() => {
  // Detect mobile and set expanded sections
  isMobile.value = window.innerWidth < 768

  // On desktop, expand all sections by default
  if (!isMobile.value) {
    Object.keys(expandedSections.value).forEach((key) => {
      expandedSections.value[key as keyof typeof expandedSections.value] = true
    })
  }

  // Initialize form if editing
  if (props.isEditing && props.product) {
    form.value = {
      name: props.product.name || {},
      description: props.product.description || {},
      sku: props.product.sku || '',
      categoryId: props.product.category?.id || null,
      price: props.product.price || 0,
      comparePrice: props.product.comparePrice || null,
      stockQuantity: props.product.stockQuantity || 0,
      lowStockThreshold: props.product.lowStockThreshold || 5,
      images: props.product.images || [],
      attributes: {
        origin: props.product.attributes?.origin || '',
        volume: props.product.attributes?.volume || null,
        alcoholContent: props.product.attributes?.alcoholContent || null,
        featured: props.product.attributes?.featured || false,
      },
      isActive: props.product.isActive ?? true,
    }
  }
})

// Utility functions
const getLocalizedText = (text: Record<string, string | undefined> | null | undefined) => {
  if (!text) return ''
  return text.es || Object.values(text).find(v => v) || ''
}

// Validation function
const validateForm = () => {
  try {
    productSchema.parse(form.value)
    errors.value = {}
    return true
  }
  catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const newErrors: Record<string, any> = {}
      error.issues.forEach((err: z.ZodIssue) => {
        const path = err.path.join('.')
        if (err.path[0] === 'name' && err.path[1]) {
          if (!newErrors.name) newErrors.name = {}
          newErrors.name[err.path[1]] = err.message
        }
        else if (err.path[0] === 'description' && err.path[1]) {
          if (!newErrors.description) newErrors.description = {}
          newErrors.description[err.path[1]] = err.message
        }
        else {
          newErrors[path] = err.message
        }
      })
      errors.value = newErrors
    }
    return false
  }
}

// Form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true
  try {
    emit('submit', form.value)
  }
  catch (error: unknown) {
    console.error('Form submission error:', error)
  }
  finally {
    submitting.value = false
  }
}

// Image upload error handler
const handleImageError = (error: string) => {
  errors.value.images = error
}

// Clear image error when images change
watch(() => form.value.images, () => {
  if (errors.value.images) {
    delete errors.value.images
  }
})
</script>
