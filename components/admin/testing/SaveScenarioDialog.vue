<template>
  <UiDialog
    :open="show"
    @update:open="(val) => !val && handleClose()"
  >
    <UiDialogContent class="sm:max-w-md">
      <UiDialogHeader>
        <UiDialogTitle>Save Scenario</UiDialogTitle>
        <UiDialogDescription>
          Save your current configuration as a reusable scenario template
        </UiDialogDescription>
      </UiDialogHeader>

      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <UiLabel for="scenario-name">
            Scenario Name
          </UiLabel>
          <UiInput
            id="scenario-name"
            v-model="localName"
            type="text"
            placeholder="My Custom Scenario"
            maxlength="100"
            :aria-invalid="!!nameError"
            :aria-describedby="nameError ? 'name-error' : undefined"
          />
          <p
            v-if="nameError"
            id="name-error"
            class="text-xs text-destructive"
            role="alert"
          >
            {{ nameError }}
          </p>
        </div>

        <div class="space-y-2">
          <UiLabel for="scenario-description">
            Description
          </UiLabel>
          <UiTextarea
            id="scenario-description"
            v-model="localDescription"
            placeholder="Describe this scenario configuration..."
            maxlength="500"
            rows="3"
          />
          <p class="text-xs text-muted-foreground">
            {{ localDescription.length }}/500 characters
          </p>
        </div>
      </div>

      <UiDialogFooter>
        <UiButton>
          variant="outline"
          type="button"
          @click="handleClose"
          >
          Cancel
        </UiButton>
        <UiButton>
          :disabled="!isFormValid"
          type="submit"
          @click="handleSave"
          >
          Save Scenario
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [data: { name: string, description: string }]
}>()

const localName = ref('')
const localDescription = ref('')

// Validation
const nameError = computed(() => {
  if (!localName.value.trim() && localName.value.length > 0) {
    return 'Name cannot be only whitespace'
  }
  if (localName.value.length > 100) {
    return 'Name cannot exceed 100 characters'
  }
  return ''
})

const isFormValid = computed(() => {
  return localName.value.trim().length > 0 && !nameError.value
})

// Reset form when dialog closes
watch(() => props.show, (newValue) => {
  if (!newValue) {
    localName.value = ''
    localDescription.value = ''
  }
})

const handleClose = () => {
  emit('close')
}

const handleSave = () => {
  if (!isFormValid.value) {
    return
  }

  emit('save', {
    name: localName.value.trim(),
    description: localDescription.value.trim(),
  })

  // Clear form after save
  localName.value = ''
  localDescription.value = ''
}
</script>
