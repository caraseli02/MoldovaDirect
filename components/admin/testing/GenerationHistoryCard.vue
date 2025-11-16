<template>
  <Card v-if="history.length > 0">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <commonIcon name="lucide:history" class="h-5 w-5" />
        Recent Generations
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-2">
        <div
          v-for="item in history.slice(0, 5)"
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
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GenerationHistoryItem } from '~/types/admin-testing'

defineProps<{
  history: GenerationHistoryItem[]
}>()
</script>
