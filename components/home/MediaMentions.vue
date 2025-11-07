<template>
  <section class="border-y border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-950">
    <div class="container">
      <!-- Header -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible-once="{
          opacity: 1,
          y: 0,
          transition: { duration: 500 },
        }"
        class="mb-8 text-center"
      >
        <p class="text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
          {{ t('home.mediaMentions.title') }}
        </p>
      </div>

      <!-- Media Logos Grid -->
      <div
        v-motion
        :initial="{ opacity: 0 }"
        :visible-once="{
          opacity: 1,
          transition: { duration: 600, delay: 100 },
        }"
        class="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6"
      >
        <div
          v-for="(mention, index) in mentions"
          :key="mention.name"
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :visible-once="{
            opacity: 1,
            scale: 1,
            transition: { duration: 400, delay: 150 + index * 50 },
          }"
          class="flex items-center justify-center"
        >
          <div class="group relative">
            <!-- Logo/Name -->
            <div
              class="flex h-16 items-center justify-center rounded-lg px-6 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <!-- If image URL provided, show image -->
              <NuxtImg
                v-if="mention.logo"
                :src="mention.logo"
                :alt="mention.name"
                width="120"
                height="40"
                class="h-10 w-auto object-contain opacity-60 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 dark:opacity-50 dark:brightness-200"
                loading="lazy"
              />

              <!-- If no image, show text -->
              <span
                v-else
                class="text-lg font-bold text-gray-400 transition-colors duration-300 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400"
              >
                {{ mention.name }}
              </span>
            </div>

            <!-- Quote on Hover (optional) -->
            <div
              v-if="mention.quote"
              class="pointer-events-none absolute -bottom-2 left-1/2 z-10 w-64 -translate-x-1/2 translate-y-full rounded-lg bg-gray-900 p-4 text-sm text-white opacity-0 shadow-xl transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100 dark:bg-white dark:text-gray-900"
            >
              <p class="italic">"{{ mention.quote }}"</p>
              <div class="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-gray-900 dark:bg-white"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Optional: "As Seen On" with icons -->
      <div
        v-if="showIcons"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible-once="{
          opacity: 1,
          y: 0,
          transition: { duration: 500, delay: 400 },
        }"
        class="mt-12 flex flex-wrap items-center justify-center gap-6"
      >
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <commonIcon name="lucide:sparkles" class="h-5 w-5" />
          <span>{{ t('home.mediaMentions.featuredIn') }}</span>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <div
            v-for="platform in socialPlatforms"
            :key="platform.name"
            class="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <commonIcon :name="platform.icon" class="h-4 w-4" />
            <span>{{ platform.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface MediaMention {
  name: string
  logo?: string // Optional logo image URL
  quote?: string // Optional quote to show on hover
  url?: string // Optional link to article
}

interface SocialPlatform {
  name: string
  icon: string
}

withDefaults(
  defineProps<{
    mentions?: MediaMention[]
    showIcons?: boolean
    socialPlatforms?: SocialPlatform[]
  }>(),
  {
    showIcons: false,
    mentions: () => [
      {
        name: 'Forbes',
        quote: 'Bringing authentic Moldovan flavors to Europe'
      },
      {
        name: 'El País',
        quote: 'The best way to discover Moldovan wine'
      },
      {
        name: 'Wine Spectator',
        quote: 'Outstanding selection of Eastern European wines'
      },
      {
        name: 'The Guardian',
        quote: 'A hidden gem for food enthusiasts'
      },
      {
        name: 'La Vanguardia',
        quote: 'Exceptional quality and authenticity'
      },
      {
        name: 'Decanter',
        quote: 'Moldova\'s finest exports, delivered'
      }
    ],
    socialPlatforms: () => [
      { name: 'Instagram', icon: 'lucide:instagram' },
      { name: 'Facebook', icon: 'lucide:facebook' },
      { name: 'LinkedIn', icon: 'lucide:linkedin' }
    ]
  }
)

const { t } = useI18n()
</script>

<style scoped>
/* Ensure smooth transitions */
.group:hover .absolute {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate(-50%, calc(100% + 10px));
  }
  to {
    opacity: 1;
    transform: translate(-50%, 100%);
  }
}
</style>
