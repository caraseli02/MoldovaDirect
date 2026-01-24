<script setup lang="ts">
/**
 * Profile Security Section Component
 *
 * Password change and 2FA management cards.
 * Emits events to open the respective modals.
 *
 * @example
 * ```vue
 * <ProfileSecuritySection
 *   @change-password="showPasswordModal = true"
 *   @enable-2fa="show2FAModal = true"
 * />
 * ```
 */

const emit = defineEmits<{
  /** Emitted when user clicks change password button */
  'change-password': []
  /** Emitted when user clicks enable 2FA button */
  'enable-2fa': []
}>()
</script>

<template>
  <div class="space-y-3">
    <!-- Password Card -->
    <div class="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600">
      <div>
        <p class="text-sm font-medium text-zinc-900 dark:text-white">
          {{ $t('profile.sections.password') }}
        </p>
        <p class="text-xs text-zinc-500 dark:text-zinc-400">
          ••••••••
        </p>
      </div>
      <UiButton
        type="button"
        data-testid="profile-change-password-btn"
        @click="emit('change-password')"
      >
        {{ $t('profile.sections.change') }}
      </UiButton>
    </div>

    <!-- 2FA Card -->
    <div class="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600">
      <div>
        <p class="text-sm font-medium text-zinc-900 dark:text-white">
          {{ $t('profile.sections.twoFactor') }}
        </p>
        <p class="text-xs text-zinc-500 dark:text-zinc-400">
          {{ $t('profile.sections.twoFactorDisabled') }}
        </p>
      </div>
      <UiButton
        type="button"
        data-testid="profile-enable-2fa-btn"
        @click="emit('enable-2fa')"
      >
        {{ $t('profile.sections.enable') }}
      </UiButton>
    </div>
  </div>
</template>
