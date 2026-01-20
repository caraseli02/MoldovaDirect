<!-- eslint-disable tailwindcss/no-custom-classname -->
<script setup lang="ts">
/**
 * Profile Completion Indicator Component
 *
 * Displays a progress bar showing the user's profile completion percentage.
 * Used in the profile page header to encourage users to complete their profile.
 *
 * @example
 * ```vue
 * <ProfileCompletionIndicator :percentage="profileCompletionPercentage" />
 * ```
 */

interface Props {
  /** Completion percentage (0-100) */
  percentage: number
}

const { percentage } = defineProps<Props>()
</script>

<template>
  <div
    class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
    data-testid="profile-completion"
  >
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm font-medium text-zinc-900 dark:text-white">
        {{ $t('profile.completion') || 'Profile Completion' }}
      </span>
      <span
        class="text-sm font-semibold text-blue-600 dark:text-blue-400"
        data-testid="profile-completion-percentage"
      >
        {{ percentage }}%
      </span>
    </div>
    <div
      class="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2"
      data-testid="profile-completion-bar"
    >
      <div
        class="bg-blue-600 h-2 rounded-full transition-all duration-500"
        :style="{ width: `${Math.min(100, Math.max(0, percentage))}%` }"
      ></div>
    </div>
  </div>
</template>
