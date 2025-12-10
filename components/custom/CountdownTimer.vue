<template>
  <div class="inline-flex items-center gap-2">
    <!-- Icon -->
    <commonIcon
      v-if="showIcon"
      name="lucide:clock"
      :class="iconClass"
    />

    <!-- Countdown Display -->
    <div class="flex items-center gap-1">
      <!-- Days -->
      <div
        v-if="timeLeft.days > 0"
        class="flex items-center gap-1"
      >
        <span :class="numberClass">{{ timeLeft.days }}</span>
        <span :class="labelClass">{{ t('common.time.days') }}</span>
        <span :class="separatorClass">:</span>
      </div>

      <!-- Hours -->
      <div class="flex items-center gap-1">
        <span :class="numberClass">{{ padZero(timeLeft.hours) }}</span>
        <span :class="labelClass">{{ t('common.time.hours') }}</span>
        <span
          v-if="!compact"
          :class="separatorClass"
        >:</span>
      </div>

      <!-- Minutes -->
      <div
        v-if="!compact || timeLeft.days === 0"
        class="flex items-center gap-1"
      >
        <span :class="numberClass">{{ padZero(timeLeft.minutes) }}</span>
        <span :class="labelClass">{{ t('common.time.minutes') }}</span>
        <span
          v-if="showSeconds"
          :class="separatorClass"
        >:</span>
      </div>

      <!-- Seconds -->
      <div
        v-if="showSeconds && (compact ? timeLeft.hours === 0 : true)"
        class="flex items-center gap-1"
      >
        <span :class="numberClass">{{ padZero(timeLeft.seconds) }}</span>
        <span :class="labelClass">{{ t('common.time.seconds') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  endTime: Date | string | number // End timestamp
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showSeconds?: boolean
  compact?: boolean // Hide less significant units
  urgent?: boolean // Apply urgent styling when time is low
  urgentThreshold?: number // Minutes threshold for urgent state
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showIcon: true,
  showSeconds: true,
  compact: false,
  urgent: false,
  urgentThreshold: 60, // 1 hour
})

const emit = defineEmits<{
  (e: 'expired'): void
  (e: 'urgent'): void
}>()

const { t } = useI18n()

const timeLeft = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  total: 0,
})

const isUrgent = ref(false)
const hasExpired = ref(false)

// Calculate time remaining
const calculateTimeLeft = () => {
  const end = typeof props.endTime === 'string' || typeof props.endTime === 'number'
    ? new Date(props.endTime)
    : props.endTime

  const now = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) {
    timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
    if (!hasExpired.value) {
      hasExpired.value = true
      emit('expired')
    }
    return
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  timeLeft.value = { days, hours, minutes, seconds, total: diff }

  // Check for urgent state
  const totalMinutes = days * 24 * 60 + hours * 60 + minutes
  if (props.urgent && totalMinutes <= props.urgentThreshold && !isUrgent.value) {
    isUrgent.value = true
    emit('urgent')
  }
}

// Pad single digits with zero
const padZero = (num: number): string => {
  return num.toString().padStart(2, '0')
}

// Styling classes based on size and urgency
const iconClass = computed(() => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }
  const color = isUrgent.value ? 'text-red-500' : 'text-current'
  return `${sizes[props.size]} ${color}`
})

const numberClass = computed(() => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }
  const color = isUrgent.value
    ? 'text-red-600 dark:text-red-400'
    : 'text-gray-900 dark:text-white'
  return `font-bold tabular-nums ${sizes[props.size]} ${color}`
})

const labelClass = computed(() => {
  const sizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }
  return `text-gray-600 dark:text-gray-400 ${sizes[props.size]}`
})

const separatorClass = computed(() => {
  return 'text-gray-400 dark:text-gray-600 mx-0.5'
})

// Update every second
let intervalId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  calculateTimeLeft()
  intervalId = setInterval(calculateTimeLeft, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>
