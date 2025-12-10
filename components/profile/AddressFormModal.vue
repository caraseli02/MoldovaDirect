<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div
        class="fixed inset-0 transition-opacity bg-black/50"
        @click="$emit('close')"
      ></div>

      <!-- Modal panel - scrollable with max height -->
      <div class="inline-block w-full max-w-md my-4 text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg relative z-10 max-h-[95vh] flex flex-col">
        <!-- Fixed header -->
        <div class="flex justify-between items-center p-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ address?.id ? $t('profile.editAddress') : $t('profile.addAddress') }}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            @click="$emit('close')"
          >
            <commonIcon
              name="lucide:x"
              class="h-6 w-6"
            />
          </Button>
        </div>

        <!-- Scrollable form content -->
        <div class="overflow-y-auto flex-1 px-6 py-4">
          <form
            id="addressForm"
            class="space-y-4"
            @submit.prevent="handleSubmit"
          >
            <!-- Address Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ $t('profile.addressType.label') }} *
              </label>
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input
                    v-model="form.type"
                    type="radio"
                    value="shipping"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {{ $t('profile.addressType.shipping') }}
                  </span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="form.type"
                    type="radio"
                    value="billing"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {{ $t('profile.addressType.billing') }}
                  </span>
                </label>
              </div>
            </div>

            <!-- First Name and Last Name -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  for="firstName"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {{ $t('profile.firstName') }} *
                </label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
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
                <label
                  for="lastName"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {{ $t('profile.lastName') }} *
                </label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
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
              <label
                for="company"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {{ $t('profile.company') }}
              </label>
              <input
                id="company"
                v-model="form.company"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                :placeholder="$t('profile.companyPlaceholder')"
              />
            </div>

            <!-- Street Address -->
            <div>
              <label
                for="street"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {{ $t('profile.street') }} *
              </label>
              <input
                id="street"
                v-model="form.street"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
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
                <label
                  for="city"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {{ $t('profile.city') }} *
                </label>
                <input
                  id="city"
                  v-model="form.city"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
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
                <label
                  for="postalCode"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {{ $t('profile.postalCode') }} *
                </label>
                <input
                  id="postalCode"
                  v-model="form.postalCode"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
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
                <label
                  for="province"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {{ $t('profile.province') }}
                </label>
                <input
                  id="province"
                  v-model="form.province"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  :placeholder="$t('profile.provincePlaceholder')"
                />
              </div>

              <div>
                <label
                  for="country"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {{ $t('profile.country') }} *
                </label>
                <select
                  id="country"
                  v-model="form.country"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="ES">
                    España
                  </option>
                  <option value="FR">
                    France
                  </option>
                  <option value="IT">
                    Italia
                  </option>
                  <option value="PT">
                    Portugal
                  </option>
                  <option value="DE">
                    Deutschland
                  </option>
                  <option value="MD">
                    Moldova
                  </option>
                  <option value="RO">
                    România
                  </option>
                </select>
              </div>
            </div>

            <!-- Phone -->
            <div>
              <label
                for="phone"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {{ $t('profile.phone') }}
              </label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
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
              <input
                id="isDefault"
                v-model="form.isDefault"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                for="isDefault"
                class="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                {{ $t('profile.setAsDefault') }}
              </label>
            </div>
          </form>
        </div>

        <!-- Fixed footer with action buttons -->
        <div class="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            @click="$emit('close')"
          >
            {{ $t('common.cancel') }}
          </Button>
          <Button
            type="submit"
            form="addressForm"
            :disabled="isLoading"
            class="px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

interface Address {
  id?: number // SERIAL id from database
  type: 'shipping' | 'billing'
  firstName: string
  lastName: string
  company?: string
  street: string
  city: string
  postalCode: string
  province?: string
  country: string
  phone?: string
  isDefault: boolean
}

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
  if (form.phone && !/^[\+]?[0-9\s\-\(\)]{9,}$/.test(form.phone)) {
    errors.phone = t('profile.validation.phoneInvalid')
    return false
  }

  return true
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true

  try {
    emit('save', { ...form })
  }
  catch (error) {
    console.error('Error saving address:', error)
  }
  finally {
    isLoading.value = false
  }
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
