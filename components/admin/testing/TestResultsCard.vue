<template>
  <UiCard v-if="result">
    <UiCardHeader>
      <div class="flex items-center justify-between">
        <UiCardTitle class="flex items-center gap-2">
          <commonIcon
            :name="result.success ? 'lucide:check-circle' : 'lucide:alert-circle'"
            :class="result.success ? 'text-green-500' : 'text-red-500'"
            class="h-5 w-5"
          />
          {{ result.success ? 'Success' : 'Error' }}
        </UiCardTitle>
        <UiButton
          v-if="result.users && result.users.length > 0"
          variant="outline"
          size="sm"
          @click="$emit('export-credentials')"
        >
          <commonIcon
            name="lucide:download"
            class="h-4 w-4 mr-2"
          />
          Export CSV
        </UiButton>
      </div>
    </UiCardHeader>
    <UiCardContent>
      <div class="space-y-4">
        <p class="text-sm">
          {{ result.message }}
        </p>

        <UiAlert
          v-if="result.suggestion"
          variant="default"
        >
          <commonIcon
            name="lucide:lightbulb"
            class="h-4 w-4"
          />
          <UiAlertTitle>Suggestion</UiAlertTitle>
          <UiAlertDescription>{{ result.suggestion }}</UiAlertDescription>
        </UiAlert>

        <!-- Summary -->
        <div
          v-if="result.summary"
          class="bg-muted p-4 rounded-lg space-y-2"
        >
          <h4 class="font-semibold text-sm">
            Summary
          </h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div
              v-for="(value, key) in result.summary"
              :key="key"
            >
              <div class="text-muted-foreground">
                {{ formatKey(key) }}
              </div>
              <div class="font-semibold">
                {{ formatValue(value) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Created Users -->
        <div
          v-if="result.users && result.users.length > 0"
          class="space-y-2"
        >
          <h4 class="font-semibold text-sm">
            Created Users
          </h4>
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
        <div
          v-if="result.results?.deletedCounts"
          class="space-y-2"
        >
          <h4 class="font-semibold text-sm">
            Deleted Items
          </h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div
              v-for="(count, table) in result.results.deletedCounts"
              :key="table"
              class="bg-muted p-2 rounded"
            >
              <div class="text-muted-foreground">
                {{ formatKey(table) }}
              </div>
              <div class="font-semibold">
                {{ count }}
              </div>
            </div>
          </div>
        </div>

        <!-- Errors -->
        <div
          v-if="result.errors && result.errors.length > 0"
          class="space-y-2"
        >
          <h4 class="font-semibold text-sm text-red-500">
            Errors
          </h4>
          <ul class="text-xs space-y-1">
            <li
              v-for="(error, index) in result.errors"
              :key="index"
              class="text-red-600"
            >
              {{ typeof error === 'string' ? error : error.error || JSON.stringify(error) }}
            </li>
          </ul>
        </div>

        <UiButton
          variant="outline"
          class="w-full"
          @click="$emit('close')"
        >
          Close
        </UiButton>
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import type { TestResult } from '~/types/admin-testing'

defineProps<{
  result: TestResult | null
}>()

defineEmits<{
  'close': []
  'export-credentials': []
}>()

const formatKey = (key: string | number) => {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

const formatValue = (value: any): string => {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}
</script>
