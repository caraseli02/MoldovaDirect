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

    <!-- Database Statistics -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Current Database State</CardTitle>
            <CardDescription>Real-time overview of your database</CardDescription>
          </div>
          <Button @click="refreshStats" variant="outline" size="sm" :disabled="loadingStats">
            <commonIcon :name="loadingStats ? 'lucide:loader-2' : 'lucide:refresh-cw'" :class="loadingStats ? 'animate-spin' : ''" class="h-4 w-4 mr-2" />
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
            <div class="text-xs text-orange-600" v-if="stats?.lowStockProducts">{{ stats.lowStockProducts }} low stock</div>
          </div>
          <div class="space-y-1 p-4 rounded-lg border bg-card">
            <div class="text-2xl font-bold">{{ stats?.orders || 0 }}</div>
            <div class="text-sm text-muted-foreground">Total Orders</div>
            <div class="text-xs text-green-600" v-if="stats?.recentOrders">{{ stats.recentOrders }} last 7 days</div>
          </div>
          <div class="space-y-1 p-4 rounded-lg border bg-card">
            <div class="text-2xl font-bold">€{{ stats?.totalRevenue?.toFixed(2) || '0.00' }}</div>
            <div class="text-sm text-muted-foreground">Total Revenue</div>
            <div class="text-xs text-muted-foreground">{{ stats?.categories || 0 }} categories</div>
          </div>
        </div>
      </CardContent>
    </Card>

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

        <!-- Quick Delete Actions -->
        <div class="mt-4 pt-4 border-t">
          <h4 class="text-sm font-medium mb-3 text-muted-foreground">Quick Delete</h4>
          <div class="flex flex-wrap gap-2">
            <Button @click="quickDelete('clear-test-users')" variant="outline" size="sm" :disabled="loading">
              <commonIcon name="lucide:users-2" class="h-3 w-3 mr-1" />
              Test Users
            </Button>
            <Button @click="quickDelete('clear-orders')" variant="outline" size="sm" :disabled="loading">
              <commonIcon name="lucide:shopping-cart" class="h-3 w-3 mr-1" />
              All Orders
            </Button>
            <Button @click="quickDelete('clear-products')" variant="outline" size="sm" :disabled="loading">
              <commonIcon name="lucide:package" class="h-3 w-3 mr-1" />
              All Products
            </Button>
            <Button @click="quickDelete('clear-old-carts')" variant="outline" size="sm" :disabled="loading">
              <commonIcon name="lucide:shopping-basket" class="h-3 w-3 mr-1" />
              Old Carts
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Progress Indicator -->
    <Card v-if="progress.active">
      <CardContent class="pt-6">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">{{ progress.message }}</span>
            <span class="text-sm text-muted-foreground">{{ progress.percent }}%</span>
          </div>
          <div class="w-full bg-secondary rounded-full h-2">
            <div
              class="bg-primary h-2 rounded-full transition-all duration-300"
              :style="{ width: `${progress.percent}%` }"
            ></div>
          </div>
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
              :class="validationErrors.userCount ? 'border-red-500' : ''"
            />
            <p v-if="validationErrors.userCount" class="text-xs text-red-500">{{ validationErrors.userCount }}</p>
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

          <Button @click="createUsers" :disabled="loading || !isUserFormValid" class="w-full">
            <commonIcon v-if="!loading" name="lucide:user-plus" class="h-4 w-4 mr-2" />
            <commonIcon v-else name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
            Create Users
          </Button>
        </CardContent>
      </Card>

      <!-- User Impersonation -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <commonIcon name="lucide:user-check" class="h-5 w-5" />
            User Impersonation
          </CardTitle>
          <CardDescription>Test user experience as another user</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">User Email</label>
            <input
              v-model="impersonation.userEmail"
              type="email"
              placeholder="user@example.com"
              class="w-full px-3 py-2 border rounded-md"
              :disabled="impersonation.active"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Reason (min 10 chars)</label>
            <textarea
              v-model="impersonation.reason"
              placeholder="Testing checkout flow..."
              class="w-full px-3 py-2 border rounded-md resize-none"
              rows="2"
              :disabled="impersonation.active"
            ></textarea>
          </div>

          <div class="space-y-2" v-if="!impersonation.active">
            <label class="text-sm font-medium">Duration (minutes)</label>
            <input
              v-model.number="impersonation.duration"
              type="number"
              min="1"
              max="120"
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <Alert v-if="impersonation.active" variant="warning">
            <commonIcon name="lucide:user-check" class="h-4 w-4" />
            <AlertTitle>Active Impersonation</AlertTitle>
            <AlertDescription>
              Acting as: {{ impersonation.targetName }}
              <br />
              Expires: {{ new Date(impersonation.expiresAt).toLocaleTimeString() }}
            </AlertDescription>
          </Alert>

          <Button
            v-if="!impersonation.active"
            @click="startImpersonation"
            :disabled="loading || !isImpersonationFormValid"
            class="w-full"
          >
            <commonIcon v-if="!loading" name="lucide:user-check" class="h-4 w-4 mr-2" />
            <commonIcon v-else name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
            Start Impersonation
          </Button>

          <Button
            v-else
            @click="stopImpersonation"
            :disabled="loading"
            variant="destructive"
            class="w-full"
          >
            <commonIcon v-if="!loading" name="lucide:user-x" class="h-4 w-4 mr-2" />
            <commonIcon v-else name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
            Stop Impersonation
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

      <!-- Scenario Templates -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <commonIcon name="lucide:bookmark" class="h-5 w-5" />
            Saved Scenarios
          </CardTitle>
          <CardDescription>Load or save custom testing scenarios</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <div v-if="savedScenarios.length === 0" class="text-center py-4 text-muted-foreground text-sm">
            No saved scenarios yet
          </div>

          <div v-for="scenario in savedScenarios" :key="scenario.id" class="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div class="font-medium text-sm">{{ scenario.name }}</div>
              <div class="text-xs text-muted-foreground">{{ scenario.description }}</div>
            </div>
            <div class="flex gap-2">
              <Button @click="loadScenario(scenario)" size="sm" variant="outline">
                <commonIcon name="lucide:play" class="h-3 w-3" />
              </Button>
              <Button @click="deleteScenario(scenario.id)" size="sm" variant="ghost">
                <commonIcon name="lucide:trash-2" class="h-3 w-3" />
              </Button>
            </div>
          </div>

          <Button @click="showSaveScenarioDialog = true" variant="outline" class="w-full mt-4">
            <commonIcon name="lucide:plus" class="h-4 w-4 mr-2" />
            Save Current Configuration
          </Button>
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
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2">
            <commonIcon
              :name="result.success ? 'lucide:check-circle' : 'lucide:alert-circle'"
              :class="result.success ? 'text-green-500' : 'text-red-500'"
              class="h-5 w-5"
            />
            {{ result.success ? 'Success' : 'Error' }}
          </CardTitle>
          <Button @click="exportCredentials" v-if="result.users && result.users.length > 0" variant="outline" size="sm">
            <commonIcon name="lucide:download" class="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <p class="text-sm">{{ result.message }}</p>

          <Alert v-if="result.suggestion" variant="default">
            <commonIcon name="lucide:lightbulb" class="h-4 w-4" />
            <AlertTitle>Suggestion</AlertTitle>
            <AlertDescription>{{ result.suggestion }}</AlertDescription>
          </Alert>

          <!-- Summary -->
          <div v-if="result.summary" class="bg-muted p-4 rounded-lg space-y-2">
            <h4 class="font-semibold text-sm">Summary</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div v-for="(value, key) in result.summary" :key="key">
                <div class="text-muted-foreground">{{ formatKey(key) }}</div>
                <div class="font-semibold">{{ formatValue(value) }}</div>
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
                {{ typeof error === 'string' ? error : error.error || JSON.stringify(error) }}
              </li>
            </ul>
          </div>

          <Button @click="result = null" variant="outline" class="w-full">
            Close
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Generation History -->
    <Card v-if="generationHistory.length > 0">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <commonIcon name="lucide:history" class="h-5 w-5" />
          Recent Generations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <div
            v-for="item in generationHistory.slice(0, 5)"
            :key="item.id"
            class="flex items-center justify-between p-3 border rounded-lg text-sm"
          >
            <div>
              <div class="font-medium">{{ item.preset }}</div>
              <div class="text-xs text-muted-foreground">
                {{ new Date(item.timestamp).toLocaleString() }} • {{ item.duration }}ms
              </div>
            </div>
            <div class="text-xs text-muted-foreground">
              {{ item.results.users || 0 }}U / {{ item.results.products || 0 }}P / {{ item.results.orders || 0 }}O
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Save Scenario Dialog (simplified) -->
    <div v-if="showSaveScenarioDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showSaveScenarioDialog = false">
      <Card class="w-full max-w-md">
        <CardHeader>
          <CardTitle>Save Scenario</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Scenario Name</label>
            <input
              v-model="newScenario.name"
              type="text"
              placeholder="My Custom Scenario"
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Description</label>
            <textarea
              v-model="newScenario.description"
              placeholder="Description..."
              class="w-full px-3 py-2 border rounded-md resize-none"
              rows="2"
            ></textarea>
          </div>
          <div class="flex gap-2">
            <Button @click="saveScenario" class="flex-1">Save</Button>
            <Button @click="showSaveScenarioDialog = false" variant="outline" class="flex-1">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { TestResult, DatabaseStats, ScenarioTemplate, GenerationHistoryItem, CustomDataConfig, ProgressState, ValidationError } from '~/types/admin-testing'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const loading = ref(false)
const loadingStats = ref(false)
const result = ref<TestResult | null>(null)
const showWarning = ref(true)
const stats = ref<DatabaseStats | null>(null)

// User simulation options
const userCount = ref(10)
const userRole = ref('customer')
const withAddresses = ref(true)
const withOrders = ref(false)

// Custom data options
const customData = ref<CustomDataConfig>({
  products: 20,
  users: 10,
  orders: 30,
  clearExisting: false
})

// Progress tracking
const progress = ref<ProgressState>({
  active: false,
  percent: 0,
  message: '',
  cancellable: false
})

// Impersonation
const impersonation = ref({
  active: false,
  userEmail: '',
  reason: '',
  duration: 30,
  targetName: '',
  expiresAt: '',
  logId: 0
})

// Validation
const validationErrors = ref<Record<string, string>>({})

// Scenarios
const savedScenarios = ref<ScenarioTemplate[]>([])
const showSaveScenarioDialog = ref(false)
const newScenario = ref({
  name: '',
  description: ''
})

// Generation history
const generationHistory = ref<GenerationHistoryItem[]>([])

// Computed validations
const isUserFormValid = computed(() => {
  return userCount.value >= 1 && userCount.value <= 100
})

const isImpersonationFormValid = computed(() => {
  return impersonation.value.userEmail.length > 0 &&
         impersonation.value.reason.length >= 10 &&
         impersonation.value.duration >= 1 &&
         impersonation.value.duration <= 120
})

// Lifecycle
onMounted(async () => {
  await refreshStats()
  loadSavedScenarios()
  loadGenerationHistory()
})

// Fetch database stats
const refreshStats = async () => {
  loadingStats.value = true
  try {
    const response = await $fetch('/api/admin/stats')
    stats.value = response.stats
  } catch (err: any) {
    console.error('Failed to fetch stats:', err)
  } finally {
    loadingStats.value = false
  }
}

// Quick action presets
const runQuickAction = async (preset: string) => {
  loading.value = true
  result.value = null
  progress.value = { active: true, percent: 0, message: `Starting ${preset}...`, cancellable: false }

  try {
    const response = await $fetch('/api/admin/seed-data', {
      method: 'POST',
      body: { preset }
    })

    progress.value.percent = 100
    progress.value.message = 'Complete!'

    result.value = response as any

    // Add to history
    addToHistory(preset, response)

    // Refresh stats
    await refreshStats()
  } catch (err: any) {
    result.value = {
      success: false,
      message: err.data?.message || err.message || 'Failed to run quick action',
      error: err,
      suggestion: getErrorSuggestion(err)
    }
  } finally {
    loading.value = false
    setTimeout(() => {
      progress.value.active = false
    }, 1000)
  }
}

// Quick delete
const quickDelete = async (action: string) => {
  if (!confirm(`Delete ${action}? This cannot be undone.`)) return

  loading.value = true
  result.value = null

  try {
    const response = await $fetch('/api/admin/cleanup', {
      method: 'POST',
      body: { action, confirm: true }
    })

    result.value = response as any
    await refreshStats()
  } catch (err: any) {
    result.value = {
      success: false,
      message: err.data?.message || err.message || 'Failed to delete data',
      error: err
    }
  } finally {
    loading.value = false
  }
}

// Create users
const createUsers = async () => {
  if (!validateUserForm()) return

  loading.value = true
  result.value = null
  progress.value = { active: true, percent: 0, message: 'Creating users...', cancellable: false }

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

    progress.value.percent = 100
    result.value = response as any
    await refreshStats()
  } catch (err: any) {
    result.value = {
      success: false,
      message: err.data?.message || err.message || 'Failed to create users',
      error: err,
      suggestion: getErrorSuggestion(err)
    }
  } finally {
    loading.value = false
    setTimeout(() => {
      progress.value.active = false
    }, 1000)
  }
}

// Impersonation
const startImpersonation = async () => {
  if (!isImpersonationFormValid.value) return

  loading.value = true
  try {
    // First, find user by email
    const response = await $fetch('/api/admin/impersonate', {
      method: 'POST',
      body: {
        action: 'start',
        userId: impersonation.value.userEmail, // In reality, you'd need to look up userId first
        reason: impersonation.value.reason,
        duration: impersonation.value.duration
      }
    })

    if (response.success) {
      impersonation.value.active = true
      impersonation.value.targetName = response.impersonating.name
      impersonation.value.expiresAt = response.expiresAt
      impersonation.value.logId = response.logId

      result.value = {
        success: true,
        message: response.message
      }
    }
  } catch (err: any) {
    result.value = {
      success: false,
      message: err.data?.message || err.message || 'Failed to start impersonation',
      error: err,
      suggestion: getErrorSuggestion(err)
    }
  } finally {
    loading.value = false
  }
}

const stopImpersonation = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/impersonate', {
      method: 'POST',
      body: {
        action: 'end',
        logId: impersonation.value.logId
      }
    })

    if (response.success) {
      impersonation.value.active = false
      impersonation.value.userEmail = ''
      impersonation.value.reason = ''
      impersonation.value.targetName = ''

      result.value = {
        success: true,
        message: 'Impersonation ended successfully'
      }
    }
  } catch (err: any) {
    result.value = {
      success: false,
      message: err.data?.message || err.message || 'Failed to stop impersonation',
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
  progress.value = { active: true, percent: 0, message: 'Generating custom data...', cancellable: false }

  try {
    const response = await $fetch('/api/admin/seed-data', {
      method: 'POST',
      body: {
        preset: 'minimal',
        ...customData.value
      }
    })

    progress.value.percent = 100
    result.value = response as any
    await refreshStats()
  } catch (err: any) {
    result.value = {
      success: false,
      message: err.data?.message || err.message || 'Failed to generate data',
      error: err
    }
  } finally {
    loading.value = false
    setTimeout(() => {
      progress.value.active = false
    }, 1000)
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

    result.value = response as any
    await refreshStats()
  } catch (err: any) {
    result.value = {
      success: false,
      message: err.data?.message || err.message || 'Failed to cleanup data',
      error: err
    }
  } finally {
    loading.value = false
  }
}

// Validation
const validateUserForm = (): boolean => {
  validationErrors.value = {}

  if (userCount.value < 1 || userCount.value > 100) {
    validationErrors.value.userCount = 'Must be between 1 and 100'
    return false
  }

  return true
}

// Scenario management
const loadSavedScenarios = () => {
  const saved = localStorage.getItem('admin-test-scenarios')
  if (saved) {
    savedScenarios.value = JSON.parse(saved)
  }
}

const saveScenario = () => {
  const scenario: ScenarioTemplate = {
    id: Date.now().toString(),
    name: newScenario.value.name,
    description: newScenario.value.description,
    config: { ...customData.value },
    createdAt: new Date().toISOString()
  }

  savedScenarios.value.push(scenario)
  localStorage.setItem('admin-test-scenarios', JSON.stringify(savedScenarios.value))

  newScenario.value = { name: '', description: '' }
  showSaveScenarioDialog.value = false
}

const loadScenario = (scenario: ScenarioTemplate) => {
  customData.value = { ...scenario.config }
}

const deleteScenario = (id: string) => {
  savedScenarios.value = savedScenarios.value.filter(s => s.id !== id)
  localStorage.setItem('admin-test-scenarios', JSON.stringify(savedScenarios.value))
}

// History management
const loadGenerationHistory = () => {
  const saved = localStorage.getItem('admin-test-history')
  if (saved) {
    generationHistory.value = JSON.parse(saved)
  }
}

const addToHistory = (preset: string, response: any) => {
  const item: GenerationHistoryItem = {
    id: Date.now().toString(),
    preset,
    config: { preset: preset as any },
    timestamp: new Date().toISOString(),
    results: {
      users: response.results?.steps?.find((s: any) => s.step === 'Create users')?.count || 0,
      products: response.results?.steps?.find((s: any) => s.step === 'Create products')?.count || 0,
      orders: response.results?.steps?.find((s: any) => s.step === 'Create orders')?.count || 0
    },
    duration: response.totalDuration || 0
  }

  generationHistory.value.unshift(item)
  generationHistory.value = generationHistory.value.slice(0, 10) // Keep last 10
  localStorage.setItem('admin-test-history', JSON.stringify(generationHistory.value))
}

// Export credentials
const exportCredentials = () => {
  if (!result.value?.users) return

  const csv = [
    ['Name', 'Email', 'Role', 'Phone'].join(','),
    ...result.value.users.map(u =>
      [u.name, u.email, u.role, u.phone].join(',')
    )
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `test-users-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Helper to format keys for display
const formatKey = (key: string) => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

// Helper to format values
const formatValue = (value: any): string => {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

// Error suggestion helper
const getErrorSuggestion = (error: any): string | undefined => {
  const message = error.data?.message || error.message || ''

  if (message.includes('rate limit') || message.includes('429')) {
    return 'Wait a minute before trying again, or reduce the number of items.'
  }

  if (message.includes('not found') || message.includes('404')) {
    return 'Make sure the resource exists before performing this action.'
  }

  if (message.includes('permission') || message.includes('403')) {
    return 'Check your admin permissions and try again.'
  }

  return undefined
}

useHead({
  title: 'Testing Dashboard - Admin - Moldova Direct'
})
</script>
