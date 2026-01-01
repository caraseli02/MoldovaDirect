<template>
  <section class="relative overflow-hidden bg-gold-50 py-16 md:py-24">
    <!-- Decorative Background -->
    <div class="absolute inset-0 overflow-hidden opacity-25">
      <div class="absolute -right-40 top-0 h-96 w-96 rounded-full bg-gold-500/30 blur-3xl"></div>
      <div class="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-primary/30 blur-3xl"></div>
    </div>

    <div class="container relative z-10">
      <div class="mx-auto max-w-4xl text-center">
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :visible="{
            opacity: 1,
            scale: 1,
            transition: { duration: 600 },
          }"
          class="mb-4 inline-flex items-center gap-2 rounded-full bg-gold-100 px-4 py-2 text-xs font-bold text-gold-700 shadow-lg backdrop-blur-sm ring-1 ring-gold-500/30 md:mb-6 md:px-6 md:py-3 md:text-sm"
        >
          <commonIcon
            name="lucide:wine"
            class="h-4 w-4 md:h-5 md:w-5"
          />
          Discover Our Heritage
        </div>
        <h2
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{
            opacity: 1,
            y: 0,
            transition: { duration: 800, delay: 100 },
          }"
          class="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl md:text-5xl lg:text-6xl"
        >
          The Story Behind Every Bottle
        </h2>
        <p
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{
            opacity: 1,
            y: 0,
            transition: { duration: 800, delay: 200 },
          }"
          class="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-700 md:mt-6 md:text-lg lg:text-xl"
        >
          Explore Moldova's 7,000-year winemaking tradition, meet our passionate producers, and discover the regions that make our wines unique
        </p>
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{
            opacity: 1,
            y: 0,
            transition: { duration: 800, delay: 300 },
          }"
        >
          <NuxtLink
            :to="localePath('/wine-story')"
            class="group mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white shadow-2xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 hover:bg-primary/90 md:mt-10 md:px-10 md:py-5"
          >
            Explore Wine Heritage
            <commonIcon
              name="lucide:arrow-right"
              class="h-5 w-5 transition-transform group-hover:translate-x-1"
            />
          </NuxtLink>
        </div>

        <!-- Decorative Wine Icons -->
        <div
          v-motion
          :initial="{ opacity: 0 }"
          :visible="{
            opacity: 1,
            transition: { duration: 1000, delay: 500 },
          }"
          class="mt-8 flex items-center justify-center gap-3 text-gold-600/40 md:mt-12 md:gap-4"
        >
          <commonIcon
            name="lucide:wine"
            class="h-4 w-4 md:h-5 md:w-5"
          />
          <div class="h-px w-12 bg-gold-500/30 md:w-16"></div>
          <commonIcon
            name="lucide:grape"
            class="h-4 w-4 md:h-5 md:w-5"
          />
          <div class="h-px w-12 bg-gold-500/30 md:w-16"></div>
          <commonIcon
            name="lucide:wine"
            class="h-4 w-4 md:h-5 md:w-5"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
</script>
