<template>
  <section class="border-y border-brand-light/15 bg-brand-light/5 py-12 backdrop-blur-sm dark:border-brand-dark/30 dark:bg-brand-dark/20">
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
        class="mb-10 text-center"
      >
        <p class="text-sm font-medium uppercase tracking-[0.15em] text-brand-dark/70 dark:text-brand-light/70">
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
            <!-- Logo/Name - Interactive button if quote exists -->
            <button
              v-if="mention.quote"
              type="button"
              :aria-label="`${mention.name}: ${mention.quote}`"
              :title="mention.quote"
              class="flex h-16 w-full items-center justify-center rounded-lg px-6 transition-all duration-300 hover:bg-brand-light/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 dark:hover:bg-brand-dark/30"
            >
              <!-- If image URL provided, show image with aspect ratio -->
              <NuxtImg
                v-if="mention.logo"
                :src="mention.logo"
                :alt="mention.name"
                width="120"
                height="40"
                :style="{ aspectRatio: '3 / 1' }"
                class="h-10 w-auto object-contain opacity-60 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0 dark:opacity-50 dark:brightness-200"
                loading="lazy"
              />

              <!-- If no image, show text with luxury styling -->
              <span
                v-else
                class="text-lg font-semibold tracking-tight text-brand-dark/50 transition-colors duration-300 group-hover:text-brand-dark group-focus-visible:text-brand-dark dark:text-brand-light/50 dark:group-hover:text-brand-light dark:group-focus-visible:text-brand-light"
              >
                {{ mention.name }}
              </span>
            </button>

            <!-- Static display if no quote -->
            <div
              v-else
              class="flex h-16 items-center justify-center rounded-lg px-6"
            >
              <!-- If image URL provided, show image with aspect ratio -->
              <NuxtImg
                v-if="mention.logo"
                :src="mention.logo"
                :alt="mention.name"
                width="120"
                height="40"
                :style="{ aspectRatio: '3 / 1' }"
                class="h-10 w-auto object-contain opacity-60 grayscale dark:opacity-50 dark:brightness-200"
                loading="lazy"
              />

              <!-- If no image, show text with luxury styling -->
              <span
                v-else
                class="text-lg font-semibold tracking-tight text-brand-dark/50 dark:text-brand-light/50"
              >
                {{ mention.name }}
              </span>
            </div>

            <!-- Luxury quote tooltip with refined styling -->
            <div
              v-if="mention.quote"
              class="pointer-events-none absolute -bottom-2 left-1/2 z-10 w-64 -translate-x-1/2 translate-y-full rounded-lg border border-brand-light/10 bg-brand-dark p-4 text-sm text-brand-light opacity-0 shadow-elevated-lg backdrop-blur-md transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 dark:border-brand-dark/20 dark:bg-brand-light dark:text-brand-dark"
              role="tooltip"
            >
              <p class="italic leading-relaxed">
                "{{ mention.quote }}"
              </p>
              <div class="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-brand-light/10 bg-brand-dark dark:border-brand-dark/20 dark:bg-brand-light"></div>
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
        <div class="flex items-center gap-2 text-sm font-medium text-brand-dark/70 dark:text-brand-light/70">
          <commonIcon
            name="lucide:sparkles"
            class="h-5 w-5"
          />
          <span>{{ t('home.mediaMentions.featuredIn') }}</span>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <button
            v-for="platform in socialPlatforms"
            :key="platform.name"
            type="button"
            :aria-label="`Follow us on ${platform.name}`"
            class="flex min-h-[44px] items-center gap-2 rounded-full border border-brand-light/20 bg-brand-light/10 px-6 py-3 text-sm font-medium tracking-wide text-brand-dark backdrop-blur-sm transition-all hover:border-brand-light/30 hover:bg-brand-light/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 dark:border-brand-dark/20 dark:bg-brand-dark/10 dark:text-brand-light dark:hover:border-brand-dark/30 dark:hover:bg-brand-dark/20"
          >
            <commonIcon
              :name="platform.icon"
              class="h-4 w-4"
            />
            <span>{{ platform.name }}</span>
          </button>
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
        quote: 'Bringing authentic Moldovan flavors to Europe',
      },
      {
        name: 'El País',
        quote: 'The best way to discover Moldovan wine',
      },
      {
        name: 'Wine Spectator',
        quote: 'Outstanding selection of Eastern European wines',
      },
      {
        name: 'The Guardian',
        quote: 'A hidden gem for food enthusiasts',
      },
      {
        name: 'La Vanguardia',
        quote: 'Exceptional quality and authenticity',
      },
      {
        name: 'Decanter',
        quote: 'Moldova\'s finest exports, delivered',
      },
    ],
    socialPlatforms: () => [
      { name: 'Instagram', icon: 'lucide:instagram' },
      { name: 'Facebook', icon: 'lucide:facebook' },
      { name: 'LinkedIn', icon: 'lucide:linkedin' },
    ],
  },
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
