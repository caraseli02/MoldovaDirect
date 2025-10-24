<template>
  <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <header class="flex items-center justify-between">
      <h3 class="text-base font-medium text-gray-900">Contextual Insights</h3>
      <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {{ totalInsights }} insights
      </span>
    </header>

    <div v-if="!insights.length" class="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50 text-yellow-500">
        <commonIcon name="lucide:lightbulb" class="h-6 w-6" />
      </div>
      <p class="mt-4 text-base font-medium text-gray-900">Sin actividad reciente</p>
      <p class="text-sm text-gray-400">
        No recent user activity. Check back later or send a campaign.
      </p>
    </div>

    <ul v-else class="mt-6 space-y-4">
      <li
        v-for="insight in insights"
        :key="insight.key"
        class="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 transition-shadow duration-300 hover:shadow-lg"
      >
        <div class="flex items-start gap-4">
          <div :class="['flex h-11 w-11 items-center justify-center rounded-xl text-white', toneClasses[insight.tone || 'neutral']]">
            <commonIcon :name="insight.icon" class="h-5 w-5" />
          </div>
          <div class="flex-1 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-medium text-gray-900">{{ insight.title }}</p>
              <span v-if="insight.meta" class="text-xs font-semibold uppercase tracking-wide text-gray-400">{{ insight.meta }}</span>
            </div>
            <p class="text-sm text-gray-400">{{ insight.description }}</p>
            <NuxtLink
              v-if="insight.to && insight.action"
              :to="insight.to"
              class="inline-flex items-center gap-2 text-sm font-medium text-blue-500 transition-colors hover:text-blue-600"
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
  tone?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  meta?: string
  to?: string
  action?: string
}

const props = withDefaults(defineProps<{ insights: InsightItem[] }>(), {
  insights: () => []
})

const toneClasses: Record<NonNullable<InsightItem['tone']>, string> = {
  success: 'bg-green-500',
  warning: 'bg-yellow-400 text-gray-900',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-gray-400'
}

const totalInsights = computed(() => props.insights.length)
</script>
