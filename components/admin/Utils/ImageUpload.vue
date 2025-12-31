<template>
  <div class="space-y-4">
    <!-- Upload Area -->
    <div
      class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 md:p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors touch-manipulation"
      :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900/20': isDragging }"
      @drop="handleDrop"
      @dragover.prevent
      @dragenter.prevent
    >
      <div class="space-y-2 md:space-y-2">
        <svg
          class="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <div class="text-sm md:text-sm text-gray-600 dark:text-gray-400">
          <label
            for="file-upload"
            class="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-2 py-1"
          >
            <span class="text-base md:text-sm">Upload images</span>
            <input
              id="file-upload"
              ref="fileInput"
              type="file"
              multiple
              :accept="accept"
              class="sr-only"
              @change="handleFileSelect"
            />
          </label>
          <span class="pl-1 hidden md:inline">or drag and drop</span>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          PNG, JPG, GIF up to {{ formatFileSize(maxFileSize) }} each (max {{ maxFiles }} files)
        </p>
      </div>
    </div>

    <!-- Upload Progress -->
    <div
      v-if="uploading"
      class="space-y-2"
    >
      <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Uploading {{ uploadQueue.length }} {{ uploadQueue.length === 1 ? 'image' : 'images' }}...</span>
        <span>{{ Math.round(uploadProgress) }}%</span>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${uploadProgress}%` }"
        ></div>
      </div>
    </div>

    <!-- Image Preview Grid -->
    <div
      v-if="images.length > 0"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
    >
      <div
        v-for="(image, index) in images"
        :key="image.id || index"
        class="relative group bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square touch-manipulation"
      >
        <!-- Image -->
        <img
          :src="image.url || image.preview"
          :alt="image.altText || `Product image ${index + 1}`"
          class="w-full h-full object-cover"
        />

        <!-- Primary Badge -->
        <div
          v-if="image.isPrimary"
          class="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded z-10"
        >
          Primary
        </div>

        <!-- Actions Overlay - Always visible on mobile, hover on desktop -->
        <div class="absolute inset-0 bg-black bg-opacity-50 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 md:space-x-2">
          <!-- Set as Primary -->
          <Button
            v-if="!image.isPrimary"
            size="icon"
            class="p-3 md:p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
            title="Set as primary image"
            @click="setPrimary(index)"
          >
            <svg
              class="h-5 w-5 md:h-4 md:w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </Button>

          <!-- Edit Alt Text -->
          <Button
            size="icon"
            class="p-3 md:p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
            title="Edit alt text"
            @click="editAltText(index)"
          >
            <svg
              class="h-5 w-5 md:h-4 md:w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Button>

          <!-- Remove -->
          <Button
            size="icon"
            class="p-3 md:p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors touch-manipulation"
            title="Remove image"
            @click="removeImage(index)"
          >
            <svg
              class="h-5 w-5 md:h-4 md:w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>
        </div>

        <!-- Upload Progress for Individual Image -->
        <div
          v-if="image.uploading"
          class="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center"
        >
          <div class="text-white text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <div class="text-sm">
              {{ Math.round(image.progress || 0) }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alt Text Edit Modal -->
    <div
      v-if="altTextModal.show"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
    >
      <div class="relative mx-auto p-5 md:p-5 border max-w-md w-full shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Edit Alt Text
          </h3>
          <div class="mb-4">
            <img
              :src="altTextModal.image?.url || altTextModal.image?.preview"
              alt="Preview"
              class="w-full h-32 object-cover rounded-md mb-3"
            />
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alt Text (for accessibility)
            </label>
            <input
              v-model="altTextModal.altText"
              type="text"
              placeholder="Describe this image..."
              class="w-full px-4 py-3 md:px-3 md:py-2 text-base md:text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div class="flex justify-end space-x-3">
            <Button
              variant="outline"
              class="px-4 py-2"
              @click="closeAltTextModal"
            >
              Cancel
            </Button>
            <Button
              class="px-4 py-2"
              @click="saveAltText"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

interface ImageFile {
  id?: string
  url?: string
  preview?: string
  file?: File
  altText?: string
  isPrimary?: boolean
  uploading?: boolean
  progress?: number
}

interface Props {
  modelValue: ImageFile[]
  maxFiles?: number
  maxFileSize?: number
  accept?: string
}

interface Emits {
  (e: 'update:modelValue', value: ImageFile[]): void
  (e: 'error', message: string): void
}

const props = withDefaults(defineProps<Props>(), {
  maxFiles: 5,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  accept: 'image/*',
})

const emit = defineEmits<Emits>()

// Local state
const images = ref<ImageFile[]>([...props.modelValue])
const isDragging = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadQueue = ref<File[]>([])
const fileInput = ref<HTMLInputElement>()

// Alt text modal
const altTextModal = ref({
  show: false,
  index: -1,
  image: null as ImageFile | null,
  altText: '',
})

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  images.value = [...newValue]
}, { deep: true })

// Emit changes
watch(images, (newImages) => {
  emit('update:modelValue', newImages)
}, { deep: true })

// Utility functions
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const validateFile = (file: File): string | null => {
  if (!file.type.startsWith('image/')) {
    return 'File must be an image'
  }
  if (file.size > props.maxFileSize) {
    return `File size must be less than ${formatFileSize(props.maxFileSize)}`
  }
  return null
}

const createPreview = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target?.result as string)
    reader.readAsDataURL(file)
  })
}

// File handling
const processFiles = async (files: FileList | File[]) => {
  const fileArray = Array.from(files)

  // Check total file count
  if (images.value.length + fileArray.length > props.maxFiles) {
    emit('error', `Maximum ${props.maxFiles} images allowed`)
    return
  }

  // Validate and process each file
  const validFiles: File[] = []
  for (const file of fileArray) {
    const error = validateFile(file)
    if (error) {
      emit('error', `${file.name}: ${error}`)
      continue
    }
    validFiles.push(file)
  }

  if (validFiles.length === 0) return

  // Create preview images
  const newImages: ImageFile[] = []
  for (const file of validFiles) {
    const preview = await createPreview(file)
    newImages.push({
      id: `temp-${Date.now()}-${Math.random()}`,
      file,
      preview,
      altText: '',
      isPrimary: images.value.length === 0 && newImages.length === 0, // First image is primary
      uploading: true,
      progress: 0,
    })
  }

  images.value.push(...newImages)

  // Start upload process
  await uploadImages(newImages)
}

const uploadImages = async (imagesToUpload: ImageFile[]) => {
  uploading.value = true
  uploadQueue.value = imagesToUpload.map(img => img.file!).filter(Boolean)

  try {
    for (let i = 0; i < imagesToUpload.length; i++) {
      const imageData = imagesToUpload[i]
      if (!imageData?.file) continue

      // Simulate upload progress
      const formData = new FormData()
      formData.append('file', imageData.file)
      formData.append('type', 'product')

      // Update progress
      for (let progress = 0; progress <= 100; progress += 10) {
        if (imageData) {
          imageData.progress = progress
          uploadProgress.value = ((i * 100) + progress) / imagesToUpload.length
        }
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      try {
        // Upload to server
        const response = await $fetch<{ success: boolean, data: { url: string } }>('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.success && imageData) {
          // Update image with server URL
          imageData.url = response.data.url
          imageData.uploading = false
          delete imageData.file
          delete imageData.preview
          delete imageData.progress
        }
        else {
          throw new Error('Upload failed')
        }
      }
      catch (error: unknown) {
        console.error('Upload error:', error)
        // Remove failed upload
        if (imageData?.id) {
          const index = images.value.findIndex(img => img.id === imageData.id)
          if (index > -1) {
            images.value.splice(index, 1)
          }
        }
        emit('error', `Failed to upload ${imageData?.file?.name || 'image'}`)
      }
    }
  }
  finally {
    uploading.value = false
    uploadProgress.value = 0
    uploadQueue.value = []
  }
}

// Event handlers
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    processFiles(target.files)
    target.value = '' // Reset input
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  if (event.dataTransfer?.files) {
    processFiles(event.dataTransfer.files)
  }
}

const setPrimary = (index: number) => {
  // Remove primary from all images
  images.value.forEach(img => img.isPrimary = false)
  // Set new primary
  const targetImage = images.value[index]
  if (targetImage) {
    targetImage.isPrimary = true
  }
}

const removeImage = (index: number) => {
  const removedImage = images.value[index]
  images.value.splice(index, 1)

  // If removed image was primary, set first image as primary
  if (removedImage?.isPrimary && images.value.length > 0) {
    const firstImage = images.value[0]
    if (firstImage) {
      firstImage.isPrimary = true
    }
  }
}

const editAltText = (index: number) => {
  const targetImage = images.value[index]
  if (targetImage) {
    altTextModal.value = {
      show: true,
      index,
      image: targetImage,
      altText: targetImage.altText || '',
    }
  }
}

const closeAltTextModal = () => {
  altTextModal.value = {
    show: false,
    index: -1,
    image: null,
    altText: '',
  }
}

const saveAltText = () => {
  if (altTextModal.value.index >= 0) {
    const targetImage = images.value[altTextModal.value.index]
    if (targetImage) {
      targetImage.altText = altTextModal.value.altText
    }
  }
  closeAltTextModal()
}

// Drag and drop handlers
const _handleDragEnter = () => {
  isDragging.value = true
}

const _handleDragLeave = (event: DragEvent) => {
  if (!event.relatedTarget || !(event.currentTarget as Element).contains(event.relatedTarget as Node)) {
    isDragging.value = false
  }
}
</script>
