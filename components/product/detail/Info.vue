<template>
  <UiCard>
    <UiCardHeader>
      <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <UiCardTitle
            as="h1"
            class="text-3xl"
          >
            {{ productName }}
          </UiCardTitle>
          <UiCardDescription
            v-if="shortDescription"
            class="mt-3 text-lg"
          >
            {{ shortDescription }}
          </UiCardDescription>
        </div>
        <div class="flex flex-col items-start gap-2 text-right">
          <div class="flex items-center gap-3">
            <span class="text-3xl font-bold text-gray-900 dark:text-white">€{{ formatPrice(price) }}</span>
            <span
              v-if="comparePrice && Number(comparePrice) > Number(price)"
              class="text-lg text-gray-600 line-through"
            >
              €{{ formatPrice(comparePrice) }}
            </span>
          </div>
          <span
            v-if="comparePrice && Number(comparePrice) > Number(price)"
            class="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-200"
          >
            {{ Math.round((1 - Number(price) / Number(comparePrice)) * 100) }}% {{ $t('products.off') }}
          </span>
        </div>
      </div>
    </UiCardHeader>

    <UiCardContent class="grid gap-6 lg:grid-cols-2">
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ storyTitle }}
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ producer }}
        </p>
        <div v-if="tastingNotes?.length">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            {{ $t('products.story.tastingNotes') }}
          </h3>
          <ul class="mt-2 flex flex-wrap gap-2">
            <li
              v-for="note in tastingNotes"
              :key="`note-${note}`"
              class="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
            >
              {{ note }}
            </li>
          </ul>
        </div>
        <div v-if="pairingIdeas?.length">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            {{ $t('products.story.pairings') }}
          </h3>
          <ul class="mt-2 list-inside list-disc text-sm text-gray-600 dark:text-gray-400">
            <li
              v-for="pairing in pairingIdeas"
              :key="`pairing-${pairing}`"
            >
              {{ pairing }}
            </li>
          </ul>
        </div>
      </div>
      <div class="space-y-6">
        <div class="space-y-2">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            {{ $t('products.story.awards') }}
          </h3>
          <ul class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li
              v-for="award in awards"
              :key="`award-${award}`"
            >
              • {{ award }}
            </li>
            <li v-if="!awards?.length">
              {{ $t('products.story.noAwards') }}
            </li>
          </ul>
        </div>
        <div class="space-y-2">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            {{ $t('products.story.origin') }}
          </h3>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            {{ originStory }}
          </p>
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
import { useProductUtils } from '~/composables/useProductUtils'

defineProps<{
  productName: string
  shortDescription?: string
  price: number | string
  comparePrice?: number | string
  storyTitle?: string
  producer?: string
  tastingNotes?: string[]
  pairingIdeas?: string[]
  awards?: string[]
  originStory?: string
}>()

const { formatPrice } = useProductUtils()
</script>
