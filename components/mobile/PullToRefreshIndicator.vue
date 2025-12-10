<template>
  <div
    class="pull-to-refresh-indicator"
    :style="indicatorStyle"
  >
    <div class="flex flex-col items-center justify-center p-4">
      <!-- Refresh Icon -->
      <div
        class="refresh-icon mb-2"
        :class="{ 'animate-spin': isRefreshing }"
      >
        <svg
          v-if="!isRefreshing"
          class="w-6 h-6 text-gray-600 dark:text-gray-400 transition-transform duration-200"
          :style="{ transform: `rotate(${Math.min(pullDistance * 2, 180)}deg)` }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>

        <svg
          v-else
          class="w-6 h-6 text-blue-600 dark:text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </div>

      <!-- Status Text -->
      <p
        class="text-sm font-medium transition-colors duration-200"
        :class="statusTextClass"
      >
        {{ statusText }}
      </p>

      <!-- Progress Indicator -->
      <div
        v-if="!isRefreshing && isPulling"
        class="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden"
      >
        <div
          class="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-100"
          :style="{ width: `${Math.min((pullDistance / 80) * 100, 100)}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isRefreshing: boolean
  isPulling: boolean
  canRefresh: boolean
  pullDistance: number
  statusText: string
  indicatorStyle: Record<string, unknown>
}

const props = defineProps<Props>()

// Computed classes for status text
const statusTextClass = computed(() => {
  if (props.isRefreshing) {
    return 'text-blue-600 dark:text-blue-400'
  }
  if (props.canRefresh) {
    return 'text-green-600 dark:text-green-400'
  }
  if (props.isPulling) {
    return 'text-gray-600 dark:text-gray-400'
  }
  return 'text-gray-400 dark:text-gray-500'
})
</script>

<style scoped>
.pull-to-refresh-indicator {
  position: absolute;
  top: -80px;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.dark .pull-to-refresh-indicator {
  background: rgba(31, 41, 55, 0.95);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.refresh-icon {
  transition: transform 0.2s ease-out;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
