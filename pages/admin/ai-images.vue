<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useHead({
  title: 'AI Image Generator - Admin',
})

const productId = ref<number>()
const selectedProductSku = ref('')
const products = ref<any[]>([])
const isLoadingProducts = ref(false)

// Fetch products for selection
async function loadProducts() {
  isLoadingProducts.value = true
  try {
    const data = await $fetch('/api/admin/products')
    if (data && Array.isArray(data.products)) {
      products.value = data.products
    }
  } catch (error) {
    console.error('Failed to load products:', error)
  } finally {
    isLoadingProducts.value = false
  }
}

function onProductSelect(event: Event) {
  const target = event.target as HTMLSelectElement
  const selectedProduct = products.value.find(p => p.sku === target.value)
  if (selectedProduct) {
    productId.value = selectedProduct.id
  } else {
    productId.value = undefined
  }
}

function handleImageGenerated(imageUrl: string) {
  console.log('Image generated:', imageUrl)
  // Optionally refresh product data
  if (productId.value) {
    loadProducts()
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">AI Image Generator</h1>
      <p class="text-muted-foreground">
        Generate and enhance product images using FREE AI tools
      </p>
    </div>

    <!-- Product Selection (Optional) -->
    <div class="mb-8 p-6 border rounded-lg bg-card">
      <h2 class="text-lg font-semibold mb-4">Link to Product (Optional)</h2>
      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium mb-2 block">Select Product</label>
          <select
            v-model="selectedProductSku"
            @change="onProductSelect"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            :disabled="isLoadingProducts"
          >
            <option value="">None (standalone image processing)</option>
            <option
              v-for="product in products"
              :key="product.id"
              :value="product.sku"
            >
              {{ product.sku }} - {{ product.name_translations?.es || product.name_translations?.en || 'Unnamed' }}
            </option>
          </select>
          <p class="text-xs text-muted-foreground mt-1">
            Select a product to automatically add the generated image to its gallery
          </p>
        </div>
      </div>
    </div>

    <!-- AI Image Generator Component -->
    <div class="p-6 border rounded-lg bg-card">
      <AdminUtilsAIImageGenerator
        :product-id="productId"
        @image-generated="handleImageGenerated"
      />
    </div>

    <!-- Setup Instructions -->
    <div class="mt-8 p-6 border rounded-lg bg-amber-50 border-amber-200">
      <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
        <span>⚙️</span>
        <span>Setup Required</span>
      </h2>
      <div class="space-y-3 text-sm">
        <p class="font-medium">To use AI image generation, you need to:</p>
        <ol class="list-decimal list-inside space-y-2 ml-2">
          <li>
            Get a FREE Hugging Face API token:
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary hover:underline ml-1"
            >
              Create Token →
            </a>
          </li>
          <li>
            Add the token to your Supabase project:
            <ul class="list-disc list-inside ml-4 mt-1 space-y-1 text-muted-foreground">
              <li>Go to Supabase Dashboard → Project Settings → Edge Functions</li>
              <li>Add secret: <code class="px-1 py-0.5 bg-gray-200 rounded text-xs">HUGGINGFACE_API_TOKEN</code></li>
            </ul>
          </li>
          <li>
            Deploy the Edge Function:
            <code class="block mt-1 px-2 py-1 bg-gray-200 rounded text-xs font-mono">
              supabase functions deploy ai-image-processor
            </code>
          </li>
          <li>
            Run the database migration:
            <code class="block mt-1 px-2 py-1 bg-gray-200 rounded text-xs font-mono">
              psql -f supabase/migrations/20251123_ai_image_generation.sql
            </code>
          </li>
        </ol>
        <p class="text-xs text-muted-foreground mt-3">
          📚 See the full documentation in the AI_IMAGE_GENERATION_SETUP.md file
        </p>
      </div>
    </div>
  </div>
</template>
