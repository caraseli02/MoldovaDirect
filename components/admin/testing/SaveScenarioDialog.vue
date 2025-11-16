<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Save Scenario</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Scenario Name</label>
          <input
            v-model="localName"
            type="text"
            placeholder="My Custom Scenario"
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Description</label>
          <textarea
            v-model="localDescription"
            placeholder="Description..."
            class="w-full px-3 py-2 border rounded-md resize-none"
            rows="2"
          ></textarea>
        </div>
        <div class="flex gap-2">
          <Button @click="handleSave" class="flex-1">Save</Button>
          <Button @click="$emit('close')" variant="outline" class="flex-1">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [data: { name: string; description: string }]
}>()

const localName = ref('')
const localDescription = ref('')

watch(() => props.show, (newValue) => {
  if (!newValue) {
    localName.value = ''
    localDescription.value = ''
  }
})

const handleSave = () => {
  emit('save', {
    name: localName.value,
    description: localDescription.value
  })
}
</script>
