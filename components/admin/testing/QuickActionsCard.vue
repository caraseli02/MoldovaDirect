<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle>Quick Actions</UiCardTitle>
      <UiCardDescription>Common testing scenarios with one click</UiCardDescription>
    </UiCardHeader>
    <UiCardContent>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiButton
          :disabled="loading"
          variant="outline"
          class="h-auto py-4 flex flex-col items-start gap-2"
          @click="$emit('run-action', 'minimal')"
        >
          <commonIcon
            name="lucide:zap"
            class="h-5 w-5"
          />
          <div class="text-left">
            <div class="font-semibold">
              Quick Start
            </div>
            <div class="text-xs text-muted-foreground">
              5 users, 10 products, 5 orders
            </div>
          </div>
        </UiButton>

        <UiButton
          :disabled="loading"
          variant="outline"
          class="h-auto py-4 flex flex-col items-start gap-2"
          @click="$emit('run-action', 'development')"
        >
          <commonIcon
            name="lucide:code"
            class="h-5 w-5"
          />
          <div class="text-left">
            <div class="font-semibold">
              Development
            </div>
            <div class="text-xs text-muted-foreground">
              20 users, 50 products, 100 orders
            </div>
          </div>
        </UiButton>

        <UiButton
          :disabled="loading"
          variant="outline"
          class="h-auto py-4 flex flex-col items-start gap-2"
          @click="$emit('run-action', 'demo')"
        >
          <commonIcon
            name="lucide:presentation"
            class="h-5 w-5"
          />
          <div class="text-left">
            <div class="font-semibold">
              Demo Store
            </div>
            <div class="text-xs text-muted-foreground">
              50 users, 100 products, 300 orders
            </div>
          </div>
        </UiButton>

        <UiButton
          :disabled="loading"
          variant="outline"
          class="h-auto py-4 flex flex-col items-start gap-2"
          @click="$emit('run-action', 'low-stock')"
        >
          <commonIcon
            name="lucide:package-x"
            class="h-5 w-5 text-orange-500"
          />
          <div class="text-left">
            <div class="font-semibold">
              Low Stock Alert
            </div>
            <div class="text-xs text-muted-foreground">
              Products with low inventory
            </div>
          </div>
        </UiButton>

        <UiButton
          :disabled="loading"
          variant="outline"
          class="h-auto py-4 flex flex-col items-start gap-2"
          @click="$emit('run-action', 'holiday-rush')"
        >
          <commonIcon
            name="lucide:trending-up"
            class="h-5 w-5 text-green-500"
          />
          <div class="text-left">
            <div class="font-semibold">
              Holiday Rush
            </div>
            <div class="text-xs text-muted-foreground">
              High volume orders scenario
            </div>
          </div>
        </UiButton>

        <UiButton
          :disabled="loading"
          variant="outline"
          class="h-auto py-4 flex flex-col items-start gap-2"
          @click="$emit('run-action', 'new-store')"
        >
          <commonIcon
            name="lucide:store"
            class="h-5 w-5 text-blue-500"
          />
          <div class="text-left">
            <div class="font-semibold">
              New Store
            </div>
            <div class="text-xs text-muted-foreground">
              Many products, few orders
            </div>
          </div>
        </UiButton>
      </div>

      <!-- Quick Delete Actions -->
      <div class="mt-4 pt-4 border-t">
        <h4 class="text-sm font-medium mb-3 text-muted-foreground">
          Quick Delete
        </h4>
        <div class="flex flex-wrap gap-2">
          <UiButton
            variant="outline"
            size="sm"
            :disabled="loading"
            @click="$emit('quick-delete', 'clear-test-users')"
          >
            <commonIcon
              name="lucide:users-2"
              class="h-3 w-3 mr-1"
            />
            Test Users
          </UiButton>
          <UiButton
            variant="outline"
            size="sm"
            :disabled="loading"
            @click="$emit('quick-delete', 'clear-orders')"
          >
            <commonIcon
              name="lucide:shopping-cart"
              class="h-3 w-3 mr-1"
            />
            All Orders
          </UiButton>
          <UiButton
            variant="outline"
            size="sm"
            :disabled="loading"
            @click="$emit('quick-delete', 'clear-products')"
          >
            <commonIcon
              name="lucide:package"
              class="h-3 w-3 mr-1"
            />
            All Products
          </UiButton>
          <UiButton
            variant="outline"
            size="sm"
            :disabled="loading"
            @click="$emit('quick-delete', 'clear-old-carts')"
          >
            <commonIcon
              name="lucide:shopping-basket"
              class="h-3 w-3 mr-1"
            />
            Old Carts
          </UiButton>
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

defineProps<{
  loading: boolean
}>()

defineEmits<{
  'run-action': [preset: string]
  'quick-delete': [action: string]
}>()
</script>
