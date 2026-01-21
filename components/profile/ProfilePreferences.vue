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

function updateLanguage(value: any) {
  emit('update:language', value as 'es' | 'en' | 'ro' | 'ru')
  emit('change')
}

function updateCurrency(value: any) {
  emit('update:currency', value as 'EUR' | 'USD' | 'MDL')
  emit('change')
}

// Custom select arrow icon
const selectArrowIcon = 'url(\'data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%236b7280%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e\')'
</script>

<template>
  <div class="space-y-4">
    <!-- Language Select -->
    <div>
      <UiLabel for="profile-language">
        {{ $t('auth.labels.language') }}
      </UiLabel>
      <UiSelect
        :value="preferredLanguage"
        data-testid="profile-language-select"
        @update:model-value="updateLanguage"
      >
        <UiSelectTrigger>
          <UiSelectValue />
        </UiSelectTrigger>
        <UiSelectContent>
          <UiSelectItem
            v-for="option in languageOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ $t(option.labelKey) }}
          </UiSelectItem>
        </UiSelectContent>
      </UiSelect>
    </div>

    <!-- Currency Select -->
    <div>
      <UiLabel for="profile-currency">
        {{ $t('profile.sections.currency') }}
      </UiLabel>
      <UiSelect
        :value="preferredCurrency"
        data-testid="profile-currency-select"
        @update:model-value="updateCurrency"
      >
        <UiSelectTrigger>
          <UiSelectValue />
        </UiSelectTrigger>
        <UiSelectContent>
          <UiSelectItem
            v-for="option in currencyOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </UiSelectItem>
        </UiSelectContent>
      </UiSelect>
    </div>
  </div>
</template>
