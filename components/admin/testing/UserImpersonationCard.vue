<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle class="flex items-center gap-2">
        <commonIcon
          name="lucide:user-check"
          class="h-5 w-5"
        />
        User Impersonation
      </UiCardTitle>
      <UiCardDescription>Test user experience as another user</UiCardDescription>
    </UiCardHeader>
    <UiCardContent class="space-y-4">
      <div class="space-y-2">
        <UiLabel for="user-email">
          User Email
        </UiLabel>
        <UiInput
          id="user-email"
          v-model="localUserEmail"
          type="email"
          placeholder="user@example.com"
          :disabled="isActive"
          :aria-invalid="!!emailError"
          :aria-describedby="emailError ? 'email-error' : undefined"
        />
        <p
          v-if="emailError"
          id="email-error"
          class="text-xs text-destructive"
          role="alert"
        >
          {{ emailError }}
        </p>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <UiLabel for="impersonate-reason">
            Reason (min 10 chars)
          </UiLabel>
          <span class="text-xs text-muted-foreground">
            {{ localReason.length }}/500
          </span>
        </div>
        <UiTextarea
          id="impersonate-reason"
          v-model="localReason"
          placeholder="Testing checkout flow..."
          rows="2"
          maxlength="500"
          :disabled="isActive"
          :aria-invalid="!!reasonError"
          :aria-describedby="reasonError ? 'reason-error' : undefined"
        />
        <p
          v-if="reasonError"
          id="reason-error"
          class="text-xs text-destructive"
          role="alert"
        >
          {{ reasonError }}
        </p>
      </div>

      <div
        v-if="!isActive"
        class="space-y-2"
      >
        <UiLabel for="duration">
          Duration (minutes)
        </UiLabel>
        <UiInput
          id="duration"
          v-model.number="localDuration"
          type="number"
          min="1"
          max="120"
        />
      </div>

      <UiAlert
        v-if="isActive"
        variant="destructive"
      >
        <commonIcon
          name="lucide:user-check"
          class="h-4 w-4"
        />
        <UiAlertTitle>Active Impersonation</UiAlertTitle>
        <UiAlertDescription>
          Acting as: {{ targetName }}
          <br />
          Expires: {{ expiresAt ? new Date(expiresAt).toLocaleTimeString() : 'N/A' }}
        </UiAlertDescription>
      </UiAlert>

      <UiButton>
        v-if="!isActive"
        :disabled="loading || !isFormValid"
        class="w-full"
        @click="handleStart"
        >
        <commonIcon
          v-if="!loading"
          name="lucide:user-check"
          class="h-4 w-4 mr-2"
        />
        <commonIcon
          v-else
          name="lucide:loader-2"
          class="h-4 w-4 mr-2 animate-spin"
        />
        Start Impersonation
      </UiButton>

      <UiButton>
        v-else
        :disabled="loading"
        variant="destructive"
        class="w-full"
        @click="handleStop"
        >
        <commonIcon
          v-if="!loading"
          name="lucide:user-x"
          class="h-4 w-4 mr-2"
        />
        <commonIcon
          v-else
          name="lucide:loader-2"
          class="h-4 w-4 mr-2 animate-spin"
        />
        Stop Impersonation
      </UiButton>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const _props = defineProps<{
  loading: boolean
  isActive: boolean
  targetName?: string
  expiresAt?: string
}>()

const emit = defineEmits<{
  start: [config: { userEmail: string, reason: string, duration: number }]
  stop: []
}>()

const localUserEmail = ref('')
const localReason = ref('')
const localDuration = ref(30)

// Validation
const emailError = computed(() => {
  if (localUserEmail.value.length > 0 && !localUserEmail.value.includes('@')) {
    return 'Please enter a valid email address'
  }
  return ''
})

const reasonError = computed(() => {
  if (localReason.value.length > 0 && localReason.value.length < 10) {
    return 'Reason must be at least 10 characters'
  }
  return ''
})

const isFormValid = computed(() => {
  return (
    localUserEmail.value.length > 0
    && !emailError.value
    && localReason.value.length >= 10
    && !reasonError.value
    && localDuration.value >= 1
    && localDuration.value <= 120
  )
})

const handleStart = () => {
  if (!isFormValid.value) return

  emit('start', {
    userEmail: localUserEmail.value,
    reason: localReason.value,
    duration: localDuration.value,
  })
}

const handleStop = () => {
  emit('stop')
}
</script>
