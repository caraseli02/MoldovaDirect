<template>
  <div class="space-y-6 pb-12">
    <!-- Page Header -->
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Testing Dashboard</h1>
      <p class="text-muted-foreground mt-2">
        Generate test data, simulate users, and test admin functionality
      </p>
    </div>

    <!-- Warning Banner -->
    <Alert variant="destructive" v-if="showWarning">
      <commonIcon name="lucide:alert-triangle" class="h-4 w-4" />
      <AlertTitle>Testing Mode</AlertTitle>
      <AlertDescription>
        This page allows you to modify database content. Use with caution.
        All test data will be marked appropriately.
      </AlertDescription>
    </Alert>

    <!-- Quick Actions -->
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common testing scenarios with one click</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            @click="runQuickAction('minimal')"
            :disabled="loading"
            variant="outline"
            class="h-auto py-4 flex flex-col items-start gap-2"
          >
            <commonIcon name="lucide:zap" class="h-5 w-5" />
            <div class="text-left">
              <div class="font-semibold">Quick Start</div>
              <div class="text-xs text-muted-foreground">5 users, 10 products, 5 orders</div>
            </div>
          </Button>

          <Button
            @click="runQuickAction('development')"
            :disabled="loading"
            variant="outline"
            class="h-auto py-4 flex flex-col items-start gap-2"
          >
            <commonIcon name="lucide:code" class="h-5 w-5" />
            <div class="text-left">
              <div class="font-semibold">Development</div>
              <div class="text-xs text-muted-foreground">20 users, 50 products, 100 orders</div>
            </div>
          </Button>

          <Button
            @click="runQuickAction('demo')"
            :disabled="loading"
            variant="outline"
            class="h-auto py-4 flex flex-col items-start gap-2"
          >
            <commonIcon name="lucide:presentation" class="h-5 w-5" />
            <div class="text-left">
              <div class="font-semibold">Demo Store</div>
              <div class="text-xs text-muted-foreground">50 users, 100 products, 300 orders</div>
            </div>
          </Button>

          <Button
            @click="runQuickAction('low-stock')"
            :disabled="loading"
            variant="outline"
            class="h-auto py-4 flex flex-col items-start gap-2"
          >
            <commonIcon name="lucide:package-x" class="h-5 w-5 text-orange-500" />
            <div class="text-left">
              <div class="font-semibold">Low Stock Alert</div>
              <div class="text-xs text-muted-foreground">Products with low inventory</div>
            </div>
          </Button>

          <Button
            @click="runQuickAction('holiday-rush')"
            :disabled="loading"
            variant="outline"
            class="h-auto py-4 flex flex-col items-start gap-2"
          >
            <commonIcon name="lucide:trending-up" class="h-5 w-5 text-green-500" />
            <div class="text-left">
              <div class="font-semibold">Holiday Rush</div>
              <div class="text-xs text-muted-foreground">High volume orders scenario</div>
            </div>
          </Button>

          <Button
            @click="runQuickAction('new-store')"
            :disabled="loading"
            variant="outline"
            class="h-auto py-4 flex flex-col items-start gap-2"
          >
            <commonIcon name="lucide:store" class="h-5 w-5 text-blue-500" />
            <div class="text-left">
              <div class="font-semibold">New Store</div>
              <div class="text-xs text-muted-foreground">Many products, few orders</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- User Simulation -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <commonIcon name="lucide:users" class="h-5 w-5" />
            User Simulation
          </CardTitle>
          <CardDescription>Create test users with realistic profiles</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Number of Users</label>
            <input
              v-model.number="userCount"
              type="number"
              min="1"
              max="100"
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">User Role</label>
            <select v-model="userRole" class="w-full px-3 py-2 border rounded-md">
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              id="with-addresses"
              v-model="withAddresses"
              class="rounded"
            />
            <label for="with-addresses" class="text-sm">Include addresses</label>
          </div>

          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              id="with-orders"
              v-model="withOrders"
              class="rounded"
            />
            <label for="with-orders" class="text-sm">Create order history</label>
          </div>

          <Button @click="createUsers" :disabled="loading" class="w-full">
            <commonIcon v-if="!loading" name="lucide:user-plus" class="h-4 w-4 mr-2" />
            <commonIcon v-else name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
            Create Users
          </Button>
        </CardContent>
      </Card>

      <!-- Data Cleanup -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <commonIcon name="lucide:trash-2" class="h-5 w-5" />
            Data Cleanup
          </CardTitle>
          <CardDescription>Remove test data from the database</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <Button
            @click="cleanup('clear-orders')"
            :disabled="loading"
            variant="outline"
            class="w-full justify-start"
          >
            <commonIcon name="lucide:shopping-cart" class="h-4 w-4 mr-2" />
            Clear All Orders
          </Button>

          <Button
            @click="cleanup('clear-products')"
            :disabled="loading"
            variant="outline"
            class="w-full justify-start"
          >
            <commonIcon name="lucide:package" class="h-4 w-4 mr-2" />
            Clear All Products
          </Button>

          <Button
            @click="cleanup('clear-test-users')"
            :disabled="loading"
            variant="outline"
            class="w-full justify-start"
          >
            <commonIcon name="lucide:users-2" class="h-4 w-4 mr-2" />
            Clear Test Users
          </Button>

          <Button
            @click="cleanup('clear-old-carts')"
            :disabled="loading"
            variant="outline"
            class="w-full justify-start"
          >
            <commonIcon name="lucide:shopping-basket" class="h-4 w-4 mr-2" />
            Clear Old Carts (7+ days)
          </Button>

          <div class="pt-2 border-t">
            <Button
              @click="cleanup('reset-database')"
              :disabled="loading"
              variant="destructive"
              class="w-full"
            >
              <commonIcon name="lucide:alert-triangle" class="h-4 w-4 mr-2" />
              Reset Database
            </Button>
            <p class="text-xs text-muted-foreground mt-2">
              Removes all data, keeps structure
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Advanced Options -->
    <Card>
      <CardHeader>
        <CardTitle>Advanced Test Data Generation</CardTitle>
        <CardDescription>Custom data generation with full control</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Products</label>
            <input
              v-model.number="customData.products"
              type="number"
              min="0"
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Users</label>
            <input
              v-model.number="customData.users"
              type="number"
              min="0"
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Orders</label>
            <input
              v-model.number="customData.orders"
              type="number"
              min="0"
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div class="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            id="clear-existing"
            v-model="customData.clearExisting"
            class="rounded"
          />
          <label for="clear-existing" class="text-sm">Clear existing data first</label>
        </div>

        <Button @click="generateCustomData" :disabled="loading" class="w-full">
          <commonIcon v-if="!loading" name="lucide:play" class="h-4 w-4 mr-2" />
          <commonIcon v-else name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
          Generate Custom Data
        </Button>
      </CardContent>
    </Card>

    <!-- Results Display -->
    <Card v-if="result">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <commonIcon
            :name="result.success ? 'lucide:check-circle' : 'lucide:alert-circle'"
            :class="result.success ? 'text-green-500' : 'text-red-500'"
            class="h-5 w-5"
          />
          {{ result.success ? 'Success' : 'Error' }}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <p class="text-sm">{{ result.message }}</p>

          <!-- Summary -->
          <div v-if="result.summary" class="bg-muted p-4 rounded-lg space-y-2">
            <h4 class="font-semibold text-sm">Summary</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div v-for="(value, key) in result.summary" :key="key">
                <div class="text-muted-foreground">{{ formatKey(key) }}</div>
                <div class="font-semibold">{{ value }}</div>
              </div>
            </div>
          </div>

          <!-- Created Users -->
          <div v-if="result.users && result.users.length > 0" class="space-y-2">
            <h4 class="font-semibold text-sm">Created Users</h4>
            <div class="max-h-48 overflow-y-auto space-y-1">
              <div
                v-for="user in result.users"
                :key="user.id"
                class="text-xs bg-muted p-2 rounded flex items-center justify-between"
              >
                <span>{{ user.name }} ({{ user.email }})</span>
                <span class="text-muted-foreground">{{ user.role }}</span>
              </div>
            </div>
          </div>

          <!-- Deleted Counts -->
          <div v-if="result.results?.deletedCounts" class="space-y-2">
            <h4 class="font-semibold text-sm">Deleted Items</h4>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div
                v-for="(count, table) in result.results.deletedCounts"
                :key="table"
                class="bg-muted p-2 rounded"
              >
                <div class="text-muted-foreground">{{ formatKey(table) }}</div>
                <div class="font-semibold">{{ count }}</div>
              </div>
            </div>
          </div>

          <!-- Errors -->
          <div v-if="result.errors && result.errors.length > 0" class="space-y-2">
            <h4 class="font-semibold text-sm text-red-500">Errors</h4>
            <ul class="text-xs space-y-1">
              <li v-for="(error, index) in result.errors" :key="index" class="text-red-600">
                {{ error }}
              </li>
            </ul>
          </div>

          <Button @click="result = null" variant="outline" class="w-full">
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const loading = ref(false)
const result = ref<any>(null)
const showWarning = ref(true)

// User simulation options
const userCount = ref(10)
const userRole = ref('customer')
const withAddresses = ref(true)
const withOrders = ref(false)

// Custom data options
const customData = ref({
  products: 20,
  users: 10,
  orders: 30,
  clearExisting: false
})

// Quick action presets
const runQuickAction = async (preset: string) => {
  loading.value = true
  result.value = null

  try {
    const response = await $fetch('/api/admin/seed-data', {
      method: 'POST',
      body: { preset }
    })

    result.value = response
  } catch (err: any) {
    result.value = {
      success: false,
      message: err.message || 'Failed to run quick action',
      error: err
    }
  } finally {
    loading.value = false
  }
}

// Create users
const createUsers = async () => {
  loading.value = true
  result.value = null

  try {
    const response = await $fetch('/api/admin/seed-users', {
      method: 'POST',
      body: {
        count: userCount.value,
        roles: [userRole.value],
        withAddresses: withAddresses.value,
        withOrders: withOrders.value
      }
    })

    result.value = response
  } catch (err: any) {
    result.value = {
      success: false,
      message: err.message || 'Failed to create users',
      error: err
    }
  } finally {
    loading.value = false
  }
}

// Generate custom data
const generateCustomData = async () => {
  loading.value = true
  result.value = null

  try {
    const response = await $fetch('/api/admin/seed-data', {
      method: 'POST',
      body: {
        preset: 'minimal',
        ...customData.value
      }
    })

    result.value = response
  } catch (err: any) {
    result.value = {
      success: false,
      message: err.message || 'Failed to generate data',
      error: err
    }
  } finally {
    loading.value = false
  }
}

// Cleanup data
const cleanup = async (action: string) => {
  if (!confirm(`Are you sure you want to ${action}? This cannot be undone.`)) {
    return
  }

  loading.value = true
  result.value = null

  try {
    const response = await $fetch('/api/admin/cleanup', {
      method: 'POST',
      body: {
        action,
        confirm: true
      }
    })

    result.value = response
  } catch (err: any) {
    result.value = {
      success: false,
      message: err.message || 'Failed to cleanup data',
      error: err
    }
  } finally {
    loading.value = false
  }
}

// Helper to format keys for display
const formatKey = (key: string) => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

useHead({
  title: 'Testing Dashboard - Admin - Moldova Direct'
})
</script>
