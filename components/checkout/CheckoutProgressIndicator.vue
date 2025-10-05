<template>
  <div class="checkout-progress">
    <!-- Desktop Progress Indicator -->
    <div class="hidden md:block">
      <nav aria-label="Progress">
        <ol class="flex items-center justify-center space-x-8">
          <li 
            v-for="(step, index) in steps" 
            :key="step.id"
            class="flex items-center"
          >
            <!-- Step Circle -->
            <div class="flex items-center">
              <div 
                class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200"
                :class="getStepClasses(step.id, index)"
              >
                <!-- Completed Step -->
                <svg 
                  v-if="isStepCompleted(step.id)"
                  class="w-5 h-5 text-white" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fill-rule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clip-rule="evenodd" 
                  />
                </svg>
                
                <!-- Current or Future Step -->
                <span 
                  v-else
                  class="text-sm font-medium"
                  :class="isCurrentStep(step.id) ? 'text-white' : 'text-gray-500 dark:text-gray-400'"
                >
                  {{ index + 1 }}
                </span>
              </div>
              
              <!-- Step Label -->
              <div class="ml-4 min-w-0">
                <p 
                  class="text-sm font-medium transition-colors duration-200"
                  :class="getStepTextClasses(step.id)"
                >
                  {{ $t(`checkout.steps.${step.id}.name`) || step.name }}
                </p>
                <p 
                  class="text-xs transition-colors duration-200"
                  :class="isCurrentStep(step.id) || isStepCompleted(step.id) 
                    ? 'text-gray-600 dark:text-gray-300' 
                    : 'text-gray-400 dark:text-gray-500'"
                >
                  {{ $t(`checkout.steps.${step.id}.description`) || step.description }}
                </p>
              </div>
            </div>
            
            <!-- Connector Line -->
            <div 
              v-if="index < steps.length - 1"
              class="hidden lg:block w-16 h-0.5 ml-8 transition-colors duration-200"
              :class="isStepCompleted(step.id) 
                ? 'bg-primary-600 dark:bg-primary-500' 
                : 'bg-gray-200 dark:bg-gray-700'"
            />
          </li>
        </ol>
      </nav>
    </div>

    <!-- Mobile Progress Indicator -->
    <div class="md:hidden">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t(`checkout.steps.${currentStep}.name`) || getCurrentStepName() }}
        </h2>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ currentStepIndex + 1 }} {{ $t('common.of') }} {{ steps.length }}
        </span>
      </div>
      
      <!-- Progress Bar -->
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          class="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out"
          :style="{ width: `${progressPercentage}%` }"
        />
      </div>
      
      <!-- Step Description -->
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {{ $t(`checkout.steps.${currentStep}.description`) || getCurrentStepDescription() }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckoutStep } from '~/stores/checkout'

interface CheckoutStepInfo {
  id: CheckoutStep
  name: string
  description: string
}

interface Props {
  currentStep: CheckoutStep
  steps: CheckoutStepInfo[]
}

const props = defineProps<Props>()

// Computed properties
const currentStepIndex = computed(() => {
  return props.steps.findIndex(step => step.id === props.currentStep)
})

const progressPercentage = computed(() => {
  return ((currentStepIndex.value + 1) / props.steps.length) * 100
})

// Helper functions
const isCurrentStep = (stepId: CheckoutStep): boolean => {
  return props.currentStep === stepId
}

const isStepCompleted = (stepId: CheckoutStep): boolean => {
  const stepIndex = props.steps.findIndex(step => step.id === stepId)
  return stepIndex < currentStepIndex.value
}

const getStepClasses = (stepId: CheckoutStep, index: number): string => {
  if (isStepCompleted(stepId)) {
    return 'bg-primary-600 dark:bg-primary-500 border-primary-600 dark:border-primary-500'
  } else if (isCurrentStep(stepId)) {
    return 'bg-primary-600 dark:bg-primary-500 border-primary-600 dark:border-primary-500'
  } else {
    return 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
  }
}

const getStepTextClasses = (stepId: CheckoutStep): string => {
  if (isCurrentStep(stepId) || isStepCompleted(stepId)) {
    return 'text-gray-900 dark:text-white'
  } else {
    return 'text-gray-500 dark:text-gray-400'
  }
}

const getCurrentStepName = (): string => {
  const currentStepInfo = props.steps.find(step => step.id === props.currentStep)
  return currentStepInfo?.name || 'Step'
}

const getCurrentStepDescription = (): string => {
  const currentStepInfo = props.steps.find(step => step.id === props.currentStep)
  return currentStepInfo?.description || ''
}
</script>

<style scoped>
.checkout-progress {
  width: 100%;
}

/* Smooth transitions for progress changes */
.checkout-progress * {
  transition-property: background-color, border-color, color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Ensure proper spacing on smaller screens */
@media (max-width: 640px) {
  .checkout-progress {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style>