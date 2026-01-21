<template>
  <Dialog
    :open="true"
    @update:open="handleOpenChange"
  >
    <DialogScrollContent class="sm:max-w-md max-h-[95vh]">
      <DialogHeader class="pb-4 border-b border-gray-200 dark:border-gray-700">
        <DialogTitle>
          {{ address?.id ? $t('profile.editAddress') : $t('profile.addAddress') }}
        </DialogTitle>
        <DialogDescription>
          {{ address?.id ? $t('profile.editAddressDescription') : $t('profile.addAddressDescription') }}
        </DialogDescription>
      </DialogHeader>

      <!-- Scrollable form content -->
      <div class="overflow-y-auto flex-1 py-4">
        <form
          id="addressForm"
          class="space-y-4"
          @submit.prevent="handleSubmit"
        >
          <!-- Address Type -->
          <div>
            <UiLabel>{{ $t('profile.addressType.label') }} *</UiLabel>
            <div class="flex space-x-2">
              <UiLabel>
                <UiInput
                  v-model="form.type"
                  type="radio"
                  value="shipping"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {{ $t('profile.addressType.shipping') }}
                </span>
              </UiLabel>
              <UiLabel>
                <UiInput
                  v-model="form.type"
                  type="radio"
                  value="billing"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {{ $t('profile.addressType.billing') }}
                </span>
              </UiLabel>
            </div>
          </div>

          <!-- First Name and Last Name -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <UiLabel for="firstName">
                {{ $t('profile.firstName') }} *
              </UiLabel>
              <UiInput
                id="firstName"
                v-model="form.firstName"
                type="text"
                :class="{ 'border-red-500': errors.firstName }"
                :placeholder="$t('profile.firstNamePlaceholder')"
              />
              <p
                v-if="errors.firstName"
                class="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {{ errors.firstName }}
              </p>
            </div>

            <div>
              <UiLabel for="lastName">
                {{ $t('profile.lastName') }} *
              </UiLabel>
              <UiInput
                id="lastName"
                v-model="form.lastName"
                type="text"
                :class="{ 'border-red-500': errors.lastName }"
                :placeholder="$t('profile.lastNamePlaceholder')"
              />
              <p
                v-if="errors.lastName"
                class="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {{ errors.lastName }}
              </p>
            </div>
          </div>

          <!-- Company (optional) -->
          <div>
            <UiLabel for="company">
              {{ $t('profile.company') }}
            </UiLabel>
            <UiInput
              id="company"
              v-model="form.company"
              type="text"
              :placeholder="$t('profile.companyPlaceholder')"
            />
          </div>

          <!-- Street Address -->
          <div>
            <UiLabel for="street">
              {{ $t('profile.street') }} *
            </UiLabel>
            <UiInput
              id="street"
              v-model="form.street"
              type="text"
              :class="{ 'border-red-500': errors.street }"
              :placeholder="$t('profile.streetPlaceholder')"
            />
            <p
              v-if="errors.street"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.street }}
            </p>
          </div>

          <!-- City and Postal Code -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <UiLabel for="city">
                {{ $t('profile.city') }} *
              </UiLabel>
              <UiInput
                id="city"
                v-model="form.city"
                type="text"
                :class="{ 'border-red-500': errors.city }"
                :placeholder="$t('profile.cityPlaceholder')"
              />
              <p
                v-if="errors.city"
                class="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {{ errors.city }}
              </p>
            </div>

            <div>
              <UiLabel for="postalCode">
                {{ $t('profile.postalCode') }} *
              </UiLabel>
              <UiInput
                id="postalCode"
                v-model="form.postalCode"
                type="text"
                :class="{ 'border-red-500': errors.postalCode }"
                :placeholder="$t('profile.postalCodePlaceholder')"
              />
              <p
                v-if="errors.postalCode"
                class="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {{ errors.postalCode }}
              </p>
            </div>
          </div>

          <!-- Province and Country -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <UiLabel for="province">
                {{ $t('profile.province') }}
              </UiLabel>
              <UiInput
                id="province"
                v-model="form.province"
                type="text"
                :placeholder="$t('profile.provincePlaceholder')"
              />
            </div>

            <div>
              <UiLabel for="country">
                {{ $t('profile.country') }} *
              </UiLabel>
              <UiSelect v-model="form.country">
                <UiSelectTrigger>
                  <UiSelectValue />
                </UiSelectTrigger>
                <UiSelectContent>
                  <UiSelectItem
                    v-for="country in countryOptions"
                    :key="country.value"
                    :value="country.value"
                  >
                    {{ country.label }}
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
            </div>
          </div>

          <!-- Phone -->
          <div>
            <UiLabel for="phone">
              {{ $t('profile.phone') }}
            </UiLabel>
            <UiInput
              id="phone"
              v-model="form.phone"
              type="tel"
              :class="{ 'border-red-500': errors.phone }"
              :placeholder="$t('profile.phonePlaceholder')"
            />
            <p
              v-if="errors.phone"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.phone }}
            </p>
          </div>

          <!-- Default Address -->
          <div class="flex items-center">
            <UiCheckbox
              id="isDefault"
              :checked="form.isDefault"
              @update:checked="form.isDefault = $event"
            />
            <UiLabel
              for="isDefault"
              class="ml-2"
            >
              {{ $t('profile.setAsDefault') }}
            </UiLabel>
          </div>
        </form>
      </div>

      <!-- Dialog Footer with action buttons -->
      <DialogFooter class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          @click="$emit('close')"
        >
          {{ $t('common.cancel') }}
        </Button>
        <Button
          type="submit"
          form="addressForm"
          :disabled="isLoading"
        >
          <span
            v-if="isLoading"
            class="flex items-center"
          >
            <commonIcon
              name="lucide:loader-2"
              class="animate-spin h-4 w-4 mr-2"
            />
            {{ $t('common.loading') }}
          </span>
          <span v-else>
            {{ address?.id ? $t('profile.updateAddress') : $t('profile.saveAddress') }}
          </span>
        </Button>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox as UiCheckbox } from '@/components/ui/checkbox'
import type { Address } from '~/types/address'
import type { ToastPlugin } from '~/types/plugins'

interface Props {
  address?: Address | null
}

interface Emits {
  (e: 'save', address: Address): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const user = useSupabaseUser()
const nuxtApp = useNuxtApp()
const $toast = nuxtApp.$toast as ToastPlugin

// Reactive state
const isLoading = ref(false)

// Get user's name parts
const userName = user.value?.user_metadata?.full_name || user.value?.user_metadata?.name || ''
const nameParts = userName.split(' ')
const userFirstName = nameParts[0] || ''
const userLastName = nameParts.slice(1).join(' ') || ''

// Form data - Initialize with user data
const form = reactive<Address>({
  type: 'shipping',
  firstName: userFirstName,
  lastName: userLastName,
  company: '',
  street: '',
  city: '',
  postalCode: '',
  province: '',
  country: 'ES',
  phone: user.value?.user_metadata?.phone || '',
  isDefault: false,
})

// Form validation
const errors = reactive({
  firstName: '',
  lastName: '',
  street: '',
  city: '',
  postalCode: '',
  phone: '',
})

// Country options with i18n
const countryOptions = computed(() => [
  { value: 'ES', label: t('profile.countries.ES') },
  { value: 'FR', label: t('profile.countries.FR') },
  { value: 'IT', label: t('profile.countries.IT') },
  { value: 'PT', label: t('profile.countries.PT') },
  { value: 'DE', label: t('profile.countries.DE') },
  { value: 'MD', label: t('profile.countries.MD') },
  { value: 'RO', label: t('profile.countries.RO') },
])

// Handle dialog open state change (when ESC pressed or backdrop clicked)
const handleOpenChange = (open: boolean) => {
  if (!open) {
    emit('close')
  }
}

// Initialize form with address data if editing
const initializeForm = () => {
  if (props.address) {
    Object.assign(form, props.address)
  }
}

// Form validation
const validateForm = (): boolean => {
  errors.firstName = ''
  errors.lastName = ''
  errors.street = ''
  errors.city = ''
  errors.postalCode = ''
  errors.phone = ''

  if (!form.firstName.trim()) {
    errors.firstName = t('profile.validation.firstNameRequired')
    return false
  }

  if (!form.lastName.trim()) {
    errors.lastName = t('profile.validation.lastNameRequired')
    return false
  }

  if (!form.street.trim()) {
    errors.street = t('profile.validation.streetRequired')
    return false
  }

  if (!form.city.trim()) {
    errors.city = t('profile.validation.cityRequired')
    return false
  }

  if (!form.postalCode.trim()) {
    errors.postalCode = t('profile.validation.postalCodeRequired')
    return false
  }

  // Validate postal code format based on country
  if (form.country === 'ES' && !/^\d{5}$/.test(form.postalCode)) {
    errors.postalCode = t('profile.validation.invalidSpanishPostalCode')
    return false
  }

  // Validate phone if provided
  if (form.phone && !/^[+]?[0-9\s\-()]{9,}$/.test(form.phone)) {
    errors.phone = t('profile.validation.phoneInvalid')
    return false
  }

  return true
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true

  // Emit save event - parent component handles actual save and errors
  // Parent will close modal on success or keep open on error
  emit('save', { ...form })

  // Note: emit() is synchronous and doesn't throw.
  // The parent component handles the actual async save operation.
  // On success, parent calls closeAddressForm() which unmounts this component.
  // On error, we provide a fallback timeout to reset loading state.
  setTimeout(() => {
    if (isLoading.value) {
      isLoading.value = false
    }
  }, 5000) // Reset after 5 seconds if parent hasn't closed modal
}

// Initialize form on mount
onMounted(() => {
  initializeForm()
})

// Watch for address prop changes
watch(() => props.address, () => {
  initializeForm()
}, { deep: true })
</script>
