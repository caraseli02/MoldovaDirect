<template>
  <div
    class="address-form"
    data-testid="address-form"
  >
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
      <fieldset>
        <!-- legend is required for fieldset accessibility - eslint-disable-next-line vue/no-restricted-html-elements -->
        <legend class="sr-only">
          {{ $t('checkout.addressForm.savedAddresses') }}
        </legend>
        <UiRadioGroup
          v-model="selectedSavedAddressId"
          :name="`saved-address-${type}`"
        >
          <div class="space-y-3">
            <div
              v-for="address in savedAddresses"
              :key="address.id"
              class="relative"
            >
              <div :class="selectedSavedAddressId === address.id ? 'border-slate-500 bg-slate-50 dark:bg-slate-900/20 rounded-lg p-3 border' : 'border-gray-200 dark:border-gray-600 rounded-lg p-3 border'">
                <div class="flex items-start gap-3">
                  <UiRadioGroupItem
                    :value="address.id"
                    class="shrink-0 mt-0.5"
                    @click="selectSavedAddress(address)"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ address.firstName }} {{ address.lastName }}
                      </p>
                      <span
                        v-if="address.isDefault"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
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
                </div>
              </div>
            </div>
          </div>

          <!-- Use New Address Option -->
          <div
            :class="selectedSavedAddressId === null ? 'border-slate-500 bg-slate-50 dark:bg-slate-900/20 rounded-lg p-3 border mt-3' : 'border-gray-200 dark:border-gray-600 rounded-lg p-3 border mt-3'"
            data-testid="use-new-address"
          >
            <div class="flex items-center gap-3">
              <UiRadioGroupItem
                :value="null"
                class="shrink-0"
                @click="useNewAddress"
              />
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ $t('checkout.addressForm.useNewAddress') }}
              </span>
            </div>
          </div>
        </UiRadioGroup>
      </fieldset>
    </div>

    <!-- Address Form -->
    <div
      v-if="showForm"
      class="space-y-5"
    >
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
            :value="localAddress.street"
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
            @focus="handleStreetFocus"
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
            @click="selectAddressSuggestion(suggestion)"
          >
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ suggestion.street }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ suggestion.city }}, {{ suggestion.postalCode }} {{ suggestion.country }}
            </p>
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
            :value="localAddress.city"
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
            :value="localAddress.postalCode"
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
          :value="localAddress.country"
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
          :value="localAddress.phone"
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
          :checked="localAddress.saveForFuture"
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
const toast = useToast()

// Local state
const selectedSavedAddressId = ref<number | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const streetContainerRef = ref<HTMLDivElement | null>(null)

// Track component mount state to prevent memory leaks
const isMounted = ref(false)

// Autocomplete state
const addressSuggestions = ref<AddressSuggestion[]>([])
const showSuggestions = ref(false)
const isLoadingAutocomplete = ref(false)
const autocompleteDebounceTimer = ref<NodeJS.Timeout | null>(null)
const hasShownAutocompleteError = ref(false)

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

/**
 * Splits a full name input into firstName and lastName fields.
 *
 * Business Logic:
 * - Single word (e.g., "Madonna"): Treated as firstName only, lastName empty
 * - Two words (e.g., "John Smith"): First word → firstName, second → lastName
 * - Three+ words (e.g., "Mary Jane Watson"): First word → firstName, rest joined → lastName
 *
 * Note: This is a Western-centric simplification. Some cultures have different naming
 * conventions (e.g., family name first in East Asian cultures, patronymics in Icelandic
 * names). For a more international approach, consider using a single "fullName" field
 * in the database or integrating a name parsing library.
 *
 * @param value - The full name entered by the user
 */
const handleFullNameInput = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  let firstName = ''
  let lastName = ''

  if (parts.length === 1) {
    // Single name (e.g., mononymous individuals like "Cher", "Madonna")
    firstName = parts[0] ?? ''
  }
  else if (parts.length === 2) {
    // Standard "First Last" format
    firstName = parts[0] ?? ''
    lastName = parts[1] ?? ''
  }
  else if (parts.length > 2) {
    // Multiple words: assume first word is given name, rest is family name
    // Handles compound surnames like "García Márquez" or middle names
    firstName = parts[0] ?? ''
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
  }
  else {
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

/**
 * Address autocomplete search using OpenStreetMap Nominatim API
 *
 * Uses the free Nominatim geocoding service which doesn't require API keys.
 * Rate-limited to 1 request per second by Nominatim's usage policy.
 *
 * @param query - The address search query
 */
const searchAddresses = async (query: string) => {
  isLoadingAutocomplete.value = true

  try {
    // Build country code filter if country is selected
    const countryCode = localAddress.value.country?.toLowerCase() || ''

    // Use Nominatim API for geocoding (free, no API key needed)
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '5',
      ...(countryCode && { countrycodes: countryCode }),
    })

    const response = await $fetch<NominatimResult[]>(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          'Accept-Language': 'en',
          // Nominatim requires a valid User-Agent for API usage policy
          'User-Agent': 'MoldovaDirectCheckout/1.0',
        },
      },
    )

    // Transform Nominatim results to our format
    const suggestions: AddressSuggestion[] = response
      .filter(result => result.address)
      .map((result) => {
        const addr = result.address
        // Build street address from available components
        const streetParts = [
          addr.house_number,
          addr.road || addr.street || addr.pedestrian || addr.footway,
        ].filter(Boolean)

        const street = streetParts.join(' ') || result.display_name.split(',')[0]

        return {
          street: street || '',
          city: addr.city || addr.town || addr.village || addr.municipality || addr.county || '',
          postalCode: addr.postcode || '',
          province: addr.state || addr.region || '',
          country: addr.country_code?.toUpperCase() || '',
        }
      })
      .filter(s => s.street && s.city) // Filter out incomplete addresses

    addressSuggestions.value = suggestions
    showSuggestions.value = suggestions.length > 0
    hasShownAutocompleteError.value = false
  }
  catch (error) {
    if (!hasShownAutocompleteError.value) {
      toast.warning(
        t('checkout.addressForm.autocompleteUnavailable'),
        t('checkout.addressForm.autocompleteUnavailableDescription'),
      )
      hasShownAutocompleteError.value = true
    }
    // Log error for debugging - autocomplete failure is non-blocking
    // Users can still manually enter their address
    console.error('Address autocomplete error:', error)
    addressSuggestions.value = []
    showSuggestions.value = false
  }
  finally {
    isLoadingAutocomplete.value = false
  }
}

// Nominatim API response type
interface NominatimResult {
  display_name: string
  address: {
    house_number?: string
    road?: string
    street?: string
    pedestrian?: string
    footway?: string
    city?: string
    town?: string
    village?: string
    municipality?: string
    county?: string
    state?: string
    region?: string
    postcode?: string
    country?: string
    country_code?: string
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
    if (val !== null && val !== undefined && typeof val !== 'boolean' && typeof val !== 'number') return String(val)
    return ''
  }

  switch (fieldName) {
    case 'fullName':
      if (!getStringValue(value).trim()) {
        fieldErrors.value.fullName = t('checkout.validation.fullNameRequired', 'Full name is required')
      }
      else if (getStringValue(value).trim().split(/\s+/).length < 2) {
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

/**
 * Handle field focus with scroll-into-view for mobile devices
 * Ensures the focused field is visible when the mobile keyboard appears
 */
const handleFieldFocus = (fieldName: string) => {
  // Small delay to allow keyboard to appear
  setTimeout(() => {
    const input = document.getElementById(
      fieldName === 'fullName' ? 'fullName' : fieldName,
    ) as HTMLInputElement
    if (input && 'scrollIntoView' in input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 300)
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

// Close suggestions when clicking outside the street input container
const handleClickOutside = (event: MouseEvent) => {
  if (streetContainerRef.value && !streetContainerRef.value.contains(event.target as Node)) {
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
  isMounted.value = true
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  isMounted.value = false
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

/* Country select dropdown arrow */
.country-select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-size: 20px;
}
</style>
