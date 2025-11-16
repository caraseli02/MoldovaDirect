<template>
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
        @click="$emit('cleanup', 'clear-orders')"
        :disabled="loading"
        variant="outline"
        class="w-full justify-start"
      >
        <commonIcon name="lucide:shopping-cart" class="h-4 w-4 mr-2" />
        Clear All Orders
      </Button>

      <Button
        @click="$emit('cleanup', 'clear-products')"
        :disabled="loading"
        variant="outline"
        class="w-full justify-start"
      >
        <commonIcon name="lucide:package" class="h-4 w-4 mr-2" />
        Clear All Products
      </Button>

      <Button
        @click="$emit('cleanup', 'clear-test-users')"
        :disabled="loading"
        variant="outline"
        class="w-full justify-start"
      >
        <commonIcon name="lucide:users-2" class="h-4 w-4 mr-2" />
        Clear Test Users
      </Button>

      <Button
        @click="$emit('cleanup', 'clear-old-carts')"
        :disabled="loading"
        variant="outline"
        class="w-full justify-start"
      >
        <commonIcon name="lucide:shopping-basket" class="h-4 w-4 mr-2" />
        Clear Old Carts (7+ days)
      </Button>

      <div class="pt-2 border-t">
        <Button
          @click="$emit('cleanup', 'reset-database')"
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
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

defineProps<{
  loading: boolean
}>()

defineEmits<{
  cleanup: [action: string]
}>()
</script>
