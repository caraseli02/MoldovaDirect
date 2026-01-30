<template>
  <div class="space-y-5">
    <!-- Full Name (Single Field) -->
    <div>
      <UiLabel
        for="fullName"
        class="dark:text-white"
      >
        {{ $t('checkout.addressForm.fullName') }}
        <span class="text-red-500">*</span>
      </UiLabel>
      <UiInput
        id="fullName"
        :value="fullName"
        type="text"
        name="name"
        autocomplete="name"
        aria-required="true"
        :aria-invalid="!!fieldErrors.fullName"
        :aria-describedby="fieldErrors.fullName ? 'fullName-error' : undefined"
        :placeholder="$t('checkout.addressForm.fullNamePlaceholder')"
        :class="[getFieldClasses('fullName'), 'h-12 text-base']"
        @input="handleFullNameInput(($event.target as HTMLInputElement).value)"
        @blur="validateField('fullName')"
        @focus="handleFieldFocus('fullName')"
      />
      <p
        v-if="fieldErrors.fullName"
        id="fullName-error"
        class="mt-1 text-sm text-red-600 dark:text-red-400"
      >
        {{ fieldErrors.fullName }}
      </p>
    </div>

    <!-- Street Address with Autocomplete -->
    <div
      ref="streetContainerRef"
      class="relative"
    >
      <UiLabel
        for="street"
        class="dark:text-white"
      >
        {{ $t('checkout.addressForm.street') }}
        <span class="text-red-500">*</span>
      </UiLabel>
      <div class="relative">
        <UiInput
          id="street"
          :value="address.street"
          type="text"
          name="street-address"
          autocomplete="street-address"
          aria-required="true"
          aria-autocomplete="list"
          :aria-expanded="showSuggestions && addressSuggestions.length > 0"
          :aria-controls="showSuggestions && addressSuggestions.length > 0 ? 'address-suggestions' : undefined"
          :aria-invalid="!!fieldErrors.street"
          :aria-describedby="fieldErrors.street ? 'street-error' : undefined"
          :placeholder="$t('checkout.addressForm.streetPlaceholder')"
          :class="[getFieldClasses('street'), 'h-12 text-base']"
          @input="handleStreetInput(($event.target as HTMLInputElement).value)"
          @blur="validateField('street')"
          @focus="onStreetFocus"
        />
        <!-- Loading indicator for autocomplete -->
        <div
          v-if="isLoadingAutocomplete"
          class="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <div class="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>

      <!-- Autocomplete Suggestions Dropdown -->
      <div
        v-if="showSuggestions && addressSuggestions.length > 0"
        id="address-suggestions"
        role="list"
        :aria-label="$t('checkout.addressForm.suggestionsAvailable', { count: addressSuggestions.length })"
        class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        <div
          aria-live="polite"
          aria-atomic="true"
          class="sr-only"
        >
          {{ $t('checkout.addressForm.suggestionsAvailable', { count: addressSuggestions.length }) }}
        </div>
        <UiButton
          v-for="(suggestion, index) in addressSuggestions"
          :key="index"
          type="button"
          class="w-full justify-start text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
          @click="selectSuggestion(suggestion)"
        >
          <div class="w-full">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ suggestion.street }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ suggestion.city }}, {{ suggestion.postalCode }} {{ suggestion.country }}
            </p>
          </div>
        </UiButton>
      </div>

      <p
        v-if="fieldErrors.street"
        id="street-error"
        class="mt-1 text-sm text-red-600 dark:text-red-400"
      >
        {{ fieldErrors.street }}
      </p>
      <p
        v-if="!fieldErrors.street && !showSuggestions"
        class="mt-1 text-xs text-gray-500 dark:text-gray-400"
      >
        {{ $t('checkout.addressForm.autocompleteHint') }}
      </p>
    </div>

    <!-- City & Postal Code (Side by Side) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <UiLabel
          for="city"
          class="dark:text-white"
        >
          {{ $t('checkout.addressForm.city') }}
          <span class="text-red-500">*</span>
        </UiLabel>
        <UiInput
          id="city"
          :value="address.city"
          type="text"
          name="address-level2"
          autocomplete="address-level2"
          aria-required="true"
          :aria-invalid="!!fieldErrors.city"
          :aria-describedby="fieldErrors.city ? 'city-error' : undefined"
          :placeholder="$t('checkout.addressForm.cityPlaceholder')"
          :class="[getFieldClasses('city'), 'h-12 text-base']"
          @input="updateField('city', ($event.target as HTMLInputElement).value)"
          @blur="validateField('city')"
          @focus="clearFieldError('city')"
        />
        <p
          v-if="fieldErrors.city"
          id="city-error"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ fieldErrors.city }}
        </p>
      </div>

      <div>
        <UiLabel
          for="postalCode"
          class="dark:text-white"
        >
          {{ $t('checkout.addressForm.postalCode') }}
          <span class="text-red-500">*</span>
        </UiLabel>
        <UiInput
          id="postalCode"
          :value="address.postalCode"
          type="text"
          name="postal-code"
          autocomplete="postal-code"
          aria-required="true"
          :aria-invalid="!!fieldErrors.postalCode"
          :aria-describedby="fieldErrors.postalCode ? 'postalCode-error' : undefined"
          :placeholder="$t('checkout.addressForm.postalCodePlaceholder')"
          :class="[getFieldClasses('postalCode'), 'h-12 text-base']"
          @input="updateField('postalCode', ($event.target as HTMLInputElement).value)"
          @blur="validateField('postalCode')"
          @focus="clearFieldError('postalCode')"
        />
        <p
          v-if="fieldErrors.postalCode"
          id="postalCode-error"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ fieldErrors.postalCode }}
        </p>
      </div>
    </div>

    <!-- Country -->
    <div>
      <UiLabel
        for="country"
        class="dark:text-white"
      >
        {{ $t('checkout.addressForm.country') }}
        <span class="text-red-500">*</span>
      </UiLabel>
      <UiSelect
        id="country"
        :value="address.country"
        :class="[getFieldClasses('country'), 'h-12 text-base']"
        @update:model-value="updateField('country', $event as string); clearFieldError('country')"
        @blur="validateField('country')"
      >
        <UiSelectTrigger
          class="w-full"
          aria-required="true"
          :aria-invalid="!!fieldErrors.country"
          :aria-describedby="fieldErrors.country ? 'country-error' : undefined"
          data-testid="country-select"
        >
          <UiSelectValue :placeholder="$t('checkout.addressForm.selectCountry')" />
        </UiSelectTrigger>
        <UiSelectContent>
          <UiSelectItem
            v-for="country in availableCountries"
            :key="country.code"
            :value="country.code"
          >
            {{ country.flag }} {{ country.name }}
          </UiSelectItem>
        </UiSelectContent>
      </UiSelect>
      <p
        v-if="fieldErrors.country"
        id="country-error"
        class="mt-1 text-sm text-red-600 dark:text-red-400"
      >
        {{ fieldErrors.country }}
      </p>
    </div>

    <!-- Phone (Optional but Recommended) -->
    <div>
      <UiLabel
        for="phone"
        class="dark:text-white"
      >
        {{ $t('checkout.addressForm.phone') }}
        <span class="text-gray-500 dark:text-gray-400 text-xs ml-1">({{ $t('checkout.addressForm.phoneHelper') }})</span>
      </UiLabel>
      <UiInput
        id="phone"
        :value="address.phone"
        type="tel"
        name="tel"
        autocomplete="tel"
        inputmode="tel"
        :placeholder="$t('checkout.addressForm.phonePlaceholder')"
        class="h-12 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        @input="updateField('phone', ($event.target as HTMLInputElement).value)"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {{ $t('checkout.addressForm.phoneDescription') }}
      </p>
    </div>

    <!-- Save Address Option (for authenticated users) -->
    <div
      v-if="showSaveOption && user"
      class="flex items-center gap-2 pt-2"
    >
      <UiCheckbox
        :id="`saveAddress-${type}`"
        :checked="address.saveForFuture"
        class="shrink-0"
        @update:checked="updateField('saveForFuture', $event)"
      />
      <UiLabel
        :for="`saveAddress-${type}`"
        class="cursor-pointer"
      >
        {{ $t('checkout.addressForm.saveAddress') }}
      </UiLabel>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Address } from '~/types/address'
import type { AddressSuggestion } from '~/composables/checkout/useAddressAutocomplete'

interface CheckoutAddress extends Address {
  saveForFuture?: boolean
}

interface Country {
  code: string
  name: string
  flag: string
}

interface Props {
  address: CheckoutAddress
  fieldErrors: Record<string, string>
  showSaveOption?: boolean
  type: 'shipping' | 'billing'
  availableCountries: Country[]
  addressSuggestions: AddressSuggestion[]
  showSuggestions: boolean
  isLoadingAutocomplete: boolean
}

interface Emits {
  (e: 'update:address', value: CheckoutAddress): void
  (e: 'update:field-errors', value: Record<string, string>): void
  (e: 'select-suggestion', value: AddressSuggestion): void
  (e: 'hide-suggestions'): void
}

const props = withDefaults(defineProps<Props>(), {
  showSaveOption: true,
})

const emit = defineEmits<Emits>()

// Composables
const user = useSupabaseUser()
const { t } = useI18n()

// Template refs
const streetContainerRef = ref<HTMLDivElement | null>(null)

// Computed for the combined full name
const fullName = computed(() => {
  const first = props.address.firstName || ''
  const last = props.address.lastName || ''
  return `${first} ${last}`.trim()
})

// Helper to update a single field
const updateField = <K extends keyof CheckoutAddress>(field: K, value: CheckoutAddress[K]) => {
  emit('update:address', {
    ...props.address,
    [field]: value,
  })
}

/**
 * Splits a full name input into firstName and lastName fields.
 */
const handleFullNameInput = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  let firstName = ''
  let lastName = ''

  if (parts.length === 1) {
    firstName = parts[0] ?? ''
  }
  else if (parts.length === 2) {
    firstName = parts[0] ?? ''
    lastName = parts[1] ?? ''
  }
  else if (parts.length > 2) {
    firstName = parts[0] ?? ''
    lastName = parts.slice(1).join(' ')
  }

  emit('update:address', {
    ...props.address,
    firstName,
    lastName,
  })
}

const handleStreetInput = (value: string) => {
  updateField('street', value)
  clearFieldError('street')

  // Emit event for parent to trigger autocomplete
  if (value.length < 3) {
    emit('hide-suggestions')
  }
}

const onStreetFocus = () => {
  clearFieldError('street')
  // Show suggestions if available
}

const selectSuggestion = (suggestion: AddressSuggestion) => {
  emit('update:address', {
    ...props.address,
    street: suggestion.street,
    city: suggestion.city,
    postalCode: suggestion.postalCode,
    province: suggestion.province,
    country: suggestion.country,
  })
  emit('select-suggestion', suggestion)

  // Clear related errors
  clearFieldError('street')
  clearFieldError('city')
  clearFieldError('postalCode')
  clearFieldError('country')
}

const validateField = (fieldName: string) => {
  const value = fieldName === 'fullName'
    ? fullName.value
    : props.address[fieldName as keyof Address]

  const getStringValue = (val: unknown): string => {
    if (typeof val === 'string') return val
    if (val !== null && val !== undefined && typeof val !== 'boolean' && typeof val !== 'number') return String(val)
    return ''
  }

  const errors = { ...props.fieldErrors }

  switch (fieldName) {
    case 'fullName':
      if (!getStringValue(value).trim()) {
        errors.fullName = t('checkout.validation.fullNameRequired', 'Full name is required')
      }
      break
    case 'street':
      if (!getStringValue(value).trim()) {
        errors.street = t('checkout.validation.streetRequired', 'Street address is required')
      }
      break
    case 'city':
      if (!getStringValue(value).trim()) {
        errors.city = t('checkout.validation.cityRequired', 'City is required')
      }
      break
    case 'postalCode':
      if (!getStringValue(value).trim()) {
        errors.postalCode = t('checkout.validation.postalCodeRequired', 'Postal code is required')
      }
      break
    case 'country':
      if (!getStringValue(value).trim()) {
        errors.country = t('checkout.validation.countryRequired', 'Country is required')
      }
      break
  }

  emit('update:field-errors', errors)
}

const clearFieldError = (fieldName: string) => {
  if (props.fieldErrors[fieldName]) {
    const { [fieldName]: _removed, ...rest } = props.fieldErrors
    emit('update:field-errors', rest)
  }
}

/**
 * Handle field focus with scroll-into-view for mobile devices
 */
const handleFieldFocus = (fieldName: string) => {
  setTimeout(() => {
    const input = document.getElementById(
      fieldName === 'fullName' ? 'fullName' : fieldName,
    ) as HTMLInputElement
    if (input && 'scrollIntoView' in input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 300)
}

const getFieldClasses = (fieldName: string) => {
  const hasError = !!props.fieldErrors[fieldName]
  return {
    'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500': hasError,
    'border-gray-300 dark:border-gray-600': !hasError,
    'bg-white dark:bg-gray-700 text-gray-900 dark:text-white': true,
  }
}

// Close suggestions when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (streetContainerRef.value && !streetContainerRef.value.contains(event.target as Node)) {
    emit('hide-suggestions')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Expose validation method
defineExpose({
  validateForm: () => {
    const requiredFields = ['fullName', 'street', 'city', 'postalCode', 'country']
    let isValid = true

    requiredFields.forEach((field) => {
      validateField(field)
      if (props.fieldErrors[field]) {
        isValid = false
      }
    })

    return isValid
  },
  clearAllErrors: () => {
    emit('update:field-errors', {})
  },
})
</script>
