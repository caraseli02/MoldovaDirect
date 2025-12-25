<template>
  <div class="address-form">
    <!-- Form Header -->
    <div
      v-if="showHeader"
      class="mb-6"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ $t(`checkout.addressForm.${type}.title`) }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ $t(`checkout.addressForm.${type}.subtitle`) }}
      </p>
    </div>

    <!-- Saved Addresses (for authenticated users) -->
    <div
      v-if="savedAddresses && savedAddresses.length > 0"
      class="mb-6"
    >
      <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
        {{ $t('checkout.addressForm.savedAddresses') }}
      </h4>
      <div class="space-y-3">
        <div
          v-for="address in savedAddresses"
          :key="address.id"
          class="relative"
        >
          <label
            class="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            :class="selectedSavedAddressId === address.id
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-gray-600'"
          >
            <input
              v-model="selectedSavedAddressId"
              type="radio"
              :name="`saved-address-${type}`"
              :value="address.id"
              class="mt-1 text-primary-600 focus:ring-primary-500"
              @change="selectSavedAddress(address)"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ address.firstName }} {{ address.lastName }}
                </p>
                <span
                  v-if="address.isDefault"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                >
                  {{ $t('checkout.addressForm.default') }}
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ address.street }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ address.city }}, {{ address.postalCode }} {{ address.country }}
              </p>
            </div>
          </label>
        </div>
      </div>

      <!-- Use New Address Option -->
      <label
        class="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 mt-3"
        :class="selectedSavedAddressId === null
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-gray-200 dark:border-gray-600'"
      >
        <input
          v-model="selectedSavedAddressId"
          type="radio"
          :name="`saved-address-${type}`"
          :value="null"
          class="text-primary-600 focus:ring-primary-500"
          @change="useNewAddress"
        />
        <span class="text-sm font-medium text-gray-900 dark:text-white">
          {{ $t('checkout.addressForm.useNewAddress') }}
        </span>
      </label>
    </div>

    <!-- Address Form -->
    <div
      v-if="showForm"
      class="space-y-5"
    >
      <!-- Full Name (Single Field) -->
      <div>
        <label
          for="fullName"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {{ $t('checkout.addressForm.fullName') }}
          <span class="text-red-500">*</span>
        </label>
        <input
          id="fullName"
          :value="fullName"
          type="text"
          name="name"
          autocomplete="name"
          :placeholder="$t('checkout.addressForm.fullNamePlaceholder')"
          class="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors text-base"
          :class="getFieldClasses('fullName')"
          @input="handleFullNameInput(($event.target as HTMLInputElement).value)"
          @blur="validateField('fullName')"
          @focus="clearFieldError('fullName')"
        />
        <p
          v-if="fieldErrors.fullName"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ fieldErrors.fullName }}
        </p>
      </div>

      <!-- Street Address with Autocomplete -->
      <div class="relative">
        <label
          for="street"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {{ $t('checkout.addressForm.street') }}
          <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            id="street"
            ref="streetInputRef"
            :value="localAddress.street"
            type="text"
            name="street-address"
            autocomplete="street-address"
            :placeholder="$t('checkout.addressForm.streetPlaceholder')"
            class="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors text-base"
            :class="getFieldClasses('street')"
            @input="handleStreetInput(($event.target as HTMLInputElement).value)"
            @blur="validateField('street')"
            @focus="handleStreetFocus"
          />
          <!-- Loading indicator for autocomplete -->
          <div
            v-if="isLoadingAutocomplete"
            class="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <div class="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>

        <!-- Autocomplete Suggestions Dropdown -->
        <div
          v-if="showSuggestions && addressSuggestions.length > 0"
          class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          <button
            v-for="(suggestion, index) in addressSuggestions"
            :key="index"
            type="button"
            class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
            @click="selectAddressSuggestion(suggestion)"
          >
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ suggestion.street }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ suggestion.city }}, {{ suggestion.postalCode }} {{ suggestion.country }}
            </p>
          </button>
        </div>

        <p
          v-if="fieldErrors.street"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ fieldErrors.street }}
        </p>
      </div>

      <!-- City & Postal Code (Side by Side) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            for="city"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {{ $t('checkout.addressForm.city') }}
            <span class="text-red-500">*</span>
          </label>
          <input
            id="city"
            :value="localAddress.city"
            type="text"
            name="address-level2"
            autocomplete="address-level2"
            :placeholder="$t('checkout.addressForm.cityPlaceholder')"
            class="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors text-base"
            :class="getFieldClasses('city')"
            @input="updateField('city', ($event.target as HTMLInputElement).value)"
            @blur="validateField('city')"
            @focus="clearFieldError('city')"
          />
          <p
            v-if="fieldErrors.city"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ fieldErrors.city }}
          </p>
        </div>

        <div>
          <label
            for="postalCode"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {{ $t('checkout.addressForm.postalCode') }}
            <span class="text-red-500">*</span>
          </label>
          <input
            id="postalCode"
            :value="localAddress.postalCode"
            type="text"
            name="postal-code"
            autocomplete="postal-code"
            :placeholder="$t('checkout.addressForm.postalCodePlaceholder')"
            class="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors text-base"
            :class="getFieldClasses('postalCode')"
            @input="updateField('postalCode', ($event.target as HTMLInputElement).value)"
            @blur="validateField('postalCode')"
            @focus="clearFieldError('postalCode')"
          />
          <p
            v-if="fieldErrors.postalCode"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ fieldErrors.postalCode }}
          </p>
        </div>
      </div>

      <!-- Country -->
      <div>
        <label
          for="country"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {{ $t('checkout.addressForm.country') }}
          <span class="text-red-500">*</span>
        </label>
        <select
          id="country"
          :value="localAddress.country"
          name="country"
          autocomplete="country"
          class="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors text-base appearance-none bg-no-repeat"
          :class="getFieldClasses('country')"
          :style="{ backgroundImage: 'url(\'data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' fill=\\'none\\' viewBox=\\'0 0 24 24\\' stroke=\\'%236B7280\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M19 9l-7 7-7-7\\'/></svg>\\')' , backgroundPosition: 'right 12px center', backgroundSize: '20px' }"
          @change="updateField('country', ($event.target as HTMLSelectElement).value); clearFieldError('country')"
          @blur="validateField('country')"
        >
          <option value="">
            {{ $t('checkout.addressForm.selectCountry') }}
          </option>
          <option
            v-for="country in availableCountries"
            :key="country.code"
            :value="country.code"
          >
            {{ country.flag }} {{ country.name }}
          </option>
        </select>
        <p
          v-if="fieldErrors.country"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ fieldErrors.country }}
        </p>
      </div>

      <!-- Phone (Optional but Recommended) -->
      <div>
        <label
          for="phone"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {{ $t('checkout.addressForm.phone') }}
          <span class="text-gray-500 text-xs ml-1">({{ $t('checkout.addressForm.phoneHelper') }})</span>
        </label>
        <input
          id="phone"
          :value="localAddress.phone"
          type="tel"
          name="tel"
          autocomplete="tel"
          inputmode="tel"
          :placeholder="$t('checkout.addressForm.phonePlaceholder')"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors text-base"
          @input="updateField('phone', ($event.target as HTMLInputElement).value)"
        />
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {{ $t('checkout.addressForm.phoneDescription') }}
        </p>
      </div>

      <!-- Save Address Option (for authenticated users) -->
      <div
        v-if="showSaveOption && user"
        class="flex items-center space-x-2 pt-2"
      >
        <input
          id="saveAddress"
          :checked="localAddress.saveForFuture"
          type="checkbox"
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          @change="updateField('saveForFuture', ($event.target as HTMLInputElement).checked)"
        />
        <label
          for="saveAddress"
          class="text-sm text-gray-700 dark:text-gray-300"
        >
          {{ $t('checkout.addressForm.saveAddress') }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Address } from '~/types/address'

// Extended Address type for checkout with optional UI fields
interface CheckoutAddress extends Address {
  saveForFuture?: boolean
}

// Address suggestion from autocomplete
interface AddressSuggestion {
  street: string
  city: string
  postalCode: string
  province?: string
  country: string
}

interface Props {
  modelValue: CheckoutAddress
  type: 'shipping' | 'billing'
  savedAddresses?: Address[]
  showSaveOption?: boolean
  showHeader?: boolean
  availableCountries?: Array<{ code: string, name: string, flag: string }>
}

interface Emits {
  (e: 'update:modelValue', value: CheckoutAddress): void
  (e: 'save-address', address: Address): void
  (e: 'address-complete'): void
}

const props = withDefaults(defineProps<Props>(), {
  savedAddresses: () => [],
  showSaveOption: true,
  showHeader: true,
  availableCountries: () => [
    { code: 'ES', name: 'España', flag: '🇪🇸' },
    { code: 'RO', name: 'România', flag: '🇷🇴' },
    { code: 'MD', name: 'Moldova', flag: '🇲🇩' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'DE', name: 'Deutschland', flag: '🇩🇪' },
    { code: 'IT', name: 'Italia', flag: '🇮🇹' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  ],
})

const emit = defineEmits<Emits>()

// Composables
const user = useSupabaseUser()
const { t } = useI18n()

// Local state
const selectedSavedAddressId = ref<number | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const streetInputRef = ref<HTMLInputElement | null>(null)

// Autocomplete state
const addressSuggestions = ref<AddressSuggestion[]>([])
const showSuggestions = ref(false)
const isLoadingAutocomplete = ref(false)
const autocompleteDebounceTimer = ref<NodeJS.Timeout | null>(null)

// Computed for the combined full name
const fullName = computed(() => {
  const first = props.modelValue.firstName || ''
  const last = props.modelValue.lastName || ''
  return `${first} ${last}`.trim()
})

// Use computed property with getter/setter to avoid circular watchers
const localAddress = computed({
  get: () => props.modelValue,
  set: (value: CheckoutAddress) => {
    emit('update:modelValue', value)
  },
})

// Computed
const showForm = computed(() => {
  return !props.savedAddresses?.length || selectedSavedAddressId.value === null
})

// Methods
const handleFullNameInput = (value: string) => {
  // Split full name into first and last name
  const parts = value.trim().split(/\s+/)
  let firstName = ''
  let lastName = ''

  if (parts.length === 1) {
    firstName = parts[0]
  } else if (parts.length === 2) {
    firstName = parts[0]
    lastName = parts[1]
  } else if (parts.length > 2) {
    // First part is first name, rest is last name
    firstName = parts[0]
    lastName = parts.slice(1).join(' ')
  }

  emit('update:modelValue', {
    ...localAddress.value,
    firstName,
    lastName,
  })
}

const handleStreetInput = (value: string) => {
  updateField('street', value)
  clearFieldError('street')

  // Trigger autocomplete search after debounce
  if (autocompleteDebounceTimer.value) {
    clearTimeout(autocompleteDebounceTimer.value)
  }

  if (value.length >= 3) {
    autocompleteDebounceTimer.value = setTimeout(() => {
      searchAddresses(value)
    }, 300)
  } else {
    addressSuggestions.value = []
    showSuggestions.value = false
  }
}

const handleStreetFocus = () => {
  clearFieldError('street')
  if (addressSuggestions.value.length > 0) {
    showSuggestions.value = true
  }
}

// Simple mock address search - in production, integrate with Google Places API or similar
const searchAddresses = async (query: string) => {
  isLoadingAutocomplete.value = true

  try {
    // In production, replace with actual API call:
    // const response = await $fetch('/api/address/autocomplete', { query: { q: query, country: localAddress.value.country } })

    // Mock suggestions for demonstration - shows the pattern
    await new Promise(resolve => setTimeout(resolve, 200))

    // Only show suggestions if country is selected
    if (localAddress.value.country) {
      const mockSuggestions: AddressSuggestion[] = []
      // In production, these would come from the API

      addressSuggestions.value = mockSuggestions
      showSuggestions.value = mockSuggestions.length > 0
    }
  } catch (error) {
    console.error('Address autocomplete error:', error)
  } finally {
    isLoadingAutocomplete.value = false
  }
}

const selectAddressSuggestion = (suggestion: AddressSuggestion) => {
  emit('update:modelValue', {
    ...localAddress.value,
    street: suggestion.street,
    city: suggestion.city,
    postalCode: suggestion.postalCode,
    province: suggestion.province,
    country: suggestion.country,
  })

  showSuggestions.value = false
  addressSuggestions.value = []

  // Clear related errors
  clearFieldError('street')
  clearFieldError('city')
  clearFieldError('postalCode')
  clearFieldError('country')
}

const selectSavedAddress = (address: Address) => {
  emit('update:modelValue', { ...address })
  clearAllErrors()
  emit('address-complete')
}

const useNewAddress = () => {
  emit('update:modelValue', {
    type: props.type,
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    postalCode: '',
    province: '',
    country: '',
    phone: '',
    isDefault: false,
  })
  clearAllErrors()
}

// Helper to update a single field
const updateField = <K extends keyof CheckoutAddress>(field: K, value: CheckoutAddress[K]) => {
  emit('update:modelValue', {
    ...localAddress.value,
    [field]: value,
  })
}

const validateField = (fieldName: string) => {
  const value = fieldName === 'fullName'
    ? fullName.value
    : localAddress.value[fieldName as keyof Address]

  // Type guard to check if value is a string
  const getStringValue = (val: unknown): string => {
    if (typeof val === 'string') return val
    if (val != null && typeof val !== 'boolean' && typeof val !== 'number') return String(val)
    return ''
  }

  switch (fieldName) {
    case 'fullName':
      if (!getStringValue(value).trim()) {
        fieldErrors.value.fullName = t('checkout.validation.fullNameRequired', 'Full name is required')
      } else if (getStringValue(value).trim().split(/\s+/).length < 2) {
        // Encourage but don't require last name
        // fieldErrors.value.fullName = t('checkout.validation.fullNameComplete', 'Please enter your first and last name')
      }
      break
    case 'street':
      if (!getStringValue(value).trim()) {
        fieldErrors.value.street = t('checkout.validation.streetRequired', 'Street address is required')
      }
      break
    case 'city':
      if (!getStringValue(value).trim()) {
        fieldErrors.value.city = t('checkout.validation.cityRequired', 'City is required')
      }
      break
    case 'postalCode':
      if (!getStringValue(value).trim()) {
        fieldErrors.value.postalCode = t('checkout.validation.postalCodeRequired', 'Postal code is required')
      }
      break
    case 'country':
      if (!getStringValue(value).trim()) {
        fieldErrors.value.country = t('checkout.validation.countryRequired', 'Country is required')
      }
      break
  }
}

const clearFieldError = (fieldName: string) => {
  if (fieldErrors.value[fieldName]) {
    const { [fieldName]: _removed, ...rest } = fieldErrors.value
    fieldErrors.value = rest
  }
}

const clearAllErrors = () => {
  fieldErrors.value = {}
}

const getFieldClasses = (fieldName: string) => {
  const hasError = !!fieldErrors.value[fieldName]
  return {
    'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500': hasError,
    'border-gray-300 dark:border-gray-600': !hasError,
    'bg-white dark:bg-gray-700 text-gray-900 dark:text-white': true,
  }
}

const validateForm = (): boolean => {
  const requiredFields = ['fullName', 'street', 'city', 'postalCode', 'country']
  let isValid = true

  requiredFields.forEach((field) => {
    validateField(field)
    if (fieldErrors.value[field]) {
      isValid = false
    }
  })

  return isValid
}

// Close suggestions when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (streetInputRef.value && !streetInputRef.value.contains(event.target as Node)) {
    showSuggestions.value = false
  }
}

// Initialize selectedSavedAddressId when component mounts or saved addresses change
watch(
  () => [props.savedAddresses, props.modelValue] as const,
  ([addresses, currentAddress]) => {
    if (!addresses || addresses.length === 0 || !currentAddress) return

    // Type assertion for addresses array
    const typedAddresses = addresses as Address[]

    // If current address has an ID that matches a saved address, select it
    if (currentAddress.id && typedAddresses.some(addr => addr.id === currentAddress.id)) {
      selectedSavedAddressId.value = currentAddress.id
      return
    }

    // If current address matches a saved address by content (for addresses set by parent)
    const matchingAddress = typedAddresses.find(addr =>
      addr.street === currentAddress.street
      && addr.city === currentAddress.city
      && addr.postalCode === currentAddress.postalCode,
    )

    if (matchingAddress?.id !== undefined) {
      selectedSavedAddressId.value = matchingAddress.id
      return
    }

    // If current address is empty and we have saved addresses, auto-select the default one
    // This handles the case where the parent hasn't initialized the address yet
    if (!currentAddress.street && !currentAddress.city) {
      const defaultAddr = typedAddresses.find(addr => addr.isDefault) || typedAddresses[0]
      if (defaultAddr?.id !== undefined) {
        selectedSavedAddressId.value = defaultAddr.id
        // Emit the address data to populate the parent's form
        emit('update:modelValue', { ...defaultAddr })
        emit('address-complete')
      }
    }
  },
  { immediate: true },
)

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (autocompleteDebounceTimer.value) {
    clearTimeout(autocompleteDebounceTimer.value)
  }
})

// Expose validation method for parent components
defineExpose({
  validateForm,
  clearAllErrors,
})
</script>

<style scoped>
.address-form {
  width: 100%;
}

/* Smooth transitions for form interactions */
.address-form input,
.address-form select {
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

/* Focus styles */
.address-form input:focus,
.address-form select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Error state animations */
.address-form .text-red-600 {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom select arrow */
.address-form select {
  padding-right: 40px;
}
</style>
