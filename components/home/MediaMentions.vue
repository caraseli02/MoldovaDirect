<template>
  <section class="relative border-b border-gray-200 bg-white py-4 md:py-6">
    <div class="container">
      <!-- Mobile: Stacked with scroll -->
      <div class="md:hidden">
        <p class="mb-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
          {{ t('home.mediaMentions.title') }}
        </p>
        <div class="relative overflow-hidden">
          <div
            ref="mobileScrollRef"
            class="flex gap-8 overflow-x-auto pb-2 scrollbar-hide"
            :style="{ animation: autoScroll ? 'scroll 30s linear infinite' : 'none' }"
          >
            <template v-for="(mention, index) in mentions" :key="`mobile-${index}`">
              <a
                v-if="mention.url"
                :href="mention.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-shrink-0 transition-opacity hover:opacity-60"
                :aria-label="`${mention.name} article`"
              >
                <NuxtImg
                  :src="mention.logo"
                  :alt="mention.name"
                  class="h-8 w-auto object-contain grayscale transition-all hover:grayscale-0"
                  loading="lazy"
                />
              </a>
              <div v-else class="flex-shrink-0">
                <NuxtImg
                  :src="mention.logo"
                  :alt="mention.name"
                  class="h-8 w-auto object-contain grayscale"
                  loading="lazy"
                />
              </div>
            </template>
            <!-- Duplicate for seamless loop -->
            <template v-for="(mention, index) in mentions" :key="`mobile-dup-${index}`">
              <a
                v-if="mention.url"
                :href="mention.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-shrink-0 transition-opacity hover:opacity-60"
                :aria-label="`${mention.name} article`"
              >
                <NuxtImg
                  :src="mention.logo"
                  :alt="mention.name"
                  class="h-8 w-auto object-contain grayscale transition-all hover:grayscale-0"
                  loading="lazy"
                />
              </a>
              <div v-else class="flex-shrink-0">
                <NuxtImg
                  :src="mention.logo"
                  :alt="mention.name"
                  class="h-8 w-auto object-contain grayscale"
                  loading="lazy"
                />
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Desktop: Horizontal layout -->
      <div class="hidden items-center justify-between gap-8 md:flex">
        <p class="text-sm font-medium uppercase tracking-wider text-gray-500">
          {{ t('home.mediaMentions.title') }}
        </p>
        <div class="flex flex-1 items-center justify-end gap-12">
          <a
            v-for="mention in mentions"
            :key="mention.name"
            v-show="mention.url"
            :href="mention.url"
            target="_blank"
            rel="noopener noreferrer"
            class="transition-opacity hover:opacity-60"
            :aria-label="`${mention.name} article`"
          >
            <NuxtImg
              :src="mention.logo"
              :alt="mention.name"
              class="h-10 w-auto object-contain grayscale transition-all hover:grayscale-0"
              loading="lazy"
            />
          </a>
          <div
            v-for="mention in mentions"
            :key="mention.name"
            v-show="!mention.url"
          >
            <NuxtImg
              :src="mention.logo"
              :alt="mention.name"
              class="h-10 w-auto object-contain grayscale"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface MediaMention {
  name: string
  logo: string
  url?: string
  quote?: string
}

const props = withDefaults(
  defineProps<{
    mentions: MediaMention[]
    autoScroll?: boolean
    sticky?: boolean
  }>(),
  {
    autoScroll: true,
    sticky: false
  }
)

const { t } = useI18n()
const mobileScrollRef = ref<HTMLElement | null>(null)

// Add scroll animation on mobile
onMounted(() => {
  if (props.autoScroll && mobileScrollRef.value) {
    const scrollWidth = mobileScrollRef.value.scrollWidth / 2
    let scrollPos = 0

    const scroll = () => {
      if (!mobileScrollRef.value) return
      scrollPos += 1
      if (scrollPos >= scrollWidth) {
        scrollPos = 0
      }
      mobileScrollRef.value.scrollLeft = scrollPos
      requestAnimationFrame(scroll)
    }

    scroll()
  }
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
