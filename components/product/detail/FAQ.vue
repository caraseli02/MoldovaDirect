<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle>{{ $t('products.faq.title') }}</UiCardTitle>
      <UiCardDescription>{{ $t('products.faq.subtitle') }}</UiCardDescription>
    </UiCardHeader>
    <UiCardContent>
      <div class="mt-4 space-y-4">
        <details
          v-for="item in faqItems"
          :key="item.id"
          class="group pb-4 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0"
          :open="item.defaultOpen"
        >
          <summary
            class="flex cursor-pointer items-center justify-between text-sm font-semibold text-gray-900 transition dark:text-white"
          >
            {{ item.question }}
            <span class="text-xl leading-none transition group-open:rotate-45">+</span>
          </summary>
          <p class="mt-3 text-sm text-gray-700 dark:text-gray-300">
            {{ item.answer }}
          </p>
        </details>
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
interface FaqItem {
  id: string
  question: string
  answer: string
  defaultOpen?: boolean
}

defineProps<{
  faqItems: FaqItem[]
}>()
</script>
