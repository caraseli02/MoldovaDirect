<template>
  <section class="py-16 md:py-24">
    <div class="container mx-auto px-4 md:px-6">
      <!-- Section Header -->
      <div class="text-center max-w-2xl mx-auto mb-12 md:mb-16">
        <p class="text-xs uppercase tracking-[0.2em] font-medium text-[#722F37] mb-4">
          Stories & Insights
        </p>

        <h2 class="text-4xl md:text-5xl font-serif font-medium text-[#241405] mb-6">
          From Our Journal
        </h2>

        <p class="text-base text-[#241405]/70 leading-relaxed">
          Explore the rich heritage, traditions, and stories behind Moldova's finest products.
        </p>
      </div>

      <!-- Stories Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        <article
          v-for="story in stories"
          :key="story.id"
          class="group"
        >
          <!-- Story Image -->
          <NuxtLink :to="story.link" class="block relative overflow-hidden aspect-[4/3] mb-6 rounded-sm">
            <NuxtImg
              :src="story.image"
              :alt="story.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </NuxtLink>

          <!-- Story Content -->
          <div>
            <div class="flex items-center gap-3 mb-3">
              <span class="text-xs uppercase tracking-wider text-[#722F37] font-medium">
                {{ story.category }}
              </span>
              <span class="text-xs text-[#241405]/50">
                {{ story.date }}
              </span>
            </div>

            <NuxtLink :to="story.link">
              <h3 class="text-xl md:text-2xl font-serif font-medium text-[#241405] mb-3 group-hover:text-[#722F37] transition-colors duration-300 leading-snug">
                {{ story.title }}
              </h3>
            </NuxtLink>

            <p class="text-sm text-[#241405]/70 leading-relaxed mb-4">
              {{ story.excerpt }}
            </p>

            <NuxtLink
              :to="story.link"
              class="inline-flex items-center text-sm font-medium uppercase tracking-wider text-[#241405] group-hover:text-[#722F37] transition-colors duration-300"
            >
              <span>Read More</span>
              <svg class="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </article>
      </div>

      <!-- View All Link -->
      <div class="text-center mt-12 md:mt-16">
        <NuxtLink
          to="/blog"
          class="inline-block bg-[#241405] text-[#FCFAF2] px-8 py-3.5 text-sm font-medium uppercase tracking-wider hover:bg-[#722F37] transition-colors duration-300"
        >
          View All Stories
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const stories = [
  {
    id: 1,
    title: 'The Art of Moldovan Winemaking',
    excerpt: 'Discover the ancient traditions and modern techniques that make Moldovan wines truly exceptional.',
    category: 'Heritage',
    date: 'Nov 2, 2024',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800',
    link: '/blog/moldovan-winemaking'
  },
  {
    id: 2,
    title: 'From Hive to Table: Our Honey Story',
    excerpt: 'Follow the journey of our organic wildflower honey from the Moldovan highlands to your home.',
    category: 'Artisans',
    date: 'Oct 28, 2024',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784422?q=80&w=800',
    link: '/blog/honey-story'
  },
  {
    id: 3,
    title: 'The Perfect Gift: A Guide',
    excerpt: 'Expert tips on selecting and presenting luxury Moldovan gifts for any occasion.',
    category: 'Gifting',
    date: 'Oct 20, 2024',
    image: 'https://images.unsplash.com/photo-1549888834-3ec93abae044?q=80&w=800',
    link: '/blog/perfect-gift-guide'
  }
]
</script>

<style scoped>
/* Story card styles */
</style>
