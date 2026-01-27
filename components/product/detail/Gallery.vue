<template>
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
    <div>
      <div
        class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
        :class="selectedImage ? 'aspect-square' : ''"
      >
        <template v-if="selectedImage">
          <NuxtImg
            preset="productDetail"
            :src="selectedImage.url"
            :alt="getLocalizedText(selectedImage.altText as Record<string, string> | null | undefined) || productName"
            sizes="100vw lg:800px"
            densities="x1 x2"
            loading="eager"
            fetchpriority="high"
            placeholder
            :placeholder-class="'blur-xl'"
            class="h-full w-full object-cover cursor-pointer transition-transform hover:scale-105"
            @click="$emit('open-zoom')"
          />
        </template>

        <!-- PREMIUM PLACEHOLDER -->
        <div
          v-else
          class="h-full w-full bg-gray-50 dark:bg-gray-800"
        >
          <NuxtImg
            src="/images/product-placeholder.png"
            :alt="productName || 'Product placeholder'"
            sizes="100vw lg:800px"
            densities="x1 x2"
            loading="eager"
            class="h-full w-full object-cover opacity-80"
          />
        </div>

        <!-- Badges (only if image exists) -->
        <template v-if="selectedImage">
          <div
            v-if="isFeatured"
            class="absolute left-4 top-4"
          >
            <span class="rounded-full bg-yellow-500 px-3 py-1 text-sm font-semibold text-white shadow-lg">
              {{ $t('products.featured') }}
            </span>
          </div>
          <div
            v-if="comparePrice && Number(comparePrice) > Number(price)"
            class="absolute right-4 top-4"
          >
            <span class="rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white shadow-lg">
              {{ $t('products.sale') }}
            </span>
          </div>
        </template>
      </div>
    </div>

    <!-- Gallery Thumbnails -->
    <div
      v-if="images?.length"
      class="overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide lg:mx-0 lg:px-0 lg:overflow-visible lg:pb-0"
    >
      <div class="flex gap-2 lg:flex-col lg:space-y-2 lg:gap-0">
        <UiButton
          v-for="(image, index) in images"
          :key="image.id || index"
          type="button"
          :class="modelValue === index ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-1' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
          class="h-20 w-20 p-0 overflow-hidden rounded-lg border-2 transition-all flex-shrink-0"
          :aria-label="`View image ${index + 1}`"
          @click="$emit('update:modelValue', index)"
        >
          <NuxtImg
            preset="productThumbnailSmall"
            :src="image.url"
            :alt="getLocalizedText(image.altText as Record<string, string> | null | undefined)"
            width="80"
            height="80"
            loading="lazy"
            class="w-full h-full object-cover"
          />
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductUtils } from '~/composables/useProductUtils'
import type { ProductImage } from '~/types/database'

interface Image {
  id?: string | number
  url: string
  altText?: Record<string, string> | null
}

// Accept both ProductImage from API and legacy Image format
type ImageProp = ProductImage | Image

const props = defineProps<{
  images?: ImageProp[]
  selectedImage?: ImageProp
  modelValue: number
  price?: number | string
  comparePrice?: number | string
  isFeatured?: boolean
  productName?: string
}>()

defineEmits<{
  (e: 'update:modelValue', index: number): void
  (e: 'open-zoom'): void
}>()

const { getLocalizedText } = useProductUtils()
</script>
