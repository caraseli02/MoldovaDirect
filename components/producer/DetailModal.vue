<template>
  <UiDialog v-model:open="isOpen">
    <UiDialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <UiDialogHeader>
        <UiDialogTitle class="sr-only">
          {{ producer?.name }}
        </UiDialogTitle>
      </UiDialogHeader>

      <div
        v-if="producer"
        class="space-y-6"
      >
        <!-- Hero Section with Portrait -->
        <div class="relative -mx-6 -mt-6">
          <div class="relative h-80 overflow-hidden bg-slate-100">
            <NuxtImg
              :src="producer.heroImage || producer.portraitImage"
              :alt="producer.name"
              class="h-full w-full object-cover"
              sizes="90vw"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

            <!-- Producer Info Overlay -->
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div class="flex items-end justify-between">
                <div>
                  <h2 class="text-3xl font-bold">
                    {{ producer.name }}
                  </h2>
                  <p class="mt-1 text-lg font-medium text-white/90">
                    {{ getLocalizedText(producer.specialty) }}
                  </p>
                  <div class="mt-2 flex flex-wrap items-center gap-4 text-sm">
                    <span class="inline-flex items-center gap-1">
                      <commonIcon
                        name="lucide:map-pin"
                        class="h-4 w-4"
                      />
                      {{ regionName }}
                    </span>
                    <span
                      v-if="producer.establishedYear"
                      class="inline-flex items-center gap-1"
                    >
                      <commonIcon
                        name="lucide:calendar"
                        class="h-4 w-4"
                      />
                      {{ t('wineStory.producers.establishedYear', { year: producer.establishedYear }) }}
                    </span>
                    <span
                      v-if="producer.generationsOfWinemaking"
                      class="inline-flex items-center gap-1"
                    >
                      <commonIcon
                        name="lucide:users"
                        class="h-4 w-4"
                      />
                      {{ t('wineStory.producers.generations', { count: producer.generationsOfWinemaking }) }}
                    </span>
                  </div>
                </div>

                <!-- Certifications -->
                <div
                  v-if="producer.certifications && producer.certifications.length > 0"
                  class="flex gap-2"
                >
                  <div
                    v-for="cert in producer.certifications"
                    :key="cert.name"
                    class="rounded-full bg-green-500 p-2 shadow-lg"
                    :title="cert.name"
                  >
                    <commonIcon
                      name="lucide:leaf"
                      class="h-5 w-5 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="space-y-6">
          <!-- Philosophy Quote (if available) -->
          <div
            v-if="producer.philosophy"
            class="rounded-lg bg-primary/5 p-6"
          >
            <commonIcon
              name="lucide:quote"
              class="h-8 w-8 text-primary"
            />
            <p class="mt-2 text-lg italic leading-relaxed text-slate-700">
              "{{ getLocalizedText(producer.philosophy) }}"
            </p>
          </div>

          <!-- Full Story -->
          <div>
            <h3 class="text-xl font-bold text-slate-900">
              {{ t('wineStory.producers.viewStory') }}
            </h3>
            <p class="mt-3 whitespace-pre-line text-base leading-relaxed text-slate-600">
              {{ getLocalizedText(producer.fullStory) }}
            </p>
          </div>

          <!-- Production Details Grid -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div
              v-if="producer.vineyardSize"
              class="rounded-lg border border-slate-200 p-4"
            >
              <div class="flex items-center gap-2 text-sm font-medium text-slate-500">
                <commonIcon
                  name="lucide:map"
                  class="h-4 w-4"
                />
                {{ t('wineStory.producers.vineyardSize') }}
              </div>
              <p class="mt-1 text-lg font-semibold text-slate-900">
                {{ producer.vineyardSize }}
              </p>
            </div>

            <div
              v-if="producer.annualProduction"
              class="rounded-lg border border-slate-200 p-4"
            >
              <div class="flex items-center gap-2 text-sm font-medium text-slate-500">
                <commonIcon
                  name="lucide:wine"
                  class="h-4 w-4"
                />
                {{ t('wineStory.producers.annualProduction') }}
              </div>
              <p class="mt-1 text-lg font-semibold text-slate-900">
                {{ producer.annualProduction }}
              </p>
            </div>

            <div
              v-if="producer.primaryGrapes && producer.primaryGrapes.length > 0"
              class="rounded-lg border border-slate-200 p-4 sm:col-span-2"
            >
              <div class="flex items-center gap-2 text-sm font-medium text-slate-500">
                <commonIcon
                  name="lucide:grape"
                  class="h-4 w-4"
                />
                {{ t('wineStory.regions.primaryGrapes') }}
              </div>
              <p class="mt-1 text-base text-slate-900">
                {{ producer.primaryGrapes.join(', ') }}
              </p>
            </div>
          </div>

          <!-- Awards -->
          <div v-if="producer.awards && producer.awards.length > 0">
            <h3 class="text-lg font-bold text-slate-900">
              {{ t('wineStory.producers.awards') }}
            </h3>
            <div class="mt-3 space-y-2">
              <div
                v-for="(award, index) in producer.awards"
                :key="index"
                class="flex items-start gap-3 rounded-lg border border-slate-200 p-3"
              >
                <div class="rounded-full bg-amber-100 p-2">
                  <commonIcon
                    name="lucide:award"
                    class="h-5 w-5 text-amber-600"
                  />
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-slate-900">
                    {{ getLocalizedText(award.name) }}
                  </p>
                  <p class="text-sm text-slate-600">
                    {{ award.organization }} • {{ award.year }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Certifications -->
          <div v-if="producer.certifications && producer.certifications.length > 0">
            <h3 class="text-lg font-bold text-slate-900">
              {{ t('wineStory.producers.certifications') }}
            </h3>
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="(cert, index) in producer.certifications"
                :key="index"
                class="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800"
              >
                <commonIcon
                  name="lucide:shield-check"
                  class="h-4 w-4"
                />
                {{ cert.name }}
                <span
                  v-if="cert.year"
                  class="text-xs text-green-600"
                >{{ cert.year }}</span>
              </span>
            </div>
          </div>

          <!-- Gallery (if available) -->
          <div v-if="producer.gallery && producer.gallery.length > 0">
            <h3 class="text-lg font-bold text-slate-900">
              Gallery
            </h3>
            <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div
                v-for="(image, index) in producer.gallery"
                :key="index"
                class="aspect-square overflow-hidden rounded-lg bg-slate-100"
              >
                <NuxtImg
                  :src="image"
                  :alt="`${producer.name} gallery ${index + 1}`"
                  class="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                  sizes="33vw"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <!-- Website Link -->
          <div
            v-if="producer.website"
            class="pt-4"
          >
            <a
              :href="producer.website"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <commonIcon
                name="lucide:external-link"
                class="h-5 w-5"
              />
              {{ t('wineStory.producers.contact') }}
            </a>
          </div>
        </div>
      </div>

      <!-- Close Button -->
      <UiDialogClose
        class="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white backdrop-blur transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
        :aria-label="t('wineStory.producers.closeModal')"
      >
        <commonIcon
          name="lucide:x"
          class="h-5 w-5"
        />
      </UiDialogClose>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import type { Producer } from '~/types'

interface Props {
  producer: Producer | null
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { t, locale } = useI18n()

// Two-way binding for dialog open state
const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

// Get localized text from Translations object
const getLocalizedText = (translations: Record<string, any>): string => {
  if (!translations) return ''
  return translations[locale.value] || translations.en || Object.values(translations)[0] || ''
}

// Get region name from translation keys
const regionName = computed(() => {
  if (!props.producer) return ''
  const regionKey = props.producer.region
  if (regionKey === 'codru') return t('wineStory.regions.codru.name')
  if (regionKey === 'stefan-voda') return t('wineStory.regions.stefanVoda.name')
  if (regionKey === 'valul-lui-traian') return t('wineStory.regions.valulLuiTraian.name')
  return regionKey
})
</script>
