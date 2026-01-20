/**
 * Profile Picture Composable
 *
 * Handles avatar upload, removal, drag & drop state, and user initials.
 *
 * @example
 * ```ts
 * const { profilePictureUrl, isDragging, userInitials, uploadAvatar, removePicture } = useProfilePicture()
 *
 * // Upload with callback for save status updates
 * await uploadAvatar(file, (status) => { saveStatus.value = status })
 * ```
 */

import type { Ref } from 'vue'
import { computed, onUnmounted, ref } from 'vue'
import type { SupabaseClient } from '@supabase/supabase-js'

import { getErrorMessage } from '~/utils/errorUtils'
import { PROFILE_VALIDATION, SAVE_TIMING, type SaveStatus } from './profile/validation-constants'
import type { SupabaseUser } from '~/types/user'
import type { ToastPlugin } from '~/types/plugins'

interface UseProfilePictureOptions {
  /** Supabase client instance */
  supabase: SupabaseClient
  /** Current authenticated user */
  user: Ref<SupabaseUser | null>
  /** Toast notification plugin */
  $toast: ToastPlugin
  /** i18n t function */
  t: (key: string) => string
}

interface UseProfilePictureReturn {
  /** Current avatar URL (null if not set) */
  profilePictureUrl: Ref<string | null>
  /** Whether user is currently dragging a file over the drop zone */
  isDragging: Ref<boolean>
  /** Loading state for upload/removal operations */
  isLoading: Ref<boolean>
  /** Reference to the hidden file input element */
  fileInputRef: Ref<HTMLInputElement | undefined>
  /** User's initials for avatar placeholder */
  userInitials: ComputedRef<string>
  /** Current form name for initials calculation */
  formName: Ref<string>
  /**
   * Initialize the avatar URL from user metadata
   * Call this when component mounts or user data changes
   */
  initializePicture(): void
  /**
   * Upload a new avatar picture
   * @param file - The image file to upload
   * @param onStatusChange - Callback for save status updates
   */
  uploadAvatar(file: File, onStatusChange: (status: SaveStatus) => void): Promise<void>
  /**
   * Remove the current avatar picture
   * @param onStatusChange - Callback for save status updates
   */
  removePicture(onStatusChange: (status: SaveStatus) => void): Promise<void>
  /**
   * Get user initials from name or email
   * @param name - Current form name (optional, falls back to user metadata)
   */
  getInitials(name?: string): string
}

export function useProfilePicture(options: UseProfilePictureOptions): UseProfilePictureReturn {
  const { supabase, user, $toast, t } = options

  // State
  const profilePictureUrl = ref<string | null>(null)
  const isDragging = ref(false)
  const isLoading = ref(false)
  const fileInputRef = ref<HTMLInputElement>()
  const formName = ref('')

  // Track timeouts for cleanup
  const timeouts: ReturnType<typeof setTimeout>[] = []

  /**
   * User's initials computed from form name or email
   */
  const userInitials = computed(() => {
    return getInitials(formName.value)
  })

  /**
   * Initialize avatar URL from user metadata
   */
  function initializePicture(): void {
    if (user.value?.user_metadata?.avatar_url) {
      profilePictureUrl.value = user.value.user_metadata.avatar_url
    }
    else {
      profilePictureUrl.value = null
    }
  }

  /**
   * Get user initials from name or email
   */
  function getInitials(name?: string): string {
    const nameToUse = name || formName.value
    if (nameToUse) {
      return nameToUse
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('')
    }

    // Fallback to email initial
    const email = user.value?.email
    return email ? email.charAt(0).toUpperCase() : 'U'
  }

  /**
   * Upload a new avatar picture
   */
  async function uploadAvatar(file: File, onStatusChange: (status: SaveStatus) => void): Promise<void> {
    if (!user.value?.id) {
      $toast.error(t('profile.errors.notAuthenticated'))
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      $toast.error(t('profile.errors.invalidFileType'))
      return
    }

    // Validate file size
    if (file.size > PROFILE_VALIDATION.AVATAR_MAX_SIZE) {
      $toast.error(t('profile.errors.fileTooLarge'))
      return
    }

    try {
      isLoading.value = true
      onStatusChange('saving')

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `${user.value.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from(PROFILE_VALIDATION.AVATAR_STORAGE_BUCKET)
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage
        .from(PROFILE_VALIDATION.AVATAR_STORAGE_BUCKET)
        .getPublicUrl(fileName)

      const avatarUrl = data.publicUrl

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      })

      if (updateError) throw updateError

      profilePictureUrl.value = avatarUrl
      onStatusChange('saved')
      $toast.success(t('profile.success.pictureUpdated'))

      // Auto-hide saved status
      const timeoutId = setTimeout(() => {
        onStatusChange('idle')
      }, SAVE_TIMING.SAVED_STATUS_DURATION)
      timeouts.push(timeoutId)
    }
    catch (error: unknown) {
      console.error('Error uploading profile picture:', getErrorMessage(error))
      onStatusChange('error')
      const errorMessage = error instanceof Error ? getErrorMessage(error) : 'An error occurred'
      $toast.error(`${t('profile.errors.uploadFailed')}: ${errorMessage}`)

      // Auto-hide error status
      const errorTimeoutId = setTimeout(() => {
        onStatusChange('idle')
      }, SAVE_TIMING.ERROR_STATUS_DURATION)
      timeouts.push(errorTimeoutId)
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Remove the current avatar picture
   */
  async function removePicture(onStatusChange: (status: SaveStatus) => void): Promise<void> {
    if (!user.value?.id) {
      $toast.error(t('profile.errors.notAuthenticated'))
      return
    }

    try {
      isLoading.value = true
      onStatusChange('saving')

      // Remove from storage
      const avatarUrl = user.value.user_metadata?.avatar_url
      if (avatarUrl) {
        const urlParts = avatarUrl.split('/')
        const fileName = urlParts[urlParts.length - 1]

        const { error: storageError } = await supabase.storage
          .from(PROFILE_VALIDATION.AVATAR_STORAGE_BUCKET)
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
      onStatusChange('saved')
      $toast.success(t('profile.success.pictureRemoved'))

      // Auto-hide saved status
      const savedTimeoutId = setTimeout(() => {
        onStatusChange('idle')
      }, SAVE_TIMING.SAVED_STATUS_DURATION)
      timeouts.push(savedTimeoutId)
    }
    catch (error: unknown) {
      console.error('Error removing profile picture:', getErrorMessage(error))
      onStatusChange('error')
      $toast.error(t('profile.errors.removeFailed'))

      // Auto-hide error status
      const errorTimeoutId = setTimeout(() => {
        onStatusChange('idle')
      }, SAVE_TIMING.ERROR_STATUS_DURATION)
      timeouts.push(errorTimeoutId)
    }
    finally {
      isLoading.value = false
    }
  }

  // Cleanup timeouts on unmount
  onUnmounted(() => {
    timeouts.forEach(clearTimeout)
  })

  return {
    profilePictureUrl,
    isDragging,
    isLoading,
    fileInputRef,
    userInitials,
    formName,
    initializePicture,
    uploadAvatar,
    removePicture,
    getInitials,
  }
}
