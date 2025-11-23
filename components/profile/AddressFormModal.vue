<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div 
        class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
        @click="$emit('close')"
      ></div>

      <!-- Modal panel -->
      <div class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ address?.id ? $t('profile.editAddress') : $t('profile.addAddress') }}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <commonIcon name="lucide:x" class="h-6 w-6" />
          </Button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Full Name -->
          <div>
            <label for="fullName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('profile.fullName') }} *
            </label>
            <input
              id="fullName"
              v-model="form.fullName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              :class="{ 'border-red-500': errors.fullName }"
              :placeholder="$t('profile.fullNamePlaceholder')"
            >
            <p v-if="errors.fullName" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ errors.fullName }}
            </p>
          </div>

          <!-- Phone -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('profile.phone') }}
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              :class="{ 'border-red-500': errors.phone }"
              :placeholder="$t('profile.phonePlaceholder')"
            >
            <p v-if="errors.phone" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ errors.phone }}
            </p>
          </div>

          <!-- Address -->
          <div>
            <label for="address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('profile.address') }} *
            </label>
            <input
              id="address"
              v-model="form.address"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              :class="{ 'border-red-500': errors.address }"
              :placeholder="$t('profile.addressPlaceholder')"
            >
            <p v-if="errors.address" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ errors.address }}
            </p>
          </div>

          <!-- City and Postal Code -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="city" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              >
              <p v-if="errors.city" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errors.city }}
              </p>
            </div>

            <div>
              <label for="postalCode" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              >
              <p v-if="errors.postalCode" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errors.postalCode }}
              </p>
            </div>
          </div>

          <!-- Country -->
          <div>
            <label for="country" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('profile.country') }} *
            </label>
            <select
              id="country"
              v-model="form.country"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="ES">España</option>
              <option value="FR">France</option>
              <option value="IT">Italia</option>
              <option value="PT">Portugal</option>
              <option value="DE">Deutschland</option>
              <option value="MD">Moldova</option>
              <option value="RO">România</option>
            </select>
          </div>

          <!-- Default Address -->
          <div class="flex items-center">
            <input
              id="isDefault"
              v-model="form.isDefault"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            >
            <label for="isDefault" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {{ $t('profile.setAsDefault') }}
            </label>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              size="sm"
              @click="$emit('close')"
              class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              {{ $t('common.cancel') }}
            </Button>
            <Button
              type="submit"
              :disabled="isLoading"
              class="px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="isLoading" class="flex items-center">
                <commonIcon name="lucide:loader-2" class="animate-spin h-4 w-4 mr-2" />
                {{ $t('common.loading') }}
              </span>
              <span v-else>
                {{ address?.id ? $t('profile.updateAddress') : $t('profile.saveAddress') }}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

interface Address {
  id?: string  // Changed from number to string (UUID)
  fullName: string
  address: string
  city: string
  postalCode: string
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

// Form data - Initialize with user data
const form = reactive<Address>({
  fullName: user.value?.user_metadata?.full_name || user.value?.user_metadata?.name || '',
  address: '',
  city: '',
  postalCode: '',
  country: 'ES',
  phone: user.value?.user_metadata?.phone || '',
  isDefault: false
})

// Form validation
const errors = reactive({
  fullName: '',
  address: '',
  city: '',
  postalCode: '',
  phone: ''
})

// Initialize form with address data if editing
const initializeForm = () => {
  if (props.address) {
    Object.assign(form, props.address)
  }
}

// Form validation
const validateForm = (): boolean => {
  errors.fullName = ''
  errors.address = ''
  errors.city = ''
  errors.postalCode = ''
  errors.phone = ''

  if (!form.fullName.trim()) {
    errors.fullName = t('profile.validation.fullNameRequired')
    return false
  }

  if (!form.address.trim()) {
    errors.address = t('profile.validation.addressRequired')
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
  } catch (error) {
    console.error('Error saving address:', error)
  } finally {
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