<template>
  <div
    class="group relative flex h-full min-h-[196px] flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-3">
        <p class="text-sm font-medium uppercase tracking-wide text-gray-500">
          {{ label }}
        </p>
        <div class="flex items-baseline gap-3">
          <p class="text-2xl font-semibold text-gray-900">
            {{ value }}
          </p>
          <div v-if="$slots.meta" class="flex items-center gap-1 text-sm">
            <slot name="meta" />
          </div>
          <div v-else-if="trend" :class="['flex items-center gap-1 text-sm font-medium', trendColor]">
            <span class="text-base">{{ trendEmoji }}</span>
            <span class="text-xs uppercase tracking-wide">{{ trendLabel }}</span>
          </div>
        </div>
      </div>
      <div
        v-if="icon"
        :class="['flex h-12 w-12 items-center justify-center rounded-xl text-white', variantStyles.iconBg]"
      >
        <commonIcon :name="icon" class="h-5 w-5" />
      </div>
    </div>

    <div class="mt-6 flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <span v-if="trend && $slots.meta" :class="['text-base', trendColor]">{{ trendEmoji }}</span>
        <p v-if="subtext" class="text-sm text-gray-400">
          {{ subtext }}
        </p>
        <slot v-else name="subtext" />
      </div>
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface MetricCardProps {
  label: string
  value: string | number
  subtext?: string
  icon?: string
  trend?: 'up' | 'down' | 'flat'
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'info'
}

const props = withDefaults(defineProps<MetricCardProps>(), {
  subtext: undefined,
  icon: undefined,
  trend: undefined,
  variant: 'neutral'
})

const variantStyles = computed(() => {
  const map: Record<NonNullable<MetricCardProps['variant']>, { iconBg: string }> = {
    success: { iconBg: 'bg-green-500' },
    warning: { iconBg: 'bg-yellow-400 text-gray-900' },
    error: { iconBg: 'bg-red-500' },
    neutral: { iconBg: 'bg-gray-400' },
    info: { iconBg: 'bg-blue-500' }
  }

  return map[props.variant]
})

const trendEmoji = computed(() => {
  if (!props.trend) return ''
  if (props.trend === 'up') return '📈'
  if (props.trend === 'down') return '📉'
  return '➖'
})

const trendLabel = computed(() => {
  if (!props.trend) return ''
  if (props.trend === 'up') return 'Upward'
  if (props.trend === 'down') return 'Downward'
  return 'Stable'
})

const trendColor = computed(() => {
  if (props.trend === 'up') return 'text-green-500'
  if (props.trend === 'down') return 'text-red-500'
  if (props.trend === 'flat') return 'text-gray-400'
  return 'text-gray-400'
})
</script>
