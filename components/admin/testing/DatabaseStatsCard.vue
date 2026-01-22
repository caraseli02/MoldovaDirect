<template>
  <UiCard>
    <UiCardHeader>
      <div class="flex items-center justify-between">
        <div>
          <UiCardTitle>Current Database State</UiCardTitle>
          <UiCardDescription>Real-time overview of your database</UiCardDescription>
        </div>
        <UiButton>
          variant="outline"
          size="sm"
          :disabled="loadingStats"
          @click="$emit('refresh')"
          >
          <commonIcon
            :name="loadingStats ? 'lucide:loader-2' : 'lucide:refresh-cw'"
            :class="loadingStats ? 'animate-spin' : ''"
            class="h-4 w-4 mr-2"
          />
          Refresh
        </UiButton>
      </div>
    </UiCardHeader>
    <UiCardContent>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="space-y-1 p-4 rounded-lg border bg-card">
          <div class="text-2xl font-bold">
            {{ stats?.users || 0 }}
          </div>
          <div class="text-sm text-muted-foreground">
            Total Users
          </div>
          <div class="text-xs text-orange-600">
            {{ stats?.testUsers || 0 }} test users
          </div>
        </div>
        <div class="space-y-1 p-4 rounded-lg border bg-card">
          <div class="text-2xl font-bold">
            {{ stats?.products || 0 }}
          </div>
          <div class="text-sm text-muted-foreground">
            Products
          </div>
          <div
            v-if="stats?.lowStockProducts"
            class="text-xs text-orange-600"
          >
            {{ stats.lowStockProducts }} low stock
          </div>
        </div>
        <div class="space-y-1 p-4 rounded-lg border bg-card">
          <div class="text-2xl font-bold">
            {{ stats?.orders || 0 }}
          </div>
          <div class="text-sm text-muted-foreground">
            Total Orders
          </div>
          <div
            v-if="stats?.recentOrders"
            class="text-xs text-green-600"
          >
            {{ stats.recentOrders }} last 7 days
          </div>
        </div>
        <div class="space-y-1 p-4 rounded-lg border bg-card">
          <div class="text-2xl font-bold">
            €{{ stats?.totalRevenue?.toFixed(2) || '0.00' }}
          </div>
          <div class="text-sm text-muted-foreground">
            Total Revenue
          </div>
          <div class="text-xs text-muted-foreground">
            {{ stats?.categories || 0 }} categories
          </div>
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { DatabaseStats } from '~/types/admin-testing'

defineProps<{
  stats: DatabaseStats | null
  loadingStats: boolean
}>()

defineEmits<{
  refresh: []
}>()
</script>
