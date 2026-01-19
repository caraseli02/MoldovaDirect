<script setup lang="ts">
/**
 * Profile Preferences Component
 *
 * Language and currency selection dropdowns.
 *
 * @example
 * ```vue
 * <ProfilePreferences
 *   :preferred-language="form.preferredLanguage"
 *   :preferred-currency="form.preferredCurrency"
 *   @update:language="form.preferredLanguage = $event"
 *   @update:currency="form.preferredCurrency = $event"
 *   @change="handleSave"
 * />
 * ```
 */

interface Props {
  /** Currently selected language code */
  preferredLanguage: 'es' | 'en' | 'ro' | 'ru'
  /** Currently selected currency code */
  preferredCurrency: 'EUR' | 'USD' | 'MDL'
}

const { preferredLanguage, preferredCurrency } = defineProps<Props>()

const { t } = useI18n()

const emit = defineEmits<{
  /** Emitted when language selection changes */
  'update:language': [value: 'es' | 'en' | 'ro' | 'ru']
  /** Emitted when currency selection changes */
  'update:currency': [value: 'EUR' | 'USD' | 'MDL']
  /** Emitted on any selection change (for save) */
  'change': []
}>()

const languageOptions = [
  { value: 'es', labelKey: 'profile.languages.es' },
  { value: 'en', labelKey: 'profile.languages.en' },
  { value: 'ro', labelKey: 'profile.languages.ro' },
  { value: 'ru', labelKey: 'profile.languages.ru' },
] as const

const currencyOptions = [
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'MDL', label: 'MDL (L)' },
] as const

function updateLanguage(event: Event) {
  const value = (event.target as HTMLSelectElement).value as 'es' | 'en' | 'ro' | 'ru'
  emit('update:language', value)
  emit('change')
}

function updateCurrency(event: Event) {
  const value = (event.target as HTMLSelectElement).value as 'EUR' | 'USD' | 'MDL'
  emit('update:currency', value)
  emit('change')
}

// Custom select arrow icon
const selectArrowIcon = 'url(\'data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%236b7280%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e\')'
</script>

<template>
  <div class="space-y-4">
    <!-- Language Select -->
    <div>
      <label
        for="profile-language"
        class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
      >
        {{ $t('auth.labels.language') }}
      </label>
      <select
        id="profile-language"
        :value="preferredLanguage"
        class="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white transition-all duration-200 appearance-none bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
        :style="{ backgroundImage: selectArrowIcon }"
        data-testid="profile-language-select"
        @change="updateLanguage"
      >
        <option
          v-for="option in languageOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ $t(option.labelKey) }}
        </option>
      </select>
    </div>

    <!-- Currency Select -->
    <div>
      <label
        for="profile-currency"
        class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
      >
        {{ $t('profile.sections.currency') }}
      </label>
      <select
        id="profile-currency"
        :value="preferredCurrency"
        class="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white transition-all duration-200 appearance-none bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
        :style="{ backgroundImage: selectArrowIcon }"
        data-testid="profile-currency-select"
        @change="updateCurrency"
      >
        <option
          v-for="option in currencyOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>
