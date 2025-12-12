<!--
  Admin User Table Row Component

  Mobile-responsive user row component with touch optimizations
  Follows mobile patterns from ProductCard.vue and mobile components

  Features:
  - Mobile-responsive layout that stacks on small screens
  - Touch-friendly action buttons
  - Haptic feedback for mobile interactions
  - Optimized for both desktop table and mobile card layout
-->

<template>
  <!-- Desktop Table Row -->
  <tr
    v-if="!isMobile"
    class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    @click="handleRowClick"
  >
    <!-- User Info -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <UserAvatar
          :user="user"
          size="md"
          class="flex-shrink-0"
        />
        <div class="ml-4">
          <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ displayName }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            ID: {{ user.id.slice(0, 8) }}...
          </div>
        </div>
      </div>
    </td>

    <!-- Email -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="text-sm text-gray-900 dark:text-gray-100">
        {{ user.email }}
      </div>
      <div
        v-if="user.profile?.phone"
        class="text-sm text-gray-500 dark:text-gray-400"
      >
        {{ user.profile.phone }}
      </div>
    </td>

    <!-- Status -->
    <td class="px-6 py-4 whitespace-nowrap">
      <UserStatusBadge :user="user" />
    </td>

    <!-- Orders -->
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
      <div class="font-medium">
        {{ user.orderCount || 0 }}
      </div>
      <div class="text-gray-500 dark:text-gray-400">
        {{ formattedLastOrder }}
      </div>
    </td>

    <!-- Total Spent -->
    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
      {{ formattedTotalSpent }}
    </td>

    <!-- Registration Date -->
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
      {{ formattedRegistration }}
    </td>

    <!-- Last Login -->
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
      {{ formattedLastLogin }}
    </td>

    <!-- Actions -->
    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <UserRowActions
        :user="user"
        @view="handleView"
        @edit="handleEdit"
        @action="handleUserAction"
      />
    </td>
  </tr>

  <!-- Mobile Card Layout -->
  <div
    v-else
    ref="cardRef"
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 transition-all duration-200 touch-manipulation"
    :class="{
      'active:scale-98 active:bg-gray-50 dark:active:bg-gray-750': !isActionInProgress,
      'shadow-md': isSelected,
    }"
    @touchstart="handleTouchStart"
    @click="handleRowClick"
  >
    <!-- Mobile Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center space-x-3 flex-1 min-w-0">
        <UserAvatar
          :user="user"
          size="lg"
          class="flex-shrink-0"
        />
        <div class="flex-1 min-w-0">
          <div class="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
            {{ displayName }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400 truncate">
            {{ user.email }}
          </div>
          <div class="flex items-center gap-2 mt-1">
            <UserStatusBadge
              :user="user"
              size="sm"
            />
          </div>
        </div>
      </div>

      <!-- Mobile Quick Actions -->
      <div class="flex items-center space-x-2 ml-2">
        <UiButton
          variant="ghost"
          size="icon"
          class="h-9 w-9 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 touch-manipulation active:scale-90"
          :aria-label="$t('admin.users.actions.view')"
          @click.stop="handleView"
          @touchstart="vibrate('tap')"
        >
          <commonIcon
            name="lucide:eye"
            class="h-5 w-5"
          />
        </UiButton>
        <UiButton
          variant="ghost"
          size="icon"
          class="h-9 w-9 touch-manipulation active:scale-90"
          :aria-label="$t('admin.users.actions.edit')"
          @click.stop="handleEdit"
          @touchstart="vibrate('tap')"
        >
          <commonIcon
            name="lucide:pencil"
            class="h-5 w-5"
          />
        </UiButton>
        <AdminUsersActionsDropdown
          :user="user"
          mobile
          @action="handleUserAction"
        />
      </div>
    </div>

    <!-- Mobile Stats Grid -->
    <div class="grid grid-cols-2 gap-4 mb-3">
      <div class="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div class="text-lg font-bold text-blue-600 dark:text-blue-400">
          {{ user.orderCount || 0 }}
        </div>
        <div class="text-xs text-blue-800 dark:text-blue-300 uppercase tracking-wide">
          {{ $t('admin.users.orders') }}
        </div>
      </div>
      <div class="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div class="text-lg font-bold text-green-600 dark:text-green-400">
          {{ formattedTotalSpent }}
        </div>
        <div class="text-xs text-green-800 dark:text-green-300 uppercase tracking-wide">
          {{ $t('admin.users.totalSpent') }}
        </div>
      </div>
    </div>

    <!-- Mobile Details -->
    <div class="space-y-2 text-sm">
      <div
        v-if="user.profile?.phone"
        class="flex items-center text-gray-600 dark:text-gray-400"
      >
        <commonIcon
          name="lucide:phone"
          class="w-4 h-4 mr-2"
        />
        {{ user.profile.phone }}
      </div>
      <div class="flex items-center justify-between text-gray-500 dark:text-gray-400">
        <span class="flex items-center">
          <commonIcon
            name="lucide:calendar-days"
            class="w-4 h-4 mr-2"
          />
          {{ $t('admin.users.registered') }}: {{ formattedRegistration }}
        </span>
      </div>
      <div
        v-if="formattedLastLogin !== 'Never'"
        class="flex items-center text-gray-500 dark:text-gray-400"
      >
        <commonIcon
          name="lucide:clock"
          class="w-4 h-4 mr-2"
        />
        {{ $t('admin.users.lastLogin') }}: {{ formattedLastLogin }}
      </div>
      <div
        v-if="formattedLastOrder"
        class="flex items-center text-gray-500 dark:text-gray-400"
      >
        <commonIcon
          name="lucide:shopping-bag"
          class="w-4 h-4 mr-2"
        />
        {{ $t('admin.users.lastOrder') }}: {{ formattedLastOrder }}
      </div>
    </div>

    <!-- Mobile Expand Indicator -->
    <div
      v-if="hasExpandableContent"
      class="flex justify-center mt-3 pt-2 border-t border-gray-200 dark:border-gray-700"
    >
      <commonIcon
        name="lucide:chevron-down"
        class="w-4 h-4 text-gray-400 transition-transform"
        :class="{ 'rotate-180': isExpanded }"
      />
    </div>

    <!-- Expanded Content -->
    <div
      v-if="isExpanded && hasExpandableContent"
      class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm text-gray-600 dark:text-gray-400"
    >
      <div><strong>ID:</strong> {{ user.id }}</div>
      <div v-if="user.profile?.preferred_language">
        <strong>{{ $t('admin.users.language') }}:</strong>
        {{ user.profile.preferred_language.toUpperCase() }}
      </div>
      <div v-if="user.statistics?.averageOrderValue">
        <strong>{{ $t('admin.users.avgOrderValue') }}:</strong>
        {{ formatCurrency(user.statistics.averageOrderValue) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  user: {
    id: string
    email: string
    email_confirmed_at?: string | null
    profile?: { name: string, phone?: string } | null
    status: string
    user_metadata?: {
      suspended?: boolean
      banned?: boolean
      role?: string
    }
  }
  isSelected?: boolean
}

interface Emits {
  (e: 'view', userId: string): void
  (e: 'edit', userId: string): void
  (e: 'action', action: string, userId: string, data?: Record<string, any>): void
  (e: 'select', userId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
})

const emit = defineEmits<Emits>()

// Composables
const { isMobile } = useDevice()
const { vibrate } = useHapticFeedback()
const { t: _t } = useI18n()

// Template refs
const cardRef = ref<HTMLElement>()

// State
const isExpanded = ref(false)
const isActionInProgress = ref(false)

// Computed
const displayName = computed(() => {
  return props.user.profile?.name || props.user.email?.split('@')[0] || 'Unknown User'
})

const formattedTotalSpent = computed(() => {
  return formatCurrency(props.user.statistics?.totalSpent || 0)
})

// Native date formatter for better performance
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
})

const formattedRegistration = computed(() => {
  if (!props.user.created_at) return 'Unknown'
  return dateFormatter.format(new Date(props.user.created_at))
})

const formattedLastLogin = computed(() => {
  if (!props.user.last_sign_in_at) return 'Never'
  return dateFormatter.format(new Date(props.user.last_sign_in_at))
})

const formattedLastOrder = computed(() => {
  if (!props.user.statistics?.lastOrderDate) return ''
  return dateFormatter.format(new Date(props.user.statistics.lastOrderDate))
})

const hasExpandableContent = computed(() => {
  return isMobile.value && (
    props.user.profile?.preferred_language
    || props.user.statistics?.averageOrderValue
  )
})

// Methods
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

const handleTouchStart = (_event: TouchEvent) => {
  if (isMobile.value) {
    vibrate('tap')
  }
}

const handleRowClick = (event: Event) => {
  // Don't trigger if clicking on action buttons
  if ((event.target as HTMLElement).closest('button, a')) {
    return
  }

  if (isMobile.value) {
    if (hasExpandableContent.value) {
      isExpanded.value = !isExpanded.value
      vibrate(isExpanded.value ? 'light' : 'tap')
    }
    else {
      handleView()
    }
  }
  else {
    emit('select', props.user.id)
  }
}

const handleView = () => {
  isActionInProgress.value = true
  emit('view', props.user.id)

  if (isMobile.value) {
    vibrate('success')
  }

  // Reset after animation
  setTimeout(() => {
    isActionInProgress.value = false
  }, 200)
}

const handleEdit = () => {
  isActionInProgress.value = true
  emit('edit', props.user.id)

  if (isMobile.value) {
    vibrate('medium')
  }

  setTimeout(() => {
    isActionInProgress.value = false
  }, 200)
}

const handleUserAction = (action: string, userId: string, data?: Record<string, any>) => {
  emit('action', action, userId, data)

  if (isMobile.value) {
    vibrate('light')
  }
}

// Touch optimization for mobile
onMounted(() => {
  if (isMobile.value && cardRef.value) {
    // Optimize touch events for better performance
    cardRef.value.style.touchAction = 'manipulation'
    // Use type assertion for webkit-specific property
    ;(cardRef.value.style as any).webkitTapHighlightColor = 'transparent'
  }
})
</script>

<style scoped>
/* Mobile-specific optimizations */
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.active\:scale-98:active {
  transform: scale(0.98);
}

/* Smooth transitions for mobile interactions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Enhanced focus states for accessibility */
button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  border-radius: 0.375rem;
}

/* Card hover effect on desktop */
@media (min-width: 1024px) {
  .bg-white:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
}

/* Prevent text selection on mobile during touch interactions */
@media (max-width: 640px) {
  .touch-manipulation {
    -webkit-user-select: none;
    user-select: none;
  }

  .touch-manipulation * {
    -webkit-user-select: none;
    user-select: none;
  }
}
</style>
