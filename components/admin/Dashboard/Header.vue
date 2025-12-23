<template>
  <section class="rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div class="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-3">
        <div class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <span>Operations Control Center</span>
          <span class="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">
            {{ rangeLabel }}
          </span>
        </div>
        <div class="space-y-2">
          <h1 class="text-3xl font-semibold text-gray-900">
            {{ $t('admin.dashboard.title') }}
          </h1>
          <p class="text-base text-gray-500">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-4 lg:w-auto">
        <div class="flex flex-wrap items-center gap-3">
          <button
            v-for="option in rangeOptions"
            :key="option.value"
            type="button"
            :class="[
              'rounded-xl border px-4 py-2 text-sm font-medium transition-colors duration-200',
              selectedRange === option.value
                ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900',
            ]"
            @click="$emit('select-range', option.value)"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500">{{ $t('admin.dashboard.autoRefresh') }}</span>
            <button
              type="button"
              :class="[
                'relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300',
                autoRefreshEnabled
                  ? 'bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.18)] animate-pulse'
                  : 'bg-gray-200',
              ]"
              @click="$emit('toggle-auto-refresh')"
            >
              <span class="sr-only">Toggle auto refresh</span>
              <span
                :class="[
                  'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-all duration-300',
                  autoRefreshEnabled ? 'translate-x-7 shadow-[0_4px_10px_rgba(59,130,246,0.35)]' : 'translate-x-1',
                ]"
              ></span>
            </button>
          </div>

          <button
            type="button"
            :disabled="refreshing || isLoading"
            :class="[
              'flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium text-white transition-all duration-200',
              refreshing || isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700',
            ]"
            @click="$emit('refresh')"
          >
            <commonIcon
              name="lucide:refresh-ccw"
              :class="['h-4 w-4', refreshing || isLoading ? 'animate-spin text-white' : 'text-white']"
            />
            <span>{{ $t('admin.dashboard.refreshAll') }}</span>
          </button>
        </div>
      </div>
    </div>

    <footer class="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
      <div class="flex items-center gap-2">
        <commonIcon
          name="lucide:clock"
          class="h-4 w-4 text-blue-500"
        />
        <span>Last updated {{ timeSinceRefresh }}</span>
      </div>
      <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500">
        <span class="flex items-center gap-2">
          <span
            :class="[
              'h-2 w-2 rounded-full transition-colors',
              autoRefreshEnabled ? 'bg-green-500' : 'bg-gray-300',
            ]"
          ></span>
          {{ autoRefreshEnabled ? 'Auto-refresh active every 5 minutes' : 'Auto-refresh paused' }}
        </span>
        <span>{{ healthSummary }}</span>
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
interface RangeOption {
  label: string
  value: 'today' | '7d' | '30d'
}

interface Props {
  selectedRange: 'today' | '7d' | '30d'
  rangeOptions: RangeOption[]
  autoRefreshEnabled: boolean
  refreshing: boolean
  isLoading: boolean
  timeSinceRefresh: string
  subtitle: string
  healthSummary: string
}

const props = defineProps<Props>()

defineEmits<{
  'select-range': [value: 'today' | '7d' | '30d']
  'toggle-auto-refresh': []
  'refresh': []
}>()

const rangeLabel = computed(() => {
  const option = props.rangeOptions.find(opt => opt.value === props.selectedRange)
  return option ? option.label : 'Today'
})
</script>
