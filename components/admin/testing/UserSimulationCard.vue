<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle class="flex items-center gap-2">
        <commonIcon
          name="lucide:users"
          class="h-5 w-5"
        />
        User Simulation
      </UiCardTitle>
      <UiCardDescription>Create test users with realistic profiles</UiCardDescription>
    </UiCardHeader>
    <UiCardContent class="space-y-4">
      <div class="space-y-2">
        <UiLabel>Number of Users</UiLabel>
        <UiInput
          v-model.number="localUserCount"
          type="number"
          min="1"
          max="100"
          :class="validationError ? 'border-red-500' : ''"
        />
        <p
          v-if="validationError"
          class="text-xs text-red-500"
        >
          {{ validationError }}
        </p>
      </div>

      <div class="space-y-2">
        <UiLabel>User Role</UiLabel>
        <UiSelect v-model="localUserRole">
          <UiSelectTrigger>
            <UiSelectValue />
          </UiSelectTrigger>
          <UiSelectContent>
            <UiSelectItem value="customer">
              Customer
            </UiSelectItem>
            <UiSelectItem value="admin">
              Admin
            </UiSelectItem>
            <UiSelectItem value="manager">
              Manager
            </UiSelectItem>
          </UiSelectContent>
        </UiSelect>
      </div>

      <div class="flex items-center space-x-2">
        <UiCheckbox
          id="with-addresses"
          :checked="localWithAddresses"
          @update:checked="localWithAddresses = $event"
        />
        <UiLabel for="with-addresses">
          Include addresses
        </UiLabel>
      </div>

      <div class="flex items-center space-x-2">
        <UiCheckbox
          id="with-orders"
          :checked="localWithOrders"
          @update:checked="localWithOrders = $event"
        />
        <UiLabel for="with-orders">
          Create order history
        </UiLabel>
      </div>

      <UiButton>
        :disabled="loading || !isFormValid"
        class="w-full"
        @click="handleCreateUsers"
        >
        <commonIcon
          v-if="!loading"
          name="lucide:user-plus"
          class="h-4 w-4 mr-2"
        />
        <commonIcon
          v-else
          name="lucide:loader-2"
          class="h-4 w-4 mr-2 animate-spin"
        />
        Create Users
      </UiButton>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    withOrders: localWithOrders.value,
  })
}
</script>
