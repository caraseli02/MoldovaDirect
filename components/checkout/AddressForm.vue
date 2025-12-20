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
                {{ formatAddressLine(address) }}
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
      class="space-y-6"
    >
      <!-- Name Fields -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            for="firstName"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {{ $t('checkout.addressForm.firstName') }}
            <span class="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            :value="localAddress.firstName"
            type="text"
            :placeholder="$t('checkout.addressForm.firstNamePlaceholder')"
            class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
            :class="getFieldClasses('firstName')"
            @input="updateField('firstName', ($event.target as HTMLInputElement).value)"
            @blur="validateField('firstName')"
            @focus="clearFieldError('firstName')"
          />
          <p
            v-if="fieldErrors.firstName"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ fieldErrors.firstName }}
          </p>
        </div>

        <div>
          <label
            for="lastName"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {{ $t('checkout.addressForm.lastName') }}
            <span class="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            :value="localAddress.lastName"
            type="text"
            :placeholder="$t('checkout.addressForm.lastNamePlaceholder')"
            class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
            :class="getFieldClasses('lastName')"
            @input="updateField('lastName', ($event.target as HTMLInputElement).value)"
            @blur="validateField('lastName')"
            @focus="clearFieldError('lastName')"
          />
          <p
            v-if="fieldErrors.lastName"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ fieldErrors.lastName }}
          </p>
        </div>
      </div>

      <!-- Company (Optional) -->
      <div>
        <label
          for="company"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {{ $t('checkout.addressForm.company') }}
          <span class="text-gray-500 text-xs">({{ $t('common.optional') }})</span>
        </label>
        <input
          id="company"
          :value="localAddress.company"
          type="text"
          :placeholder="$t('checkout.addressForm.companyPlaceholder')"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
          @input="updateField('company', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Street Address -->
      <div>
        <label
          for="street"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {{ $t('checkout.addressForm.street') }}
          <span class="text-red-500">*</span>
        </label>
        <input
          id="street"
          :value="localAddress.street"
          type="text"
          :placeholder="$t('checkout.addressForm.streetPlaceholder')"
          class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
          :class="getFieldClasses('street')"
          @input="updateField('street', ($event.target as HTMLInputElement).value)"
          @blur="validateField('street')"
          @focus="clearFieldError('street')"
        />
        <p
          v-if="fieldErrors.street"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ fieldErrors.street }}
        </p>
      </div>

      <!-- City, Postal Code, Province -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            :placeholder="$t('checkout.addressForm.cityPlaceholder')"
            class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
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
            :placeholder="$t('checkout.addressForm.postalCodePlaceholder')"
            class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
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

        <div>
          <label
            for="province"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {{ $t('checkout.addressForm.province') }}
            <span class="text-gray-500 text-xs">({{ $t('common.optional') }})</span>
          </label>
          <input
            id="province"
            :value="localAddress.province"
            type="text"
            :placeholder="$t('checkout.addressForm.provincePlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            @input="updateField('province', ($event.target as HTMLInputElement).value)"
          />
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
          class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
          :class="getFieldClasses('country')"
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
            {{ country.name }}
          </option>
        </select>
        <p
          v-if="fieldErrors.country"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ fieldErrors.country }}
        </p>
      </div>

      <!-- Phone (Optional) -->
      <div>
        <label
          for="phone"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {{ $t('checkout.addressForm.phone') }}
          <span class="text-gray-500 text-xs">({{ $t('common.optional') }})</span>
        </label>
        <input
          id="phone"
          :value="localAddress.phone"
          type="tel"
          :placeholder="$t('checkout.addressForm.phonePlaceholder')"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
          @input="updateField('phone', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Save Address Option (for authenticated users) -->
      <div
        v-if="showSaveOption && user"
        class="flex items-center space-x-2"
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

interface Props {
  modelValue: CheckoutAddress
  type: 'shipping' | 'billing'
  savedAddresses?: Address[]
  showSaveOption?: boolean
  showHeader?: boolean
  availableCountries?: Array<{ code: string, name: string }>
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
    { code: 'ES', name: 'Spain' },
    { code: 'RO', name: 'Romania' },
    { code: 'MD', name: 'Moldova' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'IT', name: 'Italy' },
  ],
})

const emit = defineEmits<Emits>()

// Composables
const user = useSupabaseUser()
const { t } = useI18n()

// Local state
const selectedSavedAddressId = ref<number | null>(null)
const fieldErrors = ref<Record<string, string>>({})

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
    company: '',
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
  const value = localAddress.value[fieldName as keyof Address]

  // Type guard to check if value is a string
  const getStringValue = (val: any): string => {
    if (typeof val === 'string') return val
    if (val != null && typeof val !== 'boolean' && typeof val !== 'number') return String(val)
    return ''
  }

  switch (fieldName) {
    case 'firstName':
      if (!getStringValue(value).trim()) {
        fieldErrors.value.firstName = t('checkout.validation.firstNameRequired', 'First name is required')
      }
      break
    case 'lastName':
      if (!getStringValue(value).trim()) {
        fieldErrors.value.lastName = t('checkout.validation.lastNameRequired', 'Last name is required')
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

const formatAddressLine = (address: Address): string => {
  const parts = [address.street]
  if (address.company) {
    parts.unshift(address.company)
  }
  return parts.join(', ')
}

const validateForm = (): boolean => {
  const requiredFields = ['firstName', 'lastName', 'street', 'city', 'postalCode', 'country']
  let isValid = true

  requiredFields.forEach((field) => {
    validateField(field)
    if (fieldErrors.value[field]) {
      isValid = false
    }
  })

  return isValid
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
</style>
