<template>
  <div class="w-full max-w-md mx-auto mb-6" role="progressbar" :aria-valuenow="currentStep" :aria-valuemin="1" :aria-valuemax="totalSteps" :aria-label="progressLabel">
    <!-- Progress bar -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex-1 flex items-center">
        <div 
          v-for="step in totalSteps" 
          :key="step"
          class="flex items-center"
          :class="{ 'flex-1': step < totalSteps }"
        >
          <!-- Step circle -->
          <div 
            class="flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300"
            :class="getStepClasses(step)"
            :aria-label="getStepLabel(step)"
          >
            <svg 
              v-if="step < currentStep" 
              class="w-4 h-4 text-white" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            <span 
              v-else 
              class="text-sm font-semibold"
              :class="step === currentStep ? 'text-white' : 'text-gray-500 dark:text-gray-400'"
            >
              {{ step }}
            </span>
          </div>
          
          <!-- Connector line -->
          <div 
            v-if="step < totalSteps"
            class="flex-1 h-0.5 mx-2 transition-all duration-300"
            :class="step < currentStep ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'"
          />
        </div>
      </div>
    </div>
    
    <!-- Step labels -->
    <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400">
      <span 
        v-for="(label, index) in stepLabels" 
        :key="index"
        class="text-center flex-1"
        :class="{ 
          'text-primary-600 dark:text-primary-400 font-medium': index + 1 === currentStep,
          'text-green-600 dark:text-green-400': index + 1 < currentStep
        }"
      >
        {{ label }}
      </span>
    </div>
    
    <!-- Screen reader progress announcement -->
    <div class="sr-only" aria-live="polite" aria-atomic="true">
      {{ progressAnnouncement }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentStep: number
  totalSteps: number
  stepLabels: string[]
  context?: 'register' | 'reset' | 'verify' | 'general'
}

const props = withDefaults(defineProps<Props>(), {
  context: 'general'
})

const { t } = useI18n()

/**
 * Get CSS classes for step indicator
 */
const getStepClasses = (step: number): string => {
  if (step < props.currentStep) {
    // Completed step
    return 'bg-primary-600 border-primary-600'
  } else if (step === props.currentStep) {
    // Current step
    return 'bg-primary-600 border-primary-600'
  } else {
    // Future step
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
  }
}

/**
 * Get accessible label for step
 */
const getStepLabel = (step: number): string => {
  const status = step < props.currentStep 
    ? t('auth.progress.completed')
    : step === props.currentStep 
      ? t('auth.progress.current')
      : t('auth.progress.upcoming')
  
  return `${t('auth.progress.step')} ${step} ${t('common.of')} ${props.totalSteps}: ${props.stepLabels[step - 1]} - ${status}`
}

/**
 * Overall progress label for screen readers
 */
const progressLabel = computed(() => {
  return t('auth.progress.label', { 
    current: props.currentStep, 
    total: props.totalSteps,
    context: props.context 
  })
})

/**
 * Progress announcement for screen readers
 */
const progressAnnouncement = computed(() => {
  return t('auth.progress.announcement', {
    step: props.currentStep,
    total: props.totalSteps,
    stepName: props.stepLabels[props.currentStep - 1]
  })
})

/**
 * Calculate progress percentage
 */
const progressPercentage = computed(() => {
  return Math.round((props.currentStep / props.totalSteps) * 100)
})

// Watch for step changes and announce them
watch(() => props.currentStep, (newStep, oldStep) => {
  if (newStep !== oldStep) {
    // Announce step change to screen readers
    nextTick(() => {
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'assertive')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.textContent = t('auth.progress.stepChanged', {
        step: newStep,
        stepName: props.stepLabels[newStep - 1]
      })
      document.body.appendChild(announcement)
      
      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 2000)
    })
  }
})
</script>

</content>