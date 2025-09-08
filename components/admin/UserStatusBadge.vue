<!--
  User Status Badge Component
  
  Displays user status with appropriate styling and verification indicators
  Mobile-optimized with touch-friendly sizing
-->

<template>
  <div class="flex flex-col gap-1">
    <!-- Main Status Badge -->
    <span
      :class="[
        'inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full',
        statusClasses,
        sizeClasses
      ]"
    >
      <Icon
        v-if="statusIcon"
        :name="statusIcon"
        class="mr-1"
        :class="iconSizeClasses"
      />
      {{ statusText }}
    </span>
    
    <!-- Email Verification Badge -->
    <span
      v-if="!user.email_confirmed_at"
      :class="[
        'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
        sizeClasses
      ]"
    >
      <Icon
        name="heroicons:exclamation-triangle"
        class="mr-1"
        :class="iconSizeClasses"
      />
      {{ $t('admin.users.status.unverified') }}
    </span>
    
    <!-- Account Locked Badge -->
    <span
      v-if="user.locked_until && new Date(user.locked_until) > new Date()"
      :class="[
        'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
        sizeClasses
      ]"
    >
      <Icon
        name="heroicons:lock-closed"
        class="mr-1"
        :class="iconSizeClasses"
      />
      {{ $t('admin.users.status.locked') }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  user: {
    id: string
    email_confirmed_at?: string
    locked_until?: string
    last_sign_in_at?: string
    status?: 'active' | 'inactive' | 'suspended'
    created_at: string
  }
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const { t } = useI18n()

// Computed
const userStatus = computed(() => {
  // Determine user status based on various factors
  if (props.user.locked_until && new Date(props.user.locked_until) > new Date()) {
    return 'locked'
  }
  
  if (!props.user.email_confirmed_at) {
    return 'unverified'
  }
  
  if (props.user.status) {
    return props.user.status
  }
  
  // Determine based on activity
  const lastLogin = props.user.last_sign_in_at
  if (!lastLogin) {
    return 'inactive'
  }
  
  const daysSinceLogin = Math.floor(
    (Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24)
  )
  
  if (daysSinceLogin > 90) {
    return 'inactive'
  }
  
  return 'active'
})

const statusClasses = computed(() => {
  const classes = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    suspended: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    locked: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    unverified: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
  }
  return classes[userStatus.value] || classes.inactive
})

const statusText = computed(() => {
  return t(`admin.users.status.${userStatus.value}`)
})

const statusIcon = computed(() => {
  const icons = {
    active: 'heroicons:check-circle',
    inactive: 'heroicons:clock',
    suspended: 'heroicons:no-symbol',
    locked: 'heroicons:lock-closed',
    unverified: 'heroicons:exclamation-triangle'
  }
  return icons[userStatus.value]
})

const sizeClasses = computed(() => {
  return props.size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'
})

const iconSizeClasses = computed(() => {
  return props.size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'
})
</script>