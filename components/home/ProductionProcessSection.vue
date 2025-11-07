<template>
  <section class="relative overflow-hidden bg-white py-16 md:py-24">
    <div class="container">
      <!-- Section Header -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{
          opacity: 1,
          y: 0,
          transition: { duration: 600 },
        }"
        class="mx-auto max-w-3xl text-center"
      >
        <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
          {{ t('wineStory.production.title') }}
        </h2>
        <p class="mt-4 text-lg text-slate-600">
          {{ t('wineStory.production.subtitle') }}
        </p>
      </div>

      <!-- Timeline -->
      <div class="relative mt-16">
        <!-- Timeline Line -->
        <div
          class="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary-200 via-primary-400 to-primary-600 md:block hidden"
          aria-hidden="true"
        ></div>

        <!-- Mobile Timeline Line -->
        <div
          class="absolute left-8 top-0 h-full w-0.5 bg-gradient-to-b from-primary-200 via-primary-400 to-primary-600 md:hidden"
          aria-hidden="true"
        ></div>

        <!-- Steps -->
        <div class="space-y-12">
          <!-- Step 1: Harvest -->
          <div
            v-motion
            :initial="{ opacity: 0, x: -40 }"
            :visible="{
              opacity: 1,
              x: 0,
              transition: { duration: 500, delay: 100 },
            }"
            class="relative grid md:grid-cols-2 gap-8 items-center"
          >
            <!-- Desktop: Left Content -->
            <div class="md:text-right text-left md:pr-12 md:pl-0 pl-16">
              <div class="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1 text-sm font-semibold text-primary-700">
                <commonIcon name="lucide:calendar" class="h-4 w-4" />
                {{ t('wineStory.production.steps.harvest.timing') }}
              </div>
              <h3 class="mt-4 text-2xl font-bold text-slate-900">
                {{ t('wineStory.production.steps.harvest.title') }}
              </h3>
              <p class="mt-2 leading-relaxed text-slate-600">
                {{ t('wineStory.production.steps.harvest.description') }}
              </p>
            </div>

            <!-- Center Icon -->
            <div class="absolute left-8 md:left-1/2 top-0 -translate-x-1/2 md:-translate-x-1/2">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 shadow-lg ring-4 ring-white">
                <commonIcon name="lucide:grape" class="h-8 w-8 text-white" />
              </div>
            </div>

            <!-- Desktop: Right Empty Space -->
            <div class="hidden md:block"></div>
          </div>

          <!-- Step 2: Crushing & Fermentation -->
          <div
            v-motion
            :initial="{ opacity: 0, x: 40 }"
            :visible="{
              opacity: 1,
              x: 0,
              transition: { duration: 500, delay: 200 },
            }"
            class="relative grid md:grid-cols-2 gap-8 items-center"
          >
            <!-- Desktop: Left Empty Space -->
            <div class="hidden md:block"></div>

            <!-- Center Icon -->
            <div class="absolute left-8 md:left-1/2 top-0 -translate-x-1/2 md:-translate-x-1/2">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 shadow-lg ring-4 ring-white">
                <commonIcon name="lucide:droplet" class="h-8 w-8 text-white" />
              </div>
            </div>

            <!-- Desktop: Right Content / Mobile: Left Content with padding -->
            <div class="text-left md:pl-12 pl-16">
              <div class="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1 text-sm font-semibold text-primary-700">
                <commonIcon name="lucide:calendar" class="h-4 w-4" />
                {{ t('wineStory.production.steps.crushing.timing') }}
              </div>
              <h3 class="mt-4 text-2xl font-bold text-slate-900">
                {{ t('wineStory.production.steps.crushing.title') }}
              </h3>
              <p class="mt-2 leading-relaxed text-slate-600">
                {{ t('wineStory.production.steps.crushing.description') }}
              </p>
            </div>
          </div>

          <!-- Step 3: Aging -->
          <div
            v-motion
            :initial="{ opacity: 0, x: -40 }"
            :visible="{
              opacity: 1,
              x: 0,
              transition: { duration: 500, delay: 300 },
            }"
            class="relative grid md:grid-cols-2 gap-8 items-center"
          >
            <!-- Desktop: Left Content -->
            <div class="md:text-right text-left md:pr-12 md:pl-0 pl-16">
              <div class="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1 text-sm font-semibold text-primary-700">
                <commonIcon name="lucide:calendar" class="h-4 w-4" />
                {{ t('wineStory.production.steps.aging.timing') }}
              </div>
              <h3 class="mt-4 text-2xl font-bold text-slate-900">
                {{ t('wineStory.production.steps.aging.title') }}
              </h3>
              <p class="mt-2 leading-relaxed text-slate-600">
                {{ t('wineStory.production.steps.aging.description') }}
              </p>
            </div>

            <!-- Center Icon -->
            <div class="absolute left-8 md:left-1/2 top-0 -translate-x-1/2 md:-translate-x-1/2">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 shadow-lg ring-4 ring-white">
                <commonIcon name="lucide:clock" class="h-8 w-8 text-white" />
              </div>
            </div>

            <!-- Desktop: Right Empty Space -->
            <div class="hidden md:block"></div>
          </div>

          <!-- Step 4: Bottling -->
          <div
            v-motion
            :initial="{ opacity: 0, x: 40 }"
            :visible="{
              opacity: 1,
              x: 0,
              transition: { duration: 500, delay: 400 },
            }"
            class="relative grid md:grid-cols-2 gap-8 items-center"
          >
            <!-- Desktop: Left Empty Space -->
            <div class="hidden md:block"></div>

            <!-- Center Icon -->
            <div class="absolute left-8 md:left-1/2 top-0 -translate-x-1/2 md:-translate-x-1/2">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 shadow-lg ring-4 ring-white">
                <commonIcon name="lucide:wine" class="h-8 w-8 text-white" />
              </div>
            </div>

            <!-- Desktop: Right Content / Mobile: Left Content with padding -->
            <div class="text-left md:pl-12 pl-16">
              <div class="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1 text-sm font-semibold text-primary-700">
                <commonIcon name="lucide:calendar" class="h-4 w-4" />
                {{ t('wineStory.production.steps.bottling.timing') }}
              </div>
              <h3 class="mt-4 text-2xl font-bold text-slate-900">
                {{ t('wineStory.production.steps.bottling.title') }}
              </h3>
              <p class="mt-2 leading-relaxed text-slate-600">
                {{ t('wineStory.production.steps.bottling.description') }}
              </p>
            </div>
          </div>

          <!-- Step 5: Quality Selection -->
          <div
            v-motion
            :initial="{ opacity: 0, x: -40 }"
            :visible="{
              opacity: 1,
              x: 0,
              transition: { duration: 500, delay: 500 },
            }"
            class="relative grid md:grid-cols-2 gap-8 items-center"
          >
            <!-- Desktop: Left Content -->
            <div class="md:text-right text-left md:pr-12 md:pl-0 pl-16">
              <div class="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1 text-sm font-semibold text-primary-700">
                <commonIcon name="lucide:calendar" class="h-4 w-4" />
                {{ t('wineStory.production.steps.selection.timing') }}
              </div>
              <h3 class="mt-4 text-2xl font-bold text-slate-900">
                {{ t('wineStory.production.steps.selection.title') }}
              </h3>
              <p class="mt-2 leading-relaxed text-slate-600">
                {{ t('wineStory.production.steps.selection.description') }}
              </p>
            </div>

            <!-- Center Icon -->
            <div class="absolute left-8 md:left-1/2 top-0 -translate-x-1/2 md:-translate-x-1/2">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 shadow-lg ring-4 ring-white">
                <commonIcon name="lucide:award" class="h-8 w-8 text-white" />
              </div>
            </div>

            <!-- Desktop: Right Empty Space -->
            <div class="hidden md:block"></div>
          </div>

          <!-- Step 6: Delivery -->
          <div
            v-motion
            :initial="{ opacity: 0, x: 40 }"
            :visible="{
              opacity: 1,
              x: 0,
              transition: { duration: 500, delay: 600 },
            }"
            class="relative grid md:grid-cols-2 gap-8 items-center"
          >
            <!-- Desktop: Left Empty Space -->
            <div class="hidden md:block"></div>

            <!-- Center Icon -->
            <div class="absolute left-8 md:left-1/2 top-0 -translate-x-1/2 md:-translate-x-1/2">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 shadow-lg ring-4 ring-white">
                <commonIcon name="lucide:truck" class="h-8 w-8 text-white" />
              </div>
            </div>

            <!-- Desktop: Right Content / Mobile: Left Content with padding -->
            <div class="text-left md:pl-12 pl-16">
              <div class="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1 text-sm font-semibold text-primary-700">
                <commonIcon name="lucide:calendar" class="h-4 w-4" />
                {{ t('wineStory.production.steps.delivery.timing') }}
              </div>
              <h3 class="mt-4 text-2xl font-bold text-slate-900">
                {{ t('wineStory.production.steps.delivery.title') }}
              </h3>
              <p class="mt-2 leading-relaxed text-slate-600">
                {{ t('wineStory.production.steps.delivery.description') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Traditions & Sustainability -->
      <div class="mt-20 grid gap-8 md:grid-cols-2">
        <!-- Traditions -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :visible="{
            opacity: 1,
            y: 0,
            transition: { duration: 600, delay: 700 },
          }"
          class="rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 p-8"
        >
          <div class="mb-4 inline-flex rounded-full bg-primary-600 p-3">
            <commonIcon name="lucide:scroll-text" class="h-6 w-6 text-white" />
          </div>
          <h3 class="text-2xl font-bold text-slate-900">
            {{ t('wineStory.production.traditions.title') }}
          </h3>
          <p class="mt-4 leading-relaxed text-slate-700">
            {{ t('wineStory.production.traditions.description') }}
          </p>
        </div>

        <!-- Sustainability -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :visible="{
            opacity: 1,
            y: 0,
            transition: { duration: 600, delay: 800 },
          }"
          class="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-8"
        >
          <div class="mb-4 inline-flex rounded-full bg-green-600 p-3">
            <commonIcon name="lucide:leaf" class="h-6 w-6 text-white" />
          </div>
          <h3 class="text-2xl font-bold text-slate-900">
            {{ t('wineStory.production.sustainability.title') }}
          </h3>
          <p class="mt-4 leading-relaxed text-slate-700">
            {{ t('wineStory.production.sustainability.description') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
