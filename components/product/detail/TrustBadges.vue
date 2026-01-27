<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle class="text-lg">
        {{ $t('products.trust.title') }}
      </UiCardTitle>
    </UiCardHeader>
    <UiCardContent>
      <ul class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
        <li
          v-for="promise in trustPromises"
          :key="promise"
          class="flex items-start gap-3"
        >
          <span class="mt-1 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
          <span>{{ promise }}</span>
        </li>
      </ul>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
defineProps<{
  trustPromises: string[]
}>()
</script>
