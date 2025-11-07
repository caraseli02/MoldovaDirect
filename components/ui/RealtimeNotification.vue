<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="visible && currentNotification"
        :class="[
          'fixed z-50 shadow-2xl',
          position === 'bottom-left' ? 'bottom-6 left-6' : '',
          position === 'bottom-right' ? 'bottom-6 right-6' : '',
          position === 'top-left' ? 'left-6 top-6' : '',
          position === 'top-right' ? 'right-6 top-6' : ''
        ]"
      >
        <div class="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900 max-w-sm">
          <!-- Product Image -->
          <NuxtImg
            v-if="currentNotification.image"
            :src="currentNotification.image"
            :alt="currentNotification.product"
            width="60"
            height="60"
            class="h-15 w-15 rounded-lg object-cover"
          />

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <!-- Header -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ currentNotification.customer }}
                </p>
                <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {{ currentNotification.location }}
                </p>
              </div>
              <button
                @click="visible = false"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Close notification"
              >
                <commonIcon name="lucide:x" class="h-4 w-4" />
              </button>
            </div>

            <!-- Purchase info -->
            <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {{ t('home.realtimeNotification.purchased') }}
              <span class="font-medium">{{ currentNotification.product }}</span>
            </p>

            <!-- Time -->
            <p class="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <commonIcon name="lucide:clock" class="h-3 w-3" />
              {{ currentNotification.timeAgo }}
            </p>

            <!-- Verification badge (optional) -->
            <div v-if="showVerified" class="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <commonIcon name="lucide:check-circle" class="h-3 w-3" />
              {{ t('home.realtimeNotification.verified') }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Notification {
  customer: string
  location: string
  product: string
  timeAgo: string
  image?: string
}

interface Props {
  notifications?: Notification[]
  interval?: number // Time between notifications in ms
  displayDuration?: number // How long each notification stays visible
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  showVerified?: boolean
  autoStart?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  interval: 15000, // Show new notification every 15 seconds
  displayDuration: 5000, // Show for 5 seconds
  position: 'bottom-left',
  showVerified: true,
  autoStart: true,
  // Mock notifications
  notifications: () => [
    {
      customer: 'María from Barcelona',
      location: 'Barcelona, Spain',
      product: 'Purcari Negru de Purcari 2019',
      timeAgo: '2 minutes ago',
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=100'
    },
    {
      customer: 'Carlos from Madrid',
      location: 'Madrid, Spain',
      product: 'Artisan Gift Hamper',
      timeAgo: '5 minutes ago',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100'
    },
    {
      customer: 'Sofia from Valencia',
      location: 'Valencia, Spain',
      product: 'Cricova Sparkling Wine',
      timeAgo: '8 minutes ago',
      image: 'https://images.unsplash.com/photo-1566754436750-9393f43f02b3?w=100'
    },
    {
      customer: 'Juan from Sevilla',
      location: 'Sevilla, Spain',
      product: 'Moldovan Cheese Selection',
      timeAgo: '12 minutes ago',
      image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=100'
    },
    {
      customer: 'Ana from Bilbao',
      location: 'Bilbao, Spain',
      product: 'Monthly Wine Subscription',
      timeAgo: '15 minutes ago',
      image: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=100'
    }
  ]
})

const { t } = useI18n()

const visible = ref(false)
const currentIndex = ref(0)
const intervalId = ref<ReturnType<typeof setInterval> | null>(null)
const timeoutId = ref<ReturnType<typeof setTimeout> | null>(null)

const currentNotification = computed(() => {
  if (!props.notifications || props.notifications.length === 0) return null
  return props.notifications[currentIndex.value]
})

const showNextNotification = () => {
  // Hide current
  visible.value = false

  // Wait a bit, then show next
  setTimeout(() => {
    currentIndex.value = (currentIndex.value + 1) % props.notifications.length
    visible.value = true

    // Auto-hide after displayDuration
    if (timeoutId.value) clearTimeout(timeoutId.value)
    timeoutId.value = setTimeout(() => {
      visible.value = false
    }, props.displayDuration)
  }, 500)
}

const startCycle = () => {
  // Show first notification after a delay
  setTimeout(() => {
    visible.value = true

    // Auto-hide after displayDuration
    timeoutId.value = setTimeout(() => {
      visible.value = false
    }, props.displayDuration)
  }, 3000) // Wait 3 seconds after page load

  // Start interval for subsequent notifications
  intervalId.value = setInterval(showNextNotification, props.interval)
}

const stopCycle = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
    timeoutId.value = null
  }
}

onMounted(() => {
  if (props.autoStart) {
    startCycle()
  }
})

onUnmounted(() => {
  stopCycle()
})

defineExpose({
  startCycle,
  stopCycle
})
</script>
