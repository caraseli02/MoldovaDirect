<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <commonIcon name="lucide:bookmark" class="h-5 w-5" />
        Saved Scenarios
      </CardTitle>
      <CardDescription>Load or save custom testing scenarios</CardDescription>
    </CardHeader>
    <CardContent class="space-y-3">
      <div v-if="scenarios.length === 0" class="text-center py-4 text-muted-foreground text-sm">
        No saved scenarios yet
      </div>

      <div
        v-for="scenario in scenarios"
        :key="scenario.id"
        class="flex items-center justify-between p-3 border rounded-lg"
      >
        <div>
          <div class="font-medium text-sm">{{ scenario.name }}</div>
          <div class="text-xs text-muted-foreground">{{ scenario.description }}</div>
        </div>
        <div class="flex gap-2">
          <Button
            @click="$emit('load', scenario)"
            size="sm"
            variant="outline"
            :aria-label="`Load scenario: ${scenario.name}`"
          >
            <commonIcon name="lucide:play" class="h-3 w-3" />
          </Button>
          <Button
            @click="$emit('delete', scenario.id)"
            size="sm"
            variant="ghost"
            :aria-label="`Delete scenario: ${scenario.name}`"
          >
            <commonIcon name="lucide:trash-2" class="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Button @click="$emit('open-dialog')" variant="outline" class="w-full mt-4">
        <commonIcon name="lucide:plus" class="h-4 w-4 mr-2" />
        Save Current Configuration
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ScenarioTemplate } from '~/types/admin-testing'

defineProps<{
  scenarios: ScenarioTemplate[]
}>()

defineEmits<{
  load: [scenario: ScenarioTemplate]
  delete: [id: string]
  'open-dialog': []
}>()
</script>
