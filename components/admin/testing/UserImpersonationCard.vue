<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <commonIcon name="lucide:user-check" class="h-5 w-5" />
        User Impersonation
      </CardTitle>
      <CardDescription>Test user experience as another user</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <Label for="user-email">User Email</Label>
        <Input
          id="user-email"
          v-model="localUserEmail"
          type="email"
          placeholder="user@example.com"
          :disabled="isActive"
          :aria-invalid="!!emailError"
          :aria-describedby="emailError ? 'email-error' : undefined"
        />
        <p v-if="emailError" id="email-error" class="text-xs text-destructive" role="alert">
          {{ emailError }}
        </p>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <Label for="impersonate-reason">Reason (min 10 chars)</Label>
          <span class="text-xs text-muted-foreground">
            {{ localReason.length }}/500
          </span>
        </div>
        <Textarea
          id="impersonate-reason"
          v-model="localReason"
          placeholder="Testing checkout flow..."
          rows="2"
          maxlength="500"
          :disabled="isActive"
          :aria-invalid="!!reasonError"
          :aria-describedby="reasonError ? 'reason-error' : undefined"
        />
        <p v-if="reasonError" id="reason-error" class="text-xs text-destructive" role="alert">
          {{ reasonError }}
        </p>
      </div>

      <div class="space-y-2" v-if="!isActive">
        <Label for="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          v-model.number="localDuration"
          type="number"
          min="1"
          max="120"
        />
      </div>

      <Alert v-if="isActive" variant="warning">
        <commonIcon name="lucide:user-check" class="h-4 w-4" />
        <AlertTitle>Active Impersonation</AlertTitle>
        <AlertDescription>
          Acting as: {{ targetName }}
          <br />
          Expires: {{ new Date(expiresAt).toLocaleTimeString() }}
        </AlertDescription>
      </Alert>

      <Button
        v-if="!isActive"
        @click="handleStart"
        :disabled="loading || !isFormValid"
        class="w-full"
      >
        <commonIcon v-if="!loading" name="lucide:user-check" class="h-4 w-4 mr-2" />
        <commonIcon v-else name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
        Start Impersonation
      </Button>

      <Button
        v-else
        @click="handleStop"
        :disabled="loading"
        variant="destructive"
        class="w-full"
      >
        <commonIcon v-if="!loading" name="lucide:user-x" class="h-4 w-4 mr-2" />
        <commonIcon v-else name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
        Stop Impersonation
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const props = defineProps<{
  loading: boolean
  isActive: boolean
  targetName?: string
  expiresAt?: string
}>()

const emit = defineEmits<{
  start: [config: { userEmail: string; reason: string; duration: number }]
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
    localUserEmail.value.length > 0 &&
    !emailError.value &&
    localReason.value.length >= 10 &&
    !reasonError.value &&
    localDuration.value >= 1 &&
    localDuration.value <= 120
  )
})

const handleStart = () => {
  if (!isFormValid.value) return

  emit('start', {
    userEmail: localUserEmail.value,
    reason: localReason.value,
    duration: localDuration.value
  })
}

const handleStop = () => {
  emit('stop')
}
</script>
