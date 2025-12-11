<template>
  <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <header class="flex items-center justify-between">
      <h3 class="text-base font-medium text-gray-900">
        Operational Backlog
      </h3>
      <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {{ totalOutstanding }} open items
      </span>
    </header>

    <div
      v-if="loading && !items.length"
      class="mt-6 space-y-4"
    >
      <div
        v-for="index in 4"
        :key="index"
        class="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-4"
      >
        <div class="flex items-center gap-3">
          <div class="h-12 w-12 rounded-xl bg-gray-200"></div>
          <div class="space-y-2">
            <div class="h-3 w-40 rounded-full bg-gray-200"></div>
            <div class="h-3 w-24 rounded-full bg-gray-100"></div>
          </div>
        </div>
        <div class="h-4 w-12 rounded-full bg-gray-200"></div>
      </div>
    </div>

    <div
      v-else-if="items.length"
      class="mt-6 space-y-4"
    >
      <component
        :is="item.to ? 'NuxtLink' : 'div'"
        v-for="item in items"
        :key="item.key"
        :to="item.to"
        class="group block rounded-2xl border border-gray-200 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-lg"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div :class="['flex h-11 w-11 items-center justify-center rounded-xl text-white', toneClasses[item.tone || 'neutral'].iconBg]">
              <commonIcon
                :name="item.icon"
                class="h-5 w-5"
              />
            </div>
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-900">
                {{ item.label }}
              </p>
              <p class="text-sm text-gray-400">
                {{ item.description }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-2xl font-semibold text-gray-900">
              {{ formatNumber(item.count) }}
            </p>
            <p
              v-if="item.cta"
              class="text-xs font-medium text-blue-500 group-hover:text-blue-600"
            >
              {{ item.cta }}
            </p>
          </div>
        </div>
      </component>
    </div>

    <div
      v-else
      class="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center"
    >
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
        <commonIcon
          name="lucide:sparkles"
          class="h-6 w-6"
        />
      </div>
      <p class="mt-4 text-base font-medium text-gray-900">
        All clear — no pending workstreams
      </p>
      <p class="text-sm text-gray-400">
        You haven’t made any sales yet. Promote your store to start seeing results.
      </p>
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
  tone?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  cta?: string
}

const props = withDefaults(defineProps<{ items?: BacklogItem[], loading?: boolean }>(), {
  items: () => [],
  loading: false,
})

const toneClasses: Record<NonNullable<BacklogItem['tone']>, { iconBg: string }> = {
  success: { iconBg: 'bg-green-500' },
  warning: { iconBg: 'bg-yellow-400 text-gray-900' },
  error: { iconBg: 'bg-red-500' },
  info: { iconBg: 'bg-blue-500' },
  neutral: { iconBg: 'bg-gray-400' },
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
    maximumFractionDigits: 0,
  }).format(value)
}
</script>
