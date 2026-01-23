<script setup lang="ts">
/**
 * Profile Personal Info Component
 *
 * Name, email (disabled), and phone input fields with validation errors.
 * Displays user's personal information in the profile form.
 *
 * @example
 * ```vue
 * <ProfilePersonalInfo
 *   :form="form"
 *   :errors="errors"
 *   @update:name="form.name = $event"
 *   @update:phone="form.phone = $event"
 *   @input="debouncedSave"
 * />
 * ```
 */

import type { ProfileForm, ProfileFormErrors } from '~/composables/useProfileForm'

interface Props {
  /** Current form values */
  form: ProfileForm
  /** Form validation errors */
  errors: ProfileFormErrors
}

const { form, errors } = defineProps<Props>()

const emit = defineEmits<{
  /** Emitted when name input changes */
  'update:name': [value: string]
  /** Emitted when phone input changes */
  'update:phone': [value: string]
  /** Emitted on any input change (for auto-save) */
  'input': []
}>()

function updateName(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:name', value)
  emit('input')
}

function updatePhone(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:phone', value)
  emit('input')
}
</script>

<template>
  <div class="space-y-5">
    <!-- Name Input -->
    <div>
      <UiLabel for="profile-name">
        {{ $t('auth.labels.fullName') }} <span class="text-rose-500">*</span>
      </UiLabel>
      <UiInput
        id="profile-name"
        :value="form.name"
        type="text"
        required
        :class="{ 'border-rose-500 focus:ring-rose-500': errors.name }"
        :placeholder="$t('auth.placeholders.fullName')"
        data-testid="profile-name-input"
        @input="updateName"
      />
      <p
        v-if="errors.name"
        class="mt-1 text-sm text-rose-600 dark:text-rose-400"
        data-testid="profile-name-error"
      >
        {{ errors.name }}
      </p>
    </div>

    <!-- Email Input (Disabled) -->
    <div>
      <UiLabel for="profile-email">
        {{ $t('auth.labels.email') }} <span class="text-rose-500">*</span>
      </UiLabel>
      <UiInput
        id="profile-email"
        :value="form.email"
        type="email"
        required
        disabled
        :placeholder="$t('auth.placeholders.email')"
        data-testid="profile-email-input"
      />
      <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {{ $t('profile.emailCannotBeChanged') }}
      </p>
    </div>

    <!-- Phone Input -->
    <div>
      <UiLabel for="profile-phone">
        {{ $t('auth.labels.phone') }}
      </UiLabel>
      <UiInput
        id="profile-phone"
        :value="form.phone"
        type="tel"
        inputmode="tel"
        :class="{ 'border-rose-500 focus:ring-rose-500': errors.phone }"
        :placeholder="$t('auth.placeholders.phone')"
        data-testid="profile-phone-input"
        @input="updatePhone"
      />
      <p
        v-if="errors.phone"
        class="mt-1 text-sm text-rose-600 dark:text-rose-400"
        data-testid="profile-phone-error"
      >
        {{ errors.phone }}
      </p>
    </div>
  </div>
</template>
