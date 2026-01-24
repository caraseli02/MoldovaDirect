<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-900">
    <div class="container py-4 md:py-12 pb-24 md:pb-12">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="mb-6 md:mb-8">
          <h1 class="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
            {{ $t('profile.title') }}
          </h1>
          <p class="text-sm md:text-base text-zinc-500 dark:text-zinc-400 mt-1">
            {{ $t('profile.autoSaveDescription') }}
          </p>

          <!-- Profile Completion Indicator -->
          <ProfileCompletionIndicator :percentage="profileCompletionPercentage" />
        </div>

        <!-- Profile Content -->
        <div
          class="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden"
        >
          <!-- Profile Picture Section (Always Visible) -->
          <ProfilePictureSection
            :picture-url="profilePictureUrl"
            :initials="getUserInitials()"
            :is-dragging="isDraggingAvatar"
            :is-loading="isLoading"
            @upload="handlePictureUpload"
            @remove="removePicture"
            @drag-over="handleDragOver"
            @drag-leave="handleDragLeave"
          />

          <!-- Personal Info Section (Expanded by Default) -->
          <ProfileAccordionSection
            ref="personalAccordion"
            :title="$t('profile.sections.personalInfo')"
            :subtitle="$t('profile.sections.personalInfoSubtitle')"
            icon="lucide:user"
            icon-bg="bg-blue-50 dark:bg-blue-900/30"
            icon-color="text-blue-600 dark:text-blue-400"
            :expanded="expandedSection === 'personal'"
            data-testid="profile-personal-section"
            @toggle="toggleSection('personal')"
            @navigate-first="focusAccordion('personal')"
            @navigate-last="focusAccordion('security')"
            @navigate-next="focusAccordion('preferences')"
            @navigate-prev="focusAccordion('security')"
          >
            <ProfilePersonalInfo
              :form="form"
              :errors="errors"
              @update:name="form.name = $event"
              @update:phone="form.phone = $event"
              @input="debouncedSave"
            />
          </ProfileAccordionSection>

          <!-- Preferences Section -->
          <ProfileAccordionSection
            ref="preferencesAccordion"
            :title="$t('profile.sections.preferences')"
            :subtitle="$t('profile.sections.preferencesSubtitle')"
            icon="lucide:settings"
            icon-bg="bg-zinc-100 dark:bg-zinc-700"
            icon-color="text-zinc-600 dark:text-zinc-400"
            :expanded="expandedSection === 'preferences'"
            data-testid="profile-preferences-section"
            @toggle="toggleSection('preferences')"
            @navigate-first="focusAccordion('personal')"
            @navigate-last="focusAccordion('security')"
            @navigate-next="focusAccordion('addresses')"
            @navigate-prev="focusAccordion('personal')"
          >
            <ProfilePreferences
              :preferred-language="form.preferredLanguage"
              :preferred-currency="form.preferredCurrency"
              @update:language="form.preferredLanguage = $event"
              @update:currency="form.preferredCurrency = $event"
              @change="handleSave"
            />
          </ProfileAccordionSection>

          <!-- Addresses Section -->
          <ProfileAccordionSection
            ref="addressesAccordion"
            :title="$t('profile.addresses')"
            :subtitle="addressCountText"
            icon="lucide:map-pin"
            icon-bg="bg-zinc-100 dark:bg-zinc-700"
            icon-color="text-zinc-600 dark:text-zinc-400"
            :expanded="expandedSection === 'addresses'"
            data-testid="profile-addresses-section"
            @toggle="toggleSection('addresses')"
            @navigate-first="focusAccordion('personal')"
            @navigate-last="focusAccordion('security')"
            @navigate-next="focusAccordion('security')"
            @navigate-prev="focusAccordion('preferences')"
          >
            <div class="space-y-4">
              <!-- Address List -->
              <div
                v-if="addresses.length > 0"
                class="space-y-3"
              >
                <div
                  v-for="address in addresses"
                  :key="address.id"
                  class="p-4 rounded-lg border transition-all duration-200"
                  :class="address.isDefault
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                    : 'border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500'"
                  :data-testid="`profile-address-${address.id}`"
                >
                  <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold text-zinc-900 dark:text-white">
                        {{ address.firstName }} {{ address.lastName }}
                      </span>
                      <span
                        v-if="address.isDefault"
                        class="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full"
                      >
                        {{ $t('profile.default') }}
                      </span>
                    </div>
                    <div class="flex gap-2">
                      <UiButton
                        type="button"
                        variant="ghost"
                        size="icon"
                        :aria-label="`${$t('profile.editAddress')} ${address.firstName} ${address.lastName}`"
                        :disabled="savingAddressId === address.id || deletingAddressId === address.id"
                        :data-testid="`profile-address-edit-${address.id}`"
                        @click="editAddress(address)"
                      >
                        <commonIcon
                          name="lucide:square-pen"
                          class="h-5 w-5"
                          aria-hidden="true"
                        />
                      </UiButton>
                      <UiButton
                        type="button"
                        variant="ghost"
                        size="icon"
                        :aria-label="`${$t('profile.deleteAddress')} ${address.firstName} ${address.lastName}`"
                        :disabled="savingAddressId === address.id || deletingAddressId === address.id"
                        :data-testid="`profile-address-delete-${address.id}`"
                        @click="address.id && confirmDeleteAddress(address.id)"
                      >
                        <commonIcon
                          v-if="deletingAddressId === address.id"
                          name="lucide:loader-2"
                          class="h-5 w-5 animate-spin"
                          aria-hidden="true"
                        />
                        <commonIcon
                          v-else
                          name="lucide:trash-2"
                          class="h-5 w-5"
                          aria-hidden="true"
                        />
                      </UiButton>
                    </div>
                  </div>
                  <div class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <p>{{ address.street }}</p>
                    <p>{{ address.city }}, {{ address.postalCode }}</p>
                    <p v-if="address.province">
                      {{ address.province }}
                    </p>
                    <p>{{ address.country }}</p>
                    <p
                      v-if="address.phone"
                      class="mt-1 text-zinc-500"
                    >
                      {{ address.phone }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Add Address Button -->
              <UiButton
                type="button"
                variant="outline"
                class="w-full border-dashed"
                data-testid="profile-add-address-btn"
                @click="showAddressForm = true"
              >
                + {{ addresses.length > 0 ? $t('profile.addAddress') : $t('profile.addFirstAddress') }}
              </UiButton>
            </div>
          </ProfileAccordionSection>

          <!-- Security Section -->
          <ProfileAccordionSection
            ref="securityAccordion"
            :title="$t('profile.sections.security')"
            :subtitle="$t('profile.sections.securitySubtitle')"
            icon="lucide:lock"
            icon-bg="bg-zinc-100 dark:bg-zinc-700"
            icon-color="text-zinc-600 dark:text-zinc-400"
            :expanded="expandedSection === 'security'"
            :is-last="true"
            data-testid="profile-security-section"
            @toggle="toggleSection('security')"
            @navigate-first="focusAccordion('personal')"
            @navigate-last="focusAccordion('security')"
            @navigate-next="focusAccordion('personal')"
            @navigate-prev="focusAccordion('addresses')"
          >
            <ProfileSecuritySection
              @change-password="showPasswordModal = true"
              @enable-2fa="show2FAModal = true"
            />
          </ProfileAccordionSection>

          <!-- Delete Account Section (Always Visible) -->
          <div class="p-4 md:p-6 bg-zinc-50 dark:bg-zinc-800/50">
            <UiButton
              type="button"
              variant="destructive"
              class="max-w-xs mx-auto w-full"
              data-testid="profile-delete-account-btn"
              @click="showDeleteConfirmation = true"
            >
              {{ $t('profile.deleteAccount') }}
            </UiButton>
          </div>
        </div>

        <!-- Auto-save Indicator -->
        <AutoSaveIndicator :status="saveStatus" />
      </div>
    </div>

    <!-- Address Form Modal -->
    <AddressFormModal
      v-if="showAddressForm"
      v-model:loading="addressFormLoading"
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

    <!-- Password Change Modal (Placeholder) -->
    <PasswordChangeModal
      :show="showPasswordModal"
      @close="showPasswordModal = false"
    />

    <!-- 2FA Modal (Placeholder) -->
    <TwoFAModal
      :show="show2FAModal"
      @close="show2FAModal = false"
    />

    <!-- Delete Address Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteAddressConfirm"
        ref="deleteAddressModalRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-address-modal-title"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        data-testid="delete-address-modal"
        @click.self="showDeleteAddressConfirm = false"
        @keydown.escape="showDeleteAddressConfirm = false"
        @keydown.tab="trapFocus($event, deleteAddressModalRef)"
      >
        <div class="bg-white dark:bg-zinc-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
          <h3
            id="delete-address-modal-title"
            class="text-lg font-semibold text-zinc-900 dark:text-white mb-2"
          >
            {{ $t('profile.deleteAddress') }}
          </h3>
          <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            {{ $t('profile.confirmDeleteAddress') }}
          </p>
          <div class="flex gap-3 justify-end">
            <UiButton
              variant="outline"
              @click="showDeleteAddressConfirm = false"
            >
              {{ $t('common.cancel') }}
            </UiButton>
            <UiButton
              variant="destructive"
              :disabled="deletingAddressId !== null"
              @click="executeDeleteAddress"
            >
              <commonIcon
                v-if="deletingAddressId !== null"
                name="lucide:loader-2"
                class="h-4 w-4 mr-2 animate-spin"
                aria-hidden="true"
              />
              {{ $t('common.delete') }}
            </UiButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// Component imports

import AddressFormModal from '~/components/profile/AddressFormModal.vue'
import DeleteAccountModal from '~/components/profile/DeleteAccountModal.vue'
import PasswordChangeModal from '~/components/profile/PasswordChangeModal.vue'
import ProfileAccordionSection from '~/components/profile/ProfileAccordionSection.vue'
import ProfileCompletionIndicator from '~/components/profile/ProfileCompletionIndicator.vue'
import ProfilePersonalInfo from '~/components/profile/ProfilePersonalInfo.vue'
import ProfilePictureSection from '~/components/profile/ProfilePictureSection.vue'
import ProfilePreferences from '~/components/profile/ProfilePreferences.vue'
import ProfileSecuritySection from '~/components/profile/ProfileSecuritySection.vue'
import TwoFAModal from '~/components/profile/TwoFAModal.vue'
import AutoSaveIndicator from '~/components/profile/AutoSaveIndicator.vue'

// Type imports - use shared types
import type { ProfileForm } from '~/types/user'
import type { ToastPlugin } from '~/types/plugins'
import type { Address, AddressEntity } from '~/types/address'

// Error handling utilities
import { getErrorMessage, getErrorCode } from '~/utils/errorUtils'

// Database address type alias for internal use
type DatabaseAddress = AddressEntity

// Apply authentication middleware
definePageMeta({
  middleware: 'auth',
})

// Composables and utilities
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { t, setLocale } = useI18n()
const nuxtApp = useNuxtApp()
const $toast = nuxtApp.$toast as ToastPlugin

// Reactive state
const isLoading = ref(false)
const profilePictureUrl = ref<string | null>(null)
const fileInput = ref<HTMLInputElement>()
const showAddressForm = ref(false)
const showDeleteConfirmation = ref(false)
const showPasswordModal = ref(false)
const show2FAModal = ref(false)
const showDeleteAddressConfirm = ref(false)
const addressToDelete = ref<number | null>(null)
const editingAddress = ref<Address | null>(null)
const addresses = ref<Address[]>([])
const isDraggingAvatar = ref(false)
const expandedSection = ref<string | null>('personal')
const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const savingAddressId = ref<number | null>(null)
const deletingAddressId = ref<number | null>(null)
const addressFormLoading = ref(false)
let saveTimeout: ReturnType<typeof setTimeout> | null = null
let hideStatusTimeout: ReturnType<typeof setTimeout> | null = null

// Modal refs for focus trap
const passwordModalRef = ref<HTMLElement>()
const twoFAModalRef = ref<HTMLElement>()
const deleteAddressModalRef = ref<HTMLElement>()
const passwordModalCloseBtn = ref<HTMLElement>()
const twoFAModalCloseBtn = ref<HTMLElement>()

// Accordion refs for keyboard navigation using Vue 3.5+ useTemplateRef
type AccordionKey = 'personal' | 'preferences' | 'addresses' | 'security'
const personalAccordionRef = useTemplateRef<InstanceType<typeof ProfileAccordionSection>>('personalAccordion')
const preferencesAccordionRef = useTemplateRef<InstanceType<typeof ProfileAccordionSection>>('preferencesAccordion')
const addressesAccordionRef = useTemplateRef<InstanceType<typeof ProfileAccordionSection>>('addressesAccordion')
const securityAccordionRef = useTemplateRef<InstanceType<typeof ProfileAccordionSection>>('securityAccordion')

// Map for easy lookup
const accordionRefs: Record<AccordionKey, Ref<InstanceType<typeof ProfileAccordionSection> | null>> = {
  personal: personalAccordionRef,
  preferences: preferencesAccordionRef,
  addresses: addressesAccordionRef,
  security: securityAccordionRef,
}

// Focus a specific accordion section for keyboard navigation
const focusAccordion = (section: AccordionKey) => {
  const accordion = accordionRefs[section].value
  if (accordion?.focus) {
    accordion.focus()
  }
}

// Track if form has unsaved changes
const hasUnsavedChanges = computed(() => {
  return form.name !== originalForm.value.name
    || form.phone !== originalForm.value.phone
    || form.preferredLanguage !== originalForm.value.preferredLanguage
    || form.preferredCurrency !== originalForm.value.preferredCurrency
})

// Form data
const form = reactive<ProfileForm>({
  name: '',
  email: '',
  phone: '',
  preferredLanguage: 'es',
  preferredCurrency: 'EUR',
})

const originalForm = ref<ProfileForm>({
  name: '',
  email: '',
  phone: '',
  preferredLanguage: 'es',
  preferredCurrency: 'EUR',
})

// Form validation
const errors = reactive({
  name: '',
  phone: '',
})

// Computed properties
const addressCountText = computed(() => {
  const count = addresses.value.length
  if (count === 0) return t('profile.noAddresses')
  return `${count} ${count === 1 ? t('profile.addressSingular') : t('profile.addressPlural')}`
})

const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case 'saving': return t('profile.saving')
    case 'saved': return t('profile.saved')
    case 'error': return t('profile.saveError')
    default: return ''
  }
})

// Profile completion percentage
const profileCompletionPercentage = computed(() => {
  let completed = 0
  const total = 5 // Total checkpoints

  if (form.name && form.name.length >= 2) completed++
  if (form.phone && /^[+]?[0-9\s\-()]{9,}$/.test(form.phone)) completed++
  if (profilePictureUrl.value) completed++
  if (addresses.value.length > 0) completed++
  // CRITICAL FIX: Only count preferences if user has explicitly saved them (not using defaults)
  // Check if preferences exist in user metadata (set via handleSave)
  const hasExplicitPreferences = user.value?.user_metadata?.preferred_language
    && user.value?.user_metadata?.preferred_currency
  if (hasExplicitPreferences) completed++

  return Math.round((completed / total) * 100)
})

// Focus trap utility for modals - accepts the element directly (Vue template auto-unwraps refs)
const trapFocus = (event: KeyboardEvent, modal: HTMLElement | undefined) => {
  if (!modal) return

  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    }
  }
  else {
    if (document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }
}

// Handle drag events for avatar
const handleDragOver = () => {
  isDraggingAvatar.value = true
}

const handleDragLeave = () => {
  isDraggingAvatar.value = false
}

// Toggle accordion section
const toggleSection = (section: string) => {
  expandedSection.value = expandedSection.value === section ? null : section
}

// Initialize form with user data
const initializeForm = () => {
  if (user.value) {
    const userData = {
      name: user.value.user_metadata?.name || user.value.user_metadata?.full_name || '',
      email: user.value.email || '',
      phone: user.value.user_metadata?.phone || '',
      preferredLanguage: (user.value.user_metadata?.preferred_language || 'es') as 'es' | 'en' | 'ro' | 'ru',
      preferredCurrency: (user.value.user_metadata?.preferred_currency || 'EUR') as 'EUR' | 'USD' | 'MDL',
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
  catch (error: unknown) {
    console.error('Error loading addresses:', getErrorMessage(error))
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

  if (form.phone && !/^[+]?[0-9\s\-()]{9,}$/.test(form.phone)) {
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

// Debounced auto-save
const debouncedSave = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  saveTimeout = setTimeout(() => {
    handleSave()
  }, 1000)
}

// Handle form save (auto-save)
const handleSave = async () => {
  if (!validateForm()) {
    // Scroll to first error field
    const firstErrorField = errors.name ? 'name' : errors.phone ? 'phone' : null
    if (firstErrorField) {
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }

  // Clear any existing hide timeout
  if (hideStatusTimeout) {
    clearTimeout(hideStatusTimeout)
  }

  saveStatus.value = 'saving'

  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        name: form.name,
        full_name: form.name,
        phone: form.phone,
        preferred_language: form.preferredLanguage,
        preferred_currency: form.preferredCurrency,
      },
    })

    if (error) throw error

    // Update original form to reflect saved state
    originalForm.value = { ...form }

    // Switch locale if language changed
    if (form.preferredLanguage) {
      setLocale(form.preferredLanguage)
    }

    saveStatus.value = 'saved'

    // Hide the indicator after 2 seconds
    hideStatusTimeout = setTimeout(() => {
      saveStatus.value = 'idle'
    }, 2000)
  }
  catch (error: unknown) {
    console.error('Error updating profile:', getErrorMessage(error))
    saveStatus.value = 'error'

    // CRITICAL FIX: Show toast error so user knows save failed
    const errorMsg = getErrorMessage(error)
    $toast.error(errorMsg || t('profile.saveError'))

    // Keep error visible longer so user can see it
    hideStatusTimeout = setTimeout(() => {
      saveStatus.value = 'idle'
    }, 5000)
  }
}

// Profile picture handling
const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleAvatarDrop = async (event: DragEvent) => {
  isDraggingAvatar.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    await uploadAvatar(file)
  }
}

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    await uploadAvatar(file)
  }
}

// Handler for ProfilePictureSection component (accepts File directly)
const handlePictureUpload = async (file: File) => {
  await uploadAvatar(file)
}

const uploadAvatar = async (file: File) => {
  if (!user.value) return

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
    saveStatus.value = 'saving'

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
    saveStatus.value = 'saved'
    $toast.success(t('profile.success.pictureUpdated'))

    setTimeout(() => {
      saveStatus.value = 'idle'
    }, 2000)
  }
  catch (error: unknown) {
    console.error('Error uploading profile picture:', getErrorMessage(error))
    saveStatus.value = 'error'
    const errorMessage = error instanceof Error ? getErrorMessage(error) : 'An error occurred'
    $toast.error(t('profile.errors.uploadFailed') + ': ' + errorMessage)

    setTimeout(() => {
      saveStatus.value = 'idle'
    }, 3000)
  }
  finally {
    isLoading.value = false
  }
}

const removePicture = async () => {
  if (!user.value) return

  try {
    isLoading.value = true
    saveStatus.value = 'saving'

    // Remove from storage - get filename from stored URL to handle any extension
    const avatarUrl = user.value.user_metadata?.avatar_url
    if (avatarUrl) {
      const urlParts = avatarUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]

      // FIX: Check storage deletion errors
      const { error: storageError } = await supabase.storage
        .from('avatars')
        .remove([`${user.value.id}/${fileName}`])

      if (storageError) {
        // Log but don't throw - proceed with metadata update
        console.warn('Storage deletion warning:', storageError)
      }
    }

    // Update user metadata
    const { error } = await supabase.auth.updateUser({
      data: { avatar_url: null },
    })

    if (error) throw error

    profilePictureUrl.value = null
    saveStatus.value = 'saved'
    $toast.success(t('profile.success.pictureRemoved'))

    setTimeout(() => {
      saveStatus.value = 'idle'
    }, 2000)
  }
  catch (error: unknown) {
    console.error('Error removing profile picture:', getErrorMessage(error))
    saveStatus.value = 'error'
    $toast.error(t('profile.errors.removeFailed'))

    setTimeout(() => {
      saveStatus.value = 'idle'
    }, 3000)
  }
  finally {
    isLoading.value = false
  }
}

// Address management
const closeAddressForm = () => {
  showAddressForm.value = false
  editingAddress.value = null
  addressFormLoading.value = false
}

const editAddress = (address: Address) => {
  editingAddress.value = { ...address }
  showAddressForm.value = true
}

const handleAddressSave = async (addressData: Address) => {
  if (!user.value?.id) {
    addressFormLoading.value = false
    $toast.error(t('profile.errors.notAuthenticated'))
    return
  }

  // Check for duplicates
  const isDuplicate = addresses.value.some((addr) => {
    // Skip checking against itself when editing
    if (addressData.id && addr.id === addressData.id) return false

    return (
      addr.firstName.trim().toLowerCase() === addressData.firstName.trim().toLowerCase()
      && addr.lastName.trim().toLowerCase() === addressData.lastName.trim().toLowerCase()
      && addr.street.trim().toLowerCase() === addressData.street.trim().toLowerCase()
      && addr.city.trim().toLowerCase() === addressData.city.trim().toLowerCase()
      && addr.postalCode.trim().toLowerCase() === addressData.postalCode.trim().toLowerCase()
      && addr.country === addressData.country
    )
  })

  if (isDuplicate) {
    addressFormLoading.value = false
    $toast.error(t('profile.errors.addressExists') || 'Address already exists')
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

      const { error } = await (supabase as any)
        .from('user_addresses')
        .update(dbAddress)
        .eq('id', addressData.id)
        .eq('user_id', user.value.id)

      if (error) throw error
    }
    else {
      // Create new address

      const { error } = await (supabase as any)
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
  catch (error: unknown) {
    console.error('Error saving address:', getErrorMessage(error))
    addressFormLoading.value = false
    $toast.error(t('profile.errors.addressSaveFailed'))
  }
}

// Show delete confirmation modal instead of using native confirm()
const confirmDeleteAddress = (addressId: number) => {
  addressToDelete.value = addressId
  showDeleteAddressConfirm.value = true
}

// Execute the address deletion after confirmation
const executeDeleteAddress = async () => {
  if (!addressToDelete.value) return
  if (!user.value?.id) {
    $toast.error(t('profile.errors.notAuthenticated'))
    return
  }

  const addressId = addressToDelete.value

  try {
    deletingAddressId.value = addressId

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
  catch (error: unknown) {
    console.error('Error deleting address:', getErrorMessage(error))

    // Provide specific error feedback
    if (getErrorCode(error) === '42501') {
      $toast.error(t('profile.errors.permissionDenied') || 'Permission denied')
    }
    else {
      $toast.error(t('profile.errors.addressDeleteFailed'))
    }
  }
  finally {
    deletingAddressId.value = null
    addressToDelete.value = null
    showDeleteAddressConfirm.value = false
  }
}

// Account deletion - receives password and reason from DeleteAccountModal
const handleDeleteAccount = async (data: { password: string, reason?: string }) => {
  try {
    isLoading.value = true

    // Call server endpoint with password for verification and reason for analytics
    const response = await $fetch<{ success?: boolean, error?: string }>('/api/auth/delete-account', {
      method: 'DELETE',
      body: {
        password: data.password,
        reason: data.reason,
      },
    })

    if (response.error) throw new Error(response.error)

    $toast.success(t('profile.success.accountDeleted'))
    await navigateTo('/')
  }
  catch (error: unknown) {
    console.error('Error deleting account:', getErrorMessage(error))
    const errorMessage = error instanceof Error ? getErrorMessage(error) : 'An error occurred'
    $toast.error(t('profile.errors.deleteFailed') + ': ' + errorMessage)
  }
  finally {
    isLoading.value = false
    showDeleteConfirmation.value = false
  }
}

// Beforeunload handler to warn about unsaved changes
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value || saveTimeout) {
    e.preventDefault()
    // Modern browsers ignore custom messages, but returnValue is required
    e.returnValue = t('profile.unsavedChangesWarning') || 'You have unsaved changes.'
  }
}

// Focus first element when modal opens
watch(showPasswordModal, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      const modal = passwordModalRef.value
      const firstFocusable = modal?.querySelector('button, [href], input') as HTMLElement
      firstFocusable?.focus()
    })
  }
})

watch(show2FAModal, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      const modal = twoFAModalRef.value
      const firstFocusable = modal?.querySelector('button, [href], input') as HTMLElement
      firstFocusable?.focus()
    })
  }
})

watch(showDeleteAddressConfirm, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      const modal = deleteAddressModalRef.value
      const firstFocusable = modal?.querySelector('button, [href], input') as HTMLElement
      firstFocusable?.focus()
    })
  }
})

// Session expiration handler
watch(user, (newUser, oldUser) => {
  if (oldUser && !newUser) {
    $toast.error(t('profile.errors.sessionExpired') || 'Session expired. Please log in again.')
    navigateTo('/auth/login')
  }
})

// Initialize on mount
onMounted(() => {
  initializeForm()
  loadAddresses()

  // Add beforeunload listener for unsaved changes warning
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// Watch for user changes
watch(user, () => {
  if (user.value) {
    initializeForm()
    loadAddresses()
  }
}, { immediate: true })

// Cleanup timeouts and event listeners on unmount
onUnmounted(() => {
  if (saveTimeout) clearTimeout(saveTimeout)
  if (hideStatusTimeout) clearTimeout(hideStatusTimeout)

  // Remove beforeunload listener
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// Page meta
useHead({
  title: t('profile.title'),
})
</script>
