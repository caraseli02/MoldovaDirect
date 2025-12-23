<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Conversion Funnel
      </h3>
      <div class="text-sm text-gray-600 dark:text-gray-400">
        Overall Conversion: {{ overallConversionRate }}%
      </div>
    </div>

    <div class="space-y-4">
      <div
        v-for="(step, index) in funnelSteps"
        :key="step.label"
        class="relative"
      >
        <!-- Funnel Step -->
        <div class="flex items-center justify-between">
          <!-- Left side - Step info -->
          <div class="flex items-center gap-4 flex-1">
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white',
                step.color,
              ]"
            >
              {{ index + 1 }}
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-100">
                {{ step.label }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ step.description }}
              </div>
            </div>
          </div>

          <!-- Center - Visual funnel -->
          <div class="flex-1 mx-8">
            <div class="relative h-12 flex items-center">
              <!-- Funnel bar -->
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                <div
                  :class="[
                    'h-full rounded-full transition-all duration-500',
                    step.color.replace('bg-', 'bg-').replace('-500', '-400'),
                  ]"
                  :style="{ width: `${step.percentage}%` }"
                ></div>
                <!-- Percentage label -->
                <div class="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                  {{ step.percentage }}%
                </div>
              </div>

              <!-- Drop-off indicator -->
              <div
                v-if="index < funnelSteps.length - 1"
                class="absolute -right-2 top-1/2 transform -translate-y-1/2 text-red-500 text-xs font-medium"
              >
                -{{ Math.round(step.percentage - (funnelSteps[index + 1]?.percentage || 0)) }}%
              </div>
            </div>
          </div>

          <!-- Right side - Numbers -->
          <div class="text-right">
            <div class="text-xl font-bold text-gray-900 dark:text-gray-100">
              {{ step.value.toLocaleString() }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ step.conversionRate }}% conversion
            </div>
          </div>
        </div>

        <!-- Connector line -->
        <div
          v-if="index < funnelSteps.length - 1"
          class="ml-5 w-0.5 h-4 bg-gray-300 dark:bg-gray-600"
        ></div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div class="text-lg font-bold text-blue-600 dark:text-blue-400">
            {{ viewToCartRate }}%
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            View to Cart Rate
          </div>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div class="text-lg font-bold text-green-600 dark:text-green-400">
            {{ cartToPurchaseRate }}%
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Cart to Purchase Rate
          </div>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <div class="text-lg font-bold text-purple-600 dark:text-purple-400">
            {{ totalDropOff }}%
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Total Drop-off
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductAnalyticsData } from '~/types/analytics'

interface Props {
  data?: ProductAnalyticsData | null
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
  loading: false,
  error: null,
})

// Funnel steps
const funnelSteps = computed(() => {
  if (!props.data?.conversionFunnel) {
    return []
  }

  const funnel = props.data.conversionFunnel
  const maxValue = Math.max(funnel.totalViews, funnel.totalCartAdditions, funnel.totalPurchases)

  return [
    {
      label: 'Product Views',
      description: 'Users who viewed products',
      value: funnel.totalViews,
      percentage: maxValue > 0 ? 100 : 0,
      conversionRate: 100,
      color: 'bg-blue-500',
    },
    {
      label: 'Cart Additions',
      description: 'Users who added items to cart',
      value: funnel.totalCartAdditions,
      percentage: funnel.totalViews > 0 ? Math.round((funnel.totalCartAdditions / funnel.totalViews) * 100) : 0,
      conversionRate: funnel.viewToCartRate,
      color: 'bg-amber-500',
    },
    {
      label: 'Purchases',
      description: 'Users who completed purchase',
      value: funnel.totalPurchases,
      percentage: funnel.totalViews > 0 ? Math.round((funnel.totalPurchases / funnel.totalViews) * 100) : 0,
      conversionRate: funnel.overallConversionRate,
      color: 'bg-green-500',
    },
  ]
})

// Computed rates
const overallConversionRate = computed(() => {
  return props.data?.conversionFunnel?.overallConversionRate?.toFixed(2) || '0.00'
})

const viewToCartRate = computed(() => {
  return props.data?.conversionFunnel?.viewToCartRate?.toFixed(2) || '0.00'
})

const cartToPurchaseRate = computed(() => {
  return props.data?.conversionFunnel?.cartToPurchaseRate?.toFixed(2) || '0.00'
})

const totalDropOff = computed(() => {
  const rate = parseFloat(overallConversionRate.value)
  return (100 - rate).toFixed(2)
})
</script>
