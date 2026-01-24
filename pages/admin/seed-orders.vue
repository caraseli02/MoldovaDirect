<template>
  <div class="max-w-2xl mx-auto py-12 px-4">
    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Seed Mock Orders</UiCardTitle>
        <UiCardDescription>
          Create 20 mock orders for testing the admin orders UI
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent class="space-y-4">
        <div
          v-if="!loading && !result"
          class="space-y-4"
        >
          <p class="text-sm text-muted-foreground">
            This will create 20 mock orders with:
          </p>
          <ul class="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Various statuses (pending, processing, shipped, delivered, cancelled)</li>
            <li>1-4 items per order</li>
            <li>Random customer data</li>
            <li>Realistic dates (last 30 days)</li>
            <li>Different payment statuses</li>
          </ul>

          <UiButton
            class="w-full"
            size="lg"
            @click="seedOrders"
          >
            <commonIcon
              name="lucide:database"
              class="h-5 w-5 mr-2"
            />
            Create Mock Orders
          </UiButton>
        </div>

        <div
          v-if="loading"
          class="text-center py-8"
        >
          <commonIcon
            name="lucide:loader-2"
            class="h-12 w-12 animate-spin text-primary mx-auto mb-4"
          />
          <p class="text-sm text-muted-foreground">
            Creating orders...
          </p>
        </div>

        <div
          v-if="result && !error"
          class="space-y-4"
        >
          <div class="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
            <div class="flex items-center gap-2 mb-2">
              <commonIcon
                name="lucide:check-circle"
                class="h-5 w-5 text-green-600 dark:text-green-400"
              />
              <h3 class="font-semibold text-green-900 dark:text-green-100">
                Success!
              </h3>
            </div>
            <p class="text-sm text-green-800 dark:text-green-200">
              {{ result.message }}
            </p>
          </div>

          <div
            v-if="result.orders && result.orders.length > 0"
            class="space-y-2"
          >
            <h4 class="text-sm font-medium">
              Created Orders:
            </h4>
            <div class="max-h-64 overflow-y-auto space-y-1">
              <div
                v-for="order in result.orders"
                :key="order.orderNumber"
                class="text-xs bg-muted p-2 rounded flex items-center justify-between"
              >
                <span class="font-mono">{{ order.orderNumber }}</span>
                <span class="text-muted-foreground">{{ order.itemCount }} items • €{{ order.total }}</span>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <UiButton
              class="flex-1"
              @click="goToOrders"
            >
              <commonIcon
                name="lucide:arrow-right"
                class="h-4 w-4 mr-2"
              />
              View Orders
            </UiButton>
            <UiButton
              variant="outline"
              class="flex-1"
              @click="reset"
            >
              <commonIcon
                name="lucide:refresh-cw"
                class="h-4 w-4 mr-2"
              />
              Create More
            </UiButton>
          </div>
        </div>

        <div
          v-if="error"
          class="space-y-4"
        >
          <div class="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
            <div class="flex items-center gap-2 mb-2">
              <commonIcon
                name="lucide:alert-circle"
                class="h-5 w-5 text-red-600 dark:text-red-400"
              />
              <h3 class="font-semibold text-red-900 dark:text-red-100">
                Error
              </h3>
            </div>
            <p class="text-sm text-red-800 dark:text-red-200">
              {{ error }}
            </p>
          </div>

          <UiButton
            variant="outline"
            class="w-full"
            @click="reset"
          >
            <commonIcon
              name="lucide:refresh-cw"
              class="h-4 w-4 mr-2"
            />
            Try Again
          </UiButton>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

const loading = ref(false)
const result = ref<any>(null)
const error = ref<string | null>(null)

const seedOrders = async () => {
  loading.value = true
  error.value = null
  result.value = null

  try {
    const response = await $fetch('/api/admin/seed-orders', {
      method: 'POST',
    }) as any

    result.value = response
  }
  catch (err: unknown) {
    error.value = getErrorMessage(err) || 'Failed to create orders'
    console.error('Seed error:', getErrorMessage(err))
  }
  finally {
    loading.value = false
  }
}

const goToOrders = () => {
  navigateTo('/admin/orders')
}

const reset = () => {
  result.value = null
  error.value = null
}

useHead({
  title: 'Seed Orders - Admin - Moldova Direct',
})
</script>
