<script setup lang="ts">
/**
 * Profile Picture Section Component
 *
 * Avatar display with drag & drop upload, camera button, and remove option.
 * Shows user initials when no picture is set.
 *
 * @example
 * ```vue
 * <ProfilePictureSection
 *   :picture-url="profilePictureUrl"
 *   :initials="userInitials"
 *   :is-dragging="isDragging"
 *   :is-loading="isLoading"
 *   @upload="handleFileUpload"
 *   @remove="removePicture"
 *   @drag-over="isDraggingAvatar = true"
 *   @drag-leave="isDraggingAvatar = false"
 * />
 * ```
 */

interface Props {
  /** Current avatar URL (null if not set) */
  pictureUrl: string | null
  /** User's initials for placeholder */
  initials: string
  /** Whether user is dragging a file over the drop zone */
  isDragging: boolean
  /** Whether avatar operations are in progress */
  isLoading?: boolean
}

const { pictureUrl, initials, isDragging, isLoading = false } = defineProps<Props>()

const emit = defineEmits<{
  /** Emitted when a file is selected (via input or drop) */
  upload: [file: File]
  /** Emitted when user clicks remove button */
  remove: []
  /** Emitted when file is dragged over the drop zone */
  dragOver: []
  /** Emitted when file leaves the drop zone */
  dragLeave: []
}>()

const fileInputRef = ref<HTMLInputElement>()

function triggerFileUpload() {
  if (!isLoading) {
    fileInputRef.value?.click()
  }
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('upload', file)
  }
  // Reset input so same file can be selected again
  target.value = ''
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  emit('dragLeave')
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    emit('upload', file)
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  emit('dragOver')
}

function handleDragLeave(event: DragEvent) {
  // Only emit if we're actually leaving the drop zone (not just hovering over a child)
  const target = event.currentTarget as HTMLElement
  if (target.contains(event.relatedTarget as Node)) {
    return
  }
  emit('dragLeave')
}

// Expose methods for parent access if needed
defineExpose({ triggerFileUpload })
</script>

<template>
  <div
    class="border-b border-zinc-200 dark:border-zinc-700"
    data-testid="profile-avatar-section"
  >
    <div class="p-6 text-center">
      <!-- Drag & Drop Avatar -->
      <div
        role="button"
        tabindex="0"
        :aria-label="$t('profile.uploadPicture') + '. ' + $t('profile.dragDropHint')"
        class="relative mx-auto mb-4 w-24 h-24 md:w-28 md:h-28 rounded-full cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800"
        :class="{ 'ring-4 ring-blue-500 ring-opacity-50 scale-105': isDragging, 'pointer-events-none opacity-75': isLoading }"
        data-testid="profile-avatar-upload"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        @click="triggerFileUpload"
        @keydown.enter="triggerFileUpload"
        @keydown.space.prevent="triggerFileUpload"
      >
        <div
          class="h-full w-full rounded-full bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900 dark:to-rose-800 flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105"
          :class="{ 'opacity-75': isDragging }"
        >
          <img
            v-if="pictureUrl"
            :src="pictureUrl"
            :alt="$t('profile.profilePicture')"
            class="h-full w-full object-cover"
            data-testid="profile-avatar-image"
          />
          <span
            v-else
            class="text-3xl md:text-4xl font-bold text-rose-600 dark:text-rose-300"
            data-testid="profile-avatar-initials"
          >
            {{ initials }}
          </span>
        </div>

        <!-- Camera Button (absolute positioned) -->
        <UiButton
          type="button"
          size="icon"
          :aria-label="$t('profile.changePicture')"
          :disabled="isLoading"
          class="absolute -bottom-1 -right-1 w-8 h-8 min-w-8 rounded-full bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-600 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          data-testid="profile-avatar-camera-btn"
          @click.stop="triggerFileUpload"
          @keydown.enter.stop="triggerFileUpload"
          @keydown.space.prevent.stop="triggerFileUpload"
        >
          <commonIcon
            name="lucide:camera"
            class="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400"
            aria-hidden="true"
          />
        </UiButton>

        <!-- Drop zone overlay -->
        <Transition
          enter-active-class="transition-opacity duration-200"
          leave-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isDragging"
            class="absolute inset-0 flex items-center justify-center bg-rose-600/90 rounded-full pointer-events-none"
          >
            <commonIcon
              name="lucide:upload"
              class="w-8 h-8 text-white"
              aria-hidden="true"
            />
          </div>
        </Transition>
      </div>

      <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-3 mt-4">
        {{ $t('profile.dragDropHint') }}
      </p>

      <div
        v-if="pictureUrl"
        class="flex justify-center"
      >
        <UiButton
          type="button"
          :disabled="isLoading"
          data-testid="profile-avatar-remove-btn"
          @click="emit('remove')"
        >
          {{ $t('profile.removePicture') }}
        </UiButton>
      </div>

      <UiInput
        ref="fileInputRef"
        type="file"
        accept="image/*"
        data-testid="profile-avatar-file-input"
        @change="handleFileUpload"
      />
    </div>
  </div>
</template>
