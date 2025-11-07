<template>
  <div class="flex flex-wrap items-center justify-center gap-4 md:gap-6 lg:gap-8">
    <div
      v-for="badge in badges"
      :key="badge.id"
      class="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 md:px-5 md:py-3"
    >
      <commonIcon
        :name="badge.icon"
        class="h-5 w-5 text-primary-600 md:h-6 md:w-6"
      />
      <span class="whitespace-nowrap">{{ badge.label }}</span>
      <commonIcon
        v-if="badge.verified"
        name="lucide:badge-check"
        class="h-4 w-4 text-green-600"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface TrustBadge {
  id: string
  label: string
  icon: string
  verified?: boolean
}

defineProps<{
  badges: TrustBadge[]
}>()
</script>
