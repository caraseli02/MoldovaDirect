<template>
  <div v-if="password" class="mt-2 space-y-2" data-testid="password-strength-meter">
    <!-- Strength bar -->
    <div class="flex space-x-1">
      <div
        v-for="i in 4"
        :key="i"
        class="h-1 flex-1 rounded-full transition-colors duration-300"
        :class="getBarColor(i)"
      />
    </div>
    
    <!-- Strength label and requirements -->
    <div class="flex items-center justify-between text-xs">
      <span :class="getLabelColor()">
        {{ strengthLabel }}
      </span>
      <span class="text-gray-500 dark:text-gray-400">
        {{ $t('auth.passwordHint') }}
      </span>
    </div>
    
    <!-- Requirements checklist -->
    <div v-if="showRequirements" class="space-y-1">
      <div class="flex items-center space-x-2 text-xs">
        <CheckIcon :passed="requirements.length" />
        <span :class="requirements.length ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">
          {{ $t('auth.validation.password.minLength') }}
        </span>
      </div>
      
      <div class="flex items-center space-x-2 text-xs">
        <CheckIcon :passed="requirements.uppercase" />
        <span :class="requirements.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">
          {{ $t('auth.validation.password.uppercase') }}
        </span>
      </div>
      
      <div class="flex items-center space-x-2 text-xs">
        <CheckIcon :passed="requirements.lowercase" />
        <span :class="requirements.lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">
          {{ $t('auth.validation.password.lowercase') }}
        </span>
      </div>
      
      <div class="flex items-center space-x-2 text-xs">
        <CheckIcon :passed="requirements.number" />
        <span :class="requirements.number ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">
          {{ $t('auth.validation.password.number') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  password: string
  showRequirements?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showRequirements: true
})

const { t } = useI18n()
const { calculatePasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } = useAuthValidation()

/**
 * Calculate password strength (0-4)
 */
const strength = computed(() => calculatePasswordStrength(props.password))

/**
 * Get translated strength label
 */
const strengthLabel = computed(() => {
  const strengthLabels = [
    'Very Weak',
    'Weak',
    'Fair', 
    'Good',
    'Strong'
  ]
  return strengthLabels[strength.value] || strengthLabels[0]
})

/**
 * Check individual password requirements
 */
const requirements = computed(() => ({
  length: props.password.length >= 8,
  uppercase: /[A-Z]/.test(props.password),
  lowercase: /[a-z]/.test(props.password),
  number: /[0-9]/.test(props.password)
}))

/**
 * Get color class for strength bars
 */
const getBarColor = (index: number): string => {
  if (index <= strength.value) {
    switch (strength.value) {
      case 0:
      case 1:
        return 'bg-red-500'
      case 2:
        return 'bg-yellow-500'
      case 3:
        return 'bg-blue-500'
      case 4:
        return 'bg-green-500'
      default:
        return 'bg-gray-200 dark:bg-gray-600'
    }
  }
  return 'bg-gray-200 dark:bg-gray-600'
}

/**
 * Get color class for strength label
 */
const getLabelColor = (): string => {
  switch (strength.value) {
    case 0:
    case 1:
      return 'text-red-600 dark:text-red-400'
    case 2:
      return 'text-yellow-600 dark:text-yellow-400'
    case 3:
      return 'text-blue-600 dark:text-blue-400'
    case 4:
      return 'text-green-600 dark:text-green-400'
    default:
      return 'text-gray-500 dark:text-gray-400'
  }
}

/**
 * Check icon component for requirements
 */
const CheckIcon = defineComponent({
  props: {
    passed: {
      type: Boolean,
      required: true
    }
  },
  template: `
    <svg class="w-3 h-3" :class="passed ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'" fill="currentColor" viewBox="0 0 20 20">
      <path v-if="passed" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
      <circle v-else cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none"/>
    </svg>
  `
})
</script>