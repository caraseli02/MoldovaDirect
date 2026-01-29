<template>
  <div
    v-if="showProgress"
    class="bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 rounded-xl p-4"
  >
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <svg
          class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
        <span class="text-sm font-medium text-zinc-900 dark:text-white">
          {{ progressText }}
        </span>
      </div>
      <span class="text-xs text-zinc-500 dark:text-zinc-400">
        {{ formatPrice(subtotal) }} / {{ formatPrice(freeShippingThreshold) }}
      </span>
    </div>

    <!-- Progress Bar -->
    <div class="h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500 ease-out"
        :class="qualifiesForFreeShipping ? 'bg-emerald-500' : 'bg-slate-500'"
        :style="{ width: `${progressPercentage}%` }"
      ></div>
    </div>

    <!-- Status Message -->
    <p
      class="text-xs mt-2 font-medium"
      :class="qualifiesForFreeShipping ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'"
    >
      <template v-if="qualifiesForFreeShipping">
        <svg
          class="w-3.5 h-3.5 inline-block mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        {{ $t('cart.shipping.qualified') }}
      </template>
      <template v-else>
        {{ $t('cart.shipping.addMore', { amount: formatPrice(amountRemaining) }) }}
      </template>
    </p>

    <p class="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
      {{ $t('cart.shipping.threshold', { amount: formatPrice(freeShippingThreshold) }) }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  subtotal: number
  freeShippingThreshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  freeShippingThreshold: 50,
})

const { t, locale } = useI18n()

// Computed values
const qualifiesForFreeShipping = computed(() => props.subtotal >= props.freeShippingThreshold)

const amountRemaining = computed(() => Math.max(0, props.freeShippingThreshold - props.subtotal))

const progressPercentage = computed(() => {
  const percentage = (props.subtotal / props.freeShippingThreshold) * 100
  return Math.min(100, percentage)
})

const showProgress = computed(() => props.subtotal > 0)

const progressText = computed(() => {
  if (qualifiesForFreeShipping.value) {
    return t('cart.shipping.freeShipping')
  }
  return t('cart.shipping.progress')
})

// Utility
const formatPrice = (price: number) => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}
</script>
