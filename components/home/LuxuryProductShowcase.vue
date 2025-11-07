<template>
  <section class="luxury-section bg-luxury-cream">
    <div class="luxury-container">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <p
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0 }"
          class="luxury-eyebrow"
        >
          {{ $t('luxury.showcase.eyebrow') || 'Curated Selection' }}
        </p>

        <h2
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: 100 } }"
          class="luxury-title"
        >
          {{ $t('luxury.showcase.title') || 'Signature Collections' }}
        </h2>

        <div class="luxury-divider mx-auto" />

        <p
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: 200 } }"
          class="luxury-description mx-auto"
        >
          {{ $t('luxury.showcase.description') || 'Discover our handpicked selection of premium wines, gourmet delicacies, and luxury gift hampers.' }}
        </p>
      </div>

      <!-- Product Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <div
          v-for="(product, index) in featuredProducts"
          :key="product.id"
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: index * 100 + 300, duration: 600 } }"
          class="bg-white rounded-sm overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group"
        >
          <!-- Product Image -->
          <div class="luxury-image-wrapper relative">
            <NuxtImg
              :src="product.image"
              :alt="product.name"
              class="w-full h-80 object-cover"
              loading="lazy"
            />

            <!-- Badge -->
            <div
              v-if="product.badge"
              class="absolute top-4 right-4 bg-luxury-gold text-luxury-dark-chocolate text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
            >
              {{ product.badge }}
            </div>

            <div class="luxury-image-overlay" />

            <!-- Quick View on Hover -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <NuxtLink
                :to="`/products/${product.slug}`"
                class="luxury-btn text-sm px-6 py-2"
              >
                {{ $t('luxury.showcase.quick_view') || 'View Details' }}
              </NuxtLink>
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-6">
            <div class="text-xs uppercase tracking-wider text-luxury-gold mb-2 font-semibold">
              {{ product.category }}
            </div>

            <h3 class="font-serif text-xl font-semibold text-luxury-wine-red mb-2">
              {{ product.name }}
            </h3>

            <p class="text-luxury-brown/70 text-sm mb-4 line-clamp-2">
              {{ product.description }}
            </p>

            <!-- Price -->
            <div class="flex items-baseline gap-2 mb-4">
              <span class="text-2xl font-serif font-bold text-luxury-wine-red">
                €{{ product.price }}
              </span>
              <span v-if="product.originalPrice" class="text-luxury-brown/50 line-through text-sm">
                €{{ product.originalPrice }}
              </span>
            </div>

            <!-- CTA -->
            <NuxtLink
              :to="`/products/${product.slug}`"
              class="w-full inline-block text-center py-3 border-2 border-luxury-wine-red text-luxury-wine-red font-semibold uppercase tracking-wider text-sm hover:bg-luxury-wine-red hover:text-white transition-all duration-300"
            >
              {{ $t('luxury.showcase.add_to_cart') || 'Add to Cart' }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="text-center">
        <NuxtLink to="/products" class="luxury-btn luxury-btn-gold">
          {{ $t('luxury.showcase.cta') || 'Explore Full Collection' }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const featuredProducts = [
  {
    id: 1,
    name: 'Premium Moldovan Wine Selection',
    slug: 'premium-wine-selection',
    category: 'Wine Collection',
    description: 'A curated selection of three award-winning Moldovan wines from the Codru region.',
    price: '89.90',
    originalPrice: null,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800',
  },
  {
    id: 2,
    name: 'Luxury Gourmet Gift Hamper',
    slug: 'luxury-gourmet-hamper',
    category: 'Gift Hampers',
    description: 'Artisan cheeses, honey, preserves, and wine - the perfect gift for any occasion.',
    price: '124.90',
    originalPrice: '149.90',
    badge: 'Limited Edition',
    image: 'https://images.unsplash.com/photo-1549888834-3ec93abae044?q=80&w=800',
  },
  {
    id: 3,
    name: 'Organic Wildflower Honey',
    slug: 'organic-wildflower-honey',
    category: 'Gourmet Foods',
    description: 'Raw, unfiltered honey from the wildflowers of Moldova. Pure and natural.',
    price: '18.90',
    originalPrice: null,
    badge: 'Organic',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784422?q=80&w=800',
  },
  {
    id: 4,
    name: 'Artisan Cheese Collection',
    slug: 'artisan-cheese-collection',
    category: 'Gourmet Foods',
    description: 'Three traditional Moldovan cheeses, aged to perfection by master cheesemakers.',
    price: '42.90',
    originalPrice: null,
    badge: null,
    image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?q=80&w=800',
  },
  {
    id: 5,
    name: 'Vintage Reserve 2015',
    slug: 'vintage-reserve-2015',
    category: 'Premium Wines',
    description: 'An exceptional vintage from the historic Cricova cellars. Limited availability.',
    price: '156.00',
    originalPrice: null,
    badge: 'Rare',
    image: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?q=80&w=800',
  },
  {
    id: 6,
    name: 'Corporate Gift Collection',
    slug: 'corporate-gift-collection',
    category: 'Gift Hampers',
    description: 'Impress clients and partners with this elegant selection of Moldovan specialties.',
    price: '199.90',
    originalPrice: null,
    badge: null,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800',
  },
]
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
