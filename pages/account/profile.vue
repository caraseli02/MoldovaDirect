<template>
  <div class="py-12">
    <div class="container">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {{ $t('profile.title') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            {{ $t('profile.description') }}
          </p>
        </div>

        <!-- Profile Form -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <form
            class="p-6 space-y-6"
            @submit.prevent="handleSubmit"
          >
            <!-- Profile Picture Section -->
            <div class="flex items-center space-x-6">
              <div class="relative">
                <div class="h-24 w-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="profilePictureUrl"
                    :src="profilePictureUrl"
                    :alt="$t('profile.profilePicture')"
                    class="h-full w-full object-cover"
                  />
                  <span
                    v-else
                    class="text-2xl font-semibold text-primary-600 dark:text-primary-400"
                  >
                    {{ getUserInitials() }}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  class="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  :title="$t('profile.changePicture')"
                  @click="triggerFileUpload"
                >
                  <commonIcon
                    name="lucide:camera"
                    class="h-4 w-4"
                  />
                </Button>
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ $t('profile.profilePicture') }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {{ $t('profile.profilePictureDescription') }}
                </p>
                <div class="flex space-x-2">
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    @click="triggerFileUpload"
                  >
                    {{ profilePictureUrl ? $t('profile.changePicture') : $t('profile.uploadPicture') }}
                  </Button>
                  <Button
                    v-if="profilePictureUrl"
                    type="button"
                    variant="link"
                    size="sm"
                    class="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    @click="removePicture"
                  >
                    {{ $t('profile.removePicture') }}
                  </Button>
                </div>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileUpload"
              />
            </div>

            <!-- Personal Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {{ $t('auth.labels.fullName') }} *
                </label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': errors.name }"
                  :placeholder="$t('auth.placeholders.fullName')"
                />
                <p
                  v-if="errors.name"
                  class="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {{ errors.name }}
                </p>
              </div>

              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {{ $t('auth.labels.email') }} *
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  disabled
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  :placeholder="$t('auth.placeholders.email')"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ $t('profile.emailCannotBeChanged') }}
                </p>
              </div>

              <div>
                <label
                  for="phone"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {{ $t('auth.labels.phone') }}
                </label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': errors.phone }"
                  :placeholder="$t('auth.placeholders.phone')"
                />
                <p
                  v-if="errors.phone"
                  class="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {{ errors.phone }}
                </p>
              </div>

              <div>
                <label
                  for="language"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {{ $t('auth.labels.language') }}
                </label>
                <select
                  id="language"
                  v-model="form.preferredLanguage"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="es">
                    Español
                  </option>
                  <option value="en">
                    English
                  </option>
                  <option value="ro">
                    Română
                  </option>
                  <option value="ru">
                    Русский
                  </option>
                </select>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="ghost"
                class="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                @click="showDeleteConfirmation = true"
              >
                {{ $t('profile.deleteAccount') }}
              </Button>

              <div class="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  :disabled="isLoading"
                  class="text-sm font-medium"
                  @click="resetForm"
                >
                  {{ $t('common.cancel') }}
                </Button>
                <Button
                  type="submit"
                  :disabled="isLoading || !hasChanges"
                  class="px-6 py-2 text-sm font-medium"
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
                    {{ $t('profile.saveChanges') }}
                  </span>
                </Button>
              </div>
            </div>
          </form>
        </div>

        <!-- Address Management Section -->
        <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                  {{ $t('profile.addresses') }}
                </h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('profile.addressesDescription') }}
                </p>
              </div>
              <Button
                class="px-4 py-2 text-sm font-medium"
                @click="showAddressForm = true"
              >
                {{ $t('profile.addAddress') }}
              </Button>
            </div>

            <!-- Address List -->
            <div
              v-if="addresses.length > 0"
              class="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div
                v-for="address in addresses"
                :key="address.id"
                class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 relative"
                :class="{ 'ring-2 ring-primary-500': address.isDefault }"
              >
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ address.firstName }} {{ address.lastName }}
                    </span>
                    <span
                      v-if="address.isDefault"
                      class="px-2 py-1 text-xs bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full"
                    >
                      {{ $t('profile.default') }}
                    </span>
                  </div>
                  <div class="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      :title="$t('profile.editAddress')"
                      @click="editAddress(address)"
                    >
                      <commonIcon
                        name="lucide:square-pen"
                        class="h-4 w-4"
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      :title="$t('profile.deleteAddress')"
                      @click="deleteAddress(address.id!)"
                    >
                      <commonIcon
                        name="lucide:trash-2"
                        class="h-4 w-4"
                      />
                    </Button>
                  </div>
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  <p>{{ address.street }}</p>
                  <p>{{ address.city }}, {{ address.postalCode }}</p>
                  <p v-if="address.province">
                    {{ address.province }}
                  </p>
                  <p>{{ address.country }}</p>
                  <p
                    v-if="address.phone"
                    class="mt-1"
                  >
                    {{ address.phone }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-else
              class="text-center py-8"
            >
              <commonIcon
                name="lucide:map-pin"
                class="h-12 w-12 text-gray-400 mx-auto mb-4"
              />
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                {{ $t('profile.noAddresses') }}
              </p>
              <Button
                class="px-4 py-2 text-sm font-medium"
                @click="showAddressForm = true"
              >
                {{ $t('profile.addFirstAddress') }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Address Form Modal -->
    <AddressFormModal
      v-if="showAddressForm"
      :address="editingAddress"
      @save="handleAddressSave"
      @close="closeAddressForm"
    />

    <!-- Delete Account Confirmation Modal -->
    <DeleteAccountModal
      v-if="showDeleteConfirmation"
      @confirm="handleDeleteAccount"
      @close="showDeleteConfirmation = false"
    />
  </div>
</template>

<script setup lang="ts">
// Component imports
import { Button } from '@/components/ui/button'
import AddressFormModal from '~/components/profile/AddressFormModal.vue'
import DeleteAccountModal from '~/components/profile/DeleteAccountModal.vue'

// Apply authentication middleware
definePageMeta({
  middleware: 'auth',
})

interface ProfileForm {
  name: string
  email: string
  phone: string
  preferredLanguage: 'es' | 'en' | 'ro' | 'ru'
}

interface Address {
  id?: number // SERIAL from database
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

interface DatabaseAddress {
  id: number
  user_id: string
  type: 'shipping' | 'billing'
  first_name: string
  last_name: string
  company: string | null
  street: string
  city: string
  postal_code: string
  province: string | null
  country: string
  phone: string | null
  is_default: boolean
}

// Type the Supabase client to avoid type errors with generic tables
const supabase = useSupabaseClient<any>()
const user = useSupabaseUser()
const { t } = useI18n()
const nuxtApp = useNuxtApp()
const $toast = nuxtApp.$toast as {
  success: (message: string) => void
  error: (message: string) => void
}

// Reactive state
const isLoading = ref(false)
const profilePictureUrl = ref<string | null>(null)
const fileInput = ref<HTMLInputElement>()
const showAddressForm = ref(false)
const showDeleteConfirmation = ref(false)
const editingAddress = ref<Address | null>(null)
const addresses = ref<Address[]>([])

// Form data
const form = reactive<ProfileForm>({
  name: '',
  email: '',
  phone: '',
  preferredLanguage: 'es',
})

const originalForm = ref<ProfileForm>({
  name: '',
  email: '',
  phone: '',
  preferredLanguage: 'es',
})

// Form validation
const errors = reactive({
  name: '',
  phone: '',
})

// Computed properties
const hasChanges = computed(() => {
  return JSON.stringify(form) !== JSON.stringify(originalForm.value)
})

// Initialize form with user data
const initializeForm = () => {
  if (user.value) {
    const userData = {
      name: user.value.user_metadata?.name || user.value.user_metadata?.full_name || '',
      email: user.value.email || '',
      phone: user.value.user_metadata?.phone || '',
      preferredLanguage: (user.value.user_metadata?.preferred_language || 'es') as 'es' | 'en' | 'ro' | 'ru',
    }

    Object.assign(form, userData)
    originalForm.value = { ...userData }

    // Load profile picture if exists
    if (user.value.user_metadata?.avatar_url) {
      profilePictureUrl.value = user.value.user_metadata.avatar_url
    }
  }
}

// Load addresses
const loadAddresses = async () => {
  if (!user.value) return

  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.value.id)
      .order('is_default', { ascending: false })

    if (error) throw error

    // Map database fields to camelCase
    addresses.value = (data || []).map((addr: DatabaseAddress): Address => ({
      id: addr.id,
      type: addr.type,
      firstName: addr.first_name,
      lastName: addr.last_name,
      company: addr.company || undefined,
      street: addr.street,
      city: addr.city,
      postalCode: addr.postal_code,
      province: addr.province || undefined,
      country: addr.country,
      phone: addr.phone || undefined,
      isDefault: addr.is_default,
    }))
  }
  catch (error) {
    console.error('Error loading addresses:', error)
    $toast.error(t('profile.errors.loadAddressesFailed'))
  }
}

// Form validation
const validateForm = (): boolean => {
  errors.name = ''
  errors.phone = ''

  if (!form.name.trim()) {
    errors.name = t('auth.validation.name.required')
    return false
  }

  if (form.name.trim().length < 2) {
    errors.name = t('auth.validation.name.minLength')
    return false
  }

  if (form.phone && !/^[\+]?[0-9\s\-\(\)]{9,}$/.test(form.phone)) {
    errors.phone = t('auth.validation.phone.invalid')
    return false
  }

  return true
}

// Get user initials for avatar
const getUserInitials = (): string => {
  if (!form.name) {
    const email = user.value?.email
    return email ? email.charAt(0).toUpperCase() : 'U'
  }

  return form.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true

  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        name: form.name,
        full_name: form.name,
        phone: form.phone,
        preferred_language: form.preferredLanguage,
      },
    })

    if (error) throw error

    // Update original form to reflect saved state
    originalForm.value = { ...form }

    $toast.success(t('profile.success.profileUpdated'))
  }
  catch (error) {
    console.error('Error updating profile:', error)
    $toast.error(t('profile.errors.updateFailed'))
  }
  finally {
    isLoading.value = false
  }
}

// Reset form to original values
const resetForm = () => {
  Object.assign(form, originalForm.value)
  errors.name = ''
  errors.phone = ''
}

// Profile picture handling
const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !user.value) return

  // Validate file
  if (!file.type.startsWith('image/')) {
    $toast.error(t('profile.errors.invalidFileType'))
    return
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    $toast.error(t('profile.errors.fileTooLarge'))
    return
  }

  try {
    isLoading.value = true

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.value.id}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    const avatarUrl = data.publicUrl

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl },
    })

    if (updateError) throw updateError

    profilePictureUrl.value = avatarUrl
    $toast.success(t('profile.success.pictureUpdated'))
  }
  catch (error) {
    console.error('Error uploading profile picture:', error)
    const errorMessage = error instanceof Error ? error.message : 'An error occurred'
    $toast.error(t('profile.errors.uploadFailed') + ': ' + errorMessage)
  }
  finally {
    isLoading.value = false
  }
}

const removePicture = async () => {
  if (!user.value) return

  try {
    isLoading.value = true

    // Remove from storage
    const fileName = `${user.value.id}/avatar.jpg`
    await supabase.storage.from('avatars').remove([fileName])

    // Update user metadata
    const { error } = await supabase.auth.updateUser({
      data: { avatar_url: null },
    })

    if (error) throw error

    profilePictureUrl.value = null
    $toast.success(t('profile.success.pictureRemoved'))
  }
  catch (error) {
    console.error('Error removing profile picture:', error)
    $toast.error(t('profile.errors.removeFailed'))
  }
  finally {
    isLoading.value = false
  }
}

// Address management
const closeAddressForm = () => {
  showAddressForm.value = false
  editingAddress.value = null
}

const editAddress = (address: Address) => {
  editingAddress.value = { ...address }
  showAddressForm.value = true
}

const handleAddressSave = async (addressData: Address) => {
  if (!user.value?.id) {
    $toast.error(t('profile.errors.notAuthenticated'))
    return
  }

  try {
    // Map camelCase to snake_case for database
    const dbAddress = {
      type: addressData.type,
      first_name: addressData.firstName,
      last_name: addressData.lastName,
      company: addressData.company || null,
      street: addressData.street,
      city: addressData.city,
      postal_code: addressData.postalCode,
      province: addressData.province || null,
      country: addressData.country,
      phone: addressData.phone || null,
      is_default: addressData.isDefault,
    }

    if (addressData.id) {
      // Update existing address - verify user owns it
      const { error } = await supabase
        .from('user_addresses')
        .update(dbAddress)
        .eq('id', addressData.id)
        .eq('user_id', user.value.id)

      if (error) throw error
    }
    else {
      // Create new address
      const { error } = await supabase
        .from('user_addresses')
        .insert({
          ...dbAddress,
          user_id: user.value.id,
        })

      if (error) throw error
    }

    await loadAddresses()
    closeAddressForm()
    $toast.success(t('profile.success.addressSaved'))
  }
  catch (error) {
    console.error('Error saving address:', error)
    $toast.error(t('profile.errors.addressSaveFailed'))
  }
}

const deleteAddress = async (addressId: number) => {
  if (!confirm(t('profile.confirmDeleteAddress'))) return
  if (!user.value?.id) {
    $toast.error(t('profile.errors.notAuthenticated'))
    return
  }

  try {
    // Verify user owns the address before deleting
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', user.value.id)

    if (error) throw error

    await loadAddresses()
    $toast.success(t('profile.success.addressDeleted'))
  }
  catch (error) {
    console.error('Error deleting address:', error)
    $toast.error(t('profile.errors.addressDeleteFailed'))
  }
}

// Account deletion
const handleDeleteAccount = async () => {
  try {
    isLoading.value = true

    // This would typically involve calling a server endpoint
    // that handles account deletion properly
    const response = await $fetch<{ success?: boolean, error?: string }>('/api/auth/delete-account', {
      method: 'DELETE',
    })

    if (response.error) throw new Error(response.error)

    $toast.success(t('profile.success.accountDeleted'))
    await navigateTo('/')
  }
  catch (error) {
    console.error('Error deleting account:', error)
    const errorMessage = error instanceof Error ? error.message : 'An error occurred'
    $toast.error(t('profile.errors.deleteFailed') + ': ' + errorMessage)
  }
  finally {
    isLoading.value = false
    showDeleteConfirmation.value = false
  }
}

// Initialize on mount
onMounted(() => {
  initializeForm()
  loadAddresses()
})

// Watch for user changes
watch(user, () => {
  if (user.value) {
    initializeForm()
    loadAddresses()
  }
}, { immediate: true })

// Page meta
useHead({
  title: t('profile.title'),
})
</script>
