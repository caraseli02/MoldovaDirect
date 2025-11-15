<template>
  <div
    :class="[
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold',
      variantClasses
    ]"
  >
    <!-- Icon -->
    <commonIcon v-if="icon" :name="icon" :class="iconSize" />

    <!-- Text -->
    <span>{{ text }}</span>

    <!-- Animated pulse for high urgency -->
    <span
      v-if="variant === 'danger' && pulse"
      class="relative flex h-2 w-2"
    >
      <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75"></span>
      <span class="relative inline-flex h-2 w-2 rounded-full bg-current"></span>
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'info' | 'warning' | 'danger' | 'success'
  icon?: string
  text: string
  pulse?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  pulse: false,
  size: 'md'
})

// Variant styling
const variantClasses = computed(() => {
  const base = {
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    success: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
  }
  return base[props.variant]
})

// Icon size
const iconSize = computed(() => {
  const sizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }
  return sizes[props.size]
})
</script>
