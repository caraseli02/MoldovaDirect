<!--
  User Table Empty State Component

  Mobile-responsive empty state for when no users are found
  Follows mobile patterns and includes appropriate actions
-->

<template>
  <div
    class="p-8 text-center"
    :class="{
      'py-12': isMobile,
    }"
  >
    <!-- Empty State Icon -->
    <div class="mb-4">
      <commonIcon
        :name="emptyStateIcon"
        :class="iconSizeClasses"
        class="text-gray-400 dark:text-gray-500 mx-auto"
      />
    </div>

    <!-- Title -->
    <h3
      class="font-medium text-gray-900 dark:text-gray-100 mb-2"
      :class="titleSizeClasses"
    >
      {{ emptyStateTitle }}
    </h3>

    <!-- Description -->
    <p
      class="text-gray-500 dark:text-gray-400 mb-6"
      :class="descriptionSizeClasses"
    >
      {{ emptyStateDescription }}
    </p>

    <!-- Action Buttons -->
    <div
      v-if="showActions"
      class="space-y-3"
    >
      <!-- Primary Action -->
      <button
        v-if="hasActiveFilters"
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors touch-manipulation active:scale-95"
        :class="{
          'min-h-[44px] px-6': isMobile,
        }"
        type="button"
        @click="clearFilters"
        @touchstart="isMobile && vibrate('tap')"
      >
        <commonIcon
          name="lucide:filter"
          class="w-4 h-4 mr-2"
        />
        {{ $t('admin.users.actions.clearFilters') }}
      </button>

      <!-- Secondary Actions -->
      <div
        class="flex flex-col sm:flex-row gap-3 justify-center items-center"
        :class="{
          'space-y-2 sm:space-y-0': isMobile,
        }"
      >
        <!-- Refresh Button -->
        <button
          class="inline-flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors touch-manipulation active:scale-95"
          :class="{
            'min-h-[44px] w-full sm:w-auto': isMobile,
          }"
          type="button"
          @click="refreshUsers"
          @touchstart="isMobile && vibrate('tap')"
        >
          <commonIcon
            name="lucide:refresh-ccw"
            class="w-4 h-4 mr-2"
          />
          {{ $t('admin.users.actions.refresh') }}
        </button>

        <!-- Invite User Button (if no users at all) -->
        <button
          v-if="!hasActiveFilters && totalUsers === 0"
          class="inline-flex items-center px-3 py-2 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors touch-manipulation active:scale-95"
          :class="{
            'min-h-[44px] w-full sm:w-auto': isMobile,
          }"
          type="button"
          @click="inviteUser"
          @touchstart="isMobile && vibrate('tap')"
        >
          <commonIcon
            name="lucide:user-plus"
            class="w-4 h-4 mr-2"
          />
          {{ $t('admin.users.actions.invite') }}
        </button>
      </div>
    </div>

    <!-- Help Text -->
    <div
      v-if="showHelpText"
      class="mt-6 text-sm text-gray-400 dark:text-gray-500"
      :class="{
        'mt-8': isMobile,
      }"
    >
      <div class="mb-2">
        {{ $t('admin.users.empty.helpTitle') }}
      </div>
      <ul class="text-left max-w-md mx-auto space-y-1">
        <li class="flex items-center">
          <commonIcon
            name="lucide:check"
            class="w-3 h-3 mr-2 text-green-500"
          />
          {{ $t('admin.users.empty.helpTip1') }}
        </li>
        <li class="flex items-center">
          <commonIcon
            name="lucide:check"
            class="w-3 h-3 mr-2 text-green-500"
          />
          {{ $t('admin.users.empty.helpTip2') }}
        </li>
        <li class="flex items-center">
          <commonIcon
            name="lucide:check"
            class="w-3 h-3 mr-2 text-green-500"
          />
          {{ $t('admin.users.empty.helpTip3') }}
        </li>
      </ul>
    </div>

    <!-- Mobile Swipe Hint -->
    <div
      v-if="isMobile && hasActiveFilters"
      class="mt-6 flex items-center justify-center text-xs text-gray-400 dark:text-gray-500"
    >
      <commonIcon
        name="lucide:hand"
        class="w-4 h-4 mr-1"
      />
      {{ $t('admin.users.empty.swipeHint') }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hasActiveFilters?: boolean
  totalUsers?: number
  searchQuery?: string
  statusFilter?: string
  showActions?: boolean
  showHelpText?: boolean
}

interface Emits {
  (e: 'clearFilters'): void
  (e: 'refresh'): void
  (e: 'inviteUser'): void
}

const props = withDefaults(defineProps<Props>(), {
  hasActiveFilters: false,
  totalUsers: 0,
  searchQuery: '',
  statusFilter: '',
  showActions: true,
  showHelpText: false,
})

const emit = defineEmits<Emits>()

// Composables
const { isMobile } = useDevice()
const { vibrate } = useHapticFeedback()
const { t } = useI18n()

// Computed
const emptyStateIcon = computed(() => {
  if (props.hasActiveFilters) {
    return 'lucide:search'
  }
  return 'lucide:users'
})

const emptyStateTitle = computed(() => {
  if (props.hasActiveFilters) {
    return t('admin.users.empty.noResults')
  }

  if (props.totalUsers === 0) {
    return t('admin.users.empty.noUsers')
  }

  return t('admin.users.empty.noData')
})

const emptyStateDescription = computed(() => {
  if (props.hasActiveFilters) {
    if (props.searchQuery) {
      return t('admin.users.empty.noResultsForQuery', { query: props.searchQuery })
    }
    return t('admin.users.empty.tryDifferentFilters')
  }

  if (props.totalUsers === 0) {
    return t('admin.users.empty.noUsersDescription')
  }

  return t('admin.users.empty.checkConnection')
})

const iconSizeClasses = computed(() => {
  return isMobile.value ? 'w-16 h-16' : 'w-12 h-12'
})

const titleSizeClasses = computed(() => {
  return isMobile.value ? 'text-xl' : 'text-lg'
})

const descriptionSizeClasses = computed(() => {
  return isMobile.value ? 'text-base' : 'text-sm'
})

// Methods
const clearFilters = () => {
  emit('clearFilters')

  if (isMobile.value) {
    vibrate('success')
  }
}

const refreshUsers = () => {
  emit('refresh')

  if (isMobile.value) {
    vibrate('medium')
  }
}

const inviteUser = () => {
  emit('inviteUser')

  if (isMobile.value) {
    vibrate('success')
  }
}
</script>

<style scoped>
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.active\:scale-95:active {
  transform: scale(0.95);
}

/* Enhanced focus states for accessibility */
button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  border-radius: 0.5rem;
}

/* Smooth animations */
.transition-colors {
  transition-property: background-color, border-color, color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>
