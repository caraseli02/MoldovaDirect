<template>
  <section class="bg-white py-20 dark:bg-gray-950 md:py-28">
    <div class="container">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="text-4xl font-bold md:text-5xl lg:text-6xl tracking-tight">{{ t('home.faqPreview.title') }}</h2>
        <p class="mt-4 text-sm md:text-base text-gray-600 dark:text-gray-400">{{ t('home.faqPreview.subtitle') }}</p>
      </div>
      <div class="mt-12 grid gap-6 md:grid-cols-2">
        <Accordion
          v-for="(item, index) in items"
          :key="item.question"
          type="single"
          collapsible
          class="rounded-3xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
        >
          <AccordionItem :value="`item-${index}`" class="border-none">
            <AccordionTrigger class="text-left text-lg font-semibold hover:no-underline py-0">
              {{ item.question }}
            </AccordionTrigger>
            <AccordionContent>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ item.answer }}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div class="mt-12 text-center">
        <NuxtLink
          :to="localePath('/faq')"
          class="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
        >
          {{ t('home.faqPreview.cta') }}
          <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

defineProps<{
  items: Array<{
    question: string
    answer: string
  }>
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>
