<template>
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
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import type { ProgressState } from '~/types/admin-testing'

defineProps<{
  progress: ProgressState
}>()
</script>
