<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
          <CardTitle>Current Database State</CardTitle>
          <CardDescription>Real-time overview of your database</CardDescription>
        </div>
        <Button @click="$emit('refresh')" variant="outline" size="sm" :disabled="loadingStats">
          <commonIcon
            :name="loadingStats ? 'lucide:loader-2' : 'lucide:refresh-cw'"
            :class="loadingStats ? 'animate-spin' : ''"
            class="h-4 w-4 mr-2"
          />
          Refresh
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="space-y-1 p-4 rounded-lg border bg-card">
          <div class="text-2xl font-bold">{{ stats?.users || 0 }}</div>
          <div class="text-sm text-muted-foreground">Total Users</div>
          <div class="text-xs text-orange-600">{{ stats?.testUsers || 0 }} test users</div>
        </div>
        <div class="space-y-1 p-4 rounded-lg border bg-card">
          <div class="text-2xl font-bold">{{ stats?.products || 0 }}</div>
          <div class="text-sm text-muted-foreground">Products</div>
          <div class="text-xs text-orange-600" v-if="stats?.lowStockProducts">
            {{ stats.lowStockProducts }} low stock
          </div>
        </div>
        <div class="space-y-1 p-4 rounded-lg border bg-card">
          <div class="text-2xl font-bold">{{ stats?.orders || 0 }}</div>
          <div class="text-sm text-muted-foreground">Total Orders</div>
          <div class="text-xs text-green-600" v-if="stats?.recentOrders">
            {{ stats.recentOrders }} last 7 days
          </div>
        </div>
        <div class="space-y-1 p-4 rounded-lg border bg-card">
          <div class="text-2xl font-bold">€{{ stats?.totalRevenue?.toFixed(2) || '0.00' }}</div>
          <div class="text-sm text-muted-foreground">Total Revenue</div>
          <div class="text-xs text-muted-foreground">{{ stats?.categories || 0 }} categories</div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { DatabaseStats } from '~/types/admin-testing'

defineProps<{
  stats: DatabaseStats | null
  loadingStats: boolean
}>()

defineEmits<{
  refresh: []
}>()
</script>
