<template>
  <UiCard>
    <UiCardHeader>
      <div
        v-if="categoryLabel"
        class="text-sm font-medium text-blue-700 dark:text-blue-200"
      >
        {{ categoryLabel }}
      </div>
      <UiCardTitle class="mt-2 lg:hidden">
        {{ productName }}
      </UiCardTitle>
      <div class="mt-4 flex items-center gap-3">
        <span class="text-3xl font-bold text-gray-900 dark:text-white">€{{ formatPrice(price) }}</span>
        <span
          v-if="comparePrice && Number(comparePrice) > Number(price)"
          class="text-lg text-gray-600 line-through"
        >
          €{{ formatPrice(comparePrice) }}
        </span>
      </div>
      <span
        class="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-medium"
        :class="stockStatusClass"
      >
        <span class="inline-block h-2 w-2 rounded-full bg-current"></span>
        {{ stockStatusText }}
      </span>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {{ estimatedDelivery }}
      </p>
      <p
        v-if="stockUrgencyMessage"
        class="mt-1 text-sm font-semibold text-red-600 dark:text-red-300"
      >
        {{ stockUrgencyMessage }}
      </p>
    </UiCardHeader>

    <UiCardContent class="space-y-4">
      <UiLabel>{{ $t('common.quantity') }}</UiLabel>
      <UiSelect
        :model-value="String(selectedQuantity)"
        :disabled="stockQuantity <= 0"
        @update:model-value="$emit('update:selectedQuantity', Number($event))"
      >
        <UiSelectTrigger class="w-full rounded-xl">
          <UiSelectValue />
        </UiSelectTrigger>
        <UiSelectContent>
          <UiSelectItem
            v-for="n in Math.min(10, Math.max(1, stockQuantity))"
            :key="n"
            :value="n.toString()"
          >
            {{ n }}
          </UiSelectItem>
        </UiSelectContent>
      </UiSelect>

      <UiButton
        data-testid="add-to-cart-button"
        :disabled="stockQuantity <= 0 || cartLoading"
        class="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        :class="[
          isProductInCart ? 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-600' : 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-600',
          cartLoading ? 'cursor-progress' : '',
        ]"
        @click="$emit('add-to-cart')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 21h13M7 13v4a1 1 0 001 1h9a1 1 0 001-1v-4M7 13L6 9"
          />
        </svg>
        <span>
          <template v-if="stockQuantity > 0">
            {{ isProductInCart ? $t('products.inCart') : $t('products.addToCart') }}
          </template>
          <template v-else>
            {{ $t('products.outOfStock') }}
          </template>
        </span>
      </UiButton>

      <UiButton
        type="button"
        variant="outline"
        size="sm"
        class="rounded-xl w-full"
        @click="$emit('share')"
      >
        <span
          class="mr-2"
          aria-hidden="true"
        >⤴</span>
        <span>{{ $t('products.actions.share') }}</span>
      </UiButton>
      <p
        v-if="shareFeedback"
        class="text-sm text-blue-700 dark:text-blue-200"
      >
        {{ shareFeedback }}
      </p>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
import { useProductUtils } from '~/composables/useProductUtils'

defineProps<{
  categoryLabel?: string
  productName: string
  price: number | string
  comparePrice?: number | string
  stockStatusClass: string
  stockStatusText: string
  estimatedDelivery: string
  stockUrgencyMessage?: string
  stockQuantity: number
  selectedQuantity: number
  cartLoading: boolean
  isProductInCart: boolean
  shareFeedback?: string | null
}>()

defineEmits<{
  (e: 'update:selectedQuantity', value: number): void
  (e: 'add-to-cart'): void
  (e: 'share'): void
}>()

const { formatPrice } = useProductUtils()
</script>
