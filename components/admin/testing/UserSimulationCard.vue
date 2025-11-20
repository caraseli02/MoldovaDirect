<template>
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
          v-model.number="localUserCount"
          type="number"
          min="1"
          max="100"
          class="w-full px-3 py-2 border rounded-md"
          :class="validationError ? 'border-red-500' : ''"
        />
        <p v-if="validationError" class="text-xs text-red-500">{{ validationError }}</p>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">User Role</label>
        <select v-model="localUserRole" class="w-full px-3 py-2 border rounded-md">
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
        </select>
      </div>

      <div class="flex items-center space-x-2">
        <input
          type="checkbox"
          id="with-addresses"
          v-model="localWithAddresses"
          class="rounded"
        />
        <label for="with-addresses" class="text-sm">Include addresses</label>
      </div>

      <div class="flex items-center space-x-2">
        <input
          type="checkbox"
          id="with-orders"
          v-model="localWithOrders"
          class="rounded"
        />
        <label for="with-orders" class="text-sm">Create order history</label>
      </div>

      <Button @click="handleCreateUsers" :disabled="loading || !isFormValid" class="w-full">
        <commonIcon v-if="!loading" name="lucide:user-plus" class="h-4 w-4 mr-2" />
        <commonIcon v-else name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
        Create Users
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{
  'create-users': [config: {
    count: number
    roles: string[]
    withAddresses: boolean
    withOrders: boolean
  }]
}>()

const localUserCount = ref(10)
const localUserRole = ref('customer')
const localWithAddresses = ref(true)
const localWithOrders = ref(false)

const validationError = computed(() => {
  if (localUserCount.value < 1 || localUserCount.value > 100) {
    return 'Must be between 1 and 100'
  }
  return ''
})

const isFormValid = computed(() => {
  return localUserCount.value >= 1 && localUserCount.value <= 100
})

const handleCreateUsers = () => {
  if (!isFormValid.value) return

  emit('create-users', {
    count: localUserCount.value,
    roles: [localUserRole.value],
    withAddresses: localWithAddresses.value,
    withOrders: localWithOrders.value
  })
}
</script>
