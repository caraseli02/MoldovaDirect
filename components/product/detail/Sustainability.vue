<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle>{{ $t('products.sustainability.title') }}</UiCardTitle>
      <UiCardDescription>{{ $t('products.sustainability.subtitle') }}</UiCardDescription>
    </UiCardHeader>
    <UiCardContent>
      <div class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="badge in sustainabilityBadges"
          :key="badge"
          class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-200"
        >
          <span class="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
          {{ $t(`products.sustainability.badges.${badge}`) }}
        </span>
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
defineProps<{
  sustainabilityBadges: string[]
}>()
</script>
