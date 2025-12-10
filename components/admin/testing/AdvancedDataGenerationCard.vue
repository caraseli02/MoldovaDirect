<template>
  <Card>
    <CardHeader>
      <CardTitle>Advanced Test Data Generation</CardTitle>
      <CardDescription>Custom data generation with full control</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div class="space-y-2">
          <Label for="products-input">Products</Label>
          <Input
            id="products-input"
            v-model.number="localProducts"
            type="number"
            min="0"
            max="5000"
          />
        </div>

        <div class="space-y-2">
          <Label for="users-input">Users</Label>
          <Input
            id="users-input"
            v-model.number="localUsers"
            type="number"
            min="0"
            max="1000"
          />
        </div>

        <div class="space-y-2">
          <Label for="orders-input">Orders</Label>
          <Input
            id="orders-input"
            v-model.number="localOrders"
            type="number"
            min="0"
            max="10000"
          />
        </div>
      </div>

      <div class="flex items-center space-x-2 mb-4">
        <Checkbox
          id="clear-existing"
          v-model:checked="localClearExisting"
        />
        <Label
          for="clear-existing"
          class="text-sm cursor-pointer"
        >
          Clear existing data first
        </Label>
      </div>

      <Button
        :disabled="loading"
        class="w-full"
        @click="handleGenerate"
      >
        <commonIcon
          v-if="!loading"
          name="lucide:play"
          class="h-4 w-4 mr-2"
        />
        <commonIcon
          v-else
          name="lucide:loader-2"
          class="h-4 w-4 mr-2 animate-spin"
        />
        Generate Custom Data
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import type { CustomDataConfig } from '~/types/admin-testing'

const props = defineProps<{
  loading: boolean
  modelValue: CustomDataConfig
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CustomDataConfig]
  'generate': [config: CustomDataConfig]
}>()

const localProducts = computed({
  get: () => props.modelValue.products,
  set: value => emit('update:modelValue', { ...props.modelValue, products: value }),
})

const localUsers = computed({
  get: () => props.modelValue.users,
  set: value => emit('update:modelValue', { ...props.modelValue, users: value }),
})

const localOrders = computed({
  get: () => props.modelValue.orders,
  set: value => emit('update:modelValue', { ...props.modelValue, orders: value }),
})

const localClearExisting = computed({
  get: () => props.modelValue.clearExisting,
  set: value => emit('update:modelValue', { ...props.modelValue, clearExisting: value }),
})

const handleGenerate = () => {
  emit('generate', {
    products: localProducts.value,
    users: localUsers.value,
    orders: localOrders.value,
    clearExisting: localClearExisting.value,
  })
}
</script>
