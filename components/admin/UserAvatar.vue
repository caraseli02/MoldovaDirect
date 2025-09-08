<!--
  User Avatar Component
  
  Displays user avatar with fallback to initials or default icon
  Supports different sizes and mobile optimizations
-->

<template>
  <div
    class="flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white font-medium"
    :class="sizeClasses"
  >
    <!-- User Image -->
    <img
      v-if="user.avatar_url"
      :src="user.avatar_url"
      :alt="displayName"
      class="w-full h-full rounded-full object-cover"
      @error="handleImageError"
    />
    <!-- Initials -->
    <span
      v-else-if="initials"
      class="select-none"
      :class="textSizeClasses"
    >
      {{ initials }}
    </span>
    <!-- Default Icon -->
    <Icon
      v-else
      name="heroicons:user"
      :class="iconSizeClasses"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  user: {
    id: string
    email: string
    avatar_url?: string
    profile?: {
      name?: string
    }
  }
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

// Computed
const displayName = computed(() => {
  return props.user.profile?.name || props.user.email?.split('@')[0] || 'User'
})

const initials = computed(() => {
  const name = displayName.value
  if (!name) return ''
  
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  return sizes[props.size]
})

const textSizeClasses = computed(() => {
  const sizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }
  return sizes[props.size]
})

const iconSizeClasses = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }
  return sizes[props.size]
})

// Methods
const handleImageError = (event: Event) => {
  // Hide the broken image and show fallback
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}
</script>