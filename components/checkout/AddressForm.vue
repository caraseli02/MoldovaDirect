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
    <SavedAddressesList
      :saved-addresses="savedAddresses"
      :selected-id="selectedSavedAddressId"
      :type="type"
      @update:selected-id="selectedSavedAddressId = $event"
      @select-address="selectSavedAddress"
      @use-new-address="useNewAddress"
    />

    <!-- Address Form Fields -->
    <AddressFormFields
      v-if="showForm"
      :address="localAddress"
      :field-errors="fieldErrors"
      :show-save-option="showSaveOption"
      :type="type"
      :available-countries="availableCountries"
      :address-suggestions="addressSuggestions"
      :show-suggestions="showSuggestions"
      :is-loading-autocomplete="isLoadingAutocomplete"
      @update:address="localAddress = $event"
      @update:field-errors="fieldErrors = $event"
      @select-suggestion="selectAddressSuggestion"
      @hide-suggestions="hideSuggestions"
    />
  </div>
</template>

<script setup lang="ts">
import type { Address } from '~/types/address'
import type { AddressSuggestion } from '~/composables/checkout/useAddressAutocomplete'
import { useAddressAutocomplete } from '~/composables/checkout/useAddressAutocomplete'
import SavedAddressesList from '~/components/checkout/address/SavedAddressesList.vue'
import AddressFormFields from '~/components/checkout/address/AddressFormFields.vue'

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
const { t } = useI18n()
const toast = useToast()

// Address autocomplete composable
const {
  addressSuggestions,
  showSuggestions,
  isLoadingAutocomplete,
  triggerSearch,
  hideSuggestions,
  selectSuggestion,
  cleanup: cleanupAutocomplete,
} = useAddressAutocomplete({
  countryCode: computed(() => localAddress.value.country),
  onError: () => {
    if (!hasShownAutocompleteError.value) {
      toast.warning(
        t('checkout.addressForm.autocompleteUnavailable'),
        t('checkout.addressForm.autocompleteUnavailableDescription'),
      )
      hasShownAutocompleteError.value = true
    }
  },
})

// Local state
const selectedSavedAddressId = ref<number | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const hasShownAutocompleteError = ref(false)

// Use computed property with getter/setter for two-way binding
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

const selectAddressSuggestion = (suggestion: AddressSuggestion) => {
  selectSuggestion(suggestion)
  // Emit is handled by the child component
}

const clearAllErrors = () => {
  fieldErrors.value = {}
}

// Watch street input for autocomplete
watch(
  () => localAddress.value.street,
  (newValue) => {
    if (newValue && newValue.length >= 3) {
      triggerSearch(newValue)
    }
  },
)

// Initialize selectedSavedAddressId when component mounts or saved addresses change
watch(
  () => [props.savedAddresses, props.modelValue] as const,
  ([addresses, currentAddress]) => {
    if (!addresses || addresses.length === 0 || !currentAddress) return

    // If current address has an ID that matches a saved address, select it
    if (currentAddress.id && addresses.some(addr => addr.id === currentAddress.id)) {
      selectedSavedAddressId.value = currentAddress.id
      return
    }

    // If current address matches a saved address by content
    const matchingAddress = addresses.find(addr =>
      addr.street === currentAddress.street
      && addr.city === currentAddress.city
      && addr.postalCode === currentAddress.postalCode,
    )

    if (matchingAddress?.id !== undefined) {
      selectedSavedAddressId.value = matchingAddress.id
      return
    }

    // If current address is empty and we have saved addresses, auto-select the default one
    if (!currentAddress.street && !currentAddress.city) {
      const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0]
      if (defaultAddr?.id !== undefined) {
        selectedSavedAddressId.value = defaultAddr.id
        emit('update:modelValue', { ...defaultAddr })
        emit('address-complete')
      }
    }
  },
  { immediate: true },
)

// Cleanup
onUnmounted(() => {
  cleanupAutocomplete()
})

// Expose validation method for parent components
defineExpose({
  validateForm: () => {
    const requiredFields = ['street', 'city', 'postalCode', 'country']
    let isValid = true

    requiredFields.forEach((field) => {
      const value = localAddress.value[field as keyof Address]
      if (!value || (typeof value === 'string' && !value.trim())) {
        fieldErrors.value[field] = t(`checkout.validation.${field}Required`, `${field} is required`)
        isValid = false
      }
    })

    // Also check full name (firstName + lastName)
    const fullName = `${localAddress.value.firstName || ''} ${localAddress.value.lastName || ''}`.trim()
    if (!fullName) {
      fieldErrors.value.fullName = t('checkout.validation.fullNameRequired', 'Full name is required')
      isValid = false
    }

    return isValid
  },
  clearAllErrors,
})
</script>

<style scoped>
.address-form {
  width: 100%;
}

/* Smooth transitions for form interactions */
.address-form :deep(input),
.address-form :deep(select) {
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

/* Focus styles */
.address-form :deep(input:focus),
.address-form :deep(select:focus) {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Error state animations */
.address-form :deep(.text-red-600) {
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
