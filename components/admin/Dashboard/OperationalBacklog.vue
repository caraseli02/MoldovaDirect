<template>
  <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">Operational Backlog</h3>
      <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {{ totalOutstanding }} open
      </span>
    </div>

    <div v-if="loading && !items.length" class="mt-4 space-y-4">
      <div
        v-for="index in 4"
        :key="index"
        class="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
      >
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-gray-200" />
          <div class="space-y-2">
            <div class="h-3 w-32 rounded-full bg-gray-200" />
            <div class="h-3 w-20 rounded-full bg-gray-100" />
          </div>
        </div>
        <div class="h-4 w-10 rounded-full bg-gray-200" />
      </div>
    </div>

    <div v-else-if="items.length" class="mt-4 space-y-3">
      <component
        v-for="item in items"
        :key="item.key"
        :is="item.to ? 'NuxtLink' : 'div'"
        :to="item.to"
        class="group block rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-blue-300 hover:bg-blue-50"
      >
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-start gap-3">
            <div :class="['mt-1 flex h-10 w-10 items-center justify-center rounded-full', toneClasses[item.tone || 'gray'].icon]">
              <commonIcon :name="item.icon" class="h-5 w-5" />
            </div>
            <div class="space-y-1">
              <p class="text-sm font-semibold text-gray-900">{{ item.label }}</p>
              <p class="text-xs text-gray-500">{{ item.description }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-2xl font-semibold text-gray-900">{{ formatNumber(item.count) }}</p>
            <p v-if="item.cta" class="text-xs text-blue-600 group-hover:text-blue-700">{{ item.cta }}</p>
          </div>
        </div>
      </component>
    </div>

    <div v-else class="mt-6 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
      <commonIcon name="heroicons:cursor-arrow-ripple" class="mx-auto h-10 w-10 text-gray-400" />
      <p class="mt-2 text-sm font-medium text-gray-700">All clear — no pending workstreams</p>
      <p class="text-xs text-gray-500">Keep an eye on incoming orders, catalog changes, and customer activity.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
interface BacklogItem {
  key: string
  label: string
  description: string
  count: number
  icon: string
  to?: string
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray'
  cta?: string
}

const props = withDefaults(defineProps<{ items: BacklogItem[]; loading?: boolean }>(), {
  items: () => [],
  loading: false
})

const toneClasses: Record<NonNullable<BacklogItem['tone']>, { icon: string }> = {
  blue: { icon: 'bg-blue-100 text-blue-600' },
  green: { icon: 'bg-green-100 text-green-600' },
  amber: { icon: 'bg-amber-100 text-amber-600' },
  red: { icon: 'bg-red-100 text-red-600' },
  purple: { icon: 'bg-purple-100 text-purple-600' },
  gray: { icon: 'bg-gray-100 text-gray-500' }
}

const outstandingCount = computed(() => {
  return props.items.reduce((sum, item) => sum + (item.count || 0), 0)
})

const totalOutstanding = computed(() => {
  return formatNumber(outstandingCount.value)
})

function formatNumber(value?: number | null) {
  if (!value && value !== 0) {
    return '0'
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(value)
}
</script>
