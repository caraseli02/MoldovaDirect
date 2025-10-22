<template>
  <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">Contextual Insights</h3>
      <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {{ totalInsights }} insights
      </span>
    </div>

    <div v-if="!insights.length" class="mt-6 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
      <commonIcon name="heroicons:light-bulb" class="mx-auto h-10 w-10 text-gray-400" />
      <p class="mt-2 text-sm font-medium text-gray-700">No insights available yet</p>
      <p class="text-xs text-gray-500">Run analytics or refresh the dashboard to surface new opportunities.</p>
    </div>

    <ul v-else class="mt-4 space-y-4">
      <li
        v-for="insight in insights"
        :key="insight.key"
        class="rounded-lg border border-gray-100 bg-gray-50/60 p-4"
      >
        <div class="flex items-start gap-3">
          <div :class="['mt-1 flex h-9 w-9 items-center justify-center rounded-full', toneClasses[insight.tone || 'gray']]">
            <commonIcon :name="insight.icon" class="h-5 w-5" />
          </div>
          <div class="flex-1 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-semibold text-gray-900">{{ insight.title }}</p>
              <span v-if="insight.meta" class="text-xs font-medium uppercase tracking-wide text-gray-400">{{ insight.meta }}</span>
            </div>
            <p class="text-sm text-gray-600">{{ insight.description }}</p>
            <NuxtLink
              v-if="insight.to && insight.action"
              :to="insight.to"
              class="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {{ insight.action }}
              <commonIcon name="heroicons:arrow-right" class="h-4 w-4" />
            </NuxtLink>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
interface InsightItem {
  key: string
  title: string
  description: string
  icon: string
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray'
  meta?: string
  to?: string
  action?: string
}

const props = withDefaults(defineProps<{ insights: InsightItem[] }>(), {
  insights: () => []
})

const toneClasses: Record<NonNullable<InsightItem['tone']>, string> = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  amber: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-600',
  gray: 'bg-gray-100 text-gray-500'
}

const totalInsights = computed(() => {
  return props.insights.length
})
</script>
