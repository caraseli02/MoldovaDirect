<template>
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
            v-model.number="localProducts"
            type="number"
            min="0"
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Users</label>
          <input
            v-model.number="localUsers"
            type="number"
            min="0"
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Orders</label>
          <input
            v-model.number="localOrders"
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
          v-model="localClearExisting"
          class="rounded"
        />
        <label for="clear-existing" class="text-sm">Clear existing data first</label>
      </div>

      <Button @click="handleGenerate" :disabled="loading" class="w-full">
        <commonIcon v-if="!loading" name="lucide:play" class="h-4 w-4 mr-2" />
        <commonIcon v-else name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
        Generate Custom Data
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { CustomDataConfig } from '~/types/admin-testing'

const props = defineProps<{
  loading: boolean
  modelValue: CustomDataConfig
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CustomDataConfig]
  generate: [config: CustomDataConfig]
}>()

const localProducts = ref(props.modelValue.products)
const localUsers = ref(props.modelValue.users)
const localOrders = ref(props.modelValue.orders)
const localClearExisting = ref(props.modelValue.clearExisting)

watch([localProducts, localUsers, localOrders, localClearExisting], () => {
  emit('update:modelValue', {
    products: localProducts.value,
    users: localUsers.value,
    orders: localOrders.value,
    clearExisting: localClearExisting.value
  })
})

const handleGenerate = () => {
  emit('generate', {
    products: localProducts.value,
    users: localUsers.value,
    orders: localOrders.value,
    clearExisting: localClearExisting.value
  })
}
</script>
