<template>
  <div class="inline-flex items-center gap-1">
    <!-- Stars -->
    <div
      class="flex items-center"
      :aria-label="`Rating: ${rating} out of ${max}`"
    >
      <span
        v-for="star in max"
        :key="star"
        class="relative"
        :class="size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'"
      >
        <!-- Empty star (background) -->
        <commonIcon
          name="lucide:star"
          :class="[
            'absolute inset-0',
            size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6',
            emptyColor,
          ]"
        />

        <!-- Filled star (with clip for partial fills) -->
        <span
          class="absolute inset-0 overflow-hidden"
          :style="{ width: getStarWidth(star) }"
        >
          <commonIcon
            name="lucide:star"
            :class="[
              'absolute left-0 top-0',
              size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6',
              fillColor,
            ]"
            :style="{ fill: 'currentColor' }"
          />
        </span>
      </span>
    </div>

    <!-- Rating text -->
    <span
      v-if="showValue"
      :class="[
        'font-semibold',
        size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base',
        valueColor,
      ]"
    >
      {{ rating.toFixed(1) }}
    </span>

    <!-- Review count -->
    <span
      v-if="reviewCount !== undefined"
      :class="[
        size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base',
        'text-gray-600 dark:text-gray-400',
      ]"
    >
      ({{ formatCount(reviewCount) }})
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rating: number // 0-5
  max?: number // Maximum stars (default 5)
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  reviewCount?: number
  fillColor?: string
  emptyColor?: string
  valueColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  max: 5,
  size: 'md',
  showValue: false,
  fillColor: 'text-yellow-400 dark:text-yellow-500',
  emptyColor: 'text-gray-300 dark:text-gray-600',
  valueColor: 'text-gray-900 dark:text-white',
})

// Calculate width for each star (supports partial fills)
const getStarWidth = (starPosition: number): string => {
  const fillAmount = Math.min(Math.max(props.rating - (starPosition - 1), 0), 1)
  return `${fillAmount * 100}%`
}

// Format large numbers (e.g., 1500 -> 1.5K)
const formatCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}
</script>
