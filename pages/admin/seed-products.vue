<template>
  <div class="max-w-4xl mx-auto py-12 px-4">
    <Card>
      <CardHeader>
        <CardTitle>Seed Products for MVP</CardTitle>
        <CardDescription>
          Create products with proper images for the Moldova Direct store
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-if="!loading && !result" class="space-y-6">
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-sm font-medium">Preset</label>
              <select
                v-model="preset"
                class="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              >
                <option value="mvp">MVP (120 products)</option>
                <option value="demo">Demo (100 products)</option>
                <option value="development">Development (50 products)</option>
                <option value="minimal">Minimal (20 products)</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Clear Existing</label>
              <select
                v-model="clearExisting"
                class="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              >
                <option :value="false">Keep existing products</option>
                <option :value="true">Clear all products first</option>
              </select>
            </div>
          </div>

          <div class="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
            <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">What will be created:</h3>
            <ul class="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>{{ productCount }} realistic Moldovan products</li>
              <li>5 categories (Wine & Spirits, Food, Handicrafts, Pottery, Textiles)</li>
              <li>All products include high-quality images from Unsplash</li>
              <li>Varied prices, descriptions, and stock levels</li>
              <li>20% products on sale with compare prices</li>
              <li>10% featured products</li>
              <li>Products include attributes (origin, volume, alcohol content for wines)</li>
            </ul>
          </div>

          <div class="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
            <div class="flex items-start gap-2">
              <commonIcon name="lucide:alert-triangle" class="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div class="text-sm text-amber-800 dark:text-amber-200">
                <p class="font-semibold mb-1">Warning</p>
                <p v-if="clearExisting">This will delete all existing products and create new ones.</p>
                <p v-else>This will add {{ productCount }} new products to your existing catalog.</p>
              </div>
            </div>
          </div>

          <Button @click="seedProducts" class="w-full" size="lg" :disabled="loading">
            <commonIcon name="lucide:package-plus" class="h-5 w-5 mr-2" />
            Create {{ productCount }} Products
          </Button>
        </div>

        <div v-if="loading" class="text-center py-8">
          <commonIcon name="lucide:loader-2" class="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p class="text-sm text-muted-foreground mb-2">Creating products...</p>
          <p class="text-xs text-muted-foreground">This may take a minute...</p>
        </div>

        <div v-if="result && !error" class="space-y-4">
          <div class="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
            <div class="flex items-center gap-2 mb-2">
              <commonIcon name="lucide:check-circle" class="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 class="font-semibold text-green-900 dark:text-green-100">Success!</h3>
            </div>
            <p class="text-sm text-green-800 dark:text-green-200">
              {{ result.message }}
            </p>
          </div>

          <div v-if="result.results && result.results.length > 0" class="space-y-2">
            <h4 class="text-sm font-medium">Summary:</h4>
            <div class="space-y-1">
              <div
                v-for="(step, index) in result.results"
                :key="index"
                class="text-sm bg-muted p-3 rounded flex items-center justify-between"
              >
                <span>{{ step.step }}</span>
                <div class="flex items-center gap-3">
                  <span class="font-semibold text-primary">{{ step.count }} items</span>
                  <span class="text-xs text-muted-foreground">{{ step.duration }}ms</span>
                </div>
              </div>
            </div>
            <div class="text-xs text-muted-foreground text-right pt-2">
              Total time: {{ result.totalDuration }}ms
            </div>
          </div>

          <div class="flex gap-2">
            <Button @click="goToProducts" class="flex-1">
              <commonIcon name="lucide:arrow-right" class="h-4 w-4 mr-2" />
              View Products
            </Button>
            <Button @click="goToLanding" variant="outline" class="flex-1">
              <commonIcon name="lucide:home" class="h-4 w-4 mr-2" />
              View Landing Page
            </Button>
          </div>

          <Button @click="reset" variant="outline" class="w-full">
            <commonIcon name="lucide:refresh-cw" class="h-4 w-4 mr-2" />
            Seed More Products
          </Button>
        </div>

        <div v-if="error" class="space-y-4">
          <div class="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
            <div class="flex items-center gap-2 mb-2">
              <commonIcon name="lucide:alert-circle" class="h-5 w-5 text-red-600 dark:text-red-400" />
              <h3 class="font-semibold text-red-900 dark:text-red-100">Error</h3>
            </div>
            <p class="text-sm text-red-800 dark:text-red-200">
              {{ error }}
            </p>
          </div>

          <Button @click="reset" variant="outline" class="w-full">
            <commonIcon name="lucide:refresh-cw" class="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const preset = ref('mvp')
const clearExisting = ref(false)
const loading = ref(false)
const result = ref<any>(null)
const error = ref<string | null>(null)

const productCount = computed(() => {
  const counts: Record<string, number> = {
    mvp: 120,
    demo: 100,
    development: 50,
    minimal: 20
  }
  return counts[preset.value] || 120
})

const seedProducts = async () => {
  loading.value = true
  error.value = null
  result.value = null

  try {
    const response = await $fetch('/api/admin/seed-data', {
      method: 'POST',
      body: {
        preset: preset.value === 'mvp' ? 'demo' : preset.value,
        products: productCount.value,
        categories: true,
        clearExisting: clearExisting.value,
        users: 0, // Don't create users
        orders: 0 // Don't create orders
      }
    })

    result.value = response
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to create products'
    console.error('Seed error:', err)
  } finally {
    loading.value = false
  }
}

const goToProducts = () => {
  navigateTo('/admin/products')
}

const goToLanding = () => {
  navigateTo('/')
}

const reset = () => {
  result.value = null
  error.value = null
}

useHead({
  title: 'Seed Products - Admin - Moldova Direct'
})
</script>
