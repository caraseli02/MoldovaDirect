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
        <label class="text-sm font-medium">User Email</label>
        <input
          v-model="localUserEmail"
          type="email"
          placeholder="user@example.com"
          class="w-full px-3 py-2 border rounded-md"
          :disabled="isActive"
        />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">Reason (min 10 chars)</label>
        <textarea
          v-model="localReason"
          placeholder="Testing checkout flow..."
          class="w-full px-3 py-2 border rounded-md resize-none"
          rows="2"
          :disabled="isActive"
        ></textarea>
      </div>

      <div class="space-y-2" v-if="!isActive">
        <label class="text-sm font-medium">Duration (minutes)</label>
        <input
          v-model.number="localDuration"
          type="number"
          min="1"
          max="120"
          class="w-full px-3 py-2 border rounded-md"
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

const isFormValid = computed(() => {
  return (
    localUserEmail.value.length > 0 &&
    localReason.value.length >= 10 &&
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
