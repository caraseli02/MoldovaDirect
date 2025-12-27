<template>
  <div
    class="flex items-center gap-2 overflow-x-auto pb-2"
    role="group"
    :aria-label="$t('orders.filters.quickFilters')"
  >
    <!-- In Transit Filter -->
    <button
      :class="[
        'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        activeFilter === 'in-transit'
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
      ]"
      :aria-pressed="activeFilter === 'in-transit'"
      @click="handleFilterClick('in-transit')"
    >
      <span class="flex items-center">
        <svg
          class="w-4 h-4 mr-1.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        {{ $t('orders.filters.inTransit') }}
        <span
          v-if="safeCounts.inTransit > 0"
          class="ml-1.5 px-2 py-0.5 text-xs rounded-full"
          :class="activeFilter === 'in-transit' ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'"
        >
          {{ safeCounts.inTransit }}
        </span>
      </span>
    </button>

    <!-- Delivered This Month Filter -->
    <button
      :class="[
        'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
        activeFilter === 'delivered-month'
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
      ]"
      :aria-pressed="activeFilter === 'delivered-month'"
      @click="handleFilterClick('delivered-month')"
    >
      <span class="flex items-center">
        <svg
          class="w-4 h-4 mr-1.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {{ $t('orders.filters.deliveredThisMonth') }}
        <span
          v-if="safeCounts.deliveredMonth > 0"
          class="ml-1.5 px-2 py-0.5 text-xs rounded-full"
          :class="activeFilter === 'delivered-month' ? 'bg-green-500 text-white' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'"
        >
          {{ safeCounts.deliveredMonth }}
        </span>
      </span>
    </button>

    <!-- Last 3 Months Filter -->
    <button
      :class="[
        'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
        activeFilter === 'last-3-months'
          ? 'bg-purple-600 text-white hover:bg-purple-700'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
      ]"
      :aria-pressed="activeFilter === 'last-3-months'"
      @click="handleFilterClick('last-3-months')"
    >
      <span class="flex items-center">
        <svg
          class="w-4 h-4 mr-1.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {{ $t('orders.filters.last3Months') }}
      </span>
    </button>

    <!-- All Orders Filter (Clear) -->
    <button
      :class="[
        'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
        activeFilter === null
          ? 'bg-gray-600 dark:bg-gray-500 text-white hover:bg-gray-700 dark:hover:bg-gray-600'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
      ]"
      :aria-pressed="activeFilter === null"
      @click="handleFilterClick(null)"
    >
      <span class="flex items-center">
        <svg
          class="w-4 h-4 mr-1.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        {{ $t('orders.filters.allOrders') }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
type FilterType = 'in-transit' | 'delivered-month' | 'last-3-months' | null

interface FilterCounts {
  inTransit: number
  deliveredMonth: number
}

interface Props {
  counts?: FilterCounts
  modelValue?: FilterType
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  counts: () => ({ inTransit: 0, deliveredMonth: 0 }),
})

const emit = defineEmits<{
  'update:modelValue': [filter: FilterType]
  'filter': [filter: FilterType]
}>()

const activeFilter = ref<FilterType>(props.modelValue)

// Safe counts with defaults
const safeCounts = computed(() => ({
  inTransit: props.counts?.inTransit || 0,
  deliveredMonth: props.counts?.deliveredMonth || 0,
}))

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  activeFilter.value = newValue
})

// Handle filter click
const handleFilterClick = (filter: FilterType) => {
  activeFilter.value = filter
  emit('update:modelValue', filter)
  emit('filter', filter)
}
</script>
