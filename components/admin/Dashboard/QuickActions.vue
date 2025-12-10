<template>
  <section class="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-medium text-gray-900">
        Execution Center
      </h3>
      <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Shortcuts</span>
    </div>

    <div class="grid grid-cols-1 gap-3">
      <NuxtLink
        to="/admin/products/new"
        class="group flex items-center justify-between rounded-2xl border border-gray-200 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-lg"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
            <commonIcon
              name="lucide:plus"
              class="h-5 w-5"
            />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">{{ $t('admin.dashboard.quickActions.addNewProduct') }}</p>
            <p class="text-sm text-gray-400">Launch a new catalog item with pricing & stock</p>
          </div>
        </div>
        <commonIcon
          name="lucide:arrow-up-right"
          class="h-4 w-4 text-blue-500 transition-opacity group-hover:opacity-100"
        />
      </NuxtLink>

      <NuxtLink
        to="/admin/orders"
        class="group flex items-center justify-between rounded-2xl border border-gray-200 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-green-500/40 hover:shadow-lg"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-500">
            <commonIcon
              name="lucide:shopping-cart"
              class="h-5 w-5"
            />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">{{ $t('admin.dashboard.quickActions.viewOrders') }}</p>
            <p class="text-sm text-gray-400">Review fulfillment status and payment confirmations</p>
          </div>
        </div>
        <commonIcon
          name="lucide:arrow-up-right"
          class="h-4 w-4 text-green-500 transition-opacity group-hover:opacity-100"
        />
      </NuxtLink>

      <NuxtLink
        to="/admin/users"
        class="group flex items-center justify-between rounded-2xl border border-gray-200 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-lg"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <commonIcon
              name="lucide:users"
              class="h-5 w-5"
            />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">{{ $t('admin.dashboard.quickActions.manageUsers') }}</p>
            <p class="text-sm text-gray-400">Audit roles, permissions, and customer records</p>
          </div>
        </div>
        <commonIcon
          name="lucide:arrow-up-right"
          class="h-4 w-4 text-slate-500 transition-opacity group-hover:opacity-100"
        />
      </NuxtLink>
    </div>

    <div class="space-y-4 text-sm text-gray-400">
      <div class="flex items-center justify-between">
        <span>Database</span>
        <span class="flex items-center gap-2 text-sm font-medium text-green-500">
          <span class="h-2 w-2 rounded-full bg-green-500"></span>
          Operational
        </span>
      </div>
      <div class="flex items-center justify-between">
        <span>API Layer</span>
        <span class="flex items-center gap-2 text-sm font-medium text-green-500">
          <span class="h-2 w-2 rounded-full bg-green-500"></span>
          All systems nominal
        </span>
      </div>
      <div class="flex items-center justify-between">
        <span>Last backup</span>
        <span>{{ lastBackupCopy }}</span>
      </div>
    </div>

    <div
      v-if="criticalAlerts.length"
      class="rounded-2xl border border-red-200 bg-red-50 p-4"
    >
      <div class="mb-3 flex items-center gap-2 text-sm font-semibold text-red-600">
        <commonIcon
          name="lucide:alert-triangle"
          class="h-4 w-4"
        />
        Critical alerts
      </div>
      <ul class="space-y-3 text-sm text-red-600">
        <li
          v-for="alert in criticalAlerts"
          :key="alert.id"
          class="rounded-xl bg-white/80 p-3"
        >
          <p class="font-medium text-red-700">
            {{ alert.title }}
          </p>
          <p class="mt-1 text-red-600">
            {{ alert.description }}
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
interface CriticalAlert {
  id: string
  title: string
  description: string
}

interface Props {
  criticalAlerts: CriticalAlert[]
  autoRefreshEnabled: boolean
}

const props = defineProps<Props>()

const lastBackupCopy = computed(() => {
  return props.autoRefreshEnabled ? '2 hours ago' : '4 hours ago'
})
</script>
