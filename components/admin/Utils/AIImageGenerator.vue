<script setup lang="ts">
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'

interface AIImageGeneratorProps {
  productId?: number
  initialImageUrl?: string
  onImageGenerated?: (imageUrl: string) => void
}

const props = defineProps<AIImageGeneratorProps>()
const emit = defineEmits<{
  imageGenerated: [url: string]
}>()

const imageUrl = ref(props.initialImageUrl || '')
const operation = ref<'background_removal' | 'generation' | 'enhancement' | 'upscale'>('background_removal')
const saveToProduct = ref(!!props.productId)
const isProcessing = ref(false)
const processedImageUrl = ref<string | null>(null)
const processingTime = ref<number | null>(null)
const errorMessage = ref<string | null>(null)

const operations = [
  {
    value: 'background_removal',
    label: 'Remove Background',
    description: 'Remove the background from product images (FREE - Hugging Face)',
    icon: '🎨',
    available: true,
  },
  {
    value: 'generation',
    label: 'Generate Image',
    description: 'Generate new product images from prompts (Coming Soon)',
    icon: '✨',
    available: false,
  },
  {
    value: 'enhancement',
    label: 'Enhance Quality',
    description: 'Improve image quality and resolution (Coming Soon)',
    icon: '📸',
    available: false,
  },
  {
    value: 'upscale',
    label: 'Upscale',
    description: 'Increase image resolution (Coming Soon)',
    icon: '🔍',
    available: false,
  },
]

const selectedOperation = computed(() => {
  return operations.find(op => op.value === operation.value)
})

const canProcess = computed(() => {
  return imageUrl.value && !isProcessing.value && selectedOperation.value?.available
})

async function processImage() {
  if (!canProcess.value) return

  isProcessing.value = true
  processedImageUrl.value = null
  processingTime.value = null
  errorMessage.value = null

  try {
    const response = await $fetch('/api/admin/products/ai-process-image', {
      method: 'POST',
      body: {
        productId: props.productId,
        imageUrl: imageUrl.value,
        operation: operation.value,
        options: {
          saveToProduct: saveToProduct.value,
        },
      },
    })

    if (response.success && response.data) {
      processedImageUrl.value = response.data.url
      processingTime.value = response.data.processingTime

      toast.success('Image processed successfully!', {
        description: `Completed in ${(processingTime.value! / 1000).toFixed(2)}s`,
      })

      // Emit event
      if (props.onImageGenerated) {
        props.onImageGenerated(response.data.url)
      }
      emit('imageGenerated', response.data.url)
    } else {
      throw new Error('Failed to process image')
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to process image'
    toast.error('Image processing failed', {
      description: errorMessage.value,
    })
  } finally {
    isProcessing.value = false
  }
}

function copyImageUrl() {
  if (processedImageUrl.value) {
    navigator.clipboard.writeText(processedImageUrl.value)
    toast.success('Image URL copied to clipboard')
  }
}

function downloadImage() {
  if (processedImageUrl.value) {
    window.open(processedImageUrl.value, '_blank')
  }
}

function reset() {
  processedImageUrl.value = null
  processingTime.value = null
  errorMessage.value = null
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">AI Image Generator</h3>
        <p class="text-sm text-muted-foreground">
          Process product images with FREE AI tools (Hugging Face)
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          FREE Tier
        </span>
      </div>
    </div>

    <!-- Operation Selection -->
    <div class="space-y-3">
      <label class="text-sm font-medium">Select Operation</label>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          v-for="op in operations"
          :key="op.value"
          @click="operation = op.value as typeof operation"
          :disabled="!op.available"
          :class="[
            'relative flex flex-col items-start p-4 border-2 rounded-lg transition-all',
            operation === op.value && op.available
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50',
            !op.available && 'opacity-50 cursor-not-allowed',
          ]"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">{{ op.icon }}</span>
            <span class="font-medium">{{ op.label }}</span>
          </div>
          <p class="text-sm text-muted-foreground text-left">
            {{ op.description }}
          </p>
          <span
            v-if="!op.available"
            class="absolute top-2 right-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded"
          >
            Coming Soon
          </span>
        </button>
      </div>
    </div>

    <!-- Image URL Input -->
    <div class="space-y-2">
      <label class="text-sm font-medium">Image URL</label>
      <input
        v-model="imageUrl"
        type="url"
        placeholder="https://example.com/product-image.jpg"
        class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        :disabled="isProcessing"
      />
      <p class="text-xs text-muted-foreground">
        Enter the URL of the product image you want to process
      </p>
    </div>

    <!-- Options -->
    <div v-if="productId" class="flex items-center gap-2">
      <input
        v-model="saveToProduct"
        type="checkbox"
        id="save-to-product"
        class="h-4 w-4 rounded border-gray-300"
        :disabled="isProcessing"
      />
      <label for="save-to-product" class="text-sm">
        Automatically add to product images
      </label>
    </div>

    <!-- Process Button -->
    <button
      @click="processImage"
      :disabled="!canProcess"
      class="w-full px-4 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      <span v-if="isProcessing" class="flex items-center justify-center gap-2">
        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing...
      </span>
      <span v-else>
        {{ selectedOperation?.label || 'Process Image' }}
      </span>
    </button>

    <!-- Processing Info -->
    <div v-if="isProcessing" class="p-4 bg-blue-50 border border-blue-200 rounded-md">
      <div class="flex items-center gap-2">
        <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm font-medium text-blue-900">
          Processing with {{ selectedOperation?.label }}...
        </span>
      </div>
      <p class="text-xs text-blue-700 mt-1">
        This may take a few seconds depending on image size
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="p-4 bg-red-50 border border-red-200 rounded-md">
      <div class="flex items-start gap-2">
        <span class="text-red-600">⚠️</span>
        <div>
          <p class="text-sm font-medium text-red-900">Processing Error</p>
          <p class="text-xs text-red-700 mt-1">{{ errorMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Result -->
    <div v-if="processedImageUrl" class="space-y-4">
      <div class="p-4 bg-green-50 border border-green-200 rounded-md">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-green-600">✓</span>
          <span class="text-sm font-medium text-green-900">
            Image processed successfully!
          </span>
          <span v-if="processingTime" class="text-xs text-green-700">
            ({{ (processingTime / 1000).toFixed(2) }}s)
          </span>
        </div>
      </div>

      <!-- Preview -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Processed Image</label>
        <div class="relative aspect-square max-w-md mx-auto border rounded-lg overflow-hidden bg-gray-100">
          <img
            :src="processedImageUrl"
            alt="Processed image"
            class="w-full h-full object-contain"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button
          @click="copyImageUrl"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          📋 Copy URL
        </button>
        <button
          @click="downloadImage"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          ⬇️ Download
        </button>
        <button
          @click="reset"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          🔄 Process Another
        </button>
      </div>

      <!-- Image URL -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Generated Image URL</label>
        <div class="flex gap-2">
          <input
            :value="processedImageUrl"
            readonly
            class="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
          />
        </div>
      </div>
    </div>

    <!-- Info Box -->
    <div class="p-4 bg-blue-50 border border-blue-200 rounded-md">
      <h4 class="text-sm font-medium text-blue-900 mb-2">💡 About AI Image Processing</h4>
      <ul class="text-xs text-blue-700 space-y-1">
        <li>✓ <strong>100% FREE:</strong> Using Hugging Face free tier (no credit card required)</li>
        <li>✓ <strong>Background Removal:</strong> Powered by briaai/RMBG-1.4 (state-of-the-art model)</li>
        <li>✓ <strong>Rate Limits:</strong> A few hundred requests per hour on free tier</li>
        <li>✓ <strong>Upgrade:</strong> $9/month Hugging Face PRO for higher limits</li>
        <li>⏳ <strong>Coming Soon:</strong> Image generation, enhancement, and upscaling</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional styles here */
</style>
